import {integrateAcceptedChild} from './accepted-child-integration.js?v=accepted-94';
import {addFamilyDisplay,familyDisplaySpec,familyDisplayAssetsReady,setFamilyServiceOpen} from './family-display.js?v=sideboard-depth-40-10';
import {integrateAcceptedSuite} from './accepted-suite-integration.js?v=accepted-93';
import * as T from './vendor/three.module.js';
import {designWalls as walls} from './balcony-side-infill.js';
import {GLTFLoader,RGBELoader,OrbitControls,EffectComposer,RenderPass,SSAOPass,OutputPass,SMAAPass} from './vendor/render-libs.js';
import {P,rooms,outline,notes,columnCorrection as correction} from './plan.js?v=balcony-right-utility-3';
import {roomFacilities,facilityRoom,pendingDesign} from './room-facilities.js?v=sideboard-depth-40-10';
import {setDoorLeafOpen} from './door-motion.js';
import {wireInventory} from './design-inventory.js';
import {palette,finishScheme,ceilingFixtures,barSeating,livingRevision,fridgeLayout} from './design-spec.js?v=fridge-layout-2';
import {makeDryZone} from './public-dry-zone.js';
import {wireMasterDressing} from './master-dressing-ui.js?v=accepted-93';
import {wireMobileControls} from './mobile-controls.js?v=quiet-preview';
import {wireMobileNavigation} from './mobile-navigation.js?v=sideboard-depth-40-10';
import {wireViewerFocus} from './viewer-focus-ui.js?v=quiet-preview-3';
import {applyLivingRevision} from './living-revision.js?v=balcony-right-utility-3';
import {wireLivingLayout} from './living-layout-ui.js?v=balcony-right-utility-3';
import {createWalkController} from './continuous-walk.js';
import {addSkirting} from './finish-details.js';
import {applyBedroomRevision} from './bedroom-revision.js?v=matte-fabric-2';
import {applyEntryRevision} from './entry-revision.js?v=sideboard-depth-40-10';
import {balconyLayout} from './balcony-layout-spec.js?v=balcony-right-utility-3';
import {reviseBalcony} from './balcony-layout.js?v=balcony-right-utility-3';
import {addBalconyDrying} from './balcony-drying.js?v=balcony-right-utility-3';
import {createInteriorMirrors} from './interior-mirrors.js';
import {createStaticSunShadow} from './static-sun-shadow.js';
import {reviseMasterBath} from './master-bath-details.js';
import {refineMasterBathFloor} from './master-bath-floor.js';
import {textilesReady} from './textile-details.js?v=matte-fabric-2';
import {reviseKitchen} from './kitchen-details.js';
import {refineLaundry} from './laundry-details.js?v=balcony-right-utility-3';
import {refineSideboard} from './sideboard-details.js?v=sideboard-depth-40-10';
import {reviseTVDisplay} from './tv-display-details.js?v=balcony-right-utility-3';
import {refineFridge} from './fridge-details.js?v=fridge-layout-3';
import {revisePublicBath} from './public-bath-details.js';
import {createLightingDesign} from './lighting-design.js?v=fridge-layout-2';
import {wireLightingControls} from './lighting-controls.js';
import {createDaylightDesign} from './daylight-design.js';
import {applyBakedWallStudy} from './baked-wall-study.js';
import {reviseHVAC} from './hvac-details.js?v=sideboard-depth-40-10';
import {wireHVACControls} from './hvac-controls.js';
import {installTileSurfaces} from './tile-surfaces.js';
import {wireTileControls} from './tile-controls.js';
import {refineTableware} from './tableware-details.js';
import {roomViewpoints,roomViewsFor,roomViewFov} from './room-viewpoints.js?v=sideboard-depth-40-10';
import {refineCurtains} from './curtain-details.js?v=balcony-wet-curtain-4';
import {wireCurtainControls} from './curtain-controls.js';
import {cabinetFinishesReady} from './cabinet-finishes.js';
import {entryCompositionSpec} from './entry-composition-spec.js?v=sideboard-depth-40-10';
import {createImmersiveLook} from './immersive-look.js';
import {refinePreviewSurfaces,wireImmersivePreview} from './immersive-preview.js';
let immersivePreview=null,previewSurfaces=null,captureFrame=false,lastCapture=null;
let curtainControls=null;
wireMobileControls();
let walker=null;
let interiorMirrors=null,staticSunShadow=null;
let mobileNavigation=null,viewerFocus=null;
let hvacControls=null;
let selectedFocusPoint=null;
let activeRoomView=null;
const canvas=document.querySelector('#view3d'),host=document.querySelector('#viewport'),busy=document.querySelector('#busy'),gesture=document.querySelector('#gesture');
let mode='look',ready=false,dirty=true,drag=null,interacting=false,yaw=0,pitch=0,roof=null,hiddenSeats=0,draws=0,environment=null;
let night=false,daySun=null,ambient=null,lightingDesign=null,daylightDesign=null,bakedWallStudy=null,surfaceLightmaps=null;
const daylightStudy=new URLSearchParams(location.search).get('daylight')==='study';
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.97;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e9e5dc');
const maskScene=new T.Scene();let roomMask=null;
const camera=new T.PerspectiveCamera(70,1,.03,150);camera.rotation.order='YXZ';
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.12;controls.rotateSpeed=.65;controls.zoomSpeed=.7;controls.enabled=false;controls.minDistance=3;controls.maxDistance=27;controls.maxPolarAngle=Math.PI*.48;controls.addEventListener('change',()=>dirty=true);controls.addEventListener('start',()=>{interacting=true;dirty=true;});controls.addEventListener('end',()=>{interacting=false;dirty=true;});
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const ao=new SSAOPass(scene,camera,1,1);ao.kernelRadius=.22;ao.minDistance=.004;ao.maxDistance=.10;composer.addPass(ao);composer.addPass(new OutputPass());composer.addPass(new SMAAPass(1,1));
const immersiveLook=createImmersiveLook({canvas,camera,enabled:()=>ready&&['look','walk'].includes(mode)&&!document.querySelector('dialog[open]'),changed:()=>dirty=true,activity:value=>{interacting=value;canvas.style.cursor=value?'grabbing':'grab';}});
const targets=Object.fromEntries(rooms.map(r=>{const [x,z]=P(r.point),[lx,lz]=P(r.look);return [r.id,{name:r.name.split(' · ')[0],position:[x,1.6,z],look:[lx,1.3,lz]}];}));
Object.assign(targets,{living:{name:'客厅',position:[8.15,1.6,5.72],look:[8.98,1.25,1.6]},bar:{name:'阳台长桌与吧椅',position:[10.4,1.6,3.45],look:[8.85,1.0,1.2]},lake:{name:'阳台回望',position:[8.35,1.6,.7],look:[9.4,1.25,4.9]},cabinet:{name:'餐边柜',position:[8.23,1.6,4.63],look:[9.43,1.25,6.9]},laundry:{name:'洗烘柜',position:[8.35,1.6,.7],look:[11.66,1.35,1.24+livingRevision.laundryOffsetZ]}});
targets.bed3.position=[14.35,1.6,6.17];targets.bed3.look=[15.90,1.0,5.76];
targets.living={name:'客厅',position:[8.1,1.6,6.0],look:[9.85,.9,3.8]};
targets.dining={name:'餐厅 · 备餐岛台',position:[6.35,1.6,4.95],look:[livingRevision.island.position[0],.65,livingRevision.island.position[2]]};
targets.fridge={name:'冰箱 · 厨房门旁',position:[8.8,1.6,2.9],look:[fridgeLayout.position[0],1.3,fridgeLayout.position[2]]};
targets.tvSeat={name:'沙发坐姿观影',position:livingRevision.viewing.eye,look:[11.84,1.44,3.66]};
targets.care={name:'阳台洗手台与清洁柜',position:[8.85,1.40,2.05],look:[6.2,1.12,.89]};
// These old overview positions became occupied after furniture revisions.
// Reuse established standing views; never clear furniture just to fit a camera.
for(const [stationId,viewId] of [['cabinet','dining-sideboard'],['care','balcony-care']]){
 const v=roomViewpoints.find(view=>view.id===viewId);
 targets[stationId]={...targets[stationId],position:[...v.position],look:[...v.look]};
}
targets.drying={name:'阳台晾衣 · 升降与遮景',position:[7.1,1.6,2.75],look:[8.2,1.85,.52]};
targets.bed1.position=[3.18,1.6,5.03];targets.bed1.look=[1.70,1.0,3.60];
targets.entry={name:'玄关 · 收纳与换鞋',position:entryCompositionSpec.standingCamera.position,look:entryCompositionSpec.standingCamera.look};
targets.passageArt=familyDisplaySpec.view;
targets.kitchen={name:'厨房',position:[5.33,1.6,5.02],look:[4.32,1.10,3.16]};
targets.bath1={name:'公卫',position:[1.54,1.6,5.88],look:[1.65,.82,6.65]};
// Compact-room photographs need a taller frame, not resized furniture or walls.
const basinView=roomViewpoints.find(v=>v.id==='ensuite-basin');
targets.bath2={...targets.bath2,position:[...basinView.position],look:[...basinView.look]};
for(const id of ['bed1','bed3','master','bath1','bath2','laundry','care']){
 Object.assign(targets[id],{renderAspect:1,projection:'direct-look',lensMm:24,sensorLongEdgeMm:36});
}
targets.bed1.look=[1.70,.65,3.60];
targets.master.look=[15.95,.70,2.13];
const [columnX,columnZ]=P(correction.point),railingZ=P([correction.point[0],correction.railingY])[1],gapZ=(columnZ+railingZ)/2;
Object.assign(targets,{
 balconyGap:{name:'玻璃与承重柱之间',position:[columnX-2.18,1.55,gapZ-.15],look:[11.7,.85,gapZ-.1]},
 columnFront:{name:'柱前回望',position:[columnX-.45,1.55,gapZ-.15],look:[columnX+.15,1.2,4.6]},
 glassLeft:{name:'阳台左端',position:[columnX-1.2,1.55,gapZ-.15],look:[6.4,1.1,columnZ]},
 glassRight:{name:'阳台洗烘侧',position:[columnX+1.47,1.55,gapZ-.1],look:[11.7,1.2,1.15+livingRevision.laundryOffsetZ]}
});
Object.assign(targets,balconyLayout.views);
const tour=['entry','living','bar','lake','laundry','dining','cabinet','fridge','kitchen','bed1','bath1','master','bath2','bed3','services'];
const neighbors={entry:['living','bed1','bath1','master','bed3'],living:['bar','dining','kitchen','entry'],bar:['lake','laundry','living'],lake:['bar','laundry','living'],laundry:['bar','living'],dining:['cabinet','kitchen','living','entry'],cabinet:['dining','fridge','entry'],fridge:['kitchen','dining','bar'],kitchen:['fridge','dining'],bed1:['entry','bath1'],bath1:['entry','bed1'],master:['bath2','entry','bed3'],bath2:['master'],bed3:['entry','master'],services:['living','dining']};
tour.push('passageArt');neighbors.passageArt=['master','bed3','entry'];neighbors.entry.push('passageArt');neighbors.master.push('passageArt');neighbors.bed3.push('passageArt');
const hotspotLayer=document.querySelector('#hotspots'),select=document.querySelector('#roomSelect');
tour.splice(2,0,'tvSeat');neighbors.tvSeat=['living','dining','bar'];neighbors.living.push('tvSeat');
tour.push('care');neighbors.care=['bar','glassLeft','laundry'];neighbors.fridge.push('care');
tour.splice(4,0,'balconyGap','columnFront','glassLeft','glassRight');
Object.assign(neighbors,{bar:['balconyGap','living','laundry'],lake:['balconyGap','bar','living'],balconyGap:['columnFront','glassLeft','glassRight','bar'],columnFront:['living','balconyGap'],glassLeft:['balconyGap','living'],glassRight:['laundry','balconyGap']});
neighbors.bar.push('care');neighbors.glassLeft.push('care');
tour.push('balconyDesign');neighbors.balconyDesign=['laundry','drying','tvSeat'];
tour.push('drying');neighbors.drying=['care','balconyGap','bar'];neighbors.balconyGap.push('drying');neighbors.care.push('drying');
if(matchMedia('(max-width:800px)').matches)document.querySelector('#facilities').open=false;
document.querySelector('#facilities').addEventListener('toggle',()=>dirty=true);
for(const id of tour){const option=document.createElement('option');option.value=id;option.textContent=targets[id].name;select.append(option);}
let markers=[],seatAudit=[],houseModel=null,selectedFacility=null,facilityOutline=null,facilityObjects=[];
let station='living',entryInside=false;
let dryOption='original',dryOriginal=null,dryCandidate=null,drySpec=null,dryControls=null,entryRevision=null;
function chooseDryOption(key){
 if(!ready)return;
 if(!dryOriginal)dryOriginal=houseModel.getObjectByName('bath1-vanity');
 if(dryCandidate){dryCandidate.removeFromParent();const materials=new Set();dryCandidate.traverse(o=>{if(o.isMesh){o.geometry.dispose();materials.add(o.material);}});materials.forEach(m=>m.dispose());dryCandidate=null;}
 dryOriginal.name='bath1-vanity';dryOriginal.visible=true;drySpec=null;dryOption=key;dryControls=null;
 if(key!=='original'){
  const built=makeDryZone(key);dryCandidate=built.group;drySpec=built.spec;dryControls=built;
  dryOriginal.name='bath1-vanity-original';dryOriginal.visible=false;houseModel.add(dryCandidate);
 }
 // Entrance seating belongs to the new single-sided ensemble, not the washbasin study.
 entryRevision?.setBenchShift(drySpec?.benchShift||0,drySpec?.benchBackShift||0);
 interiorMirrors?.sync(true);
 station='bath1';spaceGuide.close();
 const info=drySpec?`${drySpec.label}：台面 ${Math.round(drySpec.width*1000)} × ${Math.round(drySpec.depth*1000)} mm；${key==='integrated'?'保留原墙，暖白悬空柜与镜柜，取消额外玻璃隔屏。':'带镜柜和比较方案隔屏。'}${key==='integrated'?'当前全屋方案，柜门横向滑动；管路和五金待现场/产品核定。':'历史比较试排。'}原墙门未改变。`:'现状：650 × 490 mm 台面；未设置侧挡和镜柜。';
 focusFacility({object:'bath1-vanity',label:'公卫外置干区',note:info,position:[3.85,1.55,5.98]});
 document.querySelector('#facilities').open=false;
 const outcome=key==='integrated'?'保留原墙和次卫门洞；台盆柜总深600mm，柜宽650mm暂沿用。实景端墙已补建：进深600、厚100、高2700mm均为暂定；凹位净宽待复尺。撤掉本段换鞋凳及穿衣镜。地面含柜底做防水，台盆墙防水至少1200mm；墙根、管口加强。':key==='offset'?'历史局部试验：有人洗漱时600mm代理连通，开抽屉不连通；隔屏至原凳仅10mm。':'历史局部试验：空置时连通，有人洗漱时600mm代理不连通。';
 document.querySelector('#dryZoneMetrics').textContent=drySpec?`${drySpec.label}\n台面：${Math.round(drySpec.width*1000)} × ${Math.round(drySpec.depth*1000)} mm\n柜前至老人房墙面：${Math.round(drySpec.clearClosed*1000)} mm\n扣除 600 mm 假设站位后：${Math.round(drySpec.clearOccupied*1000)} mm\n${outcome}\n以上为当前模型几何推算；本次60cm方案未做人体通行验收，短墙位置及现场净距待核。`:'现状对照；原有 650 × 490 mm 台面和换鞋凳不变。A / B / C 是候选柜体，不是已购产品。';
 document.querySelectorAll('[data-dry-option]').forEach(b=>{b.classList.toggle('active',b.dataset.dryOption===key);b.setAttribute('aria-pressed',String(b.dataset.dryOption===key));});
 if(houseModel.getObjectByName('whole-home-skirting'))addSkirting(houseModel);
 facilityObjects=Object.values(roomFacilities).flatMap(r=>r.items).map(i=>({name:i.object,exists:Boolean(houseModel.getObjectByName(i.object))}));
 buildLocatorPlan();setLighting();renderer.shadowMap.needsUpdate=true;dirty=true;
}
document.querySelectorAll('[data-dry-option]').forEach(b=>b.onclick=()=>chooseDryOption(b.dataset.dryOption));
document.querySelector('[data-dry-study]').onclick=()=>chooseDryOption('integrated');
const dryCompact=matchMedia('(max-width:800px)');
if(dryCompact.matches)document.querySelector('#dryZoneStudy').open=false;
dryCompact.addEventListener('change',e=>{if(e.matches)document.querySelector('#dryZoneStudy').open=false;});
document.querySelector('#dryPlanButton').onclick=()=>{
 const svg=document.querySelector('#dryPlan'),ns='http://www.w3.org/2000/svg';svg.replaceChildren();
 const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;svg.append(e);return e;};
 const rect=(r,fill,stroke='#7b8370',dash='')=>add('rect',{x:r.x0,y:r.z0,width:r.x1-r.x0,height:r.z1-r.z0,fill,stroke,'stroke-width':.008,'stroke-dasharray':dash});
 const label=(x,z,text)=>add('text',{x,y:z,'font-size':.092,'text-anchor':'middle',fill:'#373731'},text);
 for(const w of walls){
  const a=P(w.a),b=P(w.b),length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const seg=(from,to)=>{if(to<=from)return;add('line',{x1:a[0]+(b[0]-a[0])*from/length,y1:a[1]+(b[1]-a[1])*from/length,x2:a[0]+(b[0]-a[0])*to/length,y2:a[1]+(b[1]-a[1])*to/length,stroke:'#7a7b70','stroke-width':(w.t||20)/100});};
  let last=0;for(const o of [...(w.open||[])].sort((a,b)=>a.at-b.at)){seg(last,o.at/100);last=(o.at+o.w)/100;}seg(last,length);
 }
 houseModel.updateMatrixWorld(true);
 for(const [name,text] of [['bath1-shower','淋浴'],['bath1-squat-pan','蹲便'],['entry-shoe-bench','换鞋凳'],['flush-entry-cabinet','鞋柜'],['bath1-vanity','台盆柜']]){
  const b=new T.Box3().setFromObject(houseModel.getObjectByName(name));rect({x0:b.min.x,z0:b.min.z,x1:b.max.x,z1:b.max.z},name==='bath1-vanity'?'#b8c7ad':'#ddd9ce');label((b.min.x+b.max.x)/2,(b.min.z+b.max.z)/2,text);
 }
 for(const name of ['door-bed1-single','door-bath1-single']){
  const d=houseModel.getObjectByName(name),p=d.getWorldPosition(new T.Vector3()),points=[];
  for(let deg=0;deg<=90;deg+=3){const angle=d.userData.base+d.userData.turn*deg*Math.PI/180;points.push([p.x+Math.cos(angle)*d.userData.leafSpan,p.z-Math.sin(angle)*d.userData.leafSpan].join(','));}
  add('polyline',{points:points.join(' '),fill:'none',stroke:'#b17b43','stroke-width':.012});
  const b=new T.Box3().setFromObject(d.getObjectByName(name+'-panel'));rect({x0:b.min.x,z0:b.min.z,x1:b.max.x,z1:b.max.z},'#bfa787');
 }
 if(drySpec){
  rect(drySpec.standing,'#d7b1a75e','#b38173','.035 .025');label(drySpec.x,drySpec.standing.z0+.30,'假设站位');
  if(drySpec.storage!=='sliding')rect(drySpec.drawer,'none','#a87944','.025 .02');
  label(drySpec.x,7.51,`${Math.round(drySpec.width*1000)} × ${Math.round(drySpec.depth*1000)} mm`);
  add('line',{x1:drySpec.minX,y1:7.67,x2:drySpec.maxX,y2:7.67,stroke:'#5c6255','stroke-width':.008});
  label((drySpec.minX+drySpec.maxX)/2,7.63,'墙线对齐范围 1000 mm');
 }
 label(3.2,5.33,'老人房');label(1.65,5.9,'公卫');label(4.7,6.05,'玄关');
 document.querySelector('#dryPlanNote').textContent=document.querySelector('#dryZoneMetrics').textContent;
 document.querySelector('#dryPlanDialog').showModal();
};
const doorToggle=document.createElement('button');doorToggle.id='doorToggle';doorToggle.hidden=true;
document.querySelector('header nav').prepend(doorToggle);
doorToggle.onclick=()=>{const door=houseModel?.getObjectByName(selectedFacility);if(!door||typeof door.userData.turn!=='number')return;setDoorLeafOpen(door,!door.userData.open);doorToggle.textContent=door.userData.open?'关闭这扇门':'打开这扇门';doorToggle.setAttribute('aria-pressed',String(door.userData.open));if(facilityOutline)facilityOutline.box.setFromObject(door);dirty=true;};
const entryDoors=['entry-door-tall','entry-door-lower','entry-door-upper'];
function showEntryInside(value){entryInside=value;entryRevision?.setOpen(value);const b=document.querySelector('#entryInside');b.textContent=value?'关闭鞋柜门':'打开鞋柜门';b.setAttribute('aria-pressed',String(value));dirty=true;renderer.shadowMap.needsUpdate=true;}
document.querySelector('#entryInside').onclick=()=>{station='entry';focusFacility(roomFacilities.entry.items[1],false);document.querySelector('#facilities').open=false;showEntryInside(!entryInside);if(entryInside)document.querySelector('#facilityNote').textContent=roomFacilities.entry.items[1].note;};
document.querySelector('#entryShoes').onclick=()=>{if(!ready)return;station='entry';focusFacility(roomFacilities.entry.items[0],false);document.querySelector('#facilities').open=false;};
wireInventory({dialog:document.querySelector('#inventory'),rooms,data:roomFacilities,pending:pendingDesign,getModel:()=>houseModel,resolveItem:(room,item)=>displayFacility(item),onSelect:(room,item)=>{station=room;focusFacility(item);document.querySelector('#facilities').open=false;}});
// These links locate existing objects only; they must not imply missing rooms were built.
const spaceGuide=document.querySelector('#spaceGuide');
const masterDressing=wireMasterDressing({getModel:()=>ready?houseModel:null,focus:item=>{station='master';focusFacility(item);document.querySelector('#facilities').open=false;},onChanged:()=>{buildLocatorPlan();setLighting();interiorMirrors?.sync(true);if(facilityOutline&&selectedFacility){const o=houseModel.getObjectByName(selectedFacility);if(o)facilityOutline.box.setFromObject(o);}dirty=true;}});
function locateFromGuide(room,name){
 if(!ready)return;spaceGuide.close();station=room;
 const item=roomFacilities[room].items.find(i=>i.object===name);
 if(item){focusFacility(item);document.querySelector('#facilities').open=false;}else visit(room);
}
function buildLocatorPlan(){
 const svg=document.querySelector('#locatorPlan'),ns='http://www.w3.org/2000/svg';
 svg.replaceChildren();
 const add=(tag,attrs,text)=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));if(text)el.textContent=text;svg.append(el);return el;};
 add('polygon',{points:outline.map(p=>p.join(',')).join(' '),fill:'#eeebe3'});
 for(const room of rooms.filter(r=>['kitchen','bed1','bath1','master','bath2','bed3'].includes(r.id))){
  add('polygon',{points:room.poly.map(p=>p.join(',')).join(' '),fill:room.id.startsWith('bath')?'#dce7e3':'#e2e5d8',stroke:'#c2c7b8','stroke-width':2});
  // Labels follow the model room polygon centroid, not a second layout.
  let area=0,cx=0,cy=0;room.poly.forEach((a,i)=>{const b=room.poly[(i+1)%room.poly.length],cross=a[0]*b[1]-b[0]*a[1];area+=cross;cx+=(a[0]+b[0])*cross;cy+=(a[1]+b[1])*cross;});
  add('text',{x:cx/(3*area),y:cy/(3*area),'text-anchor':'middle','font-size':29,fill:'#41473d'},room.name.split(' · ')[0]);
 }
 for(const wall of walls){
  const dx=wall.b[0]-wall.a[0],dy=wall.b[1]-wall.a[1],length=Math.hypot(dx,dy);let start=0;
  const segment=(a,b)=>{if(b>a)add('line',{x1:wall.a[0]+dx*a/length,y1:wall.a[1]+dy*a/length,x2:wall.a[0]+dx*b/length,y2:wall.a[1]+dy*b/length,stroke:wall.glass?'#8db3b0':'#797e70','stroke-width':wall.glass?4:(wall.t||12)});};
  for(const o of [...(wall.open||[])].sort((a,b)=>a.at-b.at)){segment(start,o.at);start=o.at+o.w;}segment(start,length);
 }
 const pins=[['bath2','bath2-vanity','主卫洗漱台'],['master','master-entry-wardrobe','入口衣柜'],['master','master-wardrobe','主卧衣柜'],['bath1','bath1-vanity','公卫外置洗手台'],['entry','flush-entry-cabinet','鞋柜']];
 pins.forEach(([room,name,label],i)=>{
  const b=new T.Box3().setFromObject(houseModel.getObjectByName(name)),c=b.getCenter(new T.Vector3()),x=c.x*100+42,y=c.z*100+120;
  add('rect',{x:b.min.x*100+42,y:b.min.z*100+120,width:(b.max.x-b.min.x)*100,height:(b.max.z-b.min.z)*100,fill:'#adbaa3',stroke:'#5c6255','stroke-width':3});
  const dot=add('g',{role:'button',tabindex:0,'aria-label':label,'data-map-object':name,class:'locator-pin'});
  for(const [tag,attrs,text] of [['circle',{cx:x,cy:y,r:24,fill:'#5c6255'}],['text',{x,y:y+10,'text-anchor':'middle','font-size':30,fill:'white'},String(i+1)]])dot.append(add(tag,attrs,text));
  dot.onclick=()=>locateFromGuide(room,name);dot.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();locateFromGuide(room,name);}};
 });
}
document.querySelector('#spaceGuideToggle').onclick=()=>spaceGuide.showModal();
spaceGuide.querySelectorAll('[data-locate-room]').forEach(button=>{
 button.onclick=()=>{
  if(!ready)return;
  locateFromGuide(button.dataset.locateRoom,button.dataset.locateObject);
 };
});
function visit(id){if(!targets[id])return;station=id;setMode('look');}
function syncBalconyActions(){
 const c=window.balconyCareDebug,b=window.balconyLayoutDebug;
 const actions=[['hamper',b?.state.hamper>0,'日常小件脏衣篮','收好脏衣篮'],['tools',c?.doorOpen,'抽拉长物挂架','收回长物挂架'],['robot',c?.robotOut,'扫地机出入','扫地机归位'],['maintenance',c?.maintenance,'基站前维护','收好检修位'],['display',window.tvDisplayDebug?.state.displayOpen,'展示柜开门','关好展示柜']];
 for(const [key,open,closedLabel,openLabel] of actions){const button=document.querySelector(`[data-balcony-action="${key}"]`);if(button){button.textContent=open?openLabel:closedLabel;button.setAttribute('aria-pressed',String(Boolean(open)));}}
 for(const [id,open,closedLabel,openLabel] of [['careRobotDemo',c?.robotOut,'机器人驶出示意','机器人归位'],['careDoorDemo',c?.doorOpen,'抽拉长物挂架','收回长物挂架'],['careMaintenance',c?.maintenance,'基站前维护','收好检修位']]){const button=document.getElementById(id);if(button){button.textContent=open?openLabel:closedLabel;button.setAttribute('aria-pressed',String(Boolean(open)));}}
}
function syncBathActions(){
 const active=station==='bath1'&&mode==='look',dry=active&&(selectedFacility==='bath1-vanity'||selectedFacility?.startsWith('dry-'));
 const dryActions=document.querySelector('#dryStorageActions');if(dryActions)dryActions.hidden=!dry||dryOption!=='integrated';
 const publicActions=document.querySelector('#publicBathActions');if(publicActions)publicActions.hidden=!active||dry;
 document.querySelector('#dryZoneStudy').hidden=!dry;
}
function updateNavigation(){
 syncBalconyActions();
 const serviceActions=document.querySelector('#entryServiceActions');if(serviceActions)serviceActions.hidden=station!=='passageArt'||mode!=='look';
 document.getElementById('immersiveToggle')?.toggleAttribute('hidden',mode==='plan');
 curtainControls?.sync();
 hvacControls?.sync();
 const bedroomActions=document.querySelector('#bedroomActions');if(bedroomActions){bedroomActions.hidden=!['bed1','bed3'].includes(station)||mode!=='look';bedroomActions.querySelectorAll('button').forEach(b=>b.hidden=b.dataset.room!==station);}
 const careActions=document.querySelector('#balconyCareActions');if(careActions)careActions.hidden=station!=='care'||mode!=='look';
 const dryingActions=document.querySelector('#dryingActions');if(dryingActions)dryingActions.hidden=station!=='drying'||mode!=='look';
 const powerActions=document.querySelector('#barPowerActions');if(powerActions)powerActions.hidden=station!=='bar'||mode!=='look';
 syncBathActions();
 const kitchenActions=document.querySelector('#kitchenActions');if(kitchenActions)kitchenActions.hidden=station!=='kitchen'||mode!=='look';
 const laundryActions=document.querySelector('#laundryActions');if(laundryActions)laundryActions.hidden=facilityRoom(station)!=='laundry'||mode!=='look';
 const sideActions=document.querySelector('#sideboardActions');if(sideActions)sideActions.hidden=facilityRoom(station)!=='dining'||mode!=='look';
 const fridgeActions=document.querySelector('#fridgeActions');if(fridgeActions)fridgeActions.hidden=station!=='fridge'||mode!=='look';
 if(laundryActions)for(const kind of ['washer','dryer']){const b=laundryActions.querySelector(`[data-laundry-action="${kind}"]`),open=window.laundryDetailsDebug?.state[kind]>0;b.textContent=(open?'关':'开')+(kind==='washer'?'洗衣机门':'烘干机门');b.setAttribute('aria-pressed',String(open));}
 const bathActions=document.querySelector('#masterBathActions');if(bathActions){bathActions.hidden=station!=='bath2'||mode!=='look';const s=window.masterBathDetailsDebug?.state;if(s)bathActions.querySelectorAll('[data-master-bath-action]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.masterBathAction==='shower'?s.showerOpen:s.drawers[Number(b.dataset.masterBathAction.slice(-1))])));}
 mobileNavigation?.sync();
 viewerFocus?.sync();
 masterDressing.setVisible(false);
 document.querySelector('#entryInside').hidden=station!=='entry'||mode!=='look';if(station!=='entry'&&entryInside)showEntryInside(false);
 document.querySelector('#roomTour').hidden=mode==='plan';hotspotLayer.hidden=mode!=='look';select.value=station;
 document.querySelector('#roomCount').textContent=`${tour.indexOf(station)+1} / ${tour.length}`;
 document.querySelector('#position').textContent=`${targets[station].name} · ${mode==='look'?'点击画面箭头切换空间':'全屋查看'} · 柱距护栏约 1.5 m`;
 hotspotLayer.replaceChildren();markers=(neighbors[station]||[]).map(id=>{const b=document.createElement('button');b.className='room-hotspot';b.dataset.room=id;b.setAttribute('aria-label',`切换到${targets[id].name}`);const arrow=document.createElement('span');arrow.className='direction';arrow.textContent='➜';b.append(arrow,document.createTextNode(targets[id].name));b.onclick=()=>visit(id);hotspotLayer.append(b);return {id,b,arrow};});
 updateFacilities();
}
function clearFacility(){selectedFacility=null;selectedFocusPoint=null;doorToggle.hidden=true;if(facilityOutline){scene.remove(facilityOutline);facilityOutline.geometry.dispose();facilityOutline.material.dispose();facilityOutline=null;}document.querySelector('#facilityNote').hidden=true;}
function setLighting(){
 if(!daySun)return;daySun.intensity=night?0:daylightStudy?.65:1.4;ambient.intensity=night?.23:daylightStudy?.38:1.05;scene.backgroundIntensity=night?.045:1;
 daylightDesign?.setEnabled((daylightStudy||immersivePreview?.state.lightStyle==='natural')&&!night);
 bakedWallStudy?.setEnabled(!night);
 surfaceLightmaps?.setEnabled(!night);
 if(surfaceLightmaps)for(const e of surfaceLightmaps.entries)e.original.envMapIntensity=night?.07:.48;
 if(bakedWallStudy)for(const e of bakedWallStudy.entries)e.original.envMapIntensity=night?.07:.48;
 lightingDesign?.sync();
 houseModel.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.isMeshStandardMaterial)m.envMapIntensity=night?.07:daylightStudy?.28:.48;});
 if(!night&&!daylightStudy&&immersivePreview?.state.lightStyle==='natural'){
  ambient.intensity=.38;daySun.intensity=.85;renderer.toneMappingExposure=1.0;
 }else renderer.toneMappingExposure=.97;
 const button=document.querySelector('#lightingMode');button.textContent=night?'切回日间':'夜间灯光';button.setAttribute('aria-pressed',String(night));renderer.shadowMap.needsUpdate=true;dirty=true;
}
function chooseLightingPreset(value){lightingDesign?.setPreset(value);night=value!=='day';setLighting();}
document.querySelector('#lightingMode').onclick=()=>chooseLightingPreset(night?'day':'evening');
document.querySelector('#tvWall').onclick=()=>{if(!ready)return;station='living';focusFacility(roomFacilities.living.items.find(i=>i.object==='recessed-tv-black-side-reveals'),false);document.querySelector('#facilities').open=false;};
function updateFacilities(){
 const id=facilityRoom(station),data=roomFacilities[id],list=document.querySelector('#facilityList');list.replaceChildren();document.querySelector('#facilities').hidden=mode==='plan';document.querySelector('#facilitySummary').textContent=data.summary;
 if(id==='entry'&&entryRevision){
  const door=houseModel.getObjectByName('door-front-main'),openDoor=document.createElement('button');
  openDoor.id='entryOutwardToggle';openDoor.textContent=door.userData.open?'关闭入户门':'向外打开入户门';
  openDoor.onclick=()=>{setDoorLeafOpen(door,!door.userData.open);openDoor.textContent=door.userData.open?'关闭入户门':'向外打开入户门';renderer.shadowMap.needsUpdate=true;dirty=true;};list.append(openDoor);
  const storage=document.createElement('button');storage.id='entryStorageToggle';storage.textContent=entryInside?'收好柜门与小物抽屉':'查看鞋柜内部';
  storage.onclick=()=>{showEntryInside(!entryInside);storage.textContent=entryInside?'收好柜门与小物抽屉':'查看鞋柜内部';};list.append(storage);
  const planLink=document.createElement('a');planLink.href='entry-design-plan.html';planLink.textContent='查看同源立面与60cm占位 →';list.append(planLink);
 }
 if(id==='bath1'&&drySpec)document.querySelector('#facilitySummary').textContent=`公卫内的蹲便与淋浴不变；外置干区正在显示 ${drySpec.label}。镜柜、侧挡及浅盆是未选定的候选，不是已替换的全屋定案。`;
 if(id==='master'&&masterDressing.status.spec)document.querySelector('#facilitySummary').textContent=masterDressing.status.spec.description+' 当前已接入全屋设计，选品与现场安装待核；不是独立衣帽间。';
 for(const view of roomViewsFor(station).length?roomViewsFor(station):roomViewsFor(id)){const b=document.createElement('button');b.dataset.roomView=view.id;b.textContent='取景 · '+view.name;b.onclick=()=>selectRoomView(view.id);list.append(b);}
 for(const [index,item] of data.items.entries()){const shown=displayFacility(item),b=document.createElement('button');b.dataset.facility=item.object;b.textContent=`${index+1}. ${shown.label}`;b.disabled=!houseModel?.getObjectByName(item.object);b.onclick=()=>focusFacility(shown);list.append(b);}
 if(id==='master'&&masterDressing.status.spec){const b=document.createElement('button');b.textContent='梳妆桌、镜面灯与凳子';b.onclick=()=>focusFacility({object:'master-makeup-desk',label:'主卧梳妆候选',note:'可在左侧比较 A/B/C、拉凳及取物；不是独立衣帽间。',position:masterDressing.status.key!=='open'?[13.7,1.5,3.45]:[15.65,1.55,3.5]});list.prepend(b);}
 document.querySelector('#facilityTitle').textContent=targets[station].name+' · 布局与设施';
}
function displayFacility(item){
 if(item.object==='retained-balcony-column')return {...item,object:'bar-service-cover',note:item.note+' 当前展示薄包饰面，结构柱在其内部，未改变结构尺寸。'};
 const s=masterDressing.status.spec;
 if(s&&['master-entry-wardrobe','master-wardrobe'].includes(item.object))return {...item,label:item.object==='master-entry-wardrobe'?'入口高柜 · 候选':s.key==='open'?'床尾浅矮柜 · 非挂衣柜':'床尾高柜 · 候选',note:s.description+' 可在左侧滑开柜门查看内部；当前接入全屋，仍须按机型与现场核定；不是独立衣帽间。'};
 return item;
}
function focusFacility(item,outline=true){
 if(item.action==='curtains'&&curtainControls){curtainControls.open(item.object.replace('-curtain',''));return;}
 if(item.action==='bar-seat'&&window.livingLayoutDebug)livingLayoutDebug.seatsUse.set('stand',item.seatIndex);
 if(item.action==='laundry-door')window.laundryDetailsDebug?.set(item.kind,90);
 if(item.action==='sideboard'){if(item.band==='upper')window.hvacDetailsDebug?.ducted.reset();const d=window.sideboardDetailsDebug;d.reset();if(item.band==='drawer')d.setDrawer(item.index);else if(item.band==='service')d.setService(true);else d.setDoor(item.band,item.index);}
 if(item.action==='fridge'){station='fridge';const d=window.fridgeDetailsDebug;d.reset();if(item.upper)d.setUpper(1);else d.setDoors(1);if(Number.isInteger(item.bin))d.setBin(item.bin);}
 item=displayFacility(item);
 const publicBath=window.publicBathDetailsDebug;if(publicBath){if(item.object==='bath1-shallow-storage')publicBath.setStorage(1);if(item.object==='bath1-removable-ceiling-panel')publicBath.setHatch(1);if(item.object==='bath1-shower-fittings'||item.object==='bath1-shower-toiletries')publicBath.setShower(true);}
 const kitchen=window.kitchenDetailsDebug;if(kitchen){const index=kitchen.moving.findIndex(o=>o.name===item.object);if(index>=0){kitchen.setSinkDoors(false);kitchen.setDrawer(index);}if(item.object==='kitchen-sink-service-bay'){kitchen.setDrawer(-1);kitchen.setSinkDoors(true);}}
 if(item.object==='dock-removable-service-cassette'){window.balconyCareDebug.setMaintenance(true);document.querySelector('#careMaintenance').setAttribute('aria-pressed','true');}
 if(dryOption==='integrated'&&item.object==='dry-service-access'){dryControls.setStorage(true,'right');document.querySelector('[data-dry-action="storage"]').setAttribute('aria-pressed','true');}
 if(dryOption==='integrated'&&item.object==='dry-mirror-storage'){dryControls.setMirror(true);document.querySelector('[data-dry-action="mirror"]').setAttribute('aria-pressed','true');}
 if(['bed1-bed-storage','bed3-bed-storage'].includes(item.object)){
  const key=item.object.startsWith('bed1')?'elderStorage':'childStorage';window.bedroomRevisionDebug.set(key,true);
  const button=document.querySelector(`[data-bedroom-action="${key}"]`);button.setAttribute('aria-pressed','true');button.textContent='收回 · 床箱收纳';
 }
 if(['balcony-care-services','balcony-folding-basin'].includes(item.object)){window.balconyCareDebug.setDoorOpen(true);document.querySelector('#careDoorDemo').textContent='关闭柜门';}
 if(item.object==='bath1-vanity'&&drySpec)item={...item,label:drySpec.label+' · 公卫干区试排',note:Math.round(drySpec.width*1000)+' mm 宽台面，'+Math.round(drySpec.depth*1000)+' mm 深；镜柜与侧挡为候选设计。未复核真实产品、站位和给排水，未替换全屋基准方案。'};
 if(item.object==='bath2-vanity')station='bath2';
 setMode('look');const object=houseModel.getObjectByName(item.object);if(!object)return;
 if(Number.isFinite(item.sectionZ)){renderer.clippingPlanes=[new T.Plane(new T.Vector3(0,0,1),-item.sectionZ)];gesture.textContent='玄关正立面剖视 · 临时裁掉前景墙便于看清，未改变户型 · 非实际站位';}
 const box=new T.Box3().setFromObject(object),center=box.getCenter(new T.Vector3());
 if(item.look){center.fromArray(item.look);selectedFocusPoint=center.clone();}
 if(item.position)camera.position.fromArray(item.position);
 if(Number.isFinite(item.detailDistance)){const offset=camera.position.clone().sub(center).normalize();camera.position.copy(center).addScaledVector(offset,T.MathUtils.clamp(item.detailDistance,.65,1.5));}
 camera.lookAt(center);yaw=camera.rotation.y;pitch=camera.rotation.x;const size=box.getSize(new T.Vector3()),d=camera.position.distanceTo(center),radius=size.length()/2;camera.fov=Number.isFinite(item.fov)?T.MathUtils.clamp(item.fov,48,84):T.MathUtils.clamp(T.MathUtils.radToDeg(2*Math.asin(Math.min(.96,radius/d)))*1.18/Math.min(1,camera.aspect),48,84);camera.updateProjectionMatrix();
 if(outline&&!Number.isFinite(item.detailDistance)){facilityOutline=new T.Box3Helper(box,0x7c9270);scene.add(facilityOutline);}selectedFacility=item.object;
 if(typeof object.userData.turn==='number'){doorToggle.hidden=false;doorToggle.textContent=object.userData.open?'关闭这扇门':'打开这扇门';doorToggle.setAttribute('aria-pressed',String(object.userData.open));}
 const note=document.querySelector('#facilityNote');note.textContent=item.label+'：'+item.note;note.hidden=false;document.querySelectorAll('[data-facility]').forEach(b=>b.classList.toggle('active',b.dataset.facility===item.object));syncBathActions();dirty=true;
}
function layoutRoom(){
 const id=facilityRoom(station),r=rooms.find(r=>r.id===(id==='care'?'bar':id)),pts=r.poly.map(P),xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]);
 const x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs),x=(x0+x1)/2,z=(z0+z1)/2;
 renderer.clippingPlanes=[new T.Plane(new T.Vector3(0,-1,0),1.35),new T.Plane(new T.Vector3(1,0,0),-x0+.12),new T.Plane(new T.Vector3(-1,0,0),x1+.12),new T.Plane(new T.Vector3(0,0,1),-z0+.12),new T.Plane(new T.Vector3(0,0,-1),z1+.12)];
 camera.fov=48;camera.updateProjectionMatrix();const distance=Math.max(z1-z0,(x1-x0)/camera.aspect)*.67/Math.tan(T.MathUtils.degToRad(24));
 controls.target.set(x,0,z);camera.position.set(x,Math.max(distance,4),z+.001);controls.update();
 // A visual mask cut from the authoritative room polygon hides neighboring rooms.
 // This is a display-only section, never a new wall or a changed floor boundary.
 if(roomMask){maskScene.remove(roomMask);roomMask.geometry.dispose();roomMask.material.dispose();}
 const shape=new T.Shape([new T.Vector2(-50,-50),new T.Vector2(50,-50),new T.Vector2(50,50),new T.Vector2(-50,50)]),hole=new T.Path();pts.forEach(([px,pz],i)=>i?hole.lineTo(px,-pz):hole.moveTo(px,-pz));hole.closePath();shape.holes.push(hole);
 roomMask=new T.Mesh(new T.ShapeGeometry(shape),new T.MeshBasicMaterial({color:'#e9e5dc',side:T.DoubleSide,depthTest:false,depthWrite:false}));roomMask.rotation.x=-Math.PI/2;roomMask.position.y=1.36;maskScene.add(roomMask);
 document.querySelector('#position').textContent=targets[station].name+' · 本房布局（1.35 m 水平剖切，未改墙体）';
}
function projectHotspots(){
 if(mode!=='look')return;camera.updateMatrixWorld();const w=host.clientWidth,h=host.clientHeight,placed=[],panel=document.querySelector('#facilities');
 for(const {id,b,arrow} of markers){const p=new T.Vector3(...targets[id].position);p.y=.65;const local=p.clone().applyMatrix4(camera.matrixWorldInverse),v=p.project(camera);let x,y,angle;
  if(local.z<0&&Math.abs(v.x)<.82&&Math.abs(v.y)<.7){x=(v.x+1)*w/2;y=(1-v.y)*h/2;angle=-90;b.dataset.edge='false';}
  else {const bearing=Math.atan2(local.x,-local.z);x=bearing<0?85:w-85;y=h*.48;angle=bearing<0?180:0;b.dataset.edge='true';}
  x=T.MathUtils.clamp(x,80,w-80);y=T.MathUtils.clamp(y,110,h-150);
  if(x+85>panel.offsetLeft&&y-26<panel.offsetTop+panel.offsetHeight&&y+26>panel.offsetTop)y=panel.offsetTop+panel.offsetHeight+32;
  while(placed.some(p=>Math.abs(p.x-x)<145&&Math.abs(p.y-y)<48))y+=52;
  if(y>h-140){y=110;while(placed.some(p=>Math.abs(p.x-x)<145&&Math.abs(p.y-y)<48))y+=52;}
  placed.push({x,y});b.style.left=`${x}px`;b.style.top=`${y}px`;arrow.style.transform=`rotate(${angle}deg)`;
 }
}
select.onchange=()=>visit(select.value);document.querySelector('#previousRoom').onclick=()=>visit(tour[(tour.indexOf(station)+tour.length-1)%tour.length]);document.querySelector('#nextRoom').onclick=()=>visit(tour[(tour.indexOf(station)+1)%tour.length]);
function lookAtStation(){const v=targets[station];camera.position.fromArray(v.position);camera.lookAt(new T.Vector3(...v.look));yaw=camera.rotation.y;pitch=camera.rotation.x;}
function selectRoomView(id){
 const view=roomViewpoints.find(v=>v.id===id);if(!view||!ready)return;
 station=view.room;setMode('look');activeRoomView=view;
 for(const panel of ['masterDressing','dryZoneStudy'])document.getElementById(panel).open=false;
 camera.position.fromArray(view.position);camera.lookAt(new T.Vector3(...view.look));yaw=camera.rotation.y;pitch=camera.rotation.x;
 camera.fov=roomViewFov(view,camera.aspect);camera.updateProjectionMatrix();
 document.querySelector('#facilities').open=false;
 const note=document.querySelector('#facilityNote');note.textContent=view.name+' · 24mm 实位取景，可拖动环顾；未剖墙、未改房间比例。';note.hidden=false;
 document.querySelectorAll('[data-room-view]').forEach(b=>b.classList.toggle('active',b.dataset.roomView===id));dirty=true;
}
function setMode(next){immersiveLook.clear();if(next!=='walk'&&document.pointerLockElement===canvas)document.exitPointerLock();walker?.leave();clearFacility();renderer.clippingPlanes=[];mode=next;document.querySelector('#plan').hidden=mode!=='plan';canvas.hidden=mode==='plan';document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));controls.enabled=mode==='orbit'||mode==='top'||mode==='layout';controls.enableRotate=mode==='orbit';controls.enablePan=mode==='orbit';camera.fov=['look','walk'].includes(mode)?70:48;camera.updateProjectionMatrix();if(roof)roof.visible=['look','walk'].includes(mode);
 activeRoomView=null;
 scene.background=['look','walk'].includes(mode)&&environment?environment:new T.Color('#e9e5dc');busy.hidden=ready||mode==='plan';
 if(mode==='look')lookAtStation();else if(mode==='walk'){if(!walker?.enter()){mode='look';lookAtStation();document.querySelector('#facilityNote').textContent='此细节机位没有足够站位，请先定位玄关再开始行走。';document.querySelector('#facilityNote').hidden=false;}}else if(mode==='orbit'||mode==='top'){controls.target.set(9.1,.65,3.6);camera.position.set(mode==='top'?9.1:17.5,mode==='top'?17:13,mode==='top'?3.601:16.5);controls.update();}
 const mobile=matchMedia('(max-width:800px), (max-width:1100px) and (max-height:550px)').matches;
 gesture.textContent=mode==='look'?(mobile?'单指环顾 · 双指缩放 · 箭头换房间':'拖动环顾 · 点击房间箭头或设施名称定位 · 非连续行走'):mode==='plan'?'平面核对 · 切换“旋转全景”操作三维模型':mode==='layout'?(mobile?'房间俯视 · 双指缩放':'当前房间剖切布局 · 滚轮缩放 · 点击设施返回室内查看'):(mobile?'单指旋转 · 双指缩放 / 平移':'拖动旋转 · 滚轮缩放 · 右键平移');updateNavigation();if(mode==='layout')layoutRoom();renderer.shadowMap.needsUpdate=true;dirty=true;
}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{station=b.dataset.view;setMode('look');});document.querySelector('#reset').onclick=()=>{station='living';setMode(mode);};
document.querySelector('#collapse').onclick=e=>{const wide=document.querySelector('main').classList.toggle('wide');e.target.textContent=wide?'展开说明':'收起说明';};
document.querySelector('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await host.requestFullscreen();}catch{document.querySelector('main').classList.add('wide');if(matchMedia('(max-width:800px), (max-width:1100px) and (max-height:550px)').matches){document.body.classList.add('mobile-immersive');gesture.textContent='网页全屏 · 点右上角退出';}else gesture.textContent='浏览器未允许系统全屏，已放大画面；也可按 F11。';}};
document.querySelector('#exitFull').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.body.classList.remove('mobile-immersive');};
function resizePreview(){
 const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
 renderer.setSize(w,h,false);composer.setSize(w,h);
 // Keep colour sharp while sampling contact shading at a lower resolution in balanced mode.
 const aoScale=renderer.getPixelRatio()*(immersivePreview?.state.quality==='high'?1:.6);
 ao.setSize(Math.max(1,Math.round(w*aoScale)),Math.max(1,Math.round(h*aoScale)));
 camera.aspect=w/h;if(activeRoomView)camera.fov=roomViewFov(activeRoomView,camera.aspect);
 camera.updateProjectionMatrix();if(ready&&mode==='layout')layoutRoom();dirty=true;
}
new ResizeObserver(resizePreview).observe(host);
new ResizeObserver(entries=>document.documentElement.style.setProperty('--header-height',entries[0].target.offsetHeight+'px')).observe(document.querySelector('header'));
let lastFrame=performance.now(),wasWalking=false;
function frame(){
 requestAnimationFrame(frame);const now=performance.now(),dt=(now-lastFrame)/1000;lastFrame=now;
 if(controls.enabled)controls.update();immersiveLook.step(dt);const moving=walker?.step(dt);
 // The same composition stays active during movement and after release.
 if(wasWalking&&!moving)dirty=true;wasWalking=!!moving;
 if(!ready||!dirty||mode==='plan')return;
 projectHotspots();lightingDesign?.update(camera);daylightDesign?.update(camera);
 // Zero intensity does not remove a Three.js light's shadow sampler.
 // Daylight and evening pools must not consume GPU texture units together.
 for(const light of [...(lightingDesign?.pool||[]),...(daylightDesign?.pool||[])])light.visible=light.intensity>0;
 if(daySun)daySun.visible=daySun.intensity>0;
 bakedWallStudy?.update();surfaceLightmaps?.update();interiorMirrors?.prepare(camera);
 staticSunShadow?.update();
 composer.render();
 if(mode==='layout'){const planes=renderer.clippingPlanes;renderer.clippingPlanes=[];renderer.autoClear=false;renderer.render(maskScene,camera);renderer.autoClear=true;renderer.clippingPlanes=planes;}
 dirty=false;draws++;
 if(captureFrame){captureFrame=false;const a=document.createElement('a');a.download='湖畔-'+station+'-实时模型.png';a.href=canvas.toDataURL('image/png');lastCapture={file:a.download,width:canvas.width,height:canvas.height,png:a.href.startsWith('data:image/png;base64,'),bytes:Math.floor(a.href.split(',')[1].length*3/4)};a.click();}
 // A direct layout deep-link stopped on a washed-out first composite; its
 // unchanged second draw was correct. Finish one startup redraw before idling.
 if(draws===1){dirty=true;renderer.shadowMap.needsUpdate=true;}
}frame();
async function init(){try{const [asset,env,decorAssets]=await Promise.all([new GLTFLoader().loadAsync('./offline-render/home-facilities-packed.glb?v=43d121b264fedc126'),new RGBELoader().loadAsync('./assets/lake.hdr'),familyDisplayAssetsReady,textilesReady,cabinetFinishesReady]);const house=asset.scene;houseModel=house;scene.add(house);const importedLights=[];house.traverse(o=>{if(o.isLight)importedLights.push(o);if(o.isMesh){o.castShadow=!o.material.transparent;o.receiveShadow=true;const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms)if(m.isMeshStandardMaterial)m.envMapIntensity=.5;}});for(const light of importedLights)light.removeFromParent();
 const delta=(correction.point[1]-notes.column.point[1])/100;for(const name of ['retained-balcony-column','lake-bar-left','lake-bar-right']){const object=house.getObjectByName(name);if(!object)throw Error('场景缺少柱位对象：'+name);object.position.z+=delta;object.updateMatrix();if(name.startsWith('lake-bar')){let i=0;for(const child of object.children)if(child.name.startsWith('upholstered-counter-stool')){child.visible=true;child.position.x=(name.endsWith('left')?barSeating.left:barSeating.right)[i++];child.position.z=barSeating.storedZ;child.updateMatrix();}}}
 applyLivingRevision(house);
 window.sideboardDetailsDebug=refineSideboard(house);window.fridgeDetailsDebug=refineFridge(house);
 for(const [id,actions] of [['sideboard',[['overall','看整体'],['upper','上柜杯具'],['drawer','餐具抽屉'],['base','底柜收纳'],['service','管线机检修'],['reset','全部关好']]],['fridge',[['overall','看整体'],['upper','顶部收纳'],['doors','打开冰箱'],['bins','抽篮取物'],['reset','关好冰箱']]]]){
  const bar=document.createElement('div');bar.id=id+'Actions';bar.hidden=true;
  for(const [key,label] of actions){const b=document.createElement('button');b.dataset.storageDevice=id;b.dataset.storageAction=key;b.textContent=label;b.onclick=()=>{
   const side=id==='sideboard',d=side?window.sideboardDetailsDebug:window.fridgeDetailsDebug;station=side?'cabinet':'fridge';
   if(key==='overall'){if(side)selectRoomView('dining-sideboard');else focusFacility({object:'integrated-fridge',label:'冰箱整体',position:[8.8,1.6,2.65],note:'保留当前开合状态查看整柜；可拖动环顾，抽篮取物查看内部。'},false);}
   else if(key==='reset'){d.reset();visit(station);}
   else if(side){const candidates=roomFacilities.dining.items.filter(i=>i.action==='sideboard'&&i.band===key),current=candidates.findIndex(i=>i.index===d.state[key]);const item=candidates[(current+1)%candidates.length];if(item)focusFacility(item,false);}
   else{const index=key==='bins'?(d.state.bin+1)%5:undefined;focusFacility(roomFacilities.kitchen.items.find(i=>i.action==='fridge'&&(key==='upper'?i.upper:!i.upper&&(index===undefined?i.bin===undefined:i.bin===index))),false);}
   document.querySelector('#facilities').open=false;dirty=true;renderer.shadowMap.needsUpdate=true;
  };bar.append(b);}host.append(bar);
 }
 window.laundryDetailsDebug=refineLaundry(house);
 const laundryActions=document.createElement('div');laundryActions.id='laundryActions';laundryActions.hidden=true;
 for(const [key,label] of [['washer','洗衣机门'],['dryer','烘干机门'],['reset','全部归位']]){
  const b=document.createElement('button');b.dataset.laundryAction=key;b.textContent=label;b.onclick=()=>{
   const d=window.laundryDetailsDebug;station='laundry';
   if(key==='reset'){d.reset();window.balconyCareDebug?.setMaintenance(false);window.balconyCareDebug?.setDoorOpen(false);window.balconyCareDebug?.setRobotOut(false);window.balconyLayoutDebug?.reset();window.tvDisplayDebug?.setDisplayOpen(false);visit('laundry');}
   else{d.set(key,d.state[key]?0:90);focusFacility({...roomFacilities.laundry.items.find(i=>i.kind===key),action:null},false);}
   document.querySelector('#facilities').open=false;dirty=true;renderer.shadowMap.needsUpdate=true;
  };laundryActions.append(b);
 }
 for(const [key,label] of [['hamper','日常小件脏衣篮'],['tools','抽拉长物挂架'],['robot','扫地机出入'],['maintenance','基站前维护'],['display','展示柜开门'],['whole','看阳台与电视柜']]){
  const b=document.createElement('button');b.dataset.balconyAction=key;b.textContent=label;
  b.onclick=()=>{if(key==='whole'){visit('balconyDesign');return;}if(key==='hamper'){const d=window.balconyLayoutDebug;if(window.balconyCareDebug.maintenance)window.balconyCareDebug.setMaintenance(false);d.setHamper(d.state.hamper?0:1);}else if(key==='tools'){const d=window.balconyCareDebug;d.setDoorOpen(!d.doorOpen);}else if(key==='robot'){const d=window.balconyCareDebug;d.setRobotOut(!d.robotOut);}else if(key==='maintenance'){const d=window.balconyCareDebug;d.setMaintenance(!d.maintenance);}else{const d=window.tvDisplayDebug;d.setDisplayOpen(!d.state.displayOpen);}syncBalconyActions();dirty=true;renderer.shadowMap.needsUpdate=true;};laundryActions.append(b);
 }
 host.append(laundryActions);
 window.kitchenDetailsDebug=reviseKitchen(house);
 const kitchenActions=document.createElement('div');kitchenActions.id='kitchenActions';kitchenActions.hidden=true;
 for(const [key,label] of [['prep','餐具抽屉'],['pots','锅具抽屉'],['sink','水槽检修'],['reset','收好柜门']]){
  const b=document.createElement('button');b.dataset.kitchenAction=key;b.textContent=label;b.onclick=()=>{
   const d=window.kitchenDetailsDebug;
   if(key==='reset'){d.reset();visit('kitchen');}
   else if(key==='sink'){d.setDrawer(-1);d.setSinkDoors(!d.state.sinkDoors);if(d.state.sinkDoors)focusFacility(roomFacilities.kitchen.items.find(i=>i.object==='kitchen-sink-service-bay'),false);else visit('kitchen');}
   else{const sequence=key==='prep'?[2,1,0]:[5,6,3,4],next=sequence[(sequence.indexOf(d.state.drawer)+1)%sequence.length];focusFacility(roomFacilities.kitchen.items.find(i=>i.object===d.moving[next].name),false);}
   dirty=true;renderer.shadowMap.needsUpdate=true;
  };kitchenActions.append(b);
 }host.append(kitchenActions);
 // Accepted bathroom mounted below; no legacy shower enclosure.
 window.publicBathDetailsDebug=revisePublicBath(house);
 window.tvDisplayDebug=reviseTVDisplay(house);
 window.balconyLayoutDebug=reviseBalcony(house,window.laundryDetailsDebug);
 
 const publicBathActions=document.createElement('div');publicBathActions.id='publicBathActions';publicBathActions.hidden=true;
 for(const [key,label] of [['window','移窗通风'],['storage','备品柜'],['hatch','吊顶检修'],['dry','外置洗漱'],['reset','全部收好']]){
  const b=document.createElement('button');b.dataset.publicBathAction=key;b.textContent=label;b.onclick=()=>{
   const d=window.publicBathDetailsDebug;
   if(key==='reset'){d.reset();visit('bath1');}
   else if(key==='dry')focusFacility(roomFacilities.bath1.items.find(i=>i.object==='bath1-vanity'),false);
   else if(key==='shower'){d.setShower(!d.door.userData.open);focusFacility(roomFacilities.bath1.items.find(i=>i.object==='bath1-shower-door'),false);}
   else if(key==='window'){d.setWindow(d.state.window?0:1);focusFacility(roomFacilities.bath1.items.find(i=>i.object==='window-bath1-3'),false);}
   else if(key==='storage'){if(d.state.storage){d.setStorage(0);visit('bath1');}else focusFacility(roomFacilities.bath1.items.find(i=>i.object==='bath1-shallow-storage'),false);}
   else if(key==='hatch'){if(d.state.hatch){d.setHatch(0);visit('bath1');}else focusFacility(roomFacilities.bath1.items.find(i=>i.object==='bath1-removable-ceiling-panel'),false);}
   dirty=true;renderer.shadowMap.needsUpdate=true;
  };publicBathActions.append(b);
 }host.append(publicBathActions);
 window.balconyDryingDebug=addBalconyDrying(house);
 const bedroomRevision=applyBedroomRevision(house);window.bedroomRevisionDebug=bedroomRevision;
 entryRevision=applyEntryRevision(house);window.entryRevisionDebug=entryRevision;
 window.familyDisplayDebug=addFamilyDisplay(house,decorAssets);
 const familyButton=document.createElement('button');familyButton.textContent='石材餐边柜 · 检修浅柜与端景';familyButton.id='familyDisplayView';
 familyButton.onclick=()=>{visit('passageArt');document.querySelector('#facilities').open=false;};
 document.querySelector('.guide-quick').append(familyButton);
 const serviceActions=document.createElement('div');serviceActions.id='entryServiceActions';serviceActions.hidden=true;
 serviceActions.innerHTML='<span>梁前约700mm · 梁宽/箱高待复尺</span><details><summary>检修开合演示</summary><div class="service-buttons"></div><p>原箱门示意为右铰链；现场开启端待核。检修时需占用部分走廊。</p><a href="entry-corridor-review.html?v=sideboard-depth-40-10">原户型与整墙尺寸 ↗</a></details>';
 const syncServiceButtons=()=>serviceActions.querySelectorAll('[data-service-box]').forEach(b=>{const open=window.familyDisplayDebug.userData.serviceState[b.dataset.serviceBox][b.dataset.serviceLayer];b.setAttribute('aria-pressed',String(open));b.textContent=(open?'关闭':'打开')+(b.dataset.serviceBox==='upper'?'上':'下')+(b.dataset.serviceLayer==='cover'?'饰面':'原箱门');});
 for(const id of ['upper','lower'])for(const layer of ['cover','original']){
  const b=document.createElement('button');b.dataset.serviceBox=id;b.dataset.serviceLayer=layer;
  b.onclick=()=>{const open=!window.familyDisplayDebug.userData.serviceState[id][layer];setFamilyServiceOpen(window.familyDisplayDebug,id,open,layer==='original');syncServiceButtons();dirty=true;renderer.shadowMap.needsUpdate=true;};serviceActions.querySelector('.service-buttons').append(b);
 }
 syncServiceButtons();host.append(serviceActions);
 const bedroomActions=document.createElement('div');bedroomActions.id='bedroomActions';bedroomActions.hidden=true;
 for(const [room,key,label] of [['bed1','elderStorage','床箱收纳'],['bed1','elderDoors','打开衣柜'],['bed3','childDoors','打开衣柜'],['bed3','childChair','拉出学习椅'],['bed3','childDrawer','文具抽屉'],['bed3','childStorage','床箱收纳']]){
  const button=document.createElement('button');button.dataset.room=room;button.dataset.bedroomAction=key;button.textContent=label;button.setAttribute('aria-pressed','false');button.onclick=()=>{bedroomRevision.set(key,!bedroomRevision.state[key]);button.setAttribute('aria-pressed',String(bedroomRevision.state[key]));button.textContent=bedroomRevision.state[key]?'收回 · '+label:label;dirty=true;renderer.shadowMap.needsUpdate=true;};bedroomActions.append(button);
 }
 host.append(bedroomActions);
 const dryActions=document.createElement('div');dryActions.id='dryStorageActions';dryActions.hidden=true;
 for(const [key,label] of [['storage','台盆柜移门'],['mirror','镜柜移门'],['plan','干区尺寸']]){const b=document.createElement('button');b.dataset.dryAction=key;b.textContent=label;b.setAttribute('aria-pressed','false');b.onclick=()=>{if(key==='plan'){document.querySelector('#dryPlanButton').click();return;}if(!dryControls)return;const open=!dryControls.state[key==='storage'?'storageOpen':'mirrorOpen'];dryControls[key==='storage'?'setStorage':'setMirror'](open);b.setAttribute('aria-pressed',String(open));focusFacility({object:'bath1-vanity',label:'公卫外置干区',note:'横向移门不占通道；安装及给排水仍待核。',position:[3.85,1.55,5.98]},false);document.querySelector('#facilities').open=false;dirty=true;renderer.shadowMap.needsUpdate=true;};dryActions.append(b);}host.append(dryActions);
 const returnToBath=document.createElement('button');returnToBath.dataset.dryAction='inside';returnToBath.textContent='回到公卫';returnToBath.onclick=()=>visit('bath1');dryActions.append(returnToBath);
 wireLivingLayout(house,event=>{if(event?.focusDrawer){station='dining';focusFacility(roomFacilities.dining.items.find(i=>i.object==='island-storage-carcass'),false);document.querySelector('#facilities').open=false;}if(event?.focusSeats)visit(event.seatIndex>=0&&event.seatIndex<4?'bar':'dining');dirty=true;renderer.shadowMap.needsUpdate=true;});
 const powerActions=document.createElement('div');powerActions.id='barPowerActions';powerActions.style.cssText='position:absolute;left:14px;top:58px;z-index:8';powerActions.hidden=true;
 const powerButton=document.createElement('button');powerButton.id='barPowerToggle';powerButton.textContent='打开桌面电源盖';powerButton.onclick=()=>{barPowerDebug.setOpen(!barPowerDebug.open);powerButton.textContent=barPowerDebug.open?'收起电源盖':'打开桌面电源盖';station='bar';focusFacility(roomFacilities.bar.items.find(i=>i.object==='bar-power-right'),false);document.querySelector('#facilities').open=false;dirty=true;renderer.shadowMap.needsUpdate=true;};powerActions.append(powerButton);document.querySelector('#viewport').append(powerActions);
 powerActions.style.maxWidth='calc(100% - 28px)';
 const swivelButton=document.createElement('button');swivelButton.id='barSwivelToggle';swivelButton.textContent='吧椅转向';let swivelIndex=-1;
 swivelButton.onclick=()=>{swivelIndex=(swivelIndex+1)%5;livingLayoutDebug.seatsUse.set(swivelIndex===4?'stored':'stand',swivelIndex);swivelButton.textContent=swivelIndex===4?'吧椅转向':swivelIndex===3?'吧椅归位':'转第'+(swivelIndex+2)+'席';visit('bar');};powerActions.append(swivelButton);
 const careActions=document.createElement('div');careActions.id='balconyCareActions';careActions.hidden=true;careActions.style.cssText='position:absolute;left:10px;top:106px;z-index:8;display:flex;flex-wrap:wrap;gap:5px';
 const robotButton=document.createElement('button');robotButton.id='careRobotDemo';robotButton.textContent='机器人驶出示意';const doorButton=document.createElement('button');doorButton.id='careDoorDemo';doorButton.textContent='抽拉长物挂架';careActions.append(robotButton,doorButton);document.querySelector('#viewport').append(careActions);
 robotButton.onclick=()=>{const c=window.balconyCareDebug;c.setRobotOut(!c.robotOut);robotButton.textContent=c.robotOut?'机器人归位':'机器人驶出示意';visit('care');dirty=true;renderer.shadowMap.needsUpdate=true;};
 doorButton.onclick=()=>{const c=window.balconyCareDebug;c.setDoorOpen(!c.doorOpen);doorButton.textContent=c.doorOpen?'收回长物挂架':'抽拉长物挂架';visit('care');dirty=true;renderer.shadowMap.needsUpdate=true;};
 const maintenance=document.createElement('button');maintenance.id='careMaintenance';maintenance.textContent='基站检修示意';maintenance.setAttribute('aria-pressed','false');careActions.append(maintenance);
 maintenance.onclick=()=>{const c=window.balconyCareDebug;c.setMaintenance(!c.maintenance);maintenance.setAttribute('aria-pressed',String(c.maintenance));maintenance.textContent=c.maintenance?'收回检修盒':'基站检修示意';focusFacility({object:'balcony-robot-dock',label:'停机检修 · 概念动作',position:[10.5,.85,.50],note:'盆下上下水基站必须支持前维护：前板翻到检修位后，耗材盒前抽200mm；不是开顶盖。柜后管线为占位，机型与水电接入待核。'},false);document.querySelector('#facilities').open=false;dirty=true;renderer.shadowMap.needsUpdate=true;};
 const dryingActions=document.createElement('div');dryingActions.id='dryingActions';dryingActions.hidden=true;
 for(const [key,label] of [['lower','降下衣杆'],['load','挂衣遮景示意']]){const b=document.createElement('button');b.dataset.dryingAction=key;b.textContent=label;b.setAttribute('aria-pressed','false');b.onclick=()=>{const d=window.balconyDryingDebug;if(key==='lower')d.setFraction(d.state.fraction>.5?0:1);else d.setLoaded(!d.state.loaded);b.setAttribute('aria-pressed',String(key==='lower'?d.state.fraction>.5:d.state.loaded));b.textContent=key==='lower'?(d.state.fraction>.5?'升起衣杆':label):(d.state.loaded?'取下衣物':label);dirty=true;renderer.shadowMap.needsUpdate=true;};dryingActions.append(b);}
 const dryingNote=document.createElement('small');dryingNote.textContent='双杆2m · 12件示意 · 左侧留景，挂衣时右侧会遮景';dryingActions.append(dryingNote);host.append(dryingActions);

 house.updateMatrixWorld(true);for(const name of ['lake-bar-left','lake-bar-right'])for(const child of house.getObjectByName(name).children.filter(c=>c.visible&&c.name.startsWith('upholstered-counter-stool'))){const b=new T.Box3().setFromObject(child);seatAudit.push({wing:name,visible:child.visible,min:b.min.toArray(),max:b.max.toArray()});}
 roof=house.getObjectByName('客厅双眼皮外层')?.parent;
 facilityObjects=Object.values(roomFacilities).flatMap(r=>r.items).map(i=>({name:i.object,exists:Boolean(house.getObjectByName(i.object))}));
 const pixels=env.image.data,moved=new pixels.constructor(pixels.length),row=env.image.width*4,half=row/2;for(let y=0;y<env.image.height;y++){const i=y*row;moved.set(pixels.subarray(i+half,i+row),i);moved.set(pixels.subarray(i,i+half),i+half);}env.image.data=moved;env.needsUpdate=true;env.mapping=T.EquirectangularReflectionMapping;scene.background=env;scene.environment=env;
 environment=env;ambient=new T.HemisphereLight('#f3f6fa','#c5c1b9',1.05);scene.add(ambient);const sun=new T.DirectionalLight('#fff2db',1.4);daySun=sun;sun.position.set(-2,11,-7);sun.target.position.set(9,0,3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.1,far:40});sun.shadow.bias=-.00015;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
 setLighting();
 ready=true;busy.hidden=true;
 const initialStation=station;

 chooseDryOption('integrated');addSkirting(house);
 window.hvacDetailsDebug=reviseHVAC(house);
 window.tileSurfacesDebug=installTileSurfaces(house);
 window.tablewareDetailsDebug=refineTableware(house);
 window.curtainDetailsDebug=refineCurtains(house);
 curtainControls=wireCurtainControls({design:window.curtainDetailsDebug,host,state:()=>({station,mode}),focus:(room,item)=>{station=room;focusFacility(item,false);document.querySelector('#facilities').open=false;},changed:()=>{dirty=true;renderer.shadowMap.needsUpdate=true;}});
 wireTileControls({design:window.tileSurfacesDebug,focus:(room,item)=>{station=room;focusFacility(item,false);document.querySelector('#facilities').open=false;}});
 hvacControls=wireHVACControls({design:window.hvacDetailsDebug,host,state:()=>({station,mode}),beforeOpen:room=>{if(room==='living')window.sideboardDetailsDebug.reset();},focus:(room,item)=>{station=room;focusFacility(item,false);document.querySelector('#facilities').open=false;},changed:()=>{dirty=true;renderer.shadowMap.needsUpdate=true;}});
 lightingDesign=createLightingDesign(house,scene);window.lightingDesignDebug=lightingDesign;
 daySun.shadow.autoUpdate=false;daylightDesign=createDaylightDesign(house,scene,{onGeometryChange:()=>daySun.shadow.needsUpdate=true});window.daylightDesignDebug=daylightDesign;
 // Grazing window light otherwise produces self-shadow stripes on the ceiling.
 for(const light of daylightDesign.pool){light.shadow.bias=-.0007;light.shadow.normalBias=.03;}
 if(new URLSearchParams(location.search).get('daylight')==='baked-child'){ready=false;busy.hidden=false;bakedWallStudy=await applyBakedWallStudy(house);window.bakedWallDebug=bakedWallStudy;ready=true;busy.hidden=true;}
 wireLightingControls({design:lightingDesign,room:()=>facilityRoom(station),onPreset:chooseLightingPreset,onFixture:(id,on)=>{lightingDesign.setFixture(id,on);dirty=true;renderer.shadowMap.needsUpdate=true;},focus:s=>{
  station=s.room==='balcony'?'bar':s.room;
  const position=targets[station].position;
  focusFacility({object:s.fixture,label:s.label,position,note:`${s.kelvin}K / ${s.lumens}lm / ${s.beam}° 为选型目标；${s.watts}。灯具检查机位，非保证可站人位置；型号、驱动检修和照度待核。`},false);document.querySelector('#facilities').open=false;
 }});
 setLighting();
 const accepted=await integrateAcceptedSuite(house);window.acceptedSuite=accepted;window.acceptedChild=integrateAcceptedChild(house);
 document.querySelectorAll('[data-bedroom-action][data-room="bed3"]').forEach(b=>b.hidden=true);
 document.querySelectorAll('[data-master-dressing],[data-dressing-option]').forEach(b=>{b.hidden=true;});
 document.querySelector('#masterDressing').hidden=true;
 interiorMirrors=createInteriorMirrors(house);window.interiorMirrorsDebug=interiorMirrors;
 previewSurfaces=refinePreviewSurfaces(house,renderer);
 if(new URLSearchParams(location.search).get('shadowCache')!=='off'){staticSunShadow=createStaticSunShadow(house,daySun);window.staticSunShadowDebug=staticSunShadow;}
 station=initialStation;
 facilityObjects=Object.values(roomFacilities).flatMap(r=>r.items).map(i=>({name:i.object,exists:Boolean(house.getObjectByName(i.object))}));
 walker=createWalkController({model:house,camera,host,canvas,onChange:()=>{dirty=true;renderer.shadowMap.needsUpdate=true;},onExit:()=>{const p=camera.position.clone(),r=camera.rotation.clone();setMode('look');camera.position.copy(p);camera.rotation.copy(r);yaw=r.y;pitch=r.x;dirty=true;}});window.walkDebug=walker.debug;
 immersivePreview=wireImmersivePreview({host,canvas,renderer,composer,ao,look:immersiveLook,walk:walker,setMode,state:()=>({mode}),resize:resizePreview,relight:setLighting,capture:()=>{captureFrame=true;dirty=true;}});setLighting();
 window.immersivePreviewDebug={get state(){return {...immersivePreview.state,surfaces:previewSurfaces,look:immersiveLook.state,draws,lastCapture};}};
 mobileNavigation=wireMobileNavigation({visit,focus:focusFacility,state:()=>({station,mode}),facilities:roomFacilities,roomOf:facilityRoom,model:houseModel,walk:()=>setMode('walk'),selectRoomView});
 viewerFocus=wireViewerFocus({state:()=>({station,mode})});
 const query=new URLSearchParams(location.search);if(targets[query.get('space')])station=query.get('space');lookAtStation();setMode(['look','walk','layout','orbit','top','plan'].includes(query.get('mode'))?query.get('mode'):mode);
 if(query.has('angle'))selectRoomView(query.get('angle'));
 if(query.get('focus')==='tv'){station='living';focusFacility(roomFacilities.living.items.find(i=>i.object==='recessed-tv-black-side-reveals'),false);document.querySelector('#facilities').open=false;}
 if(query.get('focus')==='sideboard'){station='cabinet';focusFacility(roomFacilities.dining.items.find(i=>i.object==='flush-sideboard'),false);document.querySelector('#facilities').open=false;}
 if(query.get('focus')==='family')document.querySelector('#familyDisplayView')?.click();
 if(query.get('focus')==='squat'){station='bath1';focusFacility(roomFacilities.bath1.items[0],false);document.querySelector('#facilities').open=false;}
 if(query.get('focus')==='entry'){station='entry';focusFacility(roomFacilities.entry.items[0],false);document.querySelector('#facilities').open=false;}
 if(query.get('focus')==='master-vanity'){station='bath2';focusFacility(roomFacilities.bath2.items.find(i=>i.object==='bath2-vanity'),false);document.querySelector('#facilities').open=false;}
 if(query.get('focus')==='wardrobe'){station='master';focusFacility(roomFacilities.master.items.find(i=>i.object==='master-entry-wardrobe'),false);document.querySelector('#facilities').open=false;}
 if(query.get('focus')==='public-vanity'){station='bath1';focusFacility(roomFacilities.bath1.items.find(i=>i.object==='bath1-vanity'));document.querySelector('#facilities').open=false;}
 buildLocatorPlan();if(query.get('guide')==='1')spaceGuide.showModal();
 if(['original','deep','slim','offset','integrated'].includes(query.get('dry')))chooseDryOption(query.get('dry'));
  
 if(query.get('focus')==='door'){const item=roomFacilities[facilityRoom(station)].items.find(i=>i.object.startsWith('door-'));if(item){focusFacility(item);document.querySelector('#facilities').open=false;}}
 if(query.get('focus')==='window'){const item=roomFacilities[facilityRoom(station)].items.find(i=>i.object.startsWith('window-'));if(item){focusFacility(item);document.querySelector('#facilities').open=false;}}
 window.columnCheck={oldDistance:.29,newDistance:correction.approxDistance,clearDepth:correction.clearDepth,pendingFurniture:false,dimensionStatus:'1450mm用户指定试排值，非复尺'};
 if(query.get('daylight')==='surface-baked'){
  const {applySurfaceLightmaps}=await import('./surface-lightmaps.js');
  surfaceLightmaps=await applySurfaceLightmaps(house);window.surfaceLightmapsDebug=surfaceLightmaps;surfaceLightmaps.setEnabled(!night);dirty=true;
 }
 }catch(error){busy.textContent='三维预览加载失败：'+error.message+'。可切换 2D 对照；请刷新重试。';console.error(error);}}
function selectedIsVisible(){
 if(!selectedFacility)return null;const object=houseModel.getObjectByName(selectedFacility),points=[new T.Box3().setFromObject(object).getCenter(new T.Vector3())];
 const belongsToTarget=mesh=>{for(let o=mesh;o;o=o.parent)if(o===object)return true;return false;};
 // Groups can have empty space between ornaments; sample their real meshes as well.
 object.traverse(o=>{if(o.isMesh)points.push(new T.Box3().setFromObject(o).getCenter(new T.Vector3()));});camera.updateMatrixWorld();
 if(selectedFocusPoint)points.unshift(selectedFocusPoint.clone());
 // A rug's centre is intentionally under the coffee table. Test exposed surface
 // samples too; each ray must still hit the real target mesh first.
 if(selectedFacility==='living-area-rug'){const b=new T.Box3().setFromObject(object);for(const x of [.2,.5,.8])for(const z of [.2,.5,.8])points.push(new T.Vector3(T.MathUtils.lerp(b.min.x,b.max.x,x),b.max.y,T.MathUtils.lerp(b.min.z,b.max.z,z)));}
 // The shifted laundry cabinet legitimately covers the side wall's centre.
 // Sample its exposed real face; every accepted ray must still hit the wall first.
 if(selectedFacility.startsWith('balcony-solid-')){const b=new T.Box3().setFromObject(object),x=selectedFacility.endsWith('left')?b.max.x:b.min.x;for(const y of [.2,.5,.8,.95])for(const z of [.05,.15,.5,.85,.95])points.push(new T.Vector3(x,T.MathUtils.lerp(b.min.y,b.max.y,y),T.MathUtils.lerp(b.min.z,b.max.z,z)));}
 return points.some(point=>{const projected=point.clone().project(camera);if(Math.abs(projected.x)>1||Math.abs(projected.y)>1||projected.z<-1||projected.z>1)return false;const ray=new T.Raycaster(camera.position,point.sub(camera.position).normalize());const hit=ray.intersectObject(houseModel,true).find(h=>{const m=h.object.material;for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return h.object.isMesh&&!Array.isArray(m)&&(!(m.transparent&&m.opacity<.3)||belongsToTarget(h.object))&&renderer.clippingPlanes.every(p=>p.distanceToPoint(h.point)>=-.0001);});return belongsToTarget(hit?.object);});
}
init();window.columnViewDebug={visit,setMode,invalidate(){dirty=true;renderer.shadowMap.needsUpdate=true;},get state(){const p=scene.getObjectByName('retained-balcony-column'),floor=scene.getObjectByName('800x800-straight-tile-floor');return {ready,mode,station,tour,targets,seatAudit,facilityObjects,selectedFacility,selectedVisible:selectedIsVisible(),night,finishScheme,palette,lights:ceilingFixtures.map(s=>({id:s.id,exists:Boolean(scene.getObjectByName(s.id)),kelvin:s.kelvin})),floorRoughness:floor?.material.roughness,tilePitch:floor?.userData.tilePitch,clipPlanes:renderer.clippingPlanes.length,draws,position:camera.position.toArray(),rotation:camera.rotation.toArray().slice(0,3),fov:camera.fov,column:p?.getWorldPosition(new T.Vector3()).toArray(),hiddenSeats,roofVisible:roof?.visible,wide:document.querySelector('main').classList.contains('wide')};}};
window.roomViewsDebug={views:roomViewpoints,select:selectRoomView,get active(){return activeRoomView?.id||null;},get camera(){return camera;}};
Object.defineProperty(window,'loadedWindowAudit',{get(){const output=[];houseModel?.updateMatrixWorld(true);houseModel?.traverse(o=>{if(o.visible&&o.userData.id?.startsWith('W0')&&o.userData.room){const b=new T.Box3();o.traverseVisible(mesh=>{if(mesh.isMesh&&mesh.name.includes('glass'))b.union(new T.Box3().setFromObject(mesh));});if(!b.isEmpty())output.push({name:o.name,...o.userData,glassMinY:b.min.y,glassMaxY:b.max.y});}});return output;}});
Object.defineProperty(window,'loadedDoorAudit',{get(){const output=[];houseModel?.updateMatrixWorld(true);houseModel?.traverse(o=>{if(typeof o.userData.turn==='number')output.push({name:o.name,...o.userData,direction:new T.Vector3(1,0,0).transformDirection(o.matrixWorld).toArray()});});return output;}});
Object.defineProperty(window.columnViewDebug,'dryStudy',{get(){return {key:dryOption,spec:drySpec,model:houseModel,controls:dryControls};}});
Object.defineProperty(window,'masterDressingDebug',{get(){return {controller:masterDressing,model:houseModel,status:masterDressing.status};}});
