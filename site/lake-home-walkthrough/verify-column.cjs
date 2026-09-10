const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1450,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/index.html');await page.waitForFunction(()=>window.homeDebug);
 const conflicts=await page.evaluate(async()=>{const T=await import('./vendor/three.module.js'),{columnCorrection:c,notes}=await import('./plan.js'),h=homeDebug,delta=(c.point[1]-notes.column.point[1])/100,checks=[];
 for(const name of ['lake-bar-left','lake-bar-right']){const wing=h.scene.getObjectByName(name);wing.updateWorldMatrix(true,true);for(const chair of wing.children.filter(o=>o.name==='upholstered-counter-stool')){const b=new T.Box3().setFromObject(chair);b.min.z+=delta;b.max.z+=delta;const hits=h.colliders.filter(o=>['沙发','岛台','岛台座椅'].includes(o.name)&&Math.min(b.max.x,o.x2)-Math.max(b.min.x,o.x1)>.001&&Math.min(b.max.z,o.z2)-Math.max(b.min.z,o.z1)>.001);checks.push({wing:name,hits:hits.map(o=>o.name)});}}
 return {deltaMetres:delta,checks};});assert.ok(conflicts.checks.some(c=>c.hits.length));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-check.html?plan=1');await page.waitForFunction(()=>window.columnCheck);const relation=await page.evaluate(()=>columnCheck);assert.equal(relation.oldDistance,.29);assert.equal(relation.newDistance,1.5);assert.equal(relation.pendingFurniture,true);await page.screenshot({path:path.join(__dirname,'column-check.png')});assert.deepEqual(errors,[]);console.log(JSON.stringify({relation,conflicts,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
