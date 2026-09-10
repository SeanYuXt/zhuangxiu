// Find actual 600mm standing positions before spending another HD render.
// Fixed furniture, moderate lenses and explicit frame ratios; no room stretching.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=master');await page.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.walkDebug);
 const result=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{rooms,P}=await import('./plan.js'),m=masterDressingDebug.model,wardrobe=m.getObjectByName('master-wardrobe'),poly=rooms.find(r=>r.id==='master').poly.map(P),meshes=[],obstacles=[];
  m.updateMatrixWorld(true);const box=o=>new T.Box3().setFromObject(o),b=box(wardrobe),inside=(x,z)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],c=poly[j];if((a[1]>z)!==(c[1]>z)&&x<(c[0]-a[0])*(z-a[1])/(c[1]-a[1])+a[0])hit=!hit;}return hit;};
  m.traverseVisible(o=>{if(!o.isMesh||o.isReflector)return;meshes.push(o);const q=box(o);if(q.max.y>.03&&q.min.y<1.9&&q.max.x>12.2&&q.min.x<18.2&&q.max.z>.2&&q.min.z<5.6)obstacles.push(q);});
  const free=(x,z)=>inside(x,z)&&Array.from({length:32},(_,i)=>i).every(i=>inside(x+.30*Math.cos(i*Math.PI/16),z+.30*Math.sin(i*Math.PI/16)))&&!obstacles.some(q=>{const dx=Math.max(q.min.x-x,0,x-q.max.x),dz=Math.max(q.min.z-z,0,z-q.max.z);return dx*dx+dz*dz<.09-1e-9;});
  const front=b.min.z,cx=(b.min.x+b.max.x)/2,points=[];for(const x of [b.min.x+.02,cx,b.max.x-.02])for(const y of [.11,1.30,2.58])points.push(new T.Vector3(x,y,front+.035));
  const camera=new T.PerspectiveCamera(),ray=new T.Raycaster(),belongs=o=>{for(let q=o;q;q=q.parent)if(q===wardrobe)return true;return false;};
  const configs=[];for(const lens of [24,22,20])for(const aspect of [16/9,4/3,1])configs.push({lens,aspect,best:null,fitCount:0});
  let standingPoints=0;for(let ix=125;ix<=179;ix++)for(let iz=7;iz<=52;iz++){
   const x=ix/10,z=iz/10;if(!free(x,z)||z>front-.1)continue;standingPoints++;
   for(const y of [1.5,1.6])for(const lookY of [1.30,1.45]){
    camera.position.set(x,y,z);camera.lookAt(cx,lookY,front);camera.updateMatrixWorld(true);
    let visible=0;for(const p of points){const d=p.clone().sub(camera.position);ray.set(camera.position,d.clone().normalize());ray.far=d.length()+.1;const hit=ray.intersectObjects(meshes,false).find(h=>!(h.object.material?.transparent&&h.object.material.opacity<.3));if(hit&&belongs(hit.object))visible++;}
    for(const cfg of configs){camera.aspect=cfg.aspect;camera.fov=2*Math.atan(36/(2*cfg.lens*Math.max(1,cfg.aspect)))*180/Math.PI;camera.updateProjectionMatrix();const projections=points.map(p=>p.clone().project(camera));const overflow=Math.max(...projections.flatMap(p=>[Math.abs(p.x),Math.abs(p.y)])),angle=Math.abs(Math.atan2(x-cx,front-z))*180/Math.PI;
     const fits=overflow<=.94&&projections.every(p=>p.z>-1&&p.z<1);if(fits)cfg.fitCount++;
     const score=(fits?100:0)+visible*3-overflow*5-angle*.05;
     if(!cfg.best||score>cfg.best.score)cfg.best={position:[x,y,z],look:[cx,lookY,front],overflow,visible,total:points.length,angle,fits,score};
    }
   }
  }
  return {standingPoints,bounds:{min:b.min.toArray(),max:b.max.toArray()},configs,scope:'600mm standing circle over all visible low meshes; 9 front samples, actual visibility rays; 6% framing margin. Grid search is not proof no other viewpoint exists.'};
 });fs.writeFileSync(__dirname+'/master-framing-audit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
