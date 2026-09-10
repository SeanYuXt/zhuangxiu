const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1450,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=layered-light');await page.waitForFunction(()=>window.lightingDesignDebug&&window.columnViewDebug?.state.ready,null,{timeout:60000});
 const geometry=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),model=masterDressingDebug.model,d=lightingDesignDebug;model.updateMatrixWorld(true);
  const b=o=>new T.Box3().setFromObject(o),pendant=b(model.getObjectByName('island-task-pendant')).getCenter(new T.Vector3());
  const solids=[];model.traverseVisible(o=>{if(o.isMesh&&!o.material?.transparent)solids.push(o);});
  const rays=d.sources.map(s=>{const ray=new T.Raycaster(s.position,s.target.clone().sub(s.position).normalize(),.0001,4);const hit=ray.intersectObjects(solids,false).find(h=>h.object!==s.source);return {id:s.id,kind:s.kind,first:hit?.object.name||null,distance:hit?.distance||null,y:hit?.point.y||null};});
  return {pendant:pendant.toArray(),report:d.report(),rays,pool:d.pool.length,shadowed:d.pool.every(l=>l.castShadow),pointLights:model.parent.children.filter(l=>l.isPointLight).length};
 });
 assert.ok(Math.abs(geometry.pendant[0]-7.47)<1e-6);assert.ok(Math.abs(geometry.pendant[2]-4.05)<1e-6);assert.equal(geometry.pool,8);assert.ok(geometry.shadowed);assert.equal(geometry.pointLights,0);
 assert.ok(geometry.report.length>=36);assert.equal(new Set(geometry.report.map(s=>s.id)).size,geometry.report.length);assert.ok(geometry.report.every(s=>s.position.concat(s.target).every(Number.isFinite)&&s.level===0&&s.visible));
 const immediateBlockers=geometry.rays.filter(r=>r.distance&&r.distance<.025);assert.deepEqual(immediateBlockers,[],'light mouth immediately blocked');
 assert.equal(geometry.rays.find(r=>r.id==='study-lamp-diffuser-1').first,'child-desk-top');
 assert.equal(geometry.rays.find(r=>r.id==='island-task-pendant-1').first,'island-prep-worktop');
 assert.ok(geometry.rays.find(r=>r.id==='dry-mirror-task-strip-1').first.startsWith('dry-'),'dry counter light misses the basin/counter');
 const rooms=[...new Set(geometry.report.map(s=>s.room))];assert.equal(rooms.length,9);
 const presets=[];
 await page.locator('#lightingDesignToggle').click();
 for(const id of ['evening','movie','study','night','off','day']){
  await page.locator(`[data-lighting-preset="${id}"]`).click();
  const result=await page.evaluate(()=>({preset:lightingDesignDebug.preset,report:lightingDesignDebug.report(),emission:lightingDesignDebug.sources.map(s=>s.source.material.emissiveIntensity)}));
  assert.equal(result.preset,id);if(['day','off'].includes(id)){assert.ok(result.report.every(s=>s.level===0));assert.ok(result.emission.every(v=>v===0));}
  if(id==='movie')assert.ok(result.report.filter(s=>s.kind==='basic').every(s=>s.level===0));
  if(id==='night')assert.ok(result.report.filter(s=>s.kind!=='night').every(s=>s.level===0));
  presets.push({id,on:result.report.filter(s=>s.level>0).length});
 }
 await page.selectOption('#lightingRoom','bed1');const check=page.locator('[data-lighting-fixture="bed1-main-light-1"]');await check.check();
 assert.equal(await page.evaluate(()=>lightingDesignDebug.report().find(s=>s.id==='bed1-main-light-1').level),1);
 assert.ok(await page.evaluate(()=>lightingDesignDebug.report().filter(s=>s.id!=='bed1-main-light-1').every(s=>s.level===0)));
 await page.locator('[data-lighting-preset="evening"]').click();await page.locator('[aria-label="关闭灯光"]').click();
 await page.locator('[data-mode="top"]').click();await page.locator('#lightingMode').click();await page.locator('[data-mode="look"]').click();
 assert.equal(await page.evaluate(()=>lightingDesignDebug.report().length),geometry.report.length,'top view must not permanently unregister roof fixtures');
 await page.locator('#lightingMode').click();
 const shots=[];
 for(const room of ['living','kitchen','bed1','master','bed3','bath1','bath2']){
  await page.selectOption('#roomSelect',room);await page.waitForFunction(id=>columnViewDebug.state.station===id,room);
  await page.screenshot({path:__dirname+'/lighting-'+room+'-evening.png'});shots.push(room);
 }
 // Rebuilding a candidate must remove its old source references without duplicating lamps.
 await page.selectOption('#roomSelect','master');await page.evaluate(()=>document.querySelector('[data-dressing-option="open"]').click());
 assert.ok(await page.evaluate(()=>lightingDesignDebug.sources.every(s=>{let o=s.source;while(o.parent)o=o.parent;return o.isScene;})));
 await page.evaluate(()=>document.querySelector('[data-dressing-option="balanced"]').click());
 assert.equal(await page.evaluate(()=>lightingDesignDebug.report().filter(s=>s.id==='master-foot-light-1').length),1);
 const bedMount=await page.evaluate(async()=>{const T=await import('./vendor/three.module.js'),bed=masterDressingDebug.model.getObjectByName('master-bed');bed.updateWorldMatrix(true,true);const b=new T.Box3().setFromObject(bed.children[0]),p=bed.getObjectByName('master-foot-light').getWorldPosition(new T.Vector3());return {offset:p.z-b.max.z,centerError:p.x-(b.min.x+b.max.x)/2,height:p.y};});
 assert.ok(Math.abs(bedMount.offset+.009)<1e-6,'cloned footlight must remain under the resized bed frame');assert.ok(Math.abs(bedMount.centerError)<1e-6);assert.ok(Math.abs(bedMount.height-.09)<1e-6);
 await page.setViewportSize({width:390,height:844});await page.locator('#mobileMenuToggle').click();await page.locator('#lightingDesignToggle').click();
 for(const id of rooms){await page.selectOption('#lightingRoom',id);assert.ok(await page.locator('[data-lighting-fixture]').count()>0);}
 const panel=await page.locator('#lightingDesignDialog').boundingBox();assert.ok(panel.x>=0&&panel.x+panel.width<=391);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:__dirname+'/lighting-controls-mobile.png'});await page.locator('[data-lighting-preset="night"]').click();await page.locator('[aria-label="关闭灯光"]').click();
 await page.locator('[data-quick-room="bed1"]').click();await page.screenshot({path:__dirname+'/lighting-bed1-night-mobile.png'});
 assert.deepEqual(errors,[]);const report={geometry,presets,shots,mobile:true,errors,limits:['Design lumen/CRI/watts targets, not measured illuminance','8 nearest shadowed lamps; not full realtime GI','Chrome viewport simulation, not physical-phone FPS','No photoreal acceptance from these checks']};fs.writeFileSync(__dirname+'/lighting-design-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify({fixtures:geometry.report.length,rooms,presets,rays:geometry.rays,mobile:true,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
