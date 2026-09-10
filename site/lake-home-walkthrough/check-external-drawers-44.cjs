const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
 try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-suite-plumbing-study.html?view=footwall&v=external-drawers-44');
 await page.waitForFunction(()=>window.masterPlumbing?.ready,null,{timeout:15000});
 const a=await page.evaluate(()=>({s:masterPlumbing.spec,main:masterPlumbing.audit,d:masterPlumbing.detailsAudit,e:masterPlumbing.equipmentAudit}));
 for(const v of[a.main,a.d,a.e])assert.deepEqual(v.errors,[]);
 assert.ok(a.s.design.footCabinet.drawers.every(d=>d.external&&d.base>=.65&&d.base+d.height<=1.37));
 const w=a.d.wardrobeAudit;assert.equal(w.lowerLeaves,8);assert.equal(w.upperLeaves,6);assert.equal(w.drawerCount,3);
 assert.equal(a.s.design.footCabinet.operation,'hinged');assert.ok(Math.abs(w.interiorDepth-.557)<.00001);
 assert.ok(Math.abs(w.openLeafToBed-.323)<.00001);assert.ok(w.screenTopDoorGap>.03);
 assert.equal(await page.evaluate(()=>!!masterPlumbing.scene.getObjectByName('sliding-foot-leaf-0')),false);
 await page.locator('#labels').uncheck();await page.locator('#points').uncheck();await page.locator('#opacity').fill('100');
 const shot=async name=>{await page.waitForTimeout(250);await page.locator('#scene').screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/external-drawers-44-'+name+'.png'});};
 await shot('closed');
 for(const mode of ['storage','long','short','quilt','drawer0','drawer1','drawer','all','inside','closed']){
  await page.locator('#foot-cabinet').selectOption(mode);
  const state=await page.evaluate(()=>({rotation:masterPlumbing.scene.getObjectByName('hinged-storage-0').rotation.y,drawerZ:masterPlumbing.scene.getObjectByName('drawer-2').position.z}));
  if(mode==='drawer'){assert.equal(state.rotation,0);assert.equal(state.drawerZ,-.4);assert.ok((await page.locator('#route-status').textContent()).includes('占道'));}
  if(mode.startsWith('drawer')){const i=mode==='drawer'?2:Number(mode.slice(-1));assert.equal(await page.evaluate(i=>masterPlumbing.scene.getObjectByName('drawer-'+i).position.z,i),-.4);assert.equal(state.rotation,0);}
  if(mode==='closed'){assert.equal(state.rotation,0);assert.equal(state.drawerZ,0);}
  if(['inside','drawer','all'].includes(mode))await shot(mode);
 }
 await page.locator('#foot-cabinet').selectOption('long');await page.locator('#screen-mode').selectOption('down');
 assert.equal(await page.locator('#foot-cabinet').inputValue(),'closed');assert.equal(await page.locator('#foot-cabinet').isDisabled(),true);
 await page.locator('#screen-mode').selectOption('up');
 await page.evaluate(()=>masterPlumbing.choose('footElevation'));await page.locator('#plan').screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/external-drawers-44-elevation.png'});
 assert.ok((await page.locator('#plan').textContent()).includes('上短衣区'));
 await page.evaluate(()=>masterPlumbing.choose('plan'));await page.locator('#foot-cabinet').selectOption('drawer');
 await page.locator('#plan').screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/external-drawers-44-plan-open.png'});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({ok:true,wardrobe:w,route:a.d.stowedRoute,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
