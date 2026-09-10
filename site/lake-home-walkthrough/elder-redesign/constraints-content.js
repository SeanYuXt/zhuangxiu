document.title='老人房 · 浅柜与飘窗书桌';
document.querySelector('#content').innerHTML=`
<header><div><div class="tag">老人房 · 可讨论的紧凑方案</div><h1>左实墙床头，浅柜，飘窗书桌</h1><small>保留1.5×1.8米床、一整排柜和书桌；明确提出柜深与容量的取舍。</small></div></header>
<main><aside><h2>固定你的要求</h2><p>两位常住<br>1500 × 1800mm床垫<br>床头靠左侧完整实墙<br>1800mm整排柜<br>侧飘窗承担书桌</p><hr><button data-mode="thin">新方案 · 350mm薄柜</button><button data-mode="right">对照 · 600mm深柜靠右</button><button data-mode="bottom">对照 · 600mm深柜靠下</button><label><input id="seated" type="checkbox"> 书桌前有人坐着</label><p class="muted">薄柜是新提出的取舍，尚未定稿。不是把60厘米柜画薄了继续承诺原容量。</p></aside>
<section class="stage"><svg id="plan" role="img" aria-label="老人房浅柜与飘窗书桌方案"></svg><p class="note">书桌沿侧飘窗宽800mm，台面跨窗台并向室内延伸约350mm。坐人、膝脚净空和支撑结构须做实物检查。</p></section>
<aside><h2 id="result"></h2><p id="reason" class="warning"></p><h2>飘窗不是闲置</h2><p>保留台体的分支：桌面跨在侧窗区上方，室内一段作为腿部空间；不要求椅子站上窗台，不把550mm台高上方的空隙当完整腿部空间。</p><p class="result" id="status"></p><hr><p class="note">薄柜宜以叠衣及正面挂衣分区；挂衣数量减少。柜门、抽拉杆及柜内净深要另核，取衣时与过道共用空间。</p><p class="muted">主段约2800×2900mm；施工面、窗帘和床品会吃掉余量。1830×1540mm床架尚未匹配成品，不能直接下单。</p><a href="thin-audit.json">查看占位检查</a></aside></main>`;
await import('./constraints.js');
