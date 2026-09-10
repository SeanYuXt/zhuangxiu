import * as T from './vendor/three.module.js';

// Isolated diffuse-volume trial, not imported by the production viewer.
// The low-frequency field is interpolated, never baked into base-colour textures.
export function sampleProbeIrradiance(data,p,normal,out=[0,0,0]){
 const blend=data.axes.map((a,i)=>T.MathUtils.clamp((p[i]-a[0])/(a[1]-a[0]),0,1));
 const [x,y,z]=normal;
 const basis=[.886227,1.023328*y,1.023328*z,1.023328*x,.858086*x*y,
  .858086*y*z,.247708*(3*z*z-1),.858086*x*z,.429043*(x*x-y*y)];
 out.fill(0);
 for(let iz=0;iz<2;iz++)for(let iy=0;iy<2;iy++)for(let ix=0;ix<2;ix++){
  const weight=(ix?blend[0]:1-blend[0])*(iy?blend[1]:1-blend[1])*(iz?blend[2]:1-blend[2]);
  const c=data.probes[ix+2*iy+4*iz].coefficients;
  for(let band=0;band<9;band++)for(let channel=0;channel<3;channel++)out[channel]+=c[band][channel]*basis[band]*weight;
 }
 return out.map(v=>Math.max(0,v));
}

export function applyLivingProbePilot(model,data,{isDay=()=>true}={}){
 if(data.sourceSha256!=='31e696eb6ce19e68fb1ca0939eea67b753029874d841d95937bc506fd56d8617'||data.probes?.length!==8)throw Error('Wrong probe source/batch');
 if(model.getObjectByName('tv-display-columns')?.userData.scheme!=='电视齐平横向展示带 · 两侧各两格 · 整片上下饰面')throw Error('Current TV geometry does not match pilot');
 const expected=[];for(const z of data.axes[2])for(const y of data.axes[1])for(const x of data.axes[0])expected.push([x,y,z]);
 if(data.probes.some((p,i)=>JSON.stringify(p.position)!==JSON.stringify(expected[i])||p.coefficients.length!==9||p.coefficients.flat().some(v=>!Number.isFinite(v))))throw Error('Invalid probe order/coefficients');
 model.updateMatrixWorld(true);const entries=[],materials=new Map(),uniform={value:1},stats={vertices:0,updatedMeshes:0};
 const point=new T.Vector3(),normal=new T.Vector3(),normalMatrix=new T.Matrix3();
 const weight=p=>T.MathUtils.smoothstep(p.x,6.2,6.55)*(1-T.MathUtils.smoothstep(p.x,11.75,12.05))*T.MathUtils.smoothstep(p.z,.1,.4)*(1-T.MathUtils.smoothstep(p.z,6.8,7.15));
 const eligible=[];model.traverseVisible(o=>{const m=o.material;if(!o.isMesh||!m?.isMeshStandardMaterial||m.transparent||m.opacity<.999||m.metalness>.7||o.userData.runtimeOnly||o.userData.surfaceRole==='interior-mirror')return;
  const bounds=new T.Box3().setFromObject(o);if(bounds.max.x<6.2||bounds.min.x>12.05||bounds.max.z<.1||bounds.min.z>7.15||bounds.min.y>2.8||bounds.max.y<0)return;
  if(o.geometry.attributes.normal)eligible.push(o);
 });
 function update(entry){
  const o=entry.o,g=entry.geometry,p=g.attributes.position,n=g.attributes.normal,v=g.attributes.probeDiffuse,w=g.attributes.probeWeight;normalMatrix.getNormalMatrix(o.matrixWorld);
  for(let i=0;i<p.count;i++){
   point.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);normal.fromBufferAttribute(n,i).applyNormalMatrix(normalMatrix);
   const rgb=sampleProbeIrradiance(data,point.toArray(),normal.toArray());v.setXYZ(i,...rgb);w.setX(i,weight(point));
  }
  v.needsUpdate=w.needsUpdate=true;entry.matrix.copy(o.matrixWorld);stats.updatedMeshes++;
 }
 for(const o of eligible){
  const original=o.material;
  if(!materials.has(original)){
   const m=original.clone();m.onBeforeCompile=(shader,renderer)=>{
    original.onBeforeCompile(shader,renderer);
    shader.uniforms.probeEnabled=uniform;
    shader.vertexShader='attribute vec3 probeDiffuse; attribute float probeWeight; varying vec3 vProbeDiffuse; varying float vProbeWeight;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvProbeDiffuse=probeDiffuse; vProbeWeight=probeWeight;');
    const maps=T.ShaderChunk.lights_fragment_maps;
    shader.fragmentShader='uniform float probeEnabled; varying vec3 vProbeDiffuse; varying float vProbeWeight;\n'+shader.fragmentShader.replace('#include <lights_fragment_maps>',maps+'\nfloat probeFactor=clamp(vProbeWeight*probeEnabled,0.0,1.0); irradiance=mix(irradiance,max(vProbeDiffuse,vec3(0.0)),probeFactor); iblIrradiance*=1.0-probeFactor;');
   };m.customProgramCacheKey=()=>original.customProgramCacheKey()+'-living-probe-pilot-v1';materials.set(original,m);
  }
  const geometry=o.geometry.clone();geometry.setAttribute('probeDiffuse',new T.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count*3),3));geometry.setAttribute('probeWeight',new T.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count),1));
  const entry={o,geometry,originalGeometry:o.geometry,originalMaterial:original,onBeforeRender:o.onBeforeRender,matrix:new T.Matrix4()};entries.push(entry);o.geometry=geometry;o.material=materials.get(original);update(entry);stats.vertices+=geometry.attributes.position.count;
  o.onBeforeRender=function(...args){entry.onBeforeRender.apply(this,args);if(!entry.matrix.equals(o.matrixWorld))update(entry);};
 }
 let scene=model;while(scene.parent)scene=scene.parent;const beforeScene=scene.onBeforeRender;let enabled=true;
 scene.onBeforeRender=function(...args){beforeScene.apply(this,args);uniform.value=enabled&&isDay()?1:0;};
 return {entries,stats,data,setEnabled(on){enabled=!!on;},get state(){return {enabled,active:uniform.value===1,receivers:entries.length,materials:materials.size,...stats};},
  dispose(){scene.onBeforeRender=beforeScene;for(const e of entries){e.o.onBeforeRender=e.onBeforeRender;e.o.geometry=e.originalGeometry;e.o.material=e.originalMaterial;e.geometry.dispose();}for(const m of materials.values())m.dispose();},
  limits:'Sparse living diffuse pilot. Moving meshes resample the static field, not dynamic GI. No room-occlusion/visibility moments, full-scene change guard, or mobile FPS acceptance; not production.'};
}
