// Prevent bad original layout passing, divergent 2D/3D option state, and
// silently counting the bay as furniture floor or B as a study-room solution.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const {makeChildStudy,auditOption,probeRoutes}=await import('./child-layout-options.js');
 const s=makeChildStudy(...['source-dimension-audit.json','source-opening-schedule.json','child-current-layout-audit.json'].map(f=>JSON.parse(fs.readFileSync(__dirname+'/'+f,'utf8'))));
 fs.writeFileSync(__dirname+'/child-study-spec.json',JSON.stringify({name:'儿童房原图主要矩形家具试排范围（非全屋结构）',units:'m',spaces:[{id:'bed3-core',label:'儿童房主要矩形，飘窗另计且不放家具',polygons:[[[0,0],[s.width,0],[s.width,s.depth],[0,s.depth]]]}],walls:[],openings:[],scope:'只校验家具试排范围的有效性；不含原房全部墙门窗，不作为户型拓扑验收'},null,2));
 assert.deepEqual([s.width,s.depth],[3.5,2.7]);
 const before=auditOption(s,s.options[0]);assert.ok(before.pairs.some(p=>p.a==='bed'&&p.b==='wardrobe'));assert.ok(before.doorHits.some(p=>p.id==='wardrobe'));
 const result=[];
 for(const o of s.options.slice(1))for(const pulled of [false,true]){
  const a=auditOption(s,o,pulled),routes=probeRoutes(s,o,pulled).map(({label,reached})=>({label,reached}));assert.ok(a.insideCore);assert.deepEqual(a.pairs.filter(p=>!p.underDesk),[]);assert.deepEqual(a.doorHits,[]);assert.ok(routes.filter(r=>r.label!=='窗前核心地面').every(r=>r.reached));
  if(o.id==='widebed'){assert.ok(!o.items.some(i=>i.id==='desk'));assert.equal(routes.find(r=>r.label==='窗前核心地面').reached,false);}
  result.push({option:o.id,pulled,audit:a,routes});
 }
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const p=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/children-layouts.html');await p.waitForFunction(()=>window.childStudyDebug);
  for(const id of ['current','study','widebed']){await p.locator(`[data-option="${id}"]`).click();assert.equal(await p.evaluate(()=>childStudyDebug.state.option),id);await p.screenshot({path:__dirname+`/child-${id}-plan.png`});}
  await p.locator('[data-option="study"]').click();await p.locator('#pull').check();assert.ok(await p.evaluate(()=>childStudyDebug.state.routes.every(r=>r.reached)));await p.screenshot({path:__dirname+'/child-study-chair-pulled.png'});
  await p.locator('[data-view="3d"]').click();await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.screenshot({path:__dirname+'/child-study-3d.png'});
  const beforeCamera=await p.evaluate(()=>childStudyDebug.state.camera),box=await p.locator('#model').boundingBox();await p.mouse.move(box.x+box.width*.4,box.y+box.height*.4);await p.mouse.down();await p.mouse.move(box.x+box.width*.6,box.y+box.height*.5,{steps:8});await p.mouse.up();assert.notDeepEqual(await p.evaluate(()=>childStudyDebug.state.camera),beforeCamera);
  await p.locator('[data-view="plan"]').click();await p.locator('#angle').fill('0');assert.equal(await p.locator('#angleText').textContent(),'0°');
  await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:__dirname+'/child-options-mobile.png'});assert.deepEqual(errors,[]);
  fs.writeFileSync(__dirname+'/child-layout-verification.json',JSON.stringify({before,result,ui:{rotation:true,modeSwitch:true,chairPull:true,doorAngle:true,mobile:true,errors},scope:'条件试排与网页验证，不是布局选择、人体舒适性或施工验收'},null,2));console.log(JSON.stringify({result,rotation:true,mobile:true,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
