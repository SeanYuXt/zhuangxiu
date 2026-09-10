import {lightingPresets} from './lighting-design.js';

export function wireLightingControls({design,room,onPreset,onFixture,focus}){
 const button=document.createElement('button');button.id='lightingDesignToggle';button.textContent='灯光场景';document.querySelector('header nav').append(button);
 const dialog=document.createElement('dialog');dialog.id='lightingDesignDialog';dialog.setAttribute('aria-labelledby','lightingDesignTitle');
 dialog.innerHTML='<form method="dialog"><h2 id="lightingDesignTitle">全屋灯光</h2><button aria-label="关闭灯光">关闭 ×</button></form><div class="lighting-presets" aria-label="照明场景"></div><label class="lighting-room-label">查看灯具<select id="lightingRoom"></select></label><div id="lightingFixtureList"></div><p class="lighting-limits">参数为选型目标，不是已选机型或实测照度。此处控制网页预览；不代表真实智能设备已连接。实时采用附近灯具阴影近似，离线效果图使用全部灯具。</p>';
 document.body.append(dialog);const list=dialog.querySelector('#lightingFixtureList'),select=dialog.querySelector('select');
 for(const [id,label] of Object.entries(design.roomNames)){const o=document.createElement('option');o.value=id;o.textContent=label;select.append(o);}
 for(const [id,label] of Object.entries(lightingPresets)){const b=document.createElement('button');b.dataset.lightingPreset=id;b.textContent=label;b.onclick=()=>{onPreset(id);render();};dialog.querySelector('.lighting-presets').append(b);}
 function render(){
  dialog.querySelectorAll('[data-lighting-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lightingPreset===design.preset)));
  list.replaceChildren();for(const s of design.report().filter(s=>s.room===select.value)){
   const row=document.createElement('article');row.className='lighting-fixture';const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=s.level>0;input.dataset.lightingFixture=s.id;
   input.onchange=()=>{onFixture(s.id,input.checked);render();};label.append(input,document.createTextNode(s.label));
   const detail=document.createElement('small');detail.textContent=`${s.kelvin} K · ${s.lumens} lm · ${s.beam}° · ${s.watts} · Ra≥90目标`;
   const locate=document.createElement('button');locate.dataset.lightingLocate=s.id;locate.textContent='看位置';locate.onclick=()=>{dialog.close();focus(s);};row.append(label,locate,detail);list.append(row);
  }
 }
 select.onchange=render;button.onclick=()=>{const id=room();select.value=design.roomNames[id]?id:'living';render();dialog.showModal();};
 return {render,dialog};
}
