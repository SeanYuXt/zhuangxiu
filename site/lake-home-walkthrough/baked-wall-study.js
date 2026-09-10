import * as T from './vendor/three.module.js';
import {RGBELoader} from './vendor/render-libs.js';
export const wallBakeReceivers=['mesh_55','mesh_56'];
export function wallBakeUv(geometry){
 const p=geometry.attributes.position,n=geometry.attributes.normal;geometry.computeBoundingBox();const b=geometry.boundingBox,size=b.getSize(new T.Vector3()),values=[];
 for(let i=0;i<p.count;i++){
  const normals=[n.getX(i),n.getY(i),n.getZ(i)],axis=normals.map(Math.abs).indexOf(Math.max(...normals.map(Math.abs))),face=axis*2+(normals[axis]<0?1:0),axes=[0,1,2].filter(a=>a!==axis),xyz=[p.getX(i),p.getY(i),p.getZ(i)];
  const u=(xyz[axes[0]]-b.min.getComponent(axes[0]))/size.getComponent(axes[0]),v=(xyz[axes[1]]-b.min.getComponent(axes[1]))/size.getComponent(axes[1]);
  values.push((face%3+.025+u*.95)/3,(Math.floor(face/3)+.025+v*.95)/2);
 }
 return new T.Float32BufferAttribute(values,2);
}
export async function applyBakedWallStudy(model){
 model.updateMatrixWorld(true);
 if(model.getObjectByName('flush-sideboard')?.userData.ceilingCoordination)return {ready:true,entries:[],setEnabled(){},update(){},state:{active:false,valid:false,requested:true,reason:'Cabinet/HVAC geometry changed after this bake; regenerate full-scene source before enabling.'}};
 const folder='./assets/lightmaps-child-v2/';
 const response=await fetch(folder+'manifest.json');if(!response.ok)throw Error('No child wall bake manifest');const manifest=await response.json(),entries=[];
 for(const row of manifest.receivers){
  const o=model.getObjectByName(row.name);if(!o||JSON.stringify([...o.geometry.attributes.position.array])!==JSON.stringify(row.positions))throw Error('Baked receiver geometry drift: '+row.name);
  if(!row.matrixWorld||row.matrixWorld.some((v,i)=>Math.abs(v-o.matrixWorld.elements[i])>1e-6))throw Error('Baked wall world transform drift: '+row.name);
  const texture=await new RGBELoader().loadAsync(folder+row.file);texture.mapping=T.UVMapping;texture.channel=1;texture.flipY=false;texture.minFilter=texture.magFilter=T.LinearFilter;
  const original=o.material,geometry=o.geometry.clone();geometry.setAttribute('uv1',wallBakeUv(geometry));o.geometry=geometry;
  // Plaster-wall pilot: light map contains the fixed scene's full diffuse
  // illumination, so a basic material avoids applying hemisphere light twice.
  const baked=new T.MeshBasicMaterial({color:original.color,map:original.map,lightMap:texture,lightMapIntensity:1,side:original.side});baked.name='baked-day-wall-'+row.name;
  entries.push({o,original,baked});o.material=baked;
 }
 let requested=true,snapshot=null,valid=true;
 function setEnabled(on){requested=!!on;entries.forEach(e=>e.o.material=requested&&valid?e.baked:e.original);}
 function update(){
  model.updateMatrixWorld(true);const current=[];model.traverseVisible(o=>{if(o.isMesh&&!o.isReflector&&!o.userData.runtimeOnly)current.push(o);});
  if(!snapshot)snapshot=current.map(o=>({o,geometry:o.geometry,version:o.geometry.attributes.position?.version,matrix:[...o.matrixWorld.elements]}));
  const matches=current.length===snapshot.length&&snapshot.every((r,i)=>r.o===current[i]&&r.geometry===r.o.geometry&&r.version===r.o.geometry.attributes.position?.version&&r.matrix.every((v,k)=>v===r.o.matrixWorld.elements[k]));
  if(matches!==valid){valid=matches;setEnabled(requested);}
 }
 return {manifest,entries,setEnabled,update,ready:true,get state(){return {valid,requested,active:valid&&requested};},limits:'Two static plaster walls only. Furniture/curtain/door changes invalidate the bake; not dynamic GI or a whole-home lighting solution.'};
}
