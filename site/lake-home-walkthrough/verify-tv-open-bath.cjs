const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=living&angle=living-tv');await page.waitForFunction(()=>columnViewDebug.state.ready);
 const report=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),m=masterDressingDebug.model,tv=tvDisplayDebug.tv,root=tvDisplayDebug.root,visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  m.updateMatrixWorld(true);const screen=m.getObjectByName('85-inch-screen'),s=screen.geometry.boundingBox??(screen.geometry.computeBoundingBox(),screen.geometry.boundingBox);
  const outside=[],supports=[],lightNames=[];root.traverse(o=>{if(!o.isMesh)return;const b=new T.Box3().setFromObject(o),pts=[];for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])pts.push(tv.worldToLocal(new T.Vector3(x,y,z)));if(pts.some(p=>Math.abs(p.x)>(['tv-display-outer-pilaster','tv-display-upper-infill','tv-display-lower-infill'].includes(o.name)?1.901:1.651)||p.z>.2401))outside.push(o.name);if(o.name.startsWith('tv-display-light-')&&o.userData.lightingRole==='emitter')lightNames.push(o.name);});
  const shelfMeshes=[];tv.traverse(o=>{if(o.isMesh&&visible(o)&&['tv-display-shelf','tv-console-top'].includes(o.name))shelfMeshes.push(o);});
  const items=[];root.traverse(o=>{if(o.name==='tv-display-book')items.push(o);});for(const n of ['tv-decor-lake-side','tv-decor-dining-side']){const g=tv.getObjectByName(n);const b=new T.Box3().setFromObject(g);supports.push({name:n,bottom:b.min.y});}
  const ray=new T.Raycaster();for(const o of items){const b=new T.Box3().setFromObject(o),p=b.getCenter(new T.Vector3());p.y=b.min.y+.002;ray.set(p,new T.Vector3(0,-1,0));ray.far=.01;const h=ray.intersectObjects(shelfMeshes,false)[0];supports.push({name:o.name,bottom:b.min.y,supported:!!h,gap:h?b.min.y-h.point.y:null});}
  const d=publicBathDetailsDebug,glass=[];d.shower.traverse(o=>{if(o.isMesh&&visible(o)&&o.material.transparent&&o.material.opacity<.5)glass.push(o.name);});
  walkDebug.rebuild();const doors=walkDebug.obstacles.filter(o=>o.name.startsWith('bath1-fold-')||o.name==='bath1-single-door-baseline');
  const dry=new T.Box3().setFromObject(m.getObjectByName('bath1-vanity')).getCenter(new T.Vector3());
  const preserved=['bath1-vanity','bath1-heater','bath1-aluminum-ceiling'].map(name=>({name,visible:visible(m.getObjectByName(name))}));
  const tvStandBlockedBy=walkDebug.reason(8.65,3.66);
  return {screen:s.getSize(new T.Vector3()).toArray(),screenPosition:screen.position.toArray(),outside,supports,lightNames,glass,doorHidden:!visible(d.door),remainingDoorObstacles:doors,dryPosition:dry.toArray(),preserved,tvStandBlockedBy,squatVisible:visible(m.getObjectByName('bath1-squat-pan')),entryDoorVisible:visible(m.getObjectByName('door-bath1-single')),partitionRemoved:d.root.userData.partitionRemoved,tvBounds:root.userData};
 });
 fs.writeFileSync(__dirname+'/tv-open-bath-verification.json',JSON.stringify(report,null,2));
 assert.ok(Math.abs(report.screen[0]-1.882)<.002&&Math.abs(report.screen[1]-1.059)<.002);assert.deepEqual(report.outside,[]);assert.equal(report.lightNames.length,4);assert.ok(Math.abs(report.screenPosition[2]+.02)<.001);assert.equal(report.tvBounds.screenForwardMetres,.1);assert.ok(report.supports.filter(p=>p.name==='tv-display-book').every(p=>p.supported&&Math.abs(p.gap)<.001));
 assert.deepEqual(report.glass,[]);assert.equal(report.doorHidden,true);assert.deepEqual(report.remainingDoorObstacles,[]);assert.ok(report.partitionRemoved&&report.squatVisible&&report.entryDoorVisible);assert.ok(report.dryPosition[0]>2.6,'Basin must remain outside the public bath');assert.ok(report.preserved.every(o=>o.visible));assert.ok(!report.tvStandBlockedBy,JSON.stringify(report.tvStandBlockedBy));
 report.ui=[];for(const [width,height] of [[1440,1000],[390,844]]){
  await page.setViewportSize({width,height});await page.selectOption('#roomSelect','living',{force:true});
  if(width===390){await page.locator('#placeDetails').click();await page.locator('#placeSheet [data-room-view="living-tv"]').click();}else{await page.locator('#viewerDetailToggle').click();await page.locator('#facilities').evaluate(e=>e.open=true);await page.locator('#facilities [data-room-view="living-tv"]').click();}
  await page.screenshot({path:__dirname+`/tv-display-current-${width}.png`});
  await page.selectOption('#roomSelect','bath1',{force:true});assert.equal(await page.locator('[data-public-bath-action="shower"]').count(),0);
  if(width===390){await page.locator('#placeDetails').click();assert.equal(await page.locator('[data-detail-object="bath1-shower-door"]').count(),0);await page.locator('#placeSheet [data-room-view="public-shower"]').click();}else{await page.locator('#viewerDetailToggle').click();await page.locator('#facilities').evaluate(e=>e.open=true);await page.locator('#facilities [data-room-view="public-shower"]').click();}
  await page.screenshot({path:__dirname+`/public-open-current-${width}.png`});
  if(width===390)await page.locator('#mobileMenuToggle').click();
  await page.locator('header [data-mode="walk"]').click();const walk=await page.evaluate(()=>{const p=walkDebug.state.position;walkDebug.move(1.28-p[0],5.92-p[2]);walkDebug.move(0,.72);walkDebug.step(0);return {...walkDebug.state};});assert.ok(walk.active&&Math.abs(walk.position[0]-1.28)<.02&&Math.abs(walk.position[2]-6.64)<.02,JSON.stringify(walk));await page.locator('#walkExit').click();report.ui.push({width,walkPosition:walk.position});
 }
 assert.deepEqual(errors,[]);report.errors=errors;report.limits='Local model/accessibility checks, not waterproofing, cabinet fixing or final whole-home acceptance.';fs.writeFileSync(__dirname+'/tv-open-bath-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
