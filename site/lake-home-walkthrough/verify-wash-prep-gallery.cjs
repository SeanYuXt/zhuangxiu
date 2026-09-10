// New photos must match current source, retain ratios, and return to actual walk positions.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=__dirname,hash=p=>crypto.createHash('sha256').update(fs.readFileSync(root+'/'+p)).digest('hex');
const manifest=JSON.parse(fs.readFileSync(root+'/offline-render/wash-prep-hd-detail-renders.json','utf8'));
const ids=['ensuite-basin','kitchen-work','master-bedding'];
assert.equal(manifest.sourceSha256,hash('offline-render/mobile-current.glb'));
assert.equal(manifest.cameraSha256,hash('offline-render/mobile-current-cameras.json'));
assert.equal(manifest.pipelineSha256,hash('render-mobile-detail.py'));
assert.equal(manifest.lightingPreset,'day-task');assert.deepEqual(manifest.renders.map(r=>r.id),ids);
for(const render of manifest.renders){const bytes=fs.readFileSync(root+'/offline-render/'+render.file);assert.equal(bytes.readUInt32BE(16),1920);assert.equal(bytes.readUInt32BE(20),render.id==='ensuite-basin'?1920:1080);assert.equal(render.projection.lensMm,24);}
async function menu(page,id){if(!await page.locator('#renderMore').evaluate(d=>d.open))await page.locator('#renderMore summary').click();await page.locator('#'+id).click();}
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage(),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bath2');await page.waitForFunction(()=>window.renderGalleryDebug&&window.walkDebug);
 for(const [width,height] of [[1440,1000],[390,844],[844,390]]){
  await page.setViewportSize({width,height});
  for(const id of ids){
   await page.evaluate(id=>renderGalleryDebug.openRecent(id),id);await page.waitForFunction(()=>renderGalleryDebug.state.loaded);
   const render=manifest.renders.find(r=>r.id===id),info=await page.locator('#renderImage').evaluate(i=>({width:i.naturalWidth,height:i.naturalHeight,ratio:i.clientWidth/i.clientHeight,source:i.src}));
   assert.equal(info.width,1920);assert.ok(Math.abs(info.ratio-render.width/render.height)<.015);assert.ok(info.source.includes(render.file));
   assert.equal(await page.evaluate(()=>renderGalleryDebug.state.source),manifest.sourceSha256);assert.match(await page.locator('#renderVersion').textContent(),/非实拍/);
   if(id==='ensuite-basin')await page.screenshot({path:root+`/wash-prep-gallery-${width}.png`});
   await page.locator('#renderZoomIn').click();assert.ok(await page.evaluate(()=>renderGalleryDebug.state.zoom)>1);await page.locator('#renderFit').click();
   await page.locator('#renderEnter').click();assert.equal(await page.evaluate(()=>roomViewsDebug.active),id);assert.deepEqual(await page.evaluate(()=>columnViewDebug.state.position),render.camera.position);
   await page.evaluate(id=>renderGalleryDebug.openRecent(id),id);await page.waitForFunction(()=>renderGalleryDebug.state.loaded);
   // Free walking intentionally clears the fixed-room-view selection.
   await page.locator('#renderWalk').click();assert.deepEqual(await page.evaluate(()=>walkDebug.state.position),render.camera.position);assert.equal(await page.evaluate(()=>walkDebug.state.active),true);await page.locator('#walkExit').click();
   checks.push({width,height,id,ratio:info.ratio,walkAtSamePosition:true});
  }
 }
 await page.evaluate(()=>renderGalleryDebug.openRecent());await page.waitForFunction(()=>renderGalleryDebug.state.loaded);
 await menu(page,'renderStudy');await page.waitForFunction(()=>renderGalleryDebug.state.loaded);assert.equal(await page.evaluate(()=>renderGalleryDebug.state.room),'master-storage');assert.match(await page.locator('#renderNote').textContent(),/尚未包含/);
 await menu(page,'renderRecent');await page.waitForFunction(()=>renderGalleryDebug.state.loaded);assert.equal(await page.evaluate(()=>renderGalleryDebug.state.room),'ensuite-basin');
 await page.route('**/wash-prep-hd-detail-renders.json',r=>r.fulfill({status:503,body:'unavailable'}));await menu(page,'renderRefresh');await page.waitForFunction(()=>document.querySelector('#renderStatus').textContent.includes('暂不可用'));assert.equal(await page.locator('#renderImage').getAttribute('src'),null);await page.unroute('**/wash-prep-hd-detail-renders.json');
 await menu(page,'renderRefresh');await page.waitForFunction(()=>renderGalleryDebug.state.loaded);
 await menu(page,'renderArchive');await page.waitForFunction(()=>renderGalleryDebug.state.loaded);assert.equal(await page.locator('#renderWalk').isVisible(),false);
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/mobile-preview.html?space=bath2&photo=ensuite-basin');
 const frame=await(await page.locator('iframe').elementHandle()).contentFrame();await frame.waitForFunction(()=>window.renderGalleryDebug?.state.loaded&&renderGalleryDebug.state.room==='ensuite-basin');
 assert.equal(await frame.locator('#renderImage').evaluate(i=>i.naturalHeight),1920);await frame.locator('#renderEnter').click();assert.equal(await frame.evaluate(()=>roomViewsDebug.active),'ensuite-basin');
 assert.deepEqual(errors,[]);const report={source:manifest.sourceSha256,pipeline:manifest.pipelineSha256,camera:manifest.cameraSha256,checks,legacyStudyPreserved:true,failedBatchClears:true,mobileDeepLink:true,errors,limits:'Three current local studies; browser viewport simulation, not whole-home photographic acceptance or physical phone testing.'};
 fs.writeFileSync(root+'/wash-prep-gallery-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
