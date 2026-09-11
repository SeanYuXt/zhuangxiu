import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {finishWoodPanel,quartzMaterial} from './cabinet-finishes.js';
import {makePlate,makeCup} from './tableware-details.js';

// Real outside depth, including both sliding fronts. No recess in the source wall.
export const kitchenWineSpec={depth:.30,backX:5.93,top:2.20,counterTop:.90,upperBottom:1.35,
 shelfDepth:.24,tableShiftX:.31,sofaShiftX:.31,coffeeShiftX:.31,
 banks:[{id:'balcony',name:'阳台侧酒柜',z0:1.84,z1:2.82},{id:'dining',name:'餐桌侧餐具酒柜',z0:4.54,z1:5.38}]};
const finish=new T.MeshStandardMaterial({color:'#d6d1c7',roughness:.6});
const oak=new T.MeshStandardMaterial({color:'#d6c3a4',roughness:.8});
const bronze=new T.MeshStandardMaterial({color:'#706453',roughness:.42,metalness:.6});
const glass=new T.MeshPhysicalMaterial({color:'#eee8da',roughness:.10,metalness:0,transparent:true,opacity:.20,depthWrite:false,side:T.DoubleSide,clearcoat:.8});
const led=new T.MeshStandardMaterial({color:'#fff0d9',emissive:'#ffdfab',emissiveIntensity:.7});
const group=(p,n,pos=[0,0,0])=>{const g=new T.Group();g.name=n;g.position.fromArray(pos);p.add(g);return g;};
function box(p,n,pos,size,mat=finish){const g=new T.Mesh(new RoundedBoxGeometry(...size,2,.001),mat);g.name=n;g.position.fromArray(pos);g.castShadow=g.receiveShadow=true;p.add(g);if(mat===oak)finishWoodPanel(g,{interior:true});return g;}
function bottle(p,x,y,z,index){
 const g=group(p,'upright-750ml-wine-bottle',[x,y,z]),color=index%2?'#4f4530':'#354738';
 const material=new T.MeshPhysicalMaterial({color,roughness:.24,metalness:.05,clearcoat:1});
 const shape=[[0,0],[.031,0],[.039,.014],[.039,.205],[.036,.221],[.013,.246],[.012,.293],[.014,.295],[.014,.307],[0,.307]];
 const m=new T.Mesh(new T.LatheGeometry(shape.map(a=>new T.Vector2(...a)),40),material);m.castShadow=m.receiveShadow=true;g.add(m);
 box(g,'wine-bottle-label',[0,.121,.037],[.050,.083,.0015],new T.MeshStandardMaterial({color:index%2?'#d7c4a3':'#e7dfcc',roughness:.9}));
 box(g,'wine-label-rule',[0,.125,.038],[.033,.002,.001],bronze);
 return g;
}
function stemGlass(p,x,y,z){
 const g=group(p,'stemmed-wine-glass',[x,y,z]);
 const material=new T.MeshPhysicalMaterial({color:'#f0eee4',roughness:.08,transparent:true,opacity:.32,depthWrite:false,side:T.DoubleSide});
 const profile=[[0,0],[.036,0],[.038,.003],[.036,.006],[.005,.009],[.003,.085],[.030,.112],[.043,.151],[.037,.208],[.035,.209],[.035,.206],[.041,.151],[.027,.115],[.002,.089],[.002,.004],[0,.004]];
 const m=new T.Mesh(new T.LatheGeometry(profile.map(a=>new T.Vector2(...a)),40),material);m.castShadow=false;g.add(m);return g;
}

export function installKitchenWine(model){
 const s=kitchenWineSpec,root=group(model,'kitchen-wine-cabinets'),banks=[],sliders=[],contents=[];
 for(const bank of s.banks){
  const w=bank.z1-bank.z0,g=group(root,'kitchen-wine-'+bank.id,[s.backX+s.depth/2,0,(bank.z0+bank.z1)/2]);g.rotation.y=Math.PI/2;banks.push(g);
  box(g,'wine-cabinet-recessed-plinth',[0,.045,-.024],[w-.05,.09,.23],bronze);
  for(const band of [{id:'base',lo:.09,hi:.874},{id:'glass',lo:s.upperBottom,hi:s.top}]){
   const hh=band.hi-band.lo,mid=(band.lo+band.hi)/2;
   for(const x of [-(w-.018)/2,(w-.018)/2])box(g,'wine-'+band.id+'-carcass-side',[x,mid,0],[.018,hh,s.depth],oak);
   box(g,'wine-'+band.id+'-back',[0,mid,-.144],[w-.036,hh,.012],oak);
   for(const y of [band.lo+.009,band.hi-.009])box(g,'wine-'+band.id+'-horizontal',[0,y,-.027],[w-.036,.018,.240],oak);
   const inner=w-.036,leafW=(inner+.016)/2;
   for(let i=0;i<2;i++){
    const center=(i?1:-1)*(inner-leafW)/2,door=group(g,'wine-'+bank.id+'-'+band.id+'-slider-'+i,[center,0,i?.143:.121]);sliders.push(door);
    if(band.id==='base'){
     box(door,'wine-lower-sliding-front',[0,mid,0],[leafW,hh-.012,.014]);
     box(door,'wine-lower-recessed-pull',[(i?1:-1)*(leafW/2-.025),mid, .006],[.009,.16,.002],bronze);
    }else{
     box(door,'wine-clear-glass',[0,mid,0],[leafW-.026,hh-.038,.005],glass);
     for(const x of [-(leafW-.013)/2,(leafW-.013)/2])box(door,'wine-glass-bronze-stile',[x,mid,0],[.013,hh-.012,.014],bronze);
     for(const y of [band.lo+.014,band.hi-.014])box(door,'wine-glass-bronze-rail',[0,y,0],[leafW,.016,.014],bronze);
     box(door,'wine-glass-recessed-pull',[(i?1:-1)*(leafW/2-.016),mid,.006],[.008,.10,.002],bronze);
    }
    door.userData={closedX:center,stackX:(inner-leafW)/2,band:band.id,bank:bank.id,leafWidth:leafW,clearOpening:inner-leafW};
   }
   for(const y of [band.lo+.003,band.hi-.003])for(const z of [.121,.143])box(g,'wine-double-track',[0,y,z],[inner,.005,.007],bronze);
  }
  box(g,'wine-300mm-stone-counter',[0,.887,0],[w,.026,.30],quartzMaterial);
  box(g,'wine-open-band-backsplash',[0,1.125,-.142],[w-.036,.45,.016],quartzMaterial);
  for(const y of [.40,1.73])box(g,'wine-adjustable-shelf',[0,y,-.017],[w-.039,.018,s.shelfDepth],oak);
  for(const y of [1.715,2.18])box(g,'wine-concealed-light',[0,y,.083],[w-.05,.006,.008],led);
  for(const x of [-.15,.02,.19])contents.push(bottle(g,x,1.748,-.018,contents.length));
  for(const x of [-.15,0,.15])contents.push(stemGlass(g,x,1.368,-.015));
  for(const x of [-.19,.19])for(let i=0;i<5;i++){const p=makePlate('wine-cabinet-small-plate',.105);p.position.set(x,.109+i*.014,-.018);g.add(p);contents.push(p);}
  for(const x of [-.19,0,.19]){const p=makeCup('wine-cabinet-cup',{radius:.036,height:.095});p.position.set(x,.411,-.017);g.add(p);contents.push(p);}
  const taskLight=new T.PointLight('#ffe3b6',.18,.75,2);taskLight.position.set(0,1.70,.055);g.add(taskLight);
  g.userData={outsideDepth:.30,shelfDepth:.24,opening:'上下双轨移门，前方不增加平开门扫掠',use:'竖放酒瓶、酒杯、小碟碗筷',selectedJoinery:false};
 }
 const state={open:false};
 function setFraction(t){for(const door of sliders)door.position.x=T.MathUtils.lerp(door.userData.closedX,door.userData.stackX,t);model.updateMatrixWorld(true);}
 function setOpen(value){state.open=!!value;setFraction(state.open?1:0);}
 return {spec:s,root,banks,sliders,contents,state,setOpen,setFraction};
}
