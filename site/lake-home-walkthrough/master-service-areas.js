import * as T from './vendor/three.module.js';

// Design details only: existing room shell, fixture footprints and drainage stay unchanged.
export function mountServiceAreas({scene,s,box,roundedFace,cylinder,M,white,metal,putty,fabric}){
 const group=new T.Group();group.name='service-areas-56';scene.add(group);
 const annotations=[],mirrors=[];
 const label=(views,title,detail,p)=>annotations.push({views,title,detail,p:new T.Vector3(...p)});
 const mirrorMat=new T.MeshStandardMaterial({color:'#e4e8e5',metalness:.94,roughness:.07});
 const glow=new T.MeshStandardMaterial({color:'#fff9ee',emissive:'#fff0d7',emissiveIntensity:.85});
 const full=s.design.serviceAreas.fullMirror;
 const parent=scene.getObjectByName('multipurpose-door-1');
 const fm=roundedFace('dressing-full-length-mirror',full.x,full.base,full.z+full.width,full.width,full.height,.006,.035,mirrorMat,parent);fm.rotation.y=Math.PI/2;mirrors.push(fm);
 const tray=new T.Group();tray.name='dressing-pullout-tray';group.add(tray);
 const tr=s.design.serviceAreas.tray;
 box('tray-top',tr.r,tr.base,.018,putty,tray,.006);
 box('tray-front',[.649,tr.r[1],.67,tr.r[3]],.931,.052,white,tray,.004);
 for(const z of [tr.r[1]+.008,tr.r[3]-.018])box('tray-runner-placeholder',[.10,z,.62,z+.01],.932,.012,metal,group,.001);
 // Mirror cabinet already provides storage: populate its open side and divide shallow drawers.
 const vr=s.furniture.vanity.r;
 for(let tier=0;tier<2;tier++)for(let i=0;i<2;i++){
  const x=.09,z=2.94+i*.055,y=.962+tier*.29;
  cylinder(x,y,z,.019,.10+i*.025,i?white:putty,group);
 }
 box('makeup-small-tray',[.23,2.88,.43,3.05],.752,.013,putty,group,.012);
 cylinder(.32,.765,2.97,.027,.08,white,group);
 scene.traverse(o=>{if(o.name.startsWith('makeup-drawer-')&&o.isGroup){
  const i=o.name.endsWith('1')?1:0,d=s.design.windowOption.vanity.drawers[i];
  box('makeup-drawer-divider',[.10,(d.r[1]+d.r[3])/2,.40,(d.r[1]+d.r[3])/2+.008],.665,.03,white,o,.001);
 }});
 if(s.design.bath.hotel){
  label(['entry'],'全身镜约450 × 1750','柜门嵌镜；衣帽梳妆保持56版',[.68,1.55,3.87]);
  label(['entry','storage'],'950高抽拉理物板','抽出300；仅临时放轻物，收回再通行',[.72,.95,3.37]);
  return {group,annotations,tray,bathDoors:[],mirrors,update({trayOpen}){tray.position.x=trayOpen?tr.travel:0;},setMirrorEnvironment(map){mirrorMat.envMap=map;mirrorMat.envMapIntensity=.65;mirrorMat.needsUpdate=true;}};
 }
 // Replace the former solid washstand and painted basin with an open-backed cabinet and recessed bowl.
 for(const name of ['bath-vanity','bath-basin-top','bath-basin-inner','bath-mirror','L09-bath-mirror-light']){
  const found=[];scene.traverse(o=>{if(o.name===name)found.push(o);});found.forEach(o=>o.removeFromParent());
 }
 const [x0,z0,x1,z1]=s.design.bath.fixtures.washstand.r;
 for(const x of [x0,x1-.018])box('bath-vanity-side',[x,z0,x+.018,z1],.30,.50,putty,group);
 box('bath-vanity-bottom',[x0,z0,x1,z1],.30,.018,putty,group);
 for(const y of [.322,.556])box('bath-external-drawer-front',[x0+.022,z1-.018,x1-.022,z1],y,.22,putty,group,.004);
 const bowl=[x0+.14,z0+.12,x1-.14,z1-.09];
 box('basin-left-rim',[x0,z0,bowl[0],z1],.80,.045,white,group,.01);
 box('basin-right-rim',[bowl[2],z0,x1,z1],.80,.045,white,group,.01);
 box('basin-back-rim',[bowl[0],z0,bowl[2],bowl[1]],.80,.045,white,group,.008);
 box('basin-front-rim',[bowl[0],bowl[3],bowl[2],z1],.80,.045,white,group,.008);
 box('basin-recessed-bottom',bowl,.745,.012,white,group,.008);
 for(const x of [bowl[0],bowl[2]-.01])box('basin-inner-side',[x,bowl[1],x+.01,bowl[3]],.755,.045,white,group,.002);
 for(const z of [bowl[1],bowl[3]-.01])box('basin-inner-end',[bowl[0],z,bowl[2],z+.01],.755,.045,white,group,.002);
 cylinder((x0+x1)/2,.846,z0+.055,.017,.18,metal,group);
 box('bath-faucet-spout',[(x0+x1)/2-.018,z0+.05,(x0+x1)/2+.018,z0+.20],1.006,.025,metal,group,.006);
 cylinder((x0+x1)/2,.758,(bowl[1]+bowl[3])/2,.021,.003,metal,group);
 // Surface-mounted mirror cabinet, no recess cut into the wall.
 box('bath-backsplash',[x0,.08,x1,.10],.845,.24,M('#d9d6ce'),group,.002);
 for(const x of [x0,x1-.018])box('bath-mirror-cabinet-side',[x,.072,x+.018,.205],1.09,.84,white,group);
 for(const y of [1.09,1.36,1.63,1.912])box('bath-mirror-cabinet-shelf',[x0,.072,x1,.205],y,.018,white,group);
 const bathDoors=[];
 for(let i=0;i<2;i++){
  const door=roundedFace('bath-mirror-door-'+i,x0+.022+i*.43,1.115,.209,.416,.79,.006,.025,mirrorMat,group);bathDoors.push(door);mirrors.push(door);
 }
 for(let i=0;i<5;i++)cylinder(x0+.09+i*.15,1.383,.132,.022,.14,i%2?white:putty,group);
 cylinder(x0+.14,1.11,.14,.03,.10,white,group);
 for(let i=0;i<2;i++)box('toothbrush',[x0+.13+i*.018,.13,x0+.138+i*.018,.138],1.17,.15,metal,group,.002);
 for(const x of [x0+.025,x1-.037])box('bath-mirror-front-light',[x,.222,x+.012,.231],1.20,.61,glow,group,.003);
 box('bath-soap-tray',[x1-.12,.19,x1-.025,.32],.847,.018,putty,group,.008);
 cylinder(x1-.075,.865,.245,.024,.11,white,group);
 // Shallow towel rail stays outside the original inward door sweep.
 box('bath-towel-bar',[1.965,.69,1.988,1.00],1.18,.022,metal,group,.004);
 box('bath-hand-towel',[1.95,.74,1.97,.96],.79,.39,fabric,group,.005);
 for(const z of [.69,.99])box('bath-towel-bracket',[1.97,z,2.047,z+.012],1.18,.012,metal,group);
 box('shower-surface-shelf',[.10,.72,.22,.94],1.18,.018,metal,group,.004);
 for(const z of [.76,.86])cylinder(.16,1.20,z,.025,.17,white,group);
 // Retractable fabric splash screen: no glass, no assumed floor curb or drain location.
 const shower=s.design.bath.fixtures.shower.r,curtain=new T.Group();curtain.name='bath-fabric-screen';group.add(curtain);
 box('bath-curtain-rail',[shower[0],1.03,1.055,1.05],2.12,.018,white,group);
 box('bath-curtain-return',[1.035,shower[1],1.055,1.05],2.12,.018,white,group);
 const curtainMat=M('#e2ddd2');curtainMat.side=T.DoubleSide;
 function cloth(name,start,end){const vs=[],is=[],N=48;
  for(let i=0;i<=N;i++){const t=i/N;for(const y of [.08,2.09])vs.push(start[0]+(end[0]-start[0])*t+.012*Math.sin(t*70),y,start[1]+(end[1]-start[1])*t+.012*Math.sin(t*70));if(i<N){const a=i*2;is.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vs,3));g.setIndex(is);g.computeVertexNormals();const m=new T.Mesh(g,curtainMat);m.name=name;curtain.add(m);return m;
 }
 const front=cloth('bath-screen-front',[.12,1.04],[1.04,1.04]),side=cloth('bath-screen-side',[1.04,.12],[1.04,1.04]);
 const gathered=box('bath-screen-gathered',[.12,.99,.27,1.065],.08,2.01,curtainMat,group,.014);
 label(['entry'],'全身镜约450 × 1750','嵌在中间柜门；安全背膜及门扇五金待选型',[.68,1.55,3.87]);
 label(['entry','storage'],'950高抽拉理物板','抽出300；仅临时放轻物，收回再通行',[.72,.95,3.37]);
 label(['bath'],'90 × 45台盆＋薄镜柜','原位保留；牙刷护肤入镜柜，台面留洗漱位',[1.55,1.22,.22]);
 label(['bath'],'收拢浴帘，洗澡时展开','不是全干区；防水、找坡及门口防溢待深化',[.50,2.13,1.04]);
 return {group,annotations,tray,bathDoors,mirrors,update({trayOpen,mirrorInside,curtainClosed}){
  tray.position.x=trayOpen?tr.travel:0;bathDoors.forEach(o=>o.visible=!mirrorInside);front.visible=side.visible=curtainClosed;gathered.visible=!curtainClosed;
 },setMirrorEnvironment(map){mirrorMat.envMap=map;mirrorMat.envMapIntensity=.65;mirrorMat.needsUpdate=true;}};
}
