import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {addBedding} from './textile-details.js?v=matte-fabric-2';
import {addGroundedPlinth,groundVerticalLeg} from './furniture-floor-supports.js';
import {finishWoodPanel} from './cabinet-finishes.js';


const acceptedElder=await(await fetch(new URL('./elder-redesign/original-3d.json',import.meta.url))).json();
const elderOrigin=[.8,2.47]; // P([122,367]); retain the full-house shell, no wall scaling.
const acceptedBed=acceptedElder.bed,acceptedWardrobe=acceptedElder.wardrobe;

// All values in metres. Furniture changes only; no walls/doors/windows are moved.
export const bedroomDesign={
 elder:{bed:{position:[elderOrigin[0]+(acceptedBed[0]+acceptedBed[2])/2,0,elderOrigin[1]+(acceptedBed[1]+acceptedBed[3])/2],rotation:Math.PI/2,mattress:1.5,mattressLength:1.8,frame:1.54,length:1.83},wardrobe:{position:[elderOrigin[0]+(acceptedWardrobe[0]+acceptedWardrobe[2])/2,0,elderOrigin[1]+acceptedWardrobe[3]],rotation:Math.PI,width:1.8,depth:.4,height:2.4,shallow:true}},
 child:{bed:{position:[16.43,0,5.15],rotation:-Math.PI/2,mattress:1.2,frame:1.26,length:2.05},wardrobe:{position:[16.42,0,7.11],rotation:Math.PI,width:2.10,depth:.60,height:2.60},desk:{position:[14.72,0,4.51],width:1.30,depth:.60,height:.75},chair:{position:[15.02,0,5.00],width:.50,depth:.50,pull:.45}}
};
const mat=(color,roughness=.7,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const materials={oak:mat('#b6a18a'),inside:mat('#cbb89c'),front:mat('#c9c6bb'),white:mat('#e8e3d7'),linen:mat('#d2cbbd',.94),fabric:mat('#979c8e',.98),metal:mat('#535d57',.4,.6),led:new T.MeshStandardMaterial({color:'#fff7e8',emissive:'#fff1d8',emissiveIntensity:.8}),black:mat('#2f3431',.6)};
// Reuse the project's attributed CC0 textures, served locally on PC and phone.
const loader=new T.TextureLoader();
const texture=(path,color=false)=>{const t=loader.load(path);t.wrapS=t.wrapT=T.RepeatWrapping;if(color)t.colorSpace=T.SRGBColorSpace;return t;};
materials.oak.normalMap=texture('./assets/wood-normal.jpg');materials.oak.normalScale.set(.16,.16);materials.oak.roughnessMap=texture('./assets/wood-rough.jpg');materials.oak.color.set('#b5a088');
const weave=texture('./assets/fabric-normal.jpg');for(const key of ['fabric','linen']){materials[key].normalMap=weave;materials[key].normalScale.set(.12,.12);}
function box(parent,name,x,y,z,w,h,d,material=materials.oak,r=.004){
 const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/6,h/6,d/6)),material);o.name=name;o.position.set(x,y+h/2,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(material===materials.oak||material===materials.inside)finishWoodPanel(o,{interior:material===materials.inside});return o;
}
function tube(parent,name,from,to,r,material=materials.metal){const a=new T.Vector3(...from),b=new T.Vector3(...to),o=new T.Mesh(new T.CylinderGeometry(r,r,a.distanceTo(b),16),material);o.name=name;o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());o.castShadow=true;parent.add(o);return o;}
function placed(root,name,position,rotation=0){const g=new T.Group();g.name=name;g.position.fromArray(position);g.rotation.y=rotation;root.add(g);return g;}
function cabinet(root,name,s){
 const g=placed(root,name,s.position,s.rotation||0),w=s.width,d=s.depth,h=s.height;
 box(g,name+'-back',0,.08,.009,w,h-.08,.018,materials.inside);
 for(const x of [-w/2+.009,w/2-.009])box(g,name+'-side',x,.08,d/2,.018,h-.08,d);
 for(const y of [.08,h-.018])box(g,name+'-shelf',0,y,d/2,w-.036,.018,d-.036,materials.inside);
 const bottom=g.children.find(o=>o.name===name+'-shelf');
 addGroundedPlinth(g,bottom,{name:name+'-floor-support'});
 const bays=Math.max(1,Math.ceil(w/.75)),bay=w/bays;
 for(let i=0;i<bays;i++){
  const x=-w/2+(i+.5)*bay;
  if(i)box(g,name+'-partition',-w/2+i*bay,.10,d/2,.018,h-.13,d-.07,materials.inside);
  const shelfYs=h>1?[.42,1.95]:[.25];
  for(const y of shelfYs)if(y<h-.04)box(g,name+'-shelf',x,y,d/2,bay-.034,.018,d-.065,materials.inside);
  if(h>1&&!s.shallow){
   tube(g,name+'-hanging-rail',[x-bay/2+.03,1.77,d*.48],[x+bay/2-.03,1.77,d*.48],.012);
   for(let j=0;j<4;j++){
    const shirt=placed(g,name+'-shirt-'+i+'-'+j,[x-bay*.30+j*bay*.20,1.17,d*.48]),span=Math.min(.20,(d-.12)/2);
    box(shirt,'hanging-shirt-body',0,0,0,.024,.43,span*2,j%2?materials.white:materials.fabric,.012);
    tube(shirt,'hanger',[0,.60,0],[0,.43,-span],.005);tube(shirt,'hanger',[0,.43,-span],[0,.43,span],.005);tube(shirt,'hanger',[0,.43,span],[0,.60,0],.005);
   }
  }
  if(s.shallow&&i===0)tube(g,name+'-front-to-back-hanging-rail',[x,1.77,.075],[x,1.77,d-.09],.010);
  if(s.shallow&&i>0)for(const y of [.78,1.16,1.54])box(g,name+'-daily-folding-shelf',x,y,d*.45,bay-.034,.018,d-.085,materials.inside);
  for(let j=0;j<2;j++)box(g,name+'-folded-linen',x,.105+j*.05,d*.44,Math.min(.40,bay-.07),.045,d*.54,j%2?materials.fabric:materials.linen,.01);
 }
 // Sliding fronts stay within the footprint; open poses reveal real shelves.
 const n=s.shallow?2:(w>1?3:2),panelW=w/n+.012,panels=[];
 for(let i=0;i<n;i++){
  const x=-w/2+(i+.5)*w/n,z=d-.014-(i%2)*.023;
  const panel=box(g,name+'-sliding-door-'+i,x,.10,z,panelW,h-.125,.018,materials.front);
  box(panel,name+'-recessed-finger-edge',panelW/2-.022,-(h-.125)/2+.025,.012,.008,h-.18,.004,materials.metal,.001);
  panels.push({panel,x});
 }
 for(const y of [.088,h-.032])box(g,name+'-track',0,y,d-.027,w-.024,.012,.061,materials.metal,.001);
 const setOpen=open=>{panels.forEach(({panel,x},i)=>panel.position.x=open?(i===0?x+w/n-.035:x):x);g.updateMatrixWorld(true);};
 g.userData={width:w,depth:d,height:h,mechanism:'sliding',antiTipRequired:true,hardwareVerified:false};
 return {group:g,setOpen};
}
function bed(root,name,s,source){
 const g=placed(root,name,s.position,s.rotation),w=s.frame,l=s.length;
 const inside=placed(g,name+'-storage',[0,0,0]);
 // A real box base, not a solid slab masquerading as storage.
 const bottom=box(inside,name+'-storage-bottom',0,.075,0,w-.055,.018,l-.07,materials.inside);
 addGroundedPlinth(g,bottom,{name:name+'-floor-support'});
 for(const x of [-w/2+.012,w/2-.012])box(inside,name+'-frame-side',x,.09,0,.024,.26,l,materials.oak,.009);
 for(const z of [-l/2+.012,l/2-.012])box(inside,name+'-frame-end',0,.09,z,w-.048,.26,.024,materials.oak,.007);
 box(inside,name+'-storage-divider',0,.093,0,.018,.247,l-.06,materials.inside);
 for(const x of [-w*.24,w*.24])for(const z of [-.48,.38])box(inside,name+'-storage-bag',x,.094,z,w*.38,.17,.58,z>0?materials.linen:materials.fabric,.03);
 const lift=placed(g,name+'-lift',[0,.35,-l/2+.025]);
 const localZ=s.mattressLength?l/2-.025:l/2;
 box(lift,name+'-deck',0,-.018,localZ,w-.04,.018,l-.065,materials.inside);
 const linen=source?.children[1]?.material?.clone()||materials.linen;
 const mattress=box(lift,name+'-mattress',0,.01,localZ,s.mattress,.23,s.mattressLength||2.00,linen,.052);
 addBedding(lift,{name,width:s.mattress,lengthScale:(s.mattressLength||2)/2,centerZ:localZ,mattressTop:.24,seed:name==='bed1-bed'?3:5,color:name==='bed1-bed'?'#b9b09f':'#9da99d',mattress});
 box(g,name+'-headboard',0,.35,-l/2+.015,s.frame+(s.mattressLength?0:.02),.81,.03,(s.mattressLength?new T.MeshStandardMaterial({color:'#c6bbaa',roughness:.95}):materials.fabric),.007);
 for(const x of [-w*.40,w*.40]){
  const hinge=placed(g,name+'-gas-stay',[x,.20,-.45]);tube(hinge,'gas-stay-body',[0,0,0],[0,.09,.29],.014);tube(hinge,'gas-stay-rod',[0,.09,.29],[0,.13,.42],.006);
 }
 // Forward-translating lift envelope: a simple fixed-axis hinge hits the headboard.
 // This path is a hardware selection requirement, not a certified linkage.
 const setFraction=value=>{const angle=T.MathUtils.clamp(value,0,1)*.65;lift.rotation.x=-angle;lift.position.z=-l/2+.025+.25*Math.sin(angle);g.updateMatrixWorld(true);};
 const setOpen=open=>setFraction(open?1:0);
 g.userData={mattress:[s.mattress,s.mattressLength||2],frame:[w,l],headboard:'30mm padded panel',storage:'forward-translating lift; no projecting drawers',maxLiftTranslation:.25*Math.sin(.65),productVerified:false,mechanismVerified:false};
 return {group:g,setOpen,setFraction,lift};
}
function addReading(root){
 const lamps=placed(root,'elder-bedhead-reading-lights',[0,0,0]);
 for(const z of [3.43,4.53]){
  box(lamps,'elder-reading-base',.843,1.14,z,.018,.11,.065,materials.metal);
  tube(lamps,'elder-reading-arm',[.85,1.2,z],[.92,1.20,z],.012);
  box(lamps,'elder-reading-diffuser',.934,1.11,z,.038,.06,.055,materials.led);
  box(lamps,'elder-bedside-switch',.837,.88,z,.004,.075,.075,materials.front);
 }
 return lamps;
}
export function applyBedroomRevision(model){
 if(model.getObjectByName('bedroom-design-revision'))throw Error('Bedroom revision must only be applied once');
 const source1=model.getObjectByName('bed1-bed'),source3=model.getObjectByName('bed3-bed');
 const root=placed(model,'bedroom-design-revision',[0,0,0]);
 for(const name of ['bed1-bed','bed1-wardrobe','bed1-desk','bed1-desk-everyday','bed3-bed','bed3-wardrobe','bed3-desk','bed3-desk-everyday']){
  const old=model.getObjectByName(name);if(!old)throw Error('Missing baseline '+name);old.visible=false;old.name+='-baseline';
 }
 const {elder,elderWardrobe}=buildAcceptedElder(root,source1);
 const child=bed(root,'bed3-bed',bedroomDesign.child.bed,source3),childWardrobe=cabinet(root,'bed3-wardrobe',bedroomDesign.child.wardrobe);
 const s=bedroomDesign.child.desk,desk=placed(root,'bed3-desk',s.position);
 box(desk,'child-desk-top',0,.71,s.depth/2,s.width,.04,s.depth,materials.oak,.012);
 for(const [i,x] of [-s.width/2+.012,s.width/2-.012].entries()){const panel=box(desk,'child-desk-support',x,.02,s.depth/2,.024,.69,s.depth-.03,materials.oak,.005);groundVerticalLeg(panel,{name:'child-desk-floor-glide-'+i});finishWoodPanel(panel,{refresh:true});}
 const drawer=placed(desk,'child-stationery-drawer',[-.43,0,0]);
 box(drawer,'child-drawer-bottom',0,.58,.30,.35,.014,.50,materials.inside);
 for(const x of [-.175,.175])box(drawer,'child-drawer-side',x,.594,.30,.014,.095,.50,materials.inside);
 box(drawer,'child-drawer-front',0,.584,.559,.378,.107,.018,materials.front);
 const daily=placed(desk,'bed3-desk-everyday',[0,.75,0]);
 for(let i=0;i<3;i++)box(daily,'study-book',-.43,.002+i*.029,.20,.26,.025,.30,i===1?materials.fabric:materials.white);
 box(daily,'study-notebook',.15,.002,.33,.32,.008,.24,materials.white);
 tube(daily,'pencil',[.20,.017,.29],[.33,.017,.35],.004,materials.metal);
 box(daily,'study-lamp-base',.43,0,.16,.12,.018,.12,materials.metal,.02);
 tube(daily,'study-lamp-stem',[.43,.018,.16],[.43,.40,.16],.012);
 tube(daily,'study-lamp-arm',[.43,.40,.16],[.12,.40,.22],.012);
 box(daily,'study-lamp-diffuser',.23,.378,.20,.25,.018,.052,materials.led,.006);
 box(desk,'study-cable-tray',0,.60,.06,.62,.05,.08,materials.metal);
 box(desk,'study-power-strip',0,.64,.06,.24,.034,.045,materials.front);
 const cs=bedroomDesign.child.chair,chair=placed(root,'bed3-chair',cs.position);
 box(chair,'child-chair-cushion',0,.42,0,.50,.06,.48,materials.fabric,.035);
 box(chair,'child-chair-back',0,.48,.225,.46,.34,.045,materials.fabric,.02);
 let footIndex=0;for(const x of [-.18,.18])for(const z of [-.18,.18]){const leg=tube(chair,'child-chair-leg',[x,.025,z],[x,.425,z],.015);groundVerticalLeg(leg,{name:'child-chair-floor-glide-'+footIndex++,round:true});}
 const state={elderStorage:false,elderDoors:false,childDoors:false,childChair:false,childDrawer:false,childStorage:false};
 const actions={elderStorage:v=>elder.setOpen(v),elderDoors:v=>elderWardrobe.setOpen(v),childDoors:v=>childWardrobe.setOpen(v),childChair:v=>chair.position.z=cs.position[2]+(v?cs.pull:0),childDrawer:v=>drawer.position.z=v?.28:0,childStorage:v=>child.setOpen(v)};
 const set=(key,value)=>{if(!actions[key])throw Error('Unknown bedroom action');state[key]=!!value;actions[key](!!value);root.updateMatrixWorld(true);};
 root.userData={revision:'bedroom-layout-1',constructionApproved:false,elderStorage:'1800×400mm推拉门薄柜＋床箱；主卧补充换季收纳，柜前约510mm未作人体认证',childStorage:'2100mm移门柜＋床箱',design:bedroomDesign};
 model.updateMatrixWorld(true);
 return {root,set,state,design:bedroomDesign,objects:{elder,elderWardrobe,child,childWardrobe,desk,chair,drawer}};
}

function buildAcceptedElder(root,source){
 const elder=bed(root,'bed1-bed',bedroomDesign.elder.bed,source),elderWardrobe=cabinet(root,'bed1-wardrobe',bedroomDesign.elder.wardrobe);
 for(const [i,r] of acceptedElder.nightstands.entries())box(root,'bed1-nightstand-'+i,elderOrigin[0]+(r[0]+r[2])/2,0,elderOrigin[1]+(r[1]+r[3])/2,r[2]-r[0],.48,r[3]-r[1],materials.oak);
 const bay=placed(root,'bed1-raised-bay',[0,0,0]);bay.position.set(...[elderOrigin[0],0,elderOrigin[1]]);
 for(const r of [[-.60,-.59,2.04,0],[-.60,0,0,.70514]])box(bay,'bed1-solid-bay-body',(r[0]+r[2])/2,0,(r[1]+r[3])/2,r[2]-r[0],acceptedElder.bayHeight,r[3]-r[1],materials.white);
 bay.userData={nonDemolishable:true,heightAssumed:true};
 return {elder,elderWardrobe,bay};
}
export function applyAcceptedElderOnly(model){
 const source=model.getObjectByName('bed1-bed');
 for(const name of ['bed1-bed','bed1-wardrobe','bed1-desk']){const o=model.getObjectByName(name);if(o){o.visible=false;o.name+='-baseline';}}
 const root=placed(model,'elder-accepted-revision',[0,0,0]);const result=buildAcceptedElder(root,source);model.updateMatrixWorld(true);return {root,...result};
}
