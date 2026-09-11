import * as T from './vendor/three.module.js';
import {ceilingFixtures,livingRevision} from './design-spec.js?v=fridge-layout-2';

// All values below are design/selection targets, not measured lux or installed products.
export const lightingPresets={day:'日间',evening:'晚间',movie:'观影',study:'阅读办公',night:'起夜',off:'全部关灯'};
const levels={day:{},evening:{basic:.8,task:.65,reading:.2,accent:.3},movie:{accent:.18,night:.35},study:{basic:.75,task:1,reading:1,accent:.1},night:{night:1},off:{}};
const names={living:'客餐厅',entry:'玄关',balcony:'阳台',kitchen:'厨房',bed1:'老人房',master:'主卧',bed3:'儿童房',bath1:'公卫',bath2:'主卫'};
const visible=(o,ignore=null)=>{for(let q=o;q;q=q.parent)if(q!==ignore&&!q.visible)return false;return true;};
const mats=o=>Array.isArray(o.material)?o.material:[o.material];
const bounds=o=>new T.Box3().setFromObject(o);
const point=(b)=>b.getCenter(new T.Vector3());
const temperature=k=>new T.Color(k===4000?'#fff2df':k===3500?'#ffeace':k===2700?'#ffdbac':'#ffe3bf');

function alignPendant(model){
 if(model.getObjectByName('island-task-pendant'))return;
 // The old GLB has anonymous siblings; the prior parent-equality search missed them.
 const candidates=[];model.updateMatrixWorld(true);
 model.traverse(o=>{if(!o.isMesh||!visible(o))return;const b=bounds(o),c=point(b),s=b.getSize(new T.Vector3());if(b.min.y>=2.18&&b.max.y<2.82&&Math.abs(c.x-7.305)<.055&&c.z>=3.049&&c.z<=4.151&&s.x<.1)candidates.push(o);});
 if(candidates.length!==4)throw Error('岛台旧吊灯预期4个部件，实际'+candidates.length+'，停止猜测迁移');
 const g=new T.Group();g.name='island-task-pendant';model.add(g);
 for(const o of candidates)g.attach(o);
 g.position.x=livingRevision.island.position[0]-7.305;g.position.z=livingRevision.island.position[2]-3.6;
 const canopy=new T.Mesh(new T.BoxGeometry(.085,.018,1.20),new T.MeshStandardMaterial({color:'#555851',metalness:.35,roughness:.5}));
 canopy.name='island-pendant-ceiling-canopy';canopy.position.set(7.305,2.79,3.6);g.add(canopy);
 g.userData={role:'linear-pendant',installationVerified:false,bottom:2.187,counterClearance:1.287,driver:'ceiling canopy; product dimensions pending'};
 model.updateMatrixWorld(true);
}

function addFootlights(model){
 for(const id of ['bed1','bed3','master']){
  const bed=model.getObjectByName(id==='master'?'master-bed':id+'-bed');if(!bed||!visible(bed))continue;
  // Clip to the bed base, not a new wall chase; follows each bed/candidate.
  const base=id==='master'?bed.children[0]:bed.getObjectByName(id+'-bed-storage-bottom');if(!base)continue;
  model.updateMatrixWorld(true);const b=bounds(base),c=point(b);
  // A cloned candidate can contain the baseline lamp. Re-anchor it after the
  // bed frame changes; existence alone does not prove the old mount still fits.
  const existing=bed.getObjectByName(id+'-foot-light'),g=existing||new T.Group();g.name=id+'-foot-light';
  if(!existing)bed.add(g);
  if(id==='master')g.position.copy(bed.worldToLocal(new T.Vector3(c.x,b.min.y-.010,b.max.z-.009)));
  else g.position.set(0,.16,bed.userData.frame[1]/2+.02);
  g.updateWorldMatrix(true,true);
  if(existing){
   if(id==='master'&&!g.userData.underBedChannel){
    const housing=g.getObjectByName('footlight-shield'),mouth=g.getObjectByName('master-footlight-diffuser');
    housing.geometry.dispose();housing.geometry=new T.BoxGeometry(.30,.012,.010);mouth.position.set(0,-.004,.006);
    g.userData={...g.userData,underBedChannel:true,mount:'underside slim LED channel, within existing bed footprint; driver and wiring pending'};
   }
   continue;
  }
  const m=new T.MeshStandardMaterial({color:'#aaa69c',roughness:.65}),led=new T.MeshStandardMaterial({color:'#fff4e6',emissive:'#ffd6a0',emissiveIntensity:0});
  const housing=new T.Mesh(new T.BoxGeometry(.30,id==='master'?.012:.025,id==='master'?.010:.018),m);housing.name='footlight-shield';g.add(housing);
  const mouth=new T.Mesh(new T.BoxGeometry(.27,.012,.003),led);mouth.name=id+'-footlight-diffuser';mouth.position.set(0,-.004,id==='master'?.006:.011);mouth.userData.lightingDirectionLocal=[0,-.7,1];g.add(mouth);
  g.userData={mount:id==='master'?'underside slim LED channel, within existing bed footprint; driver and wiring pending':'bed-base clip-on shielded strip',underBedChannel:id==='master',voltage:'24V design target',sensor:'manual scene in viewer; presence trigger not commissioned',installationVerified:false};
 }
}

function refineLaundryLight(model){
 const strip=model.getObjectByName('laundry-task-strip');if(!strip||strip.userData.frontTaskRevision)return;
 // Previous mouth was over the dryer top: it illuminated the machine lid, not controls.
 strip.position.z=.38;strip.userData.frontTaskRevision=true;strip.userData.lightingDirectionLocal=[0,-1,.22];
 const channel=new T.Mesh(new T.BoxGeometry(.63,.012,.075),new T.MeshStandardMaterial({color:'#aaa59a',roughness:.6,metalness:.25}));
 channel.name='laundry-task-aluminum-channel';channel.position.set(-.11,1.812,.354);channel.castShadow=true;channel.receiveShadow=true;strip.parent.add(channel);
}

function classify(mesh){
 let ancestors=[];for(let o=mesh;o;o=o.parent)ancestors.push(o.name);const path=ancestors.join('/'),b=bounds(mesh),c=point(b);
 const main=ceilingFixtures.find(s=>ancestors.includes(s.id));
 if(main)return {fixture:main.id,room:main.room,label:names[main.room]+'基础灯',kind:'basic',kelvin:main.kelvin,lumens:main.lumens,beam:120,shape:main.type==='disc'?'disc':'rect',watts:main.watts};
 if(ancestors.some(n=>n.startsWith('recessed-led-downlight')))return {fixture:mesh.parent.name,room:c.x<5.8&&c.z<5.4?'kitchen':c.x<5.8?'entry':'living',label:'防眩筒灯',kind:'basic',kelvin:c.x<5.8&&c.z<5.4?4000:3000,lumens:650,beam:70,shape:'spot',watts:'7–9 W 选型目标'};
 if(path.includes('island-task-pendant'))return {fixture:'island-task-pendant',room:'living',label:'岛台线性吊灯',kind:'task',kelvin:3000,lumens:1500,beam:100,shape:'rect',watts:'18–24 W 选型目标'};
 if(/bath[12]-heater-light/.test(mesh.name))return {fixture:mesh.name,room:mesh.name.slice(0,5),label:'浴霸照明模块',kind:'basic',kelvin:4000,lumens:1400,beam:120,shape:'rect',watts:'照明12–18 W；不含加热功率'};
 if(mesh.name==='elder-reading-diffuser')return {fixture:mesh.name,room:'bed1',label:'床头阅读灯',kind:'reading',kelvin:3000,lumens:160,beam:70,shape:'spot',watts:'2–3 W 选型目标',direction:[.35,-.35,0]};
 if(mesh.name==='study-lamp-diffuser')return {fixture:mesh.name,room:'bed3',label:'学习桌台灯',kind:'reading',kelvin:4000,lumens:500,beam:110,shape:'rect',watts:'6–10 W 选型目标'};
 if(mesh.name==='makeup-task-light'||mesh.name==='bath2-mirror-task-light')return {fixture:mesh.name,room:mesh.name.startsWith('makeup')?'master':'bath2',label:'镜侧柔光灯',kind:'task',kelvin:3500,lumens:260,beam:120,shape:'rect',watts:'单侧3–5 W 选型目标',direction:[1,0,0]};
 if(mesh.name==='dry-mirror-task-strip')return {fixture:mesh.name,room:'bath1',label:'外置干区镜柜底灯',kind:'task',kelvin:3500,lumens:380,beam:110,shape:'rect',watts:'5–7 W 选型目标',direction:[0,-1,-.3]};
 if(mesh.name.startsWith('tv-display-light-'))return {fixture:mesh.name,room:'living',label:'电视展示格遮光灯带',kind:'accent',kelvin:3000,lumens:55,beam:100,shape:'rect',watts:'每格约1 W选型目标；观影时关闭或低亮'};
 if(/footlight-diffuser$/.test(mesh.name))return {fixture:mesh.parent.name,room:mesh.name.split('-')[0],label:'床底遮光起夜灯',kind:'night',kelvin:2700,lumens:35,beam:100,shape:'rect',watts:'约1 W 选型目标'};
 if(path.includes('kitchen-hood'))return {fixture:'kitchen-hood',room:'kitchen',label:'烟机灶面灯',kind:'task',kelvin:4000,lumens:180,beam:90,shape:'disc',watts:'随烟机选型'};
 const map={
  'entry-niche-warm-light':['entry','换鞋壁龛柔光','accent',160,3000],
  'entry-display-light':['living','开放层板柔光','accent',140,3000],
  'sideboard-recessed-task-light':['living','餐边柜操作灯','task',1100,3500],
  'tv-console-soft-light':['living','电视柜下柔光','accent',300,2700],
  'bar-concealed-light':['balcony','左翼桌下灯','accent',160,2700],
  'bar-concealed-light_1':['balcony','右翼桌下灯','accent',160,2700],
  'laundry-task-strip':['balcony','洗烘操作灯','task',320,3500],
  'balcony-care-task-light':['balcony','清洁盆柜台面灯','task',550,3500]
 };
 if(map[mesh.name]){const [room,label,kind,lumens,kelvin]=map[mesh.name];return {fixture:mesh.name,room,label,kind,lumens,kelvin,beam:110,shape:'rect',watts:'按长度及所选灯带核定'};}
 if(path.includes('flush-entry-cabinet'))return {fixture:'flush-entry-cabinet',room:'entry',label:c.y<.3?'鞋柜下起夜灯':'随手台灯带',kind:c.y<.3?'night':'task',kelvin:3000,lumens:c.y<.3?60:300,beam:110,shape:'rect',watts:'24V灯带，驱动须可检修'};
 return null;
}

export function createLightingDesign(model,scene){
 alignPendant(model);refineLaundryLight(model);let entries=[],preset='day',revision=0,overrides=new Map(),lastAssignment='';
 const roof=model.getObjectByName('客厅双眼皮外层')?.parent;
 let shadowGeometry=[],shadowMatrices=new WeakMap();
 const pool=Array.from({length:8},(_,i)=>{
  const light=new T.SpotLight('#fff2df',0,8,Math.PI/3,.55,2);light.name='preview-fixture-light-'+i;
  light.castShadow=true;light.shadow.autoUpdate=false;light.shadow.mapSize.set(1024,1024);light.shadow.bias=-.00012;light.shadow.normalBias=.010;light.shadow.camera.near=.025;light.shadow.camera.far=9;
  scene.add(light,light.target);return light;
 });
 function intensity(s){return overrides.has(s.id)?overrides.get(s.id):(levels[preset][s.kind]||0);}
 function sync(){
  addFootlights(model);model.updateMatrixWorld(true);const next=[],counts={};
  model.traverse(o=>{
   if(!o.isMesh||!visible(o,roof)||!mats(o).some(m=>m?.emissive?.getHex()>0))return;
   const spec=classify(o);if(!spec)return;
   const count=counts[spec.fixture]=(counts[spec.fixture]||0)+1,id=spec.fixture+'-'+count;
   if(!o.userData.lightingMaterialIsolated){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();o.userData.lightingMaterialIsolated=true;}
   const b=bounds(o),p=point(b),size=b.getSize(new T.Vector3()),direction=o.userData.lightingDirectionLocal?new T.Vector3(...o.userData.lightingDirectionLocal).transformDirection(o.matrixWorld):new T.Vector3(...(spec.direction||[0,-1,0])).normalize();
   // Start outside the emitting face, not inside an opaque shade or backing panel.
   const extent=Math.abs(direction.x)*size.x/2+Math.abs(direction.y)*size.y/2+Math.abs(direction.z)*size.z/2;
   p.addScaledVector(direction,extent+.006);const target=p.clone().add(direction);
   const s={...spec,id,source:o,position:p,target,size};next.push(s);
   Object.assign(o.userData,{lightingRole:'emitter',lightingId:id,lightingRoom:spec.room,lightingLabel:spec.label,lightingKind:spec.kind,lightingKelvin:spec.kelvin,lightingLumens:spec.lumens,lightingBeamDeg:spec.beam,lightingShape:spec.shape,lightingPosition:p.toArray(),lightingTarget:target.toArray(),lightingSize:size.toArray(),lightingCRI:'Ra>=90 selection target; unmeasured',lightingWatts:spec.watts,lightingInstalled:false});
  });entries=next;revision++;apply();
 }
 function apply(){for(const s of entries)for(const m of mats(s.source)){m.emissive.copy(temperature(s.kelvin));m.emissiveIntensity=intensity(s)*.85;}lastAssignment='';}
 function setPreset(value){if(!levels[value])throw Error('Unknown lighting preset');preset=value;overrides.clear();apply();}
 function setFixture(id,on){const s=entries.find(s=>s.id===id);if(!s)throw Error('Unknown fixture');overrides.set(id,on?1:0);apply();}
 function update(camera){
  const p=camera.position,rank=entries.filter(s=>intensity(s)>0&&visible(s.source)).map(s=>({s,score:s.position.distanceToSquared(p)+(s.kind==='task'?-.2:0)})).sort((a,b)=>a.score-b.score).slice(0,pool.length).sort((a,b)=>a.s.id.localeCompare(b.s.id));
  // Walking changes the camera, not static shadow geometry. Moving doors/drawers do.
  let geometryChanged=false;
  if(rank.length){model.updateMatrixWorld(true);const current=[];model.traverseVisible(o=>{if(!o.isMesh||!o.castShadow)return;current.push(o);const old=shadowMatrices.get(o),matrix=o.matrixWorld.elements;if(!old||matrix.some((v,i)=>v!==old[i])){shadowMatrices.set(o,[...matrix]);geometryChanged=true;}});if(current.length!==shadowGeometry.length||current.some((o,i)=>o!==shadowGeometry[i]))geometryChanged=true;shadowGeometry=current;}
  const assignment=rank.map(({s})=>s.id+':'+intensity(s)).join('|');
  for(let i=0;i<pool.length;i++){
   const light=pool[i],s=rank[i]?.s;light.userData.fixture=s?.id||null;light.intensity=0;
   if(!s)continue;
   light.position.copy(s.position);light.target.position.copy(s.target);light.color.copy(temperature(s.kelvin));light.angle=T.MathUtils.degToRad(s.beam/2);
   // Artistic exposure normalization, not a lux/photometric simulator.
   light.intensity=s.lumens/(2*Math.PI*(1-Math.cos(light.angle)))*.045*intensity(s);light.distance=s.kind==='night'?1.8:s.kind==='reading'?3:8;
   light.target.updateMatrixWorld();if(assignment!==lastAssignment||geometryChanged)light.shadow.needsUpdate=true;
  }lastAssignment=assignment;
 }
 function report(){return entries.map(s=>({id:s.id,object:s.source.name,fixture:s.fixture,room:s.room,label:s.label,kind:s.kind,kelvin:s.kelvin,lumens:s.lumens,beam:s.beam,shape:s.shape,watts:s.watts,position:s.position.toArray(),target:s.target.toArray(),size:s.size.toArray(),level:intensity(s),visible:visible(s.source),installed:false}));}
 sync();return {sync,setPreset,setFixture,update,report,pool,get preset(){return preset;},get revision(){return revision;},get sources(){return entries;},roomNames:names,limits:'8 nearest shadowed sources in real time; full-source offline lighting. Artistic normalization, not measured lux, actual smart-home control or photoreal acceptance.'};
}
