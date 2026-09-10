// Regression guard: corridor narrowing and TV no longer flush with the finished wall.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1920,height:1080}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/index.html');await page.waitForFunction(()=>window.homeDebug);
 const result=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js');const h=homeDebug;const tv=h.scene.getObjectByName('recessed-tv-black-side-reveals');tv.updateWorldMatrix(true,true);
  const screen=tv.getObjectByName('85-inch-screen');const ray=new T.Raycaster(tv.localToWorld(new T.Vector3(0,1.44,.6)),new T.Vector3(0,0,-1).transformDirection(tv.matrixWorld));
  const hit=ray.intersectObject(tv,true)[0];const recess={insetMm:h.tvInsetMm,frontHit:hit?.object.name,distanceMm:Math.round((hit?.distance||0)*1000),screenWidth:screen.geometry.parameters.width};
  const routes=h.rooms.map(room=>{h.enter();h.goRoom(room.id);let count=0;while(h.state.routeLength&&count++<3000)h.tick(1/30);return {id:room.id,arrived:!h.state.routeLength,error:Math.hypot(h.state.position[0]-h.P(room.point)[0],h.state.position[2]-h.P(room.point)[1])};});
  const cabinet=h.scene.getObjectByName('flush-sideboard');cabinet.updateWorldMatrix(true,true);
  const waterRay=new T.Raycaster(cabinet.localToWorld(new T.Vector3(1.625,1.42,.6)),new T.Vector3(0,0,-1).transformDirection(cabinet.matrixWorld));
  const dispenser={...h.dispenser,frontHit:waterRay.intersectObject(cabinet,true)[0]?.object.name};
  const laundryGroup=h.scene.getObjectByName('balcony-laundry-cabinet'),laundryBounds=new T.Box3().setFromObject(laundryGroup),b=laundryBounds;
  const overlaps=h.colliders.filter(c=>c.name!=='阳台洗烘柜'&&Math.min(c.x2,b.max.x)-Math.max(c.x1,b.min.x)>.001&&Math.min(c.z2,b.max.z)-Math.max(c.z1,b.min.z)>.001).map(c=>c.name||c.type);
  const opposite=h.colliders.filter(c=>c.name!=='阳台洗烘柜'&&c.x2<=b.min.x&&c.z1<1.2&&c.z2>1.1);
  const laundry={bounds:[b.min.toArray(),b.max.toArray()],overlaps,closedFrontClearanceMm:Math.round((b.min.x-Math.max(...opposite.map(c=>c.x2)))*1000),washer:!!laundryGroup.getObjectByName('laundry-washer'),dryer:!!laundryGroup.getObjectByName('laundry-dryer'),cleaningDoor:!!laundryGroup.getObjectByName('laundry-cleaning-cabinet-door'),stackingKit:!!laundryGroup.getObjectByName('laundry-stacking-kit'),siteServices:laundryGroup.userData};
  return {clearances:h.clearanceAudit,recess,dispenser,routes,laundry};
 });
 console.log(JSON.stringify(result,null,2));
 await page.check('#widths');await page.waitForTimeout(250);await page.screenshot({path:path.join(__dirname,'clearance.png')});await page.uncheck('#widths');
 await page.evaluate(()=>homeDebug.finishReady);
 for(const id of ['cabinet','living','dining','bar','laundry']){await page.evaluate(id=>{homeDebug.enter();homeDebug.goRoom(id);for(let n=0;n<3000&&homeDebug.state.routeLength;n++)homeDebug.tick(1/30);},id);await page.waitForTimeout(250);await page.screenshot({path:path.join(__dirname,id+'-design.png')});}
 console.log('ERRORS',JSON.stringify(errors));await browser.close();
 if(errors.length||result.clearances.some(c=>!c.pass)||Math.abs(result.recess.insetMm)>1||result.recess.frontHit!=='85-inch-screen'||Math.abs(result.dispenser.faceInsetMm)>1||result.dispenser.bodyBehindMm<=0||result.dispenser.frontHit!=='dispenser-flush-face'||result.routes.some(r=>!r.arrived||r.error>.3))process.exitCode=1;
 if(result.laundry.overlaps.length||result.laundry.closedFrontClearanceMm<900||!result.laundry.washer||!result.laundry.dryer||!result.laundry.cleaningDoor||!result.laundry.stackingKit)process.exitCode=1;
})();
