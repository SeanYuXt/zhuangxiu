// Conditional alternatives. The current whole-home scene is not mutated.
const rect=(id,label,x,z,w,d,h,color)=>({id,label,x,z,w,d,h,color});
export function makeChildStudy(dimensions,openings,current){
 const horizontal=dimensions.chains.find(c=>c.id==='bottom').segments[8];
 const vertical=dimensions.chains.find(c=>c.id==='right').segments.slice(4,7);
 const width=horizontal.printed_mm/1000,depth=vertical.reduce((s,v)=>s+v.printed_mm,0)/1000;
 const leaf=openings.opening_evidence.find(o=>o.id==='bed3').leaves[0];
 const originTop=horizontal.witness_coords_pt[0],originX=vertical[0].witness_coords_pt[0];
 const sx=width/(horizontal.witness_coords_pt[1]-originTop),sz=depth/(originX-vertical.at(-1).witness_coords_pt[1]);
 const door={x:(leaf.hinge_pdf[1]-originTop)*sx,z:(originX-leaf.hinge_pdf[0])*sz,r:.90,thickness:.05,sourceRadius:(leaf.open_tip_pdf[1]-leaf.hinge_pdf[1])*sx};
 const fromBox=(id,label,b,color)=>rect(id,label,b.min[0]-current.origin[0],b.min[2]-current.origin[1],b.max[0]-b.min[0],b.max[2]-b.min[2],b.max[1],color);
 return {width,depth,door,source:{width:'PDF 下侧链第 9 段 3500 mm',depth:'PDF 右侧链 350 + 1600 + 750 mm',bay:'右侧原飘窗不是本试排家具地面；窗扇开启、窗帘和清洁空间待核实'},options:[
  {id:'current',title:'现模型：存在实物冲突',status:'不能沿用',summary:'床底与衣柜实际重叠 90 mm；不是简单少画了一个标注。保留此项作为改前对照，不是推荐布局。',items:[fromBox('bed','现有床底',current.bedBase,'#c4b09a'),fromBox('wardrobe','现有衣柜',current.wardrobeCarcass,'#afb8a1'),fromBox('desk','现有桌椅总占位',current.groups.find(g=>g.name==='bed3-desk'),'#c6b89c')],notes:['现模型床组还包含两只床头柜，未在本简化对照重复绘制；不能将此三件图当现模型完整尺寸验收。']},
  {id:'study',title:'A · 1.2 m 床＋学习区',status:'待选择 / 紧凑型',summary:'床横向布置；保留 1300×450 mm 学习桌，衣柜 2100×600 mm。取消双床头柜，以浅台面学习功能换取收纳。',items:[rect('bed','1.2 m 床',1.37,.06,2.08,1.26,.65,'#c7b69f'),rect('wardrobe','2100 衣柜',1.35,2.05,2.10,.60,2.40,'#aeb79f'),rect('desk','1300 学习桌',.05,.05,1.30,.45,.75,'#cabb9f'),rect('chair','学习椅',.75,.42,.50,.50,.82,'#b5c0bb')],notes:['床外框暂按 2080×1260 mm，床垫 1200×2000 mm；实际产品未选型。','衣柜按移门、总深 600 mm 试排；内部净深与轨道未选型。','床与衣柜之间静态净距 730 mm；桌深只有 450 mm，不能默认容纳大型显示器。','椅子向后拉出 450 mm 单独检查。模型几何不相交不等于真实坐人、拉椅和储物操作均舒适。'],gaps:[{label:'床侧—衣柜',mm:730},{label:'桌面深度',mm:450}]},
  {id:'widebed',title:'B · 保留 1.5 m 床',status:'待选择 / 收纳减少',summary:'床改为薄框，保留较宽的入床侧；只设约 1 m 衣柜，不设独立学习桌。它不是 A 方案换个颜色。',items:[rect('bed','1.5 m 薄框床',1.56,.02,1.56,2.04,.65,'#c7b69f'),rect('wardrobe','1000 衣柜',.05,.05,.60,1.00,2.40,'#aeb79f')],notes:['床外框暂按 1560×2040 mm，需匹配 1500×2000 mm 床垫；厚软包床不能套用此尺寸。','相较 A 少 1100 mm 长衣柜，并取消独立学习桌；不能满足“房内长期独立学习”要求。','窗侧仅 380 mm，不按通道验收；窗帘、窗扇及清洁可达性未通过核验。','1 m 衣柜为横向开口、深 600 mm 的移门设想，门轨/净开口和收纳容量待选型。'],gaps:[{label:'衣柜—入床侧',mm:910},{label:'床尾—原墙',mm:640},{label:'窗侧（不是通道）',mm:380}]}
 ].map(option=>option.id==='current'?{...option,door:{x:current.openDoorPanel.min[0]-current.origin[0],z:(current.openDoorPanel.min[2]+current.openDoorPanel.max[2])/2-current.origin[1],r:current.openDoorPanel.max[0]-current.openDoorPanel.min[0],thickness:current.openDoorPanel.max[2]-current.openDoorPanel.min[2],sourceRadius:current.openDoorPanel.max[0]-current.openDoorPanel.min[0]}}:option)};
}
export function activeItems(option,pulled=false){return option.items.map(i=>({...i,z:i.z+(i.id==='chair'&&pulled?.45:0)}));}
export function doorPolygon(door,degrees){const angle=degrees*Math.PI/180,u=[Math.sin(angle),-Math.cos(angle)],v=[Math.cos(angle),Math.sin(angle)];return [[0,-1],[door.r,-1],[door.r,1],[0,1]].map(([s,t])=>[door.x+s*u[0]+t*door.thickness/2*v[0],door.z+s*u[1]+t*door.thickness/2*v[1]]);}
const polygon=i=>[[i.x,i.z],[i.x+i.w,i.z],[i.x+i.w,i.z+i.d],[i.x,i.z+i.d]];
export function overlaps(a,b){for(const p of [a,b])for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length],v=p[i],axis=[q[1]-v[1],v[0]-q[0]],pa=a.map(t=>t[0]*axis[0]+t[1]*axis[1]),pb=b.map(t=>t[0]*axis[0]+t[1]*axis[1]);if(Math.min(Math.max(...pa),Math.max(...pb))-Math.max(Math.min(...pa),Math.min(...pb))<1e-8)return false;}return true;}
export function auditOption(spec,option,pulled=false){
 const items=activeItems(option,pulled),pairs=[],doorHits=[];
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)if(overlaps(polygon(items[i]),polygon(items[j]))){
  // Chair seat/legs intentionally slide under the desk; report, do not call it an obstacle-free area.
  pairs.push({a:items[i].id,b:items[j].id,underDesk:[items[i].id,items[j].id].sort().join(',')==='chair,desk'&&!pulled});
 }
 for(const item of items)for(let angle=0;angle<=90;angle++)if(overlaps(polygon(item),doorPolygon(option.door||spec.door,angle))){doorHits.push({id:item.id,firstDegree:angle});break;}
 return {insideCore:items.every(i=>i.x>=0&&i.z>=0&&i.x+i.w<=spec.width+.0001&&i.z+i.d<=spec.depth+.0001),pairs,doorHits,scope:option.id==='current'?'现模型门片 / 柜身投影；只复现已有缺陷':'1° 抽样 900 mm 预留门扫掠与二维家具外框；非门五金实测或人体使用验收'};
}
// A 600 mm circular proxy on a 25 mm grid is an explicit design assumption,
// not an accessibility standard, actual shoulder width or continuous proof.
export function probeRoutes(spec,option,pulled=false){
 const radius=.30,step=.025,items=activeItems(option,pulled),leaf=doorPolygon(option.door||spec.door,90);
 const distSegment=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);};
 const free=(x,z)=>{
  if(x<radius-1e-8||z<radius-1e-8||x>spec.width-radius+1e-8||z>spec.depth-radius+1e-8)return false;
  if(items.some(i=>Math.hypot(Math.max(i.x-x,0,x-i.x-i.w),Math.max(i.z-z,0,z-i.z-i.d))<radius-.00001))return false;
  if(leaf.some((p,i)=>distSegment(x,z,p,leaf[(i+1)%leaf.length])<radius))return false;
  return true;
 };
 const sx=Math.round(.35/step),sz=Math.round(1.50/step),key=(x,z)=>x+','+z,queue=[[sx,sz]],parents=new Map();
 if(free(sx*step,sz*step))parents.set(key(sx,sz),null);else queue.length=0;
 for(let n=0;n<queue.length;n++){const [x,z]=queue[n];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(!parents.has(k)&&[.25,.5,.75,1].every(t=>free((x+dx*t)*step,(z+dz*t)*step))){parents.set(k,[x,z]);queue.push([nx,nz]);}}}
 const targets=option.id==='study'?[['床侧',[2.4,1.675]],['衣柜前',[2.2,1.70]],['窗前核心地面',[3.18,1.675]]]:[['床侧',[1.2,1.5]],['衣柜前',[1.0,.55]],['床尾',[2.3,2.375]],['窗前核心地面',[3.18,1.5]]];
 return targets.map(([label,point])=>{let node=point.map(v=>Math.round(v/step));const reached=parents.has(key(...node)),path=[];if(reached)while(node){path.push(node.map(v=>v*step));node=parents.get(key(...node));}return {label,reached,path:path.reverse()};});
}
