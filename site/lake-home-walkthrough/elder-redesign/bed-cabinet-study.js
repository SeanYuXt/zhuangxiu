import {deskDetail} from './bay-desk-detail.js';
const $=s=>document.querySelector(s),s=await(await fetch('./bed-cabinet-study.json')).json(),source=await(await fetch('./design.json')).json();
let top=s.bedTopWallSafe,view='desk',world;
document.title='老人房 · 飘窗梳妆书写台研究';
$('#content').innerHTML=`<header><div><div class="tag">现有墙体内 · 飘窗功能深化</div><h1>把飘窗用作梳妆书写区</h1><small>桌子补回来了；整间布局尚未成立，床与主衣柜的净距冲突保留标注。</small></div><nav><button data-view="desk" class="active">飘窗细节</button><button data-view="plan">尺寸平面</button><button data-view="room">空间示意</button></nav></header>
<main><aside><h2>家具安排</h2><p>1500 × 1800mm床垫<br>1830 × 1540mm薄床架<br>1800 × 600mm整排衣柜<br>800mm宽梳妆书写位</p><p>左侧飘窗架高桌板，前沿伸入室内500mm；前方飘窗接收纳台。坐在室内，膝下不做抽屉，翻盖镜收起后写字。</p><hr><h2>看清位置的取舍</h2><button id="near">床侧靠近飘窗</button><button id="solid">床头全部靠左实墙</button><label>床向室内移动 <input id="shift" type="range" min="0.15" max="0.72" step="0.01" value="0.72"></label><p class="muted">拖动后床头关系与柜前净距同步变化，墙、门、衣柜均不移动。</p></aside>
<section class="stage"><div id="desk-detail">${deskDetail}</div><svg style="display:none" id="plan" role="img" aria-label="床靠窗与衣柜净距试排"></svg><div id="model"></div><p class="note">灰蓝色为原转角窗轮廓。3D剖切墙用于看布置，窗台体按550mm高研究，尚非结构确认。</p></section>
<aside><h2>当前尺寸</h2><div id="metrics"></div><p id="status" class="warning"></p><h2>保留的要求</h2><p>不扩大房间，不挪厨房隔墙，不把床头转到开门一侧，不用浅柜替代主衣柜。</p><hr><p class="muted">主段约2800×2900mm。左侧完整实墙起点约705mm来自当前图纸模型。模型边界与现场完成面仍需一致；此页没有宣称已找到全部满足的布局。</p></aside></main>`;
const bed=()=>[s.bedX,top,s.bedX+s.bedLength,top+s.bedWidth];
function draw(){
 const b=bed(),gap=s.wardrobe[1]-b[3],unsupported=Math.max(0,s.leftSolidWallStart-top);$('#metrics').innerHTML=[['柜前至床侧',Math.round(gap*1000)+' mm'],['床尾至右墙','950 mm'],['床头缺少实墙段',Math.round(unsupported*1000)+' mm']].map(([a,b])=>`<div class="metric"><span>${a}</span><strong>${b}</strong></div>`).join('');
 $('#status').textContent=unsupported>0?`柜前留出了${Math.round(gap*1000)}mm，但床头有约${Math.round(unsupported*1000)}mm落在左侧窗区。这部分没有实墙，仍违背床头避窗的要求，不能定稿。`:`床头完整靠左实墙，但柜前只有${Math.round(gap*1000)}mm，不能正常站立取衣。这也不是可用定稿。`;
 const svg=$('#plan');svg.replaceChildren();svg.setAttribute('viewBox','-.95 -.95 4.35 4.38');
 const el=(tag,a,t)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));if(t)n.textContent=t;svg.append(n);};
 const r=(r,c)=>el('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill:c,stroke:'#939383','stroke-width':.014,rx:.012});
 const text=(x,y,t,sz=.085,c='#464a40')=>el('text',{x,y,'text-anchor':'middle','font-size':sz,fill:c,'font-family':'system-ui, PingFang SC'},t);
 const line=(x,y,a,b,c='#8f9587',w=.014)=>el('line',{x1:x,y1:y,x2:a,y2:b,stroke:c,'stroke-width':w});
 el('polygon',{points:source.sourcePolygon.map(p=>p.join(',')).join(' '),fill:'#d5e1dc',stroke:'#8ca29a','stroke-width':.025,'stroke-dasharray':'.04 .02'});r(s.main,'#f0e9db');text(.72,-.75,'转角窗 · 台体条件待核',.093);
 line(0,s.leftSolidWallStart,0,2.9,'#58604e',.045);text(-.28,1.25,'实墙',.08);
 line(1.86,2.9,2.75,2.9,'#e9e5dc',.06);el('path',{d:'M1.86 2.9 A.89 .89 0 0 1 2.75 2.01',fill:'none',stroke:'#ad895d','stroke-width':.016,'stroke-dasharray':'.03 .02'});line(2.75,2.9,2.75,2.01,'#ad895d',.03);text(2.3,3.08,'原房门',.08);
 r(b,'#d7c8af');r([b[0],b[1],b[0]+.04,b[3]],'#9ca28d');for(const z of [top+.13,top+.92])r([.13,z,.48,z+.43],'#eee6d8');text(1.13,top+.72,'1500 × 1800 床垫',.092);text(1.13,top+.90,'床架 1830 × 1540',.075);
 if(unsupported>0){line(.04,top,.04,s.leftSolidWallStart,'#b85845',.07);text(-.32,top+.18,'床头缺墙',.075,'#a74332');text(-.32,top+.31,Math.round(unsupported*1000)+'mm',.075,'#a74332');}
 r(s.wardrobe,'#b6bfa7');for(const x of [.62,1.22])line(x,2.3,x,2.9);text(.92,2.55,'整排衣柜 1800 × 600',.088);text(.92,2.73,'正常深度 · 门型待选',.067);
 line(1.05,b[3],1.05,2.3,gap>=.6?'#7d8a6e':'#b55c43');text(1.38,(b[3]+2.3)/2+.03,Math.round(gap*1000)+'mm',.10,gap>=.6?'#52624a':'#b04734');
 r([-.55,-.1,.5,.7],'#bfaa84');text(-.025,.27,'梳妆书写台',.073);text(-.025,.41,'宽800',.068);r([-.55,-.5,1.7,-.1],'#c8b99b');text(.85,-.32,'窗上收纳台 · 开窗范围待核',.063);r([.55,.05,1.05,.55],'#a8b2a0');text(.8,.33,'椅',.08);text(.87,.66,'椅后预留待核',.06);text(1.45,3.33,'原主段 2800 × 2900mm · 不改墙体',.075);
 $('#near').classList.toggle('active',top<.4);$('#solid').classList.toggle('active',top>=.70514);if(world)world.rebuild();
}
async function buildWorld(){
 const T=await import('../vendor/three.module.js'),{OrbitControls,RoundedBoxGeometry}=await import('../vendor/render-libs.js');
 const host=$('#model'),renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});host.append(renderer.domElement);renderer.setClearColor('#e9e5dc');renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(44,1,.05,40),controls=new OrbitControls(camera,renderer.domElement);camera.position.set(5.1,4.8,-3.3);controls.target.set(1,.45,1.15);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;controls.update();scene.add(new T.HemisphereLight('#fff7e9','#989e8f',2));const sun=new T.DirectionalLight('#fff4e0',2.4);sun.position.set(-2,5,-2);scene.add(sun);let root;
 function box(r,y,h,c,alpha=1){const mat=new T.MeshStandardMaterial({color:c,roughness:.85,transparent:alpha<1,opacity:alpha});const mesh=new T.Mesh(new RoundedBoxGeometry(r[2]-r[0],h,r[3]-r[1],2,Math.min(.014,h/3)),mat);mesh.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);root.add(mesh);return mesh;}
 function rebuild(){if(root){root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});scene.remove(root);}root=new T.Group();scene.add(root);box(s.main,-.06,.06,'#cbbda5');
  box([-.60,-.59,2.04,0],0,.55,'#ccd7d0',.45);box([-.60,0,0,.70514],0,.55,'#ccd7d0',.45);
  box([-.06,.70514,0,2.9],0,1.2,'#efe8dc');box([2.8,0,2.86,2.9],0,1.2,'#efe8dc',.65);box([0,2.9,1.86,2.96],0,.85,'#efe8dc',.55);
  box([-.60,-.60,2.04,-.58],.55,1.7,'#a8c4bf',.18);box([-.61,-.59,-.59,.70514],.55,1.7,'#a8c4bf',.18);
  const b=bed();box(b,.08,.23,'#a99171');box([.035,top+.02,1.83,b[3]-.02],.31,.2,'#dfd1bb');box([.02,top,.05,b[3]],.20,.76,'#a5aa94');for(const z of [top+.13,top+.92])box([.13,z,.48,z+.43],.51,.075,'#eee5d6');
  if(top<s.leftSolidWallStart)box([.01,top,.06,s.leftSolidWallStart],.21,.77,'#bc6852',.85);
  box([.02,2.34,1.82,2.90],0,2.4,'#b5bca5');for(let i=0;i<3;i++){const x=.02+i*.6;box([x+.012,2.3,x+.588,2.32],.08,2.27,'#d8d0bf');}
  box([2.735,2.01,2.765,2.9],0,2.05,'#b39c7c',.65);box([-.55,-.1,.5,.7],.72,.03,'#bfaa84');box([-.55,-.5,1.7,-.1],.72,.03,'#bfaa84');box([.55,.05,1.05,.55],.42,.04,'#a8b2a0');box([1.01,.05,1.05,.55],.46,.36,'#a8b2a0');for(const z of [.1,.5])for(const x of [.6,1.0])box([x-.015,z-.015,x+.015,z+.015],0,.42,'#948975');
  resize();}
 function resize(){if(host.clientWidth&&host.clientHeight){renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}}
 new ResizeObserver(resize).observe(host);renderer.setAnimationLoop(()=>{if(view==='room'){controls.update();renderer.render(scene,camera);}});return{rebuild};
}
$('#near').onclick=()=>{top=.15;$('#shift').value=top;draw();};$('#solid').onclick=()=>{top=.72;$('#shift').value=top;draw();};$('#shift').oninput=e=>{top=+e.target.value;draw();};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=async()=>{view=b.dataset.view;$('#desk-detail').style.display=view==='desk'?'block':'none';$('#plan').style.display=view==='plan'?'block':'none';$('#model').style.display=view==='room'?'block':'none';document.querySelectorAll('[data-view]').forEach(v=>v.classList.toggle('active',v===b));if(view==='room'){world??=await buildWorld();world.rebuild();}});draw();
