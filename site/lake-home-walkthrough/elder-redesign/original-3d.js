import {createRealisticRoom} from './realistic-room.js';
const $=s=>document.querySelector(s),s=await(await fetch('./original-3d.json')).json();
let view='room',world;
document.title='老人房 · 实时3D材质效果';
$('#content').innerHTML=`<header><div><div class="tag">原图布置 · 统一暖白原木风格</div><h1>床头朝左，衣柜沿下墙</h1><small>暖白墙面、浅橡木、米灰织物；实时3D，可旋转、缩放和切换视角。</small></div><nav><button data-view="room" class="active">实时3D</button><button data-view="photo">静态风格参考</button><button data-view="source">对照原图</button></nav></header>
<main><aside><h2>按原图的位置关系</h2><p>床头朝左，床横放。<br>床头两侧各一个小柜。<br>整排推拉门衣柜沿下方墙。<br>原门位与凸起飘窗保留。</p><hr><h2>切换视角</h2><button id="overview">整体鸟瞰</button><button id="entry">从门口看</button><p class="muted">拖动旋转，滚轮缩放。鸟瞰隐藏外墙，门口视角显示完整墙体。</p></aside>
<section class="stage"><div id="photo"><a href="./elder-photoreal-v1.png" target="_blank"><img src="./elder-photoreal-v1.png" alt="暖白浅橡木老人房写实效果图，横向床、衣柜与湖景转角飘窗" style="width:100%;height:auto;display:block;border-radius:10px"></a><p class="note">点击图片打开原始清晰图 · 1672×941像素 · 旧版静态风格参考，尚未反映40cm薄柜和床箱；非现场实拍。湖景为示意，空间净距请以尺寸模型和实测为准。</p></div><div id="model" style="display:none"></div><svg id="source-plan" viewBox="30 270 390 415" style="display:none;width:100%;height:640px;background:white" role="img" aria-label="原户型老人房局部"><image href="./original-plan.png" width="1920" height="890"/></svg><p class="note">3D布置示意，非施工图。床架183×154cm；床垫150×180cm；衣柜180×40cm。窗外为示意湖景贴图。</p></section>
<aside><h2>床下放被褥，薄柜放衣服</h2><p>床改为封闭床箱，上翻床板收纳换季被褥；不做向通道拉出的床下抽屉。支撑五金、开启力度与锁止方式待选，不把普通掀板当作已适合老人使用。</p><p>薄衣柜180×40cm，采用双扇错层推拉门，40cm总深包含门轨；60cm宽前后排列挂衣区，120cm宽叠放区；内部配置暂为规划。</p><h2>飘窗留给湖景</h2><p>完整保留凸起台体，不砸、不加高、不做整排窗上柜，正面不放高物件。台高暂按55cm表示，实际高度待核。</p><h2>尺寸诚实展示</h2><p class="warning">按原图位置关系放入目前家具尺寸，衣柜改为40cm总深后，床侧到柜前约51cm，仍属紧凑布置，门扇沿柜面滑动，不向通道平开；轨道占深、有效开口和实际取衣动作仍需核实。左侧床头局部与窗区的构造关系也未核实。这张图用于看原图布置的空间效果，不表示通道已经合格。</p><p class="muted">两侧床头柜示意：32×30cm、30×30cm。图中位置由原图估读，不是现场放线尺寸。原图没有标注家具尺寸，不可直接据此下单。</p></aside></main>`;
async function buildWorld(){return createRealisticRoom($('#model'),s);}

async function show(v){view=v;$('#photo').style.display=v==='photo'?'block':'none';$('#model').style.display=v==='room'?'block':'none';$('#source-plan').style.display=v==='source'?'block':'none';document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));if(v==='room'){world??=await buildWorld();world.rebuild();}}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));
$('#overview').onclick=async()=>{await show('room');world.look('overview');$('.stage').scrollIntoView({block:'start'});};$('#entry').onclick=async()=>{await show('room');world.look('entry');$('.stage').scrollIntoView({block:'start'});};
await show('room');
