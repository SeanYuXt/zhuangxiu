import * as T from './vendor/three.module.js';
import {tileCuts,tileLayout} from './tile-surfaces.js';

// Run after both bath revisions, before shared tiles. Finish only; no slab cutting.
export function refineMasterBathFloor(model){
 const shower=model.getObjectByName('bath2-shower'),floor=model.getObjectByName('800x800-straight-tile-floor');
 if(!shower||!floor?.geometry.parameters.shapes)throw Error('主卫地面基准缺失');
 if(model.getObjectByName('bath2-wet-floor-detail'))throw Error('主卫坡面重复安装');
 model.updateMatrixWorld(true);const center=shower.getWorldPosition(new T.Vector3());
 if(Math.abs(shower.rotation.y)>.0001)throw Error('主卫地面需要复核淋浴朝向');
 const x0=center.x-.52,x1=center.x+.52,z0=center.z-.475,z1=center.z+.481;
 const drainZ=center.z-.375,drainLo=drainZ-.03,drainHi=drainZ+.03,entryZ=center.z+.475,entryY=tileLayout.surfaceY,lowY=entryY-.012;
 const heightAt=z=>z>=drainHi?lowY+Math.min(1,(z-drainHi)/(entryZ-drainHi))*.012:lowY+Math.max(0,(drainLo-z)/(drainLo-z0))*.0013;
 const shape=floor.geometry.parameters.shapes.clone(),hole=new T.Path();
 [[x0,z0],[x1,z0],[x1,z1],[x0,z1]].forEach(([x,z],i)=>{const p=floor.worldToLocal(new T.Vector3(x,entryY,z));if(i)hole.lineTo(p.x,p.y);else hole.moveTo(p.x,p.y);});hole.closePath();shape.holes.push(hole);
 floor.geometry.dispose();floor.geometry=new T.ShapeGeometry(shape);
 const root=new T.Group();root.name='bath2-wet-floor-detail';model.add(root);
 const wet=new T.Group();wet.name='bath2-sloped-tile-floor';root.add(wet);
 const tile=floor.material.clone(),grout=new T.MeshStandardMaterial({color:'#bdb9b0',roughness:.94}),metal=new T.MeshStandardMaterial({color:'#929894',roughness:.3,metalness:.8}),dark=new T.MeshStandardMaterial({color:'#343d39',roughness:.75});
 const quad=(parent,name,a,b,c,d,offset,material)=>{const points=[[a,heightAt(c)+offset,c],[a,heightAt(d)+offset,d],[b,heightAt(d)+offset,d],[b,heightAt(c)+offset,c]],geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([0,1,2,0,2,3].flatMap(i=>points[i]),3));geo.setAttribute('uv',new T.Float32BufferAttribute([0,1,2,0,2,3].flatMap(i=>[points[i][0],-points[i][2]]),2));geo.computeVertexNormals();const mesh=new T.Mesh(geo,material);mesh.name=name;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const pairs=a=>a.slice(0,-1).map((v,i)=>[v,a[i+1]]),gap=tileLayout.grout/2;
 for(const [lo,hi] of [[z0,drainLo],[drainHi,entryZ],[entryZ,z1]]){
  quad(wet,'bath2-sloped-grout-bed',x0,x1,lo,hi,-tileLayout.jointRecess,grout);
  for(const [a,b] of pairs(tileCuts(x0,x1,0)))for(const [c,d] of pairs(tileCuts(lo,hi,1)))quad(wet,'bath2-cut-800-tile',a+gap,b-gap,c+gap,d-gap,0,tile);
 }
 // The baseline drain is a raised rectangle, not a real recess. Remove only its low parts.
 const removed=[];shower.traverse(o=>{if(!o.isMesh||!o.visible)return;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);if(b.max.y<.04&&b.min.x>=x0-.001&&b.max.x<=x1+.001&&b.min.z>drainZ-.05&&b.max.z<drainZ+.05)removed.push(o);});
 for(const o of removed){o.visible=false;o.name='bath2-raised-drain-baseline';}
 const box=(parent,name,x,y,z,w,h,d,material)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),material);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const drain=new T.Group();drain.name='bath2-linear-drain';root.add(drain);
 box(drain,'bath2-drain-trough-bottom',center.x,lowY-.028,drainZ,1.04,.003,.06,dark);
 for(const z of [drainLo+.002,drainHi-.002])box(drain,'bath2-drain-trough-edge',center.x,lowY-.013,z,1.04,.026,.004,metal);
 for(const x of [x0+.002,x1-.002])box(drain,'bath2-drain-trough-end',x,lowY-.013,drainZ,.004,.026,.052,metal);
 const grate=new T.Group();grate.name='bath2-removable-drain-grate';grate.position.set(center.x,lowY,drainZ);drain.add(grate);
 for(const z of [-.024,.024])box(grate,'bath2-grate-long-edge',0,-.0015,z,1.028,.003,.004,metal);
 for(let i=0;i<52;i++)box(grate,'bath2-drain-grate-bar',-.51+i*.02,-.0015,0,.012,.003,.046,metal);
 const gasket=new T.MeshStandardMaterial({color:'#ccd1ca',transparent:true,opacity:.6,roughness:.7});
 const door=model.getObjectByName('bath2-shower-door');box(door,'bath2-flexible-door-bottom-seal',-.33,.0105,0,.65,.008,.016,gasket);
 box(door,'bath2-door-inward-drip-rail',-.33,.027,-.008,.65,.012,.004,gasket);
 root.userData={scope:'饰面排水候选，不挪墙、不改淋浴占地、不凿楼板',bounds:[x0,x1,z0,z1],entryY,drainY:lowY,fall:.012/(entryZ-drainHi),run:entryZ-drainHi,drainCenter:[center.x,drainZ],drainSize:[1.04,.06],grateLift:.08,drainConnection:null,trap:null,waterproofingVerified:false,slabChanged:false,constructionVerified:false,selection:'同原排水示意中心改通长槽；实际槽长、存水弯、楼板/找平层深度及门底胶条随设备复核'};
 wet.userData={...root.userData,series:'同全屋800模数裁切，2mm细缝'};
 model.updateMatrixWorld(true);
 return {root,wet,drain,grate,removed,heightAt,setGrateLift(open){grate.position.y=lowY+(open?.08:0);model.updateMatrixWorld(true);},get state(){return {grateOpen:grate.position.y>lowY+.04};}};
}
