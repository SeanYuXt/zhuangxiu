import * as T from './vendor/three.module.js';
import {balconyDrying as spec,palette} from './design-spec.js';

// Lightweight, single-rail concept; mounting and load rating require a selected product.
export function addBalconyDrying(model){
 const g=new T.Group();g.name='balcony-drying-rack';g.position.fromArray(spec.position);g.userData={...spec,proposal:true,orientation:'衣架转向，衣物正面平行湖景玻璃；非整桶衣物容量'};model.add(g);
 const mat=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const white=mat(palette.ceiling),metal=mat('#969b95',.3,.6),line=mat('#555d58');
 const box=(p,n,x,y,z,w,h,d,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.name=n;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
 const rod=(p,n,a,b,r,m)=>{const v=new T.Vector3(...b).sub(new T.Vector3(...a));const o=new T.Mesh(new T.CylinderGeometry(r,r,v.length(),12),m);o.name=n;o.position.fromArray(a).addScaledVector(v,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());o.castShadow=true;p.add(o);return o;};
 box(g,'drying-motor-cover',0,spec.bodyY,0,spec.length+.10,.07,.18,white);
 for(const x of [-.63,.63])box(g,'drying-mount-envelope',x,spec.bodyY+.045,0,.12,.025,.11,metal);
 const moving=new T.Group();moving.name='drying-moving-rail';g.add(moving);
 rod(moving,'drying-rail',[-spec.length/2,0,0],[spec.length/2,0,0],.012,metal);
 for(const x of [-spec.length/2,spec.length/2])box(moving,'drying-end-stop',x,0,0,.016,.037,.038,white);
 const garments=new T.Group();garments.name='drying-three-garments';moving.add(garments);
 const fabricNormal=new T.TextureLoader().load('./assets/fabric-normal.jpg');fabricNormal.wrapS=fabricNormal.wrapT=T.RepeatWrapping;fabricNormal.repeat.set(2,3);
 for(let i=0;i<spec.capacity;i++){
  const x=(i-1)*.55,cloth=new T.Group();cloth.name='drying-garment-'+i;cloth.position.x=x;garments.add(cloth);
  rod(cloth,'swivel-hanger-neck',[0,-.015,0],[0,-.075,0],.004,metal);
  for(const [a,b] of [[[0,-.075,0],[-.21,-.17,0]],[[-.21,-.17,0],[.21,-.17,0]],[[.21,-.17,0],[0,-.075,0]]])rod(cloth,'swivel-hanger',a,b,.004,metal);
  const clothMat=mat(['#dfd9cd','#9fa99f','#c1b7a7'][i],.95);clothMat.side=T.DoubleSide;clothMat.normalMap=fabricNormal;clothMat.normalScale.set(.25,.25);
  const geo=new T.PlaneGeometry(spec.garmentWidth,.55,24,28),pos=geo.attributes.position;
  for(let j=0;j<pos.count;j++){const u=pos.getX(j),v=pos.getY(j);pos.setZ(j,.027*Math.sin(u*64+i)+.010*Math.sin(v*17+u*11));}geo.computeVertexNormals();
  const mesh=new T.Mesh(geo,clothMat);mesh.name='hanging-fabric-'+i;mesh.position.y=-.455;mesh.castShadow=true;mesh.receiveShadow=true;cloth.add(mesh);
  cloth.userData={width:spec.garmentWidth,conservativeDepth:spec.garmentDepth,drop:spec.garmentDrop,note:'小件/毛巾示意；床单、长衣及普通横向衣架需另核'};
 }
 const cables=[];
 for(const x of [-.65,.65]){const o=rod(g,'drying-lift-cable',[x,spec.raisedY,0],[x,spec.bodyY-.04,0],.0025,line);cables.push(o);}
 let fraction=0,loaded=false;
 function setFraction(t){fraction=T.MathUtils.clamp(t,0,1);const y=T.MathUtils.lerp(spec.raisedY,spec.loweredY,fraction),top=spec.bodyY-.04;moving.position.y=y;for(const o of cables){o.position.y=(top+y)/2;o.scale.y=(top-y)/(top-spec.raisedY);}model.updateMatrixWorld(true);}
 function setLoaded(value){loaded=Boolean(value);garments.visible=loaded;model.updateMatrixWorld(true);}
 setFraction(0);setLoaded(false);
 return {group:g,moving,garments,setFraction,setLoaded,get state(){return {fraction,loaded,railY:moving.position.y};}};
}
