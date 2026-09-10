// Exercise the exact build file map, not the source server's extra assets.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http=require('node:http'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const {files,report:build}=await import('./build-site.mjs'),missing=[],errors=[],checks=[];
 const types={html:'text/html',js:'text/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',gltf:'model/gltf+json',glb:'model/gltf-binary'};
 const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html',data=files.get(name);
  if(!data){missing.push(name);res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':types[name.split('.').pop()]||'application/octet-stream','Content-Length':data.length});res.end(data);
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  for(const [width,height] of [[1440,950],[390,844]]){
   const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url+(width===390?'/mobile-preview.html':'/')+'?space=entry&photo=latest');
   const frame=width===390?page.frames().find(f=>f.url().includes('column-view.html')):page;assert.ok(frame);
   await frame.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.renderGalleryDebug?.state.loaded,null,{timeout:90000});
   assert.equal(await frame.locator('#renderRoom option').count(),12);
   assert.equal(await frame.evaluate(()=>renderGalleryDebug.state.fullBatch),'latest');
   await frame.locator('#renderWalk').click();assert.ok(await frame.evaluate(()=>walkDebug.state.active));
   await frame.locator('#walkExit').click();
   const scenes=await frame.evaluate(()=>({ready:columnViewDebug.state.ready,station:columnViewDebug.state.station,meshes:(()=>{let n=0;masterDressingDebug.model.traverse(o=>{if(o.isMesh)n++;});return n;})()}));
   checks.push({width,scenes});await page.close();
  }
  assert.deepEqual(missing,[],'Build must not rely on assets outside its file map');assert.deepEqual(errors,[]);
  const report={build,checks,missing,errors,published:false,limits:'In-memory assembled assets on desktop and emulated mobile; not a deployed Site, physical phone, or full visual acceptance.'};
  fs.writeFileSync(__dirname+'/build-preview-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
