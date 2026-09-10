const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await b.newPage();await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=entry&mode=walk');await p.waitForFunction(()=>window.walkDebug);
 const data=await p.evaluate(async()=>{
  const {rooms,P,doorLeaves}=await import('./plan.js'),{insidePolygon}=await import('./continuous-walk.js'),{setDoorLeafOpen}=await import('./door-motion.js');
  const model=masterDressingDebug.model;
  const openedRoomDoors=[];
  for(const [room,leaves] of Object.entries(doorLeaves))for(const leaf of leaves){
   const name=`door-${room}-${leaf.key}`,door=model.getObjectByName(name);if(!door)throw Error('Missing scheduled room door: '+name);
   setDoorLeafOpen(door,true);openedRoomDoors.push(name);
  }
  walkDebug.rebuild();
  const step=.05,start=walkDebug.state.position,origin=[start[0],start[2]],key=(x,z)=>x+','+z;
  const queue=[[0,0]],parents=new Map([[key(0,0),null]]);
  for(let i=0;i<queue.length;i++){
   const [x,z]=queue[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,nz=z+dz,k=key(nx,nz);if(parents.has(k)||!walkDebug.free(origin[0]+nx*step,origin[1]+nz*step))continue;
    if(!walkDebug.free(origin[0]+(x+dx*.5)*step,origin[1]+(z+dz*.5)*step))continue;
    parents.set(k,[x,z]);queue.push([nx,nz]);
   }
  }
  const results=[];
  for(const id of ['living','bar','kitchen','bed1','bath1','master','bath2','bed3']){
   const room=rooms.find(r=>r.id===id),poly=room.poly.map(P),target=P(room.point),points=queue.map(([x,z])=>[origin[0]+x*step,origin[1]+z*step,x,z]).filter(([x,z])=>insidePolygon(x,z,poly));
   points.sort((a,b)=>Math.hypot(a[0]-target[0],a[1]-target[1])-Math.hypot(b[0]-target[0],b[1]-target[1]));
   const found=points[0];let path=[],node=found?.slice(2);while(node){path.push([origin[0]+node[0]*step,origin[1]+node[1]*step]);node=parents.get(key(...node));}path.reverse();
   // Traverse each actual path continuously out and back, checking controller position.
   let maxError=0;for(const point of [...path,...path.slice(0,-1).reverse()]){const current=walkDebug.state.position;walkDebug.move(point[0]-current[0],point[1]-current[2]);const next=walkDebug.state.position;maxError=Math.max(maxError,Math.hypot(next[0]-point[0],next[2]-point[1]));}
   results.push({id,reached:!!found,node:found?.slice(0,2),pathLength:path.length,controllerMaxError:maxError});
  }
  const skirting=model.getObjectByName('whole-home-skirting');
  const sample=[];model.traverse(o=>{if(o.name==='master-bed'||o.name==='bed1-bed'||o.name==='bed3-bed')sample.push({name:o.name,userData:o.userData});});
  return {scope:'230mm radius game proxy, 50mm grid, only scheduled room doors open; cabinet doors retain default state. Not 600mm ergonomic certification',openedRoomDoors,nodes:queue.length,results,skirting:skirting?.userData,colliders:walkDebug.state.colliders,sample};
 });fs.writeFileSync(__dirname+'/walk-route-audit.json',JSON.stringify(data,null,2));console.log(JSON.stringify({...data,skirting:{...data.skirting,segments:data.skirting.segments.length}}));
 assert.equal(data.results.length,8);assert.ok(data.results.every(r=>r.reached&&r.pathLength>0&&r.controllerMaxError<.001),'All eight destinations must be reached continuously and returned from');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
