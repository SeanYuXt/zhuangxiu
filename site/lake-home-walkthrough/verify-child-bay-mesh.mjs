// Real-mesh regression: a retained bay must not become empty legroom, and a stowed chair must not enter the desktop.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {options,chairRect,room} from './child-bay-options-data.js';
const src=fs.readFileSync(new URL('./child-bay-options.js',import.meta.url),'utf8');
const a=src.slice(src.indexOf('function box('),src.indexOf('\nlet d='));
const b=src.slice(src.indexOf('const faceGroup='),src.indexOf('function build('));
const build=new Function('T','RoundedBoxGeometry','d','furniture','room','wood','ivory','cloth','green','dark','softBacking','ceramic','accent','shelfGlow','let chairGroup,drawerGroup,slidingPanel=null,slidingPanels=[],slideTravel=0,bedDrawerGroups=[],deskDrawerGroup=null;'+a+b+';applyJoineryPalette();d.wardrobes.forEach(wardrobe);bed();desk();storageDetails();chair();bay();return {chairGroup,slidingPanels};');
const overlap=(a,b)=>Math.min(Math.min(a.max.x,b.max.x)-Math.max(a.min.x,b.min.x),Math.min(a.max.y,b.max.y)-Math.max(a.min.y,b.min.y),Math.min(a.max.z,b.max.z)-Math.max(a.min.z,b.min.z));
for(const id of ['footdesk','fixedwindow','studyfirst','southbedwall','lwallstudy']){
 const d=options.find(o=>o.id===id),furniture=new T.Group(),materials=Array.from({length:9},()=>new T.MeshStandardMaterial());
 const state=build(T,RoundedBoxGeometry,d,furniture,room,...materials);furniture.updateMatrixWorld(true);
 const named=n=>{const r=[];furniture.traverse(o=>{if(o.name===n)r.push(o);});return r;};
 assert.equal(state.slidingPanels.length,id==='studyfirst'?0:1);
 if(id==='footdesk'){
  assert.equal(d.bed.head,'south');assert.equal(named('unresolved-window-seat').length,0);
  assert.equal(named('retained-raised-bay').length,1);assert.equal(named('low-bay-end-shelf').length,1);
  assert.equal(named('south-headboard-backing').length,1);assert.equal(named('office-seat').length,1);
  assert.equal(named('arm-pad').length,0,'compact armless chair is not the former bulky chair');
  const mattress=new T.Box3().setFromObject(named('mattress')[0]).getSize(new T.Vector3());
  assert.ok(Math.abs(mattress.x-1.5)<1e-5&&Math.abs(mattress.z-2)<1e-5,'mattress not reduced');
  assert.ok(Math.abs(d.bed.r[1]-room.main[1]-.65)<1e-5,'north foot strip65cm');
  assert.ok(Math.abs(d.bed.r[0]-d.wardrobes[0].r[2]-.63)<1e-5,'wardrobe side63cm');
  const monitor=new T.Box3().setFromObject(named('computer-monitor')[0]).getCenter(new T.Vector3());
  assert.ok(Math.abs(monitor.z-4.81)<1e-5,'monitor honestly placed at edge workstation, not moved to window centre');
  const chairBox=new T.Box3().setFromObject(state.chairGroup),size=chairBox.getSize(new T.Vector3());
  assert.ok(size.x<=.55&&size.z<=.55,'modeled chair remains inside proposed55cm envelope');
  const shell=new T.Box3().setFromObject(named('retained-raised-bay')[0]);
  assert.ok(shell.max.y>.54,'bay is not invented legroom');
  for(const s of [0,1]){
   const cr=chairRect(d,s);state.chairGroup.position.set(cr[0]-d.chair[0],0,cr[1]-d.chair[1]);furniture.updateMatrixWorld(true);
   state.chairGroup.traverse(c=>{if(!c.isMesh)return;furniture.traverse(o=>{
    if(!o.isMesh)return;let p=o;while(p){if(p===state.chairGroup)return;p=p.parent;}
    assert.ok(overlap(new T.Box3().setFromObject(c),new T.Box3().setFromObject(o))<.001,`footdesk chair ${s}/${c.name} collision ${o.name}`);
   });});
  }
 }
 if(id==='studyfirst'){
  assert.equal(named('wardrobe').length,0);assert.equal(named('bed').length,0);assert.equal(named('retained-raised-bay').length,1);
  for(const n of ['upper-side','conditional-floor-in-original-bay','rear-apron'])assert.equal(named(n).length,0,n);
  assert.equal(named('study-low-storage').length,1);assert.equal(named('office-back').length,1);assert.equal(named('monitor-body').length,1);
  const table=new T.Box3().setFromObject(named('tabletop')[0]),sill=new T.Box3().setFromObject(named('sill-finish')[0]);
  const sz=table.getSize(new T.Vector3());assert.ok(Math.abs(sz.x-.70)<1e-5&&Math.abs(sz.z-2.67)<1e-5);
  assert.ok(table.min.y>sill.max.y);assert.ok(Math.abs(room.bay[0]-table.max.x-.02)<1e-5);
  for(const o of named('desk')[0].children)if(o.isMesh)assert.ok(overlap(new T.Box3().setFromObject(o),sill)<.001,`desk/sill ${o.name}`);
 }
 if(id==='fixedwindow'){
  assert.equal(d.theme,'monochrome');
  assert.equal(materials[0].map,null,'wood color map disabled');assert.equal(materials[0].normalMap,null,'wood grain normal disabled');
  assert.equal(materials[0].color.getHexString(),'f2f2ef');assert.equal(materials[4].color.getHexString(),'232527');
  for(const n of ['mono-bed-base-reveal','mono-headboard-inlay','mono-continuous-table-edge'])assert.equal(named(n).length,1,n);
  assert.equal(named('bed')[0].visible,true);assert.equal(named('wardrobe')[0].visible,true);
  for(const n of ['wardrobe','bed','continuous-L-headboard-backing','integrated-head-storage','tabletop'])assert.equal(named(n).length,1,n);
  for(const n of ['window-desk-support','side-picture-ledge','adjustable-window-bookcase'])assert.equal(named(n).length,0,`removed independent block: ${n}`);
  assert.equal(d.bed.head,'north');
  assert.equal(named('shallow-storage-door').length,2);
  const tableSize=new T.Box3().setFromObject(named('tabletop')[0]).getSize(new T.Vector3());
  assert.ok(Math.abs(tableSize.x-1.26)<1e-5&&Math.abs(tableSize.z-2.67)<1e-5,'one connected desktop, 65 cm front plus bay extension; overall 126 cm at bay');
  assert.equal(named('retained-raised-bay').length,1);
  assert.equal(named('bay-supported-riser').length,1);
  assert.equal(named('low-bay-end-shelf').length,2);
  assert.equal(named('unresolved-window-seat').length,1);
  const riser=new T.Box3().setFromObject(named('bay-supported-riser')[0]),sillTop=new T.Box3().setFromObject(named('sill-finish')[0]).max.y;
  assert.ok(Math.abs(riser.min.y-sillTop)<1e-5&&Math.abs(riser.max.y-.725)<1e-5,'support sits on retained sill and meets tabletop underside');
  const monitor=new T.Box3().setFromObject(named('computer-monitor')[0]).getCenter(new T.Vector3());
  assert.ok(Math.abs(monitor.z-(room.bay[1]+room.bay[3])/2)<1e-5,'computer aligned with actual window, not side pier');
  assert.ok(Math.abs(room.main[3]-d.bed.r[3]-.63)<1e-5,'63 cm foot-end route');
  const mattress=new T.Box3().setFromObject(named('mattress')[0]).getSize(new T.Vector3());
  assert.ok(Math.abs(mattress.x-1.5)<1e-5&&Math.abs(mattress.z-2)<1e-5);
  const bc=new T.Box3().setFromObject(named('integrated-head-storage')[0]);
  assert.ok(bc.max.z<room.bay[1]&&bc.max.x<=17.52,'storage on solid head wall, not glass');
  const bedBounds=new T.Box3().setFromObject(named('bed')[0]);
  assert.ok(bc.min.y>bedBounds.max.y,'upper storage clears modeled bed, not a sitting-head clearance certification');
  const skin=named('continuous-L-headboard-backing')[0],verts=skin.geometry.attributes.position;
  for(let i=0;i<verts.count;i++){
   const v=new T.Vector3().fromBufferAttribute(verts,i).applyMatrix4(skin.matrixWorld);
   assert.ok(v.z<=d.headFeature.r[3]+.001||v.x>=d.headFeature.r[2]-.019,'L backing stays outside bed, within wall returns');
  }
  const sill=new T.Box3().setFromObject(named('sill-finish')[0]);
  for(const n of ['desk','integrated-head-storage','bay-top-detail'])named(n)[0].traverse(o=>{
   if(!o.isMesh)return;const bb=new T.Box3().setFromObject(o);
   const vs=o.geometry.attributes.position;
   for(let i=0;i<vs.count;i++){const v=new T.Vector3().fromBufferAttribute(vs,i).applyMatrix4(o.matrixWorld);const inside=r=>v.x>=r[0]-.001&&v.x<=r[2]+.001&&v.z>=r[1]-.001&&v.z<=r[3]+.001;assert.ok(inside(room.main)||inside(room.bay),`${n}/${o.name} inside actual room/bay union`);}
   assert.ok(overlap(bb,sill)<.001,`${n}/${o.name} clears retained sill`);
  });
 }
 if(id==='studyfirst'||id==='fixedwindow'){
  for(const s of [-1,0,1]){
   const cr=chairRect(d,s);state.chairGroup.position.set(cr[0]-d.chair[0],0,cr[1]-d.chair[1]);furniture.updateMatrixWorld(true);
   state.chairGroup.traverse(c=>{if(!c.isMesh)return;furniture.traverse(o=>{
    if(!o.isMesh)return;let p=o;while(p){if(p===state.chairGroup)return;p=p.parent;}
    assert.ok(overlap(new T.Box3().setFromObject(c),new T.Box3().setFromObject(o))<.001,`chair ${s}/${c.name} collision ${o.name}`);
   });});
  }
 }
 for(const q of state.slidingPanels){q.panel.position.x=q.closedX+q.travel;assert.ok(q.travel>0);q.panel.position.x=q.closedX;}
 console.log(JSON.stringify({id,meshBuild:'PASS',slidingPanels:state.slidingPanels.length}));
}
const audit=JSON.parse(fs.readFileSync(new URL('./child-bay-options-audit.json',import.meta.url),'utf8'));
assert.ok(audit.filter(a=>a.id!=='fixedwindow').every(a=>a.failures.length===0));const trial=audit.find(a=>a.id==='studyfirst');
const fixed=audit.find(a=>a.id==='fixedwindow');
assert.deepEqual(fixed.failures,['fixedwindow primary target unreachable doorOpen','fixedwindow primary target unreachable doorOpenChairPulled','fixedwindow primary target unreachable stowedDoorOpen','window-facing intended chair overlaps bed'],'retain unresolved physical layout failures');
assert.equal(fixed.windowSeatAudit.bedCollision,true,'window-facing seat must not be falsely certified usable');
for(const key of ['doorClosed','chairPulledAfterClosing','stowedDoorClosed'])assert.equal(fixed.routes[key].chairApproach,true,'desk approach after closing door');
for(const r of Object.values(trial.routes)){assert.equal(r.windowSide,true);assert.equal(r.chairApproach,true);assert.ok(r.wardrobes.every(Boolean));}
assert.equal(options.some(o=>o.id==='baywardrobe'),false);
assert.equal(options.some(o=>o.id==='studyfold'||o.wallBed),false,'cancelled folding bed unavailable');
console.log('Detail mesh regression PASS. Whole-room layout FAILS: intended window-facing chair overlaps bed; no usable-seating claim.');
