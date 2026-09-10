// Prevent a makeup desk being added on top of existing cabinetry, simulated
// sliding fronts escaping their cabinet, and hidden chair/door conflicts.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=master&dressing=original');await page.waitForFunction(()=>window.columnViewDebug?.state.ready);
 for(const key of ['storage','open','balanced']){
  await page.locator(`[data-dressing-option="${key}"]`).click();await page.waitForFunction(()=>columnViewDebug.state.selectedVisible===true);
  for(const use of ['stored','seated','drawer']){
   await page.locator(`[data-dressing-use="${use}"]`).click();
   const result=await page.evaluate(async()=>{
    const T=await import('./vendor/three.module.js'),{rooms,P,walls}=await import('./plan.js'),{dressingOccupant}=await import('./master-dressing.js');
    const {controller,model,status}=masterDressingDebug,{root,spec}=controller.candidate;model.updateMatrixWorld(true);
    const bounds=o=>new T.Box3().setFromObject(o),asRect=b=>({x0:b.min.x,z0:b.min.z,x1:b.max.x,z1:b.max.z});
    const overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>.001);
    const polygon=rooms.find(r=>r.id==='master').poly.map(P),inside=(x,z)=>{let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
    const bedMeshes=[],bedObjects=new Set();model.getObjectByName('master-bed').traverse(o=>{if(o.isMesh){bedMeshes.push(bounds(o));bedObjects.add(o);}});
    const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o);});
    const outside=[],bedHits=[];for(const mesh of meshes){const b=bounds(mesh);for(const [x,z] of [[b.min.x+.001,b.min.z+.001],[b.min.x+.001,b.max.z-.001],[b.max.x-.001,b.min.z+.001],[b.max.x-.001,b.max.z-.001]])if(!inside(x,z))outside.push(mesh.name);if(!bedObjects.has(mesh)&&bedMeshes.some(bb=>overlap(b,bb)))bedHits.push(mesh.name);}
    const doorHits=[];
    for(const name of ['door-master-single','door-bath2-single']){const door=model.getObjectByName(name),saved=door.rotation.clone();
     for(let deg=0;deg<=90;deg++){door.rotation.set(0,door.userData.base+door.userData.turn*deg*Math.PI/180,0);door.updateWorldMatrix(true,true);door.traverse(d=>{if(d.isMesh){const b=bounds(d);for(const o of meshes)if(overlap(bounds(o),b))doorHits.push({name,deg,mesh:o.name});}});}
     door.rotation.copy(saved);door.updateWorldMatrix(true,true);
    }
    const obstacles=[];
    for(const w of walls){if(w.glass)continue;const a=P(w.a),b=P(w.b),dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),t=(w.t||20)/200;
     const seg=(f,q)=>{if(q<=f)return;const x0=a[0]+dx*f/len,x1=a[0]+dx*q/len,z0=a[1]+dz*f/len,z1=a[1]+dz*q/len;obstacles.push({x0:Math.min(x0,x1)-(dx===0?t:0),x1:Math.max(x0,x1)+(dx===0?t:0),z0:Math.min(z0,z1)-(dz===0?t:0),z1:Math.max(z0,z1)+(dz===0?t:0)});};let last=0;for(const o of [...(w.open||[])].filter(o=>o.kind!=='window').sort((a,b)=>a.at-b.at)){seg(last,o.at/100);last=(o.at+o.w)/100;}seg(last,len);
    }
    for(const n of ['door-master-single','door-bath2-single','master-bed'])model.getObjectByName(n).traverse(o=>{if(o.isMesh){const b=bounds(o);if(b.min.y<1.9)obstacles.push(asRect(b));}});
    obstacles.push(spec.entry,spec.foot,spec.desk);
    const stool=bounds(root.getObjectByName('master-makeup-stool'));obstacles.push(asRect(stool));
    const occupant=dressingOccupant(spec,status.use);if(occupant)obstacles.push(occupant);
    const free=(x,z)=>inside(x,z)&&[0,1,2,3,4,5,6,7].every(i=>inside(x+.30*Math.cos(i*Math.PI/4),z+.30*Math.sin(i*Math.PI/4)))&&!obstacles.some(b=>{const dx=Math.max(b.x0-x,0,x-b.x1),dz=Math.max(b.z0-z,0,z-b.z1);return dx*dx+dz*dz<.09-1e-9;});
    const start=[536,204],q=[start],seen=new Set(),step=.025;if(free(start[0]*step,start[1]*step))seen.add(start.join(','));
    for(let i=0;i<q.length&&seen.size;i++){const [x,z]=q[i];for(const [nx,nz] of [[x+1,z],[x-1,z],[x,z+1],[x,z-1]]){const k=nx+','+nz;if(nx<490||nx>730||nz<30||nz>216||seen.has(k)||!free(nx*step,nz*step))continue;seen.add(k);q.push([nx,nz]);}}
    const bedBase=bounds(model.getObjectByName('master-bed').children[0]);
    const routeTargets=[['bedLeft',Math.round((14.31+bedBase.min.x)/2/step)*step,2.30],['bedRight',Math.round((18.13+bedBase.max.x)/2/step)*step,2.30],['bathApproach',13.70,3.25]].map(([name,x,z])=>({name,point:[x,z],reachable:seen.has(Math.round(x/step)+','+Math.round(z/step)),targetFree:free(x,z)}));
    const occupantBedOverlap=occupant?bedMeshes.some(b=>Math.min(b.max.x,occupant.x1)-Math.max(b.min.x,occupant.x0)>.001&&Math.min(b.max.z,occupant.z1)-Math.max(b.min.z,occupant.z0)>.001):false;
    const bedBounds=bounds(model.getObjectByName('master-bed')),bedInside=[[bedBounds.min.x+.001,bedBounds.min.z+.001],[bedBounds.min.x+.001,bedBounds.max.z-.001],[bedBounds.max.x-.001,bedBounds.min.z+.001],[bedBounds.max.x-.001,bedBounds.max.z-.001]].every(([x,z])=>inside(x,z));
    return {key:status.key,use:status.use,spec,meshCount:meshes.length,outside:[...new Set(outside)],bedInside,bedHits:[...new Set(bedHits)],doorHits,footSection:spec.foot.z0-bedBase.max.z,stoolBounds:[stool.min.toArray(),stool.max.toArray()],occupant,occupantBedOverlap,routes:{start:[13.4,5.1],startFree:free(13.4,5.1),step,radius:.30,targets:routeTargets,scope:'600 mm circle, eight perimeter probes, fixed furniture and 90-degree doors; occupied area 600x650mm, retreat 320mm for drawer. Stool meshes alone are not a human/site approval'}};
   });
   console.log(JSON.stringify({key,use,outside:result.outside,bedHits:result.bedHits,doorHits:result.doorHits,routes:result.routes.targets}));
   assert.deepEqual(result.outside,[]);assert.deepEqual(result.bedHits,[]);assert.deepEqual(result.doorHits,[]);assert.ok(result.routes.startFree);assert.ok(result.bedInside);
   assert.equal(result.occupantBedOverlap,key==='open'&&use==='drawer');
   assert.equal(result.routes.targets.find(t=>t.name==='bedLeft').reachable,!(key==='storage'&&use==='drawer'));
   assert.equal(result.routes.targets.find(t=>t.name==='bathApproach').reachable,!(key==='storage'&&use==='drawer'));
   assert.equal(result.routes.targets.find(t=>t.name==='bedRight').reachable,key==='balanced'||key==='open'&&use==='stored');
   results.push(result);if(use==='stored'||use==='drawer')await page.screenshot({path:__dirname+`/master-${key}-${use}.png`});
  }
  await page.locator('#dressingDoors').click();
  const fronts=await page.evaluate(async()=>{const T=await import('./vendor/three.module.js'),{controller}=masterDressingDebug;const out=[];for(const n of ['master-entry-wardrobe','master-wardrobe']){const g=controller.candidate.root.getObjectByName(n),r=n.includes('entry')?controller.candidate.spec.entry:controller.candidate.spec.foot;g.traverse(o=>{if(o.name.includes('-sliding-front')||o.name.includes('-fixed-front')){const b=new T.Box3().setFromObject(o);out.push(b.min.x>=r.x0-.001&&b.max.x<=r.x1+.001&&b.min.z>=r.z0-.001&&b.max.z<=r.z1+.001);}});}return out;});assert.ok(fronts.every(Boolean));
  await page.locator('#dressingPlanButton').click();await page.screenshot({path:__dirname+`/master-${key}-plan.png`});await page.locator('#dressingPlanDialog button').click();
 }
 const refined=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{controller,model}=masterDressingDebug,bed=model.getObjectByName('master-bed');
  const sizes=bed.children.slice(0,3).map(o=>new T.Box3().setFromObject(o).getSize(new T.Vector3()).toArray());
  const desk=controller.candidate.root.getObjectByName('master-makeup-desk'),lid=desk.getObjectByName('makeup-lid'),panel=lid.children[0],fixed=[];
  const corners=o=>{o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,out=[];for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])out.push(desk.worldToLocal(o.localToWorld(new T.Vector3(x,y,z))));return out;};
  desk.traverse(o=>{if(o.isMesh&&/makeup-(top-|mirror|task-light|tray|bottle|bin-)/.test(o.name))fixed.push(o);});
  const hits=[];for(let angle=0;angle<=90;angle++){lid.rotation.x=-angle*Math.PI/180;model.updateMatrixWorld(true);const a=corners(panel),r=lid.rotation.x,axes=[new T.Vector3(1,0,0),new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(0,Math.cos(r),Math.sin(r)),new T.Vector3(0,-Math.sin(r),Math.cos(r))];
   for(const o of fixed){const b=corners(o);if(axes.every(axis=>{const pa=a.map(v=>v.dot(axis)),pb=b.map(v=>v.dot(axis));return Math.min(Math.max(...pa),Math.max(...pb))-Math.max(Math.min(...pa),Math.min(...pb))>.001;}))hits.push({angle,object:o.name});}
  }
  controller.candidate.setUse('drawer');return {sizes,lidCollisionSamples:hits,angles:91,independentGeometry:bed.children[0].geometry!==controller.baseline.bedObject.children[0].geometry,independentMaterial:bed.children[0].material!==controller.baseline.bedObject.children[0].material};
 });
 for(const [i,x,z] of [[0,1.9,2.05],[1,1.8,2],[2,1.96,.08]]){assert.ok(Math.abs(refined.sizes[i][0]-x)<.001);assert.ok(Math.abs(refined.sizes[i][2]-z)<.001);}
 assert.deepEqual(refined.lidCollisionSamples,[]);assert.ok(refined.independentGeometry&&refined.independentMaterial);
 assert.match(await page.locator('[data-dressing-use="drawer"]').textContent(),/翻盖/);
 await page.locator('#dressingPlanButton').click();assert.match(await page.locator('#dressingPlan').textContent(),/1.90 × 2.05/);await page.locator('#dressingPlanDialog button').click();
 await page.locator('[data-dressing-option="open"]').click();
 await page.locator('#inventoryToggle').click();assert.match(await page.locator('[data-inventory-object="master-wardrobe"]').textContent(),/浅矮柜/);await page.locator('#inventory [aria-label="关闭清单"]').click();
 await page.locator('[data-dressing-option="original"]').click();
 const restored=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{model,controller}=masterDressingDebug,bed=model.getObjectByName('master-bed'),originalParts=new T.Box3();bed.updateWorldMatrix(true,true);
  // The baseline bounds predate lighting installation. Compare original furniture
  // independently; the added lamp's current-frame mount has its own regression.
  bed.children.filter(o=>o.name!=='master-foot-light').forEach(o=>originalParts.union(new T.Box3().setFromObject(o)));
  return {makeup:!!model.getObjectByName('master-makeup-desk'),originals:['master-entry-wardrobe','master-wardrobe'].every(n=>model.getObjectByName(n)?.visible),leftovers:!!model.getObjectByName('master-dressing-candidate'),bedPositionRestored:bed.position.equals(controller.baseline.bedPosition),bedBoundsRestored:originalParts.equals(controller.baseline.bedBounds)};
 });assert.deepEqual(restored,{makeup:false,originals:true,leftovers:false,bedPositionRestored:true,bedBoundsRestored:true});
 await page.locator('[data-dressing-option="balanced"]').click();await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>!document.querySelector('#masterDressing').open);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:__dirname+'/master-dressing-mobile.png'});
 assert.deepEqual(errors,[]);fs.writeFileSync(__dirname+'/master-dressing-verification.json',JSON.stringify({results,refined,frontsWithinEnvelope:true,restored,mobile:true,errors,limits:['unselected cabinet hardware','chair and occupant geometry assumptions','electrical and anchorage','no independent dressing room','not photographic quality']},null,2));
 console.log(JSON.stringify({cases:results.length,restored,mobile:true,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
