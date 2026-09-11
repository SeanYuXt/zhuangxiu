const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 const page=await b.newPage({viewport:{width:1660,height:1050},deviceScaleFactor:1});let errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8774/lake-home-walkthrough/entry-whole-wall-review.html?focus=ensemble&v=entry-daily-28');
 await page.waitForFunction(()=>window.wholeWallReview?.snapshot,{timeout:90000});
 await page.waitForTimeout(2000);
 await page.screenshot({path:'whole-wall-28-ensemble.png'});
 const f=page.frames().find(f=>f.url().includes('column-view.html'));
 const out=await f.evaluate(async()=>{
  const {verifyFridgeLayout}=await import('./verify-fridge-layout.js');
  const w=wholeWall;const fixed=w.snapshot();
  const fridge=verifyFridgeLayout(columnViewDebug.dryStudy.model,fridgeDetailsDebug);
  return {fridge,snapshot:fixed};
 });
 const helpers=fs.readFileSync('verify-fridge-layout.js','utf8').split('const visible=')[1].split('export function verifyFridgeLayout')[0];
 out.furnitureMotion=await f.evaluate(`(async()=>{
 const T=await import('./vendor/three.module.js');const visible=${helpers}
 const w=wholeWall,model=columnViewDebug.dryStudy.model;w.entry.setOpen(false);w.setStorage(false);fridgeDetailsDebug.reset();model.updateMatrixWorld(true);
 const moving=[...w.shoeDoors,...w.entryDrawers,...w.dropDrawers,...w.drawers,...w.moving];
 const closedShapes=meshes(model).map(o=>({o,s:shape(o)})).filter(v=>v.s.high>.10&&v.s.low<2.45&&Math.max(...v.s.poly.map(p=>p[0]))>3.7&&Math.min(...v.s.poly.map(p=>p[0]))<11.4&&Math.max(...v.s.poly.map(p=>p[1]))>5.45&&Math.min(...v.s.poly.map(p=>p[1]))<7.19);
 const hits=[];
 for(const g of moving){
  const isDoor=w.shoeDoors.includes(g)||w.moving.includes(g),origin=g.position.z,obstacles=closedShapes.filter(v=>!under(v.o,g));
  for(const fraction of[0,.25,.5,.75,1]){
   if(isDoor)g.rotation.y=fraction*Math.PI/2;else g.position.z=origin-.3*fraction;
   model.updateMatrixWorld(true);
   for(const o of meshes(g)){const a=shape(o);for(const v of obstacles){if(overlap(a,v.s)&&!hits.some(h=>h.group===g.name&&h.part===o.name&&h.obstacle===v.o.name))hits.push({group:g.name,part:o.name,obstacle:v.o.name,fraction});}}
  }
  g.rotation.y=0;g.position.z=origin;model.updateMatrixWorld(true);
 }
 return {sampledGroups:moving.map(g=>g.name),fractions:[0,.25,.5,.75,1],hits,fixedUnchanged:JSON.stringify(w.snapshot().fixedBefore)===JSON.stringify(w.snapshot().fixedAfter),fridgeInstallVerified:false};
 })()`);
 out.errors=errors;
 await page.locator('[data-mode="door"]').first().click();await page.screenshot({path:'whole-wall-28-door-sides.png'});
 await page.locator('[data-view="drop"]').click();await page.waitForTimeout(1200);await page.locator('#model').screenshot({path:'whole-wall-28-home.png'});
 await page.locator('#coat').click();await page.waitForTimeout(1200);await page.locator('#model').screenshot({path:'whole-wall-28-coat-open.png'});
 await page.locator('#leave').click();out.leave=await f.evaluate(()=>wholeWall.dropDrawers.map(d=>({name:d.name,z:d.position.z})));await page.waitForTimeout(1200);await page.locator('#model').screenshot({path:'whole-wall-28-leaving.png'});
 await page.locator('#arrive').click();await page.locator('#six').click();out.six=await page.evaluate(()=>({clear:document.getElementById('sixClear').textContent,audit:wholeWallReview.audit}));
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);out.mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);out.errors=errors;
 fs.writeFileSync('whole-wall-28-verification.json',JSON.stringify(out,null,2));
 console.log(JSON.stringify({errors:out.errors,mobileOverflow:out.mobileOverflow,motion:out.furnitureMotion,fridgeHits:{closed:out.fridge.closedExternalHits,doors:out.fridge.doorSweep,upper:out.fridge.upperSweep},dimensions:{counter:out.snapshot.counter,drop:out.snapshot.entryPrep},six:out.six?.clear}));await b.close();
})().catch(e=>{console.error(e);process.exitCode=1});
