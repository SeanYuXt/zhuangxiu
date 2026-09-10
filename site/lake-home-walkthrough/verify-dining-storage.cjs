const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const url='http://127.0.0.1:8768/lake-home-walkthrough/';
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],report={};p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url+'column-view.html?space=cabinet');await p.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.sideboardDetailsDebug&&window.fridgeDetailsDebug);
 report.geometry=await p.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),m=masterDressingDebug.model,s=sideboardDetailsDebug,f=fridgeDetailsDebug;
  const under=(o,g)=>{for(let p=o;p;p=p.parent)if(p===g)return true;return false;},visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;},bounds=o=>new T.Box3().setFromObject(o);
  const meshes=g=>{const a=[];g.traverse(o=>{if(o.isMesh&&visible(o))a.push(o);});return a;},all=meshes(m);
  const obb=o=>{o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,c=b.getCenter(new T.Vector3()).applyMatrix4(o.matrixWorld),s=b.getSize(new T.Vector3()).multiplyScalar(.5),e=o.matrixWorld.elements,axes=[new T.Vector3(e[0],e[1],e[2]),new T.Vector3(e[4],e[5],e[6]),new T.Vector3(e[8],e[9],e[10])],ext=axes.map((v,i)=>v.length()*s.getComponent(i));axes.forEach(v=>v.normalize());return {c,axes,ext};};
  const overlap=(a,b)=>{const delta=b.c.clone().sub(a.c),axes=[...a.axes,...b.axes];for(const x of a.axes)for(const y of b.axes){const v=x.clone().cross(y);if(v.lengthSq()>1e-10)axes.push(v.normalize());}return axes.every(v=>a.axes.reduce((n,x,i)=>n+Math.abs(x.dot(v))*a.ext[i],0)+b.axes.reduce((n,x,i)=>n+Math.abs(x.dot(v))*b.ext[i],0)-Math.abs(delta.dot(v))>.001);};
  const hits=new Map(),sideNear=all.filter(o=>{const b=bounds(o);return b.max.x>7.35&&b.min.x<11.55&&b.max.z>5.75&&b.min.z<7.25&&b.max.y>.05&&b.min.y<2.8;}),fridgeNear=all.filter(o=>{const b=bounds(o);return b.max.x>5.8&&b.min.x<7.25&&b.max.z>1.35&&b.min.z<3.30&&b.max.y>.05&&b.min.y<2.8;});
  const candidates=(root,list)=>list.filter(o=>!under(o,root)&&o.name!==root.name+'-mount').map(o=>({o,b:bounds(o),v:obb(o)}));
  // Ceiling rings have an empty middle: their single OBB is not a solid slab.
  // Only these composite surfaces need this narrow phase; retain conservative
  // solid OBB checks for hardware, cabinet shells and the HVAC equipment bay.
  const ceilingSurfaceHit=(part,other)=>{
   if(!/^客厅双眼皮/.test(other.name))return true;
   const box=part.geometry.boundingBox.clone().expandByScalar(-.0005),toLocal=part.matrixWorld.clone().invert().multiply(other.matrixWorld),pos=other.geometry.attributes.position,idx=other.geometry.index,tri=new T.Triangle();
   for(let i=0;i<(idx?idx.count:pos.count);i+=3){for(const [n,v] of [tri.a,tri.b,tri.c].entries())v.fromBufferAttribute(pos,idx?idx.getX(i+n):i+n).applyMatrix4(toLocal);if(box.intersectsTriangle(tri))return true;}return false;
  };
  const inspect=(root,others,pose)=>{for(const part of meshes(root)){const b=bounds(part),a=obb(part);for(const other of others){const k=root.name+'|'+part.name+'|'+other.o.name;if(!hits.has(k)&&b.intersectsBox(other.b)&&overlap(a,other.v)&&ceilingSurfaceHit(part,other.o))hits.set(k,{root:root.name,part:part.name,other:other.o.name,parent:other.o.parent.name,pose});}}};
  const drawerPairs=[];for(let i=0;i<6;i++){
   s.reset();const d=s.drawers[i],front=d.getObjectByName('sideboard-drawer-bevel-'+i),tray=d.getObjectByName('sideboard-drawer-tray-'+i),before=[front,tray].map(o=>o.getWorldPosition(new T.Vector3())),others=candidates(d,sideNear);
   for(let j=0;j<=40;j++){s.setDrawer(i,j/40);inspect(d,others,j/40);}
   drawerPairs.push({i,front:front.getWorldPosition(new T.Vector3()).sub(before[0]).toArray(),tray:tray.getWorldPosition(new T.Vector3()).sub(before[1]).toArray(),bevel:front.userData.bevelDegrees});
  }
  const upperTravel=[];
  for(const band of ['base','upper'])for(let i=0;i<6;i++){s.reset();const g=s.doors[band][i],others=candidates(g,sideNear);for(let j=0;j<=120;j++){s.setDoor(band,i,j/120);inspect(g,others,j/120);}if(band==='upper')upperTravel.push({i,position:g.position.toArray(),rotation:g.rotation.y});}
  s.reset();const serviceOthers=candidates(s.serviceFace,sideNear);for(let j=0;j<=90;j++){s.setService(j/90);inspect(s.serviceFace,serviceOthers,j);}s.reset();
  for(let j=0;j<=125;j++){f.setDoors(j/125);for(const g of f.doors)inspect(g,candidates(g,fridgeNear),j);}
  f.setDoors(1);for(let j=0;j<=90;j++){f.setUpper(j/90);inspect(f.upperDoor,candidates(f.upperDoor,fridgeNear),j);}f.setUpper(0);
  for(let i=0;i<f.bins.length;i++){f.reset();f.setDoors(1);const g=f.bins[i],others=candidates(g,fridgeNear);for(let j=0;j<=30;j++){f.setBin(i,j/30);inspect(g,others,j/30);}}
  f.reset();f.setDoors(1);const rays=[];
  for(const point of [[0,1.30,.8],[-.218,.465,.8]]){const origin=f.cabinet.localToWorld(new T.Vector3(...point)),dir=new T.Vector3(0,0,-1).transformDirection(f.cabinet.matrixWorld),ray=new T.Raycaster(origin,dir),hit=ray.intersectObjects(meshes(f.cabinet),false)[0];rays.push({point,hit:hit?.object.name,local:hit?f.cabinet.worldToLocal(hit.point.clone()).toArray():null});}
  f.reset();s.reset();const routes=[];
  s.setService(1);const serviceRays=[];
  for(const point of [[1.36,1.096,.8],[1.36,1.60,.8]]){const ray=new T.Raycaster(s.cabinet.localToWorld(new T.Vector3(...point)),new T.Vector3(0,0,-1).transformDirection(s.cabinet.matrixWorld));const h=ray.intersectObjects(meshes(s.cabinet),false)[0];serviceRays.push({point,hit:h?.object.name});}s.reset();
  for(const mode of ['side-upper','side-drawer','side-base','side-service','fridge-open','fridge-bin']){
   s.reset();f.reset();if(mode==='side-upper')s.setDoor('upper',1);if(mode==='side-base')s.setDoor('base',1);if(mode==='side-drawer')s.setDrawer(1);if(mode==='side-service')s.setService(1);if(mode.startsWith('fridge'))f.setDoors(1);if(mode==='fridge-bin')f.setBin(4);
   const blocks=all.map(o=>bounds(o)).filter(b=>b.max.y>.10&&b.min.y<1.85&&b.max.x>5.9&&b.min.x<12.05&&b.max.z>.19&&b.min.z<7.2),r=.30,step=.025,start=[8.32,5.85],target=mode==='side-service'?[8.07,6.10]:mode.startsWith('fridge')?[7.20,2.34]:[10.405,mode==='side-drawer'?5.82:6.12];
   const free=(x,z)=>x>=6.22&&x<=11.73&&z>=.5&&z<=6.87&&!blocks.some(b=>Math.hypot(Math.max(b.min.x-x,0,x-b.max.x),Math.max(b.min.z-z,0,z-b.max.z))<r-.0001),queue=free(...start)?[[0,0]]:[],seen=new Set(['0,0']);let reached=false;
   for(let i=0;i<queue.length;i++){const [qx,qz]=queue[i],x=start[0]+qx*step,z=start[1]+qz*step;if(Math.hypot(x-target[0],z-target[1])<.035){reached=true;break;}for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=qx+dx,nz=qz+dz,k=nx+','+nz;if(!seen.has(k)&&free(start[0]+nx*step,start[1]+nz*step)){seen.add(k);queue.push([nx,nz]);}}}
   routes.push({mode,target,reached,nodes:queue.length});
  }
  s.reset();f.reset();walkDebug.rebuild();const before=walkDebug.state.stamp;s.setDrawer(2);f.setDoors(1);const changed=walkDebug.refreshCollisionState(),signature=JSON.stringify(walkDebug.obstacles);walkDebug.rebuild();const same=signature===JSON.stringify(walkDebug.obstacles);s.reset();f.reset();
  const counter=bounds(m.getObjectByName('sideboard-600mm-worktop')),face=m.getObjectByName('dispenser-flush-face'),upper=bounds(m.getObjectByName('sideboard-upper-storage'));
  const panels=s.doors.upper.map(g=>{const o=g.children.find(o=>o.name.startsWith('sideboard-upper-extended-door')),b=bounds(o);return {size:b.getSize(new T.Vector3()).toArray(),bottom:b.min.y,top:b.max.y};});
  const header=bounds(hvacDetailsDebug.ducted.shell);
  const coordination={cabinetTop:upper.max.y,doorPanels:panels,headerFront:header.min.z,headerBottom:header.min.y,gap:header.min.y-upper.max.y,topTierRemoved:!m.getObjectByName('sideboard-seasonal-storage'),upperCapacityRatio:(.599-.018)/(.959-.036)};
  return {hits:[...hits.values()],drawerPairs,upperTravel,rays,serviceRays,routes,coordination,cache:{before,changed,same},positions:{side:s.cabinet.position.toArray(),fridge:f.cabinet.position.toArray()},counterSize:counter.getSize(new T.Vector3()).toArray(),dispenserFaceFront:bounds(face).min.z,compartments:s.compartments,vent:f.vent.userData,limits:'Sampled OBB motion, composite ceiling triangle narrow phase and 600mm circular approach; not simultaneous users, real hardware, suspension/load or installation certification'};
 });
 fs.writeFileSync(__dirname+'/dining-storage-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report.geometry,hits:report.geometry.hits.slice(0,45),hitCount:report.geometry.hits.length}));
 assert.deepEqual(report.geometry.hits,[]);assert.ok(report.geometry.drawerPairs.every(r=>r.bevel===45&&r.front.every((v,i)=>Math.abs(v-r.tray[i])<1e-6)&&Math.abs(r.front[2]+.42)<1e-6));assert.ok(report.geometry.rays.every(r=>r.hit==='fridge-insulated-back'&&r.local[2]<-.24));assert.ok(report.geometry.routes.every(r=>r.reached));assert.ok(report.geometry.cache.changed&&report.geometry.cache.same);
 assert.ok(report.geometry.upperTravel.every(r=>Math.abs(r.position[0]-([-1.625,-.975,-.325,.325,.975,1.625][r.i]-(r.i%2?-1:1)*.323))<1e-6&&Math.abs(r.position[2]-.057)<1e-6&&Math.abs(r.rotation-(r.i%2?1:-1)*Math.PI/2)<1e-6));
 const c=report.geometry.coordination;assert.ok(Math.abs(c.cabinetTop-2.41)<1e-5&&Math.abs(c.headerFront-6.02)<1e-5&&c.gap>.019&&c.topTierRemoved);
 assert.ok(c.doorPanels.every(d=>Math.abs(d.bottom-1.75)<1e-5&&d.size.every((v,i)=>Math.abs(v-[.646,.656,.020][i])<1e-5)));
 await p.evaluate(()=>sideboardDetailsDebug.setDoor('upper',2));await p.locator('#hvacToggle').click();assert.equal(await p.evaluate(()=>sideboardDetailsDebug.state.upper),-1);await p.locator('#hvacClose').click();
 assert.deepEqual(report.geometry.serviceRays.map(r=>r.hit),['dispenser-water-valve-lever','dispenser-power-splash-cover']);
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  await p.setViewportSize(viewport);await p.evaluate(()=>{document.querySelector('#roomSelect').value='cabinet';document.querySelector('#roomSelect').dispatchEvent(new Event('change'));});
  for(const key of ['upper','drawer','base','service']){if(key==='upper')await p.evaluate(()=>hvacDetailsDebug.ducted.setHatch(1));await p.locator(`[data-storage-device="sideboard"][data-storage-action="${key}"]`).click();const state=await p.evaluate(()=>sideboardDetailsDebug.state);assert.ok(key==='service'?state.service:state[key]>=0);if(key==='upper')assert.equal(await p.evaluate(()=>hvacDetailsDebug.ducted.state.hatch),false);await p.screenshot({path:__dirname+`/sideboard-${key}-${viewport.width}.png`});}
  await p.locator('[data-storage-device="sideboard"][data-storage-action="overall"]').click();assert.equal(await p.evaluate(()=>roomViewsDebug.active),'dining-sideboard');await p.screenshot({path:__dirname+`/sideboard-overall-${viewport.width}.png`});
  await p.locator('[data-storage-device="sideboard"][data-storage-action="reset"]').click();
  await p.evaluate(()=>{document.querySelector('#roomSelect').value='fridge';document.querySelector('#roomSelect').dispatchEvent(new Event('change'));});
  await p.locator('[data-storage-device="fridge"][data-storage-action="upper"]').click();assert.equal(await p.evaluate(()=>fridgeDetailsDebug.state.upper),true);await p.screenshot({path:__dirname+`/fridge-upper-${viewport.width}.png`});await p.locator('[data-storage-device="fridge"][data-storage-action="reset"]').click();
  await p.locator('[data-storage-device="fridge"][data-storage-action="doors"]').click();assert.equal(await p.evaluate(()=>fridgeDetailsDebug.state.doors),true);await p.screenshot({path:__dirname+`/fridge-open-${viewport.width}.png`});
  await p.locator('[data-storage-device="fridge"][data-storage-action="bins"]').click();assert.equal(await p.evaluate(()=>fridgeDetailsDebug.state.bin),0);
  await p.locator('[data-storage-device="fridge"][data-storage-action="overall"]').click();assert.equal(await p.evaluate(()=>fridgeDetailsDebug.state.bin),0);await p.screenshot({path:__dirname+`/fridge-overall-${viewport.width}.png`});
  await p.locator('[data-storage-device="fridge"][data-storage-action="reset"]').click();
 }
 await p.goto(url+'mobile-preview.html?space=cabinet&v=dining-storage');const frame=p.frames().find(f=>f.url().includes('column-view.html'));assert.ok(frame);await frame.waitForFunction(()=>window.columnViewDebug?.state.ready);
 await frame.locator('[data-storage-device="sideboard"][data-storage-action="upper"]').click();assert.equal(await frame.evaluate(()=>sideboardDetailsDebug.state.upper),0);
 await p.screenshot({path:__dirname+'/sideboard-phone-wrapper.png'});
 await frame.evaluate(()=>{document.querySelector('#roomSelect').value='fridge';document.querySelector('#roomSelect').dispatchEvent(new Event('change'));});
 await frame.locator('[data-storage-device="fridge"][data-storage-action="bins"]').click();assert.equal(await frame.evaluate(()=>fridgeDetailsDebug.state.bin),0);await p.screenshot({path:__dirname+'/fridge-phone-wrapper.png'});
 report.errors=errors;report.viewports=[1440,390];report.mobileWrapper=true;assert.deepEqual(errors,[]);fs.writeFileSync(__dirname+'/dining-storage-verification.json',JSON.stringify(report,null,2));console.log('DINING_STORAGE_VERIFIED');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
