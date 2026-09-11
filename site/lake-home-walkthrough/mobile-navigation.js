// Navigation only: uses the existing room IDs and exported object registry.
import {wireRenderGallery} from './render-gallery.js';
import {roomViewsFor} from './room-viewpoints.js';
export const mobileRooms=[['master','主卧'],['bed1','老人房'],['bed3','儿童房'],['bath1','公卫'],['bath2','主卫']];
export const publicSpaces=[['entry','玄关'],['passageArt','儿童房门旁余墙'],['living','客厅'],['tvSeat','沙发坐姿观影'],['dining','餐厅'],['cabinet','餐边柜'],['fridge','冰箱区'],['kitchen','厨房'],['bar','阳台吧台'],['balconyGap','玻璃与柱之间'],['columnFront','柱前回望'],['glassLeft','阳台左端'],['glassRight','阳台洗烘侧'],['balconyDesign','阳台与电视柜'],['laundry','洗烘与手洗盆'],['care','右侧生活区 · 工具与扫地机'],['drying','升降晾衣架']];

export function wireMobileNavigation({visit,focus,state,facilities,roomOf,model,walk,selectRoomView}){
 const host=document.querySelector('#viewport');
 const roomName=document.createElement('div');roomName.id='mobileRoomName';roomName.setAttribute('aria-live','polite');host.append(roomName);
 const dock=document.createElement('nav');dock.id='mobilePlaces';dock.setAttribute('aria-label','房间快速定位');
 const quick=document.createElement('div');quick.className='quick-bedrooms';
 for(const [id,label] of mobileRooms){const b=document.createElement('button');b.textContent=label;b.dataset.quickRoom=id;b.onclick=()=>go(id);quick.append(b);}
 const actions=document.createElement('div');actions.className='place-actions';
 const all=document.createElement('button');all.textContent='全部空间';all.id='allPlaces';
 const details=document.createElement('button');details.textContent='本房细节';details.id='placeDetails';
 actions.append(all,details);dock.append(quick,actions);host.append(dock);
 const sheet=document.createElement('dialog');sheet.id='placeSheet';sheet.setAttribute('aria-labelledby','placeSheetTitle');
 sheet.innerHTML='<form method="dialog"><h2 id="placeSheetTitle">空间定位</h2><button aria-label="关闭定位">关闭 ×</button></form><div id="placeSheetContent"></div>';
 document.body.append(sheet);
 const title=sheet.querySelector('h2'),content=sheet.querySelector('#placeSheetContent');
 const gallery=wireRenderGallery({state,go,walk,selectRoomView});window.renderGalleryDebug=gallery;
 const photo=new URLSearchParams(location.search).get('photo');
 if(['master-storage','master-bed'].includes(photo))queueMicrotask(()=>gallery.openStudy(photo));
 if(['ensuite-basin','kitchen-work','master-bedding'].includes(photo))queueMicrotask(()=>gallery.openRecent(photo));
 if(photo==='latest')queueMicrotask(()=>gallery.openLatest());
 const photoButton=document.createElement('button');photoButton.id='detailRendersToggle';photoButton.textContent='全屋高清图';photoButton.onclick=()=>gallery.open();document.querySelector('header nav').append(photoButton);
 const compact=()=>matchMedia('(max-width:800px), (max-width:1100px) and (max-height:550px)').matches;
 function closePanels(){for(const id of ['facilities','masterDressing','dryZoneStudy'])document.getElementById(id).open=false;}
 function go(id){sheet.close();closePanels();visit(id);}
 function addHeading(text){const h=document.createElement('h3');h.textContent=text;content.append(h);}
 function addLocations(entries){const group=document.createElement('div');group.className='place-list';for(const [id,label] of entries){const b=document.createElement('button');b.dataset.place=id;b.textContent=label+' ›';b.onclick=()=>go(id);b.classList.toggle('active',state().station===id);group.append(b);}content.append(group);}
 all.onclick=()=>{title.textContent='空间定位';content.replaceChildren();addHeading('卧室与卫生间');addLocations(mobileRooms);addHeading('公共空间与阳台');addLocations(publicSpaces);const layout=document.createElement('button');layout.id='mobileLivingLayout';layout.textContent='横厅尺寸与地毯布局 ›';layout.onclick=()=>{sheet.close();window.livingLayoutDebug.open();};content.append(layout);const render=document.createElement('button');render.id='openDetailRender';render.textContent='全屋高清图 ›';render.onclick=()=>{sheet.close();gallery.open();};content.append(render);sheet.showModal();};
 details.onclick=()=>{
  const id=roomOf(state().station),data=facilities[id];title.textContent='本房细节';content.replaceChildren();
  if(id==='entry'){const doors=document.createElement('button');doors.id='mobileEntryDoors';doors.textContent='打开 / 关闭鞋柜门 ›';doors.onclick=()=>{sheet.close();document.querySelector('#entryInside').click();};content.append(doors);}
  const list=document.createElement('div');list.className='place-detail-list';
  const angles=roomViewsFor(state().station).length?roomViewsFor(state().station):roomViewsFor(id);
  for(const view of angles){const b=document.createElement('button');b.dataset.roomView=view.id;b.textContent='取景 · '+view.name+' ›';b.onclick=()=>{sheet.close();closePanels();selectRoomView(view.id);};list.append(b);}
  for(const item of data.items){
   const b=document.createElement('button');b.dataset.detailObject=item.object;b.textContent=item.label.replace(/^[①②③④⑤]\s*/, '')+' ›';b.disabled=!model.getObjectByName(item.object);
   b.onclick=()=>{sheet.close();closePanels();focus(item,false);};list.append(b);
  }
  content.append(list);
  const note=document.createElement('details');note.innerHTML='<summary>方案说明与待完善项</summary>';const p=document.createElement('p');p.textContent=data.summary;note.append(p);content.append(note);sheet.showModal();
 };
 function sync(){const s=state();roomName.textContent=[...mobileRooms,...publicSpaces].find(([id])=>id===s.station)?.[1]||'全屋预览';for(const b of quick.children){b.classList.toggle('active',b.dataset.quickRoom===s.station);b.setAttribute('aria-pressed',String(b.dataset.quickRoom===s.station));}dock.hidden=s.mode==='plan';}
 const noteToggle=document.createElement('button');noteToggle.id='detailNoteToggle';noteToggle.textContent='设施说明';noteToggle.setAttribute('aria-expanded','false');host.append(noteToggle);
 noteToggle.onclick=()=>{const open=document.body.classList.toggle('mobile-detail-note');noteToggle.setAttribute('aria-expanded',String(open));};
 const observer=new MutationObserver(()=>{noteToggle.hidden=document.querySelector('#facilityNote').hidden;document.body.classList.remove('mobile-detail-note');noteToggle.setAttribute('aria-expanded','false');});
 observer.observe(document.querySelector('#facilityNote'),{attributes:true,attributeFilter:['hidden'],childList:true});noteToggle.hidden=true;
 // Retain the evidence dialog on desktop; mobile gets the shorter locator.
 const originalGuide=document.querySelector('#spaceGuideToggle').onclick;
 document.querySelector('#spaceGuideToggle').onclick=e=>compact()?all.click():originalGuide(e);
 return {sync};
}
