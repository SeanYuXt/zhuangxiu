import * as T from './vendor/three.module.js';
import {P,rooms} from './plan.js';
import {designWalls} from './balcony-side-infill.js';

export const tileLayout={pitch:.8,grout:.002,origin:[.175,.4],surfaceY:.006,jointRecess:.0008,finish:'浅暖灰柔光瓷砖 · 低对比细砂纹',productSelected:false,dimensionBasis:'800mm为当前排版模数；选砖后按砖净尺及留缝复核',waterproofVerified:false};
export function tileCuts(lo,hi,axis){const {pitch,origin}=tileLayout,out=[lo];for(let n=Math.floor((lo-origin[axis])/pitch)+1;origin[axis]+n*pitch<hi-.00001;n++)out.push(origin[axis]+n*pitch);out.push(hi);return out;}
const random=(a,b)=>{let x=Math.imul(a+137,374761393)^Math.imul(b+391,668265263);x=Math.imul(x^(x>>>13),1274126177);return ((x^(x>>>16))>>>0)/4294967295;};
const cross=(a,b,c)=>(b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]);
function clip(poly,axis,value,greater){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-value)*(greater?1:-1),db=(b[axis]-value)*(greater?1:-1);if(da>=-1e-10)out.push(a);if((da>=0)!==(db>=0)){const t=(value-a[axis])/(b[axis]-a[axis]);out.push(a.map((v,j)=>v+(b[j]-v)*t));}}return out;}
function inRect(poly,r){let p=poly;for(const [axis,value,greater] of [[0,r[0],true],[0,r[1],false],[2,r[2],true],[2,r[3],false]]){p=clip(p,axis,value,greater);if(p.length<3)return [];}return p;}
function outsideRect(poly,r){let p=poly;const out=[];for(const [axis,value,inside] of [[0,r[0],true],[0,r[1],false],[2,r[2],true],[2,r[3],false]]){const piece=clip(p,axis,value,!inside);if(piece.length>=3)out.push(piece);p=clip(p,axis,value,inside);if(p.length<3)break;}return out;}
function texture(size,kind){
 const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d'),im=ctx.createImageData(size,size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,n=random(x,y)-.5,cloud=Math.sin(x*.043)*Math.sin(y*.051)+.5*Math.sin((x+y)*.013);
  const values=kind==='color'?[216+cloud*1.1+n*3,213+cloud*1.1+n*3,206+cloud+n*2.5]:kind==='rough'?[205+n*15,205+n*15,205+n*15]:[128+n*5,128+(random(y,x)-.5)*5,255];
  im.data[i]=values[0];im.data[i+1]=values[1];im.data[i+2]=values[2];im.data[i+3]=255;
 }ctx.putImageData(im,0,0);const t=new T.CanvasTexture(c);t.name='porcelain-fine-sand-'+kind;t.colorSpace=kind==='color'?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t;
}
function makeMaterial(){const m=new T.MeshStandardMaterial({color:0xffffff,map:texture(1024,'color'),roughnessMap:texture(512,'rough'),normalMap:texture(512,'normal'),roughness:.72,metalness:0,vertexColors:true});m.normalScale.set(.16,.16);m.name='warm-grey-porcelain';m.userData={finish:tileLayout.finish,textureSource:'deterministic microfinish, not a photograph',slipRating:null,productSelected:false};return m;}
function thresholdSpecs(){const list=[];for(const w of designWalls)for(const opening of w.open||[]){if(!['bath1','bath2'].includes(opening.id))continue;const a=P(w.a),b=P(w.b),len=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/len,(b[1]-a[1])/len],t=(opening.at+opening.w/2)/100,c=[a[0]+u[0]*t,a[1]+u[1]*t],span=opening.w/100-.006,depth=(w.t||20)/100+.016;list.push({id:opening.id,center:c,size:Math.abs(u[0])>.5?[span,depth]:[depth,span],joint:.003});}return list;}
export function installTileSurfaces(model){
 if(model.getObjectByName('whole-home-tile-surface'))throw Error('Tile surface installed twice');
 const floor=model.getObjectByName('800x800-straight-tile-floor');if(!floor?.geometry)throw Error('Current floor missing');
 model.updateMatrixWorld(true);const root=new T.Group();root.name='whole-home-tile-surface';model.add(root);
 const material=makeMaterial(),grout=new T.MeshStandardMaterial({color:'#bdb9b0',roughness:.94}),thresholds=thresholdSpecs(),positions=[],uv=[],colors=[],cuts=new Map(),source=floor.geometry.attributes.position,index=floor.geometry.index;
 const exclusion=thresholds.map(t=>[t.center[0]-t.size[0]/2-t.joint,t.center[0]+t.size[0]/2+t.joint,t.center[1]-t.size[1]/2-t.joint,t.center[1]+t.size[1]/2+t.joint]);
 const add=(poly,ix,iz)=>{const variation=.976+random(ix,iz)*.024;
  for(let i=1;i<poly.length-1;i++){const tri=[poly[0],poly[i],poly[i+1]],area=Math.abs(cross(...tri))/2;if(area<1e-10)continue;for(const [x,y,z] of tri){positions.push(x,y,z);uv.push((x-tileLayout.origin[0])/.8+Math.floor(random(ix,iz)*7),-(z-tileLayout.origin[1])/.8);colors.push(variation,variation,variation);}const key=ix+':'+iz,entry=cuts.get(key)||{ix,iz,area:0,triangles:0};entry.area+=area;entry.triangles++;cuts.set(key,entry);}
 };
 for(let i=0;i<(index?index.count:source.count);i+=3){const tri=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(source,index?index.getX(i+k):i+k).applyMatrix4(floor.matrixWorld).toArray()),xs=tri.map(p=>p[0]),zs=tri.map(p=>p[2]);
  for(let ix=Math.floor((Math.min(...xs)-tileLayout.origin[0])/.8);ix<=Math.floor((Math.max(...xs)-tileLayout.origin[0])/.8);ix++)for(let iz=Math.floor((Math.min(...zs)-tileLayout.origin[1])/.8);iz<=Math.floor((Math.max(...zs)-tileLayout.origin[1])/.8);iz++){
   const x=tileLayout.origin[0]+ix*.8,z=tileLayout.origin[1]+iz*.8,g=tileLayout.grout/2,p=inRect(tri,[x+g,x+.8-g,z+g,z+.8-g]);if(p.length<3)continue;let pieces=[p];for(const r of exclusion)pieces=pieces.flatMap(piece=>outsideRect(piece,r));pieces.forEach(piece=>add(piece,ix,iz));
  }
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
 const tiles=new T.Mesh(geo,material);tiles.name='800x800-cut-porcelain';tiles.receiveShadow=true;root.add(tiles);floor.material=grout;floor.position.y-=tileLayout.jointRecess;
 const transitionMaterial=new T.MeshStandardMaterial({color:'#c8c3b9',roughness:.60});
 for(const t of thresholds){const mesh=new T.Mesh(new T.BoxGeometry(t.size[0],.008,t.size[1]),transitionMaterial);mesh.name='flush-threshold-'+t.id;mesh.position.set(t.center[0],tileLayout.surfaceY-.004,t.center[1]);mesh.receiveShadow=true;mesh.userData={...t,topY:tileLayout.surfaceY,installation:'同高过渡饰面＋3mm柔性分缝；门槛下防水未认证'};root.add(mesh);}
 const wetMaterial=material.clone();wetMaterial.name='warm-grey-wet-porcelain';wetMaterial.roughness=.95;
 const wet=[];model.traverse(o=>{if(!['bath1-cut-800-tile','bath2-cut-800-tile'].includes(o.name))return;const p=o.geometry.attributes.position,uvs=[],color=[];for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);uvs.push((x-tileLayout.origin[0])/.8,-(z-tileLayout.origin[1])/.8);color.push(1,1,1);}o.geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));o.geometry.setAttribute('color',new T.Float32BufferAttribute(color,3));o.material=wetMaterial;wet.push(o);});
 const boundaries=[];for(const r of rooms.filter(r=>['living','kitchen','bed1','master','bed3','bath1','bath2'].includes(r.id))){const p=r.poly.map(P);for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],axis=Math.abs(a[0]-b[0])>.01?0:1,lo=Math.min(a[axis],b[axis]),hi=Math.max(a[axis],b[axis]);if(hi-lo<.2)continue;const c=tileCuts(lo,hi,axis);boundaries.push({room:r.id,edge:i,axis,from:a,to:b,startCut:c[1]-c[0],endCut:c.at(-1)-c.at(-2)});}}
 root.userData={...tileLayout,tiles:[...cuts.values()],thresholds,boundaries,drawCalls:1+thresholds.length,area:[...cuts.values()].reduce((n,c)=>n+c.area,0),scope:'墙下不可见面含在几何内，不作采购量；湿区按原坡面单独分片'};
 const shape=floor.geometry.parameters.shapes.extractPoints(),floorContours=[shape.shape,...shape.holes].map(poly=>poly.map(p=>[p.x,-p.y]));
 const wetContours=wet.map(o=>{const a=o.geometry.attributes.position;return [0,1,2,5].map(i=>{const p=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);return [p.x,p.z];});});
 floor.userData.tileOrigin=tileLayout.origin;floor.userData.tileSurface='800x800-cut-porcelain';return {root,tiles,material,wet,thresholds,boundaries,floorContours,wetContours,layout:tileLayout};
}
