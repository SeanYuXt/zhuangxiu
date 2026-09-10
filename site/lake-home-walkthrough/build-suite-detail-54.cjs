// Design annotation only. Original 3D geometry and its installation audit are preserved.
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,s=JSON.parse(fs.readFileSync(path.join(root,'master-window-ac-option-spec.json'),'utf8'));
const out=n=>path.join(root,n), esc=t=>String(t).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const lights=[
 ['L01','卧室吸顶主灯',[3.75,1.65],'顶装，底高随选型','3000K / Ra≥90','S01、S03、S04联控；独立调光'],
 ['L02','床头半墙灯带',[3.55,.04],'半墙完成顶1100','3000K / 低压型材','S03、S04调光；不作为阅读主灯'],
 ['L03','衣帽区柔光吸顶灯',[1.1,3.45],'顶装','3000K / Ra≥90','S01、S05联控，不只依赖人体感应'],
 ['L04','梳妆镜双侧面光',[.12,2.62],'镜面约950—1800','3500—4000K / Ra≥95','S05独立开关调光；避免仅背光'],
 ['L05','综合柜／床尾柜内灯',[.45,3.7],'竖向灯条，避铰链','3000K / 低压型材','各门磁感应；手动关闭；驱动可检修'],
 ['L06','柜前线性照明',[3.8,2.44],'顶装，位于幕布前方','3000K / 防眩','S01场景或床头场景；观影关闭'],
 ['L07','飘窗书柜阅读灯',[5.55,2.17],'参考原模型1530','3000K / 遮光灯罩','S06就近手动；不正对坐卧视线'],
 ['L08','主卫主灯／风暖一体',[1.5,1.02],'铝扣板内嵌，标高待核','主灯3500—4000K','S02主灯、暖风、换气分别控制'],
 ['L09','主卫镜前柔光',[1.57,.12],'按镜柜及使用者身高','3500—4000K / Ra≥90','S02独立控制；防护等级按湿区核定']
];
const switches=[
 ['S01','套间门外锁侧',[.62,4.81],'中心1150','卧室／衣帽主灯、柜前光、离房场景；不硬断设备常电'],
 ['S02','主卫门外锁侧',[.95,2.065],'中心1200','主灯、镜灯、换气、暖风分控；门内开，面板避门套'],
 ['S03','床左侧',[2.46,.065],'中心700暂排','主灯、床头灯、睡眠／观影；插座另排，避活动柜与软包'],
 ['S04','床右侧',[4.78,.065],'中心700暂排','同S03；左右均可控制，不装固定床头柜'],
 ['S05','梳妆台侧可触及处',[.06,2.22],'中心950暂排','镜灯、衣帽主灯；保持坐姿可触及，不藏镜后'],
 ['S06','飘窗书柜内侧',[5.57,2.23],'中心1200暂排','阅读灯；避窗扇、帘布及儿童攀爬路径']
];
const power=[
 ['P01','梳妆台电源',[.06,2.95],'中心950暂排','吹风机／美容设备；与镜灯开关分开，不设在抽屉后'],
 ['P02','床左电源',[2.55,.07],'中心650暂排','充电及备用；避面板被家具挡住'],
 ['P03','床右电源',[4.9,.07],'中心650暂排','充电及备用；与S04分开'],
 ['P04','衣帽区备用电源',[1.72,3.7],'中心300暂排','循环扇／清洁设备；避通道拖线'],
 ['AC01','窗上靠右空调',[5.25,1.85],'安装高度待实测','95cm机长占位；48cm为用户给定安装空间，待型号核验'],
 ['C01','飘窗内部布帘电机',[5.5,-.23],'随轨道／电机','常电、检修；不做窗帘盒'],
 ['C02','飘窗内部纱帘电机',[5.87,-.38],'随轨道／电机','独立常电、检修；确认开窗和收帘堆叠'],
 ['PJ01','投影机吊装',[3.225,.42],'随净高／机型','常电＋可抽换信号管；不借灯线供电'],
 ['SC01','电动幕布',[4.23,2.64],'幕盒端部待定','幕布下降前柜门抽屉须关闭；不代替防夹措施']
];
const radii=[
 ['R01','床尾整柜入卧端','平面外圆角 R150','沿用15cm实体收口，不新增展示洞；不计收纳'],
 ['R02','梳妆台暴露前角','平面 R40；触摸边 R2—3','桌面1000×450；圆角包含在外包尺寸内'],
 ['R03','柜深650转桌深450','暴露侧板前棱 R20暂定','柜门与桌板分构件收口；不做难落地的大空洞'],
 ['R04','梳妆镜轮廓','圆角矩形 R100暂定','主镜650×850；右侧200宽浅格，另留收边'],
 ['R05','床头半墙平面前角','R35；触摸边 R2—3','沿用厚40、高1100，不再做20cm厚背景'],
 ['R06','飘窗书柜层板','暴露角 R20；边 R2—3','只放轻物；固定与窗扇／栏杆防护待核'],
 ['R07','卧室单眼皮','暂定下挂80、突出30','不是已确认施工尺寸；窗上空调段暂断开'],
 ['R08','普通柜门／抽屉','边口 R1—2或配套封边','目标缝3mm，按铰链／材料调整；无外露把手']
];
const evidence={revision:'suite-detail-54',source:'master-window-ac-option-spec.json',units:'mm（平面内部坐标m）',status:'设计深化示意，非施工图',userConfirmed:['窗上靠右空调','飘窗内部纱帘和布帘，无窗帘盒','衣帽区综合收纳与靠主卫梳妆台','保险箱独立下格','床尾整墙柜','床头半墙厚40、高1100'],pending:['现场净高、窗上最低梁底、墙面错台','空调型号、48cm要求的具体含义、背板锚固与排水','保险箱尺寸／重量、楼板承载及固定','灯具配光、电工回路／线径／防护分区','柜门、抽屉、镜柜五金与人体通行实测'],lights,switches,power,radii};
fs.writeFileSync(out('master-suite-detail-54.json'),JSON.stringify(evidence,null,2));
function text(x,y,t,size=18,fill='#373731'){return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}">${esc(t)}</text>`;}
function line(x,y,x2,y2,color='#b2ad9f',extra=''){return `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${color}" ${extra}/>`;}
function rect(x,y,w,h,fill='#e6e9df',rx=0){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="#a6a396"/>`;}
function base(num,title,subtitle){return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1132" viewBox="0 0 1600 1132" role="img" aria-label="${title}"><rect width="1600" height="1132" fill="#fbfaf6"/><g font-family="Microsoft YaHei, sans-serif">${text(48,62,title,32)}${text(48,98,subtitle,17,'#726e63')}${line(48,120,1552,120)}${text(48,1100,'主卧套间 / 54版 · 设计标注，不是施工放线图；未改原门窗墙线；数值按状态使用。',16)}${text(1470,1100,'0'+num,25)}`;}
const finish='</g></svg>';
function rows(x,y,data,widths,rowH=45,font=17){let svg='';data.forEach((r,i)=>{let xx=x;svg+=rect(x,y+i*rowH-25,widths.reduce((a,b)=>a+b,0),rowH,i%2?'#f3f0e9':'#fbfaf6');r.forEach((c,j)=>{svg+=text(xx+10,y+i*rowH,c,font);xx+=widths[j];});});return svg;}
function note(x,y,title,lines){return text(x,y,title,22)+lines.map((t,i)=>text(x,y+32+i*28,t,17,'#68675d')).join('');}
const px=x=>75+x*108,pz=z=>195+z*108;
function roomPlan(){let g='';for(const sp of s.spaces)g+=`<polygon points="${sp.polygons[0].map(([x,z])=>`${px(x)},${pz(z)}`).join(' ')}" fill="${sp.id==='bay'?'#dfe9e6':'#eeece3'}" stroke="#9c9e93"/>`;
 for(const w of s.walls){g+=line(px(w.a[0]),pz(w.a[1]),px(w.b[0]),pz(w.b[1]),'#91978c',`stroke-width="${w.thickness*108}"`);}
 for(const o of s.openings){const w=s.walls.find(w=>w.id===o.wall_id),dx=w.b[0]-w.a[0],dz=w.b[1]-w.a[1],len=Math.hypot(dx,dz),a=[w.a[0]+dx/len*o.offset,w.a[1]+dz/len*o.offset],b=[a[0]+dx/len*o.width,a[1]+dz/len*o.width];g+=line(px(a[0]),pz(a[1]),px(b[0]),pz(b[1]),o.kind==='door'?'#fbfaf6':'#94afb0',`stroke-width="${o.kind==='door'?14:5}"`);if(o.kind==='door'&&o.hinge){let h=o.hinge,closed=o.closedAngle,open=closed+Math.PI/2*o.sweep;g+=line(px(h[0]),pz(h[1]),px(h[0]+Math.cos(open)*o.width),pz(h[1]+Math.sin(open)*o.width),'#a48463','stroke-width="3"');g+=`<path d="M${px(h[0]+Math.cos(closed)*o.width)},${pz(h[1]+Math.sin(closed)*o.width)} A${o.width*108},${o.width*108} 0 0 ${o.sweep>0?1:0} ${px(h[0]+Math.cos(open)*o.width)},${pz(h[1]+Math.sin(open)*o.width)}" fill="none" stroke="#a48463" stroke-dasharray="4 4"/>`;}}
 for(const id of ['bed','wardrobe','vanity','footCabinet']){const f=s.furniture[id],r=f.r;g+=rect(px(r[0]),pz(r[1]),(r[2]-r[0])*108,(r[3]-r[1])*108,id==='bed'?'#cfc2b0':'#dadccc');}
 g+=text(px(3.05),pz(1.35),'床垫1800×1900',15);g+=text(px(2.6),pz(3.15),'整柜3400＋圆弧收口150',14);g+=text(px(.08),pz(3.0),'梳妆',13)+text(px(.08),pz(4.2),'综合柜',13);g+=text(px(.4),pz(.7),'主卫',16);g+=text(px(2.8),pz(2.5),'柜前净距参考719',14);
 g+=rect(px(1.06),pz(2.3),.6*108,2.05*108,'#d5e4d0')+text(px(1.11),pz(3.0),'通行',13);
 return g;
}
function markers(items,color){return items.map(([id,label,p],i)=>{const x=px(p[0]),y=pz(p[1]);let dx=10,dy=-8;if(id==='L07'){dx=-57;dy=-10;}if(id==='S06'){dx=10;dy=27;}if(id==='L02'){dy=-12;}return `<circle cx="${x}" cy="${y}" r="6" fill="${color}"/>`+text(x+dx,y+dy,id,14,color);}).join('');}
let a=base(1,'01 / 灯光与开关定位','灯光点位为方案位置；所有标高相对完成地面。顶部设备标高不沿用暂定2600作为施工值。');
a+=roomPlan()+markers(lights,'#b47a3c')+markers([['L05','床尾各格门控',[3.4,2.95]]],'#b47a3c')+markers(switches,'#477677');
a+=text(60,820,'橙色 L＝灯具　青色 S＝开关　图上方向沿原图，地理北待核',16);
a+=note(60,875,'使用边界',['绿色只表示原方案60cm通行试排带，不是人体工学验收。','主卫门向内开；坐凳拉出、柜门开启后仍须实物检查。','柜前719mm是关门状态；平开门后局部约298mm，不作通道。']);
a+=rows(800,175,[['编号 / 灯具','色温与控制'],...lights.map(r=>[r[0]+' '+r[1],r[4]])],[360,370],44,16);
a+=note(810,660,'灯光层次，不把灯带当主灯',['主灯负责均匀照明；镜侧灯负责面部，不只照墙。','床头1100高半墙上沿线性灯独立调光，前沿下垂10mm。','柜内灯随门开启；取消旧“独立转角展示格灯”。','主卫灯具、风暖按防潮分区选型，不在图上猜IP等级。']);
a+=note(810,850,'开关高度与控制原则',['S01门外1150；S02主卫门外1200；S03/04床侧700。','S05梳妆侧950；S06阅读位1200。均为中心高度暂排。','保留实体按键与离线基础控制；联网场景不是唯一控制。','每一路的正式回路、线径、保护及接地由电工深化。']);
a+=finish;
fs.writeFileSync(out('master-suite-detail-54-lighting.svg'),a);
// Elevation diagram: scale is 0.25 px/mm; vertical cabinet top is adjustable, not site height.
let b=base(2,'02 / 衣帽区综合柜＋梳妆台','立面展开示意：入口端 → 主卫端；总长2500＝综合柜1500＋梳妆台1000。柜高随实际净高收口。');
const ex=95,ey=835,k=.25,xx=v=>ex+v*k,yy=h=>ey-h*k;
b+=rect(xx(0),yy(2500),375,625,'#e8e5dd')+rect(xx(1500),yy(750),250,18,'#c6baaa');
for(const q of [500,1000])b+=line(xx(q),yy(0),xx(q),yy(2500),'#a49e91','stroke-width="2"');
for(const q of [2050])b+=line(xx(0),yy(q),xx(1500),yy(q));
b+=text(xx(45),yy(2290),'顶区：换季轻物／备用品',19);
b+=rect(xx(60),yy(570),95,122,'#8e938a',3)+text(xx(95),yy(345),'保险箱',19,'#fff')+text(xx(90),yy(235),'待选型',14,'#fff');
b+=text(xx(30),yy(720),'落地承托，非悬空层板',13);
for(const h of [800,1250,1700])b+=line(xx(18),yy(h),xx(480),yy(h));
b+=text(xx(75),yy(1480),'工具盒',19)+text(xx(45),yy(1030),'独立分类箱',17);
b+=line(xx(550),yy(1900),xx(950),yy(1900),'#7a8072','stroke-width="3"')+text(xx(570),yy(1590),'日常短衣',18)+text(xx(565),yy(1150),'可调层板',18);
for(const h of [750,950,1150,1350])b+=line(xx(1005),yy(h),xx(1495),yy(h),'#938d7f','stroke-width="2"');
b+=text(xx(1040),yy(1610),'干毛巾／纸巾',15)+text(xx(1040),yy(1430),'洗护备用品',15);
for(const h of [1280,1080,880])b+=text(xx(1060),yy(h),'外抽屉',16);
b+=text(xx(1050),yy(480),'独立备用格',16);
b+=rect(xx(1560),yy(1800),162.5,212.5,'#c9d5d2',25);
b+=text(xx(1645),yy(1390),'镜后浅收纳',17);
for(const v of [1530,2230])b+=line(xx(v),yy(1010),xx(v),yy(1730),'#d5b578','stroke-width="5"');
for(const h of [1000,1300,1600])b+=line(xx(2250),yy(h),xx(2450),yy(h),'#9b9285','stroke-width="4"');
b+=text(xx(2260),yy(1490),'摆件',14)+text(xx(2260),yy(1140),'护肤',14);
b+=rect(xx(1500),yy(720),122,16,'#ece8de')+rect(xx(2000),yy(720),125,16,'#ece8de');
b+=rect(xx(1770),yy(460),100,115,'#c7bcac',18)+text(xx(1800),yy(250),'收凳',18);
b+=line(xx(1510),yy(648),xx(2490),yy(648),'#a66b47','stroke-dasharray="5 4"')+text(xx(1580),yy(590),'桌下净高约648，待五金复核',13);
b+=line(xx(0),880,xx(1500),880)+line(xx(1500),880,xx(2500),880)+text(xx(500),910,'1500 / 深650',18)+text(xx(1740),910,'1000 / 深450',18);
b+=note(60,965,'立面说明',['此图剖开显示分区，不表示日常柜门全部打开。门面暖白统一，抽屉不整块跳色。','3格各500为名义模数；扣板厚后每格净宽不足500。保险箱与工具箱先选型再定格口。']);
b+=note(820,190,'A / 综合柜：不是第二套纯衣柜',['入口端500：保险箱落地格＋上部工具分类箱。','中间500：日常短挂／叠放；大部分衣物仍在床尾柜。','主卫端500：干毛巾、纸品、洗护备用；与工具隔开。','主卫端三层外抽：750—1350范围，单层名义高200。','顶区从参考2050以上安排轻物，高度随净高调整。']);
b+=note(820,405,'B / 梳妆台：台面、镜柜、抽屉一体',['台面1000×450，高750；台下两浅抽，各约500宽。','主镜650×850，底950、顶1800；镜后浅柜深120—150。','侧边开放格约200宽；层间净高250—300，余量作收边。','镜R100；台面前角R40；650到450深度差保留200。','转角用侧板和台面同色衔接，不挖大展示洞。']);
b+=note(820,615,'C / 保险箱与卫生收纳的底线',['保险箱重量未知：不假定柜板承载，不把楼板承载当已验收。','固定方式按保险箱说明及结构条件；不得随意钻结构板。','外柜门、箱门、工具盒应能分别打开／取出。','湿毛巾和未干物品留在卫浴通风处，不塞密闭柜。','吹风机冷却后再收；工具柜不存易燃液体与散装电池。']);
b+=note(820,850,'D / 柜门与通行',['衣帽柜优先3扇约500名义宽平开门，实际扣缝及封边。','外抽这一格采用上门＋三抽＋下门；不开门也能取小物。','柜门／镜门方向按五金和主卫通路核对，不保证全开可通行。','总柜高标H待定，不照搬旧模型2600净高下单。']);
b+=finish;fs.writeFileSync(out('master-suite-detail-54-storage.svg'),b);
let c=base(3,'03 / 圆角、收口与设备联动','R表示圆角半径；所有新圆角／收口是设计建议，须用材料样板、五金与现场尺寸确认。单位mm。');
c+=rows(48,170,[['编号','部位','尺寸 / 形式','施工边界'],...radii],[80,245,330,840],47,17);
c+=note(65,660,'床头半墙剖面（放大示意，不按图量尺）',['完成厚40，完成顶高1100；前沿下垂10遮灯珠。','灯槽参考高18、深17，型材适配后再定加工尺寸。','前沿不能仅凭10mm保证不眩光：坐卧位置打样。','驱动置可检修位，不埋死；型材负责散热。']);
c+=rect(80,850,70,160,'#cac2b4')+rect(150,850,140,18,'#c0b5a2')+rect(270,850,20,50,'#c0b5a2')+line(167,879,250,879,'#d0a65e','stroke-width="6"')+text(320,884,'灯带内退，前沿遮光',18)+text(320,926,'高1100 / 厚40',18)+text(320,968,'下垂10 ≠ 安装灯带外露10',16);
c+=note(820,660,'窗上空调＋单眼皮',['空调靠右；95cm仅机长占位，背板和机高按型号。','用户提出最少480安装空间：由厂家确认测量边界。','照片比例约53cm未校正透视，不作为放线尺寸。','单眼皮暂80下挂／30突出；空调所在窗墙暂不连续做。','必要时下探须核挂板基层、窗扇、帘轨和排水坡度。']);
c+=note(820,875,'窗帘、投影与防护',['布／纱双轨、电机均在飘窗内；无窗帘盒，保留检修。','幕盒独立可靠固定，不让柜顶板承重；投影机另设支架。','柜门抽屉收好再落幕；未实装传感器，不宣称自动防撞。','窗边书柜不得固定到窗框；保留栏杆并核查儿童防坠。']);
c+=finish;fs.writeFileSync(out('master-suite-detail-54-details.svg'),c);
let d=base(4,'04 / 电源与智能设备定位','只标功能点，不画未经核定的电线、冷媒管、排水管或结构孔位；旧版床尾梳妆／空调电源不再沿用。');
d+=roomPlan()+markers(power,'#477677');
d+=note(60,875,'点位与安装状态',['此图标点表示功能位置，不表示插座一定装在点的中心。','空调位由用户选定；高度、背板孔位、管线与排水待核。','布帘／纱帘电机在飘窗内；轨道端部留可拆检修。']);
d+=rows(800,175,[['编号 / 功能','高度状态'],...power.map(r=>[r[0]+' '+r[1],r[3]])],[440,290],44,16);
d+=note(810,700,'供电与操作',['空调、幕布、窗帘、投影各按机型留常电及本地控制。','禁止用普通灯光调光器调节电机；不靠断总电源操控。','吹风机在梳妆位使用，冷却后入柜；不留抽屉内常通电。','床边插座与控制面板错开，避免活动柜、软包挡住。']);
d+=note(810,900,'未验证范围',['湿区安全距离、插座防护、线路负载与接地未验收。','有线／无线协议未选；图中场景尚未部署到真实设备。','保险箱不默认需要插电，待具体型号再决定是否预留。']);
d+=finish;fs.writeFileSync(out('master-suite-detail-54-power.svg'),d);
const table=(heads,data)=>`<div class="scroll"><table><thead><tr>${heads.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${data.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const sheet=(id,name,label)=>`<section id="${id}"><h2>${label}</h2><a href="${name}.svg" target="_blank">打开原尺寸矢量图（可放大）</a><img src="${name}.svg" alt="${label}"></section>`;
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>主卧套间 · 54版设计标注</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f1ea;color:#373731;font:16px/1.7 'Microsoft YaHei',sans-serif}header{padding:24px 4%;background:#fbfaf6;border-bottom:1px solid #ddd8cd}h1{margin:0;font-size:28px}nav{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px}a{color:#47706b}main{max-width:1600px;margin:auto;padding:24px}section{background:#fbfaf6;padding:24px;margin-bottom:22px;border:1px solid #ddd8cd;border-radius:12px}section img{display:block;width:100%;height:auto;margin-top:12px}h2{margin:0 0 8px;font-size:23px}.notice{border-left:4px solid #ad7945;padding:12px 18px;background:#f0e8da}.scroll{overflow:auto}table{border-collapse:collapse;width:100%;min-width:740px}th,td{text-align:left;padding:12px;border-bottom:1px solid #ddd8cd;vertical-align:top}th{background:#e6e9df}p{margin:10px 0}@media(max-width:650px){main{padding:12px}section{padding:12px}h1{font-size:23px}}@media print{nav,.notice{display:none}section{break-after:page;border:0;padding:0}main{padding:0}section img{width:100%}}</style><header><h1>主卧套间 · 54版设计标注</h1><p>综合收纳柜 / 梳妆一体 / 灯光控制 / 圆角收口</p><nav><a href="#lighting">01 灯光定位</a><a href="#storage">02 收纳立面</a><a href="#details">03 圆角细节</a><a href="#schedule">04 全部点位表</a><a href="master-window-ac-option.html?view=whole">原53版三维布局（未同步本次柜内深化）</a></nav></header><main><p class="notice">本次为可放大的设计标注图，不是高清写实效果图，也不是施工图。原3D墙体、门窗与家具外轮廓未改。旧模型空调高度2600假设及3cm余量不作实测事实；照片估算约53cm同样不能作为安装验收。此页新的点位编号独立于旧模型，避免引用旧梳妆／空调点位。</p>${sheet('lighting','master-suite-detail-54-lighting','01 灯光与开关定位')}${sheet('storage','master-suite-detail-54-storage','02 综合收纳与梳妆立面')}${sheet('details','master-suite-detail-54-details','03 圆角与设备收口')}<section id="schedule"><h2>04 全部点位与控制表</h2><p>位置见平面及下表。设计坐标(x,z)单位米，原图坐标系不是地理方向；施工须转为墙边定位尺寸并复尺。高度单位毫米。设备电源位置仅占位，空调／投影／电机高度不固定。</p><h3>灯具</h3>${table(['编号','部位','平面(x,z)','安装高度','目标色温／规格','控制'],lights.map(r=>r.map((v,i)=>i===2?v.join(', '):v)))}<h3>开关</h3>${table(['编号','位置','平面(x,z)','标高','控制内容'],switches.map(r=>r.map((v,i)=>i===2?v.join(', '):v)))}<h3>电源与智能设备</h3>${table(['编号','设备','平面(x,z)','标高','要求'],power.map(r=>r.map((v,i)=>i===2?v.join(', '):v)))}<h3>场景建议</h3>${table(['场景','动作','边界'],[['回房','卧室主灯＋衣帽灯；可独立调光','不自动打开卫浴暖风'],['梳妆','衣帽灯＋镜侧灯；柜灯随门','镜侧灯保留本地开关'],['睡眠','主灯／柜前灯关闭，床头光调暗后手动关闭','不硬断空调、窗帘、投影常电'],['观影','柜前光关闭、布帘闭合；确认柜门关闭后落幕','未装传感器前须人工确认，不宣称防夹联锁'],['离房','照明关闭，暖风确认关闭','保留设备正常待机及必要换气延时']])}<p class="notice">安全深化：回路、负载、线径、漏电保护、接地、湿区防护、锚固及承载均未验收。保险箱型号与重量未知，不画成普通柜板承重；吹风机冷却后收纳。工具、纸品、毛巾各用独立干燥分区。所有灯具需要配光或现场照度核验。</p></section></main></html>`;
fs.writeFileSync(out('master-suite-detail-54.html'),html.replace('<section id="schedule">',sheet('power','master-suite-detail-54-power','04 电源与智能设备定位')+'<section id="schedule">').replace('04 全部点位与控制表','05 全部点位与控制表').replace('04 全部点位表','电源与点位表'));
console.log(JSON.stringify({ok:true,lights:lights.length,switches:switches.length,power:power.length,radii:radii.length,outputs:['master-suite-detail-54.html','master-suite-detail-54.json','master-suite-detail-54-lighting.svg','master-suite-detail-54-storage.svg','master-suite-detail-54-details.svg']}));
