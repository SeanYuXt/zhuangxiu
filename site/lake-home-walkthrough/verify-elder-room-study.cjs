const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/elder-room-study.html');await page.waitForFunction(()=>window.elderStudy?.ready,{},{timeout:60000});
 const geometry=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),s=window.elderStudy;s.model.updateMatrixWorld(true);s.candidate.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(s.bed),c=s.study;
  const clearance={window:box.min.z-c.windowFront,wardrobe:c.wardrobe.z0-box.max.z,foot:c.rightWall-box.max.x};
  const poly=s.spec.spaces.find(r=>r.id==='bed1').polygons[0].map(([x,z])=>[x,-z]);
  const inside=(x,z)=>{let result=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const[a,b]=poly[i],[d,e]=poly[j];if((b>z)!==(e>z)&&x<(d-a)*(z-b)/(e-b)+a)result=!result;}return result;};
  const targets=[c.bed,c.wardrobe],outside=[];targets.forEach((r,n)=>{for(let x=r.x0+.001;x<r.x1;x+=.02)for(let z=r.z0+.001;z<r.z1;z+=.02)if(!inside(x,z))outside.push({n,x,z});});
  const door=s.spec.openings.find(o=>o.id==='bed1'),w=s.spec.walls.find(w=>w.id===door.wall_id),len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),hx=w.a[0]+(w.b[0]-w.a[0])*(door.offset+door.width)/len,hz=-(w.a[1]+(w.b[1]-w.a[1])*(door.offset+door.width)/len);
  let doorHits=0;for(let a=0;a<=90;a++)for(let t=0;t<=door.width;t+=.005){const x=hx-t*Math.cos(a*Math.PI/180),z=hz-t*Math.sin(a*Math.PI/180);if(targets.some(r=>x>r.x0-.02&&x<r.x1+.02&&z>r.z0-.02&&z<r.z1+.02))doorHits++;}
  const overlap={width:Math.max(0,Math.min(c.bed.x1,c.seated.x1)-Math.max(c.bed.x0,c.seated.x0)),depth:Math.max(0,Math.min(c.bed.z1,c.seated.z1)-Math.max(c.bed.z0,c.seated.z0))};
  return {bed:{min:box.min.toArray(),max:box.max.toArray()},clearance,outsideCount:outside.length,doorHits,door,chairOverlap:overlap,wardrobe:c.wardrobe,windowCabinetHidden:!s.model.getObjectByName('bed1-window-storage').visible};
 });
 assert(Math.abs(geometry.clearance.window-.6005)<.002);assert(Math.abs(geometry.clearance.wardrobe-.62)<.002);assert(Math.abs(geometry.clearance.foot-.7125)<.002);assert.equal(geometry.outsideCount,0);assert.equal(geometry.doorHits,0);assert(geometry.windowCabinetHidden);assert(Math.abs(geometry.chairOverlap.depth-.54)<.001);
 await page.screenshot({path:path.join(__dirname,'elder-room-study-overview.png')});
 for(const id of ['room','storage','top','plan']){await page.locator(`[data-view="${id}"]`).click();if(id==='plan')assert(await page.locator('#plan').isVisible());else assert(await page.locator('#scene').isVisible());}
 await page.screenshot({path:path.join(__dirname,'elder-room-study-plan.png')});
 await page.locator('#desk').check();assert(await page.evaluate(()=>window.elderStudy.deskStudy.visible));await page.locator('#desk').uncheck();
 await page.locator('#original').click();assert.equal(await page.evaluate(()=>window.elderStudy.on),false);await page.locator('#candidate').click();
 await page.locator('[data-view="storage"]').click();await page.locator('#slide').check();const slideX=await page.evaluate(()=>window.elderStudy.candidate.getObjectByName('sliding-front-left').position.x);assert(Math.abs(slideX-2.06)<.001);
 await page.screenshot({path:path.join(__dirname,'elder-room-study-storage.png')});
 await page.locator('[data-view="overview"]').click();const before=await page.evaluate(()=>window.elderStudy.camera.position.toArray());const bounds=await page.locator('#scene').boundingBox();await page.mouse.move(bounds.x+bounds.width*.5,bounds.y+bounds.height*.5);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.65,bounds.y+bounds.height*.6,{steps:15});await page.mouse.up();const after=await page.evaluate(()=>window.elderStudy.camera.position.toArray());assert.notDeepEqual(before,after);
 await page.setViewportSize({width:390,height:844});await page.locator('[data-view="plan"]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(__dirname,'elder-room-study-mobile.png'),fullPage:true});
 assert.deepEqual(errors,[]);const report={result:'PASS',geometry,checks:['same-shell furniture footprints','91 door angles / 5mm leaf samples with 20mm allowance','actual bed bounds','five views','candidate/original','desk conflict','sliding door','orbit','390px overflow'],errors,limits:['No real-site verification','600mm total cabinet depth is a procurement assumption','Window recess usable-floor status unresolved','Writing/dressing desk NOT solved','No accessibility or two-person comfort certification']};fs.writeFileSync(path.join(__dirname,'elder-room-study-verification.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
