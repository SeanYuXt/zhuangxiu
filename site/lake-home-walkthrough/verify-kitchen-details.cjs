const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=kitchen');await p.waitForFunction(()=>window.columnViewDebug?.state.ready);
 const report=await p.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),m=masterDressingDebug.model,d=kitchenDetailsDebug;
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;},under=(o,g)=>{for(let p=o;p;p=p.parent)if(p===g)return true;return false;},bounds=o=>new T.Box3().setFromObject(o);
  const meshList=g=>{const a=[];g.traverse(o=>{if(o.isMesh&&visible(o))a.push(o);});return a;};
  // OBB separating-axis check avoids treating a rotated door's empty AABB corners as solid.
  const obb=o=>{o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,c=b.getCenter(new T.Vector3()).applyMatrix4(o.matrixWorld),s=b.getSize(new T.Vector3()).multiplyScalar(.5),e=o.matrixWorld.elements,axes=[new T.Vector3(e[0],e[1],e[2]),new T.Vector3(e[4],e[5],e[6]),new T.Vector3(e[8],e[9],e[10])];const ext=axes.map((v,i)=>v.length()*s.getComponent(i));axes.forEach(v=>v.normalize());return {c,axes,ext};};
  const overlap=(a,b)=>{const delta=b.c.clone().sub(a.c),axes=[...a.axes,...b.axes];for(const x of a.axes)for(const y of b.axes){const v=x.clone().cross(y);if(v.lengthSq()>1e-10)axes.push(v.normalize());}return axes.every(v=>a.axes.reduce((n,x,i)=>n+Math.abs(x.dot(v))*a.ext[i],0)+b.axes.reduce((n,x,i)=>n+Math.abs(x.dot(v))*b.ext[i],0)-Math.abs(delta.dot(v))>.001);};
  d.reset();const all=meshList(m).filter(o=>{const b=bounds(o);return b.max.x>3.6&&b.min.x<5.8&&b.max.z>1.8&&b.min.z<5&&b.max.y>.04&&b.min.y<1.85;});
  const drawerHits=new Map(),doorHits=new Map();
  const inspect=(root,others,pose,map)=>{for(const o of meshList(root)){const a=obb(o);for(const other of others)if(overlap(a,obb(other))){const k=o.name+'|'+other.name;if(!map.has(k))map.set(k,{pose,part:o.name,other:other.name,parent:other.parent.name});}}};
  for(let n=0;n<d.moving.length;n++){
   d.reset();const others=all.filter(o=>!under(o,d.moving[n]));
   for(let i=0;i<=40;i++){d.setDrawer(n,i/40);inspect(d.moving[n],others,i,drawerHits);}
  }
  d.reset();for(let i=0;i<=90;i++){d.setSinkFraction(i/90);for(const door of d.doors)inspect(door,all.filter(o=>!under(o,door)),i,doorHits);}
  d.reset();const out=[],invalid=[],kitchenMeshes=[...meshList(d.cooking),...meshList(d.sinkCab),m.getObjectByName('kitchen-counter-joint')];
  for(const o of kitchenMeshes){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){const v=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);if(![v.x,v.y,v.z].every(Number.isFinite)){invalid.push(o.name);break;}if(v.x<(v.z<2.5-1e-8?3.8:3.7)-.001||v.x>5.721||v.z<1.899||v.z>5.301){out.push({name:o.name,point:v.toArray()});break;}}}
  const counterNames=['kitchen-west-worktop','kitchen-counter-joint','kitchen-sink-counter-side','kitchen-sink-counter-end'],counters=kitchenMeshes.filter(o=>counterNames.includes(o.name)),counterHits=[];
  for(let i=0;i<counters.length;i++)for(let j=i+1;j<counters.length;j++)if(overlap(obb(counters[i]),obb(counters[j])))counterHits.push([counters[i].name,counters[j].name]);
  const ray=new T.Raycaster(new T.Vector3(4.86,1.4,2.17),new T.Vector3(0,-1,0)),hit=ray.intersectObjects(kitchenMeshes,false)[0];
  const sink=m.getObjectByName('kitchen-sink'),hob=m.getObjectByName('kitchen-hob'),hood=bounds(d.hood),hb=bounds(hob),serviceHits=new Map(),cornerHits=[];
  inspect(d.services,meshList(d.sinkCab).filter(o=>!under(o,d.services)&&!under(o,sink)),0,serviceHits);
  for(const a of meshList(m.getObjectByName('kitchen-base-carcasses')))for(const b of meshList(m.getObjectByName('kitchen-north-carcass')))if(overlap(obb(a),obb(b)))cornerHits.push([a.name,b.name]);
  const routes=[];for(const state of ['closed','prep','pots','sink']){
   d.reset();if(state==='prep')d.setDrawer(2);if(state==='pots')d.setDrawer(5);if(state==='sink')d.setSinkDoors(true);
   const blocks=all.map(o=>bounds(o)).filter(b=>b.max.y>.10&&b.min.y<1.75);
   const free=(x,z)=>x>=4.02&&x<=5.42&&z>=2.20&&z<=5.0&&!blocks.some(b=>Math.hypot(Math.max(b.min.x-x,0,x-b.max.x),Math.max(b.min.z-z,0,z-b.max.z))<.30-.0001);
   const start=[5.30,4.75],queue=free(...start)?[[0,0]]:[],seen=new Set(['0,0']);for(let i=0;i<queue.length;i++)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=queue[i][0]+dx,nz=queue[i][1]+dz,k=nx+','+nz;if(!seen.has(k)&&free(start[0]+nx*.02,start[1]+nz*.02)){seen.add(k);queue.push([nx,nz]);}}
   const target=state==='sink'?[4.95,3.36]:state==='pots'?[5.12,4.44]:state==='prep'?[5.12,2.97]:[4.95,2.87];
   routes.push({state,target,nodes:queue.length,reachable:queue.some(([x,z])=>Math.hypot(start[0]+x*.02-target[0],start[1]+z*.02-target[1])<.055)});
  }
  d.reset();const closedFronts=meshList(d.sinkCab).filter(o=>['sink-door-panel','sealed-blind-corner-front','sink-divider-cover-stile','sink-right-end-stile'].includes(o.name)).map(o=>{const b=bounds(o);return {name:o.name,x0:b.min.x,x1:b.max.x,y1:b.max.y,z1:b.max.z};}).sort((a,b)=>a.x0-b.x0);
  const closedGaps=closedFronts.slice(1).map((o,i)=>o.x0-closedFronts[i].x1);
  const pullClearance=bounds(m.getObjectByName('sink-pull-rail-top')).min.y-Math.max(...closedFronts.map(o=>o.y1));
  return {drawerHits:[...drawerHits.values()],doorHits:[...doorHits.values()],serviceHits:[...serviceHits.values()],cornerHits,out,invalid,counterHits,basinHit:hit&&{name:hit.object.name,y:hit.point.y},sinkPosition:sink.getWorldPosition(new T.Vector3()).toArray(),hobPosition:hob.getWorldPosition(new T.Vector3()).toArray(),hoodClearance:hood.min.y-hb.max.y,routes,services:d.services.userData,drawers:d.moving.map(o=>o.name),closedFronts,closedGaps,pullClearance};
 });
 fs.writeFileSync(__dirname+'/kitchen-details-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 await p.screenshot({path:__dirname+'/kitchen-current-mobile.png'});
 assert.deepEqual(report.invalid,[]);assert.deepEqual(report.out,[]);assert.deepEqual(report.counterHits,[]);assert.deepEqual(report.cornerHits,[]);assert.deepEqual(report.serviceHits,[]);assert.deepEqual(report.drawerHits,[]);assert.deepEqual(report.doorHits,[]);assert.ok(report.basinHit.y<.85,'Basin must be recessed, not solid countertop');assert.ok(report.routes.every(r=>r.reachable),'600mm approach with one storage action');assert.equal(report.services.supplyConnection,null);assert.deepEqual(report.sinkPosition,[4.86,0,2.17]);assert.deepEqual(report.hobPosition,[4.03,0,3.54]);assert.ok(Math.abs(report.hoodClearance-.699)<.001);
 for(const object of [...report.drawers,'kitchen-sink-service-bay']){await p.locator('#placeDetails').click();await p.locator(`[data-detail-object="${object}"]`).click();assert.ok(await p.evaluate(()=>columnViewDebug.state.selectedVisible),object);await p.screenshot({path:__dirname+'/'+object+'-mobile.png'});}
 for(const viewport of [{width:390,height:844},{width:1450,height:950}]){await p.setViewportSize(viewport);await p.evaluate(()=>kitchenDetailsDebug.reset());
  for(const [action,expected] of [['prep',2],['pots',5]]){await p.locator(`[data-kitchen-action="${action}"]`).click();assert.equal(await p.evaluate(()=>kitchenDetailsDebug.state.drawer),expected);}
  await p.locator('[data-kitchen-action="sink"]').click();assert.equal(await p.evaluate(()=>kitchenDetailsDebug.state.sinkDoors),true);await p.screenshot({path:__dirname+`/kitchen-service-${viewport.width}.png`});
  await p.locator('[data-kitchen-action="reset"]').click();assert.deepEqual(await p.evaluate(()=>kitchenDetailsDebug.state),{drawer:-1,sinkDoors:false});await p.screenshot({path:__dirname+`/kitchen-overall-${viewport.width}.png`});
 }
 assert.equal(report.closedGaps.length,5);assert.ok(report.closedGaps.every(g=>Math.abs(g-.003)<1e-6),'All closed vertical reveals must be 3mm');assert.ok(Math.abs(report.pullClearance-.020)<1e-6,'20mm recessed edge-pull opening');assert.ok(report.closedFronts.every(o=>Math.abs(o.z1-2.495)<1e-6),'Door and cover fronts must share the same plane');
 assert.deepEqual(errors,[]);report.errors=errors;report.limit='OBB sampled storage mechanisms; 600mm circular approach proxy on 20mm grid, not two-person ergonomics or installation certification. Plumbing endpoints remain unconnected.';fs.writeFileSync(__dirname+'/kitchen-details-verification.json',JSON.stringify(report,null,2));console.log('KITCHEN_VERIFIED');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
