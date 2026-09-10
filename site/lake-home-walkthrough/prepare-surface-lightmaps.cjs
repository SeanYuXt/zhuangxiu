const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{packGlb}=require('./pack-glb-images.cjs');
(async()=>{
 const root=__dirname,sourcePath=root+'/offline-render/surface-lighting-v2.glb',metadataPath=root+'/offline-render/surface-lighting-v2-receivers.json';
 assert.ok(!fs.existsSync(sourcePath)&&!fs.existsSync(metadataPath),'Preserve an existing lighting snapshot; do not overwrite');
 const b=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const p=await b.newPage();await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=living');
  await p.waitForFunction(()=>window.columnViewDebug?.state.ready,null,{timeout:90000});
  const download=p.waitForEvent('download',{timeout:120000});
  const data=await p.evaluate(async()=>{
   const {collectSurfaceReceivers,surfaceUv,surfaceSceneSignature}=await import('./surface-lightmaps.js'),{GLTFExporter}=await import('./vendor/render-libs.js');
   const model=masterDressingDebug.model,rows=collectSurfaceReceivers(model),signature=surfaceSceneSignature(model);
   const receivers=rows.map(row=>{
    const o=row.o; o.geometry=o.geometry.clone();o.geometry.setAttribute('uv1',surfaceUv(row));o.userData.surfaceBakeReceiver=row.id;
    return {id:row.id,path:row.path,name:o.name,kind:row.kind,atlas:row.atlas,slot:row.slot,positions:[...o.geometry.attributes.position.array],uv1:[...o.geometry.attributes.uv1.array],matrixWorld:[...o.matrixWorld.elements]};
   });
   if(JSON.stringify(signature)!==JSON.stringify(surfaceSceneSignature(model)))throw Error('UV preparation changed original geometry/material state');
   interiorMirrorsDebug.setExportMode(true);
   try{const bytes=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes]));a.download='surface-lighting-v2.glb';a.click();}finally{interiorMirrorsDebug.setExportMode(false);}
   return {receivers,signature};
  });
  const downloadFile=await download;await downloadFile.saveAs(sourcePath);const packed=packGlb(fs.readFileSync(sourcePath));fs.writeFileSync(sourcePath,packed.bytes);
  fs.writeFileSync(metadataPath,JSON.stringify({sourceSha256:packed.report.sha256,...data},null,2));
  console.log(JSON.stringify({source:packed.report.sha256,bytes:packed.bytes.length,receivers:data.receivers.length,walls:data.receivers.filter(r=>r.kind==='wall').length,atlases:new Set(data.receivers.map(r=>r.atlas)).size,occluders:data.signature.length,originalPayloadsPreserved:true}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
