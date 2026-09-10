// Fixed-lighting geometry, stale-state and actual shader regressions.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/shader|WebGL|framebuffer/i.test(m.text()))errors.push(m.text());});
  await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=entry&daylight=surface-baked');
  await p.waitForFunction(()=>window.surfaceLightmapsDebug?.ready,null,{timeout:120000});
  if(process.argv.includes('--expect-pending')){
   const state=await p.evaluate(()=>surfaceLightmapsDebug.state);assert.equal(state.active,false);assert.match(state.reason,/not finished|incomplete/);
   assert.ok(await p.evaluate(()=>columnViewDebug.state.ready));assert.deepEqual(errors,[]);
   const report={state,errors,published:false};fs.writeFileSync(__dirname+'/surface-lightmaps-pending-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));return;
  }
  const report=await p.evaluate(()=>{
   const d=surfaceLightmapsDebug;
   return {state:d.state,receivers:d.entries.map(e=>({name:e.o.name,positions:e.o.geometry.attributes.position.count,uv1:e.o.geometry.attributes.uv1.count,active:e.o.material===e.baked,intensity:e.baked.lightMapIntensity,roughness:e.baked.roughness,originalRoughness:e.original.roughness})),textures:d.textures?.map(t=>({width:t.image.width,height:t.image.height,channel:t.channel}))};
  });assert.ok(report.state.active,JSON.stringify(report.state));assert.equal(report.receivers.length,60);assert.equal(report.textures.length,5);assert.ok(report.receivers.every(r=>r.positions===r.uv1&&r.active&&r.intensity===Math.PI&&r.roughness===r.originalRoughness));
  for(const [id,width,height] of [['child-study',1440,950],['dining-sideboard',1440,950],['balcony-care',1440,950],['child-study',390,844]]){
   await p.setViewportSize({width,height});await p.evaluate(id=>roomViewsDebug.select(id),id);
   await p.screenshot({path:__dirname+`/surface-baked-${id}-${width}.png`});assert.ok(await p.evaluate(()=>surfaceLightmapsDebug.state.active));
  }
  await p.setViewportSize({width:1440,height:950});await p.selectOption('#roomSelect','entry',{force:true});
  await p.locator('header [data-mode="walk"]').click();await p.keyboard.down('w');await p.waitForTimeout(250);await p.keyboard.up('w');
  assert.ok(await p.evaluate(()=>walkDebug.state.active&&surfaceLightmapsDebug.state.active));await p.locator('#walkExit').click();
  report.dynamic=await p.evaluate(()=>{
   const d=surfaceLightmapsDebug;fridgeDetailsDebug.setDoors(1);d.update();const changed=d.state,fallback=d.entries.every(e=>e.o.material===e.original);
   fridgeDetailsDebug.reset();d.update();return {changed,fallback,restored:d.state};
  });assert.equal(report.dynamic.changed.active,false);assert.ok(report.dynamic.fallback&&report.dynamic.restored.active);
  report.finishChange=await p.evaluate(()=>{
   const d=surfaceLightmapsDebug,e=d.entries[0],before=e.original.color.clone();e.o.material.color.set('#887766');const chosen=e.o.material.color.getHex();d.update();
   const changed=d.state,preserved=e.o.material.color.getHex()===chosen;e.original.color.copy(before);d.update();return {changed,preserved,restored:d.state};
  });assert.equal(report.finishChange.changed.active,false);assert.ok(report.finishChange.preserved&&report.finishChange.restored.active,'Do not discard a finish edit while falling back');
  await p.locator('#lightingMode').click();assert.equal(await p.evaluate(()=>surfaceLightmapsDebug.state.active),false);await p.locator('#lightingMode').click();await p.waitForFunction(()=>surfaceLightmapsDebug.state.active);
  await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?dressing=original&daylight=surface-baked');await p.waitForFunction(()=>window.surfaceLightmapsDebug?.ready,null,{timeout:90000});
  report.stale=await p.evaluate(()=>surfaceLightmapsDebug.state);assert.equal(report.stale.active,false);assert.match(report.stale.reason,/differ/);assert.deepEqual(errors,[]);
  report.errors=errors;report.limits='Fixed shell only, viewport simulation; not physical phone performance, dynamic GI or full-home visual acceptance.';
  fs.writeFileSync(__dirname+'/surface-lightmaps-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({state:report.state,receivers:report.receivers.length,dynamic:report.dynamic,stale:report.stale,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
