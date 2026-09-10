// Keep the image clear without removing the existing cabinet/door controls.
export function wireViewerFocus({state}){
 const host=document.querySelector('#viewport'),body=document.body;
 const dressing=document.querySelector('#masterDressing');
 dressing.querySelector('summary').textContent='主卧收纳与梳妆';
 const designNotes=document.createElement('details');designNotes.className='viewer-design-notes';
 const noteTitle=document.createElement('summary');noteTitle.textContent='尺寸说明与历史试排';designNotes.append(noteTitle);
 const options=document.createElement('div');for(const b of dressing.querySelectorAll('[data-dressing-option]'))options.append(b);designNotes.append(options);
 designNotes.append(document.querySelector('#masterDressingMetrics'),dressing.querySelector('small'));dressing.append(designNotes);
 const toggle=document.createElement('button');toggle.id='viewerDetailToggle';toggle.textContent='本房操作';
 toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','facilities');host.append(toggle);
 function close(){body.classList.remove('viewer-details-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='本房操作';}
 toggle.onclick=()=>{
  const open=body.classList.toggle('viewer-details-open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'收起操作':'本房操作';
  // The master suite owns its controls in this existing panel, not bedroomActions.
  const master=document.querySelector('#masterDressing');if(open&&!master.hidden)master.open=true;
 };
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();}});
 const help=document.createElement('dialog');help.id='viewerHelp';help.setAttribute('aria-labelledby','viewerHelpTitle');
 help.innerHTML='<form method="dialog"><h2 id="viewerHelpTitle">预览操作</h2><button>关闭 ×</button></form><p>环顾：拖动画面，滚轮或双指缩放。画面箭头和空间定位用于切换房间。</p><p>自由行走：电脑用 W/A/S/D 或方向键移动，拖动画面转身，靠近门按 E 开关；手机用左下摇杆移动、在画面右侧拖动转身。Esc 退出行走。</p><p>本房操作：展开衣柜、抽屉、洗烘机门等已有操作。设施说明和尺寸核对按需打开。</p><p>当前是设计预览，设备型号、承重固定和现场管线仍须复核；高清图与实时三维可能属于不同设计版本，请查看图集标注。</p>';
 document.body.append(help);
 const helpButton=document.createElement('button');helpButton.id='viewerHelpToggle';helpButton.textContent='操作帮助';helpButton.onclick=()=>help.showModal();document.querySelector('header nav').append(helpButton);
 let last='';
 function sync(){const s=state(),key=s.station+':'+s.mode;if(key!==last){close();last=key;}toggle.hidden=s.mode!=='look';}
 sync();return {sync};
}
