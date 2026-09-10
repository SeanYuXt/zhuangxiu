const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const root=__dirname+'/',s=JSON.parse(fs.readFileSync(root+'master-window-ac-option-spec.json','utf8')),h=s.design.bath.hotelCandidate;
const base=JSON.parse(fs.readFileSync(root+'master-suite-plumbing-spec.json','utf8'));
assert.deepEqual(s.walls,base.walls);assert.deepEqual(s.openings,base.openings);assert.deepEqual(s.furniture.bed,base.furniture.bed);
const hit=(a,b)=>a[0]<b[2]-1e-7&&a[2]>b[0]+1e-7&&a[1]<b[3]-1e-7&&a[3]>b[1]+1e-7;
const fixtures=Object.values(h.fixtures).map(o=>o.r),fixed=s.design.bath.fixed.map(o=>o.r);
for(const r of fixtures){assert.ok(r[0]>=.10&&r[1]>=.1&&r[2]<=2.05&&r[3]<=1.95);for(const f of fixed)assert.ok(!hit(r,f));}
for(let i=0;i<fixtures.length;i++)for(let j=i+1;j<fixtures.length;j++)assert.ok(!hit(fixtures[i],fixtures[j]));
for(let deg=0;deg<=90;deg++)for(let d=0;d<=.85;d+=.005){const x=1.95-d*Math.cos(deg*Math.PI/180),z=2.05-d*Math.sin(deg*Math.PI/180);for(const r of [...fixtures,h.partition.fixed,h.partition.jamb,h.partition.door])assert.ok(!(x>r[0]-.015&&x<r[2]+.015&&z>r[1]-.015&&z<r[3]+.015),'original door collision');}
for(let t=0;t<=h.partition.travel;t+=.005){const r=[...h.partition.door];r[0]-=t;r[2]-=t;for(const f of [...fixed,h.fixtures.washstand.r,h.fixtures.toilet.r])assert.ok(!hit(r,f),'slider collision');}
assert.ok(!hit(h.standing,h.toiletUse));assert.ok(h.standing[1]>h.partition.fixed[3]);
assert.ok(hit(h.toiletUse,h.fixtures.shower.r),'shared wet-use limitation must stay disclosed');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
try{const p=await b.newPage({viewport:{width:1700,height:1100},deviceScaleFactor:1.5}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=plan&v=hotel-57');await p.waitForFunction(()=>window.masterWindowOption?.ready,null,{timeout:30000});
 assert.ok((await p.locator('#plan').textContent()).includes('洗漱58×40'));
 const info=await p.evaluate(()=>({revision:masterWindowOption.revision,hotel:masterWindowOption.spec.design.bath.hotel,audit:masterWindowOption.audit.errors,mirror:!!masterWindowOption.scene.getObjectByName('dressing-full-length-mirror')}));
 assert.equal(info.revision,57);assert.equal(info.hotel,true);assert.deepEqual(info.audit,[]);assert.equal(info.mirror,true);
 await p.locator('#pipe-show').uncheck();await p.locator('#detail-toggle').uncheck();await p.locator('#opacity').fill('100');await p.locator('#opacity').dispatchEvent('input');
 for(const view of ['bath','bathTop']){await p.evaluate(v=>masterWindowOption.choose(v),view);await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/hotel-57-'+view+'.png'});console.log('rendered '+view);}
 await p.evaluate(()=>masterWindowOption.choose('bath'));await p.locator('#wet-door-closed').check();assert.equal(await p.evaluate(()=>masterWindowOption.hotelBath.slider.position.x),0);await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/hotel-57-closed.png'});
 await p.locator('#wet-door-closed').uncheck();assert.equal(await p.evaluate(()=>masterWindowOption.hotelBath.slider.position.x),-.89);await p.locator('#detail-toggle').check();await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/hotel-57-labelled.png'});
 await p.locator('#bath-mirror-inside').check();assert.equal(await p.evaluate(()=>masterWindowOption.scene.getObjectByName('hotel-wash-mirror').visible),false);
 await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=bath&bathLayout=original&v=hotel-57');await p.waitForFunction(()=>window.masterWindowOption?.ready);assert.equal(await p.evaluate(()=>masterWindowOption.hotelBath),null);assert.deepEqual(await p.evaluate(()=>masterWindowOption.spec.design.bath.fixtures.washstand.r),[1.12,.1,2.02,.55]);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({ok:true,...info,errors,originalShellUnchanged:true,fixturesRearranged:true,doorSweep:true,sliderTravel:.89,standingSeparated:true,wetStandingShared:true,originalLayoutPreserved:true,mobileOverflow:false}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
