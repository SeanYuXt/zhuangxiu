const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1440,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/shader|WebGL|framebuffer/i.test(m.text()))errors.push(m.text());});
 await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bed3&daylight=baked-child');await p.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.bakedWallDebug?.ready,null,{timeout:60000});
 if(process.argv.includes('--expect-stale')){
  const state=await p.evaluate(()=>bakedWallDebug.state);assert.equal(state.active,false);assert.equal(state.valid,false);assert.match(state.reason,/geometry changed/);
  await p.locator('#lightingMode').click();await p.locator('#lightingMode').click();assert.deepEqual(errors,[]);
  fs.writeFileSync(__dirname+'/baked-wall-stale-verification.json',JSON.stringify({state,errors},null,2));console.log(JSON.stringify({state,errors}));return;
 }
 await p.evaluate(()=>roomViewsDebug.select('child-study'));await p.screenshot({path:__dirname+'/baked-child-study-desktop.png'});
 const report=await p.evaluate(()=>{
  const d=bakedWallDebug;d.update();const before={...d.state};const textures=d.entries.map(e=>({name:e.o.name,width:e.baked.lightMap.image.width,height:e.baked.lightMap.image.height,channel:e.baked.lightMap.channel,active:e.o.material===e.baked,vertices:e.o.geometry.attributes.position.count}));
  fridgeDetailsDebug.setDoors(1);d.update();const changed={...d.state},fallback=d.entries.every(e=>e.o.material===e.original);fridgeDetailsDebug.reset();d.update();const restored={...d.state};return {before,textures,changed,fallback,restored,source:d.manifest.sourceSha256};
 });
 report.postprocess=await p.evaluate(()=>bakedWallDebug.manifest.postprocess);
 assert.equal(report.postprocess.algorithm,'Blender compositor OpenImageDenoise');assert.equal(report.postprocess.hdr,true);
 fs.writeFileSync(__dirname+'/baked-wall-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 assert.ok(report.before.active&&report.textures.every(t=>t.active&&t.width===1024&&t.height===1024&&t.channel===1&&t.vertices===24));assert.equal(report.changed.valid,false);assert.ok(report.fallback&&report.restored.active);
 await p.locator('#lightingMode').click();assert.equal(await p.evaluate(()=>bakedWallDebug.state.active),false);await p.locator('#lightingMode').click();assert.equal(await p.evaluate(()=>bakedWallDebug.state.active),true);
 await p.setViewportSize({width:390,height:844});await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/mobile-preview.html?space=bed3&angle=child-study&daylight=baked-child');const f=p.frames().find(f=>f.url().includes('column-view.html'));assert.ok(f);await f.waitForFunction(()=>window.bakedWallDebug?.ready&&window.columnViewDebug?.state.ready,null,{timeout:60000});await p.screenshot({path:__dirname+'/baked-child-study-phone.png'});assert.ok(await f.evaluate(()=>bakedWallDebug.state.active));
 report.errors=errors;assert.deepEqual(errors,[]);fs.writeFileSync(__dirname+'/baked-wall-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
