// Prevent a decorative cover from hiding unchanged surface sockets or a solid worktop.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bar');await page.waitForFunction(()=>columnViewDebug?.state.ready);
 const result=await page.evaluate(async()=>{const T=await import('./vendor/three.module.js'),m=masterDressingDebug.model,box=o=>new T.Box3().setFromObject(o),core=box(m.getObjectByName('retained-balcony-column').children[0]),finish=box(m.getObjectByName('bar-service-cover'));
  const tops=['left','right'].map(s=>{const b=box(m.getObjectByName('bar-cutout-top-'+s));return {side:s,size:b.getSize(new T.Vector3()).toArray(),overhang:[finish.min.z-b.min.z,b.max.z-finish.max.z],innerGap:s==='left'?finish.min.x-b.max.x:b.min.x-finish.max.x};});
  const wires=[];m.traverse(o=>{if(o.isMesh&&['concealed-front-riser','concealed-front-distributor','concealed-side-channel','concealed-tray-bridge'].includes(o.name)){const b=box(o);if(b.intersectsBox(core))wires.push(o.name);}});
  const record={core:{size:core.getSize(new T.Vector3()).toArray(),min:core.min.toArray(),max:core.max.toArray()},finish:finish.getSize(new T.Vector3()).toArray(),tops,wiresIntersectingCore:wires,oldPlaque:!!m.getObjectByName('power-service-box'),oldBelt:!!m.getObjectByName('under-top-distributor'),closedY:box(m.getObjectByName('bar-power-lid-right')).max.y,metrics:livingLayoutDebug.metrics};
  barPowerDebug.setOpen(true);m.updateMatrixWorld(true);record.rays=['left','right'].map(s=>{const p=m.getObjectByName('bar-power-'+s).position;const ray=new T.Raycaster(new T.Vector3(p.x+.03,1.2,p.z),new T.Vector3(0,-1,0));const h=ray.intersectObject(m,true).find(h=>{for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return true;});return {side:s,hit:h.object.name,y:h.point.y};});barPowerDebug.setOpen(false);
  return record;
 });
 for(const t of result.tops){assert.ok(Math.abs(t.size[0]-1.3)<1e-5);assert.ok(Math.abs(t.size[2]-.56)<1e-5);for(const h of t.overhang)assert.ok(Math.abs(h-.03)<1e-5);assert.ok(Math.abs(t.innerGap)<1e-5);}
 assert.ok(Math.abs(result.core.size[0]-.4)<1e-5&&Math.abs(result.core.size[2]-.45)<1e-5);assert.ok(Math.abs(result.finish[0]-.44)<1e-5&&Math.abs(result.finish[2]-.50)<1e-5);
 assert.deepEqual(result.wiresIntersectingCore,[]);assert.equal(result.oldPlaque,false);assert.equal(result.oldBelt,false);assert.ok(result.closedY<.956);
 assert.ok(result.rays.every(r=>r.hit==='socket-recess-deck'&&r.y<.94));
 await page.screenshot({path:__dirname+'/column-power-mobile-closed.png'});
 await page.locator('#barPowerToggle').click();assert.equal(await page.evaluate(()=>barPowerDebug.open),true);assert.ok(await page.evaluate(()=>columnViewDebug.state.selectedVisible));await page.screenshot({path:__dirname+'/column-power-mobile-open.png'});await page.locator('#barPowerToggle').click();assert.equal(await page.evaluate(()=>barPowerDebug.open),false);
 for(const n of ['bar-power-left','bar-power-right','bar-service-cover']){await page.locator('#placeDetails').click();await page.locator(`[data-detail-object="${n}"]`).click();assert.ok(await page.evaluate(()=>columnViewDebug.state.selectedVisible));}
 await page.setViewportSize({width:1550,height:1000});await page.locator('#roomSelect').selectOption('bar');await page.screenshot({path:__dirname+'/column-power-desktop.png'});
 assert.deepEqual(errors,[]);result.errors=errors;result.limits='Design furniture only; 240mm behind the fully-pulled occupied seat is NOT a passage. Electrical/product/real-body use unverified.';fs.writeFileSync(__dirname+'/column-power-audit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
