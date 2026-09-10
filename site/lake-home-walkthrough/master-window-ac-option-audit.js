import {inside,overlap,doorTip,area} from './master-suite-geometry.js?v=sleep-entry-09';
const pts=r=>[[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]];
export function optionAudit(s){
 const f=s.furniture,o=s.design.windowOption,poly=s.spaces.find(p=>p.id==='master').polygons[0],errors=[];
 const entries=Object.entries(f),solid=entries.filter(([id])=>id!=='chair');
 for(const[id,q]of entries){for(let x=q.r[0]+.001;x<q.r[2];x+=.025)for(let z=q.r[1]+.001;z<q.r[3];z+=.025)if(!inside([x,z],poly))errors.push(id+'越出主卧');}
 for(let i=0;i<solid.length;i++)for(let j=i+1;j<solid.length;j++)if(overlap(solid[i][1].r,solid[j][1].r))errors.push(solid[i][0]+'碰'+solid[j][0]);
 const pulled=[...f.chair.r];pulled[0]+=o.vanity.chairPull;pulled[2]+=o.vanity.chairPull;
 for(const[id,q]of solid)if(id!=='vanity'&&overlap(pulled,q.r))errors.push('拉凳碰'+id);
 const k=o.vanity.knee;if(f.chair.r[0]<k[0]-.015||f.chair.r[2]>k[2]||f.chair.r[1]<k[1]||f.chair.r[3]>k[3]||f.chair.height>=o.vanity.kneeHeight)errors.push('收凳不在台下');
 for(const d of s.openings.filter(q=>q.kind==='door'))for(let deg=0;deg<=90;deg++){
  const p=doorTip(d,deg);for(let t=0;t<=1;t+=.01){const x=d.hinge[0]+(p[0]-d.hinge[0])*t,z=d.hinge[1]+(p[1]-d.hinge[1])*t;
   for(const[id,q]of solid)if(x>q.r[0]-.022&&x<q.r[2]+.022&&z>q.r[1]-.022&&z<q.r[3]+.022)errors.push(d.id+'碰'+id);
  }
 }
 const route=[[1.36,4.38],[1.36,3.20],[1.36,2.42]],radius=.30,blockers=[];
 for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.02);
  for(let j=0;j<=steps;j++){const x=a[0]+(b[0]-a[0])*j/steps,z=a[1]+(b[1]-a[1])*j/steps;
   for(let k=0;k<32;k++)if(!inside([x+radius*Math.cos(k*Math.PI/16),z+radius*Math.sin(k*Math.PI/16)],poly))blockers.push('通路越界');
   for(const[id,q]of [...solid,['坐姿包络',{r:o.vanity.occupied}]])if(Math.hypot(Math.max(q.r[0]-x,0,x-q.r[2]),Math.max(q.r[1]-z,0,z-q.r[3]))<radius-1e-6)blockers.push('通路碰'+id);
  }
 }
 const bathApproach=[1.10,2.051,1.95,2.35];for(const[id,q]of [...solid,['坐姿包络',{r:o.vanity.occupied}]])if(overlap(bathApproach,q.r))errors.push('主卫门前碰'+id);
 const cabinet=s.design.windowOption.cabinet,bed=f.bed.r;let openGap=Infinity;
 for(let c=0;c<8;c++){const width=cabinet.doorWidth,x=f.footCabinet.r[0]+c*.425+.002,hinge=c%2?x+width:x,side=c%2?-1:1;
  for(let deg=0;deg<=90;deg++)for(let j=0;j<=40;j++){const t=j/40,a=deg*Math.PI/180,px=hinge+side*width*t*Math.cos(a),pz=f.footCabinet.r[1]-width*t*Math.sin(a);openGap=Math.min(openGap,pz-bed[3]);if(px>bed[0]&&px<bed[2]&&pz<bed[3])errors.push('床尾柜门碰床');}
 }
 const ac=s.design.equipment.ac,gap=s.ceiling-ac.base-ac.height;
 const vol=q=>[q.r[0],q.base,q.r[1],q.r[2],q.base+q.height,q.r[3]],hit=(a,b)=>a[0]<b[3]-1e-6&&a[3]>b[0]+1e-6&&a[1]<b[4]-1e-6&&a[4]>b[1]+1e-6&&a[2]<b[5]-1e-6&&a[5]>b[2]+1e-6;
 for(const id of ['lower','upper']){const q=o.books[id];if(hit(vol(q),vol(o.header)))errors.push('书柜'+id+'碰窗上墙带');if(hit(vol(q),vol(ac)))errors.push('书柜'+id+'碰机身');}
 for(const id of ['cloth','sheer']){const c=o.curtains[id];for(let i=1;i<c.path.length;i++){const a=c.path[i-1],b=c.path[i],h=c.trackWidth/2,track={r:[Math.min(a[0],b[0])-h,Math.min(a[1],b[1])-h,Math.max(a[0],b[0])+h,Math.max(a[1],b[1])+h],base:c.trackBase,height:c.trackHeight};for(const part of ['lower','upper'])if(hit(vol(track),vol(o.books[part])))errors.push(id+'轨道碰书柜');if(hit(vol(track),vol(ac)))errors.push(id+'轨道碰机身');}}
 errors.push(...blockers);
 return {ok:errors.length===0,errors:[...new Set(errors)],area:area(poly),route,routeWidth:.60,bathDoorWidth:.85,footGap:f.footCabinet.r[1]-bed[3],openGap,vanityWidth:f.vanity.r[3]-f.vanity.r[1],wardrobeWidth:f.wardrobe.r[3]-f.wardrobe.r[1],
  installation:{ready:false,topGap:gap,provisionalRequiredTop:ac.provisionalRequiredTop,shortfall:Math.max(0,ac.provisionalRequiredTop-gap),warnings:o.warnings.filter(w=>/净高|孔|冷凝水|35cm/.test(w))},
  limits:['只校验模型包络及指定通路，非真人舒适度验收','未验证孔位、锚固、机型风量、外机与完整冷凝水排水路线']};
}
