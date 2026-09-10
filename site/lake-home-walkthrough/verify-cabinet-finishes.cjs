// Regressions: cold loading, geometry mutation, stretched/moving grain, and
// repainting non-wood surfaces. Visual realism is not certified by this test.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base='http://127.0.0.1:8768/lake-home-walkthrough/';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],report={};
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/finish-harness.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Material regression</title>'}));
  await page.route('**/assets/white_oak_veneer-*.jpg',async r=>{await new Promise(ok=>setTimeout(ok,350));await r.continue();});
  await page.goto(base+'finish-harness.html');
  report.unit=await page.evaluate(async()=>{
   const T=await import('./vendor/three.module.js'),{finishWoodPanel,cabinetFinishesReady}=await import('./cabinet-finishes.js');
   const parent=new T.Group();parent.rotation.y=.47;parent.scale.set(1.2,1,.9);
   const original=new T.BoxGeometry(.60,2.2,.018),a=new T.Mesh(original,new T.MeshStandardMaterial()),b=new T.Mesh(original,a.material);parent.add(a,b);a.position.set(2,.5,-1);a.rotation.x=.2;
   const signature=o=>JSON.stringify({p:[...o.geometry.attributes.position.array],n:[...o.geometry.attributes.normal.array],i:[...o.geometry.index.array],position:o.position.toArray(),q:o.quaternion.toArray(),scale:o.scale.toArray()});
   const before=signature(a),siblingUV=[...b.geometry.attributes.uv.array];finishWoodPanel(a);
   const cold=!a.material.map.image,geometryPreserved=before===signature(a),sharedGeometryUntouched=JSON.stringify(siblingUV)===JSON.stringify([...b.geometry.attributes.uv.array])&&b.geometry===original&&a.geometry!==original;
   const uv=[...a.geometry.attributes.uv.array],g=a.geometry,m=a.material;finishWoodPanel(a);const idempotent=a.geometry===g&&a.material===m;
   parent.position.x+=.5;parent.rotation.y+=.3;a.updateWorldMatrix(true,false);const movingGrainFixed=JSON.stringify(uv)===JSON.stringify([...a.geometry.attributes.uv.array]);
   a.scale.y=1.1;const scaledBefore=signature(a);finishWoodPanel(a,{refresh:true});
   const refreshPreservesGeometry=scaledBefore===signature(a),refreshedHeight=a.userData.woodFinish.sizeAtApplication[1];
   await cabinetFinishesReady;
   return {cold,geometryPreserved,sharedGeometryUntouched,idempotent,movingGrainFixed,refreshPreservesGeometry,refreshedHeight,maps:['map','normalMap','roughnessMap'].map(k=>({k,loaded:!!a.material[k].image?.width,repeat:a.material[k].repeat.toArray(),colorSpace:a.material[k].colorSpace}))};
  });
  for(const key of ['cold','geometryPreserved','sharedGeometryUntouched','idempotent','movingGrainFixed','refreshPreservesGeometry'])assert.equal(report.unit[key],true,key);
  assert.ok(Math.abs(report.unit.refreshedHeight-2.42*Math.hypot(Math.cos(.2),.9*Math.sin(.2)))<1e-5);
  for(const m of report.unit.maps){assert.ok(m.loaded);assert.deepEqual(m.repeat,[2,2]);assert.equal(m.colorSpace,m.k==='map'?'srgb':'');}
  await page.unroute('**/assets/white_oak_veneer-*.jpg');
  await page.goto(base+'column-view.html?v=oak-panels&space=bed3&angle=child-study');
  await page.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.interiorMirrorsDebug?.state.count===6);
  const inventory=()=>page.evaluate(async()=>{
   const T=await import('./vendor/three.module.js'),model=masterDressingDebug.model,panels=[],bad=[],maps=new Set(),preserved=[];
   const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
   model.updateMatrixWorld(true);model.traverse(o=>{
    if(!o.isMesh||!visible(o))return;
    if(o.userData.woodFinish){
     const g=o.geometry,p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;g.computeBoundingBox();
     const dimensions=g.boundingBox.getSize(new T.Vector3()).toArray(),scale=[0,1,2].map(i=>new T.Vector3().setFromMatrixColumn(o.matrixWorld,i).length()),size=dimensions.map((v,i)=>v*scale[i]);
     if(size.some((v,i)=>Math.abs(v-o.userData.woodFinish.sizeAtApplication[i])>1e-5))bad.push(o.name+': scale changed after finish');
     let maxUVError=0;for(let i=0;i<p.count;i++){
      const face=[Math.abs(n.getX(i)),Math.abs(n.getY(i)),Math.abs(n.getZ(i))],normalAxis=face.indexOf(Math.max(...face)),axes=[0,1,2].filter(j=>j!==normalAxis).sort((a,b)=>size[b]-size[a]);
      const point=[p.getX(i),p.getY(i),p.getZ(i)],expected=[point[axes[1]]*scale[axes[1]]+o.userData.woodFinish.offset,point[axes[0]]*scale[axes[0]]];
      maxUVError=Math.max(maxUVError,Math.abs(u.getX(i)-expected[0]),Math.abs(u.getY(i)-expected[1]));
     }
     for(const attr of ['position','normal','uv'])if([...g.attributes[attr].array].some(v=>!Number.isFinite(v)))bad.push(o.name+': nonfinite '+attr);
     if(maxUVError>1e-5)bad.push(o.name+': grain UV '+maxUVError);
     for(const k of ['map','normalMap','roughnessMap']){const t=o.material[k];if(!t?.image?.width)bad.push(o.name+': missing '+k);maps.add(t?.uuid);}
     panels.push({name:o.name,parent:o.parent.name,size,maxUVError});
    }
    if(['sideboard-base-bevel-2','sideboard-drawer-bevel-2','sideboard-upper-extended-door-2','island-prep-worktop','drawer-front','makeup-mirror','makeup-stool-seat','balcony-folding-basin'].includes(o.name))preserved.push({name:o.name,wood:!!o.userData.woodFinish,asset:o.material.userData?.asset||null,metal:o.material.metalness});
   });return {panels,bad,mapCount:maps.size,preserved,mirrors:interiorMirrorsDebug.state.count};
  });
  report.scene=await inventory();assert.deepEqual(report.scene.bad,[]);assert.ok(report.scene.panels.length>100);assert.equal(report.scene.mapCount,3);assert.equal(report.scene.mirrors,6);assert.ok(report.scene.preserved.length>=10);assert.ok(report.scene.preserved.every(o=>!o.wood));
  report.drawer=await page.evaluate(()=>{const d=kitchenDetailsDebug,m=d.moving[0],wood=[];m.traverse(o=>{if(o.userData.woodFinish)wood.push(o);});const before=wood.map(o=>[...o.geometry.attributes.uv.array]),start=m.position.clone();d.setDrawer(0);const distance=start.distanceTo(m.position),unchanged=wood.every((o,i)=>JSON.stringify([...o.geometry.attributes.uv.array])===JSON.stringify(before[i]));d.setDrawer(-1);return {panels:wood.length,distance,unchanged};});
  assert.ok(report.drawer.panels>0&&report.drawer.distance>.1&&report.drawer.unchanged);
  // Rebuilding a master option must preserve material coverage, not duplicate panels.
  await page.evaluate(()=>{document.querySelector('[data-dressing-option="balanced"]').click();});
  const rebuilt=await inventory();assert.deepEqual(rebuilt.bad,[]);assert.equal(rebuilt.panels.length,report.scene.panels.length);
  report.rebuild={panels:rebuilt.panels.length};
  report.views=[];
  for(const [room,object] of [['bed3','bed3-desk'],['master','master-makeup-desk'],['dining','stone-island']]){
   await page.selectOption('#roomSelect',room);await page.locator('#facilities').evaluate(o=>o.open=true);await page.locator(`[data-facility="${object}"]`).click();
   assert.equal(await page.evaluate(()=>columnViewDebug.state.selectedFacility),object);assert.ok(await page.evaluate(()=>columnViewDebug.state.selectedVisible));
   report.views.push({room,object,width:1440});await page.screenshot({path:__dirname+`/oak-detail-${room}-desktop.png`});
  }
  await page.setViewportSize({width:390,height:844});await page.goto(base+'mobile-preview.html?v=oak-panels&space=bed3');
  const frame=page.frames().find(f=>f.url().includes('column-view.html'));assert.ok(frame);await frame.waitForFunction(()=>window.columnViewDebug?.state.ready);
  for(const [room,object] of [['bed3','bed3-desk'],['master','master-makeup-desk'],['dining','stone-island']]){
   await frame.locator('#allPlaces').click();await frame.locator(`[data-place="${room}"]`).click();await frame.locator('#placeDetails').click();await frame.locator(`[data-detail-object="${object}"]`).click();
   assert.equal(await frame.evaluate(()=>columnViewDebug.state.selectedFacility),object);assert.ok(await frame.evaluate(()=>columnViewDebug.state.selectedVisible));
   assert.ok(await frame.evaluate(()=>{let count=0;masterDressingDebug.model.traverse(o=>{if(o.userData.woodFinish&&o.material.map.image.width)count++;});return count>100;}));
   report.views.push({room,object,width:390});if(room==='bed3')await page.screenshot({path:__dirname+'/oak-detail-bed3-mobile.png'});
  }
  assert.deepEqual(errors,[]);report.errors=errors;fs.writeFileSync(__dirname+'/cabinet-finishes-verification.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({unit:report.unit,panels:report.scene.panels.length,bad:report.scene.bad,preserved:report.scene.preserved.length,drawer:report.drawer,rebuild:report.rebuild,views:report.views,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
