const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
(async()=>{
 const data=JSON.parse(fs.readFileSync(__dirname+'/offline-render/furniture-vertex-pilot.json'));
 assert.equal(data.sourceSha256,crypto.createHash('sha256').update(fs.readFileSync(__dirname+'/offline-render/mobile-current.glb')).digest('hex'));
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:950}}),errors=[],shots=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/shader|WebGL/i.test(m.text()))errors.push(m.text());});
  await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bed3');
  await p.waitForFunction(()=>window.columnViewDebug?.state.ready,null,{timeout:90000});
  for(const stage of ['original','pilot']){
   if(stage==='pilot')await p.evaluate(async data=>{const {applyFurnitureVertexPilot}=await import('./furniture-vertex-lighting-pilot.js');window.furnitureVertexPilot=applyFurnitureVertexPilot(masterDressingDebug.model,data);},data);
   for(const id of ['child-study','child-bed']){
    const draws=await p.evaluate(()=>columnViewDebug.state.draws);await p.evaluate(id=>roomViewsDebug.select(id),id);await p.waitForFunction(n=>columnViewDebug.state.draws>n,draws);
    const file=`furniture-vertex-${stage}-${id}.png`;await p.screenshot({path:__dirname+'/'+file});shots.push({stage,id,file});
   }
  }
  const receivers=await p.evaluate(()=>furnitureVertexPilot.entries.map(e=>({name:e.o.name,vertices:e.vertices,maxPositionError:e.maxPositionError,samePositions:e.o.geometry.attributes.position.array.every((v,i)=>v===e.originalGeometry.attributes.position.array[i])})));
  assert.ok(receivers.every(r=>r.samePositions&&r.maxPositionError<.0001));assert.deepEqual(errors,[]);
  const report={receivers,shots,errors,promoted:false,limits:'Five-mesh visual trial, static lighting only. Requires image review; no whole-home, dynamic or phone-quality acceptance.'};fs.writeFileSync(__dirname+'/furniture-vertex-pilot-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
