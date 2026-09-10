import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {tileLayout} from './tile-surfaces.js';

// Furniture-only details. The finished floor remains the common tile datum.
// These are visible support/closure concepts, not a load-rated product assembly.
function inParent(parent,mesh){
 parent.updateWorldMatrix(true,true);mesh.geometry.computeBoundingBox();
 const relative=new T.Matrix4().copy(parent.matrixWorld).invert().multiply(mesh.matrixWorld);
 return mesh.geometry.boundingBox.clone().applyMatrix4(relative);
}
function floorInParent(parent){
 parent.updateWorldMatrix(true,false);
 const world=parent.getWorldPosition(new T.Vector3()),up=new T.Vector3(0,1,0).transformDirection(parent.matrixWorld);
 if(up.distanceTo(new T.Vector3(0,1,0))>1e-6)throw Error('Floor support requires an upright furniture parent');
 return parent.worldToLocal(new T.Vector3(world.x,tileLayout.surfaceY,world.z)).y;
}
function block(parent,name,x0,y0,z0,x1,y1,z1,material,rounded=false){
 const size=[x1-x0,y1-y0,z1-z0];if(size.some(v=>!Number.isFinite(v)||v<=0))throw Error('Invalid support dimensions: '+name);
 const geometry=rounded?new RoundedBoxGeometry(...size,2,Math.min(.0015,...size.map(v=>v/5))):new T.BoxGeometry(...size);
 const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}

export function addGroundedPlinth(parent,target,{name,inset=.018,thickness=.018}={}){
 if(!name||parent.getObjectByName(name))throw Error('Duplicate/unnamed furniture plinth');
 const bounds=inParent(parent,target),floor=floorInParent(parent),height=bounds.min.y-floor;
 if(height<.018||height>.15)throw Error('Unreviewed plinth gap for '+name+': '+height);
 const root=new T.Group();root.name=name;parent.add(root);
 const casing=new T.MeshStandardMaterial({color:'#77746b',roughness:.79}),seal=new T.MeshStandardMaterial({color:'#514f49',roughness:.96});
 casing.name='warm-grey-furniture-plinth';seal.name='furniture-floor-elastomer';
 const x0=bounds.min.x+inset,x1=bounds.max.x-inset,z0=bounds.min.z+inset,z1=bounds.max.z-inset,t=thickness,top=bounds.min.y,sealHeight=.003;
 // Four perimeter strips + internal cross rails, not a solid block in the bed box.
 const rails=[[x0,x1,z0,z0+t],[x0,x1,z1-t,z1],[x0,x0+t,z0+t,z1-t],[x1-t,x1,z0+t,z1-t]];
 const alongX=x1-x0>z1-z0,span=alongX?x1-x0:z1-z0,count=Math.max(1,Math.ceil(span/.65)-1);
 for(let i=1;i<=count;i++){
  const c=(alongX?x0:z0)+span*i/(count+1);
  rails.push(alongX?[c-t/2,c+t/2,z0+t,z1-t]:[x0+t,x1-t,c-t/2,c+t/2]);
 }
 rails.forEach(([a,b,c,d],i)=>{
  const panel=block(root,name+'-rail-'+i,a,floor+sealHeight,c,b,top,d,casing);
  panel.userData={supportRole:'bearing-rail',target:target.name};
  const gasket=block(root,name+'-gasket-'+i,a,floor,c,b,floor+sealHeight,d,seal);
  gasket.userData={supportRole:'floor-contact',target:target.name};
 });
 root.userData={detailRole:'furniture-floor-support',mechanism:'closed inset plinth with cross rails and elastomer base',target:target.name,floorY:tileLayout.surfaceY,height,inset,railThickness:t,sealHeight,constructionVerified:false,loadRating:null,rails:rails.length,originalTargetBounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}};
 return root;
}

export function groundVerticalLeg(mesh,{name,round=false}={}){
 if(!name||mesh.parent.getObjectByName(name))throw Error('Duplicate/unnamed floor glide');
 const parent=mesh.parent,bounds=inParent(parent,mesh),floor=floorInParent(parent),padHeight=.004;
 if(Math.abs(mesh.rotation.x)>1e-6||Math.abs(mesh.rotation.z)>1e-6)throw Error('Only vertical legs/panels are covered');
 const oldBottom=bounds.min.y,oldTop=bounds.max.y,newBottom=floor+padHeight;
 if(oldBottom-newBottom<-.00001||oldBottom-floor>.08)throw Error('Unreviewed leg gap for '+name);
 // Extend the existing shaft downward; retain its top joint and furniture height.
 const oldCenter=(oldTop+oldBottom)/2,newCenter=(oldTop+newBottom)/2;
 mesh.scale.y*=(oldTop-newBottom)/(oldTop-oldBottom);mesh.position.y+=newCenter-oldCenter;
 mesh.userData={...mesh.userData,groundedLeg:true,originalBottom:oldBottom,originalTop:oldTop};
 const material=new T.MeshStandardMaterial({color:'#585a53',roughness:.96});material.name='replaceable-nonmarking-foot-glide';
 let pad;
 if(round){
  const radius=(bounds.max.x-bounds.min.x)/2;
  pad=new T.Mesh(new T.CylinderGeometry(radius,radius,padHeight,20),material);pad.position.set((bounds.min.x+bounds.max.x)/2,floor+padHeight/2,(bounds.min.z+bounds.max.z)/2);parent.add(pad);
 }else pad=block(parent,name,bounds.min.x,floor,bounds.min.z,bounds.max.x,newBottom,bounds.max.z,material,true);
 pad.name=name;pad.castShadow=true;pad.receiveShadow=true;
 pad.userData={detailRole:'furniture-floor-glide',supportRole:'floor-contact',target:mesh.name,floorY:tileLayout.surfaceY,padHeight,originalBottom:oldBottom,originalTop:oldTop,productVerified:false};
 parent.updateMatrixWorld(true);return pad;
}
