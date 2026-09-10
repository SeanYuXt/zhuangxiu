const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=master&mode=layout');
 await page.waitForFunction(()=>window.columnViewDebug?.state.ready);
 const audit=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{rooms,P}=await import('./plan.js'),m=columnViewDebug.dryStudy.model;m.updateMatrixWorld(true);
  const visibleBox=o=>{const b=new T.Box3();o.traverseVisible(n=>{if(n.isMesh){n.geometry.computeBoundingBox();b.union(n.geometry.boundingBox.clone().applyMatrix4(n.matrixWorld));}});return b;};
  const bounds=o=>{const b=visibleBox(o);return {min:b.min.toArray(),max:b.max.toArray()};};
  const names=['master-entry-wardrobe','master-wardrobe','master-bed','master-air-conditioner','door-master-single','door-bath2-single'];
  const footPassage=[];m.traverseVisible(o=>{if(!o.isMesh)return;const b=visibleBox(o);if(b.min.y>=1.90||b.max.y<=.03||b.min.x>=17.52||b.max.x<=14.31||b.min.z>=3.652||b.max.z<=3.001)return;const parents=[];for(let p=o.parent;p&&p!==m;p=p.parent)parents.push(p.name||p.type);footPassage.push({name:o.name,parents,...bounds(o)});});
  return {source:'current shared viewer, visible mesh bounds (hidden airflow excluded)',roomPolygon:rooms.find(r=>r.id==='master').poly.map(P),groups:names.map(name=>{const g=m.getObjectByName(name);return {name,...bounds(g),position:g.position.toArray(),rotation:g.rotation.toArray().slice(0,3),firstMesh:bounds(g.children.find(c=>c.isMesh))};}),footPassage,precision:'current model mesh measurement, not field survey'};
 });
 fs.writeFileSync(__dirname+'/master-current-layout-audit.json',JSON.stringify(audit,null,2));
 await page.screenshot({path:__dirname+'/master-current-plan.png'});console.log(JSON.stringify(audit,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
