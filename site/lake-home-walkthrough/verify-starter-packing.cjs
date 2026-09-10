// Prevent lossless startup-asset packing from changing the fully refined scene.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),{packGlb}=require('./pack-glb-images.cjs');
(async()=>{
 const root=__dirname,original=fs.readFileSync(root+'/offline-render/home-facilities.glb'),packed=fs.readFileSync(root+'/offline-render/home-facilities-packed.glb');
 const expected=packGlb(original);assert.ok(expected.bytes.equals(packed),'Packed file must reproduce the original losslessly');
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const errors=[],snapshots=[],results=[];
  for(const variant of ['original','packed']){
   const page=await browser.newPage({viewport:{width:1440,height:950}});
   page.on('pageerror',e=>errors.push(e.message));
   if(variant==='original')await page.route('**/home-facilities-packed.glb*',r=>r.fulfill({contentType:'model/gltf-binary',body:original}));
   await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=living');
   await page.waitForFunction(()=>window.columnViewDebug?.state.ready,null,{timeout:90000});
   const snapshot=await page.evaluate(()=>{
    const model=masterDressingDebug.model,rows=[];model.updateMatrixWorld(true);
    const digest=array=>{if(!array)return null;const bytes=new Uint8Array(array.buffer,array.byteOffset,array.byteLength);let h=2166136261;for(const v of bytes)h=Math.imul(h^v,16777619);return [array.length,h>>>0];};
    model.traverse(o=>{
     if(!o.isMesh||o.isReflector||o.userData.runtimeOnly)return;
     const geometry=o.geometry,materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>({type:m.type,name:m.name,color:m.color?.toArray(),roughness:m.roughness,metalness:m.metalness,opacity:m.opacity,side:m.side,maps:['map','normalMap','roughnessMap','metalnessMap','emissiveMap'].map(k=>({kind:k,present:!!m[k],size:m[k]?.image?[m[k].image.width,m[k].image.height]:null,channel:m[k]?.channel,repeat:m[k]?.repeat.toArray()}))}));
     rows.push({name:o.name,visible:o.visible,world:[...o.matrixWorld.elements],attributes:Object.fromEntries(Object.entries(geometry.attributes).map(([k,v])=>[k,digest(v.array)])),index:digest(geometry.index?.array),groups:geometry.groups,materials});
    });return rows;
   });snapshots.push(snapshot);
   await page.screenshot({path:root+'/starter-'+variant+'-living.png'});
   const access=await page.evaluate(()=>{walkDebug.rebuild();return ['entry','cabinet','care','bath1'].map(id=>{const p=columnViewDebug.state.targets[id].position;return {id,blocked:walkDebug.reason(p[0],p[2])};});});
   assert.ok(access.every(a=>!a.blocked));
   results.push({variant,meshes:snapshot.length,access});await page.close();
  }
  assert.deepEqual(snapshots[1],snapshots[0],'All refined mesh payloads, transforms, materials and texture dimensions must match');
  assert.deepEqual(errors,[]);
  const report={...expected.report,savedBytes:original.length-packed.length,savedPercent:Number((100*(1-packed.length/original.length)).toFixed(2)),refinedScenesEqual:true,results,errors,limits:'Exact embedded payload verification plus current desktop scene equivalence; not a real-phone speed/FPS or whole-home visual acceptance.'};
  fs.writeFileSync(root+'/starter-packing-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
