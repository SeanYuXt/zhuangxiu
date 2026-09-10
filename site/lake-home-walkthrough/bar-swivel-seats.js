import * as T from './vendor/three.module.js';
import {finishWoodPanel} from './cabinet-finishes.js';
import {wovenFabricMaterial} from './textile-details.js?v=matte-fabric-2';

// Low-back counter-chair proposal: keep the seat size/height, add a visible
// swivel bearing and grounded base. A concept, not a selected/load-rated product.
export function refineBarSeats(model){
 const seats=[];
 for(const side of ['left','right'])for(const stool of model.getObjectByName('lake-bar-'+side).children.filter(o=>o.name.startsWith('upholstered-counter-stool'))){
  if(stool.userData.swivelSeat)throw Error('Bar seat already refined');
  const original=[...stool.children];if(original.length!==8)throw Error('Re-audit imported stool components');
  const [pan,seat,back]=original.slice(5);if(!pan.isMesh||!seat.isMesh||!back.isMesh)throw Error('Unexpected stool upholstery');
  const metal=new T.MeshStandardMaterial({name:'bar-seat-satin-graphite',color:'#424943',metalness:.65,roughness:.42});
  const rubber=new T.MeshStandardMaterial({name:'bar-seat-foot-pad',color:'#4b4e48',roughness:.95});
  const base=new T.Group();base.name=stool.name+'-fixed-base';stool.add(base);
  const add=(parent,name,g,m,x,y,z)=>{const o=new T.Mesh(g,m);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
  const cylinder=(parent,name,r,h,y,m)=>add(parent,name,new T.CylinderGeometry(r,r,h,40),m,0,y,0);
  original.slice(0,6).forEach(o=>o.removeFromParent());
  for(const xx of [-1,1])for(const zz of [-1,1]){
   const a=new T.Vector3(xx*.155,.02,zz*.155),b=new T.Vector3(xx*.125,.573,zz*.125),leg=add(base,'swivel-leg',new T.CylinderGeometry(.011,.016,a.distanceTo(b),20),metal,0,0,0);
   leg.position.copy(a).add(b).multiplyScalar(.5);leg.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());
   add(base,'swivel-floor-pad',new T.CylinderGeometry(.018,.018,.018,24),rubber,a.x,.015,a.z);
  }
  const ringRadius=Math.SQRT2*(.155-(.24-.02)/(.573-.02)*.03),ring=add(base,'swivel-foot-ring',new T.TorusGeometry(ringRadius,.008,12,64),metal,0,.24,0);ring.rotation.x=Math.PI/2;
  cylinder(base,'swivel-fixed-mount',.135,.008,.577,metal);
  cylinder(base,'swivel-bearing',.05,.016,.589,metal);
  const upper=new T.Group();upper.name=stool.name+'-rotating-seat';stool.add(upper);upper.add(seat,back);
  const seatPan=cylinder(upper,'swivel-oak-seat-pan',.195,.020,.607,new T.MeshStandardMaterial());finishWoodPanel(seatPan);
  for(const x of [-.10,.10]){
   const curve=new T.CatmullRomCurve3([[x,.605,.145],[x,.62,.177],[x,.685,.193],[x,.745,.189]].map(p=>new T.Vector3(...p)));
   add(upper,'swivel-back-support',new T.TubeGeometry(curve,24,.007,8,false),metal,0,0,0);
  }
  for(const part of [seat,back]){
   // Physical planar UV for the top/front; rounded edge transitions are shading
   // approximations, not a manufacturer's fabric cutting pattern.
   part.geometry=part.geometry.clone();const p=part.geometry.attributes.position,n=part.geometry.attributes.normal,uv=[];
   part.updateMatrix();const normalMatrix=new T.Matrix3().getNormalMatrix(part.matrix);
   for(let i=0;i<p.count;i++){
    const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(part.matrix),normal=new T.Vector3().fromBufferAttribute(n,i).applyMatrix3(normalMatrix).normalize();
    if(Math.abs(normal.y)>.6)uv.push(v.x,v.z);else if(Math.abs(normal.z)>.6)uv.push(v.x,v.y);else uv.push(v.z,v.y);
   }
   part.geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));part.material=wovenFabricMaterial(part===seat?'#d4cbbc':'#9a9f91',1,1);part.name=part===seat?'swivel-seat-upholstery':'swivel-back-upholstery';
  }
  stool.userData.swivelSeat={seatHeight:.6995,seatWidth:.425,seatDepth:.420,axis:'y',returnAngle:0,exitAngle:Math.PI/2,baseFloor:.006,selectedProduct:false,loadRating:null,pinchProtectionVerified:false};
  seats.push({stool,upper,base});
 }
 return {seats,set(stool,angle){const entry=seats.find(s=>s.stool===stool);if(!entry)throw Error('Unknown swivel stool');entry.upper.rotation.y=angle;stool.updateMatrixWorld(true);}};
}
