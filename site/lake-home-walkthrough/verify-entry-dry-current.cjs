// Current applied design, not old index.html or an isolated candidate.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=entry');await page.waitForFunction(()=>window.columnViewDebug?.state.ready);
 const report=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{addSkirting}=await import('./finish-details.js'),{walls,P}=await import('./plan.js'),m=masterDressingDebug.model,s=columnViewDebug.dryStudy.spec;
  const bounds=o=>new T.Box3().setFromObject(o),overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>.001);
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const cabinet=m.getObjectByName('flush-entry-cabinet'),bench=bounds(m.getObjectByName('entry-shoe-bench')),vanity=bounds(m.getObjectByName('bath1-vanity'));
  const panels=entryRevisionDebug.leaves.map(x=>x.pivot.children.find(c=>c.name.includes('-leaf-'))),staticMeshes=[];
  cabinet.traverse(o=>{if(o.isMesh&&visible(o)&&!o.name.startsWith('entry-door-')&&!['entry-recessed-finger-edge','entry-cabinet-hinge-envelope'].includes(o.name))staticMeshes.push(o);});
  const clashes=[];
  for(let deg=0;deg<=90;deg++){
   entryRevisionDebug.setFraction(deg/90);
   for(const p of panels){const b=bounds(p);for(const target of ['entry-shoe-bench','bath1-vanity','door-front-main','door-front-secondary']){const object=m.getObjectByName(target);if(object&&overlap(b,bounds(object)))clashes.push({deg,panel:p.name,target});}for(const other of staticMeshes)if(overlap(b,bounds(other)))clashes.push({deg,panel:p.name,target:other.name});}
  }
  entryRevisionDebug.setOpen(false);
  const dry=columnViewDebug.dryStudy.controls,sliderBounds=[];
  for(const open of [false,true]){
   dry.setStorage(open);dry.setMirror(open);const box=bounds(m.getObjectByName('bath1-vanity')),storageFronts=new T.Box3(),mirrorFronts=new T.Box3();for(let i=0;i<2;i++){storageFronts.union(bounds(m.getObjectByName('dry-storage-door-'+i)));mirrorFronts.union(bounds(m.getObjectByName('dry-mirror-door-'+i)));}sliderBounds.push({open,min:box.min.toArray(),max:box.max.toArray(),storageFrontSpan:storageFronts.max.x-storageFronts.min.x,mirrorFrontSpan:mirrorFronts.max.x-mirrorFronts.min.x});
  }
  dry.setStorage(false);dry.setMirror(false);
  const rect=b=>({x0:b.min.x,x1:b.max.x,z0:b.min.z,z1:b.max.z}),solids=[];
  for(const w of walls){const a=P(w.a),b=P(w.b),dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),th=(w.t||20)/200;let from=0;
   const segment=(lo,hi)=>{if(hi<=lo)return;const x0=a[0]+dx*lo/len,x1=a[0]+dx*hi/len,z0=a[1]+dz*lo/len,z1=a[1]+dz*hi/len;solids.push({x0:Math.min(x0,x1)-(dx===0?th:0),x1:Math.max(x0,x1)+(dx===0?th:0),z0:Math.min(z0,z1)-(dz===0?th:0),z1:Math.max(z0,z1)+(dz===0?th:0)});};
   for(const o of [...(w.open||[])].filter(o=>o.kind!=='window').sort((a,b)=>a.at-b.at)){segment(from,o.at/100);from=(o.at+o.w)/100;}segment(from,len);
  }
  for(const n of ['bath1-vanity','entry-shoe-bench','flush-entry-cabinet','bath1-shower','bath1-squat-pan'])solids.push(rect(bounds(m.getObjectByName(n))));
  for(const n of ['door-bed1-single','door-bath1-single'])m.getObjectByName(n).traverse(o=>{if(o.isMesh&&visible(o))solids.push(rect(bounds(o)));});
  const jointUse=[];
  for(const depth of [0,.65,.85]){
   const cx=(bench.min.x+bench.max.x)/2,person={x0:cx-.3,x1:cx+.3,z0:bench.min.z+.05-depth,z1:bench.min.z+.05};
   const obstacles=[...solids,s.standing,...(depth?[person]:[])],step=.01,r=.3,x0=1.85,z0=5.45,nx=406,nz=173;
   const free=(i,j)=>{const x=x0+i*step,z=z0+j*step;return !obstacles.some(o=>Math.hypot(Math.max(o.x0-x,0,x-o.x1),Math.max(o.z0-z,0,z-o.z1))<r-1e-9);};
   const cell=(x,z)=>[Math.round((x-x0)/step),Math.round((z-z0)/step)],start=cell(5.3,6),target=cell(2.15,6.05),enc=(i,j)=>i*nz+j,q=[start],seen=new Set([enc(...start)]);let reached=false;
   if(free(...start)&&free(...target))for(let h=0;h<q.length;h++){const [i,j]=q[h];if(i===target[0]&&j===target[1]){reached=true;break;}for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj,k=enc(a,b);if(a<0||b<0||a>=nx||b>=nz||seen.has(k)||!free(a,b))continue;seen.add(k);q.push([a,b]);}}
   jointUse.push({washOccupied:true,benchUseDepth:depth,benchUse:depth?person:null,reached,visited:seen.size,diameter:.6,grid:step,scope:'local approach with room doors in current open position; 850mm is a conservative forward-bend envelope, not measured occupants'});
  }
  const before=m.getObjectByName('whole-home-skirting').children.length;addSkirting(m);const after=m.getObjectByName('whole-home-skirting'),count=[];m.traverse(o=>{if(o.name==='whole-home-skirting')count.push(o.name);});
  const skirtHits=[];for(const mesh of after.children)for(const name of ['flush-entry-cabinet','bed1-wardrobe','bed3-wardrobe','integrated-fridge','balcony-laundry-cabinet']){const o=m.getObjectByName(name);if(o&&visible(o)&&overlap(bounds(mesh),bounds(o)))skirtHits.push({skirt:mesh.name,cabinet:name});}
  return {key:columnViewDebug.dryStudy.key,spec:s,benchWidth:bench.max.x-bench.min.x,benchShift:entryRevisionDebug.state.benchShift,benchBackShift:entryRevisionDebug.state.benchBackShift,benchSideGap:bench.min.x-vanity.max.x,shoeGap:cabinet.position.x-.8-bench.max.x,benchWallGap:s.backFace-bench.max.z,clashes,sliderBounds,jointUse,leafCount:panels.length,skirting:{before,after:after.children.length,rootCount:count.length,cutbacks:after.userData.cabinetCutbacks,hits:skirtHits}};
 });
 assert.equal(report.key,'integrated');assert.ok(Math.abs(report.benchWidth-.97)<1e-5&&Math.abs(report.benchShift-.04)<1e-5);assert.ok(Math.abs(report.benchSideGap-.05)<1e-5);assert.equal(report.leafCount,6);assert.deepEqual(report.clashes,[],'Shoe doors intersect cabinets, bench or room doors during swing');
 assert.ok(Math.abs(report.benchBackShift-.06)<1e-5&&report.benchWallGap>.009&&report.shoeGap>.044);
 assert.ok(report.sliderBounds.every(b=>b.min[0]>=report.spec.cabinet.x0-.001&&b.max[0]<=report.spec.screen.x1+.001&&b.min[2]>=report.spec.front-.001),'Sliders protrude outside the planned footprint');
 assert.ok(report.sliderBounds.find(b=>b.open).storageFrontSpan<.36&&report.sliderBounds.find(b=>b.open).mirrorFrontSpan<.34,'Open sliding doors must stack to reveal a bay, not exchange places and still cover it');
 assert.ok(report.jointUse.filter(r=>r.benchUseDepth<=.65).every(r=>r.reached));
 assert.equal(report.skirting.rootCount,1);assert.equal(report.skirting.before,report.skirting.after);assert.ok(report.skirting.cutbacks.length>0);assert.deepEqual(report.skirting.hits,[]);
 await page.locator('#entryInside').click();assert.equal(await page.evaluate(()=>entryRevisionDebug.state.opened),true);await page.screenshot({path:__dirname+'/entry-current-doors-open.png'});await page.locator('#entryInside').click();
 await page.locator('#roomSelect').selectOption('bath1');await page.locator('[data-public-bath-action="dry"]').click();await page.locator('[data-dry-action="storage"]').click();await page.locator('[data-dry-action="mirror"]').click();
 assert.equal(await page.evaluate(()=>columnViewDebug.state.selectedFacility),'bath1-vanity');assert.ok(await page.evaluate(()=>columnViewDebug.state.selectedVisible));
 assert.deepEqual(await page.evaluate(()=>columnViewDebug.dryStudy.controls.state),{storageOpen:true,mirrorOpen:true});await page.screenshot({path:__dirname+'/public-dry-current-storage.png'});
 await page.setViewportSize({width:390,height:844});assert.ok(await page.locator('#dryStorageActions').isVisible());await page.locator('[data-dry-action="storage"]').click();await page.locator('[data-dry-action="mirror"]').click();assert.deepEqual(await page.evaluate(()=>columnViewDebug.dryStudy.controls.state),{storageOpen:false,mirrorOpen:false});await page.screenshot({path:__dirname+'/public-dry-current-mobile.png'});
 for(const object of ['dry-service-access','dry-mirror-storage']){await page.locator('#placeDetails').click();await page.locator(`[data-detail-object="${object}"]`).click();assert.ok(await page.evaluate(()=>columnViewDebug.state.selectedVisible),object+' must be visible through the opened front');await page.screenshot({path:__dirname+'/'+object+'-mobile.png'});}
 await page.locator('#allPlaces').click();await page.locator('[data-place="entry"]').click();await page.locator('#placeDetails').click();await page.locator('#mobileEntryDoors').click();assert.equal(await page.evaluate(()=>entryRevisionDebug.state.opened),true);await page.screenshot({path:__dirname+'/entry-current-mobile-open.png'});
 await page.locator('#placeDetails').click();await page.locator('#mobileEntryDoors').click();assert.equal(await page.evaluate(()=>entryRevisionDebug.state.opened),false);
 assert.deepEqual(errors,[]);report.errors=errors;report.scope='91 sampled shoe-door poses; actual current slider transforms, cabinet skirting cutbacks, PC and 390px touch-sized controls. Not product, construction or ergonomic certification.';
 fs.writeFileSync(__dirname+'/entry-dry-current-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({key:report.key,benchSideGap:report.benchSideGap,leafCount:report.leafCount,clashes:report.clashes.length,jointUse:report.jointUse,skirtingSegments:report.skirting.after,cutbacks:report.skirting.cutbacks.length,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
