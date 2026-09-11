import * as T from './vendor/three.module.js';
import {fridgeLayout} from './design-spec.js?v=fridge-layout-2';

// User-supplied appliance width/depth. Height and installation allowances are study assumptions.
export const fridgeFitSpec={width:fridgeLayout.width,depth:fridgeLayout.depth,height:fridgeLayout.height,rearReserve:fridgeLayout.rearReserve,installationWidth:fridgeLayout.cabinetWidth,
 sites:{
  outside:{label:'厨房门右侧 · 靠阳台',center:[fridgeLayout.position[0],fridgeLayout.position[2]],rotation:fridgeLayout.rotation,operator:[7.22,2.36],route:[[5.1,3.5],[6.35,3.5],[6.50,3.14],[7.31,3.14],[7.22,2.36]]},
  inside:{label:'厨房内部靠门的右下角',center:[5.20,4.980],rotation:Math.PI,operator:[5.20,3.89],route:[[5.1,3.5],[5.20,3.89]]}
 }};

export function fridgeFitGeometry(id,angle=0,travel=0){
 const s=fridgeFitSpec,site=s.sites[id],c=Math.cos(site.rotation),n=Math.sin(site.rotation);
 const world=([x,z])=>[site.center[0]+c*x+n*z,site.center[1]-n*x+c*z];
 const rect=(x0,z0,x1,z1)=>[[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
 const appliance=rect(-s.width/2,-s.depth/2,s.width/2,s.depth/2).map(world);
 const installation=rect(-s.installationWidth/2,-s.depth/2-s.rearReserve,s.installationWidth/2,s.depth/2).map(world);
 const doors=[-1,1].map(sign=>{
  const a=sign*angle*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),hinge=sign*s.width/2;
  return rect(sign<0?0:-s.width/2,-.045,sign<0?s.width/2:0,0).map(([u,v])=>world([hinge+ca*u+sa*v,s.depth/2-sa*u+ca*v]));
 });
 const drawer=rect(-.39,-.19+travel,.39,.27+travel).map(world);
 const [ox,oz]=site.operator,operator=rect(ox-.30,oz-.30,ox+.30,oz+.30);
 return {appliance,installation,doors,drawer,operator};
}

// Separating-axis test: rotated door rectangles against existing mesh bounding boxes.
// Mesh boxes are conservative; a reported collision needs visual review, a clear result is bounded to this model.
function overlaps(a,b,tolerance=.001){
 for(const poly of [a,b])for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],length=Math.hypot(q[0]-p[0],q[1]-p[1]);
  const axis=[-(q[1]-p[1])/length,(q[0]-p[0])/length];
  const project=points=>points.map(v=>v[0]*axis[0]+v[1]*axis[1]);
  const pa=project(a),pb=project(b);
  if(Math.min(Math.max(...pa),Math.max(...pb))-Math.max(Math.min(...pa),Math.min(...pb))<=tolerance)return false;
 }return true;
}
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible||p.name==='integrated-fridge')return false;return true;};
const rectFromBox=b=>[[b.min.x,b.min.z],[b.max.x,b.min.z],[b.max.x,b.max.z],[b.min.x,b.max.z]];
export function auditFridgeFit(model){
 model.updateMatrixWorld(true);const obstacles=[];
 model.traverse(o=>{
  if(!o.isMesh||!visible(o)||o.userData.walkThrough)return;
  const b=new T.Box3().setFromObject(o);
  if(b.max.y<.10||b.min.y>=fridgeFitSpec.height||b.max.x<3.6||b.min.x>8.1||b.max.z<1.5||b.min.z>5.4)return;
  if(b.max.x-b.min.x>24||b.max.z-b.min.z>24)return;
  obstacles.push({name:o.name,parent:o.parent.name,polygon:rectFromBox(b),min:b.min.toArray(),max:b.max.toArray()});
 });
 const hit=polygon=>obstacles.filter(o=>overlaps(polygon,o.polygon)).map(o=>o.name);
 const results={};
 for(const id of Object.keys(fridgeFitSpec.sites)){
  const base=fridgeFitGeometry(id),sweepHits=new Map();
  for(let angle=0;angle<=125;angle++){
   const g=fridgeFitGeometry(id,angle);
   g.doors.forEach((door,index)=>{for(const name of hit(door)){const key=index+':'+name;if(!sweepHits.has(key))sweepHits.set(key,{door:index,obstacle:name,firstAngle:angle});}});
  }
  const g90=fridgeFitGeometry(id,90,.30),g125=fridgeFitGeometry(id,125,.30);
  const operatorCheck=g=>({static:hit(g.operator),door:g.doors.map((d,i)=>overlaps(d,g.operator)?i:null).filter(i=>i!==null),drawer:overlaps(g.drawer,g.operator)});
  const drawerCheck=g=>({static:hit(g.drawer),doors:g.doors.map((d,i)=>overlaps(d,g.drawer)?i:null).filter(i=>i!==null)});
  const route=fridgeFitSpec.sites[id].route,routeHits=new Set(),closedRouteHits=new Set();
  const closedBlockers=[...obstacles.map(o=>({name:o.name,p:o.polygon})),{name:'冰箱',p:base.appliance}];
  const blockers=[...closedBlockers,...g90.doors.map((p,i)=>({name:'冰箱门'+i,p})),{name:'已拉出冰箱抽屉',p:g90.drawer}];
  for(let k=1;k<route.length;k++){
   const a=route[k-1],b=route[k],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.025);
   for(let j=0;j<=steps;j++){
    const x=a[0]+(b[0]-a[0])*j/steps,z=a[1]+(b[1]-a[1])*j/steps;
    const person=Array.from({length:16},(_,i)=>[x+.25*Math.cos(i*Math.PI/8),z+.25*Math.sin(i*Math.PI/8)]);
    for(const o of blockers)if(overlaps(person,o.p))routeHits.add(o.name);
    for(const o of closedBlockers)if(overlaps(person,o.p))closedRouteHits.add(o.name);
   }
  }
  results[id]={closedApplianceHits:hit(base.appliance),installationReserveHits:hit(base.installation),doorSweep:[...sweepHits.values()],drawerAt90:drawerCheck(g90),drawerAt125:drawerCheck(g125),operatorAt90:operatorCheck(g90),operatorAt125:operatorCheck(g125),approachWithClosedDoors:{diameterMm:500,stepMm:25,hits:[...closedRouteHits]},routeWith90DoorsAndDrawer:{diameterMm:500,stepMm:25,hits:[...routeHits]}};
 }
 const furniture=['kitchen-cooking-cabinets','kitchen-sink-cabinets','stone-island','balcony-care-cabinet','lake-bar-left'].map(name=>{
  const b=new T.Box3().setFromObject(model.getObjectByName(name));return {name,min:b.min.toArray(),max:b.max.toArray()};
 });
 return {checkedAt:new Date().toISOString(),spec:fridgeFitSpec,results,furniture,obstacles,
  limitations:['Appliance height assumed 2000mm; width 900mm and depth 600mm follow latest user correction','960mm surround = 900mm appliance + two 18mm panels + two 12mm assumed gaps; selected product allowances unverified','Rear allowance assumed 20mm, subject to selected appliance requirements','Simple front-corner hinges, 45mm door thickness and 300mm drawer travel; no selected appliance or zero-clearance hinge claim','2D conservative obstacle boxes with vertical filtering, not a full product installation or construction certification','Current refrigerator omitted from the proxy check; actual rebuilt meshes are checked separately in verify-fridge-layout.js']};
}
