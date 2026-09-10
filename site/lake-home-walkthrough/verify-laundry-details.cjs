const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const url='http://127.0.0.1:8768/lake-home-walkthrough/';
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],report={};p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url+'column-view.html?space=laundry');await p.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.laundryDetailsDebug);
 report.geometry=await p.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),m=masterDressingDebug.model,d=laundryDetailsDebug;
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;},under=(o,g)=>{for(let p=o;p;p=p.parent)if(p===g)return true;return false;},bounds=o=>new T.Box3().setFromObject(o);
  const meshes=g=>{const list=[];g.traverse(o=>{if(o.isMesh&&visible(o))list.push(o);});return list;};
  const obb=o=>{o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,c=b.getCenter(new T.Vector3()).applyMatrix4(o.matrixWorld),s=b.getSize(new T.Vector3()).multiplyScalar(.5),e=o.matrixWorld.elements,axes=[new T.Vector3(e[0],e[1],e[2]),new T.Vector3(e[4],e[5],e[6]),new T.Vector3(e[8],e[9],e[10])],ext=axes.map((v,i)=>v.length()*s.getComponent(i));axes.forEach(v=>v.normalize());return {c,axes,ext};};
  const overlap=(a,b)=>{const delta=b.c.clone().sub(a.c),axes=[...a.axes,...b.axes];for(const x of a.axes)for(const y of b.axes){const v=x.clone().cross(y);if(v.lengthSq()>1e-10)axes.push(v.normalize());}return axes.every(v=>a.axes.reduce((n,x,i)=>n+Math.abs(x.dot(v))*a.ext[i],0)+b.axes.reduce((n,x,i)=>n+Math.abs(x.dot(v))*b.ext[i],0)-Math.abs(delta.dot(v))>.001);};
  d.reset();const all=meshes(m),near=all.filter(o=>{const b=bounds(o);return b.max.x>10.5&&b.min.x<12.1&&b.max.z>.15&&b.min.z<1.9&&b.max.y>.08&&b.min.y<1.8;});
  const edgeContact=(part,other)=>{const g=part.geometry,p=g.attributes.position,index=g.index,n=index?.count||p.count,a=new T.Vector3(),b=new T.Vector3(),ray=new T.Raycaster();for(let i=0;i<n;i+=3)for(let j=0;j<3;j++){a.fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(part.matrixWorld);b.fromBufferAttribute(p,index?index.getX(i+(j+1)%3):i+(j+1)%3).applyMatrix4(part.matrixWorld);const length=a.distanceTo(b);if(length<.002)continue;ray.set(a,b.sub(a).normalize());ray.near=.001;ray.far=length-.001;const hit=ray.intersectObject(other,false)[0];if(hit)return hit.point.toArray();}return null;};
  const hits=new Map(),inspect=(kind,angle)=>{const u=d.units[kind];for(const part of meshes(u.door))for(const other of near){if(under(other,u.hinge)||other.name===kind+'-hinge-fixed')continue;const k=kind+'|'+part.name+'|'+other.name;if(hits.has(k))continue;if(overlap(obb(part),obb(other))){const contact=other.name.includes('curtain-')?edgeContact(part,other):null;if(other.name.includes('curtain-')&&!contact)continue;hits.set(k,{kind,angle,part:part.name,other:other.name,parent:other.parent.name,contact});}}};
  for(const kind of ['washer','dryer']){d.reset();for(let angle=0;angle<=110;angle++){d.set(kind,angle);inspect(kind,angle);}}
  for(let angle=0;angle<=110;angle++){d.set('washer',angle);d.set('dryer',angle);inspect('washer',angle);inspect('dryer',angle);}
  const curtainPoses=[];for(let i=0;i<=20;i++){curtainDetailsDebug.set('living',i/20);inspect('washer','curtain-'+i);inspect('dryer','curtain-'+i);curtainPoses.push(i/20);}curtainDetailsDebug.set('living',0);
  const contacts=[];for(const object of meshes(d.kit).filter(o=>['stacking-elastomer-pad','dryer-support-pad'].includes(o.name))){const b=bounds(object),c=b.getCenter(new T.Vector3()),ray=new T.Raycaster(new T.Vector3(c.x,b.min.y+.0001,c.z),new T.Vector3(0,-1,0),0,.01),hit=ray.intersectObjects(all.filter(o=>o!==object),false)[0];contacts.push({name:object.name,below:hit?.object.name,gap:hit?b.min.y-hit.point.y:null});}
  const rays=[],shells=[];for(const kind of ['washer','dryer']){
   const u=d.units[kind],origin=u.unit.localToWorld(new T.Vector3(0,.391,.7)),dir=new T.Vector3(0,0,-1).transformDirection(u.unit.matrixWorld),ray=new T.Raycaster(origin,dir),hit=ray.intersectObjects(meshes(u.unit),false)[0];
   rays.push({kind,hit:hit?.object.name,local:hit?u.unit.worldToLocal(hit.point.clone()).toArray():null});shells.push({kind,size:bounds(u.body).getSize(new T.Vector3()).toArray(),position:u.unit.position.toArray(),angle:d.state[kind]});
  }
  const routes=[];
  for(const state of ['closed','washer','both']){
   d.reset();if(state!=='closed')d.set('washer',110);if(state==='both')d.set('dryer',110);
   const blocks=all.map(o=>({name:o.name,b:bounds(o)})).filter(({b})=>b.max.y>.10&&b.min.y<1.78&&b.max.x>5.9&&b.min.x<12.05&&b.max.z>.19&&b.min.z<7.2);
   // On the opening's free side, 775mm from the machine front, not behind the open door.
   // Keep a 600mm body footprint; reach/bending are reported separately, not certified here.
   const r=.30,step=.025,start=[8.32,5.85],target=[10.55,.69],free=(x,z)=>x>=5.92+r&&x<=12.03-r&&z>=.2+r&&z<=7.17-r&&!blocks.some(({b})=>Math.hypot(Math.max(b.min.x-x,0,x-b.max.x),Math.max(b.min.z-z,0,z-b.max.z))<r-.0001);
   const queue=free(...start)?[[0,0]]:[],prev=new Map([['0,0',null]]);let end=null;
   for(let i=0;i<queue.length;i++){const [qx,qz]=queue[i],x=start[0]+qx*step,z=start[1]+qz*step;if(Math.hypot(x-target[0],z-target[1])<.035){end=qx+','+qz;break;}for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=qx+dx,nz=qz+dz,k=nx+','+nz;if(!prev.has(k)&&free(start[0]+nx*step,start[1]+nz*step)){prev.set(k,qx+','+qz);queue.push([nx,nz]);}}}
   const path=[];for(let k=end;k;k=prev.get(k)){const [x,z]=k.split(',').map(Number);path.unshift([start[0]+x*step,start[1]+z*step]);}
   const violations=[];for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.005);for(let j=0;j<=n;j++)if(!free(a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n))violations.push(i);}
   routes.push({state,target,reachable:!!end,nodes:queue.length,path,violations,targetBlockers:blocks.filter(({b})=>Math.hypot(Math.max(b.min.x-target[0],0,target[0]-b.max.x),Math.max(b.min.z-target[1],0,target[1]-b.max.z))<r).map(o=>o.name)});
  }
  d.reset();walkDebug.rebuild();const initial=walkDebug.state.stamp;d.set('washer',110);const changed=walkDebug.refreshCollisionState(),stamp=walkDebug.state.stamp,signature=JSON.stringify(walkDebug.obstacles);walkDebug.rebuild();const matchesFull=signature===JSON.stringify(walkDebug.obstacles);d.reset();
  return {hits:[...hits.values()],rays,shells,routes,curtainPoses,contacts,cache:{initial,changed,stamp,matchesFull},cabinet:d.cabinet.position.toArray(),layout:{wings:livingLayoutDebug.metrics.wingLengths,sofaGap:livingLayoutDebug.metrics.islandToSofa}};
 });
 fs.writeFileSync(__dirname+'/laundry-details-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report.geometry,routes:report.geometry.routes.map(({path,...r})=>r)}));
 assert.deepEqual(report.geometry.hits,[]);assert.ok(report.geometry.rays.every(r=>r.hit===r.kind+'-drum-back'&&r.local[2]<0));assert.deepEqual(report.geometry.cabinet,[11.66,0,.69]);
 for(const row of report.geometry.shells){assert.ok(Math.abs(row.size[0]-.63)<1e-6&&Math.abs(row.size[1]-.84)<1e-6&&Math.abs(row.size[2]-.60)<1e-6);}
 assert.ok(report.geometry.routes.every(r=>r.reachable&&r.violations.length===0),'600mm circular standing access, not bending motion');assert.ok(report.geometry.cache.changed&&report.geometry.cache.matchesFull);
 assert.equal(report.geometry.contacts.length,6);assert.ok(report.geometry.contacts.every(c=>c.gap!==null&&Math.abs(c.gap)<.0002),'Pads must actually meet rails/washer top');
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  await p.setViewportSize(viewport);await p.locator('[data-laundry-action="reset"]').click();
  for(const kind of ['washer','dryer']){await p.locator(`[data-laundry-action="${kind}"]`).click();assert.equal(await p.evaluate(k=>laundryDetailsDebug.state[k],kind),110);}
  await p.screenshot({path:__dirname+`/laundry-open-${viewport.width}.png`});await p.locator('[data-laundry-action="reset"]').click();assert.deepEqual(await p.evaluate(()=>({...laundryDetailsDebug.state})),{washer:0,dryer:0});
 }
 await p.goto(url+'mobile-preview.html?space=laundry&v=laundry-details');const frame=p.frames().find(f=>f.url().includes('column-view.html'));assert.ok(frame);await frame.waitForFunction(()=>window.columnViewDebug?.state.ready);
 await frame.locator('[data-laundry-action="washer"]').click();assert.equal(await frame.evaluate(()=>laundryDetailsDebug.state.washer),110);await p.screenshot({path:__dirname+'/laundry-phone-wrapper.png'});
 for(const object of ['washer-drum-interior','dryer-drum-interior','laundry-stacking-kit']){await frame.locator('#placeDetails').click();await frame.locator(`[data-detail-object="${object}"]`).click();assert.ok(await frame.evaluate(()=>columnViewDebug.state.selectedVisible),object);}
 report.errors=errors;report.limit='OBB meshes/1-degree sweep; circular 600mm route/standing only, not bending body/physical appliance or installation certification.';assert.deepEqual(errors,[]);fs.writeFileSync(__dirname+'/laundry-details-verification.json',JSON.stringify(report,null,2));console.log('LAUNDRY_VERIFIED');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
