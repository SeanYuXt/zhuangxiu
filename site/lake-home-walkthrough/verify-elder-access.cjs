const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bed1');await page.waitForFunction(()=>columnViewDebug.state.ready);
 const result=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{rooms,P}=await import('./plan.js'),{makeElderAccessTrial}=await import('./elder-access-trial.js'),model=columnViewDebug.dryStudy.model;
  const names=['bed1-bed','bed1-wardrobe','bed1-desk','bed1-desk-everyday'],originals=names.map(n=>model.getObjectByName(n)),saved=originals.map(o=>({name:o.name,visible:o.visible,matrix:o.matrix.toArray()}));
  const candidate=makeElderAccessTrial(model);originals.forEach(o=>{o.name+='-baseline';o.visible=false;});model.add(candidate.root);model.updateMatrixWorld(true);
  const box=o=>new T.Box3().setFromObject(o),meshes=o=>{const out=[];o.traverse(m=>{if(m.isMesh)out.push(m);});return out;},polygon=rooms.find(r=>r.id==='bed1').poly.map(P);
  const inside=(x,z)=>{let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
  const shape=m=>{m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;return {poly:[[b.min.x,b.min.z],[b.max.x,b.min.z],[b.max.x,b.max.z],[b.min.x,b.max.z]].map(([x,z])=>{const p=m.localToWorld(new T.Vector3(x,0,z));return [p.x,p.z];}),b:box(m)};};
  const overlap=(a,b)=>{
   if(Math.min(a.b.max.y,b.b.max.y)-Math.max(a.b.min.y,b.b.min.y)<=.001)return false;
   for(const poly of [a.poly,b.poly])for(let i=0;i<4;i++){const p=poly[i],q=poly[(i+1)%4],axis=[q[1]-p[1],p[0]-q[0]],l=Math.hypot(...axis);if(l<1e-8)continue;const p1=a.poly.map(v=>(v[0]*axis[0]+v[1]*axis[1])/l),p2=b.poly.map(v=>(v[0]*axis[0]+v[1]*axis[1])/l);if(Math.min(Math.max(...p1),Math.max(...p2))-Math.max(Math.min(...p1),Math.min(...p2))<=.001)return false;}return true;
  };
  const bedMeshes=meshes(candidate.bed),bedShapes=bedMeshes.map(shape),door=model.getObjectByName('door-bed1-single'),rotation=door.rotation.clone();
  const outside=meshes(candidate.root).filter(m=>shape(m).poly.some(([x,z])=>!inside(x,z))).map(m=>m.name),roomDoorHits=[],cabinetDoorHits=[];
  for(let angle=0;angle<=90;angle++){
   door.rotation.y=door.userData.base+door.userData.turn*angle*Math.PI/180;door.updateWorldMatrix(true,true);
   for(const m of meshes(door))for(const n of meshes(candidate.root))if(overlap(shape(m),shape(n)))roomDoorHits.push({angle,object:n.name});
   candidate.root.getObjectByName('elder-cabinet-door').rotation.y=-angle*Math.PI/180;candidate.root.updateMatrixWorld(true);
   for(const m of meshes(candidate.wardrobe))for(const b of bedShapes)if(overlap(shape(m),b))cabinetDoorHits.push({angle,object:m.name});
  }
  door.rotation.copy(rotation);door.updateWorldMatrix(true,true);candidate.setDoor(false);
  const routes=[];
  for(const use of ['closed','open','occupied'])for(const radius of [.30,.35]){
   candidate.setDoor(use!=='closed');model.updateMatrixWorld(true);
   const obstacles=[...meshes(candidate.root),...meshes(door),...meshes(model.getObjectByName('bed1-curtain'))].filter(m=>box(m).min.y<1.9).map(m=>{const b=box(m);return {x0:b.min.x,x1:b.max.x,z0:b.min.z,z1:b.max.z};});
   if(use==='occupied')obstacles.push({x0:1.40,x1:2.05,z0:4.78,z1:5.38});
   const free=(x,z)=>inside(x,z)&&Array.from({length:32},(_,i)=>inside(x+radius*Math.cos(i*Math.PI/16),z+radius*Math.sin(i*Math.PI/16))).every(Boolean)&&!obstacles.some(b=>{const dx=Math.max(b.x0-x,0,x-b.x1),dz=Math.max(b.z0-z,0,z-b.z1);return dx*dx+dz*dz<radius*radius-1e-9;});
   const step=.01,start=[310,507],queue=[start],seen=new Set();if(free(3.10,5.07))seen.add(start.join(','));
   for(let i=0;i<queue.length&&seen.size;i++){const [x,z]=queue[i];for(const [nx,nz] of [[x+1,z],[x-1,z],[x,z+1],[x,z-1]]){const key=nx+','+nz;if(nx<20||nx>362||nz<180||nz>540||seen.has(key)||!free(nx*step,nz*step))continue;seen.add(key);queue.push([nx,nz]);}}
   routes.push({use,diameterMm:radius*2000,start:[3.1,5.07],startFree:free(3.1,5.07),targets:[['upperBedside',1.82,2.88],['lowerBedside',1.82,5.07]].map(([name,x,z])=>({name,point:[x,z],free:free(x,z),connected:seen.has(Math.round(x/step)+','+Math.round(z/step))}))});
  }
  const base=box(candidate.bed.children[0]),mattress=box(candidate.bed.children[1]),head=box(candidate.bed.children[2]);
  const data={outside,roomDoorHits,cabinetDoorHits,routes,frameMm:base.getSize(new T.Vector3()).toArray().map(v=>Math.round(v*1000)),mattressMm:mattress.getSize(new T.Vector3()).toArray().map(v=>Math.round(v*1000)),headback:head.min.x,headZ:[head.min.z,head.max.z],lowerGapMm:Math.round((5.39-base.max.z)*1000),footGapAtOpenDoorMm:Math.round((box(door).min.x-base.max.x)*1000),storageWidthMm:580};
  candidate.root.removeFromParent();originals.forEach((o,i)=>{o.name=saved[i].name;o.visible=saved[i].visible;});model.updateMatrixWorld(true);
  data.restored=originals.every((o,i)=>o.name===saved[i].name&&o.visible===saved[i].visible&&o.matrix.toArray().every((n,j)=>n===saved[i].matrix[j]));return data;
 });
 fs.writeFileSync(__dirname+'/elder-access-verification.json',JSON.stringify({...result,errors,scope:'Conditional study, not selected layout or construction approval; occupancy 650x600mm, 10mm grid and 32 circular probes; no real product, wall anchorage, night-light lux or complete source calibration'},null,2));
 console.log(JSON.stringify(result,null,2));assert.ok(result.restored);assert.deepEqual(errors,[]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
