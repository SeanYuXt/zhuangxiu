const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const out='D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/window-ac-vanity-33-';
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-suite-plumbing-study.html?view=ac&v=window-ac-vanity-33');
  await Promise.race([page.waitForFunction(()=>window.masterPlumbing?.ready,null,{timeout:15000}),new Promise((_,reject)=>page.once('pageerror',reject))]);
  const a=await page.evaluate(()=>({main:masterPlumbing.audit,details:masterPlumbing.detailsAudit,equipment:masterPlumbing.equipmentAudit,s:masterPlumbing.spec}));
  assert.deepEqual(a.main.errors,[]);assert.deepEqual(a.details.errors,[]);assert.deepEqual(a.equipment.errors,[]);
  assert.equal(a.s.design.equipment.ac.wall,'vanity-wall');
  assert.deepEqual(a.s.design.equipment.ac.r,[5.10,2.38,5.35,3.23]);
  assert.deepEqual(a.s.furniture.bed.r,[2.75,.05,4.63,2.05]);
  assert.equal(a.s.furniture.footLow,undefined);
  assert.ok(Math.abs(a.details.wardrobeLength-2.5)<.001);
  assert.ok(Math.abs(a.details.lowGap-.869)<.001);
  assert.equal(a.details.stowedRoute.ok,true);assert.equal(a.details.occupiedRoute.ok,false);
  assert.equal(await page.evaluate(()=>!!masterPlumbing.scene.getObjectByName('soft-ceiling-cove')),false);
  const face=await page.evaluate(()=>{const a=masterPlumbing.scene.getObjectByName('ac-outlet');return a.position.toArray()});
  assert.ok(face[0]<5.10);assert.ok(face[2]>2.38&&face[2]<3.23);
  for(const mode of ['0','1','2','inside','closed']){
   await page.locator('#cabinet').selectOption(mode);
   const leaves=await page.evaluate(mode=>masterPlumbing.spec.design.entryStorage.doors.map((d,i)=>{const m=masterPlumbing.scene.getObjectByName('entry-sliding-door-'+i);return{offset:m.parent.position.z,expected:mode===String(i)?d.move:0,visible:m.parent.visible}}),mode);
   for(const l of leaves){assert.equal(l.offset,l.expected);assert.equal(l.visible,mode!=='inside');}
  }
  await page.locator('#chair-pull').check();await page.locator('#drawer-open').check();await page.locator('#care-open').check();
  const moved=await page.evaluate(()=>({drawer:masterPlumbing.scene.getObjectByName('window-makeup-drawer').parent.position.z,mirror:masterPlumbing.scene.getObjectByName('window-sliding-makeup-mirror').parent.position.x}));
  assert.equal(moved.drawer,-.3);assert.equal(moved.mirror,.33);
  await page.locator('#chair-pull').uncheck();await page.locator('#drawer-open').uncheck();await page.locator('#care-open').uncheck();
  await page.locator('#labels').uncheck();await page.locator('#points').uncheck();await page.locator('#opacity').fill('100');
  for(const view of ['ac','footwall','vanity','drywall','storagePlan','plan']){
   await page.evaluate(v=>masterPlumbing.choose(v),view);await page.waitForTimeout(250);
   await page.screenshot({path:out+view+'.png'});
   if(['ac','footwall','vanity'].includes(view))await page.locator('#scene').screenshot({path:out+view+'-model.png'});
  }
  await page.evaluate(()=>masterPlumbing.choose('ac'));await page.locator('#equipment-service').check();
  await page.screenshot({path:out+'service.png'});await page.locator('#equipment-service').uncheck();
  await page.locator('#screen-mode').selectOption('down');await page.waitForFunction(()=>masterPlumbing.projection.progress>.999);
  assert.equal(await page.locator('#foot-cabinet').isDisabled(),true);
  await page.locator('#scene').screenshot({path:out+'screen-down.png'});
  await page.locator('#screen-mode').selectOption('up');
  await page.locator('#cloth-closed').check();await page.locator('#sheer-closed').check();
  assert.equal(await page.evaluate(()=>masterPlumbing.equipment.fabrics.cloth.mesh.userData.closed),true);
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>masterPlumbing.choose('plan'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({ok:true,details:a.details,equipment:a.equipment,errors,mobileOverflow:false}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
