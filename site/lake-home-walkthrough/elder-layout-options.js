import{layouts}from'./elder-layout-options-data.js';
const [spec,audit]=await Promise.all(['./plan-spec.json','./elder-layout-options-audit.json'].map(async u=>(await fetch(u)).json()));
const poly=spec.spaces.find(s=>s.id==='bed1').polygons[0].map(([x,z])=>[x,-z]);
const svg=document.querySelector('#plan');let current=layouts[0];
function draw(){
 const c=current,a=audit.layouts.find(r=>r.id===c.id),occupied=document.querySelector('#occupied').checked,route=a.routes600[occupied?'occupied':'vacant'];
 document.querySelectorAll('[data-layout]').forEach(b=>b.classList.toggle('active',b.dataset.layout===c.id));
 document.querySelector('#title').textContent=c.title;document.querySelector('#status').textContent=c.type;document.querySelector('#description').textContent=c.note;document.querySelector('#risk').textContent=c.risk;
 const dim=r=>`${Math.round((r[2]-r[0])*100)} × ${Math.round((r[3]-r[1])*100)}cm`;
 const axis=c.head==='west'||c.head==='east'?'窗侧 / 柜侧':'图左 / 图右';
 document.querySelector('#metrics').innerHTML=`<tr><th>床垫</th><td>150 × 200cm</td></tr><tr><th>桌面平面占地</th><td>${dim(c.desk)}</td></tr><tr><th>衣柜平面占地</th><td>${dim(c.ward)}</td></tr><tr><th>600mm代理到床边<br>${axis}</th><td>${route.side1?'可达':'不可达'} / ${route.side2?'可达':'不可达'}</td></tr><tr><th>空椅位能否到达</th><td>${a.routes600.vacant.deskApproach?'模型路径可达':'本检查不可达'}</td></tr><tr><th>门扇与家具</th><td>${a.doorHits?'检测到冲突':'所采样角度未碰撞'}</td></tr>`;
 document.querySelector('#summary').textContent=a.intersections.length?'包络冲突：'+a.intersections.map(i=>`${i.pair.join('/')} ${i.widthMM}×${i.depthMM}mm`).join('；'):'家具包络无重叠，但不等于两侧上下床、拉椅和实际使用全部通过。';
 document.querySelector('#routeNote').textContent='圆圈是600mm站位检查点：绿色可由入口到达，红色不可达。不是只测直线缝隙。';
 svg.replaceChildren();svg.setAttribute('viewBox','-.02 1.53 3.97 4.27');
 const el=(tag,attrs,text)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text)n.textContent=text;svg.append(n);return n;};
 const text=(x,z,t,size=.115)=>el('text',{x,y:z,'font-size':size,'text-anchor':'middle',fill:'#373731'},t);
 const rect=(r,fill)=>el('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill,stroke:'#888d7e','stroke-width':.014});
 el('polygon',{points:poly.map(p=>p.join(',')).join(' '),fill:'#f0ece3',stroke:'#868b80','stroke-width':.035});
 // No invented floor area: dashed regions highlight existing but unverified window recesses.
 for(const r of [[.2,1.87,.8,3.18],[.8,1.87,2.85,2.47]])el('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill:'#dce6e655',stroke:'#9eafab','stroke-dasharray':'.04 .04','stroke-width':.01});
 for(const [key,color]of [['ward','#bec3b3'],['desk','#c5a783'],['bed','#d8ccba']])rect(c[key],color);
 const b=c.bed;if(c.head==='west')rect([b[0],b[1],b[0]+.10,b[3]],'#939c8b');else if(c.head==='north')rect([b[0],b[1],b[2],b[1]+.10],'#939c8b');else rect([b[0],b[3]-.10,b[2],b[3]],'#939c8b');
 text((b[0]+b[2])/2,(b[1]+b[3])/2,'1.5m双人床');text((b[0]+b[2])/2,(b[1]+b[3])/2+.17,c.head==='west'?'原床头方向':c.head==='north'?'床头朝图上':'床头朝入门同侧墙',.095);
 for(const[key,label]of [['desk','书桌'],['ward','推拉衣柜']]){const r=c[key];text((r[0]+r[2])/2,(r[1]+r[3])/2,label,.10);}
 if(occupied){rect(c.chair,'#c8957055');text((c.chair[0]+c.chair[2])/2,(c.chair[1]+c.chair[3])/2,'坐人',.09);}
 for(const hit of a.intersections){if(!occupied&&hit.pair.includes('chair'))continue;const[r,s]=hit.pair.map(k=>c[k]);rect([Math.max(r[0],s[0]),Math.max(r[1],s[1]),Math.min(r[2],s[2]),Math.min(r[3],s[3])],'#bd614e99');}
 if(document.querySelector('#showRoutes').checked)for(const key of ['side1','side2']){const[x,z]=route.targets[key];el('circle',{cx:x,cy:z,r:.30,fill:'none',stroke:route[key]?'#648a73':'#b1624f','stroke-width':.018,'stroke-dasharray':'.035 .025'});}
 el('line',{x1:2.66,y1:5.39,x2:3.56,y2:5.39,stroke:'#fbfaf6','stroke-width':.12});el('path',{d:'M 2.66 5.45 A .9 .9 0 0 1 3.56 4.55',fill:'none',stroke:'#ae895c','stroke-width':.016});el('line',{x1:3.56,y1:5.45,x2:3.56,y2:4.55,stroke:'#ae895c','stroke-width':.025});
 el('path',{d:'M .27 1.94 L 2.77 1.94 M .26 2.01 L .26 3.08',stroke:'#81a3a4','stroke-width':.026,fill:'none'});
 text(1.75,1.73,'湖景转角窗 · 窗侧地面条件未核实',.10);text(1.72,5.67,'公卫共墙                    原房门',.10);
 window.elderLayoutCompare={current:c,audit:a,occupied};
}
for(const c of layouts){const b=document.createElement('button');b.dataset.layout=c.id;b.textContent=c.title;b.onclick=()=>{current=c;draw();};document.querySelector('#chooser').append(b);}
document.querySelector('#occupied').onchange=draw;document.querySelector('#showRoutes').onchange=draw;draw();
