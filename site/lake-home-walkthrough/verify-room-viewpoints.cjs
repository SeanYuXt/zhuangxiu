// Catch blocked standpoints, missing/occluded subjects, mismatched projections,
// or room-angle controls disappearing on PC/phone. Not a photo-realism certificate.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 const report={views:[],interfaces:[],errors:[],limits:['230mm game proxy, not installation/human-body certification','Sampled surface visibility, not complete photographic composition','Viewport simulation, not physical phone performance']};
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=master');
  await page.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.roomViewsDebug);
  const views=await page.evaluate(()=>roomViewsDebug.views);
  for(const view of views){
   await page.evaluate(id=>roomViewsDebug.select(id),view.id);
   const record=await page.evaluate(async view=>{
    const T=await import('./vendor/three.module.js'),{roomViewFov}=await import('./room-viewpoints.js'),model=masterDressingDebug.model,camera=roomViewsDebug.camera;
    model.updateMatrixWorld(true);camera.updateMatrixWorld(true);walkDebug.refreshCollisionState();
    const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
    const glass=o=>{const ms=Array.isArray(o.material)?o.material:[o.material];return ms.every(m=>m&&(m.transmission>.2||(m.transparent&&m.opacity<.65)));};
    const solids=[];model.traverse(o=>{if(o.isMesh&&visible(o)&&!glass(o))solids.push(o);});
    const ray=new T.Raycaster(),world=new T.Vector3(),local=new T.Vector3(),subjects=[];
    for(const name of view.subjects){
     const root=model.getObjectByName(name),meshes=[];root?.traverse(o=>{if(o.isMesh&&visible(o))meshes.push(o);});
     let samples=0,inFrame=0,unobscured=0;const occluders={};
     for(const mesh of meshes){
      const pos=mesh.geometry.attributes.position,index=mesh.geometry.index,count=Math.floor((index?.count||pos.count)/3),step=Math.max(1,Math.ceil(count/Math.max(3,Math.floor(180/meshes.length))));
      for(let triangle=0;triangle<count;triangle+=step){
       local.set(0,0,0);for(let j=0;j<3;j++){const k=triangle*3+j;world.fromBufferAttribute(pos,index?index.getX(k):k);local.add(world);}local.multiplyScalar(1/3).applyMatrix4(mesh.matrixWorld);samples++;
       const projected=local.clone().project(camera);if(Math.abs(projected.x)>.96||Math.abs(projected.y)>.96||projected.z< -1||projected.z>1)continue;inFrame++;
       const distance=camera.position.distanceTo(local);ray.set(camera.position,local.clone().sub(camera.position).normalize());ray.near=.03;ray.far=distance+.003;
       const first=ray.intersectObjects(solids,false)[0];
       if(!first||first.distance>=distance-.005){unobscured++;continue;}
       let belongs=false;for(let p=first.object;p;p=p.parent)if(p===root)belongs=true;
       if(belongs)unobscured++;else occluders[first.object.name]=(occluders[first.object.name]||0)+1;
      }
     }
     subjects.push({name,exists:!!root,samples,inFrame,unobscured,occluders:Object.entries(occluders).sort((a,b)=>b[1]-a[1]).slice(0,3)});
    }
    return {id:view.id,room:view.room,blockedBy:walkDebug.reason(view.position[0],view.position[2]),subjects,position:camera.position.toArray(),fov:camera.fov,expectedFov:roomViewFov(view,camera.aspect),clipPlanes:columnViewDebug.state.clipPlanes,roofVisible:columnViewDebug.state.roofVisible};
   },view);report.views.push(record);
   console.log(JSON.stringify({id:view.id,blockedBy:record.blockedBy,subjects:record.subjects.map(s=>({name:s.name,visible:s.unobscured,occluders:s.occluders}))}));
   if(['master-dressing','master-entry-storage','child-study','ensuite-basin','public-squat','public-ceiling','ensuite-ceiling','dining-sideboard','balcony-care'].includes(view.id))await page.screenshot({path:__dirname+'/room-angle-'+view.id+'-1440.png'});
  }
  for(const size of [[1440,1000],[390,844],[844,390]]){
   await page.setViewportSize({width:size[0],height:size[1]});
   const compact=size[0]<=800||size[0]<=1100&&size[1]<=550;
   for(const view of views){
    await page.evaluate(room=>{document.querySelector('#roomSelect').value=room;document.querySelector('#roomSelect').dispatchEvent(new Event('change'));},view.room);
    if(compact)await page.locator('#placeDetails').click();else await page.locator('#facilities').evaluate(d=>d.open=true);
    const scope=compact?'#placeSheet':'#facilityList';await page.locator(`${scope} [data-room-view="${view.id}"]`).click();
    const state=await page.evaluate(()=>({active:roomViewsDebug.active,station:columnViewDebug.state.station,clip:columnViewDebug.state.clipPlanes,position:roomViewsDebug.camera.position.toArray()}));
    assert.equal(state.active,view.id);assert.equal(state.station,view.room);assert.deepEqual(state.position,view.position);assert.equal(state.clip,0);
   }
   report.interfaces.push({viewport:size,angles:views.length});
   await page.evaluate(()=>roomViewsDebug.select('child-study'));await page.screenshot({path:__dirname+`/room-angle-child-study-${size[0]}x${size[1]}.png`});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  // Angle selection -> actual walk starts in the same XZ, without nearest-point teleport.
  await page.setViewportSize({width:1440,height:1000});
  for(const id of ['master-dressing','child-study','ensuite-basin','public-squat','kitchen-wash']){
   await page.evaluate(id=>roomViewsDebug.select(id),id);const before=await page.evaluate(()=>columnViewDebug.state.position);
   await page.locator('[data-mode="walk"]').first().click();const after=await page.evaluate(()=>({active:walkDebug.state.active,p:walkDebug.state.position}));
   assert.ok(after.active);assert.ok(Math.hypot(after.p[0]-before[0],after.p[2]-before[2])<1e-7,id+' moved to a different standing point');
   await page.locator('#walkExit').click();
  }
  const metadata=await page.evaluate(()=>({targets:columnViewDebug.state.targets,viewpoints:roomViewsDebug.views,column:columnViewDebug.state.column,seats:columnViewDebug.state.seatAudit}));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/mobile-preview.html?angle=child-study&v=room-angles');
  const frame=await (await page.locator('iframe').elementHandle()).contentFrame();
  await frame.waitForFunction(()=>window.columnViewDebug?.state.ready&&roomViewsDebug.active==='child-study');
  assert.equal(await frame.evaluate(()=>columnViewDebug.state.station),'bed3');
  await frame.locator('#placeDetails').click();await frame.locator('#placeSheet [data-room-view="child-storage"]').click();
  assert.equal(await frame.evaluate(()=>roomViewsDebug.active),'child-storage');report.wrapperDeepLink=true;
  const failures=report.views.filter(v=>v.blockedBy||v.clipPlanes||!v.roofVisible||Math.abs(v.fov-v.expectedFov)>1e-8||v.subjects.some(s=>!s.exists||!s.unobscured));
  report.failures=failures.map(v=>v.id);report.modelSha256=crypto.createHash('sha256').update(fs.readFileSync(__dirname+'/offline-render/mobile-current.glb')).digest('hex');
  fs.writeFileSync(__dirname+'/room-viewpoints-verification.json',JSON.stringify(report,null,2));
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failures,[],'Room view must show its named subject from an unblocked position');
  fs.writeFileSync(__dirname+'/offline-render/mobile-current-cameras.json',JSON.stringify(metadata,null,2));
  console.log(JSON.stringify({views:report.views.length,interfaces:report.interfaces,failures:report.failures,errors:report.errors,modelSha256:report.modelSha256}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
