const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');const fs=require('fs');
(async()=>{let b;try{
 b=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});const p=await b.newPage({viewport:{width:1940,height:1030},deviceScaleFactor:1});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8774/lake-home-walkthrough/entry-whole-wall-review.html?view=door&v=entry-organized-31');await p.waitForFunction(()=>window.wholeWallReview?.snapshot?.spec.id==='entry-whole-wall-31',{timeout:90000});const f=p.frames().find(f=>f.url().includes('column-view'));
 const helpers=fs.readFileSync('verify-fridge-layout.js','utf8').split('const visible=')[1].split('export function verifyFridgeLayout')[0];
 const result=await f.evaluate(`(async()=>{const T=await import('./vendor/three.module.js');const visible=${helpers}
 const w=wholeWall,m=columnViewDebug.dryStudy.model;w.entry.setOpen(false);m.updateMatrixWorld(true);
 const moving=[...w.shoeDoors,...w.entryDrawers,...w.dropDrawers,...w.shoeTrays];
 const obstacles=meshes(m).map(o=>({o,s:shape(o)})).filter(v=>v.s.high>.01&&v.s.low<2.45&&Math.max(...v.s.poly.map(p=>p[0]))>3.65&&Math.min(...v.s.poly.map(p=>p[0]))<6.3&&Math.max(...v.s.poly.map(p=>p[1]))>5.45&&Math.min(...v.s.poly.map(p=>p[1]))<7.2);const hits=[];
 for(const g of moving){const door=w.shoeDoors.includes(g),z=g.position.z,travel=w.dropDrawers.includes(g)?.1:w.shoeTrays.includes(g)?.25:.3;for(const t of[0,.25,.5,.75,1]){if(door)g.rotation.y=t*Math.PI/2;else g.position.z=z-travel*t;m.updateMatrixWorld(true);for(const o of meshes(g))for(const v of obstacles)if(!under(v.o,g)&&overlap(shape(o),v.s)&&!hits.some(h=>h.part===o.name&&h.obstacle===v.o.name))hits.push({group:g.name,part:o.name,obstacle:v.o.name,t});}g.rotation.y=0;g.position.z=z;m.updateMatrixWorld(true);}
 const s=w.snapshot();return {hits,groups:moving.map(g=>g.name),right:s.entryZones,drop:s.dropDimensions,fixedUnchanged:JSON.stringify(s.fixedBefore)===JSON.stringify(s.fixedAfter),snapshot:s};})()`);
 await p.evaluate(()=>{const svg=document.getElementById('elevation');svg.setAttribute('viewBox','5.52 .10 7.72 3.06');svg.querySelectorAll('text,line').forEach(n=>n.remove());});await p.locator('#elevation').screenshot({path:'entry-wall-31-render-layout.png'});
 await p.locator('#arrive').click();await p.waitForTimeout(700);await p.locator('#model').screenshot({path:'entry-wall-31-shoe-trays.png'});
 await p.locator('#shoeDetail').click();await p.waitForTimeout(700);await p.locator('#model').screenshot({path:'entry-wall-31-shoe-cabinet.png'});
 await p.locator('#bathDetail').click();await p.waitForTimeout(500);await p.locator('#model').screenshot({path:'entry-wall-31-bath-storage.png'});
 result.errors=errors;fs.writeFileSync('whole-wall-31-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,snapshot:undefined}));
}finally{await b?.close();}})().catch(e=>{console.error(e);process.exitCode=1});
