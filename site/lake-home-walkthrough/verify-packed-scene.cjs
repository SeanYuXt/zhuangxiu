const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),{packGlb}=require('./pack-glb-images.cjs');
(async()=>{
 const packed=packGlb(fs.readFileSync(__dirname+'/offline-render/mobile-current.glb'));
 // Export image buffer-view order may change with asynchronous PNG encoding.
 // Verify this input's own packed bytes, not a historical export's file hash.
 fs.writeFileSync(__dirname+'/offline-render/mobile-packed-verification.glb',packed.bytes);
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 try{
  const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/__pack_check',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>GLB verification</title>'}));
  await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/__pack_check');
  const loaded=await p.evaluate(async()=>{
   const {GLTFLoader}=await import('./vendor/render-libs.js'),{Box3,Vector3}=await import('./vendor/three.module.js');
   const asset=await new GLTFLoader().loadAsync('./offline-render/mobile-packed-verification.glb'),objects={};let meshes=0;
   asset.scene.updateMatrixWorld(true);asset.scene.traverse(o=>{if(o.isMesh)meshes++;});
   for(const name of ['flush-sideboard','integrated-fridge','fridge-cold-interior','sideboard-600mm-worktop','laundry-washer','laundry-dryer']){
    const o=asset.scene.getObjectByName(name);if(!o)throw Error('Missing '+name);objects[name]={size:new Box3().setFromObject(o).getSize(new Vector3()).toArray()};
   }
   let images=0;for(let i=0;i<asset.parser.json.textures.length;i++){const t=await asset.parser.getDependency('texture',i);if(!t.image||!t.image.width||!t.image.height)throw Error('Undecoded texture '+i);images++;}
   return {meshes,objects,decodedTextures:images,sourceImages:asset.parser.json.images.length};
  });
  assert.ok(Math.abs(loaded.objects['sideboard-600mm-worktop'].size[2]-.6)<1e-5);assert.equal(loaded.sourceImages,packed.report.packedImages);assert.deepEqual(errors,[]);
  const report={...packed.report,loaded,errors};fs.writeFileSync(__dirname+'/packed-scene-current-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
