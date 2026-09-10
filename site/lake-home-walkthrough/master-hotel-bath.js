import {mountOptimizedBath} from './master-optimized-bath.js?v=63';
import * as T from './vendor/three.module.js';
import {mountSeparateShower} from './master-separate-shower.js?v=separate-58';
import {mountCornerBath} from './master-corner-bath.js?v=corner-59';

export function mountHotelBath({scene,s,box,roundedFace,cylinder,M,white,metal,putty,fabric}){
 if(!s.design.bath.hotel)return null;
 if(s.design.bath.optimized)return mountOptimizedBath({scene,s,box,roundedFace,cylinder,M,white,metal,putty,fabric});
 const h=s.design.bath.hotelCandidate,b=s.design.bath,group=new T.Group();group.name='hotel-two-zone-bath';scene.add(group);
 const annotations=[],mirrors=[];
 const label=(views,title,detail,p)=>annotations.push({views,title,detail,p:new T.Vector3(...p)});
 const stone=M('#dbd7ce'),warm=M('#bdb6a7'),mirrorMat=new T.MeshStandardMaterial({color:'#e0e6e4',metalness:.92,roughness:.08});
 const light=new T.MeshStandardMaterial({color:'#fff7e7',emissive:'#fff1d5',emissiveIntensity:.9});
 const [x0,z0,x1,z1]=b.fixtures.washstand.r;
 // Basin faces +x: uses the existing enclosure side, never hollows out that enclosure.
 box('hotel-basin-carcass',[x0,z0,x1,z1],.32,.48,warm,group,.01);
 for(const y of [.34,.565])box('hotel-basin-drawer',[x1,z0+.018,x1+.009,z1-.018],y,.209,putty,group,.006);
 const bowl=[x0+.095,z0+.07,x1-.045,z1-.07];
 box('hotel-basin-back-rim',[x0,z0,bowl[0],z1],.80,.045,white,group);
 box('hotel-basin-front-rim',[bowl[2],z0,x1,z1],.80,.045,white,group,.01);
 for(const [a,c]of [[z0,bowl[1]],[bowl[3],z1]])box('hotel-basin-end-rim',[bowl[0],a,bowl[2],c],.80,.045,white,group,.01);
 box('hotel-basin-bowl',bowl,.745,.012,white,group,.008);
 for(const x of [bowl[0],bowl[2]-.008])box('hotel-basin-bowl-side',[x,bowl[1],x+.008,bowl[3]],.755,.045,white,group);
 for(const z of [bowl[1],bowl[3]-.008])box('hotel-basin-bowl-end',[bowl[0],z,bowl[2],z+.008],.755,.045,white,group);
 cylinder(x0+.045,.846,(z0+z1)/2,.015,.16,metal,group);
 box('hotel-faucet',[x0+.04,(z0+z1)/2-.012,x0+.17,(z0+z1)/2+.012],.986,.023,metal,group);
 box('hotel-wash-backsplash',[.452,z0,.47,z1],.85,.24,stone,group);
 for(const y of [1.09,1.34,1.59,1.90])box('hotel-mirror-shelf',[.46,z0,.59,z1],y,.018,white,group);
 for(const z of [z0,z1-.018])box('hotel-mirror-cabinet-side',[.46,z,.59,z+.018],1.09,.828,white,group);
 const mirror=roundedFace('hotel-wash-mirror',.595,1.115,z1-.012,z1-z0-.024,.78,.006,.035,mirrorMat,group);mirror.rotation.y=Math.PI/2;mirrors.push(mirror);
 for(const z of [z0+.026,z1-.038])box('hotel-mirror-light',[.605,z,.616,z+.012],1.18,.65,light,group,.003);
 const toiletries=new T.Group();toiletries.name='hotel-mirror-toiletries';group.add(toiletries);
 const sage=M('#91a596'),cream=M('#e5deca'),dark=M('#545a55');
 const jar=(name,x,y,z,r,height,material,parent=toiletries)=>{const o=cylinder(x,y,z,r,height,material,parent);o.name=name;return o;};
 const item=(name,r,y,height,material,parent=toiletries)=>box(name,r,y,height,material,parent,.003);
 // Lower shelf: two brushes in a cup, with toothpaste beside them.
 jar('toothbrush-cup',.53,1.108,z0+.10,.028,.085,cream);
 jar('toothbrush-cup-opening',.53,1.193,z0+.10,.023,.001,dark);
 for(const [i,z]of [z0+.09,z0+.112].entries()){
  jar('toothbrush-handle-'+i,.533,1.17,z,.004,.102,i?sage:white);
  item('toothbrush-head-'+i,[.526,z-.006,.537,z+.006],1.269,.024,i?sage:white);
  item('toothbrush-bristles-'+i,[.537,z-.005,.542,z+.005],1.271,.019,white);
 }
 item('toothpaste-cap',[.514,z0+.203,.542,z0+.229],1.108,.015,dark);
 item('toothpaste-tube',[.508,z0+.204,.548,z0+.228],1.123,.132,white);
 item('toothpaste-label',[.548,z0+.207,.549,z0+.225],1.157,.053,sage);
 // Middle shelf: skincare and a cream jar, entirely behind the mirror plane.
 for(const [i,z]of [z0+.10,z0+.22].entries()){
  jar('skincare-bottle-'+i,.53,1.358,z,.025,i?.151:.125,i?cream:sage);
  jar('skincare-cap-'+i,.53,i?1.509:1.483,z,.019,.020,dark);
  item('skincare-label-'+i,[.555,z-.016,.556,z+.016],1.385,.051,white);
 }
 jar('face-cream',.53,1.358,z0+.36,.031,.049,cream);
 jar('face-cream-lid',.53,1.407,z0+.36,.032,.012,dark);
 // Dry spare face towels on the upper shelf; no extra cabinet depth.
 for(let i=0;i<3;i++)item('folded-face-towel-'+i,[.478,z0+.066,.574,z0+.277],1.608+i*.027,.025,fabric);
 const soapPump=new T.Group();soapPump.name='hotel-basin-hand-soap';group.add(soapPump);
 const sx=x0+.047,sz=z1-.085;
 jar('hand-soap-bottle',sx,.845,sz,.03,.123,sage,soapPump);
 jar('hand-soap-neck',sx,.968,sz,.012,.02,dark,soapPump);
 jar('hand-soap-pump-stem',sx,.988,sz,.004,.016,dark,soapPump);
 item('hand-soap-pump',[sx-.008,sz-.008,sx+.036,sz+.008],1.004,.009,dark,soapPump);
 item('hand-soap-label',[sx+.029,sz-.018,sx+.031,sz+.018],.878,.05,cream,soapPump);
 box('hotel-hand-towel-rail',[.64,z0-.035,.83,z0-.022],1.0,.016,metal,group);
 box('hotel-hand-towel',[.66,z0-.048,.80,z0-.036],.67,.32,fabric,group);
 if(b.separate){
  scene.getObjectByName('hotel-hand-towel')?.removeFromParent();scene.getObjectByName('hotel-hand-towel-rail')?.removeFromParent();
  const mount=b.corner?mountCornerBath:mountSeparateShower;
  return mount({scene,s,group,box,cylinder,M,white,metal,putty,fabric,stone,warm,light,mirror,mirrorMat,mirrors,annotations,label});
 }
 // A single continuous warm wall finish; plain solid sliding leaf, no decorative glass.
 const partition=new T.Group();partition.name='hotel-partition';group.add(partition);
 box('hotel-fixed-screen',h.partition.fixed,0,h.partition.height,stone,partition,.004);
 box('hotel-screen-jamb',h.partition.jamb,0,h.partition.height,stone,partition,.004);
 box('hotel-screen-overdoor',[1.13,1.03,2.05,1.07],2.20,.15,stone,partition);
 box('hotel-screen-top',[.10,1.03,1.13,1.07],2.20,.15,stone,partition);
 box('hotel-sliding-track',[.18,.97,2.015,1.028],2.18,.06,white,partition,.008);
 const slider=new T.Group();slider.name='hotel-opaque-sliding-door';partition.add(slider);
 box('hotel-solid-door',h.partition.door,.015,2.165,warm,slider,.004);
 box('hotel-door-recess-pull',[1.90,1.026,1.93,1.030],.92,.18,metal,slider,.004);
 const cutPlan=new T.Group();cutPlan.name='hotel-partition-cut-footprint';group.add(cutPlan);
 box('hotel-cut-fixed',h.partition.fixed,.015,.06,warm,cutPlan,.001);
 box('hotel-cut-jamb',h.partition.jamb,.015,.06,warm,cutPlan,.001);
 const cutDoor=new T.Group();cutPlan.add(cutDoor);box('hotel-cut-door',h.partition.door,.015,.06,metal,cutDoor,.001);
 // The upper window stays as drawn; sanitary outlets are deliberately not fabricated.
 const shower=b.fixtures.shower.r;
 box('hotel-shower-floor',shower,.002,.004,M('#c9cec8'),group);
 cylinder(2.025,.90,.49,.015,1.08,metal,group);
 box('hotel-shower-arm',[1.76,.478,2.025,.50],1.965,.02,metal,group);
 cylinder(1.78,1.945,.49,.105,.018,metal,group);
 box('hotel-shower-mixer',[1.99,.42,2.045,.60],1.00,.07,metal,group);
 box('hotel-shower-shelf',[1.88,.71,2.045,.96],1.15,.018,metal,group);
 for(const z of [.77,.88])cylinder(1.96,1.17,z,.026,.17,white,group);
 box('hotel-paper-holder',[.39,.775,.56,.805],.69,.025,metal,group);
 cylinder(.47,.52,.79,.048,.12,white,group);
 box('hotel-wet-towel-bar',[.115,.70,.135,.98],1.41,.022,metal,group);
 box('hotel-wet-towel',[.135,.74,.15,.96],.97,.43,fabric,group);
 cylinder(1.54,2.325,.54,.115,.014,light,group);
 const routeGroup=new T.Group();routeGroup.name='hotel-wash-route';group.add(routeGroup);
 const pathMat=new T.MeshBasicMaterial({color:'#869c8a',transparent:true,opacity:.25,depthWrite:false});
 for(const [i,p]of h.washRoute.entries()){
  cylinder(p[0],.009,p[1],.10,.004,pathMat,routeGroup);
  if(i){const a=h.washRoute[i-1],geo=new T.BufferGeometry().setFromPoints([new T.Vector3(a[0],.018,a[1]),new T.Vector3(p[0],.018,p[1])]);routeGroup.add(new T.Line(geo,new T.LineBasicMaterial({color:'#56705c'})));}
 }
 label(['bath'],'先洗漱：侧向台盆580 × 400','利用原凸出区侧面；不跨墙、不拆围合区',[.88,.85,1.64]);
 label(['bath'],'内外分区：不透明表面移门','名义洞口820；边框、止挡与净开口待选型',[1.55,2.02,1.11]);
 label(['bath','bathTop'],'窗边马桶＋右侧90 × 90淋浴','马桶前方与淋浴共用部分站位，不能同时使用',[.8,.80,.51]);
 label(['bathTop'],'58cm小台盆向右使用','原85cm内开门保留；入口不穿马桶区',[.87,.80,1.63]);
 label(['bathTop'],'排污移位未确认','不画虚构横管/地漏；净高、坡度及防水待现场核实',[.45,.20,.44]);
 return {group,partition,slider,mirrors,annotations,update({closed,mirrorInside,view,routes}){
  slider.position.x=closed?0:-h.partition.travel;mirror.visible=!mirrorInside;
  partition.visible=view!=='bathTop'&&view!=='top';cutPlan.visible=!partition.visible;cutDoor.position.x=slider.position.x;routeGroup.visible=routes;
 },setMirrorEnvironment(map){mirrorMat.envMap=map;mirrorMat.envMapIntensity=.6;mirrorMat.needsUpdate=true;}};
}
