import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {outline,P} from './plan.js';
import {setDoorLeafOpen,setDoorLeafFraction} from './door-motion.js';
import {tileCuts} from './tile-surfaces.js';

const mat=(color,r=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness:r,metalness});
const finish={tile:mat('#d4d1c8',.72),cab:mat('#d6d4cb'),inside:mat('#c5baaa'),metal:mat('#8b918d',.27,.82),dark:mat('#525c56'),white:mat('#f1ede4',.32),cloth:mat('#b9b2a4',.98),seal:mat('#b6b8b1',.85)};
const group=(p,n,pos=[0,0,0])=>{const g=new T.Group();g.name=n;g.position.fromArray(pos);p.add(g);return g;};
const box=(p,n,x,y,z,w,h,d,m=finish.cab)=>{const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.002,w/5,h/5,d/5)),m);o.name=n;o.position.set(x,y+h/2,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
const tube=(p,n,pts,r=.008,m=finish.metal)=>{const o=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(a=>new T.Vector3(...a))),28,r,10),m);o.name=n;o.castShadow=true;p.add(o);return o;};
const cylinder=(p,n,x,y,z,r,h,m=finish.metal)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,32),m);o.name=n;o.position.set(x,y+h/2,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
function paperRoll(p,name,x,y,z,length=.105){
 const profile=[[.018,-length/2],[.047,-length/2],[.047,length/2],[.018,length/2],[.018,-length/2]].map(v=>new T.Vector2(...v));
 const o=new T.Mesh(new T.LatheGeometry(profile,40),finish.white);o.name=name;o.position.set(x,y,z);o.rotation.x=Math.PI/2;o.castShadow=true;o.receiveShadow=true;p.add(o);
 const core=new T.Mesh(new T.LatheGeometry([[.015,-length/2],[.018,-length/2],[.018,length/2],[.015,length/2],[.015,-length/2]].map(v=>new T.Vector2(...v)),32),finish.inside);core.name='bath1-cardboard-core';o.add(core);return o;
}

function wetFloor(model,root){
 const floor=model.getObjectByName('800x800-straight-tile-floor'),shape=new T.Shape();
 outline.map(P).forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
 for(const points of [[[1.92,6.46],[2.42,6.46],[2.42,7.12],[1.92,7.12]],[[.8,6.265],[1.72,6.265],[1.72,7.17],[.8,7.17]]]){
  const hole=new T.Path();points.forEach(([x,z],i)=>i?hole.lineTo(x,-z):hole.moveTo(x,-z));hole.closePath();shape.holes.push(hole);
 }
 floor.geometry.dispose();floor.geometry=new T.ShapeGeometry(shape);
 const tile=floor.material.clone();tile.roughness=.85;const wet=group(root,'bath1-sloped-tile-floor');
 const y=z=>z<=7.035?.006-(Math.min(z,7.005)-6.265)/.740*.012:-.006+(Math.max(z,7.065)-7.065)/.105*.0016;
 const patch=(x0,x1,z0,z1)=>{const gap=.001,points=[[x0+gap,y(z0+gap),z0+gap],[x0+gap,y(z1-gap),z1-gap],[x1-gap,y(z1-gap),z1-gap],[x1-gap,y(z0+gap),z0+gap]],g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,1,2,0,2,3].flatMap(i=>points[i]),3));g.setAttribute('uv',new T.Float32BufferAttribute([0,1,2,0,2,3].flatMap(i=>[points[i][0],-points[i][2]]),2));g.computeVertexNormals();const o=new T.Mesh(g,tile);o.name='bath1-cut-800-tile';o.receiveShadow=true;wet.add(o);};
 const pairs=cuts=>cuts.slice(0,-1).map((v,i)=>[v,cuts[i+1]]),xs=pairs(tileCuts(.8,1.72,0));
 for(const [x0,x1] of xs)for(const [lo,hi] of [[6.265,7.005],[7.065,7.17]])for(const [z0,z1] of pairs(tileCuts(lo,hi,1)))patch(x0,x1,z0,z1);
 for(const [lo,hi] of [[.8,1.01],[1.55,1.72]])for(const [x0,x1] of pairs(tileCuts(lo,hi,0)))patch(x0,x1,7.005,7.065);
 // Grout under the 2 mm joints follows the same fall, rather than revealing the slab.
 // Separate bands are needed for the change of fall at the drain; not a single warped quad.
 for(const [z0,z1] of [[6.265,6.4],[6.4,7.005],[7.065,7.17]]){const g=new T.BufferGeometry(),a=[[.8,y(z0)-.001,z0],[.8,y(z1)-.001,z1],[1.72,y(z1)-.001,z1],[1.72,y(z0)-.001,z0]];g.setAttribute('position',new T.Float32BufferAttribute([0,1,2,0,2,3].flatMap(i=>a[i]),3));g.computeVertexNormals();const o=new T.Mesh(g,finish.seal);o.name='bath1-grout-bed';wet.add(o);}
 const drain=group(root,'bath1-linear-drain');box(drain,'drain-trough',1.28,-.027,7.035,.54,.018,.06,finish.dark);
 for(const z of [7.008,7.062])box(drain,'drain-edge',1.28,-.010,z,.54,.004,.006,finish.metal);
 for(let i=0;i<27;i++)box(drain,'removable-drain-grating',1.02+i*.02,-.009,7.035,.012,.003,.046,finish.metal);
 wet.userData={series:'800×800同色地砖按原世界网格裁切',fall:.012/.740,entry:.006,drain:-.006,drainConnection:null,slabChanged:false,constructionVerified:false};
 return wet;
}

function wallFinishes(root){
 const walls=group(root,'bath1-wet-wall-finish');
 // 8 mm surface finish only. Openings and their reveals are retained, not painted over.
 const horizontal=(z,lo,hi,y0,y1)=>box(walls,'bath1-porcelain-wall', (lo+hi)/2,y0,z,hi-lo,y1-y0,.008,finish.tile);
 const vertical=(x,z0,z1,y0,y1)=>box(walls,'bath1-porcelain-wall',x,y0,(z0+z1)/2,.008,y1-y0,z1-z0,finish.tile);
 horizontal(7.166,.8,2.51,.007,2.55);horizontal(5.514,.8,2.51,.007,2.55);
 vertical(.804,5.51,7.17,.007,.859);vertical(.804,5.51,7.17,2.146,2.55);
 vertical(.804,5.51,5.9425,.859,2.146);vertical(.804,6.5775,7.17,.859,2.146);
 vertical(2.506,5.51,5.5825,.007,2.55);vertical(2.506,6.3975,7.17,.007,2.55);vertical(2.506,5.5825,6.3975,2.22,2.55);
 // Neutral 600×1200 wet-wall panel joints, independent from the specified 800 floor series.
 for(const y of [1.20,2.40]){horizontal(7.161,.81,2.50,y,y+.0015);horizontal(5.519,.81,2.50,y,y+.0015);}
 walls.userData={finish:'暖灰防水区瓷质饰面，非普通乳胶漆',projection:.008,waterproofingVerified:false};return walls;
}

function windowDetail(model,root){
 const original=model.getObjectByName('window-bath1-3');original.name='window-bath1-3-baseline';original.visible=false;
 const g=group(root,'window-bath1-3');g.userData={...original.userData,operation:'双轨水平移窗候选',openingVerified:false};
 const frost=new T.MeshPhysicalMaterial({color:'#e3e7e0',roughness:.78,metalness:0,transparent:true,opacity:.88,side:T.DoubleSide});
 for(const z of [5.96,6.56])box(g,'bath1-window-jamb',.70,.87,z,.075,1.26,.034,finish.metal);
 for(const y of [.87,2.10])box(g,'bath1-window-track',.70,y,6.26,.075,.03,.60,finish.metal);
 const leaves=[];
 for(let i=0;i<2;i++){
  const leaf=group(g,'bath1-window-sash-'+i,[i===0?.716:.686,0,i===0?6.125:6.395]);leaves.push(leaf);
  box(leaf,'bath1-frosted-glass',0,.924,0,.006,1.152,.278,frost);
  for(const z of [-.136,.136])box(leaf,'bath1-sash-stile',0,.904,z,.022,1.192,.022,finish.metal);
  for(const y of [.904,2.076])box(leaf,'bath1-sash-rail',0,y,0,.022,.020,.294,finish.metal);
  box(leaf,'bath1-recessed-window-pull',.013,1.20,i===0?.115:-.115,.006,.08,.020,finish.dark);
 }
 return {g,leaves,set(t){leaves[0].position.z=6.125+.269*T.MathUtils.clamp(t,0,1);model.updateMatrixWorld(true);}};
}

function dailyStorage(root){
 const g=group(root,'bath1-shallow-storage'),x=1.25,z=5.592;
 for(const xx of [x-.29,x+.29])box(g,'bath1-cabinet-side',xx,1.88,z,.018,.60,.144);
 for(const y of [1.88,2.075,2.275,2.462])box(g,'bath1-cabinet-shelf',x,y,z,.562,.018,.134,finish.inside);
 box(g,'bath1-cabinet-back',x,1.898,5.526,.562,.564,.012,finish.cab);
 for(const y of [1.96,2.155,2.355])for(const dx of [-.20,-.07,.07,.20])paperRoll(g,'bath1-spare-paper-roll',x+dx,y,z);
 const left=group(g,'bath1-storage-left-door',[x-.144,0,5.687]),right=group(g,'bath1-storage-right-door',[x+.144,0,5.672]);
 for(const door of [left,right]){box(door,'bath1-sliding-cabinet-front',0,1.895,0,.302,.568,.012);box(door,'bath1-cabinet-finger-edge',-.128,2.1,.007,.008,.10,.004,finish.dark);}
 const towels=group(root,'bath1-towels-hooks');tube(towels,'bath1-towel-bar',[[.99,1.51,5.54],[.99,1.51,5.60],[1.45,1.51,5.60],[1.45,1.51,5.54]]);
 for(let i=0;i<2;i++){const towel=box(towels,'bath1-hanging-hand-towel',1.105+i*.22,.89,5.605,.18,.60,.015,finish.cloth);for(const x of [-.075,.075])box(towel,'bath1-towel-hem',x,-.29,.009,.003,.565,.002,finish.cloth);}
 for(const x of [1.57,1.69])tube(towels,'bath1-robe-hook',[[x,1.66,5.535],[x,1.66,5.59],[x,1.69,5.59]],.006);
 const cleaning=group(root,'bath1-cleaning-corner');
 box(cleaning,'bath1-wall-hung-waste-bin',.927,.13,5.63,.175,.245,.19,finish.cab);box(cleaning,'bath1-bin-lid',.927,.38,5.63,.181,.014,.20,finish.metal);
 cylinder(cleaning,'bath1-toilet-brush-cup',1.115,.13,5.62,.047,.20,finish.dark);cylinder(cleaning,'bath1-brush-handle',1.115,.33,5.62,.008,.21,finish.metal);
 // Keep the entire holder behind the bathroom door jamb (z > 6.37).
 // Position ahead of the squat stance; height is a design proposal for on-site reach testing.
 const paper=group(root,'bath1-covered-paper-holder');
 const px=2.44,pz=6.52,bottom=.58;
 box(paper,'bath1-paper-holder-back',2.496,bottom,pz,.012,.18,.16,finish.metal);
 paperRoll(paper,'bath1-paper-in-use',px,.67,pz,.105);
 box(paper,'bath1-paper-splash-cover',px,.756,pz,.12,.012,.17,finish.cab);
 box(paper,'bath1-paper-holder-front',2.378,bottom+.012,pz,.012,.164,.17,finish.cab);
 for(const z of [pz-.079,pz+.079])box(paper,'bath1-paper-holder-side',px,bottom,z,.12,.18,.012,finish.cab);
 // Bottom lips leave an outlet slot; no exposed roll toward the open shower.
 for(const x of [2.405,2.483])box(paper,'bath1-paper-bottom-lip',x,bottom,pz,.035,.012,.15,finish.cab);
 box(paper,'bath1-paper-pull-tab',2.443,bottom-.025,pz,.002,.033,.085,finish.white);
 paper.userData={mounting:'蹲便前侧实体墙，避开门洞；封闭盒底部出纸',bottom:.58,center:.67,reachVerified:false,splashRating:'待成品选型；模型不证明防水等级'};
 g.userData={size:[.60,.60,.18],bottom:1.88,slidingTravel:.272,mountingVerified:false};
 return {g,left,right,set(t){left.position.x=x-.144+.272*T.MathUtils.clamp(t,0,1);}};
}

function showerFixtures(shower,root){
 const old=shower.children.find(o=>!o.name&&!o.isMesh);if(!old)throw Error('公卫原花洒分组缺失');old.name='bath1-shower-fixtures-baseline';old.visible=false;
 const g=group(root,'bath1-shower-fittings');
 tube(g,'bath1-riser',[[1.55,.99,7.105],[1.55,2.025,7.105],[1.55,2.025,6.875]],.012);
 cylinder(g,'bath1-rain-disc',1.55,2.016,6.875,.105,.012);cylinder(g,'bath1-rain-spray-face',1.55,2.013,6.875,.098,.003,finish.dark);
 for(let ring=1;ring<=3;ring++)for(let i=0;i<ring*8;i++){const a=i*Math.PI*2/(ring*8);cylinder(g,'bath1-spray-nozzle',1.55+Math.cos(a)*ring*.028,2.011,6.875+Math.sin(a)*ring*.028,.0018,.002,finish.seal);}
 box(g,'bath1-thermostatic-mixer',1.52,1.005,7.088,.27,.045,.045,finish.metal);
 for(const x of [1.40,1.64])cylinder(g,'bath1-mixer-control',x,1.052,7.088,.021,.018,finish.dark);
 tube(g,'bath1-flexible-hose',[[1.52,1.012,7.067],[1.29,.71,7.04],[1.36,.66,7.03],[1.39,1.405,7.065]],.006);
 tube(g,'bath1-handshower-handle',[[1.39,1.35,7.065],[1.39,1.47,7.025]],.012);
 const hand=cylinder(g,'bath1-handshower-head',1.39,1.47,7.025,.044,.018,finish.metal);hand.rotation.x=.8;
 box(g,'bath1-handshower-bracket',1.39,1.37,7.108,.033,.048,.050,finish.metal);
 const shelf=group(root,'bath1-shower-toiletries');box(shelf,'bath1-corner-shelf',1.065,1.19,7.103,.29,.010,.10,finish.metal);
 for(const x of [.97,1.06,1.15]){cylinder(shelf,'bath1-shampoo-bottle',x,1.20,7.10,.025,.16,finish.white);cylinder(shelf,'bath1-shampoo-pump',x,1.36,7.10,.013,.015,finish.dark);}
 g.userData={supplyConnection:null,fixingVerified:false};
 return g;
}

export function revisePublicBath(model){
 if(model.getObjectByName('public-bath-details'))throw Error('公卫细节重复初始化');
 const root=group(model,'public-bath-details'),shower=model.getObjectByName('bath1-shower'),door=model.getObjectByName('bath1-shower-door'),ceiling=model.getObjectByName('bath1-aluminum-ceiling');
 const glass=door.children[0].material;door.children.forEach(o=>{o.visible=false;o.name='bath1-single-door-baseline';});door.position.x=-.401;
 const first=group(door,'bath1-fold-first'),second=group(first,'bath1-fold-second',[.412,0,0]);
 for(const [i,g] of [first,second].entries()){
  box(g,'bath1-fold-glass-'+i,.206,.025,.010,.400,2.090,.010,glass);
  for(const x of [.008,.404])box(g,'bath1-fold-stile-'+i,x,.015,.010,.010,2.112,.016,finish.metal);
  for(const y of [.013,2.115])box(g,'bath1-fold-rail-'+i,.206,y,.010,.402,.012,.016,finish.metal);
  box(g,'bath1-shower-bottom-seal-'+i,.206,.008,.010,.392,.007,.014,finish.seal).userData.walkThrough=true;
 }
 for(const y of [.29,1.84]){cylinder(first,'bath1-fold-centre-hinge',.412,y,0,.009,.065);box(door,'bath1-door-hinge',-.012,y,0,.028,.065,.020,finish.metal);}
 tube(second,'bath1-fold-pull',[[.32,.99,-.002],[.32,1.02,-.025],[.32,1.16,-.025],[.32,1.19,-.002]],.007);
 door.userData={...door.userData,base:0,turn:-1,leafSpan:.824,open:false,fixture:'shower',motion:'bifold',foldFirst:first.name,foldSecond:second.name,foldAngle:Math.PI*85/180,installationVerified:false};setDoorLeafOpen(door,false);
 shower.userData={...shower.userData,clearOpening:.73,frontDoor:'两扇约400mm玻璃向内对折，约412mm折入深度；导向及承重五金须匹配成品'};
 const walls=wallFinishes(root),floor=wetFloor(model,root),window=windowDetail(model,root),storage=dailyStorage(root),fittings=showerFixtures(shower,root);
 const hatch=ceiling.getObjectByName('bath1-ceiling-panel-2-1');if(!hatch)throw Error('原铝扣板检修候选模块缺失');const hatchBase=hatch.position.clone();hatch.name='bath1-removable-ceiling-panel';hatch.userData={role:'removable-aluminum-panel',installationVerified:false};
 // Hand-removal inspection pose, not a motorized/hinged mechanism or unsupported installation.
 const setHatch=t=>{t=T.MathUtils.clamp(t,0,1);hatch.position.copy(hatchBase);hatch.position.y-=Math.min(t*2,1)*.20;hatch.rotation.x=Math.max(0,t*2-1)*Math.PI*25/180;model.updateMatrixWorld(true);};
 const state={window:false,storage:false,hatch:false};
 const reset=()=>{setDoorLeafOpen(door,false);window.set(0);storage.set(0);setHatch(0);state.window=state.storage=state.hatch=false;model.updateMatrixWorld(true);};reset();
 root.userData={scope:'公卫日常使用方案，原墙门窗洞及蹲便位置保留',sitePlumbingVerified:false,slabChanged:false};
 // Explicit user correction: remove the complete shower partition, not just its door.
 // The room entry door, frosted window, external basin, squat pan and shower remain.
 const removedPartition=[door];door.visible=false;
 for(const o of shower.children){if(!o.isMesh||!o.visible)continue;o.geometry.computeBoundingBox();const size=o.geometry.boundingBox.getSize(new T.Vector3());if(size.y>2){o.visible=false;removedPartition.push(o);}}
 if(removedPartition.length!==4)throw Error('公卫隔断应为门、侧玻璃和两根框柱，实际数量不符');
 root.userData.partitionRemoved=true;shower.userData={...shower.userData,frontDoor:null,partition:'无隔断开放淋浴；洗手台保留外置',splashProtectionVerified:false};
 shower.attach(fittings);model.updateMatrixWorld(true);
 return {root,shower,door,walls,floor,window,storage,hatch,fittings,state,setShowerFraction(t){setDoorLeafFraction(door,t);model.updateMatrixWorld(true);},setShower(v){setDoorLeafOpen(door,v);model.updateMatrixWorld(true);},setWindow(t){window.set(t);state.window=t>0;},setStorage(t){storage.set(t);state.storage=t>0;model.updateMatrixWorld(true);},setHatch(t){setHatch(t);state.hatch=t>0;},reset};
}
