// Prevent rack/table clipping, blocked maintenance actions and missing PC/mobile controls.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=drying');await page.waitForFunction(()=>window.columnViewDebug?.state.ready);
 const result=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{balconyDrying:s}=await import('./design-spec.js'),m=masterDressingDebug.model,d=balconyDryingDebug,c=balconyCareDebug;
  const bounds=o=>new T.Box3().setFromObject(o),named=n=>m.getObjectByName(n),visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const intersects=(a,b)=>Math.min(a.max.x,b.max.x)-Math.max(a.min.x,b.min.x)>.001&&Math.min(a.max.y,b.max.y)-Math.max(a.min.y,b.min.y)>.001&&Math.min(a.max.z,b.max.z)-Math.max(a.min.z,b.min.z)>.001;
  const collision=[];const fixed=[];m.traverse(o=>{if(!o.isMesh||!visible(o))return;for(let p=o;p;p=p.parent)if(p===d.group||p===c.lid||p===c.cassette)return;fixed.push([o.name,bounds(o),o]);});
  // Ceiling meshes contain hollow rings: their full AABB is not a solid ceiling.
  const triangleHit=(box,mesh)=>{const a=mesh.geometry.attributes.position,index=mesh.geometry.index,tri=new T.Triangle();for(let i=0;i<(index?.count||a.count);i+=3){for(let j=0;j<3;j++)[tri.a,tri.b,tri.c][j].fromBufferAttribute(a,index?index.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld);if(box.intersectsTriangle(tri))return true;}return false;};
  const body=bounds(named('drying-motor-cover'));const bodyCandidates=fixed.filter(([n,b])=>intersects(body,b));const bodyHits=bodyCandidates.filter(([n,b,o])=>triangleHit(body,o)).map(([n])=>n);
  d.setLoaded(true);let maxGarmentZ=-Infinity;
  for(let i=0;i<=75;i++){d.setFraction(i/75);const rail=bounds(d.moving);maxGarmentZ=Math.max(maxGarmentZ,rail.max.z);for(const [n,b] of fixed)if(intersects(rail,b))collision.push({pose:i,name:n});}
  const envelope=new T.Box3(new T.Vector3(s.position[0]-.765,s.loweredY-s.garmentDrop,s.position[2]-s.garmentDepth/2),new T.Vector3(s.position[0]+.765,s.raisedY,s.position[2]+s.garmentDepth/2));
  const envelopeHits=fixed.filter(([n,b])=>intersects(envelope,b)).map(([n])=>n);
  const maintenanceHits=[];let lidMaxY=0;
  for(let i=0;i<=100;i++){c.setMaintenanceFraction(i/100);const lid=bounds(c.lid),box=bounds(c.cassette);lidMaxY=Math.max(lidMaxY,lid.max.y);for(const [n,b] of fixed){if(intersects(lid,b))maintenanceHits.push({pose:i,part:'lid',name:n});if(intersects(box,b))maintenanceHits.push({pose:i,part:'cassette',name:n});}if(intersects(lid,box))maintenanceHits.push({pose:i,part:'lid',name:'cassette'});}
  const ceiling=bounds(named('robot-bay-ceiling'));
  // Person stance behind small laundry: 600x600mm, not an unrestricted whole-balcony access claim.
  const stance=new T.Box3(new T.Vector3(7.9,0,.68),new T.Vector3(8.5,1.75,1.28));
  const stanceHits=fixed.filter(([n,b])=>b.max.y>.04&&intersects(stance,b)).map(([n])=>n);
  c.setMaintenance(false);d.setFraction(0);d.setLoaded(false);
  return {bodyHits,bodyCandidates:bodyCandidates.map(([n,b])=>({name:n,min:b.min.toArray(),max:b.max.toArray()})),rackSweepHits:collision,envelopeHits,maintenanceHits,lidMaxY,bayUnderside:ceiling.min.y,overhead:ceiling.min.y-.55,lidOpenGap:ceiling.min.y-lidMaxY,stanceHits,clothToTableGap:1.33-envelope.max.z,maxGarmentZ,errors:[]};
 });
 fs.writeFileSync(__dirname+'/balcony-service-verification.json',JSON.stringify(result,null,2));
 assert.deepEqual(result.bodyHits,[],'Motor intersects current ceiling or furniture');assert.deepEqual(result.rackSweepHits,[],'Raised/lowered rack collision');assert.deepEqual(result.envelopeHits,[],'Conservative laundry envelope');assert.deepEqual(result.maintenanceHits,[],'Dock service motion collision');assert.deepEqual(result.stanceHits,[],'Hanging clothes stance');assert.ok(result.lidOpenGap>.04);
 const visit=async id=>{if(await page.locator('#roomSelect').isVisible())await page.selectOption('#roomSelect',id);else{await page.locator('#allPlaces').click();await page.locator(`[data-place="${id}"]`).click();}};
 for(const viewport of [{width:390,height:844},{width:1450,height:950}]){
  await page.setViewportSize(viewport);await visit('drying');await page.locator('[data-drying-action="lower"]').click();await page.locator('[data-drying-action="load"]').click();
  assert.deepEqual(await page.evaluate(()=>({f:balconyDryingDebug.state.fraction,load:balconyDryingDebug.state.loaded})),{f:1,load:true});
  await page.screenshot({path:__dirname+`/balcony-drying-${viewport.width}.png`});
  await page.locator('[data-drying-action="lower"]').click();await page.locator('[data-drying-action="load"]').click();
  await visit('care');await page.locator('#careMaintenance').click();assert.equal(await page.evaluate(()=>balconyCareDebug.maintenance),true);await page.screenshot({path:__dirname+`/balcony-maintenance-${viewport.width}.png`});await page.locator('#careMaintenance').click();
 }
 await page.setViewportSize({width:390,height:844});await page.locator('#allPlaces').click();await page.locator('[data-place="drying"]').click();assert.equal(await page.evaluate(()=>columnViewDebug.state.station),'drying');
 assert.deepEqual(errors,[]);result.errors=errors;result.ui=['390x844','1450x950','mobile place'];result.limits='概念机型；仅三件转向衣架小件及600mm站位。未验证真实机电、承重、防坠、长衣/床单或实机接管。';fs.writeFileSync(__dirname+'/balcony-service-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
