const fs=require('fs'),path=require('path');
(async()=>{
 const{design:d}=await import('./child-window-study-data.js');
 const intersect=(a,b)=>Math.min(a[2],b[2])>Math.max(a[0],b[0])+1e-6&&Math.min(a[3],b[3])>Math.max(a[1],b[1])+1e-6;
 const collisions=[];for(const[a,b]of [['bed','wardrobe'],['bed','desk'],['wardrobe','desk']])if(intersect(d[a],d[b]))collisions.push([a,b]);
 for(const mode of ['occupied','pulled'])for(const key of ['bed','wardrobe','desk'])if(intersect(d.chairs[mode],d[key]))collisions.push([mode,key]);
 const contained=['bed','wardrobe','desk',...[]].every(k=>d[k][0]>=d.usable[0]&&d[k][1]>=d.usable[1]&&d[k][2]<=d.usable[2]&&d[k][3]<=d.usable[3]);
 // Source opening bounds are fixed. Test both possible hinges until swing is verified from source.
 let doorHits=0;for(const hz of [5.67,6.57])for(let a=0;a<=90;a++)for(let t=0;t<=.9;t+=.01){const x=13.96+t*Math.sin(a*Math.PI/180),z=hz+(hz===5.67?1:-1)*t*Math.cos(a*Math.PI/180);if([d.bed,d.wardrobe,d.desk].some(r=>x>r[0]-.02&&x<r[2]+.02&&z>r[1]-.02&&z<r[3]+.02))doorHits++;}
 const distance=(x,z,r)=>Math.hypot(Math.max(r[0]-x,0,x-r[2]),Math.max(r[1]-z,0,z-r[3]));
 const walls=[[[14.02,4.46],[17.52,4.46]],[[17.52,4.46],[17.52,7.17]],[[17.52,7.17],[14.02,7.17]],[[14.02,4.46],[14.02,5.67]],[[14.02,6.57],[14.02,7.17]]];
 const segDist=(x,z,a,b)=>{let dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);};
 function route(mode){
  const obstacles=[d.bed,d.wardrobe,d.desk,...(mode==='vacant'?[]:[d.chairs[mode]])];
  const valid=(x,z)=>(x>=14.02&&x<=17.52&&z>=4.46&&z<=7.17||x>=13.70&&x<14.02&&z>=5.67&&z<=6.57)&&walls.every(([a,b])=>segDist(x,z,a,b)>=.299)&&obstacles.every(r=>distance(x,z,r)>=.299);
  const q=[[10,84]],seen=new Set(['10,84']),coords=([i,j])=>[13.7+i*.02,4.44+j*.02];
  for(let n=0;n<q.length;n++){const[i,j]=q[n];for(const[di,dj]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj,k=a+','+b;if(a<0||a>195||b<0||b>138||seen.has(k))continue;const[x,z]=coords([a,b]);if(valid(x,z)){q.push([a,b]);seen.add(k);}}}
  const pts=q.map(coords),reach=t=>pts.some(p=>Math.hypot(p[0]-t[0],p[1]-t[1])<.04);
  const targets={bedSide:[14.96,5.80],wardrobe:[14.96,5.05],footApproach:[15.65,6.85],chairCenter:[16.635,6.85]};
  return {reachableCells:q.length,bedSide:reach(targets.bedSide),wardrobe:reach(targets.wardrobe),footApproach:reach(targets.footApproach),vacantChair:mode==='vacant'?reach(targets.chairCenter):null,targets};
 }
 const routes=Object.fromEntries(['vacant','occupied','pulled'].map(m=>[m,route(m)]));
 const report={collisions,contained,doorHits,routes,clearanceMM:{wardrobeFront:Math.round((d.bed[0]-d.wardrobe[2])*1000),foot:Math.round((d.usable[3]-d.bed[3])*1000),deskAlongBed:Math.round((d.desk[0]-d.bed[2])*1000)},limits:d.limits,method:'20mm grid, 600mm circular proxy, actual usable rectangle excludes raised window bay; 91 sampled angles for both door-hinge alternatives with20mm furniture allowance. Chair return is not a certified ergonomic trial.'};
 report.status=!collisions.length&&contained&&!doorHits&&Object.values(routes).every(r=>r.bedSide&&r.wardrobe)&&routes.vacant.vacantChair?'PASS_WITH_TRADEOFFS':'FAIL';
 fs.writeFileSync(path.join(__dirname,'child-window-study-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(report.status==='FAIL')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
