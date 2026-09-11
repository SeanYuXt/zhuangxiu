import * as T from './vendor/three.module.js';
import {setDoorLeafFraction,setDoorLeafOpen} from './door-motion.js';
import {entryCompositionSpec as spec} from './entry-composition-spec.js?v=entry-wall-only-3';

// Regress outward swing, the 600mm closed envelope, and controls for retained cabinets.
export function auditEntryDesign(model,entryController,sideboardController){
 const require=(value,message)=>{if(!value)throw Error(message);};
 const box=name=>new T.Box3().setFromObject(model.getObjectByName(name));
 const wasEntryOpen=entryController.state.opened;
 entryController.setOpen(false);model.updateMatrixWorld(true);
 const names=['flush-entry-cabinet','entry-welcome-niche','entry-low-cabinet'];
 const closed=names.map(name=>{
  const b=box(name),depth=spec.wallFaceZ-b.min.z;
  require(depth<=spec.maxDepth+.00001,name+' exceeds 600mm');require(b.min.y>=-.001,name+' below floor');
  return {name,depthMm:Math.round(depth*1000),min:b.min.toArray(),max:b.max.toArray()};
 });
 const doors=[];
 try{
  for(const name of ['door-front-main','door-front-secondary']){
   const d=model.getObjectByName(name),was=d.userData.open,panel=d.children.find(o=>o.name.endsWith('-panel'));
   require(d.userData.swing_into==='exterior',name+' metadata differs');
   try{
    for(let deg=1;deg<=90;deg++){
     setDoorLeafFraction(d,deg/90);model.updateMatrixWorld(true);
     const b=new T.Box3().setFromObject(panel),center=b.getCenter(new T.Vector3());
     require(center.z>d.position.z,name+' swings inside at '+deg);
     for(const target of names)require(!b.intersectsBox(box(target)),name+' intersects '+target);
    }
    doors.push({name,turn:d.userData.turn,outwardAnglesChecked:90,intersectsEntryFurniture:false});
   }finally{setDoorLeafOpen(d,was);}
  }
  entryController.setOpen(true);model.updateMatrixWorld(true);
  require(entryController.drawers.every(d=>Math.abs(d.position.z+d.userData.travel)<1e-8),'Entry drawer travel differs from its specification');
  require(entryController.leaves.every(d=>Math.abs(d.rotation.y-Math.PI/2)<1e-8),'Shoe doors do not reach 90 degrees');
  entryController.setOpen(false);
  require(entryController.drawers.every(d=>d.position.z===0),'Entry drawers fail to close');
  for(const i of spec.upper.removedModules)require(!model.getObjectByName('sideboard-upper-door-'+i).visible,'Removed upper door still visible');
  for(const i of spec.upper.keepModules){sideboardController.setDoor('upper',i);require(model.getObjectByName('sideboard-upper-door-'+i).visible,'Retained upper door hidden');require(Math.abs(model.getObjectByName('sideboard-upper-door-'+i).rotation.y)>.5,'Retained upper door fails to open');}
  sideboardController.reset();
  const mirror=box('entry-dressing-mirror'),bench=box('entry-shoe-bench');
  require(mirror.max.x<bench.min.x,'Mirror must not sit behind the bench');
  require(!model.getObjectByName('entry-bench-cushion'),'User requested no cushion');
  const root=model.getObjectByName('entry-single-side-layout'),visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible||p.userData.walkThrough)return false;return true;};
  const under=(o,r)=>{for(let p=o;p;p=p.parent)if(p===r)return true;return false;};
  const rects=[];model.updateMatrixWorld(true);
  model.traverse(o=>{if(!o.isMesh||!visible(o)||o.isReflector||under(o,root))return;const b=new T.Box3().setFromObject(o);if(b.max.y<.08||b.min.y>2.65||b.max.x<2.7||b.min.x>8.1||b.max.z<5.4||b.min.z>7.5)return;rects.push({name:o.name,b});});
  const overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>.001);
  const closedExternalHits=[];root.traverse(o=>{if(!o.isMesh||!visible(o)||o.isReflector)return;const b=new T.Box3().setFromObject(o);for(const other of rects)if(overlap(b,other.b))closedExternalHits.push({part:o.name,obstacle:other.name});});
  require(closedExternalHits.length===0,'New entry storage collides: '+JSON.stringify(closedExternalHits.slice(0,4)));
  const swingHits=[];
  for(let deg=0;deg<=90;deg++){
   entryController.setFraction(deg/90);
   for(const leaf of entryController.leaves){const b=new T.Box3().setFromObject(leaf);for(const other of rects)if(overlap(b,other.b)&&!swingHits.some(h=>h.part===leaf.name&&h.obstacle===other.name))swingHits.push({part:leaf.name,obstacle:other.name,firstAngle:deg});}
  }
  entryController.setOpen(false);
  require(swingHits.length===0,'Entry door sweep hits surroundings: '+JSON.stringify(swingHits));
  const route=[[6.8,6.25],[6.8,5.85],[5.7,5.85],[4.5,5.85],[3.9,5.95]],routeHits=new Set(),obstacles=[];
  // 600mm round proxy through the actual closed furniture/wall mesh boxes.
  model.traverse(o=>{if(!o.isMesh||!visible(o)||o.isReflector)return;const b=new T.Box3().setFromObject(o);if(b.max.y<.10||b.min.y>1.9||b.max.x<3.2||b.min.x>7.5||b.max.z<5.4||b.min.z>7.2)return;obstacles.push({name:o.name,b});});
  for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.025);for(let j=0;j<=steps;j++){const x=a[0]+(b[0]-a[0])*j/steps,z=a[1]+(b[1]-a[1])*j/steps;for(const o of obstacles)if(Math.hypot(Math.max(o.b.min.x-x,0,x-o.b.max.x),Math.max(o.b.min.z-z,0,z-o.b.max.z))<.299)routeHits.add(o.name);}}
  require(routeHits.size===0,'Closed entry route blocked: '+JSON.stringify([...routeHits]));
  return {doors,closed,entryDoorsAndDrawers:'PASS',retainedUpperControls:'PASS',removedUpperModules:spec.upper.removedModules,closedExternalHits,swingHits,closedRoute:{diameterMm:600,route,hits:[...routeHits]},mirrorClearOfBench:true,cushion:false,storage:model.getObjectByName('flush-entry-cabinet').userData,limits:'Mesh boxes and sampled 600mm route; no human-motion, construction, load or full-clearance certification.'};
 }finally{entryController.setOpen(wasEntryOpen);model.updateMatrixWorld(true);}
}
