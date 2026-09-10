import * as T from './vendor/three.module.js';
import {OrbitControls,RoundedBoxGeometry} from './vendor/render-libs.js';
import {layout as d,auditLayout,chairAt} from './door-shift-layout.js?v=soft-monochrome';
const $=s=>document.querySelector(s),svg=$('#plan'),canvas=$('#scene'),host=$('#viewer'),audit=auditLayout();
$('#foot').textContent=audit.bedDeskCM+'cm';$('#side').textContent=audit.bedWardrobeCM+'cm（偏紧）';
$('#audit').textContent='柜前净距'+audit.bedWardrobeCM+'cm；600mm圆形通行代理：'+(Object.values(audit.route600).every(Boolean)?'各指定点可达':'部分指定点不可达')+'。仅检验空载通行，不代表取衣、转椅或施工验收。';
const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e9e5dc');const camera=new T.PerspectiveCamera(48,1,.02,50),controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=.5;controls.maxDistance=12;
scene.add(new T.HemisphereLight('#fffaf2','#9fa6a0',2));const sun=new T.DirectionalLight('#fff7e8',2.5);sun.position.set(6,5,0);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:15});sun.target.position.set(1.8,0,1.5);scene.add(sun,sun.target);
const mat=(c,roughness=.8)=>new T.MeshStandardMaterial({color:c,roughness}),white=mat('#f1f2ef'),black=mat('#343a3e'),fabric=mat('#d9dce0'),gray=mat('#979fa4'),floor=mat('#dce0dd'),cabinetFace=mat('#e4e7e5'),linen=mat('#f1f0ed'),throwFabric=mat('#8a969e');
// Fine woven bump texture, not a change to the bed footprint or room dimensions.
const weaveData=new Uint8Array(64*64*4);for(let i=0;i<64*64;i++){const x=i%64,y=Math.floor(i/64),v=150+((x%3===0||y%3===0)?45:0);weaveData.set([v,v,v,255],i*4);}
const weave=new T.DataTexture(weaveData,64,64);weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(12,12);weave.needsUpdate=true;
for(const material of [fabric,linen,throwFabric]){material.bumpMap=weave;material.bumpScale=.0015;material.roughness=.96;}
const wallMat=mat('#f4f3ec');wallMat.transparent=true;wallMat.opacity=.30;const glass=new T.MeshStandardMaterial({color:'#a6c5cb',transparent:true,opacity:.24,roughness:.1,side:T.DoubleSide});
function box(name,r,y,h,m=white,parent=scene,round=.005){const mesh=new T.Mesh(new RoundedBoxGeometry(r[2]-r[0],h,r[3]-r[1],3,round),m);mesh.name=name;mesh.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;}
box('main-floor',d.room,-.07,.07,floor);
box('north-wall',[-.12,-.12,3.62,0],0,2.60,wallMat);box('south-wall',[-.12,2.71,3.62,2.83],0,2.60,wallMat);
box('conditional-west-head-wall',[-.12,0,0,d.door.z-.9],0,2.60,wallMat);box('west-tail-wall',[-.12,d.door.z,0,2.71],0,2.60,wallMat);box('new-door-lintel',[-.12,d.door.z-.9,0,d.door.z],2.12,.48,wallMat);
box('east-north-pier',[3.5,0,3.62,d.bay[1]],0,2.60,wallMat);box('east-south-pier',[3.5,d.bay[3],3.62,2.71],0,2.60,wallMat);
box('retained-solid-bay',d.bay,0,d.sillHeight,white);box('sill-finish',d.bay,d.sillHeight,.015,white);
box('window-glass',[d.bay[2]-.02,d.bay[1],d.bay[2],d.bay[3]],.55,1.70,glass);
for(const z of [d.bay[1],d.bay[3]-.02])box('bay-side-glass',[3.50,z,d.bay[2],z+.02],.55,1.70,glass);
for(const z of [d.bay[1],d.bay[3]-.025])box('window-upright',[d.bay[2]-.03,z,d.bay[2],z+.025],.55,1.70,black);
for(const y of [.55,2.225])box('window-horizontal',[d.bay[2]-.03,d.bay[1],d.bay[2],d.bay[3]],y,.025,black);
const b=d.bed;box('bed-plinth',[b[0]+.07,b[1]+.07,b[2]-.07,b[3]-.07],.03,.16,black);box('bed-frame',b,.19,.15,fabric,scene,.025);box('mattress',d.mattress,.34,.22,linen,scene,.045);
box('headboard-lower',[b[0],b[1],b[0]+.030,b[3]],.34,.31,fabric,scene,.012);
box('headboard-soft-upper',[b[0],b[1],b[0]+.030,b[3]],.658,.43,fabric,scene,.014);
box('duvet',[.62,.06,2.04,1.52],.56,.07,linen,scene,.032);
box('duvet-fold',[.60,.075,.84,1.50],.628,.029,linen,scene,.014);
box('bed-throw',[1.60,.08,2.01,1.50],.630,.021,throwFabric,scene,.010);
for(const z of [.13,.84])box('pillow',[.14,z,.54,z+.61],.56,.13,linen,scene,.045);
const end=d.entryEnd.bounds,w=[end[2],d.wardrobe[1],d.wardrobe[2],d.wardrobe[3]];
// The entrance return replaces22cm within the existing footprint; it does not project into the aisle.
const endBack=mat('#747d81'),endGlow=new T.MeshStandardMaterial({color:'#fff5e8',emissive:'#fff0d9',emissiveIntensity:.6});
function endShelf(y,h=.022){const [x0,z0,x1,z1]=end,rr=d.entryEnd.radius,sh=new T.Shape();sh.moveTo(x0+rr,-z0);sh.lineTo(x1,-z0);sh.lineTo(x1,-z1);sh.lineTo(x0+rr,-z1);sh.quadraticCurveTo(x0,-z1,x0,-z1+rr);sh.lineTo(x0,-z0-rr);sh.quadraticCurveTo(x0,-z0,x0+rr,-z0);const mesh=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false}),white);mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.castShadow=mesh.receiveShadow=true;mesh.name='rounded-entry-shelf';scene.add(mesh);return mesh;}
endShelf(.08,.65);for(const y of d.entryEnd.shelves)endShelf(y);
box('entry-display-recess-back',[end[2]-.023,end[1]+.08,end[2],end[3]-.03],.75,1.732,endBack);
box('entry-return-front',[end[0]+.08,end[1],end[2],end[1]+.022],.73,1.77,white);
// Rounded vertical nose is contained by the original cabinet envelope.
const nose=new T.Shape(),nx=end[0]+.08,nz=end[1]+.08;
nose.moveTo(nx,-end[1]);nose.quadraticCurveTo(end[0],-end[1],end[0],-nz);nose.lineTo(end[0]+.022,-nz);nose.quadraticCurveTo(end[0]+.022,-end[1]-.022,nx,-end[1]-.022);nose.closePath();
const returnPanel=new T.Mesh(new T.ExtrudeGeometry(nose,{depth:1.77,bevelEnabled:false}),white);returnPanel.rotation.x=-Math.PI/2;returnPanel.position.y=.73;returnPanel.name='rounded-entry-divider';returnPanel.castShadow=true;scene.add(returnPanel);
for(const y of [1.34,1.96])box('entry-hidden-display-light',[end[2]-.036,end[1]+.10,end[2]-.025,end[3]-.07],y-.008,.006,endGlow);
for(let i=0;i<3;i++)box('entry-display-book',[end[0]+.05,end[1]+.15+i*.044,end[2]-.035,end[1]+.18+i*.044],.772,.24,i%2?gray:white);
const vase=new T.Mesh(new T.LatheGeometry([new T.Vector2(.035,0),new T.Vector2(.05,.03),new T.Vector2(.055,.09),new T.Vector2(.028,.16),new T.Vector2(.025,.20)],32),gray);vase.position.set(end[0]+.115,1.362,end[1]+.28);vase.castShadow=true;scene.add(vase);
box('wardrobe-back',[w[0],w[3]-.018,w[2],w[3]],.08,2.42);for(const x of [w[0],w[2]-.018])box('wardrobe-side',[x,w[1],x+.018,w[3]],.08,2.42);
for(const y of [.08,1.96,2.482])box('wardrobe-shelf',[w[0]+.018,w[1]+.05,w[2]-.018,w[3]-.018],y,.018);
box('wardrobe-toe',[w[0]+.04,w[1]+.04,w[2]-.04,w[3]-.04],0,.08,black);
const split=(w[0]+w[2])/2,fold=split+.52;
box('wardrobe-middle',[split-.009,w[1]+.05,split+.009,w[3]-.018],.098,2.384);
box('folded-column-side',[fold-.009,w[1]+.05,fold+.009,w[3]-.018],.098,1.862);
// Shallow cabinet: hangers face the user, rails run front-to-back rather than across the cabinet.
for(const y of [1.78]){const x=(w[0]+split)/2;box('short-pullout-rail',[x-.01,w[1]+.085,x+.01,w[3]-.04],y,.02,black);for(let i=0;i<4;i++)box('short-front-facing-clothing',[x-.23,w[1]+.105+i*.08,x+.23,w[1]+.13+i*.08],y-.63,.55,i%3?fabric:gray);}
box('removable-shelf-above-luggage',[w[0]+.018,w[1]+.06,split-.009,w[3]-.018],.90,.018,white);
const longX=split+.26;box('long-pullout-rail',[longX-.01,w[1]+.085,longX+.01,w[3]-.04],1.78,.02,black);for(let i=0;i<4;i++)box('long-front-facing-clothing',[longX-.23,w[1]+.105+i*.08,longX+.23,w[1]+.13+i*.08],.42,1.28,i%2?fabric:gray);
for(const y of [.42,.78,1.14,1.50]){box('folded-shelf',[fold+.009,w[1]+.07,w[2]-.018,w[3]-.018],y,.018);for(let i=0;i<2;i++)box('folded-clothing',[fold+.04,w[1]+.11,w[2]-.05,w[3]-.06],y+.018+i*.045,.04,fabric,scene,.01);}
for(const x of [w[0]+.055,split+.055])box('bedding-box',[x,w[1]+.10,x+(w[2]-w[0])/2-.11,w[3]-.055],1.99,.34,fabric,scene,.018);
const sliding=new T.Group();scene.add(sliding);box('sliding-door',[w[0]+.005,w[1],split+.015,w[1]+.022],.10,1.846,cabinetFace,sliding);box('door-grip',[split-.027,w[1]-.003,split-.019,w[1]+.005],.90,.54,gray,sliding);
const secondDoor=box('second-door',[split-.012,w[1]+.026,w[2]-.005,w[1]+.048],.10,1.846,cabinetFace);
const upperDoors=[];for(const [x0,x1] of [[w[0]+.005,split-.005],[split+.005,w[2]-.005]])upperDoors.push(box('wardrobe-upper-door',[x0,w[1],x1,w[1]+.022],1.982,.50,cabinetFace));
const top=new T.Shape(),r=d.desk,bay=d.bay,pts=[[r[0],r[1]],[r[2],r[1]],[r[2],bay[1]+.02],[bay[2]-.02,bay[1]+.02],[bay[2]-.02,bay[3]-.02],[r[2],bay[3]-.02],[r[2],r[3]],[d.joinery.counter[0],r[3]],[d.joinery.counter[0],d.joinery.counter[1]],[r[0],d.joinery.counter[1]]];pts.forEach(([x,z],i)=>{if(i===pts.length-1){const radius=d.joinery.cornerRadius;top.lineTo(x-radius,-z);top.quadraticCurveTo(x,-z,x,-z+radius);}else if(i)top.lineTo(x,-z);else top.moveTo(x,-z);});top.closePath();
const tabletop=new T.Mesh(new T.ExtrudeGeometry(top,{depth:.025,bevelEnabled:false}),white);tabletop.rotation.x=-Math.PI/2;tabletop.position.y=.725;tabletop.name='connected-tabletop';tabletop.castShadow=tabletop.receiveShadow=true;scene.add(tabletop);
box('bay-top-support',[3.52,bay[1]+.04,bay[2]-.05,bay[3]-.04],.565,.16);box('concealed-rail',[r[0]+.12,r[1]+.04,r[0]+.16,r[3]-.04],.665,.06);const reveal=new T.Mesh(new T.ExtrudeGeometry(top,{depth:.005,bevelEnabled:false}),gray);reveal.rotation.x=-Math.PI/2;reveal.position.y=.720;reveal.name='continuous-table-reveal';scene.add(reveal);
const workstation=new T.Group();workstation.position.x=.20;scene.add(workstation);
box('monitor-foot',[3.08,.995,3.27,1.295],.75,.015,black,workstation);box('monitor-neck',[3.17,1.13,3.20,1.16],.765,.16,black,workstation);box('monitor',[3.17,.840,3.195,1.450],.90,.34,black,workstation);box('monitor-screen',[3.166,.850,3.171,1.440],.91,.32,gray,workstation);box('keyboard',[2.94,.92,3.085,1.36],.75,.012,white,workstation);box('mouse',[3.00,1.44,3.09,1.49],.75,.02,black,workstation);
box('south-display-board',[3.61,1.69,4.04,1.92],.77,.02);box('south-bookcase-back',[3.61,1.902,4.04,1.92],.79,.30,black);for(const x of [3.61,4.022])box('display-side',[x,1.69,x+.018,1.92],.79,.30);box('display-top',[3.61,1.69,4.04,1.92],1.09,.018);for(let i=0;i<6;i++)box('display-book',[3.65+i*.048,1.72,3.68+i*.048,1.88],.79,.22,i%2?white:gray);
// One L-shaped book/storage assembly connected to the wardrobe side. The return stays on the solid south window pier.
const j=d.joinery,s=j.southUpper,e=j.eastBooks;
box('south-joinery-back',[s[0],s[3]-.018,s[2],s[3]],.75,j.top-.75,white);
box('east-joinery-back',[e[2]-.018,e[1],e[2],e[3]],.75,j.top-.75,white);
box('joinery-open-dark-back',[s[0]+.018,s[3]-.025,s[2]-.018,s[3]-.018],j.shelfBottom+.018,j.upperBottom-j.shelfBottom-.018,endBack);
for(const y of [j.shelfBottom,1.56,j.upperBottom,j.top-.018]){
 box('south-book-shelf',s,y,.018,white);
 box('east-book-shelf',e,y,.018,white);
}
box('upper-side',[s[0],s[1],s[0]+.018,s[3]],j.shelfBottom,j.top-j.shelfBottom,white);
box('window-book-end',[e[0],e[1],e[2],e[1]+.018],j.shelfBottom,j.top-j.shelfBottom,white);
box('south-book-divider',[3.17,s[1],3.188,s[3]],j.shelfBottom,1.56-j.shelfBottom,white);
for(const [x0,x1] of [[s[0]+.004,3.175],[3.185,s[2]-.004]])box('joinery-upper-door',[x0,s[1]-.004,x1,s[1]+.014],j.upperBottom+.024,j.top-j.upperBottom-.028,cabinetFace);
for(const y of [j.shelfBottom+.018]){
 for(let i=0;i<6;i++)box('south-stored-book',[2.91+i*.04,2.49,2.939+i*.04,2.66],y,.20+(i%2)*.015,i%2?fabric:gray);
 for(let i=0;i<5;i++)box('east-stored-book',[3.29,2.06+i*.053,3.46,2.092+i*.053],y,.20+(i%2)*.015,i%2?white:gray);
}
box('corner-photo-frame',[3.25,2.56,3.44,2.58],1.20,.21,black);box('corner-photo',[3.262,2.558,3.428,2.562],1.213,.184,fabric);
box('horizontal-display-book',[2.95,2.50,3.16,2.65],1.578,.025,gray);
box('small-display-object',[3.25,2.54,3.34,2.63],1.578,.13,white,scene,.028);
const strip=new T.MeshStandardMaterial({color:'#fff0d6',emissive:'#ffe4b5',emissiveIntensity:1.1});
box('shelf-diffuser',[s[0]+.035,s[1]+.025,s[2]-.025,s[1]+.037],j.shelfBottom-.006,.006,strip);
box('book-return-diffuser',[e[0]+.025,e[1]+.025,e[0]+.037,e[3]],j.shelfBottom-.006,.006,strip);
const n=j.northBooks;
box('north-window-pier-backing',[n[2]-.018,n[1],n[2],n[3]],.75,j.top-.75,white);
for(const z of [n[1],n[3]-.018])box('north-book-side',[n[0],z,n[2],z+.018],.75,j.top-.75,white);
for(const y of [.75,1.18,1.96,2.482])box('north-book-shelf',n,y,.018,white);
for(let i=0;i<4;i++)box('north-stored-book',[3.28,.055+i*.052,3.46,.088+i*.052],1.198,.23,i%2?gray:white);
box('north-upper-closed-door',[n[0],n[1]+.004,n[0]+.018,n[3]-.004],1.982,.50,cabinetFace);
box('window-top-unifying-trim',j.windowHeader,j.headerBottom,j.top-j.headerBottom,white);
// Open-roof model: installed fittings remain visible, without an opaque slab hiding the furniture.
const fittings=new T.Group();fittings.name='ceiling-lighting-ac';scene.add(fittings);
const eq=d.equipment,ch=eq.ceilingHeight,t=eq.trimWidth;
for(const r of [[0,0,3.50,t],[0,2.71-t,3.50,2.71],[0,t,t,2.71-t],[3.50-t,t,3.50,2.71-t]])box('single-eyelid-edge',r,ch-eq.trimDrop,eq.trimDrop,white,fittings);
const lampFace=new T.MeshStandardMaterial({color:'#fffaf2',emissive:'#fff2df',emissiveIntensity:1.0});
const ml=eq.mainLight,lampX=(ml[0]+ml[2])/2,lampZ=(ml[1]+ml[3])/2,lampRadius=(ml[2]-ml[0])/2;
function ceilingDisc(name,r,h,y,m){const mesh=new T.Mesh(new T.CylinderGeometry(r,r,h,80),m);mesh.position.set(lampX,y+h/2,lampZ);mesh.name=name;mesh.castShadow=true;fittings.add(mesh);}
ceilingDisc('thin-white-circular-main-light',lampRadius,.040,eq.mainLightBottom,white);
ceilingDisc('circular-light-fine-reveal',lampRadius-.003,.004,eq.mainLightBottom-.003,gray);
ceilingDisc('circular-opal-diffuser',lampRadius-.012,.005,eq.mainLightBottom-.006,lampFace);
const fill=new T.PointLight('#fff1db',4,4,2);fill.position.set(1.75,2.42,1.35);fittings.add(fill);
// Monitor task light directs light onto desk, not towards the sleeper.
box('monitor-task-light',[3.355,.91,3.395,1.38],1.267,.028,black,fittings);
box('task-light-diffuser',[3.354,.94,3.396,1.35],1.263,.006,lampFace,fittings);
const task=new T.PointLight('#fff5e9',.65,1.25,2);task.position.set(3.25,1.22,1.14);fittings.add(task);
box('bedside-reading-base',[.005,1.58,.035,1.68],1.30,.12,black,fittings);
box('bedside-reading-head',[.03,1.59,.11,1.66],1.37,.035,black,fittings);
box('bedside-reading-lens',[.065,1.599,.102,1.651],1.365,.008,lampFace,fittings);
box('entry-smart-switch',[.005,1.565,.02,1.65],1.05,.085,white,fittings);
const ac=eq.ac;
box('1.5P-wall-air-conditioner',ac,eq.acBottom,eq.acHeight,white,fittings,.032);
box('ac-outlet',[ac[0]+.06,ac[3]-.017,ac[2]-.06,ac[3]+.006],eq.acBottom+.027,.045,black,fittings);
box('ac-louver',[ac[0]+.065,ac[3],ac[2]-.065,ac[3]+.025],eq.acBottom+.025,.012,gray,fittings);
box('ac-status',[ac[2]-.12,ac[3],ac[2]-.06,ac[3]+.002],eq.acBottom+.17,.02,gray,fittings);
box('reserved-ac-socket',[3.055,.005,3.135,.021],2.15,.08,white,fittings);
const chair=new T.Group();scene.add(chair);const c=d.chair,cx=(c[0]+c[2])/2,cz=(c[1]+c[3])/2;
box('chair-seat',[c[0]+.07,c[1]+.055,c[2]-.04,c[3]-.055],.43,.06,fabric,chair,.025);box('chair-back',[c[0]+.065,c[1]+.05,c[0]+.10,c[3]-.05],.49,.48,black,chair,.02);box('chair-lift',[cx-.025,cz-.025,cx+.025,cz+.025],.08,.35,black,chair);
for(let i=0;i<5;i++){const a=i*Math.PI*2/5,dx=Math.cos(a)*.24,dz=Math.sin(a)*.24;const leg=new T.Mesh(new T.BoxGeometry(.25,.025,.025),black);leg.position.set(cx+dx/2,.075,cz+dz/2);leg.rotation.y=-a;chair.add(leg);box('caster',[cx+dx-.025,cz+dz-.025,cx+dx+.025,cz+dz+.025],.02,.04,black,chair,.009);}
const doorPivot=new T.Group();doorPivot.position.set(d.door.x,0,d.door.z);scene.add(doorPivot);box('conditional-door',[-.018,-.9,.018,0],.02,2.10,white,doorPivot);box('door-handle',[.018,-.80,.075,-.67],.96,.018,black,doorPivot);
function plan(){svg.replaceChildren();svg.setAttribute('viewBox','-.38 -.30 4.87 3.36');const add=(tag,attrs,text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text)e.textContent=text;svg.append(e);return e;},rect=(r,color)=>add('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill:color,stroke:'#85897e','stroke-width':.016}),label=(x,z,t,s=.09)=>{if($('#labels').checked)add('text',{x,y:z,'text-anchor':'middle','font-size':s,fill:'#383b35'},t);};
 rect(d.room,'#f1eee7');rect(d.bay,'#d6dfdc');rect(d.bed,'#d6d9d9');rect([.02,.02,.08,1.56],'#60696b');rect(d.wardrobe,'#f7f7f2');rect(d.entryEnd.bounds,'#a6adaf');rect(d.desk,'#f9f9f5');rect(d.joinery.counter,'#f9f9f5');rect(d.joinery.cornerReserve,'#f9f9f5');for(const b of [d.joinery.southUpper,d.joinery.eastBooks,d.joinery.northBooks])add('rect',{x:b[0],y:b[1],width:b[2]-b[0],height:b[3]-b[1],fill:'none',stroke:'#66735b','stroke-width':.02,'stroke-dasharray':'.035 .02'});rect(chairAt($('#pull').checked),'#98a494');
 label(1.75,-.13,'3.50m');label(1.05,.70,'1.5×2m床',.12);label(.30,.22,'床头',.08);label(1.83,2.45,'158cm衣柜＋22cm端景',.088);label(3.06,2.23,'一体转角书柜',.07);label(3.81,1.06,'原飘窗保留',.08);label(3.81,1.21,'非腿部空间',.075);
 const dim=(x1,z1,x2,z2,t)=>{add('line',{x1,y1:z1,x2,y2:z2,stroke:'#94774e','stroke-width':.018});label((x1+x2)/2,(z1+z2)/2-.05,t,.09);};
 dim(d.bed[2],.45,d.desk[0],.45,'95cm');dim(1.55,d.bed[3],1.55,d.wardrobe[1],audit.bedWardrobeCM+'cm');label(2.73,1.17,'椅',.09);label(.45,1.90,'新门→',.075);
 add('line',{x1:0,y1:d.originalDoor.z-.9,x2:0,y2:d.originalDoor.z,stroke:'#918e87','stroke-width':.065,'stroke-dasharray':'.05 .025'});add('line',{x1:0,y1:d.door.z-.9,x2:0,y2:d.door.z,stroke:'#fbfaf6','stroke-width':.08});
 const angle=$('#door').checked?Math.PI/2:0;add('path',{d:`M${d.door.x} ${d.door.z-.9} A.9 .9 0 0 1 ${d.door.x+.9} ${d.door.z}`,fill:'none',stroke:'#ad7e47','stroke-width':.018,'stroke-dasharray':'.035 .025'});add('line',{x1:d.door.x,y1:d.door.z,x2:d.door.x+.9*Math.sin(angle),y2:d.door.z-.9*Math.cos(angle),stroke:'#ad7e47','stroke-width':.036});
 label(-.17,.8,'166cm',.08);label(1.75,2.92,'门洞南移45cm：条件试排，未确认墙体可改',.079);
}
function state(){doorPivot.rotation.y=$('#door').checked?-Math.PI/2:0;sliding.position.x=$('#ward').checked?(w[2]-w[0])/2-.04:0;const showDoors=!$('#interior').checked;sliding.visible=secondDoor.visible=showDoors;upperDoors.forEach(o=>o.visible=showDoors);chair.position.x=$('#pull').checked?-d.pull:0;fittings.visible=$('#fittings').checked;wallMat.opacity=1-Number($('#opacity').value)/100;plan();$('#note').textContent=$('#pull').checked?'椅子后拉30cm，椅后距床尾约5cm；实际入座转身仍待核。':'室内桌深45cm＋原飘窗展示面；床尾95cm，浅柜前63cm；顶面、灯和挂机为拟装位置。';}
function resize(){renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}
function view(v){canvas.hidden=v==='plan';svg.hidden=v!=='plan';svg.toggleAttribute('hidden',v!=='plan');document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
 const cams={corner:[[.25,1.75,.80],[1.95,1.25,2.50],65],whole:[[-1.8,5.1,-2.5],[1.9,.55,1.3],46],top:[[1.8,7,1.35],[1.8,0,1.351],43],entry:[[.04,1.62,2.0],[2.6,.95,.95],72],desk:[[2.44,1.65,1.76],[3.7,1.1,1.15],65]};
 if(cams[v]){const[p,t,f]=cams[v];camera.up.set(0,1,0);controls.enableDamping=false;controls.update();camera.position.fromArray(p);controls.target.fromArray(t);camera.fov=f;controls.maxPolarAngle=v==='top'?Math.PI/2:Math.PI*.49;if(v==='whole'&&host.clientHeight>host.clientWidth)camera.position.sub(controls.target).multiplyScalar(1.35).add(controls.target);controls.update();controls.enableDamping=true;}resize();}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));for(const id of ['door','ward','interior','pull','opacity','labels','fittings'])$('#'+id).oninput=state;
new ResizeObserver(resize).observe(host);state();view(new URLSearchParams(location.search).get('view')==='corner'?'corner':'whole');$('#busy').hidden=true;renderer.setAnimationLoop(()=>{controls.update();if(!canvas.hidden)renderer.render(scene,camera);});
