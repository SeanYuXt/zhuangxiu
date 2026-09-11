// Check combined use, maintenance interlock, mobile controls and the linked design drawing.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8774/lake-home-walkthrough/column-view.html?space=laundry&v=balcony-right-utility-3');
 await page.waitForFunction(()=>window.columnCheck&&window.immersivePreviewDebug&&document.querySelector('#viewerDetailToggle'),{},{timeout:90000});
 await page.evaluate(()=>columnViewDebug.visit('laundry'));
 if(await page.locator('#viewerDetailToggle').getAttribute('aria-expanded')!=='true')await page.locator('#viewerDetailToggle').click();
 for(const key of ['tools','robot','display','maintenance']){await page.locator(`[data-balcony-action="${key}"]`).click();assert.equal(await page.locator(`[data-balcony-action="${key}"]`).getAttribute('aria-pressed'),'true');}
 const combined=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),m=columnViewDebug.dryStudy.model,c=balconyCareDebug,b=balconyLayoutDebug,l=laundryDetailsDebug,t=tvDisplayDebug,curtain=curtainDetailsDebug.rooms.living;
  l.set('washer',90);l.set('dryer',90);m.updateMatrixWorld(true);
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const meshes=root=>{const a=[];root.traverse(o=>{if(o.isMesh&&visible(o)){o.geometry.computeBoundingBox();a.push({o,b:o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)});}});return a;};
  const overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>.001);
  const triangleHit=(a,o)=>{const p=o.geometry.attributes.position,idx=o.geometry.index,tri=new T.Triangle();for(let i=0;i<(idx?.count||p.count);i+=3){for(let j=0;j<3;j++)[tri.a,tri.b,tri.c][j].fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(o.matrixWorld);if(a.intersectsTriangle(tri))return true;}return false;};
  const hits=[];
  function check(label,a,b){for(const x of meshes(a))for(const y of meshes(b))if(overlap(x.b,y.b)&&triangleHit(x.b,y.o))hits.push({label,a:x.o.name,b:y.o.name});}
  check('front maintenance',b.hamper,c.cassette);check('robot / basket',c.robot,b.hamper);
  for(const door of [l.units.washer.door,l.units.dryer.door,...t.doors])check('tool rack / open door',c.door,door);
  const poses=[];for(const f of [0,.5,1]){curtain.set(f);m.updateMatrixWorld(true);for(const root of [b.wet,c.group,l.cabinet])check('curtain '+f,curtain.root,root);const bounds=new T.Box3().setFromObject(curtain.root);poses.push({fraction:f,min:bounds.min.toArray(),max:bounds.max.toArray(),leaves:curtain.leaves.length});}
  curtain.set(0);l.reset();return {hits:Array.from(new Map(hits.map(h=>[JSON.stringify(h),h])).values()),curtain:poses};
 });
 await page.locator('[data-balcony-action="hamper"]').click();
 assert.equal(await page.evaluate(()=>balconyCareDebug.maintenance),false);
 assert.equal(await page.locator('[data-balcony-action="maintenance"]').getAttribute('aria-pressed'),'false');
 await page.locator('[data-laundry-action="reset"]').click();
 if(await page.locator('#viewerDetailToggle').getAttribute('aria-expanded')!=='true')await page.locator('#viewerDetailToggle').click();
 for(const key of ['tools','robot','display','maintenance','hamper'])assert.equal(await page.locator(`[data-balcony-action="${key}"]`).getAttribute('aria-pressed'),'false');
 const inside=await page.locator('#laundryActions button').evaluateAll(bs=>bs.every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}));assert.equal(inside,true);
 await page.locator('[data-balcony-action="tools"]').click();await page.screenshot({path:__dirname+'/balcony-right-mobile-controls.png'});
 await page.evaluate(()=>columnViewDebug.visit('care'));assert.equal(await page.locator('#balconyCareActions').isVisible(),false);
 await page.locator('#viewerDetailToggle').click();assert.equal(await page.locator('#balconyCareActions').isVisible(),true);
 await page.locator('#careRobotDemo').click();await page.locator('#careDoorDemo').click();
 await page.locator('#careMaintenance').click();
 await page.screenshot({path:__dirname+'/balcony-right-mobile-care.png'});
 const plan=await browser.newPage({viewport:{width:1440,height:1000}});plan.on('pageerror',e=>errors.push(e.message));
 await plan.goto('http://127.0.0.1:8774/lake-home-walkthrough/balcony-design-plan.html');await plan.locator('#design text').first().waitFor();
 await plan.screenshot({path:__dirname+'/balcony-right-plan-desktop.png',fullPage:true});
 await plan.locator('[data-view="plan"]').click();await plan.locator('#loaded').click();assert.equal(await plan.locator('#loaded').getAttribute('aria-pressed'),'true');
 await plan.screenshot({path:__dirname+'/balcony-right-plan-layout.png',fullPage:true});
 await plan.setViewportSize({width:390,height:844});await plan.locator('[data-view="elevation"]').click();
 assert.equal(await plan.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await plan.screenshot({path:__dirname+'/balcony-right-plan-mobile.png',fullPage:true});
 const result={combined,mobileControlsInsideViewport:inside,errors};fs.writeFileSync(__dirname+'/balcony-right-ui-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 assert.deepEqual(errors,[]);assert.deepEqual(combined.hits,[]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
