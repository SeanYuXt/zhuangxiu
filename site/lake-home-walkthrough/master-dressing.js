import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {rooms,P} from './plan.js';
import {refineMasterBedding} from './textile-details.js?v=matte-fabric-2';
import {addGroundedPlinth,groundVerticalLeg} from './furniture-floor-supports.js';
import {finishWoodPanel} from './cabinet-finishes.js';

const rect=(x0,z0,x1,z1)=>({x0,z0,x1,z1});
// Correct the existing plant in the loaded asset, not a second decorative copy.
export function clearMasterFootPassage(model){
 if(model.getObjectByName('master-window-plant'))return;
 model.updateMatrixWorld(true);
 const matches=[];
 model.traverseVisible(o=>{
  if(!o.isMesh)return;
  const b=new T.Box3().setFromObject(o),s=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3());
  if(Math.abs(c.x-15.09)<.001&&Math.abs(c.z-3.32)<.001&&Math.abs(s.x-.26)<.001&&Math.abs(s.y-.35)<.001&&Math.abs(s.z-.26)<.001)matches.push(o);
 });
 if(matches.length!==1)throw Error('Master plant source changed; re-audit the actual footprint');
 const pot=matches[0],plant=pot.parent;
 if(plant.children.length!==29||plant.children.some(o=>!o.isMesh))throw Error('Master plant assembly changed; do not move an unverified parent');
 const prior=new T.Box3().setFromObject(plant),target=new T.Vector3(17.70,.006,1.10),delta=target.clone().sub(new T.Vector3(15.09,prior.min.y,3.32));
 const world=plant.getWorldPosition(new T.Vector3());plant.position.copy(plant.parent.worldToLocal(world.add(delta)));
 plant.name='master-window-plant';plant.userData={...plant.userData,detailRole:'relocated-floor-plant',priorBounds:{min:prior.min.toArray(),max:prior.max.toArray()},revision:'clear-master-foot-passage',note:'Existing full-size plant moved beside window, outside bay recess; curtain and circulation checks required'};
 model.updateMatrixWorld(true);
}
export function dressingOccupant(spec,use){
 if(use==='stored')return null;
 const d=spec.desk,offset=use==='drawer'&&spec.storageAccess!=='top'?.32:0;
 return spec.deskFront==='x'?rect(d.x1+offset,(d.z0+d.z1)/2-.30,d.x1+.65+offset,(d.z0+d.z1)/2+.30):rect((d.x0+d.x1)/2-.30,d.z0-.65-offset,(d.x0+d.x1)/2+.30,d.z0-offset);
}
export function masterDressingSpec(key,baseline){
 const e=baseline.entry,b=baseline.foot,room=rooms.find(r=>r.id==='master').poly.map(P);
 const left=room[0][0],entry=rect(left,e.min.z,left+.60,e.max.z);
 if(key==='balanced')return {...masterDressingSpec('storage',baseline),key,label:'薄床架＋翻盖梳妆',storageAccess:'top',refinedBed:true,bedShiftX:-.10,description:'保留约 4.5 m 高柜，入口 900×450 mm 梳妆位改为上翻浅收纳。床垫候选 1800×2000 mm，床架 1900×2050 mm，含薄床头总长 2130 mm；床组向左试移 100 mm。须匹配实际产品，不是原床实测改造。'};
 if(key==='storage')return {key,label:'A · 保留高柜收纳',entry:rect(left,e.min.z+.90,left+.60,e.max.z),foot:rect(b.min.x,b.min.z,b.max.x,b.max.z),desk:rect(left,e.min.z,left+.45,e.min.z+.90),deskFront:'x',entryHeight:2.60,footHeight:2.60,highStorageLength:(e.max.z-e.min.z-.90)+(b.max.x-b.min.x),lowStorageLength:0,description:'入口 900×450 mm 梳妆位＋约 1400 mm 高柜；床尾高柜保留。床尾原约 600 mm 狭窄关系未消失。'};
 if(key==='open')return {key,label:'B · 床尾浅矮柜',entry,foot:rect(b.min.x,b.max.z-.28,b.max.x-.80,b.max.z),desk:rect(b.max.x-.80,b.max.z-.45,b.max.x,b.max.z),deskFront:'-z',entryHeight:2.60,footHeight:.85,bedShiftX:-.10,highStorageLength:e.max.z-e.min.z,lowStorageLength:b.max.x-b.min.x-.80,description:'完整约 2300 mm 入口高柜；床尾约 2300×280 mm 浅矮柜＋右端 800×450 mm 梳妆位。床和床头柜整体向左试移 100 mm。浅柜不计挂衣，衣物容量明显减少。'};
 throw Error('Unknown master dressing option');
}

export function makeMasterDressing(spec,sourceBed=null){
 const root=new T.Group();root.name='master-dressing-candidate';root.userData={approved:false,key:spec.key};
 if(spec.refinedBed){
  if(!sourceBed)throw Error('Refined bed requires baseline object');
  const bed=sourceBed.clone(true);bed.name='master-bed';bed.visible=true;
  bed.traverse(o=>{if(o.isMesh){o.geometry=o.geometry.clone();o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();}});
  root.add(bed);bed.updateWorldMatrix(true,true);
  const parts=bed.children.slice(0,3),sizes=parts.map(o=>new T.Box3().setFromObject(o));
  if(Math.abs(sizes[0].max.z-sizes[0].min.z-2.12)>.001||Math.abs(sizes[1].max.z-sizes[1].min.z-2.02)>.001||Math.abs(sizes[2].max.z-sizes[2].min.z-.12)>.001)throw Error('Baseline bed components changed; re-audit before resizing');
  const headBack=sizes[2].min.z;
  for(const [index,depth,center] of [[0,2.05,headBack+.08+2.05/2],[1,2.00,headBack+.10+1.00],[2,.08,headBack+.04]]){
   parts[index].scale.z*=depth/(sizes[index].max.z-sizes[index].min.z);parts[index].position.z=center-bed.position.z;
  }
  bed.userData={...bed.userData,designCandidate:true,mattress:[1.8,2],bedFrame:[1.9,2.05],headboardDepth:.08,totalDepth:2.13,productVerified:false};
  bed.updateMatrixWorld(true);
  addGroundedPlinth(bed,parts[0],{name:'master-bed-floor-support'});
  const nightstands=bed.children.filter(o=>{if(!o.isMesh)return false;const b=new T.Box3().setFromObject(o),s=b.getSize(new T.Vector3());return Math.abs(b.min.y-.05)<.001&&Math.abs(s.x-.43)<.001&&Math.abs(s.z-.43)<.001;});
  if(nightstands.length!==2)throw Error('Recheck master bedside supports: unexpected baseline geometry');
  nightstands.forEach((o,i)=>addGroundedPlinth(bed,o,{name:'master-bedside-floor-support-'+i,inset:.012}));
  finishWoodPanel(parts[0]);nightstands.forEach(o=>finishWoodPanel(o));
  refineMasterBedding(bed);
 }
 const materials={wood:new T.MeshStandardMaterial({color:'#b4a48b',roughness:.70}),front:new T.MeshStandardMaterial({color:'#ccc5b8',roughness:.68}),top:new T.MeshStandardMaterial({color:'#e5e0d5',roughness:.62}),metal:new T.MeshStandardMaterial({color:'#65675e',roughness:.4,metalness:.4}),fabric:new T.MeshStandardMaterial({color:'#bfb8a7',roughness:.95}),mirror:new T.MeshStandardMaterial({color:'#b7c4bf',metalness:.85,roughness:.12}),led:new T.MeshStandardMaterial({color:'#fff7e7',emissive:'#fff1d8',emissiveIntensity:.8})};
 const box=(parent,name,x,y,z,w,h,d,mat,round=.003)=>{const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(round,w/5,h/5,d/5)),mat);o.position.set(x,y+h/2,z);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);if(mat===materials.wood)finishWoodPanel(o,{interior:/divider|shelf|drawer/.test(name)});return o;};
 const placed=(name,r,front)=>{const g=new T.Group();g.name=name;if(front==='x'){g.position.set(r.x0,0,(r.z0+r.z1)/2);g.rotation.y=Math.PI/2;}else{g.position.set((r.x0+r.x1)/2,0,r.z1);g.rotation.y=Math.PI;}root.add(g);return {g,w:front==='x'?r.z1-r.z0:r.x1-r.x0,d:front==='x'?r.x1-r.x0:r.z1-r.z0};};
 const fronts=[];
 function cabinet(name,r,front,height){
  const {g,w,d}=placed(name,r,front),m=materials;
  for(const x of [-w/2+.009,w/2-.009])box(g,name+'-side',x,.08,d/2,.018,height-.08,d,m.wood);
  box(g,name+'-back',0,.08,.009,w-.036,height-.08,.018,m.wood);
  for(const y of [.08,height-.018])box(g,name+'-shelf',0,y,d/2,w-.036,.018,d,m.wood);
  const sections=Math.ceil(w/1.6),n=sections*2,bay=w/n;
  for(let i=1;i<n;i++)box(g,name+'-divider',-w/2+i*bay,.10,d/2,.018,height-.12,d-.04,m.wood);
  for(let i=0;i<n;i++){
   const x=-w/2+(i+.5)*bay;
   for(const y of height>1?[.40,2.05]:[.42])box(g,name+'-shelf',x,y,d/2,bay-.04,.018,d-.045,m.wood);
   if(height>1){const rod=new T.Mesh(new T.CylinderGeometry(.012,.012,bay-.055,20),m.metal);rod.rotation.z=Math.PI/2;rod.position.set(x,1.85,d*.50);g.add(rod);}
  }
  // Sliding front is a candidate mechanism with explicit in-envelope overlap.
  // Product tracks, effective opening and anti-jump details remain unselected.
  for(let i=0;i<sections;i++){
   const section=w/sections,center=-w/2+(i+.5)*section,half=section/2,doorWidth=half+.002,suffix=i?'-'+i:'';
   const moving=box(g,name+'-sliding-front'+suffix,center-section/4+.019,.11,d-.029,doorWidth,height-.14,.018,m.front);
   box(g,name+'-fixed-front'+suffix,center+section/4-.019,.11,d-.009,doorWidth,height-.14,.018,m.front);
   fronts.push({object:moving,closedX:center-section/4+.019,travel:half-.038});
  }
  for(const y of [.09,height-.03])box(g,name+'-track',0,y,d-.028,w-.035,.01,.05,m.metal);
  addGroundedPlinth(g,g.children.find(o=>o.name===name+'-shelf'),{name:name+'-floor-support'});
  return g;
 }
 cabinet('master-entry-wardrobe',spec.entry,'x',spec.entryHeight);
 cabinet('master-wardrobe',spec.foot,'-z',spec.footHeight);
 const {g:desk,w,d}=placed('master-makeup-desk',spec.desk,spec.deskFront),m=materials;
 let lid=null;
 if(spec.storageAccess==='top'){
  const x0=-.315,x1=.165,z0=.07,z1=.35;
  box(desk,'makeup-top-left',(-w/2+x0)/2,.735,d/2,x0+w/2,.035,d,m.top,.005);
  box(desk,'makeup-top-right',(x1+w/2)/2,.735,d/2,w/2-x1,.035,d,m.top,.005);
  box(desk,'makeup-top-back',(x0+x1)/2,.735,z0/2,x1-x0,.035,z0,m.top,.005);
  box(desk,'makeup-top-front',(x0+x1)/2,.735,(z1+d)/2,x1-x0,.035,d-z1,m.top,.005);
  const bin=new T.Group();bin.name='makeup-top-storage';desk.add(bin);
  box(bin,'makeup-bin-bottom',(x0+x1)/2,.625,(z0+z1)/2,x1-x0,.015,z1-z0,m.wood);
  for(const x of [x0+.006,x1-.006])box(bin,'makeup-bin-side',x,.64,(z0+z1)/2,.012,.095,z1-z0,m.wood);
  for(const z of [z0+.006,z1-.006])box(bin,'makeup-bin-side',(x0+x1)/2,.64,z,x1-x0,.095,.012,m.wood);
  for(const x of [-.19,-.06,.07]){box(bin,'makeup-bin-divider',x,.64,.21,.008,.09,.256,m.wood);box(bin,'makeup-stored-compact',x-.036,.641,.22,.048,.055,.065,m.front,.008);}
  lid=new T.Group();lid.name='makeup-lid';lid.position.set(0,.77,z0);desk.add(lid);
  // Front opening clearance prevents the 35 mm lid thickness sweeping into the fixed rim.
  box(lid,'makeup-lid-panel',(x0+x1)/2,-.035,(z1-z0-.004)/2,x1-x0-.004,.035,z1-z0-.004,m.top,.004);
  lid.userData={axis:'local-x',closed:0,open:-Math.PI/2,hardwareVerified:false,warning:'90-degree pose only; damping, anti-pinch, load and stays require selected hardware'};
 }else box(desk,'makeup-top',0,.735,d/2,w,.035,d,m.top,.007);
 for(const [i,x] of [-w/2+.009,w/2-.009].entries()){const panel=box(desk,'makeup-side-support',x,.03,d/2,.018,.705,d-.025,m.wood);groundVerticalLeg(panel,{name:'makeup-desk-floor-glide-'+i});finishWoodPanel(panel,{refresh:true});}
 let drawer=null;
 if(!lid){drawer=new T.Group();drawer.name='makeup-drawer';desk.add(drawer);
 box(drawer,'makeup-drawer-face',0,.647,d-.014,w-.055,.080,.02,m.front);
 box(drawer,'makeup-drawer-bottom',0,.644,d-.18,w-.08,.012,.32,m.wood);
 for(const x of [-(w-.08)/2,(w-.08)/2])box(drawer,'makeup-drawer-side',x,.656,d-.18,.012,.065,.32,m.wood);
 box(drawer,'makeup-drawer-back',0,.656,d-.335,w-.08,.065,.012,m.wood);}
 box(desk,'makeup-mirror',0,1.01,.026,Math.min(.65,w-.08),.84,.018,m.mirror,.02);
 for(const x of [-.34,.34])box(desk,'makeup-task-light',x,1.025,.04,.017,.81,.02,m.led);
 const trayX=lid ? .30 : w*.28;
 box(desk,'makeup-tray',trayX,.771,d*.45,.17,.018,.16,m.wood,.025);
 for(const [i,h] of [.09,.125,.07].entries())box(desk,'makeup-bottle',trayX+(i-1)*.043,.789,d*.45,.032,h,.033,i===1?m.metal:m.top,.006);
 const stool=new T.Group();stool.name='master-makeup-stool';desk.add(stool);
 const storedZ=d-.22;stool.position.z=storedZ;
 box(stool,'makeup-stool-seat',0,.43,0,.44,.065,.44,m.fabric,.035);
 let footIndex=0;for(const x of [-.16,.16])for(const z of [-.16,.16]){const leg=box(stool,'makeup-stool-leg',x,.02,z,.032,.41,.032,m.wood);groundVerticalLeg(leg,{name:'makeup-stool-floor-glide-'+footIndex++});finishWoodPanel(leg,{refresh:true});}
 let pulled=false,drawOpen=false,doorsOpen=false;
 const setUse=state=>{pulled=state==='seated'||state==='drawer';drawOpen=state==='drawer';stool.position.z=storedZ+(pulled?.45:0);if(lid)lid.rotation.x=drawOpen?-Math.PI/2:0;else drawer.position.z=drawOpen?.32:0;root.updateMatrixWorld(true);};
 const setDoors=open=>{doorsOpen=open;fronts.forEach(f=>f.object.position.x=f.closedX+(open?f.travel:0));root.updateMatrixWorld(true);};
 setUse('stored');
 return {root,spec,setUse,setDoors,get state(){return {pulled,drawOpen,doorsOpen};}};
}
