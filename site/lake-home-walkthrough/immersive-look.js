import * as T from './vendor/three.module.js';

// Camera-only input: it never moves a wall, cabinet or camera standing position.
export function createImmersiveLook({canvas,camera,enabled,changed,activity}){
 const pointers=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let targetYaw=0,targetPitch=0,targetFov=70,pending=false,sensitivity=1;
 function sync(){targetYaw=camera.rotation.y;targetPitch=camera.rotation.x;targetFov=camera.fov;pending=false;}
 function clear(){
  for(const id of pointers.keys())if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
  pointers.clear();activity(false);sync();
 }
 const distance=()=>{const p=[...pointers.values()];return p.length===2?Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y):0;};
 function turn(dx,dy){
  if(!pending)sync();
  const scale=sensitivity*.0024*camera.fov/70;
  targetYaw-=dx*scale;targetPitch=T.MathUtils.clamp(targetPitch-dy*scale,-1.35,1.35);
  pending=true;changed();
 }
 function zoom(value){if(!pending)sync();targetFov=T.MathUtils.clamp(value,38,88);pending=true;changed();}
 canvas.style.touchAction='none';
 canvas.addEventListener('contextmenu',e=>{if(enabled())e.preventDefault();});
 canvas.addEventListener('pointerdown',e=>{
  if(!enabled()||(e.pointerType==='mouse'&&e.button!==0))return;
  if(pointers.size===0&&!pending)sync();
  e.preventDefault();canvas.focus({preventScroll:true});
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);activity(true);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!enabled())return;
  if(document.pointerLockElement===canvas){turn(e.movementX,e.movementY);return;}
  const old=pointers.get(e.pointerId);if(!old)return;
  const before=distance();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===1)turn(e.clientX-old.x,e.clientY-old.y);
  else if(pointers.size===2&&before>0){const after=distance();if(after>0)zoom((pending?targetFov:camera.fov)*before/after);}
 });
 const release=e=>{pointers.delete(e.pointerId);activity(pointers.size>0);};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,release);
 canvas.addEventListener('wheel',e=>{
  if(!enabled())return;e.preventDefault();
  const unit=e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1;
  zoom((pending?targetFov:camera.fov)*Math.exp(T.MathUtils.clamp(e.deltaY*unit,-240,240)*.001));
 },{passive:false});
 window.addEventListener('blur',clear);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
 new MutationObserver(()=>{if(document.querySelector('dialog[open]')){clear();if(document.pointerLockElement===canvas)document.exitPointerLock();}}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 function step(dt){
  if(!enabled()||!pending)return false;
  const alpha=reduced.matches?1:1-Math.exp(-24*Math.min(dt,.05));
  camera.rotation.set(T.MathUtils.lerp(camera.rotation.x,targetPitch,alpha),T.MathUtils.lerp(camera.rotation.y,targetYaw,alpha),0,'YXZ');
  camera.fov=T.MathUtils.lerp(camera.fov,targetFov,alpha);
  if(Math.abs(camera.rotation.x-targetPitch)+Math.abs(camera.rotation.y-targetYaw)<.00008&&Math.abs(camera.fov-targetFov)<.008){
   camera.rotation.set(targetPitch,targetYaw,0,'YXZ');camera.fov=targetFov;pending=false;
  }
  camera.updateProjectionMatrix();changed();return true;
 }
 sync();return {step,clear,sync,setSensitivity:v=>sensitivity=T.MathUtils.clamp(v,.4,1.8),get state(){return {pending,pointers:pointers.size,targetYaw,targetPitch,targetFov,sensitivity};}};
}
