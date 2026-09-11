import * as T from './vendor/three.module.js';
import {balconyLayout} from './balcony-layout-spec.js?v=balcony-right-utility-3';
const spec=balconyLayout.drying;

export function addBalconyDrying(model){
 const g=new T.Group();g.name='balcony-drying-rack';g.position.fromArray(spec.position);g.userData={...spec,proposal:true,orientation:'双杆沿湖景玻璃；衣架横向正常悬挂。12件示意，非额定容量'};model.add(g);
 const mat=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const white=mat('#e9e8e1'),metal=mat('#969b95',.3,.6),line=mat('#555d58');
 const box=(p,n,x,y,z,w,h,d,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.name=n;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
 const rod=(p,n,a,b,r,m)=>{const v=new T.Vector3(...b).sub(new T.Vector3(...a));const o=new T.Mesh(new T.CylinderGeometry(r,r,v.length(),12),m);o.name=n;o.position.fromArray(a).addScaledVector(v,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());o.castShadow=true;p.add(o);return o;};
 box(g,'drying-motor-cover',0,spec.bodyY,0,1.20,.075,.22,white);
 for(const x of [-.48,.48])box(g,'drying-ceiling-mount',x,(2.80+spec.bodyY)/2,0,.08,2.80-spec.bodyY,.08,metal);
 const moving=new T.Group();moving.name='drying-moving-rail';g.add(moving);
 for(const z of [-spec.railSpacing/2,spec.railSpacing/2])rod(moving,'drying-rail',[-spec.length/2,0,z],[spec.length/2,0,z],.012,metal);
 for(const x of [-.83,.83])rod(moving,'drying-cross-support',[x,0,-spec.railSpacing/2],[x,0,spec.railSpacing/2],.009,metal);
 const garments=new T.Group();garments.name='drying-twelve-garments';moving.add(garments);
 const normal=new T.TextureLoader().load('./assets/fabric-normal.jpg');normal.wrapS=normal.wrapT=T.RepeatWrapping;normal.repeat.set(2,3);
 for(let i=0;i<spec.capacity;i++){
  const row=Math.floor(i/6),index=i%6,cloth=new T.Group();cloth.name='drying-garment-'+i;cloth.position.set(-.75+index*.30,0,(row-.5)*spec.railSpacing);garments.add(cloth);
  rod(cloth,'hanger-neck',[0,-.01,0],[0,-.07,0],.004,metal);
  for(const [a,b] of [[[0,-.07,0],[0,-.17,-.21]],[[0,-.17,-.21],[0,-.17,.21]],[[0,-.17,.21],[0,-.07,0]]])rod(cloth,'hanger',a,b,.004,metal);
  const length=i===4?.91:.60+(i%3)*.045,m=mat(['#d9d5c9','#9aa59b','#b8b2a5','#dfdcd3'][i%4],.95);m.side=T.DoubleSide;m.normalMap=normal;m.normalScale.set(.22,.22);
  const geo=new T.PlaneGeometry(spec.garmentWidth,length,18,22),pos=geo.attributes.position;
  for(let j=0;j<pos.count;j++){const u=pos.getX(j),v=pos.getY(j);pos.setZ(j,.023*Math.sin(u*62+i)+.008*Math.sin(v*16));}geo.computeVertexNormals();
  const mesh=new T.Mesh(geo,m);mesh.name='hanging-fabric-'+i;mesh.rotation.y=Math.PI/2;mesh.position.y=-.18-length/2;mesh.castShadow=true;mesh.receiveShadow=true;cloth.add(mesh);
  cloth.userData={width:spec.garmentWidth,drop:.18+length,thickness:spec.garmentThickness,simulation:'静态悬挂布面；不代表晾干时间或额定承重'};
 }
 const cables=[];
 for(const x of [-.48,.48]){const o=rod(g,'drying-lift-cable',[x,spec.raisedY,0],[x,spec.bodyY-.04,0],.0025,line);cables.push(o);}
 let fraction=0,loaded=false;
 function setFraction(t){fraction=T.MathUtils.clamp(t,0,1);const y=T.MathUtils.lerp(spec.raisedY,spec.loweredY,fraction),top=spec.bodyY-.04;moving.position.y=y;for(const o of cables){o.position.y=(top+y)/2;o.scale.y=(top-y)/(top-spec.raisedY);}model.updateMatrixWorld(true);}
 function setLoaded(value){loaded=Boolean(value);garments.visible=loaded;model.updateMatrixWorld(true);}
 setFraction(0);setLoaded(false);
 return {group:g,moving,garments,setFraction,setLoaded,get state(){return {fraction,loaded,railY:moving.position.y};}};
}
