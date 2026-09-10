// Prevent nonfinite fabric meshes, changing furniture footprints, lost lift parenting,
// and exporting vanity metal as mirrors. Actual visual quality needs image inspection.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=master&v=sewn-textiles');
  await page.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.interiorMirrorsDebug?.state.count===6);
  const report=await page.evaluate(async()=>{
   const T=await import('./vendor/three.module.js'),model=masterDressingDebug.model;
   const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
   const parts=[],mirrors=[],materials=new Map();let triangles=0;const invalid=[];
   model.traverse(o=>{
    if(o.userData.surfaceRole==='interior-mirror'&&visible(o))mirrors.push(o.name);
    if(o.isMesh&&o.userData.detailRole==='sewn-textile'&&visible(o)){
     triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
     for(const attr of ['position','normal','uv'])if(o.geometry.attributes[attr]&&Array.from(o.geometry.attributes[attr].array).some(v=>!Number.isFinite(v)))invalid.push(o.name+':'+attr);
     parts.push(o.name);
     const mat=o.material;if(mat.userData.asset&&!materials.has(mat.uuid))materials.set(mat.uuid,{name:mat.name,...mat.userData,maps:['map','roughnessMap','normalMap'].map(k=>({kind:k,ready:!!mat[k]?.image?.width,colorSpace:mat[k]?.colorSpace,repeat:mat[k]?.repeat.toArray(),size:[mat[k]?.image?.width,mat[k]?.image?.height]}))});
    }
   });
   const beds=['bed1-bed','bed3-bed','master-bed'].map(name=>{
    const bed=model.getObjectByName(name),cloth=bed.getObjectByName(name+'-textile-detail');
    let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
    bed.updateWorldMatrix(true,true);const inv=bed.matrixWorld.clone().invert();
    cloth.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;
     for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);minX=Math.min(minX,v.x);maxX=Math.max(maxX,v.x);minZ=Math.min(minZ,v.z);maxZ=Math.max(maxZ,v.z);}
    });
    return {name,parent:cloth.parent.name,bounds:{minX,maxX,minZ,maxZ},frame:bed.userData.frame||bed.userData.bedFrame,pillows:cloth.children.filter(o=>o.userData.detailRole==='sewn-cushion').length};
   });
   const beddingProfiles=['bed1-bed','bed3-bed','master-bed'].map(name=>{
    const bed=model.getObjectByName(name),top=bed.getObjectByName(name+'-draped-duvet').geometry.attributes.position,lining=bed.getObjectByName(name+'-draped-duvet-lining').geometry.attributes.position;
    const thickness=[];let horizontalDrift=0;for(let i=0;i<top.count;i++){thickness.push(Math.hypot(top.getX(i)-lining.getX(i),top.getY(i)-lining.getY(i),top.getZ(i)-lining.getZ(i)));horizontalDrift=Math.max(horizontalDrift,Math.hypot(top.getX(i)-lining.getX(i),top.getZ(i)-lining.getZ(i)));}
    const pillows=[];bed.traverse(o=>{if(o.userData.detailRole==='sewn-cushion')pillows.push(o.userData.dimensions);});
    return {name,minThickness:Math.min(...thickness),maxThickness:Math.max(...thickness),horizontalDrift,pillows};
   });
   const sofa=model.getObjectByName('linen-sofa');sofa.updateWorldMatrix(true,true);const outline=new T.Box3();sofa.children.slice(0,8).forEach(o=>outline.union(new T.Box3().setFromObject(o)));
   const scatters=sofa.children.filter(o=>o.userData.detailRole==='reference-cushion').map(root=>{
    const cover=root.children[0],a=cover.geometry.attributes.position,box=new T.Box3().setFromObject(root),seats=sofa.children.filter(o=>o.name.startsWith('sofa-sewn-seat-'));let clearance=Infinity;
    for(let i=0;i<a.count;i++){const v=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(cover.matrixWorld);const hit=new T.Raycaster(new T.Vector3(v.x,2,v.z),new T.Vector3(0,-1,0)).intersectObjects(seats,true)[0];if(hit)clearance=Math.min(clearance,v.y-hit.point.y);}
    return {name:root.name,...root.userData,clearance,insideOutline:box.min.x>=outline.min.x&&box.max.x<=outline.max.x&&box.min.z>=outline.min.z&&box.max.z<=outline.max.z,axisScales:[0,1,2].map(i=>new T.Vector3().setFromMatrixColumn(cover.matrixWorld,i).length())};
   });
   return {parts,triangles,invalid,beds,beddingProfiles,mirrors,scatters,materials:[...materials.values()],layout:livingLayoutDebug.metrics};
  });
  assert.deepEqual(report.invalid,[]);assert.ok(report.triangles<100000,'Textile geometry exceeds mobile detail budget');
  assert.deepEqual([...new Set(report.materials.map(m=>m.asset))].sort(),['cotton_jersey','terlenka']);for(const m of report.materials)for(const t of m.maps){assert.equal(t.ready,true,m.name+' '+t.kind);assert.equal(t.colorSpace,t.kind==='map'?'srgb':'');assert.ok(t.repeat.every((v,i)=>Math.abs(v-m.patchMetres[i]/m.scanSizeMetres[i])<1e-6),'physical scan repeat');}
  assert.equal(report.scatters.length,2);for(const s of report.scatters){assert.equal(s.insideOutline,true,'pillow widens sofa');assert.ok(s.axisScales.every(v=>Math.abs(v-1)<1e-6),'sofa scale must not distort pillow mesh');assert.ok(s.clearance>=-.003&&s.clearance<.002,JSON.stringify(s));}
  assert.equal(report.beds.map(b=>b.pillows).join(','),'2,1,2');
  // This profile includes a local filled fold crest, not uniform duvet thickness.
  // The observed elder crest is 80.24mm. This candidate uses an 85mm upper
  // envelope; it is not a measured or selected bedding product specification.
  for(const p of report.beddingProfiles){assert.ok(p.minThickness>=.0059&&p.maxThickness>.04&&p.maxThickness<.085,JSON.stringify(p));assert.ok(p.horizontalDrift>=.0059&&p.horizontalDrift<.015,'Draped sides need a real inward/outward lining, not coincident vertical planes');assert.ok(p.pillows.every(d=>Math.abs(d[1]-.20)<1e-6));}
  for(const b of report.beds){assert.ok(b.bounds.maxX<=b.frame[0]/2+.003&&b.bounds.minX>=-b.frame[0]/2-.003,b.name+' fabric widens frame');}
  assert.deepEqual(report.beds.slice(0,2).map(b=>b.parent),['bed1-bed-lift','bed3-bed-lift']);
  assert.equal(report.mirrors.length,6);assert.ok(report.mirrors.every(n=>!/(faucet|valve|drain|pump)/i.test(n)));
  assert.ok(Math.abs(report.layout.islandToSofa-1.05)<1e-5);assert.ok(Math.abs(report.layout.sofaToCoffee-.45)<1e-5);
  for(const room of ['master','living']){await page.locator('#roomSelect').selectOption(room);await page.screenshot({path:__dirname+'/textile-'+room+'-desktop.png'});}
  await page.setViewportSize({width:390,height:844});await page.locator('[data-quick-room="master"]').click();await page.screenshot({path:__dirname+'/textile-master-mobile.png'});
  report.detailViews=[];for(const [width,height] of [[1440,1000],[390,844]])for(const room of ['master','bed1','bed3','living']){
   const object=room==='living'?'sofa-sewn-scatter-0':room==='master'?'master-bed-sewn-pillow-0':room+'-bed-sewn-pillow-0';await page.setViewportSize({width,height});
   if(width<800){await page.locator('#allPlaces').click();await page.locator(`[data-place="${room}"]`).click();await page.locator('#placeDetails').click();await page.locator(`[data-detail-object="${object}"]`).click();}
   else{await page.selectOption('#roomSelect',room);await page.locator('#viewerDetailToggle').click();await page.locator('#facilities').evaluate(o=>o.open=true);await page.locator(`[data-facility="${object}"]`).click();}
   const s=await page.evaluate(()=>columnViewDebug.state);assert.equal(s.selectedFacility,object);assert.ok(s.selectedVisible,room+' textile not visible');report.detailViews.push({room,width,visible:true});
   if(room==='living'||room==='master')await page.screenshot({path:__dirname+`/textile-close-${room}-${width}.png`});
  }
  if(!process.argv.includes('--no-export')){
   const pending=page.waitForEvent('download',{timeout:120000});
   await page.evaluate(async()=>{
    const {GLTFExporter}=await import('./vendor/render-libs.js');const model=masterDressingDebug.model;
    model.updateMatrixWorld(true);interiorMirrorsDebug.setExportMode(true);
    try{const bytes=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});
     const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes]));a.download='mobile-current.glb';a.click();
    }finally{interiorMirrorsDebug.setExportMode(false);}
   });
   await (await pending).saveAs(__dirname+'/offline-render/mobile-current.glb');
   const meta=await page.evaluate(()=>({targets:columnViewDebug.state.targets,viewpoints:roomViewsDebug.views,column:columnViewDebug.state.column,seats:columnViewDebug.state.seatAudit}));
   fs.writeFileSync(__dirname+'/offline-render/mobile-current-cameras.json',JSON.stringify(meta,null,2));
  }
  assert.deepEqual(errors,[]);report.errors=errors;report.exported=!process.argv.includes('--no-export');
  fs.writeFileSync(__dirname+'/textile-detail-verification.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify({triangles:report.triangles,parts:report.parts.length,beds:report.beds,mirrors:report.mirrors,errors,exported:report.exported}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
