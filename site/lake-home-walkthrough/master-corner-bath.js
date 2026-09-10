import * as T from './vendor/three.module.js';
import {curtainSegments} from './master-bath-corner-geometry.mjs';

export function mountCornerBath({s,group,box,cylinder,M,white,metal,putty,fabric,warm,light,mirror,mirrorMat,mirrors,annotations,label}){
 const h=s.design.bath.hotelCandidate,p=h.partition,r=h.fixtures.toilet.r,cx=(r[0]+r[2])/2;
 group.name='corner-access-bath-59';
 box('corner-toilet-cistern',[r[0]+.015,r[1],r[2]-.015,r[1]+.17],.06,.70,white,group,.025);
 box('corner-toilet-pedestal',[r[0]+.055,r[1]+.17,r[2]-.055,r[3]-.03],.06,.32,white,group,.05);
 const seat=cylinder(cx,.39,r[1]+.41,.17,.055,white,group);seat.scale.z=1.28;
 const hole=cylinder(cx,.447,r[1]+.42,.112,.003,M('#d1d4cf'),group);hole.scale.z=1.37;
 box('corner-shower-floor',h.fixtures.shower.r,.002,.004,M('#c9cec8'),group);
 cylinder(.14,.90,.40,.015,1.08,metal,group);
 box('corner-shower-arm',[.13,.39,.49,.41],1.96,.02,metal,group);
 cylinder(.48,1.94,.40,.105,.018,metal,group);
 box('corner-shower-mixer',[.115,.31,.18,.49],1.00,.065,metal,group);
 // Two shallow shelves on the solid left wall, behind the shower entry sweep.
 // 13cm projection stays clear of the 70cm route; no niche or window attachment.
 const storage=new T.Group();storage.name='corner-shower-storage';group.add(storage);
 storage.userData={footprint:[.12,.61,.25,.93],levels:[1.12,1.46],kind:'surface-mounted-two-tier-shelf'};
 const charcoal=M('#545a55'),sage=M('#91a596'),amber=M('#9c724c'),cream=M('#e5deca');
 const storagePart=(name,r,y,height,material,radius=.003)=>box('storage-'+name,r,y,height,material,storage,radius);
 const storageCylinder=(name,x,y,z,r,height,material)=>{const o=cylinder(x,y,z,r,height,material,storage);o.name='storage-'+name;return o;};
 for(const [i,y]of [1.12,1.46].entries()){
  storagePart('shelf-'+i,[.12,.61,.25,.93],y,.015,charcoal);
  storagePart('front-rail-'+i,[.24,.61,.25,.93],y+.015,.035,charcoal);
  for(const z of [.61,.92])storagePart('side-rail-'+i,[.12,z,.25,z+.01],y+.015,.035,charcoal);
  // Brackets end at the wall face; only the mounting hardware extends past the shelf footprint.
  for(const z of [.64,.89])storagePart('wall-bracket-'+i,[.10,z,.14,z+.018],y-.045,.085,charcoal);
  for(let k=0;k<6;k++)storagePart('drain-slot-'+i+'-'+k,[.16,.64+k*.046,.222,.647+k*.046],y+.015,.001,M('#303833'),.0002);
 }
 function pumpBottle(name,x,y,z,body,height,radius){
  storageCylinder(name+'-body',x,y,z,radius,height,body);
  storageCylinder(name+'-neck',x,y+height,z,radius*.43,.022,charcoal);
  storageCylinder(name+'-pump-stem',x,y+height+.022,z,.004,.016,charcoal);
  storagePart(name+'-pump',[x-.007,z-.008,x+.032,z+.008],y+height+.036,.009,charcoal);
  // A contrasting front label makes each product legible at eye level.
  storagePart(name+'-label',[x+radius-.002,z-radius*.67,x+radius+.001,z+radius*.67],y+height*.28,height*.40,cream,.0006);
 }
 pumpBottle('shampoo',.187,1.135,.679,sage,.17,.03);
 pumpBottle('body-wash',.187,1.135,.785,amber,.19,.031);
 storageCylinder('conditioner',.187,1.135,.88,.025,.15,cream);
 storageCylinder('conditioner-cap',.187,1.285,.88,.026,.022,charcoal);
 storagePart('soap-dish',[.15,.65,.23,.77],1.475,.014,white,.006);
 storagePart('soap',[.165,.67,.218,.745],1.489,.024,sage,.012);
 storageCylinder('scrub-jar',.187,1.475,.854,.031,.075,cream);
 storageCylinder('scrub-lid',.187,1.55,.854,.033,.012,charcoal);
 box('corner-paper-holder',[1.965,.48,2.045,.65],.69,.15,putty,group,.012);
 box('corner-towel-bar',[2.018,.85,2.035,1.15],1.28,.018,metal,group);
 box('corner-hand-towel',[1.993,.90,2.01,1.10],.91,.36,fabric,group);
 const partition=new T.Group(),cutPlan=new T.Group();group.add(partition,cutPlan);
 partition.name='corner-retractable-curtain';cutPlan.name='corner-cut-footprint';
 const curtainMaterial=M('#d6d0c3');curtainMaterial.side=T.DoubleSide;curtainMaterial.roughness=.95;
 const openFabric=new T.Group(),closedFabric=new T.Group(),openCut=new T.Group(),closedCut=new T.Group();partition.add(openFabric,closedFabric);cutPlan.add(openCut,closedCut);
 // Track is ceiling suspended; no fixed panel, central post or floor track across circulation.
 for(const[a,b]of curtainSegments(p,true)){
  box('corner-ceiling-track',[Math.min(a[0],b[0])-.012,Math.min(a[1],b[1])-.012,Math.max(a[0],b[0])+.012,Math.max(a[1],b[1])+.012],p.trackHeight,.023,white,partition,.003);
 }
 for(const[x,z]of p.path)cylinder(x,p.trackHeight+.025,z,.007,.08,metal,partition);
 function fabricPanel(a,b,closed,parent,cut){
  const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len,vertices=[],indices=[],n=closed?96:72;
  for(let i=0;i<=n;i++){
   const t=i/n,wave=Math.sin(t*Math.PI*(closed?18:30))*(closed?.014:.025);
   for(const y of[p.base,p.base+p.height])vertices.push(a[0]+dx*t+nx*wave,y,a[1]+dz*t+nz*wave);
   if(i<n){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
  const mesh=new T.Mesh(geo,curtainMaterial);mesh.name=closed?'shower-curtain-closed':'shower-curtain-gathered';mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);
  for(let i=0;i<=10;i++){const t=i/10;cylinder(a[0]+dx*t,p.base+p.height,a[1]+dz*t,.004,.037,metal,parent);}
  const line=new T.BufferGeometry().setFromPoints([new T.Vector3(a[0],.018,a[1]),new T.Vector3(b[0],.018,b[1])]);cut.add(new T.Line(line,new T.LineBasicMaterial({color:'#a1947f'})));
 }
 for(const closed of[false,true])for(const[a,b]of curtainSegments(p,closed))fabricPanel(a,b,closed,closed?closedFabric:openFabric,closed?closedCut:openCut);
 const routes=new T.Group();routes.name='corner-continuous-route-sweeps';group.add(routes);
 for(const [name,route]of Object.entries(h.routes)){
  const color={toilet:'#719681',wash:'#b69562',shower:'#809cad'}[name];
  const mat=new T.MeshBasicMaterial({color,transparent:true,opacity:.07,depthWrite:false});
  const pts=route.points.filter(q=>q[1]<=1.95);
  for(let j=1;j<pts.length;j++){
   const a=pts[j-1],b=pts[j],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.055);
   for(let k=0;k<=n;k++)cylinder(a[0]+(b[0]-a[0])*k/n,.019,a[1]+(b[1]-a[1])*k/n,route.diameter/2,.002,mat,routes);
  }
  const geo=new T.BufferGeometry().setFromPoints(pts.map(q=>new T.Vector3(q[0],.027,q[1])));
  routes.add(new T.Line(geo,new T.LineBasicMaterial({color})));
 }
 const ceiling=cylinder(.57,2.325,.53,.10,.014,light,group);
 label(['bath'],'入口仍是58 × 40cm洗漱位','镜柜收牙刷护肤品；不做堵路的L延伸',[.88,.85,1.65]);
 label(['bath','bathTop'],'右侧如厕 · 75cm圆盘路线校核','不再绕过盆角；不是双人并行宽度',[1.55,.10,1.22]);
 label(['bath'],'窗侧90 × 90cm淋浴','L形浴帘平时收起；无固定隔板、无玻璃',[.88,1.30,1.01]);
 label(['bathTop'],'蓝色：70cm连续入浴包络','浴帘收起，从转角进入；不穿越马桶站位',[1.04,.08,1.03]);
 label(['bathTop'],'原85cm内开门保留','绿色：去马桶；暖色：洗漱；不能同时占位',[1.52,.10,1.82]);
 label(['bath'],'挡水分区，不是密闭淋浴房','马桶移位、窗框防水、找坡防溢待现场核实',[1.65,.72,.30]);
 return {group,partition,mirrors,annotations,openFabric,closedFabric,update({closed,mirrorInside,view,routes:showRoutes}){
  closedFabric.visible=closed;openFabric.visible=!closed;closedCut.visible=closed;openCut.visible=!closed;
  mirror.visible=!mirrorInside;partition.visible=!['bathTop','top'].includes(view);cutPlan.visible=!partition.visible;routes.visible=showRoutes;ceiling.visible=partition.visible;
 },setMirrorEnvironment(map){mirrorMat.envMap=map;mirrorMat.envMapIntensity=.6;mirrorMat.needsUpdate=true;}};
}
