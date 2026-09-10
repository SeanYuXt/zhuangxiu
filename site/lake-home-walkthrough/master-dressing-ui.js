import * as T from './vendor/three.module.js';
import {rooms,P,walls} from './plan.js';
import {masterDressingSpec,makeMasterDressing,dressingOccupant,clearMasterFootPassage} from './master-dressing.js?v=matte-fabric-2';

export function wireMasterDressing({getModel,focus,onChanged}){
 const panel=document.querySelector('#masterDressing'),metrics=document.querySelector('#masterDressingMetrics');
 let key='original',baseline=null,originals=[],candidate=null,use='stored',doorsOpen=false;
 const box=o=>new T.Box3().setFromObject(o);
 function update(){
  candidate?.setUse(use);candidate?.setDoors(doorsOpen);
  const top=candidate?.spec.storageAccess==='top';
  metrics.textContent=candidate?`${candidate.spec.label}\n${candidate.spec.description}\n高柜长度合计约 ${candidate.spec.highStorageLength.toFixed(2)} m；浅矮柜 ${candidate.spec.lowStorageLength.toFixed(2)} m（不是挂衣柜）。\n状态：${{stored:'凳子收进',seated:'凳子拉出 450 mm',drawer:top?'拉凳＋翻盖取物':'拉凳并开抽屉 320 mm'}[use]}。长度不是净收纳容量；人、衣物及五金仍待选型复核。`:'现状：约 2.3 m 入口衣柜＋约 3.1 m 床尾衣柜，无梳妆台。床尾至柜门约 600 mm，不是独立衣帽间。';
  if(candidate)metrics.textContent+='\n本轮局部试验：'+(key==='balanced'?'收凳、拉凳、翻盖三状态至床两侧及主卫门前均连通；床尾截面仅约 652 mm，仍偏紧，不是宽敞衣帽区。翻盖每 1° 采样未碰镜灯或固定台面；此布局已接入当前全屋设计；真实家具、五金与安装仍未选型。':key==='storage'?'三种状态下右床侧均未连通；开抽屉并后退占位时，左床侧及主卫门前也不连通，不能视为布局通过。':'收凳时两侧床边连通；使用梳妆位时右侧不连通。开抽屉并后退 320 mm 的人体占位与床重叠，此动作未通过，不能照此定制。')+'\n600 mm 圆形代理、25 mm 网格及假设人体占位，不是现场验收。';
  panel.querySelectorAll('[data-dressing-option]').forEach(b=>{b.classList.toggle('active',b.dataset.dressingOption===key);b.setAttribute('aria-pressed',String(b.dataset.dressingOption===key));});
  panel.querySelectorAll('[data-dressing-use]').forEach(b=>{b.disabled=!candidate;b.classList.toggle('active',b.dataset.dressingUse===use);});
  panel.querySelector('[data-dressing-use="drawer"]').textContent=top?'拉凳＋翻盖取物':'拉凳＋开抽屉';
  const door=document.querySelector('#dressingDoors');door.disabled=!candidate;door.textContent=doorsOpen?'恢复柜门':'滑开柜门看收纳';
  onChanged();
 }
 function choose(next){
  if(window.acceptedSuite)return;
  const model=getModel();if(!model)return;
  clearMasterFootPassage(model);
  if(!baseline){originals=['master-entry-wardrobe','master-wardrobe'].map(n=>model.getObjectByName(n));const bed=model.getObjectByName('master-bed');baseline={entry:box(originals[0]),foot:box(originals[1]),bedObject:bed,bedBounds:box(bed),bedPosition:bed.position.clone()};}
  if(candidate){candidate.root.removeFromParent();const materials=new Set();candidate.root.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});materials.forEach(m=>m.dispose());candidate=null;}
  originals.forEach((o,i)=>{o.visible=true;o.name=['master-entry-wardrobe','master-wardrobe'][i];});baseline.bedObject.name='master-bed';baseline.bedObject.visible=true;baseline.bedObject.position.copy(baseline.bedPosition);key=next;use='stored';doorsOpen=false;
  if(next!=='original'){
   originals.forEach(o=>{o.visible=false;o.name+='-baseline';});
   candidate=makeMasterDressing(masterDressingSpec(next,baseline),baseline.bedObject);model.add(candidate.root);
   if(candidate.spec.refinedBed){baseline.bedObject.name='master-bed-baseline';baseline.bedObject.visible=false;}
   model.getObjectByName('master-bed').position.x+=candidate.spec.bedShiftX||0;
  }
  document.querySelector('#spaceGuide').close();update();
  focus(candidate?{label:candidate.spec.label+' · 梳妆位',object:'master-makeup-desk',note:'桌、镜面灯、凳子与高柜已接入当前全屋方案；不是独立衣帽间，不代表真实产品与安装通过。',position:next!=='open'?[13.70,1.50,3.45]:[15.65,1.55,3.5]}:{label:'主卧入口衣柜',object:'master-entry-wardrobe',note:'恢复基准原状：没有梳妆台。',position:[13.6,1.5,4.9]});
 }
 panel.querySelectorAll('[data-dressing-option]').forEach(b=>b.onclick=()=>choose(b.dataset.dressingOption));
 panel.querySelectorAll('[data-dressing-use]').forEach(b=>b.onclick=()=>{use=b.dataset.dressingUse;update();});
 document.querySelector('#dressingDoors').onclick=()=>{doorsOpen=!doorsOpen;update();};
 document.querySelector('[data-master-dressing]').onclick=()=>choose('balanced');
 const compact=matchMedia('(max-width:800px)');if(compact.matches)panel.open=false;compact.addEventListener('change',e=>{if(e.matches)panel.open=false;});
 document.querySelector('#dressingPlanButton').onclick=()=>{
  const svg=document.querySelector('#dressingPlan'),ns='http://www.w3.org/2000/svg';svg.replaceChildren();
  const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;svg.append(e);return e;};
  add('polygon',{points:rooms.find(r=>r.id==='master').poly.map(P).map(p=>p.join(',')).join(' '),fill:'#eae7dd'});
  for(const w of walls){const a=P(w.a),b=P(w.b),len=Math.hypot(b[0]-a[0],b[1]-a[1]);const seg=(f,t)=>{if(t>f)add('line',{x1:a[0]+(b[0]-a[0])*f/len,y1:a[1]+(b[1]-a[1])*f/len,x2:a[0]+(b[0]-a[0])*t/len,y2:a[1]+(b[1]-a[1])*t/len,stroke:w.glass?'#8ab3b4':'#818277','stroke-width':w.glass?.035:(w.t||20)/100});};let last=0;for(const o of [...(w.open||[])].sort((a,b)=>a.at-b.at)){seg(last,o.at/100);last=(o.at+o.w)/100;}seg(last,len);}
  const model=getModel();model.updateMatrixWorld(true);
  const bed=model.getObjectByName('master-bed'),bedParts=bed.children.filter(o=>{if(!o.isMesh)return false;const b=box(o),s=b.getSize(new T.Vector3());return o===bed.children[0]||(s.x>.40&&s.x<.46&&s.z>.40&&s.z<.46&&b.min.y<.06&&b.max.y<.5);});
  for(const o of bedParts){const b=box(o);add('rect',{x:b.min.x,y:b.min.z,width:b.max.x-b.min.x,height:b.max.z-b.min.z,fill:'#d7cfbe',stroke:'#6d7766','stroke-width':.012});}
  const bb=box(bed.children[0]);add('text',{x:(bb.min.x+bb.max.x)/2,y:(bb.min.z+bb.max.z)/2,'text-anchor':'middle','font-size':.13,fill:'#373731'},`1.8 m 床垫 / 床框约 ${(bb.max.x-bb.min.x).toFixed(2)} × ${(bb.max.z-bb.min.z).toFixed(2)} m`);
  const names=[['master-entry-wardrobe','入口高柜'],['master-wardrobe',key==='open'?'浅矮柜':'床尾高柜'],['master-makeup-desk','梳妆位'],['master-makeup-stool',''],['makeup-drawer',''],['makeup-lid',''],['door-master-single',''],['door-bath2-single','']];
  for(const [name,label] of names){const o=model.getObjectByName(name);if(!o)continue;
   const bounds=name==='master-makeup-desk'?candidate.spec.desk:null,b=bounds?new T.Box3(new T.Vector3(bounds.x0,0,bounds.z0),new T.Vector3(bounds.x1,.77,bounds.z1)):box(o);
   const color=name.includes('stool')?'#c7a99c':name.includes('drawer')?'none':name.includes('door')?'#b8a68c':name.includes('wardrobe')?'#b9c6b0':'#d7cfbe';
   add('rect',{x:b.min.x,y:b.min.z,width:b.max.x-b.min.x,height:b.max.z-b.min.z,fill:color,stroke:'#6d7766','stroke-width':.012});
   if(label)add('text',{x:(b.min.x+b.max.x)/2,y:(b.min.z+b.max.z)/2,'text-anchor':'middle','font-size':.10,fill:'#373731'},label);
  }
  const occupant=candidate?dressingOccupant(candidate.spec,use):null;
  if(occupant){add('rect',{x:occupant.x0,y:occupant.z0,width:occupant.x1-occupant.x0,height:occupant.z1-occupant.z0,fill:'#dca89c77',stroke:'#b96e5a','stroke-width':.015,'stroke-dasharray':'.04 .025'});}
  if(candidate){const s=candidate.spec,x=Math.max(s.foot.x0,bb.min.x)+.30,gap=s.foot.z0-bb.max.z;add('line',{x1:x,y1:bb.max.z,x2:x,y2:s.foot.z0,stroke:'#5c6255','stroke-width':.012});add('text',{x:x+.08,y:bb.max.z+gap/2,'font-size':.105,fill:'#373731'},`${Math.round(gap*1000)} mm 床尾截面`);}
  document.querySelector('#dressingPlanNote').textContent=metrics.textContent+'\n粉色：600×650 mm 假设使用占位；外拉抽屉假设后退 320 mm，翻盖不增加此前后位移，不是人体实测。平面取同一候选网格与墙线，凳子/抽屉/翻盖与三维同步，床身和床头柜分开绘制。各截面不是全屋最小净宽。图上不是已确认北向。';
  document.querySelector('#dressingPlanDialog').showModal();
 };
 return {choose,setVisible:value=>panel.hidden=!value,get status(){return {key,use,doorsOpen,spec:candidate?.spec||null};},get candidate(){return candidate;},get baseline(){return baseline;}};
}
