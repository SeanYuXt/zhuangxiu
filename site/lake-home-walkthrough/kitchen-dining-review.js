import {diningStudyAudit} from './dining-study-audit.js';
const $=id=>document.getElementById(id),frame=$('model'),ns='http://www.w3.org/2000/svg';let view='three',snapshot,audit,pull=-1;
const names={'kitchen-cooking-cabinets':'原操作台','kitchen-sink-cabinets':'原水槽台','integrated-fridge':'冰箱90×60','linen-sofa':'沙发','flush-sideboard':'原餐边柜390×40','flush-entry-cabinet':'封闭鞋柜＋20cm竖格','entry-low-cabinet':'落物柜','lake-bar-left':'阳台长桌','lake-bar-right':'阳台长桌','bar-service-cover':'原柱','slim-coffee-table':'茶几'};
function el(svg,tag,attrs,text){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;svg.append(n);return n;}
const text=(svg,x,y,str,size=.13,color='#373731')=>el(svg,'text',{x,y,'font-size':size,fill:color,'text-anchor':'middle'},str);
function rect(svg,b,fill,stroke='#9d9f90'){return el(svg,'rect',{x:b.x1,y:b.z1,width:b.x2-b.x1,height:b.z2-b.z1,fill,stroke,'stroke-width':.012,rx:.008});}
function dim(svg,x1,y1,x2,y2,label){el(svg,'line',{x1,y1,x2,y2,stroke:'#647c66','stroke-width':.013});for(const [x,y] of [[x1,y1],[x2,y2]])el(svg,'line',{x1:x-.045,y1:y-.045,x2:x+.045,y2:y+.045,stroke:'#647c66','stroke-width':.012});text(svg,(x1+x2)/2,(y1+y2)/2-.08,label,.125,'#456049');}
function drawPlan(){
 const svg=$('plan'),s=snapshot,a=audit;svg.replaceChildren();svg.setAttribute('viewBox','2.80 1.45 9.55 6.15');
 rect(svg,{x1:3.7,x2:5.72,z1:1.9,z2:5.3},'#eee8db','none');rect(svg,{x1:5.92,x2:12.04,z1:1.45,z2:7.17},'#f8f5ee','none');
 a.structure.forEach(b=>rect(svg,b,'#96998d','none'));
 for(const b of s.fixed){rect(svg,b,b.name.includes('stool')?'#c9bea5':b.name==='integrated-fridge'?'#aab6ae':b.name==='linen-sofa'?'#d4cec0':'#dfd5c0');if(names[b.name])text(svg,(b.x1+b.x2)/2,(b.z1+b.z2)/2,names[b.name],.12);}
 rect(svg,s.cooker,'#b5bfa9');text(svg,4.06,4.62,'饭煲',.105);
 for(const b of a.people)el(svg,'rect',{x:b.x1,y:b.z1,width:b.x2-b.x1,height:b.z2-b.z1,fill:'#68826616',stroke:'#688266','stroke-width':.012,'stroke-dasharray':'.045 .025',rx:.04});
 rect(svg,s.table,'#d9d3c8');text(svg,(s.table.x1+s.table.x2)/2,(s.table.z1+s.table.z2)/2,'160 × 85cm',.14);
 s.chairs.forEach((b,i)=>{rect(svg,b,'#c9c4ba');text(svg,(b.x1+b.x2)/2,(b.z1+b.z2)/2+.045,String(i+1),.13);});
 s.leaves.forEach(b=>rect(svg,b,'#798a7d'));
 const route=a.routes[0];if(route.reached)el(svg,'polyline',{points:route.path.map(p=>p.join(',')).join(' '),fill:'none',stroke:'#537857','stroke-width':.045,'stroke-linejoin':'round'});
 el(svg,'circle',{cx:a.origin[0],cy:a.origin[1],r:.30,fill:'#65896912',stroke:'#537857','stroke-width':.015});text(svg,a.origin[0],a.origin[1]+.46,'从这里进入厨房',.13,'#456049');
 dim(svg,a.kitchenWallFront,4.95,a.people[1].x1,4.95,a.metrics.westOccupiedClearMm+'mm');
 dim(svg,s.door.x-.35,s.door.z0,s.door.x-.35,s.door.z1,'洞口1640');
 text(svg,7.4,1.57,'↑ 阳台 / 湖景方向（非北向）',.12);
 text(svg,6.88,7.44,'入户门 ↑',.14);text(svg,10.3,7.45,'3.9m餐边柜完整保留 → 卧室走廊',.12);
 const sb=s.sideboardCounter;dim(svg,s.table.x2,s.table.z2,sb.x1,sb.z1,(a.metrics.tableToSideboardNearestMm/1000).toFixed(2)+'m 柜边');
 const cutlery=s.serviceItems.find(o=>o.name==='sideboard-drawer-contents-0');text(svg,(cutlery.x1+cutlery.x2)/2,6.57,'近端餐具抽屉',.11);
 text(svg,3.15,5.35,'次卧门',.13);dim(svg,5.63,5.50,5.63,s.fixed.find(b=>b.name==='integrated-fridge').z1,a.metrics.fridgeFrontClearMm+'mm');
}
function drawEntryElevation(){
 const svg=$('elevation'),s=snapshot;svg.replaceChildren();svg.setAttribute('viewBox','-.3 -.52 4.2 3.82');
 const wall=s.wall,h=wall.top,total=wall.end-wall.start,fw=wall.fridgeBay;
 svg.setAttribute('viewBox','-.55 -.42 3.5 3.62');
 const b=(left,bottom,width,height,fill)=>rect(svg,{x1:left,x2:left+width,z1:h-bottom-height,z2:h-bottom},fill);
 b(0,0,fw,h,'#ddd7cc');b(.02,2.045,.96,h-2.045,'#d6d1c7');
 b(.05,.08,wall.fridge.width,1.92,'#9ba29b');
 for(const y of [.835])el(svg,'line',{x1:.05,y1:h-y,x2:.95,y2:h-y,stroke:'#e9e5dc','stroke-width':.012});
 el(svg,'line',{x1:.5,y1:h-.08,x2:.5,y2:h-1.983,stroke:'#e9e5dc','stroke-width':.012});
 for(const x of [1.03,1.78]){b(x,.18,.55,h-.18,'#d6d1c7');el(svg,'line',{x1:x,y1:h-2.10,x2:x+.55,y2:h-2.10,stroke:'#a8a296','stroke-width':.012});}
 b(1.58,.18,.20,h-.18,'#c9bba1');for(const y of [.18,.72,1.10,1.65,2.086,2.562])b(1.58,y,.20,.018,'#8e826d');
 b(1.095,.25,.414,1.78,'#c4cdc8');
 dim(svg,0,-.21,fw,-.21,'1000冰箱段');dim(svg,1.03,-.21,total,-.21,'1300鞋柜');
 text(svg,.50,2.83,'← 入户门在这一侧',.12);text(svg,1.68,2.83,'55＋20＋55cm',.12);
 text(svg,1.15,3.09,'面向玄关柜：鞋柜身58cm深，冰箱本体60cm深',.105);
}
function drawElevation(){
 if(view==='entryElevation'){drawEntryElevation();return;}
 const svg=$('elevation'),s=snapshot,h=s.door.height,u=z=>5.40-z;
 svg.replaceChildren();svg.setAttribute('viewBox','-.28 -.42 4.16 3.12');
 const b=(x,y,w,hh,color)=>rect(svg,{x1:x,x2:x+w,z1:h-y-hh,z2:h-y},color);
 b(0,0,3.6,h,'#e1dbcf');b(u(s.door.z1),0,s.door.z1-s.door.z0,h,'#f5f3ed');
 for(const leaf of s.leaves)b(u(leaf.z2),leaf.y1,leaf.z2-leaf.z1,leaf.y2-leaf.y1,'#82908680');
 dim(svg,u(s.door.z1),-.20,u(s.door.z0),-.20,'原洞口 '+Math.round((s.door.z1-s.door.z0)*1000));
 text(svg,.44,1.14,'原墙保留',.13);text(svg,3.06,1.14,'原墙保留',.13);
 text(svg,1.80,2.48,'门侧新增柜体已取消 · 保留三段地轨门',.12);
}
function update(){
 const d=frame.contentWindow.diningStudy;if(!d)return;snapshot=d.snapshot();audit=diningStudyAudit(snapshot);
 $('opening').textContent=audit.metrics.openingMm+' / '+audit.metrics.doorClearMm+' mm';$('west').textContent=audit.metrics.westOccupiedClearMm+' mm';$('east').textContent=audit.metrics.eastOccupiedClearMm+' mm';
 $('fridgeClear').textContent=audit.metrics.fridgeFrontClearMm+' mm';
 $('viewing').textContent=snapshot.viewing.distance.toFixed(2)+' m';
 $('routes').replaceChildren();
 if(!audit.startFree){const n=document.createElement('p');n.textContent='当前示意站位落入开门或家具占位，未计算该状态的通行路线。';$('routes').append(n);}
 else for(const r of audit.routes){const n=document.createElement('div');n.className=r.reached&&!r.detour?'ok':'bad';n.textContent=(r.reached?'● ':'× ')+r.name+'：'+(r.reached?(r.detour?'需绕行客厅':'静态代理连通'):'当前状态不连通');$('routes').append(n);}
 $('nearest').textContent=(audit.metrics.tableToSideboardNearestMm/1000).toFixed(2)+' m';
 const cutlery=audit.serviceDistances.find(o=>o.name==='sideboard-drawer-contents-0');
 $('cutleryDistance').textContent=(cutlery.tableEdgeMm/1000).toFixed(2)+' m';
 $('conflict').textContent='日常餐具已由远端调至近端，杯子放相邻格。柜体、台面和管线机位置不变；取物仍需起身。';
 $('four').setAttribute('aria-pressed',String(!snapshot.state.guests));$('six').setAttribute('aria-pressed',String(snapshot.state.guests));$('door').setAttribute('aria-pressed',String(snapshot.state.doorOpen));$('door').textContent=snapshot.state.doorOpen?'关上三扇门':'三扇叠到一侧';$('pull').setAttribute('aria-pressed',String(snapshot.state.pulled>=0));
 $('seatNote').textContent=snapshot.state.pulled>=0?'第'+(snapshot.state.pulled+1)+'把椅子后拉30cm：这一动作会临时占用通道。':snapshot.state.guests?'临时添两把端椅，共6席。小桌更紧凑，端椅不用时另收纳；不以全部椅子拉出后的状态保证通行。':'四把48cm宽燕麦灰软包椅，座高46cm；日常餐位留在长边。';
 drawPlan();drawElevation();window.diningReview={snapshot,audit,update};
}
function setMode(next){view=next;frame.toggleAttribute('hidden',view!=='three');$('plan').toggleAttribute('hidden',view!=='plan');$('elevation').toggleAttribute('hidden',!['elevation','entryElevation'].includes(view));document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===view)));$('viewTitle').textContent={three:'厨房门侧柜已取消 · 普通餐桌复位',plan:'同一模型的平面占位',elevation:'厨房原墙与原门洞 · 两侧不加柜',entryElevation:'面向玄关柜：1m冰箱段＋1.3m鞋柜'}[view];if(snapshot)drawElevation();}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{frame.contentWindow.studyView?.(b.dataset.view);setMode('three');});
function act(fn){const d=frame.contentWindow.diningStudy;if(d){fn(d);update();}}
$('four').onclick=()=>act(d=>{d.setPulled(-1);pull=-1;d.setGuests(false);});$('six').onclick=()=>act(d=>{d.setPulled(-1);pull=-1;d.setGuests(true);});$('door').onclick=()=>act(d=>d.setDoor(!d.state.doorOpen));$('pull').onclick=()=>act(d=>{pull++;if(pull>=(d.state.guests?6:4))pull=-1;d.setPulled(pull);});
$('cooker').onclick=()=>act(d=>{d.setCooker(!d.state.cookerOpen);frame.contentWindow.studyView('rice');setMode('three');$('cooker').textContent=d.state.cookerOpen?'电饭煲关盖':'电饭煲开盖';});
$('fridgeOpen').onclick=()=>act(d=>{const f=frame.contentWindow.fridgeDetailsDebug;f.setDoors(f.state.doors?0:1);frame.contentWindow.studyView('fridge');setMode('three');$('fridgeOpen').textContent=f.state.doors?'关上冰箱门':'冰箱开门125°';});
$('storageOpen').onclick=()=>act(d=>{d.diningWall.setStorage(!d.diningWall.state.storageOpen);frame.contentWindow.studyView('storage');setMode('three');$('storageOpen').textContent=d.diningWall.state.storageOpen?'收起近端柜门抽屉':'查看近端餐具';});
$('shoesOpen').onclick=()=>act(d=>{d.diningWall.setShoes(!d.diningWall.state.shoesOpen);frame.contentWindow.studyView('fridge');setMode('three');$('shoesOpen').textContent=d.diningWall.state.shoesOpen?'关上鞋柜':'鞋柜开门';});
window.addEventListener('message',event=>{if(event.source!==frame.contentWindow||event.origin!==location.origin)return;if(event.data.type==='dining-study-ready'){$('loading').hidden=true;update();}if(event.data.type==='dining-study-error')$('loading').textContent='模型加载失败：'+event.data.message;});
