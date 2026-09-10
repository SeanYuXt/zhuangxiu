import * as T from './vendor/three.module.js';

// Actual scene furniture and fittings. Labels point to those objects, not to a separate drawing.
export function mountIntegratedDetails({scene,s,box,M,white,metal,putty,fabric,drawer,cylinder}){
 const opt=s.design.windowOption,group=new T.Group();group.name='suite-integrated-details';scene.add(group);
 const fronts=[],drawers=[],lights=[],annotations=[];
 const addLabel=(views,title,detail,p)=>annotations.push({views,title,detail,p:new T.Vector3(...p)});
 const remove=n=>{const o=scene.getObjectByName(n);if(o)o.parent.remove(o);};
 remove('entry-cabinet');
 const cab=new T.Group();cab.name='integrated-multipurpose-cabinet';group.add(cab);
 const r=s.design.centeredDressing?[.02,3.12,.67,4.62]:s.furniture.wardrobe.r,zs=[r[1],r[1]+.5,r[1]+1,r[3]],top=s.ceiling;
 box('multipurpose-back',[.02,r[1],.038,r[3]],.06,top-.06,putty,cab);
 for(const z of zs){const zz=Math.min(z+.001,r[3]-.018);box('multipurpose-divider',[.038,zz,.646,zz+.018],.06,top-.06,white,cab);}
 for(const y of [.06,2.05,top-.025])box('multipurpose-shelf',[.038,r[1],.646,r[3]],y,.018,white,cab);
 // Near bathroom: three externally accessible drawers, dry toiletries above.
 const a=zs[0],b=zs[1];
 for(const y of [.73,1.37,1.69])box('dry-supply-shelf',[.038,a+.019,.64,b-.01],y,.018,white,cab);
 for(let i=0;i<3;i++){
  const d=drawer('supply-external-drawer-'+i,[.065,a+.026,.638,b-.026],[.75,.99,1.17][i],.174,'x',cab);
  drawers.push(d);
 }
 for(let i=0;i<3;i++)box('folded-clean-towel',[.10,a+.08,.48,a+.42],1.39+i*.055,.048,fabric,cab,.014);
 for(let i=0;i<3;i++)cylinder(.30,1.71,a+.11+i*.115,.047,.14,white,cab);
 // Middle: daily short garments; deeper clothing storage remains at the bed-foot wall.
 const rod=cylinder(.35,1.94,zs[1]+.25,.008,.40,metal,cab);rod.rotation.x=Math.PI/2;rod.position.set(.35,1.94,zs[1]+.25);
 for(let i=0;i<4;i++)box('daily-jacket',[.15,zs[1]+.07+i*.10,.55,zs[1]+.10+i*.10],1.03,.85,i%2?fabric:putty,cab,.02);
 box('daily-low-shelf',[.038,zs[1]+.019,.64,zs[2]-.01],.69,.018,white,cab);
 // Entry end: safe on floor-supported plinth; tools kept in their own compartments.
 const sa=zs[2],safeMat=M('#555e59');
 box('safe-floor-supported-plinth',[.07,sa+.035,.63,r[3]-.035],0,.08,putty,cab,.004);
 box('safe-body-placeholder',[.12,sa+.06,.56,sa+.44],.08,.48,safeMat,cab,.022);
 box('safe-door',[.562,sa+.077,.581,sa+.423],.095,.447,safeMat,cab,.014);
 box('safe-keypad',[.582,sa+.11,.589,sa+.22],.32,.105,metal,cab,.005);
 for(let row=0;row<3;row++)for(let col=0;col<3;col++)box('safe-key',[.59,sa+.122+col*.027,.593,sa+.137+col*.027],.331+row*.026,.016,white,cab,.002);
 box('safe-handle',[.59,sa+.30,.615,sa+.325],.27,.14,metal,cab,.01);
 for(const y of [.77,1.18,1.60])box('tools-separated-shelf',[.038,sa+.02,.64,r[3]-.01],y,.018,white,cab);
 for(const [y,h]of [[.80,.29],[1.21,.24],[1.63,.23]]){
  box('closed-tool-case',[.10,sa+.055,.55,sa+.445],y,h,M('#879185'),cab,.025);
  box('case-label',[.553,sa+.18,.558,sa+.32],y+h*.45,.04,white,cab,.003);
 }
 for(let i=0;i<3;i++)box('occasional-storage-box',[.10,zs[i]+.05,.57,zs[i]+.44],2.09,.32,fabric,cab,.02);
 function front(name,z0,z1,y,h){const g=new T.Group();g.name=name;cab.add(g);box(name+'-panel',[.65,z0,.668,z1],y,h,white,g,.002);fronts.push(g);}
 for(let i=0;i<3;i++){
  const z0=zs[i]+.022,z1=zs[i+1]-.004;
  if(i===0){front('supply-upper-door',z0,z1,1.353,top-1.373);front('supply-lower-door',z0,z1,.081,.652);}
  else front('multipurpose-door-'+i,z0,z1,.081,top-.101);
 }
 // Same 1000x450 footprint, now true plan-radius R40 instead of rounding only board thickness.
 const vr=s.furniture.vanity.r,vanity=scene.getObjectByName('wc-end-vanity');
 remove('vanity-top');
 const shape=new T.Shape(),x0=vr[0],x1=vr[2],z0=vr[1],z1=vr[3],rad=.04;
 shape.moveTo(x0,-z0);shape.lineTo(x1-rad,-z0);shape.quadraticCurveTo(x1,-z0,x1,-z0-rad);shape.lineTo(x1,-z1+rad);shape.quadraticCurveTo(x1,-z1,x1-rad,-z1);shape.lineTo(x0,-z1);shape.closePath();
 const geo=new T.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false,curveSegments:24});geo.rotateX(-Math.PI/2);
 const table=new T.Mesh(geo,putty);table.name='vanity-top-R40';table.position.y=.715;table.castShadow=table.receiveShadow=true;vanity.add(table);
 const oldShelves=[];scene.traverse(o=>{if(o.name==='bay-books-shelf')oldShelves.push(o);});
 for(const o of oldShelves)o.removeFromParent();
 const br=opt.books.lower.r,rr=.02,profile=new T.Shape();
 profile.moveTo(br[0],-br[3]);profile.lineTo(br[2],-br[3]);profile.lineTo(br[2],-br[1]-rr);profile.quadraticCurveTo(br[2],-br[1],br[2]-rr,-br[1]);profile.lineTo(br[0]+rr,-br[1]);profile.quadraticCurveTo(br[0],-br[1],br[0],-br[1]-rr);profile.closePath();
 for(const y of opt.books.lower.shelves){const g=new T.ExtrudeGeometry(profile,{depth:.015,bevelEnabled:false,curveSegments:20});g.rotateX(-Math.PI/2);const o=new T.Mesh(g,white);o.name='bay-books-shelf-R20';o.position.y=y;o.castShadow=o.receiveShadow=true;group.add(o);}
 box('cabinet-to-vanity-greige-return',[.042,z1-.019,.646,z1+.001],.08,1.74,putty,cab,.003);
 // Replace flat painted mirror with a physically reflective neutral material (environment approximation).
 const mirror=scene.getObjectByName('rounded-vanity-mirror');mirror.material=new T.MeshStandardMaterial({color:'#e1e5e3',metalness:.93,roughness:.08});
 const roundEdges=[];scene.traverse(o=>{if(o.name==='mirror-side-light')roundEdges.push(o);});
 for(const o of roundEdges)o.material=new T.MeshStandardMaterial({color:'#fff8e6',emissive:'#ffeaca',emissiveIntensity:1.4});
 // Light fittings, switched together with the scene; no hidden equipment-only sprites.
 const emissive=new T.MeshStandardMaterial({color:'#fff4df',emissive:'#ffe1b0',emissiveIntensity:1.1});
 function point(name,p,color,intensity,distance=3,parent=group){const l=new T.PointLight(color,intensity,distance,2);l.name=name;l.position.set(...p);parent.add(l);lights.push(l);return l;}
 cylinder(1.12,top-.065,3.46,.14,.045,white,group);cylinder(1.12,top-.071,3.46,.12,.007,emissive,group);
 point('L03-dressing-light',[1.12,top-.10,3.46],'#ffdfbb',5,3.5);
 point('L04-makeup-front-light',[.45,1.48,2.62],'#fff0da',3,1.8);
 for(const z of [a+.04,zs[1]+.04,sa+.04]){
  box('L05-entry-led-profile',[.57,z,.586,z+.012],.84,1.14,emissive,cab,.003);
  point('L05-entry-wardrobe-light',[.55,1.69,z+.09],'#ffe1b4',1.5,1.1,cab);
 }
 const foot=scene.getObjectByName('full-footwall');
 for(const x of opt.cabinet.bays.slice(0,-1)){
  box('L05-foot-led-profile',[x+.034,2.817,x+.047,2.83],.3,1.65,emissive,foot,.002);
  point('L05-foot-cabinet-light',[x+.10,1.68,2.85],'#ffe1b4',1,1.1,foot);
 }
 box('L07-reading-profile',[5.45,2.092,5.79,2.11],1.605,.014,emissive,group,.003);
 point('L07-reading-light',[5.58,1.57,2.10],'#ffe8c8',1.7,1.6);
 // Ceiling treatment kept off the window/AC wall. Nothing is added behind the full-height cabinet.
 box('single-step-head-wall',[2.15,.003,4.95,.033],top-.08,.08,white,group,.001);
 box('single-step-bath-side',[2.15,.035,2.18,2.035],top-.08,.08,white,group,.001);
 // Physical panels: x-facing on dressing wall, z-facing at bedside and main entry.
 function panel(id,p,y,face,n=2){const w=.086,h=.086,depth=.009;
  const rr=face==='x'?[p[0],p[1]-w/2,p[0]+depth,p[1]+w/2]:[p[0]-w/2,p[1],p[0]+w/2,p[1]+depth];
  box(id+'-plate',rr,y-h/2,h,white,group,.004);
  for(let i=0;i<n&&!id.startsWith('P');i++){
  const q=face==='x'?[p[0]+depth,p[1]-w*.38+i*w*.76/n,p[0]+depth+.002,p[1]-w*.38+(i+1)*w*.76/n-.003]:[p[0]-w*.38+i*w*.76/n,p[1]+(face==='z-'?-.002:depth),p[0]-w*.38+(i+1)*w*.76/n-.003,p[1]+(face==='z-'?0:depth+.002)];
   box(id+'-key',q,y-.03,.06,putty,group,.001);
  }
  if(id.startsWith('P'))for(const [u,v]of [[0,.015],[-.018,-.012],[.018,-.012]]){
   const rr=face==='x'?[p[0]+depth,p[1]+u-.003,p[0]+depth+.002,p[1]+u+.003]:[p[0]+u-.003,p[1]+(face==='z-'?-.002:depth),p[0]+u+.003,p[1]+(face==='z-'?0:depth+.002)];
   box(id+'-socket-slot',rr,y+v-.006,.012,metal,group,.001);
  }
 }
 panel('S01',[.62,4.81],1.15,'z',3);panel('S02',[.95,2.065],1.2,'z',3);
 panel('S03',[2.46,.048],.70,'z',2);panel('S04',[4.78,.048],.70,'z',2);
 panel('S05',[.27,3.089],.95,'z-',2);panel('P01',[.38,3.089],.95,'z-',2);
 panel('P02',[2.57,.048],.65,'z',1);panel('P03',[4.89,.048],.65,'z',1);
 panel('P04',[1.725,3.70],.30,'x',1);
 // Bathroom retained in its original footprint; its roof can be peeled away with other technical layers.
 const roof=new T.Group();roof.name='bath-aluminium-ceiling';group.add(roof);
 const bc=s.design.bath.ceiling;
 for(let i=1;i<bc.xLines.length;i++)for(let j=1;j<bc.zLines.length;j++)box('bath-ceiling-panel',[bc.xLines[i-1]+.001,bc.zLines[j-1]+.001,bc.xLines[i]-.001,bc.zLines[j]-.001],bc.height,.009,white,roof,.001);
 const eq=bc.equipment[0];box('L08-bath-heater-300x600',eq.r,bc.height-.022,.017,metal,roof,.004);
 box('L08-bath-diffuser',[eq.r[0]+.03,eq.r[1]+.025,eq.r[2]-.03,eq.r[3]-.09],bc.height-.025,.006,emissive,roof,.002);
 for(let i=0;i<8;i++)box('bath-heater-louvre',[eq.r[0]+.04+i*.063,eq.r[3]-.073,eq.r[0]+.06+i*.063,eq.r[3]-.028],bc.height-.028,.004,white,roof,.001);
 if(!s.design.bath.hotel)for(const x of [1.14,1.98])box('L09-bath-mirror-light',[x,.072,x+.018,.086],1.10,.66,emissive,group,.004);
 point('L08-bath-light',[1.45,2.19,1.02],'#fff0d7',4,2.4);
 // Labels are filtered by room view and project from the 3D anchor every frame.
 addLabel(['entry','storage'],'综合柜1500 × 650','三格500模数；H随实测顶高；无明把手',[.68,2.42,3.86]);
 addLabel(['storage'],'密码保险箱独立下格','落地承托；箱体尺寸、重量与锚固待选型',[.61,.37,4.36]);
 addLabel(['storage'],'工具／备用件独立分格','与干毛巾、纸品隔开；重物不放顶层',[.59,1.45,4.36]);
 addLabel(['storage'],'卫浴备用品＋三层外抽','抽屉750—1344高；950处另留抽拉理物板',[.69,1.12,3.36]);
 addLabel(['vanity'],'一体梳妆台1000 × 450','完成高750；台下双浅抽，净高约648',[.45,.75,2.64]);
 addLabel(['vanity'],'R40 台面前角','圆角在原外包尺寸内，不侵占通道',[.452,.75,2.16]);
 addLabel(['vanity'],'L04 镜侧面光＋镜后收纳','3500—4000K；镜外轮廓约650 × 850',[.21,1.6,2.55]);
 addLabel(['vanity'],'S05／P01 柜侧控制和电源','中心950暂排；走线检修待核，吹风机冷却后收纳',[.38,.95,3.087]);
 addLabel(['bed'],'床头半墙：厚40／高1100','R35前角；前沿下垂10遮光，灯带内退',[3.54,1.10,.04]);
 addLabel(['bed'],'S03／S04 床侧联控','中心700暂排；保留活动床头柜',[2.46,.70,.05]);
 addLabel(['bed','room'],'单眼皮暂80下挂／30突出','只做可见非柜墙段；窗上空调段不连续做',[3.95,top-.04,.03]);
 addLabel(['footwall'],'上排被褥仓 · 独立一排柜门','上下门缝对齐；单扇421 × 490暂排',[3.7,2.26,2.77]);
 addLabel(['footwall','corner'],'R150 入口内凹弧面','在原15cm端部内扣减；不向过道外凸',[1.906,1.36,2.875]);
 addLabel(['footwall'],'两组外抽 · 每组上下2只','第2/4格短衣下方；抽屉不藏柜门内',[4.9,1.04,2.77]);
 addLabel(['corner'],'柜面上下两段，整墙保持一体','原柜深600／总长3550；收口不是储物洞',[2.08,2.02,2.78]);
 addLabel(['footwall'],'柜前灯＋电动投影幕布','柜门抽屉收好再落幕，非真实自动防撞',[3.25,2.51,2.60]);
 addLabel(['window'],'AC01 窗上靠右挂机','95cm机长占位；480安装净空要求待机型核对',[5.10,2.43,1.82]);
 addLabel(['window'],'纱／布双轨都在飘窗内','不做窗帘盒；电机检修与开窗范围待核',[5.68,2.55,.55]);
 addLabel(['window'],'L07 阅读灯＋R20层板前角','原栏杆保留；固定基层与儿童防坠待核',[5.63,1.60,2.10]);
 addLabel(['bath'],'L08 风暖／换气／主灯','300 × 600占位；铝扣板参考顶高2350',[1.5,bc.height-.03,1.02]);
 addLabel(['bath'],'L09 镜前灯；台盆留主卫内','湿区防护、电气回路及检修待专业核定',[1.57,1.55,.08]);
 addLabel(['whole'],'55版：柜门分段与内弧收口','切换衣帽收纳／梳妆／床头／主卫查看就地标注',[2.15,2.90,2.10]);
 return {group,annotations,fronts,drawers,lights,update({inside,pull,evening,view}){
  fronts.forEach(g=>g.visible=!inside);drawers.forEach(g=>g.position.x=pull?.28:0);
  roof.visible=view==='bath';
  for(const l of lights){l.visible=evening;if(l.name==='L05-entry-wardrobe-light')l.visible=evening&&inside;if(l.name==='L05-foot-cabinet-light')l.visible=evening;}
 },setMirrorEnvironment(map){mirror.material.envMap=map;mirror.material.envMapIntensity=.6;mirror.material.needsUpdate=true;}};
}
