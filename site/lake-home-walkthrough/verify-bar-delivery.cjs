// Prevent stale HD images and source-only overlays in a supposedly current delivery.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const bytes=fs.readFileSync(__dirname+'/offline-render/mobile-current.glb');
 const sourceSha256=crypto.createHash('sha256').update(bytes).digest('hex');
 const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString('utf8'));
 const names=new Set(gltf.nodes.map(n=>n.name));
 for(const name of ['balcony-solid-left','balcony-solid-right','window-living-9','bar-service-cover','bar-laptop-workplace','bar-tea-zone','balcony-care-cabinet','balcony-care-sink','balcony-robot-dock','balcony-cleaning-robot'])assert.ok(names.has(name),name+' missing in exported model');
 for(const name of ['bar-cutout-top-left','bar-cutout-top-right','bar-power-left','bar-power-right','bar-power-lid-left','bar-power-lid-right','column-front-main'])assert.ok(names.has(name),name+' missing in exported model');
 for(const name of ['power-service-box','under-top-distributor'])assert.ok(!names.has(name),'Old exposed electrical plaque/belt exported');
 for(const index of [8,10])assert.ok(!names.has('window-living-'+index),'Old side glazing was exported');
 const manifest=JSON.parse(fs.readFileSync(__dirname+'/offline-render/mobile-detail-renders.json','utf8'));
 assert.equal(manifest.sourceSha256,sourceSha256);
 assert.equal(manifest.renders.length,5);
 for(const render of manifest.renders){const png=fs.readFileSync(__dirname+'/offline-render/'+render.file);assert.equal(png.readUInt32BE(16),1920);assert.equal(png.readUInt32BE(20),1080);}
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-check.html?plan=1');await page.waitForFunction(()=>window.columnCheck);
  const rects=await page.locator('svg rect[stroke-dasharray="5 4"]').evaluateAll(nodes=>nodes.map(n=>({y:+n.getAttribute('y'),height:+n.getAttribute('height'),width:+n.getAttribute('width')})));
  assert.equal(rects.length,2);assert.ok(rects.every(r=>Math.abs(r.width-130)<1e-6&&Math.abs(r.height-56)<1e-6&&Math.abs(r.y-253)<1e-6),JSON.stringify(rects));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/mobile-preview.html?v=column-flush-power');
  const iframe=await page.locator('iframe').elementHandle(),frame=await iframe.contentFrame();await frame.waitForFunction(()=>window.columnViewDebug?.state.ready);
  assert.equal(await frame.evaluate(()=>livingLayoutDebug.metrics.revision),'column-flush-power-20260906');
  await frame.locator('#allPlaces').click();await frame.locator('#openDetailRender').click();await frame.locator('#renderPrevious').click();
  await frame.waitForFunction(()=>{const img=document.querySelector('#detailRender img');return img.src.includes('mobile-care-hd.png')&&img.complete&&img.naturalWidth===1920;});
  await frame.locator('#renderEnter').click();assert.equal(await frame.evaluate(()=>columnViewDebug.state.station),'care');
  await frame.locator('#careRobotDemo').click();assert.equal(await frame.evaluate(()=>balconyCareDebug.robotOut),true);await frame.locator('#careRobotDemo').click();
  assert.deepEqual(errors,[]);console.log(JSON.stringify({sourceSha256,renders:manifest.renders.map(r=>r.id),sideWallsExported:true,oldSideGlassExcluded:true,twoDRects:rects,wrapperRevision:'column-flush-power-20260906',errors}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
