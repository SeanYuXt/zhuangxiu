import * as T from './vendor/three.module.js';

// Unselected access-first study. It does not claim to replace all clothing storage.
export function makeElderAccessTrial(model){
 const original=model.getObjectByName('bed1-bed');
 const root=new T.Group();root.name='elder-access-trial';
 const bed=original.clone(true);bed.name='bed1-bed';bed.position.set(1.820,0,3.98);bed.rotation.y=Math.PI/2;
 bed.traverse(o=>{if(o.isMesh){o.geometry=o.geometry.clone();o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();}});
 // Drop the original two floor-standing bedside tables and their lamps together.
 for(const o of bed.children.slice(6)){o.removeFromParent();o.traverse(m=>{if(m.isMesh){m.geometry.dispose();for(const mat of Array.isArray(m.material)?m.material:[m.material])mat.dispose();}});}
 const resize=(o,w,h,d)=>{o.geometry.computeBoundingBox();const size=o.geometry.boundingBox.getSize(new T.Vector3());o.scale.set(w/size.x,h/size.y,d/size.z);};
 resize(bed.children[0],1.54,.26,2.03);
 resize(bed.children[1],1.50,.23,2.00);bed.children[1].position.z=.015;
 resize(bed.children[2],1.56,.79,.03);bed.children[2].position.set(0,.755,-1.0);
 bed.userData={candidate:true,mattress:[1.5,2.0],frame:[1.54,2.03],headboard:'30 mm wall-mounted panel; anchorage unverified',productVerified:false};root.add(bed);
 const material=new T.MeshStandardMaterial({color:'#c6beaf',roughness:.76}),inner=new T.MeshStandardMaterial({color:'#b6a68d',roughness:.75});
 const box=(parent,name,x,y,z,w,h,d,mat=material)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.position.set(x,y+h/2,z);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const wardrobe=new T.Group();wardrobe.name='bed1-wardrobe';root.add(wardrobe);
 // Lower-left corner only: door faces +X. No tall cabinet in front of the window.
 const r={x0:.82,x1:1.40,z0:4.79,z1:5.37};
 box(wardrobe,'elder-cabinet-back',.829,.08,5.08,.018,2.32,.58,inner);
 for(const z of [4.799,5.361])box(wardrobe,'elder-cabinet-side',1.11,.08,z,.58,2.32,.018);
 for(const y of [.08,.45,1.95,2.382])box(wardrobe,'elder-cabinet-shelf',1.11,y,5.08,.544,.018,.544,inner);
 const rod=new T.Mesh(new T.CylinderGeometry(.012,.012,.52,16),inner);rod.rotation.x=Math.PI/2;rod.position.set(1.1,1.82,5.08);wardrobe.add(rod);
 const hinge=new T.Group();hinge.name='elder-cabinet-door';hinge.position.set(1.391,0,5.36);wardrobe.add(hinge);
 box(hinge,'elder-cabinet-door-panel',0,.1,-.28,.018,2.28,.56);
 const lampMat=new T.MeshStandardMaterial({color:'#faf3e2',emissive:'#fff0d5',emissiveIntensity:.65});
 const lamps=new T.Group();lamps.name='elder-bedhead-reading-lights';root.add(lamps);
 for(const z of [3.43,4.53]){
  box(lamps,'elder-reading-lamp',.855,1.12,z,.07,.14,.055,lampMat);
  box(lamps,'elder-local-bedside-control',.845,.88,z,.025,.06,.07);
 }
 root.userData={approved:false,people:2,bedWidth:1.5,highCabinetWidth:.58,removed:['two floor bedside tables','window desk and chair','original 1.7 m wardrobe'],storageLossWarning:'Only 580 mm tall cabinet remains; no claim of sufficient two-person clothing storage. Replacement storage outside this room is not designed.'};
 const setDoor=open=>{hinge.rotation.y=open?-Math.PI/2:0;root.updateMatrixWorld(true);};setDoor(false);
 return {root,bed,wardrobe,cabinetRect:r,setDoor,description:'两位 · 1.5 m 床；床头靠图左实墙的通行优先试排。床架 1540×2030 mm、床垫 1500×2000 mm、壁挂床头 30 mm 均为待匹配产品。移除书桌和落地床头柜；本房仅余 580 mm 高柜，不能当作两人收纳已解决。'};
}
