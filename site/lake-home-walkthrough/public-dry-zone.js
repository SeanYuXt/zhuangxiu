import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {P,walls} from './plan.js';

// Optional design study, not a surveyed installation or an approved replacement.
// All dimensions below are candidate product envelopes, in metres.
export const dryZoneOptions={
 integrated:{label:'当前 · 保留原墙洗漱区',width:.65,depth:.60,shift:.11,benchShift:.04,benchBackShift:.06,storage:'sliding'},
 deep:{label:'A · 常规深柜',width:.75,depth:.49},
 slim:{label:'B · 浅柜减占地',width:.75,depth:.40},
 offset:{label:'C · 窄柜向鞋区侧移',width:.65,depth:.40,shift:.11}
};
export function dryZoneGeometry(key){
 const s=dryZoneOptions[key];if(!s)throw Error('Unknown dry-zone option');
 const back=walls[21],north=walls[24],east=walls[23],west=walls[27];
 const backFace=P(back.a)[1]-(back.t||20)/200;
 const northFace=P(north.a)[1]+north.t/200;
 const minX=P(west.a)[0]+west.t/200,maxX=P(east.a)[0]-east.t/200;
 const x=P([355,802])[0]+(s.shift||0),front=backFace-s.depth;
 const rect=(x0,z0,x1,z1)=>({x0,z0,x1,z1});
 return {...s,key,x,backFace,northFace,minX,maxX,front,
  cabinet:rect(x-s.width/2,front,x+s.width/2,backFace),
  screen:rect(x+s.width/2,front,x+s.width/2+.03,backFace),
  standing:rect(x-.30,front-.60,x+.30,front),
  drawer:rect(x-s.width/2+.025,front-.32,x+s.width/2-.025,front),
  useAssumption:s.storage==='sliding'?'600 × 600 mm 洗漱站位；柜门横移不占过道；非人体/无障碍认证':'600 × 600 mm 静态站位，非人体/无障碍标准；抽屉假设拉出 320 mm',
  clearClosed:front-northFace,clearOccupied:front-.60-northFace,
  widthBasis:'公卫外墙面至上方卧室/厨房分墙侧面的投影对齐范围；右侧干区没有据此新增墙。原图对应印刷段为 1000 mm，未作现场复尺',
  approved:false,plumbingVerified:false
 };
}
export function makeDryZone(key){
 const s=dryZoneGeometry(key),g=new T.Group();g.name='bath1-vanity';g.userData={designStudy:key,installationVerified:false};
 const m=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.65,...extra});
 const cabinet=m('#e4dfd5'),stone=m('#e5e1d7'),white=m('#eeeae1'),metal=m('#66675e',{metalness:.5,roughness:.3});
 const mirror=m('#b8c2be',{metalness:.85,roughness:.12}),light=m('#fff1d7',{emissive:'#ffe4b5',emissiveIntensity:.75});
 const box=(name,x,y,z,w,h,d,material,round=.002)=>{
  const mesh=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(round,w/5,h/5,d/5)),material);
  mesh.name=name;mesh.position.set(x,y+h/2,z);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh;
 };
 const centerZ=(s.front+s.backFace)/2;
 for(const x of [s.x-s.width/2+.024,s.x+s.width/2-.024])box('dry-carcass-side',x,.25,centerZ,.018,.55,s.depth-.03,cabinet);
 box('dry-carcass-back',s.x,.25,s.backFace-.015,s.width-.03,.55,.018,cabinet);
 box('dry-carcass-bottom',s.x,.25,centerZ,s.width-.03,.018,s.depth-.03,cabinet);
 const frontPanels=[],mirrorPanels=[];
 if(s.storage==='sliding'){
  for(const [i,x] of [s.x-s.width/4+.006,s.x+s.width/4-.006].entries()){
   const panel=box('dry-storage-door-'+i,x,.273,s.front+.014+i*.025,s.width/2+.012,.513,.018,cabinet);frontPanels.push({panel,x,travel:i?-s.width/2+.025:s.width/2-.025});
   const grip=box('dry-storage-finger-'+i,x+(i?-.125:.125),.48,s.front+.002+i*.025,.008,.18,.003,metal);panel.attach(grip);
  }
  // U-shaped storage around the accessible central trap, not drawers through pipes.
  for(const sign of [-1,1])box('dry-side-storage-shelf',s.x+sign*.225,.47,centerZ,.16,.016,s.depth-.08,cabinet);
  box('dry-front-storage-shelf',s.x,.47,s.front+.075,.29,.016,.085,cabinet);
  for(const sign of [-1,1])for(let i=0;i<2;i++)box('dry-folded-towels',s.x+sign*.225,.49+i*.05,s.front+.20,.13,.045,.20,m('#c6c1b5'),.008);
 }else{
  for(const [i,y] of [.265,.525].entries())box('dry-drawer-'+i,s.x,y,s.front+.012,s.width-.035,.245,.022,cabinet);
  for(const y of [.51,.77])box('dry-finger-recess',s.x,y,s.front+.015,s.width-.075,.012,.008,metal);
 }
 // Counter is a real opening surround, not a solid slab behind a painted basin.
 const bowlW=.42,bowlD=s.depth<=.40?.25:.30,bowlZ=centerZ-.025,top=.82;
 const left=(s.width-bowlW)/2,frontLip=bowlZ-bowlD/2-s.front,backLip=s.backFace-bowlZ-bowlD/2;
 box('dry-counter-left',s.x-(bowlW+left)/2,top,centerZ,left,.025,s.depth,stone);
 box('dry-counter-right',s.x+(bowlW+left)/2,top,centerZ,left,.025,s.depth,stone);
 box('dry-counter-front',s.x,top,s.front+frontLip/2,bowlW,.025,frontLip,stone);
 box('dry-counter-back',s.x,top,s.backFace-backLip/2,bowlW,.025,backLip,stone);
 box('dry-basin-bottom',s.x,.70,bowlZ,bowlW,.015,bowlD,white);
 box('dry-basin-left',s.x-bowlW/2+.008,.71,bowlZ,.016,.135,bowlD,white);
 box('dry-basin-right',s.x+bowlW/2-.008,.71,bowlZ,.016,.135,bowlD,white);
 for(const z of [bowlZ-bowlD/2+.008,bowlZ+bowlD/2-.008])box('dry-basin-rim',s.x,.71,z,bowlW,.135,.016,white);
 const cylinder=(name,x,y,z,r,h,mat)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,24),mat);o.name=name;o.position.set(x,y+h/2,z);g.add(o);return o;};
 cylinder('dry-waste',s.x,.716,bowlZ,.018,.003,metal);
 if(s.storage==='sliding'){
  const plumbing=new T.Group();plumbing.name='dry-service-access';g.add(plumbing);
  const points=[[s.x,.702,bowlZ],[s.x,.55,bowlZ],[s.x+.045,.51,bowlZ],[s.x+.09,.55,bowlZ],[s.x+.09,.58,s.backFace-.035]].map(p=>new T.Vector3(...p));
  const pipe=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),32,.018,10,false),m('#aaa99f'));pipe.name='dry-trap-routing-placeholder';plumbing.add(pipe);
  for(const [sign,color] of [[-1,'#747e8c'],[1,'#9b7770']]){const valve=cylinder('dry-isolation-valve',s.x+sign*.09,.64,s.backFace-.035,.022,.03,m(color));plumbing.attach(valve);}
  plumbing.userData={status:'中央可检修仓和存水弯包络示意；墙排/地排、供水、阀门、固定方式未确认，不是施工管线图'};
 }
 cylinder('dry-tap-stem',s.x,.845,s.backFace-.055,.014,.20,metal);
 box('dry-tap-spout',s.x,1.022,s.backFace-.105,.029,.025,.13,metal);
 // Photo-confirmed end wall: dimensions are provisional, not surveyed.
 if(key==='integrated'){
  const wall=box('bath1-existing-end-wall',s.x+s.width/2+.07,0,centerZ,.10,2.70,.60,m('#e6e2da'),.001);
  wall.userData={source:'用户老人房门口实拍：洗漱区左侧实体端墙，右侧进次卫',preserve:true,dimensionsVerified:false,assumedDepth:.60,assumedThickness:.10,assumedHeight:2.70};
  box('dry-end-wall-tile',s.x+s.width/2+.019,.02,centerZ,.012,1.96,.60,stone);
 }
 // Historical comparison screens only; the integrated design preserves the original walls.
 if(key!=='integrated'){
 box('dry-waterproof-side',s.screen.x0+.015,0,centerZ,.03,.94,s.depth,stone);
 const privacy=new T.MeshPhysicalMaterial({color:'#dce2d9',roughness:.75,transparent:true,opacity:.75,side:T.DoubleSide});
 box('dry-privacy-glass',s.screen.x0+.015,.94,centerZ,.012,.91,s.depth-.025,privacy);
 for(const z of [s.front+.005,s.backFace-.005])box('dry-screen-frame',s.screen.x0+.015,.94,z,.026,.925,.01,metal);
 box('dry-screen-cap',s.screen.x0+.015,1.85,centerZ,.026,.015,s.depth,metal);
 }
 // 130 mm deep mirror storage: solid side/back/shelves, sliding front panels.
 const mw=s.width-.08,md=.13,mz=s.backFace-md/2;
 box('dry-mirror-back',s.x,1.18,s.backFace-.008,mw,.78,.016,cabinet);
 for(const x of [s.x-mw/2+.008,s.x+mw/2-.008])box('dry-mirror-side',x,1.18,mz,.016,.78,md,cabinet);
 for(const y of [1.18,1.43,1.68,1.944])box('dry-mirror-shelf',s.x,y,mz,mw-.032,.016,md,cabinet);
 for(const [i,x] of [s.x-mw/4,s.x+mw/4].entries()){const panel=box('dry-mirror-door-'+i,x,1.20,s.backFace-md-.006-i*.014,mw/2+.015,.73,.01,mirror);mirrorPanels.push({panel,x,travel:i?-mw/2+.022:mw/2-.022});}
 for(const [i,x] of [s.x-.20,s.x-.09,s.x+.12].entries())cylinder('dry-mirror-toiletry-'+i,x,1.45,s.backFace-.065,.019,.12,m(i===1?'#869083':'#ddd8cc'));
 const mirrorStorage=new T.Group();mirrorStorage.name='dry-mirror-storage';g.add(mirrorStorage);
 for(const object of [...g.children])if(/^dry-mirror-(back|side|shelf|toiletry)/.test(object.name))mirrorStorage.attach(object);
 box('dry-mirror-task-strip',s.x,1.172,mz-.018,mw-.05,.006,.035,light);
 box('dry-wall-splashback',s.x,.02,s.backFace-.009,s.width,1.96,.018,stone);
 g.userData.waterproofing={floor:'洗漱区地面含柜底；与次卫门口衔接，范围待现场放线',wallHeight:1.2,detail:'墙根、短墙转角与管口加强；饰面不替代防水层',existingWall:'保留原墙；短墙进深未实测'};
 cylinder('dry-soap',s.x-.285,.846,s.front+.10,.029,.12,m('#7f8b7e'));
 box('dry-towel-rail',s.x+.245,.97,s.backFace-.04,.16,.012,.012,metal);
 box('dry-hand-towel',s.x+.245,.86,s.backFace-.047,.12,.105,.008,m('#bbb5a8'));
 let storageOpen=false,mirrorOpen=false;
 const setStorage=(open,side='left')=>{storageOpen=Boolean(open);for(const [i,p] of frontPanels.entries())p.panel.position.x=p.x+(storageOpen&&i===(side==='right'?1:0)?p.travel:0);g.updateMatrixWorld(true);};
 const setMirror=open=>{mirrorOpen=Boolean(open);for(const [i,p] of mirrorPanels.entries())p.panel.position.x=p.x+(mirrorOpen&&i===0?p.travel:0);g.updateMatrixWorld(true);};
 g.updateMatrixWorld(true);return {group:g,spec:s,setStorage,setMirror,get state(){return {storageOpen,mirrorOpen};}};
}
