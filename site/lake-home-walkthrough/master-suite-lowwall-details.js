import {auditEntry} from './master-entry-storage.js?v=warm-unified-29';
import * as T from './vendor/three.module.js';
import {overlap,inside} from './master-suite-geometry.js?v=sleep-entry-09';
const rect=(r,fill,stroke='#8c9187',dash='')=>`<rect x="${r[0]*100}" y="${r[1]*100}" width="${(r[2]-r[0])*100}" height="${(r[3]-r[1])*100}" fill="${fill}" stroke="${stroke}" ${dash}/>`;
const label=(x,z,t,size=10)=>`<text x="${x*100}" y="${z*100}" text-anchor="middle" font-size="${size}" fill="#424b41">${t}</text>`;
export function chairRect(s,pull){const r=[...s.furniture.chair.r],dx=pull?s.design.vanity.chairTravel:0;return[r[0]+dx,r[1],r[2]+dx,r[3]];}
function subtract(a,b){if(!overlap(a,b))return[a];const x0=Math.max(a[0],b[0]),x1=Math.min(a[2],b[2]),z0=Math.max(a[1],b[1]),z1=Math.min(a[3],b[3]);return[[a[0],a[1],x0,a[3]],[x1,a[1],a[2],a[3]],[x0,a[1],x1,z0],[x0,z1,x1,a[3]]].filter(r=>r[2]-r[0]>.0001&&r[3]-r[1]>.0001);}
export function tiles(s){const c=s.design.bath.ceiling,out=[],cuts=[...s.design.bath.fixed,...c.equipment];for(let i=0;i<c.xLines.length-1;i++)for(let j=0;j<c.zLines.length-1;j++){let parts=[[c.xLines[i],c.zLines[j],c.xLines[i+1],c.zLines[j+1]]];for(const a of cuts)parts=parts.flatMap(r=>subtract(r,a.r));out.push(...parts);}return out;}
export function routeAudit(s,pull=false){
 const poly=s.spaces.find(p=>p.id==='master').polygons[0],v=s.design.vanity,rad=v.routeRadius,items=Object.entries(s.furniture).filter(([id])=>id!=='chair').map(([id,a])=>[id,a.r]);
 items.push(['chair',chairRect(s,pull)],['return-finish',s.design.entryStorage.connection.r],['hanging',s.design.hanging.r],...s.design.styling.curtains.map((a,i)=>['curtain'+i,a.r]));
 if(pull)items.push(['seated-person',v.occupied]);const blockers=new Set();
 for(let i=1;i<v.routePath.length;i++){const p=v.routePath[i-1],q=v.routePath[i],steps=Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/.015);
 for(let k=0;k<=steps;k++){const x=p[0]+(q[0]-p[0])*k/steps,z=p[1]+(q[1]-p[1])*k/steps;
 for(let t=0;t<32;t++)if(!inside([x+rad*Math.cos(t*Math.PI/16),z+rad*Math.sin(t*Math.PI/16)],poly))blockers.add('边界');
 for(const[id,r]of items)if(Math.hypot(Math.max(r[0]-x,0,x-r[2]),Math.max(r[1]-z,0,z-r[3]))<rad-.001)blockers.add(id);
 }}return{ok:!blockers.size,width:rad*2,blockers:[...blockers]};
}
export function auditDetails(s){
 const e=auditEntry(s),errors=[...e.errors],v=s.design.vanity,k=v.knee,cr=s.furniture.chair.r,fr=s.furniture.footCabinet.r,fd=s.design.footCabinet;
 const stowedRoute=routeAudit(s),occupiedRoute=routeAudit(s,true);
 if(!stowedRoute.ok)errors.push('收凳通路受阻：'+stowedRoute.blockers.join(','));
 if(cr[0]<k[0]||cr[1]<k[1]||cr[2]>k[2]||cr[3]>k[3]||s.furniture.chair.height>=v.kneeHeight)errors.push('妆凳未收入腿部净空');
 const sweep=[...cr];sweep[2]+=v.chairTravel;for(const[id,a]of Object.entries(s.furniture))if(!['chair','vanity'].includes(id)&&overlap(sweep,a.r))errors.push('拉凳碰到'+id);
 const drawer=[...v.drawer];drawer[2]+=v.drawerTravel;if(overlap(drawer,sweep))errors.push('浅抽碰妆凳');
 for(const leaf of fd.doors)for(const dx of[0,leaf.move])if(leaf.x[0]+dx<fr[0]||leaf.x[1]+dx>fr[2]||leaf.z<fr[1]-.001||leaf.z+.018>fr[1]+fd.trackDepth)errors.push('床尾移门超界');
 const corner=s.design.entryCorner,er=s.furniture.entryCorner.r,cp=corner.polygon;
 if(JSON.stringify(cp)!==JSON.stringify(s.furniture.entryCorner.polygon))errors.push('转角平面与3D边界不一致');
 if(cp.some(([x,z])=>x<er[0]||x>er[2]||z<er[1]||z>er[3]))errors.push('转角边界超界');
 if(inside([er[0]+.02,er[1]+.02],cp))errors.push('入口柜角未实际退让');
 const bk=s.design.bayUse.books;if(Math.abs(bk.base+bk.height-s.ceiling)>.001)errors.push('飘窗书柜未到顶');
 const mirror=s.design.styling.skinCabinet;if(mirror.mirrorZ[1]+mirror.doorTravel>mirror.r[3]-.015)errors.push('梳妆镜滑动超界');
 const eq=s.design.bath.ceiling.equipment;for(const q of eq)for(const fixed of s.design.bath.fixed)if(overlap(q.r,fixed.r))errors.push('顶面设备碰围合区');
 return{...e,errors,stowedRoute,occupiedRoute,bedMattress:s.furniture.bed.mattress,bedFrame:[s.furniture.bed.r[2]-s.furniture.bed.r[0],s.furniture.bed.r[3]-s.furniture.bed.r[1]],footDepth:fr[3]-fr[1],footGap:fr[1]-s.furniture.bed.r[3],footInteriorDepth:fr[3]-fr[1]-fd.trackDepth-fd.backThickness,fullWallWidth:s.furniture.rightHigh.r[2]-er[0],closedWidth:1.6,lowGap:s.furniture.lowCabinet.r[1]-s.furniture.bed.r[3],drawerGap:s.furniture.lowCabinet.r[1]-s.furniture.bed.r[3]-s.design.lowwall.drawerTravel,cornerSpan:er[2]-er[0],cornerCut:corner.cutApprox,cornerClipped:!inside([er[0]+.02,er[1]+.02],cp),kneeWidth:k[3]-k[1],kneeDepth:k[2]-k[0],kneeHeight:v.kneeHeight,bookTop:bk.base+bk.height};
}
export function detailOverlay(s,{pull,drawer,points,labels,routes,footMode,dryUse,hairPull}){
 let out='',v=s.design.vanity,cr=chairRect(s,pull);
 out+=rect(s.design.entryArt.r,'#b6a18b')+rect(s.design.bayUse.books.r,'#d5c8b8');
 out+=`<circle cx="${(cr[0]+cr[2])*50}" cy="${(cr[1]+cr[3])*50}" r="20" fill="#c4b3a0" stroke="#7f776b"/>`;
 if(pull)out+=rect(v.occupied,'#d3b48488');
 if(drawer)out+=rect([v.drawer[2],v.drawer[1],v.drawer[2]+v.drawerTravel,v.drawer[3]],'#d7b58b');
 if(dryUse)out+=rect(s.design.entryStorage.standing,'#d3b48488');
 if(routes){const path=v.routePath.map(p=>p.map(n=>n*100).join(',')).join(' ');out+=`<polyline points="${path}" stroke="${pull||drawer?'#bb8d47':'#699581'}" stroke-width="60" stroke-linecap="round" stroke-linejoin="round" opacity=".13" fill="none"/><polyline points="${path}" stroke="${pull||drawer?'#a1763c':'#5f8472'}" stroke-width="2" stroke-dasharray="4 4" fill="none"/>`;}
 const lw=s.design.lowwall;
 if(['0','1'].includes(footMode)){const r=s.furniture[lw.tall[+footMode]].r;for(const x of[r[0]+.006,r[2]-.006])out+=rect([x-.009,r[1]-lw.leafWidth,x+.009,r[1]],'#b5977688');}
 if(footMode==='drawer')out+=rect([lw.drawer[0],s.furniture.lowCabinet.r[1]-lw.drawerTravel,lw.drawer[2],s.furniture.lowCabinet.r[1]],'#b5977688');
 if(labels)out+=label(.31,2.57,'梳妆100×55',8)+label(2.07,3.23,'圆弧端',7)+label(2.70,3.07,'高柜80',8)+label(3.825,3.15,'矮柜145×45',9)+label(4.95,3.07,'高柜80',8)+label(3.825,2.60,'中间86.9cm',9)+label(5.55,2.08,'通顶书格',8);
 if(points)for(const a of s.design.points){out+=`<circle cx="${a.p[0]*100}" cy="${a.p[1]*100}" r="5" fill="#607968" stroke="#fff"/>`;if(labels)out+=label(a.p[0]-.08,a.p[1]-.09,a.id,9);}return out;
}
export function ceilingPlan(s){const c=s.design.bath.ceiling;let out='<g font-family="Microsoft YaHei,system-ui">'+rect(s.design.bath.usable,'#dfdbd1');for(const r of tiles(s))out+=rect(r,'#fbfaf6','#b6b3ab');for(const a of s.design.bath.fixed)out+=rect(a.r,'#aaa08f');for(const a of c.equipment)out+=rect(a.r,a.id==='BA1'?'#c9d9ce':'#ead9bc')+label((a.r[0]+a.r[2])/2,(a.r[1]+a.r[3])/2+.025,a.id,10);out+=rect(s.design.bath.fixtures.shower.r,'none','#82a2ac','stroke-dasharray="3 3"');out+=label(.57,.65,'淋浴投影',9)+label(1.57,.45,'台盆90×45',9)+label(.23,1.64,'围合',8)+label(.23,1.78,'保留',8);out+=`<line x1="110" y1="205" x2="195" y2="205" stroke="#a5876c" stroke-width="4"/>`;out+=label(1.525,2.19,'原门洞85cm',9)+label(1.07,-.16,'主卫顶面排板 · 同平面方向',12)+label(1.07,2.42,'BA1 风暖/换气/主灯 300×600',9)+label(1.07,2.60,'CK1 可拆检修板 300×300',9)+label(1.07,2.78,'完成面暂按2.35m · 出风管终点待核',8);return out+'</g>';}
export function mountDetails({s,scene,box,cylinder,roundedFace,M,white,greige,metal,luminous}){
 const r=s.furniture.vanity.r,v=s.design.vanity,putty=M(s.design.palette.recess),ink=M(s.design.palette.dark),makeup=new T.Group();makeup.name='entry-makeup';scene.add(makeup);
 box('entry-makeup-top',r,.715,.035,white,makeup,.025);
 box('entry-makeup-side',[r[0],r[1],r[2],r[1]+.018],.08,.635,putty,makeup);
 box('entry-makeup-pedestal',[r[0],2.94,r[2],r[3]],.08,.585,putty,makeup);
 box('entry-makeup-frame',[r[0]+.02,r[1]+.02,r[0]+.05,r[3]-.02],.665,.045,metal,makeup);
 const drawers=new T.Group();makeup.add(drawers);box('entry-makeup-drawer',v.drawer,.44,.16,white,drawers);
 box('entry-makeup-top-drawer',[.04,2.15,.55,2.93],.67,.042,putty,makeup);
 const sc=s.design.styling.skinCabinet,sr=sc.r,vr=s.design.styling.vanityRecess;
 box('unified-vanity-recess',vr.r,vr.base,vr.height,putty,makeup);
 box('makeup-mirror-back',[sr[0],sr[1],sr[0]+.018,sr[3]],sc.base,sc.height,putty,makeup);
 for(const z of[sr[1],2.82,sr[3]-.018])box('makeup-mirror-divider',[sr[0],z,sr[2]-.02,z+.018],sc.base,sc.height,putty,makeup);
 for(const y of sc.shelves)box('makeup-mirror-shelf',[sr[0],sr[1],sr[2],sr[3]],y,.015,white,makeup);
 for(let j=0;j<3;j++)for(const z of[2.25,2.44,2.62,2.91])cylinder(.11,sc.shelves[j]+.016,z,.025,.18,greige,makeup);
 const careDoor=new T.Group();makeup.add(careDoor);
 const mirrorWidth=sc.mirrorZ[1]-sc.mirrorZ[0];
 const mirror=roundedFace('entry-sliding-makeup-mirror',0,0,0,mirrorWidth,.94,.013,sc.radius,M('#b7c1bc'),careDoor);
 mirror.rotation.y=Math.PI/2;mirror.position.set(.202,1.115,sc.mirrorZ[1]);
 for(const z of[sc.mirrorZ[0]+.015,sc.mirrorZ[1]-.024])box('makeup-soft-light',[.216,z,.224,z+.009],1.20,.72,luminous,careDoor);
 box('makeup-upper',[.02,2.12,.638,3.12],2.10,.42,white,makeup);
 box('makeup-upper-finger-reveal',[.638,2.15,.642,3.09],2.10,.006,ink,makeup);
 box('makeup-top-scribe',[.02,2.12,.67,3.12],2.52,.08,white,makeup);
 // Independent option: two tall end units and a recessed low chest.
 const cg=new T.Group();cg.name='foot-cabinet';scene.add(cg);
 const lw=s.design.lowwall,highDoors=[];
 for(const [index,id]of lw.tall.entries()){
  const r=s.furniture[id].r;
  box('high-back',[r[0],r[3]-.018,r[2],r[3]],.08,2.44,putty,cg);
  for(const x of[r[0],r[2]-.018])box('high-side',[x,r[1]+.02,x+.018,r[3]],.08,2.44,white,cg);
  for(const y of(index===0?[.08,.60,1.08,1.56,2.08,2.50]:[.08,2.08,2.50]))box('high-shelf',[r[0]+.018,r[1]+.03,r[2]-.018,r[3]-.018],y,.018,white,cg);
  if(index===0){for(const y of[.64,1.12,1.60])box('folded-bedding',[r[0]+.06,r[1]+.08,r[2]-.06,r[3]-.07],y,.30,greige,cg,.025);}
  else{
   box('high-clothes-rail',[r[0]+.04,3.04,r[2]-.04,3.06],1.98,.02,metal,cg);
   for(let i=0;i<6;i++)box('high-clothes',[r[0]+.09+i*.10,2.80,r[0]+.12+i*.10,3.29],.47,1.42,i%2?greige:white,cg);
  }
  for(const side of[0,1]){
   const g=new T.Group();g.position.set(side?r[2]-.006:r[0]+.006,0,r[1]);cg.add(g);
   const w=lw.leafWidth;box('high-door',[side?-w:0,0,side?0:w,.018],.08,2.42,white,g);
   box('high-inset-handle',[side?-w+.02:w-.034,-.002,side?-w+.034:w-.02,.001],1.01,.23,ink,g);
   highDoors.push({g,index,side});
  }
  box('high-top-scribe',r,2.52,.08,white,cg);
 }
 const lr=s.furniture.lowCabinet.r;
 box('low-chest-back',[lr[0],lr[3]-.018,lr[2],lr[3]],.08,.68,white,cg);
 for(const x of[lr[0],(lr[0]+lr[2])/2-.009,lr[2]-.018])box('low-chest-side',[x,lr[1]+.018,x+.018,lr[3]],.08,.68,white,cg);
 for(const y of[.08,.31,.76])box('low-chest-shelf',[lr[0],lr[1]+.018,lr[2],lr[3]],y,.018,white,cg);
 box('low-chest-top',lr,.77,.03,M('#c4bbac'),cg,.006);
 const lowDrawer=new T.Group();cg.add(lowDrawer);
 for(const [i,x]of[lr[0]+.01,(lr[0]+lr[2])/2+.004].entries())for(const y of[.08,.31,.54]){
  const parent=i===0&&y===.54?lowDrawer:cg;
  box('low-drawer-front',[x,lr[1],x+.706,lr[1]+.018],y,.223,white,parent,.004);
 }
 box('low-open-drawer-tray',lw.drawer,lw.drawerBase,.018,putty,lowDrawer);
 for(const x of[lw.drawer[0],lw.drawer[2]-.015])box('low-drawer-side',[x,lw.drawer[1],x+.015,lw.drawer[3]],lw.drawerBase,.18,putty,lowDrawer);
 // Simple graphic art is a style placeholder, not a purchased work.
 const art=lw.art,ar=art.r;
 box('low-wall-art-frame',ar,art.base,art.height,metal,cg);
 box('low-wall-art-paper',[ar[0]+.015,ar[1]-.005,ar[2]-.015,ar[1]],art.base+.015,art.height-.03,M('#e6ddce'),cg);
 roundedFace('low-wall-art-form',ar[0]+.17,art.base+.15,ar[1]-.009,.43,.68,.003,.20,M('#b1a99b'),cg);
 box('low-wall-art-line',[ar[0]+.70,ar[1]-.010,ar[0]+.706,ar[1]-.007],art.base+.20,.62,ink,cg);
 cylinder(4.26,.80,3.18,.055,.19,putty,cg);
 box('low-counter-frame',[3.26,3.22,3.45,3.245],.80,.24,metal,cg);
 box('low-counter-photo',[3.272,3.215,3.438,3.22],.812,.216,M('#d5c9b6'),cg);
 const corner=s.design.entryCorner,er=s.furniture.entryCorner.r,ag=new T.Group();ag.name='coat-arch';scene.add(ag);
 // Same clipped footprint in plan and 3D; not a decorative hole on a square corner.
 const cornerSolid=(name,base,height,material)=>{
  const shape=new T.Shape();corner.polygon.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const geo=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});geo.rotateX(-Math.PI/2);
  const mesh=new T.Mesh(geo,material);mesh.name=name;mesh.position.y=base;mesh.castShadow=mesh.receiveShadow=true;ag.add(mesh);return mesh;
 };
 cornerSolid('curved-entry-corner',.08,.70,white);
 cornerSolid('curved-entry-upper',corner.openTop,2.52-corner.openTop,white);
 cornerSolid('curved-entry-top-scribe',2.52,.08,white);
 box('corner-display-back',[er[0],er[3]-.018,er[2],er[3]],.78,corner.openTop-.78,putty,ag);
 box('corner-display-side',[er[2]-.018,er[1],er[2],er[3]],.78,corner.openTop-.78,putty,ag);
 for(const y of corner.shelfHeights)cornerSolid('curved-entry-shelf',y,.018,white);
 // Restrained ornaments sit behind the diagonal edge and do not project into the approach.
 cylinder(2.07,.818,3.20,.055,.19,putty,ag);
 cylinder(2.16,1.418,3.15,.045,.18,greige,ag);
 box('corner-display-book',[1.97,3.25,2.17,3.32],1.418,.045,ink,ag);
 box('corner-concealed-led',[1.90,3.327,2.265,3.339],1.905,.008,luminous,ag);
 const accent=(name,parent,p,target,color,intensity,angle)=>{
  const light=new T.SpotLight(color,intensity,3.5,angle,.75,1.6);light.name=name;light.userData.localLighting=true;light.position.set(...p);
  const aim=new T.Object3D();aim.position.set(...target);parent.add(aim);light.target=aim;parent.add(light);return light;
 };
 accent('corner-soft-light',ag,[2.10,1.895,3.24],[2.10,.95,3.15],'#ffe3bb',2.5,.65);
 box('vanity-canopy-diffuser',[.38,2.25,.40,2.99],2.088,.009,luminous,makeup);
 const canopyLight=new T.PointLight('#fff0dc',1.5,1.8,1.7);canopyLight.name='vanity-canopy-light';canopyLight.position.set(.40,2.06,2.61);makeup.add(canopyLight);
 for(const z of[2.22,2.76])accent('mirror-task-light',makeup,[.24,1.70,z],[1.02,1.24,2.52],'#fff1df',2.2,.80);
 for(const [i,q]of s.design.styling.curtains.entries()){
 const group=new T.Group();group.name='bay-curtain-'+i;scene.add(group);
 for(let z=q.r[1];z<q.r[3]-.025;z+=.034){const o=cylinder((q.r[0]+q.r[2])/2,q.base,z+.017,.024,q.height,M('#c9c1b6'),group);o.scale.x=1.35;}
 box('bay-curtain-track',q.r,q.base+q.height,.025,white,group);
 }
 const bk=s.design.bayUse.books,br=bk.r,by=bk.base;
 box('bay-end-books-back',[br[0],br[3]-.018,br[2],br[3]],by,bk.height,putty);
 for(const x of[br[0],br[2]-.018])box('bay-end-books-side',[x,br[1],x+.018,br[3]],by,bk.height,white);
 for(const y of bk.shelfHeights)box('bay-end-books-shelf',br,y,.015,white);
 // Mount spans the 2cm model gap to the retained bay end wall.
 box('bay-shelf-wall-mount',[br[0]+.03,br[3],br[2]-.03,2.30],by+.05,bk.height-.10,putty);
 for(let i=0;i<9;i++){const x=br[0]+.035+i*.038;box('reading-book',[x,br[1]+.025,x+.027,br[3]-.023],by+.015,[.25,.29,.27][i%3],i%3===0?ink:white,scene,.002);}
 cylinder(br[0]+.13,1.635,br[1]+.10,.045,.19,putty);
 box('bay-upper-closed-front',[br[0]+.006,br[1]-.001,br[2]-.006,br[1]+.017],2.065,.50,white);
 box('bay-upper-finger-gap',[br[0]+.025,br[1]-.002,br[2]-.025,br[1]+.002],2.065,.008,metal);
 box('display-object',[br[0]+.29,br[1]+.04,br[0]+.42,br[3]-.035],1.635,.15,white,scene,.025);
 box('bay-reading-lamp',[5.48,2.235,5.66,2.258],1.51,.024,metal);
 box('bay-reading-diffuser',[5.49,2.232,5.65,2.25],1.505,.006,luminous);
 accent('bay-reading-light',scene,[5.57,1.51,2.21],[5.58,.72,1.51],'#ffe7c6',2.3,.65);
 const chair=new T.Group();scene.add(chair);const cr=s.furniture.chair.r,cx=(cr[0]+cr[2])/2,cz=(cr[1]+cr[3])/2;cylinder(cx,.035,cz,.15,.325,putty,chair);cylinder(cx,.36,cz,.20,.10,M('#b5a592'),chair);
 const ceiling=new T.Group();scene.add(ceiling);const c=s.design.bath.ceiling;for(const r of tiles(s))box('aluminium-panel',[r[0]+.001,r[1]+.001,r[2]-.001,r[3]-.001],c.height,.012,white,ceiling);
 for(const a of c.equipment){box(a.id,a.r,c.height-.002,.016,a.id==='BA1'?greige:M('#d8c5a9'),ceiling);if(a.id==='BA1'){box('heater-led',[a.r[0]+.035,a.r[1]+.055,a.r[0]+.24,a.r[3]-.055],c.height-.007,.004,luminous,ceiling);for(let i=0;i<7;i++)box('heater-grille',[a.r[0]+.30,a.r[1]+.025+i*.036,a.r[2]-.025,a.r[1]+.030+i*.036],c.height-.007,.005,metal,ceiling);}}
 const points=new T.Group();scene.add(points);for(const p of s.design.points.filter(a=>a.id.startsWith('S')||a.id==='P1')){const[x,z]=p.p;box(p.id,p.face==='x'?[x-.014,z-.043,x+.006,z+.043]:[x-.043,z-.008,x+.043,z+.012],p.height-.043,.086,white,points,.005);}
 // Bedside reading lights supplement the inherited ceiling and headboard lights.
 for(const x of[2.46,4.78]){box('reading-light-base',[x-.045,.053,x+.045,.075],1.10,.10,metal);box('reading-light-head',[x-.06,.075,x+.06,.16],1.15,.03,luminous);}
 return{update({pull,drawer,showCeiling,showPoints,careOpen,mirrorSide,footMode}){highDoors.forEach(({g,index,side})=>{g.rotation.y=footMode===String(index)?(side?-1:1)*Math.PI/2:0;g.visible=footMode!=='inside';});lowDrawer.position.z=footMode==='drawer'?-lw.drawerTravel:0;chair.position.x=pull?v.chairTravel:0;drawers.position.x=drawer?v.drawerTravel:0;careDoor.position.z=careOpen?sc.doorTravel:0;ceiling.visible=showCeiling;points.visible=showPoints;}};
}
