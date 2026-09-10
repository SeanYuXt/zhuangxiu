// Audit the applied scene, not a detached layout candidate.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bed1');await page.waitForFunction(()=>window.bedroomRevisionDebug&&columnViewDebug.state.ready);
 const result=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{rooms,P}=await import('./plan.js'),{insidePolygon}=await import('./continuous-walk.js'),{setDoorLeafOpen}=await import('./door-motion.js');
  const rev=bedroomRevisionDebug,model=masterDressingDebug.model,box=o=>new T.Box3().setFromObject(o),visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const meshes=o=>{const a=[];o.traverse(m=>{if(m.isMesh&&visible(m))a.push(m);});return a;};
  const obb=o=>{o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,c=b.getCenter(new T.Vector3()).applyMatrix4(o.matrixWorld),size=b.getSize(new T.Vector3()),axes=[0,1,2].map(i=>new T.Vector3().setFromMatrixColumn(o.matrixWorld,i)),half=axes.map((v,i)=>v.length()*size.getComponent(i)/2);axes.forEach(v=>v.normalize());return {c,axes,half};};
  const overlap=(a,b)=>{
   const ba=box(a),bb=box(b);if(!['x','y','z'].every(k=>Math.min(ba.max[k],bb.max[k])-Math.max(ba.min[k],bb.min[k])>.002))return false;
   const aa=obb(a),ab=obb(b),delta=ab.c.clone().sub(aa.c),axes=[...aa.axes,...ab.axes,...aa.axes.flatMap(x=>ab.axes.map(y=>x.clone().cross(y)))];
   for(const axis of axes){if(axis.lengthSq()<1e-10)continue;axis.normalize();const r1=aa.axes.reduce((s,v,i)=>s+Math.abs(v.dot(axis))*aa.half[i],0),r2=ab.axes.reduce((s,v,i)=>s+Math.abs(v.dot(axis))*ab.half[i],0);if(r1+r2-Math.abs(delta.dot(axis))<=.002)return false;}return true;
  };
  const groups={bed1:['bed1-bed','bed1-wardrobe','bed1-window-storage','elder-bedhead-reading-lights'],bed3:['bed3-bed','bed3-wardrobe','bed3-desk','bed3-chair']};
  const output={rooms:[],states:[],doorHits:[],scope:'applied furniture geometry, 1-degree door samples, 600mm route proxy; construction and real bodies unverified'};
  for(const [id,names] of Object.entries(groups)){
   const poly=rooms.find(r=>r.id===id).poly.map(P),outside=[],hits=[];
   for(const name of names)for(const m of meshes(model.getObjectByName(name))){const b=box(m);for(const [x,z] of [[b.min.x+.001,b.min.z+.001],[b.min.x+.001,b.max.z-.001],[b.max.x-.001,b.min.z+.001],[b.max.x-.001,b.max.z-.001]])if(!insidePolygon(x,z,poly))outside.push(m.name);}
   for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++)for(const a of meshes(model.getObjectByName(names[i])))for(const b of meshes(model.getObjectByName(names[j])))if(overlap(a,b))hits.push([a.name,b.name]);
   const door=model.getObjectByName('door-'+id+'-single'),saved=door.rotation.clone();
   for(let deg=0;deg<=90;deg++){
    door.rotation.set(0,door.userData.base+door.userData.turn*deg*Math.PI/180,0);model.updateMatrixWorld(true);
    const doorMeshes=meshes(door);
    for(const name of names)for(const m of meshes(model.getObjectByName(name)))for(const d of doorMeshes)if(overlap(m,d))output.doorHits.push({id,deg,mesh:m.name});
   }
   door.rotation.copy(saved);model.updateMatrixWorld(true);
   output.rooms.push({id,outside:[...new Set(outside)],hits,objects:names.map(name=>{const b=box(model.getObjectByName(name));return {name,min:b.min.toArray(),max:b.max.toArray()};})});
  }
  for(const [name,value] of Object.entries(rev.state))rev.set(name,false);
  for(const [state,actions] of [['stored',[]],['doors',['elderDoors','lowDoors','childDoors']],['study-use',['childChair','childDrawer']],['beds-open',['elderStorage','childStorage']]]){
   for(const name of Object.keys(rev.state))rev.set(name,actions.includes(name));model.updateMatrixWorld(true);
   const hits=[];for(const names of Object.values(groups))for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++)for(const a of meshes(model.getObjectByName(names[i])))for(const b of meshes(model.getObjectByName(names[j])))if(overlap(a,b))hits.push([a.name,b.name]);
   output.states.push({state,hits});
  }
  for(const name of Object.keys(rev.state))rev.set(name,false);
  const liftHeadHits=[];
  for(const id of ['bed1','bed3']){const mechanism=rev.objects[id==='bed1'?'elder':'child'],lift=model.getObjectByName(id+'-bed-lift'),head=model.getObjectByName(id+'-bed-headboard');for(let i=0;i<=65;i++){mechanism.setFraction(i/65);model.updateMatrixWorld(true);for(const part of meshes(lift))if(overlap(part,head))liftHeadHits.push({id,angle:-i/100,part:part.name});}mechanism.setFraction(0);}
  output.liftHeadHits=liftHeadHits;
  const bodyRoutes=[];
  for(const [id,names] of Object.entries(groups))for(const use of ['stored','using']){
   rev.set('childChair',id==='bed3'&&use==='using');rev.set('childDrawer',id==='bed3'&&use==='using');
   const door=model.getObjectByName('door-'+id+'-single');setDoorLeafOpen(door,true);model.updateMatrixWorld(true);
   const poly=rooms.find(r=>r.id===id).poly.map(P),obs=[...names.flatMap(n=>meshes(model.getObjectByName(n))),...meshes(door),...meshes(model.getObjectByName(id+'-curtain'))].map(box).filter(b=>b.min.y<1.8&&b.max.y>.1).map(b=>({x0:b.min.x,x1:b.max.x,z0:b.min.z,z1:b.max.z}));
   if(use==='using')obs.push(id==='bed3'?{x0:14.72,x1:15.32,z0:5.11,z1:5.76}:{x0:1.40,x1:2.05,z0:4.78,z1:5.38});
   const free=(x,z)=>Array.from({length:32},(_,i)=>insidePolygon(x+.30*Math.cos(i*Math.PI/16),z+.30*Math.sin(i*Math.PI/16),poly)).every(Boolean)&&!obs.some(b=>Math.hypot(Math.max(b.x0-x,0,x-b.x1),Math.max(b.z0-z,0,z-b.z1))<.30-1e-8);
   const start=id==='bed1'?[3.1,5.07]:[14.37,5.90],step=.025,queue=[[0,0]],seen=new Set();if(free(...start))seen.add('0,0');else queue.length=0;
   for(let i=0;i<queue.length;i++){const [x,z]=queue[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=nx+','+nz;if(!seen.has(k)&&free(start[0]+nx*step,start[1]+nz*step)&&free(start[0]+(x+dx*.5)*step,start[1]+(z+dz*.5)*step)){seen.add(k);queue.push([nx,nz]);}}}
   const targets=id==='bed1'?[['upperBedside',1.82,2.86],['lowerBedside',1.82,5.07],['bedFoot',3.18,3.98]]:[['bedside',16.25,6.14],['wardrobe',16.15,6.16],['studyApproach',14.40,5.72]];
   bodyRoutes.push({id,use,startFree:free(...start),targets:targets.map(([label,x,z])=>{const reachable=queue.some(([a,b])=>Math.hypot(start[0]+a*step-x,start[1]+b*step-z)<.08);return {label,reachable};})});
  }
  for(const name of Object.keys(rev.state))rev.set(name,false);
  return {...output,bodyRoutes,elderHead:box(model.getObjectByName('bed1-bed-headboard')),childMattress:box(model.getObjectByName('bed3-bed-mattress')).getSize(new T.Vector3()).toArray()};
 });
 for(const id of ['bed1','bed3']){
  await page.locator('#roomSelect').selectOption(id);await page.locator('header [data-mode="layout"]').click();await page.screenshot({path:__dirname+'/'+id+'-revised-plan.png'});
  await page.locator('[data-mode="look"]').click();await page.screenshot({path:__dirname+'/'+id+'-revised-room.png'});
 }
 await page.locator('#roomSelect').selectOption('bed3');await page.locator('[data-bedroom-action="childDoors"]').click();assert.ok(await page.evaluate(()=>bedroomRevisionDebug.state.childDoors));
 await page.setViewportSize({width:390,height:844});await page.locator('[data-quick-room="bed1"]').click();await page.locator('[data-bedroom-action="elderStorage"]').click();assert.ok(await page.evaluate(()=>bedroomRevisionDebug.state.elderStorage));await page.screenshot({path:__dirname+'/elder-storage-mobile.png'});
 result.errors=errors;fs.writeFileSync(__dirname+'/bedroom-revision-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,liftHeadHits:result.liftHeadHits.length,doorHits:result.doorHits.length}));
 assert.deepEqual(errors,[]);assert.ok(result.rooms.every(r=>r.outside.length===0&&r.hits.length===0),'applied furniture overlaps or escapes the room');assert.deepEqual(result.doorHits,[]);assert.deepEqual(result.liftHeadHits,[]);
 assert.ok(result.states.every(s=>s.hits.length===0),'dynamic furniture collision');
 assert.ok(result.bodyRoutes.filter(r=>r.use==='stored').every(r=>r.startFree&&r.targets.every(t=>t.reachable)),'stored furniture must preserve daily paths');
 assert.ok(result.bodyRoutes.filter(r=>r.id==='bed3'&&r.use==='using').every(r=>r.startFree&&r.targets.every(t=>t.reachable)),'child desk use must not block bed/wardrobe');
 assert.ok(Math.abs(result.elderHead.min.x-.805)<.001,'elder head must remain against the left solid wall');
 assert.ok(Math.abs(result.childMattress[2]-1.2)<.001&&Math.abs(result.childMattress[0]-2)<.001);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
