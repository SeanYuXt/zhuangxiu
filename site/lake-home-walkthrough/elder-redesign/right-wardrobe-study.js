import {deskDetail} from './bay-desk-detail.js';
const $=s=>document.querySelector(s),s=await(await fetch('./right-wardrobe-study.json')).json(),source=await(await fetch('./design.json')).json();
let top=s.bedTopWallSafe,view='plan',world,tucked=true;
document.title='老人房 · 右墙整排衣柜方案';
$('#content').innerHTML=`<header><div><div class="tag">另一套试排 · 原墙体不动</div><h1>整排衣柜移到右墙</h1><small>床头靠左实墙，保留飘窗梳妆书写台。代价是床尾通道只有35厘米。</small></div><nav><button data-view="plan" class="active">尺寸平面</button><button data-view="room">空间示意</button><button data-view="desk">飘窗细节</button></nav></header>
<main><aside><h2>这次具体怎么摆</h2><p>左墙：150×180cm床垫<br>右墙：180×60cm整排衣柜<br>左上飘窗：梳妆书写台<br>床下侧：留64cm通道</p><p>衣柜沿右墙纵向排，柜门朝床尾；研究用移门，避免平开门占用通道。60cm为柜体总深，轨道需包含在内。</p><hr><h2>桌凳使用状态</h2><button id="tuck" class="active">凳子收进桌下</button><button id="sit">凳子拉出使用</button><p class="muted">用无靠背凳做空间试排。是否适合父母，应以实际坐稳、起身和支撑需求为准；此处没有把凳子等同于合适的老人座椅。</p></aside>
<section class="stage"><div id="desk-detail" style="display:none">${deskDetail.replace('这轮改进的是飘窗使用方式。切到“尺寸平面”可见：床头全部靠实墙时，1800×600主衣柜前只剩40mm，整间房仍不能按此落地。','本页采用右墙衣柜试排：床尾通道35厘米。飘窗桌是局部方案，整间适用性仍取决于狭窄通道能否接受。')}</div><svg id="plan" role="img" aria-label="右墙衣柜试排，床尾35厘米，床下侧64厘米"></svg><div id="model"></div><p class="note">所有通道同时标厘米和毫米。灰蓝区域为原窗区，台体结构待核。示意家具尚未确定施工做法。</p></section>
<aside><h2>实际留下多少位置</h2><div id="metrics"></div><p class="warning">35厘米是这套方案的瓶颈：能否侧身通过要按本人实测，不能当作舒适通道，也没有搀扶余量。柜前弯腰取衣会局促，暂不配置向通道拉出的内抽屉。</p><h2>比上一版改变了什么</h2><p>原来床侧对着衣柜只剩4厘米；现在床侧释放出64厘米，局促位置移到床尾。家具没有硬碰撞，不代表日常使用已经合格。</p><hr><p class="muted">主段约280×290cm；宽度由图纸尺寸链推算。床架按183×154cm计算。即使床的外长压到180cm，床尾也最多约40cm，不能靠画小家具变成宽通道。</p></aside></main>`;
const bed=()=>[s.bedX,top,s.bedX+s.bedLength,top+s.bedWidth];
function draw(){
 const b=bed(),gap=s.wardrobe[0]-b[2],unsupported=0;$('#metrics').innerHTML=[['床尾至柜门',`${Math.round(gap*100)}cm / ${Math.round(gap*1000)}mm`],['床下侧至墙','64cm / 640mm'],['窗侧名义宽度','72cm · 桌凳占用局部']].map(([a,b])=>`<div class="metric"><span>${a}</span><strong>${b}</strong></div>`).join('');
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
 r(s.wardrobe,'#b6bfa7');line(2.2,.65,2.8,.65);line(2.2,1.25,2.8,1.25);text(2.50,.82,'整排衣柜',.077);text(2.50,.98,'180×60cm',.077);text(2.50,1.14,'移门朝左',.068);
 r([b[2],.74,2.2,1.84],'#ead2b6');line(b[2],1.44,2.2,1.44,'#b55c43');text(2.025,1.60,'35cm',.077,'#a04734');text(2.025,1.73,'350mm',.058,'#a04734');
 line(1.0,b[3],1.0,2.9,'#6c8063');text(1.25,2.59,'64cm',.09);text(.95,2.77,'床下侧通道',.068);
 r([-.55,-.1,.5,.7],'#bfaa84');text(-.30,.27,'梳妆台',.062);text(-.30,.41,'宽80cm',.061);r([-.55,-.5,1.7,-.1],'#c8b99b');text(.85,-.32,'窗上收纳台 · 开窗范围待核',.063);const stool=tucked?[.05,.10,.48,.55]:[.55,.05,1.05,.55];r(stool,'#a8b2a0');text((stool[0]+stool[2])/2,.35,tucked?'收凳':'坐凳',.065);text(1.15,.61,'窗侧上下床需绕过床尾',.057);text(1.45,3.33,'原主段 2800 × 2900mm · 不改墙体',.075);
 $('#tuck').classList.toggle('active',tucked);$('#sit').classList.toggle('active',!tucked);if(world)world.rebuild();
}
async function buildWorld(){
 const T=await import('../vendor/three.module.js'),{OrbitControls,RoundedBoxGeometry}=await import('../vendor/render-libs.js');
 const host=$('#model'),renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});host.append(renderer.domElement);renderer.setClearColor('#e9e5dc');renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(44,1,.05,40),controls=new OrbitControls(camera,renderer.domElement);camera.position.set(-4.2,5.8,4.5);controls.target.set(1,.45,1.15);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;controls.update();scene.add(new T.HemisphereLight('#fff7e9','#989e8f',2));const sun=new T.DirectionalLight('#fff4e0',2.4);sun.position.set(-2,5,-2);scene.add(sun);let root;
 function box(r,y,h,c,alpha=1){const mat=new T.MeshStandardMaterial({color:c,roughness:.85,transparent:alpha<1,opacity:alpha});const mesh=new T.Mesh(new RoundedBoxGeometry(r[2]-r[0],h,r[3]-r[1],2,Math.min(.014,h/3)),mat);mesh.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);root.add(mesh);return mesh;}
 function rebuild(){if(root){root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});scene.remove(root);}root=new T.Group();scene.add(root);box(s.main,-.06,.06,'#cbbda5');
  box([-.60,-.59,2.04,0],0,.55,'#ccd7d0',.45);box([-.60,0,0,.70514],0,.55,'#ccd7d0',.45);
  box([-.06,.70514,0,2.9],0,1.2,'#efe8dc');box([2.8,0,2.86,2.9],0,1.2,'#efe8dc',.65);box([0,2.9,1.86,2.96],0,.85,'#efe8dc',.55);
  box([-.60,-.60,2.04,-.58],.55,1.7,'#a8c4bf',.18);box([-.61,-.59,-.59,.70514],.55,1.7,'#a8c4bf',.18);
  const b=bed();box(b,.08,.23,'#a99171');box([.035,top+.02,1.83,b[3]-.02],.31,.2,'#dfd1bb');box([.02,top,.05,b[3]],.20,.76,'#a5aa94');for(const z of [top+.13,top+.92])box([.13,z,.48,z+.43],.51,.075,'#eee5d6');
  if(top<s.leftSolidWallStart)box([.01,top,.06,s.leftSolidWallStart],.21,.77,'#bc6852',.85);
  box([2.24,.05,2.8,1.85],0,2.4,'#b5bca5');for(let i=0;i<3;i++){const z=.05+i*.6;box([2.2,z+.012,2.22,z+.588],.08,2.27,'#d8d0bf');}
  box([2.735,2.01,2.765,2.9],0,2.05,'#b39c7c',.65);box([-.55,-.1,.5,.7],.72,.03,'#bfaa84');box([-.55,-.5,1.7,-.1],.72,.03,'#bfaa84');const q=tucked?[.05,.1,.48,.55]:[.55,.05,1.05,.55];box(q,.42,.04,'#a8b2a0');for(const z of [q[1]+.05,q[3]-.05])for(const x of [q[0]+.05,q[2]-.05])box([x-.015,z-.015,x+.015,z+.015],0,.42,'#948975');
  resize();}
 function resize(){if(host.clientWidth&&host.clientHeight){renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}}
 new ResizeObserver(resize).observe(host);renderer.setAnimationLoop(()=>{if(view==='room'){controls.update();renderer.render(scene,camera);}});return{rebuild};
}
$('#tuck').onclick=()=>{tucked=true;draw();};$('#sit').onclick=()=>{tucked=false;draw();};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=async()=>{view=b.dataset.view;$('#desk-detail').style.display=view==='desk'?'block':'none';$('#plan').style.display=view==='plan'?'block':'none';$('#model').style.display=view==='room'?'block':'none';document.querySelectorAll('[data-view]').forEach(v=>v.classList.toggle('active',v===b));if(view==='room'){world??=await buildWorld();world.rebuild();}});draw();
