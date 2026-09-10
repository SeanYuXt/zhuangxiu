import * as T from './vendor/three.module.js';
import {outline, P} from './plan.js';
import {setDoorLeafOpen} from './door-motion.js';

// Game controller, not a clearance certification. No teleport in move().
export const walkSettings={radius:.23,eye:1.60,speed:1.05,maxStep:.025};
export function insidePolygon(x,z,poly){
 let inside=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const a=poly[i],b=poly[j];
  if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside;
}
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};

export function createWalkController({model,camera,host,canvas,onChange,onExit}){
 const boundary=outline.map(P),bounds=new T.Box3(),keys=new Set();
 let active=false,obstacles=[],doors=[],grid=new Map(),stamp=0,nearDoor=null,lastRefresh=0;
 let collisionSnapshot=new WeakMap(),snapshotCount=0,refreshChecks=0;
 let joystick=[0,0],pointer=null,origin=null,travel=0,collisions=0,blockedStart=false;
 const hud=document.createElement('div');hud.id='walkHud';
 hud.innerHTML='<div class="walk-caption"><b>自由行走</b><span id="walkHint">WASD / 方向键走动 · 拖动画面环顾 · E 开关近门</span></div><button id="walkDoor" hidden>开门</button><button id="walkExit">退出行走</button><div id="walkJoystick" role="group" aria-label="行走方向摇杆"><span aria-hidden="true">＋</span><i></i></div>';
 hud.hidden=true;host.append(hud);
 const pad=hud.querySelector('#walkJoystick'),knob=pad.querySelector('i'),doorButton=hud.querySelector('#walkDoor'),hint=hud.querySelector('#walkHint');
 hud.querySelector('#walkExit').onclick=onExit;
 function rebuild(){
  model.updateMatrixWorld(true);obstacles=[];doors=[];grid=new Map();
  model.traverse(o=>{
   if(!visible(o))return;
   if(typeof o.userData.turn==='number')doors.push(o);
   if(!o.isMesh||o.userData.walkThrough)return;
   bounds.setFromObject(o);
   // Exclude floor, ceilings and overhead fixtures, not solid glass or doors.
   if(bounds.max.y<.10||bounds.min.y>1.75||bounds.isEmpty())return;
   const b={x0:bounds.min.x,x1:bounds.max.x,z0:bounds.min.z,z1:bounds.max.z,name:o.name};
   if(b.x1-b.x0>24||b.z1-b.z0>24)return; // exterior environment only
   const index=obstacles.push(b)-1;
   for(let x=Math.floor((b.x0-walkSettings.radius)/.5);x<=Math.floor((b.x1+walkSettings.radius)/.5);x++)
    for(let z=Math.floor((b.z0-walkSettings.radius)/.5);z<=Math.floor((b.z1+walkSettings.radius)/.5);z++){
     const key=x+','+z;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(index);
    }
  });stamp++;lastRefresh=performance.now();rememberCollisionState();
 }
 function collisionObjects(visit){model.traverseVisible(o=>{if(o.isMesh||typeof o.userData.turn==='number')visit(o);});}
 function rememberCollisionState(){
  collisionSnapshot=new WeakMap();snapshotCount=0;
  collisionObjects(o=>{snapshotCount++;collisionSnapshot.set(o,{matrix:[...o.matrixWorld.elements],geometry:o.geometry,positions:o.geometry?.attributes.position?.version,indices:o.geometry?.index?.version,walkThrough:o.userData.walkThrough,turn:o.userData.turn});});
 }
 function refreshCollisionState(){
  // The broad phase is exactly the existing rebuild. Only skip it when every
  // visible mesh/door, world transform and collision-affecting flag is unchanged.
  model.updateMatrixWorld(true);let count=0,changed=false;refreshChecks++;
  collisionObjects(o=>{count++;const old=collisionSnapshot.get(o);
   if(!old||old.geometry!==o.geometry||old.positions!==o.geometry?.attributes.position?.version||old.indices!==o.geometry?.index?.version||old.walkThrough!==o.userData.walkThrough||old.turn!==o.userData.turn||o.matrixWorld.elements.some((v,i)=>v!==old.matrix[i]))changed=true;
  });lastRefresh=performance.now();
  if(changed||count!==snapshotCount){rebuild();return true;}return false;
 }
 function reason(x,z){
  const r=walkSettings.radius;
  for(let i=0;i<16;i++){const a=i*Math.PI/8;if(!insidePolygon(x+Math.cos(a)*r,z+Math.sin(a)*r,boundary))return '房屋边界';}
  for(const index of grid.get(Math.floor(x/.5)+','+Math.floor(z/.5))||[]){
   const b=obstacles[index],dx=Math.max(b.x0-x,0,x-b.x1),dz=Math.max(b.z0-z,0,z-b.z1);
   if(dx*dx+dz*dz<r*r-1e-8)return b.name||'实体';
  }
  return null;
 }
 function free(x,z){return reason(x,z)===null;}
 function nearest(x,z,max=.8){
  if(free(x,z))return [x,z];
  for(let r=.05;r<=max;r+=.05)for(let k=0;k<48;k++){
   const a=k*Math.PI/24,p=[x+Math.cos(a)*r,z+Math.sin(a)*r];
   if(free(...p))return p;
  }
  return null;
 }
 function clearInput(){keys.clear();joystick=[0,0];pointer=null;origin=null;knob.style.transform='translate(0,0)';}
 function enter(){
  rebuild();const p=nearest(camera.position.x,camera.position.z);
  blockedStart=!p;
  if(!p){hint.textContent='这个细节机位不在可行走地面，请先定位到玄关或房间通道。';return false;}
  camera.position.set(p[0],walkSettings.eye,p[1]);active=true;hud.hidden=false;
  document.body.classList.add('is-walking');canvas.tabIndex=0;canvas.focus({preventScroll:true});
  hint.textContent='WASD / 方向键走动 · 拖动画面环顾 · E 开关近门';onChange();return true;
 }
 function leave(){active=false;clearInput();hud.hidden=true;document.body.classList.remove('is-walking');}
 function move(dx,dz){
  const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/walkSettings.maxStep));
  let changed=false;
  for(let i=0;i<count;i++){
   const x=camera.position.x,z=camera.position.z,stepX=dx/count,stepZ=dz/count;
   if(free(x+stepX,z+stepZ)){camera.position.x+=stepX;camera.position.z+=stepZ;}
   else {collisions++;if(free(x+stepX,z))camera.position.x+=stepX;if(free(camera.position.x,z+stepZ))camera.position.z+=stepZ;}
   const distance=Math.hypot(camera.position.x-x,camera.position.z-z);travel+=distance;changed ||= distance>1e-7;
  }
  if(changed)onChange();return changed;
 }
 function interact(){
  if(!active||!nearDoor)return;
  const door=nearDoor,was=door.userData.open;setDoorLeafOpen(door,!was);rebuild();
  // Do not close a leaf onto the player. Restore instead of pushing/teleporting.
  if(!free(camera.position.x,camera.position.z)){setDoorLeafOpen(door,was);rebuild();hint.textContent='门扇会碰到当前位置，请先退开。';}
  onChange();
 }
 doorButton.onclick=interact;
 function step(dt){
  if(!active)return false;
  if(inputFocused())return false;
  if(performance.now()-lastRefresh>350)refreshCollisionState();
  let forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'))-joystick[1];
  let side=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'))+joystick[0];
  const length=Math.hypot(forward,side);if(length>1){forward/=length;side/=length;}
  const a=camera.rotation.y,speed=walkSettings.speed*Math.min(dt,.05);
  const moved=move((-Math.sin(a)*forward+Math.cos(a)*side)*speed,(-Math.cos(a)*forward-Math.sin(a)*side)*speed);
  let nearestDistance=1.5;nearDoor=null;
  for(const door of doors){const p=door.getWorldPosition(new T.Vector3()),distance=Math.hypot(p.x-camera.position.x,p.z-camera.position.z);if(distance<nearestDistance){nearestDistance=distance;nearDoor=door;}}
  doorButton.hidden=!nearDoor;doorButton.textContent=nearDoor?.userData.open?'关门 · E':'开门 · E';
  return moved;
 }
 const inputFocused=()=>document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
 window.addEventListener('keydown',e=>{
  if(!active||inputFocused())return;
  if(['KeyW','KeyS','KeyA','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}
  if(e.code==='KeyE'&&!e.repeat)interact();if(e.code==='Escape')onExit();
 });
 window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',clearInput);
 document.addEventListener('visibilitychange',clearInput);
 new MutationObserver(()=>{if(document.querySelector('dialog[open]'))clearInput();}).observe(document.body,{attributes:true,attributeFilter:['open'],subtree:true});
 pad.addEventListener('pointerdown',e=>{if(pointer!==null)return;e.preventDefault();pointer=e.pointerId;const b=pad.getBoundingClientRect();origin=[b.x+b.width/2,b.y+b.height/2];pad.setPointerCapture(pointer);updatePad(e);});
 function updatePad(e){if(e.pointerId!==pointer)return;const dx=e.clientX-origin[0],dy=e.clientY-origin[1],length=Math.hypot(dx,dy),scale=Math.min(1,34/Math.max(length,1));joystick=[dx*scale/34,dy*scale/34];knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;}
 pad.addEventListener('pointermove',updatePad);for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,clearInput);
 const debug={rebuild,refreshCollisionState,free,reason,nearest,move,step,interact,get obstacles(){return obstacles;},get state(){return {active,radius:walkSettings.radius,eye:walkSettings.eye,travel,collisions,blockedStart,colliders:obstacles.length,stamp,refreshChecks,nearDoor:nearDoor?.name||null,position:camera.position.toArray(),keys:[...keys],joystick};}};
 return {enter,leave,step,rebuild,debug};
}
