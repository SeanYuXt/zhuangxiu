const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const url='http://127.0.0.1:8768/lake-home-walkthrough/';
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],report={states:[]};p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url+'column-view.html?v=swivel-egress&space=bar');await p.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.barSeatsDebug);
 report.geometry=await p.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),model=masterDressingDebug.model,rows=[],hits=[];
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const meshBox=o=>new T.Box3().setFromObject(o),intersects=(a,b)=>[0,1,2].every(i=>Math.min(a.max.getComponent(i),b.max.getComponent(i))-Math.max(a.min.getComponent(i),b.min.getComponent(i))>.0005);
  for(const {stool,upper,base} of barSeatsDebug.seats){
   model.updateMatrixWorld(true);const original=meshBox(stool),pads=[];base.traverse(o=>{if(o.name==='swivel-floor-pad')pads.push(meshBox(o).min.y);});
   const others=[];model.traverse(o=>{if(!o.isMesh||!visible(o))return;for(let a=o;a;a=a.parent)if(a===stool)return;const b=meshBox(o);if(b.max.y<.59||b.min.y>.87)return;if(b.distanceToPoint(stool.getWorldPosition(new T.Vector3()).setY(.7))>.5)return;others.push({name:o.name,b});});
   for(let degrees=0;degrees<=90;degrees++){
    upper.rotation.y=degrees*Math.PI/180;stool.updateMatrixWorld(true);upper.traverse(o=>{if(!o.isMesh)return;const b=meshBox(o);for(const other of others)if(intersects(b,other.b))hits.push({seat:stool.name,part:o.name,degrees,other:other.name});});
   }
   upper.rotation.y=0;stool.updateMatrixWorld(true);const after=meshBox(stool);
   rows.push({name:stool.name,size:original.getSize(new T.Vector3()).toArray(),bottom:original.min.y,pads,unchangedAtReset:original.min.distanceTo(after.min)<1e-6&&original.max.distanceTo(after.max)<1e-6});
  }
  return {rows,hits,layout:livingLayoutDebug.metrics};
 });
 assert.deepEqual(report.geometry.hits,[]);assert.equal(report.geometry.rows.length,4);
 for(const r of report.geometry.rows){assert.ok(Math.abs(r.size[0]-.425)<1e-5&&Math.abs(r.size[1]-.854)<1e-5,'Preserve seat width/top, ground foot pads');assert.ok(r.pads.length===4&&r.pads.every(y=>Math.abs(y-.006)<1e-6));assert.ok(r.unchangedAtReset);}
 assert.ok(Math.abs(report.geometry.layout.islandToSofa-1.05)<1e-5);assert.ok(Math.abs(report.geometry.layout.sofaToCoffee-.45)<1e-5);assert.ok(report.geometry.layout.wingLengths.every(v=>Math.abs(v-1.3)<1e-5));
 report.walkCache=await p.evaluate(()=>{
  livingLayoutDebug.seatsUse.set('stored');walkDebug.rebuild();const initial=walkDebug.state.stamp;
  livingLayoutDebug.seatsUse.set('stand',1);const changed=walkDebug.refreshCollisionState(),updated=walkDebug.state.stamp,signature=JSON.stringify(walkDebug.obstacles);
  walkDebug.rebuild();const matchesFull=signature===JSON.stringify(walkDebug.obstacles);livingLayoutDebug.seatsUse.set('stored');walkDebug.refreshCollisionState();return {initial,changed,updated,matchesFull};
 });assert.ok(report.walkCache.changed&&report.walkCache.updated===report.walkCache.initial+1&&report.walkCache.matchesFull,'Walking must see the rotated chair');
 await p.locator('#livingLayoutToggle').click();
 for(let i=0;i<6;i++){
  await p.locator('[data-seat-mode="stand"]').click();const state=await p.evaluate(()=>livingLayoutDebug.seatsUse.state);assert.equal(state.active,i);assert.ok(state.egress.reached,JSON.stringify({i,probes:state.egress.probes}));
  // Independent rectangle/point distance implementation along every route
  // segment at 5 mm, including the active chair as an obstacle.
  const a=state.egress;assert.ok(a.solids.some(s=>s.role==='active-chair'));let samples=0;
  for(let j=0;j<a.path.length;j++){
   const from=a.path[Math.max(0,j-1)],to=a.path[j],length=Math.hypot(to[0]-from[0],to[1]-from[1]),n=Math.max(1,Math.ceil(length/.005));
   for(let k=0;k<=n;k++){const x=from[0]+(to[0]-from[0])*k/n,z=from[1]+(to[1]-from[1])*k/n;for(const o of a.solids){const qx=Math.max(o.x1,Math.min(o.x2,x)),qz=Math.max(o.z1,Math.min(o.z2,z));assert.ok((qx-x)**2+(qz-z)**2>=.09-1e-7,'Path intersects '+o.name);}samples++;}
  }
  report.states.push({active:i,standing:a.standing,path:a.path,samples,positions:state.entries.map(e=>({name:e.name,position:e.position,angle:e.angle}))});
  if(i===1)await p.screenshot({path:__dirname+'/swivel-egress-desktop.png'});
 }
 await p.locator('[data-seat-mode="pulled"]').click();report.stress=await p.evaluate(()=>[0,1,2,3,4,5].map(i=>{const a=livingLayoutDebug.seatsUse.checkEgress(i);return {i,reached:a.reached};}));
 assert.ok(report.stress.some(r=>!r.reached),'Retain all-pulled limitation rather than hide it');
 await p.locator('[data-seat-mode="stand"]').click();await p.locator('#seatUseView3d').click();assert.equal(await p.evaluate(()=>columnViewDebug.state.station),'bar');await p.screenshot({path:__dirname+'/swivel-egress-bar-desktop.png'});
 await p.setViewportSize({width:390,height:844});await p.goto(url+'mobile-preview.html?v=swivel-egress&space=bar');const frame=p.frames().find(f=>f.url().includes('column-view.html'));await frame.waitForFunction(()=>window.columnViewDebug?.state.ready);
 await frame.locator('#allPlaces').click();await frame.locator('#mobileLivingLayout').click();await frame.locator('[data-seat-mode="stand"]').click();await frame.locator('[data-seat-mode="stand"]').click();
 report.mobile=await frame.evaluate(()=>{const s=livingLayoutDebug.seatsUse.state;return {active:s.active,reached:s.egress.reached,standing:s.egress.standing,mode:s.mode};});assert.equal(report.mobile.active,1);assert.ok(report.mobile.reached);await p.screenshot({path:__dirname+'/swivel-egress-mobile.png'});
 await frame.locator('#seatUseView3d').click();assert.equal(await frame.evaluate(()=>columnViewDebug.state.station),'bar');
 report.turnControls=[];for(let click=0;click<5;click++){
  await frame.locator('#barSwivelToggle').click();const s=await frame.evaluate(()=>livingLayoutDebug.seatsUse.state);
  assert.equal(s.mode,click===4?'stored':'stand');if(click<4){assert.equal(s.active,click);assert.ok(s.egress.reached);}report.turnControls.push({click,mode:s.mode,active:s.active});
 }
 await frame.locator('#placeDetails').click();await frame.locator('[data-detail-object="upholstered-counter-stool-left-1"]').click();
 assert.equal(await frame.evaluate(()=>columnViewDebug.state.selectedFacility),'upholstered-counter-stool-left-1');assert.ok(await frame.evaluate(()=>columnViewDebug.state.selectedVisible));await p.screenshot({path:__dirname+'/swivel-chair-detail-mobile.png'});
 await p.setViewportSize({width:1440,height:1000});await p.goto(url+'column-view.html?v=swivel-egress&space=bar');await p.waitForFunction(()=>window.columnViewDebug?.state.ready);
 await p.locator('#facilities').evaluate(o=>o.open=true);await p.locator('[data-facility="upholstered-counter-stool-left-1"]').click();assert.ok(await p.evaluate(()=>columnViewDebug.state.selectedVisible));assert.equal(await p.evaluate(()=>livingLayoutDebug.seatsUse.state.active),1);await p.screenshot({path:__dirname+'/swivel-chair-detail-desktop.png'});
 assert.deepEqual(errors,[]);report.errors=errors;fs.writeFileSync(__dirname+'/seat-egress-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({geometry:report.geometry,states:report.states.map(({active,standing,samples})=>({active,standing,samples})),stress:report.stress,mobile:report.mobile,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
