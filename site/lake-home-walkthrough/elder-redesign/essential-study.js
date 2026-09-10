const $=s=>document.querySelector(s),s=await(await fetch('./essential-study.json')).json(),source=await(await fetch('./design.json')).json();
let view='plan',world;
document.title='老人房 · 床柜与湖景';
$('#content').innerHTML=`<header><div><div class="tag">精简布置 · 实体飘窗保留</div><h1>床、整排衣柜、床头柜</h1><small>床长边靠左墙，床头靠下方实墙；窗前空出来，让湖景成为房间的中心。</small></div><nav><button data-view="plan" class="active">尺寸平面</button><button data-view="room">空间示意</button></nav></header>
<main><aside><h2>三件必需家具</h2><p>床垫：150×180cm<br>薄床架：154×183cm<br>移门衣柜：180×60cm<br>床头柜：25×25cm</p><p>床头柜放床的右侧，向床尾方向错开一点，避开原房门开启弧线。</p><hr><h2>飘窗怎么用</h2><p>实体台保留，不砸、不抬高、不包满柜子。正面留空看湖，侧边只放一个可移动小托盘，收眼镜、遥控器等小件。</p><p>先不加固定桌板、坐垫或椅子。床尾到窗台前沿留105cm，可走到窗前看景、开窗和拉帘；不把台体算作通道。</p></aside>
<section class="stage"><svg id="plan" role="img" aria-label="精简老人房：床侧64厘米，床尾至窗台105厘米"></svg><div id="model"></div><p class="note">平面尺寸来自当前图纸模型；窗台不可拆已确认。3D台高暂按55cm表示，实际台面高度仍需实测。</p></section>
<aside><h2>使用净距</h2><div id="metrics"></div><h2>这版的取舍</h2><p class="warning">床头在房门同一面墙的左端。床只留右侧上下床，靠墙的人需从床尾或同侧进出。此项沿用上一条讨论的试排方向，不能理解为双侧方便上下床。</p><p>柜门用移门，避免平开占道。64cm仍是紧凑尺度；床头柜附近还需绕行。现场尺寸、父母起身习惯与柜内使用需在定制前复核。</p><hr><p class="muted">主段约280×290cm。未改变门洞、隔墙或飘窗；衣柜高度示意240cm，不是下单尺寸。</p></aside></main>`;
const bed=()=>s.bed;
function draw(){
 const b=bed(),gap=s.wardrobe[0]-b[2];$('#metrics').innerHTML=[['床侧至衣柜',`${Math.round(gap*100)}cm / ${Math.round(gap*1000)}mm`],['床尾至窗台','105cm / 1050mm'],['床头柜占地','25×25cm']].map(([a,b])=>`<div class="metric"><span>${a}</span><strong>${b}</strong></div>`).join('');
 const svg=$('#plan');svg.replaceChildren();svg.setAttribute('viewBox','-.95 -.95 4.35 4.38');
 const el=(tag,a,t)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));if(t)n.textContent=t;svg.append(n);};
 const r=(r,c)=>el('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill:c,stroke:'#939383','stroke-width':.014,rx:.012});
 const text=(x,y,t,sz=.085,c='#464a40')=>el('text',{x,y,'text-anchor':'middle','font-size':sz,fill:c,'font-family':'system-ui, PingFang SC'},t);
 const line=(x,y,a,b,c='#8f9587',w=.014)=>el('line',{x1:x,y1:y,x2:a,y2:b,stroke:c,'stroke-width':w});
 el('polygon',{points:source.sourcePolygon.map(p=>p.join(',')).join(' '),fill:'#d5e1dc',stroke:'#8ca29a','stroke-width':.025,'stroke-dasharray':'.04 .02'});r(s.main,'#f0e9db');text(.72,-.75,'湖景转角窗 · 实体飘窗不可拆',.093);
 line(0,s.leftSolidWallStart,0,2.9,'#58604e',.045);text(-.28,1.25,'实墙',.08);
 line(1.86,2.9,2.75,2.9,'#e9e5dc',.06);el('path',{d:'M1.86 2.9 A.89 .89 0 0 1 2.75 2.01',fill:'none',stroke:'#ad895d','stroke-width':.016,'stroke-dasharray':'.03 .02'});line(2.75,2.9,2.75,2.01,'#ad895d',.03);text(2.3,3.08,'原房门',.08);
 r(b,'#d7c8af');r([b[0],b[3]-.04,b[2],b[3]],'#9ca28d');for(const x of [.15,.89])r([x,2.48,x+.47,2.81],'#eee6d8');text(.79,1.72,'150 × 180cm 床垫',.085);text(.79,1.91,'床头靠下方实墙',.077);r(s.nightstand,'#baa382');text(1.70,2.49,'床头柜',.06);text(1.70,2.59,'25×25',.06);
 r(s.wardrobe,'#b6bfa7');line(2.2,.65,2.8,.65);line(2.2,1.25,2.8,1.25);text(2.50,.82,'整排衣柜',.077);text(2.50,.98,'180×60cm',.077);text(2.50,1.14,'移门朝左',.068);
 line(b[2],1.40,2.2,1.40,'#71866b');text(1.88,1.58,'64cm',.088);text(1.88,1.73,'640mm',.065);
 line(.90,0,.90,b[1],'#71866b');text(1.30,.43,'105cm',.094);text(1.30,.60,'窗前空地',.077);text(1.30,.76,'不放桌椅',.067);
 r([-.49,.13,-.15,.40],'#b6a280');text(-.32,.29,'小托盘',.059);text(.90,-.30,'正面留空 · 看湖',.085);text(1.45,3.33,'主段 280 × 290cm · 家具尺寸以外框计',.075);
 if(world)world.rebuild();
}
async function buildWorld(){
 const T=await import('../vendor/three.module.js'),{OrbitControls,RoundedBoxGeometry}=await import('../vendor/render-libs.js');
 const host=$('#model'),renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});host.append(renderer.domElement);renderer.setClearColor('#e9e5dc');renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(44,1,.05,40),controls=new OrbitControls(camera,renderer.domElement);camera.position.set(-4.2,5.8,4.5);controls.target.set(1,.45,1.15);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;controls.update();scene.add(new T.HemisphereLight('#fff7e9','#989e8f',2));const sun=new T.DirectionalLight('#fff4e0',2.4);sun.position.set(-2,5,-2);scene.add(sun);let root;
 function box(r,y,h,c,alpha=1){const mat=new T.MeshStandardMaterial({color:c,roughness:.85,transparent:alpha<1,opacity:alpha});const mesh=new T.Mesh(new RoundedBoxGeometry(r[2]-r[0],h,r[3]-r[1],2,Math.min(.014,h/3)),mat);mesh.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);root.add(mesh);return mesh;}
 function rebuild(){if(root){root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});scene.remove(root);}root=new T.Group();scene.add(root);box(s.main,-.06,.06,'#cbbda5');
  box([-.60,-.59,2.04,0],0,.55,'#ccd7d0',1);box([-.60,0,0,.70514],0,.55,'#ccd7d0',1);
  box([-.06,.70514,0,2.9],0,1.2,'#efe8dc');box([2.8,0,2.86,2.9],0,1.2,'#efe8dc',.65);box([0,2.9,1.86,2.96],0,.85,'#efe8dc',.55);
  box([-.60,-.60,2.04,-.58],.55,1.7,'#a8c4bf',.18);box([-.61,-.59,-.59,.70514],.55,1.7,'#a8c4bf',.18);
  const b=bed();box(b,.08,.23,'#a99171');box([b[0]+.02,b[1]+.015,b[2]-.02,b[3]-.015],.31,.2,'#dfd1bb');box([b[0],b[3]-.035,b[2],b[3]],.20,.76,'#a5aa94');for(const x of [.15,.89])box([x,2.48,x+.47,2.81],.51,.075,'#eee5d6');box(s.nightstand,0,.48,'#baa382');
  box([2.24,.05,2.8,1.85],0,2.4,'#b5bca5');for(let i=0;i<3;i++){const z=.05+i*.6;box([2.2,z+.012,2.22,z+.588],.08,2.27,'#d8d0bf');}
  box([2.735,2.01,2.765,2.9],0,2.05,'#b39c7c',.65);box([-.49,.13,-.15,.40],.55,.035,'#b6a280');
  resize();}
 function resize(){if(host.clientWidth&&host.clientHeight){renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}}
 new ResizeObserver(resize).observe(host);renderer.setAnimationLoop(()=>{if(view==='room'){controls.update();renderer.render(scene,camera);}});return{rebuild};
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=async()=>{view=b.dataset.view;$('#plan').style.display=view==='plan'?'block':'none';$('#model').style.display=view==='room'?'block':'none';document.querySelectorAll('[data-view]').forEach(v=>v.classList.toggle('active',v===b));if(view==='room'){world??=await buildWorld();world.rebuild();}});draw();
