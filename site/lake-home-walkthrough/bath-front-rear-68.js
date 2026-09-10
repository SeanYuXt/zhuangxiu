import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/render-libs.js';
const scene=new T.Scene();scene.background=new T.Color('#ede9df');const camera=new T.PerspectiveCamera(65,innerWidth/innerHeight,.02,30);
const renderer=new T.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;
scene.add(new T.HemisphereLight('#fffdf3','#9d978b',2.5));const light=new T.DirectionalLight('#fff1dc',2);light.position.set(2,5,3);scene.add(light);
const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.65});const stone=mat('#dfdbce'),white=mat('#faf8ed'),wood=mat('#c6b99e'),metal=mat('#606e65');
function box(r,y,h,m=stone){const o=new T.Mesh(new T.BoxGeometry(r[2]-r[0],h,r[3]-r[1]),m);o.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);scene.add(o);return o;}
function cyl(x,z,y,r,h,m=white){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,48),m);o.position.set(x,y+h/2,z);scene.add(o);return o;}
box([0,0,2.15,2.05],-.07,.07);const walls=[box([0,0,.1,2.05],0,2.6),box([0,0,2.15,.1],0,2.6),box([2.05,0,2.15,2.05],0,2.6)];
// Existing door opening retained; new exterior surface slider is conditional.
const door=box([1.1,2.07,1.95,2.10],0,2.1,wood);let opened=false;function toggle(){opened=!opened;door.position.x+=opened?-.86:.86;}toggle();document.querySelector('#door').onclick=toggle;
// Unverified previous enclosure remains a reserved floor area, not an invented solid wall.
for(const r of [[0,1.35,.45,1.95],[.35,1.1,.45,1.35]]){const o=box(r,.006,.015,mat('#c8b99b'));const edges=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(r[2]-r[0],.03,r[3]-r[1])),new T.LineDashedMaterial({color:'#967b52',dashSize:.04,gapSize:.03}));edges.position.copy(o.position);edges.computeLineDistances();scene.add(edges);}
// Toilet faces the entrance axis, offset to left; 45cm to wall and 50cm to shower screen.
box([.36,.12,.74,.29],.08,.65,white);box([.40,.28,.70,.69],.07,.32,white);const seat=cyl(.55,.51,.39,.18,.055);seat.scale.z=1.25;const hole=cyl(.55,.52,.447,.115,.004,mat('#aeb7aa'));hole.scale.z=1.34;
box([.51,.17,.59,.22],.735,.008,metal);
// Basin along front wall, faces rear; original door conflicts so slider is conditional.
box([.45,1.55,1.35,1.95],.32,.46,wood);box([.45,1.55,1.35,1.95],.78,.045,white);box([.62,1.60,1.17,1.84],.826,.005,mat('#bdc3b7'));cyl(.9,1.89,.82,.013,.18,metal);box([.888,1.76,.912,1.90],.98,.02,metal);
const mirror=box([.46,1.925,1.34,1.95],1.1,.85,new T.MeshStandardMaterial({color:'#b8c6bd',metalness:.8,roughness:.12}));
box([1.15,.1,2.05,1],.004,.008,mat('#bfcdc4'));cyl(1.95,.5,.95,.013,1.1,metal);box([1.62,.49,1.97,.51],2.02,.02,metal);cyl(1.65,.5,1.99,.10,.015,metal);
const glass=new T.MeshPhysicalMaterial({color:'#b7d1c8',transparent:true,opacity:.35,roughness:.18,side:T.DoubleSide,depthWrite:false});box([1.045,.1,1.055,.75],.015,2,glass);box([1.045,.74,1.055,.75],.015,2,metal);box([1.045,.1,1.055,.75],2.01,.008,metal);
function label(text,x,z){const c=document.createElement('canvas');c.width=512;c.height=80;const ctx=c.getContext('2d');ctx.fillStyle='#faf8f0';ctx.fillRect(0,0,512,80);ctx.fillStyle='#465349';ctx.font='30px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,52);const sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),depthTest:false}));sp.position.set(x,.12,z);sp.scale.set(.95,.15,1);scene.add(sp);return sp;}
const labels=[label('马桶侧距 45 / 50cm',.55,.8),label('淋浴 90×90cm',1.60,.55),label('台盆 90×40cm',.9,1.7),label('存疑范围 · 待核',.45,1.78)];
const positions={entry:[[1.40,1.60,2.32],[.90,1.2,1.80]],top:[[1.07,4.1,2.4],[1.07,0,1.02]],toilet:[[1.15,1.60,1.55],[.55,.7,.5]]};
function view(id){const [p,t]=positions[id];camera.position.set(...p);controls.target.set(...t);walls.forEach(w=>w.visible=id!=='top');mirror.visible=id!=='top';labels.forEach(l=>l.visible=id==='top');document.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.id===id));controls.update();}for(const id of Object.keys(positions))document.getElementById(id).onclick=()=>view(id);view('top');
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera)});
