export function wireMobileControls(){
 const media=matchMedia('(max-width:800px), (max-width:1100px) and (max-height:550px)'),header=document.querySelector('header'),nav=header.querySelector('nav');
 const menu=document.createElement('button');menu.id='mobileMenuToggle';menu.textContent='更多';menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-controls','viewerTools');nav.id='viewerTools';header.append(menu);
 const closeMenu=()=>{document.body.classList.remove('mobile-tools-open');menu.setAttribute('aria-expanded','false');menu.textContent='更多';};
 menu.onclick=()=>{const open=document.body.classList.toggle('mobile-tools-open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'收起':'更多';};
 nav.addEventListener('click',e=>{if(e.target.closest('button'))closeMenu();});
 document.addEventListener('pointerdown',e=>{if(!header.contains(e.target))closeMenu();});
 const panels=['facilities','masterDressing','dryZoneStudy'].map(id=>document.getElementById(id));
 const update=()=>document.body.classList.toggle('mobile-panel-open',media.matches&&panels.some(p=>!p.hidden&&p.open));
 panels.forEach(panel=>{panel.addEventListener('toggle',()=>{if(media.matches&&panel.open)panels.filter(p=>p!==panel).forEach(p=>p.open=false);update();});new MutationObserver(update).observe(panel,{attributes:true,attributeFilter:['hidden']});});
 function responsive(){closeMenu();if(media.matches){panels.forEach(p=>p.open=false);document.querySelector('#gesture').textContent='单指环顾 · 双指缩放 · 箭头换房间';}else document.body.classList.remove('mobile-immersive');update();}
 media.addEventListener('change',responsive);responsive();
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){const wasOpen=document.body.classList.contains('mobile-tools-open');closeMenu();if(wasOpen)menu.focus();document.body.classList.remove('mobile-immersive');}});
}
