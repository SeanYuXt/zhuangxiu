// Protect the 400 mm envelope, full-size appliances and functional shallow drawers.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8774/lake-home-walkthrough/column-view.html?space=passageArt&v=sideboard-depth-40-10');
 await p.waitForFunction(()=>window.columnCheck&&window.sideboardDetailsDebug,{}, {timeout:90000});
 const result=await p.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),s=sideboardDetailsDebug,m=columnViewDebug.dryStudy.model,c=s.cabinet;
  m.updateMatrixWorld(true);const inv=c.matrixWorld.clone().invert();
  const under=(o,r)=>{for(let q=o;q;q=q.parent)if(q===r)return true;return false;};
  const visible=o=>{for(let q=o;q;q=q.parent)if(!q.visible||q.isReflector||q.userData.walkThrough)return false;return true;};
  const meshes=o=>{const a=[];o.traverse(k=>{if(k.isMesh&&visible(k))a.push(k);});return a;};
  const bounds=(o,local=false)=>{const b=new T.Box3();for(const k of meshes(o)){k.geometry.computeBoundingBox();b.union(k.geometry.boundingBox.clone().applyMatrix4(local?inv.clone().multiply(k.matrixWorld):k.matrixWorld));}return b;};
  const obb=o=>{o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,center=b.getCenter(new T.Vector3()).applyMatrix4(o.matrixWorld),half=b.getSize(new T.Vector3()).multiplyScalar(.5),e=o.matrixWorld.elements,axes=[new T.Vector3(e[0],e[1],e[2]),new T.Vector3(e[4],e[5],e[6]),new T.Vector3(e[8],e[9],e[10])],ext=axes.map((v,i)=>v.length()*half.getComponent(i));axes.forEach(v=>v.normalize());return {center,axes,ext};};
  const overlap=(a,b)=>{const d=b.center.clone().sub(a.center),axes=[...a.axes,...b.axes];for(const x of a.axes)for(const y of b.axes){const z=x.clone().cross(y);if(z.lengthSq()>1e-10)axes.push(z.normalize());}return axes.every(v=>a.axes.reduce((n,x,i)=>n+Math.abs(x.dot(v))*a.ext[i],0)+b.axes.reduce((n,x,i)=>n+Math.abs(x.dot(v))*b.ext[i],0)-Math.abs(d.dot(v))>.0015);};
  const targets=[...meshes(c),...meshes(familyDisplayDebug)],hits=new Map(),travel=[];
  function sweep(root,change){
   const others=targets.filter(o=>!under(o,root)&&o.name!==root.name+'-mount').map(o=>({o,b:bounds(o),obb:obb(o)}));
   for(let n=0;n<=30;n++){change(n/30);m.updateMatrixWorld(true);for(const o of meshes(root)){const b= bounds(o),a=obb(o);for(const k of others)if(b.intersectsBox(k.b)&&overlap(a,k.obb)){const key=o.name+'|'+k.o.name;hits.set(key,{moving:o.name,fixed:k.o.name,fraction:n/30});}}}
   s.reset();
  }
  for(let i=0;i<6;i++){s.reset();const d=s.drawers[i],f=d.getObjectByName('sideboard-drawer-bevel-'+i),t=d.getObjectByName('sideboard-drawer-tray-'+i),before=[f,t].map(o=>o.getWorldPosition(new T.Vector3()));s.setDrawer(i);travel.push([f,t].map((o,k)=>o.getWorldPosition(new T.Vector3()).sub(before[k]).toArray()));s.reset();sweep(d,t=>s.setDrawer(i,t));}
  for(const band of ['upper','base'])for(let i=0;i<6;i++)sweep(s.doors[band][i],t=>s.setDoor(band,i,t));
  sweep(s.serviceFace,t=>s.setService(t));s.reset();
  const top=bounds(c.getObjectByName('sideboard-400mm-worktop'),true),all=bounds(c,true),upper=bounds(c.getObjectByName('sideboard-upper-storage'),true),espresso=bounds(c.getObjectByName('espresso-machine'),true),back=bounds(c.getObjectByName('mesh_711'),true),body=bounds(c.getObjectByName('dispenser-concealed-body'),true);
  const trays=s.drawers.map((_,i)=>bounds(c.getObjectByName('sideboard-drawer-tray-'+i),true).getSize(new T.Vector3()).toArray());
  const rays=[];s.setService(1);for(const y of [1.096,1.60]){const ray=new T.Raycaster(c.localToWorld(new T.Vector3(1.36,y,.6)),new T.Vector3(0,0,-1).transformDirection(c.matrixWorld));rays.push(ray.intersectObjects(meshes(c),false)[0]?.object.name);}s.reset();
  return {counterDepth:top.max.z-top.min.z,totalDepth:all.max.z-all.min.z,width:all.max.x-all.min.x,upperDepth:upper.max.z-upper.min.z,setback:top.max.z-upper.max.z,wallBack:bounds(c).max.z,groupScale:c.scale.toArray(),espresso:{size:espresso.getSize(new T.Vector3()).toArray(),backGap:espresso.min.z-back.max.z,frontGap:top.max.z-espresso.max.z,angle:c.getObjectByName('espresso-machine').rotation.y},dispenserSize:body.getSize(new T.Vector3()).toArray(),trays,travel,serviceRays:rays,hits:[...hits.values()],quartz:back.getSize(new T.Vector3()).toArray(),upperCount:s.doors.upper.length,baseBevels:s.doors.base.map((d,i)=>d.getObjectByName('sideboard-base-bevel-'+i).userData),limits:'Current model sizes and sampled motions only; product ventilation, hardware and installation not surveyed.'};
 });
 console.log(JSON.stringify({...result,hits:result.hits.slice(0,10),hitCount:result.hits.length}));
 fs.writeFileSync('sideboard-depth-verification.json',JSON.stringify({revision:'sideboard-depth-40-10',verifiedAt:new Date().toISOString(),result,errors},null,2)+'\n');
 for(const [k,v] of Object.entries({counterDepth:.4,totalDepth:.4,width:3.9,upperDepth:.35,setback:.05,wallBack:7.17}))assert.ok(Math.abs(result[k]-v)<.001,k);
 assert.deepEqual(result.groupScale,[1,1,1]);assert.equal(result.upperCount,6);
 assert.ok(result.espresso.backGap>.01&&result.espresso.frontGap>.02);assert.ok(Math.abs(result.espresso.size[0]-.357)<.002&&Math.abs(result.espresso.size[2]-.294)<.002);
 assert.ok(result.dispenserSize.every((v,i)=>Math.abs(v-[.38,.44,.28][i])<.001));assert.ok(result.trays.every(a=>Math.abs(a[2]-.30)<.001));
 assert.ok(result.baseBevels.every(b=>b.bevelDegrees===45&&b.panelThickness===.022));assert.ok(result.travel.every(pair=>pair.every(a=>Math.abs(a[2]+.25)<.001)));
 assert.deepEqual(result.serviceRays,['dispenser-water-valve-lever','dispenser-power-splash-cover']);assert.equal(result.hits.length,0,JSON.stringify(result.hits.slice(0,10)));assert.deepEqual(errors,[]);
 await p.locator('#viewport').screenshot({path:'sideboard-depth40-corner.png'});
 await p.evaluate(()=>{Object.assign(columnViewDebug.state.targets.passageArt,{position:[10.65,1.60,4.70],look:[11.5,1.34,7.08]});columnViewDebug.visit('passageArt');});await p.waitForTimeout(650);await p.locator('#viewport').screenshot({path:'sideboard-depth40-overall.png'});
 await p.evaluate(()=>{sideboardDetailsDebug.setDrawer(1);columnViewDebug.visit('passageArt');});await p.waitForTimeout(500);await p.locator('#viewport').screenshot({path:'sideboard-depth40-drawer.png'});
 console.log('PASS: 400 mm sideboard, original-size appliances, 250 mm drawer travel, cabinet/service sweeps.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
