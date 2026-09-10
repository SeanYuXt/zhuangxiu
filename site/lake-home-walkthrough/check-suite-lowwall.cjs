const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const originalFiles=['master-suite-plumbing-study.js','master-suite-details.js','master-suite-plumbing-spec.json','master-suite-plumbing-study.html'];
const before=Object.fromEntries(originalFiles.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(__dirname+'/'+f)).digest('hex')]));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
 const page=await browser.newPage({viewport:{width:1540,height:980}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-suite-lowwall-study.html?view=footwall&v=lowwall-option-01');
 await Promise.race([page.waitForFunction(()=>window.masterPlumbing?.ready,null,{timeout:15000}),new Promise((_,reject)=>page.once('pageerror',reject))]);
 const r=await page.evaluate(()=>({audit:masterPlumbing.audit,details:masterPlumbing.detailsAudit,spec:masterPlumbing.spec}));
 assert.equal(r.audit.ok,true);assert.deepEqual(r.details.errors,[]);
 assert.ok(Math.abs(r.details.lowGap-.869)<.001);assert.ok(Math.abs(r.details.footGap-.669)<.001);assert.ok(Math.abs(r.details.drawerGap-.519)<.001);
 assert.deepEqual(r.spec.furniture.bed.mattress,[1.8,1.9]);assert.equal(r.spec.furniture.lowCabinet.height,.80);
 const original=JSON.parse(fs.readFileSync(__dirname+'/master-suite-plumbing-spec.json','utf8'));
 for(const key of['spaces','walls','openings'])assert.deepEqual(r.spec[key],original[key]);
 for(const key of['bed','wardrobe','vanity','chair','nightstand','rightTable','entryCorner'])assert.deepEqual(r.spec.furniture[key],original.furniture[key]);
 assert.equal(r.details.stowedRoute.ok,true);assert.equal(r.details.occupiedRoute.ok,false);
 await page.locator('#labels').uncheck();
 for(const view of['plan','footwall','room','arch','suite','bed','vanity','bath','reading','storagePlan']){
 await page.evaluate(v=>masterPlumbing.choose(v),view);await page.waitForTimeout(250);
 if(['plan','footwall','room','arch','suite'].includes(view))await page.screenshot({path:__dirname+'/master-suite-review-solid-head/lowwall-option-01-'+view+'.png'});
 }
 await page.evaluate(()=>masterPlumbing.choose('footwall'));
 for(const mode of['0','1','drawer','inside','closed']){
 await page.locator('#foot-cabinet').selectOption(mode);await page.waitForTimeout(250);
 if(mode!=='closed')await page.screenshot({path:__dirname+'/master-suite-review-solid-head/lowwall-option-01-use-'+mode+'.png'});
 }
 // Sample the real hinged door meshes against the bed frame, not only closed footprints.
 const cabinetDoorAudit=await page.evaluate(async()=>{
 const T=await import('./vendor/three.module.js'),s=masterPlumbing.spec,bed=new T.Box3(new T.Vector3(s.furniture.bed.r[0],.22,s.furniture.bed.r[1]),new T.Vector3(s.furniture.bed.r[2],.70,s.furniture.bed.r[3]));
 const leaves=[];masterPlumbing.scene.traverse(o=>{if(o.name==='high-door')leaves.push(o);});
 const hits=[];for(const [i,o]of leaves.entries()){for(let a=0;a<=90;a++){o.parent.rotation.y=(i%2?-1:1)*a*Math.PI/180;masterPlumbing.scene.updateMatrixWorld(true);if(new T.Box3().setFromObject(o).intersectsBox(bed))hits.push([i,a]);}o.parent.rotation.y=0;}
 return{leafCount:leaves.length,hits};
 });
 assert.equal(cabinetDoorAudit.leafCount,4);assert.deepEqual(cabinetDoorAudit.hits,[]);
 await page.locator('#light-scene').selectOption('evening');await page.waitForTimeout(250);await page.screenshot({path:__dirname+'/master-suite-review-solid-head/lowwall-option-01-night.png'});
 await page.locator('#light-scene').selectOption('day');
 for(const id of['door','bath-angle'])for(const v of['0','90'])await page.locator('#'+id).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},v);
 await page.locator('#chair-pull').check();await page.locator('#drawer-open').check();await page.locator('#care-open').check();
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>masterPlumbing.choose('plan'));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 for(const f of originalFiles)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(__dirname+'/'+f)).digest('hex'),before[f]);
 console.log(JSON.stringify({ok:true,audit:r.audit,details:r.details,cabinetDoorAudit,originalHashes:before,mobileOverflow:false,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

