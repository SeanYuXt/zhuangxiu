import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {finishWoodPanel} from './cabinet-finishes.js';

const finish=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const m={inside:finish('#c8b79d'),front:finish('#c8c5ba'),stone:finish('#ddd9cf',.55),metal:finish('#8a918d',.3,.8),dark:finish('#525953'),ceramic:finish('#e6e0d3',.25),rubber:finish('#62665f',.95),cloth:finish('#a1aa98',.96)};
function group(parent,name,pos=[0,0,0],rotation=0){const g=new T.Group();g.name=name;g.position.fromArray(pos);g.rotation.y=rotation;parent.add(g);return g;}
function box(parent,name,x,y,z,w,h,d,material=m.inside,r=.002){const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/5,h/5,d/5)),material);o.name=name;o.position.set(x,y+h/2,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(material===m.inside)finishWoodPanel(o,{interior:true});return o;}
function cylinder(parent,name,x,y,z,r,h,material=m.metal){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,32),material);o.name=name;o.position.set(x,y+h/2,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function pipe(parent,name,points,r=.019,material=m.metal){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal'),o=new T.Mesh(new T.TubeGeometry(curve,36,r,8,false),material);o.name=name;o.castShadow=true;parent.add(o);return o;}
function vessel(parent,name,x,y,z,r,h,material=m.ceramic){
 const profile=[[0,0],[r*.8,0],[r,h*.25],[r,h],[r-.004,h],[r-.004,h*.25],[r*.75,.005],[0,.005]].map(p=>new T.Vector2(...p));
 const o=new T.Mesh(new T.LatheGeometry(profile,40),material);o.position.set(x,y,z);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
}
function contents(parent,kind,w,y){
 if(kind==='cutlery'){
  for(let i=0;i<5;i++){
   const x=-w/2+.10+i*(w-.20)/4;
   box(parent,'cutlery-divider',x,y,-.01,.009,.032,.36,m.inside);
   box(parent,'cutlery-handle',x+.030,y+.009,-.015,.012,.005,.18,m.metal);
   const head=cylinder(parent,'spoon-bowl',x+.03,y+.014,-.112,.018,.005);head.scale.z=1.35;
  }
 }else if(kind==='plates'){
  for(const x of [-w*.23,w*.23])for(let i=0;i<4;i++)vessel(parent,'stacked-plate',x,y+i*.015,0,.115,.025);
 }else if(kind==='pots'){
  for(const z of [-.112,.112]){
   vessel(parent,'saucepan',0,y,z,.10,.135,m.metal);
   for(const x of [-.118,.118])box(parent,'pan-handle',x,y+.078,z,.058,.018,.035,m.dark,.005);
   cylinder(parent,'pan-lid',0,y+.134,z,.101,.008);box(parent,'lid-grip',0,y+.142,z,.054,.025,.021,m.dark,.006);
  }
 }else{
  for(let i=0;i<3;i++)box(parent,'folded-kitchen-cloth',0,y+i*.034,0,w*.63,.031,.28,m.cloth,.008);
 }
}
function drawer(parent,name,w,low,high,kind){
 const g=group(parent,name),insideW=w-.08,frontH=high-low;
 box(g,name+'-bottom',0,low+.020,0,insideW,.015,.49);
 for(const x of [-insideW/2+.008,insideW/2-.008])box(g,name+'-side',x,low+.035,0,.016,frontH-.055,.49);
 for(const z of [-.237,.237])box(g,name+'-box-end',0,low+.035,z,insideW-.032,frontH-.055,.016);
 // Sloping recessed top handgrip; no exposed ring handle or push spring.
 const h=frontH-.004,profile=new T.Shape();profile.moveTo(.28,low);profile.lineTo(.30,low);profile.lineTo(.30,low+h-.014);profile.lineTo(.286,low+h);profile.lineTo(.28,low+h);profile.closePath();
 const geom=new T.ExtrudeGeometry(profile,{depth:w-.006,bevelEnabled:false});geom.rotateY(Math.PI/2);geom.translate(-(w-.006)/2,0,0);
 // Shape x becomes -z after rotation; invert its depth coordinate to face +z.
 geom.scale(1,1,-1);const index=geom.index;if(index){for(let i=0;i<index.count;i+=3){const b=index.getX(i+1);index.setX(i+1,index.getX(i+2));index.setX(i+2,b);}}else{
  for(const attr of Object.values(geom.attributes))for(let i=0;i<attr.count;i+=3)for(let k=0;k<attr.itemSize;k++){const a=(i+1)*attr.itemSize+k,b=(i+2)*attr.itemSize+k,t=attr.array[a];attr.array[a]=attr.array[b];attr.array[b]=t;}
 }geom.computeVertexNormals();
 const front=new T.Mesh(geom,m.front);front.name=name+'-45-degree-front';front.castShadow=true;front.receiveShadow=true;g.add(front);
 contents(g,kind,insideW,low+.036);g.userData={travel:.40,kind,hardwareVerified:false};return g;
}

export function reviseKitchen(model){
 const cooking=model.getObjectByName('kitchen-cooking-cabinets'),sinkCab=model.getObjectByName('kitchen-sink-cabinets');
 if(!cooking||!sinkCab)throw Error('Missing original kitchen');if(cooking.userData.revision)return null;
 model.updateMatrixWorld(true);const sink=model.getObjectByName('kitchen-sink'),hob=model.getObjectByName('kitchen-hob'),hood=model.getObjectByName('kitchen-hood');
 const baseline=group(model,'kitchen-original-baseline');baseline.visible=false;
 const stone=cooking.children[1].material.clone();stone.color.set('#d4d0c5');
 for(const o of [...cooking.children])if(o!==hob&&o!==hood)baseline.attach(o);
 for(const o of [...sinkCab.children])if(o!==sink)baseline.attach(o);
 const moving=[],staticRoot=group(cooking,'kitchen-base-carcasses');
 // West leg starts after the north counter, respecting the actual stepped room wall.
 box(cooking,'kitchen-west-worktop',0,.86,(2.503+4.87)/2-3.54,.61,.04,4.87-2.503,stone,.002);
 const modules=[{id:'prep',lo:2.52,hi:3.25,draws:[[.115,.385,'cloth'],[.405,.645,'plates'],[.665,.835,'cutlery']]},
  {id:'hob',lo:3.25,hi:4.03,draws:[[.115,.385,'pots'],[.405,.665,'plates']]},
  {id:'pots',lo:4.03,hi:4.85,draws:[[.115,.445,'pots'],[.465,.835,'pots']]}];
 for(const s of modules){
  const w=s.hi-s.lo-.004,g=group(staticRoot,'kitchen-'+s.id+'-module',[0,0,(s.lo+s.hi)/2-3.54],Math.PI/2);
  for(const x of [-w/2+.009,w/2-.009])box(g,s.id+'-carcass-side',x,.105,0,.018,.737,.56);
  box(g,s.id+'-carcass-back',0,.105,-.271,w-.036,.737,.018);
  box(g,s.id+'-carcass-bottom',0,.087,0,w,.018,.56);
  box(g,s.id+'-front-brace',0,.842,.24,w,.018,.060);
  box(g,s.id+'-rear-brace',0,.842,-.24,w,.018,.060);
  box(g,s.id+'-toe-kick',0,.018,.235,w,.069,.018,m.dark);
  for(const [i,[low,high,kind]] of s.draws.entries()){
   const d=drawer(g,'kitchen-'+s.id+'-drawer-'+i,w,low,high,kind);moving.push(d);
   for(const x of [-w/2+.031,w/2-.031])box(g,s.id+'-runner-envelope',x,low+.020,-.012,.011,.013,.47,m.metal);
  }
  if(s.id==='hob'){
   box(g,'hob-service-fascia',0,.690,.289,w-.006,.143,.022,m.front);
   box(g,'hob-underbody-separation',0,.780,0,w-.04,.018,.50,m.metal);
  }
 }
 // North worktop: 1900 x 595, same real 550 x 390 sink aperture.
 const x0=3.81-4.86,x1=5.71-4.86,z0=1.905-2.17,z1=2.50-2.17;
 for(const [lo,hi] of [[x0,-.275],[.275,x1]])box(sinkCab,'kitchen-sink-counter-side',(lo+hi)/2,.86,(z0+z1)/2,hi-lo,.04,z1-z0,stone);
 for(const [lo,hi] of [[z0,-.195],[.195,z1]])box(sinkCab,'kitchen-sink-counter-end',0,.86,(lo+hi)/2,.55,.04,hi-lo,stone);
 box(model,'kitchen-counter-joint',4.03,.86,2.5015,.61,.04,.003,m.rubber,.0005);
 const north=group(sinkCab,'kitchen-north-carcass'),left=3.82-4.86,right=5.695-4.86,depth=.555,cz=(1.92+2.475)/2-2.17;
 box(north,'sink-carcass-bottom',(left+right)/2,.087,cz,right-left,.018,depth);
 for(const x of [left+.009,-.525,.545,right-.009]){
  box(north,'sink-carcass-partition',x,.105,cz,.018,.703,depth);
  // Front upper notch accepts the recessed hand-pull rail; rear reaches the stone.
  box(north,'sink-carcass-upper-rear',x,.808,cz-.030,.018,.052,depth-.060);
 }
 for(const [lo,hi] of [[left,-.32],[.32,right]])box(north,'sink-carcass-back-side',(lo+hi)/2,.105,1.929-2.17,hi-lo,.737,.018);
 box(north,'sink-carcass-back-lower',0,.105,1.929-2.17,.64,.145,.018);
 box(north,'sink-carcass-back-upper',0,.80,1.929-2.17,.64,.042,.018);
 box(north,'sink-toe-kick',(left+right)/2,.018,.255,right-left,.069,.018,m.dark);
 // Keep the left hinge clear of perpendicular prep drawers. Cover the partitions
 // with matching fixed stiles instead of moving the hinge into the corner.
 box(north,'sealed-blind-corner-front',(left-.514)/2,.107,.316,-.514-left,.731,.018,m.front);
 box(north,'sink-divider-cover-stile',(.534+.563)/2,.107,.316,.029,.731,.018,m.front);
 box(north,'sink-right-end-stile',(.823+right)/2,.107,.316,right-.823,.731,.018,m.front);
 const pull=group(north,'sink-recessed-pull-rail');
 const rail=finish('#75786e',.38,.65),railWidth=right-left;
 box(pull,'sink-pull-rail-back',(left+right)/2,.814,.2465,railWidth,.044,.003,rail,.0006);
 box(pull,'sink-pull-rail-bottom',(left+right)/2,.814,.274,railWidth,.003,.058,rail,.0006);
 box(pull,'sink-pull-rail-top',(left+right)/2,.858,.279,railWidth,.002,.068,rail,.0006);
 pull.userData={type:'continuous-recessed-edge-pull',doorTop:.838,worktopUnderside:.860,clearOpeningHeight:.020,siteHardwareVerified:false};
 const services=group(north,'kitchen-sink-service-bay');
 pipe(services,'sink-waste-tail',[[0,.713,0],[0,.49,0],[0,.38,-.035],[.10,.36,-.045],[.17,.43,-.045],[.17,.49,-.17],[.17,.49,-.218]],.02,m.dark);
 for(const x of [-.24,.26]){
  cylinder(services,'sink-isolation-valve',x,.40,-.20,.023,.034);
  box(services,'valve-handle',x,.434,-.20,.060,.013,.018,m.metal);
  pipe(services,'tap-supply-hose',[[x,.45,-.20],[x,.57,-.17],[x*.25,.71,-.23]],.006,m.metal);
 }
 box(services,'under-sink-waterproof-tray',0,.108,.028,1.024,.012,.51,m.rubber);
 box(services,'leak-sensor-concept',.38,.121,.13,.055,.018,.055,m.front,.009);
 for(const x of [-.35,.36]){
  vessel(services,'cleaning-bottle',x,.12,.045,.033,.18,m.ceramic);cylinder(services,'bottle-cap',x,.30,.045,.019,.022,m.dark);
 }
 services.userData={supplyConnection:null,wasteConnection:null,smartSensorConnected:false,status:'cabinet-side reserved services, not verified site hookups'};
 const doors=[];
 for(const [i,hinge,dir,width] of [[0,-.511,1,.5195],[1,.531,-1,.5195],[2,.820,-1,.254]]){
  // Front-face pivot keeps the complete 18mm panel ahead of adjacent fixed
  // stiles during opening. This is a design sweep, not a chosen hinge linkage.
  const g=group(north,'kitchen-sink-door-'+i,[hinge,0,.325]);
  box(g,'sink-door-panel',dir*width/2,.107,-.009,width,.731,.018,m.front);
  g.userData={turn:-dir,open:false,width,panelThickness:.018,hingeHardwareVerified:false};doors.push(g);
 }
 for(const y of [.115,.44,.70])box(north,'sink-right-storage-shelf',.678,y,.030,.25,.018,.49);
 for(let i=0;i<2;i++)box(north,'sink-spare-cloths',.678,.466+i*.055,.045,.21,.048,.28,m.cloth,.008);
 // Daily wash/prep stations live on the existing countertops, never in the aisle.
 const wash=group(sinkCab,'kitchen-wash-everyday',[.60,.90,.035]);
 box(wash,'kitchen-wash-tray-bottom',0,0,0,.27,.008,.14,m.ceramic,.007);
 for(const x of [-.13,.13])box(wash,'kitchen-wash-tray-end',x,.008,0,.010,.012,.14,m.ceramic,.003);
 for(const z of [-.065,.065])box(wash,'kitchen-wash-tray-side',0,.008,z,.25,.012,.01,m.ceramic,.003);
 const soapProfile=[[0,0],[.028,0],[.031,.008],[.031,.11],[.025,.132],[.013,.138],[.013,.153],[0,.153]].map(v=>new T.Vector2(...v));
 const soap=new T.Mesh(new T.LatheGeometry(soapProfile,48),m.dark);soap.name='kitchen-soap-dispenser';soap.position.set(-.075,.008,0);soap.castShadow=true;soap.receiveShadow=true;wash.add(soap);
 cylinder(wash,'kitchen-soap-pump-neck',-.075,.16,0,.012,.024);
 box(wash,'kitchen-soap-pump-nozzle',-.054,.184,0,.068,.012,.018,m.metal,.003);
 box(wash,'kitchen-sponge-holder-base',.045,.008,0,.10,.006,.105,m.metal);
 for(let i=0;i<5;i++)box(wash,'kitchen-sponge-holder-drain-rail',.006+i*.019,.014,0,.004,.004,.098,m.metal,.001);
 box(wash,'kitchen-cellulose-sponge',.045,.018,0,.087,.023,.061,m.cloth,.006);
 box(wash,'kitchen-sponge-scrub-face',.045,.041,0,.087,.003,.061,m.dark,.002);
 const prep=group(cooking,'kitchen-prep-everyday',[.015,.90,-.57]);
 box(prep,'kitchen-oak-cutting-board',0,0,0,.37,.022,.29,m.inside,.014);
 for(const x of [-.145,.145])for(const z of [-.11,.11])box(prep,'kitchen-board-foot',x,-.002,z,.035,.002,.018,m.rubber,.003);
 // Removable resting knife, off the hob. No invented powered appliance.
 const knife=group(prep,'kitchen-prep-knife',[.07,.023,0],-.18);
 const blade=new T.Shape();blade.moveTo(-.022,-.115);blade.quadraticCurveTo(.019,-.080,.025,.058);blade.lineTo(-.022,.058);blade.closePath();
 const knifeGeo=new T.ExtrudeGeometry(blade,{depth:.0016,bevelEnabled:true,bevelThickness:.0002,bevelSize:.0003,bevelSegments:1,steps:1});knifeGeo.rotateX(Math.PI/2);
 const bladeMesh=new T.Mesh(knifeGeo,m.metal);bladeMesh.name='kitchen-knife-blade';bladeMesh.position.y=.007;bladeMesh.castShadow=true;knife.add(bladeMesh);
 box(knife,'kitchen-knife-handle',-.002,0,.103,.025,.015,.092,m.dark,.005);
 for(const z of [.078,.12])cylinder(knife,'kitchen-knife-rivet',-.002,.015,z,.0025,.0007,m.metal);
 prep.userData={removable:true,boardSize:[.37,.29],note:'清洗后在原备餐段切配；刀具使用后归抽，不是儿童可及安全认证'};
 wash.userData={removable:true,traySize:[.27,.14],note:'可移洗手液与海绵托盘；未占550×390mm水槽开口或龙头操作位'};
 // Cosmetic shroud only; this is not an invented flue connection.
 const shroud=hood.children[1];hood.position.y=-.25;shroud.scale.y=.93/.68;shroud.position.y=2.515;
 hood.userData={...hood.userData,provisionalHobClearance:.699,exhaustConnection:null,productVerified:false,note:'lowered 250mm in design; exact clearance and flue require selected appliance/site confirmation'};
 cooking.userData={...cooking.userData,revision:'kitchen-functional-L',drawers:7};
 sinkCab.userData={...sinkCab.userData,worktop:[1.90,.595],blindCorner:true,sitePlumbingVerified:false};
 const state={drawer:-1,sinkDoors:false};
 const setDrawer=(index,fraction=1)=>{moving.forEach((o,i)=>o.position.z=i===index?.40*T.MathUtils.clamp(fraction,0,1):0);state.drawer=fraction>0?index:-1;model.updateMatrixWorld(true);};
 const setSinkFraction=t=>{doors.forEach(o=>o.rotation.y=o.userData.turn*T.MathUtils.clamp(t,0,1)*Math.PI/2);state.sinkDoors=t>0;model.updateMatrixWorld(true);};
 model.updateMatrixWorld(true);
 return {cooking,sinkCab,hood,services,moving,doors,state,setDrawer,setSinkFraction,setSinkDoors:open=>setSinkFraction(open?1:0),reset(){setDrawer(-1);setSinkFraction(0);}};
}
