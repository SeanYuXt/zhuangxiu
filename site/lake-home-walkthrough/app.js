import {textilesReady} from './textile-details.js?v=matte-fabric-2';
import {cabinetFinishesReady} from './cabinet-finishes.js';
import {applyAcceptedElderOnly} from './bedroom-revision.js';
import * as T from './vendor/three.module.js';
import {P,outline,rooms,walls,notes,doorLeaves} from './plan.js';
import {buildServices} from './services.js';
import {buildLaundry} from './laundry.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {applyRealisticFinishes,createFineRenderer} from './realistic.js';
import {palette,ceilingFixtures,barSeating} from './design-spec.js';
import {buildEverydayDetails} from './everyday-details.js';
import {setDoorLeafOpen} from './door-motion.js';
import {windowAtWall} from './window-profiles.js';

await Promise.all([textilesReady,cabinetFinishesReady]);
const stage=document.querySelector('#stage'),canvas=document.querySelector('#view');
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new T.Scene();scene.background=new T.Color('#c6dce3');scene.fog=new T.Fog('#ccdfe3',55,150);
const camera=new T.PerspectiveCamera(70,1,.035,220);camera.rotation.order='YXZ';
const house=new T.Group(),wallGroup=new T.Group(),glassGroup=new T.Group(),ceilingGroup=new T.Group();
scene.add(house);house.add(wallGroup,glassGroup,ceilingGroup);
const colliders=[],doorObjects=[],roomLabels=[],interactive=[],furn=new T.Group();house.add(furn);
const mat=(color,roughness=.65,extra={})=>new T.MeshStandardMaterial({color,roughness,...extra});
const white=mat(palette.wall),oak=mat(palette.wood),dark=mat(palette.metal),stone=mat(palette.stone),fabric=mat(palette.sofa),linen=mat(palette.linen),brass=mat('#79796e',.45,{metalness:.5});
const cabinetFinish=mat(palette.cabinet,.68),walnut=mat(palette.wood,.7),black=mat('#242825',.58);
white.name='warm-white-paint';cabinetFinish.name='warm-greige-cabinet';fabric.name='oatmeal-upholstery';linen.name='warm-linen';
const ledMat=mat('#fff1d7',.4,{emissive:'#ffe5bb',emissiveIntensity:.65});
// Subtle deterministic surface grain, not photographic or generated-image textures.
function finishTexture(wood=false){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=wood?'#a99b87':'#d8d4ca';ctx.fillRect(0,0,512,512);let seed=77;const rand=()=>{seed=seed*16807%2147483647;return seed/2147483647;};for(let i=0;i<3500;i++){ctx.fillStyle=`rgba(70,62,50,${rand()*(wood?.07:.025)})`;const x=rand()*512,y=rand()*512;ctx.fillRect(x,y,wood?.5:1,wood?25+rand()*200:1);}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
walnut.map=finishTexture(true);stone.map=finishTexture();
const glass=new T.MeshPhysicalMaterial({color:'#d4ebec',transparent:true,opacity:.16,roughness:.08,metalness:.12,depthWrite:false,side:T.DoubleSide});
glass.name='clear-architectural-glass';
const privacy=new T.MeshPhysicalMaterial({color:'#e2ebdd',transparent:true,opacity:.57,roughness:.7,side:T.DoubleSide});
const wallMaterial=white.clone();const mats=[];
function box(parent,x,y,z,w,h,d,material=white){const upholstered=[fabric,linen].includes(material),rounded=([cabinetFinish,walnut,stone,oak].includes(material)||upholstered)&&Math.min(w,h,d)>.014;const geometry=rounded?new RoundedBoxGeometry(w,h,d,upholstered?4:2,Math.min(upholstered?.045:.003,Math.min(w,h,d)/5)):new T.BoxGeometry(w,h,d);const m=new T.Mesh(geometry,material);m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(parent,x,y,z,r,h,material=oak){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,36),material);m.position.set(x,y+h/2,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function softBox(parent,x,y,z,w,h,d,r,material){
 if([fabric,linen].includes(material)){const mesh=new T.Mesh(new RoundedBoxGeometry(w,h,d,5,Math.min(r,h*.48)),material);mesh.position.set(x,y+h/2,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 const shape=new T.Shape(),a=-w/2,b=-d/2;
 shape.moveTo(a+r,b);shape.lineTo(a+w-r,b);shape.quadraticCurveTo(a+w,b,a+w,b+r);shape.lineTo(a+w,b+d-r);shape.quadraticCurveTo(a+w,b+d,a+w-r,b+d);shape.lineTo(a+r,b+d);shape.quadraticCurveTo(a,b+d,a,b+d-r);shape.lineTo(a,b+r);shape.quadraticCurveTo(a,b,a+r,b);
 const mesh=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:8}),material);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function registerFurniture(group,name){group.updateWorldMatrix(true,true);const bounds=new T.Box3().setFromObject(group);colliders.push({x1:bounds.min.x,x2:bounds.max.x,z1:bounds.min.z,z2:bounds.max.z,type:'furniture',name});}
function ellipsoid(parent,x,y,z,w,h,d,material=linen){const m=new T.Mesh(new T.SphereGeometry(1,24,16),material);m.scale.set(w/2,h/2,d/2);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function at(px,py,angle=0){const [x,z]=P([px,py]),g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;furn.add(g);return g;}
function obstacle(px,py,w,d){const [x,z]=P([px,py]);colliders.push({x1:x-w/2,x2:x+w/2,z1:z-d/2,z2:z+d/2,type:'furniture'});}
function textTexture(text,bg='#eae5d8',fg='#46513f',w=512,h=128){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.floor(h*.31)}px sans-serif`;ctx.fillText(text,w/2,h/2,w*.94);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
function plaque(parent,x,y,z,w,h,text){const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:textTexture(text)}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
function woodTexture(){const c=document.createElement('canvas');c.width=c.height=1024;const ctx=c.getContext('2d');ctx.fillStyle='#c7ae88';ctx.fillRect(0,0,1024,1024);let seed=13;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};for(let row=0;row<8;row++){for(let col=0;col<5;col++){const x=col*280-(row%2)*140,y=row*128;ctx.fillStyle=`hsl(34,27%,${66+rand()*8}%)`;ctx.fillRect(x+1,y+1,278,126);}for(let i=0;i<90;i++){ctx.strokeStyle=`rgba(105,76,42,${rand()*.12})`;ctx.beginPath();const y=row*128+rand()*128;ctx.moveTo(0,y);ctx.bezierCurveTo(250,y+8*rand(),700,y-8*rand(),1024,y);ctx.stroke();}}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(.35,.35);t.colorSpace=T.SRGBColorSpace;return t;}
function polygonMesh(points,y,material,parent=house,holes=[]){const shape=new T.Shape();points.map(P).forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();for(const points of holes){const hole=new T.Path();points.map(P).forEach(([x,z],i)=>i?hole.lineTo(x,-z):hole.moveTo(x,-z));hole.closePath();shape.holes.push(hole);}const mesh=new T.Mesh(new T.ShapeGeometry(shape),material);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
// One world-aligned grid: 800 mm tile centres, 2 mm grout, straight lay throughout.
const tileCanvas=document.createElement('canvas');tileCanvas.width=tileCanvas.height=1024;
const tileCtx=tileCanvas.getContext('2d');tileCtx.fillStyle='#d9d6ce';tileCtx.fillRect(0,0,1024,1024);tileCtx.fillStyle='#aaa79f';tileCtx.fillRect(0,0,3,1024);tileCtx.fillRect(0,0,1024,3);
const tileMap=new T.CanvasTexture(tileCanvas);tileMap.colorSpace=T.SRGBColorSpace;tileMap.wrapS=tileMap.wrapT=T.RepeatWrapping;tileMap.repeat.set(1/notes.finishes.tile,1/notes.finishes.tile);
const floorMaterial=mat('#ffffff',.72,{map:tileMap});
// Display-only pan recess, NOT permission to core/drill a structural slab.
const squatFloorOpening=[[234,766],[284,766],[284,832],[234,832]];
const floor=polygonMesh(outline,.006,floorMaterial,house,[squatFloorOpening]);floor.name='800x800-straight-tile-floor';floor.userData={tilePitch:.8,recessStatus:'次卫蹲便示意；沉箱、排污及存水弯未核实，不得据此凿楼板'};polygonMesh(outline,-.12,stone,house,[squatFloorOpening]);
const ceil=polygonMesh(outline,2.8,mat(palette.ceiling,.9,{side:T.DoubleSide}),ceilingGroup);ceilingGroup.visible=false;
const ceilingDetails=[];
function insetPolygon(poly,d){const pts=poly.map(P),area=pts.reduce((sum,a,i)=>{const b=pts[(i+1)%pts.length];return sum+a[0]*b[1]-b[0]*a[1];},0),sign=Math.sign(area);return pts.map((v,i)=>{const a=pts[(i+pts.length-1)%pts.length],b=pts[(i+1)%pts.length],u=[v[0]-a[0],v[1]-a[1]],w=[b[0]-v[0],b[1]-v[1]],ul=Math.hypot(...u),wl=Math.hypot(...w);const p=[v[0]-sign*u[1]/ul*d,v[1]+sign*u[0]/ul*d],q=[v[0]-sign*w[1]/wl*d,v[1]+sign*w[0]/wl*d],cross=u[0]*w[1]-u[1]*w[0];if(Math.abs(cross)<1e-8)return p;const t=((q[0]-p[0])*w[1]-(q[1]-p[1])*w[0])/cross;return [p[0]+t*u[0],p[1]+t*u[1]];});}
function ceilingBand(poly,inner,outer,bottom,name){const shape=new T.Shape(),hole=new T.Path();insetPolygon(poly,inner).forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();insetPolygon(poly,outer).forEach(([x,z],i)=>i?hole.lineTo(x,-z):hole.moveTo(x,-z));hole.closePath();shape.holes.push(hole);const m=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:2.8-bottom,bevelEnabled:false}),white);m.rotation.x=-Math.PI/2;m.position.y=bottom;m.name=name;m.receiveShadow=true;ceilingGroup.add(m);ceilingDetails.push({name,bottom});}
const publicCeiling=[[634,140],[1245,140],[1245,837],[634,837]];
ceilingBand(publicCeiling,0,.10,2.62,'客厅双眼皮外层');ceilingBand(publicCeiling,.10,.19,2.67,'客厅双眼皮内层');
for(const id of ['bed1','master','bed3'])ceilingBand(rooms.find(r=>r.id===id).poly,0,.12,2.67,id+'单眼皮');

function wallPiece(a,b,t,y,height,material=wallMaterial,parent=wallGroup,collision=true){const [ax,az]=P(a),[bx,bz]=P(b),length=Math.hypot(bx-ax,bz-az);if(length<.002||height<=0)return;const mesh=box(parent,(ax+bx)/2,y,(az+bz)/2,length,height,t,material);mesh.rotation.y=-Math.atan2(bz-az,bx-ax);if(collision&&y<.2){mesh.updateWorldMatrix(true,false);const bounds=new T.Box3().setFromObject(mesh);colliders.push({x1:bounds.min.x,x2:bounds.max.x,z1:bounds.min.z,z2:bounds.max.z,type:'wall',name:'墙面'});}return mesh;}
function glazing(a,b,sill=.06,height=2.62,frosted=false,profile=null,index=-1){const g=new T.Group();glassGroup.add(g);if(profile){g.name=`window-${profile.room}-${index}`;g.userData={id:profile.id,room:profile.room,sill,height,sourceSill:profile.sourceSill,sourceHeight:profile.sourceHeight,basis:profile.basis,userOverride:!!profile.userOverride,installationVerified:false};}wallPiece(a,b,.035,sill,height,frosted?privacy:glass,g,false).name=g.name+'-glass';wallPiece(a,b,.075,sill-.04,.045,dark,g,false);wallPiece(a,b,.075,sill+height,.045,dark,g,false);const [ax,az]=P(a),[bx,bz]=P(b);for(let i=0;i<=1;i++)box(g,ax+(bx-ax)*i,sill,az+(bz-az)*i,.035,height,.035,dark);colliders.push({x1:Math.min(ax,bx)-.06,x2:Math.max(ax,bx)+.06,z1:Math.min(az,bz)-.06,z2:Math.max(az,bz)+.06,type:'glass'});return g;}
function door(a,b,id){
 const [ax,az]=P(a),[bx,bz]=P(b),w=Math.hypot(bx-ax,bz-az),isFront=id==='front';
 const definitions=doorLeaves[id];if(!definitions)throw new Error('Missing source door schedule: '+id);
 for(const def of definitions){
  const group=new T.Group(),reverse=def.hinge==='b',base=-Math.atan2(reverse?az-bz:bz-az,reverse?ax-bx:bx-ax);
  // Front leaf proportions follow the source rectangles; frame/seam remain design allowances.
  const inset=isFront?.045:.0275,partWidth=(w-2*inset)*def.share;
  const ux=(bx-ax)/w,uz=(bz-az)/w;
  group.position.set(reverse?bx-ux*inset:ax+ux*inset,0,reverse?bz-uz*inset:az+uz*inset);
  group.name=`door-${id}-${def.key}`;house.add(group);
  group.userData={id,key:def.key,base,turn:def.turn,hinge:def.hinge,sourceRect:def.sourceRect,
   openingWidth:w,leafSpan:partWidth,source:'source-opening-schedule.json',
   precision:'原图铰接端与转向；门洞宽/高度、框缝和双扇分配仍为模型方案，非安装复尺'};
  const leaf=box(group,partWidth/2,.015,0,isFront?partWidth-.004:partWidth,2.15,isFront?.075:.042,isFront?mat('#51564e'):oak);
  leaf.name=group.name+'-panel';leaf.userData.doorGroupName=group.name;
  if(!isFront||def.key==='main'){
   box(group,partWidth-.12,.98,.045,.12,.024,.024,brass);
   if(isFront){box(group,partWidth-.14,.9,-.055,.035,.32,.035,dark);box(group,partWidth*.5,1.48,-.044,.02,.025,.012,brass);plaque(group,partWidth*.5,1.75,-.045,.36,.13,'HOME');group.children.at(-1).rotation.y=Math.PI;}
  }else box(group,partWidth-.045,1.05,.043,.018,.10,.018,dark);
  setDoorLeafOpen(group,!isFront);doorObjects.push(group);interactive.push(leaf);
 }
 for(const [x,z] of [[ax,az],[bx,bz]])box(house,x,0,z,.055,2.2,.09,isFront?dark:oak);
 wallPiece(a,b,.11,2.15,.055,isFront?dark:oak,house,false);
}
for(const [index,w] of walls.entries()){const profile=windowAtWall(index),thickness=(w.t||20)/100;const len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);const point=s=>[w.a[0]+(w.b[0]-w.a[0])*s/len,w.a[1]+(w.b[1]-w.a[1])*s/len];if(w.glass){
 if(!profile)throw Error('Missing window profile '+index);
 if(!profile.userOverride){wallPiece(w.a,w.b,thickness,0,profile.sill).name=`window-${profile.room}-${index}-lower-boundary`;wallPiece(w.a,w.b,thickness,profile.sill+profile.height,2.8-profile.sill-profile.height);}
 glazing(w.a,w.b,profile.sill,profile.height,false,profile,index);continue;
}let cursor=0;for(const o of [...(w.open||[])].sort((a,b)=>a.at-b.at)){wallPiece(point(cursor),point(o.at),thickness,0,2.8);const a=point(o.at),b=point(o.at+o.w);if(o.kind==='window'){
 if(!profile)throw Error('Missing window profile '+index);
 const {sill,height}=profile;wallPiece(a,b,thickness,0,sill);wallPiece(a,b,thickness,sill+height,2.8-sill-height);glazing(a,b,sill,height,profile.room.startsWith('bath'),profile,index);
}else{wallPiece(a,b,thickness,2.2,.6);if(o.kind==='door')door(a,b,o.id);}cursor=o.at+o.w;}wallPiece(point(cursor),w.b,thickness,0,2.8);}

// Furniture uses real world dimensions, with its own meshes, rather than plan-image textures.
function wardrobe(px,py,width,depth=.58,rotation=0){const g=at(px,py,rotation);box(g,0,.08,0,width,2.69,depth,walnut);box(g,0,0,-.025,width-.1,.08,depth-.08,black);const n=Math.ceil(width/.6);for(let i=0;i<n;i++)box(g,-width/2+(i+.5)*width/n,.09,depth/2+.009,width/n-.004,2.665,.018,cabinetFinish);registerFurniture(g,'衣柜');return g;}
function bed(px,py,width=1.8,rotation=0){const g=at(px,py,rotation);box(g,0,.1,0,width+.1,.26,2.12,oak);box(g,0,.36,0,width,.23,2.02,linen);box(g,0,.08,-1.06,width+.16,1.07,.12,fabric);box(g,0,.59,.35,width+.01,.018,1.14,mat('#b6ad9e'));for(const x of [-width/4,width/4])ellipsoid(g,x,.66,-.67,width*.42,.17,.42,linen);for(const x of [-width/2-.31,width/2+.31]){box(g,x,.05,-.74,.43,.42,.43,oak);cylinder(g,x,.47,-.74,.1,.018,brass);cylinder(g,x,.49,-.74,.016,.18,brass);cylinder(g,x,.67,-.74,.13,.18,linen);}return g;}
function ac(px,py,rotation=0){const g=at(px,py,rotation);const shell=new T.Mesh(new RoundedBoxGeometry(.94,.3,.2,4,.035),white);shell.position.y=2.33;g.add(shell);shell.castShadow=true;
 box(g,0,2.205,.098,.82,.054,.012,black);for(let i=0;i<13;i++)box(g,-.37+i*.061,2.213,.109,.008,.035,.012,white);
 const flap=box(g,0,2.2,.115,.83,.011,.05,white);flap.rotation.x=-.32;box(g,0,2.443,.099,.82,.003,.003,mat('#bfc2bd'));plaque(g,.32,2.37,.111,.1,.05,'24°');
 g.userData={type:'wall-mounted-air-conditioner',outdoorPosition:null,refrigerantRoute:null,capacity:null,status:'室内机外观示意；机型、孔位与排水未定'};return g;}
function chair(parent,x,z,rotation=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);box(g,0,.43,0,.5,.11,.5,fabric);box(g,0,.48,-.24,.52,.36,.065,oak);for(const xx of [-.19,.19])for(const zz of [-.19,.19])box(g,xx,0,zz,.035,.43,.035,oak);}
function plant(px,py,r=.18){const g=at(px,py);const pot=new T.Mesh(new T.CylinderGeometry(r,r*.76,.35,48),mat('#c6c1b3',.82));pot.position.y=.175;g.add(pot);cylinder(g,0,.346,0,r*.88,.012,mat('#41392c'));for(let i=0;i<9;i++){const a=i*2.399,h=.50+i*.059,x=Math.cos(a)*r*.7,z=Math.sin(a)*r*.7;const curve=new T.QuadraticBezierCurve3(new T.Vector3(0,.34,0),new T.Vector3(x*.4,h*.8,z*.4),new T.Vector3(x,h,z));g.add(new T.Mesh(new T.TubeGeometry(curve,8,.004,5,false),mat('#586043')));for(const sign of [-1,1]){const leaf=ellipsoid(g,x+Math.cos(a)*sign*r*.38,h-.07,z+Math.sin(a)*sign*r*.38,r*.95,.014,r*.36,mat(i%2?'#627344':'#76845b',.75));leaf.rotation.set(sign*.32,a,sign*.2);}}}
function downlight(px,py){const [x,z]=P([px,py]),g=new T.Group();g.name='recessed-led-downlight';g.position.set(x,0,z);ceilingGroup.add(g);cylinder(g,0,2.77,0,.055,.027,white);cylinder(g,0,2.763,0,.044,.015,black);const bezel=new T.Mesh(new T.TorusGeometry(.049,.005,12,48),white);bezel.rotation.x=Math.PI/2;bezel.position.y=2.768;g.add(bezel);cylinder(g,0,2.759,0,.031,.006,mat('#fff0d8',.2,{emissive:'#ffe0aa',emissiveIntensity:1.3}));g.userData={nominalDiameterMm:110,fixture:'recessed anti-glare LED',engineeringSelection:'pending'};}
function ceilingLight(spec){
 const g=new T.Group(),[x,z]=P(spec.point);g.name=spec.id;g.position.set(x,0,z);g.userData={...spec,engineeringStatus:'外观与光色方案，非照度计算或施工选型'};ceilingGroup.add(g);
 const lightColor=spec.kelvin===4000?'#fff3df':'#ffe5c0',diffuser=mat('#fff9ee',.68,{emissive:lightColor,emissiveIntensity:.6});diffuser.name=spec.id+'-diffuser';
 if(spec.type==='disc'){cylinder(g,0,spec.bottom,0,spec.diameter/2,.055,white);cylinder(g,0,spec.bottom-.005,0,spec.diameter/2-.012,.008,diffuser);const edge=new T.Mesh(new T.TorusGeometry(spec.diameter/2-.009,.005,10,80),white);edge.rotation.x=Math.PI/2;edge.position.y=spec.bottom-.004;g.add(edge);}
 else {box(g,0,spec.bottom,0,spec.width,.045,spec.length,white);box(g,0,spec.bottom-.006,0,spec.width-.025,.008,spec.length-.025,diffuser);}
}

// Left bedroom: keep the turning bay free; bed faces into the room.
bed(229,490,1.5,-Math.PI/2).name='bed1-bed';
wardrobe(213,628,1.7,.58,Math.PI).name='bed1-wardrobe';colliders.pop();ac(402,467,-Math.PI/2).name='bed1-air-conditioner';
const b1desk=at(231,336);b1desk.name='bed1-desk';box(b1desk,0,.73,0,1.3,.045,.45,oak);box(b1desk,-.58,0,0,.05,.73,.42,oak);box(b1desk,.58,0,0,.05,.73,.42,oak);chair(b1desk,0,.45,0);
// Master suite: ensuite/passage retain their original connections.
bed(1644,319,1.8).name='master-bed';obstacle(1644,319,1.96,2.18);
wardrobe(1630,515,3.1,.56,Math.PI).name='master-wardrobe';obstacle(1630,515,3.1,.56);
wardrobe(1292,533,2.3,.53,Math.PI/2).name='master-entry-wardrobe';obstacle(1292,533,.53,2.3);ac(1495,213,0).name='master-air-conditioner';
// Secondary bedroom: a compact double bed and proper desk.
bed(1714,679,1.5).name='bed3-bed';obstacle(1714,679,1.62,2.12);wardrobe(1641,805,2.9,.58,Math.PI).name='bed3-wardrobe';obstacle(1641,805,2.9,.58);ac(1580,574,0).name='bed3-air-conditioner';
const desk=at(1535,600);desk.name='bed3-desk';box(desk,0,.74,0,1.55,.055,.58,oak);box(desk,-.57,0,0,.38,.74,.55,white);box(desk,.72,0,0,.045,.74,.55,oak);box(desk,0,.8,-.08,.55,.36,.035,dark);chair(desk,0,.57);obstacle(1535,600,1.55,.58);

// Kitchen countertops and equipment.
const k=at(445,474);k.name='kitchen-cooking-cabinets';box(k,0,0,0,.58,.86,2.62,white);box(k,0,.86,0,.61,.04,2.66,stone);
for(let i=0;i<5;i++)box(k,.299,.08,-1.05+i*.52,.022,.74,.5,oak);
const hob=new T.Group();hob.name='kitchen-hob';k.add(hob);box(hob,0,.904,.1,.46,.012,.61,dark);for(let i=0;i<2;i++){const z=-.07+i*.3;cylinder(hob,0,.92,z,.09,.012,mat('#111615'));const ring=new T.Mesh(new T.TorusGeometry(.093,.004,8,40),brass);ring.rotation.x=Math.PI/2;ring.position.set(0,.934,z);hob.add(ring);cylinder(hob,.16,.919,z,.023,.013,brass);}
const hood=new T.Group();hood.name='kitchen-hood';k.add(hood);box(hood,0,1.9,.1,.54,.15,.72,white);box(hood,-.12,2.05,.1,.25,.68,.36,white);box(hood,.271,1.912,.1,.004,.08,.61,black);for(let i=0;i<12;i++)box(hood,-.2+i*.035,1.893,.1,.017,.009,.48,brass);for(const z of [-.14,.34])cylinder(hood,.16,1.887,z,.026,.006,ledMat);obstacle(445,474,.61,2.66);
const ks=at(528,337);ks.name='kitchen-sink-cabinets';box(ks,0,.08,0,1.71,.025,.55,white);for(const x of [-.845,.845])box(ks,x,.105,0,.02,.755,.55,white);box(ks,0,.105,-.265,1.71,.755,.02,white);
// Four countertop strips leave a real opening; basin extends below, not a painted square.
for(const x of [-.5725,.5725])box(ks,x,.86,0,.595,.04,.6,stone);for(const z of [-.2475,.2475])box(ks,0,.86,z,.55,.04,.105,stone);
const sink=new T.Group();sink.name='kitchen-sink';ks.add(sink);const sinkMetal=mat('#949f9d',.24,{metalness:.8});box(sink,0,.711,0,.55,.018,.39,sinkMetal);for(const x of [-.269,.269])box(sink,x,.72,0,.012,.18,.39,sinkMetal);for(const z of [-.189,.189])box(sink,0,.72,z,.54,.18,.012,sinkMetal);cylinder(sink,0,.731,0,.027,.003,brass);cylinder(sink,0,.9,-.23,.018,.31,brass);box(sink,0,1.19,-.14,.035,.03,.2,brass);cylinder(sink,.058,.9,-.23,.012,.075,brass);
for(const x of [-.56,0,.56]){box(ks,x,.08,.282,.551,.74,.018,cabinetFinish);box(ks,x,.73,.295,.18,.012,.012,dark);}box(ks,0,.045,.248,1.65,.06,.014,black);obstacle(528,337,1.74,.6);

// Four functional bands: one recessed upper, workzone, independent drawers, lower doors.
const side=at(985,810,Math.PI);side.name='flush-sideboard';
box(side,0,.08,-.282,3.9,2.69,.026,walnut);box(side,0,0,-.04,3.8,.08,.5,black);
const doorCenters=[-1.625,-.975,-.325,.325,.975,1.625];
const baseStorage=new T.Group();baseStorage.name='sideboard-base-storage';side.add(baseStorage);
box(baseStorage,0,.08,-.01,3.9,.018,.55,walnut);
box(baseStorage,0,.818,-.02,3.9,.018,.53,walnut);
box(baseStorage,0,.618,-.02,3.9,.018,.53,walnut);
for(const x of [-1.94,-1.30,-.65,0,.65,1.30,1.94])box(baseStorage,x,.098,-.02,.018,.72,.53,walnut);
const drawers=new T.Group();drawers.name='sideboard-drawer-bank';side.add(drawers);
// A real 22 mm thick door with a 45-degree sloped top edge, not an added handle.
for(const band of [{id:'base',bottom:.09,top:.602,parent:baseStorage},{id:'drawer',bottom:.64,top:.842,parent:drawers}])for(const [i,x] of doorCenters.entries()){
 const w=.646,bottom=band.bottom,back=.274,front=.296,top=band.top;
 const profile=new T.Shape();profile.moveTo(bottom,back);profile.lineTo(bottom,front);profile.lineTo(top-.022,front);profile.lineTo(top,back);profile.closePath();
 const geometry=new T.ExtrudeGeometry(profile,{depth:w,bevelEnabled:false});
 const door=new T.Mesh(geometry,cabinetFinish);door.position.x=x-w/2;
 // Right-handed basis: shape x is height, shape y is depth, extrusion z is width.
 const basis=new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(1,0,0));door.quaternion.setFromRotationMatrix(basis);
 door.name='sideboard-'+band.id+'-bevel-'+i;door.castShadow=true;door.receiveShadow=true;
 door.userData={bevelDegrees:45,panelThickness:.022,backTop:top,frontTop:top-.022,gripBackClearance:.029};band.parent.add(door);
 if(band.id==='drawer'){
  const tray=new T.Group();tray.name='sideboard-drawer-tray-'+i;drawers.add(tray);
  box(tray,x,.651,-.01,.588,.012,.48,walnut);
  for(const dx of [-.288,.288])box(tray,x+dx,.663,-.01,.012,.13,.48,walnut);
  for(const z of [-.244,.224])box(tray,x,.663,z,.576,.13,.012,walnut);
  tray.userData={storage:'cutlery-and-small-items',slideSelection:'pending',openingTravelVerified:false};
 }
}
const upperRows=[{id:'upper',bottom:1.775,doorBottom:1.75,top:2.77}];
for(const row of upperRows){
 const group=new T.Group();group.name='sideboard-'+row.id+'-storage';side.add(group);
 box(group,0,row.bottom,-.1395,3.9,.018,.299,walnut).name='sideboard-'+row.id+'-bottom';
 box(group,0,row.top-.018,-.135,3.9,.018,.32,walnut);
 for(const x of [-1.94,-1.30,-.65,0,.65,1.30,1.94])box(group,x,row.bottom+.018,-.135,.018,row.top-row.bottom-.036,.32,walnut);
 for(const [i,x] of doorCenters.entries()){
  const door=box(group,x,row.doorBottom,.045,.646,row.top-row.doorBottom-.004,.020,cabinetFinish);door.name='sideboard-'+row.id+'-extended-door-'+i;
  door.userData={extensionBelowCarcass:.025,opening:'manual-under-edge',externalPull:false,pushLatch:false};
 }
 group.userData={finishedDepth:.35,doorFront:.055,extension:.025};
}
const beverage=new T.Group();beverage.name='sideboard-open-workzone';side.add(beverage);
box(beverage,-.325,.905,-.254,3.244,.84,.015,walnut);
box(side,0,.87,.005,3.9,.035,.6,stone).name='sideboard-600mm-worktop';
box(beverage,-.325,1.771,-.02,3.16,.008,.012,ledMat).name='sideboard-recessed-task-light';
// The service pier remains cabinet-integrated; the appliance front stays flush.
for(const x of [1.36,1.89]){box(side,x,.905,0,.12,.845,.56,walnut);box(side,x,.905,.285,.116,.845,.022,cabinetFinish);}
box(side,1.625,1.735,0,.65,.015,.56,walnut);
side.userData={scheme:'upper-workzone-drawers-base',zones:['recessed-upper','600mm-workzone','independent-drawers','beveled-base'],counterDepth:.6,upperDepth:.35,upperSetback:.25,doorExtension:.025,lowerBevelDegrees:45,externalPulls:false,pushLatches:false,installationVerified:false};
// Pipe-fed dispenser: body behind the door plane; flush controls above a recessed cup well.
const dispenserBody=box(side,1.625,1.28,.135,.38,.44,.28,black);dispenserBody.name='dispenser-concealed-body';
const dispenserFace=box(side,1.625,1.28,.290,.398,.455,.012,black);dispenserFace.name='dispenser-flush-face';
plaque(side,1.625,1.55,.2962,.24,.12,'45°C');
box(side,1.625,.94,-.005,.4,.34,.018,black);
for(const x of [1.432,1.818])box(side,x,.94,.135,.014,.34,.29,black);
box(side,1.625,.942,.145,.4,.02,.302,black);
for(let i=0;i<9;i++)box(side,1.465+i*.04,.963,.19,.016,.003,.14,brass);
cylinder(side,1.625,1.21,.22,.013,.07,brass);
cylinder(side,1.625,.965,.18,.038,.09,linen);
// Countertop espresso unit: metal fascia, buttons, group head, portafilter and steam wand.
const espresso=new T.Group();espresso.name='espresso-machine';espresso.position.set(.43,.907,-.04);side.add(espresso);
const brushedSteel=new T.MeshPhysicalMaterial({color:'#bfc2bc',metalness:.8,roughness:.25});
const coffeeBody=new T.Mesh(new RoundedBoxGeometry(.29,.34,.30,3,.018),black);coffeeBody.position.y=.17;espresso.add(coffeeBody);
box(espresso,0,.19,.152,.255,.13,.008,brushedSteel);box(espresso,0,.02,.13,.265,.022,.13,brushedSteel);
for(let i=0;i<10;i++)box(espresso,-.114+i*.025,.043,.125,.006,.003,.12,black);
for(const x of [-.074,0,.074]){const knob=new T.Mesh(new T.CylinderGeometry(.018,.018,.008,24),brass);knob.rotation.x=Math.PI/2;knob.position.set(x,.268,.161);espresso.add(knob);}
cylinder(espresso,0,.164,.17,.031,.037,brushedSteel);box(espresso,.045,.175,.197,.11,.016,.019,black);
const wand=new T.CatmullRomCurve3([new T.Vector3(-.1,.20,.16),new T.Vector3(-.14,.15,.19),new T.Vector3(-.14,.07,.2)]);espresso.add(new T.Mesh(new T.TubeGeometry(wand,12,.006,8,false),brushedSteel));
const cupProfile=[new T.Vector2(.029,0),new T.Vector2(.037,.065),new T.Vector2(.033,.065),new T.Vector2(.026,.007),new T.Vector2(0,.007)];const cup=new T.Mesh(new T.LatheGeometry(cupProfile,32),linen);cup.position.set(0,.045,.17);espresso.add(cup);
const cupHandle=new T.Mesh(new T.TorusGeometry(.024,.005,10,24),linen);cupHandle.position.set(.036,.08,.17);espresso.add(cupHandle);
// A restrained timber tray and two ceramic canisters keep the working niche legible.
softBox(side,-.83,.907,.0,.52,.025,.30,.035,walnut);for(const x of [-.95,-.71]){cylinder(side,x,.932,0,.073,.14,linen);cylinder(side,x,1.072,0,.076,.014,oak);}
registerFurniture(side,'餐边柜');
// Matching panel-ready refrigerator; the appliance body sits inside the cabinet enclosure.
const fridge=at(661,354,Math.PI/2);fridge.name='integrated-fridge';
for(const x of [-.478,.478])box(fridge,x,.08,-.03,.024,2.69,.62,cabinetFinish);
box(fridge,0,.08,-.331,.94,2.69,.018,walnut);box(fridge,0,2.1,-.03,.932,.67,.62,walnut);box(fridge,0,2.105,.285,.927,.66,.024,cabinetFinish);
box(fridge,0,.095,-.018,.918,2,.57,black);
const fridgeMetal=new T.MeshPhysicalMaterial({color:'#a5a8a4',metalness:.72,roughness:.29,clearcoat:.15,clearcoatRoughness:.35});
for(const [y,h] of [[.12,.735],[.876,1.155]])for(const x of [-.229,.229]){const panel=new T.Mesh(new RoundedBoxGeometry(.452,h,.038,3,.007),fridgeMetal);panel.position.set(x,y+h/2,.28);panel.name='fridge-appliance-door';panel.castShadow=true;panel.receiveShadow=true;fridge.add(panel);}
box(fridge,0,.857,.276,.886,.016,.028,black);for(const x of [-.225,.225])box(fridge,x,.882,.293,.35,.008,.008,dark);
const fridgeDisplay=box(fridge,.23,1.56,.301,.067,.22,.003,black);fridgeDisplay.name='fridge-temperature-display';plaque(fridge,.23,1.687,.303,.048,.025,'04°');plaque(fridge,.23,1.624,.303,.048,.025,'−18°');
for(let i=0;i<22;i++)box(fridge,-.42+i*.04,.084,.283,.023,.024,.014,black);
registerFurniture(fridge,'厨房旁冰箱柜');
function stool(parent,x,z){
 const g=new T.Group();g.name='upholstered-counter-stool';g.position.set(x,0,z);parent.add(g);
 for(const xx of [-1,1])for(const zz of [-1,1]){const a=new T.Vector3(xx*.155,.02,zz*.155),b=new T.Vector3(xx*.125,.62,zz*.125),leg=new T.Mesh(new T.CylinderGeometry(.011,.016,a.distanceTo(b),16),dark);leg.position.copy(a).add(b).multiplyScalar(.5);leg.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());leg.castShadow=true;g.add(leg);}
 const foot=new T.Mesh(new T.TorusGeometry(.15,.009,12,48),brass);foot.rotation.x=Math.PI/2;foot.position.y=.24;g.add(foot);
 ellipsoid(g,0,.622,0,.42,.048,.42,walnut);ellipsoid(g,0,.657,0,.425,.085,.42,linen);
 softBox(g,0,.68,.169,.34,.18,.065,.03,fabric);
}
const dining=at(772.5,480);dining.name='stone-island';
softBox(dining,0,.1,0,.77,.77,1.44,.11,walnut);softBox(dining,0,.88,0,.95,.065,2.2,.14,stone);
for(const z of [-.35,.35])box(dining,.388,.14,z,.018,.69,.686,walnut);
cylinder(dining,0,.945,0,.09,.19,mat('#787b70'));registerFurniture(dining,'岛台');
for(const [i,z] of [-1.20,1.20].entries()){const seat=at(772.5,480+z*100,z<0?Math.PI:0);seat.name='dining-daily-seat-'+i;stool(seat,0,0);registerFurniture(seat,'岛台座椅');}
const [dx,dz]=P([772.5,480]);box(house,dx,2.19,dz,.028,.045,1.55,black);box(house,dx,2.187,dz,.016,.008,1.48,ledMat);for(const zz of [-.55,.55])cylinder(house,dx,2.235,dz+zz,.005,.565,black);

// Living area: 3.0 m sofa faces the east TV partition; 85 inch screen is physically sized.
const sofa=at(960.5,515,Math.PI/2);sofa.name='linen-sofa';
softBox(sofa,0,.08,0,3.05,.25,.91,.14,fabric);softBox(sofa,0,.3,-.33,3.05,.38,.22,.10,linen);
for(const x of [-.7,.7])softBox(sofa,x,.32,.06,1.37,.18,.65,.12,linen);
for(const x of [-1.46,1.46])softBox(sofa,x,.29,0,.13,.25,.89,.06,linen);
for(const x of [-.87,.85]){const cushion=ellipsoid(sofa,x,.61,-.21,.57,.37,.16,mat(x<0?'#9b998b':'#a9967e'));cushion.rotation.z=x<0?.14:-.16;}
registerFurniture(sofa,'沙发');
const rug=at(1082,506);rug.name='living-area-rug';softBox(rug,0,.018,0,2.38,.008,3.45,.09,mat('#cbc7bb'));
const coffee=at(1069,495);coffee.name='slim-coffee-table';softBox(coffee,0,.30,0,.44,.035,.78,.18,stone);softBox(coffee,0,.07,0,.24,.23,.48,.10,walnut);registerFurniture(coffee,'茶几');
// Full-height architectural lining; structural wall remains unchanged behind it.
// Equipment and wiring sit behind the lining; the screen is flush with the finished face.
const tv=at(1214,486,-Math.PI/2);tv.name='recessed-tv-black-side-reveals';
const facadeFront=-.12,screenFront=-.12,cavityBack=-.23;
box(tv,0,.02,-.23,3.8,2.76,.025,black);
const tvFacades=[];
// Shallow lining stays in front of the unchanged structural backing.
// Installation depth/ventilation must be checked against the selected television.
for(const x of [-1.5,1.5])tvFacades.push(box(tv,x,.025,-.18,.8,2.75,.12,white));
tvFacades.push(box(tv,0,.025,-.18,2.2,.815,.12,white),box(tv,0,2.04,-.18,2.2,.735,.12,white));
box(tv,0,.84,cavityBack,2.2,1.2,.022,black);
for(const x of [-1.03,1.03])box(tv,x,.84,-.18,.14,1.2,.12,black);
box(tv,0,.84,-.18,1.92,.025,.12,black);box(tv,0,2.015,-.18,1.92,.025,.12,black);
box(tv,0,.89,-.154,1.915,1.1,.06,black);
const artCanvas=document.createElement('canvas');artCanvas.width=1024;artCanvas.height=576;
const art=artCanvas.getContext('2d');art.fillStyle='#263733';art.fillRect(0,0,1024,576);art.fillStyle='#9c9c7c';art.beginPath();art.arc(720,177,68,0,Math.PI*2);art.fill();
for(let layer=0;layer<3;layer++){art.fillStyle=['#536a60','#405a50','#32463f'][layer];art.beginPath();art.moveTo(0,576);for(let x=0;x<=1024;x+=16)art.lineTo(x,330+layer*65+Math.sin(x*.005+layer)*58);art.lineTo(1024,576);art.fill();}
art.fillStyle='#d0d0b5';art.font='14px sans-serif';art.fillText('LAKESIDE  /  GALLERY',42,530);
const artMap=new T.CanvasTexture(artCanvas);artMap.colorSpace=T.SRGBColorSpace;
const screen=new T.Mesh(new T.PlaneGeometry(notes.tv.width,notes.tv.height),new T.MeshStandardMaterial({map:artMap,roughness:.38,emissive:'#537064',emissiveIntensity:.12}));screen.position.set(0,1.44,screenFront);screen.name='85-inch-screen';tv.add(screen);
// A low, real-depth console leaves 250 mm at both wall ends; no tall display towers.
const consoleUnit=new T.Group();consoleUnit.name='tv-low-console';tv.add(consoleUnit);
box(consoleUnit,0,.18,.04,3.30,.28,.38,walnut);
for(const x of [-1.2375,-.4125,.4125,1.2375])box(consoleUnit,x,.191,.231,.82,.258,.018,white);
box(consoleUnit,0,.46,.04,3.30,.018,.38,stone).name='tv-console-top';
box(consoleUnit,0,.176,.13,3.12,.006,.025,ledMat).name='tv-console-soft-light';
for(const side of [-1,1]){
 const decor=new T.Group();decor.name=side<0?'tv-decor-lake-side':'tv-decor-dining-side';tv.add(decor);
 if(side<0){
  const profile=[[.048,0],[.079,.04],[.071,.15],[.031,.21],[.032,.25],[.024,.25],[.023,.214]];
  const vase=new T.Mesh(new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),48),mat('#c8c1b4'));vase.position.set(-1.36,.478,.025);vase.castShadow=true;decor.add(vase);
  ellipsoid(decor,-1.13,.516,.07,.13,.076,.11,mat('#7a8172'));
 }else{
  for(let i=0;i<2;i++)box(decor,1.31,.478+i*.027,.035,.31,.025,.19,i?linen:oak);
  const ring=new T.Mesh(new T.TorusGeometry(.064,.016,16,40),mat('#737b6c'));ring.position.set(1.36,.61,.035);ring.castShadow=true;decor.add(ring);
 }
}
tv.userData={scheme:'quiet-horizontal',liningDepth:.12,consoleWidth:3.3,consoleDepth:.38,structuralCut:false,productInstallationVerified:false};
registerFurniture(tv,'电视装饰墙与矮柜');
// Detailed indoor supply, return and service hatch are built in services.js.
function lounge(px,py,rotation){const g=at(px,py,rotation);cylinder(g,0,.08,0,.35,.19,oak);ellipsoid(g,0,.42,0,.82,.34,.8,fabric);ellipsoid(g,0,.7,-.27,.83,.66,.25,linen);}
// User-confirmed structural column retained; its final dimensions await a site measurement.
const col=notes.column,column=at(...col.point);column.name='retained-balcony-column';column.userData={width:col.width,depth:col.depth,dimensionStatus:'placeholder',removalAllowed:false};box(column,0,0,0,col.width,2.8,col.depth,stone);
box(column,0,0,col.depth/2+.005,col.width-.024,2.8,.01,walnut);
box(column,-col.width/2+.008,0,col.depth/2+.01,.008,2.78,.006,black);obstacle(...col.point,col.width+.03,col.depth+.03);
// Extend along the lake glazing (x), not into the room (z); match the column's depth.
for(const direction of [-1,1]){
 const barX=col.point[0]+direction*(col.width*50+col.barLength*50);
 const bar=at(barX,col.point[1]);bar.name=direction<0?'lake-bar-left':'lake-bar-right';
 softBox(bar,0,col.height-.055,0,col.barLength,.055,col.depth,.025,stone);
 box(bar,direction*(col.barLength/2-.04),.015,0,.04,col.height-.07,col.depth-.06,dark);
 // Concealed warm strip and a foot rail stay within the existing tabletop footprint.
 const strip=box(bar,0,col.height-.064,col.depth/2-.028,col.barLength-.12,.009,.014,ledMat);strip.name='bar-concealed-light';
 const rail=new T.Mesh(new T.CylinderGeometry(.013,.013,col.barLength-.16,16),dark);rail.rotation.z=Math.PI/2;rail.position.set(0,.28,col.depth/2-.035);rail.name='bar-footrail';bar.add(rail);
 for(const x of [-col.barLength/2+.08,col.barLength/2-.08])box(bar,x,.275,col.depth/2-.075,.022,.022,.10,dark);
 obstacle(barX,col.point[1],col.barLength,col.depth);
 for(const x of direction>0?barSeating.right:barSeating.left){stool(bar,x,barSeating.storedZ);obstacle(barX+x*100,col.point[1]+barSeating.storedZ*100,.43,.43);}
 // Small everyday objects stay wholly on the retained desktop.
 const cupX=direction*.57;
 const profile=[new T.Vector2(.028,0),new T.Vector2(.04,.082),new T.Vector2(.036,.082),new T.Vector2(.024,.008),new T.Vector2(0,.008)];
 const mug=new T.Mesh(new T.LatheGeometry(profile,32),linen);mug.position.set(cupX,col.height+.003,.035);mug.castShadow=true;bar.add(mug);
 const handle=new T.Mesh(new T.TorusGeometry(.025,.005,10,24),linen);handle.position.set(cupX+.039,col.height+.046,.035);bar.add(handle);
 cylinder(bar,cupX,col.height+.067,.035,.033,.002,mat('#37261c',.2));
 softBox(bar,-direction*.55,col.height+.002,-.02,.24,.014,.17,.006,oak);
 softBox(bar,-direction*.55,col.height+.016,-.02,.23,.008,.165,.003,linen);
}
const laundry=buildLaundry({T,at,box,cylinder,mat,softBox,plaque,registerFurniture,white,walnut,cabinetFinish,dark,black,brass,ledMat,linen});
// Entry storage, bench and wall mirror; maintain a clear central entry corridor.
const shoes=at(588,813,Math.PI);shoes.name='flush-entry-cabinet';
// Stop the carcass at 2.60 m, below the crossing 2.62 m ceiling trim.
// Final top infill requires a measured ceiling; no cabinet/ceiling interpenetration.
box(shoes,0,.16,-.22,1.6,2.44,.025,walnut);
for(const x of [-.79,0,.79])box(shoes,x,.17,0,.018,2.43,.44,walnut);
for(const y of [.17,.38,.59,.80,1.01,1.25,1.62,2.0,2.40,2.582])box(shoes,-.4,y,0,.782,.018,.418,walnut);
for(const y of [.17,.50,.882,1.46,1.86,2.28,2.582])box(shoes,.4,y,0,.782,.018,.418,walnut);
box(shoes,-.4,.17,.23,.792,2.43,.018,cabinetFinish).name='entry-door-tall';
box(shoes,.4,.17,.23,.792,.718,.018,cabinetFinish).name='entry-door-lower';box(shoes,.4,1.46,.23,.792,1.14,.018,cabinetFinish).name='entry-door-upper';
box(shoes,.4,.9,.005,.794,.028,.47,stone);box(shoes,.4,1.448,.205,.76,.009,.02,ledMat);
box(shoes,0,.155,.19,1.5,.009,.025,ledMat);registerFurniture(shoes,'玄关鞋柜');
const bench=at(451,808);bench.name='entry-shoe-bench';for(const x of [-.45,.45])box(bench,x,.02,0,.04,.4,.43,oak);box(bench,0,.03,0,.88,.035,.40,oak);box(bench,0,.40,0,.94,.025,.43,oak);box(bench,0,.42,0,.97,.055,.44,fabric);obstacle(451,808,.97,.44);
const mirror=at(451,833,Math.PI);mirror.name='entry-dressing-mirror';box(mirror,0,.72,0,.78,1.6,.03,mat('#adc0bb',.05,{metalness:.8}));
const entryEnsemble=new T.Group();entryEnsemble.name='entry-storage-ensemble';furn.add(entryEnsemble);entryEnsemble.add(shoes,bench,mirror);
buildEverydayDetails({T,house,shoes,bench,coffee,dining,b1desk,desk,sofa,mat,box,cylinder,softBox,ellipsoid,walnut,linen,brass,black});
const acceptedElderMain=applyAcceptedElderOnly(house);for(const o of [acceptedElderMain.elder.group,acceptedElderMain.elderWardrobe.group,acceptedElderMain.bay,...acceptedElderMain.root.children.filter(o=>o.name.startsWith('bed1-nightstand'))])registerFurniture(o,o.name);


// Two real bathroom layouts, each with toilet, shower screen, and vanity.
function toilet(px,py,rotation=0){const g=at(px,py,rotation);ellipsoid(g,0,.2,.07,.36,.38,.53,white);ellipsoid(g,0,.43,.08,.39,.1,.56,white);ellipsoid(g,0,.48,.08,.25,.015,.34,mat('#858d85'));box(g,0,.24,-.26,.4,.55,.15,white);for(const x of [-.032,.032])cylinder(g,x,.792,-.26,.025,.004,brass);obstacle(px,py,.45,.68);return g;}
function squatToilet(px,py){
 const g=at(px,py);g.name='bath1-squat-pan';
 const ceramic=mat('#f4f3ee',.2,{side:T.DoubleSide}),shape=new T.Shape();
 shape.moveTo(-.28,-.36);shape.lineTo(.28,-.36);shape.lineTo(.28,.36);shape.lineTo(-.28,.36);shape.closePath();
 const hole=new T.Path();hole.absellipse(0,0,.1302,.2562,0,Math.PI*2,true,0);shape.holes.push(hole);
 const rim=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:false,curveSegments:48}),ceramic);rim.rotation.x=-Math.PI/2;rim.position.y=.007;rim.name='bath1-squat-rim';g.add(rim);
 const profile=[[.052,-.18],[.058,-.19],[.105,-.15],[.165,-.075],[.21,.025]].map(p=>new T.Vector2(...p));
 const bowl=new T.Mesh(new T.LatheGeometry(profile,64),ceramic);bowl.scale.set(.62,1,1.22);bowl.name='bath1-squat-bowl';g.add(bowl);
 cylinder(g,0,-.195,0,.056,.006,black).name='bath1-squat-drain-placeholder';
 for(const x of [-.21,.21]){box(g,x,.025,0,.115,.007,.46,ceramic);for(let i=0;i<9;i++)box(g,x,.032,-.19+i*.0475,.098,.003,.006,ceramic);}
 ellipsoid(g,0,.041,-.292,.29,.11,.12,ceramic).name='bath1-squat-front-hood';
 const flush=new T.Group();flush.name='bath1-squat-flush';g.add(flush);
 box(flush,0,.85,.295,.4,.42,.13,white);box(flush,0,1.272,.295,.08,.012,.032,brass);cylinder(flush,0,.035,.295,.021,.815,white);
 g.userData={fixture:'squat-toilet',faceToward:'entrance / negative-z',outerSize:[.56,.72],recessDepth:.195,installationVerified:false,drainAndTrap:'pending',warning:'下沉深度仅表现盆体；未确认现场沉箱、存水弯及排污口，禁止据此凿楼板'};
 obstacle(px,py,.56,.72);return g;
}
function vanity(px,py,w,rotation=0){const g=at(px,py,rotation);box(g,0,.24,0,w,.57,.46,oak);for(const y of [.25,.53]){box(g,0,y,.237,w-.014,.266,.012,cabinetFinish);box(g,0,y+.24,.245,w*.65,.012,.008,dark);}box(g,0,.81,0,w+.03,.055,.49,stone);ellipsoid(g,0,.869,0,.43,.07,.32,white);ellipsoid(g,0,.9,0,.32,.02,.22,mat('#a0aaa1'));cylinder(g,0,.86,-.17,.013,.22,brass);box(g,0,1.04,-.12,.028,.03,.12,brass);box(g,0,1.13,-.25,w*.84,.9,.023,mat('#a8b8b1',.09,{metalness:.75}));for(const x of [-w*.42,w*.42])box(g,x,1.14,-.234,.008,.88,.009,ledMat);cylinder(g,-w*.36,.866,.08,.025,.105,mat('#737f73'));box(g,-w*.36,.973,.08,.045,.012,.013,black);return g;}
function shower(px,py,w=.85,d=.95,frontEntry=false){const root=at(px,py);box(root,w/2,0,0,.018,2.15,d,glass);const g=new T.Group();root.add(g);if(frontEntry){
 g.rotation.y=Math.PI;
 const door=new T.Group();door.name='bath1-shower-door';door.position.set(-w/2+.012,0,-d/2);door.rotation.y=-Math.PI/2;root.add(door);
 box(door,(w-.04)/2,.015,0,w-.04,2.115,.012,glass);for(const y of [.25,1.85])box(door,.01,y,.012,.04,.055,.025,brass);box(door,w-.15,1.0,.025,.025,.22,.028,dark);
 for(const x of [-w/2,w/2])box(root,x,0,-d/2,.018,2.16,.02,brass);
 root.userData={entry:'north / toward bathroom entrance',clearOpening:w-.058,glassDoorAngle:90,doorSwing:'inside shower',drainLocation:'概念示意；现场排水、防水、玻璃五金与窗扇开启待核实'};
 }else box(root,0,0,d/2,w,2.15,.018,glass);
 cylinder(g,-w/2+.1,.85,-d/2+.04,.014,1.27,dark);box(g,-w/2+.1,2.05,-d/2+.17,.04,.04,.28,dark);box(g,-w/2+.1,2.03,-d/2+.3,.2,.025,.2,dark);
 box(g,-w/2+.16,1.03,-d/2+.07,.23,.05,.055,brass);const hose=new T.CatmullRomCurve3([new T.Vector3(-w/2+.22,1.03,-d/2+.10),new T.Vector3(-w/2+.32,.69,-d/2+.13),new T.Vector3(-w/2+.25,1.45,-d/2+.11)]);g.add(new T.Mesh(new T.TubeGeometry(hose,28,.008,8,false),brass));box(g,-w/2+.25,1.43,-d/2+.11,.055,.15,.026,dark);
 box(g,0,.014,-d/2+.1,w*.63,.008,.07,brass);for(let i=0;i<12;i++)box(g,-w*.28+i*w*.05,.023,-d/2+.1,.012,.003,.049,black);
 if(!frontEntry){for(const y of [.25,1.85])box(g,-w*.38,y,d/2+.007,.04,.055,.018,brass);box(g,w*.23,1.0,d/2-.018,.026,.22,.027,dark);root.userData={glassDoorOperation:'示意未验证',drainLocation:'示意，待核对现有排水'};}return root;}
shower(170,790,.86,.87,true).name='bath1-shower';squatToilet(259,799);vanity(355,802,.62,Math.PI).name='bath1-vanity';
shower(1322,260,1.04,.95).name='bath2-shower';toilet(1418,249).name='bath2-toilet';
// Concept correction: mirror backs onto the existing left wall; cabinet faces
// the bathroom, not the wall gap. No wall, doorway or drain position is changed.
const masterVanity=vanity(1295,356,.64,Math.PI/2);masterVanity.name='bath2-vanity';
masterVanity.userData={layoutStatus:'朝向修正方案，非安装复尺',front:'positive-x',counterSize:[.67,.49],installationVerified:false,plumbing:'原给排水点未确认；本次不画接管路线'};
registerFurniture(masterVanity,'主卫浴室柜');
// Public downlights and sink task lights; bedrooms have diffuse main lights, baths use heater panels.
for(const [x,y] of [[728,781],[766,520],[1030,425],[1000,275],[1120,575],[1120,470],[487,351],[570,351],[1325,744],[557,755]])downlight(x,y);
for(const spec of ceilingFixtures)ceilingLight(spec);
plant(706,213,.2);plant(1551,452,.13);

// Procedural fallback landscape, hidden after the local CC0 lake HDR loads.
const outside=new T.Group();scene.add(outside);
box(outside,9,-.28,4,22,.12,12,mat('#c5c1ac'));
const lakeMaterial=mat('#739da3',.23,{metalness:.25});const lake=box(outside,9,-.48,-62,220,.1,140,lakeMaterial);
let rng=231;const random=()=>{rng=(rng*16807)%2147483647;return rng/2147483647;};
for(let i=0;i<180;i++){const line=box(outside,-75+random()*170,-.41,-4-random()*125,.4+random()*3,.009,.012,mat(i%2?'#a3bdba':'#719ba0'));}
for(let layer=0;layer<3;layer++){const shape=new T.Shape();shape.moveTo(-110,0);for(let i=0;i<30;i++)shape.lineTo(-110+i*8,1.5+random()*7-layer);shape.lineTo(130,0);shape.closePath();const mesh=new T.Mesh(new T.ShapeGeometry(shape),mat(['#a8bfb7','#8ca9a0','#6f9387'][layer],1,{side:T.DoubleSide}));mesh.position.set(8,-.45,-110+layer*18);outside.add(mesh);}
const hemi=new T.HemisphereLight('#eef2ef','#b9b6af',2.4);scene.add(hemi);
const sun=new T.DirectionalLight('#fff0d5',3.1);sun.position.set(-8,18,-12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:.1,far:65});sun.target.position.set(9,0,3);scene.add(sun,sun.target);sun.shadow.bias=-.0003;sun.shadow.normalBias=.035;
const indoor=[];for(const [px,py] of [[845,435],[1055,607],[240,490],[1650,350],[1640,701],[520,480],[1360,280],[220,755]]){const [x,z]=P([px,py]);const light=new T.PointLight('#ffe8bc',4,8,2);light.position.set(x,2.55,z);indoor.push(light);scene.add(light);}
const services=buildServices({T,scene,house,ceilingGroup,rooms,P,box,cylinder,mat,white,black,ledMat,hemi,sun,indoor,inspect:(id,p)=>{goRoom(id);const look=id==='bath1'?[227,701]:id==='bed1'?[390,420]:routeRoom.look;const angle=id==='bath1'?1.15:p;routeRoom={...routeRoom,look,lookPitch:angle};if(!route.length){pitch=angle;const q=P(look);yaw=Math.atan2(q[0]-position.x,-(q[1]-position.z));}}});

// Collision and navigable paths, shared by keyboard motion and room navigation.
const footprint=outline.map(P);
function inside(x,z,poly=footprint){let odd=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])odd=!odd;}return odd;}
function free(x,z,r=.26){if(!inside(x,z)||!inside(x+r,z)||!inside(x-r,z)||!inside(x,z+r)||!inside(x,z-r))return false;return !colliders.some(c=>x>c.x1-r&&x<c.x2+r&&z>c.z1-r&&z<c.z2+r);}
// Measure from rendered furniture bounds and wall faces, independently of walk radius.
// Each audited segment samples transverse net widths at 20 mm intervals.
function netSection(point,axis){const [x,z]=P(point),v=axis==='x'?x:z,q=axis==='x'?z:x;let lo=-Infinity,hi=Infinity;for(const c of colliders){const p1=axis==='x'?c.z1:c.x1,p2=axis==='x'?c.z2:c.x2;if(q<p1-1e-6||q>p2+1e-6)continue;const a=axis==='x'?c.x1:c.z1,b=axis==='x'?c.x2:c.z2;if(v>a+1e-6&&v<b-1e-6)return {width:0,point,axis};if(b<=v)lo=Math.max(lo,b);if(a>=v)hi=Math.min(hi,a);}return {width:hi-lo,lo,hi,point,axis};}
const clearanceChecks=[
 {name:'厨房侧 → 岛台',axis:'x',anchor:680,from:420,to:570,target:.9},
 {name:'岛台 → 沙发背',axis:'x',anchor:860,from:420,to:570,target:.9},
 {name:'客餐厅后方主通道',axis:'z',anchor:730,from:850,to:1150,target:1.0},
 {name:'茶几 → 电视墙通道',axis:'x',anchor:1150,from:450,to:540,target:.9},
 {name:'主卧套间走廊',axis:'x',anchor:1380,from:570,to:645,target:1.0},
 {name:'厨房内部操作通道',axis:'x',anchor:550,from:585,to:620,target:.9}
];
const clearanceAudit=clearanceChecks.map(c=>{let minimum={width:Infinity};for(let p=c.from;p<=c.to;p+=2){const result=netSection(c.axis==='x'?[c.anchor,p]:[p,c.anchor],c.axis);if(result.width<minimum.width)minimum=result;}return {...c,...minimum,mm:Math.round(minimum.width*1000),pass:minimum.width>=c.target-.001};});
const widthLayer=new T.Group();house.add(widthLayer);widthLayer.visible=false;
for(const c of clearanceAudit){if(!Number.isFinite(c.width)||c.width<=0)continue;const [x,z]=P(c.point),a=c.axis==='x'?[c.lo,.06,z]:[x,.06,c.lo],b=c.axis==='x'?[c.hi,.06,z]:[x,.06,c.hi];const material=new T.LineBasicMaterial({color:c.pass?'#50685e':'#a34534'});const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(...a),new T.Vector3(...b)]),material);widthLayer.add(line);for(const v of [a,b])box(widthLayer,v[0],.055,v[2],c.axis==='x'?.018:.2,.016,c.axis==='x'?.2:.018,dark);const badge=new T.Sprite(new T.SpriteMaterial({map:textTexture(`${c.mm} mm`,'#f6f2e9','#35483e'),depthTest:false}));badge.position.set((a[0]+b[0])/2,.13,(a[2]+b[2])/2);badge.scale.set(.95,.24,1);widthLayer.add(badge);}
document.querySelector('#clearanceRows').innerHTML=clearanceAudit.map(c=>`<p><span>${c.name}</span><b style="color:${c.pass?'#526c5a':'#ac4634'}">${c.mm} mm</b></p>`).join('');
const widthTags=document.createElement('div');widthTags.id='widthTags';stage.append(widthTags);
const widthBadges=clearanceAudit.filter(c=>Number.isFinite(c.width)&&c.width>0).map(c=>{const label=document.createElement('div');label.className='dimension-tag';label.textContent=`${c.mm} mm`;widthTags.append(label);const [x,z]=P(c.point);return {label,point:new T.Vector3(c.axis==='x'?(c.lo+c.hi)/2:x,.12,c.axis==='z'?(c.lo+c.hi)/2:z)};});
document.querySelector('#widths').onchange=e=>{widthLayer.visible=e.target.checked;widthTags.style.display=e.target.checked?'block':'none';document.querySelector('#tags').style.visibility=e.target.checked?'hidden':(document.querySelector('#labels').checked?'visible':'hidden');if(e.target.checked){distance=15.7;document.querySelector('#top').click();}};
const step=.14,NX=137,NZ=57;const valid=new Uint8Array(NX*NZ);
for(let iz=0;iz<NZ;iz++)for(let ix=0;ix<NX;ix++)valid[iz*NX+ix]=free(ix*step,iz*step)?1:0;
function nearest(x,z){let best=-1,dist=Infinity;for(let i=0;i<valid.length;i++)if(valid[i]){const d=(i%NX*step-x)**2+(Math.floor(i/NX)*step-z)**2;if(d<dist){best=i;dist=d;}}return best;}
function pathTo(start,end){const s=nearest(...start),e=nearest(...end);if(s<0||e<0)return null;const prev=new Int32Array(valid.length).fill(-1),queue=new Int32Array(valid.length);let head=0,tail=1;queue[0]=s;prev[s]=s;while(head<tail){const cur=queue[head++];if(cur===e)break;for(const n of [cur-1,cur+1,cur-NX,cur+NX]){if(n<0||n>=valid.length||!valid[n]||prev[n]!==-1||Math.abs(n%NX-cur%NX)>1)continue;prev[n]=cur;queue[tail++]=n;}}if(prev[e]===-1)return null;const result=[];for(let n=e;n!==s;n=prev[n])result.push([n%NX*step,Math.floor(n/NX)*step]);return result.reverse();}
let mode='orbit',yaw=0,pitch=0,orbitYaw=.08,orbitPitch=1.08,distance=21,night=false,wallOpacity=.75;
let position=new T.Vector3(...[...P([728,792]).slice(0,1),1.6,P([728,792])[1]]),route=[],routeRoom=null;
const target=new T.Vector3(9,0,3.6),keys=new Set();
function updateMode(){document.body.classList.toggle('walking',mode==='walk');ceilingGroup.visible=mode==='walk';wallGroup.scale.y=mode==='walk'?1:.42;doorObjects.forEach(d=>d.scale.y=mode==='walk'?1:.42);wallMaterial.transparent=mode!=='walk';wallMaterial.opacity=mode==='walk'?1:wallOpacity;wallMaterial.depthWrite=mode==='walk';wallMaterial.needsUpdate=true;document.querySelector('#modeLabel').textContent=mode==='walk'?'拖动环顾 · WASD 行走 · 点击门扇开合':'拖动旋转 · 滚轮缩放 · 墙体剖切显示';document.querySelector('#overview').classList.toggle('selected',mode==='orbit');document.querySelector('#top').classList.toggle('selected',mode==='top');}
function enter(){mode='walk';const v=P([728,792]);const n=nearest(...v);position.set(n%NX*step,1.6,Math.floor(n/NX)*step);yaw=0;pitch=-.04;route=[];routeRoom=null;updateMode();document.querySelector('#roomLabel').textContent='玄关 · 欢迎回家';}
function goRoom(id){const room=rooms.find(r=>r.id===id);if(!room)return;if(mode!=='walk')enter();const result=pathTo([position.x,position.z],P(room.point));if(!result){document.querySelector('#roomLabel').textContent='路线暂不可达，请手动行走';return;}route=result;routeRoom=room;document.querySelector('#roomLabel').textContent='正在前往 '+room.name;document.querySelector('#detailTitle').textContent=room.name;document.querySelector('#detail').textContent=room.description;document.querySelectorAll('#rooms button').forEach(b=>b.classList.toggle('active',b.dataset.id===id));if(!route.length){const q=P(room.look);yaw=Math.atan2(q[0]-position.x,-(q[1]-position.z));document.querySelector('#roomLabel').textContent=room.name;}}
document.querySelector('#rooms').innerHTML=rooms.map(r=>`<button data-id="${r.id}">${r.name}<small>${r.description.split(' · ')[0]}</small></button>`).join('');document.querySelectorAll('#rooms button').forEach(b=>b.onclick=()=>goRoom(b.dataset.id));
document.querySelector('#enter').onclick=enter;document.querySelector('#overview').onclick=()=>{mode='orbit';route=[];updateMode();document.querySelector('#roomLabel').textContent='全屋鸟瞰';};document.querySelector('#top').onclick=()=>{mode='top';route=[];updateMode();document.querySelector('#roomLabel').textContent='俯视布局 · 原图上方朝屏幕上方';};
document.querySelector('#cabinet').onclick=()=>goRoom('cabinet');document.querySelector('#precision').textContent=notes.precision;
const effectsDialog=document.querySelector('#effectsDialog'),effectsFrame=document.querySelector('#effectsFrame');
document.querySelector('#showEffects').onclick=()=>{route=[];keys.clear();if(!effectsFrame.src)effectsFrame.src='./showcase.html'+(new URLSearchParams(location.search).get('space')==='laundry'?'?kind=still&space=laundry':'');effectsDialog.showModal();};
document.querySelector('#closeEffects').onclick=()=>effectsDialog.close();
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===effectsFrame.contentWindow&&e.data?.type==='close-home-effects')effectsDialog.close();});
document.querySelector('#walls').oninput=e=>{wallOpacity=+e.target.value/100;updateMode();};document.querySelector('#night').onchange=e=>{night=e.target.checked;services.setTime(night);};
for(const room of rooms){const label=document.createElement('div');label.className='tag';label.textContent=room.name;label.onclick=()=>goRoom(room.id);document.querySelector('#tags').append(label);roomLabels.push({label,point:new T.Vector3(P(room.point)[0],.15,P(room.point)[1])});}
document.querySelector('#labels').onchange=e=>document.querySelector('#tags').style.visibility=e.target.checked?'visible':'hidden';
let pointer=null,dragDistance=0;canvas.addEventListener('pointerdown',e=>{pointer=[e.clientX,e.clientY];dragDistance=0;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!pointer)return;const dx=e.clientX-pointer[0],dy=e.clientY-pointer[1];dragDistance+=Math.abs(dx)+Math.abs(dy);if(mode==='walk'){yaw+=dx*.004;pitch=T.MathUtils.clamp(pitch-dy*.003,-1.1,1.1);route=[];}else if(mode==='orbit'){orbitYaw-=dx*.005;orbitPitch=T.MathUtils.clamp(orbitPitch+dy*.004,.15,1.5);}pointer=[e.clientX,e.clientY];});
const ray=new T.Raycaster();canvas.addEventListener('pointerup',e=>{pointer=null;if(dragDistance<5){const rect=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObjects(interactive)[0];if(hit){const d=house.getObjectByName(hit.object.userData.doorGroupName);if(d)setDoorLeafOpen(d,!d.userData.open);}}});canvas.addEventListener('pointercancel',()=>pointer=null);
canvas.addEventListener('wheel',e=>{e.preventDefault();if(mode==='orbit')distance=T.MathUtils.clamp(distance+e.deltaY*.012,7,32);else if(mode==='top')distance=T.MathUtils.clamp(distance+e.deltaY*.012,10,32);},{passive:false});
addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){if(e.target.tagName==='INPUT')return;keys.add(e.code);e.preventDefault();route=[];}if(e.code==='Escape'){mode='orbit';route=[];updateMode();}});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>keys.clear());
const keyMap={forward:'KeyW',left:'KeyA',back:'KeyS',right:'KeyD'};for(const b of document.querySelectorAll('[data-move]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(keyMap[b.dataset.move]);route=[];};b.onpointerup=b.onpointercancel=()=>keys.delete(keyMap[b.dataset.move]);}
function move(dx,dz){if(free(position.x+dx,position.z))position.x+=dx;if(free(position.x,position.z+dz))position.z+=dz;}
const map=document.querySelector('#map'),mc=map.getContext('2d'),mapScale=17.5,mapX=12,mapY=12;
function mapPoint([x,z]){return [mapX+x*mapScale,mapY+z*mapScale];}
function drawMap(){mc.clearRect(0,0,map.width,map.height);mc.fillStyle='#e4e1d4';mc.beginPath();footprint.forEach((p,i)=>i?mc.lineTo(...mapPoint(p)):mc.moveTo(...mapPoint(p)));mc.closePath();mc.fill();mc.strokeStyle='#6f7868';mc.lineWidth=2;for(const w of walls){const points=[P(w.a),P(w.b)].map(mapPoint);mc.beginPath();mc.moveTo(...points[0]);mc.lineTo(...points[1]);mc.stroke();}for(const r of rooms){mc.fillStyle='#8e9b7e';mc.beginPath();mc.arc(...mapPoint(P(r.point)),3,0,Math.PI*2);mc.fill();}if(mode==='walk'){const [x,y]=mapPoint([position.x,position.z]);mc.fillStyle='#a34d33';mc.beginPath();mc.arc(x,y,4,0,Math.PI*2);mc.fill();mc.strokeStyle='#a34d33';mc.beginPath();mc.moveTo(x,y);mc.lineTo(x+Math.sin(yaw)*12,y-Math.cos(yaw)*12);mc.stroke();}}
map.onclick=e=>{const rect=map.getBoundingClientRect(),x=(e.clientX-rect.left)*map.width/rect.width,z=(e.clientY-rect.top)*map.height/rect.height;const closest=[...rooms].sort((a,b)=>{const aa=mapPoint(P(a.point)),bb=mapPoint(P(b.point));return Math.hypot(aa[0]-x,aa[1]-z)-Math.hypot(bb[0]-x,bb[1]-z);})[0];goRoom(closest.id);};
const resize=()=>{const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe(stage);resize();
updateMode();services.setScene('home');let last=performance.now();
const fineRenderer=createFineRenderer({renderer,scene,camera,isWalking:()=>mode==='walk',isMoving:()=>route.length>0,ready:()=>scene.userData.realisticReady});
const finishReady=applyRealisticFinishes({renderer,scene,outside,walnut,oak,stone,linen,fabric,floorMaterial,tileMap,glass,hemi,sun,side}).then(()=>{document.querySelector('#renderStatus').textContent='实时漫游 · 实拍材质';services.setTime(night);return true;}).catch(error=>{document.querySelector('#renderStatus').textContent='部分材质加载失败 · 请刷新重试';console.warn(error);return false;});
function tick(dt){
 if(mode==='walk'){
  if(route.length){const [x,z]=route[0],dx=x-position.x,dz=z-position.z,dist=Math.hypot(dx,dz);if(dist<.045)route.shift();else{const stride=Math.min(dist,dt*1.6);move(dx/dist*stride,dz/dist*stride);const desired=Math.atan2(dx,-dz),diff=Math.atan2(Math.sin(desired-yaw),Math.cos(desired-yaw));yaw+=diff*Math.min(dt*6,1);pitch=T.MathUtils.lerp(pitch,-.035,dt*3);}if(!route.length&&routeRoom){const q=P(routeRoom.look);yaw=Math.atan2(q[0]-position.x,-(q[1]-position.z));document.querySelector('#roomLabel').textContent=routeRoom.name;}}
  if(!route.length&&routeRoom?.lookPitch!==undefined){pitch=routeRoom.lookPitch;routeRoom={...routeRoom,lookPitch:undefined};}
  const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),strafe=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);const k=dt*1.8/Math.max(1,Math.hypot(forward,strafe));move((Math.sin(yaw)*forward+Math.cos(yaw)*strafe)*k,(-Math.cos(yaw)*forward+Math.sin(yaw)*strafe)*k);camera.position.copy(position);camera.rotation.set(pitch,-yaw,0,'YXZ');
 }else{const angle=mode==='top'?Math.PI/2-.001:orbitPitch,az=mode==='top'?0:orbitYaw;const fit=distance*(camera.aspect<1?1/camera.aspect:1);camera.position.set(target.x+Math.sin(az)*Math.cos(angle)*fit,Math.sin(angle)*fit,target.z+Math.cos(az)*Math.cos(angle)*fit);camera.lookAt(target);}
 for(const {label,point} of roomLabels){const q=point.clone().project(camera);label.style.left=((q.x*.5+.5)*stage.clientWidth)+'px';label.style.top=((-q.y*.5+.5)*stage.clientHeight)+'px';label.style.display=q.z>1?'none':'block';}
 for(const {label,point} of widthBadges){const q=point.clone().project(camera);label.style.left=((q.x*.5+.5)*stage.clientWidth)+'px';label.style.top=((-q.y*.5+.5)*stage.clientHeight)+'px';label.style.display=q.z>1?'none':'block';}
 services.tick(camera);
}
function animate(now){requestAnimationFrame(animate);const elapsed=Math.min((now-last)/1000,.25);last=now;if(effectsDialog.open)return;const n=Math.max(1,Math.ceil(elapsed/.035));for(let i=0;i<n;i++)tick(elapsed/n);drawMap();if(!fineRenderer.render())renderer.render(scene,camera);
}
const routeAudit=Object.fromEntries(rooms.map(r=>[r.id,Boolean(pathTo(P([728,792]),P(r.point)))]));
window.homeDebug={scene,camera,rooms,colliders,routeAudit,clearanceAudit,widthLayer,tvInsetMm:Math.round((facadeFront-screenFront)*1000),dispenser:{faceInsetMm:Math.round((.296-dispenserFace.position.z-dispenserFace.geometry.parameters.depth/2)*1000),bodyBehindMm:Math.round((.296-dispenserBody.position.z-dispenserBody.geometry.parameters.depth/2)*1000)},free,pathTo,P,enter,goRoom,tick,get state(){return {mode,position:position.toArray(),routeLength:route.length,wallOpacity,night,objects:scene.children.length,meshes:renderer.info.render.triangles};}};
Object.assign(window.homeDebug,{services,ceilingDetails,tilePitch:notes.finishes.tile,hvac:notes.hvac,fineRenderer,finishReady});
Object.assign(window.homeDebug,{doorObjects,setDoorLeafOpen});
const initialParams=new URLSearchParams(location.search);
if(initialParams.get('space')==='laundry'){enter();goRoom('laundry');for(let n=0;n<3000&&route.length;n++)tick(1/30);}
if(initialParams.get('view')==='effects')document.querySelector('#showEffects').click();
document.querySelector('#loading').remove();requestAnimationFrame(animate);
window.addEventListener('error',e=>{console.error('Viewer error:',e.message);});
