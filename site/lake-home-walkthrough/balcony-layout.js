import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {balconyLayout as s} from './balcony-layout-spec.js?v=balcony-right-utility-3';
import {finishWoodPanel} from './cabinet-finishes.js';

// The balcony keeps its original flat ceiling. Stop the living-room decorative cornice at the beam.
function trimCorniceAtBeam(mesh,worldZ){
 if(!mesh)return;mesh.updateWorldMatrix(true,false);
 const source=mesh.geometry,attrs=Object.entries(source.attributes),out=Object.fromEntries(attrs.map(([n])=>[n,[]])),index=source.index;
 const vertex=i=>{const values=Object.fromEntries(attrs.map(([n,a])=>[n,Array.from({length:a.itemSize},(_,j)=>a.array[i*a.itemSize+j])]));return {values,z:new T.Vector3(...values.position).applyMatrix4(mesh.matrixWorld).z};};
 const interpolate=(a,b)=>{const t=(worldZ-a.z)/(b.z-a.z);return {z:worldZ,values:Object.fromEntries(attrs.map(([n])=>[n,a.values[n].map((v,j)=>T.MathUtils.lerp(v,b.values[n][j],t))]))};};
 const emit=v=>{for(const [n] of attrs)out[n].push(...v.values[n]);};
 const geo=new T.BufferGeometry();let count=0;
 for(let i=0;i<(index?.count||source.attributes.position.count);i+=3){
  const tri=[0,1,2].map(j=>vertex(index?index.getX(i+j):i+j)),poly=[];
  for(let j=0;j<3;j++){const a=tri[j],b=tri[(j+1)%3],insideA=a.z>=worldZ,insideB=b.z>=worldZ;if(insideA)poly.push(a);if(insideA!==insideB)poly.push(interpolate(a,b));}
  const start=count;for(let j=1;j+1<poly.length;j++){emit(poly[0]);emit(poly[j]);emit(poly[j+1]);count+=3;}
  if(count>start){const materialIndex=source.groups.find(g=>i>=g.start&&i<g.start+g.count)?.materialIndex||0;geo.addGroup(start,count-start,materialIndex);}
 }
 for(const [n,a] of attrs)geo.setAttribute(n,new T.Float32BufferAttribute(out[n],a.itemSize,a.normalized));
 geo.computeBoundingBox();geo.computeBoundingSphere();mesh.geometry=geo;mesh.userData.balconyCorniceRemoved=true;
}

// Integrates existing appliances without scaling them. Beam dimensions remain explicit assumptions.
export function reviseBalcony(model,laundry){
 const material=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const warm=material('#d6d1c7'),wood=material('#b5a088'),stone=material('#e2ded4',.4),white=material('#e9e9e2',.32),steel=material('#989e98',.3,.8),dark=material('#4a504b');
 const box=(p,n,x,y,z,w,h,d,m=warm)=>{const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,.0015),m);o.name=n;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);if(m===wood)finishWoodPanel(o,{interior:true});return o;};
 const group=(p,n,x=0,y=0,z=0)=>{const g=new T.Group();g.name=n;g.position.set(x,y,z);p.add(g);return g;};
 const upperCabinet=(parent,name,width)=>{
  const g=group(parent,name),u=s.upper,cy=(u.top+u.bottom)/2,cz=u.back+u.depth/2,h=u.top-u.bottom,inner=width-.036;
  for(const x of [-width/2+.009,width/2-.009])box(g,name+'-side',x,cy,cz,.018,h,u.depth);
  for(const y of [u.bottom+.01,2.30,u.top-.01])box(g,name+'-shelf',0,y,cz,inner,.02,u.depth,wood);
  box(g,name+'-back',0,cy,u.back+.008,inner,h-.04,.016);
  for(const x of [-inner/4,inner/4])box(g,name+'-door',x,cy,u.back+u.depth+.006,inner/2-.003,h-.02,.018);
  return g;
 };
 const tube=(p,n,points,r,m)=>{const o=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),32,r,12,false),m);o.name=n;o.castShadow=true;p.add(o);return o;};
 const column=model.getObjectByName('retained-balcony-column');column.userData.removalAllowed=false;
 const beam=box(model,'retained-balcony-beam-envelope',(s.shell.left+s.shell.right)/2,(s.beam.top+s.beam.bottom)/2,s.beam.centreZ,s.shell.right-s.shell.left,s.beam.top-s.beam.bottom,s.beam.depth,material('#eeeae2'));
 beam.userData={...s.beam,structuralRetentionRequired:true,note:'保留横梁的设计包络；梁底2400/宽400mm只是待复尺占位，不代表原梁实测尺寸'};
 for(const name of ['客厅双眼皮外层','客厅双眼皮内层'])trimCorniceAtBeam(model.getObjectByName(name),s.beam.centreZ+s.beam.depth/2);
 // The baseline downlight sat inside the newly represented beam; move the fitting into the room ceiling.
 const light=model.getObjectByName('recessed-led-downlight_3');if(light){light.position.z=2.15;light.userData.balconyBeamAvoidance=true;}
 const leftBar=model.getObjectByName('lake-bar-left'),rightBar=model.getObjectByName('lake-bar-right'),tea=model.getObjectByName('bar-tea-zone');
 tea.position.set(leftBar.position.x+.22,.956,leftBar.position.z+.10);
 tea.userData={...tea.userData,zone:'左侧休闲',electricalNote:'原桌面电源与茶盘分开；供电与防溅仍待选型'};
 const folding=group(model,'balcony-folding-worktop',rightBar.position.x,.953,rightBar.position.z);
 for(let i=0;i<3;i++)box(folding,'folded-laundry-on-worktop',.12,.02+i*.035,.045,.42,.032,.30,material(['#d6d8cf','#aebbb0','#e6e2d8'][i],.94));
 rightBar.userData={...rightBar.userData,usage:'右侧洗护叠衣台'};
 const c=laundry.cabinet;
 for(const o of [...c.children]){
  if(o===laundry.units.washer.unit||o===laundry.units.dryer.unit)continue;
  if(o===laundry.kit||o.name==='washer-leveling-pad'){o.position.x+=.114;continue;}
  o.removeFromParent();
 }
 c.position.fromArray(s.washer.position);c.rotation.y=s.washer.rotation;
 for(const unit of Object.values(laundry.units))unit.unit.position.x=0;
 const cabinetInner=s.washer.width-.036;
 for(const x of [-s.washer.width/2+.009,s.washer.width/2-.009])box(c,'laundry-tower-side',x,.915,0,.018,1.83,.72);
 box(c,'laundry-tower-plinth',0,.032,-.015,cabinetInner,.024,.68,dark);
 box(c,'laundry-tower-upper-support',0,1.815,-.005,cabinetInner,.025,.71,wood);
 upperCabinet(c,'laundry-tower-upper',s.washer.width);
 c.userData={...s.washer,applianceNominal:s.washer.body,waterSupply:null,waste:null,power:null,installationStatus:'660mm洗烘段，600mm机身两边各12mm设计余量；必须按实机振动、散热和安装间隙选型。上柜与盆柜统一顶底线'};
 const wet=group(model,'balcony-wet-hamper');wet.position.fromArray(s.wet.position);wet.rotation.y=s.wet.rotation;
 wet.userData={...s.wet,scheme:'550mm盆柜下放上下水基站；前方浅脏衣篮，后方独立管路。上柜同线',hamperCapacity:'约18L日常小件篮设计包络，不是整桶脏衣容量'};
 for(const x of [-.266,.266])box(wet,'utility-partition',x,.445,-.008,.018,.89,.688);
 box(wet,'utility-back',0,.445,-.343,.514,.89,.018);
 box(wet,'robot-bay-ceiling',0,.626,.005,.514,.018,.56,stone);
 // A true opening in the slab and a sloping, open bowl.
 const shape=new T.Shape();shape.moveTo(-.275,-.36);shape.lineTo(.275,-.36);shape.lineTo(.275,.36);shape.lineTo(-.275,.36);shape.closePath();
 const x=0,w=s.wet.bowl[0]/2,z=.035,d=s.wet.bowl[1]/2,hole=new T.Path();
 hole.moveTo(x-w,z-d);hole.lineTo(x-w,z+d);hole.lineTo(x+w,z+d);hole.lineTo(x+w,z-d);hole.closePath();shape.holes.push(hole);
 const top=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:false}),stone);top.name='balcony-handwash-worktop';top.rotation.x=Math.PI/2;top.position.y=.90;top.castShadow=true;top.receiveShadow=true;wet.add(top);
 const sink=group(wet,'balcony-handwash-sink');sink.userData={opening:s.wet.bowl,plumbingConfirmed:false};
 const outer=[[x-w,.898,z-d],[x+w,.898,z-d],[x+w,.898,z+d],[x-w,.898,z+d]],inner=[[x-w+.035,.688,z-d+.035],[x+w-.035,.688,z-d+.035],[x+w-.035,.688,z+d-.035],[x-w+.035,.688,z+d-.035]];
 for(let i=0;i<4;i++){const a=outer[i],b=outer[(i+1)%4],c=inner[(i+1)%4],d=inner[i],geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));geo.computeVertexNormals();const m=white.clone();m.side=T.DoubleSide;const face=new T.Mesh(geo,m);face.name='handwash-bowl-side';face.castShadow=true;face.receiveShadow=true;sink.add(face);}
 box(sink,'handwash-bowl-floor',x,.684,z,.39,.008,.29,white);
 const drain=new T.Mesh(new T.CylinderGeometry(.024,.024,.003,40),steel);drain.name='handwash-drain';drain.position.set(x,.690,-.095);sink.add(drain);
 tube(sink,'handwash-faucet',[[x,.90,-.225],[x,1.145,-.225],[x,1.195,-.17],[x,1.15,-.055]],.012,steel);
 box(sink,'handwash-faucet-lever',x+.043,1.03,-.225,.073,.011,.019,steel);
 const services=group(wet,'balcony-handwash-services');
 tube(services,'handwash-trap',[[x,.679,-.095],[x,.658,-.15],[x,.651,-.315],[x,.48,-.315],[.10,.44,-.315],[.17,.50,-.315],[.17,.56,-.33]],.014,white);
 for(const cx of [-.18,-.12])box(services,'handwash-capped-valve',cx,.60,-.31,.027,.04,.024,steel);
 services.userData={connectionConfirmed:false,note:'仅同侧湿仓接管意向；现场给排水、地漏和插座未定位，不穿结构柱梁'};
 const doors=[],hamper=group(wet,'balcony-hamper-tilt',0,.26,.354);
 box(hamper,'hamper-closed-front',0,.302,0,.508,.60,.018);
 box(hamper,'hamper-hand-recess',0,.591,-.015,.46,.015,.014,dark);
 const basket=group(hamper,'balcony-removable-hamper',0,.02,-.110),basketMat=material('#a2a698');
 box(basket,'hamper-basket-bottom',0,.006,0,.45,.012,.18,basketMat);
 for(const bx of [-.222,.222])for(let i=0;i<6;i++)box(basket,'hamper-basket-side-slat',bx,.125,-.08+i*.032,.006,.238,.012,basketMat);
 for(const bz of [-.087,.087])for(let i=0;i<16;i++)box(basket,'hamper-basket-face-slat',-.211+i*.0281,.125,bz,.012,.238,.006,basketMat);
 for(const bz of [-.087,.087])box(basket,'hamper-basket-rim',0,.245,bz,.45,.016,.010,basketMat);
 for(const bx of [-.222,.222])box(basket,'hamper-basket-rim',bx,.245,0,.010,.016,.18,basketMat);
 for(let i=0;i<2;i++)box(basket,'hamper-laundry-fold',0,.08+i*.09,0,.28,.07,.14,material(['#d4d1c7','#87928a'][i],.95));
 basket.userData={nominalEnvelope:[.45,.25,.18],estimatedInnerLitres:18,productSelected:false};
 box(wet,'utility-stone-backsplash',0,1.365,-.353,.55,.93,.014,stone);
 upperCabinet(wet,'balcony-wet-upper',s.wet.width);
 const led=new T.MeshStandardMaterial({color:'#f5e9ce',emissive:'#ffe6bf',emissiveIntensity:.45});box(wet,'handwash-task-light',0,1.826,-.05,s.wet.width-.08,.006,.020,led);
 // Cabinet side panels already provide the end closures; no added-width filler is hidden in the plan.
 const state={hamper:0,service:false,maintenanceClear:0};
 const setHamper=fraction=>{state.hamper=T.MathUtils.clamp(fraction,0,1);state.maintenanceClear=0;hamper.rotation.x=state.hamper*s.wet.hamperAngle*Math.PI/180;model.updateMatrixWorld(true);};
 const setMaintenanceClear=fraction=>{state.hamper=0;state.maintenanceClear=T.MathUtils.clamp(fraction,0,1);hamper.rotation.x=state.maintenanceClear*75*Math.PI/180;model.updateMatrixWorld(true);};
 const setService=open=>{state.service=Boolean(open);doors.forEach((door,i)=>door.rotation.y=(open?Math.PI/2:0)*(i===0?-1:1));model.updateMatrixWorld(true);};
 const reset=()=>{setHamper(0);setService(false);laundry.reset();};
 model.updateMatrixWorld(true);return {spec:s,beam,wet,hamper,basket,services,doors,state,setHamper,setService,setMaintenanceClear,reset};
}
