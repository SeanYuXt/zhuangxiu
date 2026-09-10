// Prevent rotated furniture, original-door clashes and false routes through the raised bay.
(async()=>{
 const {variants}=await import('./child-bay-study-data.js'),d=variants[process.argv[2]||'balanced'];
 const keys=['bed','wardrobe','desk',...(d.extraCabinet?['extraCabinet']:[])],hit=(a,b)=>Math.min(a[2],b[2])>Math.max(a[0],b[0])+1e-6&&Math.min(a[3],b[3])>Math.max(a[1],b[1])+1e-6;
 const failures=[];
 const upper=d.upperBooks,ur=upper.rect;
 if(hit(ur,d.bed)||ur[0]<d.desk[0]||ur[2]>d.desk[2]||ur[3]>d.desk[3]||upper.bottom<1.50||upper.top>2.4)failures.push('upper bookcase envelope');
 if(d.bayTray[0]<d.bay[0]||d.bayTray[1]<d.bay[1]||d.bayTray[2]>d.bay[2]||d.bayTray[3]>d.bay[3])failures.push('bay tray outside retained sill');
 for(const k of keys){const r=d[k],u=d.usable;if(r[0]<u[0]||r[1]<u[1]||r[2]>u[2]||r[3]>u[3])failures.push(k+' outside floor');}
 for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++)if(hit(d[keys[i]],d[keys[j]]))failures.push(keys[i]+' overlaps '+keys[j]);
 const direction=d.chairDirection||1;
 for(const shift of [0,.3])for(const k of keys)if(hit([d.chair[0],d.chair[1]+shift*direction,d.chair[2],d.chair[3]+shift*direction],d[k]))failures.push('chair '+shift+' hits '+k);
 let doorHits=0;
 for(let a=0;a<=90;a++)for(let t=0;t<=.9;t+=.01){const x=13.96+t*Math.sin(a*Math.PI/180),z=6.57-t*Math.cos(a*Math.PI/180);if(keys.some(k=>{const r=d[k];return x>r[0]-.02&&x<r[2]+.02&&z>r[1]-.02&&z<r[3]+.02;}))doorHits++;}
 if(doorHits)failures.push('door sweep');
 const dist=(x,z,r)=>Math.hypot(Math.max(r[0]-x,0,x-r[2]),Math.max(r[1]-z,0,z-r[3]));
 function route(shift,closed=false){
  const obs=keys.map(k=>d[k]);obs.push([d.chair[0],d.chair[1]+shift*direction,d.chair[2],d.chair[3]+shift*direction]);
  // Open leaf, wall pieces and bay inner edge are obstacles; 600mm proxy, 20mm grid.
  obs.push(closed?[13.942,5.67,13.978,6.57]:[13.96,6.555,14.86,6.585],[14,4.46,14.02,5.67],[14,6.57,14.02,7.17],[14.02,4.44,17.52,4.46],[14.02,7.17,17.52,7.19],[17.52,4.46,17.54,7.17]);
  const valid=(x,z)=>x>=13.7&&x<=17.52&&z>=4.46&&z<=7.17&&(x>=14.02||(z>=5.67&&z<=6.57))&&obs.every(r=>dist(x,z,r)>=.30-1e-6);
  const start=closed?[46,53]:[10,84],q=[start],seen=new Set([start.join(',')]),xy=([i,j])=>[13.7+i*.02,4.44+j*.02];
  for(let n=0;n<q.length;n++)for(const[di,dj]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=q[n][0]+di,b=q[n][1]+dj,k=a+','+b;if(a<0||a>191||b<0||b>137||seen.has(k))continue;if(valid(...xy([a,b]))){seen.add(k);q.push([a,b]);}}
  const pts=q.map(xy),reach=t=>pts.some(p=>Math.hypot(p[0]-t[0],p[1]-t[1])<.045);
  return {chairBack:reach([(d.chair[0]+d.chair[2])/2,d.key==='refined'?5.75-shift:5.96+shift]),bedSide:reach(d.key==='refined'?[15.65,5.5]:d.key==='study'?[14.62,5.8]:[15.62,6.3]),wardrobeLeft:reach([14.48,5.4]),wardrobeRight:reach([15.48,5.4]),foot:reach([16.6,d.bedReversed?4.78:6.85]),windowApproach:reach([17.14,6.2]),safeDoorWaiting:reach([14.62,5.5]),cells:q.length};
 }
 const routes={normal:route(0),pulled:route(.3),...(d.key==='study'?{afterClosingDoor:route(0,true),pulledAfterClosingDoor:route(.3,true)}:{})};
 if(d.key==='balanced')for(const [k,r]of Object.entries(routes))if(!r.chairBack||!r.bedSide||!r.foot)failures.push('route '+k);
 if(d.key==='refined')for(const [k,r]of Object.entries(routes))if(!r.chairBack||!r.bedSide||!r.wardrobeLeft||!r.wardrobeRight)failures.push('refined route '+k);
 if(d.key==='study'){
  if(!routes.normal.safeDoorWaiting)failures.push('cannot enter and stand outside door swing');
  for(const k of ['afterClosingDoor','pulledAfterClosingDoor'])if(!routes[k].chairBack||!routes[k].foot||!routes[k].windowApproach)failures.push('closed door route '+k);
 }
 const report={id:d.id,scheme:d.key,status:failures.length?'FAIL':d.key==='storage'?'REJECTED_FOOT_ACCESS':d.key==='study'?'CONDITIONAL_CLOSE_DOOR':'PASS_WITH_LIMITS',failures,doorHits,routes,footClearanceMM:635,deskWidthCM:Math.round((d.desk[2]-d.desk[0])*100),tradeoff:d.tradeoff,additionalLimit:'600mm proxy, not ergonomic approval. C requires entering, moving outside swing and closing door before walking around bed. B is deliberately excluded. Bay seating and child fall protection remain unverified.'};
 require('fs').writeFileSync(require('path').join(__dirname,'child-'+d.key+'-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(failures.length)process.exitCode=1;
})();
