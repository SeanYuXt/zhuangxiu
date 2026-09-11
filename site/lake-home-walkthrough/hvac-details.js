import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';

// Provisional indoor construction study. No capacity, pipe route or installed product is asserted.
const ductedLayout={unit:{center:[9.33,2.62,5.96],size:[1.2,.22,.6]},bay:{x0:7.48,x1:11.38,z0:5.42,z1:6.36,bottom:2.43}};
export const hvacDesign={heightBasis:2.8,offsetZ:.6,unit:{center:[9.33,2.62,6.56],size:[1.2,.22,.6]},bay:{...ductedLayout.bay,z0:6.02,z1:6.96},band:null,previous:{width:5.6,depth:.7,bottom:2.48},previousLocalBay:{x0:8.28,x1:10.53,z0:5.42,z1:6.44,bottom:2.43},cabinetTop:2.41,composition:'Cabinet-width equipment header, moved 600mm toward cabinet wall; larger low-ceiling area than the former local box, not a claim of higher whole-room headroom.',outdoor:null,refrigerantRoute:null,condensateRoute:null,productSelected:false};
const material=(color,roughness=.6,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const M={paint:material('#eeebe3'),plastic:material('#e9e7e1',.32),edge:material('#b7b7ad'),metal:material('#999f9c',.4,.65),dark:material('#424a46'),filter:material('#626e69',.8),copper:material('#9d7456',.45,.65),seal:material('#565b57',.9)};
M.paint.name='continuous-plaster-finish';
const group=(p,n,at=[0,0,0])=>{const g=new T.Group();g.name=n;g.position.fromArray(at);p.add(g);return g;};
const box=(p,n,x,y,z,w,h,d,m=M.paint)=>{const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.0015,w/5,h/5,d/5)),m);o.name=n;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
const hide=o=>{if(o){o.visible=false;o.name+='-baseline';}};
function bars(p,n,segments,m=M.filter){
 const positions=[],normals=[];for(const [x,y,z,w,h,d] of segments){const g=new T.BoxGeometry(w,h,d).toNonIndexed();g.translate(x,y,z);positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);g.dispose();}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));const o=new T.Mesh(geo,m);o.name=n;o.castShadow=true;o.receiveShadow=true;p.add(o);return o;
}
function horizontalFrame(p,n,x,y,z,w,d,rail=.015,m=M.edge){
 const g=group(p,n);for(const sx of [-1,1])box(g,n+'-side',x+sx*(w-rail)/2,y,z,rail,.009,d,m);for(const sz of [-1,1])box(g,n+'-end',x,y,z+sz*(d-rail)/2,w-2*rail,.009,rail,m);return g;
}
function perforatedFilter(p,n,w,d){
 const g=group(p,n);horizontalFrame(g,n+'-frame',0,0,0,w,d,.013,M.dark);const list=[];
 for(let x=-w/2+.025;x<w/2-.02;x+=.022)list.push([x,0,0,.0015,.0015,d-.03]);
 for(let z=-d/2+.025;z<d/2-.02;z+=.018)list.push([0,0,z,w-.03,.0015,.0015]);bars(g,n+'-washable-mesh',list);return g;
}
function floorWithHoles(parent,name,x0,x1,z0,z1,y,holes,m=M.paint){
 // Separate rectangles retain genuinely empty openings and make dynamic collision checks useful.
 const xs=[...new Set([x0,x1,...holes.flatMap(h=>[h[0],h[1]])])].sort((a,b)=>a-b),zs=[...new Set([z0,z1,...holes.flatMap(h=>[h[2],h[3]])])].sort((a,b)=>a-b),g=group(parent,name);
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){const x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2;if(holes.some(h=>x>h[0]&&x<h[1]&&z>h[2]&&z<h[3]))continue;const o=box(g,name+'-plate',x,y,z,xs[i+1]-xs[i],.012,zs[j+1]-zs[j],m);o.geometry.dispose();o.geometry=new T.BoxGeometry(xs[i+1]-xs[i],.012,zs[j+1]-zs[j]);}return g;
}
function openTransition(p,n,a,b){
 const g=group(p,n),corners=s=>[[s[0],s[2],s[4]],[s[1],s[2],s[4]],[s[1],s[3],s[4]],[s[0],s[3],s[4]]],aa=corners(a),bb=corners(b);
 const mat=M.metal.clone();mat.side=T.DoubleSide;
 for(let i=0;i<4;i++){const j=(i+1)%4,geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([...aa[i],...aa[j],...bb[j],...aa[i],...bb[j],...bb[i]],3));geo.computeVertexNormals();const o=new T.Mesh(geo,mat);o.name=n+'-skin';o.castShadow=o.receiveShadow=true;g.add(o);}return g;
}
function makeUnit(p){
 const g=group(p,'concealed-indoor-unit'),[cx,cy,cz]=ductedLayout.unit.center,[w,h,d]=ductedLayout.unit.size;
 const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2,y0=cy-h/2,y1=cy+h/2;
 box(g,'indoor-unit-top',cx,y1-.003,cz,w,.006,d,M.metal);
 for(const x of [x0+.003,x1-.003])box(g,'indoor-unit-side',x,cy,cz,.006,h-.012,d,M.metal);
 box(g,'indoor-unit-back',cx,cy,z1-.003,w-.012,h-.012,.006,M.metal);
 for(const y of [y0+.025,y1-.020])box(g,'indoor-supply-frame',cx,y,z0+.003,w-.012,.034,.006,M.dark);
 for(const x of [x0+.035,x1-.035])box(g,'indoor-supply-frame',x,cy,z0+.003,.058,.13,.006,M.dark);
 floorWithHoles(g,'indoor-return-pan',x0+.006,x1-.006,z0+.006,z1-.006,y0+.006,[[cx-.47,cx+.47,5.89,6.21]],M.metal);
 const coil=group(g,'indoor-coil-design-envelope');const fins=[];for(let x=x0+.10;x<x1-.10;x+=.023)fins.push([x,2.62,5.765,.003,.13,.095]);bars(coil,'heat-exchanger-fin-pack',fins,M.metal);
 for(const x of [cx-.30,cx+.30]){const fan=new T.Mesh(new T.CylinderGeometry(.073,.073,.25,24,1,true),M.dark);fan.name='indoor-fan-envelope';fan.rotation.z=Math.PI/2;fan.position.set(x,cy,6.11);fan.castShadow=true;g.add(fan);}
 box(g,'condensate-pan-envelope',cx,2.529,5.785,1.02,.018,.19,M.dark);
 for(const [y,r] of [[2.58,.008],[2.67,.014]]){const tube=new T.Mesh(new T.CylinderGeometry(r,r,.075,16),M.copper);tube.name='capped-refrigerant-service-port';tube.rotation.z=Math.PI/2;tube.position.set(x1+.0375,y,5.78);g.add(tube);}
 box(g,'local-controls-enclosure',10.03,2.625,6.03,.15,.16,.20,M.metal);
 g.userData={nominalEnvelope:hvacDesign.unit.size,source:'services.js previous unit envelope retained; internal parts illustrative',productSelected:false,outdoor:null,capacity:null,staticPressure:null,drainageConnected:false};return g;
}
function makeDucted(p){
 const root=group(p,'hvac-system-details'),shell=group(root,'ducted-indoor-bulkhead'),inner=group(root,'hvac-indoor-components');
 root.position.z=hvacDesign.offsetZ;
 const {bay:b}=ductedLayout;
 const holes=[[8.81,9.85,5.86,6.24],[10.005,10.455,5.725,6.175]];
 floorWithHoles(shell,'equipment-bay-bottom',b.x0,b.x1,b.z0,b.z1,b.bottom+.006,holes);
 const verticalBottom=b.bottom+.012; // Butt onto the soffit, no coincident bottom faces.
 box(shell,'equipment-bay-back',(b.x0+b.x1)/2,(verticalBottom+2.78)/2,b.z1-.006,b.x1-b.x0,2.78-verticalBottom,.012);
 for(const x of [b.x0+.006,b.x1-.006])box(shell,'equipment-bay-cheek',x,(verticalBottom+2.78)/2,(b.z0+b.z1)/2,.012,2.78-verticalBottom,b.z1-b.z0-.024);
 for(const [x0,x1] of [[b.x0,8.77],[9.89,b.x1]])box(shell,'equipment-bay-front-side',(x0+x1)/2,(verticalBottom+2.78)/2,b.z0+.006,x1-x0,2.78-verticalBottom,.012);
 for(const [y0,y1] of [[verticalBottom,2.570],[2.710,2.78]])box(shell,'equipment-bay-front-edge',9.33,(y0+y1)/2,b.z0+.006,1.12,y1-y0,.012);
 // No decorative cross-room wings: the service volume follows the cabinet
 // width. The existing perimeter double-step ceiling remains unchanged.
 const supply=group(root,'supply-grille');for(const y of [2.566,2.714])box(supply,'supply-border',9.33,y,5.413,1.16,.010,.022,M.edge);
 for(const x of [8.765,9.895])box(supply,'supply-end',x,2.64,5.413,.010,.138,.022,M.edge);
 for(const y of [2.615,2.665])box(supply,'supply-directional-blade',9.33,y,5.416,1.098,.004,.030,M.paint);
 supply.userData={clearOpening:[1.12,.14],function:'设备位前侧直接送风，朝客厅；无横向细长支管',airflowVerified:false,productSelected:false};
 const unit=makeUnit(inner);
 // Preserve branch terminal openings; the connection boots are open, not opaque black rectangles.
 openTransition(inner,'unit-supply-transition',[8.85,9.81,2.568,2.709,5.661],[8.79,9.87,2.578,2.702,5.428]);
 const returnBoot=group(inner,'sealed-return-plenum');
 for(const x of [8.853,9.807])box(returnBoot,'return-plenum-side',x,2.490,6.05,.006,.040,.32,M.seal);
 for(const z of [5.887,6.213])box(returnBoot,'return-plenum-end',9.33,2.490,z,.96,.040,.006,M.seal);
 const returnFrame=horizontalFrame(root,'return-opening-frame',9.33,2.432,6.05,1.06,.40,.014),grille=group(root,'return-grille',[9.33,2.427,6.237]);
 horizontalFrame(grille,'return-door-frame',0,0,-.187,1.016,.354,.018,M.paint);
 const slats=[];for(let x=-.478;x<.48;x+=.030)slats.push([x,-.001,-.187,.009,.011,.309]);bars(grille,'return-open-slats',slats,M.paint);
 const filter=perforatedFilter(root,'ducted-washable-filter',.93,.30);filter.position.set(9.33,2.475,6.05);
 const hatchFrame=horizontalFrame(root,'service-hatch-frame',10.23,2.432,5.95,.47,.47,.014),hatch=group(root,'service-hatch',[10.23,2.430,6.175]);
 box(hatch,'service-hatch-panel',0,-.003,-.225,.426,.009,.426,M.paint);
 for(const x of [-.17,.17])box(hatch,'service-hatch-captive-fastener',x,-.009,-.37,.014,.002,.014,M.edge);
 const airflow=group(root,'hvac-airflow-directions');airflow.add(new T.ArrowHelper(new T.Vector3(0,0,-1),new T.Vector3(9.33,2.64,5.37),.65,0x7c9aa1,.12,.08));
 airflow.add(new T.ArrowHelper(new T.Vector3(0,1,0),new T.Vector3(9.33,1.96,6.05),.39,0xb19c78,.09,.06));airflow.visible=false;
 const state={cutaway:false,return:false,filter:false,hatch:false,airflow:false};
 const setReturn=t=>{if(t<1&&state.filter)setFilter(0);grille.rotation.x=-Math.PI/2*T.MathUtils.clamp(t,0,1);state.return=t>0;};
 const setFilter=t=>{t=T.MathUtils.clamp(t,0,1);if(t>0)setReturn(1);filter.position.y=2.475-.26*Math.min(1,t*2);filter.rotation.x=Math.max(0,t-.5)*Math.PI/2;state.filter=t>0;};
 const setHatch=t=>{hatch.rotation.x=-Math.PI/2*T.MathUtils.clamp(t,0,1);state.hatch=t>0;};
 const setCutaway=v=>{state.cutaway=!!v;shell.visible=!v;};
 const setAir=v=>{state.airflow=!!v;airflow.visible=!!v;};
 const reset=()=>{setFilter(0);setReturn(0);setHatch(0);setCutaway(false);setAir(false);};
 root.userData={design:hvacDesign,service:'停机并手扶面板；滤网先开格栅再下降/倾斜。450mm孔仅局部检修，不足以整机更换；整机更换须拆设备区底板。',constructionVerified:false};
 return {root,shell,inner,unit,grille,filter,hatch,returnFrame,hatchFrame,state,setReturn,setFilter,setHatch,setCutaway,setAir,reset};
}

function makeSplit(model,id){
 const old=model.getObjectByName(id+'-air-conditioner');if(!old)throw Error('Missing original split AC '+id);
 const pos=old.position.clone(),rotation=old.rotation.y;hide(old);
 if(id==='bed1'){pos.x=3.50;pos.z=3.12;}if(id==='bed3')pos.z=4.56;
 const root=group(model,id+'-air-conditioner',pos.toArray());root.rotation.y=rotation;
 // Cabinet body 940 x 300 x 200 mm; fascia/flap project a further 17 mm.
 for(const x of [-.458,.458])box(root,'split-side-cap',x,2.33,0,.024,.30,.20,M.plastic);
 box(root,'split-back-pan',0,2.33,-.094,.892,.28,.012,M.edge);
 box(root,'split-top-shell',0,2.471,0,.892,.018,.188,M.plastic);
 box(root,'split-bottom-shell',0,2.189,0,.892,.018,.188,M.plastic);
 box(root,'split-outlet-cavity',0,2.218,.063,.845,.041,.035,M.dark);
 const cover=group(root,id+'-ac-lift-cover',[0,2.46,.108]);box(cover,'split-lift-front',0,-.109,0,.89,.218,.016,M.plastic);
 const filters=[];for(const x of [-.223,.223]){const f=perforatedFilter(root,id+'-ac-filter-'+filters.length,.415,.205);f.rotation.x=Math.PI/2;f.position.set(x,2.340,.085);filters.push(f);}
 const fins=[];for(let x=-.405;x<=.405;x+=.020)fins.push([x,2.337,.032,.002,.206,.045]);bars(root,'split-coil-fin-envelope',fins,M.metal);
 const flap=group(root,id+'-ac-outlet-flap',[0,2.234,.113]);box(flap,'split-outlet-cover',0,-.024,0,.826,.048,.008,M.plastic);
 const displayMat=new T.MeshStandardMaterial({color:'#969f95',emissive:'#a5c4b0',emissiveIntensity:0});
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle='#dcded7';ctx.fillRect(0,0,128,64);ctx.font='40px sans-serif';ctx.fillStyle='#5e6d62';ctx.textAlign='center';ctx.fillText('26°',64,48);displayMat.map=new T.CanvasTexture(canvas);displayMat.map.colorSpace=T.SRGBColorSpace;
 const display=new T.Mesh(new T.PlaneGeometry(.062,.031),displayMat);display.name=id+'-ac-display';display.position.set(.315,-.055,.0085);cover.add(display);
 const air=group(root,id+'-ac-airflow');const direction=new T.Vector3(id==='bed1'?-.64:0,.08,1).normalize();air.add(new T.ArrowHelper(direction,new T.Vector3(0,2.26,.23),.85,0x7c9aa1,.11,.07));air.visible=false;
 const state={cover:false,filters:false,running:false,airflow:false};
 const setCover=t=>{if(t<1&&state.filters)setFilters(0);if(t>0)setRun(false);cover.rotation.x=-Math.PI/2*T.MathUtils.clamp(t,0,1);state.cover=t>0;};
 const setFilters=t=>{t=T.MathUtils.clamp(t,0,1);if(t>0)setCover(1);filters.forEach(f=>{f.position.z=.085+.25*Math.min(1,t/.6);f.position.y=2.340-.09*Math.max(0,(t-.6)/.4);});state.filters=t>0;};
 const setRun=v=>{if(v){setFilters(0);setCover(0);}state.running=!!v;flap.rotation.x=v?-1.12:0;displayMat.emissiveIntensity=v?.35:0;};
 const setAir=v=>{state.airflow=!!v;air.visible=!!v;};
 const reset=()=>{setFilters(0);setCover(0);setRun(false);setAir(false);};
 root.userData={type:'wall-mounted-air-conditioner',nominalSize:[.94,.30,.20],installationVerified:false,originalPosition:old.position.toArray(),newPosition:pos.toArray(),clearanceBasis:id==='bed1'?'墙内侧x3.61；后背x3.60，留10mm方案余量。沿同墙向窗侧移动350mm。':id==='bed3'?'墙内侧z4.45；后背z4.46，留10mm方案余量。':'保持主卫隔墙卧室侧；背面x14.31。',capacity:null,outdoorPosition:null,refrigerantRoute:null,condensateRoute:null,airflow:'箭头只示意主方向；实际扩散、射程和床位直吹需机型/现场检验',maintenance:'停机开罩、取出双滤网；固定/防坠/五金为选型条件'};
 return {root,cover,filters,flap,air,state,setCover,setFilters,setRun,setAir,reset};
}

export function reviseHVAC(model){
 if(model.getObjectByName('hvac-system-details'))throw Error('HVAC revision applied twice');
 const roof=model.getObjectByName('客厅双眼皮外层')?.parent;if(!roof)throw Error('Missing ceiling assembly');
 for(const name of ['ducted-indoor-bulkhead','supply-grille','supply-grille_1','return-grille','service-hatch'])hide(model.getObjectByName(name));
 const ducted=makeDucted(roof),splits=Object.fromEntries(['bed1','master','bed3'].map(id=>[id,makeSplit(model,id)]));
 // Move the design-only header as one assembly, keeping all service openings matched.
 model.updateMatrixWorld(true);
 const sideboard=model.getObjectByName('flush-sideboard');
 if(sideboard){
  const sideBounds=new T.Box3().setFromObject(sideboard),headerBounds=new T.Box3().setFromObject(ducted.shell);
  ducted.root.position.x+=sideBounds.max.x-headerBounds.max.x;
  ducted.root.userData.wallAlignment='Aligned with sideboard at original TV wall face; design position only';
  model.updateMatrixWorld(true);
  // The cabinet now meets the east ceiling trim. Notch only the plaster header
  // against the existing 100/90mm trim steps; retain the original ceiling geometry.
  const outer=new T.Box3().setFromObject(model.getObjectByName('客厅双眼皮外层'));
  const inner=new T.Box3().setFromObject(model.getObjectByName('客厅双眼皮内层'));
  const steps=[[inner.max.x-.09,outer.max.x-.10,inner.min.y],[outer.max.x-.10,Infinity,outer.min.y]];
  for(const part of [...ducted.shell.children]){
   if(!part.isMesh)continue;
   const bounds=new T.Box3().setFromObject(part);
   if(!steps.some(([x0,x1,y])=>bounds.max.x>x0&&bounds.min.x<x1&&bounds.max.y>y))continue;
   const cuts=[bounds.min.x,...steps.map(s=>s[0]).filter(x=>x>bounds.min.x&&x<bounds.max.x),bounds.max.x];
   for(let i=1;i<cuts.length;i++){
    const x0=cuts[i-1],x1=cuts[i],step=steps.find(s=>(x0+x1)/2>=s[0]&&(x0+x1)/2<s[1]);
    const y1=Math.min(bounds.max.y,step?.[2]??Infinity);if(y1<=bounds.min.y)continue;
    const center=ducted.shell.worldToLocal(new T.Vector3((x0+x1)/2,(bounds.min.y+y1)/2,(bounds.min.z+bounds.max.z)/2));
    box(ducted.shell,part.name+'-ceiling-joint-'+i,...center.toArray(),x1-x0,y1-bounds.min.y,bounds.max.z-bounds.min.z,part.material);
   }
   part.removeFromParent();part.geometry.dispose();
  }
 }
 const reset=()=>{ducted.reset();Object.values(splits).forEach(s=>s.reset());model.updateMatrixWorld(true);};reset();
 return {ducted,splits,design:hvacDesign,reset};
}
