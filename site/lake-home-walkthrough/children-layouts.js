import * as T from './vendor/three.module.js';
import {OrbitControls,RoundedBoxGeometry} from './vendor/render-libs.js';
import {makeChildStudy,activeItems,doorPolygon,auditOption,probeRoutes} from './child-layout-options.js';
const host=document.querySelector('#viewport'),svg=document.querySelector('#plan'),canvas=document.querySelector('#model');
const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;
const scene=new T.Scene();scene.background=new T.Color('#e9e5dc');scene.add(new T.HemisphereLight('#fff9ec','#b6b2a5',2));const sun=new T.DirectionalLight('#fff3df',2);sun.position.set(2,7,4);scene.add(sun);
const camera=new T.PerspectiveCamera(45,1,.01,50);camera.position.set(5.6,6.6,-4.0);
const controls=new OrbitControls(camera,canvas);controls.target.set(1.7,.4,1.35);controls.minDistance=2;controls.maxDistance=12;controls.maxPolarAngle=Math.PI*.49;controls.update();
let study,selected,group=new T.Group(),view='plan',dirty=true,audit,routes=[];scene.add(group);controls.addEventListener('change',()=>dirty=true);
const add=(tag,attrs,text,parent=svg)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text)e.textContent=text;parent.append(e);return e;};
function text(x,y,content,small=false){return add('text',{x,y,'text-anchor':'middle',class:small?'small':'furniture-label'},content);}
function dimensions(){
 for(const [x1,z1,x2,z2,label] of [[0,-.22,study.width,-.22,`${study.width*1000} mm`],[-.24,0,-.24,study.depth,`${study.depth*1000} mm`]]){
  add('line',{x1,y1:z1,x2,y2:z2,stroke:'#78806c','stroke-width':.009});
  for(const [x,z] of [[x1,z1],[x2,z2]])add('line',{x1:x-.035,y1:z-.035,x2:x+.035,y2:z+.035,stroke:'#78806c','stroke-width':.009});
  const labelNode=text((x1+x2)/2-(x1===x2?.10:0),(z1+z2)/2-(z1===z2?.06:0),label,true);if(x1===x2)labelNode.setAttribute('transform',`rotate(-90 ${x1-.1} ${(z1+z2)/2})`);
 }
}
function drawPlan(items,degrees){
 svg.replaceChildren();add('rect',{x:0,y:0,width:study.width,height:study.depth,fill:'#f9f7f1',stroke:'#737969','stroke-width':.025});
 // Bay excluded entirely: this is the dimensioned rectangular furniture envelope.
 add('line',{x1:study.width,y1:.35,x2:study.width,y2:1.95,stroke:'#98bbb9','stroke-width':.04});
 const bayText=text(3.74,1.3,'飘窗不放家具',true);bayText.setAttribute('transform','rotate(90 3.74 1.3)');
 const door=selected.door||study.door,sweep=[[door.x,door.z],...Array.from({length:91},(_,a)=>{const p=doorPolygon(door,a);return [(p[1][0]+p[2][0])/2,(p[1][1]+p[2][1])/2];})];
 add('polygon',{points:sweep.map(p=>p.join(',')).join(' '),fill:'#cfa88a','fill-opacity':.17});
 for(const i of items){
  const hit=audit.pairs.some(p=>!p.underDesk&&(p.a===i.id||p.b===i.id))||audit.doorHits.some(p=>p.id===i.id);
  add('rect',{x:i.x,y:i.z,width:i.w,height:i.d,rx:.025,fill:i.color,stroke:hit?'#b9674c':'#8a927f','stroke-width':hit?.022:.01});
  const label=text(i.x+i.w/2,i.z+i.d/2-.025,i.label);label.style.fontSize=Math.min(.11,i.w/(i.label.length*.9))+'px';
  text(i.x+i.w/2,i.z+i.d/2+.11,`${Math.round(i.w*1000)}×${Math.round(i.d*1000)}`,true);
 }
 if(degrees===90)for(const route of routes.filter(r=>r.reached))add('polyline',{points:route.path.map(p=>p.join(',')).join(' '),fill:'none',stroke:'#5c7667','stroke-width':.012,'stroke-dasharray':'.035 .025'});
 add('polygon',{points:doorPolygon(door,degrees).map(p=>p.join(',')).join(' '),fill:'#ac7954'});dimensions();
 text(1.75,3.0,selected.id==='current'?'现模型门叶 / 柜身实物占位对照':'阴影：900 mm 半径门扫掠预留，含方案余量',true);
}
function box(x,y,z,w,h,d,color,rounded=false){
 const g=rounded?new RoundedBoxGeometry(w,h,d,3,Math.min(.025,w/10,h/10,d/10)):new T.BoxGeometry(w,h,d);
 const m=new T.Mesh(g,new T.MeshStandardMaterial({color,roughness:.7}));m.position.set(x+w/2,y+h/2,z+d/2);group.add(m);return m;
}
function drawModel(items,degrees){
 scene.remove(group);group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});group=new T.Group();scene.add(group);
 box(0,-.045,0,study.width,.045,study.depth,'#d8d4ca');
 // Low edges express only the envelope, not assumed full-height construction walls.
 box(0,0,-.025,study.width,.08,.025,'#9da18f');box(0,0,study.depth,study.width,.08,.025,'#9da18f');box(study.width,0,0,.025,.08,study.depth,'#9da18f');
 for(const i of items){
  if(i.id==='desk'){
   box(i.x,.71,i.z,i.w,.04,i.d,i.color,true);for(const x of [i.x+.03,i.x+i.w-.07])for(const z of [i.z+.025,i.z+i.d-.065])box(x,0,z,.04,.71,.04,'#938d7b');
  }else if(i.id==='chair'){
   box(i.x,.43,i.z,i.w,.05,i.d,i.color,true);box(i.x,.48,i.z+i.d-.04,i.w,.34,.04,i.color,true);for(const x of [i.x+.03,i.x+i.w-.06])for(const z of [i.z+.03,i.z+i.d-.06])box(x,0,z,.03,.43,.03,'#767c6d');
  }else if(i.id==='bed'){
   const across=i.w>i.d;box(i.x,.08,i.z,i.w,.27,i.d,i.color,true);box(i.x+(across?.04:.03),.35,i.z+(across?.03:.02),i.w-(across?.08:.06),.20,i.d-(across?.06:.04),'#e7e2d5',true);
   box(i.x+(across?i.w-.43:.05),.55,i.z+.05,across?.34:i.w-.10,.09,across?i.d-.1:.34,'#faf7ee',true);
  }else{
   box(i.x,0,i.z,i.w,i.h,i.d,i.color,true);
   if(i.w>i.d){for(let x=i.x+.6;x<i.x+i.w;x+=.6)box(x,0,i.z-.001,.008,i.h,.006,'#7e8973');}
   else box(i.x+i.w-.001,0,i.z+i.d/2,.006,i.h,.008,'#7e8973');
  }
 }
 const p=doorPolygon(selected.door||study.door,degrees),shape=new T.Shape(p.map(([x,z])=>new T.Vector2(x,-z))),mesh=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:false}),new T.MeshStandardMaterial({color:'#ac7954'}));mesh.rotation.x=-Math.PI/2;group.add(mesh);dirty=true;
}
function update(){
 const pulled=document.querySelector('#pull').checked,degrees=Number(document.querySelector('#angle').value),items=activeItems(selected,pulled);audit=auditOption(study,selected,pulled);routes=selected.id==='current'?[]:probeRoutes(study,selected,pulled);
 document.querySelector('#angleText').textContent=degrees+'°';document.querySelector('#status').textContent=selected.status;document.querySelector('#summary').textContent=selected.summary;
 document.querySelector('#pull').disabled=!selected.items.some(i=>i.id==='chair');document.querySelectorAll('[data-option]').forEach(b=>b.classList.toggle('active',b.dataset.option===selected.id));
 document.querySelector('#source').textContent=`${study.source.width}；${study.source.depth}。`+(selected.id==='current'?'门片与家具取现模型实物包围盒，保留其原位置，不用试排门位掩盖旧冲突。':`原门片矢量约 ${Math.round(study.door.sourceRadius*1000)} mm，扫掠预留暂取 900 mm，不是门扇采购尺寸。`);
 const list=document.querySelector('#notes');list.replaceChildren();for(const note of selected.notes){const li=document.createElement('li');li.textContent=note;list.append(li);}
 const gaps=document.querySelector('#gaps');gaps.replaceChildren();for(const g of selected.gaps||[]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=g.label;dd.textContent=g.mm+' mm';gaps.append(dt,dd);}
 const hard=audit.pairs.filter(p=>!p.underDesk),message=[audit.insideCore?'外框在试排范围内':'有外框超出试排范围',hard.length?`家具冲突：${hard.map(p=>p.a+' / '+p.b).join('，')}`:'未发现家具外框硬重叠',audit.doorHits.length?`门扫掠候选：${audit.doorHits.map(p=>p.id).join('，')}`:'1° 抽样未发现门预留扫掠重叠'];
 document.querySelector('#audit').textContent=message.join('；')+'。椅子收进桌下单列处理，坐人、椅背和五金仍须复核。';
 document.querySelector('#routes').textContent=routes.length?'600 mm 圆形占位 / 门开 90° / 25 mm 网格试探：'+routes.map(r=>r.label+(r.reached?'可达':'未连通')).join('；')+'。虚线为其中心路径，不是实测人体或无障碍通道验收。':'';drawPlan(items,degrees);drawModel(items,degrees);
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;svg.toggleAttribute('hidden',view!=='plan');canvas.hidden=view!=='3d';document.querySelectorAll('[data-view]').forEach(n=>n.classList.toggle('active',n===b));dirty=true;});
document.querySelector('#pull').onchange=update;document.querySelector('#angle').oninput=update;
new ResizeObserver(()=>{renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();dirty=true;}).observe(host);
function frame(){requestAnimationFrame(frame);if(dirty&&view==='3d'){renderer.render(scene,camera);dirty=false;}}frame();
try{
 const inputs=await Promise.all(['source-dimension-audit.json','source-opening-schedule.json','child-current-layout-audit.json'].map(async path=>{const r=await fetch(path);if(!r.ok)throw Error(path+' '+r.status);return r.json();}));
 study=makeChildStudy(...inputs);selected=study.options.find(o=>o.id===new URLSearchParams(location.search).get('option'))||study.options[0];
 for(const o of study.options){const b=document.createElement('button');b.dataset.option=o.id;b.textContent=o.title;b.onclick=()=>{selected=o;document.querySelector('#pull').checked=false;update();};document.querySelector('#options').append(b);}update();document.querySelector('#loading').hidden=true;
 window.childStudyDebug={get state(){return {option:selected.id,view,audit,routes,items:activeItems(selected,document.querySelector('#pull').checked),camera:camera.position.toArray(),core:[study.width,study.depth]};}};
}catch(e){document.querySelector('#loading').textContent='试排加载失败：'+e.message;console.error(e);}
