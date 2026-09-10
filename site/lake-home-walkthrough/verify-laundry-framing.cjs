// Regression: the full laundry view must include both machines and the cabinet bottom/top.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--enable-webgl','--no-sandbox'],headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=laundry&angle=balcony-laundry');await p.waitForFunction(()=>window.columnViewDebug?.state.ready);
 const report=await p.evaluate(async()=>{const T=await import('./vendor/three.module.js'),{roomViewFov}=await import('./room-viewpoints.js'),v=roomViewsDebug.views.find(v=>v.id==='balcony-laundry');roomViewsDebug.select(v.id);laundryDetailsDebug.reset();
  const cam=new T.PerspectiveCamera(roomViewFov(v,16/9),16/9,.03,100);cam.position.fromArray(v.position);cam.lookAt(new T.Vector3(...v.look));cam.updateMatrixWorld(true);
  const b=new T.Box3().setFromObject(laundryDetailsDebug.cabinet),points=[];for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])points.push(new T.Vector3(x,y,z).project(cam).toArray());
  return {camera:v,blockedBy:walkDebug.reason(v.position[0],v.position[2]),points,glass:['washer','dryer'].map(k=>{const mat=laundryDetailsDebug.units[k].door.getObjectByName(k+'-porthole').material;return {name:mat.name,transmission:mat.transmission,opacity:mat.opacity};})};
 });console.log(JSON.stringify(report));assert.equal(report.blockedBy,null);assert.ok(report.points.every(([x,y,z])=>Math.abs(x)<.99&&Math.abs(y)<.99&&z>-1&&z<1),'Full cabinet must fit the offline 16:9 frame');assert.ok(report.glass.every(m=>m.transmission>.9&&m.opacity===1));
 await p.screenshot({path:__dirname+'/laundry-overall-desktop.png'});await p.setViewportSize({width:390,height:844});await p.evaluate(()=>roomViewsDebug.select('balcony-laundry'));await p.screenshot({path:__dirname+'/laundry-overall-mobile.png'});assert.deepEqual(errors,[]);report.errors=errors;fs.writeFileSync(__dirname+'/laundry-framing-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
