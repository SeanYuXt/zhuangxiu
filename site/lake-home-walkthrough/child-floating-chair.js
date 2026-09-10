import {layout as d,doorTip} from './child-floating-layout.js?v=95';
export const chairStates={normal:{pull:0,angle:0},back30:{pull:.30,angle:0},back60:{pull:.60,angle:0},turn45:{pull:.60,angle:45}};
export function chairGeometry(key='normal'){
 const s=chairStates[key],r=d.chair,cx=(r[0]+r[2])/2,cz=(r[1]+r[3])/2+s.pull,a=s.angle*Math.PI/180;
 const polygon=[[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]].map(([x,z])=>{const dx=x-cx,dz=z-(r[1]+r[3])/2;return[cx+dx*Math.cos(a)-dz*Math.sin(a),cz+dx*Math.sin(a)+dz*Math.cos(a)];});
 return{...s,cx,cz,polygon,radius:d.chairBaseDiameter/2};
}
function overlaps(a,b){
 for(const p of[a,b])for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length],axis=[-(q[1]-p[i][1]),q[0]-p[i][0]],dot=v=>v[0]*axis[0]+v[1]*axis[1],aa=a.map(dot),bb=b.map(dot);if(Math.max(...aa)<=Math.min(...bb)+1e-8||Math.max(...bb)<=Math.min(...aa)+1e-8)return false;}
 return true;
}
function distance(x,z,r){return Math.hypot(Math.max(r[0]-x,0,x-r[2]),Math.max(r[1]-z,0,z-r[3]));}
export function chairCheck(key='normal',doorAngle=115){
 const g=chairGeometry(key),r=g.radius,obs=[d.bed,d.wardrobe,d.desk,d.returnTop,d.joinery.gapDisplay,d.joinery.doorBackPanel];
 const collisions=[];
 obs.forEach((b,i)=>{if(overlaps(g.polygon,[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]])||distance(g.cx,g.cz,b)<r-1e-8)collisions.push(i);});
 const tip=doorTip(doorAngle),a=d.door.hinge,v=[tip[0]-a[0],tip[1]-a[1]],len=Math.hypot(...v),n=[-v[1]/len*.02,v[0]/len*.02];
 const doorPoly=[[a[0]+n[0],a[1]+n[1]],[tip[0]+n[0],tip[1]+n[1]],[tip[0]-n[0],tip[1]-n[1]],[a[0]-n[0],a[1]-n[1]]];
 if(overlaps(g.polygon,doorPoly))collisions.push('door');
 const xs=g.polygon.map(p=>p[0]),zs=g.polygon.map(p=>p[1]);
 const bounds=[Math.min(...xs,g.cx-r),Math.min(...zs,g.cz-r),Math.max(...xs,g.cx+r),Math.max(...zs,g.cz+r)];
 if(bounds[0]<0||bounds[1]<0||bounds[2]>3.5||bounds[3]>2.7)collisions.push('room');
 return{collisions,bounds,sideMinCM:100*Math.min(bounds[0]-d.bed[2],3.5-bounds[2]),frontGapCM:100*(bounds[1]-d.desk[3]),bodyAndSeatingApproved:false};
}
