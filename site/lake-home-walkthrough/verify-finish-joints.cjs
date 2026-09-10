// Finish regression: casing/door sweeps, cabinet clashes, repeat construction and miter geometry.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=entry&v=finish-joints');await page.waitForFunction(()=>window.columnViewDebug?.state.ready);
 const result=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{addSkirting}=await import('./finish-details.js'),{setDoorLeafOpen}=await import('./door-motion.js');
  const model=masterDressingDebug.model,visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const meshes=o=>{const list=[];o?.traverse(m=>{if(m.isMesh&&visible(m))list.push(m);});return list;};
  const box=o=>new T.Box3().setFromObject(o),overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>.001);
  const before=[model.getObjectByName('whole-home-skirting').children.length,model.getObjectByName('whole-home-door-casings').children.length];
  addSkirting(model);model.updateMatrixWorld(true);
  const skirts=model.getObjectByName('whole-home-skirting'),casings=model.getObjectByName('whole-home-door-casings'),finishMeshes=[...meshes(skirts),...meshes(casings)];
  const cabinetNames=['flush-entry-cabinet','flush-sideboard','integrated-fridge','balcony-laundry-cabinet','balcony-care-cabinet','bed1-wardrobe','bed3-wardrobe','master-entry-wardrobe','master-wardrobe','bath1-vanity','bath2-vanity'];
  const furniture=cabinetNames.flatMap(n=>meshes(model.getObjectByName(n))),cabinetHits=[];
  for(const f of finishMeshes)for(const other of furniture)if(overlap(box(f),box(other)))cabinetHits.push([f.name,other.name]);
  function obb(o){o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,c=b.getCenter(new T.Vector3()).applyMatrix4(o.matrixWorld),s=b.getSize(new T.Vector3()),axes=[0,1,2].map(i=>new T.Vector3().setFromMatrixColumn(o.matrixWorld,i)),half=axes.map((v,i)=>v.length()*s.getComponent(i)/2);axes.forEach(v=>v.normalize());return {c,axes,half};}
  function intersects(a,b){
   if(!overlap(box(a),box(b)))return false;
   const aa=obb(a),bb=obb(b),delta=bb.c.clone().sub(aa.c),axes=[...aa.axes,...bb.axes,...aa.axes.flatMap(x=>bb.axes.map(y=>x.clone().cross(y)))];
   for(const axis of axes){if(axis.lengthSq()<1e-10)continue;axis.normalize();const r1=aa.axes.reduce((s,v,i)=>s+Math.abs(v.dot(axis))*aa.half[i],0),r2=bb.axes.reduce((s,v,i)=>s+Math.abs(v.dot(axis))*bb.half[i],0);if(r1+r2-Math.abs(delta.dot(axis))<=.001)return false;}return true;
  }
  const doors=[];model.traverse(o=>{if(/^door-(front-(main|secondary)|(bed1|bed3|master|bath1|bath2)-single)$/.test(o.name))doors.push(o);});
  const doorHits=[];
  for(const door of doors){const saved=door.rotation.y;
   for(let deg=0;deg<=90;deg++){door.rotation.y=door.userData.base+door.userData.turn*deg*Math.PI/180;model.updateMatrixWorld(true);
    for(const part of meshes(door))for(const trim of meshes(casings))if(intersects(part,trim))doorHits.push({door:door.name,deg,part:part.name,trim:trim.name});
   }door.rotation.y=saved;
  }
  model.updateMatrixWorld(true);const counts={};model.traverse(o=>{if(['whole-home-skirting','whole-home-door-casings'].includes(o.name))counts[o.name]=(counts[o.name]||0)+1;});
  const invalid=[];for(const f of finishMeshes)if(Array.from(f.geometry.attributes.position.array).some(v=>!Number.isFinite(v)))invalid.push(f.name);
  const floor=(await import('./tile-surfaces.js')).tileLayout.surfaceY,contactErrors=[],seals=finishMeshes.filter(o=>o.userData.detailRole==='trim-floor-seal');
  const contact=seals.map(o=>{const b=box(o);if(Math.abs(b.min.y-floor)>1e-6||Math.abs(b.max.y-floor-.002)>1e-6)contactErrors.push(o.name);return {name:o.name,bottom:b.min.y,top:b.max.y};});
  for(const part of skirts.children.filter(o=>o.userData.wallIndex!==undefined)){const b=box(part);if(Math.abs(b.min.y-floor-.002)>1e-6||Math.abs(b.max.y-b.min.y-.06)>1e-6)contactErrors.push(part.name+' height');}
  for(const part of meshes(casings).filter(o=>o.name.includes('-jamb-'))){const b=box(part);if(Math.abs(b.min.y-floor-.002)>1e-6||Math.abs(b.max.y-2.20)>1e-6)contactErrors.push(part.name+' height');}
  return {before,after:[skirts.children.length,casings.children.length],counts,casings:casings.userData.schedule,segments:skirts.userData.segments.length,joints:skirts.userData.joints,endcaps:skirts.userData.endcaps.length,cabinetHits,doorHits,doorCount:doors.length,invalid,contact,contactErrors};
 });
 fs.writeFileSync(__dirname+'/finish-joints-verification.json',JSON.stringify({...result,errors},null,2));
 console.log(JSON.stringify({...result,casings:result.casings.map(x=>({id:x.opening,sides:x.sides})),joints:result.joints.length,doorHits:result.doorHits.slice(0,12),cabinetHits:result.cabinetHits.slice(0,12)}));
 assert.deepEqual(result.invalid,[]);assert.deepEqual(result.before,result.after);assert.ok(Object.values(result.counts).every(n=>n===1));assert.equal(result.casings.length,6);assert.equal(result.doorCount,7);assert.ok(result.joints.length>0);assert.deepEqual(result.cabinetHits,[]);assert.deepEqual(result.doorHits,[]);assert.deepEqual(errors,[]);
 assert.deepEqual(result.contactErrors,[]);assert.equal(result.contact.length,result.segments+result.casings.reduce((sum,c)=>sum+c.sides.length*2,0));
 // Use existing room/detail navigation; no alternate model for the pictures.
 await page.locator('#roomSelect').selectOption('bed1');await page.screenshot({path:__dirname+'/finish-bed1-desktop.png'});
 await page.locator('#roomSelect').selectOption('entry');await page.screenshot({path:__dirname+'/finish-entry-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.locator('[data-quick-room="bath2"]').click();await page.screenshot({path:__dirname+'/finish-bath2-mobile.png'});
 const detailChecks=[];
 for(const [room,object] of [['entry','door-casing-front'],['bed1','door-casing-bed1'],['bath1','door-casing-bath1'],['master','door-casing-master'],['bath2','door-casing-bath2'],['bed3','door-casing-bed3'],['entry','skirting-21--1-1.925']]){
  if(room==='entry'){await page.locator('#allPlaces').click();await page.locator('[data-place="entry"]').click();}else await page.locator(`[data-quick-room="${room}"]`).click();
  await page.locator('#placeDetails').click();await page.locator(`[data-detail-object="${object}"]`).click();
  const actual=await page.evaluate(()=>({object:columnViewDebug.state.selectedFacility,visible:columnViewDebug.state.selectedVisible}));detailChecks.push(actual);
  assert.equal(actual.object,object);
  await page.screenshot({path:__dirname+'/finish-detail-'+object+'.png'});
 }
 fs.writeFileSync(__dirname+'/finish-joints-verification.json',JSON.stringify({...result,detailChecks,errors},null,2));
 console.log(JSON.stringify({detailChecks}));assert.ok(detailChecks.every(c=>c.visible),'Finish detail camera does not show its actual target');assert.deepEqual(errors,[]);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
