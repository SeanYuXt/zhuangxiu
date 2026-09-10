import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {mountSimpleBath} from './master-simple-bath.js?v=consistent-92';
import {mountCenteredDressing} from './master-centered-dressing.js?v=consistent-92';
export async function integrateAcceptedSuite(house){
 const foot=await new T.ObjectLoader().loadAsync('./accepted-foot-cabinet.json?v=accepted-93');house.getObjectByName('master-wardrobe')?.removeFromParent();foot.position.set(12.26,0,.871);house.add(foot);
 const s=await fetch('./master-window-ac-option-spec.json?v=accepted-93').then(r=>r.json());
 for(const name of ['bath2-vanity','bath2-shower','bath2-toilet','master-entry-wardrobe'])house.getObjectByName(name)?.removeFromParent();
 const scene=new T.Group();scene.name='accepted-dressing-root';scene.position.set(12.26,0,.80);house.add(scene);
 const M=c=>new T.MeshStandardMaterial({color:c,roughness:.72});
 const white=M('#f4f0e7'),metal=M('#656961'),putty=M('#c8bead'),fabric=M('#ddd5c7');
function roundedFace(name,x,y,z,w,h,d,r,mat,parent=scene){
 const sh=new T.Shape();sh.moveTo(r,0);sh.lineTo(w-r,0);sh.quadraticCurveTo(w,0,w,r);sh.lineTo(w,h-r);sh.quadraticCurveTo(w,h,w-r,h);sh.lineTo(r,h);sh.quadraticCurveTo(0,h,0,h-r);sh.lineTo(0,r);sh.quadraticCurveTo(0,0,r,0);const o=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false,curveSegments:24}),mat);o.name=name;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;
}
function box(name,r,y,h,mat=white,parent=scene,radius=.005){const dx=r[2]-r[0],dz=r[3]-r[1],o=new T.Mesh(new RoundedBoxGeometry(dx,h,dz,3,Math.min(radius,dx/3,dz/3,h/3)),mat);o.name=name;o.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function cylinder(x,y,z,r,h,mat=metal,parent=scene){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,24),mat);o.position.set(x,y+h/2,z);o.castShadow=true;parent.add(o);return o;}
function drawer(name,rr,base,height,axis,parent){
 const g=new T.Group();g.name=name;parent.add(g);const thick=.012;
 box(name+'-bottom',[rr[0]+thick,rr[1]+thick,rr[2]-thick,rr[3]-thick],base,.012,putty,g);
 for(const x of [rr[0],rr[2]-thick])box(name+'-side',[x,rr[1],x+thick,rr[3]],base,height-.01,white,g);
 for(const z of [rr[1],rr[3]-thick])box(name+'-side',[rr[0],z,rr[2],z+thick],base,height-.01,white,g);
 const fr=axis==='z'?[rr[0]-.024,rr[1]-.024,rr[2]+.024,rr[1]-.006]:[rr[2]+.001,rr[1],rr[2]+.019,rr[3]];
 box(name+'-front',fr,base,height-.006,white,g);
 box(name+'-pull',fr,base+height-.006,.006,putty,g);return g;
}

 const dressing=mountCenteredDressing({scene,s,box,roundedFace,cylinder,M,white,metal,putty,fabric,drawer});
 dressing.group.name='master-entry-wardrobe';
 dressing.group.getObjectByName('centered-curved-desktop').name='master-makeup-desk';
 const bathRoot=new T.Group();bathRoot.name='accepted-bath-root';bathRoot.position.set(12.16,0,.74);house.add(bathRoot);
 const bath=mountSimpleBath({scene:bathRoot});
 // Alias groups are targets for existing room navigation, not duplicate geometry.
 const basin=bath.group.children.find(o=>o.isGroup);if(basin)basin.name='bath2-vanity';
 const aliases=[['bath2-toilet',[.1,.3,.75,.7]],['bath2-shower',[1.15,.1,2.05,1]]];
 for(const [name,r]of aliases){const g=new T.Group();g.name=name;bath.group.add(g);for(const o of [...bath.group.children]){if(!o.isMesh)continue;const c=o.position;if(c.x>=r[0]&&c.x<=r[2]&&c.z>=r[1]&&c.z<=r[3])g.add(o);}}
 return {dressing,bath,anchors:{bath:[12.16,0,.74],dressing:[12.26,0,.80]}};
}
