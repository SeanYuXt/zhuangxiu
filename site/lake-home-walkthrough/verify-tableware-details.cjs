// Prevent decorative replacements from closing cup mouths, floating, leaving the
// island/tray footprint or breaking shared desktop/mobile object selection.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=hollow-tableware&space=dining');await page.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.tablewareDetailsDebug);
 const result=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),model=masterDressingDebug.model,d=tablewareDetailsDebug;
  model.updateMatrixWorld(true);const b=o=>new T.Box3().setFromObject(o),invalid=[],cups=[],plates=[];
  let triangles=0,meshes=0;
  for(const root of [d.dining,d.tea])root.traverse(o=>{if(!o.isMesh)return;meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;
   for(const key of ['position','normal'])if([...o.geometry.attributes[key].array].some(v=>!Number.isFinite(v)))invalid.push(o.name+':'+key);
  });
  const ray=new T.Raycaster();
  for(const id of ['dining-cup-0','dining-cup-1','tea-cup-0','tea-cup-1']){
   const cup=model.getObjectByName(id),p=cup.getWorldPosition(new T.Vector3()),rim=b(cup).max.y;
   ray.set(new T.Vector3(p.x,rim+.03,p.z),new T.Vector3(0,-1,0));
   const hit=ray.intersectObject(cup,true)[0];cups.push({id,rim,inside:hit?.point.y,depth:hit?rim-hit.point.y:null,filled:cup.userData.filled});
  }
  for(const id of ['dinner-plate-0','dinner-plate-1']){
   const o=model.getObjectByName(id),p=o.getWorldPosition(new T.Vector3());ray.set(new T.Vector3(p.x,1.1,p.z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(o,true)[0];plates.push({id,depth:b(o).max.y-hit.point.y});
  }
  const table=b(model.getObjectByName('island-prep-worktop')),set=b(d.dining),tea=b(d.tea),bar=b(model.getObjectByName('bar-cutout-top-right'));
  const inside=(a,c)=>a.min.x>=c.min.x-.001&&a.max.x<=c.max.x+.001&&a.min.z>=c.min.z-.001&&a.max.z<=c.max.z+.001;
  const before=d.dining.uuid;const {refineTableware}=await import('./tableware-details.js');refineTableware(model);
  return {invalid,cups,plates,meshes,triangles,stored:d.storedCount,insideIsland:inside(set,table),insideBar:inside(tea,bar),tableTop:table.max.y,settingBottom:set.min.y,teaBottom:tea.min.y,barTop:bar.max.y,idempotent:before===model.getObjectByName('dining-table-settings').uuid,tableBounds:{min:table.min.toArray(),max:table.max.toArray()},teaBounds:{min:tea.min.toArray(),max:tea.max.toArray()}};
 });
 assert.deepEqual(result.invalid,[]);assert.equal(result.stored,16);assert.ok(result.insideIsland&&result.insideBar&&result.idempotent);assert.ok(result.settingBottom>=result.tableTop&&result.settingBottom-result.tableTop<.003);
 for(const c of result.cups)assert.ok(c.depth>(c.filled?.009:.07),JSON.stringify(c));
 for(const p of result.plates)assert.ok(p.depth>.014,JSON.stringify(p));
 const shots=[];
 for(const [width,height] of [[1440,1000],[390,844]]){
  await page.setViewportSize({width,height});
  if(width===390){await page.locator('#allPlaces').click();await page.locator('[data-place="dining"]').click();await page.locator('#placeDetails').click();await page.locator('[data-detail-object="dining-table-settings"]').click();}
  else{if(!await page.locator('#facilities').evaluate(d=>d.open))await page.locator('#facilities summary').click();await page.locator('[data-facility="dining-table-settings"]').click();}
  assert.ok(await page.evaluate(()=>columnViewDebug.state.selectedVisible));
  const path=`tableware-dining-${width}.png`;await page.screenshot({path:__dirname+'/'+path});shots.push(path);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(__dirname+'/tableware-details-verification.json',JSON.stringify({...result,shots,errors},null,2));console.log(JSON.stringify({...result,shots,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
