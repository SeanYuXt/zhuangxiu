const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto('http://127.0.0.1:8774/lake-home-walkthrough/column-view.html?space=passageArt');
  await page.waitForFunction(()=>window.columnCheck&&window.immersivePreviewDebug&&document.querySelector('#viewerDetailToggle'),{},{timeout:90000});
  console.log(JSON.stringify(await page.evaluate(async()=>{
   const T=await import('./vendor/three.module.js'),m=columnViewDebug.dryStudy.model,parts=[];
   m.updateMatrixWorld(true);
   const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible||p.isReflector)return false;return true;};
   for(const name of ['flush-sideboard','sideboard-base-storage','sideboard-upper-storage','entry-sideboard-display','family-display-wall','door-casing-bed3','door-master-single']){const o=m.getObjectByName(name);if(!o)continue;const a=new T.Box3();o.traverse(c=>{if(c.isMesh&&visible(c)){c.geometry.computeBoundingBox();a.union(c.geometry.boundingBox.clone().applyMatrix4(c.matrixWorld));}});parts.push({name,position:o.position.toArray(),rotation:o.rotation.toArray(),min:a.min.toArray(),max:a.max.toArray()});}
   columnViewDebug.visit('passageArt');
   return parts;
  })));
  await page.waitForTimeout(1000);
  await page.locator('#viewport').screenshot({path:__dirname+'/entry-wall-only-desktop.png'});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
  await page.screenshot({path:__dirname+'/entry-wall-only-mobile.png'});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
