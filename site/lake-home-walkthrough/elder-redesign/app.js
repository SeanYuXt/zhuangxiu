const $=s=>document.querySelector(s);
const design=await (await fetch('./design.json')).json();
let current=design.layouts[0],view='plan',three;
const mm=n=>Math.round(n*1000),rectWidth=r=>r[2]-r[0],rectDepth=r=>r[3]-r[1];
const chair=()=>current[$('#occupied').checked?'chairOccupied':'chairTucked'];
function draw(){
 const svg=$('#plan');svg.replaceChildren();svg.setAttribute('viewBox','-1.02 -1.12 4.38 4.70');
 const el=(tag,attrs,text)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;svg.append(e);return e;};
 const text=(x,y,t,size=.085,color='#474b40')=>el('text',{x,y,'font-size':size,'text-anchor':'middle',fill:color,'font-family':'system-ui, PingFang SC'},t);
 const r=(a,c,stroke='#8c8c7d')=>el('rect',{x:a[0],y:a[1],width:rectWidth(a),height:rectDepth(a),fill:c,stroke,'stroke-width':.012,rx:.015});
 const line=(x,y,a,b,c='#85897b',w=.012)=>el('line',{x1:x,y1:y,x2:a,y2:b,stroke:c,'stroke-width':w});
 function dim(x,y,a,b,label){line(x,y,a,b);const dx=a-x,dy=b-y,len=Math.hypot(dx,dy),nx=-dy/len*.035,ny=dx/len*.035;for(const[p,q]of [[x,y],[a,b]])line(p-nx,q-ny,p+nx,q+ny);const xx=(x+a)/2,yy=(y+b)/2;el('rect',{x:xx-.20,y:yy-.074,width:.4,height:.13,fill:'#fbfaf6',rx:.015});text(xx,yy+.019,label,.075);}
 el('polygon',{points:design.sourcePolygon.map(p=>p.join(',')).join(' '),fill:'#d9e2df',stroke:'#879b97','stroke-width':.028,'stroke-dasharray':'.045 .025'});
 r(design.main,'#f3eee2');
 text(.62,-.77,'转角窗 · 窗侧地面条件待核',.10);
 line(-.48,-.54,1.94,-.54,'#86a7a6',.035);line(-.53,-.48,-.53,.60,'#86a7a6',.035);
 text(-.31,.10,'待核',.075);text(-.31,.25,'窗区',.075);
 // Break the bottom boundary at the retained door opening.
 line(1.86,2.9,2.75,2.9,'#e9e5dc',.06);
 el('path',{d:'M1.86 2.9 A.89 .89 0 0 1 2.75 2.01',fill:'none',stroke:'#ad895d','stroke-width':.012,'stroke-dasharray':'.035 .02'});
 line(2.75,2.9,2.75,2.01,'#ad895d',.03);text(2.3,3.12,'原门洞约890',.085);
 r(current.bed,'#d4c6af');const b=current.bed,vertical=current.bedOrientation==='vertical',east=current.head==='east';
 if(vertical){
  r([b[0],b[1],b[2],b[1]+.03],'#9d9e8c');
  for(const x of [b[0]+.13,b[2]-.63])r([x,b[1]+.10,x+.49,b[1]+.45],'#eee8dc','#b5af9f');
  text((b[0]+b[2])/2,(b[1]+b[3])/2+.04,'1500 × 1800 床垫',.090);
  text((b[0]+b[2])/2,(b[1]+b[3])/2+.20,'床架 1540 × 1830',.074);
  text((b[0]+b[2])/2,b[1]+.58,'床头朝窗',.070);
 }else if(east){
  r([b[2]-.03,b[1],b[2],b[3]],'#9d9e8c');
  for(const y of [b[1]+.13,b[3]-.63])r([b[2]-.45,y,b[2]-.10,y+.49],'#eee8dc','#b5af9f');
  text((b[0]+b[2])/2-.12,(b[1]+b[3])/2-.03,'1500 × 1800 床垫',.094);
  text((b[0]+b[2])/2-.12,(b[1]+b[3])/2+.14,'床架 1540 × 1830',.076);
  text(2.95,.75,'床头',.073);text(2.95,.89,'实墙',.073);
 }else{
  r([b[0],b[1],b[0]+.045,b[3]],'#9d9e8c');
  for(const y of [b[1]+.13,b[3]-.63])r([b[0]+.10,y,b[0]+.45,y+.49],'#eee8dc','#b5af9f');
  text((b[0]+b[2])/2+.12,(b[1]+b[3])/2-.05,'1500 × 2000 床垫',.103);
  text((b[0]+b[2])/2+.12,(b[1]+b[3])/2+.12,'床架外包络 1540 × 2030',.076);
  text(-.17,(b[1]+b[3])/2,'床头',.078);
 }
 r(current.desk,'#bfa887');
 if(east){text(-.325,-.16,'书桌',.075);text(-.325,-.03,'800',.075);text(-.325,.10,'×450',.064);}
 else if(current.id==='solid'){
  text(.245,2.35,'书桌',.08);text(.245,2.49,'800',.08);text(.245,2.62,'×450',.07);
 }else{text(.52,-.20,'书桌 1000 × 450',.085);}
 if(current.wardrobe){
  const w=current.wardrobe;r(w,'#b3bea8');
  if(east){text(.92,2.54,'整排移门衣柜',.090);text(.92,2.72,'1800 × 600',.08);line(.02,2.30,1.82,2.30,'#728468',.025);for(const x of [.62,1.22])line(x,2.30,x,2.9);}
  else if(vertical){text(2.50,.90,'整排',.08);text(2.50,1.05,'移门衣柜',.08);text(2.50,1.23,'1900',.085);text(2.50,1.37,'×600',.075);line(2.2,.06,2.2,1.96,'#728468',.025);for(const y of [.69,1.32])line(2.20,y,2.80,y);}
  else{text(.31,2.52,'窄挂衣柜',.075);text(.31,2.66,'580×600',.065);line(.60,2.32,.60,2.86,'#728468',.025);}
 }
 const cr=chair();r(cr,$('#occupied').checked?'#b8906d88':'#b8bdac99');text((cr[0]+cr[2])/2,(cr[1]+cr[3])/2+.025,$('#occupied').checked?'坐人':'收椅',.078);
 if($('#dimensions').checked){
  dim(0,3.37,2.8,3.37,'2800');dim(3.16,0,3.16,2.9,'2900');
  if(east){dim(0,1.3,b[0],1.3,'950');dim(1.35,b[3],1.35,2.30,'680');text(1.22,-.26,'上侧借窗区通行',.079);}
  else if(vertical){dim(b[2],1.6,2.2,1.6,'640');dim(.9,b[3],.9,2.9,'370');text(-.22,1.9,'左侧仅20',.075);}
  else{dim(1.56,0,1.56,b[1],String(mm(b[1])));dim(b[2],1.20,2.8,1.20,String(mm(2.8-b[2])));dim(1.62,b[3],1.62,2.9,String(mm(2.9-b[3])));}
 }
 text(1.15,-.95,'主段与家具按同一坐标绘制 · 单位 mm',.084);
 $('#title').textContent=current.title;$('#description').textContent=current.note;$('#tradeoff').textContent=current.tradeoff;
 const metrics=east?[['床垫','1500 × 1800'],['整排衣柜','1800 × 600'],['书桌','800 × 450'],['柜前至床侧','680 mm'],['床尾至左墙','950 mm']]:vertical?[['床垫','1500 × 1800'],['床架外包络','1540 × 1830'],['整排衣柜','1900 × 600'],['右侧至衣柜','640 mm'],['床尾至墙','370 mm'],['左侧至墙','20 mm']]:[['床垫','1500 × 2000'],['床架外包络','1540 × 2030'],['窗侧床边',mm(b[1])+' mm'],['床尾至右墙',mm(2.8-b[2])+' mm'],['下侧床边至墙',mm(2.9-b[3])+' mm']];
 $('#metrics').innerHTML=metrics.map(([a,b])=>`<div class="metric"><span>${a}</span><strong>${b}</strong></div>`).join('');
 $('#layoutSubtitle').textContent=east?'床头靠图右厨房实墙 · 整排衣柜在门左 · 不采用床头朝窗':'旧版1.5×2米床 · 床头靠图左实墙 · 原房门保留';
 $('#caption').textContent=east?'D：床头贴图右实墙，衣柜沿门左下墙做满一排。桌椅转向左侧窗；窗侧通行和坐姿仍取决于该区域有连续地面与腿部净空。':current.id==='solid'?'A：书桌转90°，椅子面向左墙。下侧830mm为床到墙的总距离，桌椅占用左端，不能理解为整条通道都宽830mm。':'B：桌前坐人仍在主段内，桌体与收起的椅子借用窗区。必须先核对连续地面、桌下净空和窗帘；不是默认拆飘窗。';
 document.querySelectorAll('[data-layout]').forEach(e=>e.classList.toggle('active',e.dataset.layout===current.id));
 window.elderRedesign={design,current,view};
 updateAudit();if(three)three.rebuild();
}
let audit;
async function updateAudit(){
 try{
  audit??=await(await fetch('./audit.json')).json();
  const a=audit.layouts.find(a=>a.id===current.id),state=a.states[$('#occupied').checked?'occupied':'tucked'];
  if(current.head==='east'){
   const p=state.conditionalPathsByDiameterMm?.['600'];
   $('#audit').textContent='仅主段地面：窗侧不可达。假设窗区地面可用：'+(p?.bothBedLongSidesReachable?'收椅时600mm代理可达两侧床边。':'坐人时600mm代理仍不能到达窗侧床边。')+'柜前取物站点可达；家具与门扇采样未碰撞。';
   return;
  }
  const summary=[500,600].map(d=>{
   const p=state.pathsByDiameterMm[d];
   return current.bedOrientation==='vertical'?`${d}mm代理：右侧${p.bedLongSideTargets.right?'可达':'不可达'}，左侧${p.bedLongSideTargets.left?'可达':'不可达'}`:`${d}mm代理：${p.bothBedLongSidesReachable?'两侧床边可达':'未通过两侧床边通行'}`;
  });
  summary.push(state.rectangularCollisions.length||state.doorSwingCollisions.length?'家具或门扇存在碰撞':'家具无硬重叠；门扇采样未碰撞');
  $('#audit').textContent=summary.join('。')+'。'+(current.conditionalFloor?'窗区地面与腿部净空仍是成立条件。':'A坐人时会阻断下侧床边中段，不能当成完整通行方案。');
 }catch{$('#audit').textContent='检查记录尚未生成，当前仅为尺寸试排。';}
}
async function makeThree(){
 const T=await import('../vendor/three.module.js');
 const {OrbitControls}=await import('../vendor/render-libs.js');
 const host=$('#model'),renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});host.append(renderer.domElement);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#e9e5dc');renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(44,1,.05,40),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2;controls.maxDistance=10;controls.maxPolarAngle=Math.PI*.49;
 scene.add(new T.HemisphereLight('#fff9ef','#989e8f',2));const sun=new T.DirectionalLight('#fff4e4',2.3);sun.position.set(1,6,-3);scene.add(sun);
 let group,wallMats=[];
 const mat=(c,alpha=1)=>new T.MeshStandardMaterial({color:c,roughness:.8,transparent:alpha<1,opacity:alpha});
 function box(r,y,h,c,alpha=1){const m=mat(c,alpha),o=new T.Mesh(new T.BoxGeometry(rectWidth(r),h,rectDepth(r)),m);o.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);group.add(o);return o;}
 function rebuild(){
  if(group){group.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});scene.remove(group);}group=new T.Group();scene.add(group);wallMats=[];
  box(design.main,-.07,.07,'#c9bea7');
  const shape=new T.Shape();design.sourcePolygon.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const zone=new T.Mesh(new T.ShapeGeometry(shape),mat('#90ada8',.24));zone.rotation.x=-Math.PI/2;zone.position.y=-.018;group.add(zone);
  const alpha=+$('#opacity').value;
  for(const r of [[-.06,.71,0,2.9],[2.8,0,2.86,2.9],[0,2.9,1.86,2.96],[2.75,2.9,2.86,2.96]])wallMats.push(box(r,0,view==='top'?.8:2.55,'#ede8dd',alpha).material);
  // Short threshold markers delimit the unknown window zone without inventing a solid bay slab.
  box([-.55,-.58,2.02,-.55],.55,1.7,'#b6d1cc',.22);box([-.58,-.55,-.55,.68],.55,1.7,'#b6d1cc',.22);
  box([2.735,2.01,2.765,2.9],0,2.05,'#bba589',.75);
  const b=current.bed,vertical=current.bedOrientation==='vertical',east=current.head==='east';box(b,.08,.22,'#ae9778');box([b[0]+.015,b[1]+.02,b[2]-.015,b[3]-.02],.30,.20,'#dfd3bf');
  if(vertical){box([b[0],b[1],b[2],b[1]+.03],.18,.80,'#adaf9a');for(const x of [b[0]+.13,b[2]-.63])box([x,b[1]+.12,x+.48,b[1]+.46],.50,.07,'#eee7da');}
  else if(east){box([b[2]-.03,b[1],b[2],b[3]],.18,.80,'#adaf9a');for(const z of [b[1]+.13,b[3]-.63])box([b[2]-.46,z,b[2]-.12,z+.48],.50,.07,'#eee7da');}
  else{box([b[0],b[1],b[0]+.03,b[3]],.18,.80,'#adaf9a');for(const z of [b[1]+.13,b[3]-.63])box([b[0]+.12,z,b[0]+.46,z+.48],.50,.07,'#eee7da');for(const z of [b[1]+.25,b[3]-.25]){box([.045,z,.09,z+.06],1.05,.07,'#d7c7a3');box([.04,z-.09,.065,z-.02],.83,.065,'#f2ede4');}}
  const d=current.desk;box(d,.72,.03,'#bfa887');for(const x of [d[0]+.025,d[2]-.05])for(const z of [d[1]+.025,d[3]-.05])box([x,z,x+.025,z+.025],0,.72,'#a69276');
  const c=chair(),occupied=$('#occupied').checked;const cr=[c[0]+.06,c[1]+.05,c[2]-.06,c[3]-.05];box(cr,.42,.055,'#939e88');
  if(current.id==='solid'||east)box([cr[2]-.025,cr[1],cr[2],cr[3]],.475,.32,'#939e88');else box([cr[0],cr[3]-.025,cr[2],cr[3]],.475,.32,'#939e88');
  if(occupied)box(c,.02,.008,'#b58b68',.25);
  if(current.wardrobe){const w=current.wardrobe;box(w,0,vertical||east?2.4:2.2,'#b5bea8');
   if(east){for(let i=0;i<3;i++){const x=w[0]+i*.60;box([x+.009,w[1]-.002,x+.591,w[1]+.025],.08,2.28,i===1?'#d0cbbd':'#ded8cc');}}
   else if(vertical){const span=rectDepth(w)/3;for(let i=0;i<3;i++){const z=w[1]+i*span;box([w[0]-.002,z+.009,w[0]+.025,z+span-.009],.08,2.28,i===1?'#d0cbbd':'#ded8cc');box([w[0]-.012,z+.12,w[0],z+.28],.95,.22,'#8e917f');}}
   else box([w[2]-.02,w[1]+.015,w[2]+.002,w[3]-.015],.1,2.02,'#d5d2bf');
  }
  pose();
 }
 function pose(){if(view==='top'){camera.position.set(1.2,8,1.26);controls.target.set(1.2,0,1.25);}else{camera.position.set(5.6,5.3,6.7);controls.target.set(1.15,.6,1.25);}controls.update();resize();}
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(w&&h){renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}}
 new ResizeObserver(resize).observe(host);renderer.setAnimationLoop(()=>{if(view!=='plan'){controls.update();renderer.render(scene,camera);}});
 return {rebuild,pose,renderer,scene,camera};
}
async function setView(v){view=v;$('#plan').style.display=v==='plan'?'block':'none';$('#model').style.display=v==='plan'?'none':'block';document.querySelectorAll('[data-view]').forEach(e=>e.classList.toggle('active',e.dataset.view===v));if(v!=='plan'){try{$('#busy').hidden=false;three??=await makeThree();three.rebuild();}catch(e){$('#busy').textContent='空间示意加载失败：'+e.message;throw e;}$('#busy').hidden=true;}window.elderRedesign.view=view;}
document.querySelectorAll('[data-layout]').forEach(e=>e.onclick=()=>{current=design.layouts.find(l=>l.id===e.dataset.layout);draw();});
document.querySelectorAll('[data-view]').forEach(e=>e.onclick=()=>setView(e.dataset.view));
$('#occupied').onchange=draw;$('#dimensions').onchange=draw;$('#opacity').oninput=()=>three?.rebuild();draw();
