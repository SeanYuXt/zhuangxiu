import {P,walls,rooms} from './plan.js';

export function diningStudyAudit(s){
 const structure=[];
 for(const w of walls){
  const a=P(w.a),b=P(w.b),len=Math.hypot(b[0]-a[0],b[1]-a[1]),t=(w.t||20)/200;
  if(w.glass||Math.max(a[0],b[0])<3.5||Math.min(a[0],b[0])>9.1)continue;
  const segment=(lo,hi)=>{if(hi<=lo)return;const x0=a[0]+(b[0]-a[0])*lo/len,z0=a[1]+(b[1]-a[1])*lo/len,x1=a[0]+(b[0]-a[0])*hi/len,z1=a[1]+(b[1]-a[1])*hi/len;structure.push({name:'原墙',x1:Math.min(x0,x1)-(a[0]===b[0]?t:0),x2:Math.max(x0,x1)+(a[0]===b[0]?t:0),z1:Math.min(z0,z1)-(a[1]===b[1]?t:0),z2:Math.max(z0,z1)+(a[1]===b[1]?t:0)});};
  let start=0;for(const o of [...(w.open||[])].sort((a,b)=>a.at-b.at)){segment(start,o.at/100);start=(o.at+o.w)/100;}segment(start,len);
 }
 const people=s.chairs.map(c=>{const i=Number(c.name.split('-').at(-1)),x=(c.x1+c.x2)/2,z=(c.z1+c.z2)/2;return {name:'就餐占位'+(i+1),x1:x-(i<4?.325:.30),x2:x+(i<4?.325:.30),z1:z-(i<4?.30:.325),z2:z+(i<4?.30:.325)};});
 const blockers=[...structure,...s.fixed,s.table,...s.chairs,...people,...s.leaves];
 const polygons=['entry','kitchen','living','dining'].map(id=>rooms.find(r=>r.id===id).poly.map(P));
 const pointIn=(x,z,poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
 const free=(x,z)=>{
  // Include the actual entry corridor, plus the existing kitchen door threshold.
  const inside=(xx,zz)=>polygons.some(p=>pointIn(xx,zz,p))||(xx>=5.70&&xx<=5.93&&zz>=s.door.z0&&zz<=s.door.z1);
  const inFloor=Array.from({length:16},(_,i)=>i*Math.PI/8).every(angle=>inside(x+.3*Math.cos(angle),z+.3*Math.sin(angle)));
  return inFloor&&!blockers.some(b=>Math.hypot(Math.max(b.x1-x,0,x-b.x2),Math.max(b.z1-z,0,z-b.z2))<.30-.0001);
 };
 const origin=[8.65,6.15],step=.02,queue=free(...origin)?[[0,0]]:[],seen=new Map([['0,0',null]]);
 for(let i=0;i<queue.length;i++)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const current=queue[i],next=[current[0]+dx,current[1]+dz],key=next.join(',');if(!seen.has(key)&&free(origin[0]+next[0]*step,origin[1]+next[1]*step)){seen.set(key,current.join(','));queue.push(next);}}
 const targets=[{name:'进入厨房',point:[5.30,3.95]},{name:'冰箱取饮料',point:s.wall.targets.fridge},{name:'餐边柜近端站位',point:s.wall.targets.sideboard},{name:'入户通过',point:[6.88,6.64]},{name:'次卧门前',point:s.wall.targets.bed1}];
 const routes=targets.map(t=>{const end=queue.find(p=>Math.hypot(origin[0]+p[0]*step-t.point[0],origin[1]+p[1]*step-t.point[1])<.035),path=[];if(end){let key=end.join(',');while(key){const p=key.split(',').map(Number);path.push([origin[0]+p[0]*step,origin[1]+p[1]*step]);key=seen.get(key);}path.reverse();}return {...t,reached:!!end,path,lengthMetres:Math.max(0,path.length-1)*step,detour:t.name==='进入厨房'&&path.some(p=>p[0]>s.fixed.find(o=>o.name==='linen-sofa').x1)};});
 const sofa=s.fixed.find(o=>o.name==='linen-sofa'),sideboard=s.sideboardCounter;
 const fridgeX=s.wall.fridge.position[0],backWall=structure.find(b=>b.x1<fridgeX&&b.x2>fridgeX&&b.z1>=5.25&&b.z2<=5.51);
 const west=people.slice(0,2),kitchenWall=structure.find(b=>b.x1<s.door.x&&b.x2>s.door.x&&b.z1<=4.95&&b.z2>=4.95);
 const distance=(a,b)=>Math.hypot(Math.max(a.x1-b.x2,b.x1-a.x2,0),Math.max(a.z1-b.z2,b.z1-a.z2,0));
 const serviceDistances=s.serviceItems.map(item=>({name:item.name,tableEdgeMm:Math.round(distance(s.table,item)*1000)}));
 return {structure,people,routes,origin,kitchenWallFront:kitchenWall.x2,serviceDistances,startFree:free(...origin),proxyDiameterMm:600,stepMm:20,nodes:queue.length,metrics:{fridgeFrontClearMm:Math.round((s.wall.fridge.position[2]-s.wall.fridge.depth/2-backWall.z2)*1000),openingMm:Math.round((s.door.z1-s.door.z0)*1000),doorClearMm:Math.round(s.door.clearOpen*1000),westOccupiedClearMm:Math.round((Math.min(...west.map(c=>c.x1))-kitchenWall.x2)*1000),eastOccupiedClearMm:Math.round((sofa.x1-Math.max(...people.slice(2,4).map(c=>c.x2)))*1000),tableToSideboardProjectionMm:Math.round((sideboard.z1-s.table.z2)*1000),tableToSideboardNearestMm:Math.round(distance(s.table,sideboard)*1000)},limit:'600mm圆形通行代理，四/六席按600×650mm就餐占位，20mm网格；物件距离为俯视包围框最短直线，不是步行路线或手臂可达距离。不证明实物起坐、双人错身、端盘舒适性或产品安装。'};
}
