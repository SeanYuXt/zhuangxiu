// Standing-space study, not a biomechanical sit-to-stand simulation.
// Coordinates and footprints are supplied by the live model in metres.
export function auditSeatEgress({obstacles,seats,active,bounds,entry,radius=.30,step=.025}){
 const chair=seats[active];if(!chair)throw Error('Missing active seat');
 const occupied=seats.map((s,i)=>{
  if(i===active)return {...s,role:'active-chair'};
  const cx=(s.x1+s.x2)/2,cz=(s.z1+s.z2)/2,rx=s.axis==='x'?.325:.30,rz=s.axis==='x'?.30:.325;
  return {name:s.name,role:'other-occupied-seat',x1:Math.min(s.x1,cx-rx),x2:Math.max(s.x2,cx+rx),z1:Math.min(s.z1,cz-rz),z2:Math.max(s.z2,cz+rz)};
 });
 const solids=[...obstacles,...occupied],nx=Math.floor((bounds.x2-bounds.x1)/step)+1,nz=Math.floor((bounds.z2-bounds.z1)/step)+1;
 const freePoint=([x,z])=>x>=bounds.x1+radius&&x<=bounds.x2-radius&&z>=bounds.z1+radius&&z<=bounds.z2-radius&&!solids.some(o=>Math.hypot(Math.max(o.x1-x,0,x-o.x2),Math.max(o.z1-z,0,z-o.z2))<radius-1e-7);
 const index=(x,z)=>Math.round((x-bounds.x1)/step)*nz+Math.round((z-bounds.z1)/step),point=k=>[bounds.x1+Math.floor(k/nz)*step,bounds.z1+k%nz*step];
 const valid=k=>k>=0&&k<nx*nz,free=new Int8Array(nx*nz),parent=new Int32Array(nx*nz);parent.fill(-2);
 const open=k=>{if(!valid(k))return false;if(!free[k])free[k]=freePoint(point(k))?1:-1;return free[k]===1;};
 const start=index(...entry),queue=[];if(open(start)){queue.push(start);parent[start]=-1;}
 for(let h=0;h<queue.length;h++){
  const k=queue[h],i=Math.floor(k/nz),j=k%nz;
  for(const n of [i>0?k-nz:-1,i<nx-1?k+nz:-1,j>0?k-1:-1,j<nz-1?k+1:-1])if(valid(n)&&parent[n]===-2&&open(n)){parent[n]=k;queue.push(n);}
 }
 const cx=(chair.x1+chair.x2)/2,cz=(chair.z1+chair.z2)/2,margin=.02;
 // Only side/rear stances adjacent to the retained chair, never an arbitrary
 // reachable point elsewhere in the room. 25 mm tangential adjustment allowed.
 const candidates=[];
 for(const offset of [0,-.025,.025]){
  if(chair.axis==='z')candidates.push([chair.x1-radius-margin,cz+offset,'left'],[chair.x2+radius+margin,cz+offset,'right'],[cx+offset,chair.z2+radius+margin,'rear']);
  else candidates.push([cx+offset,chair.z1-radius-margin,'left'],[cx+offset,chair.z2+radius+margin,'right'],[chair.x2+radius+margin,cz+offset,'rear']);
 }
 const probes=candidates.map(([x,z,side])=>{const k=index(x,z),p=point(k);return {side,point:p,free:freePoint(p),reachable:valid(k)&&parent[k]!==-2,k};});
 const found=probes.find(p=>p.free&&p.reachable);let path=[];
 if(found){for(let k=found.k;k!==-1;k=parent[k])path.push(point(k));path.reverse();}
 return {seat:chair.name,active,radius,step,startFree:open(start),reached:!!found,standing:found?{side:found.side,point:found.point}:null,path,probes,solids,visited:queue.length,scope:'Retained chair + other five occupied footprints; nearby standing position and 2D route only, not sit-to-stand motion or field certification'};
}
