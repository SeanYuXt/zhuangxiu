const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const root='D:/tep-chat/output/lake-home-walkthrough/';
(async()=>{const oldFiles=['master-suite-plumbing-spec.json','master-suite-plumbing-study.js','master-suite-details.js','master-foot-wardrobe.js'];
const hashes=()=>Object.fromEntries(oldFiles.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(root+f)).digest('hex')]));const before=hashes();
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});try{
const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});
await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=whole');await page.waitForFunction(()=>window.masterWindowOption?.ready,null,{timeout:15000});
const a=await page.evaluate(()=>({s:masterWindowOption.spec,a:masterWindowOption.audit})),old=JSON.parse(fs.readFileSync(root+'master-suite-plumbing-spec.json','utf8'));
assert.deepEqual(a.a.errors,[]);assert.equal(a.a.installation.ready,false);assert.ok(Math.abs(a.a.installation.topGap-.03)<1e-8);
assert.deepEqual(a.s.walls,old.walls);assert.deepEqual(a.s.openings,old.openings);assert.deepEqual(a.s.furniture.bed,old.furniture.bed);
assert.deepEqual(a.s.furniture.vanity.r,[.02,2.12,.47,3.12]);assert.deepEqual(a.s.furniture.wardrobe.r,[.02,3.12,.67,4.62]);assert.equal(a.s.furniture.footCabinet.r[2],5.35);
assert.deepEqual(a.s.design.equipment.ac.r,[5.10,1.35,5.35,2.30]);assert.equal(a.s.design.windowOption.pipe.points[0][2],2.30);
for(const id of ['cloth','sheer']){assert.equal(a.s.design.windowOption.curtains[id].boxEnabled,false);assert.equal(await page.evaluate(id=>!!masterWindowOption.scene.getObjectByName(id+'-curtain-box'),id),false);assert.equal(await page.evaluate(id=>!!masterWindowOption.scene.getObjectByName(id+'-exposed-track'),id),true);}
assert.ok(Math.abs(a.a.openGap-.298)<1e-8);
assert.equal(a.s.openings.find(d=>d.id==='bath-door').swing_into,'bath');assert.equal(a.a.routeWidth,.60);
const shot=async name=>{await page.waitForTimeout(250);await page.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/window-option-53-'+name+'.png'});};
for(const v of ['whole','footwall','vanity','entry','window','plan']){await page.evaluate(v=>masterWindowOption.choose(v),v);if(v==='plan'){assert.equal(await page.locator('#plan').isVisible(),true);assert.ok(await page.locator('#plan polygon').count()>3);}await shot(v);}
await page.locator('#chair-pull').check();await page.locator('#routes').check();await shot('seated-plan');
assert.equal(await page.evaluate(()=>masterWindowOption.scene.getObjectByName('vanity-stool').position.x),.45);
await page.locator('#vanity-drawers').check();assert.equal(await page.evaluate(()=>masterWindowOption.scene.getObjectByName('makeup-drawer-0').position.x),.25);
await page.evaluate(()=>masterWindowOption.choose('vanity'));await shot('vanity-seated');
await page.locator('#foot-mode').selectOption('open');await page.evaluate(()=>masterWindowOption.choose('footwall'));await shot('cabinet-open');
await page.locator('#foot-mode').selectOption('drawers');assert.equal(await page.evaluate(()=>masterWindowOption.scene.getObjectByName('foot-external-drawer-0').position.z),-.30);
await page.locator('#screen-mode').selectOption('down');assert.equal(await page.locator('#foot-mode').inputValue(),'closed');assert.equal(await page.locator('#foot-mode').isDisabled(),true);
await page.locator('#cloth-closed').check();await page.locator('#sheer-closed').check();await page.locator('#entry-open').check();await page.locator('#opacity').fill('100');await page.locator('#labels').check();
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>masterWindowOption.choose('vanity'));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
assert.deepEqual(errors,[]);assert.deepEqual(hashes(),before);console.log(JSON.stringify({ok:true,layout:a.a,originalFilesUnchanged:true,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
