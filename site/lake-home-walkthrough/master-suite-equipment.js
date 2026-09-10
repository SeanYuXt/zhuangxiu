import * as T from './vendor/three.module.js';

const hit=(a,b)=>a[0]<b[3]&&a[3]>b[0]&&a[1]<b[4]&&a[4]>b[1]&&a[2]<b[5]&&a[5]>b[2];
const volume=q=>[q.r[0],q.base,q.r[1],q.r[2],q.base+q.height,q.r[3]];
export function equipmentOverlay(s,labels=true){
 const e=s.design.equipment;let out='<g data-equipment-plan="true" fill="none" stroke="#747f86" stroke-width="2">';
 for(const [id,q]of Object.entries({cloth:e.curtains.cloth,sheer:e.curtains.sheer})){
  out+=`<polyline points="${q.path.map(p=>p.map(v=>v*100).join(',')).join(' ')}" stroke-dasharray="${id==='cloth'?'6 2':'2 3'}"/>`;
  const m=q.motor.r;out+=`<rect x="${m[0]*100}" y="${m[1]*100}" width="${(m[2]-m[0])*100}" height="${(m[3]-m[1])*100}" fill="#bda171"/>`;
 }
 for(const [id,q]of [['空调候选',e.ac],['吊装投影',e.projector]]){if(q.status==='withdrawn')continue;const r=q.r;out+=`<rect x="${r[0]*100}" y="${r[1]*100}" width="${(r[2]-r[0])*100}" height="${(r[3]-r[1])*100}" stroke-dasharray="3 2" fill="#b8c9cb55"/>`;if(labels)out+=`<text x="${(r[0]+r[2])*50}" y="${(r[1]+r[3])*50}" stroke="none" fill="#4d5c61" text-anchor="middle" font-size="9">${id}</text>`;}
 return out+'</g>';
}
export function equipmentAudit(s){
 const e=s.design.equipment,errors=[],books=volume(s.design.bayUse.books),boxes=[];
 for(const [id,q] of Object.entries({cloth:e.curtains.cloth,sheer:e.curtains.sheer})){
  const xs=q.path.map(p=>p[0]),zs=q.path.map(p=>p[1]),bounds=[Math.min(...xs)-q.boxWidth/2,q.boxBase,Math.min(...zs)-q.boxWidth/2,Math.max(...xs)+q.boxWidth/2,q.boxBase+q.boxHeight,Math.max(...zs)];
  if(hit(bounds,books)||hit(volume(q.motor),books))errors.push(id+'盒/电机撞书柜');
  if(bounds[4]>s.ceiling+.001)errors.push(id+'盒超顶');
  boxes.push({id,bounds});
 }
 const ac=volume(e.ac),pj=volume(e.projector),screen=volume(s.design.projection.housing);
 if(hit(ac,pj)||hit(ac,screen))errors.push('空调与投影设备冲突');
 if(e.ac.base+e.ac.height+e.ac.topClearance>s.ceiling+.001)errors.push('空调顶部预留不足');

 if(e.ac.wall!=='foot-wall'||e.ac.r[0]<s.furniture.vanity.r[0]||e.ac.r[2]>s.furniture.vanity.r[2]||e.ac.r[3]>3.40||e.ac.r[3]<3.36)errors.push('空调未落在床尾梳妆墙候选范围');
 for(const {id,bounds}of boxes)if(hit(ac,bounds))errors.push('空调碰到'+id+'帘盒');
 if(hit(ac,books))errors.push('空调碰到飘窗书柜');
 for(const [id,q]of Object.entries(s.furniture)){if(hit(ac,volume({...q,base:0})))errors.push('空调碰到'+id);}
 const reserve=volume(e.ac.service),mirror=volume(s.design.styling.skinCabinet),serviceWarnings=[];
 if(hit(ac,mirror)||hit(reserve,mirror))errors.push('空调或检修包络碰到梳妆镜格');
 for(const [id,q]of Object.entries(s.furniture))if(hit(reserve,volume({...q,base:0})))(e.ac.service.status==='unverified-expanded'?serviceWarnings:errors).push('空调拆洗候选范围碰到'+id);
 if(e.ac.service.r[2]>s.furniture.vanity.r[2])serviceWarnings.push('空调拆洗候选范围超出右侧墙界');
 const screenRight=s.design.projection.centerX+s.design.projection.sheetWidth/2;
 if(screenRight+.015>=e.ac.r[0])errors.push('下降幕布进入空调正前方');
 if(Math.abs(e.projector.lens[0]-s.design.projection.centerX)>.001)errors.push('镜头与幕面未同步横移');

 const clothMinX=e.curtains.cloth.path[1][0]-e.curtains.cloth.amplitude-.002;
 const routeMargin=clothMinX-(4.99+.30);
 if(routeMargin<0)errors.push('布帘侵入60cm通路包络');
 const distance=s.design.projection.planeZ-e.projector.lens[2];
 const air=volume(e.ac.airCorridor),airBlockers=Object.entries(s.furniture).filter(([,v])=>hit(air,volume({...v,base:0}))).map(([id])=>id);
 return {ok:!errors.length,errors,serviceWarnings,installationVerified:false,routeMargin,bookcaseEndGap:s.design.bayUse.books.r[1]-e.curtains.cloth.path.at(-1)[1],acTopGap:s.ceiling-e.ac.base-e.ac.height,acToLowTop:e.ac.base-s.furniture.vanity.height,screenSideGap:e.ac.r[0]-(s.design.projection.centerX+s.design.projection.sheetWidth/2+.015),lensDistance:distance,requiredThrowRatio:distance/s.design.projection.imageWidth,boxes,mirrorGap:e.ac.base-(s.design.styling.skinCabinet.base+s.design.styling.skinCabinet.height),straightAirBlocked:airBlockers.length>0,airBlockers,limits:['送风包络仅几何示意，非气流仿真，实际风感和幕布晃动需核验','只检查名义包络，不验证布帘摆动/遮光/窗扇扫掠','空调孔位、自然排水、机型检修、实际送风未核验','电气、锚固、轨道弯曲半径与智能生态未确认']};
}

export function mountEquipment({s,scene,box,M,white,metal}){
 const e=s.design.equipment,group=new T.Group();group.name='suite-equipment';scene.add(group);
 const covers=[],fabrics={},motors=[],details=new T.Group();details.name='equipment-service-points';group.add(details);
 const trackMat=M('#d5d4cc');
 function line(name,points,mat,r=.008,parent=group){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');const mesh=new T.Mesh(new T.TubeGeometry(curve,32,r,6,false),mat);mesh.name=name;parent.add(mesh);return mesh;}
 function route(q){const p=q.path.map(([x,z])=>new T.Vector3(x,q.top+.015,z)),path=new T.CurvePath();
  if(p.length===2){path.add(new T.LineCurve3(p[0],p[1]));return path;}
  const a=p[1].clone().add(p[0].clone().sub(p[1]).normalize().multiplyScalar(q.radius)),b=p[1].clone().add(p[2].clone().sub(p[1]).normalize().multiplyScalar(q.radius));
  path.add(new T.LineCurve3(p[0],a));path.add(new T.QuadraticBezierCurve3(a,p[1],b));path.add(new T.LineCurve3(b,p[2]));return path;
 }
 for(const [id,q] of Object.entries({cloth:e.curtains.cloth,sheer:e.curtains.sheer})){
  const curve=route(q),len=curve.getLength();
  const rail=new T.Mesh(new T.TubeGeometry(curve,100,.012,8,false),trackMat);rail.name=id+'-motor-track';group.add(rail);
  for(let i=0;i<q.path.length-1;i++){
   const a=q.path[i],b=q.path[i+1],alongX=a[1]===b[1],w=q.boxWidth;
   const r=alongX?[a[0]-w/2,a[1]-w/2,b[0]+w/2,a[1]+w/2]:[a[0]-w/2,a[1]-w/2,a[0]+w/2,b[1]];
   box(id+'-box-top',r,2.58,.02,white,group);
   const face=alongX?[r[0],r[3]-.018,r[2],r[3]]:[r[0],r[1],r[0]+.018,r[3]];
   covers.push(box(id+'-box-removable-fascia',face,q.boxBase,q.boxHeight,white,group));
  }
  const motor=box(id+'-curtain-motor',q.motor.r,q.motor.base,q.motor.height,M('#dbdad2'),group,.018);motors.push(motor);
  const cover=q.motor.r;
  const coverFace=id==='cloth'?[cover[0]-.012,cover[3]+.002,cover[2]+.012,cover[3]+.010]:[cover[0]-.010,cover[1]-.012,cover[0]-.002,cover[3]+.012];
  covers.push(box(id+'-motor-removable-end-cover',coverFace,q.motor.base-.015,q.motor.height+.04,white,group));
  box(id+'-motor-neck',q.motor.r,q.motor.base+q.motor.height,.025,metal,group);
  const [px,py,pz]=q.power;box(id+'-power-point',[px-.025,pz-.025,px+.025,pz+.025],py,.06,M('#bda171'),details);
  const mr=q.motor.r;line(id+'-accessible-power-lead',[[px,py+.02,pz],[(mr[0]+mr[2])/2,2.42,(mr[1]+mr[3])/2]],trackMat,.004,details);
  const mat=new T.MeshStandardMaterial({color:id==='cloth'?'#bcb8b0':'#f3f0e8',side:T.DoubleSide,roughness:.98,transparent:id==='sheer',opacity:id==='sheer'?.48:1});
  const n=240,vertices=new Float32Array((n+1)*2*3),uv=new Float32Array((n+1)*4),indices=[];
  for(let i=0;i<n;i++){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(vertices,3));geometry.setAttribute('uv',new T.BufferAttribute(uv,2));geometry.setIndex(indices);
  const mesh=new T.Mesh(geometry,mat);mesh.name=id+'-curtain-fabric';mesh.castShadow=id==='cloth';mesh.receiveShadow=true;group.add(mesh);
  const set=closed=>{const span=closed?len:Math.min(.42,len),waves=closed?Math.round(len/.075):24;
   for(let i=0;i<=n;i++){const t=i/n,u=(t*span)/len,p=curve.getPointAt(u),tangent=curve.getTangentAt(Math.min(.999,u)),normal=new T.Vector3(-tangent.z,0,tangent.x),wave=Math.sin(t*Math.PI*2*waves)*q.amplitude;p.addScaledVector(normal,wave);
    for(let j=0;j<2;j++){const k=(i*2+j)*3;vertices[k]=p.x;vertices[k+1]=j?q.base:q.top;vertices[k+2]=p.z;}}
   geometry.attributes.position.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();mesh.userData.closed=closed;
  };fabrics[id]={mesh,set};set(false);
 }

 const a=e.ac,r=a.r,acGroup=new T.Group();acGroup.name='footwall-ac-system';group.add(acGroup);
 const width=r[2]-r[0],depth=r[3]-r[1];
 const acBox=(name,b,y,h,mat=white,rad=.005)=>box(name,[r[0]+b[0],r[3]-b[3],r[0]+b[2],r[3]-b[1]],y,h,mat,acGroup,rad);
 acBox('wall-ac-candidate',[0,0,width,depth],a.base,a.height,white,.038);
 acBox('ac-front-panel',[.025,depth-.025,width-.025,depth+.008],a.base+.065,.195,M('#eeece6'),.022);
 acBox('ac-outlet',[.06,depth-.008,width-.06,depth+.018],a.base+.015,.036,M('#575f5c'));
 for(let i=0;i<4;i++)acBox('ac-louver',[.07,depth-.006,width-.07,depth+.021],a.base+.017+i*.007,.003,metal);
 acBox('ac-status',[width-.16,depth+.009,width-.10,depth+.013],a.base+.17,.015,M('#849d94'));
 acBox('ac-fixed-wall-plate',[.12,-.008,width-.12,0],a.base+.09,.14,metal);
 const airflow=new T.Group();airflow.name='ac-airflow-indicative';details.add(airflow);
 for(const points of a.outletPaths)line('ac-airflow-not-performance',points,M('#8aa4a3'),.008,airflow);
 const sv=a.service,vr=volume(sv),wire=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(vr[3]-vr[0],vr[4]-vr[1],vr[5]-vr[2])),new T.LineBasicMaterial({color:'#b99b69',transparent:true,opacity:.6}));
 wire.name='ac-service-envelope';wire.position.set((vr[0]+vr[3])/2,(vr[1]+vr[4])/2,(vr[2]+vr[5])/2);details.add(wire);
 const [ax,ay,az]=a.power;box('ac-power-candidate',[ax-.04,az-.015,ax+.04,az+.005],ay,.08,M('#bda171'),details);
 const pj=e.projector,pr=pj.r,pc=pj.lens[0];
 box('projector-ceiling-plate',[pc-.06,.34,pc+.06,.48],2.575,.025,metal,group);
 box('projector-suspension',[pc-.015,.395,pc+.015,.425],pj.base+pj.height,2.575-pj.base-pj.height,metal,group);
 box('suspended-projector-candidate',pr,pj.base,pj.height,white,group,.025);
 const lens=new T.Mesh(new T.CylinderGeometry(.027,.027,.025,24),M('#263b41'));lens.rotation.x=Math.PI/2;lens.position.set(...pj.lens);lens.name='projector-lens';group.add(lens);
 for(let i=0;i<6;i++)box('projector-vent',[pr[0]-.002,pr[1]+.045+i*.025,pr[0]+.003,pr[1]+.055+i*.025],pj.base+.025,.055,metal,group);
 line('projector-safety-tether',[[pc+.08,s.ceiling-.02,.42],[pc+.12,pj.base+pj.height+.035,.45],[pc+.12,pj.base+pj.height-.01,.47]],metal,.003,group);
 if(e.ac.status==='withdrawn')group.traverse(o=>{if(o.name==='wall-ac-candidate'||o.name.startsWith('ac-'))o.visible=false;});
 const update=({cloth=false,sheer=false,service=false}={})=>{fabrics.cloth.set(cloth);fabrics.sheer.set(sheer);covers.forEach(o=>o.visible=!service);details.visible=service;};
 update();return {group,update,fabrics,audit:equipmentAudit(s)};
}
