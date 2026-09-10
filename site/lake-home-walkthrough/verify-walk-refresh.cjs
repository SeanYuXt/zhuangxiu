// Cached collision refresh must match the original full rebuild after every
// mutation, while doing no broad-phase work for an unchanged scene or a modal.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=walk-refresh&space=entry&mode=walk');await page.waitForFunction(()=>window.walkDebug?.state.active);
 const report=await page.evaluate(async()=>{
  const d=walkDebug,m=masterDressingDebug.model,T=await import('./vendor/three.module.js'),states=[];
  d.rebuild();const initial=d.state.stamp,stable=[];
  for(let i=0;i<24;i++){const start=performance.now();if(d.refreshCollisionState())throw Error('Static scene unexpectedly rebuilt');stable.push(performance.now()-start);}
  if(d.state.stamp!==initial)throw Error('Static refresh changed rebuild stamp');
  const full=[];for(let i=0;i<12;i++){const start=performance.now();d.rebuild();full.push(performance.now()-start);}
  const reference=name=>{const refreshed=d.refreshCollisionState(),actual=JSON.stringify(d.obstacles),before=d.state.stamp;d.rebuild();const expected=JSON.stringify(d.obstacles);if(actual!==expected)throw Error('Cached mismatch: '+name);states.push({name,refreshed,count:d.obstacles.length,stamp:before});};
  const sofa=m.getObjectByName('linen-sofa'),x=sofa.position.x;sofa.position.x+=.11;reference('sofa transform');sofa.position.x=x;reference('sofa restored');
  publicBathDetailsDebug.setShower(true);reference('folding shower door');publicBathDetailsDebug.reset();reference('shower reset');
  entryRevisionDebug.setOpen(true);reference('six shoe doors');entryRevisionDebug.setOpen(false);reference('shoe doors reset');
  const test=new T.Mesh(new T.BoxGeometry(.2,.5,.2),new T.MeshBasicMaterial());test.name='collision-refresh-probe';test.position.set(8,.5,5);m.add(test);reference('mesh added');
  test.visible=false;reference('mesh hidden');test.visible=true;reference('mesh shown');test.userData.walkThrough=true;reference('walkThrough true');test.userData.walkThrough=false;reference('walkThrough false');
  const oldGeometry=test.geometry;test.geometry=new T.BoxGeometry(.3,.5,.2);reference('geometry replaced');oldGeometry.dispose();
  test.removeFromParent();test.geometry.dispose();test.material.dispose();reference('mesh removed');
  const median=a=>[...a].sort((a,b)=>a-b)[Math.floor(a.length/2)];return {states,stableMedianMs:median(stable),fullMedianMs:median(full),stableSamples:stable.length,fullSamples:full.length,unchangedRebuilds:0};
 });
 assert.ok(report.states.every(s=>s.refreshed),'A changed mesh or flag failed to trigger rebuilding');
 await page.evaluate(()=>renderGalleryDebug.open('entry'));await page.waitForFunction(()=>renderGalleryDebug.state.loaded);const before=await page.evaluate(()=>({stamp:walkDebug.state.stamp,position:walkDebug.state.position}));
 await page.keyboard.press('w');await page.waitForTimeout(800);const after=await page.evaluate(()=>({stamp:walkDebug.state.stamp,position:walkDebug.state.position}));assert.deepEqual(after,before,'Modal failed to pause walking/rebuild');
 await page.locator('#detailRender [aria-label="关闭高清效果"]').click();assert.ok(await page.evaluate(()=>walkDebug.state.active));assert.deepEqual(errors,[]);
 fs.writeFileSync(__dirname+'/walk-refresh-verification.json',JSON.stringify({...report,modalPaused:true,errors},null,2));console.log(JSON.stringify({...report,modalPaused:true,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
