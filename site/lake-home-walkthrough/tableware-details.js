import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';

// Portable objects, in metres. Shared WebGL/export geometry; no layout edits.
const ceramic=new T.MeshPhysicalMaterial({name:'tableware-satin-ivory',color:'#e3ded1',roughness:.26,clearcoat:.22,clearcoatRoughness:.24});
const steel=new T.MeshStandardMaterial({name:'tableware-brushed-steel',color:'#999b95',metalness:.92,roughness:.26});
const wood=new T.MeshStandardMaterial({name:'tableware-tea-walnut',color:'#8c7153',roughness:.64});
const dark=new T.MeshStandardMaterial({name:'tableware-charcoal',color:'#353934',roughness:.52});
const teaFinish=new T.MeshPhysicalMaterial({name:'tableware-tea',color:'#5d3215',roughness:.16,clearcoat:.6});
const textile=new T.TextureLoader().load('./assets/fabric-normal.jpg');
textile.wrapS=textile.wrapT=T.RepeatWrapping;textile.repeat.set(2,2);
const linen=new T.MeshStandardMaterial({name:'tableware-woven-linen',color:'#c5beaf',roughness:.96,normalMap:textile,normalScale:new T.Vector2(.13,.13),side:T.DoubleSide});
const mesh=(g,name,geometry,material)=>{const o=new T.Mesh(geometry,material);o.name=name;o.castShadow=o.receiveShadow=true;o.userData.detailRole='tableware';g.add(o);return o;};
const group=(parent,name,position=[0,0,0])=>{const g=new T.Group();g.name=name;g.position.fromArray(position);parent.add(g);return g;};
const box=(g,name,p,size,m,r=.002)=>{const o=mesh(g,name,new RoundedBoxGeometry(...size,2,Math.min(r,...size.map(v=>v/3))),m);o.position.fromArray(p);return o;};
const lathe=(g,name,profile,m=ceramic)=>mesh(g,name,new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),64),m);
const tube=(g,name,points,radius,material=steel)=>mesh(g,name,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),48,radius,6,false),material);

export function makePlate(name,radius=.135){
 const g=new T.Group();g.name=name;
 // A foot ring, concave well and rolled rim, not two solid cylinders.
 lathe(g,name+'-ceramic',[[0,.004],[radius*.52,.004],[radius*.54,0],[radius*.59,0],[radius*.61,.005],
  [radius*.80,.009],[radius*.96,.017],[radius,.020],[radius,.022],[radius*.978,.023],
  [radius*.92,.019],[radius*.77,.011],[radius*.63,.008],[0,.008]]);
 g.userData={detailRole:'hollow-plate',diameter:radius*2,wellDepth:.015};return g;
}

export function makeCup(name,{radius=.036,height=.092,handle=true,filled=false}={}){
 const g=new T.Group();g.name=name;
 lathe(g,name+'-wall',[[0,.004],[radius*.66,.004],[radius*.69,0],[radius*.78,0],[radius*.84,.006],
  [radius*.94,height*.45],[radius,height-.003],[radius,height],[radius-.003,height+.0005],
  [radius-.004,height-.003],[radius*.94-.003,height*.45],[radius*.84-.004,.009],[0,.009]]);
 if(handle){const points=[];for(let i=0;i<=32;i++){const a=-2.15+i/32*4.3;points.push([radius+.014+.024*Math.cos(a),height*.53+.029*Math.sin(a),0]);}tube(g,name+'-handle',points,.004,ceramic);}
 if(filled){const drink=mesh(g,name+'-tea-surface',new T.CircleGeometry(radius-.005,48),teaFinish);drink.rotation.x=-Math.PI/2;drink.position.y=height*.76;}
 g.userData={detailRole:'hollow-cup',diameter:radius*2,height,wallThickness:.003,filled};return g;
}

function napkin(parent){
 const g=group(parent,'folded-linen-napkin',[-.221,.0015,.018]);
 for(let layer=0;layer<2;layer++){
  const geom=new T.PlaneGeometry(.104,.213,12,20),a=geom.attributes.position;
  for(let i=0;i<a.count;i++){const x=a.getX(i),z=a.getY(i);a.setXYZ(i,x,.002+layer*.003+.0017*Math.sin(z*42+x*18)*Math.cos(x*23),-z);}
  geom.computeVertexNormals();mesh(g,'napkin-fold-'+layer,geom,linen);
 }
 for(const x of [-.048,.048])tube(g,'napkin-stitched-hem',[[x,.006,-.1],[x,.006,0],[x,.006,.1]],.00065,linen);
 return g;
}

function cutlery(parent,type,x){
 const g=group(parent,type,[x,.010,.012]);
 box(g,type+'-rounded-handle',[0,0,.039],[.010,.004,.106],steel,.003);
 if(type==='fork'){
  box(g,'fork-neck',[0,.001,-.025],[.009,.003,.039],steel);
  box(g,'fork-shoulder',[0,.001,-.050],[.020,.003,.014],steel);
  for(let i=0;i<4;i++)tube(g,'fork-tine-'+i,[[(-1.5+i)*.005,.001,-.049],[(-1.5+i)*.005,.002,-.067],[(-1.5+i)*.0045,.005,-.084]],.0012);
 }else{
  const blade=new T.Shape();blade.moveTo(-.004,-.009);blade.lineTo(.011,-.026);blade.quadraticCurveTo(.014,-.073,.005,-.086);blade.quadraticCurveTo(-.004,-.089,-.004,-.069);blade.closePath();
  const o=mesh(g,'knife-rounded-blade',new T.ExtrudeGeometry(blade,{depth:.002,bevelEnabled:true,bevelSize:.0005,bevelThickness:.0005,bevelSegments:2,steps:1}),steel);o.rotation.x=Math.PI/2;
 }
 return g;
}

function placeSettings(model){
 const island=model.getObjectByName('stone-island'),old=island?.getObjectByName('dining-table-settings');
 if(!old)throw Error('Missing dining settings baseline');
 old.removeFromParent();const root=group(island,'dining-table-settings',[0,.9015,0]);
 for(const [i,z] of [-.43,.43].entries()){
  const s=group(root,'dining-place-'+i,[.16,0,z]);s.rotation.y=Math.PI/2;
  box(s,'woven-placemat',[0,0,0],[.62,.003,.38],linen,.025);
  const dinner=makePlate('dinner-plate-'+i);dinner.position.y=.0015;s.add(dinner);
  const side=makePlate('side-plate-'+i,.097);side.position.y=.0095;s.add(side);
  napkin(s);cutlery(s,'fork',-.213);cutlery(s,'knife',.185);
  const cup=makeCup('dining-cup-'+i);cup.position.set(.242,.0015,-.098);cup.rotation.y=Math.PI*.5;s.add(cup);
 }
 return root;
}

function teaTray(model){
 const root=model.getObjectByName('bar-tea-zone');if(!root)throw Error('Missing tea zone baseline');
 model.updateMatrixWorld(true);root.position.y=new T.Box3().setFromObject(model.getObjectByName('bar-cutout-top-right')).max.y;
 root.clear();
 box(root,'tea-tray-bottom',[0,.003,0],[.56,.006,.30],dark,.006);
 for(const z of [-.145,.145])box(root,'tea-tray-lip',[0,.015,z],[.56,.028,.010],wood);
 for(const x of [-.275,.275])box(root,'tea-tray-end',[x,.015,0],[.010,.028,.28],wood);
 for(let i=0;i<13;i++)box(root,'removable-tray-slat',[-.248+i*.0413,.020,0],[.036,.007,.274],wood);
 const kettle=group(root,'tea-kettle',[.13,.024,-.016]);
 lathe(kettle,'kettle-heating-base',[[0,0],[.077,0],[.080,.004],[.079,.016],[0,.016]],dark);
 const body=lathe(kettle,'kettle-shaped-body',[[0,.018],[.057,.018],[.065,.026],[.075,.09],[.071,.157],[.057,.182],[.048,.184],[.048,.178],[.052,.175],[.065,.153],[.068,.09],[.058,.03],[0,.03]],ceramic);
 body.userData.cavity=true;
 lathe(kettle,'kettle-removable-lid',[[0,.194],[.020,.193],[.050,.185],[.052,.181],[.046,.179],[0,.188]],steel);
 lathe(kettle,'kettle-lid-knob',[[0,.195],[.012,.195],[.014,.208],[.009,.213],[0,.213]],dark);
 tube(kettle,'kettle-insulated-handle',[[.058,.174,0],[.102,.159,0],[.116,.098,0],[.099,.043,0],[.064,.041,0]],.009,dark);
 const spout=lathe(kettle,'kettle-open-spout',[[.021,0],[.019,.015],[.012,.065],[.009,.070],[.007,.070],[.009,.062],[.016,.014],[.018,0]],steel);
 spout.position.set(-.06,.12,0);spout.rotation.z=.80;
 for(const [i,x] of [-.19,-.075].entries()){
  const saucer=makePlate('tea-saucer-'+i,.044);saucer.position.set(x,.025,.04);saucer.scale.y=.40;root.add(saucer);
  const cup=makeCup('tea-cup-'+i,{radius:.033,height:.049,handle:false,filled:true});cup.position.set(x,.030,.04);root.add(cup);
 }
 root.userData={...root.userData,detailRevision:'hollow-tableware-v1',trayDimensions:[.56,.30],teaSupply:'portable kettle; no added water connection'};
 return root;
}

export function refineTableware(model){
 if(model.userData.tablewareRevision)return model.userData.tablewareRevision;
 const dining=placeSettings(model),tea=teaTray(model);
 // Stored dishes use the same profiles as those in use; drawer movement unchanged.
 const stored=[];model.traverse(o=>{if(o.name==='stored-ceramic-plate')stored.push(o);});
 for(const old of stored){const plate=makePlate('stored-ceramic-plate',.095);plate.position.copy(old.position);plate.position.y-=.006;plate.scale.y=.55;old.parent.add(plate);old.removeFromParent();}
 model.userData.tablewareRevision='hollow-tableware-v1';model.updateMatrixWorld(true);
 return {dining,tea,storedCount:stored.length};
}
