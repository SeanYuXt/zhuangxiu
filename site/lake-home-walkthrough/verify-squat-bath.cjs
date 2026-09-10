// Regression: squat pan must replace the WC, remain visible through a real floor
// opening, and keep the shower entry / modular ceiling from being solid-blocked.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/index.html');
  await page.waitForFunction(()=>window.homeDebug);
  await page.evaluate(()=>homeDebug.finishReady);
  const audit=await page.evaluate(async()=>{
   const T=await import('./vendor/three.module.js'),s=homeDebug.scene;s.updateMatrixWorld(true);
   const bounds=o=>new T.Box3().setFromObject(o),pan=s.getObjectByName('bath1-squat-pan'),b=bounds(pan);
   const room=homeDebug.rooms.find(r=>r.id==='bath1'),p=room.poly.map(homeDebug.P);
   const limits={x0:Math.min(...p.map(v=>v[0])),x1:Math.max(...p.map(v=>v[0])),z0:Math.min(...p.map(v=>v[1])),z1:Math.max(...p.map(v=>v[1]))};
   const ray=new T.Raycaster(new T.Vector3(pan.position.x,.5,pan.position.z),new T.Vector3(0,-1,0)),meshes=[];s.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
   const shower=s.getObjectByName('bath1-shower'),door=shower.getObjectByName('bath1-shower-door'),db=bounds(door),sb=bounds(shower);
   const ceiling=s.getObjectByName('bath1-aluminum-ceiling'),heater=s.getObjectByName('bath1-heater'),hb=bounds(heater);
   const panels=ceiling.children.filter(o=>o.name.startsWith('bath1-ceiling-panel-'));
   const overlaps=panels.filter(o=>bounds(o).intersectsBox(hb)).map(o=>o.name);
   return {oldPublicWC:!!s.getObjectByName('bath1-toilet'),masterWCPreserved:!!s.getObjectByName('bath2-toilet'),
    panBounds:[b.min.toArray(),b.max.toArray()],limits,firstDownwardHit:ray.intersectObjects(meshes,false)[0]?.object.name,hits:ray.intersectObjects(meshes,false).slice(0,6).map(h=>({name:h.object.name,parent:h.object.parent?.name,y:h.point.y,type:h.object.geometry.type})),
    showerClearOpening:shower.userData.clearOpening,doorAngle:door.rotation.y,doorBounds:[db.min.toArray(),db.max.toArray()],
    showerSquatOverlap:sb.intersectsBox(b),showerNorth:shower.position.z-.87/2,showerWest:shower.position.x-.86/2,
    ceiling:ceiling.userData,panels:panels.length,heaterPanelOverlaps:overlaps,heaterBounds:[hb.min.toArray(),hb.max.toArray()],
    modules:['warm-outlet','exhaust-intake','light','concealed-body'].map(n=>!!s.getObjectByName('bath1-heater-'+n)),
    heaterStatus:heater.userData,panStatus:pan.userData};
  });
  assert.equal(audit.oldPublicWC,false);assert.equal(audit.masterWCPreserved,true);
  const [min,max]=audit.panBounds,l=audit.limits;
  assert.ok(min[0]>=l.x0&&max[0]<=l.x1&&min[2]>=l.z0&&max[2]<=l.z1,'pan footprint inside room');
  assert.equal(audit.firstDownwardHit,'bath1-squat-drain-placeholder','floor must not fill the bowl: '+JSON.stringify(audit.hits));
  assert.equal(audit.showerSquatOverlap,false);assert.ok(audit.showerClearOpening>=.8);
  assert.ok(Math.abs(audit.doorAngle+Math.PI/2)<1e-6);
  assert.ok(audit.doorBounds[0][2]>=audit.showerNorth-.02&&audit.doorBounds[1][2]<audit.showerNorth+.87);
  assert.ok(audit.modules.every(Boolean));assert.deepEqual(audit.heaterPanelOverlaps,[]);
  assert.ok(audit.panels>=15);assert.ok(audit.heaterBounds[1][1]<2.8);
  assert.equal(audit.heaterStatus.installationVerified,false);assert.equal(audit.panStatus.installationVerified,false);
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=bath-squat-four-bands&space=bath1&focus=squat');
  await page.waitForFunction(()=>window.columnViewDebug?.state.ready&&columnViewDebug.state.selectedVisible);
  assert.equal(await page.evaluate(()=>columnViewDebug.state.selectedFacility),'bath1-squat-pan');
  await page.screenshot({path:path.join(__dirname,'bath1-squat-preview.png')});
  await page.locator('#facilityTitle').click();
  for(const [name,file] of [['bath1-shower','bath1-shower-entry.png'],['bath1-aluminum-ceiling','bath1-aluminum-updated.png'],['bath1-heater','bath1-heater-updated.png']]){
   await page.locator(`[data-facility="${name}"]`).click();await page.waitForFunction(()=>columnViewDebug.state.selectedVisible);
   await page.screenshot({path:path.join(__dirname,file)});
  }
  await page.locator('[data-mode="layout"]').first().click();await page.screenshot({path:path.join(__dirname,'bath1-squat-layout.png')});
  await page.selectOption('#roomSelect','master');assert.equal(await page.evaluate(()=>columnViewDebug.state.station),'master');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({audit,viewer:true,facilityViews:true,roomSwitch:true,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
