import * as T from './vendor/three.module.js';
import {livingRevision as spec} from './design-spec.js?v=fridge-layout-2';
import {auditSeatEgress} from './seat-egress.js';
import {P,rooms} from './plan.js';

// Actual chairs and diagram share the same transforms; use rectangles are not furniture.
export function wireSeatUse(model,dialog,svg,onChange){
 const entries=[];
 for(const side of ['left','right'])for(const [i,object] of model.getObjectByName('lake-bar-'+side).children.filter(o=>o.name.startsWith('upholstered-counter-stool')).entries())entries.push({object,label:(side==='left'?'左翼':'右翼')+(i+1)+'席',axis:'z'});
 for(let i=0;i<2;i++)entries.push({object:model.getObjectByName('dining-daily-seat-'+i),label:'餐岛'+(i+1)+'席',axis:'x'});
 model.updateMatrixWorld(true);
 entries.forEach(e=>e.origin=e.object.getWorldPosition(new T.Vector3()));
 const ns='http://www.w3.org/2000/svg',layer=document.createElementNS(ns,'g');layer.dataset.seatUse='true';svg.append(layer);
 const controls=document.createElement('div');controls.id='livingSeatUse';controls.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin:10px 0';svg.after(controls);
 const note=document.createElement('p');note.id='seatUseNote';note.setAttribute('aria-live','polite');controls.after(note);
 const buttons=new Map();let mode='stored',active=-1,egress=null;
 const set=(next,index=0)=>{
  if(!['stored','working','stand','pulled'].includes(next))throw Error('未知座位状态');
  mode=next;active=mode==='stand'?((index%6)+6)%6:-1;layer.replaceChildren();
  for(const [i,e] of entries.entries()){
   const swivel=!!e.object.userData.swivelSeat;
   const travel=mode==='stored'?0:mode==='pulled'?spec.seatPull:swivel?0:i===active?spec.seatPull:spec.seatWorkingPull;
   if(swivel)window.barSeatsDebug.set(e.object,mode==='stand'&&i===active?Math.PI/2:0);
   const position=e.origin.clone();position[e.axis]+=travel;e.object.position.copy(e.object.parent.worldToLocal(position));e.object.updateMatrixWorld(true);
   const b=new T.Box3().setFromObject(e.object),center=b.getCenter(new T.Vector3());
   const rect=(x,z,w,d,fill,stroke,dash)=>{const r=document.createElementNS(ns,'rect');for(const [k,v] of Object.entries({x,y:z,width:w,height:d,fill,stroke,'stroke-width':.012,rx:.025}))r.setAttribute(k,v);if(dash)r.setAttribute('stroke-dasharray','.05 .025');layer.append(r);};
   rect(b.min.x,b.min.z,b.max.x-b.min.x,b.max.z-b.min.z,'#d4cbb9','#8c9184');
   if(mode!=='stored'){const w=e.axis==='x'?.65:.60,d=e.axis==='x'?.60:.65;rect(center.x-w/2,center.z-d/2,w,d,i===active?'#b9915b35':'#58736520',i===active?'#926b39':'#587365',true);}
  }
  buttons.forEach((b,key)=>b.setAttribute('aria-pressed',String(key===mode)));
  note.textContent=mode==='stored'?'四把吧椅采用低靠背回位旋转座面，椅脚留在原位；岛台两席朝厨房，膝部凹入38cm。':mode==='working'?'六席就座：吧椅原位，岛台椅拉出5cm；虚线为60×65cm使用占位。岛台与沙发间供坐席使用，不作为椅后通道。':mode==='stand'?entries[active].label+(active<4?'座面旋转90°，椅脚不后拖':'拉出45cm')+'，其余五席保持就座。':'压力检查：人为把六椅都后拖45cm，不是旋转吧椅的日常用法；原受限状态保留，不宣称全部可通行。';
  egress=null;if(mode==='stand'){
   egress=checkEgress(active);
   const add=(tag,attrs)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);layer.append(e);return e;};
   if(egress.reached){
    add('polyline',{points:egress.path.map(p=>p.join(',')).join(' '),fill:'none',stroke:'#587365','stroke-width':.035,'stroke-dasharray':'.07 .045'});
    add('circle',{cx:egress.standing.point[0],cy:egress.standing.point[1],r:.30,fill:'#58736525',stroke:'#587365','stroke-width':.02});
    note.textContent+=' 绿圈为保留椅子后的600mm站位，虚线路径连回入户通道。';
   }else note.textContent+=' 当前椅侧/后未找到连通的600mm站位，不把该状态标为通过。';
   note.textContent+=' 仅2D站位和路径检查；坐到站动作、旋转阻尼、防夹与承重仍需实物体验。';
  }
  onChange();
 };
 function checkEgress(index){
  model.updateMatrixWorld(true);
  const rect=(object,name=object.name)=>{const b=new T.Box3().setFromObject(object);return {name,x1:b.min.x,x2:b.max.x,z1:b.min.z,z2:b.max.z};};
  const names=['retained-balcony-column','bar-service-cover','linen-sofa','stone-island','slim-coffee-table','balcony-laundry-cabinet','balcony-wet-hamper','balcony-care-cabinet','tv-low-console','tv-console-lake-extension','flush-sideboard','integrated-fridge'];
  const obstacles=names.map(n=>rect(model.getObjectByName(n)));
  for(const side of ['left','right']){const bar=model.getObjectByName('lake-bar-'+side);obstacles.push(rect(bar.children[0],'lake-bar-'+side));}
  const points=rooms.filter(r=>r.id==='living'||r.id==='dining').flatMap(r=>r.poly.map(P)),xs=points.map(p=>p[0]),zs=points.map(p=>p[1]);
  return auditSeatEgress({obstacles,seats:entries.map(e=>({...rect(e.object),axis:e.axis})),active:index,bounds:{x1:Math.min(...xs),x2:Math.max(...xs),z1:Math.min(...zs),z2:Math.max(...zs)},entry:[8.32,5.85]});
 }
 for(const [key,label] of [['stored','收椅'],['working','六席就座'],['stand','逐席起身'],['pulled','全部拉出']]){const b=document.createElement('button');b.type='button';b.dataset.seatMode=key;b.textContent=label;b.style.minHeight='44px';b.onclick=()=>set(key,key==='stand'&&mode==='stand'?active+1:0);buttons.set(key,b);controls.append(b);}
 const view=document.createElement('button');view.type='button';view.textContent='查看当前3D';view.id='seatUseView3d';view.onclick=()=>{dialog.close();onChange({focusSeats:true,seatIndex:active});};controls.append(view);
 set('stored');
 return {set,checkEgress,get state(){return {mode,active,egress,entries:entries.map(e=>({name:e.object.name,label:e.label,axis:e.axis,swivel:!!e.object.userData.swivelSeat,angle:e.object.getObjectByName(e.object.name+'-rotating-seat')?.rotation.y||0,position:e.object.getWorldPosition(new T.Vector3()).toArray()}))};}};
}
