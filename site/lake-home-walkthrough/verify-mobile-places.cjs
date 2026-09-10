// Regression: direct bedroom/bathroom selection, detail sheets, and pillar-gap views.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=places-2&space=balconyGap');await page.waitForFunction(()=>columnViewDebug?.state.ready);
 for(const [room,object] of [['master','master-air-conditioner'],['bed1','bed1-bed'],['bed3','bed3-desk'],['bath1','bath1-squat-pan'],['bath2','bath2-vanity']]){
  await page.locator(`[data-quick-room="${room}"]`).click();assert.equal(await page.evaluate(()=>columnViewDebug.state.station),room);
  await page.locator('#placeDetails').click();await page.locator(`[data-detail-object="${object}"]`).click();
  const state=await page.evaluate(()=>({station:columnViewDebug.state.station,object:columnViewDebug.state.selectedFacility,visible:columnViewDebug.state.selectedVisible}));
  assert.equal(state.object,object);checks.push(state);assert.ok(state.visible,object+' is occluded');
 }
 const spaces=['entry','living','tvSeat','dining','cabinet','fridge','kitchen','bar','balconyGap','columnFront','glassLeft','glassRight','laundry','care','drying'];
 for(const id of spaces){await page.locator('#allPlaces').click();await page.locator(`[data-place="${id}"]`).click();assert.equal(await page.evaluate(()=>columnViewDebug.state.station),id);}
 // Prevent stale dimensional labels, inaccessible rug locator and mobile-only overflow.
 const layout=await page.evaluate(()=>livingLayoutDebug.metrics);
 assert.ok(Math.abs(layout.barDepth-.56)<1e-5&&Math.abs(layout.glassToTable-1.23)<1e-5);
 assert.ok(Math.abs(layout.occupiedSeatToSofa-.240)<1e-5,'Occupied seat/sofa clearance differs from displayed dimensions');
 assert.ok(Math.abs(layout.laundryOffsetZ+.55)<1e-5&&Math.abs(layout.laundryToFrontGlass-.14)<1e-5);
 assert.ok(Math.abs(layout.washerCenterToTableBack-.754)<1e-5,'Washer opening must be offset toward the glazing from the bar');
 const sideAndPower=await page.evaluate(async()=>{const T=await import('./vendor/three.module.js'),m=masterDressingDebug.model;return {sideHidden:[8,10].every(i=>!m.getObjectByName('window-living-'+i).visible),frontGlass:m.getObjectByName('window-living-9').visible,sides:['balcony-solid-left','balcony-solid-right'].map(n=>{const o=m.getObjectByName(n);return {visible:o.visible,size:new T.Box3().setFromObject(o).getSize(new T.Vector3()).toArray()};}),power:m.getObjectByName('bar-service-cover').userData};});
 assert.ok(sideAndPower.sideHidden&&sideAndPower.frontGlass);assert.ok(sideAndPower.sides.every(s=>s.visible&&Math.abs(s.size[0]-.12)<1e-5));assert.equal(sideAndPower.power.structuralChase,false);assert.equal(sideAndPower.power.powered,false);
 await page.locator('#allPlaces').click();await page.locator('[data-place="bar"]').click();
 for(const object of ['bar-laptop-workplace','bar-tea-zone','bar-service-cover','bar-cable-tray-left','balcony-solid-left','balcony-solid-right']){
  await page.locator('#placeDetails').click();await page.locator(`[data-detail-object="${object}"]`).click();
  assert.equal(await page.evaluate(()=>columnViewDebug.state.selectedFacility),object);
  assert.ok(await page.evaluate(()=>columnViewDebug.state.selectedVisible),object+' detail must be visible');
  await page.screenshot({path:__dirname+'/'+object+'-detail.png'});
 }
 for(const n of layout.wingLengths)assert.ok(Math.abs(n-1.3)<1e-5);
 assert.ok(Math.abs(layout.islandToSofa-1.05)<1e-5);assert.ok(Math.abs(layout.islandToKitchenWall-1.1)<1e-5);
 assert.ok(Math.abs(layout.sofaToCoffee-.45)<1e-5);assert.ok(Math.abs(layout.rugSize[0]-2.2)<1e-5&&Math.abs(layout.rugSize[1]-3.2)<1e-5);
 assert.ok(layout.horizontalAngle>37&&layout.horizontalAngle<40);
 const island=await page.evaluate(async()=>{const T=await import('./vendor/three.module.js'),m=masterDressingDebug.model,top=m.getObjectByName('island-prep-worktop');return {top:new T.Box3().setFromObject(top).max.y,drawers:[0,1,2,3,4,5].every(i=>!!m.getObjectByName('island-drawer-'+i)),power:!!m.getObjectByName('island-flush-power-module')};});assert.ok(Math.abs(island.top-.9)<1e-5&&island.drawers&&island.power);
 await page.locator('#allPlaces').click();await page.locator('#mobileLivingLayout').click();assert.ok(await page.locator('#livingLayout').evaluate(d=>d.open));
 const dimBox=await page.locator('#livingLayout').boundingBox();assert.ok(dimBox.x>=0&&dimBox.x+dimBox.width<=391);
 const seatStates=[],initialSeats=await page.evaluate(()=>livingLayoutDebug.seatsUse.state.entries);
 const assertSeatMovement=(state,mode,active=-1)=>{assert.equal(state.mode,mode);for(const [i,e] of state.entries.entries()){const baseline=initialSeats[i],axis=e.axis==='x'?0:2,travel=mode==='stored'?0:mode==='pulled'?.45:i<4?0:i===active?.45:.05;assert.ok(Math.abs(e.position[axis]-baseline.position[axis]-travel)<1e-6,'Actual chair movement must match the use diagram');assert.ok(Math.abs(e.position[axis===0?2:0]-baseline.position[axis===0?2:0])<1e-6,'Seat moved on the wrong axis');if(i<4)assert.ok(Math.abs(e.angle-(mode==='stand'&&i===active?Math.PI/2:0))<1e-6,'Bar seat turns while its feet remain planted');}};
 for(const mode of ['working','pulled','stored']){await page.locator(`[data-seat-mode="${mode}"]`).click();const state=await page.evaluate(()=>livingLayoutDebug.seatsUse.state);assertSeatMovement(state,mode);seatStates.push({mode,checked:6});}
 for(let i=0;i<6;i++){await page.locator('[data-seat-mode="stand"]').click();const state=await page.evaluate(()=>livingLayoutDebug.seatsUse.state);assert.equal(state.active,i);assertSeatMovement(state,'stand',i);seatStates.push({mode:'stand',active:i,checked:6});}
 await page.locator('[data-seat-mode="working"]').click();await page.screenshot({path:__dirname+'/six-seats-mobile-plan.png'});
 await page.locator('#seatUseView3d').click();assert.equal(await page.evaluate(()=>columnViewDebug.state.station),'dining');await page.waitForFunction(()=>document.querySelector('#mobileRoomName').textContent==='餐厅');await page.screenshot({path:__dirname+'/six-seats-mobile-room.png'});
 await page.locator('#allPlaces').click();await page.locator('#mobileLivingLayout').click();await page.locator('[data-seat-mode="stored"]').click();
 await page.screenshot({path:__dirname+'/mobile-living-dimensions.png'});await page.locator('#livingLayout form button').click();
 await page.locator('#allPlaces').click();await page.locator('[data-place="dining"]').click();await page.locator('#allPlaces').click();await page.locator('#mobileLivingLayout').click();await page.locator('#islandDrawerDemo').click();assert.equal(await page.evaluate(()=>livingLayoutDebug.drawerOpen),true);
 assert.ok(Math.abs(await page.evaluate(()=>masterDressingDebug.model.getObjectByName('island-drawer-0').position.x)+.4)<1e-5);await page.screenshot({path:__dirname+'/island-drawer-mobile.png'});await page.evaluate(()=>livingLayoutDebug.setDrawer(false));
 await page.locator('#allPlaces').click();await page.locator('[data-place="living"]').click();await page.locator('#placeDetails').click();await page.locator('[data-detail-object="living-area-rug"]').click();assert.equal(await page.evaluate(()=>columnViewDebug.state.selectedFacility),'living-area-rug');assert.ok(await page.evaluate(()=>columnViewDebug.state.selectedVisible));
 for(const [w,h] of [[390,844],[360,740],[844,390]]){
  await page.setViewportSize({width:w,height:h});await page.locator('#allPlaces').click();const box=await page.locator('#placeSheet').boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=w+1&&box.y+box.height<=h+1);
  await page.locator('[data-place="balconyGap"]').click();assert.equal(await page.locator('#roomTour').isVisible(),false);assert.equal(await page.locator('#gesture').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:__dirname+`/mobile-places-${w}x${h}.png`});
 }
 await page.setViewportSize({width:390,height:844});await page.locator('#allPlaces').click();await page.screenshot({path:__dirname+'/mobile-places-sheet.png'});
 await page.locator('#openDetailRender').click();await page.locator('#renderRoom').selectOption('0');await page.waitForFunction(()=>renderGalleryDebug.state.room==='entry'&&renderGalleryDebug.state.loaded);await page.locator('#renderNext').click();await page.waitForFunction(()=>renderGalleryDebug.state.room==='living'&&renderGalleryDebug.state.loaded&&document.querySelector('#detailRender img').naturalWidth===1920);await page.screenshot({path:__dirname+'/mobile-detail-render-preview.png'});await page.locator('#renderEnter').click();assert.equal(await page.evaluate(()=>columnViewDebug.state.station),'living');
 await page.locator('#mobileMenuToggle').click();await page.locator('#inventoryToggle').click();assert.ok(await page.locator('#inventory').evaluate(d=>d.open));await page.locator('#inventory [aria-label="关闭清单"]').click();
 await page.evaluate(()=>document.querySelector('#viewport').requestFullscreen=()=>Promise.reject(Error('unsupported fullscreen test')));await page.locator('#mobileMenuToggle').click();await page.locator('#fullscreen').click();assert.ok(await page.evaluate(()=>document.body.classList.contains('mobile-immersive')));await page.locator('#exitFull').click();
 await page.locator('#allPlaces').click();await page.locator('[data-place="balconyGap"]').click();
 await page.setViewportSize({width:1600,height:1000});await page.screenshot({path:__dirname+'/balcony-gap-current.png'});
 assert.equal(await page.locator('#mobilePlaces').isVisible(),false);assert.ok(await page.locator('#roomTour').isVisible());
 await page.evaluate(()=>{barPowerDebug.setOpen(false);balconyCareDebug.setDoorOpen(false);balconyCareDebug.setRobotOut(false);balconyCareDebug.setMaintenance(false);balconyDryingDebug.setFraction(0);balconyDryingDebug.setLoaded(false);masterBathDetailsDebug.setDrawers(false);masterBathDetailsDebug.setShower(false);entryRevisionDebug.setOpen(false);columnViewDebug.dryStudy.controls.setStorage(false);columnViewDebug.dryStudy.controls.setMirror(false);livingLayoutDebug.seatsUse.set('stored');livingLayoutDebug.setDrawer(false);});
 await page.evaluate(()=>kitchenDetailsDebug.reset());
 await page.evaluate(()=>publicBathDetailsDebug.reset());
 await page.evaluate(()=>masterBathDetailsDebug.floor.setGrateLift(false));
 await page.evaluate(()=>hvacDetailsDebug.reset());
 await page.evaluate(()=>curtainDetailsDebug.reset());
 if(!process.argv.includes('--no-export')){const pending=page.waitForEvent('download',{timeout:120000});await page.evaluate(async()=>{const {GLTFExporter}=await import('./vendor/render-libs.js');const model=masterDressingDebug.model;model.updateMatrixWorld(true);interiorMirrorsDebug.setExportMode(true);try{const bytes=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes]));a.download='mobile-current.glb';a.click();}finally{interiorMirrorsDebug.setExportMode(false);}});await (await pending).saveAs(__dirname+'/offline-render/mobile-current.glb');}
 const positions=await page.evaluate(()=>({targets:columnViewDebug.state.targets,viewpoints:roomViewsDebug.views,column:columnViewDebug.state.column,seats:columnViewDebug.state.seatAudit}));
 if(!process.argv.includes('--no-export'))fs.writeFileSync(__dirname+'/offline-render/mobile-current-cameras.json',JSON.stringify(positions,null,2));
 assert.deepEqual(errors,[]);const report={checks,spaces,seatStates,sizes:3,errors,layout,geometryChanged:true,exported:!process.argv.includes('--no-export'),renderSource:process.argv.includes('--no-export')?null:'offline-render/mobile-current.glb',limits:['Chrome viewport/touch simulation; not a physical phone','Equal 1.3m four-seat wings are a candidate; washer open-door use is not certified','Bedroom geometry is separately checked by verify-bedroom-revision.cjs; this navigation test does not certify furniture installation']};fs.writeFileSync(__dirname+'/mobile-places-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
