const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
(async()=>{
 const dir=path.join(__dirname,'offline-render');
 const source=crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,'home-scene.glb'))).digest('hex');
 const previous=crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,'home-scene-before-laundry.glb'))).digest('hex');
 const records=['renders.json','renders-still.json'].flatMap(f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8')).renders).filter(r=>r.environmentRotationDegrees===180);
 for(const r of records){const png=fs.readFileSync(path.join(dir,r.file));assert.equal(png.readUInt32BE(16),r.width);assert.equal(png.readUInt32BE(20),r.height);assert.ok([source,previous].includes(r.sourceSha256));assert.ok(r.width>=2048);}
 if(process.argv.includes('--complete')){assert.ok(records.every(r=>r.sourceSha256===source),'Old revision images are not latest whole-home completion');assert.equal(records.filter(r=>r.kind==='panorama').length,8);assert.equal(records.filter(r=>r.kind==='still').length,5);}
 console.log('RENDER_FILES',records.length,'dimension/source checks passed');
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/index.html');await page.waitForFunction(()=>window.homeDebug);await page.evaluate(()=>homeDebug.finishReady);await page.click('#enter');
  const before=await page.evaluate(()=>homeDebug.state.position);await page.click('#showEffects');
  const frame=page.frames().find(f=>f.url().includes('showcase.html'))||await page.waitForEvent('framenavigated',{predicate:f=>f.url().includes('showcase.html')});
  await frame.waitForFunction(()=>window.showcaseDebug?.state.loaded,null,{timeout:60000});
  const initial=await frame.evaluate(()=>showcaseDebug.state);
  await page.screenshot({path:path.join(dir,'panorama-web-preview.png')});
  const bounds=await frame.locator('#pano').boundingBox();await page.mouse.move(bounds.x+bounds.width*.5,bounds.y+bounds.height*.5);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.7,bounds.y+bounds.height*.52,{steps:10});await page.mouse.up();
  const after=await frame.evaluate(()=>showcaseDebug.state);assert.notEqual(after.yaw,initial.yaw);
  for(const kind of ['still','panorama']){
   await frame.click(`[data-kind="${kind}"]`);
   for(const r of records.filter(r=>r.kind===kind)){await frame.click(`[data-id="${r.id}"]`);await frame.waitForFunction(id=>showcaseDebug.state.loaded===id,r.id,{timeout:60000});}
  }
  console.log('MODES','all completed views load; panorama drag changes heading');
  await frame.click('#back');await page.waitForFunction(()=>!document.querySelector('#effectsDialog').open);
  const returned=await page.evaluate(()=>homeDebug.state.position);assert.ok(before.every((v,i)=>Math.abs(v-returned[i])<.001));
  assert.deepEqual(errors,[]);console.log('RETURN_POSITION',JSON.stringify(returned),'ERRORS',JSON.stringify(errors));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
