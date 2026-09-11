import * as T from './vendor/three.module.js';
import {balconyLayout as s} from './balcony-layout-spec.js?v=balcony-right-utility-3';
import {finishWoodPanel} from './cabinet-finishes.js';

// The entire cleaning installation is on the right. The sink shell is built by balcony-layout.js.
export function addBalconyCare(model){
 const g=new T.Group();g.name='balcony-care-cabinet';g.position.fromArray(s.wet.position);g.rotation.y=s.wet.rotation;model.add(g);
 g.userData={rightSideOnly:true,supply:null,waste:null,autoWaterRequired:true,productSelected:false};
 const mat=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const warm=mat('#d6d1c7'),wood=mat('#b5a088'),white=mat('#eeede6',.35),steel=mat('#91978e',.3,.8),dark=mat('#464d48');
 const box=(p,n,x,y,z,w,h,d,m=warm)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.name=n;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);if(m===wood)finishWoodPanel(o,{interior:true});return o;};
 const group=(p,n,x=0,y=0,z=0)=>{const o=new T.Group();o.name=n;o.position.set(x,y,z);p.add(o);return o;};
 const cylinder=(p,n,x,y,z,r,h,m)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,32),m);o.name=n;o.position.set(x,y,z);o.castShadow=true;p.add(o);return o;};
 const toolBay=group(g,'balcony-tool-cabinet',s.cleaningRack.position[2]-s.wet.position[2]);
 const rw=s.cleaningRack.bayWidth;
 for(const x of [-rw/2+.009,rw/2-.009])box(toolBay,'tool-bay-side',x,1.385,0,.018,2.77,.72);
 box(toolBay,'tool-bay-back',0,1.385,-.352,rw-.036,2.77,.016);
 for(const y of [.05,2.76])box(toolBay,'tool-bay-cap',0,y,0,rw-.036,.02,.69);
 const door=group(toolBay,'balcony-care-service-door');
 box(door,'care-door-face',0,1.410,.371,rw-.004,2.70,.018);
 box(door,'care-door-finger-recess',-.045,1.30,.357,.012,.35,.012,dark);
 const storage=group(door,'balcony-care-dry-storage');
 box(storage,'tool-rack-spine',0,1.32,-.015,.008,2.30,.60,wood);
 box(storage,'tool-rack-drip-tray',0,.130,-.005,.128,.020,.62,steel);
 for(const x of [-.06,.06])box(storage,'tool-tray-raised-edge',x,.15,-.005,.008,.04,.62,steel);
 for(const x of [-.052,.052])box(storage,'tool-rack-runner',x,.09,0,.016,.035,.60,steel);
 for(const [i,x,z,h] of [[0,-.037,-.17,1.60],[1,-.037,.16,1.68],[2,.037,-.14,1.90],[3,.037,.17,1.75]]){
  const pole=cylinder(storage,'long-tool-handle-'+i,x,.23+h/2,z,.010,h,i===2?steel:wood);pole.userData={item:['拖把','扫把','撑衣杆','刮水器'][i],length:h};
  box(storage,'tool-clip-'+i,x/2,1.72,z,.038,.038,.032,dark);
  if(i!==2)box(storage,'long-tool-head-'+i,x,.205,z,.030,.055,.25,i===0?white:dark);
  else box(storage,'clothes-pole-fork',x,2.15,z,.022,.018,.065,steel);
 }
 storage.userData={...s.cleaningRack,headOrientation:'拖把/扫把头侧向放，薄面朝柜宽；胖杆或圆拖把须另核',toolLengths:[1.60,1.68,1.90,1.75]};
 const dock=group(g,'balcony-robot-dock',0,0,.015);
 box(dock,'dock-rear-housing',0,.30,-.19,.42,.50,.14,white);
 for(const x of [-.202,.202])box(dock,'dock-service-side',x,.451,-.07,.016,.182,.24,white);
 box(dock,'dock-service-bottom',0,.362,-.07,.40,.012,.24,white);
 const lid=group(dock,'dock-service-lid',0,.55,-.045);box(lid,'dock-fixed-top',0,0,0,.42,.012,.24,white);
 const cassette=group(dock,'dock-removable-service-cassette',0,.438,-.025);
 box(cassette,'dock-cassette-base',0,-.063,0,.34,.008,.18);
 for(const x of [-.166,.166])box(cassette,'dock-cassette-side',x,0,0,.008,.126,.18);
 for(const z of [-.086,.086])box(cassette,'dock-cassette-end',0,0,z,.34,.126,.008);
 box(cassette,'dock-cassette-grip',0,.039,.096,.10,.022,.016,dark);
 for(const x of [-.20,.20])box(dock,'dock-side-cheek',x,.175,-.07,.020,.27,.25,white);
 box(dock,'dock-cleaning-tray',0,.015,.012,.405,.025,.53,dark);
 box(dock,'dock-status-display',0,.521,-.114,.11,.022,.008,dark);
 dock.userData={...s.robot,designEnvelope:[.42,.55,.54],waterConnectionConfirmed:false,note:'上下水基站候选包络；必须前维护，不能套用只能上翻开盖的机型。管线尚未接现场'};
 const pipes=group(g,'robot-supply-waste-envelope');
 for(const [x,r,color] of [[-.19,.006,'#809697'],[-.15,.011,'#8c9186']]){
  const curve=new T.CatmullRomCurve3([[x,.60,-.312],[x,.34,-.312],[x,.17,-.29],[x,.17,-.25]].map(p=>new T.Vector3(...p)));
  const o=new T.Mesh(new T.TubeGeometry(curve,20,r,8,false),mat(color));o.name='robot-hose-design';pipes.add(o);
 }
 pipes.userData={siteConnection:false,note:'供水/排水仅在柜后独立服务区预留；污水接入、防臭回流及电源须确认'};
 const robot=group(g,'balcony-cleaning-robot',0,0,.115);
 cylinder(robot,'robot-main-body',0,.065,0,.175,.10,white);cylinder(robot,'robot-lidar',0,.13,-.025,.036,.03,white);
 cylinder(robot,'robot-top-cover',0,.117,0,.145,.005,warm);box(robot,'robot-front-sensor',0,.079,.171,.09,.025,.006,dark);
 robot.userData={diameter:.35,height:.145,simulationOnly:true};
 let robotOut=false,doorOpen=false,maintenance=false;
 const setRackFraction=t=>{door.position.z=T.MathUtils.clamp(t,0,1)*s.cleaningRack.travel;model.updateMatrixWorld(true);};
 const setMaintenanceFraction=t=>{t=T.MathUtils.clamp(t,0,1);window.balconyLayoutDebug?.setMaintenanceClear(Math.min(t*2,1));cassette.position.z=-.025+Math.max(0,t*2-1)*.20;model.updateMatrixWorld(true);};
 model.updateMatrixWorld(true);
 return {group:g,toolBay,robot,door,storage,dock,lid,cassette,pipes,setRackFraction,setMaintenanceFraction,get maintenance(){return maintenance;},setMaintenance(open){maintenance=Boolean(open);setMaintenanceFraction(open?1:0);},get robotOut(){return robotOut;},get doorOpen(){return doorOpen;},setRobotOut(out){robotOut=Boolean(out);robot.position.z=.115+(out?s.robot.travel:0);model.updateMatrixWorld(true);},setDoorOpen(open){doorOpen=Boolean(open);setRackFraction(open?1:0);}};
}
