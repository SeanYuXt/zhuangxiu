// Still views belong to one exported scene. No generated/reconstructed room images.
import {roomViewpoints} from './room-viewpoints.js';
export const renderRooms=[['entry','玄关 · 鞋柜与干区'],['living','客厅 · 电视与沙发'],['dining','餐厅 · 岛台与餐边柜'],['bar','阳台 · 双翼四席'],['kitchen','厨房'],['bed1','老人房'],['bed3','儿童房'],['master','主卧'],['bath1','公卫 · 蹲便与淋浴'],['bath2','主卫'],['laundry','洗烘区'],['care','阳台 · 洗手台与扫地机']];
const manifestURL='./offline-render/full-daylight-v2-detail-renders.json';
const latestManifestURL='./offline-render/accepted-94-renders.json';
// All twelve current images passed same-source, visual and three-viewport checks.
// Historical batches remain explicit alternatives; this is not final construction acceptance.
const defaultFullBatch='latest';
const angleManifestURL='./offline-render/room-angles-v1-detail-renders.json';
const studyManifestURL='./offline-render/curtain-room-v1-detail-renders.json';
const studyViewIds=['master-storage','master-bed'];
const recentManifestURL='./offline-render/wash-prep-hd-detail-renders.json';
const recentViewIds=['ensuite-basin','kitchen-work','master-bedding'];
const oldViews=[{id:'living',label:'旧客厅',file:'mobile-living-hd.png'},{id:'bar',label:'旧双翼吧台',file:'mobile-bar-hd.png'},{id:'balconyGap',label:'旧玻璃与柱之间',file:'mobile-balconyGap-hd.png'},{id:'dining',label:'旧岛台 · 座位已改',file:'mobile-dining-hd.png'},{id:'care',label:'旧清洁区',file:'mobile-care-hd.png'}];
oldViews.push({id:'master',label:'旧主卧柜墙 · 窗帘修改前',file:'master-square-final-master-storage-hd.png'});
const roomAlias={tvSeat:'living',cabinet:'dining',fridge:'kitchen',balconyGap:'bar',columnFront:'bar',glassLeft:'care',glassRight:'laundry',lake:'bar',drying:'bar',services:'living'};

export function wireRenderGallery({state,go,walk,selectRoomView}){
 const dialog=document.createElement('dialog');dialog.id='detailRender';dialog.setAttribute('aria-labelledby','renderTitle');
 dialog.innerHTML=`<form method="dialog"><h2 id="renderTitle">全屋高清校样</h2><button aria-label="关闭高清效果">关闭 ×</button></form>
  <div class="render-picker"><label>房间 <select id="renderRoom" aria-label="高清图房间"></select></label><details id="renderMore"><summary>更多</summary><div class="render-options"><button id="renderRefresh">更新图片</button><button id="renderLatest" aria-pressed="false">新批全屋预览</button><button id="renderOldFull" aria-pressed="false">旧全屋校样</button><button id="renderRecent" aria-pressed="false">洗漱备餐旧校样</button><button id="renderStudy" aria-pressed="false">主卧旧校样</button><button id="renderAngles" aria-pressed="false">分方向取景</button><button id="renderArchive" aria-pressed="false">历史留档</button><p id="renderNote"></p></div></details></div>
  <div id="renderStage" tabindex="0" aria-label="高清图，可放大拖动查看"><div id="renderImageHolder"><img id="renderImage" alt="" draggable="false" hidden></div><p id="renderStatus" role="status"></p></div>
  <div class="render-toolbar"><div class="render-actions"><button id="renderPrevious" aria-label="上一张">←</button><span id="renderLabel" aria-live="polite"></span><button id="renderNext" aria-label="下一张">→</button></div><div class="render-zoom"><button id="renderZoomOut" aria-label="缩小图片">−</button><output id="renderZoomLabel">适应</output><button id="renderZoomIn" aria-label="放大图片">＋</button><button id="renderFit">适应</button></div></div>
  <p id="renderVersion" role="status">渲染校样 · 非实拍</p><div class="render-return"><button id="renderEnter">返回这里的 3D</button><button id="renderWalk">从这里开始漫步</button></div>`;
 document.body.append(dialog);
 const el=id=>dialog.querySelector('#'+id),image=el('renderImage'),stage=el('renderStage'),holder=el('renderImageHolder'),picker=el('renderRoom');
 let index=0,archive=false,angleMode=false,studyMode=false,manifest=null,angleManifest=null,studyManifest=null,refreshSequence=0,loadError='',zoom=1,sequence=0,loaded=false,naturalRatio=16/9,points=new Map(),lastGesture=null;
 let recentStudy=false,recentManifest=null,fullBatch=defaultFullBatch;
 const studyIds=()=>recentStudy?recentViewIds:studyViewIds;
 const currentManifest=()=>studyMode?(recentStudy?recentManifest:studyManifest):angleMode?angleManifest:manifest;
 const views=()=>archive?oldViews:studyMode?studyIds().map(id=>roomViewpoints.find(v=>v.id===id)).map(v=>({id:v.id,room:v.room,label:(renderRooms.find(([id])=>id===v.room)?.[1]||v.room)+' · '+v.name,...currentManifest()?.renders?.find(r=>r.id===v.id)})):angleMode?roomViewpoints.map(v=>({id:v.id,room:v.room,label:(renderRooms.find(([id])=>id===v.room)?.[1]||v.room)+' · '+v.name,...angleManifest?.renders?.find(r=>r.id===v.id)})):renderRooms.map(([id,label])=>({id,label,...manifest?.renders?.find(r=>r.id===id)}));
 function options(){picker.replaceChildren();views().forEach((v,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=v.label+(!v.file?' · 待生成':'');picker.append(o);});picker.value=String(index);}
 function fitSize(){return {width:Math.min(stage.clientWidth,stage.clientHeight*naturalRatio),height:Math.min(stage.clientHeight,stage.clientWidth/naturalRatio)};}
 function resize(){
  if(!loaded)return;const f=fitSize(),w=f.width*zoom,h=f.height*zoom;
  image.style.width=w+'px';image.style.height=h+'px';holder.style.width=Math.max(stage.clientWidth,w)+'px';holder.style.height=Math.max(stage.clientHeight,h)+'px';
  el('renderZoomLabel').textContent=zoom===1?'1×':zoom.toFixed(1)+'×';el('renderZoomOut').disabled=zoom<=1;el('renderZoomIn').disabled=zoom>=4;
 }
 function setZoom(value){
  const previous=zoom,cx=(stage.scrollLeft+stage.clientWidth/2)/Math.max(1,holder.clientWidth),cy=(stage.scrollTop+stage.clientHeight/2)/Math.max(1,holder.clientHeight);
  zoom=Math.min(4,Math.max(1,value));resize();if(loaded&&zoom!==previous){stage.scrollLeft=cx*holder.clientWidth-stage.clientWidth/2;stage.scrollTop=cy*holder.clientHeight-stage.clientHeight/2;}
 }
 function status(text){el('renderStatus').textContent=text;el('renderStatus').hidden=!text;}
 function show(next){
  const list=views();index=(next+list.length)%list.length;const view=list[index],token=++sequence;loaded=false;zoom=1;image.hidden=true;image.removeAttribute('src');
  holder.style.width=holder.style.height='100%';stage.scrollTo(0,0);picker.value=String(index);el('renderLabel').textContent=`${index+1} / ${list.length}`;el('renderLabel').setAttribute('aria-label',`${index+1} / ${list.length} · ${view.label}`);
  el('renderPrevious').disabled=el('renderNext').disabled=list.length<2;
  const latest=!studyMode&&!archive&&!angleMode&&fullBatch==='latest';
  el('renderVersion').textContent=latest?'本批设计渲染 · 非实拍 / 非全屋最终版':studyMode?'局部渲染校样 · 非实拍 / 非全屋最终版':'历史渲染图 · 与当前 3D 不同版';
  el('renderTitle').textContent=studyMode?(recentStudy?'洗漱与备餐 · 固定版本校样':'主卧 · 固定版本校样'):archive?'历史留档 · 不是当前布局':angleMode?'历史分方向校样':latest?'全屋 · 本批设计预览':'历史整屋校样';el('renderArchive').setAttribute('aria-pressed',String(archive));el('renderArchive').textContent=archive?'返回全屋校样':'历史留档';
  el('renderLatest').setAttribute('aria-pressed',String(latest));el('renderOldFull').setAttribute('aria-pressed',String(!studyMode&&!archive&&!angleMode&&!latest));
  el('renderStudy').setAttribute('aria-pressed',String(studyMode&&!recentStudy));el('renderRecent').setAttribute('aria-pressed',String(studyMode&&recentStudy));
  el('renderAngles').setAttribute('aria-pressed',String(angleMode));el('renderAngles').textContent=angleMode?'返回全屋校样':'分方向取景';
  el('renderWalk').hidden=archive;el('renderEnter').textContent=archive?'查看该房间当前 3D':'返回这里的 3D';
  el('renderNote').textContent=archive?'旧版横厅，家具布局和收口已更新。仅留档对照，不作为当前设计。':angleMode?`${angleManifest?.renders?.length||0} / ${roomViewpoints.length} 个历史方向校样。与当前 3D 不同版，餐边柜、风管机、洗烘和收口已有更新；请返回 3D 查看当前设计，勿按本批图片施工。`:`${manifest?.renders?.length||0} / ${renderRooms.length} 个历史视角。尚未同步当前柜墙、风管机、洗烘和收口；不是全屋最终版或实拍，当前布局请回到 3D。`;
  if(latest)el('renderNote').textContent=`${manifest?.renders?.length||0} / ${renderRooms.length} 个视角已生成。本批包含电视双侧展示柜、公卫取消隔断与厨房收口调整；缺图明确显示待生成。单张不含全部设施，回3D可继续环顾。湖景为参考素材，设备尚未全部选型；不是实拍或施工图。`;
  if(studyMode)el('renderNote').textContent=recentStudy?'洗漱与备餐固定版本校样：主卫柜镜、厨房洗切台面、主卧床沿。尚未包含当前3D的电视展示柜及公卫取消隔断修订。24mm镜头，照明功率为设计假设。不是实拍、全屋最终版或施工图；最新布局以3D为准。':'窗帘修正时的固定版本校样：床窗横幅、柜墙方幅，均为24mm镜头。当前3D已继续修正被褥贴合与垂落，这两张图尚未包含。不是实拍、全屋最终版或施工图；后续布局以3D为准。';
  el('renderZoomLabel').textContent='1×';for(const id of ['renderZoomOut','renderZoomIn','renderFit'])el(id).disabled=true;
  if(!view.file){status(loadError||'这个房间的高清图尚未生成。可以先进入 3D 查看布局和设施。');return;}
  // Files are local generated assets; never take arbitrary paths from a manifest.
  if(!/^[a-z0-9-]+\.png$/.test(view.file)){status('图片记录有误，请更新图片。');return;}
  status('正在载入高清图…');const candidate=new Image();candidate.alt=view.label+' · 电脑渲染校样';
  candidate.onload=()=>{if(sequence!==token)return;naturalRatio=candidate.naturalWidth/candidate.naturalHeight;image.src=candidate.src;image.alt=candidate.alt;loaded=true;image.hidden=false;status('');el('renderFit').disabled=false;resize();};
  candidate.onerror=()=>{if(sequence===token)status('图片未能载入，请点“更新图片”重试；仍可进入 3D。');};
  candidate.src='./offline-render/'+view.file+'?scene='+(archive?'archive':currentManifest()?.sourceSha256?.slice(0,16)||'study');
 }
 async function refresh(){
  const ticket=++refreshSequence,angles=angleMode,study=studyMode,recent=recentStudy,batch=fullBatch;
  loadError='';el('renderRefresh').disabled=true;
  try{const r=await fetch(study?(recent?recentManifestURL:studyManifestURL):angles?angleManifestURL:batch==='latest'?latestManifestURL:manifestURL,{cache:'no-store'});if(!r.ok)throw Error('unavailable');const next=await r.json();
   const ids=study?(recent?recentViewIds:studyViewIds):angles?roomViewpoints.map(v=>v.id):renderRooms.map(([id])=>id);
   if(!Array.isArray(next.renders)||!next.sourceSha256||next.renders.some(r=>!ids.includes(r.id)))throw Error('invalid');
   if(ticket!==refreshSequence)return;if(study){if(recent)recentManifest=next;else studyManifest=next;}else if(angles)angleManifest=next;else manifest=next;
  }catch{if(ticket!==refreshSequence)return;loadError='本批高清校样暂不可用，请稍后更新；3D漫步不受影响。';if(study){if(recent)recentManifest=null;else studyManifest=null;}else if(angles)angleManifest=null;else manifest=null;}
  finally{if(ticket===refreshSequence){el('renderRefresh').disabled=false;options();show(index);}}
 }
 async function open(room=state().station,batch=defaultFullBatch){if(batch!==fullBatch)manifest=null;fullBatch=batch;archive=false;angleMode=false;studyMode=false;index=Math.max(0,renderRooms.findIndex(([id])=>id===(roomAlias[room]||room)));options();if(!dialog.open)dialog.showModal();show(index);await refresh();}
 const openLatest=(room=state().station)=>open(room,'latest');
 el('renderLatest').onclick=()=>openLatest();el('renderOldFull').onclick=()=>open(state().station,'legacy');
 function enter(useWalk){const view=views()[index];dialog.close();go(view.room||view.id);if(angleMode||studyMode)selectRoomView(view.id);if(useWalk)walk();}
 el('renderPrevious').onclick=()=>show(index-1);el('renderNext').onclick=()=>show(index+1);picker.onchange=()=>show(Number(picker.value));el('renderRefresh').onclick=refresh;
 el('renderEnter').onclick=()=>enter(false);el('renderWalk').onclick=()=>enter(true);
 el('renderArchive').onclick=()=>{refreshSequence++;archive=!archive;angleMode=false;studyMode=false;index=0;el('renderRefresh').disabled=false;options();show(0);};
 async function openStudy(id='master-storage',recent=false){recentStudy=recent;studyMode=true;archive=false;angleMode=false;index=Math.max(0,studyIds().indexOf(id));loadError='';options();if(!dialog.open)dialog.showModal();show(index);await refresh();}
 const openRecent=(id='ensuite-basin')=>openStudy(id,true);
 el('renderStudy').onclick=()=>openStudy();
 el('renderRecent').onclick=()=>openRecent();
 el('renderAngles').onclick=async()=>{
  angleMode=!angleMode;archive=false;studyMode=false;loadError='';const room=roomAlias[state().station]||state().station;
  index=angleMode?Math.max(0,roomViewpoints.findIndex(v=>v.room===room)):0;const requestedIndex=index,ticket=refreshSequence+1;options();show(index);await refresh();
  if(ticket===refreshSequence&&index===requestedIndex&&angleMode&&!views()[index].file){const list=views(),sameRoom=list.findIndex(v=>v.file&&v.room===room),first=list.findIndex(v=>v.file);if(sameRoom>=0||first>=0)show(sameRoom>=0?sameRoom:first);}
 };
 el('renderZoomIn').onclick=()=>setZoom(zoom*1.5);el('renderZoomOut').onclick=()=>setZoom(zoom/1.5);el('renderFit').onclick=()=>setZoom(1);
 stage.addEventListener('dblclick',()=>setZoom(zoom>1?1:2));
 stage.addEventListener('wheel',e=>{if(!loaded)return;e.preventDefault();setZoom(zoom*(e.deltaY<0?1.15:1/1.15));},{passive:false});
 const gesture=()=>{const p=[...points.values()];if(p.length===2)return {distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)};return p.length===1?p[0]:null;};
 stage.addEventListener('pointerdown',e=>{if(!loaded)return;e.preventDefault();points.set(e.pointerId,{x:e.clientX,y:e.clientY});stage.setPointerCapture(e.pointerId);lastGesture=gesture();});
 stage.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});const current=gesture();
  if(current?.distance&&lastGesture?.distance)setZoom(zoom*current.distance/lastGesture.distance);else if(current&&lastGesture&&!current.distance&&!lastGesture.distance&&zoom>1){stage.scrollLeft-=current.x-lastGesture.x;stage.scrollTop-=current.y-lastGesture.y;}lastGesture=current;
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(event,e=>{points.delete(e.pointerId);lastGesture=gesture();});
 const more=el('renderMore');
 function closeMore(){if(!more.open)return;const focused=more.contains(document.activeElement);more.open=false;if(focused)more.querySelector('summary').focus();}
 more.addEventListener('click',e=>{if(e.target.closest('button'))closeMore();});
 dialog.addEventListener('pointerdown',e=>{if(!more.contains(e.target))closeMore();});
 dialog.addEventListener('cancel',e=>{if(more.open){e.preventDefault();closeMore();}});
 dialog.addEventListener('close',()=>{sequence++;points.clear();lastGesture=null;more.open=false;});
 dialog.addEventListener('keydown',e=>{if(e.target.tagName==='SELECT')return;if(['ArrowLeft','ArrowRight','+','-','0'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')show(index-1);else if(e.key==='ArrowRight')show(index+1);else setZoom(e.key==='0'?1:e.key==='+'?zoom*1.5:zoom/1.5);}});
 new ResizeObserver(resize).observe(stage);
 return {open,openLatest,openStudy,openRecent,refresh,get state(){return {index,archive,angleMode,studyMode,fullBatch,recentStudy:studyMode&&recentStudy,loaded,zoom,room:views()[index]?.id,generated:currentManifest()?.renders?.length||0,source:currentManifest()?.sourceSha256||null};}};
}
