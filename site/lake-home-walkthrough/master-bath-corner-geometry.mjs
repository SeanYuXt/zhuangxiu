// Shared by plan, 3D and route regression. Metres in the source x/z plane.
export function curtainSegments(p, closed) {
  const path=closed?p.path:[[p.parked[0],(p.parked[1]+p.parked[3])/2],[p.parked[2],(p.parked[1]+p.parked[3])/2]];
  return path.slice(1).map((q,i)=>[path[i],q]);
}
export function pointSegment(p,a,b){
  const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);
}
export function pointRect(p,r){return Math.hypot(Math.max(r[0]-p[0],0,p[0]-r[2]),Math.max(r[1]-p[1],0,p[1]-r[3]));}
