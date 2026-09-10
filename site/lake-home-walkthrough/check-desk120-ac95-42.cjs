const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
 try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-suite-plumbing-study.html?view=footwall&v=desk120-ac95-42');
 await page.waitForFunction(()=>window.masterPlumbing?.ready,null,{timeout:15000});
 const a=await page.evaluate(()=>({s:masterPlumbing.spec,d:masterPlumbing.detailsAudit,e:masterPlumbing.equipmentAudit,main:masterPlumbing.audit}));
 const near=(a,b)=>assert.ok(Math.abs(a-b)<.00001);
 for(const v of [a.main,a.d,a.e])assert.deepEqual(v.errors,[]);
 const f=a.s.furniture,ac=a.s.design.equipment.ac;
 near(f.vanity.r[2]-f.vanity.r[0],1.2);near(ac.r[2]-ac.r[0],.95);
 near(ac.r[0]-f.vanity.r[0],.125);near(f.vanity.r[2]-ac.r[2],.125);
 near(f.footCabinet.r[2]-f.entryCorner.r[0],2.35);near(a.d.closedWidth,2.2);near(a.d.kneeWidth,.8);near(a.d.footGap,.719);
 assert.equal(a.d.stowedRoute.ok,true);assert.equal(a.e.installationVerified,false);
 assert.deepEqual(a.e.serviceWarnings,['空调拆洗候选范围超出右侧墙界']);
 assert.ok((await page.locator('#metrics').textContent()).includes('各12.5cm'));
 await page.locator('#labels').uncheck();await page.locator('#points').uncheck();await page.locator('#opacity').fill('100');
 await page.waitForTimeout(400);await page.locator('#scene').screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/desk120-ac95-42-footwall.png'});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({ok:true,desk:1.2,ac:.95,sideGaps:.125,cabinet:2.35,errors,serviceWarnings:a.e.serviceWarnings,installationVerified:false}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
