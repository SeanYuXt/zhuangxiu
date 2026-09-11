import {P,walls,rooms} from './plan.js';
// 600mm circular walking proxy on the same floor / wall coordinates. Closed
// cabinets only; the refrigerator's actual opening motion has a separate audit.
export function wholeWallAudit(s,{origin=[8.63,6.16]}={}){
 const structural=[];
 for(const w of walls){if(w.glass)continue;const a=P(w.a),b=P(w.b),len=Math.hypot(b[0]-a[0],b[1]-a[1]),t=(w.t||20)/200,u=[(b[0]-a[0])/len,(b[1]-a[1])/len];let end=0;for(const o of[...(w.open||[]).map(o=>({at:o.at/100,w:o.w/100})),{at:len,w:0}].sort((a,b)=>a.at-b.at)){if(o.at>end){const p=[a[0]+u[0]*end,a[1]+u[1]*end],q=[a[0]+u[0]*o.at,a[1]+u[1]*o.at];structural.push({name:'原墙',x1:Math.min(p[0],q[0])-(a[0]===b[0]?t:0),x2:Math.max(p[0],q[0])+(a[0]===b[0]?t:0),z1:Math.min(p[1],q[1])-(a[1]===b[1]?t:0),z2:Math.max(p[1],q[1])+(a[1]===b[1]?t:0)});}end=o.at+o.w;}}
 const people=s.chairs.map(c=>{const end=Number(c.name.split('-').at(-1))>=4,x=(c.x1+c.x2)/2,z=(c.z1+c.z2)/2;return {name:'就餐占位',x1:x-(end?.30:.325),x2:x+(end?.30:.325),z1:z-(end?.325:.30),z2:z+(end?.325:.30)};});
 const blockers=[...structural,...s.fixed,s.table,...s.chairs,...people,...s.leaves];
 const polygons=['entry','kitchen','living','dining'].map(id=>rooms.find(r=>r.id===id).poly.map(P));
 const inside=(x,z,p)=>{let hit=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
 const floor=(x,z)=>polygons.some(p=>inside(x,z,p))||(x>=5.70&&x<=5.93&&z>=2.86&&z<=4.50);
 const free=(x,z)=>x>=2.8&&x<=14.1&&z>=1.5&&z<=7.2&&Array.from({length:16},(_,i)=>i*Math.PI/8).every(a=>floor(x+.30*Math.cos(a),z+.30*Math.sin(a)))&&!blockers.some(b=>Math.hypot(Math.max(b.x1-x,0,x-b.x2),Math.max(b.z1-z,0,z-b.z2))<.30-.001);
 const step=.025,queue=free(...origin)?[[0,0]]:[],seen=new Map([['0,0',null]]);
 for(let i=0;i<queue.length;i++)for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const next=[queue[i][0]+dx,queue[i][1]+dz],key=next.join(',');if(!seen.has(key)&&free(origin[0]+next[0]*step,origin[1]+next[1]*step)){seen.set(key,queue[i].join(','));queue.push(next);}}
 const targets=[{name:'餐区操作台',point:[s.counter.x1+.75,s.counter.z1-.36]},{name:'冰箱取物位',point:[(s.fridge.x1+s.fridge.x2)/2,s.fridge.z1-.36]},{name:'厨房入口内',point:[5.30,3.95]},{name:'入户通道',point:[6.88,6.64]},{name:'挂包取鞋位',point:[s.spec.drop.start+s.spec.drop.width/2,s.spec.wallZ-s.spec.drop.depth-.36]},{name:'鞋柜取鞋位',point:[s.spec.shoes.start+s.spec.shoes.utilityWidth+s.spec.shoes.coatWidth+s.spec.shoes.shoeWidth/2,s.spec.wallZ-s.spec.shoes.depth-.36]}];
 const routes=targets.map(t=>{const last=queue.find(p=>Math.hypot(origin[0]+p[0]*step-t.point[0],origin[1]+p[1]*step-t.point[1])<.045),path=[];if(last){let key=last.join(',');while(key){const p=key.split(',').map(Number);path.push([origin[0]+p[0]*step,origin[1]+p[1]*step]);key=seen.get(key);}path.reverse();}return {...t,reached:!!last,path,lengthMetres:Math.max(0,path.length-1)*step};});
 return {people,origin,proxyDiameterMm:600,stepMm:25,startFree:free(...origin),routes,limit:'闭柜状态的600mm圆形通行代理，不代表实物端盘、起坐、双人错身或开门时身体姿态验收。'};
}
