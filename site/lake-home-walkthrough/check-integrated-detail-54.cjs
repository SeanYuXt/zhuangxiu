// Regression: fixtures must exist in the original 3D page, labels toggle immediately,
// and cutaway inspection must reveal the safe without changing original door geometry.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
 try{
  const p=await b.newPage({viewport:{width:1700,height:1100},deviceScaleFactor:1}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=entry&v=integrated-54');
  await p.waitForFunction(()=>window.masterWindowOption?.ready,null,{timeout:30000});
  assert.ok(await p.evaluate(()=>masterWindowOption.revision>=54));
  for(const name of ['safe-body-placeholder','safe-floor-supported-plinth','vanity-top-R40','bay-books-shelf-R20','L08-bath-heater-300x600','S03-plate','P01-socket-slot'])assert.equal(await p.evaluate(n=>!!masterWindowOption.scene.getObjectByName(n),name),true,name);
  assert.equal(await p.evaluate(()=>masterWindowOption.details.drawers.length),3);
  await p.locator('#pipe-show').uncheck();await p.locator('#light-scene').selectOption('evening');
  for(const v of ['entry','storage','vanity','bed','footwall','window','bath']){
   await p.evaluate(v=>masterWindowOption.choose(v),v);
   await p.waitForFunction(v=>document.querySelector('[data-view="'+v+'"]').classList.contains('active'),v);
   await p.locator('#viewer').screenshot({path:__dirname+'/master-suite-review-solid-head/integrated-54-'+v+'.png'});
   console.log('view checked: '+v);
  }
  await p.locator('#entry-drawers').check();assert.equal(await p.evaluate(()=>masterWindowOption.details.drawers[0].position.x),.28);
  await p.locator('#detail-toggle').uncheck();assert.equal(await p.locator('#detail-labels').isVisible(),false);
  await p.locator('#detail-toggle').check();await p.evaluate(()=>masterWindowOption.choose('storage'));
  assert.equal(await p.evaluate(()=>masterWindowOption.details.fronts.every(o=>!o.visible)),true);
  await p.evaluate(()=>masterWindowOption.choose('plan'));assert.equal(await p.locator('#plan').isVisible(),true);assert.equal(await p.locator('#detail-labels').isVisible(),false);
  await p.evaluate(()=>masterWindowOption.choose('vanity'));await p.setViewportSize({width:390,height:844});
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({ok:true,errors,revision:54,drawers:3,views:7,labelsToggle:true,mobileOverflow:false,unverified:['site dimensions','electric circuits','AC mounting','safe loading','cabinet operating clearances']}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1);});
