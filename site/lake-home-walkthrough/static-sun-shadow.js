// Reuse a directional shadow while only the viewing camera moves.
// Furniture, door, surface or light-camera changes require a fresh map.
export function createStaticSunShadow(model,light){
 const snapshots=new WeakMap();let count=-1,revision=0,checks=0,lastLight='';
 const materialKeys=['visible','side','shadowSide','opacity','transparent','alphaTest','wireframe','displacementScale','displacementBias'];
 const textureKeys=['map','alphaMap','displacementMap'];
 const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const textureValues=t=>t?[t,t.version,t.offset.x,t.offset.y,t.repeat.x,t.repeat.y,t.rotation]:[null];
 function materialValues(m){return {material:m,values:materialKeys.map(k=>m[k]),textures:textureKeys.map(k=>textureValues(m[k]))};}
 function materialMatches(m,row){
  if(m!==row.material)return false;
  for(let i=0;i<materialKeys.length;i++)if(m[materialKeys[i]]!==row.values[i])return false;
  for(let i=0;i<textureKeys.length;i++){const t=m[textureKeys[i]],v=row.textures[i];if((t||null)!==v[0])return false;if(t&&(t.version!==v[1]||t.offset.x!==v[2]||t.offset.y!==v[3]||t.repeat.x!==v[4]||t.repeat.y!==v[5]||t.rotation!==v[6]))return false;}
  return true;
 }
 light.shadow.autoUpdate=false;light.shadow.needsUpdate=true;
 function update(){
  model.updateMatrixWorld(true);light.updateWorldMatrix(true,false);light.target.updateWorldMatrix(true,false);
  let seen=0,changed=false;
  function visit(o){
   if(!o.visible||o.isReflector||o.userData.runtimeOnly)return;
   if(o.isMesh&&o.castShadow){
    seen++;const g=o.geometry,old=snapshots.get(o),matrix=o.matrixWorld.elements,multi=Array.isArray(o.material);
    const materialCount=multi?o.material.length:1;
    let stale=o.isSkinnedMesh||o.customDepthMaterial||o.morphTargetInfluences?.length||!old||old.seenAt!==checks||old.geometry!==g||old.position!==g.attributes.position||old.positionVersion!==g.attributes.position?.version||old.normal!==g.attributes.normal||old.normalVersion!==g.attributes.normal?.version||old.uv!==g.attributes.uv||old.uvVersion!==g.attributes.uv?.version||old.index!==g.index||old.indexVersion!==g.index?.version||old.start!==g.drawRange.start||old.count!==g.drawRange.count||!same(matrix,old.matrix)||materialCount!==old.appearance.length;
    if(!stale)for(let i=0;i<materialCount;i++)if(!materialMatches(multi?o.material[i]:o.material,old.appearance[i])){stale=true;break;}
    if(stale){
     snapshots.set(o,{geometry:g,position:g.attributes.position,positionVersion:g.attributes.position?.version,normal:g.attributes.normal,normalVersion:g.attributes.normal?.version,uv:g.attributes.uv,uvVersion:g.attributes.uv?.version,index:g.index,indexVersion:g.index?.version,start:g.drawRange.start,count:g.drawRange.count,matrix:[...matrix],appearance:(multi?o.material:[o.material]).map(materialValues)});changed=true;
    }
    snapshots.get(o).seenAt=checks+1;
   }for(const child of o.children)visit(child);
  }visit(model);
  const c=light.shadow.camera,s=light.shadow;
  const lightKey=[...light.matrixWorld.elements,...light.target.matrixWorld.elements,c.left,c.right,c.top,c.bottom,c.near,c.far,c.zoom,s.mapSize.x,s.mapSize.y,s.bias,s.normalBias,s.radius].join(',');
  changed ||=seen!==count||lightKey!==lastLight;count=seen;lastLight=lightKey;checks++;
  if(changed){light.shadow.needsUpdate=true;revision++;}
  return changed;
 }
 return {light,update,get state(){return {casters:count,revision,checks,cached:!light.shadow.autoUpdate};}};
}
