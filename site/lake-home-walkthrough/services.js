// Interior MEP/finish study only. No real devices, wiring or outdoor routes are controlled.
export function buildServices({T,scene,house,ceilingGroup,rooms,P,box,cylinder,mat,white,black,ledMat,hemi,sun,indoor,inspect}){
 const tags=[],switches=[],bathUnits=[],curtains=[],sensors=[];
 const groupAt=(px,py,parent=house,angle=0)=>{const g=new T.Group(),[x,z]=P([px,py]);g.position.set(x,0,z);g.rotation.y=angle;parent.add(g);return g;};
 const mark=(text,px,py,y)=>tags.push({text,point:new T.Vector3(P([px,py])[0],y,P([px,py])[1])});
 // Provisional indoor position: no invented outdoor unit or pipe route.
 const bulk=groupAt(945,716,ceilingGroup);bulk.name='ducted-indoor-bulkhead';const casing=box(bulk,0,2.48,0,5.6,.32,.7,white);
 for(const [px,w] of [[1028,1.8],[800,1.0]]){const g=groupAt(px,681,ceilingGroup);g.name='supply-grille';box(g,0,2.56,-.003,w,.105,.012,black);for(const y of [2.58,2.615,2.65])box(g,0,y,-.012,w,.008,.014,white);mark('侧送风 → 客厅',px,678,2.63);}
 const ret=groupAt(975,725,ceilingGroup);ret.name='return-grille';box(ret,0,2.467,0,1,.014,.3,black);for(let i=0;i<20;i++)box(ret,-.47+i*.049,2.459,0,.013,.009,.28,white);mark('底部回风',975,725,2.42);
 const hatch=groupAt(1065,725,ceilingGroup);hatch.name='service-hatch';box(hatch,0,2.463,0,.45,.013,.45,mat('#93958e'));box(hatch,0,2.457,0,.434,.011,.434,white);mark('检修口 · 暂定450',1065,725,2.4);
 const unit=groupAt(975,716,ceilingGroup);box(unit,0,2.51,0,1.2,.22,.6,mat('#919997'));unit.visible=false;unit.name='concealed-indoor-unit';
 // Inspectable indoor-air schematic only: no refrigerant, drainage or exterior route.
 const airStudy=new T.Group();airStudy.name='indoor-air-study';airStudy.visible=false;ceilingGroup.add(airStudy);
 const supplyMaterial=mat('#659ba6',.5,{transparent:true,opacity:.65}),returnMaterial=mat('#ba986a',.5,{transparent:true,opacity:.65});
 const ghostMaterial=white.clone();ghostMaterial.transparent=true;ghostMaterial.opacity=.08;ghostMaterial.depthWrite=false;
 function airPath(points,material,name){const curve=new T.CatmullRomCurve3(points.map(([px,py,y])=>new T.Vector3(P([px,py])[0],y,P([px,py])[1])),false,'centripetal');const mesh=new T.Mesh(new T.TubeGeometry(curve,32,.055,8,false),material);mesh.name=name;airStudy.add(mesh);}
 airPath([[965,700,2.65],[923,690,2.65],[800,688,2.65],[800,681,2.61]],supplyMaterial,'concept-supply-left');
 airPath([[998,700,2.65],[1028,688,2.65],[1028,681,2.61]],supplyMaterial,'concept-supply-right');
 airPath([[975,725,2.48],[975,725,2.53],[975,718,2.57]],returnMaterial,'concept-bottom-return');
 for(const px of [800,1028]){const [x,z]=P([px,681]);airStudy.add(new T.ArrowHelper(new T.Vector3(0,0,-1),new T.Vector3(x,2.6,z),.58,0x548d9c,.13,.08));}
 {const [x,z]=P([975,725]);airStudy.add(new T.ArrowHelper(new T.Vector3(0,1,0),new T.Vector3(x,2.05,z),.42,0xb78c55,.12,.08));}
 let cutaway=false;
 function setCutaway(value){cutaway=Boolean(value);unit.visible=cutaway;airStudy.visible=cutaway;casing.material=cutaway?ghostMaterial:white;const button=document.querySelector('#toggleCutaway');button.setAttribute('aria-pressed',String(cutaway));button.textContent=cutaway?'恢复完整吊顶':'打开设备吊顶 · 看内部';document.querySelector('#airStudyNote').hidden=!cutaway;}
 // Cut aluminum ceiling modules around the 300 x 600 mm heater module.
 for(const id of ['bath1','bath2']){
  const room=rooms.find(r=>r.id===id),pts=room.poly.map(P),xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs);
  const heaterCell=id==='bath1'?[3,0]:[4,2],g=new T.Group();g.name=id+'-aluminum-ceiling';ceilingGroup.add(g);
  g.userData={material:'哑光暖白铝扣板',module:[.3,.6],ceilingBottom:2.55,installation:'层高、梁底及设备检修待复尺'};
  for(let ix=0,x=x0;x<x1-.001;ix++,x=x0+ix*.3)for(let iz=0,z=z0;z<z1-.001;iz++,z=z0+iz*.6){const w=Math.min(.3,x1-x),d=Math.min(.6,z1-z);if(ix===heaterCell[0]&&iz===heaterCell[1])continue;box(g,x+w/2,2.55,z+d/2,w-.002,.018,d-.002,mat('#e1e3de',.43,{metalness:.25})).name=id+'-ceiling-panel-'+ix+'-'+iz;}
  for(const x of [x0+.01,x1-.01])box(g,x,2.543,(z0+z1)/2,.018,.016,z1-z0,white);
  for(const z of [z0+.01,z1-.01])box(g,(x0+x1)/2,2.543,z,x1-x0,.016,.018,white);
  const hx=x0+(heaterCell[0]+.5)*.3,hz=z0+(heaterCell[1]+.5)*.6,heater=new T.Group();g.add(heater);heater.position.set(hx,0,hz);heater.name=id+'-heater';
  box(heater,0,2.566,0,.27,.14,.54,mat('#878d87')).name=id+'-heater-concealed-body';
  box(heater,0,2.544,0,.296,.022,.596,white);box(heater,0,2.54,-.205,.24,.008,.12,black).name=id+'-heater-warm-outlet';
  for(let i=0;i<7;i++)box(heater,-.105+i*.035,2.535,-.205,.016,.007,.115,white);
  box(heater,0,2.54,-.055,.24,.008,.115,black).name=id+'-heater-exhaust-intake';for(let i=0;i<9;i++)box(heater,-.112+i*.028,2.535,-.055,.008,.007,.106,white);
  const lampMaterial=mat('#f6f4ea',.3,{emissive:'#fff3df',emissiveIntensity:.7});box(heater,0,2.537,.157,.25,.011,.218,lampMaterial).name=id+'-heater-light';bathUnits.push({id,heater,lampMaterial});
  heater.userData={type:'集成风暖 / 排风 / LED 照明',module:[.3,.6],lightKelvin:4000,placement:'现有吊顶网格内干侧方案位，风向与机型待核实',exhaustRoute:null,backdraftDamper:'待配置',circuitProtection:'漏电保护、接地和分区防护等级待电气设计',installationVerified:false};
  mark('铝扣板 + 风暖浴霸',hx*100+42,hz*100+120,2.48);
 }
 // Recessed switch back-boxes, nearly flush faceplates (1 mm front plane).
 // Living switch fits the shallow lining's solid dining-facing end panel.
 const switchPlan=[['玄关总控',590,670,0],['客厅',1232,676,0],['厨房',614,600,-Math.PI/2],['老人房',403,610,-Math.PI/2],['公卫外侧',303,779,Math.PI/2],['主卧',1310,669,Math.PI],['主卫外侧',1335,411,0],['儿童房',1444,650,Math.PI/2]];
 for(const [name,px,py,angle] of switchPlan){const g=groupAt(px,py,house,angle);g.name='recessed-switch-'+name;box(g,0,1.157,-.025,.075,.075,.05,black);box(g,0,1.15,-.003,.086,.086,.008,white);for(const x of [-.021,.021])box(g,x,1.163,.001,.035,.058,.001,mat('#d5d6d0'));box(g,0,1.167,.0016,.025,.002,.001,ledMat);switches.push({name,px,py,height:1.193,faceProjectionMm:1});mark(name+' · 暗装开关',px,py,1.27);}
 // Motor rails and two drawn-apart fabric leaves; synchronized virtual curtain movement.
 for(const [id,px,py,width] of [['living',940,150,6.05],['bed1',194,318,2.5],['master',1848,292,2.8],['bed3',1848,681,1.7]]){
  const side=id==='master'||id==='bed3',g=groupAt(px,py,ceilingGroup,side?Math.PI/2:0);g.name=id+'-curtain';if(id==='living'){for(const sign of [-1,1])box(g,sign*(width/4+.13),2.69,0,width/2-.26,.035,.035,white);}else box(g,0,2.69,0,width,.035,.035,white);box(g,-width/2+.12,2.51,0,.08,.18,.07,white);
  const leaves=[];for(const sign of [-1,1]){const leaf=new T.Group();g.add(leaf);for(let i=0;i<14;i++)box(leaf,(i/13-.5),.06,Math.sin(i*Math.PI)*.015,1/13+.007,2.59,.025,mat('#d7d4cb',.9));leaves.push({leaf,sign});}curtains.push({id,width,leaves});
 }
 for(const [name,px,py] of [['客厅存在',1050,615],['走廊存在',1330,735],['厨房烟感',533,542],['主卧存在',1495,466],['儿童房存在',1510,690],['老人房存在',337,567]]){const [x,z]=P([px,py]);cylinder(ceilingGroup,x,2.705,z,.035,.025,white);sensors.push({name,px,py});mark(name,px,py,2.64);}
 for(const [name,px,py] of [['厨房漏水',521,350],['公卫漏水',265,821],['主卫漏水',1425,386],['饮水柜漏水',824,816]]){const g=groupAt(px,py);cylinder(g,0,.025,0,.023,.012,white);sensors.push({name,px,py});}
 const gateway=groupAt(590,670);box(gateway,0,1.38,.013,.15,.105,.013,black);mark('总控 · 网关弱电位置待定',590,670,1.62);
 const host=document.createElement('div');host.id='serviceTags';host.style.display='none';document.querySelector('#stage').append(host);
 const tagItems=tags.map(t=>{const label=document.createElement('div');label.className='service-tag';label.textContent=t.text;host.append(label);return {...t,label};});
 let timeNight=false,selected='home',curtainAmount=0;
 const states={home:{name:'回家',light:1,curtain:0,ac:'预设26°C（演示）'},movie:{name:'观影',light:.17,curtain:.94,ac:'保持舒适（演示）'},away:{name:'离家',light:0,curtain:.94,ac:'空调关闭（演示）'},night:{name:'起夜',light:.1,curtain:.94,ac:'保持原状态（演示）'}};
 function setScene(key){selected=key;const s=states[key];curtainAmount=s.curtain;for(const c of curtains)for(const {leaf,sign} of c.leaves){const span=.28+(c.width/2-(c.id==='living'?.56:.3))*curtainAmount;leaf.scale.x=span;leaf.position.x=sign*(c.width/2-span/2);}
  const detailed=Boolean(scene.userData.realisticReady);hemi.intensity=timeNight?.08:detailed?.45:2.4;sun.intensity=timeNight?.03:detailed?1:3.1;scene.background=!timeNight&&scene.userData.dayEnvironment?scene.userData.dayEnvironment:new T.Color(timeNight?'#283a4a':'#c6dce3');scene.environment=timeNight?null:scene.userData.dayEnvironment||null;if(scene.fog&&scene.background.isColor)scene.fog.color.copy(scene.background);indoor.forEach((l,i)=>l.intensity=(timeNight?13:4)*s.light*(key==='night'&&i!==1?.1:1));ledMat.emissiveIntensity=key==='away'?0:key==='movie'?.25:.65;
  document.querySelector('#smartStatus').textContent=`${s.name}场景：灯光 ${Math.round(s.light*100)}% · 窗帘 ${s.curtain?'关闭':'打开'} · ${s.ac}。仅网页模拟。`;
  document.querySelectorAll('[data-scene]').forEach(b=>b.classList.toggle('selected',b.dataset.scene===key));
 }
 document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>setScene(b.dataset.scene));
 document.querySelector('#servicePoints').onchange=e=>{host.style.display=e.target.checked?'block':'none';};
 document.querySelector('#inspectServices').onclick=()=>{document.querySelector('#servicePoints').checked=true;host.style.display='block';inspect('services',.6);};
 document.querySelector('#inspectBedroom').onclick=()=>inspect('bed1',.7);
 document.querySelector('#inspectBath').onclick=()=>inspect('bath1',.7);
 document.querySelector('#toggleCutaway').onclick=()=>{setCutaway(!cutaway);if(cutaway){document.querySelector('#servicePoints').checked=true;host.style.display='block';inspect('services',.6);}};
 document.querySelector('#inspectBalcony').onclick=()=>{setCutaway(false);document.querySelector('#servicePoints').checked=false;host.style.display='none';inspect('bar',-.20);};
 function tick(camera){for(const {label,point} of tagItems){const q=point.clone().project(camera),stage=document.querySelector('#stage');label.style.left=((q.x*.5+.5)*stage.clientWidth)+'px';label.style.top=((-q.y*.5+.5)*stage.clientHeight)+'px';label.style.display=q.z>1?'none':'block';}}
 return {setScene,setCutaway,setTime:value=>{timeNight=value;setScene(selected);},tick,switches,bathUnits,sensors,ceilingModule:[.3,.6],get state(){return {scene:selected,timeNight,curtainAmount,cutaway,connectedToRealDevices:false};}};
}
