const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
 const page=await browser.newPage({viewport:{width:1540,height:980}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-suite-plumbing-study.html?view=plan&v=footwall-ac-32');
 await Promise.race([page.waitForFunction(()=>window.masterPlumbing?.ready,null,{timeout:15000}),new Promise((_,reject)=>page.once('pageerror',reject))]);
 const r=await page.evaluate(()=>({audit:masterPlumbing.audit,details:masterPlumbing.detailsAudit,spec:masterPlumbing.spec}));
 assert.equal(r.audit.ok,true);assert.deepEqual(r.details.errors,[]);
 assert.deepEqual(r.details.bedMattress,[1.8,1.9]);assert.ok(Math.abs(r.details.bedFrame[1]-2)<.001);
 assert.ok(Math.abs(r.details.footDepth-.65)<.001);assert.ok(Math.abs(r.details.footGap-.669)<.001);assert.ok(Math.abs(r.details.footInteriorDepth-.552)<.001);
 assert.ok(Math.abs(r.details.fullWallWidth-3.55)<.001);assert.ok(Math.abs(r.details.closedWidth-1.85)<.001);assert.ok(Math.abs(r.details.cornerSpan-.5)<.001);assert.equal(r.details.cornerClipped,true);assert.deepEqual(r.spec.design.entryCorner.polygon,r.spec.furniture.entryCorner.polygon);
 assert.equal(r.details.stowedRoute.ok,true);assert.equal(r.details.occupiedRoute.ok,false);assert.equal(r.details.stowedRoute.width,.6);
 assert.ok(r.spec.furniture.vanity.r[2]<1);assert.equal(r.spec.furniture.footCabinet.r[2],4.15);
 assert.equal(await page.evaluate(()=>!!masterPlumbing.scene.getObjectByName('curved-entry-corner')),true);
 assert.equal(await page.evaluate(()=>!!masterPlumbing.scene.getObjectByName('side-rounded-coat-opening')||!!masterPlumbing.scene.getObjectByName('side-jacket-within-envelope')),false);
 assert.equal(await page.locator('polygon[data-fixture="entryCorner"]').count(),1);
 await page.locator('#labels').uncheck();

 const equipment=await page.evaluate(()=>masterPlumbing.equipmentAudit);
 assert.equal(equipment.ok,true);assert.deepEqual(equipment.errors,[]);
 assert.ok(equipment.routeMargin>.03);assert.ok(equipment.bookcaseEndGap>.08);assert.ok(Math.abs(equipment.acTopGap-.20)<.001);
 assert.ok(Math.abs(equipment.lensDistance-2.02)<.001);
 for(const id of['wall-ac-candidate','suspended-projector-candidate','cloth-curtain-motor','sheer-curtain-motor','cloth-motor-track','sheer-motor-track'])assert.equal(await page.evaluate(id=>!!masterPlumbing.scene.getObjectByName(id),id),true);
 assert.equal(await page.locator('[data-equipment-plan]').count(),1);
 await page.evaluate(()=>masterPlumbing.choose('equipment'));
 for(const cloth of[false,true])for(const sheer of[false,true]){
  await page.locator('#cloth-closed').setChecked(cloth);await page.locator('#sheer-closed').setChecked(sheer);
  assert.deepEqual(await page.evaluate(()=>({cloth:masterPlumbing.equipment.fabrics.cloth.mesh.userData.closed,sheer:masterPlumbing.equipment.fabrics.sheer.mesh.userData.closed})),{cloth,sheer});
 }
 await page.locator('#cloth-closed').uncheck();await page.locator('#sheer-closed').uncheck();
 await page.waitForTimeout(300);
 await page.screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/footwall-ac-32-curtains-open.png'});
 await page.locator('#equipment-service').check();await page.waitForTimeout(250);
 assert.equal(await page.evaluate(()=>masterPlumbing.scene.getObjectByName('cloth-box-removable-fascia').visible),false);
 await page.screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/footwall-ac-32-service.png'});
 await page.locator('#equipment-service').uncheck();await page.locator('#cloth-closed').check();await page.locator('#sheer-closed').check();await page.waitForTimeout(250);
 await page.screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/footwall-ac-32-curtains-closed.png'});
 await page.locator('#cloth-closed').uncheck();await page.locator('#sheer-closed').uncheck();
 await page.evaluate(()=>masterPlumbing.choose('ac'));await page.waitForTimeout(250);
 await page.screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/footwall-ac-32-ac.png'});
 await page.evaluate(()=>masterPlumbing.choose('plan'));

 const p=await page.evaluate(()=>masterPlumbing.projectionAudit);
 assert.equal(p.ok,true);assert.deepEqual(p.errors,[]);assert.ok(Math.abs(p.imageDiagonal-80)<.05);
 assert.ok(p.cabinetSetback>.10);assert.ok(Math.abs(p.upperBodyGap-.535)<.001);
 await page.evaluate(()=>masterPlumbing.choose('footwall'));
 await page.locator('#screen-mode').selectOption('down');
 await page.waitForFunction(()=>masterPlumbing.projection.progress>.999,null,{timeout:15000});
 assert.equal(await page.locator('#foot-cabinet').isDisabled(),true);
 assert.equal(await page.evaluate(()=>masterPlumbing.scene.getObjectByName('cabinet-wash-light').visible),false);
 assert.equal(await page.evaluate(()=>masterPlumbing.scene.getObjectByName('screen-image-preview').visible),true);
 await page.screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/footwall-ac-32-screen-down.png'});
 await page.evaluate(()=>masterPlumbing.choose('plan'));
 assert.ok((await page.locator('#route-status').innerText()).includes('先收幕'));
 await page.screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/footwall-ac-32-screen-plan.png'});
 await page.locator('#screen-mode').selectOption('up');
 await page.waitForFunction(()=>masterPlumbing.projection.progress<.001,null,{timeout:15000});
 assert.equal(await page.locator('#foot-cabinet').isDisabled(),false);
 assert.equal(await page.evaluate(()=>masterPlumbing.scene.getObjectByName('screen-image-preview').visible),false);
 assert.equal(await page.evaluate(()=>masterPlumbing.scene.getObjectByName('cabinet-wash-light').visible),true);
 await page.evaluate(()=>masterPlumbing.choose('footwall'));
 await page.screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/footwall-ac-32-screen-up.png'});

 assert.equal(r.spec.design.styling.head.capHeight,1.24);assert.equal(r.spec.design.bedHead.height,.68);assert.ok(r.spec.design.styling.head.r[2]<=4.95);assert.ok(r.spec.design.styling.head.capDepth<r.spec.furniture.bed.r[1]);
 for(const view of['bed','plan','footwall','arch','suite','room','vanity','storagePlan','bath','reading','drywall','whole','top','ceiling']){
 await page.evaluate(v=>masterPlumbing.choose(v),view);await page.waitForTimeout(250);
 if(['bed','plan','footwall','arch','suite','vanity','storagePlan','bath','drywall'].includes(view))await page.screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/footwall-ac-32-'+view+'.png'});
 }
 assert.deepEqual(r.spec.design.entryCorner.shelfHeights,[.8,1.4]);
 assert.equal(r.spec.design.styling.skinCabinet.radius,.06);
 assert.ok(Math.abs(await page.evaluate(()=>{const side=masterPlumbing.scene.getObjectByName('corner-display-side');side.geometry.computeBoundingBox();return side.position.y+side.geometry.boundingBox.max.y;})-r.spec.design.entryCorner.openTop)<.001);
 assert.equal(await page.evaluate(()=>!!masterPlumbing.scene.getObjectByName('makeup-daily-shelf')),false);
 assert.equal(await page.evaluate(()=>!!masterPlumbing.scene.getObjectByName('unified-vanity-recess')),true);
 await page.locator('#light-scene').selectOption('evening');
 assert.equal(await page.evaluate(()=>masterPlumbing.scene.getObjectByName('room-lighting').visible),true);
 for(const view of['bed','arch','vanity','room']){await page.evaluate(v=>masterPlumbing.choose(v),view);await page.waitForTimeout(250);await page.screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/footwall-ac-32-night-'+view+'.png'});}
 await page.locator('#light-scene').selectOption('day');
 assert.equal(await page.evaluate(()=>masterPlumbing.scene.getObjectByName('room-lighting').visible),false);
 for(const mode of['0','1','inside','closed'])await page.locator('#foot-cabinet').selectOption(mode);
 for(const mode of['0','1','inside','closed'])await page.locator('#cabinet').selectOption(mode);
 await page.evaluate(()=>masterPlumbing.choose('vanity'));await page.locator('#chair-pull').check();await page.locator('#drawer-open').check();await page.locator('#care-open').check();await page.waitForTimeout(250);await page.screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/footwall-ac-32-vanity-use.png'});
 for(const id of['door','bath-angle'])for(const v of['0','90'])await page.locator('#'+id).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},v);
 await page.locator('#routes').check();await page.locator('#labels').check();await page.locator('#points').uncheck();await page.locator('#ceiling-show').check();await page.locator('#opacity').evaluate(e=>{e.value=50;e.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>masterPlumbing.choose('plan'));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/footwall-ac-32-mobile.png'});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({ok:true,audit:r.audit,details:r.details,mobileOverflow:false,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
