import {mountSimpleBath} from './master-simple-bath.js?v=unified-91';
import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/render-libs.js';
const scene=new T.Scene();scene.background=new T.Color('#ede9df');const camera=new T.PerspectiveCamera(65,innerWidth/innerHeight,.02,30);
const renderer=new T.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;
scene.add(new T.HemisphereLight('#fffdf3','#9d978b',2.5));const light=new T.DirectionalLight('#fff1dc',2);light.position.set(2,5,3);scene.add(light);
const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.65});const stone=mat('#dfdbce'),white=mat('#faf8ed'),wood=mat('#c6b99e'),metal=mat('#606e65');
function box(r,y,h,m=stone){const o=new T.Mesh(new T.BoxGeometry(r[2]-r[0],h,r[3]-r[1]),m);o.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);scene.add(o);return o;}
function cyl(x,z,y,r,h,m=white){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,48),m);o.position.set(x,y+h/2,z);scene.add(o);return o;}
box([0,0,2.15,2.05],-.07,.07);const walls=[box([0,0,.1,2.05],0,2.6),box([0,0,.35,.1],0,2.6),box([.95,0,2.15,.1],0,2.6),box([.35,0,.95,.1],0,.9),box([.35,0,.95,.1],2.1,.5),box([2.05,0,2.15,2.05],0,2.6)];
// Window position from existing opening schedule; window width/offset remain provisional.
const windowGlass=new T.MeshStandardMaterial({color:'#dce8df',transparent:true,opacity:.28});
box([.35,.035,.95,.05],.9,1.2,windowGlass);
for(const x of [.35,.64,.935])box([x,.025,x+.015,.065],.9,1.2,metal);
for(const y of [.9,2.085])box([.35,.025,.95,.065],y,.015,metal);
// Single-track surface slider on bedroom face, same 85cm opening.
box([0,2.05,2.15,3.42],-.075,.065,mat('#d7d1c4'));
const exterior=[box([0,2.12,.65,2.87],0,2.52,wood),box([1.95,2.769,2.8,3.369],0,2.52,wood)];
const frontWalls=[box([0,1.95,1.1,2.05],0,2.1),box([1.95,1.95,2.15,2.05],0,2.1)];
// Retain the original inward-opening timber door in its original opening.
const outerDoor=new T.Group();outerDoor.position.set(1.95,0,2.05);scene.add(outerDoor);
const outerLeaf=new T.Mesh(new T.BoxGeometry(.85,2.1,.035),wood);outerLeaf.position.set(-.425,1.05,0);outerDoor.add(outerLeaf);
const outerPull=new T.Mesh(new T.BoxGeometry(.10,.025,.06),metal);outerPull.position.set(-.74,1.02,.025);outerDoor.add(outerPull);
let outerOpen=true,outerAngle=-Math.PI/2;
document.getElementById('outer-door').onclick=()=>{outerOpen=!outerOpen;document.getElementById('outer-door').textContent=outerOpen?'关原木门':'开原木门';};
function updateOuter(){outerAngle+=((outerOpen?-Math.PI/2:0)-outerAngle)*.12;outerDoor.rotation.y=outerAngle;}

const simpleBath=mountSimpleBath({scene});
let mirrorInside=false,currentView='entry';
document.getElementById('mirror-storage').onclick=()=>{mirrorInside=!mirrorInside;simpleBath.update({mirrorInside,view:currentView});document.getElementById('mirror-storage').textContent=mirrorInside?'关左右镜柜门':'开左右镜柜门';};
function label(text,x,z){const c=document.createElement('canvas');c.width=512;c.height=80;const ctx=c.getContext('2d');ctx.fillStyle='#faf8f0';ctx.fillRect(0,0,512,80);ctx.fillStyle='#465349';ctx.font='30px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,52);const sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),depthTest:false}));sp.position.set(x,.12,z);sp.scale.set(.95,.15,1);scene.add(sp);return sp;}
const labels=[label('窗户',.65,.05),label('原位面盆',.38,1.50),label('马桶',.50,.60),label('淋浴',1.63,.55)];
const positions={shower:[[1.35,1.60,1.55],[1.7,1.35,.15]],entry:[[1.15,1.65,2.45],[1.0,.95,.6]],top:[[1.07,4.5,1.08],[1.07,0,1.07]],toilet:[[1.25,1.60,1.10],[.4,.7,.55]],wash:[[1.40,1.55,1.5],[.10,1.15,1.5]]};
function view(id){const [p,t]=positions[id];camera.position.set(...p);controls.target.set(...t);walls.forEach(w=>w.visible=id!=='top');exterior.forEach(w=>w.visible=id!=='top');frontWalls.forEach(w=>w.visible=id!=='top'&&id!=='entry');currentView=id;simpleBath.update({mirrorInside,view:id});labels.forEach(l=>l.visible=id==='top');document.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.id===id));controls.update();}for(const id of Object.keys(positions))document.getElementById(id).onclick=()=>view(id);view('entry');
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});renderer.setAnimationLoop(()=>{updateOuter();simpleBath.tick();controls.update();renderer.render(scene,camera)});
