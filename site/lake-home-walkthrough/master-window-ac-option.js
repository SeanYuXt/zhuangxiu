import {mountCenteredDressing} from './master-centered-dressing.js?v=consistent-92';
import {mountImmersive} from './master-immersive.js?v=consistent-92';
import * as T from './vendor/three.module.js';
import {OrbitControls,RoundedBoxGeometry,RectAreaLightUniformsLib} from './vendor/render-libs.js';
import {inside,overlap,doorTip,area} from './master-suite-geometry.js?v=sleep-entry-09';
import {mountProjection} from './master-suite-projection.js?v=closed-taper-52';
import {optionAudit} from './master-window-ac-option-audit.js?v=wc-end-53';
import {mountIntegratedDetails} from './master-suite-integrated-details.js?v=hotel-57';
import {mountServiceAreas} from './master-service-areas.js?v=hotel-57';
import {mountSimpleBath} from './master-simple-bath.js?v=consistent-92';
import {curtainSegments} from './master-bath-corner-geometry.mjs';
const $=q=>document.querySelector(q),s=await fetch('./master-window-ac-option-spec.json?v=consistent-92').then(r=>r.json()),f=s.furniture,opt=s.design.windowOption;
const bathLayout='simple',swappedMode=false,optimizedMode=false,hotelMode=false,cornerMode=false,separateMode=false;
s.design.bath.hotel=true;
const audit=optionAudit(s);if(!audit.ok)throw new Error(audit.errors.join(';'));
const renderer=new T.WebGLRenderer({canvas:$('#scene'),antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e9e5dc');const camera=new T.PerspectiveCamera(47,1,.02,50),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=.7;controls.maxDistance=20;controls.maxPolarAngle=Math.PI*.49;
const ambient=new T.HemisphereLight('#faf8f2','#aca99d',1.7);scene.add(ambient);const sun=new T.DirectionalLight('#fff1db',2.2);sun.position.set(7,8,1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7});sun.shadow.normalBias=.015;scene.add(sun);const fill=new T.DirectionalLight('#e8eeef',.65);fill.position.set(-3,5,6);scene.add(fill);
const M=c=>new T.MeshStandardMaterial({color:c,roughness:.78}),white=M(s.design.palette.white),greige=M('#c4bdb0'),fabric=M(s.design.palette.fabric),dark=M(s.design.palette.dark),metal=M('#656961');const walls=[],doors=[],leaves=[],tags=[],technical=new T.Group();scene.add(technical);
// Deterministic fine woven bump, not a wood-grain texture.
const weaveData=new Uint8Array(64*64*4);
for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4,v=150+Math.round(22*Math.sin(x*Math.PI/2)+18*Math.cos(y*Math.PI/2));weaveData[i]=weaveData[i+1]=weaveData[i+2]=v;weaveData[i+3]=255;}
const weave=new T.DataTexture(weaveData,64,64);weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(18,18);weave.needsUpdate=true;fabric.bumpMap=weave;fabric.bumpScale=.0012;fabric.roughness=.96;
const localLights=new T.Group();localLights.name='room-lighting';scene.add(localLights);
for(const[p,intensity]of[[[3.75,2.40,1.65],7]]){
 const light=new T.PointLight('#ffe3bf',intensity,5,1.8);light.position.set(...p);localLights.add(light);
}
function lighting(){const cinema=$('#screen-mode').value==='down',evening=$('#light-scene').value==='evening'||cinema;ambient.intensity=cinema?.26:evening?.32:1.7;sun.intensity=cinema?.025:evening?.05:2.2;fill.intensity=cinema?.10:evening?.13:.65;localLights.visible=evening&&!cinema;const headLights=scene.getObjectByName('headwall-soft-lighting');if(headLights)headLights.visible=evening&&!cinema;scene.background.set(evening?'#b7b0a5':'#e9e5dc');scene.traverse(o=>{if(['corner-soft-light','mirror-task-light','vanity-canopy-light','bay-reading-light'].includes(o.name))o.visible=!cinema;});}
function roundedFace(name,x,y,z,w,h,d,r,mat,parent=scene){
 const sh=new T.Shape();sh.moveTo(r,0);sh.lineTo(w-r,0);sh.quadraticCurveTo(w,0,w,r);sh.lineTo(w,h-r);sh.quadraticCurveTo(w,h,w-r,h);sh.lineTo(r,h);sh.quadraticCurveTo(0,h,0,h-r);sh.lineTo(0,r);sh.quadraticCurveTo(0,0,r,0);const o=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false,curveSegments:24}),mat);o.name=name;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;
}
function box(name,r,y,h,mat=white,parent=scene,radius=.005){const dx=r[2]-r[0],dz=r[3]-r[1],o=new T.Mesh(new RoundedBoxGeometry(dx,h,dz,3,Math.min(radius,dx/3,dz/3,h/3)),mat);o.name=name;o.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function poly(name,p,y,h,mat){const sh=new T.Shape();p.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);const o=new T.Mesh(g,mat);o.position.y=y;o.name=name;o.receiveShadow=true;scene.add(o);return o;}
function cylinder(x,y,z,r,h,mat=metal,parent=scene){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,24),mat);o.position.set(x,y+h/2,z);o.castShadow=true;parent.add(o);return o;}
function tag(t,x,y,z){const c=document.createElement('canvas');c.width=700;c.height=92;const ctx=c.getContext('2d');ctx.fillStyle='#fbfaf6e8';ctx.fillRect(0,0,700,92);ctx.fillStyle='#4e5749';ctx.font='30px Microsoft YaHei';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,350,46);const tx=new T.CanvasTexture(c),o=new T.Sprite(new T.SpriteMaterial({map:tx,transparent:true,depthTest:false,toneMapped:false}));o.renderOrder=100;o.position.set(x,y,z);o.scale.set(1.7,.224,1);tags.push(o);scene.add(o);}
function segment(w,a,b,y,h,mat){if(b-a<.001||h<=0)return;const l=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),ux=(w.b[0]-w.a[0])/l,uz=(w.b[1]-w.a[1])/l,nx=-uz*w.side*w.thickness,nz=ux*w.side*w.thickness;poly(w.id,[[w.a[0]+ux*a,w.a[1]+uz*a],[w.a[0]+ux*b,w.a[1]+uz*b],[w.a[0]+ux*b+nx,w.a[1]+uz*b+nz],[w.a[0]+ux*a+nx,w.a[1]+uz*a+nz]],y,h,mat);}
for(const sp of s.spaces)poly(sp.id,sp.polygons[0],sp.raised?0:-.06,sp.raised?s.sill:.06,M(sp.raised?'#d5cec1':sp.context?'#d5d5cb':s.design.palette.floor));
const glass=new T.MeshStandardMaterial({color:'#bad0d0',transparent:true,opacity:.20,roughness:.2});
for(const w of s.walls){const m=M('#eeeae0');m.transparent=true;m.opacity=.7;walls.push(m);const len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);let prev=0;for(const op of s.openings.filter(o=>o.wall_id===w.id).sort((a,b)=>a.offset-b.offset)){segment(w,prev,op.offset,0,s.ceiling,m);if(op.kind==='door'){segment(w,op.offset,op.offset+op.width,op.height,s.ceiling-op.height,m);}else{const sill=op.sill??s.sill,top=op.top??s.windowTop;segment(w,op.offset,op.offset+op.width,0,sill,m);segment(w,op.offset,op.offset+op.width,top,s.ceiling-top,m);const narrow={...w,thickness:.018};segment(narrow,op.offset,op.offset+op.width,sill,top-sill,glass);for(const t of [op.offset,op.offset+op.width/2,op.offset+op.width-.022])segment({...w,thickness:.04},t,t+.022,sill,top-sill,metal);segment({...w,thickness:.04},op.offset,op.offset+op.width,sill,.025,metal);segment({...w,thickness:.04},op.offset,op.offset+op.width,top-.025,.025,metal);}prev=op.offset+op.width;}segment(w,prev,len,0,s.ceiling,m);}
for(const d of s.openings.filter(o=>o.kind==='door'&&o.operation!=='sliding')){const g=new T.Group();g.position.set(d.hinge[0],0,d.hinge[1]);scene.add(g);box('original-door',[0,-.022,d.width,.022],0,d.height,M('#a79783'),g);doors.push({g,d});}
// Bed rotates// Original bed-head direction; the frame remains 188 × 200cm.
const b=f.bed.r,bg=new T.Group();bg.position.set(b[0],0,b[1]);bg.rotation.y=0;scene.add(bg);
box('bed-plinth',[.12,.14,1.76,1.89],.07,.15,dark,bg,.03);box('bed-frame',[0,0,1.88,2.00],.22,.12,fabric,bg,.03);box('mattress',[.04,.065,1.84,1.965],.34,.23,white,bg,.04);box('duvet',[.025,.52,1.855,1.98],.56,.08,M('#e6dfd3'),bg,.05);box('throw',[.025,1.39,1.855,1.84],.64,.025,fabric,bg,.015);for(const x of[.12,1.01])box('pillow',[x,.15,x+.73,.54],.56,.13,white,bg,.06);roundedFace('soft-rounded-head',b[0],s.design.bedHead.base,b[1],1.88,s.design.bedHead.height,.08,.09,fabric);
const headStyle=s.design.styling.head;
// Rounded front corners fit entirely inside the 4cm head-wall footprint.
const headProfile=(x0,x1,z0,z1,radius)=>{
 const sh=new T.Shape();sh.moveTo(x0,-z0);sh.lineTo(x1,-z0);sh.lineTo(x1,-(z1-radius));
 sh.quadraticCurveTo(x1,-z1,x1-radius,-z1);sh.lineTo(x0+radius,-z1);
 sh.quadraticCurveTo(x0,-z1,x0,-(z1-radius));sh.closePath();return sh;
};
const headSolid=(name,y,height,z0,z1,radius,material)=>{
 const geo=new T.ExtrudeGeometry(headProfile(headStyle.r[0],headStyle.r[2],z0,z1,radius),{depth:height,bevelEnabled:false,curveSegments:20});
 geo.rotateX(-Math.PI/2);const o=new T.Mesh(geo,material);o.name=name;o.position.y=y;o.castShadow=o.receiveShadow=true;scene.add(o);return o;
};
headSolid('half-height-head-panel',0,1.079,0,.04,headStyle.frontRadius,M(s.design.palette.head));
box('head-upper-finish',[2.15,0,4.95,.002],1.10,s.ceiling-1.10,M(headStyle.upperFinish),scene,.0003);
const hs=headStyle.lightSlot,slot=hs.r;
headSolid('head-half-wall-cap',1.10-hs.lipDrop,hs.lipDrop,.027,.04,.012,M('#c9c1b5'));
box('head-cap-rear',[2.15,0,4.95,.01],1.09,.01,M('#c9c1b5'),scene,.0005);
box('head-led-channel',slot,hs.base,.003,M('#8e8679'),scene,.0003);
box('head-led-opal-diffuser',[slot[0]+.004,.012,slot[2]-.004,.025],hs.base+.004,.003,M('#efe7d5'),scene,.0003);
const headLights=new T.Group();headLights.name='headwall-soft-lighting';scene.add(headLights);
box('headwall-led-emitter',[slot[0]+.004,.012,slot[2]-.004,.025],hs.base+.007,.001,new T.MeshBasicMaterial({color:'#ffe1ac'}),headLights,.0002);
RectAreaLightUniformsLib.init();
const headWash=new T.RectAreaLight('#ffe3b9',3,slot[2]-slot[0]-.008,.012);
headWash.name='headwall-continuous-wash';headWash.position.set((slot[0]+slot[2])/2,1.092,.021);
headWash.lookAt((slot[0]+slot[2])/2,1.42,.004);headLights.add(headWash);
// Exposed ceiling, without a separate floating strip above the bed.
const luminous=new T.MeshStandardMaterial({color:'#fff3d5',emissive:'#ffdb9c',emissiveIntensity:1.1});
cylinder(3.75,2.47,1.65,.32,.055,white);cylinder(3.75,2.455,1.65,.28,.008,luminous);
// One freestanding bedside cabinet; no wall anchors or fixed units on the nursery side.
{
 const a=f.rightTable,r=a.r;
 for(const x of[r[0]+.045,r[2]-.045])for(const z of[r[1]+.045,r[3]-.045])cylinder(x,.015,z,.014,.115,metal);
 box('mobile-bedside-carcass',[r[0],r[1],r[2],r[3]-.022],.115,.419,white,scene,.014);
 box('mobile-bedside-top',r,.534,.016,M('#d3cabd'),scene,.008);
 for(const y of[.13,.332]){
 box('mobile-bedside-drawer',[r[0]+.009,r[3]-.018,r[2]-.009,r[3]],y,.182,white,scene,.008);
 box('mobile-bedside-pull',[r[0]+.12,r[3],r[2]-.12,r[3]+.003],y+.14,.01,M('#a49b8e'),scene,.003);
 }
}
const bay=s.design.bayUse;for(const key of['seat','back']){const a=bay[key];box('bay-'+key,a.r,a.base,a.height,fabric,scene,.025);}
const bath=s.design.bath;
// No pipe route or drain fixture is fabricated: actual outlets have not been located.
// Original guardrail kept// Original guardrail kept; elevation and operational envelope still require site verification.
for(let z=-.48;z<2.28;z+=.16)box('original-guardrail',[5.81,z,5.83,z+.016],s.sill,.62,metal);box('guardrail-top',[5.80,-.5,5.84,2.29],1.17,.023,metal);

const putty=M(s.design.palette.recess),foot=new T.Group();foot.name='full-footwall';scene.add(foot);
const r=f.footCabinet.r,cfg=opt.cabinet,footLeaves=[],footDrawers=[],vanityDrawers=[],entryLeaves=[];
poly('rounded-entry-end',f.entryCorner.polygon,.06,2.54,white);
box('foot-back',[r[0],r[3]-.018,r[2],r[3]],.06,2.54,putty,foot);
for(const x of cfg.bays)box('foot-divider',[Math.max(r[0],x-.009),r[1]+.025,Math.min(r[2],x+.009),r[3]-.018],.06,2.46,white,foot);
for(const y of [.06,2.01,2.50])box('foot-shelf',[r[0],r[1]+.025,r[2],r[3]-.018],y,.018,white,foot);
box('foot-top-finish',r,2.52,.08,white,foot);
box('foot-header',[r[0],r[1],r[2],r[1]+.018],cfg.doorTop,2.60-cfg.doorTop,white,foot);
function drawer(name,rr,base,height,axis,parent){
 const g=new T.Group();g.name=name;parent.add(g);const thick=.012;
 box(name+'-bottom',[rr[0]+thick,rr[1]+thick,rr[2]-thick,rr[3]-thick],base,.012,putty,g);
 for(const x of [rr[0],rr[2]-thick])box(name+'-side',[x,rr[1],x+thick,rr[3]],base,height-.01,white,g);
 for(const z of [rr[1],rr[3]-thick])box(name+'-side',[rr[0],z,rr[2],z+thick],base,height-.01,white,g);
 const fr=axis==='z'?[rr[0]-.024,rr[1]-.024,rr[2]+.024,rr[1]-.006]:[rr[2]+.001,rr[1],rr[2]+.019,rr[3]];
 box(name+'-front',fr,base,height-.006,white,g);
 box(name+'-pull',fr,base+height-.006,.006,putty,g);return g;
}
for(let i=0;i<4;i++){
 const a=cfg.bays[i],b=cfg.bays[i+1];
 const hasDrawers=cfg.drawerBayIndices.includes(i);
 const shelves=i===2?[.48,.88,1.28,1.70]:hasDrawers?[.715,1.15]:[];
 for(const y of shelves)box('foot-section-shelf',[a+.018,r[1]+.03,b-.018,r[3]-.02],y,.018,white,foot);
 if(i===0||hasDrawers)for(const y of [1.93]){
  const rod=cylinder((a+b)/2,y,3.06,.008,b-a-.12,metal,foot);rod.rotation.z=Math.PI/2;rod.position.set((a+b)/2,y,3.06);
  for(let k=0;k<5;k++)box('hanging-clothes',[a+.10+k*.13,2.87,a+.13+k*.13,3.28],y-(i===0?1.64:.76),i===0?1.57:.73,k%2?greige:putty,foot,.01);
 }
 for(let k=0;k<2;k++)box('quilt-pack',[a+.04+k*.39,2.84,a+.39+k*.39,3.30],2.05,.34,greige,foot,.03);
 if(hasDrawers)for(const [k,y]of cfg.drawerBases.entries())footDrawers.push(drawer('foot-external-drawer-bay-'+i+'-'+k,[a+.026,2.793,b-.026,3.27],y,cfg.drawerHeight,'z',foot));
 for(let half=0;half<2;half++){
  const x=a+half*.425+.002,side=half?-1:1,hx=half?x+cfg.doorWidth:x;
  const divisions=[...(hasDrawers?[[.08,.632],[1.154,cfg.lowerDoorTop-1.154]]:[[.08,cfg.lowerDoorTop-.08]]),[cfg.upperDoorBase,cfg.doorTop-cfg.upperDoorBase]];
  for(const [by,h]of divisions){
   const g=new T.Group();g.position.set(hx,0,r[1]);g.name=by===cfg.upperDoorBase?'foot-upper-quilt-leaf':'foot-lower-leaf';g.userData.bay=i;g.userData.width=cfg.doorWidth;g.userData.height=h;foot.add(g);
   box('fullwall-white-door',[side===1?0:-cfg.doorWidth,0,side===1?cfg.doorWidth:0,.018],by,h,white,g,.001);
   footLeaves.push({g,side,upper:by===cfg.upperDoorBase});
  }
 }
}
const wr=s.design.centeredDressing?[.02,3.12,.67,4.62]:f.wardrobe.r,entry=new T.Group();entry.name='entry-cabinet';scene.add(entry);
box('entry-back',[wr[0],wr[1],wr[0]+.018,wr[3]],.06,2.54,putty,entry);
for(const z of [wr[1],wr[1]+.75,wr[3]])box('entry-divider',[wr[0],z-.009,wr[2]-.025,z+.009],.06,2.46,white,entry);
for(const y of [.06,2.02,2.50])box('entry-shelf',[wr[0],wr[1],wr[2]-.025,wr[3]],y,.018,white,entry);
box('entry-top',wr,2.52,.08,white,entry);
for(const z of [3.27,3.44,3.61,3.78])box('entry-long-clothes',[.13,z,.56,z+.03],.30,1.60,greige,entry,.01);
for(const y of [.50,.95,1.40])box('entry-folded-shelf',[wr[0],3.88,.62,4.60],y,.018,white,entry);
for(let i=0;i<3;i++){const g=new T.Group();g.name='entry-sliding-leaf-'+i;entry.add(g);box('entry-white-front',[.605+i*.02,wr[1]+.005+i*.49,.623+i*.02,wr[1]+.515+i*.49],.08,2.43,white,g,.002);entryLeaves.push(g);}
const vr=f.vanity.r,vanity=new T.Group();vanity.name='wc-end-vanity';scene.add(vanity);
box('vanity-continuous-back',[.02,vr[1],.04,vr[3]],.75,1.08,putty,vanity);
box('vanity-top',vr,.715,.035,putty,vanity,.018);
for(const z of [vr[1]+.002,vr[3]-.018])box('vanity-support',[.04,z,.452,z+.016],.08,.635,white,vanity);
box('vanity-back-rail',[.04,vr[1]+.018,.08,vr[3]-.018],.65,.065,metal,vanity);
for(const [i,d]of opt.vanity.drawers.entries())vanityDrawers.push(drawer('makeup-drawer-'+i,d.r,d.base,d.height,'x',vanity));
const mr=opt.vanity.mirror.r,mb=opt.vanity.mirror.base,mh=opt.vanity.mirror.height;
box('mirror-cabinet-back',[mr[0],mr[1],mr[0]+.018,mr[3]],mb,mh,putty,vanity);
for(const z of [mr[1],mr[3]-.018])box('mirror-cabinet-side',[mr[0],z,mr[2],z+.018],mb,mh,putty,vanity);
for(const y of [mb,mb+.29,mb+.58,mb+mh-.018])box('mirror-cabinet-shelf',mr,y,.018,white,vanity);
const mirror=roundedFace('rounded-vanity-mirror',.19,mb,2.87,.65,mh,.008,.10,M('#c5cac7'),vanity);mirror.rotation.y=Math.PI/2;
for(const y of [mb+.018,mb+.308])for(const z of [2.91,2.99])cylinder(.115,y,z,.022,.14,greige,vanity);
for(const z of [2.24,2.83])box('mirror-side-light',[.202,z,.208,z+.006],mb+.13,.55,luminous,vanity);
box('vanity-power',[.038,2.91,.05,3.00],1.08,.09,white,vanity);
box('vanity-tray',[.18,2.90,.40,3.07],.752,.02,white,vanity,.015);
const stool=new T.Group();stool.name='vanity-stool';scene.add(stool);const cr=f.chair.r;
cylinder((cr[0]+cr[2])/2,.03,(cr[1]+cr[3])/2,.145,.33,putty,stool);cylinder((cr[0]+cr[2])/2,.36,(cr[1]+cr[3])/2,.20,.10,fabric,stool);
const occupied=box('seated-person-envelope',opt.vanity.occupied,.02,1.18,new T.MeshBasicMaterial({color:'#c39564',transparent:true,opacity:.15}));occupied.visible=false;
const bk=opt.books.lower,br=bk.r,bu=opt.books.upper;
box('bay-books-back',[br[0],br[3]-.018,br[2],br[3]],bk.base,bk.height,putty);
for(const x of [br[0],br[2]-.018])box('bay-books-side',[x,br[1],x+.018,br[3]],bk.base,bk.height,white);
for(const y of bk.shelves)box('bay-books-shelf',br,y,.015,white);
for(let i=0;i<8;i++)box('bay-reading-book',[br[0]+.035+i*.046,br[1]+.025,br[0]+.065+i*.046,br[3]-.025],bk.base+.016,.27,i%2?white:greige);
box('bay-books-upper-back',[bu.r[0],bu.r[3]-.018,bu.r[2],bu.r[3]],bu.base,bu.height,putty);
for(const x of [bu.r[0],bu.r[2]-.018])box('bay-books-upper-side',[x,bu.r[1],x+.018,bu.r[3]],bu.base,bu.height,white);
for(const y of [bu.base,bu.base+bu.height-.018])box('bay-books-upper-shelf',bu.r,y,.018,white);
box('bay-books-upper-door',[bu.r[0]+.002,bu.r[1],bu.r[2]-.002,bu.r[1]+.018],bu.base+.002,bu.height-.004,white);
const sink=bath.fixtures.washstand.r;
const header=opt.header;box('photo-window-header',header.r,header.base,header.height,white);
const ac=s.design.equipment.ac,ag=new T.Group();ag.name='window-head-ac-candidate';scene.add(ag);
box('ac-body',ac.r,ac.base,ac.height,white,ag,.027);
box('ac-outlet',[ac.r[0]-.004,ac.r[1]+.07,ac.r[0]+.003,ac.r[3]-.07],ac.base+.025,.045,metal,ag,.006);
const service=new T.Group();service.name='candidate-pipe-and-service';scene.add(service);
box('ac-top-clearance-conflict',[ac.r[0],ac.r[1],ac.r[2],ac.r[3]],ac.base+ac.height,ac.provisionalRequiredTop,new T.MeshBasicMaterial({color:'#c67d50',wireframe:true}),service,0);
const pipeGeo=new T.BufferGeometry().setFromPoints(opt.pipe.points.map(p=>new T.Vector3(...p)));
const pipe=new T.Line(pipeGeo,new T.LineDashedMaterial({color:'#bb8651',dashSize:.07,gapSize:.035}));pipe.computeLineDistances();service.add(pipe);
const ring=new T.Mesh(new T.TorusGeometry(opt.pipe.holeDiameter/2,.004,8,32),M('#bb8651'));ring.position.set(...opt.pipe.hole);ring.rotation.y=Math.PI/2;service.add(ring);
const curtainGroups={};
for(const [id,c]of Object.entries({cloth:opt.curtains.cloth,sheer:opt.curtains.sheer})){
 const g=new T.Group();g.name=id+'-curtain';scene.add(g);const fabricGroup=new T.Group();g.add(fabricGroup);curtainGroups[id]={g,fabric:fabricGroup,c};
 for(let i=1;i<c.path.length;i++){const a=c.path[i-1],b=c.path[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/len,dz=(b[1]-a[1])/len;
  box(id+'-exposed-track',[Math.min(a[0],b[0])-c.trackWidth/2,Math.min(a[1],b[1])-c.trackWidth/2,Math.max(a[0],b[0])+c.trackWidth/2,Math.max(a[1],b[1])+c.trackWidth/2],c.trackBase,c.trackHeight,white,g,.004);
  for(const p of [a,b])box(id+'-track-ceiling-bracket',[p[0]-.012,p[1]-.012,p[0]+.012,p[1]+.012],c.trackBase+c.trackHeight,s.ceiling-c.trackBase-c.trackHeight,white,g,.003);
  const vertices=[],indices=[],N=80;for(let j=0;j<=N;j++){const t=j/N,w=Math.sin(t*len*70)*c.amplitude;for(const y of [c.base,c.top])vertices.push(a[0]+dx*len*t-dz*w,y,a[1]+dz*len*t+dx*w);if(j<N){const k=j*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
  const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({color:id==='cloth'?'#c9c1b5':'#f6f2e9',side:T.DoubleSide,transparent:id==='sheer',opacity:id==='sheer'?.45:1,roughness:.9}));fabricGroup.add(mesh);
 }
 box(id+'-motor',c.motor.r,c.motor.base,c.motor.height,white,g);
}
const projector=s.design.equipment.projector;
box('projector',projector.r,projector.base,projector.height,white);
box('projector-short-mount',[3.18,.37,3.27,.43],2.48,.12,metal);
const projection=mountProjection({s,scene,box,M,white,metal});
const details=mountIntegratedDetails({scene,s,box,M,white,metal,putty,fabric,drawer,cylinder});
const serviceAreas=mountServiceAreas({scene,s,box,roundedFace,cylinder,M,white,metal,putty,fabric});
details.annotations.push(...serviceAreas.annotations);
const hotelBath=mountSimpleBath({scene});
if(hotelBath){details.annotations.splice(0,details.annotations.length,...details.annotations.filter(a=>!a.views.includes('bath')),...hotelBath.annotations);}
scene.getObjectByName('vanity-power')?.removeFromParent();
let centeredDressing;
if(s.design.centeredDressing){
 const obsolete=['entry-cabinet','integrated-multipurpose-cabinet','wc-end-vanity','vanity-stool','service-areas-56','L04-makeup-front-light'];
 for(const name of obsolete)scene.getObjectByName(name)?.removeFromParent();
 const panels=[];scene.traverse(o=>{if(o.name.startsWith('S05-')||o.name.startsWith('P01-'))panels.push(o);});panels.forEach(o=>o.removeFromParent());
 details.annotations.splice(0,details.annotations.length,...details.annotations.filter(a=>!a.views.some(v=>['entry','storage','vanity'].includes(v))));
 centeredDressing=mountCenteredDressing({scene,s,box,roundedFace,cylinder,M,white,metal,putty,fabric,drawer});
}

const detailLayer=document.querySelector('#detail-labels'),detailLines=document.querySelector('#detail-lines');
const cards=details.annotations.map(a=>{const el=document.createElement('div');el.className='detail-card';el.innerHTML='<strong>'+a.title+'</strong><span>'+a.detail+'</span>';detailLayer.appendChild(el);return {a,el};});
const mirrorProbeTarget=new T.WebGLCubeRenderTarget(128,{type:T.HalfFloatType});
const mirrorProbe=new T.CubeCamera(.08,15,mirrorProbeTarget);mirrorProbe.position.set(.30,1.4,2.62);scene.add(mirrorProbe);
mirror.visible=false;mirrorProbe.update(renderer,scene);mirror.visible=true;details.setMirrorEnvironment(mirrorProbeTarget.texture);
serviceAreas.setMirrorEnvironment(mirrorProbeTarget.texture);
hotelBath?.setMirrorEnvironment(mirrorProbeTarget.texture);
centeredDressing?.setMirrorEnvironment(mirrorProbeTarget.texture);
for(let i=1;i<audit.route.length;i++){const a=audit.route[i-1],b=audit.route[i];box('bath-route',[Math.min(a[0],b[0])-.30,Math.min(a[1],b[1]),Math.max(a[0],b[0])+.30,Math.max(a[1],b[1])],.008,.005,new T.MeshBasicMaterial({color:'#75957b',transparent:true,opacity:.20}),technical);}
tag('床尾355cm上下分段柜门 / 60cm深',3.65,2.72,3.36);tag('端部100cm梳妆台／连续150cm衣柜',.38,1.96,2.62);tag('靠右机位 · 净高待核',5.10,2.76,1.825);tag('右侧墙穿管仅候选',5.30,2.11,2.50);
const cm=n=>(n*100).toFixed(1).replace('.0','');
$('#metrics').innerHTML=[['床尾整墙','355cm（含15cm内凹弧面）'],['直柜 / 柜深','340 × 60cm'],['柜门外观','上下两段，上排独立被褥柜门'],['上柜门尺寸','单扇42.1 × 49cm暂排'],['下柜门尺寸','长衣/叠放门42.1 × 192.6cm'],['短衣区门尺寸','单扇42.1 × 85.2cm；下接外抽'],['床尾外抽','第2/4格各2只；前板约84.6cm宽'],['主柜分区','长衣—短衣/抽—叠放—短衣/抽'],['衣帽区','100cm梳妆＋150cm综合收纳'],['综合柜外抽','3层，底高75—135cm范围'],['梳妆尺寸','100 × 45 × 75cm；R40mm前角'],['主卫门','85cm原门，向卫生间内开'],['床垫 / 床框','180×190 / 188×200cm'],['柜前 / 开门余距',cm(audit.footGap)+' / '+cm(audit.openGap)+'cm'],['挂机占位','95宽 × 25深 × 30高cm'],['现场窗上净高','未实测；照片约53cm非定尺'],['空调安装空间','按用户480mm要求待机型核定'],['单眼皮','暂80下挂/30突出；窗上段断开']].map(([a,b])=>'<dt>'+a+'</dt><dd>'+b+'</dd>').join('');
$('#areas').innerHTML=s.spaces.map(p=>'<dt>'+p.label+'</dt><dd>'+area(p.polygons[0]).toFixed(3)+'㎡'+(p.raised?'（飘窗另计）':'')+'</dd>').join('');
$('#notes').innerHTML=['55版床尾柜门上下分段、两组外抽和入口内凹弧面已进入场景；标签随对应视角显示，非独立标注图。','原模型净高260cm是设计假设，窗上35cm及机顶3cm不代表现场；照片53cm未校正透视也不作为定尺。','保险箱外形仅占位；尺寸、重量、落地承托和结构锚固须按实物核定。','工具与干毛巾/纸品分格；湿毛巾、未冷却吹风机不入密闭柜。','实体开关和电源面板只是外观占位；实际回路、插座孔型、负载、防护及安装位置待电工确认。','空调背板、顶部进风、窗扇、帘轨、原孔和自然排水坡度未验收。','照明为效果模拟，不是照度计算；镜面环境为近似反射。','原门窗墙线及家具外包尺寸保留；新柜门为剖视展示，非开门状态；外抽拉出后不保证通行。','窗右墙面错台未实测，柜体收口及局部净深不能据图下单。'].map(t=>'<p>'+t+'</p>').join('');
$('#audit').textContent='56版主卫原洁具位置不动，新增镜柜及可收浴帘；衣帽柜全身镜、950高理物板。主卫开门与马桶使用区共享：使用马桶时须关门。柜门/理物板开启时不保证通行；五金、防水和排水未实测。';
$('#metrics').insertAdjacentHTML('afterbegin','<dt>衣帽全身镜</dt><dd>45 × 175cm，柜门嵌镜</dd><dt>临时理物板</dt><dd>高95cm／拉出30cm／仅轻物</dd><dt>主卫洗漱组合</dt><dd>原位90 × 45cm盆柜＋薄镜柜</dd>');
$('#notes').firstElementChild.textContent='56版只深化主卫、衣帽和梳妆：柜门全身镜、腰高理物板、镜柜及可收浴帘；卧室其他家具保持原样。浴帘并非完全干湿隔离，不代表柜体可用普通不防潮板材。';
let immersive;
let view='whole';
const positions={whole:[[8.4,9,8.4],[2.8,.6,2.1]],top:[[2.9,11,2.201],[2.9,0,2.20]],footwall:[[3.58,1.65,.20],[3.58,1.3,3.20]],corner:[[.72,1.72,2.20],[2.0,1.20,2.94]],vanity:[[1.85,1.65,2.8],[.20,1.15,2.65]],entry:[[3.8,1.8,3.50],[.26,1.28,3.39]],storage:[[3.8,1.8,3.78],[.27,1.28,3.82]],window:[[3.15,1.75,1.10],[5.38,1.65,1.38]],room:[[2.42,2.35,.37],[4.18,1.12,2.57]],bed:[[3.55,2.12,3.23],[3.65,1.25,.05]],bath:[[1.1,1.55,3.45],[1.03,1.27,.70]]};
positions.entry=[[3.8,1.85,3.37],[.2,1.25,3.37]];positions.vanity=[[1.58,1.6,3.37],[.2,1.22,3.37]];positions.storage=positions.entry;
if(optimizedMode){positions.bath=[[1.30,1.6,1.80],[.95,1.05,.65]];}
positions.bathTop=[[1.08,6.4,1.05],[1.08,0,1.04]];
function plan(){
 let out='<g font-family="Microsoft YaHei,system-ui" font-size="11" fill="#4e544b">';
 const Q=n=>n*100,P=ps=>ps.map(p=>p.map(Q).join(',')).join(' '),text=(x,z,t)=>out+='<text x="'+Q(x)+'" y="'+Q(z)+'" text-anchor="middle">'+t+'</text>';
 const rect=(r,c,stroke='#879080')=>out+='<rect x="'+Q(r[0])+'" y="'+Q(r[1])+'" width="'+Q(r[2]-r[0])+'" height="'+Q(r[3]-r[1])+'" fill="'+c+'" stroke="'+stroke+'"/>';
 for(const p of s.spaces)out+='<polygon points="'+P(p.polygons[0])+'" fill="'+(p.raised?'#d8e0db':'#f5f1e8')+'" stroke="#a9b0a5"/>';
 for(const w of s.walls){const len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),u=[(w.b[0]-w.a[0])/len,(w.b[1]-w.a[1])/len];let prev=0;const seg=(a,b,c,width)=>out+='<line x1="'+Q(w.a[0]+u[0]*a)+'" y1="'+Q(w.a[1]+u[1]*a)+'" x2="'+Q(w.a[0]+u[0]*b)+'" y2="'+Q(w.a[1]+u[1]*b)+'" stroke="'+c+'" stroke-width="'+width+'"/>';for(const op of s.openings.filter(p=>p.wall_id===w.id).sort((a,b)=>a.offset-b.offset)){seg(prev,op.offset,'#92978d',w.thickness*100);if(op.kind==='window')seg(op.offset,op.offset+op.width,'#88a8b0',4);prev=op.offset+op.width;}seg(prev,len,'#92978d',w.thickness*100);}
 for(const[id,q]of Object.entries(f)){const rr=[...q.r];if(id==='chair'&&$('#chair-pull').checked){rr[0]+=opt.vanity.chairPull;rr[2]+=opt.vanity.chairPull;}if(q.polygon)out+='<polygon points="'+P(q.polygon)+'" fill="#d6cebe" stroke="#899080"/>';else rect(rr,id==='bed'?'#cdbda9':id==='vanity'?'#dfd1be':'#d8d7ca');}
 for(const q of Object.values(bath.fixtures))rect(q.r,'#dde5df');for(const q of bath.fixed)rect(q.r,'#aca597');
 if(optimizedMode){const p=bath.hotelCandidate.partition;for(const r of ($('#wet-door-closed').checked?p.closedFaces:p.openStacks))rect(r,'#b8cac8');text(swappedMode?1.60:.63,swappedMode?.30:1.50,'盆柜90×40');text(swappedMode?.78:1.70,swappedMode?1.60:.45,'马桶40×65');text(.55,.55,'淋浴90×90');}
 else if(cornerMode){const h=bath.hotelCandidate;for(const v of curtainSegments(h.partition,$('#wet-door-closed').checked))out+='<polyline points="'+P(v)+'" fill="none" stroke="#736852" stroke-width="2"/>';if($('#routes').checked)for(const[name,r]of Object.entries(h.routes))out+='<polyline points="'+P(r.points)+'" fill="none" stroke="'+({toilet:'#71968155',wash:'#b6956255',shower:'#809cad55'}[name])+'" stroke-width="'+Q(r.diameter)+'" stroke-linecap="round" stroke-linejoin="round"/>';text(.57,.54,'淋浴90×90');text(1.65,.52,'右侧马桶');text(.67,1.70,'洗漱58×40');}
 else if(hotelMode){const h=bath.hotelCandidate;rect(h.partition.fixed,'#b9b19f');rect(h.partition.jamb,'#b9b19f');
  if(separateMode){const a=$('#wet-door-closed').checked?0:h.partition.openAngle*Math.PI/180,w=h.partition.panelWidth,x=h.partition.door[0],z=h.partition.door[1],v=[[x,z],[x+w*Math.cos(a),z-w*Math.sin(a)],[x+2*w*Math.cos(a),z]];out+='<polyline points="'+P(v)+'" fill="none" stroke="#736852" stroke-width="2"/>';if($('#routes').checked){rect(h.toiletUse,'#bbd0bb');rect(h.standing,'#e3d5be');}}
  else{const d=[...h.partition.door],t=$('#wet-door-closed').checked?0:h.partition.travel;d[0]-=t;d[2]-=t;rect(d,'#a3977f');}
  text(.76,.52,'窗边马桶');text(1.60,.54,separateMode?'淋浴85×90':'淋浴90×90');text(.67,1.70,'洗漱58×40');}
 for(const d of s.openings.filter(p=>p.kind==='door')){const angle=+$(d.id==='bath-door'?'#bath-angle':'#door').value,p=doorTip(d,angle),p0=doorTip(d,0);out+='<path d="M'+Q(p0[0])+','+Q(p0[1])+' A'+Q(d.width)+','+Q(d.width)+' 0 0 1 '+Q(p[0])+','+Q(p[1])+'" stroke="#a98a6c" stroke-dasharray="3 3" fill="none"/><path d="M'+Q(d.hinge[0])+','+Q(d.hinge[1])+' L'+Q(p[0])+','+Q(p[1])+'" stroke="#907658" stroke-width="3"/>';}
 if($('#chair-pull').checked)rect(opt.vanity.occupied,'#ceae7d55');if($('#routes').checked)out+='<polyline points="'+P(audit.route)+'" stroke="#88a78655" stroke-width="60" fill="none"/>';
 rect(ac.r,'#d4ad6b55','#bc925d');if($('#pipe-show').checked)out+='<polyline points="'+P(opt.pipe.points.map(p=>[p[0],p[2]]))+'" stroke="#bb8651" stroke-dasharray="4 3" fill="none"/>';
 for(const c of Object.values({cloth:opt.curtains.cloth,sheer:opt.curtains.sheer}))out+='<polyline points="'+P(c.path)+'" stroke="#8ea5a0" stroke-dasharray="3 3" fill="none"/>';
 text(3.65,-.30,'同一原结构 · 床尾整柜 / 梳妆靠主卫端');text(.25,3.37,'化妆100');text(.30,2.50,'左柜75');text(.30,4.25,'右柜75');text(3.65,3.14,'整面柜355×60');text(3.65,1.22,'床垫180×190');text(3.62,2.45,'柜前71.9cm');text(1.52,2.28,'主卫内开');text(1.38,2.66,'坐姿后留通路');text(5.15,.96,'挂机候选');text(3,5.05,'门窗不改；右侧穿管虚线不是施工孔位');$('#plan').innerHTML=out+'</g>';
}
function resize(){const r=$('#viewer').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();if(['entry','storage'].includes(view)&&!immersive?.active){const distance=Math.max(3.6,2.9/(2*Math.tan(camera.fov*Math.PI/360)*camera.aspect));camera.position.set(.2+distance,1.85,3.37);controls.target.set(.2,1.25,3.37);controls.update();}}
function choose(id){
 immersive?.leave();
 const dressingView=['entry','storage','vanity'].includes(id);$('.dressing-actions').hidden=!dressingView;$('.quick-actions').hidden=dressingView;$('.pov-tools').hidden=dressingView;
 const title={entry:'整面化妆柜',storage:'柜内分区',vanity:'柜中化妆台',bathTop:'主卫俯视',whole:'套间总览',top:'套间俯视',plan:'尺寸平面'}[id]||'空间细节';$('#view-name').textContent=title;
 view=id;const cut=['whole','top','entry','storage','vanity','corner'].includes(id);
 scene.children.forEach(o=>{if(['foot-wall','entry-wall','entry-side'].includes(o.name))o.visible=!cut;if(o.name==='closet-wall')o.visible=!['whole','top','entry','storage','vanity'].includes(id);if(o.name==='bath-side')o.visible=id!=='room';});
 foot.visible=!['entry','storage','vanity','bed'].includes(id);scene.getObjectByName('rounded-entry-end').visible=foot.visible;scene.getObjectByName('projection-system').visible=foot.visible;
 if(id==='storage')$('#entry-open').checked=true;
 for(const {g,d}of doors)g.visible=!(d.id==='entry'&&['entry','storage','whole'].includes(id));
 scene.children.filter(o=>o.name==='bath-door-wall').forEach(o=>o.visible=true);
 if(id==='bathTop')for(const {g,d}of doors)if(d.id==='bath-door')g.visible=true;
 $('#scene').toggleAttribute('hidden',id==='plan');$('#plan').toggleAttribute('hidden',id!=='plan');if(id!=='plan'){const[p,t]=positions[id]||positions.whole;camera.position.set(...p);controls.target.set(...t);camera.fov=['vanity','entry','storage','footwall','room','window','bath'].includes(id)?60:47;camera.updateProjectionMatrix();controls.update();resize();}
 $('#ac-status').hidden=!['window','whole','room','top','plan'].includes(id);$('#caption').textContent={footwall:'55版：上下分段柜门 · 上排被褥仓／两组外抽／入口内凹弧面',corner:'入口R150内凹弧面 · 在原15cm端部内扣减，非新增收纳洞',vanity:'100cm一体梳妆 · R40台面／镜侧光／双抽／电源',entry:'150cm综合柜＋100cm梳妆 · 剖视隐藏入口门扇以便观察',storage:'柜内剖视 · 保险箱／工具／卫浴备用品；入口门扇仅视图隐藏',window:'空调靠右位置保留 · 净高未实测；不把旧模型3cm余量当现场',plan:'同源尺寸平面；55版柜门分段请看三维',whole:'55版整套剖视 · 可关闭就地标注看纯效果',room:'整墙柜／空调／单眼皮同场景 · 安装条件待核',bath:'主卫原门与墙体保留，各视角共用同一布局'}[id]||'原结构与同尺寸模型 · 非施工图';
 if(id==='whole')$('#caption').textContent='56版套间剖视 · 主卫／衣帽／梳妆深化，卧室布局不变';
 
 if(id==='entry')$('#caption').textContent='衣帽柜门全身镜＋950高理物板＋100cm梳妆 · 入口门仅剖视隐藏';
 if(hotelMode&&id==='bath')$('#caption').textContent='57版：入口先洗漱 → 移门内淋浴＋马桶；原入口门/门侧墙仅剖视隐藏，排污移位未核';
 if(hotelMode&&id==='bathTop')$('#caption').textContent='主卫俯视：仅隐藏新增隔断观察分区；原内开门保留；窗口马桶排污待确认';
 if(id==='bathTop'){camera.fov=25;camera.updateProjectionMatrix();}
 if(separateMode&&id==='bath')$('#caption').textContent='58版：入口洗漱／背窗马桶／独立淋浴；非玻璃内折门，排污移位与实际安装仍待核';
 if(cornerMode&&['bath','bathTop'].includes(id)){$('#metrics').innerHTML='<dt>模型边界</dt><dd>215 × 205cm</dd><dt>入口盆柜</dt><dd>58 × 40cm</dd><dt>镜柜／淋浴架</dt><dd>镜柜13cm深／双层壁挂架</dd><dt>原门洞</dt><dd>85cm，内开</dd>';$('#audit').textContent='4.407㎡为模型边界面积，未扣围合区及固定设施，不等于可用净面积。';$('#notes').innerHTML='<p>镜柜收牙刷牙膏与护肤品，淋浴架收洗护用品。主卫门原位保留，可切换开关。墙体性质、排污移位及防水排水尚未现场核实。</p>';}
 if(optimizedMode&&['bath','bathTop'].includes(id)){$('#metrics').innerHTML='<dt>总边界面积</dt><dd>4.407㎡（含固定围合区）</dd><dt>洗漱盆柜</dt><dd>90 × 40cm</dd><dt>独立淋浴</dt><dd>90 × 90cm</dd><dt>马桶模型</dt><dd>40 × 65cm，侧向距墙35cm</dd><dt>转角入浴校验</dt><dd>62cm圆盘通过／65cm未通过</dd>';$('#audit').textContent='两面转角叠门按各33×5cm（含拉手）收叠包络试算；如厕前关闭原入口门。洁具无硬碰撞，70×65cm如厕使用区独立。';$('#notes').innerHTML='<p>当前模型优先方案；淋浴门框、轨道、收叠厚度及净开口必须随实物复核。90×40cm盆柜须按具体产品核对盆体和龙头。</p><p>原墙、门洞、固定围合区保持，马桶排污位置、窗口和防水尚未现场核实。入口门保留隐私保护，使用马桶时关闭。</p>'; }
 if(swappedMode&&['bath','bathTop'].includes(id)){
 $('#metrics').innerHTML='<dt>总边界面积</dt><dd>4.407㎡（含固定围合区）</dd><dt>入口正面盆柜</dt><dd>90 × 40cm</dd><dt>左侧马桶</dt><dd>65 × 40cm，朝右</dd><dt>窗侧开放淋浴</dt><dd>90 × 90cm</dd><dt>通路检查</dt><dd>70cm圆盘通行通过</dd><dt>马桶前方</dt><dd>65cm深 × 70cm宽</dd>';
 $('#audit').textContent='70cm模拟通路通过，盆柜前90×65cm、马桶前65×70cm使用区独立；入口门扫掠不碰洁具，但经过如厕站位，先关门再使用。';
 $('#notes').innerHTML='<p>进门正面主要看到洗漱盆与镜柜，马桶位于左侧。此为模型试排，未证明马桶新位置能接原排污口；须核对排水与围合区检修。</p><p>保留原入口隐私门，淋浴与马桶之间留50cm挡水玻璃，取消叠门和顶轨；入口开放，不能保证外侧地面全干。固定方式和防水须现场核对。</p>';
 }
 if(cornerMode&&['bath','bathTop'].includes(id))$('#caption').textContent='59版：窗侧淋浴／右侧马桶／入口洗漱；75cm去马桶、70cm入浴圆盘校核；L浴帘为挡水分区，非密闭；原入口门仅效果剖视隐藏';
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));state();
}
function state(){
 if(['bath','bathTop'].includes(view))$('#caption').textContent='同一布局：左后马桶／右后淋浴／左前面盆／右前原木门 · 无新增隔断';

 centeredDressing?.update({inside:$('#entry-open').checked,pull:$('#vanity-drawers').checked,chairPull:$('#chair-pull').checked?opt.vanity.chairPull:0,evening:$('#light-scene').value==='evening'});
 const down=$('#screen-mode').value==='down';if(down)$('#foot-mode').value='closed';$('#foot-mode').disabled=down;
 const fm=$('#foot-mode').value;for(const{g,side,upper}of footLeaves){g.visible=fm!=='inside';g.rotation.y=(fm==='open'||fm==='upper'&&upper)?side*Math.PI/2:0;}footDrawers.forEach(g=>g.position.z=fm==='drawers'?-cfg.drawerTravel:0);
 entryLeaves.forEach((g,i)=>g.position.z=$('#entry-open').checked?(i===0?.48:i===2?-.48:0):0);
 stool.position.x=$('#chair-pull').checked?opt.vanity.chairPull:0;occupied.visible=$('#chair-pull').checked;
 vanityDrawers.forEach((g,i)=>g.position.x=$('#vanity-drawers').checked?opt.vanity.drawers[i].travel:0);
 technical.visible=$('#routes').checked;service.visible=$('#pipe-show').checked;
 for(const[id,{fabric}]of Object.entries(curtainGroups))fabric.visible=$('#'+id+'-closed').checked;
 projection.update({lower:down,light:$('#cabinet-light').checked});lighting();walls.forEach(m=>m.opacity=$('#opacity').value/100);tags.forEach(t=>t.visible=$('#labels').checked);
 details.update({inside:$('#entry-open').checked,pull:$('#entry-drawers').checked,evening:$('#light-scene').value==='evening'&&!down,view});
 serviceAreas.update({trayOpen:$('#tray-pull').checked,mirrorInside:$('#bath-mirror-inside').checked,curtainClosed:$('#bath-curtain').checked});
 hotelBath?.update({closed:$('#wet-door-closed').checked,mirrorInside:$('#bath-mirror-inside').checked,view,routes:$('#routes').checked});
 scene.traverse(o=>{if(o.name.startsWith('S02-'))o.visible=!['bath','bathTop'].includes(view);});
 for(const{g,d}of doors)g.rotation.y=-(d.closedAngle+d.sweep*$(d.id==='bath-door'?'#bath-angle':'#door').value*Math.PI/180);plan();updateDetailLabels();
}
$('#bath-curtain').parentElement.hidden=true;$('#wet-door-closed').parentElement.hidden=true;
immersive=mountImmersive({camera,controls,scene,doors,choose,state});
if(swappedMode){$('#routes').parentElement.lastChild.textContent=' 查看70cm模型通路';if(bath.hotelCandidate.partition.kind==='open-glass'){$('#curtain-action').hidden=true;$('#wet-door-closed').parentElement.hidden=true;}}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>choose(b.dataset.view));document.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',state));new ResizeObserver(resize).observe($('#viewer'));state();choose(new URLSearchParams(location.search).get('view')||'bath');
if((new URLSearchParams(location.search).get('view')||'bath')==='bath')immersive.enter('entry');
if(new URLSearchParams(location.search).get('view')==='dressing')immersive.enter('dressing');
function updateDetailLabels(){
 const visible=$('#detail-toggle').checked&&view!=='plan',w=renderer.domElement.clientWidth,h=renderer.domElement.clientHeight;let paths='',lastBottom=-10;
 detailLayer.style.display=visible?'block':'none';detailLines.style.display=visible?'block':'none';
 const active=cards.filter(c=>visible&&c.a.views.includes(view)).map(c=>({...c,v:c.a.p.clone().project(camera)})).filter(c=>c.v.z>-1&&c.v.z<1).sort((a,b)=>a.v.y-b.v.y);
 cards.forEach(c=>c.el.hidden=true);
 // Keep all desktop labels legible; compact mobile mode shows the two nearest useful anchors.
 for(const c of (w<560?active.slice(0,2):active).sort((a,b)=>b.v.y-a.v.y)){
  const ax=(c.v.x*.5+.5)*w,ay=(-c.v.y*.5+.5)*h,cw=Math.min(280,w-30),x=Math.max(12,Math.min(w-cw-12,ax+24));
  let y=Math.max(55,Math.min(h-100,ay-40));y=Math.max(y,lastBottom+9);if(y>h-100)y=h-100;lastBottom=y+66;
  c.el.hidden=false;c.el.style.width=cw+'px';c.el.style.left=x+'px';c.el.style.top=y+'px';
  paths+='<path d="M'+ax+','+ay+' L'+x+','+(y+25)+'"/><circle cx="'+ax+'" cy="'+ay+'" r="3"/>';
 }
 detailLines.innerHTML=paths;
}
function animate(){requestAnimationFrame(animate);projection.tick(performance.now());hotelBath.tick();if(view!=='plan'){if(controls.enabled)controls.update();renderer.render(scene,camera);}updateDetailLabels();}animate();
window.masterWindowOption={ready:true,spec:s,audit,scene,choose,state,projection,details,serviceAreas,hotelBath,footLeaves,footDrawers,camera,controls,immersive,centeredDressing,revision:92};


$('#curtain-action').hidden=true;$('#metrics').innerHTML='<dt>当前主卫</dt><dd>按PDF，马桶左后／淋浴右后／面盆左前</dd><dt>原门</dt><dd>右前内开木门</dd>';$('#audit').textContent='各视角共用同一个洁具模型，无新增隔断。';$('#notes').innerHTML='<p>马桶移位排水和门窗净尺寸需现场复核。</p>';
