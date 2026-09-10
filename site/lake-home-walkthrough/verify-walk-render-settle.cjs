// Regression: releasing movement must finish with the full postprocessed image.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const before=process.argv.includes('--before'),phase=before?'before':'after';
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{const raf=requestAnimationFrame;window.rafProbe={scheduled:0,called:0,last:0};window.requestAnimationFrame=callback=>{rafProbe.scheduled++;return raf(t=>{rafProbe.called++;rafProbe.last=performance.now();callback(t);});};});
  await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=entry');
  await p.waitForFunction(()=>window.columnViewDebug?.state.ready,null,{timeout:90000});
  await p.evaluate(async()=>{
   const {EffectComposer}=await import('./vendor/render-libs.js');const original=EffectComposer.prototype.render;
   window.settleProbe={composites:0,lastCompositeDraw:-1};
   EffectComposer.prototype.render=function(...args){settleProbe.composites++;settleProbe.lastCompositeDraw=columnViewDebug.state.draws+1;return original.apply(this,args);};
  });
  await p.locator('header [data-mode="walk"]').click();
  await p.waitForFunction(()=>walkDebug.state.active);
  const start=await p.evaluate(()=>({p:columnViewDebug.state.position,draws:columnViewDebug.state.draws,composites:settleProbe.composites}));
  const key=await p.evaluate(()=>{
   const [x,,z]=columnViewDebug.state.position,yaw=columnViewDebug.state.rotation[1];
   const directions={w:[-Math.sin(yaw),-Math.cos(yaw)],s:[Math.sin(yaw),Math.cos(yaw)],a:[-Math.cos(yaw),Math.sin(yaw)],d:[Math.cos(yaw),-Math.sin(yaw)]};
   return Object.keys(directions).find(key=>[.05,.1,.15,.2,.25].every(t=>walkDebug.free(x+directions[key][0]*t,z+directions[key][1]*t)));
  });assert.ok(key,'A clear quarter-metre route is required for this stop test');
  await p.keyboard.down(key);
  try{await p.waitForFunction(start=>Math.hypot(columnViewDebug.state.position[0]-start[0],columnViewDebug.state.position[2]-start[2])>.02,start.p,{timeout:20000});}
  catch(error){console.log(JSON.stringify({errors,...await p.evaluate(key=>({key,state:walkDebug.state,focus:document.activeElement?.outerHTML,dialog:document.querySelector('dialog[open]')?.id,position:columnViewDebug.state.position,raf:rafProbe,now:performance.now(),visibility:document.visibilityState,draws:columnViewDebug.state.draws}),key)}));throw error;}
  await p.keyboard.up(key);await p.evaluate(()=>new Promise(resolve=>{let n=0;function tick(){if(++n===3)resolve();else requestAnimationFrame(tick);}requestAnimationFrame(tick);}));
  const report=await p.evaluate(start=>({start,end:{p:columnViewDebug.state.position,draws:columnViewDebug.state.draws,composites:settleProbe.composites,lastCompositeDraw:settleProbe.lastCompositeDraw},fullFrameAfterStop:settleProbe.lastCompositeDraw===columnViewDebug.state.draws}),start);
  assert.ok(report.end.draws>start.draws);assert.deepEqual(errors,[]);
  if(before)assert.equal(report.fullFrameAfterStop,false,'Expected to reproduce the missing final composite');else assert.equal(report.fullFrameAfterStop,true,'Stopping walking left a simplified frame');
  await p.screenshot({path:__dirname+'/walk-settle-'+phase+'.png'});
  report.errors=errors;report.gpu=await p.evaluate(()=>{const gl=document.querySelector('#view3d').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'Unavailable';});report.limits='One real keyboard walking/stop cycle in desktop Chrome; not full graphics or physical-phone acceptance.';
  fs.writeFileSync(__dirname+'/walk-settle-'+phase+'.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
