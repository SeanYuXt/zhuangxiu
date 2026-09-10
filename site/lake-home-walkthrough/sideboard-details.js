import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {finishWoodPanel} from './cabinet-finishes.js';
import {makeCup,makePlate} from './tableware-details.js';

const wood=new T.MeshStandardMaterial({color:'#c5b696',roughness:.7}),metal=new T.MeshStandardMaterial({color:'#969d97',roughness:.3,metalness:.85}),dark=new T.MeshStandardMaterial({color:'#444b46',roughness:.8}),linen=new T.MeshStandardMaterial({color:'#c7c1b3',roughness:.95});
const group=(p,n,pos=[0,0,0])=>{const g=new T.Group();g.name=n;g.position.fromArray(pos);p.add(g);return g;};
function box(p,n,pos,size,mat=wood){const o=new T.Mesh(new RoundedBoxGeometry(...size,2,Math.min(.002,...size.map(v=>v/4))),mat);o.name=n;o.position.fromArray(pos);o.castShadow=o.receiveShadow=true;p.add(o);if(mat===wood)finishWoodPanel(o,{interior:true});return o;}
function place(parent,o,pos){o.position.fromArray(pos);parent.add(o);return o;}
const centers=[-1.625,-.975,-.325,.325,.975,1.625];
function doorHinge(parent,door,name,center,width,front,sign){
 const g=group(parent,name,[center-sign*width/2,0,front]);parent.updateMatrixWorld(true);g.attach(door);
 for(const y of door.name.includes('-upper-')?[1.9,2.29]:[.19,.50]){
  box(g,name+'-arm',[sign*.028,y,-.012],[.056,.022,.014],metal);
  box(parent,name+'-mount',[center-sign*(width/2-.018),y,front-.040],[.018,.041,.045],metal);
 }
 g.userData={direction:sign,nominalWidth:width,hardwareSelected:false};return g;
}
function coordinateUpperCabinet(cabinet,upper){
 // Deliberate joinery redesign, not group scaling: keep each board thickness,
 // depth, width and lower edge. Remove the top storage tier and disclose capacity.
 const setHeight=(o,bottom,top)=>{if(!o)throw Error('Missing upper joinery panel');o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,w=b.max.x-b.min.x,d=b.max.z-b.min.z;o.geometry.dispose();o.geometry=new T.BoxGeometry(w,top-bottom,d);o.position.y=(bottom+top)/2;};
 setHeight(cabinet.getObjectByName('mesh_642'),.08,2.41);
 const top=upper.getObjectByName('mesh_697');top.position.y=2.401;
 for(let i=698;i<=704;i++)setHeight(upper.getObjectByName('mesh_'+i),1.793,2.392);
 for(let i=0;i<6;i++)setHeight(upper.getObjectByName('sideboard-upper-extended-door-'+i),1.750,2.406);
 cabinet.userData={...cabinet.userData,ceilingCoordination:'cabinet-header-20260906',overallHeight:2.41,upperDoorHeight:.656,upperFingerLip:.025,removedStorage:'Former top seasonal tier removed, no claim of unchanged capacity',upperClearHeight:.599,previousUpperClearHeight:.959};
}
function drawerContents(tray,index,x){
 const content=group(tray,'sideboard-drawer-contents-'+index);
 if(index<2){
  for(let n=0;n<4;n++){
   const cx=x-.21+n*.14;box(content,'cutlery-partition',[cx,.704,-.01],[.010,.080,.40]);
   for(let j=0;j<3;j++){
    box(content,index?'tea-tool-grip':'cutlery-grip',[cx+.046,.670+j*.008,.038],[.015,.005,.17],metal);
    const spoon=new T.Mesh(new T.SphereGeometry(.022,12,8),metal);spoon.name='cutlery-bowl';spoon.scale.set(.65,.10,1);spoon.position.set(cx+.046,.673+j*.008,-.06);content.add(spoon);
   }
  }
 }else if(index===2){for(const dx of [-.15,0,.15])for(const z of [-.10,.085])place(content,makeCup('sideboard-teacup',{radius:.034,height:.067,handle:false}),[x+dx,.663,z]);}
 else if(index===3){for(let j=0;j<3;j++)box(content,'folded-table-linen',[x,.676+j*.026,-.02],[.37,.024,.28],linen);}
 else{for(const dx of [-.15,.15])box(content,index===4?'sealed-tea-box':'food-bag-organizer',[x+dx,.700,-.01],[.22,.074,.35],index===4?wood:linen);}
 return content;
}

export function refineSideboard(model){
 const cabinet=model.getObjectByName('flush-sideboard'),base=cabinet?.getObjectByName('sideboard-base-storage'),upper=cabinet?.getObjectByName('sideboard-upper-storage'),bank=cabinet?.getObjectByName('sideboard-drawer-bank');
 if(!base||!upper||!bank)throw Error('Missing named sideboard baseline');model.updateMatrixWorld(true);
 coordinateUpperCabinet(cabinet,upper);
 const drawers=[],doors={base:[],upper:[]},compartments=[];
 for(const root of [base,upper])for(const o of root.children)if(o.isMesh&&!o.name.includes('bevel')&&!o.name.includes('extended-door'))finishWoodPanel(o,{interior:true});
 // These inspected baseline panels are the back, workzone lining and service-pier carcass.
 for(const name of ['mesh_642','mesh_714','mesh_716','mesh_718']){const o=cabinet.getObjectByName(name);if(!o)throw Error('Sideboard baseline changed: '+name);finishWoodPanel(o,{interior:true});}
 cabinet.getObjectByName('sideboard-open-workzone').children.filter(o=>o.isMesh&&o.name!=='sideboard-recessed-task-light').forEach(o=>finishWoodPanel(o,{interior:true}));
 for(let i=0;i<6;i++){
  const x=centers[i],sign=i%2?-1:1,front=bank.getObjectByName('sideboard-drawer-bevel-'+i),tray=bank.getObjectByName('sideboard-drawer-tray-'+i);
  if(!front||!tray)throw Error('Missing matched sideboard drawer '+i);
  const d=group(bank,'sideboard-drawer-'+i);d.attach(front);d.attach(tray);tray.traverse(o=>{if(o.isMesh)finishWoodPanel(o,{interior:true});});drawerContents(tray,i,x);drawers.push(d);
  for(const side of [-1,1]){
   box(bank,'sideboard-fixed-runner',[x+side*.305,.674,-.01],[.012,.023,.47],metal);
   box(d,'sideboard-moving-runner',[x+side*.295,.674,-.01],[.007,.019,.47],metal);
  }
  for(const [band,root,z,w] of [['base',base,.298,.646],['upper',upper,.057,.646]]){
   const face=root.getObjectByName(band==='base'?'sideboard-base-bevel-'+i:'sideboard-upper-extended-door-'+i);
   if(!face)throw Error('Missing sideboard face '+band+i);doors[band].push(doorHinge(root,face,'sideboard-'+band+'-door-'+i,x,w,z,sign));
  }
  const low=group(base,'sideboard-lower-contents-'+i);box(low,'sideboard-adjustable-shelf',[x,.335,-.02],[.620,.018,.49]);
  if(i<3){for(const y of [.10,.345])for(let j=0;j<5;j++)place(low,makePlate('sideboard-stacked-plate',i===2?.11:.13),[x,y+j*.013,-.04]);}
  else if(i===3){for(const y of [.10,.345])for(const dx of [-.14,.14])place(low,makeCup('sideboard-breakfast-mug'),[x+dx,y,.01]);}
  else{for(const y of [.185,.43])box(low,i===4?'small-appliance-case':'spare-table-linen-box',[x,y,-.015],[.48,.16,.38],i===4?dark:linen);}
  const high=group(upper,'sideboard-upper-contents-'+i);box(high,'sideboard-upper-adjustable-shelf',[x,2.10,-.137],[.620,.018,.286]);
  for(const y of [1.794,2.110])for(const dx of [-.19,0,.19])place(high,makeCup('sideboard-upper-cup',{radius:.034,height:.11,handle:false}),[x+dx,y,-.13]);
  compartments.push({id:i,clearWidth:.632,lowerClearDepth:.49,upperClearDepth:.286,upperTierClearHeights:[.298,.283],drawerUseful:[.564,.118,.456],contents:['餐具','茶工具','茶杯','桌布餐巾','茶叶盒','保鲜用品'][i]});
 }
 // Keep the appliance face fixed and flush. Service isolation is accessible
 // through the existing 120mm left pier, not hidden behind the appliance.
 const face=cabinet.getObjectByName('dispenser-flush-face'),pier=cabinet.getObjectByName('mesh_714'),pierFront=cabinet.getObjectByName('mesh_715');
 if(!face||!pier||!pierFront)throw Error('Dispenser service pier baseline changed');pier.removeFromParent();
 const cap=cabinet.getObjectByName('mesh_718');cap.geometry=cap.geometry.clone();cap.geometry.scale(1,1,.551/.56);cap.position.z=-.0045;finishWoodPanel(cap,{interior:true,refresh:true});
 const pierCase=group(cabinet,'dispenser-service-pier');
 box(pierCase,'service-pier-left',[1.306,1.3275,-.0045],[.012,.845,.551]);
 box(pierCase,'service-pier-back',[1.36,1.3275,-.274],[.096,.845,.012]);
 for(const y of [.911,1.744])box(pierCase,'service-pier-end',[1.36,y,0],[.096,.012,.536]);
 // Pipe/cable penetration reserves in the inside face; cabinet only, no wall drilling.
 const ys=[.905,1.36,1.38,1.59,1.61,1.75],zs=[-.28,-.19,-.17,-.15,-.13,.271];
 for(let iy=0;iy<ys.length-1;iy++)for(let iz=0;iz<zs.length-1;iz++){
  const y=(ys[iy]+ys[iy+1])/2,z=(zs[iz]+zs[iz+1])/2;
  if((y>1.36&&y<1.38&&z>-.15&&z<-.13)||(y>1.59&&y<1.61&&z>-.19&&z<-.17))continue;
  box(pierCase,'service-pier-right',[1.414,y,z],[.012,ys[iy+1]-ys[iy],zs[iz+1]-zs[iz]]);
 }
 box(pierCase,'service-pier-wet-dry-divider',[1.36,1.30,.075],[.096,.012,.386]);
 for(const y of [1.053,1.087])box(pierCase,'service-valve-mount',[1.36,y,.1845],[.096,.008,.016],metal);
 for(const y of [1.57,1.63])box(pierCase,'service-power-mount',[1.36,y,.208],[.096,.012,.018],metal);
 const serviceFace=group(cabinet,'dispenser-service-door',[1.30,0,.298]);cabinet.updateMatrixWorld(true);serviceFace.attach(pierFront);
 for(const y of [1.01,1.64]){const pin=new T.Mesh(new T.CylinderGeometry(.004,.004,.026,18),metal);pin.name='service-pier-hinge';pin.position.set(.007,y,-.005);serviceFace.add(pin);}
 const service=group(cabinet,'dispenser-service-reserve');
 box(service,'dispenser-isolation-valve',[1.36,1.07,.22],[.045,.047,.055],metal);
 box(service,'dispenser-water-valve-lever',[1.36,1.096,.245],[.063,.012,.025],dark);
 box(service,'dispenser-capped-feed-port',[1.36,1.10,.21],[.018,.026,.026],dark);
 box(service,'dispenser-dry-power-reserve',[1.36,1.60,.225],[.068,.074,.016],linen);
 box(service,'dispenser-power-splash-cover',[1.36,1.60,.243],[.076,.084,.015],dark);
 box(service,'dispenser-service-leak-sensor',[1.36,.924,.20],[.044,.014,.038],linen);
 for(const [name,pts,r] of [
  ['dispenser-capped-water-tail',[[1.36,1.07,.195],[1.36,1.07,-.14],[1.36,1.37,-.14],[1.51,1.37,-.14],[1.51,1.37,-.018]],.003],
  ['dispenser-unconnected-cable-tail',[[1.36,1.60,.215],[1.36,1.60,-.18],[1.70,1.60,-.18],[1.70,1.60,-.018]],.0035]
 ]){const line=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)),false,'catmullrom',0),48,r,8,false),name.includes('water')?linen:dark);line.name=name;service.add(line);}
 service.userData={waterConnection:null,powerConnection:null,live:false,clearOpeningWidth:.096,frontAccess:'使用检修吸盘打开左侧窄门，无外露把手/反弹器。水下电上、隔板分开。仅柜内短管/线尾预留；未接建筑给水或电源，非设备拆装完成',protectionCertified:false};
 const state={drawer:-1,base:-1,upper:-1,service:false};
 function setDrawer(index,fraction=1){drawers.forEach((g,i)=>g.position.z=i===index?.42*T.MathUtils.clamp(fraction,0,1):0);state.drawer=index;model.updateMatrixWorld(true);}
 function setDoor(band,index,fraction=1){if(!doors[band])throw Error('Invalid cabinet band');doors[band].forEach((g,i)=>{
  const t=i===index?T.MathUtils.clamp(fraction,0,1):0;
  g.rotation.y=-g.userData.direction*Math.PI/2*t;
 });state[band]=index;model.updateMatrixWorld(true);}
 function setService(value){const t=T.MathUtils.clamp(Number(value),0,1);serviceFace.rotation.y=-Math.PI/2*t;state.service=t>0;model.updateMatrixWorld(true);}
 function reset(){setDrawer(-1);setDoor('base',-1);setDoor('upper',-1);setService(false);}
 cabinet.userData={...cabinet.userData,storageCompartments:compartments,hardwareSelected:false,openingUse:'上柜保留25mm下延手扣，90°平开、无反弹器。改两层储物、取消最高低频层；实际铰链承重及安装待选。'};
 return {cabinet,drawers,doors,service,serviceFace,pierCase,state,compartments,setDrawer,setDoor,setService,reset};
}
