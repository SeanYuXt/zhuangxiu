import * as T from './vendor/three.module.js';
import {fridgeLayout, livingRevision} from './design-spec.js?v=fridge-layout-2';

// Runtime QA for the displayed meshes. Projected geometry boxes are conservative,
// not a substitute for the installation drawing of a selected refrigerator.
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible||p.userData.walkThrough)return false;return true;};
const under=(o,root)=>{for(let p=o;p;p=p.parent)if(p===root)return true;return false;};
const bounds=o=>{const b=new T.Box3().setFromObject(o);return {name:o.name,min:b.min.toArray(),max:b.max.toArray(),size:b.getSize(new T.Vector3()).toArray()};};
function hull(points){
 const sorted=points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const half=ps=>{const h=[];for(const p of ps){while(h.length>1&&cross(h.at(-2),h.at(-1),p)<=1e-10)h.pop();h.push(p);}h.pop();return h;};
 return [...half(sorted),...half([...sorted].reverse())];
}
function shape(o){
 o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,points=[];
 for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])points.push(new T.Vector3(x,y,z).applyMatrix4(o.matrixWorld));
 return {name:o.name,parent:o.parent.name,poly:hull(points.map(p=>[p.x,p.z])),low:Math.min(...points.map(p=>p.y)),high:Math.max(...points.map(p=>p.y))};
}
function overlap(a,b){
 if(Math.min(a.high,b.high)-Math.max(a.low,b.low)<=.001)return false;
 for(const poly of [a.poly,b.poly])for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],len=Math.hypot(q[0]-p[0],q[1]-p[1]);if(len<1e-9)continue;
  const axis=[(p[1]-q[1])/len,(q[0]-p[0])/len],project=ps=>ps.map(v=>v[0]*axis[0]+v[1]*axis[1]);
  const pa=project(a.poly),pb=project(b.poly);
  if(Math.min(Math.max(...pa),Math.max(...pb))-Math.max(Math.min(...pa),Math.min(...pb))<=.001)return false;
 }return true;
}
const meshes=root=>{const result=[];root.traverse(o=>{if(o.isMesh&&visible(o))result.push(o);});return result;};
export function verifyFridgeLayout(model,details){
 details.reset();model.updateMatrixWorld(true);
 const region=new T.Box3().setFromObject(details.cabinet).expandByScalar(1.10);
 const surroundings=meshes(model).filter(o=>!under(o,details.cabinet)).map(shape).filter(o=>o.high>.1&&o.low<2.65&&Math.max(...o.poly.map(p=>p[0]))>region.min.x&&Math.min(...o.poly.map(p=>p[0]))<region.max.x&&Math.max(...o.poly.map(p=>p[1]))>region.min.z&&Math.min(...o.poly.map(p=>p[1]))<region.max.z);
 const compare=(moving,obstacles)=>moving.flatMap(o=>{const s=shape(o);return obstacles.filter(b=>overlap(s,b)).map(b=>({part:o.name,obstacle:b.name}));});
 const closedExternalHits=compare(meshes(details.cabinet),surroundings);
 const doorSweep=[],upperSweep=[],movingDoors=details.doors.flatMap(meshes),surround=details.cabinet.children.filter(o=>o.name==='fridge-surround-side').map(shape);
 for(let angle=0;angle<=125;angle++){
  details.setDoors(angle/125);
  for(const h of compare(movingDoors,[...surroundings,...surround]))if(!doorSweep.some(p=>p.part===h.part&&p.obstacle===h.obstacle))doorSweep.push({...h,firstAngle:angle});
 }
 details.reset();
 for(let angle=0;angle<=90;angle++){
  details.setUpper(angle/90);
  for(const h of compare(meshes(details.upperDoor),[...surroundings,...surround]))if(!upperSweep.some(p=>p.part===h.part&&p.obstacle===h.obstacle))upperSweep.push({...h,firstAngle:angle});
 }
 details.reset();
 const internalClosedHits=compare(movingDoors,[...meshes(details.cold),...meshes(details.body)].map(shape));
 const bins=[];details.setDoors(1);
 for(let i=0;i<details.bins.length;i++){
  details.setBin(i);const others=meshes(details.cabinet).filter(o=>!under(o,details.bins[i])).map(shape);
  bins.push({index:i,travelMm:Math.round((details.bins[i].position.z-details.bins[i].userData.closedZ)*1000),externalHits:compare(meshes(details.bins[i]),surroundings),internalHits:compare(meshes(details.bins[i]),others)});
 }
 details.reset();
 const names=['fridge-appliance-envelope','integrated-fridge','stone-island','dining-daily-seat-0','dining-daily-seat-1','dining-table-settings','flush-sideboard','linen-sofa','mesh_1359','mesh_1360','mesh_1361','mesh_1362','island-pendant-ceiling-canopy'];
 // Review variants may replace the old sideboard with a new drinks cabinet.
 names.push('whole-wall-drinks');
 const objects=Object.fromEntries(names.filter(name=>model.getObjectByName(name)).map(name=>[name,bounds(model.getObjectByName(name))]));
 const f=objects['integrated-fridge'],island=objects['stone-island'];
 const sideboard=objects['flush-sideboard']||objects['whole-wall-drinks'];
 return {checkedAt:new Date().toISOString(),source:'Current loaded column-view model; actual mesh geometry boxes, 1mm tolerance, 1-degree door samples',fridgeLayout,livingRevision:livingRevision.id,objects,
  clearancesMm:{cabinetBehind:Math.round((f.min[0]-fridgeLayout.wallFaceX)*1000),cabinetToWallSegmentEnds:[Math.round((f.min[2]-1.8)*1000),Math.round((2.86-f.max[2])*1000)],islandToKitchenWall:Math.round((island.min[0]-fridgeLayout.wallFaceX)*1000),islandToSofa:Math.round((objects['linen-sofa'].min[0]-island.max[0])*1000),islandToSideboardAlongZ:sideboard?Math.round((sideboard.min[2]-island.max[2])*1000):null},
  closedExternalHits,doorSweep,upperSweep,internalClosedHits,bins,
  limitations:['900 × 600mm is user-confirmed; height, surround and internals are design assumptions.','No selected appliance: hinge behavior, ventilation and installation allowances remain unverified.','Collision sampling uses conservative mesh boxes and does not certify real-world motion or walking comfort.']};
}
