const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8774/lake-home-walkthrough/column-view.html?space=laundry&v=balcony-inspect');await page.waitForFunction(()=>window.columnViewDebug?.state.ready,{},{timeout:90000});
 const result=await page.evaluate(async()=>{const T=await import('./vendor/three.module.js'),m=columnViewDebug.dryStudy.model;m.updateMatrixWorld(true);
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const box=o=>{const b=new T.Box3();o.traverse(c=>{if(c.isMesh&&visible(c)){c.geometry.computeBoundingBox();b.union(c.geometry.boundingBox.clone().applyMatrix4(c.matrixWorld));}});return b;};
  const info=o=>{const b=box(o);return {name:o.name,parent:o.parent?.name,position:o.getWorldPosition(new T.Vector3()).toArray(),min:b.min.toArray(),max:b.max.toArray(),size:b.getSize(new T.Vector3()).toArray(),data:o.userData};};
  const names=['retained-balcony-column','balcony-laundry-cabinet','laundry-washer','washer-panel-shell','laundry-dryer','lake-bar-left','lake-bar-right','tv-low-console','recessed-tv-black-side-reveals','tv-display-lake','85-inch-screen','balcony-solid-left','balcony-solid-right','balcony-care-cabinet','balcony-drying-rack'];
  const overhead=[];m.traverse(o=>{if(!o.isMesh||!visible(o))return;const b=box(o);if(b.min.y>2.2&&b.min.z<1.85&&b.max.z>1.35&&b.min.x<12.1&&b.max.x>5.9)overhead.push(info(o));});
  return {objects:names.map(n=>m.getObjectByName(n)).filter(Boolean).map(info),overhead,debugKeys:Object.keys(window).filter(n=>/balcony|laundry/i.test(n))};});
 result.errors=errors;fs.writeFileSync(__dirname+'/balcony-before.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 await page.screenshot({path:__dirname+'/balcony-before.png'});
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
