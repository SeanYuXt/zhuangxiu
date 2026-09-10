const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const out='D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/footwall-ac-32-';
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
 const page=await browser.newPage({viewport:{width:1540,height:980}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-suite-plumbing-study.html?view=plan&v=footwall-ac-32');
 await Promise.race([page.waitForFunction(()=>window.masterPlumbing?.ready,null,{timeout:15000}),new Promise((_,reject)=>page.once('pageerror',reject))]);
 const r=await page.evaluate(()=>({spec:masterPlumbing.spec,main:masterPlumbing.audit,details:masterPlumbing.detailsAudit,equipment:masterPlumbing.equipmentAudit,projection:masterPlumbing.projectionAudit}));
 assert.equal(r.main.ok,true);assert.deepEqual(r.details.errors,[]);assert.equal(r.equipment.ok,true);assert.equal(r.projection.ok,true);
 assert.deepEqual(r.spec.furniture.bed.r,[2.75,.05,4.63,2.05]);assert.deepEqual(r.spec.furniture.bed.mattress,[1.8,1.9]);
 assert.deepEqual(r.spec.openings.find(q=>q.id==='entry').hinge,[1.7,4.7]);assert.deepEqual(r.spec.openings.find(q=>q.id==='bath-door').hinge,[1.95,2.05]);
 assert.equal(r.details.stowedRoute.ok,true);assert.equal(r.details.occupiedRoute.ok,false);
 assert.ok(Math.abs(r.details.fullWallWidth-3.55)<.001);assert.ok(Math.abs(r.details.closedWidth-1.85)<.001);
 assert.ok(Math.abs(r.details.footGap-.669)<.001);assert.ok(Math.abs(r.details.lowGap-.969)<.001);
 assert.equal(r.spec.furniture.footLow.height,.85);assert.ok(Math.abs(r.spec.furniture.footLow.r[3]-r.spec.furniture.footLow.r[1]-.35)<.001);
 assert.equal(r.spec.design.equipment.ac.wall,'foot-wall');assert.equal(r.spec.design.equipment.ac.status,'candidate');
 assert.ok(Math.abs(r.equipment.acToLowTop-1.25)<.001);assert.ok(r.equipment.screenSideGap>.16);
 assert.equal(r.spec.design.equipment.projector.lens[0],r.spec.design.projection.centerX);
 const suitcase=r.spec.design.footCabinet.suitcase.r,bays=r.spec.design.footCabinet.bays;
 assert.ok(suitcase[0]>=bays[0]&&suitcase[2]<=bays[1]);
 for(const [id,key]of [['foot-cabinet','footCabinet'],['low-cabinet','footLow']]){
  for(const mode of['0','1','inside','closed']){
   await page.locator('#'+id).selectOption(mode);
   const positions=await page.evaluate(({id,key,mode})=>{const s=masterPlumbing.spec,low=id==='low-cabinet',prefix=low?'low-sliding-leaf-':'sliding-foot-leaf-',ds=s.design[key].doors;return ds.map((leaf,i)=>{const m=masterPlumbing.scene.getObjectByName(prefix+i);return {dx:m.parent.position.x,visible:m.parent.visible,want:mode===String(i)?leaf.move:0};});},{id,key,mode});
   for(const p of positions){assert.equal(p.dx,p.want);assert.equal(p.visible,mode!=='inside');}
  }
 }
 for(const id of['door','bath-angle'])for(const value of['0','90'])await page.locator('#'+id).evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},value);
 await page.locator('#labels').uncheck();await page.locator('#opacity').fill('100');
 for(const view of['plan','footwall','ac','room']){await page.evaluate(v=>masterPlumbing.choose(v),view);await page.waitForTimeout(200);await page.screenshot({path:out+view+'.png'});}
 await page.evaluate(()=>masterPlumbing.choose('footwall'));await page.locator('#scene').screenshot({path:out+'cabinet-wall.png'});
 await page.locator('#equipment-service').check();await page.waitForTimeout(200);await page.screenshot({path:out+'service.png'});await page.locator('#equipment-service').uncheck();
 await page.locator('#screen-mode').selectOption('down');await page.waitForFunction(()=>masterPlumbing.projection.progress>.999);
 assert.equal(await page.locator('#foot-cabinet').isDisabled(),true);assert.equal(await page.evaluate(()=>masterPlumbing.scene.getObjectByName('wall-ac-candidate').visible),true);
 await page.locator('#scene').screenshot({path:out+'screen-down.png'});
 await page.locator('#screen-mode').selectOption('up');await page.waitForFunction(()=>masterPlumbing.projection.progress<.001);
 await page.locator('#light-scene').selectOption('evening');await page.waitForTimeout(200);await page.locator('#scene').screenshot({path:out+'night.png'});
 await page.locator('#light-scene').selectOption('day');await page.locator('#cloth-closed').check();await page.locator('#sheer-closed').check();assert.equal(await page.evaluate(()=>masterPlumbing.equipment.fabrics.cloth.mesh.userData.closed),true);
 await page.locator('#cloth-closed').uncheck();await page.locator('#sheer-closed').uncheck();
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>masterPlumbing.choose('plan'));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({ok:true,main:r.main,details:r.details,equipment:r.equipment,projection:r.projection,mobileOverflow:false,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
