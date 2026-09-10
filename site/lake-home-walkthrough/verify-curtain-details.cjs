const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=master&v=continuous-curtains');await page.waitForFunction(()=>window.curtainDetailsDebug&&columnViewDebug.state.ready,null,{timeout:60000});
 const report=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),m=masterDressingDebug.model,d=curtainDetailsDebug,box=o=>new T.Box3().setFromObject(o);
  const visible=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;},others=[];
  m.updateMatrixWorld(true);m.traverse(o=>{if(!o.isMesh||!visible(o))return;for(let q=o;q;q=q.parent)if(q.userData.continuousCloth)return;
   if(/双眼皮|单眼皮/.test(o.name))return; // Concave ceiling rings are checked by actual surface rays below.
   o.geometry.computeBoundingBox();others.push({o,world:box(o),local:o.geometry.boundingBox.clone(),inverse:o.matrixWorld.clone().invert()});
  });
  const invalid=[],hits=[],lengthErrors=[],states=[],counts={},floor=.006;
  let triangles=0;
  for(const [id,c] of Object.entries(d.rooms)){
   c.root.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;});
   for(let pose=0;pose<=20;pose++){
    c.set(pose/20);m.updateMatrixWorld(true);const leafStates=[];
    for(const leaf of c.leaves){
     const g=leaf.group,mesh=leaf.cloth,p=mesh.geometry.attributes.position,b=box(mesh),ny=32,nx=p.count/(ny+1)-1,len=g.userData.clothLength;
     for(const a of ['position','normal','uv'])if(Array.from(mesh.geometry.attributes[a].array).some(v=>!Number.isFinite(v)))invalid.push(mesh.name+':'+a);
     if(Math.abs(g.userData.sectionLength-len)>1e-6||!g.scale.equals(new T.Vector3(1,1,1)))lengthErrors.push({id,pose,type:'section/scale'});
     const lengths=[];for(const row of [0,16,32]){let length=0;for(let i=1;i<=nx;i++){const a=new T.Vector3().fromBufferAttribute(p,row*(nx+1)+i-1),b=new T.Vector3().fromBufferAttribute(p,row*(nx+1)+i);length+=a.distanceTo(b);}lengths.push(length);if(Math.abs(length-len)/len>.005)lengthErrors.push({id,pose,row,length,expected:len});}
     if(b.min.y<floor+.014)invalid.push(mesh.name+' floor gap');
     // The glider's lower end must actually reach the fabric at each hanger,
     // not leave the previous 6mm air gap. Check every pose and every hook.
     for(const hook of g.children.filter(o=>o.name.includes('-glider-'))){
      const i=Number(hook.name.split('-').pop()),vertex=new T.Vector3().fromBufferAttribute(p,ny*(nx+1)+i*nx/g.userData.folds).applyMatrix4(mesh.matrixWorld),hb=box(hook);
      if(Math.abs(hb.min.y-vertex.y)>1e-5||vertex.x<hb.min.x-1e-6||vertex.x>hb.max.x+1e-6||vertex.z<hb.min.z-1e-6||vertex.z>hb.max.z+1e-6)invalid.push(hook.name+' detached at '+pose);
     }
     const candidates=others.filter(o=>o.world.intersectsBox(b));
     for(const candidate of candidates){let penetration=0;for(let i=0;i<p.count;i++){
      const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld).applyMatrix4(candidate.inverse),q=candidate.local;
      const depth=Math.min(v.x-q.min.x,q.max.x-v.x,v.y-q.min.y,q.max.y-v.y,v.z-q.min.z,q.max.z-v.z);if(depth>.001)penetration=Math.max(penetration,depth);
     }if(penetration)hits.push({room:id,pose,leaf:mesh.name,object:candidate.o.name,penetration});}
     leafStates.push({name:g.name,span:g.userData.span,amplitude:g.userData.amplitude,section:g.userData.sectionLength,rowLengths:lengths,min:b.min.toArray(),max:b.max.toArray()});
    }states.push({id,pose,leaves:leafStates});
   }c.set(0);counts[id]=c.root.children.length;
  }
  d.reset();m.updateMatrixWorld(true);
  const roof=[];m.traverse(o=>{if(o.isMesh&&visible(o)&&/双眼皮|单眼皮/.test(o.name))roof.push(o);});
  const ceilings=[];for(const [id,c] of Object.entries(d.rooms))for(const t of [-.48,0,.48]){const start=c.root.localToWorld(new T.Vector3(c.spec.width*t,c.spec.top,0)),hit=new T.Raycaster(start,new T.Vector3(0,1,0),0,.4).intersectObjects(roof,false)[0];ceilings.push({id,t,hit:hit?.object.name||null,clearance:hit?hit.point.y-(c.spec.top+.040):null});}
  const materials=Object.values(d.rooms).map(c=>{const a=c.leaves[0].cloth.material;return {room:c.spec.id,asset:a.userData.asset,patch:a.userData.patchMetres,repeat:a.map.repeat.toArray(),scan:a.userData.scanSizeMetres,loaded:!!a.map.image?.width,normal:!!a.normalMap.image?.width};});
  const balconyStrip=[];
  for(const fraction of [0,.5,1]){d.set('living',fraction);walkDebug.rebuild();const blocked=[];for(let i=0;i<=72;i++){const x=7.05+i*.05;if(!walkDebug.free(x,.75))blocked.push(x);}balconyStrip.push({fraction,z:.75,fromX:7.05,toX:10.65,blocked});}
  d.reset();walkDebug.rebuild();
  return {triangles,invalid,hits,lengthErrors,states,ceilings,materials,counts,balconyStrip};
 });
 fs.writeFileSync(__dirname+'/curtain-details-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({triangles:report.triangles,invalid:report.invalid,hits:report.hits.slice(0,25),hitCount:report.hits.length,lengthErrors:report.lengthErrors.slice(0,5),ceilings:report.ceilings}));
 assert.deepEqual(report.invalid,[]);assert.deepEqual(report.hits,[]);assert.deepEqual(report.lengthErrors,[]);assert.ok(report.triangles<150000);assert.ok(report.ceilings.every(c=>c.clearance===null||c.clearance>=-.001));
 assert.ok(report.balconyStrip.every(s=>s.blocked.length===0),'curtain must preserve the glass-side game walking strip');
 for(const mat of report.materials){assert.equal(mat.asset,'terlenka');assert.ok(mat.loaded&&mat.normal);mat.repeat.forEach((n,i)=>assert.ok(Math.abs(n-mat.patch[i]/mat.scan[i])<1e-6));}
 report.facilityEntries=[];
 // Exercise the real room-detail entry too; the header button alone would not
 // catch an action lost between mobile detail navigation and facility focus.
 for(const width of [1440,390])for(const id of ['living','bed1','master','bed3']){
  await page.setViewportSize({width,height:width===390?844:1000});
  if(width===390){await page.locator('#allPlaces').click();await page.locator(`[data-place="${id}"]`).click();await page.locator('#placeDetails').click();await page.locator(`[data-detail-object="${id}-curtain"]`).click();}
  else{await page.selectOption('#roomSelect',id);await page.locator('#facilities').evaluate(o=>o.open=true);await page.locator(`[data-facility="${id}-curtain"]`).click();}
  assert.ok(await page.locator('#curtainPanel').isVisible());assert.equal(await page.locator('#curtainRoom').inputValue(),id);
  report.facilityEntries.push({width,id,opened:true});await page.locator('#curtainClose').click();
 }
 report.controls=[];
 for(const [width,height] of [[1440,1000],[390,844],[844,390]]){
  await page.setViewportSize({width,height});if(width<1100)await page.locator('#mobileMenuToggle').click();await page.locator('#curtainToggle').click();
  for(const id of ['living','bed1','master','bed3']){
   await page.selectOption('#curtainRoom',id);
   for(const value of ['0','50','100']){await page.locator(`[data-curtain-pose="${value}"]`).click();assert.equal(await page.evaluate(id=>curtainDetailsDebug.rooms[id].fraction,id),Number(value)/100);}
   await page.locator('[data-curtain-pose="0"]').click();assert.equal(await page.evaluate(()=>columnViewDebug.state.selectedVisible),true,id+' visible');
   const clothVisible=await page.evaluate(id=>{
    const cam=roomViewsDebug.camera;cam.updateMatrixWorld();const c=curtainDetailsDebug.rooms[id];
    return c.leaves.some(l=>{const p=l.cloth.geometry.attributes.position;for(let i=0;i<p.count;i+=17){const v=cam.position.clone().fromBufferAttribute(p,i).applyMatrix4(l.cloth.matrixWorld),ndc=v.clone().project(cam);if(Math.abs(ndc.x)<.88&&Math.abs(ndc.y)<.75&&ndc.z<1&&ndc.z>-1)return true;}return false;});
   },id);assert.ok(clothVisible,id+' fabric must be in view, not only rail');
   const bounds=await page.locator('#curtainPanel').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1&&bounds.y>=0&&bounds.y+bounds.height<=height+1);
   await page.screenshot({path:__dirname+`/curtain-${id}-${width}.png`});report.controls.push({id,width,visible:true,clothInView:clothVisible});
  }await page.locator('#curtainClose').click();
 }
 assert.deepEqual(errors,[]);report.errors=errors;fs.writeFileSync(__dirname+'/curtain-details-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({controls:report.controls,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
