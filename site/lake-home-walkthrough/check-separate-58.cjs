const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const root=__dirname+'/',s=JSON.parse(fs.readFileSync(root+'master-window-ac-option-spec.json','utf8')),h=s.design.bath.separateCandidate;
const baseline=JSON.parse(fs.readFileSync(root+'master-suite-plumbing-spec.json','utf8'));
assert.deepEqual(s.walls,baseline.walls);assert.deepEqual(s.openings,baseline.openings);assert.deepEqual(s.furniture.bed,baseline.furniture.bed);
const hit=(a,b)=>a[0]<b[2]-1e-7&&a[2]>b[0]+1e-7&&a[1]<b[3]-1e-7&&a[3]>b[1]+1e-7;
const fixtures=Object.values(h.fixtures).map(o=>o.r),fixed=s.design.bath.fixed.map(o=>o.r),screens=[h.partition.fixed,h.partition.jamb];
for(const r of fixtures){assert.ok(r[0]>=.10&&r[1]>=.1&&r[2]<=2.05&&r[3]<=1.95);for(const f of fixed)assert.ok(!hit(r,f));}
for(let i=0;i<fixtures.length;i++)for(let j=i+1;j<fixtures.length;j++)assert.ok(!hit(fixtures[i],fixtures[j]));
for(const stand of [h.toiletUse,h.standing])for(const f of [...fixtures,...fixed,...screens])assert.ok(!hit(stand,f),'standing space collision');
assert.ok(!hit(h.toiletUse,h.standing));assert.ok(!hit(h.toiletUse,h.fixtures.shower.r));
for(let a=0;a<=90;a++)for(let d=0;d<=.85;d+=.005){const x=1.95-d*Math.cos(a*Math.PI/180),z=2.05-d*Math.sin(a*Math.PI/180);for(const r of [...fixtures,...screens])assert.ok(!(x>r[0]-.015&&x<r[2]+.015&&z>r[1]-.015&&z<r[3]+.015),'entrance door collision');}
const pp=h.partition;
for(let deg=0;deg<=85;deg++){
 const a=deg*Math.PI/180,c=Math.cos(a),v=Math.sin(a),w=pp.panelWidth;
 for(let leaf=0;leaf<2;leaf++)for(let t=0;t<=w-.006;t+=.01)for(const depth of [0,.02]){
  const x=pp.door[0]+(leaf?w*c:0)+t*c+depth*(leaf?-v:v),z=pp.door[1]-(leaf?w*v:0)+t*(leaf?v:-v)+depth*c;
  assert.ok(x>=1.20-1e-6&&x<=2.025+1e-6&&z>=.10&&z<=1.055,'fold must remain inside shower/threshold');
 }
}
const sideClearance=h.partition.fixed[0]-(h.fixtures.toilet.r[0]+h.fixtures.toilet.r[2])/2;
const frontClearance=h.fixtures.washstand.r[1]-h.fixtures.toilet.r[3];assert.ok(sideClearance>=.3999);assert.ok(frontClearance>=.6099);
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
try{const p=await b.newPage({viewport:{width:1700,height:1100},deviceScaleFactor:1.5}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=plan&v=separate-58');await p.waitForFunction(()=>window.masterWindowOption?.ready,null,{timeout:30000});
 assert.ok((await p.locator('#plan').textContent()).includes('淋浴85×90'));
 const info=await p.evaluate(()=>({revision:masterWindowOption.revision,separate:masterWindowOption.spec.design.bath.separate,audit:masterWindowOption.audit.errors,mirror:!!masterWindowOption.scene.getObjectByName('dressing-full-length-mirror')}));
 assert.equal(info.revision,58);assert.equal(info.separate,true);assert.deepEqual(info.audit,[]);assert.equal(info.mirror,true);
 await p.locator('#pipe-show').uncheck();await p.locator('#detail-toggle').uncheck();await p.locator('#opacity').fill('100');await p.locator('#opacity').dispatchEvent('input');
 for(const view of ['bath','bathTop']){await p.evaluate(v=>masterWindowOption.choose(v),view);await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/separate-58-'+view+'.png'});console.log('rendered '+view);}
 await p.locator('#routes').check();await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/separate-58-clearances.png'});
 await p.evaluate(()=>masterWindowOption.choose('bath'));await p.locator('#routes').uncheck();await p.locator('#wet-door-closed').check();assert.equal(await p.evaluate(()=>masterWindowOption.hotelBath.foldA.rotation.y),0);await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/separate-58-closed.png'});
 await p.locator('#wet-door-closed').uncheck();assert.ok(await p.evaluate(()=>masterWindowOption.hotelBath.foldA.rotation.y>1.48&&masterWindowOption.hotelBath.foldB.rotation.y< -1.48));
 await p.locator('#detail-toggle').check();await p.locator('#viewer').screenshot({path:root+'master-suite-review-solid-head/separate-58-labelled.png'});
 await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 for(const layout of ['hotel','original']){await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=bath&bathLayout='+layout+'&v=separate-58');await p.waitForFunction(()=>window.masterWindowOption?.ready);assert.equal(await p.evaluate(()=>!!masterWindowOption.spec.design.bath.separate),false);if(layout==='hotel')assert.equal(await p.evaluate(()=>!!masterWindowOption.hotelBath.slider),true);else assert.equal(await p.evaluate(()=>masterWindowOption.hotelBath),null);}
 assert.deepEqual(errors,[]);console.log(JSON.stringify({ok:true,...info,errors,originalShellUnchanged:true,independentStanding:true,entranceDoorSweep:true,inwardFoldSweep:true,sideClearance,frontClearance,previousLayoutsPreserved:true,mobileOverflow:false}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
