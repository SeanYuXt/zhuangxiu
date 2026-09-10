import * as T from './vendor/three.module.js';

// One attributed finish for explicitly selected wood panels, never a colour-
// based whole-scene replacement. The 500mm texture patch is a design scale.
const loader=new T.TextureLoader(),maps={},jobs=[];
for(const kind of ['color','normal','rough']){
 let resolve,reject;const ready=new Promise((ok,fail)=>{resolve=ok;reject=fail;});jobs.push(ready);
 const t=loader.load('./assets/white_oak_veneer-'+kind+'.jpg',resolve,undefined,reject);
 t.name='white-oak-'+kind;t.colorSpace=kind==='color'?T.SRGBColorSpace:T.NoColorSpace;
 t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,2);t.anisotropy=8;maps[kind]=t;
}
export const cabinetFinishesReady=Promise.all(jobs);

export function finishWoodPanel(mesh,{interior=mesh.userData.woodFinish?.interior??false,refresh=false}={}){
 if(mesh.userData.woodFinish&&!refresh)return mesh;
 if(!mesh.isMesh||Array.isArray(mesh.material))throw Error('Wood finish requires one panel material');
 mesh.updateWorldMatrix(true,false);const geometry=mesh.userData.woodFinish?mesh.geometry:mesh.geometry.clone(),p=geometry.attributes.position,n=geometry.attributes.normal;
 geometry.computeBoundingBox();const dimensions=geometry.boundingBox.getSize(new T.Vector3()).toArray();
 const scale=[0,1,2].map(i=>new T.Vector3().setFromMatrixColumn(mesh.matrixWorld,i).length()),size=dimensions.map((s,i)=>s*scale[i]);
 const directions=[0,1,2].map(face=>[0,1,2].filter(a=>a!==face).sort((a,b)=>size[b]-size[a]));
 const origin=mesh.getWorldPosition(new T.Vector3());const offset=mesh.userData.woodFinish?.offset??((Math.abs(origin.x*17+origin.y*31+origin.z*7))%1)*.5,uv=[];
 for(let i=0;i<p.count;i++){
  const normal=[Math.abs(n.getX(i)),Math.abs(n.getY(i)),Math.abs(n.getZ(i))],face=normal.indexOf(Math.max(...normal)),[grain,cross]=directions[face],point=[p.getX(i),p.getY(i),p.getZ(i)];
  uv.push(point[cross]*scale[cross]+offset,point[grain]*scale[grain]);
 }
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 const material=mesh.userData.woodFinish?mesh.material:new T.MeshStandardMaterial({name:interior?'white-oak-cabinet-interior':'white-oak-sealed-veneer',color:interior?'#eee6da':'#ffffff',map:maps.color,normalMap:maps.normal,roughnessMap:maps.rough,normalScale:new T.Vector2(.09,.09),roughness:1,metalness:0,envMapIntensity:.5});
 material.userData={surface:'white oak veneer reference',asset:'white_oak_veneer',license:'CC0',texturePatchMetres:[.5,.5],uvUnits:'metres',selectedProduct:false,moistureRatingVerified:false};
 mesh.geometry=geometry;mesh.material=material;
 mesh.userData.woodFinish={asset:'white_oak_veneer',interior,grainAxesByFace:directions.map(d=>d[0]),sizeAtApplication:size,offset,geometryPositionsUnchanged:true};
 return mesh;
}
