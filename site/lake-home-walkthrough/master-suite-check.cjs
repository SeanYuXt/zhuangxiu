// Bounded local QA: both layouts, door/chair controls, mobile overflow, render errors.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const out=path.resolve(__dirname,'master-suite-review-solid-head');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl','--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1560,height:1040},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const records=[];
 for(const scheme of ['calm']){
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-suite-study.html?scheme='+scheme,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.masterSuite?.ready,{timeout:20000});assert.equal(await page.locator('#loading').isVisible(),false);
  const audit=await page.evaluate(()=>window.masterSuite.audit);assert.equal(audit.ok,true);assert.equal(await page.evaluate(()=>window.masterSuite.spec.scheme),'calm');records.push({scheme,audit});
  await page.screenshot({path:path.join(out,scheme+'-overview.png')});
  assert.equal(await page.evaluate(()=>window.masterSuite.spec.furniture.wardrobe.r[1]),3.02);
  assert.equal(await page.evaluate(()=>window.masterSuite.spec.design.suite.bath.fixtures.basin),undefined);
  assert.ok(Math.abs(audit.clearances.washOccupied-.958)<.001);
  assert.ok(Math.abs(audit.clearances.foot-.80)<.001);
  assert.ok(Math.abs(audit.clearances.linenChair-.18)<.001);
  assert.ok(Math.abs(audit.clearances.threshold-1.15)<.001);
  assert.ok(Math.abs(audit.clearances.routeWidth-.70)<.001);
  for(const view of ['threshold','elevation','linen','plan','top','entry','bed','vanity','window','wardrobe','wash','bath','ceiling']){
   await page.locator('[data-view="'+view+'"]').first().click();await page.waitForTimeout(750);
   if(view==='elevation'){assert.equal(await page.locator('#elevation').isVisible(),true);assert.equal(await page.locator('#scene').isVisible(),false);assert.match(await page.locator('#elevation').textContent(),/90°墙角/);}
   if(['threshold','elevation','linen','plan','entry','bed','vanity','wardrobe','wash','bath','ceiling'].includes(view)){await page.screenshot({path:path.join(out,scheme+'-'+view+'.png')});await page.locator('#viewer').screenshot({path:path.join(out,view+'-preview.png')});}
  }
  // Actual sliding leaves stay within the cabinet footprint, not hinged into the aisle.
  await page.locator('[data-view="linen"]').click();
  for(const side of ['left','right']){await page.locator('#linen-door').selectOption(side);const state=await page.evaluate(()=>window.masterSuite.linenState);assert.equal(state.mode,side);assert.ok(Math.abs(state.offsets[side==='left'?0:1])>.60);}
  await page.waitForTimeout(750);await page.locator('#viewer').screenshot({path:path.join(out,'linen-open-preview.png')});await page.locator('#linen-door').selectOption('closed');
  // Prevent regression: open drawers must move the chair; sitting closes them.
  await page.locator('#storage-open').check();assert.equal(await page.locator('#chair').inputValue(),'pull');await page.locator('#mirror-open').check();await page.locator('[data-view="vanity"]').click();await page.waitForTimeout(750);await page.screenshot({path:path.join(out,'vanity-open-storage.png')});await page.locator('#chair').selectOption('normal');assert.equal(await page.locator('#storage-open').isChecked(),false);await page.locator('#mirror-open').uncheck();
  await page.locator('#chair').selectOption('pull');await page.locator('#technical').check();await page.locator('#lighting').selectOption('night');await page.locator('[data-view="vanity"]').click();await page.waitForTimeout(750);await page.screenshot({path:path.join(out,scheme+'-technical.png')});
  await page.locator('#angle').fill('0');await page.locator('#opacity').fill('20');await page.locator('#labels').uncheck();await page.locator('[data-view="plan"]').click();await page.locator('#plan').waitFor({state:'visible'});await page.locator('#angle').fill('90');
 }
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-suite-study.html?scheme=lake',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.masterSuite?.ready);assert.equal(await page.evaluate(()=>window.masterSuite.spec.scheme),'calm');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:path.join(out,'mobile.png')});
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify({records,errors,mobileOverflow:false,checked:'solid headwall / obsolete lake URL maps to calm / 8 views / chair / doors / cabinet / lighting / labels / opacity'},null,2));console.log(JSON.stringify({ok:true,out,errors}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
