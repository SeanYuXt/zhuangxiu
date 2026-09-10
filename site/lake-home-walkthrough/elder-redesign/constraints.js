const d=await(await fetch('./design.json')).json();
const thin=await(await fetch('./thin-row.json')).json();
const svg=document.querySelector('svg');let activeMode='thin';
function draw(mode){
 activeMode=mode;const bed=mode==='thin'?thin.bed:[.02,.70514,1.85,2.24514];
 svg.replaceChildren();svg.setAttribute('viewBox','-.95 -.98 4.30 4.44');
 const el=(tag,a,t)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));if(t)e.textContent=t;svg.append(e);};
 const rect=(r,c)=>el('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill:c,stroke:'#8e9183','stroke-width':.014});
 const text=(x,y,t,s=.09,c='#45493f')=>el('text',{x,y,'font-size':s,'text-anchor':'middle',fill:c,'font-family':'system-ui, PingFang SC'},t);
 const line=(x,y,a,b,c='#888e80',w=.014)=>el('line',{x1:x,y1:y,x2:a,y2:b,stroke:c,'stroke-width':w});
 el('polygon',{points:d.sourcePolygon.map(p=>p.join(',')).join(' '),fill:'#dce5e2',stroke:'#88a29a','stroke-width':.022,'stroke-dasharray':'.04 .025'});
 rect(d.main,'#f4eee1');text(.64,-.75,'转角窗范围 · 不当作可用地面',.09);
 line(0,.70514,0,2.9,'#505947',.055);text(-.28,1.27,'左侧',.08);text(-.28,1.42,'实墙',.08);
 line(-.16,0,-.16,.70514);if(mode!=='thin')text(-.35,.46,'约705',.07);text(.90,3.24,mode==='thin'?'薄柜为新取舍 · 椅子和脚留在室内地面':'当前仅核对床＋整排衣柜，尚未加书桌',.073);
 line(1.86,2.9,2.75,2.9,'#e9e5dc',.07);el('path',{d:'M1.86 2.9 A.89 .89 0 0 1 2.75 2.01',fill:'none',stroke:'#ad895d','stroke-width':.015,'stroke-dasharray':'.035 .025'});line(2.75,2.9,2.75,2.01,'#ad895d',.035);text(2.3,3.10,'原房门',.08);
 rect(bed,'#d6c8af');rect([.02,.70514,.06,2.24514],'#9b9f89');for(const y of [.84,1.66])rect([.12,y,.47,y+.44],'#eee8dd');text(1.05,1.43,'床垫 1500 × 1800',.093);text(1.05,1.60,'床架 1830 × 1540',.078);
 if(mode==='thin'){
  rect(thin.wardrobe,'#bbc4ae');text(2.625,.62,'薄柜',.066);text(2.625,.78,'1800',.066);text(2.625,.93,'×350',.062);
  rect(thin.desk,'#bfa887');text(-.10,.21,'飘窗书桌',.073);text(-.10,.35,'宽800',.066);
  const seated=document.querySelector('#seated').checked,chair=thin[seated?'chairOccupied':'chairTucked'];rect(chair,seated?'#c59a7777':'#b5bca777');text((chair[0]+chair[2])/2,(chair[1]+chair[3])/2+.025,seated?'坐人':'收椅',.07);
  line(1.85,1.35,2.45,1.35);text(2.15,1.27,'600',.095);text(2.15,1.47,'名义净距',.065);
  line(1.15,2.26,1.15,2.9);text(1.15,2.60,'640',.09);
  document.querySelector('#result').textContent='床头不动；柜深改为350mm';
  document.querySelector('#reason').textContent='1800mm整排浅柜，采用叠放和正面挂衣。外部容积约为同宽同高600mm深柜的58%；不是常规衣柜的等容量替代。';
  document.querySelector('#status').textContent=seated?'有人写字：会挤占窗侧床边中段，不能同时正常通行。家具与门扇采样未碰撞。':'收椅：500/550mm代理可到两侧床边中段；600mm名义通道没有施工余量，不能认定为稳健600mm通行。';
 }else if(mode==='right'){
  rect([2.2,.06,2.8,1.86],'#bbc4ae');text(2.5,.7,'整排柜',.08);text(2.5,.85,'1800',.08);text(2.5,1.0,'×600',.08);
  rect([1.85,.80,2.2,1.86],'#d38b7777');line(1.85,1.29,2.2,1.29,'#ae5140');text(2.025,1.21,'350',.095,'#aa4130');
  document.querySelector('#result').textContent='床脚至柜面只剩350mm';document.querySelector('#reason').textContent='2800 − 20安装余量 − 1830床架 − 600柜深 = 350mm。移门能取消门扇外摆，但不能增加柜前站立空间。';
 }else{
  rect([.02,2.3,1.82,2.9],'#bbc4ae');text(.92,2.56,'整排衣柜 1800 × 600',.086);rect([.02,2.24514,1.82,2.3],'#bb6454');text(.92,2.20,'柜前仅约55mm',.096,'#aa4130');
  document.querySelector('#result').textContent='床侧至柜面只剩约55mm';document.querySelector('#reason').textContent='2900 − 705左墙起点 − 1540床架宽 − 600柜深 ≈ 55mm。即使不留安装余量，柜前也没有站人的地方。';
 }
 if(mode!=='thin')document.querySelector('#status').textContent='常规600mm深柜对照：尚未加入书桌，床柜间隙已经不足。';
 document.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
}
document.querySelectorAll('button').forEach(b=>b.onclick=()=>draw(b.dataset.mode));document.querySelector('#seated').onchange=()=>draw(activeMode);draw('thin');
