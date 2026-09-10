import * as T from './vendor/three.module.js';
import {GLTFLoader,RGBELoader,OrbitControls,RoundedBoxGeometry} from './vendor/render-libs.js';
import {design as d} from './child-bay-study-data.js?v=refined-180';
import {buildRefined} from './child-refined-furniture.js';
const spec=await(await fetch('./plan-spec.json')).json();
const canvas=document.querySelector('#scene'),host=document.querySelector('#viewport'),svg=document.querySelector('#plan');
const renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.86;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e9e5dc');
const camera=new T.PerspectiveCamera(48,1,.02,70),controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minDistance=.3;controls.maxDistance=13;controls.maxPolarAngle=Math.PI*.495;
scene.add(new T.HemisphereLight('#fff6e8','#aba591',.75));const sun=new T.DirectionalLight('#fff5e8',1.6);sun.position.set(20,7,6);scene.add(sun);
const furniture=new T.Group();furniture.name='child-window-furniture';scene.add(furniture);const guide=new T.Group();furniture.add(guide);
const mat=(color,roughness=.75)=>new T.MeshStandardMaterial({color,roughness});const oak=mat('#b6a187'),warm=mat('#d3cfc4'),sage=mat('#9ba994'),white=mat('#eee9dc'),metal=mat('#666e63');
const loader=new T.TextureLoader();const normal=loader.load('./assets/wood-normal.jpg');normal.wrapS=normal.wrapT=T.RepeatWrapping;oak.normalMap=normal;oak.normalScale.set(.13,.13);
function box(root,name,r,y,h,m=warm,round=.004){const mesh=new T.Mesh(new RoundedBoxGeometry(r[2]-r[0],h,r[3]-r[1],3,round),m);mesh.name=name;mesh.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;}
let model,front,frontPull,baySurface,doorPivot,wallMaterials=[],view='whole',chairOffset=0,doorOpen=d.key!=='study';
const center=r=>[(r[0]+r[2])/2,(r[1]+r[3])/2];
function build(){
 if(d.key==='refined'){
  ({front,frontPull,baySurface,doorPivot}=buildRefined({T,d,box,furniture,guide,doorOpen,onChair:shift=>{chairOffset=shift;drawPlan();}}));return;
 }
 const bed=new T.Group();bed.name='study-child-bed';furniture.add(bed);const b=d.bed;
 box(bed,'bed-base',b,.08,.25,oak,.016);box(bed,'headboard',d.bedReversed?[b[0],b[3]-.035,b[2],b[3]]:[b[0],b[1],b[2],b[1]+.035],.25,.78,sage,.01);
 box(bed,'mattress-150x200',d.mattress,.33,.24,white,.055);box(bed,'duvet',d.bedReversed?[b[0]+.02,b[1]+.03,b[2]-.02,b[3]-.645]:[b[0]+.02,b[1]+.645,b[2]-.02,b[3]-.03],.57,.07,sage,.035);
 for(const x of [b[0]+.09,b[0]+.80])box(bed,'pillow',[x,d.bedReversed?b[3]-.545:b[1]+.145,x+.61,d.bedReversed?b[3]-.145:b[1]+.545],.57,.13,white,.045);
 // Feet stay under the bed footprint, not in the narrow aisle.
 for(const x of [b[0]+.08,b[2]-.12])for(const z of [b[1]+.08,b[3]-.12])box(bed,'bed-foot',[x,z,x+.04,z+.04],0,.09,metal);
 // L: wardrobe parallel to the window wall; desk on the perpendicular head wall.
 const w=d.wardrobe;const cabinet=new T.Group();cabinet.name='study-child-wardrobe';furniture.add(cabinet);
 box(cabinet,'wardrobe-back',[w[0],w[1],w[0]+.018,w[3]],0,2.4,oak);
 for(const z of [w[1],w[3]-.018])box(cabinet,'wardrobe-side',[w[0],z,w[2],z+.018],0,2.4,warm);
 for(const y of [.08,1.94,2.382])box(cabinet,'wardrobe-shelf',[w[0]+.018,w[1]+.018,w[2]-.065,w[3]-.018],y,.018,oak);
 box(cabinet,'hanging-rail',[14.32,4.53,14.345,5.53],1.78,.025,metal);
 for(let i=0;i<5;i++)box(cabinet,'clothing',[14.1,4.6+i*.16,14.56,4.63+i*.16],1.12,.47,i%2?sage:white,.006);
 front=box(cabinet,'sliding-front-a',[14.617,4.50,14.64,5.06],.10,2.25,warm);
 box(cabinet,'sliding-front-b',[14.58,5.01,14.603,5.56],.10,2.25,warm);
 frontPull=box(cabinet,'sliding-edge-a',[14.635,5.037,14.644,5.045],.96,.32,metal,.001);
 box(cabinet,'sliding-edge-b',[14.602,5.537,14.61,5.545],.96,.32,metal,.001);
 if(d.wardrobeFront==='z'){
  cabinet.clear();
  box(cabinet,'wardrobe-back',[w[0],w[1],w[2],w[1]+.018],0,2.4,oak);
  for(const x of [w[0],w[2]-.018])box(cabinet,'wardrobe-side',[x,w[1],x+.018,w[3]],0,2.4,warm);
  for(const y of [.08,1.94,2.382])box(cabinet,'wardrobe-shelf',[w[0]+.018,w[1]+.018,w[2]-.018,w[3]-.07],y,.018,oak);
  front=box(cabinet,'sliding-front-a',[14.05,5.057,14.52,5.08],.10,2.25,warm);
  box(cabinet,'sliding-front-b',[14.49,5.02,14.93,5.043],.10,2.25,warm);
  frontPull=box(cabinet,'sliding-edge-a',[14.496,5.073,14.504,5.08],.96,.32,metal,.001);
  box(cabinet,'sliding-edge-b',[14.906,5.043,14.914,5.048],.96,.32,metal,.001);
 }
 const desk=new T.Group();desk.name='perpendicular-wall-desk';furniture.add(desk);
 box(desk,'desktop-130x55',d.desk,.725,.025,oak,.01);
 box(desk,'desk-side-panel',[d.desk[2]-.024,4.49,d.desk[2],5.01],.02,.705,oak);
 box(desk,'desk-back-apron',[d.desk[0]+.02,4.49,d.desk[2]-.024,4.515],.58,.145,oak);
 const dx=d.desk[2]-15.94;
 box(desk,'notebook',[d.desk[0]+.12,4.67,d.desk[0]+.44,4.90],.751,.012,white);
 box(desk,'lamp-base',[15.64+dx,4.60,15.81+dx,4.77],.751,.018,metal,.03);
 box(desk,'lamp-stem',[15.72+dx,4.66,15.735+dx,4.68],.769,.34,metal);
 box(desk,'lamp-head',[15.51+dx,4.65,15.75+dx,4.69],1.109,.023,metal);
 const u=d.upperBooks,r=u.rect,upper=new T.Group();upper.name='desk-upper-bookcase';furniture.add(upper);
 box(upper,'bookcase-back',[r[0],r[1],r[2],r[1]+.018],u.bottom,u.top-u.bottom,oak);
 const mid=(r[0]+r[2])/2;
 for(const x of [r[0],mid-.009,r[2]-.018])box(upper,'bookcase-side',[x,r[1],x+.018,r[3]],u.bottom,u.top-u.bottom,warm);
 for(const y of [u.bottom,1.91,u.top-.018])box(upper,'bookcase-shelf',[r[0],r[1],r[2],r[3]],y,.018,oak);
 for(const [a,b]of [[r[0]+.003,mid-.012],[mid+.012,r[2]-.003]])box(upper,'closed-upper-door',[a,r[3]-.02,b,r[3]],1.934,.443,warm);
 for(let i=0;i<(r[2]-r[0]<1?6:8);i++)box(upper,'book',[r[0]+.06+i*.055,4.515,r[0]+.10+i*.055,4.738],1.518,.24+(i%3)*.025,[sage,white,warm][i%3]);
 box(upper,'book-storage-box',[mid+.05,4.515,r[2]-.10,4.737],1.518,.23,sage,.01);
 if(d.extraCabinet){const e=d.extraCabinet,g=new T.Group();g.name='additional-storage-cabinet';furniture.add(g);
  const side=d.key==='study';
  box(g,'extra-back',side?[e[0],e[1],e[0]+.018,e[3]]:[e[0],e[1],e[2],e[1]+.018],0,2.4,oak);
  const walls=side?[[e[0],e[1],e[2],e[1]+.018],[e[0],e[3]-.018,e[2],e[3]]]:[[e[0],e[1],e[0]+.018,e[3]],[e[2]-.018,e[1],e[2],e[3]]];
  for(const rr of walls)box(g,'extra-side',rr,0,2.4,warm);
  for(const y of [.08,.5,.95,1.4,1.9,2.382])box(g,'extra-shelf',[e[0]+.018,e[1]+.018,e[2]-.018,e[3]-.018],y,.018,oak);
  // Open lower shelves avoid an unverified hinged leaf projecting into the narrow approach.
  box(g,'extra-upper-front',side?[e[2]-.018,e[1]+.02,e[2],e[3]-.02]:[e[0]+.02,e[3]-.018,e[2]-.02,e[3]],1.92,.46,warm);
  for(const y of [.52,.97,1.42])box(g,'folded-storage',[e[0]+.05,e[1]+.05,e[2]-.05,e[3]-.05],y,.16,sage,.01);
 }
 const chair=new T.Group();chair.name='desk-chair';furniture.add(chair);const c=d.chair;
 box(chair,'chair-seat',c,.43,.06,sage,.025);
 box(chair,'chair-back',[c[0],c[3]-.035,c[2],c[3]],.49,.38,sage,.015);
 for(const x of [c[0]+.04,c[2]-.07])for(const z of [c[1]+.04,c[3]-.07])box(chair,'chair-leg',[x,z,x+.025,z+.025],0,.43,oak);
 document.querySelector('#chair').onchange=e=>{chairOffset=+e.target.value;chair.position.z=chairOffset;drawPlan();};
 // Raised window volume is kept out of the route polygon; no demolition assumption.
 box(furniture,'retained-raised-bay',d.bay,0,d.bayHeight,white,.002);
 baySurface=box(furniture,'bay-cleanable-finish',d.bayTop,d.bayHeight,.015,oak,.006);
 const tray=d.bayTray,by=d.bayHeight+.015;
 box(furniture,'removable-bay-tray',tray,by,.018,oak,.005);
 box(furniture,'bay-reading-book',[tray[0]+.025,tray[1]+.025,tray[2]-.025,tray[3]-.025],by+.018,.025,white,.004);
 box(furniture,'portable-lamp-base',[17.60,5.22,17.75,5.37],by,.018,warm,.025);
 box(furniture,'portable-lamp-stem',[17.665,5.285,17.68,5.30],by+.018,.15,metal);
 box(furniture,'portable-lamp-shade',[17.60,5.22,17.75,5.37],by+.168,.08,warm,.025);
 const gm=new T.MeshBasicMaterial({color:'#80a59a',transparent:true,opacity:.25,depthWrite:false});
 box(guide,'bedside-aisle',d.key==='study'?[16.52,5.93,17.52,6.50]:[15.10,5.93,15.96,6.50],.015,.006,gm);
 doorPivot=new T.Group();doorPivot.name='candidate-original-door';doorPivot.position.set(13.96,0,6.57);furniture.add(doorPivot);box(doorPivot,'door-leaf',[-.018,-.90,.018,0],.02,2.1,warm);doorPivot.rotation.y=doorOpen?-Math.PI/2:0;
}
function setView(id){view=id;canvas.hidden=id==='plan';svg.toggleAttribute('hidden',id!=='plan');document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
 const views={whole:[[12.4,6.3,9.6],[16.0,.65,5.85],43],entry:[[14.18,1.55,6.27],[16.23,1.05,5.60],68],storage:[[16.85,2.05,6.95],[14.98,1.20,4.86],62],desk:[[16.1,1.65,6.9],[17.7,.7,5.35],54],top:[[16.1,9,5.83],[16.1,0,5.82],38]};
 if(d.key==='refined'){
  views.suite=[[14.3,1.65,5.55],[16.1,1.0,7.10],70];
  views.storage=[[15.35,1.65,6.25],[14.94,1.20,4.70],66];
  views.entry=[[14.22,1.62,6.15],[16.4,1.02,6.66],74];
 }
 if(views[id]){const[p,t,f]=views[id];camera.position.fromArray(p);controls.target.fromArray(t);camera.fov=f;camera.updateProjectionMatrix();controls.update();}
 document.querySelector('#note').textContent=d.key==='refined'?(id==='storage'?'180cm推拉衣柜：左侧挂衣、右侧叠衣、上部低频储物。':id==='suite'?'115cm书桌与床头统一浅木横线；上柜止于桌边，不压床头。':d.tradeoff):id==='plan'?d.tradeoff:id==='storage'?'上柜仅在书桌上方，不跨床；衣柜和桌位置随方案改变。':id==='desk'?(d.key==='study'?'C留出窗前地面，可在关门后走到窗台；坐着阅读须先核对儿童防坠与窗台承载。':'A/B床占窗台前位置，仅能当床边置物台，不能算独立阅读区。'):d.tradeoff;drawPlan();resize();
}
function drawPlan(){
 svg.replaceChildren();svg.setAttribute('viewBox','13.6 4.15 4.85 3.5');
 const el=(tag,a,t)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(a))n.setAttribute(k,v);if(t)n.textContent=t;svg.append(n);return n;};
 const rect=(r,color)=>el('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill:color,stroke:'#868b80','stroke-width':.013});
 const text=(x,z,t,size=.11)=>el('text',{x,y:z,'text-anchor':'middle','font-size':size,fill:'#373731'},t);
 const p=spec.spaces.find(s=>s.id==='bed3').polygons[0];el('polygon',{points:p.map(([x,z])=>[x,-z].join(',')).join(' '),fill:'#f1ece1',stroke:'#7b8275','stroke-width':.028});rect(d.bay,'#d6dfdc');
 const bc=center(d.bed);rect(d.bed,'#d5c9b7');rect(d.bedReversed?[d.bed[0],d.bed[3]-.08,d.bed[2],d.bed[3]]:[d.bed[0],d.bed[1],d.bed[2],d.bed[1]+.08],'#9ba994');text(bc[0],bc[1]-.12,'1.5×2m床');text(bc[0],bc[1]+.06,d.bedReversed?'床头转到下侧实墙':'整体154×206cm',.095);
 const wc=center(d.wardrobe),dc=center(d.desk);rect(d.wardrobe,'#bcc4b4');text(wc[0],wc[1]-.06,'衣柜',.10);text(wc[0],wc[1]+.10,d.key==='refined'?'180×60':d.key==='study'?'90×60':'110×60',.08);rect(d.desk,'#b6a187');text(dc[0],dc[1]+.03,Math.round((d.desk[2]-d.desk[0])*100)+'×'+Math.round((d.desk[3]-d.desk[1])*100)+'书桌',.09);rect([d.chair[0],d.chair[1]+chairOffset,d.chair[2],d.chair[3]+chairOffset],'#9ba994');text(center(d.chair)[0],center(d.chair)[1]+.03+chairOffset,'椅位',.08);
 if(d.extraCabinet){rect(d.extraCabinet,'#bcc4b4');text((d.extraCabinet[0]+d.extraCabinet[2])/2,(d.extraCabinet[1]+d.extraCabinet[3])/2,'补柜',.075);}
 const ur=d.upperBooks.rect;el('rect',{x:ur[0],y:ur[1],width:ur[2]-ur[0],height:ur[3]-ur[1],fill:'none',stroke:'#5c6255','stroke-width':.018,'stroke-dasharray':'.045 .025'});
 rect(d.bayTray,'#b6a187');text(17.83,5.55,'床边',.095);text(17.83,5.70,'置物面',.095);text(17.83,5.85,'非走道',.095);
 text(16.65,d.bedReversed?4.82:6.91,d.bedReversed?'床尾窄角非走道':'床尾63.5cm',.085);text(d.key==='study'?17.03:14.95,d.key==='refined'?5.55:6.20,d.key==='study'?'窗前约100cm':'进出 / 椅后空间',.09);
 el('line',{x1:14.02,y1:5.67,x2:14.02,y2:6.57,stroke:'#fbfaf6','stroke-width':.10});
 // Plan.js records hinge b; retain the original opening and inward swing.
 el('path',{d:'M 13.96 5.67 A .9 .9 0 0 1 14.86 6.57',fill:'none',stroke:'#ae895c','stroke-width':.016,'stroke-dasharray':'.04 .025'});el('line',{x1:13.96,y1:6.57,x2:doorOpen?14.86:13.96,y2:doorOpen?6.57:5.67,stroke:'#ae895c','stroke-width':.024});
 text(16.05,4.33,d.title+' · 图右为窗侧',.11);text(16.0,7.44,d.key==='study'?'房门全开挡床尾转弯；切换房门状态查看':'窗台保留，防坠与开窗待复核',.10);
}
function resize(){if(canvas.hidden)return;renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
 document.querySelector('#scheme').value=d.key;document.querySelector('#scheme').onchange=e=>{const url=new URL(location.href);url.searchParams.set('scheme',e.target.value);location.href=url;};
 document.querySelector('#scheme-title').textContent=d.title;document.querySelector('#tradeoff').textContent=d.tradeoff;
 document.querySelector('#design-summary').textContent=d.key==='refined'?'睡眠、长期收纳、独立学习优先。柜子与桌子换墙，而不是仅把床头转向。':d.tradeoff;
 document.querySelector('#desk-size').textContent=Math.round((d.desk[2]-d.desk[0])*100)+'×'+Math.round((d.desk[3]-d.desk[1])*100)+'cm';document.querySelector('#upper-size').textContent=Math.round((d.upperBooks.rect[2]-d.upperBooks.rect[0])*100)+'×28×90cm';
 document.querySelector('#wardrobe-size').textContent=(d.key==='refined'?'180':d.key==='study'?'90':'110')+'×60cm';
 document.querySelector('#room-door').checked=doorOpen;document.querySelector('#room-door').onchange=e=>{doorOpen=e.target.checked;doorPivot.rotation.y=doorOpen?-Math.PI/2:0;drawPlan();};
document.querySelector('#guides').onchange=e=>guide.visible=e.target.checked;document.querySelector('#open').onchange=e=>{if(d.key==='refined'){front.position.x=14.520+(e.target.checked?.83:0);frontPull.position.x=14.9655+(e.target.checked?.83:0);}else if(d.key==='study'){front.position.x=14.285+(e.target.checked?.40:0);frontPull.position.x=14.5+(e.target.checked?.40:0);}else{const offset=e.target.checked?-.49:0;furniture.getObjectByName('sliding-front-b').position.z=5.285+offset;furniture.getObjectByName('sliding-edge-b').position.z=5.541+offset;}};
document.querySelector('#opacity').oninput=e=>wallMaterials.forEach(m=>{m.transparent=true;m.opacity=+e.target.value;m.needsUpdate=true;});
try{
 model=(await new GLTFLoader().loadAsync('./offline-render/current-design-v2.glb')).scene;scene.add(model);model.updateMatrixWorld(true);
 for(const name of ['bed3-bed','bed3-wardrobe','bed3-desk','bed3-desk-everyday','bed3-chair','bed3-air-conditioner','door-bed3-single']){const o=model.getObjectByName(name);if(o)o.visible=false;}
 model.traverse(o=>{if(o.isLight)o.visible=false;if(!o.isMesh)return;const bb=new T.Box3().setFromObject(o);if(bb.min.y>2.44)o.visible=false;let p=o,isWall=false;while(p){if(/^wall-\d/.test(p.name))isWall=true;p=p.parent;}if(isWall){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();for(const m of Array.isArray(o.material)?o.material:[o.material]){m.transparent=true;m.opacity=.24;wallMaterials.push(m);}}});
 // Only outer X/Z cropping. Never apply an upper Y clip to furniture.
 renderer.clippingPlanes=[new T.Plane(new T.Vector3(1,0,0),-13.84),new T.Plane(new T.Vector3(-1,0,0),18.25),new T.Plane(new T.Vector3(0,0,1),-4.33),new T.Plane(new T.Vector3(0,0,-1),7.30)];
 if(d.key==='refined'){
  sun.target.position.set(16,0,5.8);scene.add(sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:20});sun.shadow.bias=-.00015;sun.shadow.normalBias=.015;sun.intensity=1.25;
 }
 build();setView(d.key==='refined'?'suite':'whole');document.querySelector('#busy').hidden=true;window.childStudy={ready:true,d,spec,model,furniture,camera,controls,renderer,setView};
 new RGBELoader().load('./assets/lake.hdr',t=>{t.mapping=T.EquirectangularReflectionMapping;scene.environment=t;scene.environmentIntensity=.4;},undefined,()=>{});
}catch(e){document.querySelector('#busy').textContent='载入失败：'+e.message;console.error(e);}
renderer.setAnimationLoop(()=>{controls.update();if(!canvas.hidden)renderer.render(scene,camera);});
