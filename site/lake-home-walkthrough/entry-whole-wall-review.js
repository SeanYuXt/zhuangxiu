import {P,walls} from './plan.js';
import {familyDisplaySpec} from './family-display-spec.js';
import {wholeWallAudit} from './entry-whole-wall-audit.js';
const $=id=>document.getElementById(id),frame=$('model'),ns='http://www.w3.org/2000/svg';let mode='three',snap;
const el=(svg,tag,attrs,t)=>{const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(t!==undefined)n.textContent=t;svg.append(n);return n;};
const text=(svg,x,y,t,size=.13)=>el(svg,'text',{x,y,'font-size':size,'text-anchor':'middle',fill:'#454a3e'},t);
const rect=(svg,b,fill,stroke='#9b9f91',dash)=>el(svg,'rect',{x:b.x1,y:b.z1,width:b.x2-b.x1,height:b.z2-b.z1,fill,stroke,'stroke-width':.013,rx:.005,...(dash?{'stroke-dasharray':dash}:{})});
const dist=(a,b)=>Math.hypot(Math.max(a.x1-b.x2,b.x1-a.x2,0),Math.max(a.z1-b.z2,b.z1-a.z2,0));
function dim(svg,x1,y1,x2,y2,t){el(svg,'line',{x1,y1,x2,y2,stroke:'#6e7e63','stroke-width':.013});for(const[x,y]of[[x1,y1],[x2,y2]])el(svg,'line',{x1:x-.03,y1:y-.03,x2:x+.03,y2:y+.03,stroke:'#6e7e63','stroke-width':.013});text(svg,(x1+x2)/2,(y1+y2)/2-.065,t,.12);}
function structure(svg){for(const w of walls){if(w.glass)continue;const a=P(w.a),b=P(w.b),len=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/len,(b[1]-a[1])/len];let end=0;for(const o of [...(w.open||[]).map(o=>({at:o.at/100,w:o.w/100})),{at:len,w:0}].sort((a,b)=>a.at-b.at)){if(o.at>end)el(svg,'line',{x1:a[0]+u[0]*end,y1:a[1]+u[1]*end,x2:a[0]+u[0]*o.at,y2:a[1]+u[1]*o.at,stroke:'#969a8c','stroke-width':(w.t||20)/100});end=o.at+o.w;}}}
function plan(){const svg=$('plan'),s=snap;svg.replaceChildren();svg.setAttribute('viewBox','2.65 1.65 11.70 6.50');rect(svg,{x1:2.8,z1:1.8,x2:14.0,z2:7.17},'#f5f2e9','none');structure(svg);
 const labels={'integrated-fridge':'冰箱','flush-entry-cabinet':'一体收纳','entry-daily-drop':'随手台','entry-left-welcome':'低台','whole-wall-controls':'控制','whole-wall-drinks':'茶水·酒水','whole-wall-shallow-storage':'浅收纳','linen-sofa':'沙发','bath1-vanity':'固定洗漱台'};
 for(const b of s.fixed){if(b.name==='family-display-wall')continue;rect(svg,b,b.name==='whole-wall-drinks'?'#bfcbb0':b.name==='integrated-fridge'?'#b6c1b5':'#ddd5c4');if(labels[b.name])text(svg,(b.x1+b.x2)/2,(b.z1+b.z2)/2+.035,labels[b.name],b.name==='whole-wall-controls'?.105:.14);}
 for(const c of s.chairs)rect(svg,c,'#c9c3b7');rect(svg,s.table,'#e4dbc9');text(svg,(s.table.x1+s.table.x2)/2,(s.table.z1+s.table.z2)/2,'160×85',.14);for(const l of s.leaves)rect(svg,l,'#a9b8ac');
 for(const b of Object.values(s.fixedAfter))if(b.name!=='bath1-vanity')rect(svg,b,'#b7a185');
 const f=familyDisplaySpec;rect(svg,{x1:f.service.startX,x2:f.service.startX+f.service.width,z1:f.corner[1]-.05,z2:f.corner[1]},'#d7d5bf');text(svg,f.service.startX+f.service.width/2,7.42,'电箱检修',.11);
 rect(svg,{x1:f.beam.nearX,x2:f.beam.nearX+f.beam.width,z1:f.beam.startZ,z2:f.beam.endZ},'none','#877a66','.06 .025');text(svg,13.47,6.88,'梁后留空',.13);
 text(svg,6.88,7.66,'外开入户门',.14);text(svg,4.78,3.66,'厨房',.21);text(svg,10.68,5.6,'客厅',.21);text(svg,9.05,1.89,'↑ 阳台方向',.13);dim(svg,5.92,2.16,12.04,2.16,'约6m横厅');
 dim(svg,s.table.x2,s.table.z2,s.counter.x1,s.counter.z1,dist(s.table,s.counter).toFixed(2)+'m');
 dim(svg,s.spec.shoes.start,7.43,s.spec.drop.start,7.43,'用品53＋外套40＋鞋80');
 dim(svg,s.spec.drop.start,7.43,s.spec.drop.start+s.spec.drop.width,7.43,'挂包·鞋盘60');
 dim(svg,6.24,s.spec.wallZ-s.spec.drop.depth,6.24,s.spec.wallZ,'深60');
 text(svg,5.85,6.28,'挂包·换鞋',.12);
 const vanity=s.fixed.find(b=>b.name==='bath1-vanity');
 dim(svg,vanity.x2,7.72,s.spec.shoes.start,7.72,'净空'+(Math.round((s.spec.shoes.start-vanity.x2)*1000)/10)+'cm');
 const end=s.spec.drinks.start+s.spec.drinks.width+(s.spec.drinks.frameEndPanel||0),tv=s.spec.tvBoundaryX;
 el(svg,'line',{x1:tv,y1:5.62,x2:tv,y2:7.66,stroke:'#957856','stroke-width':.018,'stroke-dasharray':'.06 .04'});
 text(svg,tv,5.48,'电视墙投影',.13);
 dim(svg,end,7.66,tv,7.66,'余'+(tv-end).toFixed(2)+'m');
 if(!s.state.fridge&&!s.state.storage&&!s.state.shoes&&!s.state.service){
  const route=wholeWallAudit(s,{origin:[5.30,3.95]}).routes.find(r=>r.name==='冰箱取物位');
  $('kitchenPath').textContent=route.reached?route.lengthMetres.toFixed(1)+'m':'当前未连通';
  if(route.reached){el(svg,'polyline',{points:route.path.map(p=>p.join(',')).join(' '),fill:'none',stroke:'#6b8158','stroke-width':.035,'stroke-linecap':'round','stroke-linejoin':'round'});for(const p of[route.path[0],route.path.at(-1)])el(svg,'circle',{cx:p[0],cy:p[1],r:.055,fill:'#6b8158'});text(svg,5.05,3.81,'厨房参考点',.115);}
 }else $('kitchenPath').textContent='当前为开门状态';
}
function elevation(){
 const svg=$('elevation'),s=snap.spec,H=2.8;svg.replaceChildren();svg.setAttribute('viewBox',mode==='entry'?'10.60 -.40 3.85 3.85':mode==='door'?'5.35 -.48 8.95 4.1':'2.65 -.45 11.70 3.75');
 const r=(x,y,w,h,color)=>rect(svg,{x1:x,z1:H-y-h,x2:x+w,z2:H-y},color);
 r(2.915,0,.77,2.70,'#bdc9bf');text(svg,3.30,1.5,'固定洗漱台',.12);
 r(6.33,0,1.1,2.20,'#d0c4b0');text(svg,6.88,1.5,'外开入户门',.14);
 for(const b of [...snap.elevation].sort((a,b)=>b.z1-a.z1))r(b.x1,b.y1,b.x2-b.x1,b.y2-b.y1,b.color);
 text(svg,4.065,3.05,'干净用品53',.10);
 text(svg,4.53,3.05,'外套40',.09);
 text(svg,5.13,3.05,'鞋抽＋鞋架80',.10);
 text(svg,5.83,3.05,'挂包·鞋盘60',.10);
 text(svg,5.82,.84,'挂包位 / 小浅抽',.085);
 text(svg,7.93,3.05,'浅悬浮台60',.09);
 text(svg,8.75,3.05,'冰箱意向位100',.12);
 text(svg,10.27,3.05,'餐边柜200',.12);
 text(svg,10.4,1.5,'连续石材台面 · 中间无竖隔板',.10);
 text(svg,10.5,1.13,'浅木搁板 · 深22cm',.10);
 const end=s.drinks.start+s.drinks.width+s.drinks.frameEndPanel,tv=s.tvBoundaryX;
 dim(svg,s.shoes.start,.12,s.drop.start+s.drop.width,.12,'总长233cm / 高柜深60cm');
 dim(svg,s.welcome.start,.12,end,.12,'左侧组合'+Math.round((end-s.welcome.start)*100)+'cm');
 dim(svg,end,2.65,tv,2.65,'余'+Math.round((tv-end)*100)+'cm');
 text(svg,12.40,3.05,'电箱检修',.11);
 if(mode==='door'){
  text(svg,9.30,-.22,'门左侧 · 餐边柜与内嵌冰箱',.16);
  text(svg,4.94,-.22,'门右侧 · 放包、换鞋、挂衣',.16);
 }
 const g=document.createElementNS(ns,'g');for(const child of [...svg.children]){if(child.tagName==='text')child.setAttribute('transform',`translate(${2*Number(child.getAttribute('x'))} 0) scale(-1 1)`);g.append(child);}g.setAttribute('transform','translate(17 0) scale(-1 1)');svg.append(g);
}
function cabinetDimensions(){
 const svg=$('elevation'),s=snap.spec,q=s.drinks,sh=snap.drinksOpenShelf,cap=snap.drinksEndPanel;
 svg.replaceChildren();svg.setAttribute('viewBox','0 0 1060 780');svg.dataset.dimensionRevision=s.id;
 const mm=v=>Math.round(v*1000),S=170,baseY=620,maxX=cap.x2,frontX=x=>60+(maxX-x)*S,Y=y=>baseY-y*S,sideX=z=>968-(s.wallZ-z)*S;
 const ink='#65755c',accent='#a56d45';
 const ln=(x1,y1,x2,y2,color=ink,dash)=>el(svg,'line',{x1,y1,x2,y2,stroke:color,'stroke-width':1,...(dash?{'stroke-dasharray':dash}:{})});
 const tx=(x,y,t,size=14,anchor='middle',color='#3f483a',rotation)=>el(svg,'text',{x,y,fill:color,'font-size':size,'text-anchor':anchor,style:'paint-order:stroke;stroke:#f4f1ea;stroke-width:4px;stroke-linejoin:round',...(rotation?{transform:`rotate(${rotation} ${x} ${y})`}:{})},t);
 function hd(x1,x2,y,t,sourceY){
  if(sourceY!==undefined){ln(x1,sourceY,x1,y-5,'#a3aa9b');ln(x2,sourceY,x2,y-5,'#a3aa9b');}
  ln(x1,y,x2,y);for(const x of[x1,x2])ln(x-3,y+4,x+3,y-4);tx((x1+x2)/2,y-9,t);
 }
 function vd(x,y1,y2,t){ln(x,y1,x,y2);for(const y of[y1,y2])ln(x-4,y+3,x+4,y-3);tx(x-8,(y1+y2)/2,t,13,'middle','#3f483a',-90);}
 const rr=(x,y,w,h,color,stroke='#9da193',dash)=>el(svg,'rect',{x,y,width:w,height:h,fill:color,stroke,'stroke-width':.7,...(dash?{'stroke-dasharray':dash}:{})});
 tx(42,39,'餐边柜尺寸与末端收口',23,'start');tx(1015,39,'单位 mm · 模型方案尺寸，待现场复尺',12,'end');
 tx(60,82,'01  正立面｜屋内正视，右端靠入户门',15,'start');
 tx(916,82,'02  操作区侧剖',15);
 ln(750,100,750,731,'#d3cdbf');
 // Both drawings project current meshes. No separate cabinet geometry is drawn.
 const owners=['whole-wall-drinks','integrated-fridge','entry-left-welcome'];
 for(const b of snap.elevation.filter(b=>owners.includes(b.owner)).sort((a,b)=>b.z1-a.z1))rr(frontX(b.x2),Y(b.y2),(b.x2-b.x1)*S,(b.y2-b.y1)*S,b.color);
 ln(47,baseY,708,baseY,'#a3aa9b');
 hd(frontX(cap.x2),frontX(s.welcome.start),119,'总长 '+mm(cap.x2-s.welcome.start),Y(q.top)-9);
 for(const [x1,x2,name]of[[q.start,q.start+q.width,'餐边柜 '+mm(q.width)],[s.fridge.bayStart,s.fridge.bayStart+s.fridge.bayWidth,'冰箱位 '+mm(s.fridge.bayWidth)],[s.welcome.start,s.welcome.start+s.welcome.width,'随手台 '+mm(s.welcome.width)]])hd(frontX(x2),frontX(x1),173,name,Y(q.top)-5);
 vd(28,Y(q.top),Y(0),'总高 '+mm(q.top));
 hd(frontX(sh.x2),frontX(sh.x1),Y(sh.y1)+33,'搁板长 '+sh.widthMm,Y(sh.y1)+3);
 tx(frontX(s.fridge.position[0]),Y(.95),'机身宽900 × 深600',12);
 tx(frontX(s.fridge.position[0]),Y(.80),'安装净空待选型',11);
 rr(frontX(cap.x2),Y(cap.y2),(cap.x2-cap.x1)*S,(cap.y2-cap.y1)*S,'none',accent);
 const capCentre=frontX((cap.x1+cap.x2)/2);
 ln(capCentre,Y(1.2),capCentre,653,accent);ln(capCentre,653,105,653,accent);tx(114,658,'18厚同色通高封板',14,'start',accent);
 tx(frontX((q.start+q.start+q.width)/2),697,'连续台面 '+mm(snap.counter.x2-snap.counter.x1)+' × '+mm(snap.counter.z2-snap.counter.z1)+' · 台高 '+mm(snap.counter.y2),14);
 tx(frontX((q.start+q.start+q.width)/2),723,'封板外沿至电视墙投影余 '+mm(s.tvBoundaryX-cap.x2),12);
 tx(frontX(s.welcome.start+s.welcome.width/2),654,'靠入户门',12);
 // Dashed silhouette is the real end panel, with a cut through the working bay.
 rr(sideX(cap.z1),Y(cap.y2),(cap.z2-cap.z1)*S,(cap.y2-cap.y1)*S,'#eee9df','#a56d45','5 4');
 const cut=q.start+q.width-.20;
 for(const b of snap.elevation.filter(b=>b.owner==='whole-wall-drinks'&&b.name!=='drink-unified-end-return'&&b.x1<=cut&&b.x2>=cut).sort((a,b)=>a.x1-b.x1))rr(sideX(b.z1),Y(b.y2),(b.z2-b.z1)*S,(b.y2-b.y1)*S,b.color);
 ln(782,baseY,1033,baseY,'#a3aa9b');ln(968,Y(q.top)-3,968,baseY,'#a3aa9b');
 hd(sideX(cap.z1),sideX(cap.z2),153,'最深 '+mm(cap.z2-cap.z1),Y(q.top)-5);
 tx(918,196,'虚线：通高封板外沿',11);
 vd(810,Y(sh.y1),Y(snap.counter.y2),'下净高 '+sh.clearBelowMm);
 vd(810,Y(q.upperBottom),Y(sh.y2),'上净高 '+sh.clearAboveMm);
 vd(1020,Y(snap.counter.y2),Y(0),'台高 '+mm(snap.counter.y2));
 hd(sideX(sh.z1),sideX(sh.z2),Y(sh.y2)-22,'深 '+mm(sh.z2-sh.z1),Y(sh.y2)-1);
 const inset=mm(snap.counter.z1-cap.z1);
 ln(sideX(cap.z1),Y(snap.counter.y2)-8,sideX(snap.counter.z1),Y(snap.counter.y2)-8,accent);
 ln(sideX(snap.counter.z1),Y(snap.counter.y2)-8,930,Y(snap.counter.y2)-35,accent);
 tx(978,Y(snap.counter.y2)-39,'内退 '+inset,12,'middle',accent);
 hd(sideX(snap.counter.z1),sideX(snap.counter.z2),675,'台面深 '+mm(snap.counter.z2-snap.counter.z1),baseY+8);
 tx(913,713,'地柜 '+mm(q.depth)+' / 吊柜 '+mm(q.upperDepth),13);
 tx(913,734,'搁板厚 '+mm(sh.y2-sh.y1)+' · 端部留缝 '+mm(cap.x1-sh.x2),12);
 tx(48,764,'沿墙：600随手台 + 20缝 + 1000冰箱位 + 20缝 + 2000餐边柜 + 18封板 = '+mm(cap.x2-s.welcome.start),13,'start');
}
function sideElevation(){
 const svg=$('elevation'),s=snap.spec,H=s.drop.top;svg.replaceChildren();svg.setAttribute('viewBox','-.42 -.32 1.48 3.06');
 // Project the same meshes from the entrance (+X), so the side is readable.
 for(const b of snap.elevation.filter(b=>b.owner==='entry-daily-drop').sort((a,b)=>a.x1-b.x1)){
  rect(svg,{x1:s.wallZ-b.z2,x2:s.wallZ-b.z1,z1:H-b.y2,z2:H-b.y1},b.color);
 }
 dim(svg,0,-.10,s.drop.depth,-.10,'柜体深60cm');
 text(svg,s.drop.depth/2,.39,'暖灰褐色整背板',.073);
 text(svg,s.drop.depth/2,2.64,'正面台宽120cm · 下方留空',.073);
}
function update(){
 const w=frame.contentWindow.wholeWall;if(!w)return;snap=w.snapshot();
 $('waterDistance').textContent=dist(snap.table,snap.counter).toFixed(2)+'m';
 $('coldDistance').textContent=dist(snap.table,snap.fridge).toFixed(2)+'m';
 const tap=snap.elevation.find(o=>o.name==='pipeline-machine-spout');
 $('tapDistance').textContent=tap?dist(snap.table,tap).toFixed(2)+'m':'—';
 const end=snap.chairs.find(c=>c.name.endsWith('-5'));
 const occupantX=end?(end.x1+end.x2)/2:0,occupantBack=end?(end.z1+end.z2)/2+.325:0;
 const nearCabinets=snap.fixed.filter(b=>['integrated-fridge','whole-wall-drinks'].includes(b.name)&&b.x1<occupantX+.30&&b.x2>occupantX-.30);
 $('sixClear').textContent=snap.state.fridge?'先关闭冰箱门':end&&nearCabinets.length?Math.round((Math.min(...nearCabinets.map(b=>b.z1))-occupantBack)*1000)+'mm':end?'正后方无柜体 · 看平面':'切换六席查看';
 const vanity=snap.fixed.find(b=>b.name==='bath1-vanity');$('washGap').textContent=Math.round((snap.spec.shoes.start-vanity.x2)*1000)+'mm';
 $('sideWidth').textContent=snap.dropDimensions.sideOuterWidthMm+'mm';$('pocketDepth').textContent=snap.dropDimensions.alongWallMm+'mm';
 $('sideNet').textContent=snap.dropDimensions.nicheClearWidthMm+' × '+snap.dropDimensions.nicheClearDepthMm+'mm';
 $('shoesOpen').setAttribute('aria-pressed',String(snap.state.shoes));
 $('four').setAttribute('aria-pressed',String(!snap.state.guests));$('six').setAttribute('aria-pressed',String(snap.state.guests));
 $('seatNote').textContent=snap.state.guests?'临时6人：桌椅整体向阳台移15cm。右侧数值仅为近柜端占位余宽，不代表六人坐起、错身都舒适。':'日常4人：160×85cm普通餐桌与沙发位置沿用现模型。';
 plan();if(mode==='dimensions')cabinetDimensions();else if(mode==='side')sideElevation();else elevation();let audit=null;$('route').replaceChildren();
 if(!snap.state.fridge&&!snap.state.storage&&!snap.state.shoes&&!snap.state.service){
  audit=wholeWallAudit(snap);
  for(const r of audit.routes){const n=document.createElement('p');n.className=r.reached?'ok':'bad';n.textContent=(r.reached?'○ ':'△ ')+r.name+'：'+(r.reached?'600mm通行占位可到达':'当前通行占位未连通');$('route').append(n);}
 }else $('route').textContent='当前为开门取物状态；闭柜通行结果不代表开门时也能通过。';
 window.wholeWallReview={snapshot:snap,audit,update};
}

function setMode(m){
 mode=m;frame.hidden=m!=='three';$('plan').toggleAttribute('hidden',m!=='plan');
 $('elevation').toggleAttribute('hidden',!['elevation','entry','side','door','dimensions'].includes(m));
 $('elevation').setAttribute('viewBox',m==='entry'?'10.55 -.45 3.85 3.85':'2.65 -.45 11.70 3.75');
 if(snap&&['entry','elevation','door'].includes(m))elevation();if(snap&&m==='side')sideElevation();if(snap&&m==='dimensions')cabinetDimensions();
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===m)));
 $('viewTitle').textContent={dimensions:'餐边柜尺寸与末端收口 · 正立面与操作区侧剖',three:'门边挂包与双层鞋盘 · 鞋衣和洗漱用品分柜收纳',plan:'俯视位置关系 · 上方朝阳台',entry:'门右侧正立面 · 挂包鞋盘、鞋柜、外套与用品柜',side:'侧投影看深度 · 门边鞋盘向前抽拉',door:'屋内面对入户门 · 右边生活收纳，左边餐饮',elevation:'从室内面向入户墙 · 门两侧展开'}[m];
 if(m==='three')frame.contentWindow.dispatchEvent(new Event('resize'));
}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{frame.contentWindow.wallView?.(b.dataset.view);setMode('three');$('viewTitle').textContent=b.textContent;});
const act=fn=>{const w=frame.contentWindow.wholeWall;if(w){fn(w);update();frame.contentWindow.columnViewDebug.invalidate();}};
$('four').onclick=()=>act(w=>w.setGuests(false));$('six').onclick=()=>act(w=>w.setGuests(true));
$('fridgeOpen').onclick=e=>act(w=>{const f=frame.contentWindow.fridgeDetailsDebug;f.setDoors(f.state.doors?0:1);e.currentTarget.setAttribute('aria-pressed',String(f.state.doors));});
$('storageOpen').onclick=e=>act(w=>{const next=!w.snapshot().state.storage;w.setStorage(next);e.currentTarget.setAttribute('aria-pressed',String(next));});$('shoesOpen').onclick=e=>act(w=>{const next=!w.entry.state.opened;w.entry.setOpen(next);e.currentTarget.setAttribute('aria-pressed',String(next));});
$('serviceOpen').onclick=e=>act(w=>{const next=!w.snapshot().state.service;w.setService(next);e.currentTarget.setAttribute('aria-pressed',String(next));});
window.addEventListener('message',e=>{if(e.source!==frame.contentWindow||e.origin!==location.origin)return;if(e.data.type==='whole-wall-ready'){$('loading').hidden=true;update();const query=new URLSearchParams(location.search),initial=query.get('view');if(['plan','elevation','entry','side','door','dimensions'].includes(initial))setMode(initial);const focus=query.get('focus');if(focus&&Object.hasOwn(frame.contentWindow.wholeWall.spec.views,focus))document.querySelector('[data-view="'+focus+'"]').click();}if(e.data.type==='dining-study-error')$('loading').textContent='载入失败：'+e.data.message;});

// Routine views open only the relevant compartment, leaving other fronts closed.
for(const id of ['arrive','leave','coat'])$(id).onclick=()=>act(w=>{
 w.entry.setOpen(false);w.setStorage(false);frame.contentWindow.fridgeDetailsDebug.reset();
 if(id==='leave')w.dropDrawers.filter(d=>d.name.includes('daily-drawer-0')).forEach(d=>d.position.z=-.10);
 if(id==='arrive')w.shoeTrays.forEach(d=>d.position.z=-.25);
 if(id==='coat')w.shoeDoors.find(d=>d.name==='entry-coat-door').rotation.y=Math.PI/2;
 frame.contentWindow.wallView(id==='coat'?'shoes':'drop');setMode('three');
 $('routine').textContent={arrive:'回家：挂包 → 钥匙进小浅抽 → 拉出两层鞋盘换鞋 → 收回鞋盘 → 外套进独立柜。',leave:'出门：取外套 → 换鞋 → 取下挂包 → 小浅抽拿钥匙/门卡 → 控制面板一键离家（线路待确认）。',coat:'40cm外套柜：中段独立挂衣，底部两抽放干净用品，上格放低频备品。挂衣高度与使用者身高需复核。'}[id];
});

$('shoeDetail').onclick=()=>act(w=>{w.entry.setOpen(false);w.closedShoeDrawers[2].position.z=-.30;w.shoeDoors.find(d=>d.name==='shoe-door-main-1').rotation.y=Math.PI/2;frame.contentWindow.wallView('shoes');setMode('three');$('routine').textContent='80cm鞋柜：下三层鞋抽，上部可调鞋架，24双仅为当前模型示意；鞋码、靴高会影响数量。';});
$('bathDetail').onclick=()=>act(w=>{w.entry.setOpen(false);w.shoeDoors.find(d=>d.name==='entry-bath-daily-door').rotation.y=Math.PI/2;w.entryDrawers.find(d=>d.name==='entry-elder-drawer-2').position.z=-.30;frame.contentWindow.wallView('bath');setMode('three');$('routine').textContent='靠次卫53cm独立用品柜：下三抽放毛巾与老人日用，上部收纸巾、洗漱补充装；和鞋柜分腔。';});
