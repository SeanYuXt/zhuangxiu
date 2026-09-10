const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{packGlb,readGlb}=require('./pack-glb-images.cjs');
(async()=>{
 if(process.argv.includes('--receiver-transforms-only')){
  const T=await import('./vendor/three.module.js'),bytes=fs.readFileSync(__dirname+'/offline-render/daylight-bake-source.glb'),j=readGlb(bytes).json,metadataPath=__dirname+'/offline-render/daylight-bake-receivers.json',manifestPath=__dirname+'/assets/lightmaps-child-v1/manifest.json',metadata=JSON.parse(fs.readFileSync(metadataPath)),manifest=JSON.parse(fs.readFileSync(manifestPath));
  const hash=crypto.createHash('sha256').update(bytes).digest('hex');assert.equal(metadata.sourceSha256,hash);assert.equal(manifest.sourceSha256,hash);
  const found=new Map();function visit(index,parent){const n=j.nodes[index],local=n.matrix?new T.Matrix4().fromArray(n.matrix):new T.Matrix4().compose(new T.Vector3(...(n.translation||[0,0,0])),new T.Quaternion(...(n.rotation||[0,0,0,1])),new T.Vector3(...(n.scale||[1,1,1]))),world=parent.clone().multiply(local);if(n.extras?.daylightBakeReceiver)found.set(n.extras.daylightBakeReceiver,[...world.elements]);for(const child of n.children||[])visit(child,world);}
  for(const index of j.scenes[j.scene||0].nodes)visit(index,new T.Matrix4());
  for(const data of [metadata,manifest])for(const row of data.receivers){assert.ok(found.has(row.name));row.matrixWorld=found.get(row.name);}
  fs.writeFileSync(metadataPath,JSON.stringify(metadata,null,2));fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));console.log(JSON.stringify({source:hash,receivers:[...found.keys()],imagesUnchanged:true}));return;
 }
 const b=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});try{
 const p=await b.newPage();await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bed3');await p.waitForFunction(()=>window.columnViewDebug?.state.ready);
 const download=p.waitForEvent('download',{timeout:120000});
 const receivers=await p.evaluate(async()=>{
  const {wallBakeUv,wallBakeReceivers}=await import('./baked-wall-study.js'),{GLTFExporter}=await import('./vendor/render-libs.js'),model=masterDressingDebug.model,rows=[];
  for(const name of wallBakeReceivers){const o=model.getObjectByName(name);if(!o||o.geometry.attributes.position.count!==24)throw Error('Expected inspected wall box '+name);o.geometry=o.geometry.clone();o.geometry.setAttribute('uv1',wallBakeUv(o.geometry));o.userData.daylightBakeReceiver=name;rows.push({name,positions:[...o.geometry.attributes.position.array],uv1:[...o.geometry.attributes.uv1.array],matrixWorld:[...o.matrixWorld.elements]});}
  interiorMirrorsDebug.setExportMode(true);try{const bytes=await new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes]));a.download='daylight-bake-source.glb';a.click();}finally{interiorMirrorsDebug.setExportMode(false);}return rows;
 });
 const file=__dirname+'/offline-render/daylight-bake-source.glb';await (await download).saveAs(file);const result=packGlb(fs.readFileSync(file));fs.writeFileSync(file,result.bytes);fs.writeFileSync(__dirname+'/offline-render/daylight-bake-receivers.json',JSON.stringify({sourceSha256:result.report.sha256,receivers},null,2));console.log(JSON.stringify(result.report));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
