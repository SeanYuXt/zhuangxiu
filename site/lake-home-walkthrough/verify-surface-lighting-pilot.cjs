// Compare one higher-sample atlas in an isolated browser, never replace production assets.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
(async()=>{
 const root=__dirname,baseline=JSON.parse(fs.readFileSync(root+'/assets/surface-lighting-v2/manifest.json')),pilot=JSON.parse(fs.readFileSync(root+'/offline-render/surface-lighting-pilot-128/manifest.json'));
 assert.equal(pilot.sourceSha256,baseline.sourceSha256);assert.equal(pilot.samples,128);assert.equal(pilot.atlases.length,1);assert.equal(pilot.atlases[0].index,3);assert.equal(pilot.complete,false);
 const atlas=pilot.atlases[0],bytes=fs.readFileSync(root+'/offline-render/surface-lighting-pilot-128/'+atlas.file);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),atlas.sha256);
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const results=[];
  for(const usePilot of [false,true]){
   const p=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
   if(usePilot){
    await p.route('**/assets/surface-lighting-v2/manifest.json',r=>r.fulfill({json:{...baseline,atlases:baseline.atlases.map(a=>a.index===3?atlas:a),pilot:{index:3,samples:128,pipelineSha256:pilot.pipelineSha256}}}));
    await p.route('**/assets/surface-lighting-v2/atlas-3.hdr',r=>r.fulfill({body:bytes,contentType:'application/octet-stream'}));
   }
   await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bed3&daylight=surface-baked');
   await p.waitForFunction(()=>window.surfaceLightmapsDebug?.ready,null,{timeout:120000});
   assert.ok(await p.evaluate(()=>surfaceLightmapsDebug.state.active));
   for(const id of ['child-study','child-bed']){
    const before=await p.evaluate(()=>columnViewDebug.state.draws);await p.evaluate(id=>roomViewsDebug.select(id),id);
    await p.waitForFunction(n=>columnViewDebug.state.draws>n,before);
    const image=`surface-pilot-${usePilot?'128':'24'}-${id}.png`;await p.screenshot({path:root+'/'+image});results.push({samples:usePilot?128:24,id,image,state:await p.evaluate(()=>surfaceLightmapsDebug.state)});
   }
   assert.deepEqual(errors,[]);await p.close();
  }
  const report={results,pilotOnly:true,promoted:false,limits:'Atlas 3 only; remaining four atlases remain 24 samples. Screenshots require visual review, not automatic quality acceptance.'};fs.writeFileSync(root+'/surface-lighting-pilot-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
