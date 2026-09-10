// Inventory is generated from the same facility/object map as the viewer.
export function wireInventory({dialog,rooms,data,pending,getModel,onSelect,resolveItem=(roomId,item)=>item}){
 document.querySelector('#inventoryToggle').onclick=()=>{
  const list=dialog.querySelector('#inventoryItems');list.replaceChildren();
  let present=0,missing=0;
  for(const [roomId,room] of Object.entries(data)){
   const section=document.createElement('details'),title=document.createElement('summary');
   title.textContent=rooms.find(r=>r.id===roomId)?.name||roomId;section.append(title);
   for(const item of room.items){
    const shown=resolveItem(roomId,item);
    const exists=!!getModel()?.getObjectByName(item.object),button=document.createElement('button');
    if(exists)present++;else missing++;
    button.type='button';button.textContent=(exists?'查看 · ':'缺失 · ')+shown.label;
    button.disabled=!exists;button.dataset.inventoryObject=item.object;
    button.onclick=()=>{dialog.close();onSelect(roomId,shown);};section.append(button);
   }
   list.append(section);
  }
  dialog.querySelector('#inventoryStatus').textContent=`${present} 个查看入口在当前模型中存在${missing?'，'+missing+' 个缺失':''}。不是采购清单或真实设备在线状态。`;
  const outstanding=dialog.querySelector('#inventoryPending');outstanding.replaceChildren();
  for(const text of pending){const li=document.createElement('li');li.textContent=text;outstanding.append(li);}
  dialog.showModal();
 };
}
