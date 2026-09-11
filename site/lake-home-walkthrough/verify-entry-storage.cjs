const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8774/lake-home-walkthrough/column-view.html?space=passageArt&v=sideboard-depth-40-10');
  await page.waitForFunction(()=>window.columnCheck&&window.immersivePreviewDebug&&document.querySelector('#viewerDetailToggle'),{},{timeout:90000});
  const initialView=await page.evaluate(()=>structuredClone(columnViewDebug.state.targets.passageArt));
  const audit=await page.evaluate(async()=>{
   const {auditEntryDesign}=await import('./entry-design-audit.js?v=entry-wall-only-3');
   return auditEntryDesign(columnViewDebug.dryStudy.model,entryRevisionDebug,sideboardDetailsDebug);
  });
  const detail=await page.evaluate(async()=>{
   const T=await import('./vendor/three.module.js'),{setDoorLeafFraction,setDoorLeafOpen}=await import('./door-motion.js');
   const m=columnViewDebug.dryStudy.model,g=familyDisplayDebug,s=g.userData;
   const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible||p.isReflector||p.userData.walkThrough)return false;return true;};
   const boxes=root=>{const result=[];root.traverse(o=>{if(o.isMesh&&visible(o)){o.geometry.computeBoundingBox();result.push({o,name:o.name,b:o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)});}});return result;};
   const bounds=root=>{const b=new T.Box3();boxes(root).forEach(o=>b.union(o.b));return b;};
   const overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>.002);
   m.updateMatrixWorld(true);const parts=boxes(g),b=bounds(g),side=m.getObjectByName('flush-sideboard'),sideBox=bounds(side),casing=bounds(m.getObjectByName('door-casing-bed3'));
   const hits=[];
   for(const name of ['door-master-single','door-bed3-single']){
    const door=m.getObjectByName(name),was=door.userData.open;
    for(let angle=0;angle<=90;angle+=2){setDoorLeafFraction(door,angle/90);m.updateMatrixWorld(true);for(const moving of boxes(door))for(const fixed of parts)if(overlap(moving.b,fixed.b))hits.push({part:name,obstacle:fixed.name,angle});}
    setDoorLeafOpen(door,was);
   }
   const hinges=[];g.traverse(o=>{if(o.userData.cornerDoor)hinges.push(o);});
   const underHinge=o=>{for(let p=o;p;p=p.parent)if(p.userData.cornerDoor)return true;return false;};
   const fixed=parts.filter(p=>!underHinge(p.o));
   const nearby=[...boxes(side),...boxes(m.getObjectByName('door-casing-bed3')),...fixed];
   for(let angle=0;angle<=90;angle+=2){for(const hinge of hinges)hinge.rotation.y=angle*Math.PI/180;m.updateMatrixWorld(true);for(const hinge of hinges)for(const moving of boxes(hinge))for(const obstacle of nearby)if(overlap(moving.b,obstacle.b))hits.push({part:moving.name,obstacle:obstacle.name,angle});}
   hinges.forEach(h=>h.rotation.y=0);m.updateMatrixWorld(true);
   // New wall joinery must also leave the preserved sideboard usable.
   for(const band of ['upper','base'])for(let index=0;index<6;index++)for(let angle=0;angle<=90;angle+=2){sideboardDetailsDebug.setDoor(band,index,angle/90);for(const moving of boxes(m.getObjectByName('sideboard-'+band+'-door-'+index)))for(const obstacle of parts)if(overlap(moving.b,obstacle.b))hits.push({part:moving.name,obstacle:obstacle.name,angle});}
   for(let index=0;index<6;index++){sideboardDetailsDebug.setDrawer(index);for(const moving of boxes(m.getObjectByName('sideboard-drawer-'+index)))for(const obstacle of parts)if(overlap(moving.b,obstacle.b))hits.push({part:moving.name,obstacle:obstacle.name,drawer:'fully-open'});}
   sideboardDetailsDebug.reset();m.updateMatrixWorld(true);
   const hasNewComposition=hinges.length===0&&s.noBedroomCabinets&&!m.getObjectByName('entry-wall-return-shelf')&&!m.getObjectByName('entry-wall-lower-back')&&!m.getObjectByName('entry-wall-upper-back')&&!!m.getObjectByName('entry-corner-gallery')&&!!m.getObjectByName('entry-corner-floor-ceramics');
   const artRoot=m.getObjectByName('entry-corner-floor-ceramics'),artBounds=bounds(artRoot),galleryBounds=bounds(m.getObjectByName('entry-corner-gallery'));const artPlacement={height:artBounds.max.y,footprint:[artBounds.max.x-artBounds.min.x,artBounds.max.z-artBounds.min.z],childCasingGap:artBounds.min.z-casing.max.z,wallGap:Math.min(s.corner[0]-artBounds.max.x,s.corner[1]-artBounds.max.z),galleryFloorClear:galleryBounds.min.y};
   const assetStats=['entry-corner-gallery','entry-corner-floor-ceramics','entry-corner-mineral-finish'].map(name=>{const root=m.getObjectByName(name),size=bounds(root).getSize(new T.Vector3()),meshes=boxes(root);return {name,size:size.toArray(),texturedMeshes:meshes.filter(p=>p.o.material.map?.image).length,base:bounds(root).min.y};});
   const route=[[10.8,6.12],[12.0,6.12],[13.46,6.12],[14.20,6.12]],routeHits=new Set();
   const obstacles=boxes(m).filter(({b})=>b.max.y>.10&&b.min.y<1.90&&b.max.x>10.4&&b.min.x<14.6&&b.max.z>5.75&&b.min.z<6.5);
   for(let i=1;i<route.length;i++){const a=route[i-1],end=route[i],steps=Math.ceil(Math.hypot(end[0]-a[0],end[1]-a[1])/.025);for(let k=0;k<=steps;k++){const x=a[0]+(end[0]-a[0])*k/steps,z=a[1]+(end[1]-a[1])*k/steps;for(const {name,b} of obstacles)if(Math.hypot(Math.max(b.min.x-x,0,x-b.max.x),Math.max(b.min.z-z,0,z-b.max.z))<.299)routeHits.add(name);}}
   return {artPlacement,hasNewComposition,hits,sideboard:{width:sideBox.max.x-sideBox.min.x,top:sideBox.max.y,upperVisible:Array.from({length:6},(_,i)=>visible(m.getObjectByName('sideboard-upper-door-'+i))),noAddedShelf:!m.getObjectByName('entry-sideboard-display'),noAddedCeramics:!m.getObjectByName('sideboard-real-ceramics'),stoneBack:side.getObjectByName('mesh_711').material.name==='warm-white-fine-veined-quartz-study'},newWall:{min:b.min.toArray(),max:b.max.toArray(),sideboardGap:b.min.x-sideBox.max.x,childCasingGap:b.min.z-casing.max.z,wallPenetrations:parts.filter(({b})=>b.max.x>s.corner[0]+.001||b.max.z>s.corner[1]+.001).map(p=>p.name)},assetStats,route:{diameter:.60,points:route,hits:[...routeHits]},oldDecorationRemoved:!m.getObjectByName('entry-sculpture-ceramic-loop')&&!m.getObjectByName('entry-sculpture-solid-stone-plinth')&&!m.getObjectByName('corner-cobalt-sculpture')&&!m.getObjectByName('corner-coral-relief')};
  });
  console.log(JSON.stringify({...detail,hits:detail.hits.slice(0,6),hitCount:detail.hits.length}));
  assert.equal(detail.hits.length,0,JSON.stringify(detail.hits.slice(0,6)));assert.deepEqual(detail.newWall.wallPenetrations,[]);
  assert.ok(detail.hasNewComposition);assert.ok(detail.artPlacement.height>1.0&&detail.artPlacement.height<1.20);assert.ok(detail.artPlacement.childCasingGap>.08&&detail.artPlacement.wallGap>.04);assert.ok(detail.artPlacement.galleryFloorClear>1.50);assert.ok(detail.sideboard.upperVisible.every(Boolean));assert.ok(detail.sideboard.noAddedShelf&&detail.sideboard.noAddedCeramics&&detail.sideboard.stoneBack);
  assert.ok(Math.abs(detail.sideboard.width-3.90)<.001);assert.ok(Math.abs(detail.sideboard.top-2.41)<.001);
  assert.ok(Math.abs(detail.newWall.sideboardGap-.026)<.002);assert.ok(detail.newWall.childCasingGap>.05);assert.ok(detail.oldDecorationRemoved);
  assert.equal(await page.locator('#familyStorageToggle').count(),0);assert.ok(detail.assetStats.every(o=>o.size.every(v=>v>0)));assert.deepEqual(detail.route.hits,[]);
  const service=await page.evaluate(async()=>{
   const T=await import('./vendor/three.module.js'),{setFamilyServiceOpen}=await import('./family-display.js?v=sideboard-depth-40-10');
   const m=columnViewDebug.dryStudy.model,g=familyDisplayDebug,s=g.userData,beam=m.getObjectByName('entry-service-beam-study');
   const meshes=root=>{const a=[];root.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingBox();a.push({o,b:o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)});}});return a;};
   const overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>.002);
   const under=(o,root)=>{for(let p=o;p;p=p.parent)if(p===root)return true;return false;};
   const hits=[];m.updateMatrixWorld(true);
   for(const b of meshes(beam))for(const p of meshes(g))if(overlap(b.b,p.b))hits.push({type:'beam-envelope',part:p.o.name});
   const outer=[m.getObjectByName('flush-sideboard'),m.getObjectByName('door-casing-bed3'),beam];
   for(const id of ['upper','lower'])for(const original of [false,true]){
    if(original)setFamilyServiceOpen(g,id,true,false);
    const hinge=g.getObjectByName((original?'entry-original-box-hinge-':'entry-service-cover-hinge-')+id);
    for(let angle=0;angle<=90;angle+=2){hinge.rotation.y=-angle*Math.PI/180;m.updateMatrixWorld(true);const fixed=[...meshes(g).filter(p=>!under(p.o,hinge)),...outer.flatMap(meshes)];for(const moving of meshes(hinge))for(const p of fixed)if(overlap(moving.b,p.b))hits.push({id,original,angle,moving:moving.o.name,fixed:p.o.name});}
    setFamilyServiceOpen(g,id,false,original);
    setFamilyServiceOpen(g,id,false,false);
   }
   m.updateMatrixWorld(true);
   const zoneHits=[];
   for(const panel of s.service.panels){const x0=s.service.startX;
    const zone=new T.Box3(new T.Vector3(x0+.022,panel.bottom+.012,s.corner[1]-s.service.depth+.012),new T.Vector3(x0+s.service.width-.022,panel.top-.012,s.corner[1]-.030));
    for(const p of meshes(g))if(!p.o.name.startsWith('entry-service-')&&!p.o.name.startsWith('entry-original-')&&overlap(p.b,zone))zoneHits.push({panel:panel.id,part:p.o.name});
    for(const p of meshes(g).filter(p=>p.o.name.startsWith('entry-service-niche')))if(overlap(p.b,zone))zoneHits.push({panel:panel.id,part:p.o.name});
   }
   const ribAudit=s.service.panels.map(p=>{const hinge=g.getObjectByName('entry-service-cover-hinge-'+p.id),ribs=hinge.children.filter(o=>o.name==='entry-service-cover-rib-'+p.id);return {id:p.id,count:ribs.length,attached:ribs.every(r=>r.parent===hinge),avoidsVents:!p.ventilated||ribs.every(r=>{const b=new T.Box3().setFromObject(r);return b.min.y>p.bottom+.024&&b.max.y<p.top-.024;})};});
   const coverProjection=Math.max(...['upper','lower'].map(id=>s.corner[1]-new T.Box3().setFromObject(g.getObjectByName('entry-service-cover-hinge-'+id)).min.z));
   const sb=new T.Box3().setFromObject(m.getObjectByName('flush-sideboard')),beamBounds=new T.Box3().setFromObject(beam),boxBounds=new T.Box3().setFromObject(g.getObjectByName('entry-original-box-lower'));
   return {nicheContainsVase:!!g.getObjectByName('entry-niche-ceramic-vase'),noElectricalBack:g.getObjectByName('entry-service-shallow-carcass').userData.noBackInElectricalZones,ribAudit,coverProjection,layout:{sideboardEnd:sb.max.x,tvFace:s.tvFaceX,boxNear:boxBounds.min.x-s.tvFaceX,boxFar:boxBounds.max.x-s.tvFaceX,beamNear:beamBounds.min.x-s.tvFaceX,boxToBeam:beamBounds.min.x-boxBounds.max.x,afterBeamModel:s.corner[0]-beamBounds.max.x,displayStart:s.displayStartX,beamFar:beamBounds.max.x},hits,zoneHits,cabinetTop:new T.Box3().setFromObject(g.getObjectByName('entry-service-cover-hinge-upper')).max.y,beamMeasured:s.beam.measured,boxesMeasured:s.service.measured,boxIdentityConfirmed:s.service.identitiesConfirmed,nicheBackRemovable:g.getObjectByName('entry-service-niche-removable-back').userData.removable,beamGap:s.beam.bottom-s.top,limits:'CAD box projection and user-relative beam near edge checked in model. Box elevations, second box alignment, beam width and hinges are assumptions; not a survey.'};
  });
  console.log(JSON.stringify({service:{...service,hits:service.hits.slice(0,6),hitCount:service.hits.length}}));assert.equal(service.hits.length,0,JSON.stringify(service.hits.slice(0,6)));assert.ok(service.ribAudit.every(r=>r.count===26&&r.attached&&r.avoidsVents));assert.ok(Math.abs(service.coverProjection-.25)<.001);assert.deepEqual(service.zoneHits,[]);assert.ok(service.nicheContainsVase&&service.noElectricalBack);assert.ok(Math.abs(service.cabinetTop-2.4)<.001);assert.equal(service.boxesMeasured,false);assert.equal(service.beamMeasured,false);assert.equal(service.nicheBackRemovable,true);
  for(const [key,value] of Object.entries({boxNear:.150,boxFar:.600,beamNear:.700,boxToBeam:.100,afterBeamModel:.885}))assert.ok(Math.abs(service.layout[key]-value)<.001,key);
  assert.ok(Math.abs(service.layout.sideboardEnd-service.layout.tvFace)<.001);assert.ok(Math.abs(service.layout.displayStart-service.layout.beamFar)<.001);
  await page.evaluate(()=>columnViewDebug.visit('passageArt'));await page.waitForTimeout(700);
  await page.locator('#viewport').screenshot({path:path.join(__dirname,'entry-service-daily-desktop.png')});
  await page.locator('#entryServiceActions summary').click();
  const upperOriginal=page.locator('[data-service-box="upper"][data-service-layer="original"]');
  await upperOriginal.click();
  assert.deepEqual(await page.evaluate(()=>familyDisplayDebug.userData.serviceState.upper),{cover:true,original:true});
  assert.deepEqual(await page.evaluate(()=>familyDisplayDebug.userData.serviceState.lower),{cover:false,original:false});
  await page.locator('[data-service-box="lower"][data-service-layer="original"]').click();
  await page.waitForTimeout(400);await page.locator('#viewport').screenshot({path:path.join(__dirname,'entry-service-access-desktop.png')});
  for(const id of ['upper','lower'])await page.locator(`[data-service-box="${id}"][data-service-layer="cover"]`).click();
  assert.deepEqual(await page.evaluate(()=>familyDisplayDebug.userData.serviceState),{upper:{cover:false,original:false},lower:{cover:false,original:false}});
  await page.locator('#entryServiceActions summary').click();
  await page.evaluate(()=>{Object.assign(columnViewDebug.state.targets.passageArt,{position:[10.65,1.60,4.70],look:[11.5,1.34,7.08]});columnViewDebug.visit('passageArt');});
  await page.waitForTimeout(700);await page.locator('#viewport').screenshot({path:path.join(__dirname,'sideboard-preserved-wall-new.png')});
  await page.evaluate(view=>{Object.assign(columnViewDebug.state.targets.passageArt,view);columnViewDebug.visit('passageArt');},initialView);
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(700);
  await page.screenshot({path:path.join(__dirname,'entry-service-mobile.png')});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  const evidence={verifiedAt:new Date().toISOString(),revision:'sideboard-depth-40-10',entryAudit:audit,detail,service,consoleErrors:errors,limits:'原餐边柜保留并齐电视原墙面；验证CAD箱位投影＋用户相对梁位下的几何与开合。梁宽/梁底、第二箱同轴、箱高和右铰链为假设；现场安装未验证。600mm路线仅为饰面关闭时占位；检修会占走廊。'};
  fs.writeFileSync(path.join(__dirname,'entry-design-verification.json'),JSON.stringify(evidence,null,2)+'\n','utf8');
  console.log('PASS: preserved sideboard, independent wall design, door sweeps, textured decor, mobile');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
