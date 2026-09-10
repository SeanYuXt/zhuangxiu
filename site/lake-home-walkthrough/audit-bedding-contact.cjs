// Read-only diagnostic: compare the actual duvet lining to the mattress surface.
// It does not infer comfort or cloth physics from mesh intersections.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=master');
  await page.waitForFunction(()=>window.masterDressingDebug&&columnViewDebug.state.ready);
  const report=await page.evaluate(async()=>{
   const T=await import('./vendor/three.module.js'),model=masterDressingDebug.model;
   model.updateMatrixWorld(true);
   return ['bed1-bed','bed3-bed','master-bed'].map(name=>{
    const bed=model.getObjectByName(name),mattress=name==='master-bed'?bed.children[1]:bed.getObjectByName(name+'-mattress'),lining=bed.getObjectByName(name+'-draped-duvet-lining');
    if(!mattress?.isMesh||!lining?.isMesh)throw Error('Missing current bedding surface '+name);
    const p=lining.geometry.attributes.position,gaps=[],samples=[],positions=[];
    for(let i=0;i<p.count;i++)positions.push(new T.Vector3().fromBufferAttribute(p,i));
    const indices=lining.geometry.index;
    for(let i=0;i<indices.count;i+=3)positions.push(new T.Vector3().fromBufferAttribute(p,indices.getX(i)).add(new T.Vector3().fromBufferAttribute(p,indices.getX(i+1))).add(new T.Vector3().fromBufferAttribute(p,indices.getX(i+2))).multiplyScalar(1/3));
    for(const local of positions){
     const v=local.clone().applyMatrix4(lining.matrixWorld);
     const hit=new T.Raycaster(v.clone().add(new T.Vector3(0,1,0)),new T.Vector3(0,-1,0),0,2).intersectObject(mattress,false)[0];
     if(!hit)continue;const gap=v.y-hit.point.y;gaps.push(gap);
     if(samples.length<8&&Math.abs(gap)>.015)samples.push({position:v.toArray(),support:hit.point.toArray(),gap});
    }
    return {name,sampled:positions.length,vertices:p.count,triangleCentres:indices.count/3,aboveMattress:gaps.length,minGap:Math.min(...gaps),maxGap:Math.max(...gaps),penetrating3mm:gaps.filter(g=>g<-.003).length,within3mm:gaps.filter(g=>Math.abs(g)<=.003).length,airGapOver10mm:gaps.filter(g=>g>.010).length,samples};
   });
  });
  fs.writeFileSync(__dirname+'/bedding-contact-audit.json',JSON.stringify({report,scope:'Static mesh support rays only; no deformation or cloth simulation performed.'},null,2));
  console.log(JSON.stringify(report.map(({samples,...rest})=>rest)));
  if(process.argv.includes('--verify'))for(const r of report){assert.ok(r.minGap>=-.001,r.name+' lining penetrates mattress');assert.ok(r.within3mm/r.aboveMattress>=.65,r.name+' unsupported lining');}
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
