// Actual loaded mesh bounds; independent static/use-state route regression.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
function route(obstacles,diameter,targets){
 const r=diameter/2,step=.025,x0=5.88,z0=.15,x1=12.04,z1=7.2,nx=Math.floor((x1-x0)/step)+1,nz=Math.floor((z1-z0)/step)+1;
 const free=(i,j)=>{const x=x0+i*step,z=z0+j*step;return x>=x0+r&&x<=x1-r&&z>=z0+r&&z<=z1-r&&!obstacles.some(o=>Math.hypot(Math.max(o.x1-x,0,x-o.x2),Math.max(o.z1-z,0,z-o.z2))<r-1e-7);};
 // Start in the main entry-to-living aisle, not next to a movable coffee table.
 const cell=([x,z])=>[Math.round((x-x0)/step),Math.round((z-z0)/step)],start=cell([8.32,5.85]),enc=(i,j)=>i*nz+j;
 if(!free(...start))return {reached:false,startFree:false};
 const q=[start],visited=new Set([enc(...start)]);
 for(let h=0;h<q.length;h++){const [i,j]=q[h];for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj,k=enc(ni,nj);if(ni<0||nj<0||ni>=nx||nj>=nz||visited.has(k)||!free(ni,nj))continue;visited.add(k);q.push([ni,nj]);}}
 const reachable=targets.filter(t=>visited.has(enc(...cell(t))));
 return {reached:reachable.length>0,startFree:true,visited:visited.size,candidateCount:targets.length,reachableCount:reachable.length,example:reachable[0]||null};
}
const rect=o=>({name:o.name,x1:o.min[0],x2:o.max[0],z1:o.min[2],z2:o.max[2]});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=clear-living&space=bar');await page.waitForFunction(()=>columnViewDebug?.state.ready);
 const audit=await page.evaluate(async()=>{const T=await import('./vendor/three.module.js'),m=masterDressingDebug.model;
  const bounds=o=>{const b=new T.Box3().setFromObject(o);return {name:o.name,min:b.min.toArray(),max:b.max.toArray(),size:b.getSize(new T.Vector3()).toArray()};};
  const names=['retained-balcony-column','linen-sofa','stone-island','slim-coffee-table','balcony-laundry-cabinet','balcony-care-cabinet','bar-service-cover','laundry-washer','tv-low-console','flush-sideboard','integrated-fridge','master-air-conditioner','master-bed'];
  const objects=names.map(n=>bounds(m.getObjectByName(n)));
  for(const n of ['lake-bar-left','lake-bar-right']){const bar=m.getObjectByName(n);objects.push({...bounds(bar.children[0]),name:n});}
  const seats=[...columnViewDebug.state.seatAudit.map((o,i)=>({...o,name:'bar-'+i,kind:'bar'})),...[0,1].map(i=>({...bounds(m.getObjectByName('dining-daily-seat-'+i)),kind:'dining',index:i}))];
  return {revision:m.userData.livingRevision,objects,seats,carcass:bounds(m.getObjectByName('island-storage-carcass')),settings:bounds(m.getObjectByName('dining-table-settings')),acDirection:new T.Vector3(0,0,1).transformDirection(m.getObjectByName('master-air-conditioner').matrixWorld).toArray()};
 });
 const o=Object.fromEntries(audit.objects.map(x=>[x.name,x]));
 assert.ok(audit.settings.max[1]<1.02&&audit.settings.min[1]>.895,'Crockery and mats must stay flat on the 900mm top, not rotate vertically');
 assert.ok(audit.settings.min[0]>=o['stone-island'].min[0]&&audit.settings.max[0]<=o['stone-island'].max[0]&&audit.settings.min[2]>=o['stone-island'].min[2]&&audit.settings.max[2]<=o['stone-island'].max[2],'Place settings must fit the worktop');
 assert.ok(Math.abs(o['retained-balcony-column'].size[0]-.4)<1e-5);assert.equal(audit.seats.filter(x=>x.kind==='bar').length,4);
 for(const wing of ['lake-bar-left','lake-bar-right']){const seats=audit.seats.filter(s=>s.wing===wing).sort((a,b)=>a.min[0]-b.min[0]);assert.equal(seats.length,2);for(const s of seats)assert.ok(Math.abs(s.max[0]-s.min[0]-.425)<1e-5,'Stool width must not shrink');assert.ok(Math.abs(seats[1].min[0]-seats[0].min[0]-.65)<1e-5,'Two-seat pitch');}
 for(const [n,length] of [['lake-bar-left',1.3],['lake-bar-right',1.3]])assert.ok(Math.abs(o[n].size[0]-length)<1e-5);
 assert.ok(Math.abs(o['linen-sofa'].size[2]-2.6)<1e-5);assert.ok(Math.abs(o['stone-island'].size[2]-1.8)<1e-5);
 for(const name of ['lake-bar-left','lake-bar-right'])assert.ok(Math.abs(o[name].size[2]-.56)<1e-5,'Worktop depth must match current design');
 const ac=o['master-air-conditioner'];assert.ok(ac.min[0]>=14.31-1e-5&&ac.min[2]>.84&&ac.max[2]<2.85);assert.ok(audit.acDirection[0]>.999);
 const base=audit.objects.filter(x=>!x.name.startsWith('master')&&x.name!=='laundry-washer').map(rect),results=[];
 const laundryShift=o['balcony-laundry-cabinet'].min[2]-.79,washerCenterZ=(o['laundry-washer'].min[2]+o['laundry-washer'].max[2])/2;
 const uses=['stored','pulled','occupied','occupied-door'];
 for(const use of uses){
  const seats=audit.seats.map(s=>{const p=rect(s),shift=use==='stored'?0:.45;if(s.kind==='bar'){p.z1+=shift;p.z2+=shift;}else{p.x1+=shift;p.x2+=shift;}
   if(use.startsWith('occupied')){const x=(p.x1+p.x2)/2,z=(p.z1+p.z2)/2,rx=s.kind==='bar'?.30:.325,rz=s.kind==='bar'?.325:.30;return {name:p.name,x1:x-rx,x2:x+rx,z1:z-rz,z2:z+rz};}return p;
  });
  const seatPairs=[];
  for(let i=0;i<seats.length;i++)for(let j=i+1;j<seats.length;j++){const a=seats[i],b=seats[j],dx=Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1),dz=Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1);if(dx>.001&&dz>.001)seatPairs.push({a:a.name,b:b.name,overlapMm:[Math.round(dx*1000),Math.round(dz*1000)]});}
  const collisions=seats.flatMap(s=>base.filter(b=>Math.min(s.x2,b.x2)-Math.max(s.x1,b.x1)>.001&&Math.min(s.z2,b.z2)-Math.max(s.z1,b.z1)>.001).map(b=>({seat:s.name,object:b.name}))).filter(c=>{
   if(use!=='stored'||!['stone-island','lake-bar-left','lake-bar-right'].includes(c.object))return true;
   const seat=audit.seats.find(s=>s.name===c.seat),table=o[c.object];return seat.max[1]>= (c.object==='stone-island'?.88:table.min[1]);
  });
  const obstacles=[...base,...seats];
  if(use==='occupied'){
   audit.allPulledSeatAccess=seats.map(s=>({seat:s.name,...route([...base,...seats.filter(other=>other!==s)],.6,[[(s.x1+s.x2)/2,(s.z1+s.z2)/2]])}));
   const working=seats.map((s,i)=>{const bar=audit.seats[i].kind==='bar',dx=bar?0:-.4,dz=bar?-.4:0;return {...s,x1:s.x1+dx,x2:s.x2+dx,z1:s.z1+dz,z2:s.z2+dz};});
   // The other five remain at reachable working positions (50 mm pull), while
   // this chair withdraws 450 mm for standing. Preserve all-pulled stress results.
   audit.seatAccess=seats.map(s=>({seat:s.name,...route([...base,...working.filter(other=>other.name!==s.name)],.6,[[(s.x1+s.x2)/2,(s.z1+s.z2)/2]])}));
  }
  // A conservative 500mm open-door envelope, two hinge sides separately, NOT a selected appliance.
  const scenarios=use==='occupied-door'?[{x1:10.81,x2:11.34,z1:.89+laundryShift,z2:.94+laundryShift},{x1:10.81,x2:11.34,z1:1.31+laundryShift,z2:1.36+laundryShift}]:[null];
  // Retain the old narrow targets for comparison; do not equate their failure with unusability.
  const operatorPoints=[],adjacentPoints=[];for(let x=10.40;x<=10.85+1e-6;x+=.025){for(let z=.95+laundryShift;z<=1.25+laundryShift+1e-6;z+=.025)operatorPoints.push([x,z]);for(let z=washerCenterZ-.65;z<=washerCenterZ+.65+1e-6;z+=.025)adjacentPoints.push([x,z]);}
  for(const [hinge,door] of scenarios.entries())for(const diameter of [.6,.7]){const current=door?[...obstacles,door]:obstacles;results.push({use,hinge:door?hinge:null,diameter,collisions,seatPairs,...route(current,diameter,operatorPoints),adjacentStandingRoute:route(current,diameter,adjacentPoints),kitchen:route(current,diameter,[[6.5,3.8]]),balcony:route(current,diameter,[[8.9,.65]])});}
 }
 audit.clearancesMm={rightWingToLaundry:Math.round((o['balcony-laundry-cabinet'].min[0]-o['lake-bar-right'].max[0])*1000),leftWingToFridge:Math.round((o['lake-bar-left'].min[0]-o['integrated-fridge'].max[0])*1000),islandToSofa:Math.round((o['linen-sofa'].min[0]-o['stone-island'].max[0])*1000),barToSofa:Math.round((o['linen-sofa'].min[2]-o['lake-bar-right'].max[2])*1000),sofaToSideboard:Math.round((o['flush-sideboard'].min[2]-o['linen-sofa'].max[2])*1000)};
 const storedSeats=audit.seats.map(rect),careObstacles=[...base,...storedSeats];
 const careStanding={name:'basin-standing-proxy',x1:6.65,x2:7.25,z1:.24,z2:.89};
 const careCollisions=careObstacles.filter(b=>Math.min(careStanding.x2,b.x2)-Math.max(careStanding.x1,b.x1)>.001&&Math.min(careStanding.z2,b.z2)-Math.max(careStanding.z1,b.z1)>.001).map(b=>b.name);
 audit.care={standingProxy:careStanding,collisions:careCollisions,approach:route(careObstacles,.6,[[6.95,.565]]),robotReleaseToAisle:route(careObstacles,.35,[[7.105,1.215]])};
 assert.deepEqual(careCollisions,[]);assert.ok(audit.care.approach.reached,'Basin approach blocked');assert.ok(audit.care.robotReleaseToAisle.reached,'Robot release disconnected from living aisle');
 audit.routes=results;audit.errors=errors;audit.limits='25mm grid, circular 600/700mm proxies, furniture AABBs; not real-body or field certification. Door hinge/model unconfirmed.';
 fs.writeFileSync(__dirname+'/living-revision-audit.json',JSON.stringify(audit,null,2));console.log(JSON.stringify({clearances:audit.clearancesMm,seatAccess:audit.seatAccess,results:results.map(r=>({use:r.use,hinge:r.hinge,diameter:r.diameter,collisions:r.collisions,seatPairs:r.seatPairs,washer:r.reached,adjacent:r.adjacentStandingRoute.reached,kitchen:r.kitchen.reached,balcony:r.balcony.reached})),errors}));
 await page.locator('header [data-mode="top"]').click();await page.screenshot({path:__dirname+'/living-revision-top.png'});
 await page.locator('#roomSelect').selectOption('bar');await page.screenshot({path:__dirname+'/living-revision-bar.png'});
 await page.locator('#roomSelect').selectOption('master');await page.locator('#facilities').evaluate(e=>e.open=true);await page.locator('[data-facility="master-air-conditioner"]').click();assert.ok(await page.evaluate(()=>columnViewDebug.state.selectedVisible));await page.screenshot({path:__dirname+'/master-ac-revised.png'});
 assert.deepEqual(errors,[]);assert.ok(results.every(x=>x.collisions.length===0),'Some occupied footprints collide');
 assert.ok(results.every(x=>x.seatPairs.length===0),'Six seats or occupant proxies overlap');
 assert.ok(results.filter(x=>x.diameter===.6&&x.use!=='occupied-door').every(x=>x.kitchen.reached&&x.balcony.reached),'600mm six-seat alternative route to kitchen or balcony blocked');
 assert.ok(audit.seatAccess.every(x=>x.reached),'One or more occupied seats cannot be approached/exited while the other five are occupied');
 assert.ok(results.filter(x=>x.use!=='occupied-door').every(x=>x.reached),'Closed-appliance approach lost connectivity');
 // Failed route probes remain in the report: symmetric wings are a user-requested
 // design candidate, not a certified appliance-access layout. Do not hide failures.
 console.log('ROUTE_LIMITS',JSON.stringify({washer:results.filter(x=>!x.reached).map(x=>({use:x.use,hinge:x.hinge,diameter:x.diameter})),allPulledSeatAccess:audit.allPulledSeatAccess.filter(x=>!x.reached).map(x=>x.seat)}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
