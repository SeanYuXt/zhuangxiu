// Focused browser-side assertions for the actual loaded model and glTF material.
// Invoked by the CUA development tab; does not change camera, furniture or UI.
import * as T from './vendor/three.module.js';
import {GLTFExporter} from './vendor/render-libs.js';
export async function verifyMatteFabrics(model){
 const materials=new Map(),meshes=[],assert=(ok,message)=>{if(!ok)throw Error(message);};
 model.traverseVisible(o=>{
  if(!o.isMesh||!o.material.userData?.calibration)return;
  const m=o.material,c=m.userData.calibration;
  assert(m.roughness===1&&m.specularIntensity===.4&&m.metalness===0,'Unexpected BRDF '+o.name);
  assert(c.roughnessRange[0]>=.86&&c.roughnessRange[1]<=1,'Fabric roughness outside matte range');
  assert(m.map.colorSpace===T.SRGBColorSpace&&m.roughnessMap.colorSpace===T.NoColorSpace,'Map colour space');
  assert(m.map.image?.width>0&&m.roughnessMap.image?.width>0&&m.normalMap.image?.width>0,'Unloaded fabric map');
  assert(m.userData.patchMetres.every((v,i)=>Math.abs(m.map.repeat.getComponent(i)-v/m.userData.scanSizeMetres[i])<1e-6),'Changed physical weave scale');
  assert([m.color.r,m.color.g,m.color.b].every(v=>v>=0&&v<=1),'glTF base colour outside range');
  if(!materials.has(m.uuid))materials.set(m.uuid,{name:m.name,asset:m.userData.asset,designColor:m.userData.designColor,roughness:m.roughness,specular:m.specularIntensity,sheenStrength:m.userData.sheenStrength,calibration:c});
  meshes.push(o.name);
 });
 assert(materials.size>10&&meshes.length>50,'Fabric coverage unexpectedly missing');
 const names=['master-bed-draped-duvet','master-bed-sewn-pillow-0-folded-cover','bed1-bed-draped-duvet','bed3-bed-draped-duvet','sofa-sewn-seat-0-top','bed3-curtain-left-cloth'];
 const geometry=[];
 for(const name of names){
  const o=model.getObjectByName(name);assert(o?.isMesh,'Missing fabric '+name);const a=o.geometry.attributes.position.array;
  const bytes=new Uint8Array(a.buffer,a.byteOffset,a.byteLength),hash=await crypto.subtle.digest('SHA-256',bytes);
  geometry.push({name,vertices:o.geometry.attributes.position.count,positionSha256:[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')});
 }
 // Export only one representative mesh; preserve all frozen full-house inputs.
 const output=await new GLTFExporter().parseAsync(model.getObjectByName(names[1]).clone(),{binary:false,onlyVisible:true});
 const material=output.materials[0];
 assert(material.pbrMetallicRoughness.roughnessFactor===undefined||material.pbrMetallicRoughness.roughnessFactor===1,'Export roughness mismatch');
 assert(material.extensions?.KHR_materials_specular?.specularFactor===.4,'Export lost fabric specular factor');
 const original=model.getObjectByName(names[1]).material;
 assert(material.extensions.KHR_materials_sheen.sheenColorFactor.every((v,i)=>Math.abs(v-original.sheenColor.toArray()[i]*original.sheen)<1e-7),'Export changed fabric sheen energy');
 assert(output.images?.length>=3,'Export lost fabric maps');
 return {meshes:meshes.length,materials:[...materials.values()],geometry,export:{material,extensions:output.extensionsUsed,images:output.images.length},limits:'Material and export checks only; no whole-home photographic, frame-rate or installation acceptance.'};
}
