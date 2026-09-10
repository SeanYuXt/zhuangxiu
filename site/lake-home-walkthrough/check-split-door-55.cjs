// Regression: independent upper quilt doors, paired external drawer stacks,
// and concave end stay coherent in the existing interactive 3D model.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const root=__dirname+'/',s=JSON.parse(fs.readFileSync(root+'master-window-ac-option-spec.json','utf8'));
const baseline=JSON.parse(fs.readFileSync(root+'master-suite-plumbing-spec.json','utf8'));
assert.deepEqual(s.walls,baseline.walls);assert.deepEqual(s.openings,baseline.openings);assert.deepEqual(s.furniture.bed,baseline.furniture.bed);
assert.deepEqual(s.design.windowOption.cabinet.drawerBayIndices,[1,3]);
const r=s.furniture.entryCorner.r;
for(const p of s.furniture.entryCorner.polygon.slice(1,-1))assert.ok(Math.abs(Math.hypot(p[0]-r[0],p[1]-r[1])-.15)<1e-7);
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
try{const p=await b.newPage({viewport:{width:1700,height:1100}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=footwall&v=split-door-55');await p.waitForFunction(()=>window.masterWindowOption?.ready,null,{timeout:30000});
 const info=await p.evaluate(()=>({revision:masterWindowOption.revision,upper:masterWindowOption.footLeaves.filter(l=>l.upper).length,lower:masterWindowOption.footLeaves.filter(l=>!l.upper).length,drawers:masterWindowOption.footDrawers.length,heights:masterWindowOption.footLeaves.map(l=>l.g.userData.height),audit:masterWindowOption.audit.errors}));
 assert.equal(info.revision,55);assert.equal(info.upper,8);assert.equal(info.lower,12);assert.equal(info.drawers,4);assert.ok(info.heights.every(h=>h>0));assert.deepEqual(info.audit,[]);
 await p.locator('#pipe-show').uncheck();await p.locator('#detail-toggle').uncheck();
 for(const mode of ['closed','upper','drawers','inside']){
  await p.locator('#foot-mode').selectOption(mode);
  if(mode==='upper')assert.equal(await p.evaluate(()=>masterWindowOption.footLeaves.every(l=>l.upper?Math.abs(l.g.rotation.y)>1.5:l.g.rotation.y===0)),true);
  if(mode==='drawers')assert.equal(await p.evaluate(()=>masterWindowOption.footDrawers.every(g=>Math.abs(g.position.z+.30)<1e-8)),true);
  await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/split-door-55-'+mode+'.png'});console.log('checked '+mode);
 }
 await p.locator('#foot-mode').selectOption('closed');await p.evaluate(()=>masterWindowOption.choose('corner'));await p.locator('#detail-toggle').check();await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/split-door-55-corner.png'});
 await p.locator('#screen-mode').selectOption('down');assert.equal(await p.locator('#foot-mode').isDisabled(),true);assert.equal(await p.locator('#foot-mode').inputValue(),'closed');
 await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({ok:true,...info,errors,originalShellUnchanged:true,concaveRadius:.15,screenInterlock:true,mobileOverflow:false}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
