// Regression: bedroom windows reverting to floor-to-ceiling glass, wrong
// kitchen/bath elevations, or the user's balcony override silently disappearing.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const {windowProfiles}=await import('./window-profiles.js'),expected=windowProfiles.flatMap(p=>p.walls.map(w=>({name:`window-${p.room}-${w}`,sill:p.sill,height:p.height,userOverride:!!p.userOverride})));
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/index.html?v=window-audit');await page.waitForFunction(()=>window.homeDebug);await page.evaluate(()=>homeDebug.finishReady);
  const source=await page.evaluate(async expected=>{const T=await import('./vendor/three.module.js'),h=homeDebug;h.enter();h.scene.updateMatrixWorld(true);return expected.map(p=>{const o=h.scene.getObjectByName(p.name);if(!o)return {name:p.name,missing:true};const b=new T.Box3().setFromObject(o.getObjectByName(p.name+'-glass'));return {name:p.name,...o.userData,glassMinY:b.min.y,glassMaxY:b.max.y};});},expected);
  function check(rows){assert.equal(rows.length,11);for(const p of expected){const row=rows.find(r=>r.name===p.name);assert.ok(row&&!row.missing,p.name);assert.ok(Math.abs(row.glassMinY-p.sill)<1e-6,p.name+' sill');assert.ok(Math.abs(row.glassMaxY-p.sill-p.height)<1e-6,p.name+' top');assert.equal(row.userOverride,p.userOverride);}}
  check(source);
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=window-audit&space=bed3&focus=window');await page.waitForFunction(()=>window.columnViewDebug?.state.ready);const imported=await page.evaluate(()=>loadedWindowAudit);check(imported);
  const views=[];
  for(const room of ['bed3','bed1','master','kitchen','bath2']){
   await page.selectOption('#roomSelect',room);await page.locator('#facilities').evaluate(d=>d.open=true);await page.locator('#facilityList [data-facility^="window-"]').click();await page.locator('#facilities').evaluate(d=>d.open=false);
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:__dirname+`/window-${room}-corrected.png`});
   const visible=await page.evaluate(()=>columnViewDebug.state.selectedVisible);views.push({room,visible});assert.ok(visible,room+' window view obstructed');
  }
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/source-window-check.svg');await page.screenshot({path:__dirname+'/source-window-check.png'});
  assert.deepEqual(errors,[]);const result={source,imported,views,errors,scope:'7 组 / 11 段窗面竖向尺寸与模型/GLB一致；横向、窗台板、防坠、开启扇未验收'};
  fs.writeFileSync(__dirname+'/window-height-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify({faces:imported.length,views,errors,sourceY:true,importedY:true,balconyOverride:true},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
