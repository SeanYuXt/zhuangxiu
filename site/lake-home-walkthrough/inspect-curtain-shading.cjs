const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 await page.route('**/column-view.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const composer=new EffectComposer(renderer);','const composer=new EffectComposer(renderer);composer.renderTarget1.samples=4;composer.renderTarget2.samples=4;')});});
 await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=master');
 await page.waitForFunction(()=>window.curtainDetailsDebug&&columnViewDebug.state.ready,null,{timeout:60000});
 await page.locator('#curtainToggle').click();await page.selectOption('#curtainRoom','master');
 for(const variant of ['msaa','half']){
  await page.locator(`[data-curtain-pose="${variant==='half'?50:0}"]`).click();
  await page.screenshot({path:__dirname+'/curtain-shading-'+variant+'.png'});
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
