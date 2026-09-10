const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:390,height:844},hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=entry');await p.waitForFunction(()=>window.interiorMirrorsDebug?.state.count===6);
 const cases=[['entry','entry-dressing-mirror'],['care','balcony-care-upper'],['master','master-makeup-desk'],['bath2','bath2-vanity'],['bath1','dry-mirror-storage']];const states=[];
 for(const [room,object] of cases){
  await p.locator('#allPlaces').click();await p.locator(`[data-place="${room}"]`).click();await p.locator('#placeDetails').click();
  const detail=p.locator(`[data-detail-object="${object}"]`);if(await detail.count())await detail.click();else await p.locator('#mobilePlaceSheet [aria-label="关闭"]').click();
  if(room==='bath1'){await p.evaluate(()=>columnViewDebug.dryStudy.controls.setMirror(false));await p.locator('#view3d').dispatchEvent('pointerdown',{clientX:190,clientY:400,pointerId:1});await p.locator('#view3d').dispatchEvent('pointerup',{clientX:190,clientY:400,pointerId:1});}
  await p.screenshot({path:__dirname+`/mirror-${room}-mobile.png`});states.push({room,state:await p.evaluate(()=>interiorMirrorsDebug.state)});
 }
 // Independent optical regression using the same runtime manager: red cube's reflection
 // must move in the render target when the cube moves, not remain a static HDR image.
 const optical=await p.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{createInteriorMirrors}=await import('./interior-mirrors.js');
  const scene=new T.Scene();scene.background=new T.Color('#ffffff');const model=new T.Group();scene.add(model);const source=new T.Mesh(new T.BoxGeometry(2,2,.02),new T.MeshStandardMaterial({metalness:.85}));source.name='makeup-mirror';model.add(source);
  const cube=new T.Mesh(new T.BoxGeometry(.28,.28,.28),new T.MeshBasicMaterial({color:'#ff0000'}));cube.position.set(.4,0,.6);model.add(cube);
  const manager=createInteriorMirrors(model),camera=new T.PerspectiveCamera(55,1,.1,10);camera.position.set(0,0,2);camera.lookAt(0,0,0);
  const r=new T.WebGLRenderer({antialias:false});r.setSize(256,256);const counts=[];
  for(const x of [.4,-.4]){cube.position.x=x;manager.prepare(camera);r.render(scene,camera);const target=manager.entries[0].mirror.getRenderTarget(),pixels=new Uint16Array(target.width*target.height*4);r.readRenderTargetPixels(target,0,0,target.width,target.height,pixels);let sumX=0,count=0;for(let j=0;j<pixels.length;j+=4)if(pixels[j]>1000&&pixels[j]>pixels[j+1]*2&&pixels[j]>pixels[j+2]*2){sumX+=(j/4)%target.width;count++;}counts.push({count,x:sumX/count});}
  manager.setExportMode(true);const exportSafe=manager.entries.every(e=>!e.mirror.visible&&e.source.material===e.original);
  const {GLTFExporter}=await import('./vendor/render-libs.js');const gltf=await new GLTFExporter().parseAsync(model,{binary:false,onlyVisible:true});const exportNodes=gltf.nodes.map(n=>n.name||'unnamed'),exportMaterials=gltf.materials.map(m=>m.pbrMetallicRoughness);manager.setExportMode(false);
  manager.entries.forEach(e=>e.mirror.dispose());r.dispose();return {counts,exportSafe,exportNodes,exportMaterials};
 });
 assert.ok(optical.counts.every(c=>c.count>100));assert.ok(Math.abs(optical.counts[0].x-optical.counts[1].x)>30);assert.equal(optical.exportSafe,true);
 assert.ok(!optical.exportNodes.some(n=>n.startsWith('interior-reflection-')));assert.ok(optical.exportMaterials.some(m=>m.metallicFactor===.85));
 const slide=await p.evaluate(async()=>{const T=await import('./vendor/three.module.js'),d=columnViewDebug.dryStudy.controls,e=interiorMirrorsDebug.entries.find(e=>e.source.name==='dry-mirror-door-0');d.setMirror(false);const a=e.mirror.getWorldPosition(new T.Vector3());d.setMirror(true);const b=e.mirror.getWorldPosition(new T.Vector3());d.setMirror(false);return b.sub(a).toArray();});assert.ok(slide[0]>.25);
 const lifecycle=await p.evaluate(()=>{masterDressingDebug.controller.choose('storage');masterDressingDebug.controller.choose('balanced');interiorMirrorsDebug.sync(true);return interiorMirrorsDebug.state;});assert.equal(lifecycle.count,6);assert.equal(lifecycle.entries.filter(e=>e.label==='主卧梳妆镜').length,1);
 await p.setViewportSize({width:1450,height:950});await p.evaluate(()=>masterDressingDebug.controller.choose('balanced'));await p.screenshot({path:__dirname+'/mirror-master-desktop.png'});assert.ok((await p.evaluate(()=>interiorMirrorsDebug.state)).entries.every(e=>e.resolution===1024));
 await p.mouse.move(700,430);await p.mouse.down();
 const timing=await p.evaluate(async()=>{const canvas=document.querySelector('#view3d'),deltas=[],before=interiorMirrorsDebug.state.updates;let last=performance.now();for(let i=0;i<36;i++){await new Promise(requestAnimationFrame);const now=performance.now();deltas.push(now-last);last=now;canvas.dispatchEvent(new PointerEvent('pointermove',{clientX:700+Math.sin(i/10)*10,clientY:430,pointerId:1,bubbles:true}));}deltas.sort((a,b)=>a-b);return {frames:deltas.length,reflectionUpdates:interiorMirrorsDebug.state.updates-before,medianMs:deltas[18],p95Ms:deltas[34],note:'headless Chrome desktop frame scheduling; not physical phone FPS'};});await p.mouse.up();assert.ok(timing.reflectionUpdates>0);
 assert.deepEqual(errors,[]);const result={states,optical,slide,lifecycle,timing,errors,limits:'单次平面反射，不包含多镜无限互映；视口测试不是实机GPU性能认证。'};fs.writeFileSync(__dirname+'/interior-mirrors-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify({optical,slide,timing,errors,states:states.map(s=>({room:s.room,count:s.state.count,enabled:s.state.entries.filter(e=>e.enabled).map(e=>e.label)}))}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
