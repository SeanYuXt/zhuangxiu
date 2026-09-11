import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {palette} from './design-spec.js';
import {finishWoodPanel} from './cabinet-finishes.js';
import {balconyLayout as s} from './balcony-layout-spec.js?v=balcony-right-utility-3';

// Retain the screen and low console; the lake-side bay is now a full display cabinet.
export function reviseTVDisplay(model){
 const tv=model.getObjectByName('recessed-tv-black-side-reveals');
 if(!tv||tv.getObjectByName('tv-display-columns'))throw Error('电视墙缺失或重复深化');
 const root=new T.Group();root.name='tv-display-columns';tv.add(root);
 const warm=new T.MeshStandardMaterial({color:palette.cabinet,roughness:.65}),oak=new T.MeshStandardMaterial({color:palette.wood,roughness:.7});
 const led=new T.MeshStandardMaterial({color:'#fff2da',emissive:'#ffe3bf',emissiveIntensity:.25});
 const box=(parent,name,x,y,z,w,h,d,material=warm)=>{const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,.0015),material);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(material===oak)finishWoodPanel(o,{interior:true});return o;};
 const replaced=[],shifted=[];
 for(const o of tv.children){
  if(!o.isMesh)continue;o.geometry.computeBoundingBox();const d=o.geometry.boundingBox.getSize(new T.Vector3());
  const side=Math.abs(Math.abs(o.position.x)-1.5)<.002&&Math.abs(d.x-.8)<.002&&d.y>2.7;
  const centre=Math.abs(d.x-2.2)<.002&&(Math.abs(d.y-.815)<.002||Math.abs(d.y-.735)<.002);
  if(side||centre){o.visible=false;replaced.push(o);}
  else if(d.x<3.7){o.position.z+=.1;shifted.push(o);}
 }
 if(replaced.length!==4)throw Error('电视墙原饰面数量不符');
 box(root,'tv-display-upper-infill',.4,2.4075,-.08,3.0,.735,.12);
 box(root,'tv-display-lower-infill',.4,.4325,-.08,3.0,.815,.12);
 const doors=[],books=[],shelves=[];
 for(const side of [-1,1]){
  const lake=side<0,x=lake?-1.5:1.375,width=lake?.796:.55,depth=lake?.354:.1975;
  const levels=lake?[.501,1.12,1.74,2.37]:[.858,1.449,2.04],bottom=lake?.483:.84,top=lake?2.38:2.04;
  const g=new T.Group();g.name=lake?'tv-display-lake':'tv-display-dining';root.add(g);
  const back=lake?-.141:-.2085,front=back+depth-.009;
  box(g,'tv-display-oak-back',x,(bottom+top)/2,back,width-.036,top-bottom,.018,oak);
  for(const edge of [-1,1])box(g,'tv-display-side',x+edge*(width/2-.009),(bottom+top)/2,(front+back)/2,.018,top-bottom,depth,oak);
  for(const y of levels)shelves.push(box(g,'tv-display-shelf',x,y-.009,(front+back)/2,width-.036,.018,depth-.018,oak));
  for(let i=1;i<levels.length;i++){
   const strip=box(g,`tv-display-light-${lake?'left':'right'}-${i}`,x,levels[i]-.028,front-.025,width-.08,.004,.016,led.clone());
   strip.userData.lightingDirectionLocal=[0,-1,-.25];
  }
  if(!lake)box(root,'tv-display-outer-pilaster',1.775,1.44,-.08,.25,1.2,.12);
  const decor=tv.getObjectByName(lake?'tv-decor-lake-side':'tv-decor-dining-side');
  decor.position.set(lake?-.195:.045,levels[1]-.478,lake?-.075:-.15);
  if(!lake)for(const o of decor.children.slice(0,2))o.scale.z*=.84;
  books.push(decor);
  const albums=new T.Group();albums.name='tv-display-books-'+side;g.add(albums);
  for(let j=0;j<3;j++)books.push(box(albums,'tv-display-book',x-.09+j*.072,levels[0]+(.26-j*.022)/2,lake?-.045:-.11,.060,.26-j*.022,.15,new T.MeshStandardMaterial({color:['#b8b09f','#d8d1c3','#7e887c'][j],roughness:.83})));
  if(lake){
   box(g,'lake-display-photo-frame',x+.10,levels[2]+.14,-.04,.28,.28,.025,oak);
   box(g,'lake-display-photo-mat',x+.10,levels[2]+.14,-.025,.25,.25,.004,new T.MeshStandardMaterial({color:'#e9e4d8'}));
   box(g,'lake-display-photo-placeholder',x+.10,levels[2]+.14,-.021,.20,.14,.002,new T.MeshStandardMaterial({color:'#94a399',roughness:.9}));
   const glass=new T.MeshPhysicalMaterial({color:'#d1ded6',roughness:.12,transparent:true,opacity:.18,metalness:0,depthWrite:false});
   const metal=new T.MeshStandardMaterial({color:'#a49a86',metalness:.7,roughness:.4});
   for(const [i,sign] of [[0,1],[1,-1]]){
    const hinge=new T.Group();hinge.name='lake-display-door-hinge-'+i;hinge.position.set(x+(i===0?-1:1)*(width/2-.005),bottom+.018,front+.019);g.add(hinge);
    const dw=(width-.016)/2,dh=top-bottom-.036,cx=sign*dw/2;
    box(hinge,'lake-display-glass-'+i,cx,dh/2,0,dw-.018,dh-.018,.006,glass);
    for(const bx of [sign*.004,sign*(dw-.004)])box(hinge,'lake-display-door-upright',bx,dh/2,0,.008,dh,.014,metal);
    for(const by of [.004,dh-.004])box(hinge,'lake-display-door-crossbar',cx,by,0,dw,.008,.014,metal);
    box(hinge,'lake-display-door-handle',sign*(dw-.026),dh*.45,.010,.008,.09,.010,metal);doors.push(hinge);
   }
  }
  g.userData={width,depth,shelves:levels.length-1,bottom,top,selectedHardware:false};
 }
 // End the low console at the display side panel. The two cabinets no longer share a footprint.
 const console=tv.getObjectByName('tv-low-console');console.scale.x=s.transition.consoleWidth/3.3;console.position.x=.275;
 box(root,'tv-console-lake-extension',-1.5,.249,.045,.796,.458,.39);
 root.userData={scheme:'独立800mm展示柜；2750mm电视低柜止于展示侧板，模型接缝2mm',width:3.55,liningWidth:3.8,displayWidth:.8,displayDepth:.39,displayTop:2.38,wallCut:false,fixingVerified:false};
 tv.userData={...tv.userData,scheme:'lake-side-display-tower',structuralCut:false};
 const screen=tv.getObjectByName('85-inch-screen');screen.geometry.computeBoundingBox();const ss=screen.geometry.boundingBox.getSize(new T.Vector3());
 if(Math.abs(ss.x-1.882)>.002||Math.abs(ss.y-1.059)>.002||Math.abs(screen.position.z+.02)>.001)throw Error('电视尺寸或齐平位置不符');
 const state={displayOpen:false},setDisplayOpen=open=>{state.displayOpen=Boolean(open);doors.forEach((d,i)=>d.rotation.y=(open?Math.PI/2:0)*(i===0?-1:1));model.updateMatrixWorld(true);};
 model.updateMatrixWorld(true);
 return {root,tv,replaced,shifted,doors,state,setDisplayOpen,shelves,books};
}
