// Regression: closed/inside-out basin, floating countertop accessories, blocked sink.
const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=bath2&angle=ensuite-basin');
  await page.waitForFunction(()=>window.columnViewDebug?.state.ready);
  const report=await page.evaluate(async()=>{
   const T=await import('./vendor/three.module.js'),model=masterDressingDebug.model,vanity=masterBathDetailsDebug.root;
   model.updateMatrixWorld(true);const shell=model.getObjectByName('bath2-glazed-basin-shell'),index=shell.geometry.index,edges=new Map();
   for(let i=0;i<index.count;i+=3)for(const [a,b] of [[0,1],[1,2],[2,0]]){const u=index.getX(i+a),v=index.getX(i+b),key=u<v?u+','+v:v+','+u;edges.set(key,(edges.get(key)||0)+1);}
   const ray=new T.Raycaster(),probe=(pos,dir,object)=>{ray.set(vanity.localToWorld(new T.Vector3(...pos)),new T.Vector3(...dir).transformDirection(vanity.matrixWorld));return ray.intersectObject(object,true).map(h=>({name:h.object.name,local:vanity.worldToLocal(h.point.clone()).toArray(),normal:h.face.normal.toArray()}));};
   const basin={edges:[...edges.values()].filter(n=>n!==2).length,vertices:shell.geometry.attributes.position.count,down:probe([.12,1,.015],[0,-1,0],shell),under:probe([.12,.60,.015],[0,1,0],shell),drainHole:probe([0,1,.015],[0,-1,0],shell),mouth:vanity.getObjectByName('bath2-basin').userData};
   const names=['kitchen-oak-cutting-board','kitchen-wash-tray-bottom','bath2-toothbrush-cup'],supports=[];
   const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
   const counters=[];model.traverse(o=>{if(o.isMesh&&visible(o)&&(/kitchen-(west-worktop|sink-counter)/.test(o.name)||o.name==='bath2-open-worktop'))counters.push(o);});
   for(const name of names){const o=model.getObjectByName(name),b=new T.Box3().setFromObject(o),points=[];
    for(const tx of [.1,.9])for(const tz of [.1,.9]){
     const start=new T.Vector3(T.MathUtils.lerp(b.min.x,b.max.x,tx),b.min.y+.003,T.MathUtils.lerp(b.min.z,b.max.z,tz));ray.set(start,new T.Vector3(0,-1,0));ray.far=.02;
     const h=ray.intersectObjects(counters,false)[0];points.push({supported:!!h,gap:h?b.min.y-h.point.y:null,counter:h?.object.name});
    }supports.push({name,min:b.min.toArray(),max:b.max.toArray(),points});
   }
   const accessories=[];for(const n of ['kitchen-wash-everyday','kitchen-prep-everyday'])model.getObjectByName(n).traverse(o=>{if(o.isMesh)accessories.push(o);});
   const sinkObstructions=[];ray.far=2;
   for(const x of [4.65,4.86,5.07])for(const z of [2.03,2.17,2.31]){ray.set(new T.Vector3(x,1.3,z),new T.Vector3(0,-1,0));const hits=ray.intersectObjects(accessories,false);if(hits.length)sinkObstructions.push(hits[0].object.name);}
   const {roomViewpoints,roomViewFov}=await import('./room-viewpoints.js'),view=roomViewpoints.find(v=>v.id==='ensuite-basin'),camera=new T.PerspectiveCamera(roomViewFov(view,view.renderAspect),view.renderAspect,.03,100);
   camera.position.fromArray(view.position);camera.lookAt(new T.Vector3(...view.look));camera.updateMatrixWorld(true);
   // Actual surfaces, not the empty upper-front corners of a combined mirror/cabinet AABB.
   let projected=0;const outside=[],extents={x:0,y:0};
   vanity.traverse(o=>{if(!o.isMesh||!visible(o))return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld).project(camera);projected++;extents.x=Math.max(extents.x,Math.abs(p.x));extents.y=Math.max(extents.y,Math.abs(p.y));if(Math.abs(p.x)>=.98||Math.abs(p.y)>=.98||p.z<=-1||p.z>=1){if(outside.length<15)outside.push({name:o.name,ndc:p.toArray()});}}});
   return {basin,supports,sinkObstructions,accessoryMeshes:accessories.length,selectedProduct:basin.mouth.productSelected,squareFrame:{aspect:view.renderAspect,projected,extents,outside}};
  });
  fs.writeFileSync(__dirname+'/wash-prep-surfaces-verification.json',JSON.stringify({...report,errors},null,2));
  assert.equal(report.basin.edges,0,'Closed ceramic skin');assert.equal(report.basin.drainHole.length,0,'Drain must remain a real hole');
  assert.ok(report.basin.down[0]?.normal[1]>0,'Inner surface must face into bowl');assert.ok(report.basin.under[0]?.normal[1]<0,'Outer surface must face down');
  assert.ok(report.basin.down[0].local[1]<.75,'Not a flat top cap');assert.equal(report.selectedProduct,false);
  for(const s of report.supports)assert.ok(s.points.every(p=>p.supported&&Math.abs(p.gap)<.003),JSON.stringify(s));
  assert.deepEqual(report.sinkObstructions,[]);assert.deepEqual(errors,[]);
  assert.equal(report.squareFrame.aspect,1);
  assert.deepEqual(report.squareFrame.outside,[],'Whole vanity/mirror surfaces must fit the square render');
  report.ui=[];
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:width===390?844:1000});
   for(const [room,name] of [['kitchen','kitchen-prep-everyday'],['kitchen','kitchen-wash-everyday'],['bath2','bath2-basin']]){
    await page.selectOption('#roomSelect',room,{force:true});
    if(width===390){await page.locator('#placeDetails').click();await page.locator(`#placeSheet [data-detail-object="${name}"]`).click();}
    else{await page.locator('#facilities').evaluate(o=>o.open=true);await page.locator(`#facilityList [data-facility="${name}"]`).click();}
    await page.waitForFunction(name=>columnViewDebug.state.selectedFacility===name,name);
    assert.equal(await page.evaluate(()=>columnViewDebug.state.clipPlanes),0);
    report.ui.push({width,room,name,selected:true});
    await page.screenshot({path:__dirname+`/wash-prep-${name}-${width}.png`});
   }
  }
  await page.goto('http://127.0.0.1:8768/lake-home-walkthrough/mobile-preview.html?space=kitchen');
  const frame=page.frameLocator('iframe');await frame.locator('#placeDetails').click();
  await frame.locator('[data-detail-object="kitchen-prep-everyday"]').click();
  report.wrapper=await frame.locator('body').evaluate(()=>columnViewDebug.state.selectedFacility);
  assert.equal(report.wrapper,'kitchen-prep-everyday');assert.deepEqual(errors,[]);
  fs.writeFileSync(__dirname+'/wash-prep-surfaces-verification.json',JSON.stringify({...report,errors},null,2));
  console.log(JSON.stringify({...report,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
