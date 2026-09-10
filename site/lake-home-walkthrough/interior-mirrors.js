import * as T from './vendor/three.module.js';
import {Reflector} from './vendor/render-libs.js';

// Reflect actual room geometry, not the distant HDR cubemap. Single bounce only.
export function createInteriorMirrors(model){
 const entries=new Map(),frustum=new T.Frustum(),vp=new T.Matrix4(),ray=new T.Raycaster();let rendering=false,exportMode=false,lastScan=-Infinity,updates=0,occluders=[];
 const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
 const attached=o=>{for(let p=o;p;p=p.parent)if(p===model)return true;return false;};
 const profile=o=>{
  if(!o.isMesh||o.isReflector||Array.isArray(o.material)||o.material.metalness<.7)return null;
  if(/^dry-mirror-door-/.test(o.name))return {sign:-1,label:'公卫镜柜'};
  if(o.name==='upper-mirror-door')return {sign:1,label:'阳台镜柜'};
  if(o.name==='makeup-mirror')return {sign:1,label:'主卧梳妆镜'};
  for(let p=o.parent;p;p=p.parent){if(p.name==='entry-dressing-mirror')return {sign:1,label:'玄关穿衣镜'};if(/^bath[12]-vanity$/.test(p.name)){o.geometry.computeBoundingBox();const size=o.geometry.boundingBox.getSize(new T.Vector3());if(size.x>.4&&size.y>.6&&size.z<.04)return {sign:1,label:p.name==='bath2-vanity'?'主卫镜面':'公卫原镜面'};}}
  return null;
 };
 function sync(force=false){
  if(!force&&performance.now()-lastScan<400)return;lastScan=performance.now();
  for(const [o,e] of entries)if(!attached(o)){e.mirror.dispose();e.mirror.geometry.dispose();entries.delete(o);}
  const found=[];model.traverse(o=>{if(!entries.has(o)&&visible(o)){const p=profile(o);if(p)found.push([o,p]);}});
  for(const [o,p] of found){
   o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3());
   const resolution=matchMedia('(max-width:800px)').matches?512:1024;
   const mirror=new Reflector(new T.PlaneGeometry(size.x-.008,size.y-.008),{color:0x7f7f7f,clipBias:.002,textureWidth:resolution,textureHeight:resolution,multisample:0});
   mirror.name='interior-reflection-'+o.id;mirror.position.copy(center);mirror.position.z+=p.sign*(size.z/2+.0008);if(p.sign<0)mirror.rotation.y=Math.PI;
   mirror.castShadow=false;mirror.receiveShadow=false;mirror.userData={runtimeOnly:true,reflection:'one-bounce actual room',source:o.name};
   const original=o.material,fallback=original.clone();fallback.color.set('#858980');fallback.metalness=0;fallback.roughness=.9;o.material=fallback;o.add(mirror);
   o.userData.surfaceRole='interior-mirror';
   const e={source:o,mirror,original,fallback,label:p.label,enabled:false,renders:0,resolution};entries.set(o,e);
   const render=mirror.onBeforeRender;
   mirror.onBeforeRender=(renderer,scene,camera)=>{
    if(rendering||!e.enabled||scene.overrideMaterial||exportMode)return;
    rendering=true;const others=[],planes=renderer.clippingPlanes;
    // Suppress recursive mirrors. Their neutral backings remain, with no HDR leak.
    for(const other of entries.values())if(other!==e){others.push([other.mirror,other.mirror.visible]);other.mirror.visible=false;}
    renderer.clippingPlanes=[];
    try{render(renderer,scene,camera);e.renders++;updates++;}finally{renderer.clippingPlanes=planes;for(const [m,v] of others)m.visible=v;rendering=false;}
   };
  }
  occluders=[];model.traverse(o=>{if(o.isMesh&&!o.isReflector)occluders.push(o);});
 }
 function prepare(camera){
  sync();model.updateMatrixWorld(true);camera.updateMatrixWorld(true);vp.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(vp);
  const candidates=[];
  for(const e of entries.values()){
   const resolution=matchMedia('(max-width:800px)').matches?512:1024;if(resolution!==e.resolution){e.mirror.getRenderTarget().setSize(resolution,resolution);e.resolution=resolution;}
   const center=e.mirror.getWorldPosition(new T.Vector3()),normal=new T.Vector3(0,0,1).transformDirection(e.mirror.matrixWorld),delta=camera.position.clone().sub(center);
   const ok=visible(e.source)&&normal.dot(delta)>0&&delta.length()<10&&frustum.intersectsObject(e.mirror);
   if(ok){
    const stamp=camera.position.toArray().map(v=>Math.round(v*10)).join(',')+':'+camera.quaternion.toArray().map(v=>Math.round(v*20)).join(',');
    if(e.occlusionStamp!==stamp||performance.now()-(e.occlusionAt||0)>250){
     e.occlusionStamp=stamp;e.occlusionAt=performance.now();const {width,height}=e.mirror.geometry.parameters;
     const samples=[[0,0],[-.35,-.35],[.35,.35],[-.35,.35],[.35,-.35]];
     e.unoccluded=samples.some(([x,y])=>{const point=new T.Vector3(x*width,y*height,0).applyMatrix4(e.mirror.matrixWorld),direction=point.sub(camera.position),distance=direction.length();ray.set(camera.position,direction.normalize());ray.far=distance-.002;return !ray.intersectObjects(occluders,false).some(hit=>visible(hit.object)&&hit.object!==e.source&&!(hit.object.material.transparent&&hit.object.material.opacity<.3));});
    }
    if(e.unoccluded)candidates.push({e,score:delta.lengthSq()/(e.mirror.geometry.parameters.width*e.mirror.geometry.parameters.height)});
   }
   e.enabled=false;e.mirror.visible=false;
  }
  candidates.sort((a,b)=>a.score-b.score);const zones=new Set();for(const {e} of candidates){if(zones.size<2||zones.has(e.label)){zones.add(e.label);e.enabled=!exportMode;e.mirror.visible=!exportMode;}}
 }
 function setExportMode(value){exportMode=Boolean(value);for(const e of entries.values()){e.source.material=exportMode?e.original:e.fallback;e.mirror.visible=!exportMode&&e.enabled;}}
 sync(true);
 return {sync,prepare,setExportMode,get entries(){return [...entries.values()];},get state(){return {count:entries.size,updates,exportMode,limit:2,entries:[...entries.values()].map(e=>({name:e.source.name,label:e.label,visible:visible(e.source),enabled:e.enabled,renders:e.renders,resolution:e.resolution,world:e.mirror.getWorldPosition(new T.Vector3()).toArray()}))};}};
}
