// Keep current and historical batches separate, including partial/error states.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ids=['entry','living','dining','bar','kitchen','bed1','bed3','master','bath1','bath2','laundry','care'];
const read=p=>JSON.parse(fs.readFileSync(__dirname+'/'+p,'utf8'));
const manifest=read('offline-render/whole-current-hd-v1-detail-renders.json');
const old=read('offline-render/full-daylight-v2-detail-renders.json');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(__dirname+'/'+p)).digest('hex');
assert.equal(manifest.sourceSha256,hash('offline-render/mobile-current.glb'));
assert.equal(manifest.cameraSha256,hash('offline-render/mobile-current-cameras.json'));
assert.equal(manifest.pipelineSha256,hash('render-mobile-detail.py'));
assert.equal(new Set(manifest.renders.map(r=>r.id)).size,manifest.renders.length);
assert.ok(manifest.renders.every(r=>ids.includes(r.id)&&r.width===1920&&r.samples===32));
if(process.argv.includes('--complete'))assert.deepEqual([...manifest.renders.map(r=>r.id)].sort(),[...ids].sort());
async function menu(page,id){if(!await page.locator('#renderMore').evaluate(d=>d.open))await page.locator('#renderMore summary').click();await page.locator('#'+id).click();}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage(),errors=[],checked=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=entry');
  await page.waitForFunction(()=>window.columnViewDebug?.state.ready);
  await page.evaluate(()=>renderGalleryDebug.open());
  await page.waitForFunction(()=>renderGalleryDebug.state.loaded);
  assert.equal(await page.evaluate(()=>renderGalleryDebug.state.fullBatch),'latest','Default photo entry must show the current batch');
  await page.locator('#detailRender form button').click();
  for(const [width,height] of [[1440,1000],[390,844],[844,390]]){
   await page.setViewportSize({width,height});
   await page.evaluate(()=>renderGalleryDebug.openLatest('entry'));
   assert.equal(await page.locator('#renderRoom option').count(),12);
   for(const r of manifest.renders){
    await page.selectOption('#renderRoom',String(ids.indexOf(r.id)));
    await page.waitForFunction(id=>renderGalleryDebug.state.room===id&&renderGalleryDebug.state.loaded,r.id);
    const image=await page.locator('#renderImage').evaluate(e=>{const b=e.getBoundingClientRect();return {w:e.naturalWidth,h:e.naturalHeight,ratio:b.width/b.height,src:e.src};});
    assert.equal(image.w,r.width);assert.equal(image.h,r.height);assert.ok(Math.abs(image.ratio-r.width/r.height)<.0001);assert.ok(image.src.includes('/'+r.file+'?scene='));
    assert.equal(await page.evaluate(()=>renderGalleryDebug.state.source),manifest.sourceSha256);
    await page.locator('#renderEnter').click();
    assert.equal(await page.evaluate(()=>columnViewDebug.state.station),r.id);
    assert.deepEqual(await page.evaluate(()=>columnViewDebug.state.position),r.camera.position);
    checked.push({id:r.id,width});
    await page.evaluate(()=>renderGalleryDebug.openLatest('entry'));
   }
   const pending=await page.locator('#renderRoom option').evaluateAll(options=>options.find(o=>o.textContent.includes('待生成'))?.value??null);
   if(pending!==null){await page.selectOption('#renderRoom',pending);assert.equal(await page.locator('#renderImage').getAttribute('src'),null);assert.ok((await page.locator('#renderStatus').textContent()).includes('尚未生成'));}
   await page.selectOption('#renderRoom','0');await page.waitForFunction(()=>renderGalleryDebug.state.loaded);
   await page.locator('#renderZoomIn').click();assert.ok(await page.evaluate(()=>renderGalleryDebug.state.zoom>1));await page.locator('#renderFit').click();
   assert.equal(await page.locator('#detailRender').evaluate(e=>e.scrollWidth>e.clientWidth),false);
   await page.screenshot({path:__dirname+`/latest-gallery-${width}.png`});
   await page.locator('#renderWalk').click();assert.ok(await page.evaluate(()=>walkDebug.state.active));await page.locator('#walkExit').click();
  }
  await page.evaluate(()=>renderGalleryDebug.openLatest('entry'));
  await page.route('**/whole-current-hd-v1-detail-renders.json',r=>r.fulfill({status:503,body:'unavailable'}));
  await menu(page,'renderRefresh');await page.waitForFunction(()=>document.querySelector('#renderStatus').textContent.includes('暂不可用'));
  assert.equal(await page.locator('#renderImage').getAttribute('src'),null);
  await menu(page,'renderOldFull');await page.waitForFunction(()=>renderGalleryDebug.state.loaded);
  assert.equal(await page.evaluate(()=>renderGalleryDebug.state.source),old.sourceSha256);assert.equal(await page.evaluate(()=>renderGalleryDebug.state.fullBatch),'legacy');
  await menu(page,'renderLatest');await page.waitForFunction(()=>document.querySelector('#renderStatus').textContent.includes('暂不可用'));
  assert.equal(await page.locator('#renderImage').getAttribute('src'),null);
  await page.unroute('**/whole-current-hd-v1-detail-renders.json');await menu(page,'renderRefresh');await page.waitForFunction(()=>renderGalleryDebug.state.loaded);
  assert.equal(await page.evaluate(()=>renderGalleryDebug.state.source),manifest.sourceSha256);
  assert.deepEqual(errors,[]);
  const report={source:manifest.sourceSha256,renderedAtTestStart:manifest.renders.length,complete:manifest.renders.length===12,checked,errors,limits:'Rendering/gallery/version checks only; viewport simulation, not physical phone or whole-home visual acceptance.'};
  fs.writeFileSync(__dirname+'/latest-gallery-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
