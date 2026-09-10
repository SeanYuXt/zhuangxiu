// Prevent room/vanity links from selecting the wrong space or a hidden object.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],results=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/index.html?v=washroom-clarity');
  await page.waitForFunction(()=>window.homeDebug);await page.evaluate(()=>homeDebug.finishReady);
  const vanityAudit=await page.evaluate(async()=>{
   const T=await import('./vendor/three.module.js'),h=homeDebug;h.enter();h.scene.updateMatrixWorld(true);
   const cabinet=h.scene.getObjectByName('bath2-vanity'),bounds=new T.Box3().setFromObject(cabinet);
   const front=new T.Vector3(0,0,1).transformDirection(cabinet.matrixWorld).toArray();
   const standing=new T.Box3(new T.Vector3(12.80,.02,2.06),new T.Vector3(13.35,1.90,2.66));
   const door=h.scene.getObjectByName('door-bath2-single'),saved=door.userData.open,hits=[],standingCandidates=[];
   const overlap=(a,b)=>Math.min(a.max.x,b.max.x)-Math.max(a.min.x,b.min.x)>.001&&Math.min(a.max.y,b.max.y)-Math.max(a.min.y,b.min.y)>.001&&Math.min(a.max.z,b.max.z)-Math.max(a.min.z,b.min.z)>.001;
   for(let angle=0;angle<=90;angle++){
    door.rotation.set(0,door.userData.base+door.userData.turn*angle*Math.PI/180,0);door.updateWorldMatrix(true,true);
    door.traverse(m=>{if(!m.isMesh)return;const b=new T.Box3().setFromObject(m);if(overlap(b,bounds))hits.push(angle);if(overlap(b,standing))standingCandidates.push(angle);});
   }
   h.setDoorLeafOpen(door,saved);
   return {position:cabinet.position.toArray(),front,bounds:[bounds.min.toArray(),bounds.max.toArray()],insideModelBathroom:bounds.min.x>=12.26&&bounds.max.x<=14.21&&bounds.min.z>=.84&&bounds.max.z<=2.80,doorMeshAabbCandidates:[...new Set(hits)],standing550x600AabbCandidates:[...new Set(standingCandidates)],fixtureOverlap:['bath2-shower','bath2-toilet'].filter(n=>overlap(bounds,new T.Box3().setFromObject(h.scene.getObjectByName(n))))};
  });
  assert.ok(vanityAudit.front[0]>.99999);assert.ok(vanityAudit.insideModelBathroom);assert.deepEqual(vanityAudit.doorMeshAabbCandidates,[]);assert.deepEqual(vanityAudit.fixtureOverlap,[]);
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=room-clarity&guide=1');
  await page.waitForFunction(()=>window.columnViewDebug?.state.ready);
  assert.equal(await page.locator('#spaceGuide').evaluate(d=>d.open),true);
  assert.equal(await page.locator('#locatorPlan [data-map-object]').count(),5);
  await page.screenshot({path:__dirname+'/room-guide-desktop.png'});
  for(const [room,name] of [['bed1','老人房'],['bed3','儿童房'],['bath1','公卫（次卫）']]){
   assert.equal(await page.locator(`#roomSelect option[value="${room}"]`).textContent(),name);
   await page.locator(`#spaceGuide [data-locate-room="${room}"]:not([data-locate-object])`).click();
   assert.equal(await page.evaluate(()=>columnViewDebug.state.station),room);
   await page.locator('#spaceGuideToggle').click();
  }
  for(const [room,object] of [['bath2','bath2-vanity'],['bath1','bath1-vanity'],['master','master-entry-wardrobe'],['master','master-wardrobe']]){
   await page.locator(`#spaceGuide [data-locate-object="${object}"]`).click();
   await page.waitForFunction(o=>columnViewDebug.state.selectedFacility===o&&columnViewDebug.state.selectedVisible,object);
   assert.equal(await page.evaluate(()=>columnViewDebug.state.station),room);
   results.push({room,object,visible:true});
   if(object==='bath2-vanity'){
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.screenshot({path:__dirname+'/master-vanity-corrected.png'});
   }
   if(object==='bath1-vanity'){
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.screenshot({path:__dirname+'/public-vanity-location.png'});
   }
   await page.locator('#spaceGuideToggle').click();
  }
  await page.locator('#locatorPlan [data-map-object="bath2-vanity"]').click();
  await page.waitForFunction(()=>columnViewDebug.state.station==='bath2'&&columnViewDebug.state.selectedFacility==='bath2-vanity'&&columnViewDebug.state.selectedVisible);
  await page.locator('#spaceGuideToggle').click();
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.locator('#spaceGuide').evaluate(d=>d.scrollWidth>d.clientWidth),false);
  await page.screenshot({path:__dirname+'/room-guide-mobile.png'});
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({names:true,vanityAudit,results,mapPins:5,mapClick:true,mobile:true,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
