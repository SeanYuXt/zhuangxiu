import * as T from './vendor/three.module.js';
import {GLTFLoader,RGBELoader,OrbitControls,RoundedBoxGeometry} from './vendor/render-libs.js';

const spec=await(await fetch('./plan-spec.json')).json();
const rect=(x0,z0,x1,z1)=>({x0,z0,x1,z1});
// All dimensions below are metres in the existing scene axes, not compass directions.
const study={shift:.60,bed:rect(.805,2.60,2.8975,4.16),wardrobe:rect(.82,4.78,2.52,5.38),desk:rect(.82,2.04,1.82,2.49),seated:rect(1.02,2.49,1.62,3.14),windowFront:1.9995,rightWall:3.61};
const canvas=document.querySelector('#scene'),host=document.querySelector('#viewport'),svg=document.querySelector('#plan');
const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;
const scene=new T.Scene();scene.background=new T.Color('#e9e5dc');
const camera=new T.PerspectiveCamera(60,1,.03,50),controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minDistance=.3;controls.maxDistance=12;controls.maxPolarAngle=Math.PI*.49;
scene.add(new T.HemisphereLight('#fff6e5','#a7a397',1));const sun=new T.DirectionalLight('#fff3df',1.5);sun.position.set(0,7,0);scene.add(sun);
const mat=(color)=>new T.MeshStandardMaterial({color,roughness:.75});
const warm=mat('#cec9bd'),oak=mat('#b5a087'),dark=mat('#66695f'),linen=mat('#b9b09f');
const makeBox=(root,name,r,y,h,m,round=.003)=>{const o=new T.Mesh(new RoundedBoxGeometry(r.x1-r.x0,h,r.z1-r.z0,2,round),m);o.name=name;o.position.set((r.x0+r.x1)/2,y+h/2,(r.z0+r.z1)/2);root.add(o);return o;};
const candidate=new T.Group();candidate.name='elder-storage-study';scene.add(candidate);
const guides=new T.Group(),deskStudy=new T.Group();candidate.add(guides,deskStudy);
let model,bed,reading,old=[],walls=[],on=true,view='room',doorPanel,movingPull;
function build(){
 const w=study.wardrobe;
 makeBox(candidate,'wardrobe-back',rect(w.x0,w.z1-.018,w.x1,w.z1),0,2.4,oak);
 for(const x of [w.x0,1.661,w.x1-.018])makeBox(candidate,'wardrobe-side',rect(x,4.88,x+.018,w.z1),0,2.4,oak);
 for(const y of [.075,1.95,2.382])makeBox(candidate,'wardrobe-shelf',rect(w.x0,4.88,w.x1,5.362),y,.018,oak);
 makeBox(candidate,'wardrobe-plinth',rect(w.x0,4.94,w.x1,5.34),0,.075,dark);
 for(const [a,b]of [[.85,1.64],[1.69,2.49]]){
  makeBox(candidate,'hanging-rail',rect(a,5.105,b,5.13),1.77,.025,dark);
  makeBox(candidate,'lower-folded-shelf',rect(a,4.89,b,5.34),.40,.018,oak);
  for(let i=0;i<3;i++)makeBox(candidate,'folded-linen',rect(a+.06,4.95,b-.06,5.25),.42+i*.065,.055,linen,.015);
  makeBox(candidate,'bedding-storage-box',rect(a+.04,4.95,b-.04,5.30),1.98,.30,linen,.012);
 }
 makeBox(candidate,'inner-mirror',rect(.87,5.332,1.20,5.35),.9,.8,new T.MeshStandardMaterial({color:'#bac5c1',metalness:.75,roughness:.2}));
 // Two separate tracks remain inside the specified 600 mm TOTAL depth.
 for(const z of [4.79,4.835])for(const y of [.08,2.36])makeBox(candidate,'sliding-track',rect(.84,z,2.5,z+.012),y,.018,dark);
 doorPanel=makeBox(candidate,'sliding-front-left',rect(.835,4.78,1.695,4.803),.105,2.245,warm);
 makeBox(candidate,'sliding-front-right',rect(1.65,4.825,2.505,4.848),.105,2.245,warm);
 for(const [x,z]of [[1.677,4.777],[2.48,4.822]]){const pull=makeBox(candidate,'recessed-edge-pull',rect(x,z,x+.009,z+.009),.98,.34,dark,.001);if(x===1.677)movingPull=pull;}
 // Soft pockets stay inside the existing bed's plan envelope; no rigid shelf above pillows.
 for(const z of [2.72,3.86])makeBox(candidate,'bedhead-soft-pocket',rect(.858,z,.885,z+.17),.56,.16,linen,.01);
 const gm=new T.MeshBasicMaterial({color:'#8ca79c',transparent:true,opacity:.28,depthWrite:false});
 makeBox(guides,'window-gap',rect(.82,study.windowFront,2.77,2.6),.018,.008,gm);
 makeBox(guides,'wardrobe-gap',rect(.82,4.16,2.52,4.78),.018,.008,gm);
 makeBox(guides,'foot-gap',rect(2.8975,2.60,3.61,4.16),.018,.008,gm);
 makeBox(deskStudy,'rejected-desk',study.desk,.72,.03,oak);
 const cm=new T.MeshBasicMaterial({color:'#bf6e51',transparent:true,opacity:.45,depthWrite:false});
 makeBox(deskStudy,'occupied-chair-envelope',study.seated,.02,1.25,cm,.03);deskStudy.visible=false;
}
function crop(){
 const planes=[new T.Plane(new T.Vector3(1,0,0),-.12),new T.Plane(new T.Vector3(-1,0,0),3.73),new T.Plane(new T.Vector3(0,0,1),-1.75),new T.Plane(new T.Vector3(0,0,-1),5.55)];
 if(['overview','top'].includes(view))planes.push(new T.Plane(new T.Vector3(0,-1,0),1.20));renderer.clippingPlanes=planes;
}
function setView(id){
 view=id;canvas.hidden=id==='plan';svg.toggleAttribute('hidden',id!=='plan');document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));crop();
 const views={room:[[3.27,1.57,5.18],[1.54,1.02,3.55],62],storage:[[2.94,1.55,2.86],[1.66,1.20,5.06],57],overview:[[6.0,5.8,7.2],[1.95,.4,3.65],45],top:[[1.95,8,3.66],[1.95,0,3.65],37]};
 if(views[id]){const[p,t,f]=views[id];camera.position.fromArray(p);controls.target.fromArray(t);camera.fov=f;camera.updateProjectionMatrix();controls.update();}
 const notes={room:'床头方向不变，整床向窗移60cm。没有增加落地床头柜。',storage:'170cm推拉衣柜：可滑开左门查看内部；镜面仅作材质示意。',overview:'1.2m水平剖切，仅为看清家具与通道，不代表拆墙。',top:'同源俯视：窗侧与柜前仍偏紧，不能视为无障碍通道。',plan:'同源尺寸平面 · 净距按家具外包络，不只按床垫。'};
 document.querySelector('#note').textContent=notes[id];drawPlan();resize();
}
function setCandidate(value){
 on=value;old.forEach(o=>o.visible=!on);candidate.visible=on;
 bed.position.z=bed.userData.studyOriginalZ-(on?study.shift:0);
 if(reading)reading.position.z=reading.userData.studyOriginalZ-(on?study.shift:0);
 document.querySelector('#candidate').classList.toggle('active',on);document.querySelector('#original').classList.toggle('active',!on);
 document.querySelector('#status').textContent=on?'旧试排警示：窗侧转角未通过600mm路径检查，请看六种摆法对照':'原方案对照；右侧尺寸只对应旧试排';drawPlan();
}
function drawPlan(){
 svg.replaceChildren();svg.setAttribute('viewBox','-.05 1.5 4.05 4.25');
 const el=(tag,a,text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));if(text)e.textContent=text;svg.append(e);return e;};
 const label=(x,z,t,s=.115)=>el('text',{x,y:z,'font-size':s,'text-anchor':'middle',fill:'#373731'},t);
 const r=(a,c)=>el('rect',{x:a.x0,y:a.z0,width:a.x1-a.x0,height:a.z1-a.z0,fill:c,stroke:'#85877b','stroke-width':.012});
 const poly=spec.spaces.find(s=>s.id==='bed1').polygons[0];el('polygon',{points:poly.map(([x,z])=>[x,-z].join(',')).join(' '),fill:'#f0ece3',stroke:'#888b80','stroke-width':.035});
 const b=on?study.bed:rect(.805,3.2,2.8975,4.76);r(b,'#d4cbba');r(rect(b.x0,b.z0,b.x0+.12,b.z1),'#acaf9f');label(1.85,(b.z0+b.z1)/2,'150×200cm床');label(1.83,(b.z0+b.z1)/2+.18,'外包络约156×209cm',.092);
 if(on){r(study.wardrobe,'#bfc2b3');label(1.67,5.12,'170cm推拉衣柜');if(document.querySelector('#guides').checked){label(1.9,2.33,'窗侧约60cm');label(1.7,4.53,'柜前约62cm');label(3.26,3.52,'床尾');label(3.26,3.70,'约71cm');}}
 else{r(rect(.82,4.784,1.4035,5.376),'#bfc2b3');r(rect(.814,1.99,2.586,2.4435),'#c2b49c');label(1.7,2.24,'原窗边矮柜');}
 if(on&&document.querySelector('#desk').checked){r(study.desk,'#c4a383');r(study.seated,'#c4775d99');label(1.32,2.27,'桌100×45',.095);label(1.32,2.91,'坐人冲突',.09);}
 const door=spec.openings.find(o=>o.id==='bed1'),wall=spec.walls.find(w=>w.id===door.wall_id);const len=Math.hypot(wall.b[0]-wall.a[0],wall.b[1]-wall.a[1]);const dx=(wall.b[0]-wall.a[0])/len,dz=-(wall.b[1]-wall.a[1])/len;const hx=wall.a[0]+dx*(door.offset+door.width),hz=-wall.a[1]+dz*(door.offset+door.width),d=door.width;
 el('line',{x1:hx-d,y1:hz,x2:hx,y2:hz,stroke:'#fbfaf6','stroke-width':.14});el('path',{d:`M ${hx-d} ${hz} A ${d} ${d} 0 0 1 ${hx} ${hz-d}`,fill:'none',stroke:'#ae895c','stroke-width':.018});el('line',{x1:hx,y1:hz,x2:hx,y2:hz-d,stroke:'#ae895c','stroke-width':.03});
 el('line',{x1:.27,y1:1.94,x2:2.77,y2:1.94,stroke:'#8aa2a0','stroke-width':.025});label(1.70,1.77,'窗侧 · 地理北向未核实',.105);label(1.68,5.61,'下方为公卫共墙 / 右侧原卧室门',.10);
}
function resize(){if(canvas.hidden)return;renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.querySelector('#candidate').onclick=()=>setCandidate(true);document.querySelector('#original').onclick=()=>setCandidate(false);
document.querySelector('#guides').onchange=e=>{guides.visible=e.target.checked;drawPlan();};document.querySelector('#desk').onchange=e=>{deskStudy.visible=e.target.checked;drawPlan();};
document.querySelector('#slide').onchange=e=>{const shift=e.target.checked?.795:0;doorPanel.position.x=1.265+shift;movingPull.position.x=1.6815+shift;};
document.querySelector('#opacity').oninput=e=>{walls.forEach(m=>{m.transparent=true;m.opacity=+e.target.value;m.needsUpdate=true;});};
try{
 model=(await new GLTFLoader().loadAsync('./offline-render/current-design-v2.glb')).scene;scene.add(model);
 model.traverse(o=>{if(o.isLight)o.visible=false;if(o.isMesh){let p=o,wall=false;while(p){if(/^wall-\d/.test(p.name))wall=true;p=p.parent;}if(wall){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();for(const m of Array.isArray(o.material)?o.material:[o.material]){m.transparent=true;m.opacity=.7;walls.push(m);}}}});
 bed=model.getObjectByName('bed1-bed');if(!bed)throw Error('缺少老人房床');bed.userData.studyOriginalZ=bed.position.z;
 reading=model.getObjectByName('elder-bedhead-reading-lights');if(reading)reading.userData.studyOriginalZ=reading.position.z;
 old=['bed1-wardrobe','bed1-window-storage'].map(n=>{const o=model.getObjectByName(n);if(!o)throw Error('缺少原对象'+n);return o;});
 build();setCandidate(true);setView(new URLSearchParams(location.search).get('view')==='plan'?'plan':'overview');document.querySelector('#busy').hidden=true;
 window.elderStudy={ready:true,study,spec,model,bed,candidate,deskStudy,camera,controls,renderer,setView,setCandidate,get on(){return on;}};
 new RGBELoader().load('./assets/lake.hdr',t=>{t.mapping=T.EquirectangularReflectionMapping;scene.environment=t;scene.environmentIntensity=.45;},undefined,()=>{});
}catch(e){document.querySelector('#busy').textContent='模型载入失败：'+e.message;console.error(e);}
renderer.setAnimationLoop(()=>{controls.update();if(!canvas.hidden)renderer.render(scene,camera);});
