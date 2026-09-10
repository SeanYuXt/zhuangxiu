// Current/archived separation, honest pending/error states, zoom/pan and returning
// to each real room. Uses real rendered files; no fake images to satisfy checks.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
async function menuClick(page,id){if(!await page.locator('#renderMore').evaluate(d=>d.open))await page.locator('#renderMore summary').click();await page.locator('#'+id).click();}
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=whole-gallery&space=entry');await page.waitForFunction(()=>window.renderGalleryDebug);
 const targets=['entry','living','dining','bar','kitchen','bed1','bed3','master','bath1','bath2','laundry','care'],coverage=[],sizes=[];
 // This regression deliberately covers the retained historical batch, not the default.
 const open=()=>page.evaluate(()=>renderGalleryDebug.open(columnViewDebug.state.station,'legacy'));
 await open();await page.waitForFunction(()=>renderGalleryDebug.state.loaded);assert.equal(await page.locator('#renderRoom option').count(),12);
 for(let i=0;i<targets.length;i++){
  if(!await page.locator('#detailRender').evaluate(d=>d.open))await open();await page.locator('#renderRoom').selectOption(String(i));
  await page.waitForFunction(()=>renderGalleryDebug.state.loaded||!document.querySelector('#renderStatus').textContent.includes('正在载入'));
  const s=await page.evaluate(()=>({state:renderGalleryDebug.state,status:document.querySelector('#renderStatus').textContent,image:document.querySelector('#renderImage').hidden,src:document.querySelector('#renderImage').getAttribute('src')}));
  assert.equal(s.state.room,targets[i]);if(s.state.loaded){assert.ok(s.src.includes('full-daylight-v2-'));assert.equal(s.image,false);}else{assert.equal(s.image,true);assert.ok(s.status.includes('尚未生成'));assert.equal(s.src,null);}
  coverage.push({id:targets[i],loaded:s.state.loaded});await page.locator('#renderEnter').click();assert.equal(await page.evaluate(()=>columnViewDebug.state.station),targets[i]);
 }
 for(const [width,height] of [[1440,1000],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await open();await page.locator('#renderRoom').selectOption('0');await page.waitForFunction(()=>renderGalleryDebug.state.loaded);
  const box=await page.locator('#detailRender').boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1,JSON.stringify(box));
  assert.equal(await page.locator('#detailRender').evaluate(d=>d.scrollWidth>d.clientWidth),false);
  await page.locator('#renderZoomIn').click();await page.locator('#renderZoomIn').click();assert.ok(await page.evaluate(()=>renderGalleryDebug.state.zoom>2));
  const b=await page.locator('#renderStage').boundingBox();await page.mouse.move(b.x+b.width*.65,b.y+b.height*.5);await page.mouse.down();await page.mouse.move(b.x+b.width*.35,b.y+b.height*.4,{steps:6});await page.mouse.up();
  assert.ok(await page.locator('#renderStage').evaluate(s=>s.scrollLeft>0||s.scrollTop>0));
  await page.locator('#renderFit').click();assert.equal(await page.evaluate(()=>renderGalleryDebug.state.zoom),1);
  if(width===390){
   const cdp=await page.context().newCDPSession(page),cx=b.x+b.width/2,cy=b.y+b.height/2;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-25,y:cy,id:1},{x:cx+25,y:cy,id:2}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-65,y:cy,id:1},{x:cx+65,y:cy,id:2}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.ok(await page.evaluate(()=>renderGalleryDebug.state.zoom>2),'Two-touch spread did not zoom');await page.locator('#renderFit').click();await cdp.detach();
  }
  await page.screenshot({path:__dirname+`/render-gallery-${width}.png`});sizes.push([width,height]);
  await page.locator('#renderWalk').click();assert.equal(await page.evaluate(()=>columnViewDebug.state.mode),'walk');assert.ok(await page.evaluate(()=>walkDebug.state.active));
 }
 await open();await menuClick(page,'renderArchive');await page.waitForFunction(()=>renderGalleryDebug.state.loaded);assert.ok((await page.locator('#renderTitle').textContent()).includes('不是当前布局'));assert.equal(await page.locator('#renderWalk').isVisible(),false);
 await menuClick(page,'renderArchive');await page.waitForFunction(()=>renderGalleryDebug.state.loaded);assert.equal(await page.locator('#renderRoom option').count(),12);
 // Failed image fetch clears the previous photo, rather than showing a wrong room.
 await page.route('**/full-daylight-v2-entry-hd.png*',route=>route.abort());await menuClick(page,'renderRefresh');await page.waitForFunction(()=>document.querySelector('#renderStatus').textContent.includes('未能载入'));assert.equal(await page.locator('#renderImage').isVisible(),false);await page.unroute('**/full-daylight-v2-entry-hd.png*');
 await menuClick(page,'renderRefresh');await page.waitForFunction(()=>renderGalleryDebug.state.loaded);
 // Missing manifest must not silently fall back to the five archived shots.
 await page.route('**/full-daylight-v2-detail-renders.json',route=>route.fulfill({status:503,body:'temporarily unavailable'}));await menuClick(page,'renderRefresh');await page.waitForFunction(()=>document.querySelector('#renderStatus').textContent.includes('暂不可用'));assert.equal(await page.locator('#renderImage').isVisible(),false);assert.equal(await page.evaluate(()=>renderGalleryDebug.state.archive),false);
 await page.unroute('**/full-daylight-v2-detail-renders.json');await menuClick(page,'renderRefresh');await page.waitForFunction(()=>renderGalleryDebug.state.loaded);
 // New direct-look photos remain a separate snapshot and return to their exact angle.
 const angleManifest=JSON.parse(fs.readFileSync(__dirname+'/offline-render/room-angles-v1-detail-renders.json','utf8')),angleChecks=[];
 const cameraMeta=JSON.parse(fs.readFileSync(__dirname+'/offline-render/mobile-current-cameras.json','utf8'));
 const angleIds=cameraMeta.viewpoints.map(v=>v.id);
 for(const r of angleManifest.renders){
  const v=cameraMeta.viewpoints.find(v=>v.id===r.id);assert.ok(v);assert.deepEqual(r.camera.position,v.position);assert.deepEqual(r.camera.look,v.look);assert.equal(r.projection.lensMm,v.lensMm);assert.equal(r.projection.mode,'direct-look');assert.equal(r.projection.shiftY,0);
 }
 for(const [width,height] of [[1440,1000],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await open();await menuClick(page,'renderAngles');await page.waitForFunction(()=>renderGalleryDebug.state.angleMode&&renderGalleryDebug.state.loaded);
  assert.equal(await page.locator('#renderRoom option').count(),angleIds.length);
  for(const r of angleManifest.renders){
   await page.locator('#renderRoom').selectOption(String(angleIds.indexOf(r.id)));await page.waitForFunction(()=>renderGalleryDebug.state.loaded);
   assert.ok((await page.locator('#renderImage').getAttribute('src')).includes('/'+r.file+'?scene='));assert.equal(await page.evaluate(()=>renderGalleryDebug.state.source),angleManifest.sourceSha256);
   await page.locator('#renderEnter').click();assert.equal(await page.evaluate(()=>roomViewsDebug.active),r.id);
   assert.deepEqual(await page.evaluate(()=>columnViewDebug.state.position),r.camera.position);angleChecks.push({view:r.id,width});
   await open();await menuClick(page,'renderAngles');await page.waitForFunction(()=>renderGalleryDebug.state.angleMode&&renderGalleryDebug.state.loaded);
  }
  const box=await page.locator('#detailRender').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1);assert.equal(await page.locator('#detailRender').evaluate(d=>d.scrollWidth>d.clientWidth),false);
  await page.screenshot({path:__dirname+`/render-angles-${width}.png`});
 }
 // An unrendered angle clears the old photo; still returns to the actual 3D point.
 const pending=angleIds.find(id=>!angleManifest.renders.some(r=>r.id===id));
 if(pending){await page.locator('#renderRoom').selectOption(String(angleIds.indexOf(pending)));assert.equal(await page.locator('#renderImage').getAttribute('src'),null);assert.ok((await page.locator('#renderStatus').textContent()).includes('尚未生成'));}
 await page.route('**/room-angles-v1-detail-renders.json',route=>route.fulfill({status:503,body:'temporarily unavailable'}));await menuClick(page,'renderRefresh');await page.waitForFunction(()=>document.querySelector('#renderStatus').textContent.includes('暂不可用'));assert.equal(await page.locator('#renderImage').getAttribute('src'),null);
 await page.unroute('**/room-angles-v1-detail-renders.json');await menuClick(page,'renderRefresh');await page.waitForFunction(()=>!document.querySelector('#renderRefresh').disabled);
 await page.locator('#renderRoom').selectOption(String(angleIds.indexOf('child-study')));await page.waitForFunction(()=>renderGalleryDebug.state.loaded);const before=cameraMeta.viewpoints.find(v=>v.id==='child-study').position;await page.locator('#renderWalk').click();
 assert.ok(await page.evaluate(()=>walkDebug.state.active));const after=await page.evaluate(()=>walkDebug.state.position);assert.ok(Math.hypot(before[0]-after[0],before[2]-after[2])<1e-7);
 assert.deepEqual(errors,[]);const report={coverage,sizes,angleChecks,angleSource:angleManifest.sourceSha256,errors,limits:'Chrome viewport simulation; pending views are not finished or visually accepted.'};fs.writeFileSync(__dirname+'/render-gallery-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
