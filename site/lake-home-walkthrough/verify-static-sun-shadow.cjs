// Prove actual shadow renders are skipped, not merely that a cache flag changed.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const T=await import('./vendor/three.module.js'),{createStaticSunShadow}=await import('./static-sun-shadow.js');
 const model=new T.Group(),light=new T.DirectionalLight(),a=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial()),b=a.clone();a.castShadow=b.castShadow=true;model.add(a,b);
 const membership=createStaticSunShadow(model,light);assert.equal(membership.update(),true);assert.equal(membership.update(),false);
 b.visible=false;assert.equal(membership.update(),true);a.visible=false;b.visible=true;assert.equal(membership.update(),true,'Equal-count caster swaps must refresh');assert.equal(membership.update(),false);
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const p=await browser.newPage({viewport:{width:960,height:720}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=living');
  await p.waitForFunction(()=>window.staticSunShadowDebug&&window.columnViewDebug?.state.ready,null,{timeout:90000});
  await p.evaluate(async()=>{
   const {EffectComposer}=await import('./vendor/render-libs.js'),base=EffectComposer.prototype.render;
   EffectComposer.prototype.render=function(...args){window.sunTestRenderer=this.renderer;return base.apply(this,args);};
   roomViewsDebug.select('dining-sideboard');
  });await p.waitForFunction(()=>!!window.sunTestRenderer,null,{timeout:30000});
  const report=await p.evaluate(async()=>{
   const T=await import('./vendor/three.module.js'),cache=staticSunShadowDebug,renderer=sunTestRenderer,model=masterDressingDebug.model,scene=model.parent,camera=roomViewsDebug.camera;
   let draws=0;model.traverse(o=>{if(!o.isMesh)return;const base=o.onBeforeShadow;o.onBeforeShadow=function(r,obj,c,shadowCamera,...args){if(shadowCamera===cache.light.shadow.camera)draws++;return base.call(this,r,obj,c,shadowCamera,...args);};});
   const target=new T.WebGLRenderTarget(320,240),saved=renderer.getRenderTarget();
   const render=force=>{cache.update();if(force)cache.light.shadow.needsUpdate=true;const start=draws;renderer.setRenderTarget(target);renderer.render(scene,camera);const pixels=new Uint8Array(320*240*4);renderer.readRenderTargetPixels(target,0,0,320,240,pixels);return {shadowDraws:draws-start,pixels};};
   try{
    const fresh=render(true),cached=render(false);let changedPixels=0;for(let i=0;i<fresh.pixels.length;i++)if(fresh.pixels[i]!==cached.pixels[i])changedPixels++;
    const revision=cache.state.revision,position=camera.position.clone();camera.position.x+=.02;const cameraOnly=render(false);camera.position.copy(position);
    fridgeDetailsDebug.setDoors(1);const open=render(false);fridgeDetailsDebug.reset();const close=render(false);
    const pick=model.getObjectByName('mesh_55');if(!pick?.castShadow)throw Error('Expected a structural caster');
    const map=new T.Texture(),original=pick.material,material=original.clone();pick.material=material;material.alphaMap=map;cache.update();cache.light.shadow.needsUpdate=false;
    map.offset.x=.25;const textureChanged=cache.update()&&cache.light.shadow.needsUpdate;pick.material=original;material.dispose();map.dispose();cache.update();
    return {fresh:fresh.shadowDraws,cached:cached.shadowDraws,changedPixels,cameraOnly:cameraOnly.shadowDraws,initialRevision:revision,open:open.shadowDraws,close:close.shadowDraws,textureChanged,state:cache.state};
   }finally{renderer.setRenderTarget(saved);target.dispose();}
  });
  assert.ok(report.fresh>500);assert.equal(report.cached,0);assert.equal(report.changedPixels,0,'Cached shadows changed identical-camera pixels');assert.equal(report.cameraOnly,0);assert.ok(report.open>500&&report.close>500);assert.ok(report.textureChanged);assert.deepEqual(errors,[]);
  report.errors=errors;report.equalCountSwap=true;report.limits='Same-camera 320x240 GPU pixels and actual sun-shadow draw callbacks; not whole-home photoreal or physical-phone FPS acceptance.';
  fs.writeFileSync(__dirname+'/static-sun-shadow-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
