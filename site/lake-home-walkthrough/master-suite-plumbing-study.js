import {footElevation} from './master-foot-wardrobe.js?v=closed-taper-52';
import {equipmentAudit,equipmentOverlay,mountEquipment} from './master-suite-equipment.js?v=closed-taper-52';
import {projectionAudit,projectionOverlay,mountProjection} from './master-suite-projection.js?v=closed-taper-52';
import {mountEntry,entryElevation} from './master-entry-storage.js?v=closed-taper-52';
import * as T from './vendor/three.module.js';
import {OrbitControls,RoundedBoxGeometry,RectAreaLightUniformsLib} from './vendor/render-libs.js';
import {inside,overlap,doorTip,area} from './master-suite-geometry.js?v=sleep-entry-09';
import {auditDetails,detailOverlay,ceilingPlan,mountDetails} from './master-suite-details.js?v=closed-taper-52';
const $=q=>document.querySelector(q),s=await fetch('./master-suite-plumbing-spec.json?v=closed-taper-52').then(r=>r.json());
const f=s.furniture,master=s.spaces.find(x=>x.id==='master').polygons[0];
const checks=()=>{
 const errors=[...auditDetails(s).errors,...projectionAudit(s).errors,...equipmentAudit(s).errors],items=Object.entries(f),fixtures=Object.entries(s.design.bath.fixtures),fixed=s.design.bath.fixed.map((a,i)=>['fixed'+i,a]),u=s.design.bath.usable;
 const overlaps=(list)=>{for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)if(!([list[i][0],list[j][0]].includes('chair')&&[list[i][0],list[j][0]].includes('vanity'))&&overlap(list[i][1].r,list[j][1].r))errors.push(list[i][0]+' 与 '+list[j][0]+' 重叠');};
 for(const[id,{r}]of items)for(let x=r[0]+.002;x<r[2];x+=.025)for(let z=r[1]+.002;z<r[3];z+=.025)if(!inside([x,z],master))errors.push(id+' 超出地面');
 overlaps(items);overlaps([...fixtures,...fixed]);
 for(const[id,{r}]of fixtures)if(r[0]<u[0]||r[1]<u[1]||r[2]>u[2]||r[3]>u[3])errors.push(id+' 超出主卫暂估净界');
 for(const d of s.openings.filter(o=>o.kind==='door'&&o.operation!=='sliding'))for(let deg=0;deg<=90;deg++){const p=doorTip(d,deg);for(let t=0;t<=1;t+=.02){const x=d.hinge[0]+(p[0]-d.hinge[0])*t,z=d.hinge[1]+(p[1]-d.hinge[1])*t;for(const[id,{r}]of [...items,...fixtures])if(x>r[0]-.022&&x<r[2]+.022&&z>r[1]-.022&&z<r[3]+.022)errors.push(d.id+' 扫掠碰到 '+id);}}
 for(const {r,label}of s.design.routes){for(let x=r[0]+.002;x<r[2];x+=.04)for(let z=r[1]+.002;z<r[3];z+=.04)if(!inside([x,z],master))errors.push(label+' 超界');for(const[id,{r:b}]of items)if(overlap(r,b))errors.push(label+' 碰到 '+id);}
 for(const [name,r]of [['洗脸站位',s.design.bath.standing],['如厕站位',s.design.bath.toiletUse]])for(const[id,{r:b}]of [...fixtures,...fixed])if(overlap(r,b))errors.push(name+' 碰到 '+id);
 return {ok:!errors.length,errors:[...new Set(errors)],area:area(master),clearances:{left:f.bed.r[0]-2.15,right:5.35-f.bed.r[2],foot:3.4-f.bed.r[3],wardrobe:s.design.entryStorage.connection.r[0]-f.wardrobe.r[2]},conditions:['按CAD马桶分区意图布置，实际法兰和地漏未核实','保留原内开门，如厕需关门','独立梳妆位已试排，人体使用及窗帘需现场复核','恢复CAD尺寸非复尺']};
};
const audit=checks();if(!audit.ok)throw new Error(audit.errors.join(';'));
$('#metrics').innerHTML=[["床垫 / 床框","180×190 / 188×200cm"],["衣帽区","250×65cm整排通顶衣柜"],["床尾组合","整体柜235（含圆弧15）＋梳妆120cm"],["直线衣柜段","250＋220＝470cm；圆弧15cm不计收纳"],["床尾柜内部","入口88长衣＋88双短衣＋梳妆侧44双抽；上部被褥"],["柜面分列","五列暖白门面；柜侧凹格接164cm连续台面"],["单扇实际宽度","统一43.6cm；两外抽分别在凹格上/下"],["开门使用","43.6cm门开后局部仅约28cm，不作通道"],["梳妆台","宽120×深45×高75cm"],["腿部暂排净空","宽80×深41×高65cm"],["床尾柜总深","60cm含平开门；柜内净深约55.7cm"],["床头半墙","厚4cm × 高110cm；不推床"],["高柜前净距","71.9cm；取衣占道"],["梳妆台前净距","86.9cm；化妆时不保证同时通行"],["空调所在墙","床尾柜同墙，梳妆台正上方"],["空调名义机身","沿床尾墙95cm；进深25cm；高30cm"],["机身两侧名义间距","各12.5cm；安装待机型复核"],["机底 / 机顶","210 / 240cm：非实测，仅模型试排"],["空调送风","朝卧室送风；实际风感待机型验证"],["安装未核","净高/孔位/外机/自然排水/检修"],["顶面","不做卧室吊顶；保留窗帘盒与明装设备"],["投影","80英寸示意，实际风向与幕布待核"],["现场状态","模型不是施工图，也未连接智能设备"]].map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('');
$('#notes').innerHTML=s.design.notes.map(n=>`<p>${n}</p>`).join('');
$('#audit').textContent='收凳、收幕、关抽屉时，按模型检查连续60cm通路。梳妆坐姿占床尾过道，不承诺同时通过；空调几何避碰不等于送风、排水或安装已通过。';
$('#audit').textContent+=' '+equipmentAudit(s).serviceWarnings.join('；')+'。机身放入不代表安装可行。';
$('#services').innerHTML=s.design.bath.services.map(([a,b,c])=>`<h3>${a}</h3><p>${b}</p><p class="muted">待核：${c}</p>`).join('');
const detailState=()=>({pull:$('#chair-pull').checked,drawer:$('#drawer-open').checked,leftDrawer:$('#vanity-left-open').checked,rightDrawer:$('#vanity-right-open').checked,points:$('#points').checked,labels:$('#labels').checked,routes:$('#routes').checked&&$('#foot-cabinet').value==='closed',footMode:$('#foot-cabinet').value,lowMode:$('#low-cabinet').value,dryUse:$('#dry-use').checked,hairPull:false});
$('#schedule').innerHTML='<table><thead><tr><th>编号/项目</th><th>位置与控制</th></tr></thead><tbody>'+s.design.points.map(p=>`<tr><td>${p.id} ${p.label}<br>距地暂定${Math.round(p.height*100)}cm</td><td>${p.note}</td></tr>`).join('')+s.design.bath.ceiling.equipment.map(p=>`<tr><td>${p.id} ${p.label}<br>${p.size}</td><td>${p.note}</td></tr>`).join('')+'</tbody></table>';
const Q=n=>n*100,P=ps=>ps.map(p=>p.map(Q).join(',')).join(' ');
function plan(){
 if($('#plan').dataset.foot==='true'){$('#plan').innerHTML=footElevation(s);return;}
 if($('#plan').dataset.entry==='true'){$('#plan').innerHTML=entryElevation(s);return;}
 if($('#plan').dataset.ceiling==='true'){$('#plan').innerHTML=ceilingPlan(s);return;}
 let o='<g font-family="Microsoft YaHei,system-ui" font-size="12" fill="#40473d"><style>text{paint-order:stroke;stroke:#fbfaf6;stroke-width:2px;stroke-linejoin:round}</style>';
 const text=(x,z,t,size=12)=>{if($('#labels').checked)o+=`<text x="${Q(x)}" y="${Q(z)}" text-anchor="middle" font-size="${size}">${t}</text>`;};
 const rect=(r,fill,stroke='#849084',dash='')=>o+=`<rect x="${Q(r[0])}" y="${Q(r[1])}" width="${Q(r[2]-r[0])}" height="${Q(r[3]-r[1])}" rx="2" fill="${fill}" stroke="${stroke}" ${dash}/>`;
 for(const sp of s.spaces)o+=`<polygon points="${P(sp.polygons[0])}" fill="${sp.raised?'#d7dfda':sp.context?'#e1e0d9':'#f5f2ea'}" stroke="#bab8ae"/>`;
 for(const w of s.walls){const len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),u=[(w.b[0]-w.a[0])/len,(w.b[1]-w.a[1])/len];let prev=0;const seg=(a,b,color,width)=>o+=`<line x1="${Q(w.a[0]+u[0]*a)}" y1="${Q(w.a[1]+u[1]*a)}" x2="${Q(w.a[0]+u[0]*b)}" y2="${Q(w.a[1]+u[1]*b)}" stroke="${color}" stroke-width="${width}"/>`;for(const op of s.openings.filter(x=>x.wall_id===w.id).sort((a,b)=>a.offset-b.offset)){seg(prev,op.offset,'#91948a',Q(w.thickness));if(op.kind==='window')seg(op.offset,op.offset+op.width,'#7e9da5',3);prev=op.offset+op.width;}seg(prev,len,'#91948a',Q(w.thickness));}
 const hinged=d=>{const p=doorTip(d,+$(d.id==='bath-door'?'#bath-angle':'#door').value),start=doorTip(d,0);o+=`<path d="M${Q(start[0])},${Q(start[1])} A${Q(d.width)},${Q(d.width)} 0 0 1 ${Q(p[0])},${Q(p[1])}" fill="none" stroke="#b08b71" stroke-dasharray="3 3"/><path d="M${Q(d.hinge[0])},${Q(d.hinge[1])} L${Q(p[0])},${Q(p[1])}" stroke="#977f68" stroke-width="4"/>`;};
 for(const d of s.openings.filter(o=>o.kind==='door')){if(d.operation==='sliding')rect($('#bath-door').value==='open'?d.openRect:d.closedRect,'#b5a18b');else hinged(d);}
 for(const a of s.design.bath.fixed){rect(a.r,'#9a9182');}text(.23,1.60,'保留',9);text(.23,1.78,'围合区',9);
 for(const[id,a]of Object.entries(s.design.bath.fixtures)){rect(a.r,id==='shower'?'#a9c5c04a':'#e6ddd0','#849084',id==='shower'?'stroke-dasharray="4 3"':'');if(id==='washstand'){if($('#labels').checked)o+=`<text x="157" y="34" text-anchor="middle" font-size="10">台盆90×45</text>`;}else text((a.r[0]+a.r[2])/2,(a.r[1]+a.r[3])/2,id==='toilet'?'马桶·核坑位':id==='shaftReserve'?'凸起':a.label,9);}
 if($('#routes').checked){for(const {r}of s.design.routes)rect(r,'#8eae962c','#82a18b','stroke-dasharray="3 3"');rect(s.design.bath.standing,'#8eae9633');rect(s.design.bath.toiletUse,'#d1b48c33');}
 for(const[id,a]of Object.entries(f)){if(id==='chair')continue;if(a.polygon)o+=`<polygon data-fixture="${id}" points="${P(a.polygon)}" fill="#d4ccbd" stroke="#849084"/>`;else rect(a.r,id==='bed'?'#cbbfb0':'#d4ccbd');if(id==='wardrobe'&&$('#labels').checked)o+='<text transform="translate(35 337) rotate(-90)" text-anchor="middle">整排衣柜250 × 65cm</text>';}
 for(const x of[2.88,3.79])rect([x,.19,x+.72,.57],'#f0e8dc');
 for(const key of['seat','back'])rect(s.design.bayUse[key].r,'#d8c9b4');
 text(3.75,-.30,'镜台上方挂机 · 通顶柜＋连体梳妆 · 原门不动',14);text(3.68,1.12,'1.8 × 1.9m 床');text(3.68,1.36,'暂排床框188 × 200cm',10);text(2.43,1.30,'60cm',11);text(4.97,1.32,'72cm',11);text(3.15,2.50,'高柜前71.9cm',10);text(4.83,2.78,'台前86.9cm',10);text(5.62,1.25,'原飘窗',10);text(1.27,3.77,'柜前106cm',11);text(1.18,2.75,'套内入口',11);text(.56,.90,'无玻璃隔断',9);text(1.60,1.05,'洗脸站位',9);text(1.20,2.20,'原85cm内开门',10);text(.9,5.05,'套外过道',12);text(3.50,5.42,'CAD围合区保留 · 实际法兰/地漏待核 · 非施工图',11);
 $('#plan').innerHTML=o+equipmentOverlay(s,$('#labels').checked)+detailOverlay(s,detailState())+projectionOverlay(s,$('#screen-mode').value==='down')+'</g>';
}
plan();
const renderer=new T.WebGLRenderer({canvas:$('#scene'),antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e9e5dc');const camera=new T.PerspectiveCamera(47,1,.02,50),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=.7;controls.maxDistance=20;controls.maxPolarAngle=Math.PI*.49;
const ambient=new T.HemisphereLight('#faf8f2','#aca99d',1.7);scene.add(ambient);const sun=new T.DirectionalLight('#fff1db',2.2);sun.position.set(7,8,1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7});sun.shadow.normalBias=.015;scene.add(sun);const fill=new T.DirectionalLight('#e8eeef',.65);fill.position.set(-3,5,6);scene.add(fill);
const M=c=>new T.MeshStandardMaterial({color:c,roughness:.78}),white=M(s.design.palette.white),greige=M('#c4bdb0'),fabric=M(s.design.palette.fabric),dark=M(s.design.palette.dark),metal=M('#656961');const walls=[],doors=[],leaves=[],tags=[],technical=new T.Group();scene.add(technical);
// Deterministic fine woven bump, not a wood-grain texture.
const weaveData=new Uint8Array(64*64*4);
for(let y=0;y<64;y++)for(let x=0;x<64;x++){const i=(y*64+x)*4,v=150+Math.round(22*Math.sin(x*Math.PI/2)+18*Math.cos(y*Math.PI/2));weaveData[i]=weaveData[i+1]=weaveData[i+2]=v;weaveData[i+3]=255;}
const weave=new T.DataTexture(weaveData,64,64);weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(18,18);weave.needsUpdate=true;fabric.bumpMap=weave;fabric.bumpScale=.0012;fabric.roughness=.96;
const localLights=new T.Group();localLights.name='room-lighting';scene.add(localLights);
for(const[p,intensity]of[[[3.75,2.40,1.65],7]]){
 const light=new T.PointLight('#ffe3bf',intensity,5,1.8);light.position.set(...p);localLights.add(light);
}
function lighting(){const cinema=$('#screen-mode').value==='down',evening=$('#light-scene').value==='evening'||cinema;ambient.intensity=cinema?.26:evening?.32:1.7;sun.intensity=cinema?.025:evening?.05:2.2;fill.intensity=cinema?.10:evening?.13:.65;localLights.visible=evening&&!cinema;const headLights=scene.getObjectByName('headwall-soft-lighting');if(headLights)headLights.visible=evening&&!cinema;scene.background.set(evening?'#b7b0a5':'#e9e5dc');scene.traverse(o=>{if(['corner-soft-light','mirror-task-light','vanity-canopy-light','bay-reading-light'].includes(o.name))o.visible=!cinema;});}
function roundedFace(name,x,y,z,w,h,d,r,mat,parent=scene){
 const sh=new T.Shape();sh.moveTo(r,0);sh.lineTo(w-r,0);sh.quadraticCurveTo(w,0,w,r);sh.lineTo(w,h-r);sh.quadraticCurveTo(w,h,w-r,h);sh.lineTo(r,h);sh.quadraticCurveTo(0,h,0,h-r);sh.lineTo(0,r);sh.quadraticCurveTo(0,0,r,0);const o=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false,curveSegments:24}),mat);o.name=name;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;
}
function box(name,r,y,h,mat=white,parent=scene,radius=.005){const dx=r[2]-r[0],dz=r[3]-r[1],o=new T.Mesh(new RoundedBoxGeometry(dx,h,dz,3,Math.min(radius,dx/3,dz/3,h/3)),mat);o.name=name;o.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function poly(name,p,y,h,mat){const sh=new T.Shape();p.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);const o=new T.Mesh(g,mat);o.position.y=y;o.name=name;o.receiveShadow=true;scene.add(o);return o;}
function cylinder(x,y,z,r,h,mat=metal,parent=scene){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,24),mat);o.position.set(x,y+h/2,z);o.castShadow=true;parent.add(o);return o;}
function tag(t,x,y,z){const c=document.createElement('canvas');c.width=700;c.height=92;const ctx=c.getContext('2d');ctx.fillStyle='#fbfaf6e8';ctx.fillRect(0,0,700,92);ctx.fillStyle='#4e5749';ctx.font='30px Microsoft YaHei';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,350,46);const tx=new T.CanvasTexture(c),o=new T.Sprite(new T.SpriteMaterial({map:tx,transparent:true,depthTest:false,toneMapped:false}));o.renderOrder=100;o.position.set(x,y,z);o.scale.set(1.7,.224,1);tags.push(o);scene.add(o);}
function segment(w,a,b,y,h,mat){if(b-a<.001||h<=0)return;const l=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),ux=(w.b[0]-w.a[0])/l,uz=(w.b[1]-w.a[1])/l,nx=-uz*w.side*w.thickness,nz=ux*w.side*w.thickness;poly(w.id,[[w.a[0]+ux*a,w.a[1]+uz*a],[w.a[0]+ux*b,w.a[1]+uz*b],[w.a[0]+ux*b+nx,w.a[1]+uz*b+nz],[w.a[0]+ux*a+nx,w.a[1]+uz*a+nz]],y,h,mat);}
for(const sp of s.spaces)poly(sp.id,sp.polygons[0],sp.raised?0:-.06,sp.raised?s.sill:.06,M(sp.raised?'#d5cec1':sp.context?'#d5d5cb':s.design.palette.floor));
const glass=new T.MeshStandardMaterial({color:'#bad0d0',transparent:true,opacity:.20,roughness:.2});
for(const w of s.walls){const m=M('#eeeae0');m.transparent=true;m.opacity=.7;walls.push(m);const len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);let prev=0;for(const op of s.openings.filter(o=>o.wall_id===w.id).sort((a,b)=>a.offset-b.offset)){segment(w,prev,op.offset,0,s.ceiling,m);if(op.kind==='door'){segment(w,op.offset,op.offset+op.width,op.height,s.ceiling-op.height,m);}else{const sill=op.sill??s.sill,top=op.top??s.windowTop;segment(w,op.offset,op.offset+op.width,0,sill,m);segment(w,op.offset,op.offset+op.width,top,s.ceiling-top,m);const narrow={...w,thickness:.018};segment(narrow,op.offset,op.offset+op.width,sill,top-sill,glass);for(const t of [op.offset,op.offset+op.width/2,op.offset+op.width-.022])segment({...w,thickness:.04},t,t+.022,sill,top-sill,metal);segment({...w,thickness:.04},op.offset,op.offset+op.width,sill,.025,metal);segment({...w,thickness:.04},op.offset,op.offset+op.width,top-.025,.025,metal);}prev=op.offset+op.width;}segment(w,prev,len,0,s.ceiling,m);}
for(const d of s.openings.filter(o=>o.kind==='door'&&o.operation!=='sliding')){const g=new T.Group();g.position.set(d.hinge[0],0,d.hinge[1]);scene.add(g);box('original-door',[0,-.022,d.width,.022],0,d.height,M('#a79783'),g);doors.push({g,d});}
// Bed rotates// Original bed-head direction; the frame remains 188 × 200cm.
const b=f.bed.r,bg=new T.Group();bg.position.set(b[0],0,b[1]);bg.rotation.y=0;scene.add(bg);
box('bed-plinth',[.12,.14,1.76,1.89],.07,.15,dark,bg,.03);box('bed-frame',[0,0,1.88,2.00],.22,.12,fabric,bg,.03);box('mattress',[.04,.065,1.84,1.965],.34,.23,white,bg,.04);box('duvet',[.025,.52,1.855,1.98],.56,.08,M('#e6dfd3'),bg,.05);box('throw',[.025,1.39,1.855,1.84],.64,.025,fabric,bg,.015);for(const x of[.12,1.01])box('pillow',[x,.15,x+.73,.54],.56,.13,white,bg,.06);roundedFace('soft-rounded-head',b[0],s.design.bedHead.base,b[1],1.88,s.design.bedHead.height,.08,.09,fabric);
const headStyle=s.design.styling.head;
// Rounded front corners fit entirely inside the 4cm head-wall footprint.
const headProfile=(x0,x1,z0,z1,radius)=>{
 const sh=new T.Shape();sh.moveTo(x0,-z0);sh.lineTo(x1,-z0);sh.lineTo(x1,-(z1-radius));
 sh.quadraticCurveTo(x1,-z1,x1-radius,-z1);sh.lineTo(x0+radius,-z1);
 sh.quadraticCurveTo(x0,-z1,x0,-(z1-radius));sh.closePath();return sh;
};
const headSolid=(name,y,height,z0,z1,radius,material)=>{
 const geo=new T.ExtrudeGeometry(headProfile(headStyle.r[0],headStyle.r[2],z0,z1,radius),{depth:height,bevelEnabled:false,curveSegments:20});
 geo.rotateX(-Math.PI/2);const o=new T.Mesh(geo,material);o.name=name;o.position.y=y;o.castShadow=o.receiveShadow=true;scene.add(o);return o;
};
headSolid('half-height-head-panel',0,1.079,0,.04,headStyle.frontRadius,M(s.design.palette.head));
box('head-upper-finish',[2.15,0,4.95,.002],1.10,s.ceiling-1.10,M(headStyle.upperFinish),scene,.0003);
const hs=headStyle.lightSlot,slot=hs.r;
headSolid('head-half-wall-cap',1.10-hs.lipDrop,hs.lipDrop,.027,.04,.012,M('#c9c1b5'));
box('head-cap-rear',[2.15,0,4.95,.01],1.09,.01,M('#c9c1b5'),scene,.0005);
box('head-led-channel',slot,hs.base,.003,M('#8e8679'),scene,.0003);
box('head-led-opal-diffuser',[slot[0]+.004,.012,slot[2]-.004,.025],hs.base+.004,.003,M('#efe7d5'),scene,.0003);
const headLights=new T.Group();headLights.name='headwall-soft-lighting';scene.add(headLights);
box('headwall-led-emitter',[slot[0]+.004,.012,slot[2]-.004,.025],hs.base+.007,.001,new T.MeshBasicMaterial({color:'#ffe1ac'}),headLights,.0002);
RectAreaLightUniformsLib.init();
const headWash=new T.RectAreaLight('#ffe3b9',3,slot[2]-slot[0]-.008,.012);
headWash.name='headwall-continuous-wash';headWash.position.set((slot[0]+slot[2])/2,1.092,.021);
headWash.lookAt((slot[0]+slot[2])/2,1.42,.004);headLights.add(headWash);
// Exposed ceiling, without a separate floating strip above the bed.
const luminous=new T.MeshStandardMaterial({color:'#fff3d5',emissive:'#ffdb9c',emissiveIntensity:1.1});
cylinder(3.75,2.47,1.65,.32,.055,white);cylinder(3.75,2.455,1.65,.28,.008,luminous);
// One freestanding bedside cabinet; no wall anchors or fixed units on the nursery side.
{
 const a=f.rightTable,r=a.r;
 for(const x of[r[0]+.045,r[2]-.045])for(const z of[r[1]+.045,r[3]-.045])cylinder(x,.015,z,.014,.115,metal);
 box('mobile-bedside-carcass',[r[0],r[1],r[2],r[3]-.022],.115,.419,white,scene,.014);
 box('mobile-bedside-top',r,.534,.016,M('#d3cabd'),scene,.008);
 for(const y of[.13,.332]){
 box('mobile-bedside-drawer',[r[0]+.009,r[3]-.018,r[2]-.009,r[3]],y,.182,white,scene,.008);
 box('mobile-bedside-pull',[r[0]+.12,r[3],r[2]-.12,r[3]+.003],y+.14,.01,M('#a49b8e'),scene,.003);
 }
}
const bay=s.design.bayUse;for(const key of['seat','back']){const a=bay[key];box('bay-'+key,a.r,a.base,a.height,fabric,scene,.025);}
const bath=s.design.bath;
for(const a of bath.fixed)box('cad-fixed-enclosure',a.r,0,a.height,greige);
const wc=bath.fixtures.toilet.r;box('toilet-cistern',[wc[0],wc[1]+.015,wc[0]+.17,wc[3]-.015],.06,.70,white,scene,.035);box('toilet-pedestal',[wc[0]+.20,wc[1]+.04,wc[2]-.035,wc[3]-.04],.06,.33,white,scene,.075);
const cx=(wc[0]+wc[2])/2+.08,cz=(wc[1]+wc[3])/2,seat=cylinder(cx,.39,cz,.17,.05,white);seat.scale.x=1.35;const hole=cylinder(cx+.01,.442,cz,.11,.003,M('#cdd3cc'));hole.scale.x=1.45;
box('shower-wet-floor',bath.fixtures.shower.r,.002,.003,M('#cad4ce'));
cylinder(.13,.80,.55,.016,1.28,metal);box('shower-arm',[.13,.535,.43,.565],2.055,.023,metal);cylinder(.40,2.04,.55,.105,.018,metal);box('shower-mixer',[.11,.46,.17,.64],.96,.08,metal);
// No pipe route or drain fixture is fabricated: actual outlets have not been located.
// Original guardrail kept// Original guardrail kept; elevation and operational envelope still require site verification.
for(let z=-.48;z<2.28;z+=.16)box('original-guardrail',[5.81,z,5.83,z+.016],s.sill,.62,metal);box('guardrail-top',[5.80,-.5,5.84,2.29],1.17,.023,metal);
for(const{r}of s.design.routes)box('route',r,.009,.008,new T.MeshBasicMaterial({color:'#83aa91',transparent:true,opacity:.22}),technical);
for(const r of[bath.standing,bath.toiletUse])box('shared-use-zone',r,.014,.006,new T.MeshBasicMaterial({color:'#bd9f72',transparent:true,opacity:.20}),technical);
tag('通顶书柜50cm · 顶部封闭 / 下部开放',5.50,1.23,1.80);
const entryDetails=mountEntry({s,scene,box,cylinder,roundedFace,M,white,greige,metal,luminous});
const projection=mountProjection({s,scene,box,M,white,metal});
const equipment=mountEquipment({s,scene,box,M,white,metal});
const details=mountDetails({s,scene,box,cylinder,roundedFace,M,white,greige,metal,luminous});
tag('整体柜235cm＋梳妆120cm',3.65,2.76,3.36);
tag('衣帽区：250cm整排衣柜',.36,2.73,3.27);tag('床尾71.9cm · 取衣占道',3.38,.07,2.43);tag('CAD围合区保留 · 核对实际下水',1.05,2.58,1.11);
let view='plan';const positions={join:[[4.78,1.45,1.75],[4.14,1.02,3.10]],equipment:[[3.30,2.03,2.51],[5.47,2.04,.80]],ac:[[4.15,1.78,1.15],[4.72,1.65,3.35]],arch:[[.85,1.70,2.35],[2.15,1.30,3.05]],drywall:[[3.18,1.53,3.37],[.32,1.30,3.37]],dryStorage:[[2.24,1.68,4.34],[.30,1.20,4.14]],entryArt:[[1.35,1.66,5.60],[.40,1.53,4.82]],hanging:[[.97,1.57,3.07],[1.71,1.29,3.58]],connection:[[1.18,1.72,3.04],[3.28,1.22,1.93]],dry:[[2.30,1.90,2.80],[.18,1.28,2.78]],suite:[[5.5,11,6.5],[2.85,.65,2.3]],reading:[[4.35,1.95,.42],[5.56,1.65,2.13]],room:[[2.37,2.40,.35],[4.05,1.10,2.67]],footwall:[[3.575,1.65,.20],[3.575,1.30,3.20]],vanity:[[4.70,1.65,1.10],[4.70,1.25,3.28]],whole:[[8.9,8.2,9.3],[2.95,.65,2.2]],top:[[2.9,11,2.21],[2.9,0,2.20]],entry:[[1.10,1.76,3.59],[3.50,1.15,1.33]],wardrobe:[[2.70,1.90,4.32],[.30,1.25,3.35]],window:[[3.31,1.91,2.93],[5.42,.94,1.30]],bed:[[3.55,2.12,3.23],[3.65,1.25,.05]],bath:[[1.50,2.60,2.85],[1.02,.70,.86]]};
function resize(){const r=$('#viewer').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
function state(){equipment.update({cloth:$('#cloth-closed').checked,sheer:$('#sheer-closed').checked,service:$('#equipment-service').checked});lighting();const down=$('#screen-mode').value==='down';projection.update({lower:down,light:$('#cabinet-light').checked});$('#foot-cabinet').disabled=down;if(down)$('#foot-cabinet').value='closed';entryDetails.update($('#cabinet').value,$('#dry-use').checked,false,false);details.update({pull:$('#chair-pull').checked,drawer:$('#drawer-open').checked,leftDrawer:$('#vanity-left-open').checked,rightDrawer:$('#vanity-right-open').checked,showCeiling:$('#ceiling-show').checked,showPoints:$('#points').checked,careOpen:$('#care-open').checked,mirrorSide:$('#mirror-side').value,footMode:$('#foot-cabinet').value,lowMode:$('#low-cabinet').value});$('#route-status').textContent=down?'幕布下放：先收幕再取衣；床尾上身通行受限，别从幕下钻行':$('#foot-cabinet').value!=='closed'?($('#foot-cabinet').value==='inside'?'当前为内部剖视，不代表使用时柜门消失；开门取物需占道':'当前柜门/抽屉占道：逐区取衣，关门收抽后再通行'):$('#dry-use').checked?'当前显示取衣站位；不承诺此时两人同时通过':$('#chair-pull').checked||$('#drawer-open').checked||$('#vanity-left-open').checked||$('#vanity-right-open').checked?'当前：化妆/开抽屉占道，不承诺同时通行':'当前：收凳、关抽屉，可查看60cm连续通路校验';for(const {g,d}of doors)g.rotation.y=-(d.closedAngle+d.sweep*$(d.id==='bath-door'?'#bath-angle':'#door').value*Math.PI/180);for(const{g,i,move}of leaves){g.position.z=$('#cabinet').value==='slide'&&i===0?move:0;g.visible=$('#cabinet').value!=='inside';}technical.visible=!down&&$('#foot-cabinet').value==='closed'&&$('#routes').checked&&!$('#chair-pull').checked&&!$('#drawer-open').checked&&!$('#vanity-left-open').checked&&!$('#vanity-right-open').checked;tags.forEach(t=>t.visible=$('#labels').checked);walls.forEach(m=>m.opacity=$('#opacity').value/100);plan();}
function choose(id){view=id;scene.getObjectByName('footwall-ac-system').visible=!['bed','drywall','wardrobe','dryStorage'].includes(id);if(['connection','dry','drywall','dryStorage','wardrobe','entryArt','hanging'].includes(id)){$('#opacity').value=100;walls.forEach(m=>m.opacity=1);}const cut=['whole','top','suite','drywall','wardrobe','dryStorage'].includes(id);scene.children.forEach(o=>{if(['foot-wall','entry-side','entry-wall'].includes(o.name))o.visible=!(cut||(id==='bed'&&o.name==='foot-wall'));if(o.name==='closet-wall')o.visible=id!=='suite';if(o.name==='foot-cabinet'||o.name==='foot-low-cabinet'||o.name==='coat-arch'||o.name==='projection-system')o.visible=!['bed','drywall','wardrobe','dryStorage'].includes(id);if(o.name==='entry-composition')o.traverse(c=>{if(['foot-cabinet-end-finish','entry-return-finish','fold-hook-wall-plate','fold-hook-arm','small-bag','entry-art-frame','entry-art-ground','entry-art-line'].includes(c.name))c.visible=!['drywall','wardrobe','dryStorage'].includes(id);});if(o.name==='foot-decoration')o.visible=!(cut||id==='bed');if(o.name==='head'||o.name==='bath-side')o.visible=id!=='room';if(o.name==='bath-door-wall')o.visible=!(cut||id==='bath');});doors.forEach(({g})=>g.visible=!['drywall','wardrobe','dryStorage'].includes(id));$('#plan').hidden=!['plan','ceiling','storagePlan','footElevation'].includes(id);$('#plan').dataset.ceiling=String(id==='ceiling');$('#plan').dataset.entry=String(id==='storagePlan');$('#plan').dataset.foot=String(id==='footElevation');$('#plan').setAttribute('viewBox',id==='footElevation'?'0 0 660 730':id==='storagePlan'?'0 0 530 660':id==='ceiling'?'-20 -40 255 345':'-25 -85 660 665');$('#scene').hidden=['plan','ceiling','storagePlan','footElevation'].includes(id);plan();document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));if(!['plan','ceiling','storagePlan','footElevation'].includes(id)){const[p,t]=positions[id]||positions.whole;camera.position.set(...p);controls.target.set(...t);camera.fov=id==='join'?60:id==='arch'?70:id==='suite'?40:['footwall','connection','dry','drywall','dryStorage','entryArt','hanging'].includes(id)?65:['entry','bath','wardrobe','room','reading'].includes(id)?58:47;camera.updateProjectionMatrix();controls.update();resize();}$('#caption').textContent=id==='join'?'封闭末列60→45cm斜收 · 两只腰部外抽 · 台面顺接梳妆区':id==='footElevation'?'柜体内部：入口88长衣＋88上下短衣＋梳妆侧44双抽叠放，上部被褥区':id==='equipment'?'双轨窗帘与可拆帘盒 · 布帘L形短侧暂定；书柜前停轨，未核验窗扇/堆布/遮光':id==='ac'?'床尾墙梳妆台正上方挂机 · 镜格顶至机底暂留30cm · 施工条件待核':id==='storagePlan'?'衣帽区250cm整排柜：短挂 / 长衣 / 叠放，三扇移门示意':id==='drywall'?'入口整排柜立面 · 剖去遮挡的墙、门及床尾柜，仅为观察':id==='dryStorage'?'衣帽区250cm整排通顶柜，梳妆已移到卧室窗端':id==='entryArt'?'门外左侧原墙：薄肌理画＋洗墙光 · 不做壁龛，过道实际尺寸待复核':id==='hanging'?'回墙折叠挂钩 · 挂物限于20cm宽、22cm凸出包络 · 门后不硬挂大衣':id==='connection'?'连接转角望向卧室 · 原门墙保留，不另加隔断 · 未扩大实际净宽':id==='arch'?'整体衣柜圆弧收口15cm · 取消独立展示格 · 主直柜220cm':id==='suite'?'整体剖视 · 衣帽区整排衣柜 / 卧室柜桌组合 / 镜台上方挂机':id==='dry'?'衣帽区恢复250cm整排衣柜':id==='ceiling'?'顶面平面示意 · 非施工定位 · 风管终点/设备净距待核':id==='reading'?'飘窗侧通顶书柜 · 下部读书/展示，上部封闭 · 窗扇/固定/防坠待核':id==='room'?'卧室关系 · 入口挂衣柜另见套间整体和连接视角':id==='footwall'?'连续355cm：柜235＋梳妆120；柜列44cm / 主门43.6 · 斜门45.2cm · 空调在同一床尾墙的镜台上方':id==='vanity'?'柜桌连续暖灰面 · 大圆角滑镜 / 上开放下封闭护肤格 / 台下收凳':id==='plan'?'CAD纠偏试排 · 原门保留 · 法兰和地漏未实测':id==='bed'?'床头整面薄半墙＋圆弧端＋遮光细线灯 · 剖去身后柜墙/空调 · 床位不变':id==='bath'?'主卫剖视 · 原门 / 围合区保留 · 下水待实测':'同尺寸模型 · 总览剖去前景墙，室内视角恢复 · 施工条件待核';}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>choose(b.dataset.view));document.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',state));new ResizeObserver(resize).observe($('#viewer'));state();choose(new URLSearchParams(location.search).get('view')||'footwall');if(new URLSearchParams(location.search).get('cabinet')==='inside'){$('#foot-cabinet').value='inside';state();}
function animate(){requestAnimationFrame(animate);projection.tick(performance.now());if(!['plan','ceiling','storagePlan','footElevation'].includes(view)){controls.update();renderer.render(scene,camera);}}animate();window.masterPlumbing={ready:true,spec:s,audit,detailsAudit:auditDetails(s),projectionAudit:projection.audit,projection,equipment,equipmentAudit:equipment.audit,scene,choose};
