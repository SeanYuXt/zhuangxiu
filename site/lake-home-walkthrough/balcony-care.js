import * as T from './vendor/three.module.js';
import {balconyCare as spec,palette} from './design-spec.js';

// Proposed furniture only: no selected robot, pipe connection, structural work or live power.
export function addBalconyCare(model){
 const g=new T.Group();g.name='balcony-care-cabinet';g.position.fromArray(spec.position);g.rotation.y=spec.rotation;model.add(g);
 g.userData={...spec,proposal:true,wetDrySeparated:true,robotBayClear:[.623,.839,.56],supply:null,waste:null,power:null};
 const material=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const warm=material(palette.cabinet),stone=material(palette.stone,.38),wood=material(palette.wood),white=material('#eeede6',.32),dark=material('#464d48'),steel=material('#91978e',.25,.8);
 const box=(p,name,x,y,z,w,h,d,mat)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
 const group=(name,x=0,y=0,z=0)=>{const o=new T.Group();o.name=name;o.position.set(x,y,z);g.add(o);return o;};
 const cyl=(p,name,x,y,z,r,h,mat)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,48),mat);o.name=name;o.position.set(x,y,z);o.castShadow=true;p.add(o);return o;};
 const tube=(p,name,points,r,mat)=>{const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v)));const o=new T.Mesh(new T.TubeGeometry(curve,32,r,10,false),mat);o.name=name;p.add(o);return o;};
 const lower=group('balcony-care-lower');
 for(const x of [-.641,0,.641])box(lower,'care-side-panel',x,.442,0,.018,.866,.58,warm);
 box(lower,'care-rear-panel',0,.438,-.283,1.264,.876,.014,warm);
 // One enclosed wet/service bay, one open floor-level robot bay: no shared trap space.
 box(lower,'wet-bay-bottom',.325,.13,0,.632,.018,.55,wood);
 box(lower,'robot-bay-ceiling',-.325,.853,0,.632,.028,.56,warm);
 const door=group('balcony-care-service-door',.632,.17,.296);
 box(door,'care-door-face',-.316,.343,0,.628,.686,.018,warm);
 box(door,'care-door-finger-recess',-.316,.676,-.011,.56,.012,.022,dark);
 // No shallow drawer above the dock: maintain 289mm clear over its closed lid.
 // A real open countertop cutout, not a white ellipse placed on a solid slab.
 const shape=new T.Shape(),w=spec.width/2,d=spec.depth/2,r=.012;
 shape.moveTo(-w+r,-d);shape.lineTo(w-r,-d);shape.quadraticCurveTo(w,-d,w,-d+r);shape.lineTo(w,d-r);shape.quadraticCurveTo(w,d,w-r,d);shape.lineTo(-w+r,d);shape.quadraticCurveTo(-w,d,-w,d-r);shape.lineTo(-w,-d+r);shape.quadraticCurveTo(-w,-d,-w+r,-d);
 const hole=new T.Path();hole.moveTo(.095,-.15);hole.lineTo(.095,.19);hole.lineTo(.555,.19);hole.lineTo(.555,-.15);hole.closePath();shape.holes.push(hole);
 const top=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:false}),stone);top.name='balcony-care-worktop';top.rotation.x=Math.PI/2;top.position.y=spec.top;top.castShadow=true;top.receiveShadow=true;g.add(top);
 const sink=group('balcony-care-sink');
 const quad=(a,b,c,d)=>{const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));geo.computeVertexNormals();const mat=white.clone();mat.side=T.DoubleSide;sink.add(new T.Mesh(geo,mat));};
 const outer=[[.095,.898,-.15],[.555,.898,-.15],[.555,.898,.19],[.095,.898,.19]],inner=[[.14,.748,-.105],[.51,.748,-.105],[.51,.748,.145],[.14,.748,.145]];
 for(let i=0;i<4;i++)quad(outer[i],outer[(i+1)%4],inner[(i+1)%4],inner[i]);
 box(sink,'sink-bowl-floor',.325,.743,.02,.37,.010,.25,white);
 cyl(sink,'sink-drain',.325,.750,.02,.022,.002,steel);
 tube(sink,'brushed-faucet',[[.325,.901,-.235],[.325,1.10,-.235],[.325,1.16,-.18],[.325,1.13,-.08]],.012,steel);
 box(sink,'faucet-lever',.36,1.015,-.235,.075,.012,.024,steel);
 sink.userData={bowlOpening:[.46,.34],bowlDepth:.15,notSitePlumbed:true};
 const services=group('balcony-care-services');
 tube(services,'sink-trap-design',[[.325,.739,.02],[.325,.61,.02],[.325,.53,.02],[.43,.52,.02],[.48,.59,-.04],[.48,.60,-.24]],.018,white);
 box(services,'wet-bay-service-cover',.325,.43,-.257,.48,.45,.024,wood);
 for(const x of [.18,.25]){cyl(services,'capped-water-connection',x,.64,-.22,.014,.06,steel);box(services,'valve-handle',x,.672,-.22,.025,.007,.022,dark);}
 services.userData={supply:null,waste:null,note:'角阀/存水弯仅为独立湿仓内布置；未确认另一侧阳台接入点或跨区管路'};
 // Removable household basin stored in the wet bay, never in the robot exit.
 const basin=group('balcony-folding-basin',.325,.145,.02);
 const ring=new T.Mesh(new T.TorusGeometry(.18,.018,12,48),wood);ring.rotation.x=Math.PI/2;ring.position.y=.075;basin.add(ring);
 cyl(basin,'folding-basin-base',0,.012,0,.15,.022,wood);
 for(const y of [.03,.052]){const rib=new T.Mesh(new T.TorusGeometry(.15+y/3,.009,10,48),warm);rib.rotation.x=Math.PI/2;rib.position.y=y;basin.add(rib);}
 const dock=group('balcony-robot-dock',-.325,0,0);
 box(dock,'dock-rear-housing',0,.30,-.19,.42,.50,.14,white);
 const serviceShell=new T.Group();serviceShell.name='dock-service-shell';dock.add(serviceShell);
 for(const x of [-.202,.202])box(serviceShell,'dock-service-side',x,.451,-.07,.016,.182,.24,white);
 box(serviceShell,'dock-service-bottom',0,.362,-.07,.40,.012,.24,white);
 const lid=new T.Group();lid.name='dock-service-lid';lid.position.set(0,.556,-.108);dock.add(lid);
 box(lid,'dock-lid-panel',0,0,.08,.42,.010,.16,white);
 const cassette=new T.Group();cassette.name='dock-removable-service-cassette';cassette.position.set(0,.438,-.025);dock.add(cassette);
 box(cassette,'dock-service-cassette-base',0,-.063,0,.34,.008,.18,warm);
 for(const x of [-.166,.166])box(cassette,'dock-service-cassette-side',x,0,0,.008,.126,.18,warm);
 for(const z of [-.086,.086])box(cassette,'dock-service-cassette-end',0,0,z,.34,.126,.008,warm);
 box(cassette,'dock-service-cassette-grip',0,.039,.096,.10,.022,.016,dark);
 for(const x of [-.20,.20])box(dock,'dock-side-cheek',x,.175,-.07,.020,.27,.25,white);
 box(dock,'dock-cleaning-tray',0,.015,.012,.405,.025,.53,dark);
 box(dock,'dock-status-display',0,.521,-.114,.11,.022,.008,dark);
 const ledMat=new T.MeshStandardMaterial({color:'#b6c5b2',emissive:'#b6c5b2',emissiveIntensity:.3});box(dock,'dock-indicator',0,.522,-.109,.04,.004,.002,ledMat);
 dock.userData={modelSelected:false,designEnvelope:[.42,.55,.54],overheadClearance:.289,autoWater:true,waterConnectionConfirmed:false,note:'概念检修动作：停机后上盖约80°开启、无管线的耗材盒前抽200mm；不移动有水管的基站，不代表已选机型支持此方式'};
 const robot=group('balcony-cleaning-robot',-.325,0,.085);
 cyl(robot,'robot-main-body',0,.065,0,.175,.10,white);cyl(robot,'robot-lidar',0,.13,-.025,.036,.03,white);
 cyl(robot,'robot-top-cover',0,.117,0,.145,.005,warm);box(robot,'robot-front-sensor',0,.079,.171,.09,.025,.006,dark);
 robot.userData={diameter:.35,height:.145,simulationOnly:true};
 // Continuous backsplash and shallow wall cabinet keep the floor visually open.
 box(g,'balcony-care-backsplash',0,1.19,-.295,1.30,.56,.01,stone);
 const upper=group('balcony-care-upper');
 box(upper,'upper-carcass',0,1.855,-.18,1.30,.67,.22,warm);
 box(upper,'upper-opaque-door',-.325,1.855,-.063,.631,.654,.016,warm);
 const mirror=material('#bac7c1',.12,.9);box(upper,'upper-mirror-door',.325,1.855,-.062,.627,.65,.018,mirror);
 box(upper,'upper-wood-reveal',0,1.514,-.17,1.28,.018,.21,wood);
 const taskLight=new T.MeshStandardMaterial({color:'#f5e9ce',emissive:'#ffe6bf',emissiveIntensity:.55});box(upper,'balcony-care-task-light',0,1.501,-.15,1.12,.008,.022,taskLight);
 upper.userData={depth:.22,mirror:'环境反射近似，非实时镜面',taskLight:'暖白任务光示意，防水等级/照度/供电未选型'};
 const objects=group('balcony-care-everyday');
 cyl(objects,'soap-bottle',.04,.98,-.18,.032,.14,wood);box(objects,'soap-pump',.05,1.059,-.18,.055,.02,.015,dark);
 for(let i=0;i<3;i++)box(objects,'folded-towel',-.19,.918+i*.025,-.1,.29,.024,.20,white);
 // Relocate only the previously identified free-standing planter; no room geometry changes.
 const plants=[];model.traverse(o=>{if(o.children.length===29&&Math.abs(o.position.x-6.64)<.01&&Math.abs(o.position.z-.93)<.01)plants.push(o);});
 if(plants.length!==1)throw Error('原阳台盆栽定位不唯一，停止避免误移对象');
 const plant=plants[0];plant.removeFromParent();plant.name='balcony-care-greenery';plant.position.set(-.49,.903,-.13);plant.scale.setScalar(.40);g.add(plant);
 model.updateMatrixWorld(true);
 let robotOut=false,doorOpen=false,maintenance=false;
 const setMaintenanceFraction=t=>{lid.rotation.x=-Math.PI*80/180*Math.min(t*2,1);cassette.position.z=-.025+Math.max(0,t*2-1)*.20;model.updateMatrixWorld(true);};
 return {group:g,robot,door,lid,cassette,get maintenance(){return maintenance;},setMaintenance(open){maintenance=open;setMaintenanceFraction(open?1:0);},setMaintenanceFraction,get robotOut(){return robotOut;},get doorOpen(){return doorOpen;},setRobotOut(out){robotOut=out;robot.position.z=.085+(out?spec.robotTravel:0);model.updateMatrixWorld(true);},setDoorOpen(open){doorOpen=open;door.rotation.y=open?Math.PI/2:0;model.updateMatrixWorld(true);}};
}
