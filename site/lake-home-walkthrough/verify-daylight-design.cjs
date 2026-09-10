const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:1440,height:950}}),errors=[],report={};p.on('pageerror',e=>errors.push(e.message));
 for(const variant of ['baseline','study']){
  await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bed3'+(variant==='study'?'&daylight=study':''));await p.waitForFunction(()=>window.columnViewDebug?.state.ready);
  const geometry=await p.evaluate(()=>{const a=[];masterDressingDebug.model.traverse(o=>{if(o.isMesh)a.push([o.name,[...o.matrixWorld.elements],o.geometry.attributes.position.count]);});return a;});
  report[variant]={geometry};
  for(const id of ['child-study','dining-sideboard','balcony-laundry']){
   await p.evaluate(id=>roomViewsDebug.select(id),id);await p.screenshot({path:__dirname+`/daylight-${variant}-${id}.png`});
  }
 }
 assert.deepEqual(report.baseline.geometry,report.study.geometry,'Daylight must not move/resize room or furniture');delete report.baseline.geometry;delete report.study.geometry;
 report.study.validation=await p.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),d=daylightDesignDebug,m=masterDressingDebug.model,rayReport=[];
  for(const e of d.entries){const hits=new T.Raycaster(e.position,e.normal).intersectObject(m,true).filter(h=>{for(let q=h.object;q;q=q.parent)if(!q.visible)return false;return h.object.isMesh;});const pane=hits.find(h=>h.object===e.pane),before=hits.filter(h=>h.distance<(pane?.distance??e.distance)-.025);
   rayReport.push({id:e.id,room:e.room,source:e.position.toArray(),target:e.target.toArray(),normal:e.normal.toArray(),found:!!pane,blockers:before.map(h=>h.object.name)});
  }
  d.update(roomViewsDebug.camera);const before={...d.state};for(let i=0;i<10;i++)d.update(roomViewsDebug.camera);const stable={...d.state};
  const door=fridgeDetailsDebug;door.setDoors(1);d.update(roomViewsDebug.camera);const changed={...d.state};door.reset();
  return {rayReport,before,stable,changed,pool:d.pool.length};
 });
 fs.writeFileSync(__dirname+'/daylight-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report.study.validation));
 assert.equal(report.study.validation.pool,3);assert.ok(report.study.validation.rayReport.every(r=>r.found&&r.blockers.length===0));assert.equal(new Set(report.study.validation.rayReport.map(r=>r.room)).size,7);
 assert.equal(report.study.validation.before.shadowUpdates,report.study.validation.stable.shadowUpdates);assert.ok(report.study.validation.changed.shadowUpdates>report.study.validation.stable.shadowUpdates);
 await p.locator('#lightingMode').click();assert.equal(await p.evaluate(()=>daylightDesignDebug.state.enabled),false);assert.ok(await p.evaluate(()=>daylightDesignDebug.pool.every(l=>l.intensity===0)));
 await p.locator('#lightingMode').click();assert.equal(await p.evaluate(()=>daylightDesignDebug.state.enabled),true);
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>roomViewsDebug.select('child-study'));await p.screenshot({path:__dirname+'/daylight-study-child-phone.png'});
 report.errors=errors;assert.deepEqual(errors,[]);fs.writeFileSync(__dirname+'/daylight-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
