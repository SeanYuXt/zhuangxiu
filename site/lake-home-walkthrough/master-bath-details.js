import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {palette} from './design-spec.js';

// Keep room and shower footprint; shift the vanity 100mm away from the shower.
export function reviseMasterBath(model){
 const old=model.getObjectByName('bath2-vanity'),shower=model.getObjectByName('bath2-shower');
 if(!old||!shower)throw Error('主卫基准柜体/淋浴区缺失');
 old.name='bath2-vanity-baseline';old.visible=false;
 const root=new T.Group();root.name='bath2-vanity';root.position.copy(old.position);root.position.z+=.10;root.position.x-=.035;root.quaternion.copy(old.quaternion);model.add(root);
 const mat=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const warm=mat(palette.cabinet),stone=mat('#e2dfd7',.4),wood=mat(palette.wood),ceramic=mat('#f4f1e9',.18),metal=mat('#989c98',.24,.8),dark=mat('#4e5650'),fabric=mat('#c4c0b3',.98);
 const box=(p,n,x,y,z,w,h,d,m,r=.001)=>{const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/4,h/4,d/4)),m);o.name=n;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
 const group=(p,n,x=0,y=0,z=0)=>{const g=new T.Group();g.name=n;g.position.set(x,y,z);p.add(g);return g;};
 const tube=(p,n,pts,r,m)=>{const o=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(v=>new T.Vector3(...v))),30,r,12,false),m);o.name=n;o.castShadow=true;p.add(o);return o;};
 const cylinder=(p,n,x,y,z,r,h,m)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,40),m);o.name=n;o.position.set(x,y,z);o.castShadow=true;p.add(o);return o;};
 const carcass=group(root,'bath2-cabinet-carcass');
 for(const x of [-.311,.311])box(carcass,'bath2-cabinet-side',x,.533,0,.018,.566,.39,warm);
 box(carcass,'bath2-cabinet-bottom',0,.25,0,.604,.018,.39,wood);
 box(carcass,'bath2-cabinet-back',0,.53,-.189,.604,.55,.012,warm);
 const drawers=[],storage=group(root,'bath2-drawer-storage');
 for(let i=0;i<2;i++){
  const g=group(storage,'bath2-drawer-'+i,0,0,0),y=i===0?.663:.405;drawers.push(g);
  const face=box(g,'bath2-drawer-face-'+i,0,i===0?.695:y+.022,.206,.622,i===0?.276:.251,.018,warm,.003);
  // 45-degree relief at the front top edge gives a finger recess without a pull ring.
  const positions=face.geometry.attributes.position,faceTop=(i===0?.276:.251)/2;
  for(let j=0;j<positions.count;j++){const z=positions.getZ(j),y=positions.getY(j);if(y>faceTop-.021)positions.setY(j,Math.min(y,faceTop-(z+.009)));}positions.needsUpdate=true;face.geometry.computeVertexNormals();
  box(g,'bath2-drawer-finger-recess-'+i,0,y+.14,.196,.51,.014,.015,dark);
  if(i===0){
   for(const x of [-.205,.205]){box(g,'bath2-upper-u-bottom',x,.576,-.005,.184,.012,.316,wood);for(const sx of [x-.086,x+.086])box(g,'bath2-upper-u-side',sx,.634,-.005,.012,.110,.316,wood);}
   box(g,'bath2-upper-u-front-bottom',0,.576,.116,.588,.012,.074,wood);
   box(g,'bath2-upper-u-back-stop',0,.62,.079,.204,.095,.012,wood);
   for(const x of [-.20,.20])for(let j=0;j<2;j++)cylinder(g,'bath2-stored-toiletry',x,.633,-.12+j*.12,.025,.10,j?ceramic:dark);
  }else{
   box(g,'bath2-lower-drawer-bottom',0,.291,-.008,.588,.014,.32,wood);
   for(const x of [-.288,.288])box(g,'bath2-lower-drawer-side',x,.389,-.008,.012,.19,.32,wood);
   box(g,'bath2-lower-drawer-back',0,.389,-.162,.588,.19,.012,wood);
   for(let j=0;j<3;j++)box(g,'bath2-folded-hand-towel',-.125,.317+j*.034,-.005,.22,.032,.28,fabric,.01);
   box(g,'bath2-spare-toiletry-box',.17,.36,-.01,.19,.12,.28,warm,.008);
  }
 }
 // One rounded opening drives the worktop and glazed, double-skin bowl.
 // Nominal 450 x 280 opening / 147 deep basin and existing U-drawers stay fixed.
 const outline=(hx,hz,r)=>{const pts=[];for(let q=0;q<4;q++){const a0=q*Math.PI/2,cx=q===0||q===3?hx-r:-hx+r,cz=q<2?hz-r:-hz+r;for(let i=0;i<12;i++){const a=a0+i*Math.PI/24;pts.push([cx+r*Math.cos(a),.015+cz+r*Math.sin(a)]);}}return pts;};
 const shape=new T.Shape();shape.moveTo(-.335,-.21);shape.lineTo(.335,-.21);shape.lineTo(.335,.21);shape.lineTo(-.335,.21);shape.closePath();
 const opening=outline(.225,.140,.045),hole=new T.Path();
 // Extrude rotates XY onto XZ with +90deg, hence its second coordinate is Z.
 opening.slice().reverse().forEach(([x,z],i)=>i?hole.lineTo(x,z):hole.moveTo(x,z));hole.closePath();shape.holes.push(hole);
 const top=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.026,bevelEnabled:false}),stone);top.name='bath2-open-worktop';top.rotation.x=Math.PI/2;top.position.y=.866;top.castShadow=true;top.receiveShadow=true;root.add(top);
 const sink=group(root,'bath2-basin');
 const profile=[ [.225,.140,.045,.865], [.221,.136,.045,.846], [.218,.133,.044,.827], [.205,.120,.043,.785], [.190,.105,.044,.755], [.172,.087,.048,.735], [.147,.073,.054,.723], [.095,.061,.055,.719], [.023,.023,.023,.718] ];
 const rings=profile.map(([x,z,r,y])=>outline(x,z,r).map(([px,pz])=>[px,y,pz]));
 // Underside is physically present; the drain is an opening, not a dark decal.
 const underside=profile.map(([x,z,r,y])=>outline(x+.006,z+.006,r+.006).map(([px,pz])=>[px,y-.006,pz])).reverse();
 const loops=[...rings,...underside],positions=loops.flat(2),indices=[],N=opening.length;
 for(let k=0;k<loops.length;k++)for(let j=0;j<N;j++){const a=k*N+j,b=k*N+(j+1)%N,c=((k+1)%loops.length)*N+(j+1)%N,d=((k+1)%loops.length)*N+j;indices.push(a,c,b,a,d,c);}
 const bowlGeo=new T.BufferGeometry();bowlGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));bowlGeo.setIndex(indices);bowlGeo.computeVertexNormals();
 const bowl=new T.Mesh(bowlGeo,ceramic);bowl.name='bath2-glazed-basin-shell';bowl.castShadow=true;bowl.receiveShadow=true;sink.add(bowl);
 sink.userData={opening:[.45,.28],depth:.147,wallThickness:.006,roundedCorners:true,productSelected:false};
 const drainRim=new T.Mesh(new T.TorusGeometry(.023,.002,10,48),metal);drainRim.name='bath2-drain-flange';drainRim.rotation.x=Math.PI/2;drainRim.position.set(0,.721,.015);sink.add(drainRim);
 cylinder(sink,'bath2-basin-drain',0,.721,.015,.0215,.003,metal);
 cylinder(root,'bath2-faucet-base',0,.869,-.17,.026,.006,metal);
 cylinder(root,'bath2-faucet-body',0,.934,-.17,.018,.126,metal);
 tube(root,'bath2-brushed-faucet',[[0,.974,-.17],[0,1.035,-.17],[0,1.075,-.11],[0,1.035,-.04]],.012,metal);
 cylinder(root,'bath2-faucet-lever-hub',0,1.001,-.17,.019,.010,metal);
 box(root,'bath2-faucet-lever',.030,1.009,-.17,.066,.007,.016,metal,.003);
 const nozzle=group(root,'bath2-faucet-aerator',0,1.035,-.04);nozzle.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(0,-.04,.07).normalize());
 cylinder(nozzle,'bath2-aerator-collar',0,0,0,.0125,.009,metal);cylinder(nozzle,'bath2-aerator-insert',0,.005,0,.0105,.001,dark);
 for(let row=-3;row<=3;row++)for(let col=-3;col<=3;col++)if(row*row+col*col<11)cylinder(nozzle,'bath2-aerator-outlet',row*.0028,.0057,col*.0028,.00055,.0003,ceramic);
 const services=group(root,'bath2-vanity-service');
 tube(services,'bath2-trap-layout',[[0,.71,.015],[0,.59,.015],[.035,.535,0],[.085,.56,-.04],[.065,.61,-.11],[.065,.61,-.176]],.017,ceramic);
 for(const x of [-.07,.07]){cylinder(services,'bath2-capped-valve',x,.68,-.167,.012,.034,metal);box(services,'bath2-valve-stop',x,.700,-.167,.021,.006,.021,dark);}
 services.userData={supply:null,waste:null,note:'P弯及阀门占位止于柜内，不表示已接现场墙排/地排；上抽U形避管，挂墙固定与防漏另核'};
 box(root,'bath2-mirror-panel',0,1.58,-.215,.538,.90,.023,mat('#bbc1bd',.08,.85),.008);
 const led=new T.MeshStandardMaterial({color:'#fff2db',emissive:'#fff2db',emissiveIntensity:.6});for(const x of [-.28,.28])box(root,'bath2-mirror-task-light',x,1.58,-.198,.012,.88,.015,led);
 cylinder(root,'bath2-soap-bottle',-.279,.936,.01,.027,.14,dark);box(root,'bath2-soap-pump',-.268,1.015,.01,.054,.016,.016,metal);
 const cupProfile=[[0,0],[.023,0],[.028,.012],[.028,.10],[.025,.10],[.025,.014],[0,.014]].map(v=>new T.Vector2(...v));
 const cup=new T.Mesh(new T.LatheGeometry(cupProfile,48),ceramic);cup.name='bath2-toothbrush-cup';cup.position.set(.279,.867,.01);cup.castShadow=true;cup.receiveShadow=true;root.add(cup);
 for(const [i,color] of ['#c1b4a3','#7e8980'].entries()){
  const brush=group(root,'bath2-toothbrush-'+i,.270+i*.018,.882,.01),handle=mat(color,.4);brush.rotation.z=i?-.09:.09;
  box(brush,'bath2-toothbrush-handle',0,.067,0,.008,.134,.011,handle,.003);
  box(brush,'bath2-toothbrush-head',0,.153,0,.010,.030,.012,handle,.004);
  for(let j=0;j<5;j++)for(let k=0;k<3;k++)box(brush,'bath2-toothbrush-tuft',-.003+k*.003,.142+j*.005,.009,.0014,.003,.009,ceramic,.0005);
 }
 root.userData={layoutStatus:'670×420mm浅柜，沿原墙向门侧平移100mm避开淋浴入口；台面端至模型墙面约5mm，实际收口须复尺',counterSize:[.67,.42],shiftAlongWall:.10,basinOpening:[.45,.28],basinDepth:.147,drawerTravel:.30,floatingClearance:.241,installationVerified:false};
 // Replace only the former front glass and its front hardware, not the shower's side/fixtures.
 const removed=[];shower.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrix);if(b.min.z>.40&&b.max.z<.53)removed.push(o);});for(const o of removed){o.visible=false;o.name='bath2-shower-front-baseline';}
 const glass=new T.MeshPhysicalMaterial({color:'#f1f6f3',transparent:true,opacity:.16,roughness:.08,metalness:0,depthWrite:false});
 const fixed=group(shower,'bath2-shower-fixed-front');box(fixed,'bath2-fixed-glass',-.345,1.082,.475,.350,2.135,.012,glass);
 const door=group(shower,'bath2-shower-door',.499,0,.475);
 door.userData={base:0,turn:-1,open:false,fixture:'shower',installationVerified:false};
 box(door,'bath2-shower-door-glass',-.33,1.082,0,.66,2.135,.012,glass);
 for(const y of [.28,1.81])box(door,'bath2-shower-hinge',-.008,y,.009,.035,.055,.024,metal);
 tube(door,'bath2-shower-handle',[[-.565,1.00,.014],[-.565,1.02,.035],[-.565,1.17,.035],[-.565,1.19,.014]],.009,metal);
 shower.userData={...shower.userData,frontDoor:'右铰链向内开90°，避开左侧顶喷；660mm门片，五金和安装净宽待核',glassDoorOperation:'candidate inward hinged leaf'};
 const drawerStates=[false,false];
 const setDrawerFraction=t=>{for(const g of drawers)g.position.z=.30*T.MathUtils.clamp(t,0,1);model.updateMatrixWorld(true);};
 const setShowerFraction=t=>{door.rotation.y=-Math.PI/2*T.MathUtils.clamp(t,0,1);door.userData.open=t>.5;model.updateMatrixWorld(true);};
 model.updateMatrixWorld(true);
 return {root,drawers,services,door,shower,removed,setDrawerFraction,setShowerFraction,setDrawers(open){drawerStates.fill(Boolean(open));setDrawerFraction(open?1:0);},setDrawer(index,open){drawerStates[index]=Boolean(open);drawers[index].position.z=open?.30:0;model.updateMatrixWorld(true);},setShower(open){setShowerFraction(open?1:0);},get state(){return {drawerOpen:drawerStates.some(Boolean),drawers:[...drawerStates],showerOpen:door.userData.open};}};
}
