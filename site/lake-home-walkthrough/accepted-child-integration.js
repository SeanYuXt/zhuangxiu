import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {layout as d} from './child-original-door-layout.js?v=accepted-94';
import {addComputerZone} from './child-computer-zone.js?v=chair-space-84';
// Furniture from the user-confirmed original-door study, anchored to the PDF room.
export function integrateAcceptedChild(house){
 const obsolete=[];house.traverse(o=>{if(['bed3-bed','bed3-wardrobe','bed3-desk','bed3-desk-everyday','bed3-chair'].includes(o.name))obsolete.push(o);});obsolete.forEach(o=>o.removeFromParent());
 const scene=new T.Group();scene.name='accepted-child-furniture';house.add(scene);
const material=c=>new T.MeshStandardMaterial({color:c,roughness:.85});const white=material('#f0f1ee'),face=material('#e2e5e3'),dark=material('#434c53'),fabric=material('#cbd1d5'),linen=material('#edece8'),wall=material('#f3f2ed');wall.transparent=true;wall.opacity=.3;
function box(name,r,y,h,m=white,p=scene,rad=.006){const o=new T.Mesh(new RoundedBoxGeometry(r[2]-r[0],h,r[3]-r[1],3,rad),m);o.name=name;o.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
const b=d.bed;box('bed-base',b,.18,.16,fabric,scene,.024);box('mattress',[b[0]+.02,b[1]+.04,b[2]-.02,b[3]-.02],.34,.22,linen,scene,.04);box('headboard',[b[0],b[1],b[2],b[1]+.035],.30,.77,fabric,scene,.015);box('duvet',[b[0]+.025,.63,b[2]-.025,2.04],.56,.065,linen,scene,.03);box('throw',[b[0]+.04,1.64,b[2]-.04,2.04],.625,.022,fabric,scene,.01);for(const x of [b[0]+.07,b[0]+.79])box('pillow',[x,.15,x+.61,.54],.56,.12,linen,scene,.045);
const w=d.wardrobe;box('wardrobe-back',[w[0],w[1],w[0]+.018,w[3]],.08,2.42);for(const z of [w[1],w[3]-.018])box('wardrobe-side',[w[0],z,w[2],z+.018],.08,2.42);for(const y of [.08,.90,1.96,2.482])box('wardrobe-shelf',[w[0]+.018,w[1]+.018,w[2]-.05,w[3]-.018],y,.018);
box('wardrobe-middle',[w[0]+.018,.61,w[2]-.05,.628],.098,2.384);for(const z of [.31,.91]){box('pullout-rail',[.045,z-.01,.42,z+.01],1.78,.02,dark);for(let i=0;i<4;i++)box('child-clothes',[.07+i*.08,z-.23,.095+i*.08,z+.23],1.15,.55,i%2?fabric:linen);}
const doors=[];for(const r of [[.478,.025,.50,.625],[.45,.605,.472,1.215]])doors.push(box('wardrobe-sliding-door',r,.10,1.846,face));for(const z of [.025,.625])doors.push(box('wardrobe-upper-door',[.478,z,.50,z+.59],1.982,.50,face));
// Recess the entry display into the existing footprint, not into the 62cm aisle.
const j=d.joinery,e=j.endDisplay;
scene.children.filter(o=>o.name==='wardrobe-side'&&o.position.z>1).forEach(o=>{scene.remove(o);o.geometry.dispose();});
box('entry-end-lower',[0,1.202,.50,1.22],.08,j.endBottom-.08,face);
box('entry-end-upper',[0,1.202,.50,1.22],j.endTop,2.50-j.endTop,face);
box('entry-display-back',[e[0],e[1],e[2],e[1]+.018],j.endBottom,j.endTop-j.endBottom,dark);
for(const x of [e[0]-.018,e[2]])box('entry-display-jamb',[x,e[1],x+.018,1.22],j.endBottom,j.endTop-j.endBottom,white);
for(const y of [j.endBottom,1.57,j.endTop-.018])box('entry-rounded-display-shelf',e,y,.018,white,scene,.008);
// The last hanging bay gives up its rear upper portion to the recessed display.
scene.children.filter(o=>o.name==='child-clothes'&&o.position.z>.6).forEach(o=>{o.scale.z=.30/.46;o.position.z=.82;});
scene.children.filter(o=>o.name==='pullout-rail'&&o.position.z>.6).forEach(o=>o.position.z=.82);
box('display-photo',[.10,1.06,.27,1.075],1.20,.22,white);
box('display-photo-inset',[.115,1.075,.255,1.08],1.215,.19,fabric);
for(let i=0;i<3;i++)box('display-small-books',[.29+i*.035,1.055,.315+i*.035,1.16],1.20,.18,i%2?face:fabric);
const ornament=new T.Mesh(new T.SphereGeometry(.065,24,16),fabric);ornament.position.set(.25,1.653,1.10);scene.add(ornament);
// Main learning surface is perpendicular to the window. No solid bay is counted as knee space.
// One continuous visible profile. Fabrication seams / steel brackets still need detailing.
const topShape=new T.Shape();j.continuousTop.forEach(([x,z],i)=>i?topShape.lineTo(x,-z):topShape.moveTo(x,-z));topShape.closePath();
const topGeometry=new T.ExtrudeGeometry(topShape,{depth:.025,bevelEnabled:false});topGeometry.rotateX(-Math.PI/2);
const continuousTop=new T.Mesh(topGeometry,white);continuousTop.name='continuous-desk-bay-return';continuousTop.position.y=.725;continuousTop.castShadow=continuousTop.receiveShadow=true;scene.add(continuousTop);
for(const x of[3.55,4.00])box('bay-top-support-sleeper',[x,.38,x+.05,1.91],d.sillHeight,.725-d.sillHeight,face);
box('rear-table-support',[2.70,.025,3.46,.045],.695,.03,dark);
box('monitor-foot',[2.88,.13,3.08,.28],.75,.014,dark);box('monitor-neck',[2.975,.16,3.00,.19],.764,.14,dark);box('monitor',[2.715,.13,3.245,.153],.89,.30,dark);box('monitor-screen',[2.73,.153,3.23,.157],.905,.27,material('#8797a2'));
box('keyboard',[2.85,.36,3.19,.50],.75,.012,face);box('mouse',[3.25,.39,3.32,.48],.75,.018,dark);
box('study-upper-back',[2.68,.004,3.48,.022],1.34,1.16,face);for(const y of [1.34,1.95,2.462])box('study-shelf',[2.68,.02,y===1.34?3.28:3.48,.28],y,.018,white);box('study-upper-door',[2.684,.26,3.476,.28],1.973,.485,white);
for(let i=0;i<5;i++)box('study-books',[2.72+i*.035,.045,2.744+i*.035,.21],1.358,.25,i%2?fabric:white);
box('display-frame',[2.99,.04,3.23,.055],1.358,.26,dark);box('display-picture',[3.005,.055,3.215,.059],1.373,.23,linen);
const glow=new T.MeshStandardMaterial({color:'#fff6e7',emissive:'#fff0d9',emissiveIntensity:1});box('desk-light-diffuser',[2.73,.195,3.43,.208],1.333,.007,glow);
// Unified head / study joinery. No new floor furniture or thicker bed headboard.
const h=j.headUpper;
box('head-upper-back',[h[0],h[1],h[2],h[1]+.018],j.headUpperBottom,j.upperTop-j.headUpperBottom,face);
for(const y of [j.headUpperBottom,j.upperTop-.018])box('head-upper-shelf',h,y,.018,white);
const headModules=[h[0],b[0],1.64,2.16,h[2]];for(let i=0;i<headModules.length-1;i++)box('head-upper-front',[headModules[i]+.003,h[3]-.02,headModules[i+1]-.003,h[3]],j.headUpperBottom+.023,j.upperTop-j.headUpperBottom-.044,white);
for(const x of [h[0],h[2]-.018])box('head-upper-end',[x,h[1],x+.018,h[3]],j.headUpperBottom,j.upperTop-j.headUpperBottom,white);
box('ceiling-scribed-filler',[.50,.02,3.48,.28],2.48,.12,white);
const gap=j.gapDisplay;
box('gap-display-back',[gap[0],gap[1],gap[2],gap[1]+.018],j.gapBottom,j.headUpperBottom-j.gapBottom,dark);
for(const x of [gap[0],gap[2]-.018])box('gap-display-upright',[x,gap[1],x+.018,gap[3]],j.gapBottom,j.headUpperBottom-j.gapBottom,white);
for(const y of [j.gapBottom,1.15,1.55])box('gap-display-shelf',gap,y,.022,white);
box('gap-frame',[.61,.055,.86,.072],1.172,.26,white);box('gap-frame-picture',[.63,.072,.84,.075],1.192,.22,fabric);
for(let i=0;i<4;i++)box('gap-books',[.60+i*.045,.055,.63+i*.045,.20],.782,.23,i%2?fabric:face);
const gapObject=new T.Mesh(new T.TorusGeometry(.075,.015,12,32),face);gapObject.position.set(.82,1.68,.10);scene.add(gapObject);
box('gap-display-light',[.54,.055,1.08,.065],1.936,.008,glow);
box('head-wall-finish',[b[0],.003,b[2],.017],1.07,.79,face);
box('head-light-recess',[b[0]+.07,.019,b[2]-.07,.028],1.075,.008,glow);
for(const x of [b[0]+.07,b[2]-.14]){box('flush-bed-switch',[x,.018,x+.07,.024],.94,.07,dark);box('reading-light',[x+.015,.024,x+.045,.052],1.18,.08,dark);}
const f=j.windowShelf;
box('window-pier-book-back',[f[2]-.016,f[1],f[2],f[3]],j.windowBottom,j.windowTop-j.windowBottom,face);
for(const z of [f[1],f[3]-.018])box('window-book-side',[f[0],z,f[2],z+.018],j.windowBottom,j.windowTop-j.windowBottom,white);
for(const y of [j.windowBottom,1.12,1.51,j.windowTop])box('window-pier-book-shelf',f,y,.018,white);
for(let i=0;i<4;i++)box('window-books',[3.31,.06+i*.035,3.455,.083+i*.035],.788,.22,i%2?face:fabric);
box('window-display-frame',[3.445,.09,3.46,.25],1.53,.23,dark);
const far=j.farWindowShelf;
box('far-window-back',[far[2]-.018,far[1],far[2],far[3]],j.farWindowBottom,2.60-j.farWindowBottom,face);
for(const z of [far[1],far[3]-.018])box('far-window-side',[far[0],z,far[2],z+.018],j.farWindowBottom,2.60-j.farWindowBottom,white);
for(const y of [j.farWindowBottom,2.462])box('far-window-shelf',far,y,.018,white);
box('far-window-upper-front',[far[0],far[1]+.022,far[0]+.02,far[3]-.022],1.973,.485,white);
box('far-window-ceiling-filler',far,2.48,.12,white);
box('bay-front-shadowline',[3.500,.64,3.509,1.92],.70,.009,dark);
const dp=j.doorBackPanel,doorBack=box('thin-doorback-panel',dp,j.doorBackBottom,j.doorBackTop-j.doorBackBottom,face);
box('entry-display-strip',[.07,1.055,.42,1.065],1.93,.008,glow);
const chair=new T.Group();scene.add(chair);const c=d.chair,cx=(c[0]+c[2])/2,cz=(c[1]+c[3])/2;box('chair-seat',[c[0]+.035,c[1]+.025,c[2]-.035,c[3]-.045],.43,.065,fabric,chair,.025);box('chair-back',[c[0]+.035,c[3]-.065,c[2]-.035,c[3]-.025],.49,.46,dark,chair,.018);box('chair-lift',[cx-.02,cz-.02,cx+.02,cz+.02],.07,.36,dark,chair);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,o=new T.Mesh(new T.BoxGeometry(.25,.025,.025),dark);o.position.set(cx+Math.cos(a)*.12,.07,cz+Math.sin(a)*.12);o.rotation.y=-a;chair.add(o);}
// 65cm base is a conservative assumed envelope, not a measured chair.
for(const o of chair.children){if(o.geometry.type==='BoxGeometry'){o.scale.x=1.3;o.position.x=cx+(o.position.x-cx)*1.3;o.position.z=cz+(o.position.z-cz)*1.3;}o.position.x-=cx;o.position.z-=cz;}
chair.position.set(cx,0,cz);

 const computerZone=addComputerZone({T,scene,box,d,white,face,dark,fabric,glow,sun:{intensity:0}});
 // Named navigation targets wrap existing meshes, never duplicate furniture.
 const bed=new T.Group();bed.name='bed3-bed';scene.add(bed);
 const wardrobe=new T.Group();wardrobe.name='bed3-wardrobe';scene.add(wardrobe);
 const desk=new T.Group();desk.name='bed3-desk';scene.add(desk);
 for(const o of [...scene.children]){
  if(['bed-base','mattress','headboard','duvet','throw','pillow'].includes(o.name))bed.add(o);
  else if(o.name.startsWith('wardrobe-')||o.name.startsWith('entry-end-')||o.name==='child-clothes'||o.name==='pullout-rail')wardrobe.add(o);
  else if(o.name==='continuous-desk-bay-return'||o.name.startsWith('desk-floor-')||o.name.startsWith('desk-side-'))desk.add(o);
 }
 chair.name='bed3-chair';scene.position.set(14.02,0,4.46);
 return {root:scene,layout:d,bed,wardrobe,desk,chair};
}
