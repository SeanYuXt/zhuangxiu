import * as T from './vendor/three.module.js';
import {inside,overlap} from './master-suite-geometry.js?v=sleep-entry-09';

export const leafOpen=(leaf,mode)=>mode==='all'||(mode==='quilt'?leaf.reachesQuilt:mode===leaf.zone);
export function leafPolygon(s,leaf,angle){
 const t=angle*Math.PI/180,rot=(leaf.restAngle||0)+leaf.side*t,c=Math.cos(rot),sn=Math.sin(rot);
 return [[0,0],[leaf.side*leaf.width,0],[leaf.side*leaf.width,s.design.footCabinet.doorThickness],[0,s.design.footCabinet.doorThickness]].map(([x,z])=>[leaf.hingeX+x*c+z*sn,leaf.z-x*sn+z*c]);
}
export const footFront=(s,x)=>{const t=s.design.footCabinet.taper;return t? t.front[0]+Math.max(0,Math.min(1,(x-t.x[0])/(t.x[1]-t.x[0])))*(t.front[1]-t.front[0]):s.furniture.footCabinet.r[1];};
const rectPoly=r=>[[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]];
function intersect(a,b){
 for(const p of [a,b])for(let i=0;i<p.length;i++){
  const q=p[(i+1)%p.length],u=p[i],axis=[-(q[1]-u[1]),q[0]-u[0]];
  const aa=a.map(v=>v[0]*axis[0]+v[1]*axis[1]),bb=b.map(v=>v[0]*axis[0]+v[1]*axis[1]);
  if(Math.max(...aa)<=Math.min(...bb)+1e-8||Math.max(...bb)<=Math.min(...aa)+1e-8)return false;
 }return true;
}
export function auditFootWardrobe(s){
 const fd=s.design.footCabinet,fr=s.furniture.footCabinet.r,errors=[],hits=new Set(),room=s.spaces.find(q=>q.id==='master').polygons[0];
 const obstacles=Object.entries(s.furniture).filter(([id])=>!['footCabinet','entryCorner'].includes(id)).map(([id,q])=>({id,...q,base:0}));
 for(const [id,q]of Object.entries({screenBox:s.design.projection.housing,ac:s.design.equipment.ac}))obstacles.push({id,...q});
 if(fd.connection.return.enabled!==false)obstacles.push({id:'vanity-band-return',...fd.connection.return});
 for(const leaf of fd.doors){
  const closed=leafPolygon(s,leaf,0);if(closed.some(([x,z])=>x<fr[0]||x>fr[2]||z<footFront(s,x)-.00001||z>footFront(s,x)+fd.frontReserve+.00001))errors.push(leaf.id+'关闭越界');
  for(let deg=0;deg<=fd.maxAngle;deg++){
   const p=leafPolygon(s,leaf,deg);
   if(p.some(v=>!inside(v,room)))hits.add(leaf.id+'越出室内');
   for(const q of obstacles)if(leaf.base<q.base+q.height&&leaf.base+leaf.height>q.base&&intersect(p,rectPoly(q.r)))hits.add(leaf.id+'开启碰'+q.id);
  }
 }
 const fixedDoors=fd.doors.filter(d=>!d.upper&&d.zone==='storage');
 for(const d of fd.drawers){
  for(const r of [d.r,d.front||d.r]){
   const swept=[r[0],r[1]-d.travel,r[2],r[3]];
   for(const q of obstacles)if(d.base<q.base+q.height&&d.base+d.height>q.base&&overlap(swept,q.r))hits.add(d.id+'拉出扫掠碰'+q.id);
   for(const leaf of fixedDoors)if(d.base<leaf.base+leaf.height&&d.base+d.height>leaf.base&&intersect(leafPolygon(s,leaf,0),rectPoly(swept)))hits.add(d.id+'碰关闭柜门');
  }
 }

 for(let i=0;i<fd.drawers.length;i++)for(let j=i+1;j<fd.drawers.length;j++){const a=fd.drawers[i],b=fd.drawers[j];if(a.base<b.base+b.height&&a.base+a.height>b.base&&overlap([a.front[0],a.front[1]-a.travel,a.front[2],a.r[3]],[b.front[0],b.front[1]-b.travel,b.front[2],b.r[3]]))hits.add('抽屉之间扫掠重叠');}
 errors.push(...hits);
 const maxLeaf=Math.max(...fd.doors.filter(d=>!d.upper).map(d=>d.width));
 return {errors,doorColumns:fd.columnCount,lowerLeaves:fd.doors.filter(d=>!d.upper).length,upperLeaves:fd.doors.filter(d=>d.upper).length,drawerCount:fd.drawers.length,sections:fd.sections.map(q=>({label:q.label,width:q.x[1]-q.x[0],rails:q.rails})),maxLeafWidth:maxLeaf,openLeafToBed:Math.min(...fd.doors.flatMap(d=>Array.from({length:91},(_,a)=>Math.min(...leafPolygon(s,d,a).map(p=>p[1])))))-s.furniture.bed.r[3],interiorDepth:fr[3]-fr[1]-fd.frontReserve-fd.backThickness,quiltInnerHeight:2.50-fd.topShelf-.018,screenTopDoorGap:s.design.projection.housing.base-fd.topDoorTop,limit:'门打开后局部余距不是通道；模型避碰不是取衣舒适性或五金承载验收'};
}
export function footOverlay(s,mode){
 const fd=s.design.footCabinet;let out='';
 if(mode!=='inside')for(const d of fd.doors){
  const angle=leafOpen(d,mode)?90:0,p=leafPolygon(s,d,angle);
  out+='<polygon points="'+p.map(v=>v.map(n=>n*100).join(',')).join(' ')+'" fill="'+(angle?'#b69e78aa':'#b1a89a')+'" stroke="#877963"/>';
  if(angle)out+='<path d="M'+(d.hingeX+d.side*d.width)*100+','+d.z*100+' A'+d.width*100+','+d.width*100+' 0 0 '+(d.side===1?0:1)+' '+d.hingeX*100+','+(d.z-d.width)*100+'" fill="none" stroke="#a78c68" stroke-dasharray="3 3"/>';
 }
 if(mode.startsWith('drawer')){const d=fd.drawers[mode==='drawer'?1:Number(mode.slice(-1))];out+='<rect x="'+d.r[0]*100+'" y="'+(d.r[1]-d.travel)*100+'" width="'+(d.r[2]-d.r[0])*100+'" height="'+(d.r[3]-d.r[1])*100+'" fill="#d3aa7799" stroke="#967348"/>';}
 return out;
}
export function footElevation(s){
 const fd=s.design.footCabinet,fr=s.furniture.footCabinet.r,X=x=>45+(fr[2]-x)*235,Y=y=>625-y*215;
 const rect=(x0,x1,y0,y1,c)=>'<rect x="'+X(x1)+'" y="'+Y(y1)+'" width="'+(x1-x0)*235+'" height="'+(y1-y0)*215+'" fill="'+c+'" stroke="#a49b8d"/>';
 const tx=(x,y,t,size=14)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+size+'" fill="#45433c">'+t+'</text>';
 let out='<g font-family="Microsoft YaHei,system-ui">'+tx(325,24,'床尾柜内部 · 220cm直柜＋15cm圆弧端',19);
 for(const q of fd.sections){
  const [a,b]=q.x,c=(X(a)+X(b))/2;out+=rect(a,b,.06,2.52,'#eee8dc');
  out+=rect(a+.018,b-.018,2.028,2.50,'#d8cbb7')+tx(c,Y(2.24),'被褥 / 换季',12);
  for(const y of q.shelves)out+=rect(a+.018,b-.018,y,y+.018,'#c0b29e');
  for(const y of q.rails){out+=rect(a+.05,b-.05,y,y+.015,'#867c6d');const bottom=q.id==='long'?.30:y-.86;out+=rect(a+.09,b-.09,bottom,y-.075,'#d0c1ac');}
  if(q.id==='storage'){
   for(const d of fd.drawers)out+=rect(d.front[0],d.front[2],d.base,d.base+d.height,d.accent?'#d3cabb':'#f4f0e8')+tx((X(d.front[0])+X(d.front[2]))/2,Y(d.base+.055),d.contents,d.height<.2?10:12);
   out+=tx(c,Y(1.80),'叠放',12)+tx(c,Y(.34),'低频收纳',11);
  }else if(q.id==='long')out+=tx(c,Y(1.13),'长衣区',15)+tx(c,Y(.87),'挂杆至底板约185cm',10);
  else out+=tx(c,Y(1.47),'上短衣区',15)+tx(c,Y(.53),'下短衣区',15);
  out+=tx(c,650,Math.round((b-a)*100)+'cm · '+q.label,13);
 }
 out+=tx(325,680,'图左梳妆 ← 44双抽叠放 / 中88双短衣 / 入口88长衣 → 图右入口',12);
 out+=tx(325,706,'44cm封闭收浅柜60→45cm · 两外抽75.4 / 95.4cm',12);
 return out+'</g>';
}
export function mountFootWardrobe({s,scene,box,cylinder,M,white,greige,metal}){
 const fd=s.design.footCabinet,r=s.furniture.footCabinet.r,g=new T.Group();g.name='foot-cabinet';scene.add(g);
 const inner=r[1]+fd.frontReserve,back=r[3]-fd.backThickness,putty=M(s.design.palette.recess),leaves=[],drawers=[];
 box('foot-back',[r[0],back,r[2],r[3]],.06,2.46,putty,g);
 const slab=(name,p,base,height,material=white,parent=g)=>{
  const sh=new T.Shape(p.map(([x,z])=>new T.Vector2(x,-z))),geo=new T.ExtrudeGeometry(sh,{depth:height,bevelEnabled:false});geo.rotateX(-Math.PI/2);
  const mesh=new T.Mesh(geo,material);mesh.name=name;mesh.position.y=base;mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
 };
 const shelfPoly=(a,b,frontOffset=fd.frontReserve)=>[[a,footFront(s,a)+frontOffset],...(a<fd.taper.x[0]&&b>fd.taper.x[0]?[[fd.taper.x[0],inner]]:[]),[b,footFront(s,b)+frontOffset],[b,back],[a,back]];
 for(const x of fd.bays){const a=Math.max(r[0],x-.009),b=Math.min(r[2],x+.009);slab(x===r[2]?'foot-closed-taper-side':'foot-divider',shelfPoly(a,b),.06,2.46);}
 for(const y of [.06,fd.topShelf,2.5])slab('foot-common-shelf',shelfPoly(r[0],r[2]),y,.018);
 const face=s.furniture.footCabinet.polygon.slice(0,3),header=[...face,...[...face].reverse().map(([x,z])=>[x,z+.018])];
 slab('foot-fixed-header',header,fd.topDoorTop,2.6-fd.topDoorTop);
 slab('foot-top-scribe',s.furniture.footCabinet.polygon,2.52,.08);
 for(const q of fd.sections){
  const [a,b]=q.x,sectionInner=q.id==='storage'?footFront(s,b)+fd.frontReserve:inner;
  for(const y of q.shelves)slab('foot-adjustable-shelf',shelfPoly(a+.018,b-.018),y,.018);
  for(const y of q.rails){
   const rod=cylinder((a+b)/2-.04,y,3.069,.009,b-a-.10,metal,g);rod.rotation.z=Math.PI/2;rod.position.set((a+b)/2,y,3.069);
   for(let i=0;i<(q.id==='long'?5:7);i++){
    const x=a+.07+i*(b-a-.14)/(q.id==='long'?5:7),len=q.id==='long'?1.58:.78;
    box(q.id==='long'?'long-garment':y>1?'upper-short-garment':'lower-short-garment',[x,2.85,x+.035,3.29],y-.07-len,len,i%2?putty:greige,g,.01);
    box('foot-hanger',[x,2.859,x+.012,3.279],y-.05,.012,metal,g);
   }
  }
  const packs=q.id==='storage'?1:2;for(let i=0;i<packs;i++)box(q.id==='storage'?'small-seasonal-box':'foot-quilt-bag',[a+.04+i*(b-a-.08)/packs,sectionInner+.025,a+.04+(i+1)*(b-a-.08)/packs-.02,back-.025],2.05,.34,i?putty:greige,g,.04);
  if(q.id==='storage')for(const y of q.shelves.filter(y=>y>1.6))for(let i=0;i<3;i++)box('folded-storage',[a+.07,sectionInner+.015,b-.07,back-.03],y+.018+i*.075,.067,i%2?white:putty,g,.018);
 }
 for(const leaf of fd.doors){
  const dg=new T.Group();dg.name='hinged-'+leaf.id;dg.position.set(leaf.hingeX,0,leaf.z);g.add(dg);leaves.push({g:dg,leaf});
  const min=leaf.side===1?0:-leaf.width,max=leaf.side===1?leaf.width:0;
  const outline=leaf.side===1?[[min,0],[max-.01,0],[max,.012],[max,fd.doorThickness],[min,fd.doorThickness]]:[[min,.012],[min+.01,0],[max,0],[max,fd.doorThickness],[min,fd.doorThickness]];
  const sh=new T.Shape(outline.map(([x,z])=>new T.Vector2(x,z))),geo=new T.ExtrudeGeometry(sh,{depth:leaf.height,bevelEnabled:false,steps:1});geo.rotateX(Math.PI/2);geo.translate(0,leaf.base+leaf.height,0);
  const panel=new T.Mesh(geo,leaf.accent?M(fd.accentFinish):white);panel.name='foot-hinged-leaf';panel.castShadow=true;panel.receiveShadow=true;dg.add(panel);
  for(const t of leaf.height<1?[.08,leaf.height-.08]:leaf.height<1.5?[.1,leaf.height/2,leaf.height-.1]:[.12,.65,1.2,1.75,leaf.height-.12])box('concealed-hinge',[leaf.side===1?.002:-.022,.018,leaf.side===1?.022:-.002,.047],leaf.base+t,.04,metal,dg);
 }
 const support=fd.drawerSupport;if(support)box('split-drawer-divider',support.r,support.base,support.height,white,g);
 for(const [i,d]of fd.drawers.entries()){
  const dg=new T.Group();dg.name=d.id;g.add(dg);drawers.push({g:dg,d});
  const sideHeight=Math.min(.17,d.height-.025);
  const bottomPoly=d.tapered?[[d.r[0],footFront(s,d.r[0])+.025],[d.r[2],footFront(s,d.r[2])+.025],[d.r[2],d.r[3]],[d.r[0],d.r[3]]]:rectPoly(d.r);
  slab('drawer-bottom',bottomPoly,d.base,.012,putty,dg);
  for(const x of[d.r[0],d.r[2]-.012])box('drawer-side',[x,d.tapered?footFront(s,x+.012)+.025:d.r[1],x+.012,d.r[3]],d.base,sideHeight,white,dg);
  box('drawer-back',[d.r[0],d.r[3]-.012,d.r[2],d.r[3]],d.base,sideHeight,white,dg);
  const face=d.front||[d.r[0],d.r[1]-.018,d.r[2],d.r[1]];
  if(d.tapered){
   const a=face[0],b=face[2],z0=footFront(s,a),z1=footFront(s,b);
   slab('drawer-front',[[a,z0],[b,z1],[b,z1+.018],[a,z0+.018]],d.base,d.height-.008,white,dg);
   slab('drawer-recess-pull',[[a,z0+.008],[b,z1+.008],[b,z1+.018],[a,z0+.018]],d.base+d.height-.008,.008,putty,dg);
  }else{
  const bottom=d.base,top=d.base+d.height,front=face[1],back=face[3];
  const profile=[[-front,bottom],[-front,top-.012],[-front-.012,top],[-back,top],[-back,bottom]];
  const sh=new T.Shape(profile.map(([z,y])=>new T.Vector2(z,y))),geo=new T.ExtrudeGeometry(sh,{depth:face[2]-face[0],bevelEnabled:false,steps:1});geo.rotateY(Math.PI/2);geo.translate(face[0],0,0);
  const panel=new T.Mesh(geo,d.accent?M(fd.accentFinish):white);panel.name='drawer-front';panel.castShadow=true;panel.receiveShadow=true;dg.add(panel);
  }
  const count=d.r[2]-d.r[0]>.5?2:1,cell=(d.r[2]-d.r[0]-.04)/count;
  for(let j=0;j<count;j++)box('drawer-organizer',[d.r[0]+.02+j*cell,d.r[1]+.035,d.r[0]+.02+(j+1)*cell-.012,d.r[3]-.025],d.base+.01,Math.min(.07,d.height-.025),i%2?white:greige,dg,.008);
 }
 return {update(mode){
  for(const {g,leaf}of leaves){g.visible=mode!=='inside';g.rotation.y=(leaf.restAngle||0)+(leafOpen(leaf,mode)?leaf.side*Math.PI/2:0);}
  for(const [i,{g,d}]of drawers.entries())g.position.z=(mode==='drawer'&&i===1)||mode==='drawer'+i?-d.travel:0;
 }};
}
