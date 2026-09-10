import * as T from './vendor/three.module.js';
import {RGBELoader} from './vendor/render-libs.js';
import {wallBakeUv} from './baked-wall-study.js';

// Static shell only: no cabinet doors, fabric, glazing, fixtures or mirrors.
// Every receiver keeps its positions/normals/index and gets a separate UV channel.
export function collectSurfaceReceivers(model){
 const rows=[];model.updateMatrixWorld(true);
 function visit(o,path){
  if(!o.visible)return;
  if(o.isMesh&&!Array.isArray(o.material)){
   const structuralName=/^mesh_(\d+)$/.exec(o.name);
   const isOriginalWall=(structuralName&&Number(structuralName[1])<=58)||/^window-(bed1|master|bed3)-\d+-lower-boundary$/.test(o.name);
   const wall=isOriginalWall&&o.material.name==='warm-white-paint'&&o.geometry.attributes.position.count===24;
   const floor=o.name==='800x800-cut-porcelain';
   if(wall||floor)rows.push({o,path,kind:floor?'floor':'wall'});
  }
  o.children.forEach((child,i)=>visit(child,path.concat(i)));
 }visit(model,[]);
 const walls=rows.filter(r=>r.kind==='wall'),floor=rows.filter(r=>r.kind==='floor');
 if(walls.length<35||floor.length!==1)throw Error('Expected current structural walls and one cut-tile floor');
 walls.forEach((r,i)=>{r.atlas=Math.floor(i/16);r.slot=i%16;});
 floor[0].atlas=Math.ceil(walls.length/16);floor[0].slot=0;
 return [...walls,...floor].map((r,i)=>({...r,id:'surface-'+String(i).padStart(3,'0')}));
}
export function surfaceUv(row){
 const g=row.o.geometry;g.computeBoundingBox();
 if(row.kind==='wall'){
  const local=wallBakeUv(g),values=[];
  for(let i=0;i<local.count;i++)values.push((row.slot%4+local.getX(i))/4,(Math.floor(row.slot/4)+local.getY(i))/4);
  return new T.Float32BufferAttribute(values,2);
 }
 const b=g.boundingBox,s=b.getSize(new T.Vector3()),p=g.attributes.position,values=[];
 if(s.y>.002||s.x<1||s.z<1)throw Error('Expected a flat full-house tile receiver');
 for(let i=0;i<p.count;i++)values.push(.004+.992*(p.getX(i)-b.min.x)/s.x,.004+.992*(p.getZ(i)-b.min.z)/s.z);
 return new T.Float32BufferAttribute(values,2);
}

// Runtime snapshot also guards occluders/materials, not just the receiving walls.
// Camera movement does not affect it; opening a door or changing furniture does.
export function surfaceSceneSignature(model){
 model.updateMatrixWorld(true);const rows=[];
 function digest(array){if(!array)return null;const bytes=new Uint8Array(array.buffer,array.byteOffset,array.byteLength);let h=2166136261;for(const v of bytes)h=Math.imul(h^v,16777619);return [bytes.length,h>>>0];}
 function visit(o,path){
  if(!o.visible||o.isReflector||o.userData.runtimeOnly)return;
  if(o.isMesh){const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>[m.type,m.name,m.color?.getHex(),m.emissive?.getHex(),m.emissiveIntensity,m.roughness,m.metalness,m.opacity,m.transparent,m.side,...['map','normalMap','roughnessMap','alphaMap'].map(k=>m[k]?[m[k].name,m[k].image?.width,m[k].image?.height,m[k].repeat.toArray(),m[k].offset.toArray()]:null)]);
   rows.push([path,o.name,[...o.matrixWorld.elements],digest(o.geometry.attributes.position.array),digest(o.geometry.index?.array),materials]);
  }o.children.forEach((child,i)=>visit(child,path.concat(i)));
 }visit(model,[]);return rows;
}

export async function applySurfaceLightmaps(model){
 const folder='./assets/surface-lighting-v2/',entries=[],textures=[];
 const unavailable=reason=>({entries:[],ready:true,setEnabled(){},update(){},state:{active:false,valid:false,reason}});
 try{
  const response=await fetch(folder+'manifest.json',{cache:'no-store'});
  if(!response.ok)return unavailable('Current surface lightmaps have not finished');
  const manifest=await response.json();
  if(!manifest.complete||manifest.receivers.length!==60||manifest.atlases.length!==5)return unavailable('Current surface lightmap batch is incomplete');
  const signature=JSON.stringify(surfaceSceneSignature(model));
  if(signature!==JSON.stringify(manifest.signature))return unavailable('Current geometry/materials differ from the baked scene');
  const atlasMap=new Map();
  for(const atlas of manifest.atlases){
   if(!/^atlas-\d+\.hdr$/.test(atlas.file))throw Error('Invalid surface atlas path');
   const response=await fetch(folder+atlas.file);if(!response.ok)throw Error('Surface atlas unavailable');const bytes=await response.arrayBuffer();
   const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
   if(hash!==atlas.sha256)throw Error('Surface atlas checksum differs');
   const parsed=new RGBELoader().parse(bytes);if(parsed.width!==atlas.width||parsed.height!==atlas.height)throw Error('Surface atlas size differs');
   const texture=new T.DataTexture(parsed.data,parsed.width,parsed.height,T.RGBAFormat,parsed.type);
   texture.colorSpace=T.LinearSRGBColorSpace;texture.channel=1;texture.flipY=false;texture.minFilter=texture.magFilter=T.LinearFilter;texture.needsUpdate=true;
   textures.push(texture);atlasMap.set(atlas.index,texture);
  }
  if(signature!==JSON.stringify(surfaceSceneSignature(model)))throw Error('Scene changed while surface lightmaps loaded');
  for(const row of manifest.receivers){
   let o=model;for(const i of row.path)o=o?.children[i];
   if(!o?.isMesh||o.name!==row.name||JSON.stringify([...o.geometry.attributes.position.array])!==JSON.stringify(row.positions)||row.matrixWorld.some((v,i)=>Math.abs(v-o.matrixWorld.elements[i])>1e-6))throw Error('Surface receiver changed: '+row.id);
   const texture=atlasMap.get(row.atlas);if(!texture)throw Error('Missing receiver atlas');
   const original=o.material,baked=original.clone(),geometry=o.geometry.clone();
   geometry.setAttribute('uv1',new T.Float32BufferAttribute(row.uv1,2));
   baked.name='baked-surface-'+row.id;baked.lightMap=texture;baked.lightMapIntensity=Math.PI;
   // Cycles no-color DIFFUSE contains the complete fixed diffuse response.
   // Keep PBR reflections/roughness/normal maps but do not add diffuse lighting twice.
   baked.onBeforeCompile=shader=>{
    const maps=T.ShaderChunk.lights_fragment_maps.replace('iblIrradiance += getIBLIrradiance( geometryNormal );','');
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_maps>','irradiance = vec3(0.0);\n'+maps).replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directDiffuse = vec3(0.0);');
   };
   baked.customProgramCacheKey=()=> 'full-fixed-surface-diffuse-v1';
   entries.push({o,original,baked,geometry});
  }
  for(const e of entries){e.o.geometry=e.geometry;e.o.material=e.baked;}
  const receiverEntries=new Map(entries.map(e=>[e.o,e]));
  const scalarKeys=['emissiveIntensity','opacity','transparent','roughness','metalness','side','envMapIntensity'];
  const mapKeys=['map','normalMap','roughnessMap','metalnessMap','alphaMap'];
  function copyAppearance(from,to){for(const k of ['color','emissive','normalScale'])if(from[k]&&to[k])to[k].copy(from[k]);for(const k of [...scalarKeys,...mapKeys])to[k]=from[k];}
  const appearance=m=>[m.color?.r,m.color?.g,m.color?.b,m.emissive?.r,m.emissive?.g,m.emissive?.b,m.normalScale?.x,m.normalScale?.y,...scalarKeys.map(k=>m[k]),...mapKeys.map(k=>m[k])];
  for(const e of entries)e.appearance=appearance(e.baked);
  // Allocate the reference snapshot once, not thousands of arrays every frame.
  // Do not throttle: an edited occluder must stop using the stale bake that frame.
  const guardScalarKeys=['emissiveIntensity','opacity','transparent','roughness','metalness','side','alphaTest'];
  const attributes=['position','normal','uv','uv1'];
  const snapshot=[];
  const materialSnapshots=new WeakMap();let uniqueMaterials=0;
  const textureValues=t=>t?[t.version,t.image,t.repeat.x,t.repeat.y,t.offset.x,t.offset.y,t.rotation,t.center.x,t.center.y,t.flipY,t.channel]:null;
  function materialSnapshot(m,entry){if(materialSnapshots.has(m))return materialSnapshots.get(m);const row={
   identity:entry&&m===entry.baked?entry.original:m,
   color:m.color?[m.color.r,m.color.g,m.color.b]:null,emissive:m.emissive?[m.emissive.r,m.emissive.g,m.emissive.b]:null,normalX:m.normalScale?.x,normalY:m.normalScale?.y,
   scalars:guardScalarKeys.map(k=>m[k]),maps:mapKeys.map(k=>({texture:m[k],values:textureValues(m[k])})),checkedAt:-1,checkedMaterial:null
  };materialSnapshots.set(m,row);uniqueMaterials++;return row;}
  function remember(o){
   if(!o.visible||o.isReflector||o.userData.runtimeOnly)return;
   if(o.isMesh){const entry=receiverEntries.get(o),materials=Array.isArray(o.material)?o.material:[o.material];
    snapshot.push({o,entry,geometry:o.geometry,attributes:attributes.map(k=>({attribute:o.geometry.attributes[k],version:o.geometry.attributes[k]?.version})),index:o.geometry.index,indexVersion:o.geometry.index?.version,matrix:[...o.matrixWorld.elements],materials:materials.map(m=>materialSnapshot(m,entry))});
   }for(const child of o.children)remember(child);
  }model.updateMatrixWorld(true);remember(model);
  let valid=true,requested=true,cursor=0;
  const guardStats={snapshotMeshes:snapshot.length,uniqueMaterials,checks:0,lastVisited:0};
  function sameTexture(t,row){
   if(t!==row.texture)return false;if(!t)return true;const v=row.values;
   return t.version===v[0]&&t.image===v[1]&&t.repeat.x===v[2]&&t.repeat.y===v[3]&&t.offset.x===v[4]&&t.offset.y===v[5]&&t.rotation===v[6]&&t.center.x===v[7]&&t.center.y===v[8]&&t.flipY===v[9]&&t.channel===v[10];
  }
  function sameMaterial(m,row,entry){
   if(row.checkedAt===guardStats.checks&&row.checkedMaterial===m)return true;
   if((entry&&m===entry.baked?entry.original:m)!==row.identity||!sameColor(m.color,row.color)||!sameColor(m.emissive,row.emissive)||m.normalScale?.x!==row.normalX||m.normalScale?.y!==row.normalY)return false;
   for(let i=0;i<guardScalarKeys.length;i++)if(m[guardScalarKeys[i]]!==row.scalars[i])return false;
   for(let i=0;i<mapKeys.length;i++)if(!sameTexture(m[mapKeys[i]],row.maps[i]))return false;
   row.checkedAt=guardStats.checks;row.checkedMaterial=m;return true;
  }
  function sameColor(color,row){return color?!!row&&color.r===row[0]&&color.g===row[1]&&color.b===row[2]:row===null;}
  function unchanged(o){
   if(!o.visible||o.isReflector||o.userData.runtimeOnly)return true;
   if(o.isMesh){const row=snapshot[cursor++],g=o.geometry;
    if(!row||row.o!==o||row.geometry!==g||row.index!==g.index||row.indexVersion!==g.index?.version)return false;
    for(let i=0;i<attributes.length;i++){const a=g.attributes[attributes[i]],saved=row.attributes[i];if(a!==saved.attribute||a?.version!==saved.version)return false;}
    for(let i=0;i<16;i++)if(row.matrix[i]!==o.matrixWorld.elements[i])return false;
    if(Array.isArray(o.material)){if(o.material.length!==row.materials.length)return false;for(let i=0;i<o.material.length;i++)if(!sameMaterial(o.material[i],row.materials[i],row.entry))return false;}
    else if(row.materials.length!==1||!sameMaterial(o.material,row.materials[0],row.entry))return false;
   }for(const child of o.children)if(!unchanged(child))return false;
   return true;
  }
  function setEnabled(on){requested=!!on;for(const e of entries){
   if(valid&&requested){if(e.o.material===e.original){copyAppearance(e.original,e.baked);e.o.material=e.baked;}}
   else if(e.o.material===e.baked){if(appearance(e.baked).some((v,i)=>v!==e.appearance[i]))copyAppearance(e.baked,e.original);e.o.material=e.original;}
  }}
  function update(){model.updateMatrixWorld(true);cursor=0;guardStats.checks++;const matches=unchanged(model)&&cursor===snapshot.length;guardStats.lastVisited=cursor;if(matches!==valid){valid=matches;setEnabled(requested);}}
  return {entries,manifest,textures,guardStats,ready:true,setEnabled,update,get state(){return {active:requested&&valid,valid,requested,receivers:entries.length,atlases:textures.length,source:manifest.sourceSha256};},limits:'Fixed diffuse shell only; room/furniture/fixture edits disable it, camera walking does not. No dynamic GI or phone-performance claim.'};
 }catch(error){for(const t of textures)t.dispose();return unavailable(error.message);}
}
