import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {finishWoodPanel} from './cabinet-finishes.js';

// Dry preparation/storage island: no assumed plumbing connection or live power.
export function makeDryIsland(spec,settings){
 const group=new T.Group();group.name='stone-island';group.position.fromArray(spec.position);
 const material=(color,roughness=.7)=>new T.MeshStandardMaterial({color,roughness});
 const stone=material('#e1ded5'),wood=material('#b5a088'),front=material('#d1cabc'),inside=material('#c6b597'),dark=material('#504c42');
 stone.roughness=.4;
 const loader=new T.TextureLoader();wood.normalMap=loader.load('./assets/wood-normal.jpg');wood.normalScale.set(.12,.12);wood.roughnessMap=loader.load('./assets/wood-rough.jpg');
 const ceramic=material('#e8e4db',.3),linen=material('#c9c3b5',.96),steel=new T.MeshStandardMaterial({color:'#99968c',roughness:.28,metalness:.85});
 const box=(parent,name,x,y,z,w,h,d,m)=>{const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.003,w/6,h/6,d/6)),m);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);if((m===wood||m===inside)&&!name.startsWith('socket'))finishWoodPanel(o,{interior:m===inside});return o;};
 // Kitchen-facing storage is 490 deep; east long side has 380 mm knee recess.
 const back=spec.width/2-spec.kneeRecess,mid=back-spec.carcassDepth/2;
 box(group,'island-recessed-plinth',mid,.06,0,spec.carcassDepth-.10,.10,1.06,dark);
 const body=new T.Group();body.name='island-storage-carcass';group.add(body);
 for(const z of [-.591,.591])box(body,'island-end-panel',mid,.48,z,spec.carcassDepth,.76,.018,wood);
 box(body,'island-back-panel',back-.009,.48,0,.018,.76,1.164,wood);
 box(body,'island-bottom',mid,.11,0,spec.carcassDepth,.018,1.164,inside);
 box(body,'island-center-divider',mid,.48,0,spec.carcassDepth,.76,.018,wood);
 box(body,'island-top-rail',mid,.85,0,spec.carcassDepth,.018,1.164,inside);
 const drawers=[];
 for(const [column,z] of [[0,-.30],[1,.30]])for(const [row,y,h] of [[0,.755,.19],[1,.505,.29],[2,.225,.25]]){
  const drawer=new T.Group();drawer.name=`island-drawer-${column*3+row}`;drawer.position.set(0,0,z);group.add(drawer);drawers.push(drawer);
  box(drawer,'drawer-front',-.43,y,0,.022,h,.58,front);
  box(drawer,'recessed-finger-grip',-.431,y+h/2-.015,0,.025,.012,.52,dark);
  box(drawer,'drawer-bottom',mid,y-h/2+.018,0,.43,.014,.53,inside);
  for(const zz of [-.266,.266])box(drawer,'drawer-side',mid,y-.005,zz,.43,h-.04,.012,inside);
  box(drawer,'drawer-back',mid+.209,y-.005,0,.012,h-.04,.53,inside);
  if(row===0){
   for(const zz of [-.125,.125])box(drawer,'cutlery-tray-divider',mid,y-.025,zz,.37,.055,.008,wood);
   for(const zz of [-.19,-.065,.065,.19])for(let i=0;i<2;i++){
    const xx=mid-.055+i*.025;
    box(drawer,'cutlery-handle',xx+.075,y-.010,zz,.125,.005,.009,steel);
    const spoon=new T.Mesh(new T.SphereGeometry(1,16,8),steel);spoon.name='cutlery-spoon-bowl';spoon.scale.set(.028,.004,.017);spoon.position.set(xx-.01,y-.009,zz);drawer.add(spoon);
   }
  }else if(row===1){
   for(const zz of [-.135,.135])for(let i=0;i<4;i++){
    const plate=new T.Mesh(new T.CylinderGeometry(.095,.090,.012,32),ceramic);plate.name='stored-ceramic-plate';plate.position.set(mid,y-h/2+.045+i*.016,zz);plate.castShadow=true;plate.receiveShadow=true;drawer.add(plate);
   }
  }else{
   for(let i=0;i<3;i++)box(drawer,'folded-table-linen',mid,y-h/2+.045+i*.03,0,.29,.025,.36,linen);
  }
 }
 box(group,'island-prep-worktop',0,spec.height-.02,0,spec.width,.04,spec.length,stone);
 box(group,'island-shadow-reveal',mid,spec.height-.055,0,spec.carcassDepth,.02,1.20,dark);
 const socket=new T.Group();socket.name='island-flush-power-module';socket.position.set(-.28,spec.height+.002,-.5);group.add(socket);
 box(socket,'socket-cover',0,0,0,.10,.006,.20,dark);
 for(const z of [-.045,.045])for(const x of [-.018,.018])box(socket,'socket-slot',x,.004,z,.008,.001,.022,inside);
 socket.userData={status:'外形示意；地面供电、漏电保护和产品型号待确认，未接电'};
 // Keep the original crockery at full scale; turn each setting toward the two east seats.
 if(settings){
  const turn=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI/2);
  for(const child of settings.children){const sign=Math.sign(child.position.z),x=child.position.x,z=child.position.z-sign*.68;child.position.x=.18+z;child.position.z=sign*spec.seatPitch/2-x;child.quaternion.premultiply(turn);}
  settings.position.y-=.045;group.add(settings);
 }
 group.userData={scheme:'dry-prep-storage-east-seats',height:spec.height,kneeRecess:spec.kneeRecess,carcassDepth:spec.carcassDepth,drawerTravel:spec.drawerTravel,drawerNames:drawers.map(d=>d.name),powerVerified:false,structuralLoadVerified:false};
 return group;
}
