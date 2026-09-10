import * as T from './vendor/three.module.js';

// Isolated visual study only. Not imported by the production viewer.
// World-position + corner-normal matching avoids assuming Blender kept vertex order.
export function applyFurnitureVertexPilot(model,data,{smoothCloth=false}={}){
 if(!data.complete||data.records.length!==5)throw Error('Furniture pilot incomplete');
 model.updateMatrixWorld(true);const entries=[],cell=.0001;
 const key=(x,y,z)=>`${Math.floor(x/cell)},${Math.floor(y/cell)},${Math.floor(z/cell)}`;
 for(const record of data.records){
  const candidates=[];model.traverseVisible(o=>{if(o.isMesh&&o.name===record.name)candidates.push(o);});
  if(candidates.length!==1)throw Error('Furniture receiver not unique: '+record.name);
  const o=candidates[0],p=o.geometry.attributes.position,n=o.geometry.attributes.normal,buckets=new Map();
  for(const sample of record.samples){const k=key(...sample.p);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(sample);}
  const values=[],normalMatrix=new T.Matrix3().getNormalMatrix(o.matrixWorld),point=new T.Vector3(),normal=new T.Vector3();let maxPositionError=0;
  for(let i=0;i<p.count;i++){
   point.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);normal.fromBufferAttribute(n,i).applyNormalMatrix(normalMatrix);
   const base=[point.x,point.y,point.z].map(v=>Math.floor(v/cell)),matches=[];
   for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)for(const s of buckets.get(`${base[0]+x},${base[1]+y},${base[2]+z}`)||[]){
    const error=Math.hypot(point.x-s.p[0],point.y-s.p[1],point.z-s.p[2]),dot=normal.x*s.n[0]+normal.y*s.n[1]+normal.z*s.n[2];
    if(error<cell&&dot>.9995){matches.push(s);maxPositionError=Math.max(maxPositionError,error);}
   }
   if(!matches.length)throw Error(`Unmatched baked vertex ${record.name}:${i} at ${point.toArray()} normal ${normal.toArray()}`);
   for(let c=0;c<3;c++)values.push(matches.reduce((sum,s)=>sum+s.rgb[c],0)/matches.length);
  }
  let diffuse=values;
  // Spatial/normal filtering of the isolated cloth trial, not a production bake.
  // Preserve surface sides and do not blur light across hard mattress edges.
  if(smoothCloth&&record.name==='bed3-bed-draped-duvet'){
   const radius=.12,sigma=.055,grid=new Map(),points=[],normals=[];
   for(let i=0;i<p.count;i++){
    const q=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld),v=new T.Vector3().fromBufferAttribute(n,i).applyNormalMatrix(normalMatrix);
    points.push(q);normals.push(v);const k=[q.x,q.y,q.z].map(x=>Math.floor(x/radius)).join(',');if(!grid.has(k))grid.set(k,[]);grid.get(k).push(i);
   }
   diffuse=[];
   for(let i=0;i<p.count;i++){
    const q=points[i],base=[q.x,q.y,q.z].map(x=>Math.floor(x/radius)),sum=[0,0,0];let weight=0;
    for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)for(const j of grid.get(`${base[0]+x},${base[1]+y},${base[2]+z}`)||[]){
     const distance=q.distanceToSquared(points[j]),dot=normals[i].dot(normals[j]);if(distance>radius*radius||dot<.9)continue;
     const w=Math.exp(-distance/(2*sigma*sigma))*Math.pow(dot,16);weight+=w;for(let c=0;c<3;c++)sum[c]+=values[j*3+c]*w;
    }
    for(let c=0;c<3;c++)diffuse.push(sum[c]/weight);
   }
  }
  const geometry=o.geometry.clone(),material=o.material.clone();geometry.setAttribute('fixedDiffuse',new T.Float32BufferAttribute(diffuse,3));
  material.onBeforeCompile=shader=>{
   shader.vertexShader='attribute vec3 fixedDiffuse; varying vec3 vFixedDiffuse;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFixedDiffuse = fixedDiffuse;');
   const maps=T.ShaderChunk.lights_fragment_maps.replace('iblIrradiance += getIBLIrradiance( geometryNormal );','');
   shader.fragmentShader='varying vec3 vFixedDiffuse;\n'+shader.fragmentShader.replace('#include <lights_fragment_maps>','irradiance = max(vFixedDiffuse, vec3(0.0)) * PI;\n'+maps).replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directDiffuse = vec3(0.0);');
  };material.customProgramCacheKey=()=> 'furniture-fixed-diffuse-pilot-v1';
  entries.push({o,geometry,material,originalGeometry:o.geometry,originalMaterial:o.material,vertices:p.count,maxPositionError,smoothed:diffuse!==values});
 }
 for(const e of entries){e.o.geometry=e.geometry;e.o.material=e.material;}
 return {entries,dispose(){for(const e of entries){e.o.geometry=e.originalGeometry;e.o.material=e.originalMaterial;e.geometry.dispose();e.material.dispose();}},limits:'Static five-mesh trial only. Moving furniture invalidates these values; not wired into public runtime or export.'};
}
