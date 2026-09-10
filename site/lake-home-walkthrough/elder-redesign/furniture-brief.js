document.title='老人房 · 主衣柜与梳妆书桌';
document.querySelector('#content').innerHTML=`<header><div><div class="tag">老人房 · 功能确定，整房摆位未定</div><h1>正常主衣柜，梳妆与写字共用一张桌</h1><small>撤掉350mm薄柜替代方案。床头避开窗与开门处的要求继续保留。</small></div></header>
<main><aside><h2>主衣柜</h2><p><b>1800mm宽 × 600mm总深</b><br>到顶高度待层高核实。</p><p>约600mm长挂<br>约600mm双层短挂<br>约600mm叠衣与小抽屉</p><p class="muted">三段是模块宽，净宽需扣板材。容量按父母衣物数量清点，不能只凭宽度承诺够用。</p><hr><h2>梳妆书桌</h2><button data-mirror="closed" class="active">收镜 · 写字</button><button data-mirror="open">翻镜 · 梳妆</button><p>沿侧飘窗研究800–1000mm桌宽，台面约750mm高。靠窗侧翻盖镜与浅收纳；中间留连续桌面，腿前不加抽屉。</p></aside>
<section class="stage"><svg id="plan" role="img" aria-label="1800主衣柜内部示意及飘窗梳妆书桌剖面"></svg><p class="note">这是家具功能与剖面示意，不是已排入房间的平面图；衣柜高度暂示意2400mm。</p></section>
<aside><h2>飘窗怎么用</h2><p>保留台体时：桌面跨窗台并向房内伸出，把椅子留在地面。翻盖镜不用固定在玻璃上，收镜后恢复写字桌面。</p><p class="warning">若室内仅伸出350mm，实际腿部净深也只有约350mm，不能把整块桌面的深度算进去。必须按坐姿和实测台体深度调整。</p><h2>主衣柜不再缩深</h2><p>350mm柜只适合叠放和少量正面挂衣；对父母常住收纳，不再作为600mm主柜的替代。</p><hr><h2>整房尚未解决的点</h2><p>现图2800mm净宽，1830mm床架＋20mm余量＋600mm柜，只剩350mm。想留600mm通道需约3050mm净宽。</p><p class="muted">整房摆位仍需解决约250mm宽度差。厨房隔墙是否可调整尚无结构结论；不默认拆墙、移门或拆飘窗。</p></aside></main>`;
let open=false;
function draw(){const svg=document.querySelector('svg');svg.replaceChildren();svg.setAttribute('viewBox','-.20 -.30 3.65 3.15');
 const el=(tag,a,t)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));if(t)e.textContent=t;svg.append(e);};
 const r=(x,y,w,h,c)=>el('rect',{x,y,width:w,height:h,fill:c,stroke:'#89907e','stroke-width':.012});
 const l=(x,y,a,b,c='#858c7e',w=.012)=>el('line',{x1:x,y1:y,x2:a,y2:b,stroke:c,'stroke-width':w});
 const t=(x,y,s,z=.07,c='#40483b')=>el('text',{x,y,'font-size':z,fill:c,'text-anchor':'middle','font-family':'system-ui, PingFang SC'},s);
 r(0,0,1.8,2.4,'#d4cfbf');for(const x of [.6,1.2])l(x,0,x,2.4);l(0,.38,1.8,.38);t(.9,.20,'被褥区 · 取用高度需调整',.075);t(.9,-.12,'主衣柜内部示意 / 1800 × 600',.09);
 l(.05,.68,.55,.68,'#737c6b',.02);l(.65,.66,1.15,.66,'#737c6b',.02);l(.65,1.45,1.15,1.45,'#737c6b',.02);
 for(const[x,y,h]of [[.14,.71,1.22],[.75,.69,.57],[.75,1.48,.57]]){el('path',{d:`M${x} ${y+.1} L${x+.1} ${y} L${x+.2} ${y+.1} L${x+.24} ${y+h} L${x-.04} ${y+h}Z`,fill:'#a7b29b',stroke:'#87917b','stroke-width':.01});}
 for(const y of [.85,1.3,1.75,2.08])l(1.2,y,1.8,y);for(const y of [1.77,2.10])r(1.22,y,.56,.26,'#b6bca9');t(.3,2.58,'长挂约600',.075);t(.9,2.58,'双层短挂约600',.075);t(1.5,2.58,'叠放/抽屉约600',.075);
 // Desk section: 550mm existing sill study and 350mm room-side overhang.
 t(2.73,-.12,'梳妆书桌剖面',.09);l(2.1,2.4,3.3,2.4);r(2.15,1.85,.55,.55,'#c3d2cb');t(2.40,2.12,'原窗台',.075);t(2.40,2.26,'550高示意',.064);
 r(2.15,1.65,.90,.03,'#bda687');l(3.02,1.68,3.02,2.4);t(2.63,1.51,'桌高约750',.073);
 if(open){l(2.56,1.65,2.50,1.23,'#74928c',.028);t(2.86,1.11,'翻盖镜',.075);r(2.33,1.69,.31,.065,'#a89274');t(2.57,.73,'化妆品浅格在窗台上方',.065);}else{l(2.33,1.647,2.65,1.647,'#718a7e',.015);t(2.71,1.06,'收镜后恢复平整桌面',.07);}
 r(3.06,1.95,.27,.035,'#a2ad96');l(3.29,1.65,3.29,1.95);l(3.09,1.99,3.09,2.4);l(3.27,1.99,3.27,2.4);
 l(2.70,2.20,3.05,2.20,'#ac7456');t(2.875,2.08,'350',.083,'#996342');t(2.74,2.61,'腿部空间需实坐核验',.071);
 document.querySelectorAll('button').forEach(b=>b.classList.toggle('active',(b.dataset.mirror==='open')===open));}
document.querySelectorAll('button').forEach(b=>b.onclick=()=>{open=b.dataset.mirror==='open';draw();});draw();
