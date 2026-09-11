import {finishWoodPanel} from './cabinet-finishes.js';

// Surface study only: preserve panel positions, sizes, door pivots and clearances.
export function refinePreviewSurfaces(model,renderer){
 const report={woodPanels:0,satinPanels:0,metalDetails:0,tvPanels:0,textures:0},textures=new Set(),satin=new Map();
 const wood=/^(entry-new-back|entry-shoe-shelf|entry-low-(back|shelf|counter)|entry-everyday-drawer-base|entry-drawer-(side|back))$/;
 const doors=/^(entry-new-door-leaf-|entry-low-storage-door-|entry-everyday-drawer-front$|entry-new-carcass-side$|entry-low-side$)/;
 const metal=/^entry-(new-door-pull-|low-door-pull-|everyday-drawer-pull$|key-hook$)/;
 model.traverseVisible(o=>{
  if(!o.isMesh||Array.isArray(o.material))return;
  if(wood.test(o.name)){finishWoodPanel(o,{interior:!o.name.endsWith('counter')});report.woodPanels++;}
  if(doors.test(o.name)){
   if(!satin.has(o.material)){const m=o.material.clone();m.color.set('#e4e0d6');m.roughness=.48;m.metalness=0;satin.set(o.material,m);}
   o.material=satin.get(o.material);report.satinPanels++;
  }
  if(metal.test(o.name)){o.material=o.material.clone();o.material.color.set('#8b8374');o.material.metalness=.72;o.material.roughness=.32;report.metalDetails++;}
  if(o.name.startsWith('tv-display-')&&o.userData.woodFinish){o.material.color.set('#eee6da');report.tvPanels++;}
  if(/^tv-display-(upper-infill|lower-infill|outer-pilaster)$/.test(o.name)){o.material=o.material.clone();o.material.color.set('#e4e0d6');o.material.roughness=.48;report.satinPanels++;}
  const m=o.material;
  for(const key of ['map','normalMap','roughnessMap'])if(m[key])textures.add(m[key]);
 });
 for(const texture of textures){texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.needsUpdate=true;}
 report.textures=textures.size;return report;
}

export function wireImmersivePreview({host,canvas,renderer,composer,ao,look,walk,setMode,state,resize,relight,capture}){
 let quality='balanced',lightStyle='natural';
 const dialog=document.createElement('dialog');dialog.id='immersiveSettings';
 dialog.innerHTML=`<form method="dialog"><h2>画面与操作</h2><button aria-label="关闭画面设置">关闭 ×</button></form>
 <label>画质<select id="previewQuality"><option value="balanced">均衡 · 实时阴影</option><option value="high">精细 · 更高分辨率</option><option value="fast">流畅 · 轻量渲染</option></select></label>
 <label>光照<select id="previewLight"><option value="natural">自然 · 窗光与层次</option><option value="original">原版 · 明亮预览</option></select></label>
 <label>环顾灵敏度<input id="lookSensitivity" aria-label="环顾灵敏度" type="range" min="0.4" max="1.8" step="0.1" value="1"></label>
 <label>显示房间箭头<input id="previewMarkers" type="checkbox"></label>
 <label>轻微步行起伏<input id="previewBob" type="checkbox"></label>
 <p>拖动环顾，滚轮 / 双指缩放。自由行走使用 WASD，Shift 加速，E 开关近门。游戏鼠标模式无需按住鼠标，Esc 释放。</p>
 <div class="immersive-actions"><button id="gameMouse">进入游戏鼠标模式</button><button id="saveCurrentFrame">保存当前画面</button></div>
 <p id="previewMessage" role="status">当前画面与漫游使用同一模型；历史效果图不会随本次修改自动更新。自然光是设计模拟，窗外素材不是现场实景。</p>`;
 document.body.append(dialog);document.body.classList.add('hide-room-markers');
 const toggle=document.createElement('button');toggle.id='immersiveToggle';toggle.textContent='画面 · 操作';toggle.onclick=()=>dialog.showModal();host.append(toggle);
 const reticle=document.createElement('i');reticle.id='walkReticle';reticle.setAttribute('aria-hidden','true');host.append(reticle);
 const message=dialog.querySelector('#previewMessage');
 function applyQuality(){
  const ratio=quality==='high'?Math.min(2,Math.max(1.5,devicePixelRatio)):Math.min(devicePixelRatio,quality==='fast'?1:1.35);
  renderer.setPixelRatio(ratio);composer.setPixelRatio(ratio);ao.enabled=quality!=='fast';
  resize();
 }
 dialog.querySelector('#previewQuality').onchange=e=>{quality=e.target.value;applyQuality();};
 dialog.querySelector('#previewLight').onchange=e=>{lightStyle=e.target.value;relight();};
 dialog.querySelector('#lookSensitivity').oninput=e=>look.setSensitivity(Number(e.target.value));
 dialog.querySelector('#previewMarkers').onchange=e=>document.body.classList.toggle('hide-room-markers',!e.target.checked);
 dialog.querySelector('#previewBob').onchange=e=>walk.setMotion(e.target.checked);
 dialog.querySelector('#saveCurrentFrame').onclick=()=>{dialog.close();capture();};
 dialog.querySelector('#gameMouse').onclick=async()=>{
  if(!canvas.requestPointerLock){message.textContent='此浏览器不支持锁定鼠标，仍可拖动环顾和用键盘行走。';return;}
  dialog.close();setMode('walk');
  if(state().mode!=='walk')return;
  try{await canvas.requestPointerLock();}catch{message.textContent='浏览器没有允许锁定鼠标。可继续拖动环顾和用键盘行走。';dialog.showModal();}
 };
 document.addEventListener('pointerlockchange',()=>{document.body.classList.toggle('immersive-locked',document.pointerLockElement===canvas);look.clear();});
 document.addEventListener('pointerlockerror',()=>{message.textContent='鼠标锁定未成功，拖动环顾仍可使用。';});
 applyQuality();
 return {get state(){return {quality,lightStyle,pixelRatio:renderer.getPixelRatio(),aoEnabled:ao.enabled};}};
}
