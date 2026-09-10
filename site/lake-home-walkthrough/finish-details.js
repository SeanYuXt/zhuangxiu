import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {designWalls} from './balcony-side-infill.js';
import {P,rooms} from './plan.js';
import {insidePolygon} from './continuous-walk.js';
import {casingWidth,casingGap,makeDoorCasings,finishSkirtingJoints} from './finish-joints.js';
import {tileLayout} from './tile-surfaces.js';

// Finishes derived from the same wall/opening schedule, never a second shell.
export function addSkirting(model){
 const previous=model.getObjectByName('whole-home-skirting');if(previous){const materials=new Set();previous.traverse(o=>{if(o.isMesh){o.geometry.dispose();materials.add(o.material);}});previous.removeFromParent();materials.forEach(m=>m.dispose());}
 const oldCasings=model.getObjectByName('whole-home-door-casings');if(oldCasings){const materials=new Set();oldCasings.traverse(o=>{if(o.isMesh){o.geometry.dispose();materials.add(o.material);}});oldCasings.removeFromParent();materials.forEach(m=>m.dispose());}
 model.updateMatrixWorld(true);
 const root=new T.Group();root.name='whole-home-skirting';
 root.userData={height:.06,projection:.008,bottom:tileLayout.surfaceY+.002,floorY:tileLayout.surfaceY,baseSealHeight:.002,finish:'暖灰哑光铝合金踢脚，表贴不凿墙',constructionVerified:false};
 const mat=new T.MeshStandardMaterial({color:'#b8b4a9',roughness:.62,metalness:.3});
 const dry=rooms.filter(r=>!r.viewOnly&&!['bath1','bath2','kitchen'].includes(r.id)).map(r=>({...r,poly:r.poly.map(P)}));
 const wet=rooms.filter(r=>['bath1','bath2','kitchen'].includes(r.id)).map(r=>r.poly.map(P));
 const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
 const cabinetry=['flush-entry-cabinet','flush-sideboard','integrated-fridge','balcony-laundry-cabinet','balcony-care-cabinet','bed1-wardrobe','bed3-wardrobe','master-entry-wardrobe','master-wardrobe','dry-waterproof-side'];
 const exclusions=cabinetry.map(name=>{const object=model.getObjectByName(name);if(!object||!visible(object))return null;const bounds=new T.Box3().setFromObject(object);return bounds.min.y<.078?{name,bounds}:null;}).filter(Boolean);
 const cutbacks=[];
 const edges=[];
 designWalls.forEach((w,index)=>{
  if(w.glass)return;
  const a=P(w.a),b=P(w.b),length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const u=[(b[0]-a[0])/length,(b[1]-a[1])/length],n=[-u[1],u[0]],thickness=(w.t||20)/100;
  const intervals=[],cutEnds=[];let at=0;
  for(const opening of [...(w.open||[])].sort((a,b)=>a.at-b.at)){
   if(opening.kind==='window')continue;
   const allowance=opening.kind==='door'?casingWidth+casingGap:0;
   const end=opening.at/100-allowance;intervals.push([at,end]);at=(opening.at+opening.w)/100+allowance;cutEnds.push(end,at);
  }
  intervals.push([at,length]);
  for(const side of [-1,1])for(const [lo,hi] of intervals){
   // Sample the interior side so adjoining room/finish changes split correctly.
   const runs=[];let start=null;
   for(let t=lo;t<=hi+.025;t+=.025){
    const distance=Math.min(t,hi),x=a[0]+u[0]*distance+n[0]*side*(thickness/2+.035),z=a[1]+u[1]*distance+n[1]*side*(thickness/2+.035);
    const valid=t<hi&&dry.some(r=>insidePolygon(x,z,r.poly))&&!wet.some(poly=>insidePolygon(x,z,poly));
    if(valid&&start===null)start=distance;
    if(!valid&&start!==null){runs.push([start,distance]);start=null;}
   }
   let visibleRuns=runs;
   for(const {name,bounds} of exclusions){
    const corners=[[bounds.min.x,bounds.min.z],[bounds.min.x,bounds.max.z],[bounds.max.x,bounds.min.z],[bounds.max.x,bounds.max.z]];
    const normals=corners.map(p=>(p[0]-a[0])*n[0]+(p[1]-a[1])*n[1]),along=corners.map(p=>(p[0]-a[0])*u[0]+(p[1]-a[1])*u[1]);
    const face=side*(thickness/2+.004);
    if(face<Math.min(...normals)-.020||face>Math.max(...normals)+.020)continue;
    const cut=[Math.min(...along)-.010,Math.max(...along)+.010],next=[];
    for(const [from,to] of visibleRuns){if(cut[1]<=from||cut[0]>=to){next.push([from,to]);continue;}cutbacks.push({wallIndex:index,side,cabinet:name,start:Math.max(from,cut[0]),end:Math.min(to,cut[1])});if(from<cut[0])next.push([from,cut[0]]);if(to>cut[1])next.push([cut[1],to]);}
    visibleRuns=next;
   }
   for(const [from,to] of visibleRuns){
    if(to-from<.04)continue;
    const d=(from+to)/2,offset=side*(thickness/2+.004),x=a[0]+u[0]*d+n[0]*offset,z=a[1]+u[1]*d+n[1]*offset;
    const mesh=new T.Mesh(new RoundedBoxGeometry(to-from-.0016,.06,.008,2,.0015),mat);
    mesh.name=`skirting-${index}-${side}-${from.toFixed(3)}`;mesh.position.set(x,root.userData.bottom+.03,z);mesh.rotation.y=-Math.atan2(u[1],u[0]);mesh.castShadow=true;mesh.receiveShadow=true;
    mesh.userData={wallIndex:index,side,start:from,end:to,kind:'finish',cutEnds:[...cutEnds,...cutbacks.filter(c=>c.wallIndex===index&&c.side===side).flatMap(c=>[c.start,c.end])]};root.add(mesh);edges.push(mesh.userData);
   }
  }
 });
 finishSkirtingJoints(root,exclusions,dry);
 model.add(root);model.add(makeDoorCasings(designWalls));root.userData.segments=edges;root.userData.cabinetCutbacks=cutbacks;return root;
}
