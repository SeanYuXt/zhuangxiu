// Union-shaped floor and two-stage entry check; prevents filling the entire room out to bay depth.
(async()=>{
 const {room,options,chairRect}=await import('./child-bay-options-data.js');
 const contains=(r,x,z)=>x>=r[0]-1e-7&&x<=r[2]+1e-7&&z>=r[1]-1e-7&&z<=r[3]+1e-7;
 const overlap=(a,b)=>Math.min(a[2],b[2])>Math.max(a[0],b[0])+1e-6&&Math.min(a[3],b[3])>Math.max(a[1],b[1])+1e-6;
 const dist=(x,z,r)=>Math.hypot(Math.max(r[0]-x,0,x-r[2]),Math.max(r[1]-z,0,z-r[3]));
 const results=[];
 for(const d of options){
  const deskFootprint=d.desk.clearanceFootprint??d.desk.r;
  const objects=[...(d.bed?[d.bed.r]:[]),...d.wardrobes.map(w=>w.r),deskFootprint,...(d.wallBed?[d.wallBed.r]:[]),...(d.studyStorage?[d.studyStorage.r]:[]),...(d.northCounter?[d.northCounter]:[]),...(d.lowCabinet?[d.lowCabinet]:[]),...(d.screen?[d.screen.r]:[]),...(d.bookshelf?[d.bookshelf.r,d.cabinetJoin]:[])],failures=[];
  if(d.desk.bayBridge){
   // Raised tabletop may overhang the retained sill; the sill is never walkable floor.
   const r=d.desk.r;for(let x=r[0];x<=r[2]+.001;x+=.01)for(let z=r[1];z<=r[3]+.001;z+=.01)if(!contains(room.main,x,z)&&!contains(room.bay,x,z))failures.push('bridge tabletop outside room/bay projection');
   if(.725<=room.bayHeight+.015)failures.push('bridge tabletop intersects retained sill');
  }
  for(let i=0;i<objects.length;i++){const r=objects[i];for(let x=r[0];x<=r[2]+.001;x+=.01)for(let z=r[1];z<=r[3]+.001;z+=.01)if(!contains(room.main,x,z)&&!(d.demolish&&contains(room.bay,x,z))){failures.push('outside usable union '+i);x=r[2]+1;break;}
   for(let j=i+1;j<objects.length;j++)if(overlap(r,objects[j]))failures.push('objects '+i+','+j);
  }
  const shifted=n=>chairRect(d,n);
  const doorHits=[];
  for(const n of [0,1]){const c=shifted(n);for(let i=0;i<objects.length;i++)if(overlap(c,objects[i])&&!(d.id==='windowdesk'&&objects[i]===d.desk.r))failures.push('chair state '+n+' object '+i);
   let hits=0;for(let a=0;a<=90;a++)for(let t=0;t<=.9;t+=.01){const x=13.96+t*Math.sin(a*Math.PI/180),z=6.57-t*Math.cos(a*Math.PI/180);if([...objects,c].some(r=>x>r[0]-.02&&x<r[2]+.02&&z>r[1]-.02&&z<r[3]+.02))hits++;}doorHits.push(hits);
  }
  const walls=[[14,4.46,14.02,5.67],[14,6.57,14.02,7.17],[14.02,4.44,17.52,4.46],[14.02,7.17,17.52,7.19],...(d.demolish?[[17.52,4.46,17.54,4.8],[17.52,6.41,17.54,7.17],[17.52,4.78,18.13,4.8],[17.52,6.41,18.13,6.43],[18.13,4.8,18.15,6.41]]:[[17.52,4.46,17.54,7.17]])];
  function route(n,closed,extra=[],targets=[],omitChair=false,startOverride=null){const c=shifted(n),obs=[...objects,...(omitChair?[]:[c]),...extra,...walls,closed?[13.942,5.67,13.978,6.57]:[13.96,6.552,14.86,6.588]],xy=([i,j])=>[13.7+i*.02,4.44+j*.02];
   const valid=(x,z)=>(contains(room.main,x,z)||(d.demolish&&contains(room.bay,x,z))||(x>=13.7&&x<14.02&&z>=5.67&&z<=6.57))&&obs.every(r=>dist(x,z,r)>=.30-1e-6);
   const start=startOverride??(closed?d.waiting:[13.9,6.12]),ij=start.map((v,i)=>Math.round((v-(i?4.44:13.7))/.02)),q=[ij],seen=new Set([ij.join(',')]);
   if(!valid(...xy(ij)))return{invalidStart:true};
   for(let p=0;p<q.length;p++)for(const[a,b]of [[1,0],[-1,0],[0,1],[0,-1]]){const i=q[p][0]+a,j=q[p][1]+b,k=i+','+j;if(i<0||i>224||j<0||j>138||seen.has(k))continue;if(valid(...xy([i,j]))){seen.add(k);q.push([i,j]);}}
   const pts=q.map(xy),reach=t=>pts.some(p=>Math.hypot(p[0]-t[0],p[1]-t[1])<.035);
   const approach=d.sideApproach?d.approach:d.approach.map((v,i)=>v+d.pull[i]*n);
   return{waiting:reach(d.waiting),chairApproach:reach(approach),wardrobes:d.wardrobeTargets.map(reach),windowSide:reach(d.windowTarget),...(d.bedTarget?{bedSide:reach(d.bedTarget)}:{}),...(d.bookTargets?{bookshelf:d.bookTargets.map(reach)}:{}),...(targets.length?{drawerTargets:targets.map(reach)}:{})};
  }
  const routes={doorOpen:route(0,false),doorClosed:route(0,true),chairPulledAfterClosing:route(1,true),doorOpenChairPulled:route(1,false)};
  let drawerAudit=null;
  if(d.stow){routes.stowedDoorOpen=route(-1,false);routes.stowedDoorClosed=route(-1,true);}
  if(d.id==='footdesk')for(const [key,r] of Object.entries(routes)){
   if(!r.waiting||!r.chairApproach||!r.bedSide||!r.wardrobes.every(Boolean))failures.push('footdesk approach target unreachable '+key);
  }
  if(d.id==='fixedwindow')for(const [key,r] of Object.entries(routes)){
   if(!r.waiting||!r.chairApproach||!r.bedSide||!r.wardrobes.every(Boolean))failures.push('fixedwindow primary target unreachable '+key);
  }
  if(d.wallBed){
   const ext=d.wallBed.extension;
   for(const obj of objects)if(overlap(ext,obj))failures.push('unfolded bed fixed furniture collision');
   if(!contains(room.main,ext[0],ext[1])||!contains(room.main,ext[2],ext[3]))failures.push('unfolded bed outside floor');
   for(let a=0;a<=90;a++)for(let t=0;t<=.9;t+=.01)if(dist(13.96+t*Math.sin(a*Math.PI/180),6.57-t*Math.cos(a*Math.PI/180),ext)<d.doorReserve)failures.push('unfolded bed door sweep conflict');
   routes.bedOpenDoorOpen=route(0,false,[ext],[],true);
   routes.bedOpenDoorClosed=route(0,true,[ext],[],true,d.bedTarget);
   if(!routes.bedOpenDoorOpen.bedSide||!routes.bedOpenDoorClosed.bedSide)failures.push('unfolded bed left side unreachable');
   for(const key of ['doorOpen','doorClosed','chairPulledAfterClosing','doorOpenChairPulled','stowedDoorOpen','stowedDoorClosed']){const r=routes[key];if(!r.chairApproach||!r.windowSide||!r.wardrobes.every(Boolean))failures.push('folded study destination unreachable '+key);}
  }
  if(d.id==='studyfirst')for(const [key,r] of Object.entries(routes)){
   if(!r.waiting||!r.chairApproach||!r.windowSide||!r.wardrobes.every(Boolean))failures.push('studyfirst working destinations unreachable '+key);
  }
  if(d.id==='baywardrobe'){
   const r=routes.stowedDoorClosed;
   if(!r.waiting||!r.chairApproach||!r.bedSide||!r.windowSide||!r.wardrobes.every(Boolean))failures.push('baywardrobe stowed/closed target unreachable');
   for(const key of ['doorClosed','chairPulledAfterClosing'])if(!routes[key].chairApproach||!routes[key].bedSide)failures.push('baywardrobe seated approach unreachable');
   // Door-open circulation and occupied-chair access to the right wardrobe remain disclosed failures of simultaneous use.
  }
  if(d.id==='southbedwall'){
   const extended=d.bedDrawers.map(q=>[q.r[0]-q.travel,q.r[1],q.r[0],q.r[3]]),deskOpen=[d.deskDrawer.r[0],d.deskDrawer.r[3],d.deskDrawer.r[2],d.deskDrawer.r[3]+d.deskDrawer.travel],targets=[[15.20,5.94],[15.20,6.72]];
   drawerAudit={bedOpenStowedDoorOpen:route(-1,false,extended,targets),bedOpenSeated:route(0,false,extended,targets),bedOpenPulled:route(1,false,extended,targets),allOpenStowed:route(-1,false,[...extended,deskOpen],targets),extensionCM:45,doorLeafLocalGapCM:65,bedFootGapCM:Math.round((d.bed.r[1]-d.northCounter[3])*100),windowFloorAccess:false};
   for(const ext of [...extended,deskOpen]){if(!contains(room.main,ext[0],ext[1])||!contains(room.main,ext[2],ext[3]))failures.push('drawer extension outside floor');for(const obj of objects)if(overlap(ext,obj))failures.push('drawer extension fixed furniture collision');}
   for(const state of Object.values(routes))if(!state.waiting||!state.chairApproach||!state.bedSide)failures.push('southbed primary destination unreachable');
   if(!routes.stowedDoorOpen.wardrobes.every(Boolean)||!routes.stowedDoorClosed.wardrobes.every(Boolean))failures.push('wardrobe inaccessible after stowing chair');
   if(!drawerAudit.allOpenStowed.drawerTargets.every(Boolean))failures.push('bed drawers inaccessible with chair stowed');
   // Window floor access is a disclosed unsolved limitation, not a passing requirement.
  }
  if(!routes.doorOpen.waiting)failures.push('entry waiting point unreachable');
  const waitingSweepClearance=Math.hypot(d.waiting[0]-13.96,d.waiting[1]-6.57)-.9;
  if(waitingSweepClearance<.3)failures.push('waiting point inside sweep clearance');
  if(doorHits.some(Boolean))failures.push('door sweep collision');
  let privacy=null,doorReserve=null;
  if(d.doorReserve){
   let minClearance=Infinity;
   for(const n of [0,1])for(let a=0;a<=90;a+=.25)for(let t=0;t<=.90001;t+=.005){const x=13.96+t*Math.sin(a*Math.PI/180),z=6.57-t*Math.cos(a*Math.PI/180);for(const r of [...objects,shifted(n)])minClearance=Math.min(minClearance,dist(x,z,r));}
   doorReserve={radius:d.doorReserve,minClearance,remaining:minClearance-d.doorReserve,assumption:'附加包络为模型保留范围，不是现场门五金实测或操作舒适度认证'};
   if(minClearance<d.doorReserve)failures.push('door reserved envelope collision');
  }
  if(['wallbed','ward180','lwallstudy'].includes(d.id)){
   const doorBand=[room.door.hinge[1]-room.door.width,room.door.hinge[1]],headBand=[d.bed.r[1]+.14,d.bed.r[1]+.54];
   privacy={type:'straight-ahead-only',doorBand,headBand,overlap:Math.min(doorBand[1],headBand[1])>Math.max(doorBand[0],headBand[0]),diagonalVisibility:'可能可见；不作完全遮挡承诺'};
   if(privacy.overlap)failures.push('straight doorway band faces pillow zone');
   for(const state of ['doorOpen','doorClosed','chairPulledAfterClosing',...(['ward180','lwallstudy'].includes(d.id)?['doorOpenChairPulled']:[])]){
    const r=routes[state];if(!r.bedSide||!r.windowSide||!r.chairApproach||!r.wardrobes.every(Boolean))failures.push('wallbed target unreachable '+state);
   }
  }
  if(d.id==='privacy'){
   const blockers=[...d.wardrobes.map(w=>({r:w.r,height:2.4})),d.screen];let tested=0,visible=0;
   // Sample doorway width, standing eye heights and the full modeled lying-head zone.
   // Excludes the door leaf, so an open leaf cannot create a false privacy pass.
   const blocked=(a,b)=>blockers.some(o=>{let lo=0,hi=1;const mins=[o.r[0],0,o.r[1]],maxs=[o.r[2],o.height,o.r[3]];for(let k=0;k<3;k++){const dv=b[k]-a[k];if(Math.abs(dv)<1e-9){if(a[k]<mins[k]||a[k]>maxs[k])return false;}else{let u=(mins[k]-a[k])/dv,v=(maxs[k]-a[k])/dv;if(u>v)[u,v]=[v,u];lo=Math.max(lo,u);hi=Math.min(hi,v);if(lo>hi)return false;}}return hi>0&&lo<1;});
   for(let z=5.69;z<=6.55;z+=.02)for(const eye of [1.2,1.45,1.75])for(let x=16.94;x<=17.35;x+=.05)for(let headZ=4.57;headZ<=5.9;headZ+=.05)for(const y of [.65,.85,1.05]){tested++;if(!blocked([14.02,eye,z],[x,y,headZ]))visible++;}
   privacy={tested,visible,scope:'门洞平面、视高1.20/1.45/1.75m至躺卧头区；不代表进入房内或坐起后均不可见'};
   if(visible)failures.push('doorway sees lying head zone');
   if(!routes.doorClosed.chairApproach||!routes.doorClosed.wardrobes.every(Boolean))failures.push('privacy scheme primary use unreachable');
  }
  if(d.id==='cabinetwall'){
   for(const state of Object.keys(routes)){const r=routes[state];if(!r.bedSide||!r.windowSide||!r.chairApproach||!r.wardrobes.every(Boolean))failures.push('cabinetwall main destination unreachable '+state);}
   if(!routes.doorClosed.bookshelf.every(Boolean)||!routes.chairPulledAfterClosing.bookshelf.every(Boolean))failures.push('bookcase unreachable with door closed');
   const doorBand=[room.door.hinge[1]-room.door.width,room.door.hinge[1]],pillowStart=d.bed.r[1]+((d.bed.r[3]-d.bed.r[1])-.61)/2,pillowBand=[pillowStart,pillowStart+.61];
   privacy={type:'centered-single-pillow-only',doorBand,pillowBand,overlap:Math.min(doorBand[1],pillowBand[1])>Math.max(doorBand[0],pillowBand[0]),scope:'仅单个居中枕头不在门洞正向投影内；侧看、翻身/坐起未遮挡'};
   if(privacy.overlap)failures.push('cabinetwall straight doorway projection overlaps pillow');
  }
  const windowSeatAudit=d.bayJoin?{intendedRect:d.bayJoin.intendedChair,bedCollision:overlap(d.bayJoin.intendedChair,d.bed.r),scope:d.id==='footdesk'?'Edge-of-window chair. Approach-only checks; sitting, standing and turning not verified.':'Window-facing intended seat, not the obsolete south-end chair used by historical route states.',...(d.id==='footdesk'?{northWindowEdgeOffsetCM:Math.round(((d.chair[1]+d.chair[3])/2-room.bay[1])*100),seatOperationVerified:false,comfortVerified:false,windowCentered:false,completeLayoutApproved:false}:{})}:null;
  if(windowSeatAudit?.bedCollision)failures.push('window-facing intended chair overlaps bed');
  results.push({id:d.id,conditionalDemolition:d.demolish,failures,windowSeatAudit,doorHits,doorReserve,routes,drawerAudit,privacy,waitingSweepClearance,mainArea:room.mainArea,bayArea:room.bayArea,deskCM:[Math.round((d.desk.r[2]-d.desk.r[0])*100),Math.round((d.desk.r[3]-d.desk.r[1])*100)],limits:d.cost});
 }
 require('fs').writeFileSync(require('path').join(__dirname,'child-bay-options-audit.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));if(results.some(r=>r.failures.length))process.exitCode=1;
})();
