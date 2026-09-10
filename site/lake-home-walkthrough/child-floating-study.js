import * as T from './vendor/three.module.js';
import {OrbitControls,RoundedBoxGeometry} from './vendor/render-libs.js';
import {layout as d,audit,doorTip} from './child-floating-layout.js?v=95';
import {addComputerZone} from './child-floating-computer.js?v=95';
import {chairGeometry,chairCheck} from './child-floating-chair.js?v=95';
const $=s=>document.querySelector(s),host=$('#viewer'),canvas=$('#scene'),svg=$('#plan');
const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e9e5dc');const camera=new T.PerspectiveCamera(48,1,.02,30),controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;
scene.add(new T.HemisphereLight('#fffaf4','#a0a7ac',2));const sun=new T.DirectionalLight('#fff8ef',2.6);sun.position.set(6,5,2);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:15});scene.add(sun);
const material=c=>new T.MeshStandardMaterial({color:c,roughness:.85});const white=material('#f0f1ee'),face=material('#e2e5e3'),dark=material('#434c53'),fabric=material('#cbd1d5'),linen=material('#edece8'),wall=material('#f3f2ed');wall.transparent=true;wall.opacity=.3;
function box(name,r,y,h,m=white,p=scene,rad=.006){const o=new T.Mesh(new RoundedBoxGeometry(r[2]-r[0],h,r[3]-r[1],3,rad),m);o.name=name;o.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
box('floor',d.room,-.06,.06,material('#dce0dc'));
box('north-wall',[0,-.12,3.5,0],0,2.6,wall);box('south-wall',[0,2.7,3.5,2.82],0,2.6,wall);
box('west-north-original-wall',[-.1,0,0,1.35],0,2.6,wall);box('west-south-original-wall',[-.1,2.25,0,2.7],0,2.6,wall);box('original-lintel',[-.1,1.35,0,2.25],2.12,.48,wall);
box('window-north-pier',[3.5,0,3.62,.34],0,2.6,wall);box('window-south-pier',[3.5,1.95,3.62,2.7],0,2.6,wall);box('retained-bay',d.bay,0,d.sillHeight,white);
const glass=new T.MeshStandardMaterial({color:'#abc3ca',transparent:true,opacity:.22,roughness:.12,side:T.DoubleSide});box('bay-glass',[4.09,.34,4.11,1.95],.55,1.70,glass);for(const z of [.34,1.93]){box('bay-side',[3.5,z,4.11,z+.02],.55,1.7,glass);box('window-frame',[4.08,z,4.11,z+.02],.55,1.7,dark);}for(const y of [.55,2.225])box('window-rail',[4.08,.34,4.11,1.95],y,.025,dark);
const b=d.bed;box('bed-base',b,.18,.16,fabric,scene,.024);box('mattress',[b[0]+.02,b[1]+.04,b[2]-.02,b[3]-.02],.34,.22,linen,scene,.04);box('headboard',[b[0],b[1],b[2],b[1]+.035],.30,.77,fabric,scene,.015);box('duvet',[b[0]+.025,.63,b[2]-.025,2.04],.56,.065,linen,scene,.03);box('throw',[b[0]+.04,1.64,b[2]-.04,2.04],.625,.022,fabric,scene,.01);for(const x of [b[0]+.07,b[0]+.79])box('pillow',[x,.15,x+.61,.54],.56,.12,linen,scene,.045);
const w=d.wardrobe;box('wardrobe-back',[w[0],w[1],w[0]+.018,w[3]],.08,2.42);for(const z of [w[1],w[3]-.018])box('wardrobe-side',[w[0],z,w[2],z+.018],.08,2.42);for(const y of [.08,.90,1.96,2.482])box('wardrobe-shelf',[w[0]+.018,w[1]+.018,w[2]-.05,w[3]-.018],y,.018);
box('wardrobe-middle',[w[0]+.018,.61,w[2]-.05,.628],.098,2.384);for(const z of [.31,.91]){box('pullout-rail',[.045,z-.01,.42,z+.01],1.78,.02,dark);for(let i=0;i<4;i++)box('child-clothes',[.07+i*.08,z-.23,.095+i*.08,z+.23],1.15,.55,i%2?fabric:linen);}
const doors=[];for(const r of [[.478,.025,.50,.625],[.45,.605,.472,1.215]])doors.push(box('wardrobe-sliding-door',r,.10,1.846,face));for(const z of [.025,.625])doors.push(box('wardrobe-upper-door',[.478,z,.50,z+.59],1.982,.50,face));
// Recess the entry display into the existing footprint, not into the 62cm aisle.
const j=d.joinery,e=j.endDisplay;
scene.children.filter(o=>o.name==='wardrobe-side'&&o.position.z>1).forEach(o=>{scene.remove(o);o.geometry.dispose();});
box('entry-end-lower',[0,1.202,.50,1.22],.08,j.endBottom-.08,face);
box('entry-end-upper',[0,1.202,.50,1.22],j.endTop,2.50-j.endTop,face);
box('entry-display-back',[e[0],e[1],e[2],e[1]+.018],j.endBottom,j.endTop-j.endBottom,dark);
for(const x of [e[0]-.018,e[2]])box('entry-display-jamb',[x,e[1],x+.018,1.22],j.endBottom,j.endTop-j.endBottom,white);
for(const y of [j.endBottom,1.57,j.endTop-.018])box('entry-rounded-display-shelf',e,y,.018,white,scene,.008);
// The last hanging bay gives up its rear upper portion to the recessed display.
scene.children.filter(o=>o.name==='child-clothes'&&o.position.z>.6).forEach(o=>{o.scale.z=.30/.46;o.position.z=.82;});
scene.children.filter(o=>o.name==='pullout-rail'&&o.position.z>.6).forEach(o=>o.position.z=.82);
box('display-photo',[.10,1.06,.27,1.075],1.20,.22,white);
box('display-photo-inset',[.115,1.075,.255,1.08],1.215,.19,fabric);
for(let i=0;i<3;i++)box('display-small-books',[.29+i*.035,1.055,.315+i*.035,1.16],1.20,.18,i%2?face:fabric);
const ornament=new T.Mesh(new T.SphereGeometry(.065,24,16),fabric);ornament.position.set(.25,1.653,1.10);scene.add(ornament);
// Main learning surface is perpendicular to the window. No solid bay is counted as knee space.
// One continuous visible profile. Fabrication seams / steel brackets still need detailing.
const topShape=new T.Shape();j.continuousTop.forEach(([x,z],i)=>i?topShape.lineTo(x,-z):topShape.moveTo(x,-z));topShape.closePath();
const topGeometry=new T.ExtrudeGeometry(topShape,{depth:.025,bevelEnabled:false});topGeometry.rotateX(-Math.PI/2);
const continuousTop=new T.Mesh(topGeometry,white);continuousTop.name='continuous-desk-bay-return';continuousTop.position.y=.725;continuousTop.castShadow=continuousTop.receiveShadow=true;scene.add(continuousTop);
for(const x of[3.55,4.00])box('bay-top-support-sleeper',[x,.38,x+.05,1.91],d.sillHeight,.725-d.sillHeight,face);
box('rear-table-support',[2.70,.025,3.46,.045],.695,.03,dark);
box('monitor-arm-base',[3.63,.42,3.73,.52],.75,.025,dark);box('monitor-arm',[3.61,.44,3.65,.48],.77,.30,dark);
box('monitor',[3.43,.32,3.46,.88],.99,.32,dark);box('monitor-screen',[3.425,.335,3.43,.865],1.005,.29,material('#8797a2'));
box('open-workbook',[2.79,.23,3.27,.53],.752,.012,linen);box('pencil',[3.30,.26,3.31,.45],.754,.012,dark);
box('keyboard-parked',[3.65,1.18,3.98,1.34],.752,.012,face);
box('study-upper-back',[2.68,.004,3.48,.022],1.34,1.16,face);for(const y of [1.34,1.95,2.462])box('study-shelf',[2.68,.02,y===1.34?3.28:3.48,.28],y,.018,white);box('study-upper-door',[2.684,.26,3.476,.28],1.973,.485,white);
for(let i=0;i<5;i++)box('study-books',[2.72+i*.035,.045,2.744+i*.035,.21],1.358,.25,i%2?fabric:white);
box('display-frame',[2.99,.04,3.23,.055],1.358,.26,dark);box('display-picture',[3.005,.055,3.215,.059],1.373,.23,linen);
const glow=new T.MeshStandardMaterial({color:'#fff6e7',emissive:'#fff0d9',emissiveIntensity:1});box('desk-light-diffuser',[2.73,.195,3.43,.208],1.333,.007,glow);
// Unified head / study joinery. No new floor furniture or thicker bed headboard.
const h=j.headUpper;
box('head-upper-back',[h[0],h[1],h[2],h[1]+.018],j.headUpperBottom,j.upperTop-j.headUpperBottom,face);
for(const y of [j.headUpperBottom,j.upperTop-.018])box('head-upper-shelf',h,y,.018,white);
const headModules=[h[0],b[0],1.64,2.16,h[2]];for(let i=0;i<headModules.length-1;i++)box('head-upper-front',[headModules[i]+.003,h[3]-.02,headModules[i+1]-.003,h[3]],j.headUpperBottom+.023,j.upperTop-j.headUpperBottom-.044,white);
for(const x of [h[0],h[2]-.018])box('head-upper-end',[x,h[1],x+.018,h[3]],j.headUpperBottom,j.upperTop-j.headUpperBottom,white);
box('ceiling-scribed-filler',[.50,.02,3.48,.28],2.48,.12,white);
const gap=j.gapDisplay;
box('gap-display-back',[gap[0],gap[1],gap[2],gap[1]+.018],j.gapBottom,j.headUpperBottom-j.gapBottom,dark);
for(const x of [gap[0],gap[2]-.018])box('gap-display-upright',[x,gap[1],x+.018,gap[3]],j.gapBottom,j.headUpperBottom-j.gapBottom,white);
for(const y of [j.gapBottom,1.15,1.55])box('gap-display-shelf',gap,y,.022,white);
box('gap-frame',[.61,.055,.86,.072],1.172,.26,white);box('gap-frame-picture',[.63,.072,.84,.075],1.192,.22,fabric);
for(let i=0;i<4;i++)box('gap-books',[.60+i*.045,.055,.63+i*.045,.20],.782,.23,i%2?fabric:face);
const gapObject=new T.Mesh(new T.TorusGeometry(.075,.015,12,32),face);gapObject.position.set(.82,1.68,.10);scene.add(gapObject);
box('gap-display-light',[.54,.055,1.08,.065],1.936,.008,glow);
box('head-wall-finish',[b[0],.003,b[2],.017],1.07,.79,face);
box('head-light-recess',[b[0]+.07,.019,b[2]-.07,.028],1.075,.008,glow);
for(const x of [b[0]+.07,b[2]-.14]){box('flush-bed-switch',[x,.018,x+.07,.024],.94,.07,dark);box('reading-light',[x+.015,.024,x+.045,.052],1.18,.08,dark);}
const f=j.windowShelf;
box('window-pier-book-back',[f[2]-.016,f[1],f[2],f[3]],j.windowBottom,j.windowTop-j.windowBottom,face);
for(const z of [f[1],f[3]-.018])box('window-book-side',[f[0],z,f[2],z+.018],j.windowBottom,j.windowTop-j.windowBottom,white);
for(const y of [j.windowBottom,1.12,1.51,j.windowTop])box('window-pier-book-shelf',f,y,.018,white);
for(let i=0;i<4;i++)box('window-books',[3.31,.06+i*.035,3.455,.083+i*.035],.788,.22,i%2?face:fabric);
box('window-display-frame',[3.445,.09,3.46,.25],1.53,.23,dark);
const far=j.farWindowShelf;
box('far-window-back',[far[2]-.018,far[1],far[2],far[3]],j.farWindowBottom,2.60-j.farWindowBottom,face);
for(const z of [far[1],far[3]-.018])box('far-window-side',[far[0],z,far[2],z+.018],j.farWindowBottom,2.60-j.farWindowBottom,white);
for(const y of [j.farWindowBottom,2.462])box('far-window-shelf',far,y,.018,white);
box('far-window-upper-front',[far[0],far[1]+.022,far[0]+.02,far[3]-.022],1.973,.485,white);
box('far-window-ceiling-filler',far,2.48,.12,white);
box('bay-front-shadowline',[3.500,.64,3.509,1.92],.70,.009,dark);
const dp=j.doorBackPanel,doorBack=box('thin-doorback-panel',dp,j.doorBackBottom,j.doorBackTop-j.doorBackBottom,face);
box('entry-display-strip',[.07,1.055,.42,1.065],1.93,.008,glow);
const chair=new T.Group();scene.add(chair);const c=d.chair,cx=(c[0]+c[2])/2,cz=(c[1]+c[3])/2;box('chair-seat',[c[0]+.035,c[1]+.025,c[2]-.035,c[3]-.045],.43,.065,fabric,chair,.025);box('chair-back',[c[0]+.035,c[3]-.065,c[2]-.035,c[3]-.025],.49,.46,dark,chair,.018);box('chair-lift',[cx-.02,cz-.02,cx+.02,cz+.02],.07,.36,dark,chair);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,o=new T.Mesh(new T.BoxGeometry(.25,.025,.025),dark);o.position.set(cx+Math.cos(a)*.12,.07,cz+Math.sin(a)*.12);o.rotation.y=-a;chair.add(o);}
// 65cm base is a conservative assumed envelope, not a measured chair.
for(const o of chair.children){if(o.geometry.type==='BoxGeometry'){o.scale.x=1.3;o.position.x=cx+(o.position.x-cx)*1.3;o.position.z=cz+(o.position.z-cz)*1.3;}o.position.x-=cx;o.position.z-=cz;}
chair.position.set(cx,0,cz);
const pivot=new T.Group();pivot.position.set(...[d.door.hinge[0],0,d.door.hinge[1]]);scene.add(pivot);box('original-door',[-.02,-.9,.02,0],.02,2.10,white,pivot);box('door-handle',[.02,-.81,.08,-.68],.96,.018,dark,pivot);
const doorMaterial=white.clone();pivot.children[0].material=doorMaterial;
for(const r of [[0,0,3.5,.1],[0,2.6,3.5,2.7],[0,.1,.1,2.6],[3.4,.1,3.5,2.6]])box('single-eyelid',r,2.5,.1,white);
const lamp=new T.Mesh(new T.CylinderGeometry(.25,.25,.04,64),white);lamp.position.set(1.75,2.57,1.35);scene.add(lamp);const lens=new T.Mesh(new T.CylinderGeometry(.24,.24,.006,64),glow);lens.position.set(1.75,2.545,1.35);scene.add(lens);
const computerZone=addComputerZone({T,scene,box,d,white,face,dark,fabric,glow,sun});
function plan(){svg.replaceChildren();svg.setAttribute('viewBox','-.35 -.28 4.65 3.50');const add=(tag,attrs,text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text)e.textContent=text;svg.append(e);return e;};const rect=(r,fill)=>add('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill,stroke:'#8c9289','stroke-width':.012});const label=(x,y,t,s=.095)=>add('text',{x,y,'text-anchor':'middle','font-size':s,fill:'#41453e'},t);
rect(d.room,'#f4f2eb');rect(d.bay,'#d8e1e2');rect(d.bed,'#d6dde0');rect([b[0],b[1],b[2],b[1]+.05],'#8999a3');rect(w,'#e3e7db');add('polygon',{points:j.continuousTop.map(p=>p.join(',')).join(' '),fill:'#fffdf6',stroke:'#8c9289','stroke-width':.012});const pose=chairGeometry($('#chairmode').value);add('circle',{cx:pose.cx,cy:pose.cz,r:pose.radius,fill:'#c0c8b355',stroke:'#657c72','stroke-width':.01});add('polygon',{points:pose.polygon.map(p=>p.join(',')).join(' '),fill:'#c0c8b3',stroke:'#657c72','stroke-width':.012});rect(d.computer.tower,'#b8c0c5');
label(1.75,-.12,'350cm');label(1.90,1.05,'150×200cm床',.12);label(.24,.58,'衣柜',.10);label(.24,.76,'120×50',.085);label(3.08,.48,'80×70主桌',.085);label(3.8,1.32,'台面退回飘窗',.065);label(3.76,.95,'机箱',.065);label(1.85,2.47,'床尾62cm');label(.81,.70,'62cm');label(3.08,2.05,'椅侧净宽84cm',.075);label(3.02,2.36,'后撤区不设下柜',.075);
for(const r of [j.headUpper,j.endDisplay,j.windowShelf,j.gapDisplay,j.farWindowShelf])add('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill:'#cdd5d8','fill-opacity':.4,stroke:'#697982','stroke-width':.01,'stroke-dasharray':'.035 .025'});
label(1.89,.19,'连续通顶上柜 · 底高195cm',.075);label(.25,1.13,'内凹展示',.07);label(.81,.40,'浅展示22cm',.07);label(3.38,.23,'书格',.065);label(3.38,2.58,'高位柜',.060);rect(dp,'#aeb9bd');label(.32,2.57,'薄门后板',.065);
add('line',{x1:0,y1:0,x2:0,y2:1.35,stroke:'#72776f','stroke-width':.055});add('line',{x1:0,y1:2.25,x2:0,y2:2.7,stroke:'#72776f','stroke-width':.055});const angle=Number($('#angle').value),t=doorTip(angle);add('line',{x1:d.door.hinge[0],y1:d.door.hinge[1],x2:t[0],y2:t[1],stroke:'#a86e42','stroke-width':.04});add('path',{d:`M-.05 1.35 A.9 .9 0 0 1 ${t[0]} ${t[1]}`,fill:'none',stroke:'#a86e42','stroke-width':.016,'stroke-dasharray':'.04 .025'});label(.38,2.03,angle+'°',.09);
label(1.75,2.94,'侧向学习位：桌宽80cm、开门115°均是需要接受/核实的条件',.075);
}
function state(){const angle=Number($('#angle').value),mode=$('#chairmode').value,g=chairGeometry(mode),check=chairCheck(mode,angle);pivot.rotation.y=-angle*Math.PI/180;chair.position.set(g.cx,0,g.cz);chair.rotation.y=-g.angle*Math.PI/180;doors.forEach(o=>o.visible=!$('#inside').checked);doorBack.material=$('#doorback').value==='board'?fabric:face;doorMaterial.transparent=$('#ghost').checked;doorMaterial.opacity=$('#ghost').checked?.18:1;wall.opacity=1-Number($('#opacity').value)/100;computerZone.update($('#inspect').checked,$('#lighting').value);plan();$('#audit').textContent=`椅子本体${check.collisions.length?'存在碰撞':'此位置未检测到重叠'}；最小侧余量约${check.sideMinCM.toFixed(1)}cm。仅为56×58cm椅身＋65cm底座假设，不含人体、手臂和膝部转身；未通过入座舒适验收。`;$('#note').textContent=$('#ghost').checked?'门扇透明仅用于查看门后，不代表玻璃门。':angle===90?'90°原门通行仍受限；当前不是已定稿方案。':'主桌80×70cm；腿位约66宽×61深×70高。飘窗段仅置物；悬挑支撑需核墙体。';}
function resize(){renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}
function view(v){if(v==='knee'){document.querySelector('#chairmode').value='back60';state();}canvas.hidden=v==='plan';svg.toggleAttribute('hidden',v!=='plan');document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));const views={knee:[[3.08,.38,1.10],[3.08,.38,.20],75],whole:[[5.3,4.8,5.4],[1.75,.8,1.1],48],study:[[3.05,1.60,2.43],[3.12,1.14,.26],60],window:[[.81,1.70,1.42],[3.50,1.22,1.35],72],entry:[[.30,1.60,1.78],[2.8,1.0,.8],75],joinery:[[1.80,1.67,2.57],[1.75,1.52,.06],85],doorback:[[1.90,1.68,1.84],[.12,1.29,1.70],85]};if(views[v]){const[p,t,f]=views[v];camera.position.fromArray(p);controls.target.fromArray(t);camera.fov=f;if(v==='whole'&&host.clientHeight>host.clientWidth)camera.position.sub(controls.target).multiplyScalar(1.3).add(controls.target);controls.update();}resize();}
for(const id of ['angle','chairmode','inside','opacity','doorback','ghost','inspect','lighting'])$('#'+id).oninput=state;document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));new ResizeObserver(resize).observe(host);state();view(new URLSearchParams(location.search).get('view')||'study');renderer.setAnimationLoop(()=>{controls.update();if(!canvas.hidden)renderer.render(scene,camera);});

document.querySelector('#pull-chair').onclick=()=>{const el=document.querySelector('#chairmode');el.value=el.value==='normal'?'back30':'normal';state();view('study');};
