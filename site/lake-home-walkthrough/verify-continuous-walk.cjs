// Regression: real keyboard/touch movement and collision cannot be replaced by hotspot teleports.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=walk-1&space=entry');await page.waitForFunction(()=>window.walkDebug&&columnViewDebug.state.ready);
 await page.locator('#lightingMode').click();assert.equal(await page.evaluate(()=>lightingDesignDebug.preset),'evening');
 await page.locator('[data-mode="walk"]').click();
 const before=await page.evaluate(()=>walkDebug.state);assert.ok(before.active,'entry has a standing position');
 // Try all horizontal directions; at least one must produce smooth motion.
 let travelled=0;
 for(const key of ['w','a','s','d']){await page.keyboard.down(key);await page.waitForTimeout(400);await page.keyboard.up(key);}
 const after=await page.evaluate(()=>walkDebug.state);travelled=after.travel-before.travel;assert.ok(travelled>.1,'keyboard moves camera');
 assert.equal(after.position[1],1.6);assert.ok(await page.evaluate(()=>walkDebug.free(...[walkDebug.state.position[0],walkDebug.state.position[2]])));
 // Very large requested motion must stop at obstacles and at the exterior boundary.
 const stop=await page.evaluate(()=>{walkDebug.move(0,20);return {state:walkDebug.state,free:walkDebug.free(walkDebug.state.position[0],walkDebug.state.position[2])};});
 assert.ok(stop.free&&stop.state.collisions>0);assert.ok(stop.state.position[2]<7.3);
 await page.waitForFunction(()=>walkDebug.state.nearDoor!==null);
 const doorBefore=await page.evaluate(()=>{const name=walkDebug.state.nearDoor;return {name,open:masterDressingDebug.model.getObjectByName(name).userData.open};});
 await page.keyboard.press('e');
 const doorAfter=await page.evaluate(name=>masterDressingDebug.model.getObjectByName(name).userData.open,doorBefore.name);assert.notEqual(doorBefore.open,doorAfter,'E operates the nearby door');
 assert.ok(await page.evaluate(()=>walkDebug.free(walkDebug.state.position[0],walkDebug.state.position[2])));
 await page.keyboard.down('w');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.deepEqual(await page.evaluate(()=>walkDebug.state.keys),[]);await page.keyboard.up('w');
 await page.screenshot({path:__dirname+'/walk-desktop.png'});
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=walk-1&space=entry&mode=walk');await mobile.waitForFunction(()=>window.walkDebug&&columnViewDebug.state.ready);
 await mobile.evaluate(()=>document.querySelector('#lightingMode').click());assert.equal(await mobile.evaluate(()=>lightingDesignDebug.preset),'evening');
 assert.ok(await mobile.evaluate(()=>walkDebug.state.active));
 const pad=mobile.locator('#walkJoystick'),b=await pad.boundingBox();assert.ok(b&&b.x>=0&&b.y+b.height<844);
 const pos={x:b.x+b.width/2,y:b.y+b.height/2};
 const touch=await mobile.context().newCDPSession(mobile);
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:pos.x,y:pos.y}]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:pos.x+28,y:pos.y}]});
 await mobile.waitForTimeout(450);const joy=await mobile.evaluate(()=>walkDebug.state);assert.ok(joy.joystick[0]>.5);
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.deepEqual(await mobile.evaluate(()=>walkDebug.state.joystick),[0,0]);
 await mobile.screenshot({path:__dirname+'/walk-mobile.png'});
 await mobile.locator('#walkExit').click();assert.equal(await mobile.evaluate(()=>walkDebug.state.active),false);
 assert.deepEqual(errors,[]);
 const report={scope:'evening fixture lighting with keyboard, real browser touch input, eye height, exterior/mesh collision, near door E and reset; not ergonomic or physical-phone performance certification',travelled,before,after,stop,doorBefore,doorAfter,mobile:joy,errors};
 fs.writeFileSync(__dirname+'/continuous-walk-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
