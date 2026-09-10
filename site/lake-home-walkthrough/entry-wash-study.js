import * as T from './vendor/three.module.js';
import {GLTFLoader,RGBELoader,OrbitControls,RoundedBoxGeometry} from './vendor/render-libs.js';
import {makeDryZone,dryZoneOptions} from './public-dry-zone.js';

// One candidate geometry is used by the 3D meshes, plan, and local verification.
const spec=await (await fetch('./plan-spec.json')).json();
const study={basin:{x0:2.618,z0:6.49,x1:3.068,z1:7.14},screen:{x0:2.618,z0:6.42,x1:3.088,z1:6.47,height:2.12},standing:{x0:3.068,z0:6.49,x1:3.668,z1:7.09},corridor:{x0:2.61,z0:5.51,x1:5.92,z1:6.41},shoe:{x0:4.656,z0:6.666,x1:6.264,z1:7.163},shoeRecessHeight:.18};
const canvas=document.querySelector('#scene'),host=document.querySelector('#viewport'),plan=document.querySelector('#plan'),busy=document.querySelector('#busy');
const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e9e5dc');
const camera=new T.PerspectiveCamera(62,1,.025,100);const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minDistance=.45;controls.maxDistance=15;controls.maxPolarAngle=Math.PI*.49;
scene.add(new T.HemisphereLight('#fff6e5','#aaa797',.8));
const sun=new T.DirectionalLight('#fff3df',1.1);sun.position.set(6,7,2);scene.add(sun);
const ceilingLight=new T.PointLight('#fff1d9',6,8,2);ceilingLight.position.set(3.9,2.3,6.15);scene.add(ceilingLight);
let model,newDesign,oldObjects=[],view='corridor',candidate=true,wallMaterials=[];
const addBox=(root,name,r,bottom,height,mat,round=.003)=>{const o=new T.Mesh(new RoundedBoxGeometry(r.x1-r.x0,height,r.z1-r.z0,2,round),mat);o.name=name;o.position.set((r.x0+r.x1)/2,bottom+height/2,(r.z0+r.z1)/2);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;};
const material=(color,roughness=.7,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const rect=(x0,z0,x1,z1)=>({x0,z0,x1,z1});
function buildCandidate(){
 newDesign=new T.Group();newDesign.name='entry-wash-90-study';scene.add(newDesign);
 dryZoneOptions.study90={label:'90°侧向洗漱',width:.65,depth:.45,shift:.11,storage:'sliding'};
 const built=makeDryZone('study90'),basin=built.group;
 // Original cabinet faces -Z. After -90° rotation it faces +X into the old bench area.
 basin.rotation.y=-Math.PI/2;basin.position.set(2.618+built.spec.backFace,0,6.815-built.spec.x);basin.name='study-rotated-basin';newDesign.add(basin);
 basin.traverse(o=>{if(/^dry-(waterproof-side|privacy-glass|screen-frame|screen-cap)$/.test(o.name))o.visible=false;});
 const warm=material('#d6d0c5'),white=material('#e6e1d7'),oak=material('#b49a7a');
 addBox(newDesign,'study-opaque-screen',study.screen,0,study.screen.height,white,.009);
 addBox(newDesign,'screen-wet-facing-lining',rect(study.screen.x0+.02,study.screen.z1-.005,study.screen.x1-.02,study.screen.z1),.08,1.94,material('#c8c7bd'),.001);
 addBox(newDesign,'screen-base',study.screen,0,.08,material('#bcb8ac'));
 const s=study.shoe,split=(s.x0+s.x1)/2;
 addBox(newDesign,'study-shoe-back',rect(s.x0,s.z1-.018,s.x1,s.z1),.02,2.58,warm);
 for(const x of [s.x0,split,s.x1-.018])addBox(newDesign,'study-shoe-side',rect(x,s.z0,x+.018,s.z1),.18,2.42,warm);
 for(const y of [.18,2.58])addBox(newDesign,'study-shoe-horizontal',s,y,.02,warm);
 // Recess stays open down to the tiled floor; rear supports are not a seat or a plinth.
 for(const x of [s.x0+.025,split,s.x1-.045])addBox(newDesign,'study-shoe-rear-support',rect(x,s.z1-.065,x+.025,s.z1-.025),.01,.17,material('#6d6a60'));
 for(const y of [.40,.62,.84,1.06,1.34,1.62,1.9,2.18])addBox(newDesign,'study-shoe-inner-shelf',rect(s.x0+.02,s.z0+.03,s.x1-.02,s.z1-.02),y,.018,oak);
 for(let i=0;i<4;i++){
  const width=(s.x1-s.x0-.032)/4,x=s.x0+.018+i*width;
  addBox(newDesign,'study-shoe-tall-door-'+i,rect(x,s.z0-.001,x+width-.005,s.z0+.021),.205,2.365,white);
  addBox(newDesign,'study-shoe-finger-pull-'+i,rect(x+width-.016,s.z0-.002,x+width-.008,s.z0+.004),.97,.28,material('#827e72'),.001);
 }
 for(let i=0;i<6;i++)addBox(newDesign,'study-recess-daily-shoe-'+i,rect(s.x0+.12+i*.22,s.z0+.045,s.x0+.205+i*.22,s.z0+.30),.015,.065,material(i<2?'#6d7069':'#b0a793'),.02);
 const led=material('#fff0cf');led.emissive=new T.Color('#ffe8b5');led.emissiveIntensity=.8;
 addBox(newDesign,'study-shoe-recess-strip',rect(s.x0+.04,s.z0+.07,s.x1-.04,s.z0+.09),.173,.006,led);
 const personMat=new T.MeshStandardMaterial({color:'#9c7457',transparent:true,opacity:.25,depthWrite:false});
 addBox(newDesign,'study-washing-stand',study.standing,.015,1.6,personMat,.04).visible=false;
 const guides=new T.Group();guides.name='study-circulation-guides';newDesign.add(guides);guides.visible=false;
 addBox(guides,'study-reserved-corridor',study.corridor,.012,.004,new T.MeshBasicMaterial({color:'#779ca0',transparent:true,opacity:.16,depthWrite:false}),.001);
 const route=(name,points,color)=>{const line=new T.Line(new T.BufferGeometry().setFromPoints(points.map(([x,z])=>new T.Vector3(x,.025,z))),new T.LineBasicMaterial({color}));line.name=name;guides.add(line);};
 route('study-elder-approach',[[5.45,5.98],[3.11,5.98],[3.11,5.20]],'#557e85');
 route('study-bath-approach',[[3.11,5.98],[2.18,5.98]],'#557e85');
 route('study-wash-approach',[[4.2,6.05],[4.2,6.80],[3.38,6.80]],'#987353');
 const waterLight=new T.PointLight('#fff4df',2,2,2);waterLight.position.set(3.0,1.8,6.8);newDesign.add(waterLight);
 newDesign.userData={study,installationVerified:false,source:'plan-spec.json unchanged + isolated furniture candidate'};
 return built;
}
function selectView(id){
 view=id;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
 const isPlan=id==='plan';canvas.hidden=isPlan;plan.toggleAttribute('hidden',!isPlan);renderer.clippingPlanes=id==='overview'?[new T.Plane(new T.Vector3(0,-1,0),1.15)]:[];
 const views={corridor:[[4.75,1.58,5.98],[3.28,1.25,6.46],64,'走廊实视：短侧屏仅遮台盆侧面，站位旁敞开；不是独立洗漱间。'],wash:[[4.18,1.48,6.80],[2.85,1.12,6.81],65,'洗漱侧面：朝公卫墙洗脸，人的站位不再被长隔屏围住。'],entry:[[6.6,1.50,5.98],[5.35,1.1,6.97],70,'镂空鞋柜：取消全部坐凳，底部约180mm净高放常穿鞋；低位灯带为示意。'],overview:[[5.55,5.3,8.8],[3.60,.25,6.15],48,'剖切透视：高于1.15m处临时裁切；可勾选站位与通道查看关系，不代表拆墙。']};
 if(views[id]){const [p,t,f,n]=views[id];camera.position.fromArray(p);controls.target.fromArray(t);camera.fov=f;camera.updateProjectionMatrix();controls.update();document.querySelector('#note').textContent=n;}else{drawPlan();document.querySelector('#note').textContent='同源平面 · 模型通道910mm，按原图较小尺寸估计约900mm；饰面和门套另核。';}
 resize();
}
function setCandidate(on){candidate=on;oldObjects.forEach(o=>o.visible=!on);newDesign.visible=on;document.querySelector('#new').classList.toggle('active',on);document.querySelector('#old').classList.toggle('active',!on);document.querySelector('#status').textContent=on?'半开放试排：短侧屏遮盆，洗漱站位旁敞开':'原方案对照 · 右侧尺寸仍为新方案';drawPlan();}
function drawPlan(){
 const ns='http://www.w3.org/2000/svg';plan.replaceChildren();plan.setAttribute('viewBox','0.55 5.05 6.0 2.65');
 const el=(tag,a,text)=>{const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(a))n.setAttribute(k,v);if(text)n.textContent=text;plan.append(n);return n;};
 const r=(a,color,dash='')=>el('rect',{x:a.x0,y:a.z0,width:a.x1-a.x0,height:a.z1-a.z0,fill:color,stroke:'#6e7468','stroke-width':.012,'stroke-dasharray':dash});
 const text=(x,z,t,size=.105)=>el('text',{x,y:z,'font-size':size,'text-anchor':'middle',fill:'#373731'},t);
 for(const w of spec.walls){const [ax,ay]=w.a,[bx,by]=w.b,len=Math.hypot(bx-ax,by-ay);if(Math.max(ax,bx)<.55||Math.min(ax,bx)>6.55||Math.max(-ay,-by)<5.05||Math.min(-ay,-by)>7.70)continue;
  const openings=spec.openings.filter(o=>o.wall_id===w.id&&o.kind==='door').sort((a,b)=>a.offset-b.offset);let start=0;
  const line=(a,b)=>{if(b<=a)return;el('line',{x1:ax+(bx-ax)*a/len,y1:-(ay+(by-ay)*a/len),x2:ax+(bx-ax)*b/len,y2:-(ay+(by-ay)*b/len),stroke:'#898b80','stroke-width':w.thickness});};
  for(const o of openings){line(start,o.offset);start=o.offset+o.width;}line(start,len);
 }
 const door=spec.openings.find(o=>o.id==='bath1'),w=spec.walls.find(w=>w.id===door.wall_id),hx=w.a[0],hz=-w.a[1]+door.offset,d=door.width;
 el('path',{d:`M ${hx} ${hz+d} A ${d} ${d} 0 0 1 ${hx-d} ${hz}`,fill:'none',stroke:'#ae895c','stroke-width':.012});el('line',{x1:hx,y1:hz,x2:hx-d,y2:hz,stroke:'#ae895c','stroke-width':.025});
 r(rect(.82,6.265,1.72,7.15),'#e3e6df');text(1.25,6.87,'淋浴');r(rect(1.89,6.43,2.45,7.15),'#e8e4d9');text(2.17,6.85,'蹲便');
 if(candidate){r(study.corridor,'#e5eff0','.035');r(study.basin,'#bac4b0');r(study.screen,'#a9aa9c');r(study.standing,'#eadcd0','.03');r(study.shoe,'#d3cebf');text(3.355,6.80,'600mm站位',.080);text(2.82,6.80,'台盆',.085);text(5.48,6.95,'鞋柜 · 底部镂空');text(2.90,6.38,'470mm短侧屏',.067);
 el('path',{d:'M 4.20 6.0 L 4.20 6.80 L 3.55 6.80',fill:'none',stroke:'#7b896c','stroke-width':.035,'stroke-dasharray':'.07 .04'});
 el('path',{d:'M 3.64 6.74 L 3.55 6.80 L 3.64 6.86',fill:'none',stroke:'#7b896c','stroke-width':.025});
 el('path',{d:'M 5.45 5.98 L 3.11 5.98 L 3.11 5.23 M 3.11 5.98 L 2.18 5.98',fill:'none',stroke:'#557e85','stroke-width':.028,'stroke-dasharray':'.05 .04'});
 el('path',{d:'M 3.05 5.32 L 3.11 5.23 L 3.17 5.32 M 2.27 5.92 L 2.18 5.98 L 2.27 6.04',fill:'none',stroke:'#557e85','stroke-width':.025});
 text(4.65,5.78,'预留通道约900mm',.095);text(4.13,7.32,'站位旁敞开 · 不设入口门',.09);
 }else{r(rect(2.915,6.77,3.565,7.17),'#bac4b0');r(rect(2.94,6.17,3.54,6.77),'#eadcd0','.03');r(rect(3.685,6.78,4.655,7.17),'#bbaa91');r(study.shoe,'#d3cebf');text(3.24,6.99,'原台盆',.09);text(4.16,6.99,'原独立凳',.09);text(3.2,5.97,'洗漱占用后约660mm',.09);}
 text(1.63,5.30,'公卫');text(3.40,5.30,'老人房门');text(4.82,5.30,'厨房墙');text(4.9,6.20,'玄关通道');text(2.0,7.50,'原图公卫1700×1650mm',.09);text(5.1,7.50,'同源模型示意，非施工图',.09);
}
function resize(){if(canvas.hidden)return;const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>selectView(b.dataset.view));document.querySelector('#new').onclick=()=>setCandidate(true);document.querySelector('#old').onclick=()=>setCandidate(false);
document.querySelector('#screen').onchange=e=>{for(const n of ['study-opaque-screen','screen-wet-facing-lining','screen-base'])newDesign.getObjectByName(n).visible=e.target.checked;};
document.querySelector('#standing').onchange=e=>{newDesign.getObjectByName('study-washing-stand').visible=e.target.checked;newDesign.getObjectByName('study-circulation-guides').visible=e.target.checked;};
document.querySelector('#opacity').oninput=e=>{for(const m of wallMaterials){m.transparent=+e.target.value<1;m.opacity=+e.target.value;m.needsUpdate=true;}};
try{
 model=(await new GLTFLoader().loadAsync('./offline-render/current-design-v2.glb')).scene;model.traverse(o=>{if(o.isLight)o.visible=false;});scene.add(model);model.updateMatrixWorld(true);
 for(const name of ['bath1-vanity','entry-shoe-bench','entry-dressing-mirror','flush-entry-cabinet']){const o=model.getObjectByName(name);if(!o)throw Error('缺少原方案对象：'+name);oldObjects.push(o);}
 model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;let p=o,isWall=false;while(p){if(/^wall-\d/.test(p.name))isWall=true;p=p.parent;}if(isWall){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();wallMaterials.push(...(Array.isArray(o.material)?o.material:[o.material]));}}});
 const built=buildCandidate();setCandidate(true);const initialView=new URLSearchParams(location.search).get('view');selectView(['corridor','wash','entry','overview','plan'].includes(initialView)?initialView:'corridor');busy.hidden=true;
 window.entryWashStudy={ready:true,model,newDesign,study,spec,built,scene,camera,renderer,controls,setCandidate,selectView,get candidate(){return candidate;},get view(){return view;}};
 new RGBELoader().load('./assets/lake.hdr',tex=>{tex.mapping=T.EquirectangularReflectionMapping;scene.environment=tex;scene.environmentIntensity=.45;},undefined,()=>{});
}catch(e){busy.textContent='模型加载失败：'+e.message;console.error(e);}
renderer.setAnimationLoop(()=>{controls.update();if(!canvas.hidden)renderer.render(scene,camera);});
