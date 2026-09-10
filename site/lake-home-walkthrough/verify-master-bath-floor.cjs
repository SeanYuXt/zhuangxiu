// Regressions: wet-area holes overwritten, flat tiles covering fall/drain,
// inverted normals, and the new door seal scraping the finish when opened.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000},hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bath2&v=bath2-drain');await p.waitForFunction(()=>window.columnViewDebug?.state.ready,null,{timeout:60000});
 const geometry=await p.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),m=masterDressingDebug.model,d=masterBathDetailsDebug,f=d.floor,tiles=tileSurfacesDebug,base=m.getObjectByName('800x800-straight-tile-floor');
  const ray=(x,z,objects)=>new T.Raycaster(new T.Vector3(x,.15,z),new T.Vector3(0,-1,0),0,.3).intersectObjects(objects,true)[0];
  const invalid=[];let tileCount=0;f.wet.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position,n=o.geometry.attributes.normal;if(o.name==='bath2-cut-800-tile')tileCount++;for(let i=0;i<a.count;i++){if(![a.getX(i),a.getY(i),a.getZ(i),n.getX(i),n.getY(i),n.getZ(i)].every(Number.isFinite)||n.getY(i)<.99)invalid.push(o.name);}});
  const holes=[[2.17,6.79],[1.28,7.035],[1.25,6.70],[12.8,1.025],[12.8,1.60]].map(([x,z])=>({x,z,hit:ray(x,z,[base,tiles.tiles])?.object.name||null}));
  const samples=[.95,.99,1.06,1.10,1.30,1.50,1.70,1.874,1.879].map(z=>{const hit=ray(12.8,z,[f.wet]);return {z,y:hit?.point.y,expected:f.heightAt(z)-(hit?.object.name==='bath2-sloped-grout-bed'?tileSurfacesDebug.layout.jointRecess:0),part:hit?.object.name};});
  const bars=[12.29,12.49,12.81,13.09,13.31].map(x=>{const h=ray(x,1.025,[f.drain]);return {x,y:h?.point.y,part:h?.object.name};});
  const slot=ray(12.30,1.025,[f.drain]);
  const floorMeshes=[base,tiles.tiles,f.wet],doorParts=[];d.door.traverse(o=>{if(o.isMesh)doorParts.push(o);});let minDoorClearance=Infinity;
  for(let i=0;i<=90;i++){d.setShowerFraction(i/90);for(const o of doorParts){const a=o.geometry.attributes.position;for(let j=0;j<a.count;j++){const v=new T.Vector3().fromBufferAttribute(a,j).applyMatrix4(o.matrixWorld);if(v.y>.06)continue;const h=ray(v.x,v.z,floorMeshes);if(h)minDoorClearance=Math.min(minDoorClearance,v.y-h.point.y);}}}d.setShower(false);
  f.setGrateLift(true);const lifted=new T.Box3().setFromObject(f.grate);f.setGrateLift(false);const closed=new T.Box3().setFromObject(f.grate);
  let duplicateRejected=false;try{(await import('./master-bath-floor.js')).refineMasterBathFloor(m);}catch(e){duplicateRejected=e.message.includes('重复');}
  return {holes,sourceHoles:base.geometry.parameters.shapes.holes.length,samples,bars,slot:{part:slot?.object.name,y:slot?.point.y},tileCount,invalid,minDoorClearance,grateLift:lifted.min.y-closed.min.y,removed:f.removed.length,duplicateRejected,spec:f.root.userData,sharedWetCount:tiles.wet.filter(o=>o.name==='bath2-cut-800-tile').length};
 });
 fs.writeFileSync(__dirname+'/master-bath-floor-verification.json',JSON.stringify({geometry,errors},null,2));
 assert.equal(geometry.sourceHoles,3);assert.ok(geometry.holes.every(h=>h.hit===null));assert.deepEqual(geometry.invalid,[]);assert.ok(geometry.samples.every(s=>Math.abs(s.y-s.expected)<.0001),JSON.stringify(geometry.samples));assert.ok(geometry.bars.every(s=>s.part==='bath2-drain-grate-bar'&&Math.abs(s.y+.006)<1e-6));assert.equal(geometry.slot.part,'bath2-drain-trough-bottom');assert.ok(geometry.slot.y<-.03);assert.ok(geometry.minDoorClearance>.0004);assert.ok(Math.abs(geometry.grateLift-.08)<1e-6);assert.equal(geometry.removed,13);assert.equal(geometry.tileCount,geometry.sharedWetCount);assert.equal(geometry.duplicateRejected,true);assert.equal(geometry.spec.drainConnection,null);
 const ui=[];for(const [width,height] of [[1440,1000],[390,844]]){
  await p.setViewportSize({width,height});
  if(width<800){await p.locator('#allPlaces').click();await p.locator('[data-place="bath2"]').click();await p.locator('#placeDetails').click();await p.locator('[data-detail-object="bath2-sloped-tile-floor"]').click();}
  else{await p.selectOption('#roomSelect','bath2');await p.locator('#facilities').evaluate(o=>o.open=true);await p.locator('[data-facility="bath2-sloped-tile-floor"]').click();}assert.ok(await p.evaluate(()=>columnViewDebug.state.selectedVisible));
  await p.locator('[data-master-floor-action="grate"]').click();assert.equal(await p.evaluate(()=>masterBathDetailsDebug.floor.state.grateOpen),true);await p.screenshot({path:__dirname+`/master-bath-floor-${width}.png`});
  await p.locator('[data-master-floor-action="grate"]').click();assert.equal(await p.evaluate(()=>masterBathDetailsDebug.floor.state.grateOpen),false);ui.push({width,height,locator:true,lift:true});
 }
 assert.deepEqual(errors,[]);const report={geometry,ui,errors,limits:'Finish geometry and door clearance only; not real drainage, waterproofing, structural depth or product installation.'};fs.writeFileSync(__dirname+'/master-bath-floor-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
