import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';

// Single-sided entrance ensemble. Door-side seating stays clear of the entry swing.
export function applyEntryRevision(model){
 applyEntrySetbacks(model);
 for(const name of ['flush-entry-cabinet','entry-shoe-bench','entry-dressing-mirror','entry-key-tray','entry-vase-arrangement','entry-daily-slippers']){
  const old=model.getObjectByName(name);if(old){old.visible=false;old.name=name+'-previous-layout';}
 }
 const ensemble=new T.Group();ensemble.name='entry-single-side-layout';model.add(ensemble);
 const material=c=>new T.MeshStandardMaterial({color:c,roughness:.75});
 const white=material('#e3ded3'),wood=material('#ae9273'),dark=material('#716b60'),fabric=material('#c4b7a4');
 const box=(p,name,x,y,z,w,h,d,m)=>{const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.006,w/5,h/5,d/5)),m);o.name=name;o.position.set(x,y+h/2,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
 const cabinet=new T.Group();cabinet.name='flush-entry-cabinet';ensemble.add(cabinet);
 const x0=3.80,x1=5.40,z=6.965;
 for(const x of [x0+.01,4.60,x1-.01])box(cabinet,'entry-new-carcass-side',x,.16,z,.02,2.42,.40,white);
 box(cabinet,'entry-new-back',4.60,.16,7.159,1.60,2.42,.018,wood);
 for(const y of [.045,.37,.58,.79,1.0,1.21,1.42,1.65,1.91,2.18,2.56])box(cabinet,'entry-shoe-shelf',4.60,y,z,1.56,.018,.37,wood);
 // Bottom is an open daily-shoe bay, not a closed plinth.
 for(const x of [4.82,5.00,5.18]){const shoe=new T.Mesh(new T.SphereGeometry(1,20,12),fabric);shoe.name='entry-daily-shoe';shoe.scale.set(.055,.035,.135);shoe.position.set(x,.10,6.94);cabinet.add(shoe);}
 const leaves=[],roots=[];
 // Four 400 mm leaves keep each open-door projection modest.
 for(let i=0;i<4;i++){
  const pivot=new T.Group();pivot.name='entry-new-door-hinge-'+i;pivot.position.set(x0+i*.40,0,6.746);cabinet.add(pivot);
  box(pivot,'entry-new-door-leaf-'+i,.20,.392,0,.396,2.168,.018,white);
  box(pivot,'entry-new-door-pull-'+i,.371,1.08,-.014,.009,.16,.009,dark);
  leaves.push({pivot,sign:1});roots.push(pivot);
 }
 const low=new T.Group();low.name='entry-low-cabinet';ensemble.add(low);
 // Visible bottom shoe slot, middle shoe cupboard, shallow top drawer.
 for(const x of [7.48,7.96])box(low,'entry-low-side',x,.03,6.965,.02,.84,.40,white);
 box(low,'entry-low-back',7.72,.03,7.159,.46,.84,.018,wood);
 for(const y of [.04,.40,.70,.855])box(low,'entry-low-shelf',7.72,y,6.965,.46,.018,.38,wood);
 box(low,'entry-low-counter',7.72,.875,6.965,.50,.025,.40,wood);
 for(let i=0;i<2;i++){
  const pivot=new T.Group();pivot.name='entry-low-door-hinge-'+i;pivot.position.set(7.47+i*.25,0,6.746);low.add(pivot);
  box(pivot,'entry-low-storage-door-'+i,.125,.06,0,.246,.634,.018,white);
  box(pivot,'entry-low-door-pull-'+i,.205,.46,-.018,.07,.018,.018,dark);
  leaves.push({pivot,sign:1});
 }
 const drawer=new T.Group();drawer.name='entry-everyday-drawer';low.add(drawer);
 box(drawer,'entry-everyday-drawer-front',7.72,.722,6.746,.456,.13,.02,white);
 box(drawer,'entry-everyday-drawer-pull',7.72,.775,6.728,.14,.012,.018,dark);
 box(drawer,'entry-everyday-drawer-base',7.72,.721,6.963,.42,.015,.35,wood);
 for(const x of [7.51,7.93])box(drawer,'entry-drawer-side',x,.736,6.963,.015,.09,.35,wood);
 box(drawer,'entry-drawer-back',7.72,.736,7.13,.40,.09,.015,wood);
 const tray=box(low,'entry-key-tray',7.72,.90,7.015,.23,.025,.15,dark);tray.userData.use='进门放钥匙、手机；小物收顶抽';

 low.userData={size:[.5,.90,.42],use:'门把手侧：全封闭收纳钥匙、包和日常小物，鞋类移至次卫侧；非座位'};
 cabinet.userData={size:[1.60,2.58,.42],location:'次卫侧；靠洗漱端墙一端为高鞋柜，备用鞋集中收纳；底部开放格放常穿鞋与拖鞋；门把手侧矮柜不放鞋',installationVerified:false};
 ensemble.userData={doorHingeX:6.375,highCabinetEnd:5.40,hingeClearance:.975,counterHeight:.90,panels:'日用浅柜位于设备墙下；控制面板保持露出',capacity:'1.6m高鞋柜负责集中收纳；门旁矮柜仅收钥匙和小物；进门关门后在次卫侧换鞋',divider:'不设正对门隔断，保留通往厨房餐厅的路径'};
 for(const x of [7.85,7.91])box(ensemble,'entry-key-hook',x,1.015,7.135,.014,.028,.04,dark);
 box(ensemble,'entry-flush-floor-zone',7.0,.009,6.52,1.8,.002,1.30,material('#c5bfb3')).userData={flush:true,scope:'同标高地面材质示意；非抬高地台、非门槛'};

 let opened=false;
 const setFraction=t=>{drawer.position.z=-.28*T.MathUtils.clamp(t,0,1);for(const {pivot} of leaves)pivot.rotation.y=Math.PI/2*T.MathUtils.clamp(t,0,1);model.updateMatrixWorld(true);};
 const setOpen=v=>{opened=Boolean(v);setFraction(opened?1:0);};
 model.updateMatrixWorld(true);
 return {setBenchShift(){},setOpen,setFraction,roots,leaves,get state(){return {opened,benchShift:0,benchBackShift:0};}};
}

// User correction: keep an exposed control wall beside the entrance.
export function applyEntrySetbacks(model){
 if(model.userData.entrySetbacksApplied)return;
 model.userData.entrySetbacksApplied=true;
 const side=model.getObjectByName('flush-sideboard'),shoes=model.getObjectByName('flush-entry-cabinet');
 if(side)side.position.x+=.55;
 if(shoes)shoes.position.x-=.40;
 const main=model.getObjectByName('door-front-main'),secondary=model.getObjectByName('door-front-secondary');
 if(main&&secondary){
  const left=Math.min(main.position.x,secondary.position.x),right=Math.max(main.position.x,secondary.position.x);
  for(const [door,x,base,turn,hinge] of [[main,left,0,1,'a'],[secondary,right,Math.PI,-1,'b']]){
   door.position.x=x;door.userData={...door.userData,base,turn,hinge,source:'用户确认入户门向次卫侧内开；双扇比例沿用原模型待复尺'};
   door.rotation.set(0,base+(door.userData.open?turn*Math.PI/2:0),0);
  }
 }
 const g=new T.Group();g.name='entry-intercom-control-zone';model.add(g);
 const panel=(name,x,y,w,h,color)=>{
  const m=new T.Mesh(new RoundedBoxGeometry(w,h,.025,2,.002),new T.MeshStandardMaterial({color,roughness:.6}));
  m.name=name;m.position.set(x,y,7.15);g.add(m);return m;
 };
 panel('entry-video-intercom',7.73,1.45,.22,.15,'#d9d6cf');
 panel('entry-video-screen',7.73,1.45,.17,.105,'#343b3c').position.z-=.014;
 panel('entry-control-panel',7.73,1.16,.17,.085,'#d9d6cf');
 g.userData={wallStrip:.60,status:'用户确认有可视对讲与控制面板；尺寸与高度仅定位示意，按原有底盒复尺，不据此迁线'};
 model.updateMatrixWorld(true);
}
