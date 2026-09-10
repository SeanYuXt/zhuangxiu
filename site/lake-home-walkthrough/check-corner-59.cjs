// Regression: parked standing rectangles must not conceal a disconnected narrow turn.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const root=__dirname+'/',s=JSON.parse(fs.readFileSync(root+'master-window-ac-option-spec.json','utf8')),h=s.design.bath.cornerCandidate;
(async()=>{
 const {curtainSegments,pointSegment,pointRect}=await import('./master-bath-corner-geometry.mjs');
 const baseline=JSON.parse(fs.readFileSync(root+'master-suite-plumbing-spec.json','utf8'));
 for(const key of ['walls','openings'])assert.deepEqual(s[key],baseline[key]);
 assert.deepEqual(s.furniture.bed,baseline.furniture.bed);
 const basin=[.47,1.36,.879,1.94],toilet=h.fixtures.toilet.r,blocks=s.design.bath.fixed.map(o=>o.r);
 const originalDoor=[[1.95,2.05],[1.95,1.20]],doorHalf=.015;
 const bathroomWalls=[[[.1,.1],[2.05,.1]],[[.1,.1],[.1,1.95]],[[2.05,.1],[2.05,1.95]],[[.1,1.95],[1.1,1.95]],[[1.1,1.95],[1.1,2.15]],[[1.95,2.05],[2.05,2.05]]];
 const routeResults={};
 for(const[name,route]of Object.entries(h.routes)){
  let min=Infinity;
  const panels=curtainSegments(h.partition,name!=='shower');
  for(let i=1;i<route.points.length;i++){
   const a=route.points[i-1],b=route.points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.002);
   for(let j=0;j<=n;j++){
    const q=[a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n];
    const distances=[...blocks,basin,toilet,[1.965,.48,2.045,.65],[1.993,.90,2.035,1.15]].map(r=>pointRect(q,r));
    distances.push(pointSegment(q,...originalDoor)-doorHalf,...bathroomWalls.map(seg=>pointSegment(q,...seg)),...panels.map(seg=>pointSegment(q,...seg)-(name==='shower'?.03:.015)));
    min=Math.min(min,...distances);
    assert.ok(Math.min(...distances)>=route.diameter/2-1e-7,name+' route blocked at '+q+' available diameter '+2*Math.min(...distances));
   }
  }
  routeResults[name]={checkedDiameterCm:route.diameter*100,minModelDiameterCm:+(min*200).toFixed(1)};
 }
 // Same bottleneck algorithm rejects 58's disconnected toilet-access throat.
 const old=s.design.bath.separateCandidate,oldGap=pointRect([old.partition.fixed[0],old.partition.fixed[3]],basin);
 assert.ok(oldGap<.45);assert.ok(oldGap<.60);
 // Original door sweep with full 30mm leaf; no new rigid partitions or shower doors.
 for(let a=0;a<=90;a++)for(let d=0;d<=.85;d+=.005){const q=[1.95-d*Math.cos(a*Math.PI/180),2.05-d*Math.sin(a*Math.PI/180)];for(const r of[basin,toilet,...blocks,h.fixtures.shower.r])assert.ok(pointRect(q,r)>=doorHalf,'entry door sweep');}
 for(const seg of curtainSegments(h.partition,true))assert.ok(pointSegment([.62,.62],...seg)-.015>=.30,'standing circle within shower curtain');
 console.log(JSON.stringify({geometry:true,routeResults,reject58GapCm:+(oldGap*100).toFixed(1)}));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
 try{
  const page=await browser.newPage({viewport:{width:1700,height:1100},deviceScaleFactor:1.5}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=bath&v=corner-59');await page.waitForFunction(()=>window.masterWindowOption?.ready);
  assert.equal(await page.evaluate(()=>masterWindowOption.spec.design.bath.corner),true);
  assert.deepEqual(await page.evaluate(()=>masterWindowOption.audit.errors),[]);
  await page.locator('#pipe-show').uncheck();await page.locator('#detail-toggle').uncheck();await page.locator('#opacity').fill('100');await page.locator('#opacity').dispatchEvent('input');
  for(const view of ['bath','bathTop','plan']){await page.evaluate(v=>masterWindowOption.choose(v),view);await page.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/corner-59-'+view+'.png'});}
  await page.evaluate(()=>masterWindowOption.choose('bathTop'));await page.locator('#routes').check();await page.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/corner-59-routes.png'});
  await page.locator('#routes').uncheck();await page.locator('#wet-door-closed').check();await page.evaluate(()=>masterWindowOption.choose('bath'));assert.equal(await page.evaluate(()=>masterWindowOption.hotelBath.closedFabric.visible),true);await page.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/corner-59-closed.png'});
  await page.locator('#wet-door-closed').uncheck();await page.locator('#detail-toggle').check();await page.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/corner-59-labelled.png'});
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  for(const layout of ['separate','hotel','original']){await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=bath&bathLayout='+layout+'&v=corner-59');await page.waitForFunction(()=>window.masterWindowOption?.ready);assert.equal(await page.evaluate(()=>!!masterWindowOption.spec.design.bath.corner),false);}
  assert.deepEqual(errors,[]);console.log(JSON.stringify({browser:true,revision:59,errors,comparisonsPreserved:true,mobileOverflow:false}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
