const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bath2');await p.waitForFunction(()=>window.columnViewDebug?.state.ready);
 const result=await p.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{setDoorLeafOpen}=await import('./door-motion.js'),m=masterDressingDebug.model,d=masterBathDetailsDebug;
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;},inside=(o,root)=>{for(let p=o;p;p=p.parent)if(p===root)return true;return false;},box=o=>new T.Box3().setFromObject(o);
  const overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>.001);
  const fixed=[];m.traverse(o=>{if(!o.isMesh||!visible(o)||o.isReflector||d.drawers.some(g=>inside(o,g))||inside(o,d.door))return;const b=box(o);if(b.max.x<12.2||b.min.x>14.3||b.max.z<.75||b.min.z>2.9||b.min.y>2.3||b.max.y<.04)return;fixed.push([o,b]);});
  const moving=[];for(const root of [...d.drawers,d.door])root.traverse(o=>{if(o.isMesh)moving.push(o);});
  const collisions=[];for(let i=0;i<=90;i++){d.setDrawerFraction(i/90);d.setShowerFraction(i/90);for(const o of moving){const a=box(o);for(const [other,b] of fixed)if(overlap(a,b))collisions.push({pose:i,part:o.name,other:other.name});}}
  const roomDoor=m.getObjectByName('door-bath2-single'),doorHits=[];d.setDrawers(true);d.setShower(true);
  const saved=roomDoor.rotation.clone();for(let i=0;i<=90;i++){roomDoor.rotation.set(0,roomDoor.userData.base+roomDoor.userData.turn*i*Math.PI/180,0);m.updateMatrixWorld(true);const a=box(roomDoor);for(const o of moving)if(overlap(a,box(o)))doorHits.push({pose:i,part:o.name});}roomDoor.rotation.copy(saved);m.updateMatrixWorld(true);
  d.setDrawers(false);d.setShower(false);
  const origin=d.root.localToWorld(new T.Vector3(0,1.1,.03)),ray=new T.Raycaster(origin,new T.Vector3(0,-1,0));const hit=ray.intersectObject(d.root,true).find(h=>visible(h.object));
  const basin={hit:hit?.object.name,height:hit?.point.y},cabinet=box(d.root),geometry={counter:d.root.userData.counterSize,basin:d.root.userData.basinOpening,position:d.root.position.toArray(),showerReplaced:d.removed.length,mirrorCount:interiorMirrorsDebug.state.count};
  const collisionObjects=fixed.filter(([o])=>collisions.some(c=>c.other===o.name)).map(([o,b])=>({name:o.name,parent:o.parent.name,position:o.position.toArray(),min:b.min.toArray(),max:b.max.toArray()}));
  setDoorLeafOpen(roomDoor,true);const routes=[];
  for(const [drawerOpen,showerOpen] of [[false,false],[false,true],[true,true]]){
   d.setDrawers(drawerOpen);d.setShower(showerOpen);m.updateMatrixWorld(true);const blocks=[];
   m.traverse(o=>{if(!o.isMesh||o.isReflector||!visible(o))return;const b=box(o);if(b.max.y<.10||b.min.y>1.75||b.max.x<12.26||b.min.x>14.21||b.max.z<.84||b.min.z>2.80)return;b.name=o.name;blocks.push(b);});
   const free=(x,z)=>x>=12.56&&x<=13.91&&z>=1.14&&z<=2.50&&!blocks.some(b=>Math.hypot(Math.max(b.min.x-x,0,x-b.max.x),Math.max(b.min.z-z,0,z-b.max.z))<.3-.0001);
   const step=.01,start=[13.70,2.45],queue=free(...start)?[[0,0]]:[],seen=new Set(['0,0']);for(let i=0;i<queue.length;i++)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=queue[i][0]+dx,nz=queue[i][1]+dz,k=nx+','+nz;if(!seen.has(k)&&free(start[0]+nx*step,start[1]+nz*step)){seen.add(k);queue.push([nx,nz]);}}
   const target=(x,z)=>queue.some(([i,j])=>Math.hypot(start[0]+i*step-x,start[1]+j*step-z)<.06);
   const probes=[[12.96,1.47],[12.96,1.87],[12.98,1.87],[13.06,1.97],[13.12,1.87]].map(([x,z])=>({x,z,blocked:blocks.filter(b=>Math.hypot(Math.max(b.min.x-x,0,x-b.max.x),Math.max(b.min.z-z,0,z-b.max.z))<.3).map(b=>({name:b.name,min:b.min.toArray(),max:b.max.toArray()}))}));
   routes.push({drawerOpen,showerOpen,visited:queue.length,vanity:target(drawerOpen?13.40:13.13,2.36),shower:target(12.96,1.47),probes,startBlocked:blocks.filter(b=>Math.hypot(Math.max(b.min.x-start[0],0,start[0]-b.max.x),Math.max(b.min.z-start[1],0,start[1]-b.max.z))<.3).map(b=>({name:b.name,min:b.min.toArray(),max:b.max.toArray()}))});
  }
  d.setDrawers(false);d.setShower(false);
  return {collisions,collisionObjects,doorHits,basin,geometry,routes,services:d.services.userData};
 });
 fs.writeFileSync(__dirname+'/master-bath-details-verification.json',JSON.stringify(result,null,2));assert.equal(result.collisions.length,0,JSON.stringify(result.collisionObjects));assert.equal(result.doorHits.length,0,JSON.stringify(result.doorHits.slice(0,3)));assert.equal(result.basin.hit,'bath2-basin-drain');assert.ok(result.basin.height<.75);assert.equal(result.geometry.mirrorCount,6);assert.equal(result.services.supply,null);
 assert.equal(result.routes[0].shower,false,'Closed shower glass must obstruct route');assert.equal(result.routes[1].shower,true,'600mm shower approach');assert.ok(result.routes.every(r=>r.vanity),'600mm vanity approach');
 for(const i of [0,1]){await p.locator(`[data-master-bath-action="drawer${i}"]`).click();assert.equal(await p.evaluate(i=>masterBathDetailsDebug.state.drawers[i],i),true);await p.screenshot({path:__dirname+`/master-bath-drawer${i}-mobile.png`});await p.locator(`[data-master-bath-action="drawer${i}"]`).click();}
 await p.locator('[data-master-bath-action="shower"]').click();assert.equal(await p.evaluate(()=>masterBathDetailsDebug.state.showerOpen),true);await p.screenshot({path:__dirname+'/master-bath-shower-mobile.png'});await p.locator('[data-master-bath-action="shower"]').click();
 await p.setViewportSize({width:1450,height:950});await p.selectOption('#roomSelect','bath2');await p.locator('[data-master-bath-action="drawer0"]').click();await p.screenshot({path:__dirname+'/master-bath-drawers-desktop.png'});
 await p.evaluate(()=>{masterBathDetailsDebug.setDrawers(false);masterBathDetailsDebug.setShower(false);});await p.locator('header [data-mode="walk"]').click();
 const walking=await p.evaluate(()=>{walkDebug.rebuild();let p=walkDebug.state.position;walkDebug.move(12.96-p[0],2.17-p[2]);walkDebug.step(0);const nearest=walkDebug.state.nearDoor;walkDebug.interact();const opened=masterBathDetailsDebug.state.showerOpen;walkDebug.move(0,-.70);const inside=walkDebug.state.position;walkDebug.move(0,.70);walkDebug.step(0);walkDebug.interact();return {nearest,opened,inside,closed:!masterBathDetailsDebug.state.showerOpen};});assert.equal(walking.nearest,'bath2-shower-door');assert.equal(walking.opened,true);assert.ok(Math.abs(walking.inside[2]-1.47)<.01);assert.equal(walking.closed,true);result.walking=walking;
 assert.deepEqual(errors,[]);result.errors=errors;result.limits='模型柜体/玻璃门与所测对象局部扫掠；600mm圆形代理、10mm网格。不是现场管路、防水、五金或承重验收。';fs.writeFileSync(__dirname+'/master-bath-details-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,collisions:result.collisions.length,routes:result.routes.map(({probes,startBlocked,...r})=>r)}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
