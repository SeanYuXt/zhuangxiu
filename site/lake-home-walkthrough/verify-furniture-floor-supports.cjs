// Protect floor contact, furniture heights, fixed lift bases and movable glides.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=master&v=grounded-furniture');
 await page.waitForFunction(()=>columnViewDebug?.state.ready&&window.bedroomRevisionDebug);
 const result=await page.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),{tileLayout}=await import('./tile-surfaces.js'),model=masterDressingDebug.model;
  model.updateMatrixWorld(true);const box=o=>new T.Box3().setFromObject(o),visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const roots=[],glides=[],floors=[],failures=[];
  model.traverse(o=>{if(!visible(o))return;if(o.userData.detailRole==='furniture-floor-support')roots.push(o);if(o.userData.detailRole==='furniture-floor-glide')glides.push(o);if(o.isMesh&&o.name==='800x800-cut-porcelain')floors.push(o);});
  const localBox=(o,parent)=>{o.geometry.computeBoundingBox();return o.geometry.boundingBox.clone().applyMatrix4(parent.matrixWorld.clone().invert().multiply(o.matrixWorld));};
  const check=(ok,note)=>{if(!ok)failures.push(note);},near=(a,b)=>Math.abs(a-b)<1e-6;
  const supportReport=roots.map(g=>{
   const d=g.userData,target=g.parent.getObjectByName(d.target),tb=box(target),gb=box(g),rails=g.children.filter(o=>o.userData.supportRole==='bearing-rail'),seals=g.children.filter(o=>o.userData.supportRole==='floor-contact');
   check(near(gb.min.y,tileLayout.surfaceY),g.name+' floor');check(near(gb.max.y,tb.min.y),g.name+' top joint');
   const original=d.originalTargetBounds,current=localBox(target,g.parent);check(current.min.distanceTo(new T.Vector3(...original.min))<1e-6&&current.max.distanceTo(new T.Vector3(...original.max))<1e-6,g.name+' target moved');
   let floorHits=0,topHits=0,volume=0;
   for(const rail of rails){const rb=box(rail),c=rb.getCenter(new T.Vector3()),lb=localBox(rail,g.parent);volume+=(lb.max.x-lb.min.x)*(lb.max.z-lb.min.z)*(lb.max.y-lb.min.y);
    check(lb.min.x>=original.min[0]&&lb.max.x<=original.max[0]&&lb.min.z>=original.min[2]&&lb.max.z<=original.max[2],rail.name+' footprint');
    const hit=new T.Raycaster(new T.Vector3(c.x,rb.max.y-.0005,c.z),new T.Vector3(0,1,0),0,.003).intersectObject(target,false)[0];if(hit&&Math.abs(hit.point.y-rb.max.y)<1e-5)topHits++;
   }
   for(const seal of seals){const b=box(seal),c=b.getCenter(new T.Vector3()),hit=new T.Raycaster(new T.Vector3(c.x,b.min.y+.001,c.z),new T.Vector3(0,-1,0),0,.004).intersectObjects(floors,false)[0];if(hit&&Math.abs(hit.point.y-b.min.y)<1e-6)floorHits++;}
   check(topHits===rails.length,g.name+' rails not under board');check(floorHits===seals.length,g.name+' missing actual floor contact');
   const fill=volume/((gb.max.x-gb.min.x)*(gb.max.z-gb.min.z)*(gb.max.y-gb.min.y));check(fill<.40,g.name+' solid slab instead of hollow base');
   return {name:g.name,bottom:gb.min.y,top:gb.max.y,rails:rails.length,floorHits,topHits,fill};
  });
  const glideReport=glides.map(g=>{
   const d=g.userData,b=box(g),local=localBox(g,g.parent),c=local.getCenter(new T.Vector3());
   const shaft=g.parent.children.find(o=>o.isMesh&&o.userData.groundedLeg&&o.name===d.target&&Math.abs(localBox(o,g.parent).getCenter(new T.Vector3()).x-c.x)<1e-5&&Math.abs(localBox(o,g.parent).getCenter(new T.Vector3()).z-c.z)<1e-5);
   check(!!shaft,g.name+' missing shaft');if(shaft){const sb=localBox(shaft,g.parent);check(near(sb.max.y,d.originalTop),g.name+' changed top');check(near(sb.min.y,local.max.y),g.name+' shaft joint');}
   const world=b.getCenter(new T.Vector3()),hit=new T.Raycaster(new T.Vector3(world.x,b.min.y+.001,world.z),new T.Vector3(0,-1,0),0,.004).intersectObjects(floors,false)[0];
   check(near(b.min.y,tileLayout.surfaceY)&&!!hit&&near(hit.point.y,b.min.y),g.name+' actual floor');
   return {name:g.name,bottom:b.min.y,originalTop:d.originalTop,shaftFound:!!shaft};
  });
  const fixed=['bed1-bed-floor-support','bed3-bed-floor-support'].map(n=>({name:n,before:box(model.getObjectByName(n)).clone()}));
  bedroomRevisionDebug.set('elderStorage',true);bedroomRevisionDebug.set('childStorage',true);model.updateMatrixWorld(true);
  fixed.forEach(v=>check(box(model.getObjectByName(v.name)).equals(v.before),v.name+' moved with lift'));
  bedroomRevisionDebug.set('elderStorage',false);bedroomRevisionDebug.set('childStorage',false);
  const stool=model.getObjectByName('master-makeup-stool'),pad=stool.getObjectByName('makeup-stool-floor-glide-0'),before=pad.getWorldPosition(new T.Vector3());
  masterDressingDebug.controller.candidate.setUse('seated');model.updateMatrixWorld(true);const travel=pad.getWorldPosition(new T.Vector3()).distanceTo(before);check(near(travel,.45),'stool glide travel');
  masterDressingDebug.controller.candidate.setUse('stored');model.updateMatrixWorld(true);
  return {supports:supportReport,glides:glideReport,fixedLiftBases:fixed.map(v=>v.name),stoolGlideTravel:travel,failures};
 });
 assert.equal(result.supports.length,10);assert.equal(result.glides.length,12);assert.deepEqual(result.failures,[]);
 result.views=[];
 for(const [width,height] of [[1440,1000],[390,844]])for(const [room,object] of [['master','master-bed-floor-support'],['bed1','bed1-bed-floor-support'],['bed3','bed3-bed-floor-support'],['bed3','child-chair-floor-glide-0'],['master','makeup-stool-floor-glide-1']]){
  await page.setViewportSize({width,height});
  if(width<800){await page.locator('#allPlaces').click();await page.locator(`[data-place="${room}"]`).click();await page.locator('#placeDetails').click();await page.locator(`[data-detail-object="${object}"]`).click();}
  else{await page.selectOption('#roomSelect',room);await page.locator('#facilities').evaluate(o=>o.open=true);await page.locator(`[data-facility="${object}"]`).click();}
  const state=await page.evaluate(()=>columnViewDebug.state);assert.equal(state.selectedFacility,object);assert.ok(state.selectedVisible,object+' camera hidden');assert.equal(state.clipPlanes,0);
  result.views.push({width,object,visible:state.selectedVisible,position:state.position});await page.screenshot({path:__dirname+`/floor-support-${object}-${width}.png`});
 }
 // Replacement must recreate all component-local resources and leave no duplicates.
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.querySelector('[data-dressing-option="open"]').click());await page.evaluate(()=>document.querySelector('[data-dressing-option="balanced"]').click());
 const rebuilt=await page.evaluate(()=>{const out=[];masterDressingDebug.controller.candidate.root.traverse(o=>{if(o.userData.detailRole==='furniture-floor-support')out.push(o.name);});return out;});assert.equal(rebuilt.length,5);assert.equal(new Set(rebuilt).size,5);result.rebuilt=rebuilt;
 assert.deepEqual(errors,[]);result.errors=errors;fs.writeFileSync(__dirname+'/furniture-floor-supports-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
