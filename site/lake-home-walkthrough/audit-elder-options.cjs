// Checks concrete candidates, not an exhaustive proof of impossibility.
const fs=require('fs'),path=require('path');
const root=__dirname;
const spec=JSON.parse(fs.readFileSync(path.join(root,'plan-spec.json'),'utf8'));
const polygon=spec.spaces.find(s=>s.id==='bed1').polygons[0].map(([x,z])=>[x,-z]);
const inside=(x,z)=>{let result=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const[a,b]=polygon[i],[c,d]=polygon[j];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)result=!result;}return result;};
const overlap=(a,b)=>[Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0])),Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]))];
const distRect=(x,z,r)=>Math.hypot(Math.max(r[0]-x,0,x-r[2]),Math.max(r[1]-z,0,z-r[3]));
const segmentDist=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);};
// Polygon plus actual door opening to a short approach patch outside this room.
const walls=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length];if(a[1]===5.39&&b[1]===5.39){walls.push([[.8,5.39],[2.66,5.39]],[[3.56,5.39],[3.61,5.39]]);}else walls.push([a,b]);}
function route(c,radius,occupied){
 const obstacles=[c.bed,c.ward,c.desk,...(occupied?[c.chair]:[])];
 const valid=(x,z)=>(inside(x,z)||(x>=2.66&&x<=3.56&&z>=5.39&&z<=5.70))&&walls.every(([a,b])=>segmentDist(x,z,a,b)>=radius-.001)&&obstacles.every(r=>distRect(x,z,r)>=radius-.001);
 const step=.02,NX=181,NZ=196,xmin=.1,zmin=1.8;
 const coord=(i,j)=>[xmin+i*step,zmin+j*step];
 const start=[Math.round((3.11-xmin)/step),Math.round((5.49-zmin)/step)];const q=[start],seen=new Set([start.join(',')]);
 for(let n=0;n<q.length;n++){const[i,j]=q[n];for(const[di,dj]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj,key=a+','+b;if(a<0||a>NX||b<0||b>NZ||seen.has(key))continue;const[x,z]=coord(a,b);if(valid(x,z)){seen.add(key);q.push([a,b]);}}}
 const points=q.map(([i,j])=>coord(i,j));
 const b=c.bed,midX=(b[0]+b[2])/2,midZ=(b[1]+b[3])/2;
 // A standing point adjacent to the middle third of each mattress side, not just at a toe corner.
 const side1=c.head==='west'||c.head==='east'?[midX,b[1]-radius-.01]:[b[0]-radius-.01,midZ];
 const side2=c.head==='west'||c.head==='east'?[midX,b[3]+radius+.01]:[b[2]+radius+.01,midZ];
 const reaches=t=>points.some(p=>Math.hypot(p[0]-t[0],p[1]-t[1])<.045);
 const deskCenter=[(c.chair[0]+c.chair[2])/2,(c.chair[1]+c.chair[3])/2];
 return {side1:reaches(side1),side2:reaches(side2),deskApproach:!occupied&&reaches(deskCenter),targets:{side1,side2,deskCenter},reachableCells:points.length};
}
(async()=>{
 const{layouts}=await import('./elder-layout-options-data.js');
 const results=layouts.map(c=>{
  const intersections=[];for(const[a,b]of [['bed','ward'],['bed','desk'],['bed','chair'],['ward','chair']]){const[w,d]=overlap(c[a],c[b]);if(w>1e-5&&d>1e-5)intersections.push({pair:[a,b],widthMM:Math.round(w*1000),depthMM:Math.round(d*1000)});}
  let outside=0;for(const key of ['bed','ward','desk','chair']){const r=c[key];for(let x=r[0]+.005;x<r[2];x+=.02)for(let z=r[1]+.005;z<r[3];z+=.02)if(!inside(x,z))outside++;}
  let doorHits=0;for(let a=0;a<=90;a++)for(let t=0;t<=.9;t+=.01){const x=3.56-t*Math.cos(a*Math.PI/180),z=5.45-t*Math.sin(a*Math.PI/180);if([c.bed,c.ward,c.desk,c.chair].some(r=>x>r[0]-.02&&x<r[2]+.02&&z>r[1]-.02&&z<r[3]+.02))doorHits++;}
  return {id:c.id,intersections,outsideSamples:outside,doorHits,routes600:{vacant:route(c,.30,false),occupied:route(c,.30,true)},routes500:{vacant:route(c,.25,false),occupied:route(c,.25,true)}};
 });
 const report={method:'20mm grid, four-neighbour paths, circular 600/500mm proxies; furniture footprint checks; 91 door angles. This is comparative model testing, not installation or ergonomic certification.',unknown:'Window recess usable-floor status is NOT established. Route tests optimistically use the complete existing polygon; passing cannot resolve this unknown.',layouts:results};
 fs.writeFileSync(path.join(root,'elder-layout-options-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1;});
