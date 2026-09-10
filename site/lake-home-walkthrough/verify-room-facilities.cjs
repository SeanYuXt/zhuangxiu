const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=room-facilities');await page.waitForFunction(()=>window.columnViewDebug?.state.ready,{timeout:60000});
 const objects=await page.evaluate(()=>columnViewDebug.state.facilityObjects);assert.deepEqual(objects.filter(o=>!o.exists),[]);
 const checks=[];
 for(const id of ['kitchen','bath1','bath2','bed1','master','bed3','living','entry','dining','bar','laundry']){
  await page.selectOption('#roomSelect',id);await page.locator('header [data-mode="layout"]').click();await page.waitForFunction(()=>columnViewDebug.state.mode==='layout'&&columnViewDebug.state.clipPlanes===5);await page.screenshot({path:path.join(__dirname,`facilities-${id}-layout.png`)});
  const names=await page.locator('[data-facility]').evaluateAll(bs=>bs.map(b=>b.dataset.facility));
  for(const name of names){await page.locator(`[data-facility="${name}"]`).click();await page.waitForFunction(name=>columnViewDebug.state.selectedFacility===name,name);const s=await page.evaluate(()=>columnViewDebug.state);assert.equal(s.clipPlanes,0);assert.equal(s.roofVisible,true);assert.ok(await page.locator('#facilityNote').isVisible());checks.push(name);
   if(['kitchen-sink','kitchen-hood','bath1-shower','bath1-vanity','bath2-heater','bed1-air-conditioner','master-air-conditioner','bed3-air-conditioner','return-grille'].includes(name))await page.screenshot({path:path.join(__dirname,`facilities-${name}.png`)});
  }
 }
 await page.setViewportSize({width:390,height:844});await page.selectOption('#roomSelect','kitchen');await page.locator('[data-facility="kitchen-sink"]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(__dirname,'facilities-mobile.png')});
 await page.click('#fullscreen');await page.waitForFunction(()=>document.fullscreenElement);await page.locator('[data-facility="kitchen-hood"]').click();await page.waitForFunction(()=>columnViewDebug.state.selectedFacility==='kitchen-hood');await page.click('#exitFull');
 assert.deepEqual(errors,[]);console.log(JSON.stringify({objects:objects.length,rooms:11,facilityClicks:checks.length,missing:[],layoutAndRestore:true,mobile:true,fullscreen:true,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
