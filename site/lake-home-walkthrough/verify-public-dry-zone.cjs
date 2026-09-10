// Prevent candidate geometry clipping walls/doors, false simultaneous-use
// clearance claims, and failure to restore the unchanged baseline after comparing.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],results=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bath1&dry=original');
  await page.waitForFunction(()=>window.columnViewDebug?.state.ready);
  const baseline=await page.evaluate(async()=>{const T=await import('./vendor/three.module.js');const m=columnViewDebug.dryStudy.model;const b=new T.Box3().setFromObject(m.getObjectByName('bath1-vanity'));return [b.min.toArray(),b.max.toArray()];});
  for(const key of ['deep','slim','offset','integrated']){
   await page.locator(`[data-dry-option="${key}"]`).click();
   await page.waitForFunction(k=>columnViewDebug.dryStudy.key===k&&columnViewDebug.state.selectedVisible,key);
   const result=await page.evaluate(async()=>{
    const T=await import('./vendor/three.module.js'),{walls,P}=await import('./plan.js');
    const {model,spec:s,key}=columnViewDebug.dryStudy;model.updateMatrixWorld(true);
    const candidate=model.getObjectByName('bath1-vanity'),bounds=new T.Box3().setFromObject(candidate);
    const overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>.001);
    const fixtureNames=['entry-shoe-bench','flush-entry-cabinet','bath1-shower','bath1-squat-pan'];
    const collisions=fixtureNames.filter(n=>overlap(bounds,new T.Box3().setFromObject(model.getObjectByName(n))));
    const doorHits=[];
    for(const name of ['door-bed1-single','door-bath1-single']){
     const door=model.getObjectByName(name),saved=door.rotation.clone();
     for(let deg=0;deg<=90;deg++){
      door.rotation.set(0,door.userData.base+door.userData.turn*deg*Math.PI/180,0);door.updateWorldMatrix(true,true);
      door.traverse(o=>{if(o.isMesh&&overlap(bounds,new T.Box3().setFromObject(o)))doorHits.push({name,deg});});
     }
     door.rotation.copy(saved);door.updateWorldMatrix(true,true);
    }
    const solids=[];
    for(const w of walls){
     if(w.glass)continue;const a=P(w.a),b=P(w.b),dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),th=(w.t||20)/200;
     const add=(from,to)=>{if(to<=from)return;const x0=a[0]+dx*from/length,z0=a[1]+dz*from/length,x1=a[0]+dx*to/length,z1=a[1]+dz*to/length;
      solids.push({x0:Math.min(x0,x1)-(dx===0?th:0),x1:Math.max(x0,x1)+(dx===0?th:0),z0:Math.min(z0,z1)-(dz===0?th:0),z1:Math.max(z0,z1)+(dz===0?th:0)});};
     let last=0;for(const o of [...(w.open||[])].filter(o=>o.kind!=='window').sort((a,b)=>a.at-b.at)){add(last,o.at/100);last=(o.at+o.w)/100;}add(last,length);
    }
    const rect=b=>({x0:b.min.x,x1:b.max.x,z0:b.min.z,z1:b.max.z});
    for(const n of fixtureNames)solids.push(rect(new T.Box3().setFromObject(model.getObjectByName(n))));
    for(const n of ['door-bed1-single','door-bath1-single'])model.getObjectByName(n).traverse(o=>{if(o.isMesh)solids.push(rect(new T.Box3().setFromObject(o)));});
    solids.push(s.cabinet,s.screen);
    const route=(occupied,drawerOpen=false)=>{
     const projecting=drawerOpen&&s.storage!=='sliding',stand=projecting?{...s.standing,z0:s.standing.z0-.32,z1:s.standing.z1-.32}:s.standing;
     const obstacles=[...solids,...(occupied?[stand]:[]),...(projecting?[s.drawer]:[])],r=.3,step=.025;
     const free=(x,z)=>!obstacles.some(b=>{const dx=Math.max(b.x0-x,0,x-b.x1),dz=Math.max(b.z0-z,0,z-b.z1);return dx*dx+dz*dz<r*r-1e-10;});
     const start=[180,236],target=[86,242],q=[start],seen=new Set([start.join(',')]);let found=null;
     if(!free(start[0]*step,start[1]*step)||!free(target[0]*step,target[1]*step))return {reachable:false,reason:'endpoint blocked',startFree:free(start[0]*step,start[1]*step),targetFree:free(target[0]*step,target[1]*step)};
     for(let i=0;i<q.length;i++){const [x,z]=q[i];if(x===target[0]&&z===target[1]){found=i;break;}
      for(const [nx,nz] of [[x+1,z],[x-1,z],[x,z+1],[x,z-1]]){if(nx<76||nx>200||nz<218||nz>272)continue;const k=nx+','+nz;if(!seen.has(k)&&free(nx*step,nz*step)){seen.add(k);q.push([nx,nz]);}}
     }
     return {reachable:found!==null,visited:seen.size,start:start.map(n=>n*step),target:target.map(n=>n*step),radius:r,grid:step,doorState:'current 90-degree open',scope:'local entry-to-public-bath route only; circle proxy is not a person'};
    };
    const bench=new T.Box3().setFromObject(model.getObjectByName('entry-shoe-bench'));
    return {key,spec:s,bounds:[bounds.min.toArray(),bounds.max.toArray()],insideDryAllocation:bounds.min.x>=s.minX-.001&&bounds.max.x<=s.maxX+.001&&bounds.max.z<=s.backFace+.001,benchSideGap:bench.min.x-bounds.max.x,collisions,doorHits,routeEmpty:route(false),routeOccupied:route(true),routeDrawerUse:route(true,true),visible:columnViewDebug.state.selectedVisible};
   });
   console.log(JSON.stringify({key,collisions:result.collisions,doorHits:result.doorHits,routeEmpty:result.routeEmpty,routeOccupied:result.routeOccupied}));
   assert.ok(result.insideDryAllocation);assert.deepEqual(result.collisions,[]);assert.deepEqual(result.doorHits,[]);assert.ok(result.routeEmpty.reachable);
   assert.equal(result.routeOccupied.reachable,['offset','integrated'].includes(key));assert.equal(result.routeDrawerUse.reachable,key==='integrated');
   if(key==='integrated')assert.ok(Math.abs(result.benchSideGap-.05)<1e-5,'Keep 50mm installation allowance, not the previous 10mm gap');
   results.push(result);await page.screenshot({path:__dirname+`/public-dry-${key}.png`});
  }
  await page.locator('[data-dry-option="original"]').click();
  const restored=await page.evaluate(async()=>{const T=await import('./vendor/three.module.js'),m=columnViewDebug.dryStudy.model,b=new T.Box3().setFromObject(m.getObjectByName('bath1-vanity'));let count=0;m.traverse(o=>{if(o.name==='bath1-vanity')count++;});return {bounds:[b.min.toArray(),b.max.toArray()],count,key:columnViewDebug.dryStudy.key};});
  assert.deepEqual(restored.bounds,baseline);assert.equal(restored.count,1);assert.equal(restored.key,'original');
  await page.locator('[data-dry-option="integrated"]').click();
  await page.locator('#dryPlanButton').click();assert.equal(await page.locator('#dryPlanDialog').evaluate(d=>d.open),true);
  assert.match(await page.locator('#dryPlan').textContent(),/650 × 400 mm/);
  await page.screenshot({path:__dirname+'/public-dry-plan.png'});await page.locator('#dryPlanDialog button').click();
  await page.locator('#spaceGuideToggle').click();assert.equal(await page.locator('[data-map-object]').count(),5);
  await page.locator('#spaceGuide button[aria-label="关闭空间定位"]').click();
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.waitForFunction(()=>document.querySelector('#dryZoneStudy').open===false);
  await page.screenshot({path:__dirname+'/public-dry-mobile.png'});assert.deepEqual(errors,[]);
  fs.writeFileSync(__dirname+'/public-dry-verification.json',JSON.stringify({results,restored,mobile:true,errors,unverified:['actual standing posture and mobility','drainage and supplies','purchased basin and hardware','waterproof installation','whole-home circulation']},null,2));
  console.log(JSON.stringify({results,restored,mobile:true,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
