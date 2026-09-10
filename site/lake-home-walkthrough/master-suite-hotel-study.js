import * as T from './vendor/three.module.js';
import {OrbitControls,RoundedBoxGeometry} from './vendor/render-libs.js';
import {inside,overlap,doorTip,area} from './master-suite-geometry.js?v=sleep-entry-09';
const $=q=>document.querySelector(q),s=await fetch('./master-suite-hotel-spec.json?v=hotel-11').then(r=>r.json());
const f=s.furniture,master=s.spaces.find(x=>x.id==='master').polygons[0];
const checks=()=>{
 const errors=[],items=Object.entries(f),fixtures=Object.entries(s.design.bath.fixtures),u=s.design.bath.usable;
 const overlaps=(list)=>{for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)if(overlap(list[i][1].r,list[j][1].r))errors.push(list[i][0]+' 与 '+list[j][0]+' 重叠');};
 for(const[id,{r}]of items)for(let x=r[0]+.002;x<r[2];x+=.025)for(let z=r[1]+.002;z<r[3];z+=.025)if(!inside([x,z],master))errors.push(id+' 超出地面');
 overlaps(items);overlaps(fixtures);
 for(const[id,{r}]of fixtures)if(r[0]<u[0]||r[1]<u[1]||r[2]>u[2]||r[3]>u[3])errors.push(id+' 超出主卫暂估净界');
 for(const d of s.openings.filter(o=>o.kind==='door'&&o.operation!=='sliding'))for(let deg=0;deg<=90;deg++){const p=doorTip(d,deg);for(let t=0;t<=1;t+=.02){const x=d.hinge[0]+(p[0]-d.hinge[0])*t,z=d.hinge[1]+(p[1]-d.hinge[1])*t;for(const[id,{r}]of [...items,...fixtures])if(x>r[0]-.022&&x<r[2]+.022&&z>r[1]-.022&&z<r[3]+.022)errors.push(d.id+' 扫掠碰到 '+id);}}
 const sd=s.openings.find(o=>o.operation==='sliding');
 for(let t=0;t<=1;t+=.025){const r=sd.closedRect.map((v,i)=>i%2===0?v+sd.travel*t:v);for(const[id,{r:b}]of [...items,...fixtures])if(overlap(r,b))errors.push('主卫移门碰到 '+id);}
 for(const {r,label}of s.design.routes){for(let x=r[0]+.002;x<r[2];x+=.04)for(let z=r[1]+.002;z<r[3];z+=.04)if(!inside([x,z],master))errors.push(label+' 超界');for(const[id,{r:b}]of items)if(overlap(r,b))errors.push(label+' 碰到 '+id);}
 for(const [name,r]of [['洗脸站位',s.design.bath.standing],['如厕站位',s.design.bath.toiletUse]])for(const[id,{r:b}]of fixtures)if(overlap(r,b))errors.push(name+' 碰到 '+id);
 return {ok:!errors.length,errors:[...new Set(errors)],area:area(master),clearances:{left:f.bed.r[0]-2.15,right:5.35-f.bed.r[2],foot:3.4-f.bed.r[3],wardrobe:1.75-f.wardrobe.r[2],toiletToVanity:s.design.bath.fixtures.washstand.r[0]-s.design.bath.fixtures.toilet.r[2]},conditions:['主卫马桶排污新位置未确认','内侧移门待安装核验','未解决独立坐式梳妆位','恢复CAD尺寸非复尺']};
};
const audit=checks();if(!audit.ok)throw new Error(audit.errors.join(';'));
$('#metrics').innerHTML=[['睡眠主体','3.20 × 3.40m'],['套内整排衣柜','250 × 65cm'],['衣柜前局部宽度','108cm（未扣门把等）'],['床两侧 / 床尾','60、72 / 125cm'],['主卫暂估净空间','1.95 × 1.85m'],['洗漱长台面','140 × 45cm'],['马桶前缘到台面','78cm（共享使用空间）'],['主卫门洞','原85cm，拟换移门；五金净口待核']].map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('');
$('#notes').innerHTML=s.design.notes.map(n=>`<p>${n}</p>`).join('');$('#audit').textContent='拟用家具、主卫设施与移门轨迹未发现矩形重叠；洗脸与如厕使用区有交叠，按单人错时使用。排污、湿区施工和门型仍未验证。';
const Q=n=>n*100,P=ps=>ps.map(p=>p.map(Q).join(',')).join(' ');
function plan(){
 let o='<g font-family="Microsoft YaHei,system-ui" font-size="12" fill="#40473d"><style>text{paint-order:stroke;stroke:#fbfaf6;stroke-width:2px;stroke-linejoin:round}</style>';
 const text=(x,z,t,size=12)=>{if($('#labels').checked)o+=`<text x="${Q(x)}" y="${Q(z)}" text-anchor="middle" font-size="${size}">${t}</text>`;};
 const rect=(r,fill,stroke='#849084',dash='')=>o+=`<rect x="${Q(r[0])}" y="${Q(r[1])}" width="${Q(r[2]-r[0])}" height="${Q(r[3]-r[1])}" rx="2" fill="${fill}" stroke="${stroke}" ${dash}/>`;
 for(const sp of s.spaces)o+=`<polygon points="${P(sp.polygons[0])}" fill="${sp.raised?'#d7dfda':sp.context?'#e1e0d9':'#f5f2ea'}" stroke="#bab8ae"/>`;
 for(const w of s.walls){const len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),u=[(w.b[0]-w.a[0])/len,(w.b[1]-w.a[1])/len];let prev=0;const seg=(a,b,color,width)=>o+=`<line x1="${Q(w.a[0]+u[0]*a)}" y1="${Q(w.a[1]+u[1]*a)}" x2="${Q(w.a[0]+u[0]*b)}" y2="${Q(w.a[1]+u[1]*b)}" stroke="${color}" stroke-width="${width}"/>`;for(const op of s.openings.filter(x=>x.wall_id===w.id).sort((a,b)=>a.offset-b.offset)){seg(prev,op.offset,'#91948a',Q(w.thickness));if(op.kind==='window')seg(op.offset,op.offset+op.width,'#7e9da5',3);prev=op.offset+op.width;}seg(prev,len,'#91948a',Q(w.thickness));}
 const hinged=d=>{const p=doorTip(d,+$('#door').value),start=doorTip(d,0);o+=`<path d="M${Q(start[0])},${Q(start[1])} A${Q(d.width)},${Q(d.width)} 0 0 1 ${Q(p[0])},${Q(p[1])}" fill="none" stroke="#b08b71" stroke-dasharray="3 3"/><path d="M${Q(d.hinge[0])},${Q(d.hinge[1])} L${Q(p[0])},${Q(p[1])}" stroke="#977f68" stroke-width="4"/>`;};
 for(const d of s.openings.filter(o=>o.kind==='door')){if(d.operation==='sliding')rect($('#bath-door').value==='open'?d.openRect:d.closedRect,'#b5a18b');else hinged(d);}
 if($('#original').checked){rect(s.design.bath.originalToilet,'#c67f5d22','#b97550','stroke-dasharray="3 3"');hinged(s.evidence.originalBathDoor);text(1.70,.24,'原马桶示意',9);}
 for(const[id,a]of Object.entries(s.design.bath.fixtures)){rect(a.r,id==='shower'?'#a9c5c04a':'#e6ddd0','#849084',id==='shower'?'stroke-dasharray="4 3"':'');if(id==='washstand'){if($('#labels').checked)o+=`<text transform="translate(183 112) rotate(-90)" text-anchor="middle">长台140×45</text>`;}else text((a.r[0]+a.r[2])/2,(a.r[1]+a.r[3])/2,id==='toilet'?'马桶拟移位':id==='shaftReserve'?'凸起':a.label,9);}
 if($('#routes').checked){for(const {r}of s.design.routes)rect(r,'#8eae962c','#82a18b','stroke-dasharray="3 3"');rect(s.design.bath.standing,'#8eae9633');rect(s.design.bath.toiletUse,'#d1b48c33');}
 for(const[id,a]of Object.entries(f)){rect(a.r,id==='bed'?'#cbbfb0':'#d4ccbd');if(id==='wardrobe'&&$('#labels').checked)o+='<text transform="translate(35 337) rotate(-90)" text-anchor="middle">到顶整柜250 × 65cm</text>';}
 for(const x of[2.88,3.79])rect([x,.19,x+.72,.57],'#f0e8dc');
 for(const key of['seat','back','books'])rect(s.design.bayUse[key].r,'#d8c9b4');
 text(3.75,-.30,'整排衣柜 · 原床头方向 · 卧室不加深柜',14);text(3.68,1.12,'1.8 × 2m 床');text(3.68,1.36,'床框188 × 210cm',10);text(2.43,1.30,'60cm',11);text(4.97,1.32,'72cm',11);text(3.75,2.80,'床尾留空125cm',13);text(5.62,1.25,'原飘窗',10);text(1.27,3.77,'柜前108cm',11);text(1.18,2.75,'套内入口',11);text(.56,.90,'无玻璃隔断',9);text(.95,1.82,'共享湿区 · 单人使用',9);text(1.12,2.20,'原门洞 / 拟改移门',10);text(.9,5.05,'套外过道',12);text(3.50,5.42,'主卫移门与马桶移位均待核 · 不可直接据此施工',11);
 $('#plan').innerHTML=o+'</g>';
}
plan();
const renderer=new T.WebGLRenderer({canvas:$('#scene'),antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e9e5dc');const camera=new T.PerspectiveCamera(47,1,.02,50),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=.7;controls.maxDistance=20;controls.maxPolarAngle=Math.PI*.49;
scene.add(new T.HemisphereLight('#faf8f2','#aca99d',2.6));const sun=new T.DirectionalLight('#fff1db',3);sun.position.set(7,8,1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7});sun.shadow.normalBias=.015;scene.add(sun);const fill=new T.DirectionalLight('#e8eeef',1);fill.position.set(-3,5,6);scene.add(fill);
const M=c=>new T.MeshStandardMaterial({color:c,roughness:.78}),white=M('#eee9df'),greige=M('#c8c0b3'),fabric=M('#c2b7a7'),dark=M('#6c6b62'),metal=M('#85877e');const walls=[],doors=[],leaves=[],tags=[],technical=new T.Group();scene.add(technical);
function box(name,r,y,h,mat=white,parent=scene,radius=.005){const dx=r[2]-r[0],dz=r[3]-r[1],o=new T.Mesh(new RoundedBoxGeometry(dx,h,dz,3,Math.min(radius,dx/3,dz/3,h/3)),mat);o.name=name;o.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function poly(name,p,y,h,mat){const sh=new T.Shape();p.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);const o=new T.Mesh(g,mat);o.position.y=y;o.name=name;o.receiveShadow=true;scene.add(o);return o;}
function cylinder(x,y,z,r,h,mat=metal,parent=scene){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,24),mat);o.position.set(x,y+h/2,z);o.castShadow=true;parent.add(o);return o;}
function tag(t,x,y,z){const c=document.createElement('canvas');c.width=700;c.height=92;const ctx=c.getContext('2d');ctx.fillStyle='#fbfaf6e8';ctx.fillRect(0,0,700,92);ctx.fillStyle='#4e5749';ctx.font='30px Microsoft YaHei';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,350,46);const tx=new T.CanvasTexture(c),o=new T.Sprite(new T.SpriteMaterial({map:tx,transparent:true,depthTest:false,toneMapped:false}));o.renderOrder=100;o.position.set(x,y,z);o.scale.set(1.7,.224,1);tags.push(o);scene.add(o);}
function segment(w,a,b,y,h,mat){if(b-a<.001||h<=0)return;const l=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),ux=(w.b[0]-w.a[0])/l,uz=(w.b[1]-w.a[1])/l,nx=-uz*w.side*w.thickness,nz=ux*w.side*w.thickness;poly(w.id,[[w.a[0]+ux*a,w.a[1]+uz*a],[w.a[0]+ux*b,w.a[1]+uz*b],[w.a[0]+ux*b+nx,w.a[1]+uz*b+nz],[w.a[0]+ux*a+nx,w.a[1]+uz*a+nz]],y,h,mat);}
for(const sp of s.spaces)poly(sp.id,sp.polygons[0],sp.raised?0:-.06,sp.raised?s.sill:.06,M(sp.raised?'#d5cec1':sp.context?'#d5d5cb':'#ded8cb'));
const glass=new T.MeshStandardMaterial({color:'#bad0d0',transparent:true,opacity:.20,roughness:.2});
for(const w of s.walls){const m=M('#eeeae0');m.transparent=true;m.opacity=.7;walls.push(m);const len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);let prev=0;for(const op of s.openings.filter(o=>o.wall_id===w.id).sort((a,b)=>a.offset-b.offset)){segment(w,prev,op.offset,0,s.ceiling,m);if(op.kind==='door'){segment(w,op.offset,op.offset+op.width,op.height,s.ceiling-op.height,m);}else{const sill=op.sill??s.sill,top=op.top??s.windowTop;segment(w,op.offset,op.offset+op.width,0,sill,m);segment(w,op.offset,op.offset+op.width,top,s.ceiling-top,m);const narrow={...w,thickness:.018};segment(narrow,op.offset,op.offset+op.width,sill,top-sill,glass);for(const t of [op.offset,op.offset+op.width/2,op.offset+op.width-.022])segment({...w,thickness:.04},t,t+.022,sill,top-sill,metal);segment({...w,thickness:.04},op.offset,op.offset+op.width,sill,.025,metal);segment({...w,thickness:.04},op.offset,op.offset+op.width,top-.025,.025,metal);}prev=op.offset+op.width;}segment(w,prev,len,0,s.ceiling,m);}
for(const d of s.openings.filter(o=>o.kind==='door'&&o.operation!=='sliding')){const g=new T.Group();g.position.set(d.hinge[0],0,d.hinge[1]);scene.add(g);box('original-door',[0,-.022,d.width,.022],0,d.height,M('#a79783'),g);doors.push({g,d});}
// Full-depth entry wardrobe: three nominal bays, sliding facade.
function wardrobe(a){const r=a.r,h=a.height,L=r[3]-r[1],bounds=[r[1],r[1]+L*.36,r[1]+L*.60,r[3]];
 box('closet-back',[r[0],r[1],r[0]+.018,r[3]],.06,h-.06,greige);
 for(const z of bounds)box('closet-side',[r[0],z-.009,r[2]-.09,z+.009],.06,h-.06,white);
 for(const y of[.08,2.02,h-.02])box('closet-shelf',[r[0],r[1],r[2]-.09,r[3]],y,.02,white);
 for(let i=0;i<3;i++){const a=bounds[i],b=bounds[i+1];if(i<2){for(const level of(i===0?[.99,1.87]:[1.87])){box('hanging-rail',[r[0]+.27,a+.04,r[0]+.29,b-.04],level,.02,metal);for(let n=0;n<7;n++)box('clothes',[r[0]+.06,a+.06+n*(b-a-.12)/7,r[2]-.14,a+.085+n*(b-a-.12)/7],i===0?level-.73:.36,i===0?.68:1.43,n%2?fabric:greige);}}else{for(const y of[.13,.35,.57,1.12,1.54])box('fold-drawer-shelf',[r[0]+.03,a+.025,r[2]-.11,b-.025],y,y<.7?.18:.022,greige);}
 box('top-soft-storage',[r[0]+.04,a+.04,r[2]-.13,b-.04],2.07,.30,fabric);
 const z=r[1]+i*L/3,g=new T.Group();scene.add(g);box('sliding-front',[r[2]-.04-(i%2)*.025,z+.005,r[2]-.02-(i%2)*.025,z+L/3-.005],.08,h-.09,i===1?greige:white,g);box('short-pull',[r[2]-.017,z+L/3-.04,r[2]-.010,z+L/3-.02],.97,.23,metal,g);leaves.push({g,i,move:L/3-.05});}
 box('closet-scribe',r,h,s.ceiling-h,white);
}
wardrobe(f.wardrobe);
// Bed rotates// Original bed-head direction; the frame remains 188 × 210cm.
const b=f.bed.r,bg=new T.Group();bg.position.set(b[0],0,b[1]);bg.rotation.y=0;scene.add(bg);
box('bed-plinth',[.12,.14,1.76,1.99],.07,.15,dark,bg,.03);box('bed-frame',[0,0,1.88,2.10],.22,.12,fabric,bg,.03);box('mattress',[.04,.065,1.84,2.065],.34,.23,white,bg,.04);box('duvet',[.025,.52,1.855,2.08],.56,.08,M('#e1d9cc'),bg,.05);box('throw',[.025,1.49,1.855,1.94],.64,.025,fabric,bg,.015);for(const x of[.12,1.01])box('pillow',[x,.15,x+.73,.54],.56,.13,white,bg,.06);box('headboard',[0,0,1.88,.08],.3,.92,fabric,bg,.04);
box('continuous-head-panel',[2.20,.003,4.91,.030],.12,2.15,M('#d4cbbd'),scene,.012);box('head-datum',[2.22,.033,4.89,.05],1.20,.018,greige);box('head-ceiling-trim',[2.17,0,4.93,.10],2.47,.13,white);
const luminous=new T.MeshStandardMaterial({color:'#fff3d5',emissive:'#ffdb9c',emissiveIntensity:1.1});box('head-indirect-light',[2.23,.105,4.87,.117],2.455,.012,luminous);cylinder(3.75,2.47,1.65,.32,.055,white);cylinder(3.75,2.455,1.65,.28,.008,luminous);
for(const id of['nightstand','rightTable']){const a=f[id];box(id,a.r,.12,a.height-.12,greige,scene,.022);}
const bay=s.design.bayUse;for(const key of['seat','back']){const a=bay[key];box('bay-'+key,a.r,a.base,a.height,fabric,scene,.025);}const br=bay.books.r,by=bay.books.base;box('bay-book-base',br,by,.02,white);for(let i=0;i<5;i++)box('bay-books',[br[0]+.03+i*.04,br[1]+.025,br[0]+.058+i*.04,br[3]-.025],by+.02,.16,greige);
const sd=s.openings.find(o=>o.operation==='sliding'),slide=new T.Group();scene.add(slide);box('proposed-bath-sliding-door',sd.closedRect,0,2.1,M('#b9ac99'),slide);box('sliding-door-recessed-handle',[1.76,1.959,1.78,1.965],.95,.23,metal,slide);box('bath-track',[.14,1.94,2.01,2.015],2.13,.055,greige);
const bath=s.design.bath,wr=bath.fixtures.washstand.r;
box('wet-vanity-carcass',wr,.25,.57,greige);box('vanity-counter',wr,.82,.03,white,scene,.009);
for(const z of[.88,1.34])box('vanity-joint',[wr[0]-.001,z,wr[0]+.002,z+.004],.27,.52,metal);
const sink=[1.64,.60,2.01,1.13];box('basin-bottom',sink,.85,.015,M('#d4d7d0'));for(const r of[[1.62,.58,2.03,.61],[1.62,1.12,2.03,1.15],[1.62,.61,1.65,1.12],[2.00,.61,2.03,1.12]])box('basin-rim',r,.85,.095,white,scene,.012);
cylinder(1.97,.85,.50,.014,.22,metal);box('basin-tap',[1.82,.488,1.985,.512],1.045,.025,metal);
box('long-bath-mirror',[2.024,.45,2.04,1.79],1.04,.98,M('#b2c5c3'));box('mirror-top-light',[2.005,.46,2.02,1.78],2.03,.018,luminous);
box('care-tray',[1.79,1.34,1.99,1.70],.85,.015,greige);for(let i=0;i<4;i++)cylinder(1.90,.865,1.40+i*.075,.018,.10+i*.008,i%2?white:greige);
const wc=bath.fixtures.toilet.r;box('toilet-cistern',[wc[0],wc[1]+.015,wc[0]+.17,wc[3]-.015],.06,.70,white,scene,.035);box('toilet-pedestal',[wc[0]+.20,wc[1]+.04,wc[2]-.055,wc[3]-.04],.06,.33,white,scene,.09);const seat=cylinder(.53,.39,1.33,.18,.05,white);seat.scale.x=1.43;const hole=cylinder(.54,.442,1.33,.112,.003,M('#cdd3cc'));hole.scale.x=1.5;
const shaft=bath.fixtures.shaftReserve;box('retained-shaft',shaft.r,0,2.4,white);box('shower-wet-floor',bath.fixtures.shower.r,.002,.003,M('#cad4ce'));
cylinder(.13,.80,.55,.016,1.28,metal);box('shower-arm',[.13,.535,.43,.565],2.055,.023,metal);cylinder(.40,2.04,.55,.105,.018,metal);box('shower-mixer',[.11,.46,.17,.64],.96,.08,metal);box('drain-symbol',[.22,.23,.32,.33],.008,.004,metal);
const original=new T.Group();scene.add(original);const oldWC=bath.originalToilet;box('original-wc-evidence',oldWC,.015,.025,new T.MeshBasicMaterial({color:'#b77850',wireframe:true}),original);const od=s.evidence.originalBathDoor,og=new T.Group();og.position.set(...[od.hinge[0],0,od.hinge[1]]);og.rotation.y=-(od.closedAngle+Math.PI/2);original.add(og);box('old-door-evidence',[0,-.02,od.width,.02],0,od.height,new T.MeshBasicMaterial({color:'#b77850',wireframe:true}),og);
// Original guardrail kept// Original guardrail kept; elevation and operational envelope still require site verification.
for(let z=-.48;z<2.28;z+=.16)box('original-guardrail',[5.81,z,5.83,z+.016],s.sill,.62,metal);box('guardrail-top',[5.80,-.5,5.84,2.29],1.17,.023,metal);
for(const{r}of s.design.routes)box('route',r,.009,.008,new T.MeshBasicMaterial({color:'#83aa91',transparent:true,opacity:.22}),technical);
for(const r of[bath.standing,bath.toiletUse])box('shared-use-zone',r,.014,.006,new T.MeshBasicMaterial({color:'#bd9f72',transparent:true,opacity:.20}),technical);
tag('入口整柜250 × 65',.36,2.73,3.27);tag('床侧60 / 72cm · 床尾125cm',3.75,.07,2.66);tag('主卫条件方案 · 排污 / 移门待核',1.05,2.58,1.11);
let view='plan';const positions={whole:[[8.9,8.2,9.3],[2.95,.65,2.2]],top:[[2.9,11,2.21],[2.9,0,2.20]],entry:[[1.10,1.76,3.59],[3.50,1.15,1.33]],wardrobe:[[1.53,1.85,4.30],[.35,1.30,3.19]],window:[[3.31,1.91,2.93],[5.42,.94,1.30]],bed:[[4.62,2.06,3.23],[3.57,1.0,.52]],bath:[[1.50,2.60,2.85],[1.02,.70,.86]]};
function resize(){const r=$('#viewer').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
function state(){for(const {g,d}of doors)g.rotation.y=-(d.closedAngle+d.sweep*$('#door').value*Math.PI/180);for(const{g,i,move}of leaves){g.position.z=$('#cabinet').value==='slide'&&i===0?move:0;g.visible=$('#cabinet').value!=='inside';}slide.position.x=$('#bath-door').value==='open'?sd.travel:0;original.visible=$('#original').checked;technical.visible=$('#routes').checked;tags.forEach(t=>t.visible=$('#labels').checked);walls.forEach(m=>m.opacity=$('#opacity').value/100);plan();}
function choose(id){view=id;const cut=['whole','top'].includes(id);scene.children.forEach(o=>{if(['foot-wall','entry-side','entry-wall'].includes(o.name))o.visible=!cut;if(o.name==='bath-door-wall')o.visible=!(cut||id==='bath');});$('#plan').hidden=id!=='plan';$('#scene').hidden=id==='plan';document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));if(id!=='plan'){const[p,t]=positions[id]||positions.whole;camera.position.set(...p);controls.target.set(...t);camera.fov=['entry','bath','wardrobe'].includes(id)?58:47;camera.updateProjectionMatrix();controls.update();resize();}$('#caption').textContent=id==='plan'?'条件尺寸平面 · 原主卫门型与马桶需要调整':id==='bath'?'主卫剖视 · 无玻璃隔断 · 马桶移位与移门未核实':'同尺寸模型 · 总览剖去前景墙，室内视角恢复 · 施工条件待核';}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>choose(b.dataset.view));document.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',state));new ResizeObserver(resize).observe($('#viewer'));state();choose(new URLSearchParams(location.search).get('view')||'plan');
function animate(){requestAnimationFrame(animate);if(view!=='plan'){controls.update();renderer.render(scene,camera);}}animate();window.masterHotel={ready:true,spec:s,audit,choose};
