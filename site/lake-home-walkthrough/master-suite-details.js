import {mountFootWardrobe,auditFootWardrobe,footOverlay} from './master-foot-wardrobe.js?v=closed-taper-52';
import {auditEntry} from './master-entry-storage.js?v=closed-taper-52';
import * as T from './vendor/three.module.js';
import {overlap,inside} from './master-suite-geometry.js?v=sleep-entry-09';
const rect=(r,fill,stroke='#8c9187',dash='')=>`<rect x="${r[0]*100}" y="${r[1]*100}" width="${(r[2]-r[0])*100}" height="${(r[3]-r[1])*100}" fill="${fill}" stroke="${stroke}" ${dash}/>`;
const label=(x,z,t,size=10)=>`<text x="${x*100}" y="${z*100}" text-anchor="middle" font-size="${size}" fill="#424b41">${t}</text>`;
export function chairRect(s,pull){const r=[...s.furniture.chair.r],dz=pull?s.design.vanity.chairTravel:0;return[r[0],r[1]-dz,r[2],r[3]-dz];}
function subtract(a,b){if(!overlap(a,b))return[a];const x0=Math.max(a[0],b[0]),x1=Math.min(a[2],b[2]),z0=Math.max(a[1],b[1]),z1=Math.min(a[3],b[3]);return[[a[0],a[1],x0,a[3]],[x1,a[1],a[2],a[3]],[x0,a[1],x1,z0],[x0,z1,x1,a[3]]].filter(r=>r[2]-r[0]>.0001&&r[3]-r[1]>.0001);}
export function tiles(s){const c=s.design.bath.ceiling,out=[],cuts=[...s.design.bath.fixed,...c.equipment];for(let i=0;i<c.xLines.length-1;i++)for(let j=0;j<c.zLines.length-1;j++){let parts=[[c.xLines[i],c.zLines[j],c.xLines[i+1],c.zLines[j+1]]];for(const a of cuts)parts=parts.flatMap(r=>subtract(r,a.r));out.push(...parts);}return out;}
export function routeAudit(s,pull=false){
 const poly=s.spaces.find(p=>p.id==='master').polygons[0],v=s.design.vanity,rad=v.routeRadius,items=Object.entries(s.furniture).filter(([id])=>id!=='chair').map(([id,a])=>[id,a.r]);
 items.push(['chair',chairRect(s,pull)],['return-finish',s.design.entryStorage.connection.r],['hanging',s.design.hanging.r],...s.design.styling.curtains.map((a,i)=>['curtain'+i,a.r]));
 // Closed curtain envelope is the conservative route case; top boxes do not occupy floor passage.
 if(s.design.equipment)for(const [id,q]of Object.entries({cloth:s.design.equipment.curtains.cloth,sheer:s.design.equipment.curtains.sheer}))for(let j=1;j<q.path.length;j++){
 const a=q.path[j-1],b=q.path[j],pad=q.amplitude+.002;items.push([id+'-closed-envelope',[Math.min(a[0],b[0])-pad,Math.min(a[1],b[1])-pad,Math.max(a[0],b[0])+pad,Math.max(a[1],b[1])+pad]]);
 }
 if(pull)items.push(['seated-person',v.occupied]);const blockers=new Set();
 for(let i=1;i<v.routePath.length;i++){const p=v.routePath[i-1],q=v.routePath[i],steps=Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/.015);
 for(let k=0;k<=steps;k++){const x=p[0]+(q[0]-p[0])*k/steps,z=p[1]+(q[1]-p[1])*k/steps;
 for(let t=0;t<32;t++)if(!inside([x+rad*Math.cos(t*Math.PI/16),z+rad*Math.sin(t*Math.PI/16)],poly))blockers.add('边界');
 for(const[id,r]of items)if(Math.hypot(Math.max(r[0]-x,0,x-r[2]),Math.max(r[1]-z,0,z-r[3]))<rad-.001)blockers.add(id);
 }}return{ok:!blockers.size,width:rad*2,blockers:[...blockers]};
}
export function auditDetails(s){
 const e=auditEntry(s),errors=[...e.errors],v=s.design.vanity,k=v.knee,cr=s.furniture.chair.r,fr=s.furniture.footCabinet.r,fd=s.design.footCabinet;
 const stowedRoute=routeAudit(s),occupiedRoute=routeAudit(s,true);
 if(!stowedRoute.ok)errors.push('收凳通路受阻：'+stowedRoute.blockers.join(','));
 if(cr[0]<k[0]||cr[1]<k[1]||cr[2]>k[2]||cr[3]>k[3]||s.furniture.chair.height>=v.kneeHeight)errors.push('妆凳未收入腿部净空');
 const sweep=[...cr];sweep[1]-=v.chairTravel;for(const[id,a]of Object.entries(s.furniture))if(!['chair','vanity'].includes(id)&&overlap(sweep,a.r))errors.push('拉凳碰到'+id);
 const drawer=[...v.drawer];drawer[1]-=v.drawerTravel;if(overlap(drawer,sweep))errors.push('浅抽碰妆凳');
 for(const d of [...v.shallowDrawers,v.sideDrawer]){
  const sw=[d.front[0],d.front[1]-d.travel,d.front[2],d.r[3]];
  for(const[id,q]of Object.entries(s.furniture))if(id!=='vanity'&&d.base<q.height&&overlap(sw,q.r))errors.push(d.id+'扫掠碰'+id);
  if(d.id!=='vanity-side-drawer'&&(d.base<v.kneeHeight||d.base+d.height>.715))errors.push('桌下抽屉侵占腿高或桌板');
 }
 const roomOutline=s.spaces.find(q=>q.id==='master').polygons[0];
 // A flush countertop may touch the room boundary; do not count boundary points as outside.
 const withinRoom=p=>inside(p,roomOutline)||roomOutline.some((a,i)=>{
  const b=roomOutline[(i+1)%roomOutline.length],dx=b[0]-a[0],dz=b[1]-a[1],len2=dx*dx+dz*dz;
  const t=len2?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/len2)):0;
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz)<=1e-7;
 });
 if(v.top.polygon.some(p=>!withinRoom(p)))errors.push('连续台面越出房间');
 if(fd.niche)errors.push('不应保留柜侧洞口');
 if(Math.abs(v.top.base+v.top.height-fd.connection.datum)>.00001)errors.push('台面与柜侧接缝未对齐');
 const wardrobeAudit=auditFootWardrobe(s);errors.push(...wardrobeAudit.errors);
 const corner=s.design.entryCorner,er=s.furniture.entryCorner.r,cp=corner.polygon;
 if(JSON.stringify(cp)!==JSON.stringify(s.furniture.entryCorner.polygon))errors.push('转角平面与3D边界不一致');
 if(cp.some(([x,z])=>x<er[0]||x>er[2]||z<er[1]||z>er[3]))errors.push('转角边界超界');
 if(inside([er[0]+.02,er[1]+.02],cp))errors.push('入口柜角未实际退让');
 const bk=s.design.bayUse.books;if(Math.abs(bk.base+bk.height-s.ceiling)>.001)errors.push('飘窗书柜未到顶');
 const mirror=s.design.styling.skinCabinet;if(mirror.mirrorX[1]+mirror.doorTravel>mirror.r[2]-.015)errors.push('梳妆镜滑动超界');
 const eq=s.design.bath.ceiling.equipment;for(const q of eq)for(const fixed of s.design.bath.fixed)if(overlap(q.r,fixed.r))errors.push('顶面设备碰围合区');
 return{...e,wardrobeAudit,errors,stowedRoute,occupiedRoute,bedMattress:s.furniture.bed.mattress,bedFrame:[s.furniture.bed.r[2]-s.furniture.bed.r[0],s.furniture.bed.r[3]-s.furniture.bed.r[1]],footDepth:fr[3]-fr[1],footGap:fr[1]-s.furniture.bed.r[3],footInteriorDepth:fr[3]-fr[1]-fd.frontReserve-fd.backThickness,fullWallWidth:s.furniture.vanity.r[2]-er[0],lowGap:s.furniture.vanity.r[1]-s.furniture.bed.r[3],closedWidth:fr[2]-fr[0],cornerSpan:er[2]-er[0],cornerCut:corner.cutApprox,cornerClipped:!inside([er[0]+.02,er[1]+.02],cp),kneeWidth:k[2]-k[0],kneeDepth:k[3]-k[1],kneeHeight:v.kneeHeight,bookTop:bk.base+bk.height};
}
export function detailOverlay(s,{pull,drawer,leftDrawer,rightDrawer,points,labels,routes,footMode,lowMode,dryUse,hairPull}){
 let out='',v=s.design.vanity,cr=chairRect(s,pull);
 out+='<polygon points="'+v.top.polygon.map(p=>p.map(x=>x*100).join(',')).join(' ')+'" fill="#d1c4b5" stroke="#887b69"/>';
 out+=rect(s.design.entryArt.r,'#b6a18b')+rect(s.design.bayUse.books.r,'#d5c8b8');
 out+=`<circle cx="${(cr[0]+cr[2])*50}" cy="${(cr[1]+cr[3])*50}" r="20" fill="#c4b3a0" stroke="#7f776b"/>`;
 if(pull)out+=rect(v.occupied,'#d3b48488');
 if(drawer)out+=rect([v.drawer[0],v.drawer[1]-v.drawerTravel,v.drawer[2],v.drawer[1]],'#d7b58b');
 for(const[i,d]of v.shallowDrawers.entries())if(i===0?leftDrawer:rightDrawer)out+=rect([d.front[0],d.front[1]-d.travel,d.front[2],d.r[3]],'#d7b58b');
 if(dryUse)out+=rect(s.design.entryStorage.standing,'#d3b48488');
 if(routes){const path=v.routePath.map(p=>p.map(n=>n*100).join(',')).join(' ');out+=`<polyline points="${path}" stroke="${pull||drawer?'#bb8d47':'#699581'}" stroke-width="60" stroke-linecap="round" stroke-linejoin="round" opacity=".13" fill="none"/><polyline points="${path}" stroke="${pull||drawer?'#a1763c':'#5f8472'}" stroke-width="2" stroke-dasharray="4 4" fill="none"/>`;}
 out+=footOverlay(s,footMode);
 if(labels)out+=label(4.71,3.08,'梳妆120×45',9)+label(1.875,3.23,'圆弧端',7)+label(3.22,3.05,'直柜220×60',10)+label(3.5,2.47,'柜前71.9cm',9)+label(5.55,2.08,'通顶书格',8);
 for(const [i,leaf]of s.design.footLow.doors.entries()){const dx=lowMode===String(i)?leaf.move:0;if(lowMode!=='inside')out+=rect([leaf.x[0]+dx,leaf.z,leaf.x[1]+dx,leaf.z+.018],'#aca69b');}
 if(points)for(const a of s.design.points){out+=`<circle cx="${a.p[0]*100}" cy="${a.p[1]*100}" r="5" fill="#607968" stroke="#fff"/>`;if(labels)out+=label(a.p[0]-.08,a.p[1]-.09,a.id,9);}return out;
}
export function ceilingPlan(s){const c=s.design.bath.ceiling;let out='<g font-family="Microsoft YaHei,system-ui">'+rect(s.design.bath.usable,'#dfdbd1');for(const r of tiles(s))out+=rect(r,'#fbfaf6','#b6b3ab');for(const a of s.design.bath.fixed)out+=rect(a.r,'#aaa08f');for(const a of c.equipment)out+=rect(a.r,a.id==='BA1'?'#c9d9ce':'#ead9bc')+label((a.r[0]+a.r[2])/2,(a.r[1]+a.r[3])/2+.025,a.id,10);out+=rect(s.design.bath.fixtures.shower.r,'none','#82a2ac','stroke-dasharray="3 3"');out+=label(.57,.65,'淋浴投影',9)+label(1.57,.45,'台盆90×45',9)+label(.23,1.64,'围合',8)+label(.23,1.78,'保留',8);out+=`<line x1="110" y1="205" x2="195" y2="205" stroke="#a5876c" stroke-width="4"/>`;out+=label(1.525,2.19,'原门洞85cm',9)+label(1.07,-.16,'主卫顶面排板 · 同平面方向',12)+label(1.07,2.42,'BA1 风暖/换气/主灯 300×600',9)+label(1.07,2.60,'CK1 可拆检修板 300×300',9)+label(1.07,2.78,'完成面暂按2.35m · 出风管终点待核',8);return out+'</g>';}
export function mountDetails({s,scene,box,cylinder,roundedFace,M,white,greige,metal,luminous}){
 const r=s.furniture.vanity.r,v=s.design.vanity,putty=M(s.design.palette.recess),ink=M(s.design.palette.dark),makeup=new T.Group();makeup.name='window-makeup';scene.add(makeup);
 const tp=v.top,shape=new T.Shape();tp.polygon.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
 const tg=new T.ExtrudeGeometry(shape,{depth:tp.height,bevelEnabled:false});tg.rotateX(-Math.PI/2);const topMesh=new T.Mesh(tg,putty);topMesh.name='continuous-cabinet-vanity-top';topMesh.position.y=tp.base;topMesh.castShadow=topMesh.receiveShadow=true;makeup.add(topMesh);
 box('window-makeup-side',[r[0],r[1],r[0]+.018,r[3]],.08,.635,white,makeup);
 for(const x of[5.015,5.318])box('makeup-pedestal-side',[x,r[1]+.02,x+.018,r[3]-.018],.08,.585,white,makeup);
 box('makeup-pedestal-back',[5.015,3.335,5.33,3.351],.08,.585,white,makeup);
 box('makeup-pedestal-low-door',[5.035,2.923,5.315,2.939],.08,.345,white,makeup);
 box('makeup-pedestal-fixed-header',[5.035,2.923,5.315,2.939],.61,.105,white,makeup);
 box('window-makeup-support',[r[0]+.018,r[3]-.05,5.015,r[3]-.02],.665,.05,metal,makeup);
 for(const x of[4.18,4.575,4.98])box('vanity-shallow-runner-support',[x,2.947,x+.01,3.28],.65,.065,white,makeup);
 const vanityDrawers=[];
 for(const d of [...v.shallowDrawers,v.sideDrawer]){
  const dg=new T.Group();dg.name=d.id;makeup.add(dg);vanityDrawers.push({d,g:dg});
  const h=d.height-.012;box('vanity-drawer-bottom',d.r,d.base,.008,white,dg);
  for(const x of[d.r[0],d.r[2]-.008])box('vanity-drawer-side',[x,d.r[1],x+.008,d.r[3]],d.base,h,white,dg);
  box('vanity-drawer-back',[d.r[0],d.r[3]-.008,d.r[2],d.r[3]],d.base,h,white,dg);
  box('vanity-drawer-face',d.front,d.base,d.height-.008,white,dg,.002);
  box('vanity-recess-pull',[d.front[0],d.front[1]+.008,d.front[2],d.front[3]],d.base+d.height-.008,.008,putty,dg);
  if(d.id!=='vanity-side-drawer'){box('makeup-flat-organizer',[d.r[0]+.015,d.r[1]+.02,d.r[2]-.015,d.r[3]-.02],d.base+.009,.025,putty,dg);
   for(let j=0;j<3;j++)box('makeup-tool-flat',[d.r[0]+.03+j*.065,d.r[1]+.04,d.r[0]+.048+j*.065,d.r[1]+.14],d.base+.034,.008,greige,dg);
  }
 }
 const sc=s.design.styling.skinCabinet,sr=sc.r,vr=s.design.styling.vanityRecess;
 box('unified-vanity-recess',vr.r,vr.base,vr.height,putty,makeup);
 const liner=s.design.footCabinet.connection.sideLiner;
 box('closed-side-vanity-liner',liner.r,liner.base,liner.height,putty,makeup);
 const band=s.design.footCabinet.connection.band;
 // Closed tapered end and continuous countertop replace the former side niche.
 box('makeup-mirror-back',[sr[0],sr[3]-.018,sr[2],sr[3]],sc.base,sc.height,putty,makeup);
 for(const x of[sr[0],4.94,sr[2]-.018])box('makeup-mirror-divider',[x,sr[1],x+.018,sr[3]],sc.base,sc.height,putty,makeup);
 for(const y of sc.shelves)box('makeup-mirror-shelf',sr,y,.015,white,makeup);
 for(let j=0;j<2;j++)for(const [i,x]of[4.27,4.49,4.72].entries())cylinder(x,sc.shelves[j]+.016,3.28,.023,[.15,.19,.17][i],greige,makeup);
 // Two deliberately different bays: closed personal items below, one open display above.
 box('makeup-small-closed-front',[4.964,3.195,5.273,3.211],.96,.275,white,makeup,.012);
 // Mirror storage front: no applied handle; recessed edge opening to be detailed.
 cylinder(5.055,1.28,3.285,.032,.18,putty,makeup);cylinder(5.18,1.28,3.285,.025,.125,white,makeup);
 box('makeup-open-soft-strip',[4.979,3.227,5.25,3.235],1.759,.009,luminous,makeup);
 const careDoor=new T.Group();makeup.add(careDoor);
 const frame=roundedFace('makeup-rounded-metal-frame',0,0,0,sc.mirrorX[1]-sc.mirrorX[0]+.024,sc.mirrorHeight+.024,.009,sc.radius+.012,M('#b5ada0'),careDoor);
 frame.rotation.y=Math.PI;frame.position.set(sc.mirrorX[1]+.012,sc.mirrorBase-.012,3.199);
 const mirror=roundedFace('window-sliding-makeup-mirror',0,0,0,sc.mirrorX[1]-sc.mirrorX[0],sc.mirrorHeight,.009,sc.radius,M('#c5cac7'),careDoor);
 mirror.rotation.y=Math.PI;mirror.position.set(sc.mirrorX[1],sc.mirrorBase,3.187);
 for(const x of[sc.mirrorX[0]+.012,sc.mirrorX[1]-.020])box('makeup-soft-light',[x,3.173,x+.006,3.181],1.20,.38,luminous,careDoor);
 box('vanity-jewelry-tray',[5.02,3.12,5.27,3.29],.752,.018,M('#d9d0c2'),makeup,.015);
 // No upper cabinet at the AC/window end; the mirror assembly stops at 1.80m.
 const wardrobe=mountFootWardrobe({s,scene,box,cylinder,M,white,greige,metal});
 const low=s.design.footLow,lowLeaves=[];
 const corner=s.design.entryCorner,er=s.furniture.entryCorner.r,ag=new T.Group();ag.name='coat-arch';scene.add(ag);
 // Same clipped footprint in plan and 3D; not a decorative hole on a square corner.
 const cornerSolid=(name,base,height,material)=>{
  const shape=new T.Shape();corner.polygon.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const geo=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});geo.rotateX(-Math.PI/2);
  const mesh=new T.Mesh(geo,material);mesh.name=name;mesh.position.y=base;mesh.castShadow=mesh.receiveShadow=true;ag.add(mesh);return mesh;
 };
 cornerSolid('integrated-curved-return',.06,2.54,white);
 const accent=(name,parent,p,target,color,intensity,angle)=>{
  const light=new T.SpotLight(color,intensity,3.5,angle,.75,1.6);light.name=name;light.userData.localLighting=true;light.position.set(...p);
  const aim=new T.Object3D();aim.position.set(...target);parent.add(aim);light.target=aim;parent.add(light);return light;
 };
 for(const x of[4.25,4.86])accent('mirror-task-light',makeup,[x,1.52,3.17],[4.58,1.20,2.65],'#fff1df',1.8,.8);
 for(const [i,q]of s.design.styling.curtains.entries()){
 const group=new T.Group();group.name='bay-curtain-'+i;scene.add(group);
 for(let z=q.r[1];z<q.r[3]-.025;z+=.034){const o=cylinder((q.r[0]+q.r[2])/2,q.base,z+.017,.024,q.height,M('#c9c1b6'),group);o.scale.x=1.35;}
 box('bay-curtain-track',q.r,q.base+q.height,.025,white,group);
 }
 const bk=s.design.bayUse.books,br=bk.r,by=bk.base;
 box('bay-end-books-back',[br[0],br[3]-.018,br[2],br[3]],by,bk.height,putty);
 for(const x of[br[0],br[2]-.018])box('bay-end-books-side',[x,br[1],x+.018,br[3]],by,bk.height,white);
 for(const y of bk.shelfHeights)box('bay-end-books-shelf',br,y,.015,white);
 // Mount spans the 2cm model gap to the retained bay end wall.
 box('bay-shelf-wall-mount',[br[0]+.03,br[3],br[2]-.03,2.30],by+.05,bk.height-.10,putty);
 for(let i=0;i<9;i++){const x=br[0]+.035+i*.038;box('reading-book',[x,br[1]+.025,x+.027,br[3]-.023],by+.015,[.25,.29,.27][i%3],i%3===0?ink:white,scene,.002);}
 cylinder(br[0]+.13,1.635,br[1]+.10,.045,.19,putty);
 box('bay-upper-closed-front',[br[0]+.006,br[1]-.001,br[2]-.006,br[1]+.017],2.065,.50,white);
 box('bay-upper-finger-gap',[br[0]+.025,br[1]-.002,br[2]-.025,br[1]+.002],2.065,.008,metal);
 box('display-object',[br[0]+.29,br[1]+.04,br[0]+.42,br[3]-.035],1.635,.15,white,scene,.025);
 box('bay-reading-lamp',[5.48,2.235,5.66,2.258],1.51,.024,metal);
 box('bay-reading-diffuser',[5.49,2.232,5.65,2.25],1.505,.006,luminous);
 accent('bay-reading-light',scene,[5.57,1.51,2.21],[5.58,.72,1.51],'#ffe7c6',2.3,.65);
 const chair=new T.Group();scene.add(chair);const cr=s.furniture.chair.r,cx=(cr[0]+cr[2])/2,cz=(cr[1]+cr[3])/2;cylinder(cx,.035,cz,.15,.325,putty,chair);cylinder(cx,.36,cz,.20,.10,M('#b5a592'),chair);
 const ceiling=new T.Group();scene.add(ceiling);const c=s.design.bath.ceiling;for(const r of tiles(s))box('aluminium-panel',[r[0]+.001,r[1]+.001,r[2]-.001,r[3]-.001],c.height,.012,white,ceiling);
 for(const a of c.equipment){box(a.id,a.r,c.height-.002,.016,a.id==='BA1'?greige:M('#d8c5a9'),ceiling);if(a.id==='BA1'){box('heater-led',[a.r[0]+.035,a.r[1]+.055,a.r[0]+.24,a.r[3]-.055],c.height-.007,.004,luminous,ceiling);for(let i=0;i<7;i++)box('heater-grille',[a.r[0]+.30,a.r[1]+.025+i*.036,a.r[2]-.025,a.r[1]+.030+i*.036],c.height-.007,.005,metal,ceiling);}}
 const points=new T.Group();scene.add(points);for(const p of s.design.points.filter(a=>a.id.startsWith('S')||a.id==='P1')){const[x,z]=p.p;box(p.id,p.face==='x'?[x-.014,z-.043,x+.006,z+.043]:[x-.043,z-.008,x+.043,z+.012],p.height-.043,.086,white,points,.005);}
 // Bedside wall lights withdrawn; no fixed fitting on the nursery side.
 return{update({pull,drawer,leftDrawer,rightDrawer,showCeiling,showPoints,careOpen,mirrorSide,footMode,lowMode}){lowLeaves.forEach((g,i)=>{g.position.x=lowMode===String(i)?low.doors[i].move:0;g.visible=lowMode!=='inside';});wardrobe.update(footMode);chair.position.z=pull?-v.chairTravel:0;vanityDrawers.forEach(({d,g},i)=>g.position.z=(i===0?leftDrawer:i===1?rightDrawer:drawer)?-d.travel:0);careDoor.position.x=careOpen?sc.doorTravel:0;ceiling.visible=showCeiling;points.visible=showPoints;}};
}
