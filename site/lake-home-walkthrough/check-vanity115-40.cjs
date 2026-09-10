const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const baseline={"walls":[{"id":"bath-outer","a":[0,0],"b":[2.15,0],"thickness":0.1,"side":-1,"separates":["bath","exterior"]},{"id":"bath-left","a":[0,0],"b":[0,2.05],"thickness":0.1,"side":1,"separates":["bath","exterior"]},{"id":"head","a":[2.15,0],"b":[4.95,0],"thickness":0.2,"side":-1,"separates":["master","exterior"]},{"id":"bath-side","a":[2.15,0],"b":[2.15,2.05],"thickness":0.1,"side":1,"separates":["master","bath"]},{"id":"bath-door-wall","a":[0,2.05],"b":[2.15,2.05],"thickness":0.1,"side":-1,"separates":["master","bath"]},{"id":"closet-wall","a":[0,2.05],"b":[0,4.7],"thickness":0.1,"side":1,"separates":["master","exterior"]},{"id":"entry-wall","a":[0,4.7],"b":[1.75,4.7],"thickness":0.1,"side":1,"separates":["master","hall"]},{"id":"entry-side","a":[1.75,3.4],"b":[1.75,4.7],"thickness":0.1,"side":-1,"separates":["master","exterior"]},{"id":"foot-wall","a":[1.75,3.4],"b":[5.35,3.4],"thickness":0.2,"side":1,"separates":["master","exterior"]},{"id":"vanity-wall","a":[5.35,2.3],"b":[5.35,3.4],"thickness":0.2,"side":-1,"separates":["master","exterior"]},{"id":"bay-return-solid","a":[4.95,-0.6],"b":[4.95,0],"thickness":0.1,"side":1,"separates":["bay","exterior"]},{"id":"bay-return-window","a":[4.95,-0.6],"b":[5.95,-0.6],"thickness":0.1,"side":-1,"separates":["bay","exterior"]},{"id":"bay-front-window","a":[5.95,-0.6],"b":[5.95,2.3],"thickness":0.1,"side":-1,"separates":["bay","exterior"]},{"id":"bay-end","a":[5.35,2.3],"b":[5.95,2.3],"thickness":0.1,"side":1,"separates":["bay","exterior"]}],"openings":[{"id":"bath-window","kind":"window","wall_id":"bath-outer","offset":0.35,"width":0.6,"sill":0.9,"top":2.1,"connects":["bath","exterior"],"source":"原PDF确认此墙有窗，LD900/CH1200；宽60cm和沿墙偏移为暂估，实拍窄窗；未确认窗扇方式"},{"id":"entry","kind":"door","wall_id":"entry-wall","offset":0.8,"width":0.9,"height":2.12,"connects":["master","hall"],"swing_into":"master","hinge":[1.7,4.7],"closedAngle":3.141592653589793,"sweep":1,"source":"原900门洞；五金净开口待复尺"},{"id":"bath-door","kind":"door","wall_id":"bath-door-wall","offset":1.1,"width":0.85,"height":2.1,"connects":["master","bath"],"swing_into":"bath","hinge":[1.95,2.05],"closedAngle":3.141592653589793,"sweep":1,"source":"原850门洞，向主卫内开"},{"id":"bay-front","kind":"window","wall_id":"bay-front-window","offset":0,"width":2.9,"connects":["bay","exterior"]},{"id":"bay-return","kind":"window","wall_id":"bay-return-window","offset":0,"width":1,"connects":["bay","exterior"]}],"bed":{"r":[2.75,0.05,4.63,2.05],"mattress":[1.8,1.9],"height":0.65,"label":"1.8×1.9m床垫"},"wardrobe":{"r":[0.02,2.12,0.67,4.62],"height":2.52,"label":"衣帽区整排衣柜250×65"},"ac":{"r":[4.32,3.13,5.17,3.38],"base":2.1,"height":0.3,"topClearance":0.2,"power":[5.24,2.15,3.385],"note":"用户最新明确改为床尾柜同一面墙、梳妆台正上方；不在窗户右侧墙，不走主卫候选路线。85×25×30cm机身、机底210cm、顶240cm基于暂定260cm净高。镜格顶180cm，机底到镜格30cm为名义几何值；厂家进风/摆风/清洗及现场排水仍待核。","status":"candidate","wall":"foot-wall","service":{"r":[4.2,2.72,5.3,3.13],"base":1.85,"height":0.7},"outletPaths":[[[4.45,2.135,3.105],[4.45,2.08,2.6],[4.45,1.94,1.95]],[[4.745,2.135,3.105],[4.745,2.08,2.6],[4.745,1.94,1.95]],[[5.04,2.135,3.105],[5.04,2.08,2.6],[5.04,1.94,1.95]]],"airCorridor":{"r":[4.32,0.8,5.17,3.13],"base":1.85,"height":0.35}}};
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
 try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/master-suite-plumbing-study.html?view=footwall&v=vanity115-40');
 await page.waitForFunction(()=>window.masterPlumbing?.ready,null,{timeout:15000});
 const a=await page.evaluate(()=>({s:masterPlumbing.spec,main:masterPlumbing.audit,details:masterPlumbing.detailsAudit,equipment:masterPlumbing.equipmentAudit}));
 for(const k of ['walls','openings'])assert.deepEqual(a.s[k],baseline[k]);
 for(const k of ['bed','wardrobe'])assert.deepEqual(a.s.furniture[k],baseline[k]);
 assert.deepEqual(a.s.design.equipment.ac,baseline.ac);
 for(const k of ['main','details','equipment'])assert.deepEqual(a[k].errors,[]);
 const close=(x,y)=>assert.ok(Math.abs(x-y)<.00001,x+' != '+y),f=a.s.furniture;
 close(f.vanity.r[2]-f.vanity.r[0],1.15);close(f.footCabinet.r[2]-f.entryCorner.r[0],2.4);
 close(a.details.closedWidth,2.25);close(a.details.footGap,.719);close(a.details.footDepth,.6);close(a.details.kneeWidth,.75);
 assert.equal(a.s.design.styling.head.lightSlot.lipDrop,.01);
 assert.equal(a.details.stowedRoute.ok,true);assert.equal(a.details.occupiedRoute.ok,false);
 assert.equal(await page.evaluate(()=>!!masterPlumbing.scene.getObjectByName('corner-display-book')),false);
 await page.locator('#labels').uncheck();await page.locator('#points').uncheck();await page.locator('#opacity').fill('100');
 const shot=async v=>{await page.evaluate(v=>masterPlumbing.choose(v),v);await page.waitForTimeout(350);await page.locator(v==='plan'?'#plan':'#scene').screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/vanity115-40-'+v+'.png'});};
 for(const v of ['footwall','bed','arch','vanity','plan'])await shot(v);
 await page.evaluate(()=>masterPlumbing.choose('footwall'));
 for(const v of ['0','1','inside','closed'])await page.locator('#foot-cabinet').selectOption(v);
 await page.locator('#screen-mode').selectOption('down');await page.waitForFunction(()=>masterPlumbing.projection.progress>.999);
 assert.equal(await page.locator('#foot-cabinet').isDisabled(),true);
 await page.locator('#screen-mode').selectOption('up');await page.waitForFunction(()=>masterPlumbing.projection.progress<.001);
 await page.locator('#light-scene').selectOption('evening');await page.evaluate(()=>masterPlumbing.choose('bed'));await page.waitForTimeout(350);
 await page.locator('#scene').screenshot({path:'D:/tep-chat/output/lake-home-walkthrough/master-suite-review-solid-head/vanity115-40-night.png'});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({ok:true,errors,widths:{desk:1.15,totalCabinet:2.4,straightCabinet:2.25,aisle:a.details.footGap,knee:a.details.kneeWidth},equipment:a.equipment}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

