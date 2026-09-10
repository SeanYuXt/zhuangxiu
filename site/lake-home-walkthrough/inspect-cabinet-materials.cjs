const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await browser.newPage();await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html');await p.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.curtainDetailsDebug);
 const report=await p.evaluate(async()=>{const T=await import('./vendor/three.module.js'),model=masterDressingDebug.model,rows=[];for(const name of ['flush-entry-cabinet','flush-sideboard','balcony-laundry-cabinet','master-bed']){
  const root=model.getObjectByName(name);if(!root){rows.push({root:name,missing:true});continue;}root.traverse(o=>{if(!o.isMesh)return;for(let a=o;a;a=a.parent)if(!a.visible)return;const m=o.material;if(Array.isArray(m))return;const size=new T.Box3().setFromObject(o).getSize(new T.Vector3());rows.push({root:name,name:o.name,parent:o.parent.name,material:m.name,color:m.color?.getHexString(),metal:m.metalness,map:m.map?.name||null,size:size.toArray()});});
 }return rows;});fs.writeFileSync(__dirname+'/cabinet-material-baseline.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report.filter(r=>r.map||/shelf|panel|carcass|back|side|frame|木/.test(r.name||'')).slice(0,65)));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
