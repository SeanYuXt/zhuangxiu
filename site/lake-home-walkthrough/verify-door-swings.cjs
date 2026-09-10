// Regression: hinge reversal, wrong inward swing, lost secondary entrance leaf.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=JSON.parse(fs.readFileSync(__dirname+'/source-opening-schedule.json','utf8'));
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/index.html?v=source-doors');
 await page.waitForFunction(()=>window.homeDebug?.doorObjects);await page.evaluate(()=>homeDebug.finishReady);
 const result=await page.evaluate(async(source)=>{
  const T=await import('./vendor/three.module.js'),h=homeDebug,rows=[],hits=[];
  const {walls,P}=await import('./plan.js');
  function overlap(a,b){
   for(const poly of [a,b])for(let i=0;i<poly.length;i++){
    const q=poly[(i+1)%poly.length],v=poly[i],axis=[q[1]-v[1],v[0]-q[0]],len=Math.hypot(...axis);
    const project=p=>p.map(t=>(t[0]*axis[0]+t[1]*axis[1])/len),pa=project(a),pb=project(b);
    if(Math.min(Math.max(...pa),Math.max(...pb))-Math.max(Math.min(...pa),Math.min(...pb))<=.003)return false;
   }return true;
  }
  for(const group of h.doorObjects){
   const d=group.userData,ev=source.opening_evidence.find(o=>o.id===d.id).leaves.find(l=>l.source_rect_index===d.sourceRect);
   const vector=new T.Vector3(ev.open_tip_pdf[1]-ev.hinge_pdf[1],0,ev.hinge_pdf[0]-ev.open_tip_pdf[0]).normalize();
   const initial=d.open;h.setDoorLeafOpen(group,true);group.updateWorldMatrix(true,true);
   const dot=new T.Vector3(1,0,0).transformDirection(group.matrixWorld).dot(vector);
   const wall=walls.find(w=>(w.open||[]).some(o=>o.id===d.id)),o=wall.open.find(o=>o.id===d.id),length=Math.hypot(wall.b[0]-wall.a[0],wall.b[1]-wall.a[1]);
   const end=d.hinge==='a'?o.at:o.at+o.w,expected=P(wall.a.map((v,i)=>v+(wall.b[i]-v)*end/length));
   const position=group.getWorldPosition(new T.Vector3()),hingeDistance=Math.hypot(position.x-expected[0],position.z-expected[1]);
   h.setDoorLeafOpen(group,false);const closeError=Math.abs(group.rotation.y-d.base);
   h.setDoorLeafOpen(group,true);const reopenError=Math.abs(group.rotation.y-d.base-d.turn*Math.PI/2);
   rows.push({name:group.name,id:d.id,hinge:d.hinge,sourceHinge:ev.hinge_end,dot,hingeDistance,closeError,reopenError});
   const panel=group.getObjectByName(group.name+'-panel');panel.geometry.computeBoundingBox();const b=panel.geometry.boundingBox;
   for(let angle=0;angle<=90;angle+=5){
    group.rotation.y=d.base+d.turn*angle*Math.PI/180;panel.updateWorldMatrix(true,false);
    const poly=[[b.min.x,b.min.z],[b.max.x,b.min.z],[b.max.x,b.max.z],[b.min.x,b.max.z]].map(([x,z])=>{const p=panel.localToWorld(new T.Vector3(x,1,z));return [p.x,p.z];});
    for(const [index,c] of h.colliders.entries())if(overlap(poly,[[c.x1,c.z1],[c.x2,c.z1],[c.x2,c.z2],[c.x1,c.z2]])){
     if(!hits.some(v=>v.door===group.name&&v.collider===index))hits.push({door:group.name,collider:index,name:c.name||c.type,firstSampleDegrees:angle});
    }
   }
   h.setDoorLeafOpen(group,initial);
  }
  return {rows,sampledPlanOverlapCandidates:hits,clearances:h.clearanceAudit.map(c=>({mm:c.mm,pass:c.pass}))};
 },source);
 assert.equal(result.rows.length,7);assert.equal(result.rows.filter(r=>r.id==='front').length,2);
 for(const r of result.rows){assert.equal(r.hinge,r.sourceHinge);assert.ok(r.dot>.999999,r.name);assert.ok(Math.abs(r.hingeDistance-(r.id==='front'?.045:.0275))<1e-7);assert.ok(r.closeError<1e-9&&r.reopenError<1e-9);}
 assert.ok(result.clearances.every(c=>c.pass));assert.deepEqual(errors,[]);
 fs.writeFileSync(__dirname+'/door-swing-verification.json',JSON.stringify({...result,errors,scope:'方向/开合回归；5度抽样二维重叠只提示候选冲突，非完整通行验收'},null,2));
 console.log(JSON.stringify({...result,errors},null,2));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=source-doors&space=bath1&focus=door');
 await page.waitForFunction(()=>window.columnViewDebug?.state.ready&&columnViewDebug.state.selectedVisible);
 assert.equal(await page.evaluate(()=>loadedDoorAudit.length),7);
 const imported=await page.evaluate(()=>loadedDoorAudit.map(d=>({id:d.id,hinge:d.hinge,sourceRect:d.sourceRect,open:d.open,direction:d.direction})));
 for(const row of imported){const ev=source.opening_evidence.find(o=>o.id===row.id).leaves.find(l=>l.source_rect_index===row.sourceRect);assert.equal(row.hinge,ev.hinge_end);if(row.open){const v=[ev.open_tip_pdf[1]-ev.hinge_pdf[1],ev.hinge_pdf[0]-ev.open_tip_pdf[0]],len=Math.hypot(...v);assert.ok((row.direction[0]*v[0]+row.direction[2]*v[1])/len>.999999);}}
 assert.equal(await page.locator('#doorToggle').getAttribute('aria-pressed'),'true');
 await page.locator('#doorToggle').click();assert.equal(await page.locator('#doorToggle').getAttribute('aria-pressed'),'false');
 assert.equal(await page.evaluate(()=>loadedDoorAudit.find(d=>d.id==='bath1').open),false);
 await page.locator('#doorToggle').click();
 assert.ok(await page.evaluate(()=>loadedDoorAudit.find(d=>d.id==='bath1').direction[0]<-.999));
 await page.screenshot({path:__dirname+'/public-door-corrected.png'});
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?v=source-doors&space=entry&focus=door');
 await page.waitForFunction(()=>window.columnViewDebug?.state.ready&&columnViewDebug.state.selectedVisible);
 await page.locator('#doorToggle').click();
 assert.equal(await page.evaluate(()=>loadedDoorAudit.find(d=>d.name==='door-front-main').open),true);
 assert.equal(await page.evaluate(()=>loadedDoorAudit.find(d=>d.name==='door-front-secondary').open),false);
 await page.locator('#doorToggle').click();
 await page.screenshot({path:__dirname+'/entrance-double-door.png'});
 await page.locator('#facilities summary').click();await page.locator('[data-facility="door-front-secondary"]').click();
 await page.locator('#doorToggle').click();
 assert.equal(await page.evaluate(()=>loadedDoorAudit.find(d=>d.name==='door-front-secondary').open),true);
 assert.equal(await page.evaluate(()=>loadedDoorAudit.find(d=>d.name==='door-front-main').open),false);
 assert.ok(await page.evaluate(()=>loadedDoorAudit.find(d=>d.name==='door-front-secondary').direction[2]>.999));
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({importedCount:imported.length,viewerToggle:true,independentFrontLeaves:true,mobile:true,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
