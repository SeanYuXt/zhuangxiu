// Export the current shared PC/mobile viewer without rerunning unrelated UI tests.
// Verification remains separate; this only checks that initialization finished.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),crypto=require('node:crypto');
const {packGlb}=require('./pack-glb-images.cjs');
const camerasOnly=process.argv.includes('--cameras-only');
if(camerasOnly&&!fs.existsSync(__dirname+'/offline-render/mobile-current.glb'))throw Error('Camera-only export requires an existing verified scene export');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bar');
 await page.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.interiorMirrorsDebug?.state.count===6);
 const pending=camerasOnly?null:page.waitForEvent('download',{timeout:120000});
 const meta=await page.evaluate(async camerasOnly=>{
  const model=masterDressingDebug.model;livingLayoutDebug.seatsUse.set('stored');model.updateMatrixWorld(true);
  if(!camerasOnly){const {GLTFExporter}=await import('./vendor/render-libs.js');interiorMirrorsDebug.setExportMode(true);
   try{const bytes=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes]));a.download='mobile-current.glb';a.click();}
   finally{interiorMirrorsDebug.setExportMode(false);}
  }
  return {targets:columnViewDebug.state.targets,viewpoints:roomViewsDebug.views,column:columnViewDebug.state.column,seats:columnViewDebug.state.seatAudit};
 },camerasOnly);
 if(errors.length)throw Error(errors.join('\n'));
 const file=__dirname+'/offline-render/mobile-current.glb';let packing=null;if(pending){await (await pending).saveAs(file);const result=packGlb(fs.readFileSync(file));fs.writeFileSync(file,result.bytes);packing=result.report;}fs.writeFileSync(__dirname+'/offline-render/mobile-current-cameras.json',JSON.stringify(meta,null,2));
 console.log(JSON.stringify({exported:!camerasOnly,camerasUpdated:true,bytes:fs.statSync(file).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),packing,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
