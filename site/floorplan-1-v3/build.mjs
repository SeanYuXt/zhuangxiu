import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const plan = JSON.parse(fs.readFileSync(path.join(root, 'plan.json'), 'utf8'));

const VIEW_W = 1920;
const VIEW_H = 890;
const ORIGIN_X = 42.222;
const ORIGIN_Y = 856.667;
const PX_PER_M = 100;
const px = x => ORIGIN_X + x * PX_PER_M;
const py = z => ORIGIN_Y - z * PX_PER_M;

function svgPath(commands) {
  return commands.map(item => {
    const [command, ...points] = item;
    if (command === 'h') return 'Z';
    const mapped = points.map(point => `${px(point[0]).toFixed(2)} ${py(point[1]).toFixed(2)}`).join(' ');
    return `${command.toUpperCase()} ${mapped}`;
  }).join(' ');
}

function traceSvg(stroke = '#343832', opacity = 1, includeBackground = true) {
  const thinWidth = includeBackground ? 1.8 : 2.6;
  const boldWidth = includeBackground ? 2.8 : 4.0;
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" role="img" aria-label="从PDF直接提取的建筑矢量线">`];
  if (includeBackground) parts.push('<rect width="100%" height="100%" fill="#fffdf9"/>');
  parts.push(`<g fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-linecap="square" stroke-linejoin="miter">`);
  for (const wall of plan.walls) {
    const width = wall.pdf_linewidth > 0.12 ? boldWidth : thinWidth;
    parts.push(`<line x1="${px(wall.a[0])}" y1="${py(wall.a[1])}" x2="${px(wall.b[0])}" y2="${py(wall.b[1])}" stroke-width="${width}"/>`);
  }
  for (const item of plan.source_paths) {
    const color = item.kind === 'door_arc' ? '#9a6d4f' : stroke;
    const width = item.kind === 'door_arc' ? (includeBackground ? 2.1 : 3.0) : (item.pdf_linewidth > 0.12 ? boldWidth : thinWidth);
    parts.push(`<path d="${svgPath(item.commands)}" stroke="${color}" stroke-width="${width}"/>`);
  }
  parts.push('</g></svg>');
  return parts.join('');
}

const modelSpaces = plan.spaces.map(space => ({ ...space }));
function polygonArea(polygon) {
  return Math.abs(polygon.reduce((sum, point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    return sum + point[0] * next[1] - next[0] * point[1];
  }, 0)) / 2;
}
for (const space of modelSpaces) space.area = space.polygons.reduce((sum, polygon) => sum + polygonArea(polygon), 0);

const cleanSvg = traceSvg();
const overlaySvg = traceSvg('#d33b32', 0.9, false);
const floorTraceSvg = traceSvg('#4b4b45', 0.78, false);
const floorFills = modelSpaces.flatMap(space => space.polygons.map(polygon => `<polygon points="${polygon.map(point => `${px(point[0]).toFixed(2)},${py(point[1]).toFixed(2)}`).join(' ')}" fill="${space.color}" fill-opacity="0.82"/>`)).join('');
const floorLabels = modelSpaces.map(space => `<g class="room-labels"><rect x="${px(space.label_at[0])-63}" y="${py(space.label_at[1])-17}" width="126" height="34" rx="8" fill="#fffdf9" fill-opacity="0.9" stroke="#cfc8bc"/><text x="${px(space.label_at[0])}" y="${py(space.label_at[1])-2}" text-anchor="middle" font-family="Microsoft YaHei, sans-serif" font-size="12" font-weight="700" fill="#373731">${space.label}</text><text x="${px(space.label_at[0])}" y="${py(space.label_at[1])+12}" text-anchor="middle" font-family="Microsoft YaHei, sans-serif" font-size="10" fill="#77736b">${space.area.toFixed(1)} m²（模型）</text></g>`).join('');
const designSvg = cleanSvg.replace('<rect width="100%" height="100%" fill="#fffdf9"/>', `<rect width="100%" height="100%" fill="#fffdf9"/>${floorFills}${floorLabels}`);
fs.writeFileSync(path.join(root, 'plan-2d-source-trace.svg'), cleanSvg, 'utf8');
fs.writeFileSync(path.join(root, 'plan-2d-floor-trace.svg'), floorTraceSvg, 'utf8');
fs.writeFileSync(path.join(root, 'plan-2d-design.svg'), designSvg, 'utf8');

function flattenArchitecturalSegments() {
  const output = plan.walls.map(wall => ({ id: wall.id, a: wall.a, b: wall.b }));
  for (const item of plan.source_paths.filter(pathItem => pathItem.kind === 'architectural_path')) {
    let current = null;
    let part = 0;
    for (const command of item.commands) {
      const [kind, ...points] = command;
      if (kind === 'm' && points[0]) current = points[0];
      if (kind === 'l' && current && points[0]) {
        output.push({ id: `${item.id}-part-${part++}`, a: current, b: points[0] });
        current = points[0];
      }
    }
  }
  return output.filter(segment => Math.hypot(segment.b[0] - segment.a[0], segment.b[1] - segment.a[1]) > 0.04);
}

const windowGroups = [
  [10, 11, 12, 13], [16, 17, 18, 19], [26, 27, 28, 29],
  [30, 31, 32, 33], [34, 35, 36, 37], [53, 54, 55, 56],
  [59, 60, 61, 62], [77, 78, 79, 80], [82, 83, 84, 85],
  [86, 87, 88, 89], [90, 91, 92, 93]
].map(group => group.map(index => `pdf-line-${String(index).padStart(3, '0')}`));
const windowIds = new Set(windowGroups.flat());
const fixedBoundaryIds = new Set([22, 23, 24, 25, 64, 65, 94, 95, 96].map(index => `pdf-line-${String(index).padStart(3, '0')}`));
const rawSegments = flattenArchitecturalSegments();
const traceWalls = rawSegments.filter(segment => !windowIds.has(segment.id));

function orientation(segment) {
  if (Math.abs(segment.a[1] - segment.b[1]) < 0.012) return 'h';
  if (Math.abs(segment.a[0] - segment.b[0]) < 0.012) return 'v';
  return 'd';
}

function normalized(segment) {
  const kind = orientation(segment);
  if (kind === 'h') return { ...segment, kind, fixed: (segment.a[1] + segment.b[1]) / 2, lo: Math.min(segment.a[0], segment.b[0]), hi: Math.max(segment.a[0], segment.b[0]) };
  if (kind === 'v') return { ...segment, kind, fixed: (segment.a[0] + segment.b[0]) / 2, lo: Math.min(segment.a[1], segment.b[1]), hi: Math.max(segment.a[1], segment.b[1]) };
  return { ...segment, kind };
}

const candidates = rawSegments.filter(segment => !windowIds.has(segment.id) && !fixedBoundaryIds.has(segment.id)).map(normalized);
const pairWalls = [];
const used = new Set();
for (let i = 0; i < candidates.length; i++) {
  const first = candidates[i];
  if (first.kind === 'd') continue;
  let best = null;
  for (let j = i + 1; j < candidates.length; j++) {
    const second = candidates[j];
    if (first.kind !== second.kind) continue;
    const gap = Math.abs(first.fixed - second.fixed);
    if (gap < 0.075 || gap > 0.24) continue;
    const lo = Math.max(first.lo, second.lo);
    const hi = Math.min(first.hi, second.hi);
    const overlap = hi - lo;
    if (overlap < 0.11) continue;
    const thicknessScore = Math.min(Math.abs(gap - 0.2), Math.abs(gap - 0.12));
    const score = thicknessScore - overlap * 0.002;
    if (!best || score < best.score) best = { second, gap, lo, hi, score };
  }
  if (!best) continue;
  const fixed = (first.fixed + best.second.fixed) / 2;
  const a = first.kind === 'h' ? [best.lo, fixed] : [fixed, best.lo];
  const b = first.kind === 'h' ? [best.hi, fixed] : [fixed, best.hi];
  pairWalls.push({ a, b, thickness: best.gap, source: 'paired-pdf-wall-lines' });
  used.add(first.id);
  used.add(best.second.id);
}

const wallKeys = new Set();
const solidWalls = [];
for (const wall of pairWalls) {
  const key = [...wall.a, ...wall.b].map(value => Math.round(value * 50) / 50).join(':');
  const reverse = [...wall.b, ...wall.a].map(value => Math.round(value * 50) / 50).join(':');
  if (wallKeys.has(key) || wallKeys.has(reverse)) continue;
  wallKeys.add(key);
  solidWalls.push(wall);
}
const windows = windowGroups.map((ids, index) => {
  const group = rawSegments.filter(segment => ids.includes(segment.id)).map(normalized);
  const kind = group[0].kind;
  const fixed = group.reduce((sum, segment) => sum + segment.fixed, 0) / group.length;
  const lo = Math.max(...group.map(segment => segment.lo));
  const hi = Math.min(...group.map(segment => segment.hi));
  return {
    id: `window-${index + 1}`,
    a: kind === 'h' ? [lo, fixed] : [fixed, lo],
    b: kind === 'h' ? [hi, fixed] : [fixed, hi]
  };
});

fs.writeFileSync(path.join(root, 'solid-geometry.json'), JSON.stringify({ solidWalls, windows }, null, 2), 'utf8');

const footprint = [
  [0.703, 0.1], [17.627, 0.1], [17.627, 0.853], [18.227, 0.853],
  [18.227, 2.66], [17.627, 2.66], [17.627, 4.077], [18.227, 4.077],
  [18.227, 7.23], [17.023, 7.23], [17.023, 6.627], [12.198, 6.627],
  [12.198, 7.26], [5.813, 7.26], [5.813, 5.563], [5.303, 5.563],
  [4.097, 5.563], [4.097, 5.09], [3.053, 5.09], [3.053, 5.593],
  [0.1, 5.593], [0.1, 4.087], [0.703, 4.087]
];

const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>1号房 · 实体户型重建</title>
<style>
:root{--bg:#f4f1ea;--panel:#fbfaf6;--line:#ddd8cd;--text:#373731;--muted:#827f77;--accent:#5c6255;--soft:#e6e9df;--danger:#a1483f}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.45 "Microsoft YaHei",system-ui,sans-serif;overflow:hidden}header{height:78px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;border-bottom:1px solid var(--line);background:rgba(251,250,246,.98)}h1{font:600 23px/1.1 Georgia,"Songti SC",serif;margin:0 0 6px}.subtitle{font-size:12px;color:var(--muted)}.seg{display:flex;background:#ece9e1;padding:4px;border-radius:12px;gap:3px}.seg button{border:0;background:transparent;color:#6d6a63;padding:8px 14px;border-radius:9px;cursor:pointer}.seg button.active{background:var(--accent);color:#fffdf8}.layout{height:calc(100vh - 78px);display:grid;grid-template-columns:270px minmax(560px,1fr) 286px;gap:14px;padding:14px}.panel{background:var(--panel);border:1px solid var(--line);border-radius:20px;min-height:0}.side{padding:18px;overflow:auto}.side h2,.right h2{font-size:15px;margin:0 0 13px}.status{padding:10px 12px;border-radius:12px;background:#f2e7e3;color:#7b3d37;font-size:12px;margin-bottom:14px}.row{padding:11px 0;border-bottom:1px solid #ece7de}.row b{display:block;font-size:12px;margin-bottom:3px}.row span{font-size:11px;color:var(--muted)}.control{margin:16px 0}.control label{display:flex;justify-content:space-between;font-size:12px;color:#67645d}.control input[type=range]{width:100%;accent-color:var(--accent)}.stage{position:relative;overflow:hidden;background:#e9e5dc}.view{position:absolute;inset:14px;border-radius:14px;overflow:hidden;background:#fff;display:none}.view.active{display:block}.view svg,.view img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.overlay-wrap{position:absolute;inset:0}.source{z-index:1}.trace{z-index:2;pointer-events:none}.legend{position:absolute;left:16px;bottom:14px;z-index:5;background:rgba(255,253,249,.94);border:1px solid var(--line);border-radius:10px;padding:7px 10px;font-size:11px}.legend i{display:inline-block;width:22px;height:2px;background:#d33b32;vertical-align:middle;margin-right:6px}.canvas-wrap canvas{width:100%;height:100%;display:block;background:#e9e5dc;cursor:grab}.canvas-wrap canvas:active{cursor:grabbing}.right{padding:18px;overflow:auto}.badge{display:inline-flex;background:var(--soft);color:var(--accent);border-radius:999px;padding:6px 10px;font-weight:700;font-size:11px;margin-bottom:14px}.right ul{padding-left:18px;margin:8px 0;color:#66635c;font-size:12px}.right li{margin:7px 0}.notice{margin-top:16px;background:var(--accent);color:#f6f3ec;border-radius:14px;padding:14px;font-size:11px}.notice b{display:block;margin-bottom:5px}.hud{position:absolute;right:16px;bottom:14px;background:rgba(255,253,249,.94);border:1px solid var(--line);border-radius:10px;padding:7px 10px;font-size:11px;z-index:4}.north{position:absolute;right:16px;top:14px;background:rgba(255,253,249,.94);border:1px solid var(--line);border-radius:10px;padding:7px 10px;font-size:11px;z-index:4}@media(max-width:1080px){body{overflow:auto}.layout{height:auto;grid-template-columns:1fr}.stage{height:65vh;min-height:480px;order:1}.side{order:2}.right{order:3}}
</style></head><body>
<header><div><h1>1号房 · 实体户型重建</h1><div class="subtitle">矢量二维户型与可旋转 3D 共用房间多边形、墙线和门窗坐标</div></div><div class="seg"><button data-view="overlay" class="active">二维户型</button><button data-view="trace">原始结构线</button><button data-view="three">可旋转 3D</button></div></header>
<main class="layout"><aside class="panel side"><h2>空间定位</h2><div class="status">本页不再使用原图贴图。彩色地面是独立房间多边形，墙体由 PDF 建筑矢量线挤出。</div><div class="control"><label><span>3D 墙体透明度</span><span id="opacityLabel">70%</span></label><input id="opacity" type="range" min="20" max="100" value="70"></div><div class="control"><label><span>显示面积标签</span><input id="showSource" type="checkbox" checked></label></div>${modelSpaces.map(space => `<div class="row"><b>${space.label}</b><span>${space.area.toFixed(1)} m²（按模型边界计算）</span></div>`).join('')}</aside>
<section class="panel stage" id="stage"><div class="view active" id="overlay"><div class="overlay-wrap"><div class="trace" id="traceOverlay">${designSvg}</div></div><div class="legend"><i></i>独立矢量地面 + PDF 原始墙线</div></div><div class="view" id="trace">${cleanSvg}<div class="north">↑ 图纸上方（未提供真实北向）</div></div><div class="view canvas-wrap" id="three"><canvas id="scene"></canvas><div class="hud">拖动旋转 · 滚轮缩放 · 无原图贴图</div></div></section>
<aside class="panel right"><h2>几何核验</h2><div class="badge">实体重建进行中</div><ul><li>左侧卧室位于厨房左侧</li><li>卫生间位于右上卧室左侧</li><li>右侧上下两间卧室保持原图位置</li><li>客餐厅与中央公共区连续</li><li>6 组门弧、11 组窗框来自 PDF 坐标</li></ul><div class="notice"><b>精度说明</b>图纸没有房间面积标签和北向箭头；当前面积是模型边界计算值，只能作为发布图精度核对，不能作为施工尺寸。</div></aside></main>
<script>
const PLAN=${JSON.stringify(plan).replace(/</g,'\\u003c')};
const MODEL_SPACES=${JSON.stringify(modelSpaces)};
const SOLID_WALLS=${JSON.stringify(solidWalls)};
const TRACE_WALLS=${JSON.stringify(traceWalls)};
const WINDOWS=${JSON.stringify(windows)};
const FOOTPRINT=${JSON.stringify(footprint)};
const stage=document.getElementById('stage'),canvas=document.getElementById('scene'),ctx=canvas.getContext('2d');let mode='overlay',yaw=-.08,pitch=1.18,zoom=.9,drag=false,last=[0,0],focus=[9.16,3.68],wallAlpha=.7;const traceImage=new Image();traceImage.src='plan-2d-floor-trace.svg';traceImage.onload=()=>draw();
function setView(v){mode=v;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));document.querySelectorAll('.view').forEach(e=>e.classList.toggle('active',e.id===v));if(v==='three'){resize();draw()}}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
document.getElementById('opacity').oninput=e=>{wallAlpha=+e.target.value/100;document.getElementById('opacityLabel').textContent=e.target.value+'%';draw()};
document.getElementById('showSource').onchange=e=>document.querySelectorAll('.room-labels').forEach(label=>label.style.display=e.target.checked?'block':'none');
function project(v){const dx=v[0]-focus[0],dz=v[2]-focus[1],cy=Math.cos(yaw),sy=Math.sin(yaw),xr=dx*cy-dz*sy,zr=dx*sy+dz*cy,sc=Math.min(stage.clientWidth/20.5,stage.clientHeight/10.5)*zoom;return[stage.clientWidth/2+xr*sc,stage.clientHeight*.57+(zr*Math.sin(pitch)-v[1]*Math.cos(pitch))*sc,zr*Math.cos(pitch)+v[1]*Math.sin(pitch)]}
function face(vertices,fill,stroke,alpha){return{vertices,fill,stroke,alpha,depth:vertices.reduce((s,v)=>s+project(v)[2],0)/vertices.length}}
function wallBox(a,b,t,y0,y1,color,alpha){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.001)return[];const nx=-dz/L*t/2,nz=dx/L*t/2;const v=[[a[0]+nx,y0,a[1]+nz],[b[0]+nx,y0,b[1]+nz],[b[0]-nx,y0,b[1]-nz],[a[0]-nx,y0,a[1]-nz],[a[0]+nx,y1,a[1]+nz],[b[0]+nx,y1,b[1]+nz],[b[0]-nx,y1,b[1]-nz],[a[0]-nx,y1,a[1]-nz]];return[face([v[4],v[5],v[6],v[7]],color,'#b8b1a5',alpha),face([v[0],v[1],v[5],v[4]],color,'#b8b1a5',alpha),face([v[1],v[2],v[6],v[5]],color,'#aaa398',alpha),face([v[2],v[3],v[7],v[6]],color,'#aaa398',alpha),face([v[3],v[0],v[4],v[7]],color,'#aaa398',alpha)]}
function makeFaces(){const out=[];for(const w of TRACE_WALLS)out.push(...wallBox(w.a,w.b,.055,0,1.32,'#fffdf7',wallAlpha));for(const w of WINDOWS){out.push(...wallBox(w.a,w.b,.05,.42,1.25,'#79aaa8',Math.min(.72,wallAlpha)))}return out}
function resize(){const d=devicePixelRatio||1,w=stage.clientWidth,h=stage.clientHeight;canvas.width=w*d;canvas.height=h*d;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(d,0,0,d,0,0)}
function drawFloor(){for(const space of MODEL_SPACES){for(const polygon of space.polygons){const points=polygon.map(point=>project([point[0],0,point[1]]));ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=space.color;ctx.fill();ctx.strokeStyle='#b8b1a5';ctx.lineWidth=.8;ctx.stroke()}}}
function drawTraceFloor(){if(!traceImage.complete)return;const minX=-.42222,maxX=18.77778,minZ=-.33333,maxZ=8.56667;const p0=project([minX,.018,maxZ]),p1=project([maxX,.018,maxZ]),p2=project([minX,.018,minZ]);ctx.save();ctx.globalAlpha=.28;ctx.transform((p1[0]-p0[0])/1920,(p1[1]-p0[1])/1920,(p2[0]-p0[0])/890,(p2[1]-p0[1])/890,p0[0],p0[1]);ctx.drawImage(traceImage,0,0,1920,890);ctx.restore();ctx.globalAlpha=1}
function draw(){if(mode!=='three')return;ctx.clearRect(0,0,stage.clientWidth,stage.clientHeight);ctx.fillStyle='#e9e5dc';ctx.fillRect(0,0,stage.clientWidth,stage.clientHeight);drawFloor();drawTraceFloor();for(const f of makeFaces().sort((a,b)=>b.depth-a.depth)){const p=f.vertices.map(project);ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)ctx.lineTo(p[i][0],p[i][1]);ctx.closePath();ctx.globalAlpha=f.alpha;ctx.fillStyle=f.fill;ctx.fill();ctx.strokeStyle=f.stroke;ctx.lineWidth=.65;ctx.stroke()}ctx.globalAlpha=1}
canvas.onpointerdown=e=>{drag=true;last=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)};canvas.onpointermove=e=>{if(!drag)return;yaw+=(e.clientX-last[0])*.008;pitch=Math.max(.2,Math.min(1.3,pitch+(e.clientY-last[1])*.006));last=[e.clientX,e.clientY];draw()};canvas.onpointerup=()=>drag=false;canvas.onwheel=e=>{e.preventDefault();zoom=Math.max(.45,Math.min(2.8,zoom*Math.exp(-e.deltaY*.001)));draw()};addEventListener('resize',()=>{resize();draw()});resize();
</script></body></html>`;

fs.writeFileSync(path.join(root, 'index.html'), html, 'utf8');
console.log('Generated whole-home floor-plan preview');
