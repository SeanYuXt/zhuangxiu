const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=living&v=hvac-details');await p.waitForFunction(()=>window.hvacDetailsDebug&&window.walkDebug,{timeout:60000});
 const report=await p.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),d=hvacDetailsDebug,m=masterDressingDebug.model;
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;},under=(o,g)=>{for(let p=o;p;p=p.parent)if(p===g)return true;return false;},bounds=o=>new T.Box3().setFromObject(o),meshes=g=>{const a=[];g.traverse(o=>{if(o.isMesh&&visible(o))a.push(o);});return a;};
  const obb=o=>{o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,c=b.getCenter(new T.Vector3()).applyMatrix4(o.matrixWorld),s=b.getSize(new T.Vector3()).multiplyScalar(.5),e=o.matrixWorld.elements,axes=[new T.Vector3(e[0],e[1],e[2]),new T.Vector3(e[4],e[5],e[6]),new T.Vector3(e[8],e[9],e[10])],ext=axes.map((v,i)=>v.length()*s.getComponent(i));axes.forEach(v=>v.normalize());return {c,axes,ext};};
  const overlap=(a,b)=>{const delta=b.c.clone().sub(a.c),axes=[...a.axes,...b.axes];for(const x of a.axes)for(const y of b.axes){const v=x.clone().cross(y);if(v.lengthSq()>1e-10)axes.push(v.normalize());}return axes.every(v=>a.axes.reduce((n,x,i)=>n+Math.abs(x.dot(v))*a.ext[i],0)+b.axes.reduce((n,x,i)=>n+Math.abs(x.dot(v))*b.ext[i],0)-Math.abs(delta.dot(v))>.001);};
  d.reset();m.updateMatrixWorld(true);const all=meshes(m),hits=new Map(),invalid=[],sweeps=[],splitBounds={};
  const inspect=(roots,others,kind,pose)=>{const movers=roots.flatMap(meshes);for(const a of movers)for(const b of others){if(!bounds(a).intersectsBox(bounds(b)))continue;if(overlap(obb(a),obb(b))){const key=kind+'|'+a.name+'|'+b.name;if(!hits.has(key))hits.set(key,{kind,pose,part:a.name,other:b.name,parent:b.parent.name});}}};
  for(const [id,s] of Object.entries(d.splits)){
   const vicinity=bounds(s.root).expandByScalar(.7),local=all.filter(o=>vicinity.intersectsBox(bounds(o)));
   const visibleBox=new T.Box3();meshes(s.root).forEach(o=>visibleBox.union(bounds(o)));splitBounds[id]={min:visibleBox.min.toArray(),max:visibleBox.max.toArray()};
   inspect([s.root],local.filter(o=>!under(o,s.root)),'installed-'+id,0);
   for(const [roots,move,key] of [[[s.cover],t=>s.setCover(t),'cover'],[s.filters,t=>s.setFilters(t),'filters'],[[s.flap],t=>{s.flap.rotation.x=-1.12*t;},'flap']]){
    d.reset();const others=local.filter(o=>!roots.some(g=>under(o,g)));
    for(let i=0;i<=90;i++){move(i/90);m.updateMatrixWorld(true);inspect(roots,others,id+'-'+key,i);}sweeps.push(id+'-'+key);
   }
   s.reset();s.setFilters(1);s.setCover(0);if(s.state.filters||s.state.cover)invalid.push(id+' close did not retract filters');s.setFilters(1);s.setRun(true);if(s.state.filters||s.state.cover||!s.state.running)invalid.push(id+' run did not close filters/cover');
  }
  d.reset();m.updateMatrixWorld(true);const c=d.ducted,vicinity=bounds(c.root).expandByScalar(.5),local=all.filter(o=>vicinity.intersectsBox(bounds(o)));
  for(const [root,move,key] of [[c.grille,t=>c.setReturn(t),'return'],[c.filter,t=>c.setFilter(t),'filter'],[c.hatch,t=>c.setHatch(t),'hatch']]){
   d.reset();const others=local.filter(o=>!under(o,root));for(let i=0;i<=90;i++){move(i/90);m.updateMatrixWorld(true);inspect([root],others,'duct-'+key,i);}sweeps.push('duct-'+key);
  }
  d.reset();m.updateMatrixWorld(true);const unitCase=new T.Box3();c.unit.traverse(o=>{if(o.isMesh&&(['indoor-unit-top','indoor-unit-side','indoor-unit-back'].includes(o.name)||o.parent.name==='indoor-return-pan'))unitCase.union(bounds(o));});
  const shellHits=[];for(const a of meshes(c.unit))for(const b of meshes(c.shell))if(overlap(obb(a),obb(b)))shellHits.push([a.name,b.name]);
  const shellParts=meshes(c.shell);for(let i=0;i<shellParts.length;i++)for(let j=i+1;j<shellParts.length;j++)if(overlap(obb(shellParts[i]),obb(shellParts[j])))shellHits.push(['shell-self:'+shellParts[i].name,shellParts[j].name]);
  const triangleContact=(a,b)=>{const matrix=a.matrixWorld.clone().invert().multiply(b.matrixWorld),bb=a.geometry.boundingBox.clone().expandByScalar(-.001),g=b.geometry,idx=g.index,pos=g.attributes.position,triangle=new T.Triangle();for(let i=0;i<(idx?idx.count:pos.count);i+=3){for(const [v,j] of [[triangle.a,0],[triangle.b,1],[triangle.c,2]])v.fromBufferAttribute(pos,idx?idx.getX(i+j):i+j).applyMatrix4(matrix);if(bb.intersectsTriangle(triangle))return true;}return false;};
  const staticShellContacts=[];for(const a of meshes(c.shell))for(const b of local.filter(o=>!under(o,c.root)))if(bounds(a).intersectsBox(bounds(b))&&overlap(obb(a),obb(b))&&triangleContact(a,b))staticShellContacts.push({a:a.name,b:b.name,parent:b.parent.name,min:bounds(b).min.toArray(),max:bounds(b).max.toArray()});
  const passages=[];for(const [id,start,end] of [
   ['direct-supply-centre',[9.33,2.64,5.38],[9.33,2.64,5.666]],
   ['direct-supply-left',[8.89,2.64,5.38],[8.89,2.64,5.666]],
   ['direct-supply-right',[9.77,2.64,5.38],[9.77,2.64,5.666]]
  ]){start[2]+=d.design.offsetZ||0;end[2]+=d.design.offsetZ||0;const a=new T.Vector3(...start),b=new T.Vector3(...end),delta=b.sub(a),ray=new T.Raycaster(a,delta.clone().normalize(),.001,delta.length()-.001);const hit=ray.intersectObjects(meshes(m),false)[0];passages.push({id,hit:hit?{name:hit.object.name,distance:hit.distance}:null});}
  c.setFilter(1);m.updateMatrixWorld(true);for(const [id,x,z] of [['return',9.33,6.05],['hatch',10.23,5.95]]){c.setHatch(1);m.updateMatrixWorld(true);const ray=new T.Raycaster(new T.Vector3(x,2.39,z+(d.design.offsetZ||0)),new T.Vector3(0,1,0),.001,.10);const hit=ray.intersectObjects(meshes(c.root),false)[0];passages.push({id,hit:hit?{name:hit.object.name,distance:hit.distance}:null});}
  c.setReturn(0);if(c.state.filter)invalid.push('return did not retract filter');d.reset();m.updateMatrixWorld(true);
  for(const o of [...meshes(c.root),...Object.values(d.splits).flatMap(s=>meshes(s.root))])if([...o.geometry.attributes.position.array].some(n=>!Number.isFinite(n)))invalid.push(o.name+' nonfinite');
  return {sweeps,posesPerSweep:91,hits:[...hits.values()],shellHits,staticShellContacts,passages,invalid,splitBounds,caseSize:unitCase.getSize(new T.Vector3()).toArray(),lowPlanArea:(d.design.bay.x1-d.design.bay.x0)*(d.design.bay.z1-d.design.bay.z0),previousLowArea:d.design.previous.width*d.design.previous.depth,limits:['OBB sample tests are geometry, not manufacturer installation/airflow certification','2.8m height and equipment selection provisional','No verified outdoor, refrigerant or condensate route']};
 });
 fs.writeFileSync(__dirname+'/hvac-details-verification.json',JSON.stringify({...report,errors},null,2));
 console.log(JSON.stringify(report));assert.deepEqual(errors,[]);assert.deepEqual(report.invalid,[]);assert.deepEqual(report.hits,[]);assert.deepEqual(report.shellHits,[]);assert.deepEqual(report.staticShellContacts,[]);assert.ok(report.passages.every(x=>!x.hit));report.caseSize.forEach((v,i)=>assert.ok(Math.abs(v-[1.2,.22,.60][i])<.001));
 const controls=[];for(const [w,h] of [[1440,1000],[390,844],[844,390]]){
  await p.setViewportSize({width:w,height:h});if(w<1100)await p.locator('#mobileMenuToggle').click();await p.locator('#hvacToggle').click();
  for(const room of ['living','bed1','master','bed3']){await p.locator('#hvacRoom').selectOption(room);for(const action of room==='living'?['return','filter','hatch','cutaway','air','reset']:['cover','filters','run','air','reset']){await p.locator(`[data-hvac-action="${action}"]`).click();const s=await p.evaluate(()=>({room:columnViewDebug.state.station,selected:columnViewDebug.state.selectedFacility,visible:columnViewDebug.state.selectedVisible}));assert.equal(s.room,room);assert.ok(s.visible,JSON.stringify(s));}controls.push({w,h,room});}
  const r=await p.locator('#hvacActions').boundingBox();assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<=w+1&&r.y+r.height<=h+1);await p.locator('#hvacRoom').selectOption('living');await p.screenshot({path:__dirname+`/hvac-${w}-closed.png`});await p.locator('[data-hvac-action="cutaway"]').click();await p.screenshot({path:__dirname+`/hvac-${w}-cutaway.png`});await p.locator('#hvacClose').click();
 }
 await p.setViewportSize({width:1440,height:1000});await p.locator('#hvacToggle').click();
 for(const room of ['bed1','master','bed3']){await p.locator('#hvacRoom').selectOption(room);await p.locator('[data-hvac-action="filters"]').click();await p.screenshot({path:__dirname+'/hvac-'+room+'-filters.png'});}
 await p.locator('#hvacRoom').selectOption('living');await p.locator('[data-hvac-action="filter"]').click();await p.locator('[data-mode="top"]').click();
 assert.equal(await p.locator('#hvacActions').isVisible(),false);assert.ok(await p.evaluate(()=>!hvacDetailsDebug.ducted.state.filter&&!hvacDetailsDebug.ducted.state.cutaway));
 await p.locator('[data-mode="look"]').click();assert.ok(await p.evaluate(()=>hvacDetailsDebug.ducted.shell.visible));
 assert.deepEqual(errors,[]);fs.writeFileSync(__dirname+'/hvac-details-verification.json',JSON.stringify({...report,controls,errors},null,2));console.log('HVAC geometry and PC/mobile controls passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
