const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:1550,height:1020}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8774/lake-home-walkthrough/kitchen-dining-review.html?v=kitchen-clear-15');await p.waitForFunction(()=>window.diningReview,null,{timeout:60000});
 const f=p.frames().find(f=>f.url().includes('diningStudy'));
 const report=await f.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),d=diningStudy,c=d.diningWall.cabinet,m=columnViewDebug.dryStudy.model;
  const moved=[['sideboard-drawer-contents-0',5],['sideboard-drawer-contents-5',0],['sideboard-lower-contents-0',5],['sideboard-lower-contents-5',0],['sideboard-lower-contents-3',4],['sideboard-lower-contents-4',3]];
  const samples=[];
  for(const fraction of [0,.5,1]){
   sideboardDetailsDebug.setDrawer(5,fraction);m.updateMatrixWorld(true);
   for(const [name,bay] of moved){const o=c.getObjectByName(name),b=new T.Box3().setFromObject(o).applyMatrix4(c.matrixWorld.clone().invert());samples.push({name,bay,fraction,min:b.min.toArray(),max:b.max.toArray(),drawerParent:o.parent.parent.name});}
  }
  sideboardDetailsDebug.reset();m.updateMatrixWorld(true);
  return {samples,items:d.snapshot().serviceItems,storage:c.userData.everydayStorage,table:d.table.position.toArray()};
 });
 // Swapping contents between equal bays must keep each item inside its target bay,
 // including the near drawer's complete travel. No change to exterior joinery.
 for(const s of report.samples){const x=-1.625+s.bay*.65;assert.ok(s.min[0]>=x-.316-.001&&s.max[0]<=x+.316+.001,JSON.stringify(s));const dz=s.name==='sideboard-drawer-contents-0'?s.fraction*.25:0;assert.ok(s.min[2]>=-.28+dz-.001&&s.max[2]<=.098+dz+.001,JSON.stringify(s));}
 assert.ok(report.samples.filter(s=>s.name==='sideboard-drawer-contents-0').every(s=>s.drawerParent==='sideboard-drawer-5'));
 report.distances=await p.evaluate(()=>diningReview.audit.serviceDistances);assert.ok(report.distances.find(o=>o.name==='sideboard-drawer-contents-0').tableEdgeMm<1800);
 const cabinetDistance=await p.locator('#nearest').textContent();
 await p.locator('#storageOpen').click();assert.ok(await f.evaluate(()=>diningStudy.diningWall.state.storageOpen));assert.equal(await p.locator('#nearest').textContent(),cabinetDistance);assert.ok((await p.locator('#routes').textContent()).includes('未计算'));await p.screenshot({path:'dining-near-storage-open.png'});
 await p.locator('#storageOpen').click();await p.locator('[data-mode="plan"]').click();await p.screenshot({path:'ordinary-table-plan.png'});
 await p.locator('[data-view="ensemble"]').click();await p.screenshot({path:'fridge-sideboard-ensemble.png'});
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:'ordinary-table-mobile.png'});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 report.errors=errors;assert.deepEqual(errors,[]);fs.writeFileSync('dining-near-storage-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({storage:report.storage,distances:report.distances,samples:report.samples.length,errors},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
