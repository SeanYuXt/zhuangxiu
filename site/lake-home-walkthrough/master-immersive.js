// Fixed standing viewpoints: look around a real location without orbiting through walls.
export function mountImmersive({camera,controls,scene,doors,choose,state}){
 const $=q=>document.querySelector(q),canvas=$('#scene');
 const optimized=false;
 const views={dressing:{p:[1.55,1.60,2.62],t:[.2,1.2,2.62],name:'侧边梳妆台'},entry:{p:[1.25,1.60,1.80],t:[1.05,1.0,.5],name:'入口环顾'},wash:{p:[1.2,1.60,1.50],t:[.1,1.25,1.50],name:'原位洗漱台'},shower:{p:[1.45,1.60,.85],t:[1.65,1.40,.14],name:'窗右淋浴'},toilet:{p:[1.20,1.60,.90],t:[.45,.65,.50],name:'左后马桶'},reverse:{p:[1.15,1.60,.95],t:[1.60,1.2,2.05],name:'回看原门'}};
 let active=false,yaw=0,pitch=0,drag=null;
 function look(){pitch=Math.max(-1.05,Math.min(1.05,pitch));camera.lookAt(camera.position.x+Math.sin(yaw)*Math.cos(pitch),camera.position.y+Math.sin(pitch),camera.position.z-Math.cos(yaw)*Math.cos(pitch));}
 function leave(){active=false;controls.enabled=true;document.body.classList.add('overview');$('#look-hint').textContent='拖动旋转 · 滚轮缩放';document.querySelectorAll('[data-pov]').forEach(b=>b.classList.remove('active'));}
 function enter(id){const v=views[id];if(!v)return;choose(id==='dressing'?'vanity':'bath');active=true;controls.enabled=false;document.body.classList.remove('overview');camera.position.set(...v.p);const dx=v.t[0]-v.p[0],dy=v.t[1]-v.p[1],dz=v.t[2]-v.p[2];yaw=Math.atan2(dx,-dz);pitch=Math.atan2(dy,Math.hypot(dx,dz));camera.fov=68;camera.updateProjectionMatrix();look();
  document.querySelector('.dressing-actions').hidden=id!=='dressing';document.querySelector('.quick-actions').hidden=id==='dressing';
  scene.children.filter(o=>['bath-door-wall','closet-wall','entry-wall','entry-side','foot-wall'].includes(o.name)).forEach(o=>o.visible=true);
  for(const name of ['full-footwall','rounded-entry-end','projection-system']){const o=scene.getObjectByName(name);if(o)o.visible=true;}
  doors.filter(o=>o.d.id==='bath-door').forEach(o=>o.g.visible=true);
  $('#view-name').textContent=v.name;$('#look-hint').textContent='拖动环顾 · 滚轮调视野';document.querySelectorAll('[data-pov]').forEach(b=>b.classList.toggle('active',b.dataset.pov===id));document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));
 }
 canvas.addEventListener('pointerdown',e=>{if(!active||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!active||!drag||drag.id!==e.pointerId)return;yaw-=(e.clientX-drag.x)*.004;pitch+=(e.clientY-drag.y)*.004;drag.x=e.clientX;drag.y=e.clientY;look();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>drag=null);
 canvas.addEventListener('wheel',e=>{if(!active)return;e.preventDefault();camera.fov=Math.max(45,Math.min(78,camera.fov+e.deltaY*.025));camera.updateProjectionMatrix();},{passive:false});
 function turn(d){if(!active)return;const delta={left:[-.15,0],right:[.15,0],up:[0,.12],down:[0,-.12]}[d];yaw+=delta[0];pitch+=delta[1];look();}
 document.querySelectorAll('[data-look]').forEach(b=>b.onclick=()=>turn(b.dataset.look));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePanels();return;}if(e.target.closest('input,select,textarea')||!active)return;const d={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'}[e.key];if(d){e.preventDefault();turn(d);}});
 document.querySelectorAll('[data-pov]').forEach(b=>b.onclick=()=>enter(b.dataset.pov));
 function closePanels(){for(const [btn,panel]of [['settings-toggle','settings-panel'],['info-toggle','info-panel']]){$('#'+panel).hidden=true;$('#'+btn).setAttribute('aria-expanded','false');}}
 for(const [btn,panel]of [['settings-toggle','settings-panel'],['info-toggle','info-panel']])$('#'+btn).onclick=()=>{const open=$('#'+panel).hidden;closePanels();$('#'+panel).hidden=!open;$('#'+btn).setAttribute('aria-expanded',String(open));};
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closePanels);
 function sync(){const doorOpen=+$('#bath-angle').value>0;$('#door-action').textContent=doorOpen?'关门':'开门';$('#door-action').setAttribute('aria-pressed',String(!doorOpen));const m=$('#bath-mirror-inside').checked,c=$('#wet-door-closed').checked,l=$('#light-scene').value==='evening';for(const [id,value,text]of [['mirror-action',m,m?'收起剖视':'镜柜内部'],['curtain-action',c,optimized?(c?'打开淋浴门':'关闭淋浴门'):(c?'收起浴帘':'展开浴帘')],['light-action',l,l?'日光':'暖光']]){$('#'+id).setAttribute('aria-pressed',String(value));$('#'+id).textContent=text;}}
 for(const [button,input]of [['dressing-inside','entry-open'],['dressing-chair','chair-pull'],['dressing-drawers','vanity-drawers']])$('#'+button).onclick=()=>{const el=$('#'+input);el.checked=!el.checked;$('#'+button).setAttribute('aria-pressed',String(el.checked));state();};
 $('#door-action').onclick=()=>{$('#bath-angle').value=+$('#bath-angle').value>0?'0':'90';enter('reverse');state();sync();};
 $('#mirror-action').onclick=()=>{const el=$('#bath-mirror-inside');el.checked=!el.checked;if(el.checked)enter('wash');state();sync();};
 $('#curtain-action').onclick=()=>{const el=$('#wet-door-closed');if(el.disabled)return;el.checked=!el.checked;state();sync();};
 $('#light-action').onclick=()=>{$('#light-scene').value=$('#light-scene').value==='day'?'evening':'day';state();sync();};
 document.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',sync));
 $('#fullscreen-toggle').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('#view-name').textContent='当前浏览器不支持全屏';}};
 document.addEventListener('fullscreenchange',()=>$('#fullscreen-toggle').textContent=document.fullscreenElement?'退出全屏':'全屏');
 sync();return {enter,leave,get active(){return active;}};
}
