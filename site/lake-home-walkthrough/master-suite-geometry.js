export const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-b[0]*a[1];},0))/2;
export const corners=r=>[[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]];
export const overlap=(a,b)=>Math.min(a[2],b[2])-Math.max(a[0],b[0])>1e-6&&Math.min(a[3],b[3])-Math.max(a[1],b[1])>1e-6;
export function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
export function doorTip(d,degrees=90){const t=d.closedAngle+d.sweep*degrees*Math.PI/180;return[d.hinge[0]+d.width*Math.cos(t),d.hinge[1]+d.width*Math.sin(t)];}
// The rejected window-facing option remains only as historical data. Old URLs
// must resolve to the accepted solid-headwall direction, never re-enable it.
export function resolveScheme(base,id='calm'){const s=structuredClone(base);s.scheme='calm';return s;}
export function chairRect(s,pulled=false){const r=[...s.furniture.chair.r];if(pulled){const sign=s.scheme==='lake'?1:-1;r[0]+=sign*s.furniture.chair.pull;r[2]+=sign*s.furniture.chair.pull;}return r;}
export function audit(s){
 const f=s.furniture,poly=s.spaces.find(x=>x.id==='master').polygons[0],fail=[];
 // Sample complete rectangles, not just corners (important near the L-shaped entry).
 for(const [id,{r}] of Object.entries(f))for(let x=r[0]+.002;x<r[2];x+=.025)for(let z=r[1]+.002;z<r[3];z+=.025)if(!inside([x,z],poly)){fail.push(id+' outside floor');x=r[2];break;}
 const entries=Object.entries(f);for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++)if(overlap(entries[i][1].r,entries[j][1].r))fail.push(entries[i][0]+' overlaps '+entries[j][0]);
 for(const d of s.openings.filter(x=>x.kind==='door'))for(let deg=0;deg<=90;deg++){
  const p=doorTip(d,deg);for(let t=0;t<=1;t+=.02){const x=d.hinge[0]+(p[0]-d.hinge[0])*t,z=d.hinge[1]+(p[1]-d.hinge[1])*t;for(const [id,{r}] of entries)if(x>=r[0]-.022&&x<=r[2]+.022&&z>=r[1]-.022&&z<=r[3]+.022)fail.push(d.id+' sweep hits '+id);}
 }
 const pulled=chairRect(s,true);for(const [id,{r}]of entries)if(id!=='chair'&&overlap(pulled,r))fail.push('pulled chair hits '+id);
 // Raised-window accessories stay on the existing sill, never in the aisle.
 if(s.design.bayUse){const bay=s.spaces.find(p=>p.id==='bay').polygons[0];for(const key of ['seat','back','books']){const r=s.design.bayUse[key].r;for(const pt of corners([r[0]+.001,r[1]+.001,r[2]-.001,r[3]-.001]))if(!inside(pt,bay))fail.push('bay '+key+' outside raised sill');if(r[2]>5.81)fail.push('bay '+key+' overlaps modeled rail');}}
 if(s.design.storage){for(const key of ['sideDrawers','jewelryDrawer']){const item=s.design.storage[key],open=[item.r[0]-item.pull,item.r[1],item.r[2]-item.pull,item.r[3]];for(const pt of corners(open))if(!inside(pt,poly))fail.push(key+' opened outside floor');for(const [id,{r}] of entries)if(!['vanity','chair'].includes(id)&&overlap(open,r))fail.push(key+' opened hits '+id);if(overlap(open,pulled))fail.push(key+' opened hits pulled chair');}const st=s.design.storage,k=s.design.knee;if(k.r[1]<st.sideDrawers.r[3]+.018-1e-6)fail.push('knee zone overlaps pedestal side');if(k.height>st.jewelryDrawer.bottom+1e-6)fail.push('knee height ignores jewelry drawer');}
 const bath=s.design.suite?.bath;
 if(bath){const list=Object.entries(bath.fixtures),u=bath.usable;
 for(const [id,{r}] of list)if(r[0]<u[0]||r[1]<u[1]||r[2]>u[2]||r[3]>u[3])fail.push('bath '+id+' outside provisional finish boundary');
 for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)if(overlap(list[i][1].r,list[j][1].r))fail.push('bath '+list[i][0]+' overlaps '+list[j][0]);
 const d=s.openings.find(o=>o.id==='bath-door');for(let deg=0;deg<=90;deg++){const p=doorTip(d,deg);for(let t=0;t<=1;t+=.01){const x=d.hinge[0]+(p[0]-d.hinge[0])*t,z=d.hinge[1]+(p[1]-d.hinge[1])*t;for(const [id,{r}] of list)if(x>=r[0]-.022&&x<=r[2]+.022&&z>=r[1]-.022&&z<=r[3]+.022)fail.push('bath door sweep hits '+id);}}
 for(const [id,{r}] of Object.entries(bath.useZones))for(const [item,fixture] of list)if(overlap(r,fixture.r))fail.push('bath '+id+' use zone hits '+item);
 }
 if(s.design.suite?.wash){const u=s.design.suite.wash;for(const r of[u.standing,u.passage]){for(const pt of corners(r))if(!inside(pt,poly))fail.push('wash use/passage outside master');for(const [id,{r:other}]of entries)if(overlap(r,other))fail.push('wash use/passage hits '+id);}if(overlap(u.standing,u.passage))fail.push('wash standing overlaps modeled passage');const d=s.openings.find(o=>o.id==='bath-door');for(let deg=0;deg<=90;deg++){const p=doorTip(d,deg);for(let t=0;t<=1;t+=.02){const pt=[d.hinge[0]+(p[0]-d.hinge[0])*t,d.hinge[1]+(p[1]-d.hinge[1])*t];if(inside(pt,corners(u.standing)))fail.push('bath door hits wash standing');}}}
 if(s.design.suite.linen){const r=s.design.suite.linen.standing;for(const pt of corners(r))if(!inside(pt,poly))fail.push('linen standing outside room');for(const [id,{r:other}]of entries)if(overlap(r,other))fail.push('linen standing hits '+id);if(overlap(r,pulled))fail.push('linen standing hits pulled chair');const lc=f.linenCabinet;if(s.design.suite.ceiling.footSpan[0]<lc.r[2])fail.push('foot cove overlaps linen cabinet');}
 if(s.design.suite.elevation){const e=s.design.suite.elevation;for(const key of ['wallPanel','art']){const r=e[key].r;for(const pt of corners([r[0]+.001,r[1]+.001,r[2]-.001,r[3]-.001]))if(!inside(pt,poly))fail.push('elevation '+key+' outside room');for(const [id,{r:other}]of entries)if(overlap(r,other))fail.push('elevation '+key+' hits '+id);if(overlap(r,pulled))fail.push('elevation '+key+' hits pulled chair');}}
 if(s.design.suite.threshold){const t=s.design.suite.threshold,p=t.passage;for(const pt of corners(p))if(!inside(pt,poly))fail.push('threshold route outside floor');for(const [id,{r}]of entries)if(overlap(p,r))fail.push('threshold route hits '+id);if(overlap(p,pulled))fail.push('threshold route hits pulled chair');const r=t.slab;for(const jr of[[r[0],r[1],r[2],r[1]+t.jamb],[r[0],r[3]-t.jamb,r[2],r[3]]]){if(overlap(jr,p))fail.push('threshold jamb hits route');for(const [id,{r:fr}]of entries)if(overlap(jr,fr))fail.push('threshold jamb hits '+id);} }
 const b=f.bed.r,w=f.wardrobe.r,v=f.vanity.r,k=s.design.knee;
 return {ok:fail.length===0,errors:[...new Set(fail)],area:area(poly),clearances:s.scheme==='lake'?{tightSide:b[1],openSide:3.4-b[3],windowStrip:5.35-b[2],entry:1.75-w[2],chairBack:2.15-f.chair.r[2],chairPulled:2.15-pulled[2],kneeWidth:k.r[3]-k.r[1],kneeDepth:k.r[2]-k.r[0],kneeHeight:k.height}:{threshold:s.design.suite.threshold.slab[3]-s.design.suite.threshold.slab[1]-2*s.design.suite.threshold.jamb,routeWidth:s.design.suite.threshold.passage[3]-s.design.suite.threshold.passage[1],washFront:s.design.suite.wash.backWallX-f.washstand.r[2],washOccupied:s.design.suite.wash.backWallX-s.design.suite.wash.standing[2],left:b[0]-2.15,right:5.35-b[2],foot:f.linenCabinet.r[1]-b[3],linenChair: pulled[0]-f.linenCabinet.r[2],linenDepth:f.linenCabinet.r[3]-f.linenCabinet.r[1]-s.design.suite.linen.trackDepth-s.design.suite.linen.backThickness,entry:1.75-w[2],closetRear:2.15-w[2],bedToChair:f.chair.r[1]-b[3],kneeWidth:k.r[3]-k.r[1],kneeDepth:k.r[2]-k.r[0],kneeHeight:k.height},limits:['矩形物件/门扇90°扫掠无重叠不等于人体通行验收','门把手、衣柜内部轨道、窗扇及窗帘未模拟',...(s.scheme==='lake'?s.alternative.notes:['新增被褥柜前至床尾80cm；取物与该段通行错时，真人站位尚待验收'])]};
}
export function elevationSVG(s){
 const el=s.design.suite.elevation,lc=s.furniture.linenCabinet,vr=s.furniture.vanity.r,mc=s.design.storage.mirrorCabinet;
 const scale=100,origin=s.furniture.entryReturn.r[0],H=s.design.suite.linen.topFinish*scale,fold=(5.35-origin)*scale,total=fold+(3.40-vr[1])*scale;
 const rect=(x,y,w,h,fill,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width=".6"/>`;
 const text=(x,y,t,size=7)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="#4f514a">${t}</text>`;
 let out='<g font-family="Microsoft YaHei,system-ui,sans-serif">';
 out+=rect(0,0,total,H,'#f1eee6');out+=rect(0,0,55,H,el.palette.front,'#bcb5a8');out+=rect(55,0,130,H,el.palette.front,'#bcb5a8');
 out+=rect(185,H-el.revealY*scale,total-185,el.revealY*scale-8,el.palette.panel);
 out+=`<path d="M120,8 V250 M0,${H-el.revealY*scale} H${total}" fill="none" stroke="#aaa395" stroke-width=".5"/>`;
 out+=rect(117,142,1,20,el.palette.line)+rect(122,142,1,20,el.palette.line);
 const a=el.art;out+=rect((a.r[0]-origin)*scale,H-(a.bottom+a.height)*scale,(a.r[2]-a.r[0])*scale,a.height*scale,'#ede7da','#aaa395');
 out+=rect(227,103,10,37,'#b4a38a')+rect(240,110,23,23,'#7f8276');
 const vx=fold+(3.40-vr[3])*scale,vw=(vr[3]-vr[1])*scale;
 out+=rect(vx,H-75,vw,2.5,el.palette.front,'#aaa395');
 out+=rect(vx+vw-24,H-71,22,61,el.palette.front,'#aaa395');out+=rect(vx+2,H-70,1.5,67,'#7c786f');
 const mx=fold+(3.40-mc.r[3])*scale;out+=rect(mx,H-(mc.bottom+mc.height)*scale,(mc.r[3]-mc.r[1])*scale,mc.height*scale,'#b6c4c7','#e6dfd3');
 out+=`<path d="M${fold},-5 V${H+7}" fill="none" stroke="#8a9789" stroke-width="1" stroke-dasharray="3 3"/>`;
 out+=text(27,-12,'入口浅端景')+text(120,-12,'同墙色收纳端')+text(272,-12,'薄饰面连接 · 单处展示')+text(fold+50,-12,'窗边转角');
 out+=text(27,H+17,'55×15cm')+text(120,H+17,'130cm／外深45cm')+text(272,H+17,'175cm／饰面厚2.2cm')+text(fold+50,H+17,'台面95×50cm');
 out+=text(total/2,H+34,'虚线为90°墙角：展开图只解释立面关系，不代表拉直房间。',6.5);
 out+=text(total/2,H+46,'柜前80cm与椅子后退按尺寸平面核对；浅饰面不增加储物容量。',6.5);
 return out+'</g>';
}
export function planSVG(s,{structure=false,labels=true,pulled=false,angle=90}={}){
 const ns='http://www.w3.org/2000/svg',q=n=>n*100,pts=p=>p.map(a=>a.map(q).join(',')).join(' '),font='font-family="system-ui,Microsoft YaHei,sans-serif"';
 let out=`<g ${font}><style>text{paint-order:stroke;stroke:#fbfaf6;stroke-width:3px;stroke-linejoin:round}.dim{font-size:13px;fill:#546258}.label{font-size:14px;fill:#373731}</style>`;
 for(const p of s.spaces){out+=`<polygon points="${pts(p.polygons[0])}" fill="${p.context?'#e1e1dc':p.raised?'#cdd7d6':'#f3f0e9'}" stroke="#c0bcb1" stroke-width="1"/>`;}
 for(const w of s.walls){const len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),cuts=s.openings.filter(o=>o.wall_id===w.id).sort((a,b)=>a.offset-b.offset),u=[(w.b[0]-w.a[0])/len,(w.b[1]-w.a[1])/len];let pos=0;const seg=(a,b,color,width)=>out+=`<line x1="${q(w.a[0]+u[0]*a)}" y1="${q(w.a[1]+u[1]*a)}" x2="${q(w.a[0]+u[0]*b)}" y2="${q(w.a[1]+u[1]*b)}" stroke="${color}" stroke-width="${width}"/>`;for(const o of cuts){seg(pos,o.offset,'#8f918b',q(w.thickness));if(o.kind==='window')seg(o.offset,o.offset+o.width,'#7d9caa',4);pos=o.offset+o.width;}seg(pos,len,'#8f918b',q(w.thickness));}
 for(const d of s.openings.filter(o=>o.kind==='door')){const start=doorTip(d,0),end=doorTip(d,angle);out+=`<path d="M${q(start[0])},${q(start[1])} A${q(d.width)},${q(d.width)} 0 0 1 ${q(end[0])},${q(end[1])}" stroke="#9b8570" stroke-dasharray="3 3" fill="none"/><path d="M${q(d.hinge[0])},${q(d.hinge[1])} L${q(end[0])},${q(end[1])}" stroke="#92775f" stroke-width="4"/>`;}
 const text=(x,z,t,cl='label',anchor='middle')=>out+=`<text x="${q(x)}" y="${q(z)}" text-anchor="${anchor}" class="${cl}">${t}</text>`;
 text(.80,5.13,'套外过道');
 if(s.design.suite&&!structure){for(const [id,obj]of Object.entries(s.design.suite.bath.fixtures)){const r=obj.r;out+=`<rect x="${q(r[0])}" y="${q(r[1])}" width="${q(r[2]-r[0])}" height="${q(r[3]-r[1])}" rx="3" fill="${id==='shower'?'#cee0df':'#e4d8c7'}" stroke="#8f8b7e"/>`;if(labels)text((r[0]+r[2])/2,(r[1]+r[3])/2,id==='toilet'?'马桶暂位':id==='shaftReserve'?'待核':obj.label,'dim');}if(labels){text(1.17,-.30,'主卫 · 按1.95×1.85m条件试排','dim');}}
 if(!structure){for(const [id,obj]of Object.entries(s.furniture)){const r=id==='chair'?chairRect(s,pulled):obj.r;out+=`<rect x="${q(r[0])}" y="${q(r[1])}" width="${q(r[2]-r[0])}" height="${q(r[3]-r[1])}" rx="${id==='bed'?5:2}" fill="${id==='wardrobe'?'#c2cbc7':id==='bed'?'#d0d8dc':id==='chair'?'#a8b6b8':'#deded5'}" stroke="#788681" stroke-width="1.5"/>`;if(labels){if(id==='entryReturn')text((r[0]+r[2])/2,3.55,'15cm浅端景','dim');if(id==='linenCabinet')text((r[0]+r[2])/2,3.23,'被褥柜130×45','dim');if(id==='bed')text((r[0]+r[2])/2,1.3,'1.8 × 2m床');if(id==='wardrobe'||id==='vanity'||id==='washstand')out+=`<text transform="translate(${q((r[0]+r[2])/2)} ${q((r[1]+r[3])/2)}) rotate(-90)" text-anchor="middle" class="label">${id==='wardrobe'?'衣柜':id==='washstand'?'洗漱模组':'梳妆台'} ${Math.round((r[3]-r[1])*100)} × ${Math.round((r[2]-r[0])*100)}</text>`;}}
 if(s.design.suite?.wash){const u=s.design.suite.wash.standing;out+=`<rect x="${q(u[0])}" y="${q(u[1])}" width="${q(u[2]-u[0])}" height="${q(u[3]-u[1])}" fill="#8eae9655" stroke="#73947e" stroke-dasharray="3 3"/><path d="M153,203 L153,264 L238,264" fill="none" stroke="#73947e" stroke-width="2"/>`;if(labels){text(.88,2.50,'洗脸站位','dim');text(1.64,2.86,'余96cm','dim');}}
 if(s.design.suite.threshold){const t=s.design.suite.threshold,r=t.slab;out+=`<path d="M${q(r[0])},${q(r[1])} H${q(r[2])} M${q(r[0])},${q(r[3])} H${q(r[2])}" stroke="#a9977c" stroke-width="3"/><path d="M${q((r[0]+r[2])/2)},${q(r[1]+t.jamb)} V${q(r[3]-t.jamb)}" stroke="#a9977c" stroke-width="1" stroke-dasharray="3 3"/>`;if(labels)text(2.17,2.0,'框内115cm','dim');}
 const b=s.furniture.bed.r;for(let i=0;i<2;i++){const r=s.scheme==='lake'?[b[0]+.10,b[1]+.10+i*.90,b[0]+.48,b[1]+.75+i*.90]:[b[0]+.10+i*.90,b[1]+.09,b[0]+.75+i*.90,b[1]+.47];out+=`<rect x="${q(r[0])}" y="${q(r[1])}" width="${q(r[2]-r[0])}" height="${q(r[3]-r[1])}" rx="6" fill="#eeeae2"/>`;}
 if(s.design.bayUse)for(const key of ['seat','back','books']){const r=s.design.bayUse[key].r;out+=`<rect x="${q(r[0])}" y="${q(r[1])}" width="${q(r[2]-r[0])}" height="${q(r[3]-r[1])}" rx="2" fill="${key==='seat'?'#c4b69e':'#e6dfd2'}" stroke="#8f8676"/>`;}
 }
 if(labels){text(3.75,-.21,'睡眠主体约 3.20 × 3.40m');text(5.65,1.15,'原', 'dim');text(5.65,1.36,'飘窗','dim');text(1.40,3.78,'入口','dim');text(1.40,3.99,'108cm','dim');if(!structure){if(s.scheme==='lake'){text(3.20,.23,'窄侧40cm','dim');text(4.81,1.75,'观景带105cm','dim');text(3.55,2.96,'主要床侧112cm','dim');text(1.6,2.98,pulled?'椅后39cm':'椅后84cm','dim');}else{text(2.44,1.52,'60cm','dim');text(4.99,1.55,'72cm','dim');text(3.30,2.66,'柜前到床尾80cm','dim');text(4.25,3.53,pulled?'椅子后退45cm':'椅前到床尾67cm','dim');}}text(2.3,5.63,'主卧地面约16.06㎡（含套内入口，不含主卫/飘窗）','dim');text(2.3,5.9,'原图方向 · 地理北待核 · 所标净距尚未扣现场饰面误差','dim');}
 return out+'</g>';
}
