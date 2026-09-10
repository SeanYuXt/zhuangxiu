// Prevent a visible laundry entry from opening an old picture or an unreachable station.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
(async()=>{
 const dir=path.join(__dirname,'offline-render'),source=crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,'home-scene.glb'))).digest('hex');
 const record=JSON.parse(fs.readFileSync(path.join(dir,'renders-still.json'),'utf8')).renders.find(r=>r.id==='laundry');
 assert.equal(record.sourceSha256,source);const png=fs.readFileSync(path.join(dir,record.file));assert.equal(png.readUInt32BE(16),2048);assert.equal(png.readUInt32BE(20),1280);
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/index.html?view=effects&space=laundry');
  await page.waitForFunction(()=>window.homeDebug);const frame=page.frames().find(f=>f.url().includes('showcase.html'))||await page.waitForEvent('framenavigated',{predicate:f=>f.url().includes('showcase.html')});
  await frame.waitForFunction(()=>window.showcaseDebug?.state.loaded==='laundry',null,{timeout:60000});
  assert.equal(await frame.evaluate(()=>showcaseDebug.state.record.sourceSha256),source);
  await page.screenshot({path:path.join(dir,'laundry-web-preview.png')});
  await frame.click('#back');await page.waitForFunction(()=>!document.querySelector('#effectsDialog').open);await page.evaluate(()=>homeDebug.finishReady);
  const routing=await page.evaluate(()=>{const h=homeDebug,r=h.rooms.find(r=>r.id==='laundry'),p=h.P(r.point),a=h.state.position;const atLaundry=Math.hypot(a[0]-p[0],a[2]-p[1])<.3;h.goRoom('entry');for(let i=0;i<3000&&h.state.routeLength;i++)h.tick(1/30);const entry=h.rooms.find(r=>r.id==='entry'),ep=h.P(entry.point),b=h.state.position;return {atLaundry,returnedEntry:Math.hypot(b[0]-ep[0],b[2]-ep[1])<.3,roomCount:h.rooms.length};});
  assert.ok(routing.atLaundry&&routing.returnedEntry);assert.equal(routing.roomCount,14);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({image:[2048,1280],source,routing,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
