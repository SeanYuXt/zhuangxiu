// Diagnose bed orientation without changing the user's baseline model.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bed1');await page.waitForFunction(()=>window.columnViewDebug?.state.ready);
 const result=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{rooms,P}=await import('./plan.js');
  const model=columnViewDebug.dryStudy.model,bed=model.getObjectByName('bed1-bed'),door=model.getObjectByName('door-bed1-single'),wardrobe=model.getObjectByName('bed1-wardrobe'),desk=model.getObjectByName('bed1-desk');
  const position=bed.position.clone(),rotation=bed.rotation.clone(),doorRotation=door.rotation.clone(),poly=rooms.find(r=>r.id==='bed1').poly.map(P);
  const box=o=>new T.Box3().setFromObject(o),record=b=>({min:b.min.toArray(),max:b.max.toArray()});
  const inside=(x,z)=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
  const meshes=o=>{const out=[];o.traverse(m=>{if(m.isMesh)out.push(m);});return out;};
  // All furniture is upright: use local-box plan polygons + world vertical intervals.
  const shape=m=>{m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;return {poly:[[b.min.x,b.min.z],[b.max.x,b.min.z],[b.max.x,b.max.z],[b.min.x,b.max.z]].map(([x,z])=>{const p=m.localToWorld(new T.Vector3(x,0,z));return [p.x,p.z];}),bounds:box(m)};};
  const intersects=(a,b)=>{
   if(Math.min(a.bounds.max.y,b.bounds.max.y)-Math.max(a.bounds.min.y,b.bounds.min.y)<=.001)return false;
   for(const points of [a.poly,b.poly])for(let i=0;i<points.length;i++){
    const p=points[i],q=points[(i+1)%points.length],axis=[q[1]-p[1],p[0]-q[0]],len=Math.hypot(...axis);if(len<1e-8)continue;
    const project=poly=>poly.map(v=>(v[0]*axis[0]+v[1]*axis[1])/len),pa=project(a.poly),pb=project(b.poly);
    if(Math.min(Math.max(...pa),Math.max(...pb))-Math.max(Math.min(...pa),Math.min(...pb))<=.001)return false;
   }return true;
  };
  const rows=[];
  for(const variant of [{key:'original',x:position.x,z:position.z,angle:rotation.y},{key:'reverse_only',x:position.x,z:position.z,angle:Math.PI/2},{key:'left_solid_wall',x:1.94,z:4.02,angle:Math.PI/2}]){
   bed.position.set(variant.x,position.y,variant.z);bed.rotation.y=variant.angle;model.updateMatrixWorld(true);
   const bedMeshes=meshes(bed),fixed=[...meshes(wardrobe),...meshes(desk)],bedShapes=bedMeshes.map(shape),outside=[],collisions=[],doorSamples=[];
   bedShapes.forEach((s,i)=>{if(s.poly.some(([x,z])=>!inside(x,z)))outside.push({child:i,name:bedMeshes[i].name});});
   fixed.forEach(m=>{const s=shape(m);bedShapes.forEach((b,i)=>{if(intersects(b,s))collisions.push({bedMesh:i,bedName:bedMeshes[i].name,other:m.name,otherParent:m.parent.name});});});
   for(let deg=0;deg<=90;deg++){
    door.rotation.y=door.userData.base+door.userData.turn*deg*Math.PI/180;door.updateWorldMatrix(true,true);
    for(const m of meshes(door)){const s=shape(m);bedShapes.forEach((b,i)=>{if(intersects(b,s))doorSamples.push({deg,bedMesh:i,bedName:bedMeshes[i].name,doorPart:m.name});});}
   }
   door.rotation.copy(doorRotation);door.updateWorldMatrix(true,true);
   const head=box(bed.children[2]),base=box(bed.children[0]);
   rows.push({...variant,bedBase:record(base),headboard:record(head),wardrobe:record(box(wardrobe)),outside,collisions,doorSamples,
    leftHeadBackOnlyOnSolidWall:variant.angle>0&&head.min.x>=.8&&head.min.z>=3.18&&head.max.z<=5.39,
    bedToWardrobeZmm:Math.round((box(wardrobe).min.z-base.max.z)*1000)});
  }
  bed.position.copy(position);bed.rotation.copy(rotation);door.rotation.copy(doorRotation);model.updateMatrixWorld(true);
  return {rows,restored:bed.position.equals(position)&&bed.rotation.equals(rotation)&&door.rotation.equals(doorRotation),source:'current home-facilities.glb; plan.js boundary; original meshes unchanged',limits:['Only upright mesh bounding prisms, not exact curved surfaces','600 mm access is not assessed by this test','No site survey, product selection or window-opening approval','Only existing bed dimensions; 1.2 m option not selected']};
 });
 assert.equal(result.restored,true);assert.deepEqual(errors,[]);
 fs.writeFileSync(__dirname+'/elder-layout-audit.json',JSON.stringify({...result,errors},null,2));
 console.log(JSON.stringify(result.rows.map(r=>({key:r.key,outside:r.outside,collisions:r.collisions,doorSamples:r.doorSamples,leftHeadBackOnlyOnSolidWall:r.leftHeadBackOnlyOnSolidWall,bedToWardrobeZmm:r.bedToWardrobeZmm})),null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
