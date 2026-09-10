// Read current mesh footprints, not duplicate manually registered obstacles.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/index.html');await page.waitForFunction(()=>window.homeDebug);await page.evaluate(()=>homeDebug.finishReady);
 const result=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),h=homeDebug;h.enter();h.scene.updateMatrixWorld(true);
  const bounds=o=>{const b=new T.Box3().setFromObject(o);return {min:b.min.toArray(),max:b.max.toArray()};};
  const bed=h.scene.getObjectByName('bed3-bed'),wardrobe=h.scene.getObjectByName('bed3-wardrobe'),door=h.scene.getObjectByName('door-bed3-single');
  // First child meshes are the actual solid bed base and wardrobe carcass.
  const base=bounds(bed.children[0]),carcass=bounds(wardrobe.children[0]);
  h.setDoorLeafOpen(door,true);door.updateWorldMatrix(true,true);
  const doorPanel=bounds(door.getObjectByName(door.name+'-panel'));
  const intersection=(a,b)=>a.min.map((v,i)=>Math.max(0,Math.min(a.max[i],b.max[i])-Math.max(v,b.min[i])));
  return {source:'current app.js live scene, full height',origin:[14.02,4.46],bedBase:base,wardrobeCarcass:carcass,bedWardrobeIntersectionMm:intersection(base,carcass).map(v=>Math.round(v*1000)),openDoorPanel:doorPanel,doorWardrobeIntersectionMm:intersection(doorPanel,carcass).map(v=>Math.round(v*1000)),groups:['bed3-bed','bed3-wardrobe','bed3-desk'].map(name=>({name,...bounds(h.scene.getObjectByName(name))})),scope:'Axis-aligned solid meshes in current layout; not source-dimension or installation approval.'};
 });fs.writeFileSync(__dirname+'/child-current-layout-audit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
