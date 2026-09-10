// Regression: the earlier wardrobe-only route test omitted a floor plant.
// Use every visible low mesh, preserving full-size furniture and a 600mm agent.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=master&mode=layout&v=master-clear-passage');
 await page.waitForFunction(()=>window.columnViewDebug?.state.ready,null,{timeout:60000});
 const report=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{rooms,P}=await import('./plan.js'),{dressingOccupant}=await import('./master-dressing.js');
  const {model:m,controller}=masterDressingDebug,plant=m.getObjectByName('master-window-plant'),bed=m.getObjectByName('master-bed'),polygon=rooms.find(r=>r.id==='master').poly.map(P),step=.025,r=.30;
  const box=o=>new T.Box3().setFromObject(o),inside=(x,z)=>{let a=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const p=polygon[i],q=polygon[j];if((p[1]>z)!==(q[1]>z)&&x<(q[0]-p[0])*(z-p[1])/(q[1]-p[1])+p[0])a=!a;}return a;};
  const descendants=new Set();plant.traverse(o=>descendants.add(o));
  function obstacles(use){const out=[];m.updateMatrixWorld(true);m.traverseVisible(o=>{if(!o.isMesh)return;const b=box(o);if(b.max.y<=.03||b.min.y>=1.9||b.max.x<12.2||b.min.x>18.2||b.max.z<.2||b.min.z>5.6)return;out.push({name:o.name,plant:descendants.has(o),x0:b.min.x,z0:b.min.z,x1:b.max.x,z1:b.max.z});});const occupant=dressingOccupant(controller.candidate.spec,use);if(occupant)out.push({name:'makeup-occupant',...occupant});return out;}
  function routes(use){
   const obs=obstacles(use),free=(x,z)=>inside(x,z)&&Array.from({length:32},(_,i)=>i).every(i=>inside(x+r*Math.cos(i*Math.PI/16),z+r*Math.sin(i*Math.PI/16)))&&!obs.some(b=>{const dx=Math.max(b.x0-x,0,x-b.x1),dz=Math.max(b.z0-z,0,z-b.z1);return dx*dx+dz*dz<r*r-1e-9;});
   const start=[536,204],key=(x,z)=>x+','+z,q=[],seen=new Map(),parents=new Map();if(free(start[0]*step,start[1]*step)){q.push(start);seen.set(key(...start),true);}
   for(let i=0;i<q.length;i++){const [x,z]=q[i];for(const [nx,nz] of [[x+1,z],[x-1,z],[x,z+1],[x,z-1]]){const k=key(nx,nz);if(nx<490||nx>726||nz<10||nz>218||seen.has(k))continue;const ok=free(nx*step,nz*step);seen.set(k,ok);if(ok){parents.set(k,key(x,z));q.push([nx,nz]);}}}
   const targets=[['bedLeft',14.65,2.30],['bedRight',17.5,2.30],['bathApproach',13.7,3.25],['cabinetPhoto',17.8,1.6],['beddingPhoto',14.64,2.70]].map(([name,x,z])=>{
    const k=key(Math.round(x/step),Math.round(z/step)),reachable=seen.get(k)===true,path=[];if(reachable){let p=k;while(p){path.push(p.split(',').map(v=>Number(v)*step));p=parents.get(p);}path.reverse();}
    let continuous=true;for(let i=1;i<path.length;i++)for(let j=1;j<=5;j++){const a=path[i-1],b=path[i];if(!free(a[0]+(b[0]-a[0])*j/5,a[1]+(b[1]-a[1])*j/5))continuous=false;}
    return {name,reachable,targetFree:free(x,z),continuous,path};
   });return {use,startFree:q.length>0,obstacleCount:obs.length,plantMeshes:obs.filter(o=>o.plant).length,targets};
  }
  const corrected=plant.position.clone(),prior=plant.userData.priorBounds,priorCenter=new T.Vector3((prior.min[0]+prior.max[0])/2,(prior.min[1]+prior.max[1])/2,(prior.min[2]+prior.max[2])/2),currentCenter=box(plant).getCenter(new T.Vector3()),world=plant.getWorldPosition(new T.Vector3());
  plant.position.copy(plant.parent.worldToLocal(world.add(priorCenter.sub(currentCenter))));const regression=routes('stored');plant.position.copy(corrected);m.updateMatrixWorld(true);
  const states=[];for(const use of ['stored','seated','drawer'])for(const doors of [false,true]){controller.candidate.setUse(use);controller.candidate.setDoors(doors);states.push({...routes(use),doors});}
  controller.candidate.setUse('stored');controller.candidate.setDoors(false);
  const curtainHits=[];for(let pose=0;pose<=20;pose++){curtainDetailsDebug.set('master',pose/20);m.updateMatrixWorld(true);plant.traverseVisible(a=>{if(!a.isMesh)return;const ba=box(a);m.getObjectByName('master-curtain').traverseVisible(b=>{if(!b.isMesh)return;const bb=box(b);if(['x','y','z'].every(k=>Math.min(ba.max[k],bb.max[k])-Math.max(ba.min[k],bb.min[k])>.001))curtainHits.push({pose,a:a.name,b:b.name});});});}curtainDetailsDebug.set('master',0);
  const collisions=[],plantBounds=box(plant);m.traverseVisible(o=>{if(!o.isMesh||descendants.has(o))return;const b=box(o);plant.traverseVisible(p=>{if(!p.isMesh)return;const a=box(p);if(['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>.001))collisions.push({plant:p.name,other:o.name});});});
  const lamp=bed.getObjectByName('master-foot-light'),lampBounds=box(lamp),base=box(bed.children[0]),lampHits=[],lampChildren=new Set();lamp.traverse(o=>lampChildren.add(o));
  bed.traverseVisible(o=>{if(!o.isMesh||lampChildren.has(o))return;const b=box(o);lamp.traverseVisible(p=>{if(!p.isMesh)return;const a=box(p);if(['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>.0001))lampHits.push(o.name);});});
  return {regression,states,curtainHits,collisions,lampHits,plant:{count:plant.children.length,scale:plant.scale.toArray(),bounds:{min:plantBounds.min.toArray(),max:plantBounds.max.toArray()},inside:plantBounds.min.z>.84&&[[plantBounds.min.x,plantBounds.min.z],[plantBounds.min.x,plantBounds.max.z],[plantBounds.max.x,plantBounds.min.z],[plantBounds.max.x,plantBounds.max.z]].every(p=>inside(...p))},lamp:{min:lampBounds.min.toArray(),max:lampBounds.max.toArray(),underBase:lampBounds.max.y<base.min.y,withinDepth:lampBounds.max.z<=base.max.z},bed:{size:base.getSize(new T.Vector3()).toArray(),footGap:controller.candidate.spec.foot.z0-base.max.z},scope:'All visible mesh AABBs overlapping master at height 30–1900mm, 600mm circular agent, 32 perimeter probes, 25mm grid +5mm path checks; not full human motion, field dimensions, or multi-person comfort'};
 });
 fs.writeFileSync(__dirname+'/master-circulation-verification.json',JSON.stringify({report,errors},null,2));
 console.log(JSON.stringify({...report,regression:{...report.regression,targets:report.regression.targets.map(({path,...t})=>t)},states:report.states.map(s=>({...s,targets:s.targets.map(({path,...t})=>t)}))}));
 assert.equal(report.regression.targets.find(t=>t.name==='bedRight').reachable,false,'old plant position must reproduce blockage');
 for(const s of report.states){assert.ok(s.startFree);assert.ok(s.targets.every(t=>t.reachable&&t.continuous),'all visible-obstacle routes: '+s.use+'/'+s.doors);}
 assert.deepEqual(report.curtainHits,[]);assert.deepEqual(report.collisions,[]);assert.deepEqual(report.lampHits,[]);assert.ok(report.plant.inside);assert.equal(report.plant.count,29);assert.deepEqual(report.plant.scale,[1,1,1]);assert.ok(report.lamp.underBase&&report.lamp.withinDepth);assert.ok(Math.abs(report.bed.size[0]-1.9)<.001&&Math.abs(report.bed.size[2]-2.05)<.001);
 await page.screenshot({path:__dirname+'/master-clear-passage-desktop.png'});
 const fitted=[];
 for(const [width,height] of [[390,844],[844,390],[1440,1000]]){
  await page.setViewportSize({width,height});
  await page.waitForFunction(()=>Math.abs(roomViewsDebug.camera.aspect-document.querySelector('#viewport').clientWidth/document.querySelector('#viewport').clientHeight)<.001);
  const fit=await page.evaluate(async()=>{const T=await import('./vendor/three.module.js'),{rooms,P}=await import('./plan.js'),c=roomViewsDebug.camera;c.updateMatrixWorld();const points=rooms.find(r=>r.id==='master').poly.flatMap(p=>[.006,1.35].map(y=>{const [x,z]=P(p),v=new T.Vector3(x,y,z).project(c);return v.toArray();}));return {points,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.ok(fit.points.every(([x,y,z])=>Math.abs(x)<1&&Math.abs(y)<1&&z>-1&&z<1),'layout cropped at '+width);assert.equal(fit.overflow,false);fitted.push({width,height,allRoomCornersVisible:true});
  if(width===390)await page.screenshot({path:__dirname+'/master-clear-passage-phone.png'});
 }
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/mobile-preview.html?space=master&mode=layout&v=master-clear-passage');
 const frame=await page.locator('iframe').elementHandle(),content=await frame.contentFrame();await content.waitForFunction(()=>window.columnViewDebug?.state.ready,null,{timeout:60000});
 assert.equal(await content.evaluate(()=>!!masterDressingDebug.model.getObjectByName('master-window-plant')),true);
 await content.waitForFunction(()=>columnViewDebug.state.draws>=2);
 await content.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.screenshot({path:__dirname+'/master-clear-passage-wrapper.png'});
 fs.writeFileSync(__dirname+'/master-circulation-verification.json',JSON.stringify({report,fitted,wrapper:true,errors},null,2));
 assert.deepEqual(errors,[]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
