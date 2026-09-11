// Catch actual moving-door/basket/rack collisions after the balcony dimensional correction.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
 await page.goto('http://127.0.0.1:8774/lake-home-walkthrough/column-view.html?space=balconyDesign&v=balcony-right-utility-3');
 await page.waitForFunction(()=>window.columnViewDebug?.state.ready,{},{timeout:90000});
 await page.waitForFunction(()=>window.columnCheck&&window.immersivePreviewDebug&&document.querySelector('#viewerDetailToggle')).catch(async error=>{console.error(await page.locator('#busy').textContent());throw error;});
 const result=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),m=columnViewDebug.dryStudy.model,b=balconyLayoutDebug,l=laundryDetailsDebug,d=balconyDryingDebug,t=tvDisplayDebug,c=balconyCareDebug;
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const bounds=o=>{const b=new T.Box3();o.traverse(c=>{if(c.isMesh&&visible(c)){c.geometry.computeBoundingBox();b.union(c.geometry.boundingBox.clone().applyMatrix4(c.matrixWorld));}});return b;};
  const desc=o=>{const a=bounds(o);return {name:o.name,min:a.min.toArray(),max:a.max.toArray(),size:a.getSize(new T.Vector3()).toArray()};};
  const ancestor=(o,p)=>{for(let a=o;a;a=a.parent)if(a===p)return true;return false;};
  const hit=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>.001);
  const triangleHit=(a,o)=>{const p=o.geometry.attributes.position,idx=o.geometry.index,tri=new T.Triangle();for(let i=0;i<(idx?.count||p.count);i+=3){for(let j=0;j<3;j++)[tri.a,tri.b,tri.c][j].fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(o.matrixWorld);if(a.intersectsTriangle(tri))return true;}return false;};
  m.updateMatrixWorld(true);
  const fixed=[];m.traverse(o=>{if(!o.isMesh||!visible(o))return;const a=bounds(o);if(a.max.x<6.5||a.min.x>12.12||a.min.z>3.2||a.max.z<.12||a.max.y<.04)return;fixed.push({o,a});});
  const movingRoots=[b.hamper,d.group,c.door,c.robot,c.cassette,...t.doors,l.units.washer.door,l.units.dryer.door];
  const fixedOutside=(o,except)=>!except.some(p=>ancestor(o,p));
  const hits={hamper:[],washer:[],dryer:[],display:[],drying:[],tools:[],robot:[],maintenance:[]};
  function sweep(label,root,pose,except){const candidates=fixed.filter(({o})=>fixedOutside(o,except));for(let i=0;i<=25;i++){pose(i/25);const meshes=[];root.traverse(o=>{if(o.isMesh&&visible(o))meshes.push(o);});for(const mesh of meshes){const a=bounds(mesh);for(const f of candidates)if(hit(a,f.a)&&triangleHit(a,f.o))hits[label].push({pose:i,part:mesh.name,obstacle:f.o.name});}}}
  sweep('hamper',b.hamper,b.setHamper,movingRoots);b.setHamper(0);
  for(const kind of ['washer','dryer']){sweep(kind,l.units[kind].door,f=>l.set(kind,f*90),[...movingRoots,l.units[kind].unit,l.kit]);l.reset();}
  for(const [i,door] of t.doors.entries())sweep('display',door,f=>{door.rotation.y=f*Math.PI/2*(i===0?-1:1);m.updateMatrixWorld(true);},movingRoots);t.setDisplayOpen(false);
  d.setLoaded(true);sweep('drying',d.moving,d.setFraction,movingRoots);d.setFraction(0);d.setLoaded(false);
  sweep('tools',c.door,c.setRackFraction,movingRoots);c.setRackFraction(0);
  sweep('robot',c.robot,f=>{c.robot.position.z=.115+f*.70;m.updateMatrixWorld(true);},movingRoots);c.setRobotOut(false);
  sweep('maintenance',b.hamper,f=>c.setMaintenanceFraction(f*.5),movingRoots);
  sweep('maintenance',c.cassette,f=>c.setMaintenanceFraction(.5+f*.5),movingRoots);c.setMaintenance(false);
  for(const key of Object.keys(hits))hits[key]=Array.from(new Map(hits[key].map(x=>[x.part+'|'+x.obstacle,x])).values());
  const names=['retained-balcony-column','retained-balcony-beam-envelope','balcony-laundry-cabinet','washer-panel-shell','laundry-washer','balcony-wet-hamper','balcony-handwash-sink','balcony-removable-hamper','balcony-handwash-services','tv-display-lake','tv-low-console','lake-bar-left','lake-bar-right','balcony-care-cabinet','balcony-drying-rack','stone-island','integrated-fridge','flush-entry-cabinet'];
  const objects=names.map(n=>desc(m.getObjectByName(n)));
  const column=bounds(m.getObjectByName('retained-balcony-column')),basin=bounds(m.getObjectByName('handwash-bowl-floor')),basket=bounds(b.basket),service=bounds(b.services),bar=bounds(m.getObjectByName('lake-bar-right').children[0]);
  b.setHamper(1);const hamperOpen=bounds(b.hamper);b.setHamper(0);
  const stance=new T.Box3(new T.Vector3(10.25,0,.74),new T.Vector3(10.85,1.75,1.34));
  l.set('washer',90);l.set('dryer',90);d.setLoaded(true);d.setFraction(1);
  const stanceHits=[];m.traverse(o=>{if(!o.isMesh||!visible(o))return;const a=bounds(o);if(a.max.y<.04||a.min.y>=1.75)return;if(hit(stance,a)&&triangleHit(stance,o))stanceHits.push(o.name);});
  l.reset();d.setLoaded(false);d.setFraction(0);
  const console=bounds(m.getObjectByName('tv-low-console')),display=bounds(m.getObjectByName('tv-console-lake-extension')),care=bounds(c.group),washer=bounds(l.cabinet),wet=bounds(b.wet),cabinetEnd=Math.max(care.max.z,washer.max.z,wet.max.z),cabinetStart=Math.min(care.min.z,washer.min.z,wet.min.z);
  return {objects,hits,stanceHits:[...new Set(stanceHits)],rightUtilityOnly:care.min.x>11,utilityRun:cabinetEnd-cabinetStart,windowMargin:cabinetStart-.2,columnLineMargin:column.min.z-cabinetEnd,tvCabinetJoint:console.min.z-display.max.z,tvFootprintsOverlap:hit(console,display),columnClearDepth:column.min.z-b.spec.shell.glassInnerZ,basketToBowl:basin.min.y-basket.max.y,hamperOpenToBar:hamperOpen.min.x-bar.max.x,limits:'模型门/篮/衣物网格包络检查；基站为须前维护的上下水候选包络，不证明实机安装、结构尺寸、人体完整操作或额定承重。'};
 });
 result.errors=errors;fs.writeFileSync(__dirname+'/balcony-integrated-verification.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify(result));
 await page.waitForTimeout(1000);await page.screenshot({path:__dirname+'/balcony-integrated-overall.png'});
 await page.evaluate(()=>columnViewDebug.visit('laundry'));await page.waitForTimeout(800);await page.screenshot({path:__dirname+'/balcony-integrated-laundry.png'});
 await page.locator('#viewerDetailToggle').click();await page.locator('[data-balcony-action="hamper"]').click();await page.waitForTimeout(400);await page.screenshot({path:__dirname+'/balcony-integrated-hamper.png'});
 await page.locator('[data-balcony-action="tools"]').click();await page.waitForTimeout(400);await page.screenshot({path:__dirname+'/balcony-right-tools.png'});await page.locator('[data-balcony-action="tools"]').click();
 await page.locator('[data-balcony-action="maintenance"]').click();await page.waitForTimeout(400);await page.screenshot({path:__dirname+'/balcony-right-maintenance.png'});await page.locator('[data-balcony-action="maintenance"]').click();
 await page.evaluate(()=>{balconyLayoutDebug.reset();columnViewDebug.visit('drying');});await page.locator('#viewerDetailToggle').click();await page.locator('[data-drying-action="lower"]').click();await page.locator('[data-drying-action="load"]').click();await page.waitForTimeout(500);await page.screenshot({path:__dirname+'/balcony-integrated-drying.png'});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>columnViewDebug.visit('balconyDesign'));await page.waitForTimeout(600);await page.screenshot({path:__dirname+'/balcony-integrated-mobile.png'});
 assert.deepEqual(errors,[]);assert.ok(Math.abs(result.columnClearDepth-1.45)<.001);assert.ok(result.basketToBowl>.04);assert.equal(result.rightUtilityOnly,true);assert.equal(result.tvFootprintsOverlap,false);
 for(const [action,hits] of Object.entries(result.hits))assert.deepEqual(hits,[],action);assert.deepEqual(result.stanceHits,[]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
