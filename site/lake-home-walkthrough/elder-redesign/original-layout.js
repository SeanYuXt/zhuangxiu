const root = document.querySelector('#content');
document.title = '老人房 · 按原户型图布置';
root.innerHTML = `<header><div><div class="tag">采用原图布置 · 转角湖景保留</div><h1>床头朝左，衣柜靠下方墙</h1><small>展示原户型图本身，作为后续家具深化的布置依据。</small></div><nav><button id="room-view" class="active">老人房放大</button><button id="whole-view">完整户型</button></nav></header>
<main><aside><h2>按原图安排</h2><p>床横放，床头朝左。<br>床头两侧设床头柜。<br>衣柜沿下方墙布置，位于卧室与卫生间之间。<br>房门保留原位置及开启方向。</p><hr><h2>保留你的家具需求</h2><p>床垫按150×180cm选。<br>主衣柜以180cm宽、60cm深为目标。<br>床头柜随实际剩余位置定尺寸。</p><p class="muted">这些是后续选型目标，原图中的家具符号没有标注实物尺寸，不能直接按图下单。</p></aside>
<section class="stage"><svg id="source-plan" viewBox="30 270 390 415" role="img" aria-label="原户型老人房局部：床头朝左，两侧床头柜，下方衣柜，上侧转角飘窗" style="width:100%;height:640px;background:white;border-radius:10px"><image href="./original-plan.png" x="0" y="0" width="1920" height="890"/></svg><p class="note">原图局部放大，未重新绘制或改变家具比例。切换完整户型可核对卫生间、厨房与房门的关系。</p></section>
<aside><h2>飘窗先这样处理</h2><p>凸起实体飘窗完整保留，不拆、不铺满柜子。正面保留湖景，暂不增设书桌或座椅；小件可放侧端，避免遮住视野。</p><h2>接下来深化什么</h2><p>核实床头背后的实际墙台关系，以及衣柜前净距，再确定床架外尺寸和床头柜大小。</p><p class="warning">此前草模算出的4cm、35cm间隙不再作为本方案定论。它们来自不同试排；原图布置仍需核对实尺，尚未完成施工尺寸验收。</p><p class="muted">之前的转床和右墙衣柜方案已撤下。当前只以原图作为布置基准，不用推测的三维模型替代原图。</p></aside></main>`;
const svg = document.querySelector('#source-plan');
for (const [id, box] of [['room-view', '30 270 390 415'], ['whole-view', '0 0 1920 890']]) {
  document.getElementById(id).onclick = () => {
    svg.setAttribute('viewBox', box);
    svg.setAttribute('aria-label', id === 'room-view' ? '原户型老人房局部：床头朝左，下方衣柜，上侧转角飘窗' : '原始完整户型图');
    for (const button of document.querySelectorAll('nav button')) button.classList.toggle('active', button.id === id);
  };
}
