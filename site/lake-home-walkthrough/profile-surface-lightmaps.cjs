// Same-scene CPU guard timing. This is not a physical-phone or GPU FPS test.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const label=process.argv[2];assert.match(label||'',/^[a-z0-9-]+$/);
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=entry&daylight=surface-baked');
  await p.waitForFunction(()=>window.surfaceLightmapsDebug?.ready,null,{timeout:120000});
  const report=await p.evaluate(()=>{
   const d=surfaceLightmapsDebug;if(!d.state.active)throw Error(JSON.stringify(d.state));
   for(let i=0;i<12;i++)d.update();
   const times=[];for(let i=0;i<80;i++){const start=performance.now();d.update();times.push(performance.now()-start);}
   times.sort((a,b)=>a-b);
   return {state:d.state,iterations:times.length,medianMs:times[40],p95Ms:times[76],meanMs:times.reduce((s,v)=>s+v,0)/times.length,textures:d.textures.map(t=>({width:t.image.width,height:t.image.height,bytes:t.image.data.byteLength})),guard:d.guardStats||null};
  });
  if(process.argv.includes('--mutations')){
   report.mutations=await p.evaluate(()=>{
    const d=surfaceLightmapsDebug,results=[];
    function check(name,change,restore){change();d.update();const rejected=!d.state.active;restore();d.update();results.push({name,rejected,restored:d.state.active});}
    const entry=d.entries[0],geometry=entry.o.geometry,normal=geometry.attributes.normal;
    check('normal attribute replacement',()=>geometry.setAttribute('normal',normal.clone()),()=>geometry.setAttribute('normal',normal));
    check('receiver visibility',()=>{entry.o.visible=false;},()=>{entry.o.visible=true;});
    const opacity=entry.original.opacity;
    check('material opacity',()=>{entry.o.material.opacity=.6;},()=>{entry.original.opacity=opacity;});
    const mapped=d.entries.find(e=>e.original.map);if(!mapped)throw Error('Expected mapped tile surface');
    const texture=mapped.original.map,offset=texture.offset.x;
    check('texture offset',()=>{texture.offset.x+=.13;},()=>{texture.offset.x=offset;});
    return results;
   });assert.ok(report.mutations.every(r=>r.rejected&&r.restored),JSON.stringify(report.mutations));
  }
  assert.deepEqual(errors,[]);
  report.errors=errors;report.limits='Guard CPU timing in desktop headless Chrome, not frame rate or physical phone evidence.';
  fs.writeFileSync(__dirname+'/surface-guard-'+label+'.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
