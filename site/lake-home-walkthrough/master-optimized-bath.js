import * as T from './vendor/three.module.js';

export function mountOptimizedBath({scene,s,box,roundedFace,cylinder,M,white,metal,putty,fabric}) {
 const swapped=Boolean(s.design.bath.swapped);
 const c=swapped?s.design.bath.swappedCandidate:s.design.bath.optimizedCandidate;
 if(!c)return null;
 const group=new T.Group();group.name='optimized-bath';scene.add(group);
 const openGlass=c.partition.kind==='open-glass';
 const annotations=[],mirrors=[],upper=new T.Group(),doors=new T.Group(),plan=new T.Group(),routesGroup=new T.Group();
 upper.name='optimized-bath-upper';doors.name='optimized-corner-sliding-doors';plan.name='optimized-door-footprints';routesGroup.name='optimized-bath-routes';
 group.add(upper,doors,plan,routesGroup);
 const stone=M('#d9d6cc'),oak=M('#b9aa92'),sage=M('#a0ad9b'),dark=M('#505650'),cream=M('#e6ddc9');
 const luminous=new T.MeshStandardMaterial({color:'#fff7e8',emissive:'#ffebce',emissiveIntensity:.75});
 const mirrorMat=new T.MeshStandardMaterial({color:'#d9e2dd',metalness:.95,roughness:.07});
 const glass=new T.MeshPhysicalMaterial({color:'#d5e1d9',transparent:true,opacity:.29,roughness:.22,metalness:0,depthWrite:false,side:T.DoubleSide});
 let buildParent=group;
 const b=(name,r,y,h,mat=white,parent=buildParent,radius=.004)=>box('optimized-'+name,r,y,h,mat,parent,radius);
 const cy=(name,x,y,z,r,h,mat=metal,parent=buildParent)=>{const o=cylinder(x,y,z,r,h,mat,parent);o.name='optimized-'+name;return o;};
 const rect=(name,fallback)=>c.fixtures?.[name]?.r||fallback;
 const basinWorld=rect('washstand',[.45,1.05,.85,1.95]),toiletWorld=rect('toilet',[1.50,.10,1.90,.75]);
 const basin=swapped?[0,0,basinWorld[3]-basinWorld[1],basinWorld[2]-basinWorld[0]]:basinWorld,toilet=swapped?[0,0,toiletWorld[3]-toiletWorld[1],toiletWorld[2]-toiletWorld[0]]:toiletWorld,shower=rect('shower',[.1,.1,1,1]);
 const basinGroup=new T.Group(),basinUpper=new T.Group();basinGroup.name='bath-basin-assembly';group.add(basinGroup);basinGroup.add(basinUpper);buildParent=basinGroup;
 if(swapped){basinGroup.rotation.y=-Math.PI/2;basinGroup.position.set(basinWorld[2],0,basinWorld[1]);}
 const [x0,z0,x1,z1]=basin,zc=(z0+z1)/2;
 b('floating-basin-cabinet',[x0,z0+.012,x1-.012,z1-.012],.32,.47,oak);
 for(const [i,y]of [.34,.565].entries()){
  b('basin-drawer-'+i,[x1-.009,z0+.02,x1,z1-.02],y,.207,putty);
  b('basin-finger-pull-'+i,[x1-.005,z0+.06,x1+.001,z1-.06],y+.192,.008,dark);
 }
 // A recessed bowl, bounded by real top strips, rather than a flat basin decal.
 const bowl=[x0+.09,zc-.255,x1-.045,zc+.255];
 b('basin-rear-top',[x0,z0,bowl[0],z1],.79,.045,white);
 b('basin-front-top',[bowl[2],z0,x1,z1],.79,.045,white);
 for(const [a,d]of [[z0,bowl[1]],[bowl[3],z1]])b('basin-side-top',[bowl[0],a,bowl[2],d],.79,.045,white);
 b('basin-bowl-bottom',bowl,.729,.012,white);
 for(const x of [bowl[0],bowl[2]-.009])b('basin-bowl-side',[x,bowl[1],x+.009,bowl[3]],.74,.065,white);
 for(const z of [bowl[1],bowl[3]-.009])b('basin-bowl-end',[bowl[0],z,bowl[2],z+.009],.74,.065,white);
 cy('basin-drain',(bowl[0]+bowl[2])/2,.742,zc,.014,.002,metal);
 cy('faucet',x0+.045,.835,zc,.013,.15,metal);
 b('faucet-spout',[x0+.038,zc-.012,x0+.17,zc+.012],.968,.022,metal);
 b('faucet-lever',[x0+.034,zc-.032,x0+.059,zc+.032],.995,.009,metal);
 b('basin-backsplash',[x0,z0,x0+.016,z1],.835,.25,stone,basinUpper);
 const cabinet=new T.Group();cabinet.name='optimized-mirror-cabinet';basinUpper.add(cabinet);
 for(const y of [1.09,1.36,1.63,1.92])b('mirror-shelf',[x0+.01,z0+.012,x0+.13,z1-.012],y,.016,white,cabinet);
 for(const z of [z0+.012,z1-.028])b('mirror-side',[x0+.01,z,x0+.13,z+.016],1.09,.846,white,cabinet);
 b('mirror-back',[x0+.008,z0+.012,x0+.02,z1-.012],1.09,.83,stone,cabinet);
 const mirror=roundedFace('optimized-mirror',x0+.137,1.11,z1-.025,z1-z0-.05,.80,.006,.032,mirrorMat,basinUpper);
 mirror.rotation.y=Math.PI/2;mirrors.push(mirror);
 for(const z of [z0+.038,z1-.05])b('mirror-task-light',[x0+.143,z,x0+.15,z+.012],1.16,.69,luminous,basinUpper,.002);
 function bottle(name,x,y,z,mat,height=.12,r=.025,parent=buildParent){
  cy(name,x,y,z,r,height,mat,parent);cy(name+'-cap',x,y+height,z,r*.65,.017,dark,parent);
  b(name+'-label',[x+r-.001,z-r*.65,x+r+.001,z+r*.65],y+.03,height*.38,cream,parent,.0005);
 }
 bottle('hand-soap',x0+.047,.835,z1-.085,sage,.11,.029);
 b('soap-pump',[x0+.037,z1-.095,x0+.085,z1-.077],.976,.009,dark);
 cy('toothbrush-cup',x0+.076,1.106,z0+.10,.027,.08,cream,cabinet);
 for(const z of [z0+.09,z0+.112]){
  cy('toothbrush',x0+.075,1.16,z,.004,.13,sage,cabinet);
  b('toothbrush-head',[x0+.07,z-.006,x0+.081,z+.006],1.28,.025,white,cabinet);
 }
 b('toothpaste',[x0+.05,z0+.18,x0+.09,z0+.205],1.106,.14,white,cabinet);
 for(const [i,z]of [z0+.10,z0+.24,z0+.38].entries())bottle('skincare-'+i,x0+.075,1.376,z,i?sage:cream,.12,.024,cabinet);
 for(let i=0;i<3;i++)b('spare-face-towel-'+i,[x0+.025,z0+.08,x0+.12,z0+.32],1.646+i*.024,.021,fabric,cabinet);
 const toiletGroup=new T.Group();toiletGroup.name='bath-toilet-assembly';group.add(toiletGroup);buildParent=toiletGroup;
 if(swapped){toiletGroup.rotation.y=Math.PI/2;toiletGroup.position.set(toiletWorld[0],0,toiletWorld[3]);}
 const [tx,tz,tx1,tz1]=toilet,tc=(tx+tx1)/2;
 b('toilet-cistern',[tx+.012,tz,tx1-.012,tz+.17],.045,.69,white,toiletGroup,.025);
 b('toilet-flush',[tc-.032,tz+.05,tc+.032,tz+.10],.737,.005,metal);
 b('toilet-pedestal',[tx+.055,tz+.15,tx1-.055,tz1-.025],.055,.33,white,toiletGroup,.05);
 const seat=cy('toilet-seat',tc,.39,tz+.415,.17,.05,white);seat.scale.z=1.28;
 const opening=cy('toilet-seat-opening',tc,.442,tz+.42,.111,.003,M('#c5ccc4'));opening.scale.z=1.37;
 buildParent=group;
 b('paper-holder',swapped?[.72,1.91,.92,1.95]:[1.99,.46,2.04,.65],.65,.14,putty,upper,.008);
 b('shower-floor',shower,.004,.006,M('#c8cdc5'));
 cy('shower-riser',.135,.94,.39,.013,1.06,metal,upper);
 b('shower-arm',[.125,.38,.47,.40],1.98,.02,metal,upper);
 cy('rain-head',.46,1.956,.39,.092,.018,metal,upper);
 b('shower-mixer',[.108,.30,.165,.48],1.01,.06,metal,upper);
 // Shallow surface storage, clear of both moving door stacks.
 for(const [i,y]of [1.12,1.46].entries()){
  b('shower-shelf-'+i,[.11,.60,.24,.90],y,.016,dark,upper);
  b('shelf-retainer-'+i,[.232,.60,.24,.90],y+.016,.028,dark,upper);
 }
 bottle('shampoo',.177,1.136,.66,sage,.16,.029,upper);
 bottle('body-wash',.177,1.136,.80,cream,.18,.03,upper);
 b('soap-dish',[.135,.63,.218,.76],1.476,.012,white,upper);
 b('shower-soap',[.145,.645,.208,.741],1.488,.022,sage,upper,.009);
 bottle('scrub-jar',.175,1.476,.83,cream,.06,.03,upper);
 b('towel-bar',[2.02,.93,2.04,1.24],1.27,.018,metal,upper);
 b('hand-towel',[1.995,.97,2.01,1.20],.91,.35,fabric,upper);
 const moving=[],cutMoving=[];
 if(!openGlass)for(const face of ['front','right']){
  for(let i=0;i<3;i++){
   const track=1.004+i*.012,closedStart=.1+i*.29;
   const panel=new T.Group(),cut=new T.Group();doors.add(panel);plan.add(cut);
   panel.name=`optimized-${face}-sliding-panel-${i}`;
   const footprint=face==='front'?[.1,track,.42,track+.008]:[track,.1,track+.008,.42];
   b(`${face}-glass-${i}`,footprint,.025,2.10,glass,panel,.001);
   for(const y of [.026,2.10])b(`${face}-panel-rail-${i}`,footprint,y,.022,metal,panel,.001);
   // The leading edge moves with its panel; no permanent corner post.
   const edge=face==='front'?[.411,track,.42,track+.008]:[track,.411,track+.008,.42];
   b(`${face}-moving-edge-${i}`,edge,.027,2.09,metal,panel,.001);
   if(i===2){
    const pull=face==='front'?[.385,track-.008,.397,track+.018]:[track-.008,.385,track+.018,.397];
    b(`${face}-pull`,pull,.94,.17,metal,panel,.002);
   }
   b(`${face}-cut-${i}`,footprint,.02,.04,stone,cut,.001);
   moving.push({object:panel,axis:face==='front'?'x':'z',travel:closedStart-.1});
   cutMoving.push({object:cut,axis:face==='front'?'x':'z',travel:closedStart-.1});
  }
  const trackR=face==='front'?[.1,1.001,1,1.04]:[1.001,.1,1.04,1];
  b(`${face}-overhead-track`,trackR,2.13,.032,metal,doors,.002);
  b(`${face}-floor-guide`,trackR,.010,.008,stone,group,.001);
 }
 if(openGlass){
  const r=c.partition.fixedGlass;
  b('open-glass-screen',r,.025,c.partition.height,glass,doors,.001);
  const horizontal=r[2]-r[0]>r[3]-r[1];
  // Keep the open screen readable in both room and overhead views.
  const edgeMaterial=M('#78968f');
  const edge=horizontal?[r[2]-.006,r[1],r[2],r[3]]:[r[0],r[3]-.006,r[2],r[3]];
  b('glass-visible-edge',edge,.025,c.partition.height,edgeMaterial,doors,.001);
  b('glass-visible-top',r,c.partition.height+.019,.006,edgeMaterial,doors,.001);
  for(const offset of [.08,.42]){
   const clamp=horizontal?[r[0]+offset-.022,r[1]-.01,r[0]+offset+.022,r[3]+.02]:[r[0]-.01,r[1]+offset-.022,r[2]+.02,r[1]+offset+.022];
   b('glass-floor-clamp',clamp,.01,.045,metal,doors,.002);
  }
  for(const y of [.32,1.68]){
   const clamp=horizontal?[r[0]-.015,r[1]-.01,r[0]+.025,r[3]+.02]:[r[0]-.01,r[1]-.015,r[2]+.02,r[1]+.025];
   b('glass-wall-clamp',clamp,y,.045,metal,doors,.002);
  }
  b('open-glass-footprint',r,.015,.022,metal,plan,.001);
 }
 const cornerSeal=b('moving-corner-seal',[.994,1.002,1.036,1.036],.025,2.10,M('#cad4ce'),doors,.002);
 const routeMat=new T.LineBasicMaterial({color:'#547965',transparent:true,opacity:.6});
 const routeSets=c.routes||{};
 for(const [name,route]of Object.entries(routeSets)){
  const points=Array.isArray(route)?route:route.points;
  if(!Array.isArray(points)||points.length<2)continue;
  const geometry=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(p[0],.027,p[1])));
  const line=new T.Line(geometry,routeMat);line.name='optimized-route-'+name;routesGroup.add(line);
 }
 annotations.push({views:['bathTop'],title:'90cm台盆 · 90×90淋浴',detail:openGlass?'50cm挡水玻璃，入口开放':'马桶独立使用；转角门向两侧收叠',p:new T.Vector3(1.12,.20,1.28)});
 return {group,annotations,mirrors,update({closed=false,mirrorInside=false,view='bath',routes=false}={}){
  cornerSeal.visible=closed&&!openGlass;
  const top=view==='bathTop'||view==='top';upper.visible=!top;basinUpper.visible=!top;doors.visible=openGlass||!top;plan.visible=top;mirror.visible=!mirrorInside;
  for(const p of [...moving,...cutMoving])p.object.position[p.axis]=closed?p.travel:0;
  routesGroup.visible=Boolean(routes);
 },setMirrorEnvironment(map){mirrorMat.envMap=map;mirrorMat.envMapIntensity=.65;mirrorMat.needsUpdate=true;}};
}
