import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {P,rooms} from './plan.js';
import {insidePolygon} from './continuous-walk.js';
import {tileLayout} from './tile-surfaces.js';

export const casingWidth=.045,casingGap=.002;
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
const plus=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k];
const minus=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
function intersection(p,u,q,v){const d=cross(u,v);return Math.abs(d)<1e-7?null:plus(p,u,cross(minus(q,p),v)/d);}
function pointInBox(p,b){return p[0]>b.min.x-.002&&p[0]<b.max.x+.002&&p[1]>b.min.z-.002&&p[1]<b.max.z+.002;}

// Trim stays outside the existing opening, not on the clear door-leaf side.
export function makeDoorCasings(walls){
 const root=new T.Group();root.name='whole-home-door-casings';
 const paint=new T.MeshStandardMaterial({color:'#d3cec2',roughness:.66});
 const wet=new T.MeshStandardMaterial({color:'#bfc0b6',roughness:.53,metalness:.35});
 const gasket=new T.MeshStandardMaterial({color:'#aba79c',roughness:.95});
 const floor=tileLayout.surfaceY,baseJoint=.002,jambBottom=floor+baseJoint;
 const polys=rooms.filter(r=>!r.viewOnly).map(r=>r.poly.map(P)),schedule=[];
 const box=(parent,name,x,y,z,w,h,d,material)=>{
  const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,.001),material);o.name=name;o.position.set(x,y+h/2,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
 };
 for(const [index,w] of walls.entries())for(const opening of w.open||[]){
  if(opening.kind!=='door')continue;
  const a=P(w.a),b=P(w.b),len=Math.hypot(...minus(b,a)),u=minus(b,a).map(v=>v/len),n=[-u[1],u[0]],th=(w.t||20)/100;
  const center=plus(a,u,(opening.at+opening.w/2)/100),width=opening.w/100;
  const group=new T.Group();group.name='door-casing-'+opening.id;group.position.set(center[0],0,center[1]);group.rotation.y=-Math.atan2(u[1],u[0]);root.add(group);
  const sides=[];
  for(const side of [-1,1]){
   const point=plus(center,n,side*(th/2+.07));if(!polys.some(poly=>insidePolygon(...point,poly)))continue;
   const material=opening.id.startsWith('bath')?wet:paint,z=side*(th/2+.006);
   for(const end of [-1,1]){
    box(group,'casing-'+opening.id+'-'+side+'-jamb-'+end,end*(width/2+casingWidth/2),jambBottom,z,casingWidth,2.20-jambBottom,.012,material);
    const footSeal=box(group,'casing-'+opening.id+'-'+side+'-foot-seal-'+end,end*(width/2+casingWidth/2),floor,z,casingWidth,baseJoint,.012,gasket);
    footSeal.userData={detailRole:'trim-floor-seal',floorY:floor};
    // Fine paint/sealant joint at the outside edge, never a deep black groove.
    box(group,'casing-'+opening.id+'-'+side+'-seal-'+end,end*(width/2+casingWidth+.0008),floor,side*(th/2+.001),.0015,2.242-floor,.002,gasket);
   }
   box(group,'casing-'+opening.id+'-'+side+'-head',0,2.20,z,width+casingWidth*2,casingWidth,.012,material);
   sides.push(side);
  }
  group.userData={wallIndex:index,opening:opening.id,width:casingWidth,projection:.012,openingHeight:2.20,floorY:floor,baseJoint,clearOpeningUnchanged:true,material:opening.id.startsWith('bath')?'warm grey aluminum':'painted moisture-resistant casing',installationVerified:false};
  schedule.push({...group.userData,sides});
 }
 root.userData={schedule,status:'surface casing and fine perimeter seal; original jamb and door opening retained',constructionVerified:false};return root;
}

// Join only nearby perpendicular exposed runs. Cabinet/door cut ends stay capped.
export function finishSkirtingJoints(root,exclusions,dry){
 const parts=root.children.filter(o=>o.isMesh),ends=[],byPart=new Map();
 for(const part of parts){
  const info=part.userData,angle=-part.rotation.y,u=[Math.cos(angle),Math.sin(angle)],n=[-u[1],u[0]];
  const length=info.end-info.start-.0016,c=[part.position.x,part.position.z];
  const entry={part,u,n,ends:[]};byPart.set(part,entry);
  for(const sign of [-1,1]){
   const p=plus(c,u,sign*length/2),distance=sign<0?info.start:info.end;
   const cutEnd=info.cutEnds?.some(v=>Math.abs(v-distance)<.015)||false;
   const e={entry,sign,p,cutEnd,joined:false,back:plus(p,n,-.004),front:plus(p,n,.004)};entry.ends.push(e);ends.push(e);
  }
 }
 const candidates=[];
 for(let i=0;i<ends.length;i++)for(let j=i+1;j<ends.length;j++){
  const a=ends[i],b=ends[j];if(a.cutEnd||b.cutEnd||a.entry.part===b.entry.part||Math.abs(dot(a.entry.u,b.entry.u))>.001)continue;
  const gap=Math.hypot(...minus(a.p,b.p));if(gap>.19)continue;
  const p=intersection(a.p,a.entry.u,b.p,b.entry.u);if(!p)continue;
  const da=dot(minus(p,a.p),a.entry.u)*a.sign,db=dot(minus(p,b.p),b.entry.u)*b.sign;
  if(da<-.035||db<-.035||da>.15||db>.15)continue;
  if(!dry.some(r=>insidePolygon(...p,r.poly))||exclusions.some(e=>pointInBox(p,e.bounds)))continue;
  candidates.push({a,b,p,gap});
 }
 candidates.sort((a,b)=>a.gap-b.gap);const joints=[];
 for(const {a,b,p} of candidates){
  if(a.joined||b.joined)continue;const factor=-a.sign*b.sign,points=[];
  for(const side of [-1,1])points.push(intersection(plus(a.p,a.entry.n,side*.004),a.entry.u,plus(b.p,b.entry.n,side*factor*.004),b.entry.u));
  if(points.some(p=>!p||exclusions.some(e=>pointInBox(p,e.bounds))))continue;
  [a.back,a.front]=points;if(factor===1)[b.back,b.front]=points;else [b.front,b.back]=points;
  a.joined=b.joined=true;joints.push({a:a.entry.part.name,b:b.entry.part.name,point:p,type:'45-degree miter'});
 }
 const caps=[],capMaterial=new T.MeshStandardMaterial({color:'#b1ada3',roughness:.58,metalness:.3}),baseMaterial=new T.MeshStandardMaterial({color:'#aaa69c',roughness:.95});
 const {height,bottom,floorY,baseSealHeight}=root.userData;
 for(const {part,u,ends:[start,end]} of byPart.values()){
  const shape=new T.Shape([start.back,start.front,end.front,end.back].map(p=>new T.Vector2(p[0],-p[1])));
  const g=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1});g.rotateX(-Math.PI/2);g.translate(0,bottom,0);
  part.geometry.dispose();part.geometry=g;part.position.set(0,0,0);part.rotation.set(0,0,0);
  const sealGeometry=new T.ExtrudeGeometry(shape,{depth:baseSealHeight,bevelEnabled:false,steps:1});sealGeometry.rotateX(-Math.PI/2);sealGeometry.translate(0,floorY,0);
  const seal=new T.Mesh(sealGeometry,baseMaterial);seal.name=part.name+'-floor-seal';seal.userData={detailRole:'trim-floor-seal',floorY,target:part.name};seal.castShadow=true;seal.receiveShadow=true;root.add(seal);
  for(const e of [start,end])if(!e.joined){
   const cap=new T.Mesh(new RoundedBoxGeometry(.0016,.06,.008,2,.0007),capMaterial);
   cap.name=part.name+'-endcap-'+e.sign;cap.position.set(e.p[0],bottom+height/2,e.p[1]);cap.rotation.y=-Math.atan2(u[1],u[0]);cap.castShadow=true;cap.receiveShadow=true;root.add(cap);caps.push({name:cap.name,point:e.p,cutEnd:e.cutEnd});
  }
 }
 root.userData.joints=joints;root.userData.endcaps=caps;root.userData.cornerStatus='匹配的直角墙段做45°斜接；独立端头加同色封口，门套旁留2mm安装缝。现场墙面平直度/伸缩缝待复尺。';
}
