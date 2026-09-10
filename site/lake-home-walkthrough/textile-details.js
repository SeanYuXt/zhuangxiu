import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/render-libs.js';
import {calibrateFabricMaps,fabricReflectance} from './fabric-calibration.js';

// Metre-scale sewn surfaces shared by WebGL and the exported GLB. No room scaling.
const loader=new T.TextureLoader(),loads=[];
const scanSpecs={sheet:{id:'terlenka',size:[.265708,.26630]},knit:{id:'cotton_jersey',size:[.263603,.26380]}};
const scans=Object.fromEntries(Object.entries(scanSpecs).map(([key,spec])=>[key,{...spec,maps:Object.fromEntries(['color','normal','rough'].map(kind=>{
 let resolve,reject;loads.push(new Promise((a,b)=>{resolve=a;reject=b;}));const t=loader.load('./assets/'+spec.id+'-'+kind+'.jpg',resolve,undefined,reject);t.name=spec.id+'-'+kind;t.colorSpace=kind==='color'?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return [kind,t];
 }))}]));
let pillowLibrary;
const pillowReady=new GLTFLoader().loadAsync('./assets/throw-pillows/throw_pillows_01.gltf').then(asset=>{
 pillowLibrary=['throw_pillows_01_pillow02','throw_pillows_01_pillow01'].map(name=>{const mesh=asset.scene.getObjectByName(name);if(!mesh?.isMesh)throw Error('靠包几何素材缺失');return mesh.geometry;});
});
export const textilesReady=Promise.all([...loads,pillowReady]).then(()=>{
 for(const scan of Object.values(scans)){
  const calibrated=calibrateFabricMaps(scan.maps.color,scan.maps.rough);
  scan.maps.color=calibrated.color;scan.maps.rough=calibrated.rough;scan.calibration=calibrated.audit;
 }
});
const materialCache=new Map();
function fabric(color,w,d,kind='sheet'){
 const key=[color,w,d,kind].join(':');if(materialCache.has(key))return materialCache.get(key);
 const scan=scans[kind],maps=Object.fromEntries(Object.entries(scan.maps).map(([key,source])=>{const t=source.clone();t.repeat.set(w/scan.size[0],d/scan.size[1]);return [key,t];}));
 const tint=new T.Color(color).multiplyScalar(1/fabricReflectance);
 const material=new T.MeshPhysicalMaterial({name:'textile-woven-'+kind+'-'+color.replace('#',''),color:tint,roughness:1,metalness:0,ior:1.45,specularIntensity:.4,
  map:maps.color,roughnessMap:maps.rough,normalMap:maps.normal,normalScale:new T.Vector2(kind==='knit'?.32:.20,kind==='knit'?.32:.20),sheen:1,sheenColor:new T.Color(color).multiplyScalar(.15),sheenRoughness:1});
 // This vendored exporter writes sheenColor but omits Three's scalar sheen.
 // Encode the same product in the colour so runtime and glTF carry equal energy.
 material.userData={surface:'matte recoloured fabric scan',asset:scan.id,scanSizeMetres:scan.size,patchMetres:[w,d],designColor:color,sheenStrength:.15,calibration:scan.calibration,license:'CC0',productSelected:false};materialCache.set(key,material);return material;
}
// Share the same local, metre-calibrated scan without another texture download.
export function wovenFabricMaterial(color,width,height){return fabric(color,width,height,'sheet');}
function mesh(parent,name,geometry,material){
 const o=new T.Mesh(geometry,material);o.name=name;o.castShadow=true;o.receiveShadow=true;
 o.userData.detailRole='sewn-textile';parent.add(o);return o;
}
function seam(parent,name,points,material,radius=.0013){
 const curve=new T.CatmullRomCurve3(points,true,'centripetal');
 return mesh(parent,name,new T.TubeGeometry(curve,128,radius,4,true),material);
}
function gridSurface(nx,nz,position){
 const vertices=[],uv=[],indices=[];
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
  vertices.push(...position(i/nx,j/nz));uv.push(i/nx,j/nz);
 }
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;indices.push(a,c,b,b,c,d);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
 g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
const gaussian=(x,s)=>Math.exp(-x*x/(s*s));
function cushionPoint(u,v,w,d,h,seed,sign=1,bedPillow=false){
 const edge=Math.max(0,(1-u*u)*(1-v*v));
 const x=w*.5*u*(1-.085*Math.pow(Math.abs(v),10));
 const z=d*.5*v*(1-.085*Math.pow(Math.abs(u),10));
 const bulge=h*.5*Math.pow(edge,bedPillow?.34:.52);
 // Small localized gathers die off before the centre, not a uniformly rippled pillow.
 const shift=.09*Math.sin(seed*1.7);
 const gather=-.011*gaussian(v+.46+shift+.2*(1-Math.abs(u)),.055)*gaussian(u+.82,.22)
  -.005*gaussian(v-.23+shift-.3*(1-Math.abs(u)),.06)*gaussian(u-.83,.20)
  -.008*gaussian(u+.27+shift,.06)*gaussian(v+.81,.20)
  -.006*gaussian(v-.57+.28*u,.065)*gaussian(u-.75,.25)
  -.007*gaussian(u-.37-.23*v,.07)*gaussian(v-.77,.27);
 return [x,sign*Math.max(0,bulge+gather*Math.pow(edge,.35)),z];
}
export function sewnCushion(name,w,d,h,color,seed=1,kind='sheet',bedPillow=false){
 if(bedPillow)return foldedBedPillow(name,w,d,h,color,seed);
 const group=new T.Group();group.name=name;group.userData={detailRole:'sewn-cushion',dimensions:[w,h,d]};
 const material=fabric(color,w,d,kind);
 for(const sign of [1,-1]){
  const g=gridSurface(36,24,(a,b)=>cushionPoint(a*2-1,b*2-1,w,d,h,seed,sign,bedPillow));
  if(sign<0){const idx=g.index.array;for(let i=0;i<idx.length;i+=3)[idx[i+1],idx[i+2]]=[idx[i+2],idx[i+1]];g.computeVertexNormals();}
  mesh(group,name+(sign>0?'-top':'-underside'),g,material);
 }
 const points=[];
 for(let side=0;side<4;side++)for(let i=0;i<24;i++){
  const t=i/24*2-1,[u,v]=[[-1,t],[t,1],[1,-t],[-t,-1]][side];
  points.push(new T.Vector3(...cushionPoint(u,v,w,d,h,seed,1,bedPillow)));
 }
 seam(group,name+'-piped-seam',points,material);
 return group;
}
function foldedBedPillow(name,w,d,h,color,seed){
 if(!pillowLibrary)throw Error('枕套几何尚未就绪');
 const sourceIndex=Math.abs(seed)%2,geometry=pillowLibrary[sourceIndex].clone();geometry.center();
 const p=geometry.attributes.position,cov=Array.from({length:3},()=>[0,0,0]);
 for(let i=0;i<p.count;i++){const a=[p.getX(i),p.getY(i),p.getZ(i)];for(let r=0;r<3;r++)for(let c=0;c<3;c++)cov[r][c]+=a[r]*a[c]/p.count;}
 const multiply=v=>new T.Vector3(...cov.map(row=>row[0]*v.x+row[1]*v.y+row[2]*v.z));
 const widthAxis=new T.Vector3(1,.3,.1).normalize();for(let i=0;i<48;i++)widthAxis.copy(multiply(widthAxis).normalize());
 if(widthAxis.x<0)widthAxis.negate();
 const depthAxis=new T.Vector3(0,0,1);depthAxis.addScaledVector(widthAxis,-depthAxis.dot(widthAxis)).normalize();
 for(let i=0;i<48;i++){const next=multiply(depthAxis);depthAxis.copy(next.addScaledVector(widthAxis,-next.dot(widthAxis)).normalize());}
 if(depthAxis.z<0)depthAxis.negate();const upAxis=new T.Vector3().crossVectors(depthAxis,widthAxis).normalize();
 // The source throw cushions are posed at an angle. Align their principal
 // fabric axes before fitting a rectangular bed-pillow cover; don't flatten
 // the original mesh's world Y coordinate and erase the modeled folds.
 for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i);p.setXYZ(i,v.dot(widthAxis),v.dot(upAxis),v.dot(depthAxis));}
 geometry.center();geometry.computeBoundingBox();const size=geometry.boundingBox.getSize(new T.Vector3());geometry.scale(w/size.x,h/size.y,d/size.z);geometry.computeVertexNormals();
 const uv=[];for(let i=0;i<p.count;i++)uv.push(p.getX(i)/w+.5,p.getZ(i)/d+.5);geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 const group=new T.Group();group.name=name;group.userData={detailRole:'sewn-cushion',dimensions:[w,h,d],asset:'throw_pillows_01',sourceIndex,license:'CC0',adaptation:'principal-axis cover fitting; illustrative pillow dimensions, not a selected product'};
 mesh(group,name+'-folded-cover',geometry,fabric(color,w,d));return group;
}
function referenceCushion(name,index,color){
 if(!pillowLibrary)throw Error('靠包素材尚未就绪');
 const geometry=pillowLibrary[index].clone();geometry.center();geometry.scale(.85,.85,.85);geometry.computeBoundingBox();
 const size=geometry.boundingBox.getSize(new T.Vector3()),p=geometry.attributes.position,uv=[];
 for(let i=0;i<p.count;i++)uv.push(p.getX(i)/size.x+.5,p.getZ(i)/size.z+.5);
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 const root=new T.Group();root.name=name;root.userData={detailRole:'reference-cushion',asset:'throw_pillows_01',sourceIndex:index,uniformScale:.85,dimensions:[size.x,size.y,size.z],material:'neutral cotton jersey',license:'CC0'};
 mesh(root,name+'-folded-cover',geometry,fabric(color,size.x,size.z,'knit'));return root;
}
function duvet(parent,name,width,length,top,centerZ,color,seed,mattress){
 if(!mattress?.isMesh)throw Error('Duvet requires the actual mattress surface');
 const bendStart=width/2-.038,bendRadius=.044,sideDrop=.120,halfCloth=bendStart+bendRadius*Math.PI/2+sideDrop,clothWidth=halfCloth*2;
 const mat=fabric(color,clothWidth,length),under=mat.clone();under.color.multiplyScalar(.96);
 // Build in the bedding parent's coordinates. The detached ray target shares
 // the actual mattress geometry but never becomes another scene object.
 parent.updateWorldMatrix(true,false);mattress.updateWorldMatrix(true,false);
 const probeMat=new T.MeshBasicMaterial({side:T.DoubleSide}),probe=new T.Mesh(mattress.geometry,probeMat);
 probe.matrixAutoUpdate=false;probe.matrix.multiplyMatrices(parent.matrixWorld.clone().invert(),mattress.matrixWorld);probe.updateMatrixWorld(true);
 const ray=new T.Raycaster(),supportCache=new Map();
 function supportY(x,z){const key=x.toFixed(7)+':'+z.toFixed(7);if(!supportCache.has(key)){
  ray.set(new T.Vector3(x,top+1,z),new T.Vector3(0,-1,0));ray.far=3;const hit=ray.intersectObject(probe,false)[0];supportCache.set(key,hit?hit.point.y:null);
 }return supportCache.get(key);}
 // Sample the bend densely rather than stretching two edge quads into a skirt.
 function side(a){const q=Math.abs(a*2-1),sign=a<.5?-1:1;let x,y,theta,arc;
  if(q<=.70){x=q/.70*bendStart;y=top+.0015;theta=0;arc=x;}
  else if(q<=.85){theta=(q-.70)/.15*Math.PI/2;x=bendStart+bendRadius*Math.sin(theta);y=top+.0015-bendRadius*(1-Math.cos(theta));arc=bendStart+bendRadius*theta;}
  else{theta=Math.PI/2;x=bendStart+bendRadius;y=top+.0015-bendRadius-sideDrop*(q-.85)/.15;arc=bendStart+bendRadius*Math.PI/2+sideDrop*(q-.85)/.15;}
  return {x:sign*x,y,normal:[sign*Math.sin(theta),Math.cos(theta),0],uv:.5+sign*arc/clothWidth};
 }
 const sample=(a,b,loft=true)=>{
  const edge=side(a),x=edge.x,v=b*2-1,u=T.MathUtils.clamp(x/(width/2),-1,1),z=centerZ+v*length/2,support=supportY(x,z);
  const base=support===null?edge.y:Math.max(edge.y,support+.0015);
  const folds=.008*Math.sin(u*11+v*4+seed)*Math.sin(v*5-seed)
   +.013*gaussian(u-.35*Math.sin(v*3+seed),.13)*Math.sin(v*6+.6)
   +.006*gaussian(v+.65,.14)*Math.sin(u*18+seed)
   +.019*gaussian(u+.36+.13*v+.08*Math.sin(v*4),.055)*gaussian(v-.15,.55)
   -.009*gaussian(u+.29+.13*v+.08*Math.sin(v*4),.035)*gaussian(v-.15,.55)
   +.013*gaussian(v-.37+.23*u,.055)*gaussian(u-.45,.40)
   -.007*gaussian(v-.43+.23*u,.035)*gaussian(u-.45,.40);
  const envelope=(1-Math.pow(Math.abs(u),8))*(1-Math.pow(Math.abs(v),8));
  const fill=.043*envelope*(1+.22*Math.sin(3*u+seed)*Math.sin(4*v-.4));
  const thickness=Math.max(.006,.006+fill+folds*envelope);
  return [x+(loft?edge.normal[0]*thickness:0),base+(loft?edge.normal[1]*thickness:0),z];
 };
 function clothGrid(nx,ny,sampler){const geometry=gridSurface(nx,ny,sampler),uv=geometry.attributes.uv;for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)uv.setX(j*(nx+1)+i,side(i/nx).uv);return geometry;}
 const topMesh=mesh(parent,name,clothGrid(80,40,sample),mat);topMesh.userData={...topMesh.userData,width:width+.024,clothWidth,sideDrop:bendRadius+sideDrop,support:'actual mattress mesh; static fitted drape, not cloth simulation'};
 const lower=clothGrid(80,40,(a,b)=>sample(a,b,false));
 const index=lower.index.array;for(let i=0;i<index.length;i+=3)[index[i+1],index[i+2]]=[index[i+2],index[i+1]];lower.computeVertexNormals();
 mesh(parent,name+'-lining',lower,under);
 const boundary=[],innerBoundary=[];for(let edge=0;edge<4;edge++)for(let i=0;i<80;i++){
  const t=i/80,[a,b]=[[0,t],[t,1],[1,1-t],[1-t,0]][edge];boundary.push(new T.Vector3(...sample(a,b)));innerBoundary.push(new T.Vector3(...sample(a,b,false)));
 }
 seam(parent,name+'-bound-edge',boundary,mat,.0013);
 // Close the thickness at the hem rather than leaving a zero-thickness sheet.
 const vertices=[],indices=[];boundary.forEach((p,i)=>vertices.push(...p.toArray(),...innerBoundary[i].toArray()));
 for(let i=0;i<boundary.length;i++){const a=i*2,b=((i+1)%boundary.length)*2;indices.push(a,b,a+1,b,b+1,a+1);}
 const edge=new T.BufferGeometry();edge.setAttribute('position',new T.Float32BufferAttribute(vertices,3));edge.setIndex(indices);edge.computeVertexNormals();
 const edgeMat=mat.clone();edgeMat.side=T.DoubleSide;mesh(parent,name+'-hem',edge,edgeMat);
 // Turned-back upper cuff: folds follow the same cloth surface, with a soft rolled lip.
 const cuff=clothGrid(80,14,(a,b)=>{const p=sample(a,b*.16),normal=side(a).normal,lift=.001+.012*Math.pow(Math.sin(b*Math.PI),.7)*(1-.5*Math.pow(Math.abs(a*2-1),8))*normal[1];return p.map((n,i)=>n+normal[i]*lift);});
 const cuffMat=fabric('#ddd6c8',clothWidth,length*.16);cuffMat.side=T.DoubleSide;mesh(parent,name+'-turned-cuff',cuff,cuffMat);probeMat.dispose();
}
export function addBedding(parent,{name,width,lengthScale=1,centerZ=0,mattressTop=.59,seed=1,color='#b5ac9c',mattress}){
 const root=new T.Group();root.name=name+'-textile-detail';parent.add(root);
 // Keep the duvet inside the thin bed-frame width; it never widens a passage.
 duvet(root,name+'-draped-duvet',width,1.44*lengthScale,mattressTop,centerZ+.24*lengthScale,color,seed,mattress);
 const pillowWidth=width>1.3?Math.min(.68,width*.43):.73;
 const xs=width>1.3?[-width/4,width/4]:[0];
 xs.forEach((x,i)=>{
  const p=sewnCushion(name+'-sewn-pillow-'+i,pillowWidth,.44,.20,'#e5dfd3',seed+i,'sheet',true);
  p.position.set(x,mattressTop+.10,centerZ-.64*lengthScale);p.rotation.y=i?-.045:.025;root.add(p);
 });
 return root;
}
export function refineMasterBedding(bed){
 if(bed.getObjectByName('master-bed-textile-detail'))return;
 // The unchanged imported first three parts are frame, mattress, headboard.
 const mattress=bed.children[1];if(!mattress?.isMesh)throw Error('Missing mattress for textile detail');
 const original=bed.children.slice(3,6);if(original.length!==3)throw Error('Master bedding baseline changed');
 original.forEach(o=>{o.visible=false;o.name='master-bedding-baseline-'+o.id;});
 mattress.geometry.computeBoundingBox();const bounds=mattress.geometry.boundingBox.clone().applyMatrix4(mattress.matrix);
 addBedding(bed,{name:'master-bed',width:1.8,centerZ:(bounds.min.z+bounds.max.z)/2,mattressTop:bounds.max.y,color:'#b5ac9c',seed:2,mattress});
}
export function refineSofa(sofa){
 if(sofa.userData.textileDetail)return;
 const old=sofa.children.slice(0,8);if(old.length!==8||old.some(o=>!o.isMesh))throw Error('Sofa baseline changed');
 // Preserve the base, arm/back outline and 2600mm overall length.
 for(const i of [2,3,6,7])old[i].visible=false;
 for(const [i,x] of [-.7,.7].entries()){
  const seat=sewnCushion('sofa-sewn-seat-'+i,1.37,.65,.18,'#d6cfc0',i+1,'knit');seat.position.set(x,.41,.06);sofa.add(seat);
  seat.traverse(o=>{if(o.isMesh)o.material=fabric('#d6cfc0',1.37*sofa.scale.x,.65,'knit');});
 }
 for(const [i,x] of [-.87,.85].entries()){
  const p=referenceCushion('sofa-sewn-scatter-'+i,i,i?'#a8967f':'#959a8d');
  p.position.set(x,.71,-.17);p.rotation.x=Math.PI/2-.15;p.scale.x=1/sofa.scale.x;sofa.add(p);
  // Compensate the sofa's existing width scale; keep the imported pillow uniformly scaled.
  sofa.updateWorldMatrix(true,true);const cover=p.children[0],vertices=cover.geometry.attributes.position,points=[];
  for(let j=0;j<vertices.count;j++)points.push(new T.Vector3().fromBufferAttribute(vertices,j).applyMatrix4(cover.matrixWorld));
  const low=Math.min(...points.map(v=>v.y)),seats=sofa.children.filter(o=>o.name.startsWith('sofa-sewn-seat-'));let clearance=Infinity;
  for(const v of points.filter(v=>v.y<low+.025)){const hit=new T.Raycaster(new T.Vector3(v.x,v.y+.30,v.z),new T.Vector3(0,-1,0),0,.8).intersectObjects(seats,true)[0];if(hit)clearance=Math.min(clearance,v.y-hit.point.y);}
  if(!Number.isFinite(clearance))throw Error('靠包没有落在沙发座面内');p.position.y-=clearance-.001;p.userData.seatClearance=.001;
 }
 sofa.updateWorldMatrix(true,true);
 for(const i of [0,1,4,5]){
  const o=old[i];o.geometry=o.geometry.clone();const a=o.geometry.attributes.position,n=o.geometry.attributes.normal,uv=[],scale=[0,1,2].map(k=>new T.Vector3().setFromMatrixColumn(o.matrixWorld,k).length());
  for(let j=0;j<a.count;j++){const x=a.getX(j)*scale[0],y=a.getY(j)*scale[1],z=a.getZ(j)*scale[2];uv.push(...(Math.abs(n.getY(j))>.5?[x,z]:Math.abs(n.getX(j))>.5?[z,y]:[x,y]));}
  o.geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));o.material=fabric(i?'#d6cfc0':'#aaa392',1,1,'knit');o.userData.textileUVUnits='metres';
 }
 sofa.userData.textileDetail=true;
}
