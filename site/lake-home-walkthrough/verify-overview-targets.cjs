// Prevent room shortcuts from landing inside furniture after layout revisions.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html');
  await page.waitForFunction(()=>window.columnViewDebug?.state.ready);
  const targets=await page.evaluate(()=>{walkDebug.rebuild();return Object.entries(columnViewDebug.state.targets).map(([id,v])=>({id,position:v.position,blockedBy:walkDebug.reason(v.position[0],v.position[2])}));});
  const failures=targets.filter(t=>t.id!=='tvSeat'&&t.blockedBy);
  assert.deepEqual(failures,[],'Only the explicitly seated TV camera may lie in a furniture envelope');
  const interactions=[];
  for(const [width,height] of [[1440,1000],[390,844]]){
   await page.setViewportSize({width,height});
   for(const id of ['cabinet','care','bath1','bath2']){
    await page.selectOption('#roomSelect',id,{force:true});
    const before=await page.evaluate(()=>columnViewDebug.state.position);
    if(width===390)await page.locator('#mobileMenuToggle').click();
    await page.locator('header [data-mode="walk"]').click();
    const walking=await page.evaluate(()=>walkDebug.state);
    assert.ok(walking.active);assert.ok(Math.hypot(walking.position[0]-before[0],walking.position[2]-before[2])<1e-8,'No nearest-point teleport from a room shortcut');
    await page.locator('#walkExit').click();
    interactions.push({width,id,position:walking.position});
   }
  }
  assert.deepEqual(errors,[]);
  const report={targets,interactions,errors,limits:'230mm radius game proxy; seated TV view intentionally excluded. Does not certify human accessibility, framing, or construction.'};
  fs.writeFileSync(__dirname+'/overview-targets-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
