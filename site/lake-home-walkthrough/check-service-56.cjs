const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const root=__dirname+'/',s=JSON.parse(fs.readFileSync(root+'master-window-ac-option-spec.json','utf8'));
const baseline=JSON.parse(fs.readFileSync(root+'master-suite-plumbing-spec.json','utf8'));
assert.deepEqual(s.walls,baseline.walls);assert.deepEqual(s.openings,baseline.openings);assert.deepEqual(s.furniture.bed,baseline.furniture.bed);
assert.deepEqual(s.design.bath.fixtures.washstand.r,[1.12,.1,2.02,.55]);
assert.deepEqual(s.design.bath.fixtures.toilet.r,[.47,1.3,1.12,1.7]);
assert.deepEqual(s.design.bath.fixtures.shower.r,[.12,.12,1.02,1.02]);
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
try{const p=await b.newPage({viewport:{width:1700,height:1100},deviceScaleFactor:1.5}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=entry&v=service-56');await p.waitForFunction(()=>window.masterWindowOption?.ready,null,{timeout:30000});
 const info=await p.evaluate(()=>({revision:masterWindowOption.revision,missing:['dressing-full-length-mirror','tray-top','bath-mirror-cabinet-shelf','bath-faucet-spout','basin-recessed-bottom','bath-hand-towel','shower-surface-shelf','makeup-small-tray'].filter(n=>!masterWindowOption.scene.getObjectByName(n)),audit:masterWindowOption.audit.errors}));
 assert.equal(info.revision,56);assert.deepEqual(info.missing,[]);assert.deepEqual(info.audit,[]);
 await p.locator('#pipe-show').uncheck();await p.locator('#detail-toggle').uncheck();
 assert.equal(await p.evaluate(()=>{let n=0;masterWindowOption.scene.traverse(o=>{if(o.name==='makeup-drawer-divider')n++;});return n;}),2);
 // Model sweep test for newly added accessories (toilet user envelope still requires a closed door).
 assert.equal(await p.evaluate(()=>{
  const names=['bath-hand-towel','bath-mirror-cabinet-shelf','shower-surface-shelf'];
  for(const n of names){const o=masterWindowOption.scene.getObjectByName(n),p=o.geometry.parameters;
   // Mesh bounding boxes are local; all accessories use identity parent transforms.
   o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
   for(let a=0;a<=90;a++)for(let d=0;d<=.85;d+=.01){const x=1.95-d*Math.cos(a*Math.PI/180),z=2.05-d*Math.sin(a*Math.PI/180);
    if(x>=b.min.x+o.position.x-.02&&x<=b.max.x+o.position.x+.02&&z>=b.min.z+o.position.z-.02&&z<=b.max.z+o.position.z+.02)return false;
   }
  }return true;
 }),true);
 await p.locator('#opacity').fill('100');await p.locator('#opacity').dispatchEvent('input');
 for(const view of ['entry','vanity','bath']){
  await p.evaluate(v=>masterWindowOption.choose(v),view);await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/service-56-'+view+'.png'});console.log('rendered '+view);
 }
 await p.locator('#bath-mirror-inside').check();assert.equal(await p.evaluate(()=>masterWindowOption.serviceAreas.bathDoors.every(o=>!o.visible)),true);
 await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/service-56-bath-storage.png'});
 await p.locator('#bath-curtain').check();assert.equal(await p.evaluate(()=>masterWindowOption.scene.getObjectByName('bath-screen-front').visible&&!masterWindowOption.scene.getObjectByName('bath-screen-gathered').visible),true);
 await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/service-56-bath-curtain.png'});
 await p.evaluate(()=>masterWindowOption.choose('entry'));await p.locator('#tray-pull').check();assert.equal(await p.evaluate(()=>masterWindowOption.serviceAreas.tray.position.x),.30);
 await p.locator('#detail-toggle').check();await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/service-56-tray.png'});
 await p.evaluate(()=>masterWindowOption.choose('storage'));assert.equal(await p.evaluate(()=>masterWindowOption.scene.getObjectByName('multipurpose-door-1').visible),false);
 await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/service-56-storage.png'});
 await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({ok:true,...info,errors,fixturesUnchanged:true,trayTravel:.30,mirrorCutaway:true,curtainToggle:true,mobileOverflow:false}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
