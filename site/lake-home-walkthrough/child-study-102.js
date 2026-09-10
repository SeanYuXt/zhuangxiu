import * as T from './vendor/three.module.js';
import {OrbitControls,RoundedBoxGeometry} from './vendor/render-libs.js';
const d=await(await fetch('./child-study-102.json')).json(),host=document.querySelector('#viewer'),canvas=document.querySelector('canvas'),svg=document.querySelector('#plan');
const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e9e5dc');const camera=new T.PerspectiveCamera(65,1,.02,30),controls=new OrbitControls(camera,canvas);controls.enableDamping=true;
scene.add(new T.HemisphereLight('#fffaf4','#a5a29a',2.1));const sun=new T.DirectionalLight('#fff8ef',2.4);sun.position.set(6,5,1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:15});scene.add(sun);
const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.8}),white=mat('#edece5'),wood=mat('#bfaa8c'),fabric=mat('#b6beb6'),linen=mat('#e6dfd0'),dark=mat('#454c48'),wall=mat('#f4f1ea');
function box(name,r,y,h,m=white,parent=scene,rad=.008){const o=new T.Mesh(new RoundedBoxGeometry(r[2]-r[0],h,r[3]-r[1],3,rad),m);o.name=name;o.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function roundedShape(w,h,r){const s=new T.Shape();s.moveTo(r,0);s.lineTo(w-r,0);s.quadraticCurveTo(w,0,w,r);s.lineTo(w,h-r);s.quadraticCurveTo(w,h,w-r,h);s.lineTo(r,h);s.quadraticCurveTo(0,h,0,h-r);s.lineTo(0,r);s.quadraticCurveTo(0,0,r,0);return s;}
function curvedVolume(name,r,y,h,radius,m=white){const shape=roundedShape(r[2]-r[0],r[3]-r[1],radius),g=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:20});g.rotateX(-Math.PI/2);const o=new T.Mesh(g,m);o.position.set(r[0],y,r[3]);o.name=name;o.castShadow=o.receiveShadow=true;scene.add(o);return o;}
function curvedFront(name,x,y,z,w,h,depth,radius,m){const g=new T.ExtrudeGeometry(roundedShape(w,h,radius),{depth,bevelEnabled:false,curveSegments:20}),o=new T.Mesh(g,m);o.name=name;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;scene.add(o);return o;}
box('floor',d.room,-.06,.06,wood);const walls=[];for(const r of [[0,-.10,3.5,0],[0,2.7,3.5,2.8],[-.10,0,0,1.35],[-.1,2.25,0,2.7],[3.5,0,3.62,.34],[3.5,1.95,3.62,2.7]])walls.push(box('wall',r,0,2.6,wall));box('door-lintel',[-.10,1.35,0,2.25],2.12,.48,wall);
box('retained-bay',d.bay,0,d.sillHeight,white);const glass=new T.MeshStandardMaterial({color:'#b6d1d3',transparent:true,opacity:.20,roughness:.12,side:T.DoubleSide});box('window-glass',[4.09,.34,4.11,1.95],.55,1.70,glass);for(const z of[.34,1.93]){box('side-glass',[3.5,z,4.1,z+.02],.55,1.70,glass);box('frame',[4.08,z,4.11,z+.02],.55,1.7,dark);}for(const y of[.55,2.225])box('frame',[4.08,.34,4.11,1.95],y,.025,dark);
box('removable-bay-cushion',[3.54,.40,4.05,1.87],.55,.055,fabric,scene,.025);box('bay-pillow',[3.83,.53,4.03,.93],.605,.25,linen,scene,.04);
const b=d.bed;box('bed-frame',b,.16,.18,wood,scene,.025);box('mattress',[b[0]+.02,b[1]+.04,b[2]-.02,b[3]-.02],.34,.20,linen,scene,.04);box('wall-backed-headboard',[b[0],0,b[2],.055],.20,.80,fabric,scene,.018);box('duvet',[b[0]+.015,.52,b[2]-.015,2.055],.54,.07,linen,scene,.035);for(const x of[b[0]+.08,b[0]+.81])box('pillow',[x,.10,x+.61,.49],.54,.13,white,scene,.05);box('bed-throw',[b[0]+.015,1.65,b[2]-.015,2.03],.615,.022,fabric);
const w=d.wardrobe,wardrobeFronts=[];
box('wardrobe-back',[0,.02,.018,1.22],.06,2.44,wood);
for(const z of[.02,.611,1.202])box('wardrobe-side',[0,z,.46,z+.018],.06,2.44,white);
for(const y of[.06,.68,.80,2.18,2.482])box('wardrobe-shelf',[0,.02,.46,1.22],y,.018,wood);
// Full upper sliding fronts above desk height. Inspection hides doors, not a simulated opening mechanism.
for(let i=0;i<2;i++){
 wardrobeFronts.push(box('upper-sliding-front',[.465+i*.022,.025+i*.592,.483+i*.022,.626+i*.592],.825,1.65,white));
 wardrobeFronts.push(box('lower-sliding-front',[.465+i*.022,.025+i*.592,.483+i*.022,.626+i*.592],.085,.575,white));
 const z=.32+i*.59;
 box('front-back-pullout-rail',[.055,z-.014,.42,z+.014],2.035,.025,dark);
 for(let j=0;j<4;j++){
 const x=.09+j*.075;
 box('hanger',[x,z-.22,x+.018,z+.22],1.95,.025,wood);
 box('short-clothes',[x-.008,z-.19,x+.025,z+.19],1.02, .92,j%2?fabric:linen);
 }
 for(let j=0;j<3;j++)box('folded-clothes',[.08,.09+i*.59,.39,.52+i*.59],2.20+j*.055,.045,j%2?fabric:linen);
 box('seasonal-storage',[.06,.08+i*.59,.41,.55+i*.59],.11,.45,linen);
}
// Shallow rounded end treatment, not a large opening carved out of storage.
curvedVolume('rounded-end-trim',[.43,1.17,.505,1.22],.085,2.395,.025,white);
const blue=mat('#a4b2b1'),glow=new T.MeshStandardMaterial({color:'#fff1d6',emissive:'#ffdf9c',emissiveIntensity:1});
box('study-wall-panel',[.54,.003,1.84,.025],.76,.70,blue);
curvedVolume('continuous-rounded-desktop',d.desktop,.72,.03,.065,wood);
for(const x of[.56,1.80]){box('support-arm',[x,.025,x+.025,.58],.70,.018,dark);box('wall-plate',[x,.012,x+.04,.032],.51,.19,dark);}
box('cable-tray',[.60,.025,1.78,.075],.66,.035,dark);
box('monitor-arm',[1.42,.09,1.45,.12],.75,.26,dark);box('monitor',[1.10,.13,1.70,.16],1.01,.34,dark);box('monitor-screen',[1.116,.161,1.684,.164],1.026,.308,mat('#91a3a8'));
box('keyboard',[1.17,.25,1.53,.39],.752,.014,dark);box('mouse',[1.66,.27,1.73,.35],.752,.022,dark);
box('open-textbook',[.62,.11,1.04,.40],.752,.012,linen);box('writing-book',[.64,.42,1.06,.70],.752,.010,white);box('pen',[1.08,.44,1.09,.64],.754,.009,dark);
box('mini-pc',[1.75,.06,1.83,.24],.75,.20,white);
box('bedside-phone',[1.59,.47,1.66,.61],.754,.009,dark);
const coaster=new T.Mesh(new T.CylinderGeometry(.045,.045,.006,32),fabric);coaster.position.set(1.76,.756,.58);scene.add(coaster);
const cup=new T.Mesh(new T.CylinderGeometry(.033,.028,.09,32),white);cup.position.set(1.76,.804,.58);scene.add(cup);
// Books remain over the desk, not above the bed.
const u=d.upperCabinet;curvedFront('small-curved-upper',u.rect[0],u.bottom,u.rect[1],.70,u.height,.22,.08,white);
box('upper-door-seam',[.885,.247,.891,.249],2.21,.26,wood);
for(const y of d.bookShelves.levels)curvedVolume('book-shelf',d.bookShelves.rect,y,.020,.035,wood);
box('book-divider',[1.15,.035,1.168,.27],1.50,.66,white);
for(const y of[1.50,1.84])for(let i=0;i<11;i++)box('textbook',[.59+i*.042,.05,.62+i*.042,.265],y,.27+(i%3)*.013,i%3===0?blue:i%3===1?linen:white);
for(let i=0;i<3;i++)box('document-file',[1.23+i*.09,.06,1.30+i*.09,.265],1.50,.295,i%2?white:blue);
box('display-photo-frame',[1.28,.075,1.49,.095],1.84,.25,wood);box('display-photo',[1.295,.096,1.475,.099],1.855,.22,linen);
const toy=new T.Mesh(new T.SphereGeometry(.06,24,16),blue);toy.position.set(1.68,1.91,.14);scene.add(toy);
box('concealed-desk-light',[.60,.25,1.78,.26],1.468,.008,glow);
// Conceptual wall-mounted indoor unit; no inferred existing pipe location.
const ac=d.airConditioner;box('air-conditioner',ac.rect,ac.bottom,ac.height,white,scene,.045);
box('ac-outlet',[2.25,2.448,2.93,2.454],2.188,.045,dark);
for(let i=0;i<5;i++)box('ac-louver',[2.26,2.443,2.92,2.448],2.192+i*.008,.003,white);
box('ac-status-light',[2.88,2.448,2.93,2.454],2.34,.009,glow);
box('headboard-oak-cap',[b[0],.003,b[2],.065],1.005,.022,wood);
box('headboard-light',[b[0]+.06,.006,b[2]-.06,.014],1.035,.008,glow);
const chair=new T.Group();scene.add(chair);box('chair-seat',[-.255,-.255,.255,.255],.43,.06,fabric,chair,.025);box('chair-back',[.255,-.255,.29,.255],.48,.43,fabric,chair,.02);box('chair-stem',[-.025,-.025,.025,.025],.08,.35,dark,chair);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,o=new T.Mesh(new T.BoxGeometry(.31,.025,.025),dark);o.position.set(Math.cos(a)*.15,.08,Math.sin(a)*.15);o.rotation.y=-a;chair.add(o);}
const pivot=new T.Group();pivot.position.set(d.door.hinge[0],0,d.door.hinge[1]);scene.add(pivot);box('original-door',[-.02,-.9,.02,0],.02,2.1,wood,pivot);box('handle',[.02,-.81,.08,-.69],.96,.02,dark,pivot);
let pulled=false,open=true;function update(){const p=d.chair[pulled?'seated':'parked'];chair.position.set(p[0],0,p[1]);chair.rotation.y=-Math.PI/2;pivot.rotation.y=open?-Math.PI/2:0;document.querySelector('#chair').textContent=pulled?'收回椅子':'拉出椅子';document.querySelector('#door').textContent=open?'关门':'开门';document.querySelector('#note').textContent='衣柜120×50cm：两仓短衣区＋上格叠放，取消大书洞；桌板仅穿腰线。柜内视图隐藏门板示意，挂衣杆/移门五金及取物待核。';plan();}
function plan(){svg.replaceChildren();svg.setAttribute('viewBox','-.35 -.3 4.8 3.45');const add=(tag,a,t)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(a))e.setAttribute(k,v);if(t)e.textContent=t;svg.append(e);};const rect=(r,c)=>add('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill:c,stroke:'#777d70','stroke-width':.012});const label=(x,z,t)=>add('text',{x,y:z,'text-anchor':'middle','font-size':.09,fill:'#373731'},t);rect(d.room,'#fcfaf5');rect(d.bay,'#d7e2db');rect(b,'#c3ccc1');rect(w,'#e8e4d9');rect(d.desktop,'#ceba9e');const c=d.chair[pulled?'seated':'parked'];add('circle',{cx:c[0],cy:c[1],r:.325,fill:'#a9b6ac66',stroke:'#657c72','stroke-width':.01});label(1.19,.49,'130×70学习桌');label(.25,.63,'衣柜');label(.25,.79,'120×50');label(2.63,1.13,'床垫150×200');label(1.16,1.63,'床侧136cm');label(2.60,2.43,'床尾62cm');label(3.8,1.03,'床边飘窗');label(1.75,-.12,'350cm');const tip=open?[.85,2.25]:[-.05,1.35];add('line',{x1:-.05,y1:2.25,x2:tip[0],y2:tip[1],stroke:'#aa8056','stroke-width':.035});add('path',{d:'M-.05 1.35 A.9 .9 0 0 1 .85 2.25',fill:'none',stroke:'#aa8056','stroke-width':.012,'stroke-dasharray':'.04 .03'});label(.48,2.53,'原门洞/原开向');label(1.85,2.93,'主体350×270cm · 独立试排，未并入全屋');}
function view(v){wardrobeFronts.forEach(o=>o.visible=v!=='inside');if(v==='knee'){pulled=true;update();chair.visible=false;}else chair.visible=true;svg.hidden=v!=='plan';canvas.hidden=v==='plan';walls.forEach(o=>o.visible=v!=='top');const views={inside:[[1.60,1.60,1.72],[.20,1.35,.64],72],wardrobe:[[1.60,1.60,1.72],[.20,1.35,.64],72],ac:[[1.45,1.62,1.12],[2.59,2.25,2.64],66],room:[[1.00,1.63,2.57],[1.97,1.12,.48],76],study:[[1.20,1.52,1.94],[1.20,1.16,.12],66],bay:[[1.35,1.55,1.70],[3.85,.90,1.1],70],knee:[[1.18,.40,1.20],[1.18,.40,.15],70],top:[[1.75,6,1.351],[1.75,0,1.35],48]};if(views[v]){const[p,t,f]=views[v];camera.position.fromArray(p);controls.target.fromArray(t);camera.fov=f;controls.update();}document.querySelectorAll('[data-view]').forEach(e=>e.classList.toggle('active',e.dataset.view===v));resize();}
function resize(){renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}document.querySelectorAll('[data-view]').forEach(e=>e.onclick=()=>view(e.dataset.view));document.querySelector('#chair').onclick=()=>{pulled=!pulled;chair.visible=true;update();};document.querySelector('#door').onclick=()=>{open=!open;update();};new ResizeObserver(resize).observe(host);update();view(new URLSearchParams(location.search).get('view')||'room');renderer.setAnimationLoop(()=>{controls.update();if(!canvas.hidden)renderer.render(scene,camera);});window.child102={d,scene,view};
