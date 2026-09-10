// Focused regression: useful sink cavity, separate service bay, appliance aisle and robot exit.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=care');await page.waitForFunction(()=>columnViewDebug?.state.ready);
 const geometry=await page.evaluate(async()=>{const T=await import('./vendor/three.module.js'),m=masterDressingDebug.model,c=balconyCareDebug;
  const box=n=>{const b=new T.Box3().setFromObject(m.getObjectByName(n));return {min:b.min.toArray(),max:b.max.toArray()};};
  const care=box('balcony-care-cabinet'),sink=box('balcony-care-sink'),fridge=box('integrated-fridge');
  const ray=new T.Raycaster(new T.Vector3(6.22,1.02,.565),new T.Vector3(0,-1,0));const hit=ray.intersectObject(m,true).find(h=>{for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return true;});
  const internalOverlap=[];
  const rbox=new T.Box3().setFromObject(c.robot);m.getObjectByName('balcony-robot-dock').traverse(o=>{if(!o.isMesh||o.name==='dock-cleaning-tray')return;const b=new T.Box3().setFromObject(o);if(rbox.intersectsBox(b))internalOverlap.push(o.name);});
  // Sweep the actual circular robot, not its square bounding box, through fixed nearby meshes.
  const obstacles=[];m.traverse(o=>{if(!o.isMesh)return;for(let p=o;p;p=p.parent)if(!p.visible||p===c.robot)return;const b=new T.Box3().setFromObject(o);if(b.max.y<.035||b.min.y>.145||b.max.x<5.85||b.min.x>7.5||b.max.z<.90||b.min.z>1.55||o.name==='dock-cleaning-tray')return;obstacles.push({name:o.name,min:b.min.toArray(),max:b.max.toArray()});});
  const collisions=[];for(let i=0;i<=82;i++){const x=6.285+i*.01,z=1.215;for(const b of obstacles){const dx=Math.max(b.min[0]-x,0,x-b.max[0]),dz=Math.max(b.min[2]-z,0,z-b.max[2]);if(Math.hypot(dx,dz)<.175-.001)collisions.push({step:i,name:b.name});}}
  return {care,sink,fridge,basinHit:{name:hit.object.name,y:hit.point.y},internalOverlap,robotSweepCollisions:collisions,metrics:livingLayoutDebug.metrics,services:m.getObjectByName('balcony-care-services').userData};
 });
 assert.ok(Math.abs(geometry.care.max[2]-geometry.care.min[2]-1.3)<1e-5);
 assert.ok(geometry.metrics.careToLeftWing>.95&&geometry.metrics.careToFridge>.30);
 assert.ok(geometry.basinHit.y<.80,'The sink must not be a white surface on an uncut worktop');
 // The square box is conservative at the dock cheeks; the actual circular sweep below is decisive.
 assert.deepEqual(geometry.robotSweepCollisions,[]);assert.equal(geometry.services.supply,null);
 await page.screenshot({path:__dirname+'/care-mobile-closed.png'});
 for(const object of ['balcony-care-cabinet','balcony-care-sink','balcony-robot-dock','balcony-cleaning-robot','balcony-care-services','balcony-folding-basin','balcony-care-upper']){
  await page.locator('#placeDetails').click();await page.locator(`[data-detail-object="${object}"]`).click();assert.ok(await page.evaluate(()=>columnViewDebug.state.selectedVisible),object+' not visible');
 }
 await page.locator('#careDoorDemo').click();assert.equal(await page.evaluate(()=>balconyCareDebug.doorOpen),false);
 await page.locator('#careRobotDemo').click();assert.equal(await page.evaluate(()=>balconyCareDebug.robotOut),true);await page.screenshot({path:__dirname+'/care-robot-out.png'});await page.locator('#careRobotDemo').click();
 await page.locator('#careDoorDemo').click();assert.equal(await page.evaluate(()=>balconyCareDebug.doorOpen),true);await page.screenshot({path:__dirname+'/care-mobile-inside.png'});await page.locator('#careDoorDemo').click();
 await page.setViewportSize({width:1450,height:950});await page.screenshot({path:__dirname+'/care-desktop.png'});
 await page.locator('header [data-mode="layout"]').click(); // Care is a part of the balcony, not a new room polygon.
 assert.deepEqual(errors,[]);
 const result={geometry,errors,limits:'Model-only proposed cabinet; circular straight-path sweep is not real SLAM, docking, climbing or site plumbing verification.'};fs.writeFileSync(__dirname+'/balcony-care-audit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
