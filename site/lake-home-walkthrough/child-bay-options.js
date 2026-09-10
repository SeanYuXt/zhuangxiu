import * as T from './vendor/three.module.js';
import {GLTFLoader,OrbitControls,RoundedBoxGeometry,RGBELoader} from './vendor/render-libs.js';
import {room,options,chairRect} from './child-bay-options-data.js?v=footdesk-0908';
const $=s=>document.querySelector(s),host=$('#viewport'),canvas=$('#scene'),svg=$('#plan');
const angleLabel=document.createElement('label');angleLabel.innerHTML='开门角度 <output id="angle-value">0°</output><input id="door-angle" type="range" min="0" max="90" value="0" aria-label="房门开启角度">';$('.controls').append(angleLabel);let doorAngle=0;
const wardrobeLabel=document.createElement('label');wardrobeLabel.innerHTML='<input id="ward-open" type="checkbox"> 打开靠门端衣柜移门';$('.controls').append(wardrobeLabel);let slidingPanel=null,slidingPanels=[],slideTravel=0,bedDrawerGroups=[],deskDrawerGroup=null;
for(const [id,label] of [['bed-drawers','拉出床侧抽屉45cm'],['desk-drawer','拉出书桌抽屉40cm']]){const el=document.createElement('label');el.innerHTML=`<input id="${id}" type="checkbox"> ${label}`;$('.controls').append(el);}
const joineryButton=document.createElement('button');joineryButton.dataset.view='joinery';joineryButton.textContent='柜桌正面';$('nav').append(joineryButton);
const connectionButton=document.createElement('button');connectionButton.dataset.view='connection';connectionButton.textContent='转角台面';$('nav').append(connectionButton);
const bayButton=document.createElement('button');bayButton.dataset.view='baydetail';bayButton.textContent='桌窗节点（隐藏床柜）';$('nav').append(bayButton);
const roomStyleButton=document.createElement('button');roomStyleButton.dataset.view='roomstyle';roomStyleButton.textContent='整体黑白';$('nav').prepend(roomStyleButton);
let wallBedPivot=null,wallBedLegs=null,wallBedPillows=null,wallBedOpen=false;
const wallBedLabel=document.createElement('label');wallBedLabel.innerHTML='<input id="wallbed-open" type="checkbox"> 展开翻床（模拟椅子移出房间）';$('.controls').prepend(wallBedLabel);
const stowOption=document.createElement('option');stowOption.value='-1';stowOption.textContent='收椅入桌下';$('#chair').append(stowOption);
document.title='儿童房 · 柜桌与床位试排';$('h1').textContent='儿童房 · 柜桌与床位试排';
const spec=await(await fetch('./plan-spec.json')).json(),audit=await(await fetch('./child-bay-options-audit.json')).json();
const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#e9e5dc');const camera=new T.PerspectiveCamera(48,1,.02,80),controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minDistance=.5;controls.maxDistance=20;controls.maxPolarAngle=Math.PI*.495;
scene.add(new T.HemisphereLight('#fff6e9','#a4a396',1));const sun=new T.DirectionalLight('#fff8ea',1.6);sun.position.set(20,6,5);sun.target.position.set(16,0,5.8);scene.add(sun,sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:20});sun.shadow.bias=-.0001;
const loader=new T.TextureLoader(),material=(c)=>new T.MeshStandardMaterial({color:c,roughness:.8});
const wood=material('#c6b396'),ivory=material('#dfdccf'),cloth=material('#d8d0bd'),green=material('#979e87'),dark=material('#666958');
wood.map=loader.load('./assets/white_oak_veneer-color.jpg');wood.map.colorSpace=T.SRGBColorSpace;wood.normalMap=loader.load('./assets/white_oak_veneer-normal.jpg');wood.normalScale=new T.Vector2(.1,.1);
const softBacking=material('#e5e0d8'),ceramic=material('#e8ded1'),accent=material('#a4937c');
const shelfGlow=new T.MeshStandardMaterial({color:'#fff0d4',emissive:'#ffe0a6',emissiveIntensity:1.4,roughness:.55});
cloth.normalMap=loader.load('./assets/fabric-normal.jpg');cloth.normalScale=new T.Vector2(.12,.12);
function box(g,name,r,y,h,m=ivory,round=.004){const v=new T.Mesh(new RoundedBoxGeometry(r[2]-r[0],h,r[3]-r[1],3,round),m);v.name=name;v.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);v.castShadow=v.receiveShadow=true;g.add(v);return v;}
let d=options.find(o=>o.id===new URLSearchParams(location.search).get('scheme')),view=['joinery','connection','baydetail','roomstyle'].includes(new URLSearchParams(location.search).get('view'))?new URLSearchParams(location.search).get('view'):(d?.id==='footdesk'?'plan':d?.theme==='monochrome'?'roomstyle':'plan'),furniture=new T.Group(),chairGroup,doorPivot,drawerGroup,model,upperShell=[],doorOpen=false,chairState=0;if(!d)throw new Error('该方案已移除');scene.add(furniture);
const faceGroup=(r,front,parent=furniture)=>{const g=new T.Group();parent.add(g);if(front==='west'){g.position.set(r[2],0,r[1]);g.rotation.y=-Math.PI/2;}else if(front==='east'){g.position.set(r[0],0,r[3]);g.rotation.y=Math.PI/2;}else if(front==='north'){g.position.set(r[2],0,r[3]);g.rotation.y=Math.PI;}else g.position.set(r[0],0,r[1]);return{g,w:['west','east'].includes(front)?r[3]-r[1]:r[2]-r[0],depth:['west','east'].includes(front)?r[2]-r[0]:r[3]-r[1]};};
function wardrobe(o){const{g,w,depth}=faceGroup(o.r,o.front),height=o.height??2.4;g.name='wardrobe';
 box(g,'back',[0,0,w,.018],.08,height-.08,wood);for(const x of [0,w-.018])box(g,'side',[x,0,x+.018,depth],.08,height-.08);
 for(const y of [.08,1.95,height-.018])box(g,'shelf',[.018,.018,w-.018,depth-.05],y,.018,wood);
 box(g,'toe',[.04,.04,w-.04,depth-.06],0,.08,dark);
 const panel=box(g,'sliding-door-a',[.012,depth-.022,w/2+.015,depth],.10,height-.125);
 if(['lwallstudy','southbedwall','baywardrobe','fixedwindow','footdesk'].includes(d.id)){slidingPanel=panel;slideTravel=w/2-.03;slidingPanels.push({panel,travel:slideTravel,closedX:panel.position.x});box(g,'hanging-rail',[.03,depth*.46,w-.03,depth*.49],1.78,.022,dark);for(let i=0;i<8;i++)box(g,'hanging-clothes',[.10+i*.10,.08,.12+i*.10,depth-.10],1.04,.67,i%2?cloth:green,.007);}
 box(g,'sliding-door-b',[w/2-.015,depth-.053,w-.012,depth-.031],.10,height-.125);
 for(const [i,x] of [w/2-.014,w-.038].entries()){const handle=box(g,'recessed-edge',[x,depth-.01,x+.007,depth-.004],.88,.62,dark,.001);if(i===0&&['lwallstudy','southbedwall','baywardrobe','fixedwindow','footdesk'].includes(d.id)){handle.position.sub(panel.position);panel.add(handle);}}
}
function bookshelf(o){const{g,w,depth}=faceGroup(o.r,o.front);g.name='integrated-bookshelf';
 box(g,'back',[0,0,w,.018],.08,2.32,wood);
 for(const x of [0,w-.018])box(g,'side',[x,0,x+.018,depth],.08,2.32);
 box(g,'toe',[.04,.04,w-.04,depth-.04],0,.08,dark);
 for(const y of [.08,.72,1.06,1.40,1.74,2.08,2.382])box(g,'shelf',[.018,.018,w-.018,depth],y,.018,wood);
 for(const x of [0,w/2])box(g,'lower-door',[x+.006,depth-.02,x+w/2-.006,depth],.10,.60);
 for(let row=0;row<4;row++)for(let i=0;i<9;i++){const x=.09+i*.052;box(g,'stored-book',[x,.035,x+.038,.24],.738+row*.34,.22+(i%3)*.015,i%3===0?green:cloth,.001);}
 box(g,'upper-closed-door',[.006,depth-.02,w-.006,depth],2.102,.274);
}
function bed(){if(!d.bed)return;const b=d.bed.r,g=new T.Group();g.name='bed';furniture.add(g);if(d.bed.head==='west'){g.position.set(b[0],0,b[3]);g.rotation.y=Math.PI/2;}else if(d.bed.head==='east'){g.position.set(b[2],0,b[1]);g.rotation.y=-Math.PI/2;}else if(d.bed.head==='south'){g.position.set(b[2],0,b[3]);g.rotation.y=Math.PI;}else g.position.set(b[0],0,b[1]);
 const w=d.bed.slim?1.50:1.54,len=d.bed.slim?2.04:2.06,side=(w-1.5)/2,head=d.bed.slim?.04:.03;
 if(d.bed.storage){
  box(g,'support-deck',[0,0,w,len],.30,.04,wood);
  box(g,'east-rail',[0,0,.025,len],.04,.26,wood);
  for(const z of [0,len-.025])box(g,'end-rail',[0,z,w,z+.025],.04,.26,wood);
  box(g,'central-support',[.71,0,.735,len],.04,.26,wood);
 }else{box(g,'plinth',[.08,.08,w-.08,len-.08],.03,.16,dark,.015);box(g,'frame',[0,0,w,len],.19,.15,wood,.012);}
 box(g,'mattress',[side,head,w-side,head+2],.34,.22,cloth,.04);box(g,'headboard',[0,0,w,d.bed.slim?.04:.035],.34,.68,cloth,.012);
 box(g,'duvet',[.035,.59,w-.035,len-.035],.56,.065,cloth,.03);box(g,'throw',[.05,len-.40,w-.05,len-.06],.625,.028,green,.02);
 for(const x of d.bed.singlePillow?[(w-.61)/2]:[.09,.80])box(g,'pillow',[x,.14,x+.61,.54],.56,.12,cloth,.045);
 if(d.theme==='monochrome'){
  box(g,'mono-bed-base-reveal',[.006,.006,w-.006,len-.006],.182,.008,dark,.002);
  box(g,'mono-headboard-inlay',[w/2-.002,.035,w/2+.002,.038],.40,.56,dark,.001);
 }
}
function styledBookcase(g,w,corner){
 // Adapt normal_video.mp4 to our 120 + 164 cm run; do not copy its 310 cm wall.
 const j=d.desk.joinery,base=j.openBase,top=j.openTop,cap=d.desk.upperHeight,depth=j.depth;
 const bookRow=(x0,y,count)=>{for(let i=0;i<count;i++){const x=x0+i*.043;box(g,'reference-book',[x,.045,x+.030,.22],y,.21+(i%3)*.012,i%3===0?accent:cloth,.001);}};
 const vase=(x,y)=>{const points=[[.025,0],[.052,.018],[.06,.09],[.043,.16],[.024,.22]].map(([r,h])=>new T.Vector2(r,h));const v=new T.Mesh(new T.LatheGeometry(points,32),ceramic);v.name='display-ceramic-vase';v.position.set(x,y,.15);v.castShadow=v.receiveShadow=true;g.add(v);};
 const strip=(y)=>{
  box(g,'recessed-strip-channel',[.025,depth-.053,w-.025,depth-.033],y,.014,ivory,.001);
  box(g,'warm-strip-diffuser',[.03,depth-.05,w-.03,depth-.036],y-.002,.006,shelfGlow,.001);
  const light=new T.PointLight('#ffe8c7',.8,1.15,2);light.name='shelf-local-light';light.position.set(w/2,y-.035,depth-.09);g.add(light);
 };
 box(g,'light-continuous-backsplash',[0,0,w,.018],.75,top-.75,ivory);
 box(g,'upper-neutral-back',[0,0,w,.018],top,cap-top,ivory);
 for(const y of [base,top])box(g,'horizontal-open-shelf',[0,.018,w,depth],y,.018,ivory);
 for(const x of [0,w-.018])box(g,'band-end-panel',[x,.018,x+.018,depth],base,top-base+.018,ivory);
 box(g,'upper-cap',[0,0,w,depth],cap-.018,.018,ivory);
 if(corner){
  const split=w-j.displayWidth,doorWidth=split/2;
  for(const x of [0,doorWidth,split])box(g,'upper-divider',[x,0,x+.018,depth],top,cap-top,ivory);
  for(let i=0;i<2;i++)box(g,'quiet-top-door',[i*doorWidth+.004,depth-.02,(i+1)*doorWidth-.004,depth],top+.025,cap-top-.043,ivory);
  box(g,'light-display-back',[split+.018,.019,w-.018,.034],top+.018,cap-top-.036,softBacking);
  box(g,'light-display-end',[w-.018,.034,w,depth],top+.018,cap-top-.036,ivory);
  const step=(cap-top)/3;
  for(let i=1;i<3;i++)box(g,'light-display-shelf',[split+.018,.034,w-.018,depth],top+i*step,.018,ivory);
  vase(split+j.displayWidth/2,top+.018);
  box(g,'display-flat-book',[split+.04,.045,w-.04,.21],top+step+.018,.025,cloth);
  box(g,'small-sculpture',[split+.12,.075,split+.22,.175],top+2*step+.018,.14,ceramic,.035);
  bookRow(.07,base+.018,6);
  // A small shallow corner shelf, not a 70 cm printer bay or an enclosed desk niche.
  box(g,'corner-floating-shelf',[.018,.018,j.cornerWidth,.34],1.06,.018,ivory);
  box(g,'corner-return-shelf',[.018,depth,j.cornerWidth,.46],base,.018,ivory);
  for(let i=0;i<3;i++)box(g,'corner-stored-book',[.04+i*.047,.045,.072+i*.047,.23],1.078,.21+(i%2)*.01,cloth,.001);
  box(g,'corner-small-box',[.035,.08,.20,.25],.752,.13,softBacking,.008);
 }else{
  for(let i=0;i<=4;i++){const x=Math.min(i*w/4,w-.018);box(g,'upper-divider',[x,0,x+.018,depth],top,cap-top,ivory);}
  for(let i=0;i<4;i++)box(g,'quiet-top-door',[i*w/4+.004,depth-.02,(i+1)*w/4-.004,depth],top+.025,cap-top-.043,ivory);
  bookRow(.98,base+.018,8);vase(.30,base+.018);
  box(g,'display-art-frame',[.51,.035,.73,.06],base+.018,.24,wood);
  box(g,'display-art-paper',[.523,.061,.717,.065],base+.031,.214,ivory,.001);
 }
 strip(top-.002);strip(base-.002);
}
function applyJoineryPalette(){
 if(!Object.hasOwn(wood.userData,'originalMap')){wood.userData.originalMap=wood.map;wood.userData.originalNormal=wood.normalMap;}
 const mono=d.theme==='monochrome';wood.map=mono?null:wood.userData.originalMap;wood.normalMap=mono?null:wood.userData.originalNormal;wood.needsUpdate=true;
 if(mono){
  wood.color.set('#f2f2ef');ivory.color.set('#edeeec');cloth.color.set('#dedfdf');green.color.set('#36383b');dark.color.set('#232527');softBacking.color.set('#c6c9ca');ceramic.color.set('#e8e9e7');accent.color.set('#74797c');
  wood.roughness=.52;ivory.roughness=.68;cloth.roughness=.94;return;
 }
 softBacking.color.set('#e5e0d8');ceramic.color.set('#e8ded1');accent.color.set('#a4937c');
 const styled=d.desk.joineryStyle==='video-fit';
 wood.color.set(styled?'#fff5e5':'#c6b396');ivory.color.set(styled?'#f1efe8':'#dfdccf');cloth.color.set(styled?'#e5e2dc':'#d8d0bd');green.color.set(styled?'#b8aa95':'#979e87');dark.color.set(styled?'#64635e':'#666958');
 ivory.roughness=styled?.58:.8;wood.roughness=styled?.68:.8;cloth.roughness=styled?.88:.8;
}
function wallBookcase(g,w,corner=false){
 if(d.desk.joineryStyle==='video-fit'){styledBookcase(g,w,corner);return;}
 const cuts=corner?[0,.32,.76,w]:[0,w/3,2*w/3,w];
 box(g,'full-wall-bookcase-back',[0,0,w,.018],1.35,1.35,wood);
 for(const x of cuts.slice(0,-1).concat(w-.018))box(g,'full-wall-divider',[x,0,x+.018,.28],1.35,1.35);
 for(const y of [1.35,1.70,2.05,2.682])box(g,'continuous-book-shelf',[.018,.018,w-.018,.28],y,.018,wood);
 for(let i=0;i<cuts.length-1;i++){
  const x0=cuts[i],x1=cuts[i+1];
  box(g,'continuous-top-door',[x0+.003,.26,x1-.003,.28],2.075,.607);
  if(corner&&i===0)continue;
  for(let row=0;row<2;row++)for(let j=0;j<Math.floor((x1-x0-.09)/.05);j++){const x=x0+.04+j*.05;box(g,'wall-book',[x,.035,x+.035,.245],1.368+row*.35,.28+(j%2)*.02,j%3?cloth:green,.001);}
 }
 if(corner){
  // Perpendicular return is above the tabletop, not a floor-standing block.
  box(g,'corner-return-side',[0,.28,.018,.52],1.35,.718);
  for(const y of [1.35,1.70,2.05])box(g,'corner-return-shelf',[.018,.28,.12,.52],y,.018,wood);
  box(g,'corner-ceramic',[.085,.07,.23,.215],1.368,.16,green,.035);
  box(g,'corner-photo-frame',[.075,.035,.255,.06],1.718,.24,wood);
  box(g,'corner-photo',[.09,.061,.24,.065],1.733,.21,cloth);
 }
}
function foldingBed(){
 if(!d.wallBed)return;
 const b=d.wallBed,r=b.r,g=new T.Group();g.name='wallbed-cabinet';furniture.add(g);
 box(g,'wallbed-back',[r[0],r[3]-.02,r[2],r[3]],.08,b.height-.08,wood);
 for(const x of [r[0],r[2]-.025])box(g,'wallbed-side',[x,r[1],x+.025,r[3]],.08,b.height-.08,ivory);
 box(g,'wallbed-top',r,b.height-.025,.025,ivory);box(g,'wallbed-plinth',r,0,.08,ivory);
 wallBedPivot=new T.Group();wallBedPivot.name='wallbed-moving-panel';wallBedPivot.position.fromArray(b.pivot);furniture.add(wallBedPivot);
 box(wallBedPivot,'wallbed-front',[-.82,-.13,.82,-.105],-.15,2.25,ivory,.006);
 box(wallBedPivot,'wallbed-front-reveal',[-.002,-.132,.002,-.13],-.11,2.16,softBacking,.001);
 box(wallBedPivot,'wallbed-pull',[-.23,-.148,.23,-.134],1.0,.016,dark,.004);
 box(wallBedPivot,'wallbed-deck',[-.79,0,.79,.04],0,2.08,wood,.006);
 box(wallBedPivot,'wallbed-mattress',[-.75,.04,.75,.22],.04,2,cloth,.025);
 box(wallBedPivot,'wallbed-cover',[-.73,.221,.73,.236],.65,1.35,cloth,.009);
 wallBedPillows=new T.Group();wallBedPillows.name='removable-pillows';wallBedPivot.add(wallBedPillows);
 for(const x of [-.66,.05])box(wallBedPillows,'wallbed-pillow',[x,.22,x+.60,.32],.15,.39,cloth,.03);
 wallBedLegs=new T.Group();wallBedLegs.name='deployed-bed-legs';furniture.add(wallBedLegs);
 for(const x of [b.pivot[0]-.65,b.pivot[0]+.65])box(wallBedLegs,'wallbed-support-leg',[x-.015,b.pivot[2]-1.97,x+.015,b.pivot[2]-1.94],.02,.28,dark,.004);
 wallBedPivot.rotation.x=wallBedOpen?-Math.PI/2:0;wallBedPillows.visible=wallBedLegs.visible=wallBedOpen;
}
function bayDesktop(g,w,depth){
 const top=g.getObjectByName('tabletop');g.remove(top);top.geometry.dispose();
 const q=d.bayJoin,a=q.r[1]-d.desk.r[1],b=q.r[3]-d.desk.r[1],extension=q.r[2]-d.desk.r[2],radius=.06;
 // Single connected tabletop mesh; the only outward projection follows the actual bay opening.
 const s=new T.Shape();s.moveTo(0,0);s.lineTo(a,0);s.lineTo(a,extension);s.lineTo(b,extension);s.lineTo(b,0);s.lineTo(w,0);
 s.lineTo(w,-depth+radius);s.quadraticCurveTo(w,-depth,w-radius,-depth);s.lineTo(radius,-depth);s.quadraticCurveTo(0,-depth,0,-depth+radius);s.closePath();
 const slab=new T.Mesh(new T.ExtrudeGeometry(s,{depth:.025,bevelEnabled:false,curveSegments:16}),wood);slab.rotation.x=-Math.PI/2;slab.position.y=.725;slab.name='tabletop';slab.castShadow=slab.receiveShadow=true;g.add(slab);
 if(d.theme==='monochrome'){const edge=new T.Mesh(new T.ExtrudeGeometry(s,{depth:.007,bevelEnabled:false,curveSegments:16}),dark);edge.name='mono-continuous-table-edge';edge.rotation.x=-Math.PI/2;edge.position.y=.718;edge.castShadow=edge.receiveShadow=true;g.add(edge);}
 const support=new T.Group();support.name='bay-top-detail';furniture.add(support);
 box(support,'bay-supported-riser',[17.54,4.84,18.08,6.37],room.bayHeight+.015,.725-room.bayHeight-.015,ivory,.006);
 for(const [i,r] of q.shelfRects.entries()){
  const{g:sg,w:sw,depth:sd}=faceGroup(r,i===0?'south':'north',support);sg.name='low-bay-end-shelf';
  box(sg,'end-shelf-back',[0,0,sw,.018],.75,.36,d.theme==='monochrome'?dark:ivory,.004);
  for(const x of [0,sw-.018])box(sg,'end-shelf-side',[x,.018,x+.018,sd],.75,.36,ivory,.004);
  for(const y of [.75,1.092])box(sg,'end-shelf-board',[0,.018,sw,sd],y,.018,wood,.003);
  if(i===0)for(let k=0;k<7;k++)box(sg,'bay-books',[.055+k*.044,.035,.083+k*.044,.22],.768,.235+(k%2)*.012,k%3?cloth:accent,.001);
  else{box(sg,'bay-picture-frame',[.10,.035,.35,.052],.768,.25,wood,.003);box(sg,'bay-picture',[.113,.053,.337,.055],.781,.224,softBacking,.001);}
 }
 if(q.seatStatus==='candidate')return;
 const r=q.intendedChair,marker=new T.Mesh(new T.BoxGeometry(r[2]-r[0],.85,r[3]-r[1]),new T.MeshBasicMaterial({color:'#b44f3e',wireframe:true,transparent:true,opacity:.7,depthTest:false}));
 marker.name='unresolved-window-seat';marker.position.set((r[0]+r[2])/2,.425,(r[1]+r[3])/2);marker.renderOrder=8;furniture.add(marker);
}
function fixedWindowDesk(g,w,depth){
 if(d.bayJoin)bayDesktop(g,w,depth);
 // Whole floating top, not a set of independent bedside tables. Concealed steel is a design allowance, not a fabrication calculation.
 for(const z of [.065,depth-.115])box(g,'concealed-span-rail',[.025,z,w-.025,z+.04],.66,.06,ivory,.002);
 for(const x of [.025,w-.05])box(g,'end-wall-support',[x,.055,x+.025,depth-.06],.64,.08,ivory,.002);
 box(g,'underdesk-wire-tray',[w-.64,.065,w-.06,.14],.60,.04,ivory,.002);
 const pc=d.desk.computerCenter!==undefined?d.desk.computerCenter-d.desk.r[1]-.305:d.bayJoin?(room.bay[1]+room.bay[3])/2-d.desk.r[1]-.305:w-.62;
 box(g,'desk-power-cover',[w-.34,.05,w-.10,.115],.751,.004,ivory,.002);
 box(g,'computer-stand',[pc+.17,.19,pc+.43,.35],.751,.014,dark,.006);
 box(g,'computer-neck',[pc+.29,.27,pc+.31,.30],.765,.22,dark,.002);
 box(g,'computer-monitor',[pc,.27,pc+.61,.295],.89,.345,dark,.006);
 box(g,'computer-display',[pc+.01,.296,pc+.60,.299],.901,.323,softBacking,.001);
 box(g,'computer-document',[pc+.03,.300,pc+.40,.302],.923,.278,ivory,.001);
 box(g,'computer-keyboard',[pc+.035,.43,pc+.475,.57],.751,.015,ivory,.003);
 box(g,'computer-mouse',[pc+.515,.46,pc+.57,.55],.751,.023,dark,.01);
 if(d.id==='footdesk'){
  const head=new T.Group();head.name='continuous-headboard-feature';furniture.add(head);
  box(head,'south-headboard-backing',[15.27,7.17,17.50,7.188],.08,.97,wood,.002);
  box(head,'south-window-return',[17.482,6.80,17.50,7.17],.08,.97,wood,.002);
  return;
 }
 const h=d.headFeature,br=d.bed.r,head=new T.Group();head.name='continuous-headboard-feature';furniture.add(head);
 // One L-shaped backing mesh wraps only onto the solid window pier; never across the glazing.
 const shape=new T.Shape(),[x0,z0,x1,z1]=h.r,inner=x1-.018;
 shape.moveTo(x0,-z0);shape.lineTo(x1,-z0);shape.lineTo(x1,-h.returnEnd);shape.lineTo(inner,-h.returnEnd);shape.lineTo(inner,-z1);shape.lineTo(x0,-z1);shape.closePath();
 const skin=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:h.height-.08,bevelEnabled:false}),wood);
 skin.rotation.x=-Math.PI/2;skin.position.y=.08;skin.name='continuous-L-headboard-backing';skin.castShadow=skin.receiveShadow=true;head.add(skin);
 // Same finish returns to the desk, with a narrow reveal; no separate display blocks.
 box(head,'headboard-top-reveal',[x0+.025,z1,x1-.025,z1+.002],h.height-.018,.012,dark,.001);
 const st=d.headStorage,{g:sg,w:sw,depth:sd}=faceGroup(st.r,'south');sg.name='integrated-head-storage';
 box(sg,'storage-back',[0,0,sw,.018],st.bottom,st.height,d.theme==='monochrome'?dark:ivory,.002);
 for(const y of [st.bottom,st.bottom+st.height-.018])box(sg,'continuous-storage-band',[0,0,sw,sd],y,.018,ivory,.002);
 const left=br[0]-st.r[0],right=br[2]-st.r[0];
 for(const x of [0,left-.018,right,sw-.018])box(sg,'band-partition',[x,.018,x+.018,sd],st.bottom+.018,st.height-.036,ivory,.002);
 for(const x of [left,(left+right)/2])box(sg,'shallow-storage-door',[x+.003,sd-.018,x+(right-left)/2-.003,sd],st.bottom+.022,st.height-.044,ivory,.002);
 // Open bays share the continuous band. Objects stay outside the pillow projection.
 box(sg,'secured-side-frame',[.12,.045,.41,.063],st.bottom+.018,.29,wood,.002);
 box(sg,'secured-side-picture',[.135,.064,.395,.066],st.bottom+.033,.26,softBacking,.001);
 for(let i=0;i<7;i++)box(sg,'window-end-book',[right+.09+i*.05,.025,right+.125+i*.05,.155],st.bottom+.018,.27+(i%2)*.025,i%3?cloth:accent,.001);
 box(sg,'display-end-bookend',[right+.46,.025,right+.473,.16],st.bottom+.018,.24,dark,.001);
}
function studyDesk(g,w,depth){
 // One continuous-looking removable desk; light seams mark the bolted sections.
 let joint=0;for(const segment of d.desk.segments.slice(0,-1)){joint+=segment;box(g,'desktop-section-joint',[joint-.001,.01,joint+.001,depth-.01],.749,.001,softBacking,0);}
 for(const x of [.04,w-.07])for(const z of [.05,depth-.06])box(g,'desk-steel-leg',[x,z,x+.03,z+.03],.02,.68,ivory,.004);
 for(const z of [.05,depth-.06])box(g,'desk-steel-longrail',[.04,z,w-.04,z+.03],.675,.025,ivory,.004);
 box(g,'underdesk-cable-tray',[.08,.08,w-.08,.16],.61,.04,dark,.004);
 box(g,'desk-power-cover',[.76,.12,.96,.19],.75,.004,ivory,.003);
 box(g,'monitor-foot',[1.08,.22,1.48,.38],.751,.015,dark,.01);
 box(g,'monitor-stand',[1.27,.28,1.30,.31],.765,.26,dark,.003);
 box(g,'monitor-body',[.94,.29,1.65,.315],.91,.40,dark,.008);
 box(g,'monitor-screen',[.95,.316,1.64,.319],.922,.376,softBacking,.002);
 box(g,'screen-window',[.98,.320,1.36,.322],.949,.31,ivory,.001);
 box(g,'screen-sidebar',[1.39,.320,1.61,.322],.949,.31,accent,.001);
 box(g,'keyboard',[1.01,.48,1.44,.63],.751,.018,ivory,.004);
 box(g,'mouse-pad',[1.48,.44,1.73,.65],.751,.003,cloth,.007);
 box(g,'mouse',[1.55,.50,1.61,.60],.754,.025,dark,.014);
 box(g,'reading-book',[1.96,.34,2.25,.60],.751,.018,ivory,.005);
 box(g,'task-lamp-base',[2.31,.15,2.49,.33],.751,.018,dark,.02);
 box(g,'task-lamp-stem',[2.39,.23,2.405,.245],.769,.38,dark,.002);
 box(g,'task-lamp-head',[2.14,.20,2.42,.26],1.149,.025,ivory,.006);
 box(g,'pc-tower',[w-.47,.12,w-.13,.57],.09,.46,dark,.013);
 box(g,'pc-vent',[w-.455,.572,w-.145,.578],.16,.32,softBacking,.004);
 const x0=.09,x1=.53;
 box(g,'mobile-drawer-body',[x0,.08,x1,.64],.08,.60,ivory,.007);
 for(const y of [.09,.285,.48])box(g,'mobile-drawer-front',[x0+.005,.641,x1-.005,.659],y,.18,ivory,.003);
 for(const x of [x0+.04,x1-.04])for(const z of [.12,.59])box(g,'drawer-caster',[x-.018,z-.018,x+.018,z+.018],.02,.06,dark,.009);
 if(!d.studyStorage)return;
 const s=d.studyStorage,{g:sg,w:sw,depth:sd}=faceGroup(s.r,'south');sg.name='study-low-storage';
 box(sg,'low-cabinet-body',[0,0,sw,sd],.08,s.height-.08,ivory,.009);
 box(sg,'low-cabinet-oak-top',[0,0,sw,sd],s.height,.025,wood,.005);
 for(let i=0;i<2;i++)box(sg,'low-cabinet-door',[i*sw/2+.005,sd-.02,(i+1)*sw/2-.005,sd],.10,s.height-.12,ivory,.004);
 box(sg,'single-book-shelf',[0,.015,sw,.255],1.46,.025,wood,.004);
 for(let i=0;i<8;i++)box(sg,'shelf-book',[.08+i*.05,.035,.117+i*.05,.225],1.485,.24+(i%2)*.02,i%3?cloth:accent,.001);
 box(sg,'small-art',[.79,.04,1.03,.07],.925,.28,wood,.003);
}
function desk(){const{g,w,depth}=faceGroup(d.desk.r,d.desk.front),upperHeight=d.desk.upperHeight??2.4;g.name='desk';box(g,'tabletop',[0,0,w,depth],.725,.025,wood,d.desk.fullWall?0:.01);
 if(d.desk.studyFirst){studyDesk(g,w,depth);return;}
 if(d.desk.fixedWindow){fixedWindowDesk(g,w,depth);return;}
 if(!d.desk.legless)for(const x of [.035,w-.06])box(g,'rear-support',[x,.02,x+.025,.055],.03,.695,dark,.003);
 if(!d.desk.bayBridge)box(g,'rear-apron',[.035,.02,w-.035,.04],.55,.16,wood);
 if(!d.desk.legless&&['wallbed','ward180','cabinetwall','lwallstudy','southbedwall'].includes(d.id))for(const x of [.02,w-.05])box(g,'front-support',[x,depth-.045,x+.03,depth-.015],.02,.705,wood,.004);
 box(g,'book',[w*.24,.14,w*.24+.26,Math.min(depth-.025,.38)],.751,.012,ivory);
 box(g,'lamp-base',[w-.23,.10,w-.07,.26],.751,.015,dark,.025);box(g,'lamp-stem',[w-.15,.17,w-.137,.183],.766,.30,dark,.002);box(g,'lamp-head',[w-.36,.15,w-.12,.20],1.066,.025,dark,.007);
 if(d.desk.legless)box(g,'concealed-rear-ledger',[.04,.02,w-.36,.045],.67,.04,dark,.002);
 if(d.desk.bayBridge){
  box(g,'bay-desk-concealed-support',[.04,.018,w-.04,.045],.68,.035,dark);
  return; // No upper cupboards across the original window; retained sill remains solid.
 }
 if(d.desk.fullWall){wallBookcase(g,w,true);
 }else if(d.desk.integrated){
  for(const x of [0,.32,w-.018])box(g,'upper-side',[x,0,x+.018,.28],1.30,upperHeight-1.30);
  box(g,'upper-back',[0,0,w,.018],1.30,upperHeight-1.30,wood);
  for(const y of [1.30,1.67,2.06,upperHeight-.018])box(g,'corner-display-shelf',[.018,.018,.32,.28],y,.018,wood);
  for(const y of [1.50,1.84,2.06,upperHeight-.018])box(g,'book-shelf',[.338,.018,w-.018,.28],y,.018,wood);
  box(g,'upper-closed-door',[.338,.26,w-.006,.28],2.086,upperHeight-2.10);
  for(let row=0;row<2;row++)for(let i=0;i<9;i++)box(g,'study-book',[.40+i*.052,.04,.437+i*.052,.245],1.518+row*.34,.24+(i%2)*.025,i%2?cloth:green,.001);
  box(g,'display-frame',[.085,.035,.245,.065],1.318,.21,dark);
  box(g,'display-photo',[.097,.066,.233,.071],1.33,.18,ivory);
  box(g,'display-ceramic',[.10,.09,.23,.22],1.688,.16,cloth,.035);
  box(g,'task-light',[.34,.22,w-.04,.238],1.482,.012,new T.MeshStandardMaterial({color:'#fff4d8',emissive:'#fff4d8',emissiveIntensity:.5}));
 }else if(d.desk.front==='south'||d.desk.front==='north'){
  for(const x of [0,w-.018])box(g,'upper-side',[x,0,x+.018,.28],1.50,.90);
  box(g,'upper-back',[0,0,w,.018],1.5,.9,wood);
  for(const y of [1.5,1.92,2.382])box(g,'upper-shelf',[0,0,w,.28],y,.018,wood);
  box(g,'upper-door',[.006,.26,w-.006,.28],1.943,.434);
  for(let i=0;i<5;i++)box(g,'book',[.06+i*.052,.04,.10+i*.052,.245],1.518,.23+(i%2)*.03,i%2?cloth:green);
 }
}
function storageDetails(){
 if(!d.northCounter)return;
 const r=d.northCounter,{g,w}=faceGroup(r,'south');g.name='north-display-counter';
 box(g,'fixed-no-access-base',[0,0,w,.55],.04,.685,ivory);box(g,'display-top',[0,0,w,.55],.725,.025,wood,d.desk.fullWall?0:.004);
 if(d.desk.fullWall){wallBookcase(g,w);}else{
 box(g,'upper-back',[0,0,w,.018],1.95,.75,wood);
 for(const x of [0,w/3,2*w/3,w-.018])box(g,'upper-side',[x,0,x+.018,.28],1.95,.75);
 for(const y of [1.95,2.682])box(g,'upper-shelf',[0,0,w,.28],y,.018,wood);
 for(let i=0;i<3;i++)box(g,'upper-door',[i*w/3+.004,.26,(i+1)*w/3-.004,.28],1.978,.70);
 }
 if(d.desk.joineryStyle!=='video-fit'){
 box(g,'art-frame',[w*.45,.02,w*.75,.055],.75,.36,wood);
 box(g,'art',[w*.45+.015,.056,w*.75-.015,.060],.765,.33,cloth);
 box(g,'ornament',[w*.15,.15,w*.15+.14,.29],.75,.17,green,.035);
 }
 const c=d.desk.pedestal,p=new T.Group();p.name='desk-right-pedestal';furniture.add(p);
 for(const x of [c[0],c[2]-.018])box(p,'side',[x,c[1],x+.018,c[3]],.06,.65);
 for(const y of [.06,.69])box(p,'shelf',[c[0],c[1],c[2],c[3]],y,.018,wood);
 box(p,'back',[c[0],c[1],c[2],c[1]+.018],.06,.65);
 for(const y of [.065,.275])box(p,'lower-drawer-front',[c[0]+.003,c[3],c[2]-.003,c[3]+.018],y,.198);
 deskDrawerGroup=new T.Group();deskDrawerGroup.name='moving-desk-drawer';furniture.add(deskDrawerGroup);
 const dr=d.deskDrawer.r;
 box(deskDrawerGroup,'drawer-front',[dr[0],dr[3]-.018,dr[2],dr[3]],.488,.20);
 box(deskDrawerGroup,'drawer-bottom',[dr[0],dr[1],dr[2],dr[3]-.018],.488,.014,wood);
 for(const x of [dr[0],dr[2]-.012])box(deskDrawerGroup,'drawer-side',[x,dr[1],x+.012,dr[3]-.018],.502,.15,wood);
 box(deskDrawerGroup,'drawer-back',[dr[0],dr[1],dr[2],dr[1]+.012],.502,.15,wood);
 for(const q of d.bedDrawers){const b=q.r,dg=new T.Group();dg.name='bed-side-drawer';furniture.add(dg);bedDrawerGroups.push(dg);
  box(dg,'front',[b[0],b[1],b[0]+.018,b[3]],.05,.24,wood);
  box(dg,'bottom',[b[0]+.018,b[1],b[2],b[3]],.05,.015,wood);
  for(const z of [b[1],b[3]-.015])box(dg,'side',[b[0]+.018,z,b[2],z+.015],.065,.21,ivory);
  box(dg,'back',[b[2]-.015,b[1],b[2],b[3]],.065,.21);
 }
}
function chair(){const c=d.chair;chairGroup=new T.Group();chairGroup.name='chair';furniture.add(chairGroup);
 if(d.desk.studyFirst||d.desk.officeChair){
  const [x,z,x1,z1]=c,cx=(x+x1)/2,cz=(z+z1)/2;
  box(chairGroup,'office-seat',[x+.09,z+(d.desk.compactChair?.045:.09),x1-.06,z1-(d.desk.compactChair?.045:.09)],.43,.065,cloth,.035);
  box(chairGroup,'office-back',[x+.07,z+.085,x+.12,z1-.085],.495,.66,cloth,.025);
  if(!d.desk.compactChair)for(const az of [z+.07,z1-.11]){box(chairGroup,'arm-post',[cx-.08,az,cx-.05,az+.025],.30,.30,dark,.002);box(chairGroup,'arm-pad',[x+.13,az,x1-.08,az+.04],.60,.04,dark,.01);}
  box(chairGroup,'chair-gaslift',[cx-.028,cz-.028,cx+.028,cz+.028],.08,.35,dark,.009);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5,radius=Math.min(x1-x,z1-z)/2-.06,dx=Math.cos(a)*radius,dz=Math.sin(a)*radius;const leg=new T.Mesh(new T.BoxGeometry(radius+.01,.025,.03),dark);leg.name='office-star-leg';leg.position.set(cx+dx/2,.075,cz+dz/2);leg.rotation.y=-a;chairGroup.add(leg);box(chairGroup,'office-caster',[cx+dx-.025,cz+dz-.025,cx+dx+.025,cz+dz+.025],.015,.045,dark,.015);}
  return;
 }
 box(chairGroup,'seat',c,.43,.055,green,.025);
 box(chairGroup,'back',d.desk.front==='east'?[c[2]-.035,c[1],c[2],c[3]]:d.desk.front==='west'?[c[0],c[1],c[0]+.035,c[3]]:d.desk.front==='north'?[c[0],c[1],c[2],c[1]+.035]:[c[0],c[3]-.035,c[2],c[3]],.485,.34,green,.018);
 for(const x of [c[0]+.035,c[2]-.06])for(const z of [c[1]+.035,c[3]-.06])box(chairGroup,'leg',[x,z,x+.025,z+.025],0,.43,wood,.003);
}
function bay(){if(!d.demolish){box(furniture,'retained-raised-bay',room.bay,0,room.bayHeight);box(furniture,'sill-finish',room.bay,.55,.015,wood);}
 else {box(furniture,'conditional-floor-in-original-bay',room.bay,-.005,.012,ivory);}
 if(d.lowCabinet){const{g,w,depth}=faceGroup(d.lowCabinet,'west');g.name='window-low-storage';box(g,'back',[0,0,w,.018],.06,.37);
  for(const x of [0,.50,1.0,w-.018])box(g,'divider',[x,0,x+.018,depth],.06,.37);
  box(g,'top',[0,0,w,depth],.43,.02,wood,.008);box(g,'bottom',[0,0,w,depth],.06,.018,wood);
  for(const x of [0,.50])box(g,'drawer-front',[x+.025,depth-.02,x+.48,depth],.10,.305);
  drawerGroup=new T.Group();g.add(drawerGroup);box(drawerGroup,'moving-drawer-front',[1.025,depth-.02,w-.025,depth],.10,.305);box(drawerGroup,'drawer-base',[1.03,.08,w-.03,depth-.02],.10,.018,wood);
  for(const x of [1.03,w-.048])box(drawerGroup,'drawer-side',[x,.08,x+.018,depth-.02],.118,.23,wood);
  box(drawerGroup,'folded-linen',[1.07,.12,w-.07,depth-.06],.118,.12,cloth,.01);
 }
}
function build(){furniture.removeFromParent();furniture.traverse(o=>o.geometry?.dispose());furniture=new T.Group();scene.add(furniture);drawerGroup=null;wallBedPivot=null;wallBedLegs=null;wallBedPillows=null;slidingPanel=null;slidingPanels=[];bedDrawerGroups=[];deskDrawerGroup=null;
 d.wardrobes.forEach(wardrobe);if(d.bookshelf)bookshelf(d.bookshelf);if(d.cabinetJoin)box(furniture,'cabinet-join',d.cabinetJoin,.08,2.32,ivory);bed();foldingBed();desk();storageDetails();chair();bay();
 if(d.screen)box(furniture,'opaque-wardrobe-return',d.screen.r,0,d.screen.height,wood,.006);
 doorPivot=new T.Group();doorPivot.position.set(...[room.door.hinge[0],0,room.door.hinge[1]]);furniture.add(doorPivot);box(doorPivot,'original-door',[-.018,-.9,.018,0],.02,2.1);
 if(d.doorReserve)for(const s of [-1,1]){box(doorPivot,'handle-rosette',[s<0?-.028:.018,-.80,s<0?-.018:.028,-.75],.93,.08,dark);box(doorPivot,'handle-lever',[s<0?-.07:.025,-.785,s<0?-.025:.07,-.66],.96,.018,dark,.003);}
 updateState();
}
function updateState(){if(!chairGroup)return;
 if(wallBedPivot){wallBedPivot.rotation.x=wallBedOpen?-Math.PI/2:0;wallBedLegs.visible=wallBedPillows.visible=wallBedOpen;}const unresolvedBaySeat=d.bayJoin&&d.bayJoin.seatStatus!=='candidate';chairGroup.visible=!wallBedOpen&&!unresolvedBaySeat;$('#chair').disabled=wallBedOpen||!!unresolvedBaySeat;
for(const {panel,travel,closedX} of slidingPanels)panel.position.x=closedX+($('#ward-open').checked?travel:0);
 $('#door-angle').value=String(doorAngle);$('#angle-value').textContent=doorAngle+'°';const cr=chairRect(d,chairState);chairGroup.position.set(cr[0]-d.chair[0],0,cr[1]-d.chair[1]);bedDrawerGroups.forEach((g,i)=>g.position.x=$('#bed-drawers').checked?-d.bedDrawers[i].travel:0);if(deskDrawerGroup)deskDrawerGroup.position.z=$('#desk-drawer').checked?d.deskDrawer.travel:0;doorPivot.rotation.y=-doorAngle*Math.PI/180;if(drawerGroup)drawerGroup.position.z=$('#drawer').checked?.4:0;drawPlan();showAudit();}
function showAudit(){const a=audit.find(a=>a.id===d.id),r=chairState===-1?(doorOpen?a.routes.stowedDoorOpen:a.routes.stowedDoorClosed):doorOpen?(chairState?a.routes.doorOpenChairPulled:a.routes.doorOpen):chairState?a.routes.chairPulledAfterClosing:a.routes.doorClosed;
 $('#route').textContent=(doorAngle>0&&doorAngle<90)||$('#drawer').checked?'当前角度/抽屉状态未校核人体路径；不能套用门全开或关闭的结果。':`当前状态的600mm代理：桌椅接近位${r.chairApproach?'可达':'不可达'}；衣柜${r.wardrobes.every(Boolean)?'指定取物位可达':'有取物位不可达'}；窗侧${r.windowSide?'可达':'不可达'}。只查模型路径，不等于人体舒适度或施工通过。`;
 $('#note').textContent=d.demolish?'条件方案：假设窗台可拆、楼板可用；原门窗不动。'+(d.id==='crossbed'?'横床余量很紧，不推荐先选。':doorOpen?'房门全开，请对比关门后的路径。':'需关门后到窗侧；点击上方切换2D/3D。'):'保留原窗台；柜桌和通行取舍见右侧。';
 if(d.wallBed){
  const br=doorOpen?a.routes.bedOpenDoorOpen:a.routes.bedOpenDoorClosed;
  $('#note').textContent=wallBedOpen?'床已展开：模拟办公椅移出房间；只从左侧上床，不同时办公。':'长桌＋105cm衣柜＋翻床柜｜勾选“展开翻床”查看1.5×2m床。';
  $('#route').textContent=(doorAngle>0&&doorAngle<90)?'中间开门角度的人体路线未验证。':wallBedOpen?`600mm代理：床左侧${br.bedSide?'可达':'不可达'}；桌前办公及右侧通路不可用。椅子移出、机构锁止和固定承载需另外确认。`:`收床状态：桌侧${r.chairApproach?'可达':'不可达'}、衣柜${r.wardrobes.every(Boolean)?'可达':'不可达'}。不代表翻转操作、承重或人体舒适度已验收。`;
 }
 if(d.id==='fixedwindow'){
  $('#note').textContent='北墙床头＋65cm悬空窗桌｜从床尾绕行，先关房门；电脑席约63cm。';
  $('#route').textContent=(doorAngle>0&&doorAngle<90)?'当前开门角度人体路径未验。':`600mm模型代理：椅侧接近${r.chairApproach?'可达':'不可达'}；衣柜${r.wardrobes.every(Boolean)?'可达':'不可达'}；床左侧${r.bedSide?'可达':'不可达'}。门全开时到不了桌前，需先关门；坐席约63cm，不代表久坐舒适。`;
 }
 if(d.bayJoin){$('#route').textContent='全房坐席未通过：期望窗前椅位与床重叠60×58cm，不能入座。局部节点只看台面与窗台衔接，不套用原实墙椅位的路径结果。';$('#note').textContent=view==='baydetail'?'桌窗节点试样：床柜暂时隐藏；不代表全房布局可用。前65cm办公，后部展示，原窗台不拆。':'红色框＝期望窗前椅位，与床冲突；旧实墙椅位已隐藏。';}
 if(d.id==='footdesk'){
  $('#note').textContent='尺寸试排：床头南向；北侧床尾65cm。座位偏窗洞北端，入座与转身尚未验证。';
  $('#route').textContent=(doorAngle>0&&doorAngle<90)?'中间开门角度的人体路线未验证。':`600mm代理：椅后接近位${r.chairApproach?'可达':'不可达'}、指定取衣位${r.wardrobes.every(Boolean)?'可达':'不可达'}、床左侧${r.bedSide?'可达':'不可达'}。只是接近路径，不是入座动作通过。椅宽按55cm假设；窗中视野未满足。`;
 }
 if(d.id==='studyfirst'){
  $('#note').textContent='267×70cm长桌｜无固定床、无高衣柜；原飘窗保留，后期改儿童房需移桌重排。';
  $('#route').textContent=(doorAngle>0&&doorAngle<90)?'中间开门角度未校核人体路径。':`600mm模型代理：座椅接近位${r.chairApproach?'可达':'不可达'}；低书柜${r.wardrobes.every(Boolean)?'可达':'不可达'}；桌南端站位${r.windowSide?'可达':'不可达'}。不等于已验证坐姿舒适度、窗扇操作或施工尺寸。`;
 }
 if(d.id==='baywardrobe'){
  $('#note').textContent='衣柜90＋96cm（两组）｜飘窗不拆，桌下脚部进深仅40cm；关门收椅后到窗侧。';
  $('#route').textContent+=' 房门全开无法绕床尾到书桌；进入左侧等待位后关门。使用椅子会阻断右柜与窗侧，需先收椅。桌下原窗台未挖空；坐姿、窗扇与支撑固定未验证。';
 }
 if(d.id==='southbedwall'){
  $('#note').textContent='衣柜转角直接延伸台面｜无包框、无独立桌腿；床尾仍8cm、窗前无步行通道。';
  const drawerActive=$('#bed-drawers').checked||$('#desk-drawer').checked;
  if(drawerActive)$('#route').textContent='抽屉展开状态：已校核收椅＋房门全开时两处床抽屉取物位可达；原床侧站位被抽屉占用。其他组合不套用该结论。';
  $('#route').textContent+=' 书桌右侧33cm抽屉柜，净腿位约85cm；取衣先收椅。床抽屉外拉45cm，至全开门扇端部局部约65cm，不是全程通道宽度。上柜及窗户维护路径未定稿。';
 }
 if(d.id==='lwallstudy'){
  $('#note').textContent='西＝房门墙｜北＝上方实墙（按你的方位称呼） · 衣柜转接书桌上柜，床头靠实墙。';
  $('#route').textContent+=' 衣柜105cm外宽，靠门端取衣口约50cm；转角桌面遮挡部分柜面，请切换衣柜移门查看。桌端至床10cm不作通道，床尾63cm。仅核对指定站位，深角取衣便利性和上柜固定未验证。';
 }
 if(d.id==='cabinetwall'){
  $('#note').textContent='床转向 · 105cm书柜＋3cm收口＋180cm衣柜整组288cm；保留原门窗。';
  $('#route').textContent+=' 柜前61cm。取书需关门；105×55cm桌配45×48cm椅，后拉20cm后距床尾8cm，从侧面入座。原门全程含10cm预留包络，最小剩余约'+Math.round(a.doorReserve.remaining*100)+'cm。门口正向投影不对枕区，斜看仍可见；不是完全遮挡。';
 }
 if(d.id==='privacy'){
  $('#note').textContent='⑤ 衣柜在床尾、滑门朝入门侧。30cm短翼遮斜视线；保留飘窗，床头为独立床头板。';
  $('#route').textContent+=' 隐私采样：'+a.privacy.tested+'条门洞至躺卧头区视线中，未遮挡'+a.privacy.visible+'条；仅模型指定视高与躺卧姿态，不包括走入室内或坐起。';
 }
 if(d.id==='wallbed'){
  $('#note').textContent='床头靠实墙，柜桌沿墙，无中间隔断。直看对床尾段；斜看仍可能看到头部。';
  $('#route').textContent+=' 新方案核对的是床侧、床尾窗侧、两处柜前和椅侧；不是62cm通道的舒适度认证。门洞正向投影与枕区不重叠，但没有全面遮挡。';
 }
 if(d.id==='ward180'){
  $('#note').textContent='180cm柜＋110×50cm桌。拖动“开门角度”查看；门板36mm、把手外伸及8cm预留均为试排假设。';
  $('#route').textContent+=' 门扇全程采样附加8cm包络，最小剩余仅约'+Math.round(a.doorReserve.remaining*100)+'cm，容差紧，不是可下单确认。椅子明确为40cm外宽。';
 }
}
function drawPlan(){svg.replaceChildren();svg.setAttribute('viewBox','13.60 4.15 4.86 3.43');
 const el=(tag,a,t)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(a).forEach(([k,v])=>n.setAttribute(k,v));if(t)n.textContent=t;svg.append(n);return n;};
 const text=(x,z,t,size=.095)=>el('text',{x,y:z,'text-anchor':'middle','font-size':size,fill:'#3d4037'},t),rect=(r,c)=>el('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill:c,stroke:'#828a79','stroke-width':.016}),mid=r=>[(r[0]+r[2])/2,(r[1]+r[3])/2];
 const poly=spec.spaces.find(s=>s.id==='bed3').polygons[0];el('polygon',{points:poly.map(([x,z])=>`${x},${-z}`).join(' '),fill:'#eee9dc',stroke:'#818878','stroke-width':.03});rect(room.bay,d.demolish?'#efe3c8':'#cdd4cb');
 text(16,4.31,d.name,.115);
 for(const w of d.wardrobes){rect(w.r,'#c1c9b7');const p=mid(w.r);text(p[0],p[1]-.02,'衣柜');text(p[0],p[1]+.13,Math.round((['west','east'].includes(w.front)?w.r[3]-w.r[1]:w.r[2]-w.r[0])*100)+'×60',.08);}
 if(d.bed){rect(d.bed.r,'#d7cbb6');const b=d.bed.r;rect(d.bed.head==='south'?[b[0],b[3]-.07,b[2],b[3]]:d.bed.head==='west'?[b[0],b[1],b[0]+.07,b[3]]:d.bed.head==='east'?[b[2]-.07,b[1],b[2],b[3]]:[b[0],b[1],b[2],b[1]+.07],'#929d86');text(...mid(b),'1.5×2m床',.12);}
 if(d.screen){rect(d.screen.r,'#796d59');text(15.55,6.48,'遮挡短翼30cm',.08);text(14.40,4.36,'柜前80cm',.08);text(15.62,6.87,'绕行85cm',.08);text(17.14,5.27,'头部',.11);el('line',{x1:14.02,y1:6.50,x2:15.41,y2:6.12,stroke:'#a17850','stroke-width':.022,'stroke-dasharray':'.04 .03'});}
 if(d.id==='wallbed'){
  text(16.73,4.85,'枕头靠实墙',.10);text(16.78,6.93,'床尾63cm',.09);
  text(15.66,6.99,'62cm',.085);text(14.60,5.73,'柜桌净距154cm',.09);
  el('path',{d:'M14.08 6.00 L15.85 6.00',stroke:'#a17850','stroke-width':.022,'stroke-dasharray':'.05 .03',fill:'none'});
  text(15.03,5.87,'门口直看：床尾段',.075);
 }
 if(d.id==='ward180'){
  text(16.74,4.85,'床头靠实墙',.10);text(16.70,6.94,'床尾63cm',.085);text(15.64,6.94,'61cm',.085);
  el('line',{x1:14.25,y1:6.57,x2:15.0,y2:6.57,stroke:'#b9a384','stroke-width':.16,opacity:.22});
  text(14.60,6.78,'距全开门线10cm',.065);
 }
 if(d.bookshelf){rect(d.bookshelf.r,'#c6b396');rect(d.cabinetJoin,'#dfdccf');text(14.57,7.04,'书柜105×30',.073);text(16.12,6.31,'柜前61cm',.09);text(14.55,6.76,'关门后取书',.071);
  el('line',{x1:16.1,y1:5.96,x2:16.1,y2:6.57,stroke:'#8c785a','stroke-width':.015});
  text(17.0,4.66,'窗侧独立床头',.073);
 }
 if(d.id==='lwallstudy'){
  text(14.40,5.77,'西：房门墙',.075);text(15.23,4.14,'北：桌柜墙',.075);
  text(16.72,4.78,'床头靠实墙',.09);text(16.68,6.95,'床尾63cm',.085);
  text(15.28,6.38,'从桌前入座',.075);text(15.12,5.86,'柜前指定取衣位',.065);
  el('circle',{cx:14.96,cy:5.36,r:.035,fill:'#987347'});
  if($('#ward-open').checked){el('line',{x1:14.64,y1:5.05,x2:14.64,y2:5.51,stroke:'#fbfaf6','stroke-width':.045});text(14.35,5.41,'移门打开',.06);}
 }
 rect(d.desk.r,'#bea987');const dp=mid(d.desk.r);text(dp[0],dp[1]-.02,'书桌',.085);text(dp[0],dp[1]+.11,Math.round((['west','east'].includes(d.desk.front)?d.desk.r[3]-d.desk.r[1]:d.desk.r[2]-d.desk.r[0])*100)+'cm',.08);
 if(d.desk.integrated){el('rect',{x:d.desk.r[0],y:d.desk.r[1],width:1.2,height:.28,fill:'none',stroke:'#536b52','stroke-width':.018,'stroke-dasharray':'.035 .025'});text(15.24,4.65,d.desk.fullWall?'坐人段120／转角置物':'上柜120×28／左端展示',.063);}
 if(d.id==='baywardrobe'){
  text(15.74,6.86,'床尾65cm：关门后绕行',.082);
  text(16.86,6.55,'收椅后侧道约61cm',.068);
  text(17.89,6.64,'实心窗台保留',.075);
  text(17.91,6.78,'桌下脚部深40cm',.065);
  text(15.72,4.35,'薄框床外宽150cm为产品假设',.065);
 }
 if(d.id==='studyfirst'){rect(d.studyStorage.r,'#d8d5c9');text(14.65,4.70,'低书柜120×35',.068);text(15.35,5.30,'前期：不放固定床',.11);text(15.40,5.49,'中间留给座椅与活动',.08);text(17.08,6.95,'长桌267×70cm',.073);text(17.85,5.38,'原窗台保留',.072);}
 if(d.id==='fixedwindow'&&!d.bayJoin){text(14.94,5.73,'柜床间约62cm',.066);text(16.00,4.78,'床头靠北侧实墙',.08);text(17.14,6.10,'整板桌深65cm',.07);text(16.83,6.35,'5cm 非通道',.059);text(15.60,7.04,'床尾63cm · 关门后绕行',.069);el('path',{d:'M14.96 6.10 L14.96 6.85 L15.85 6.85',fill:'none',stroke:'#946f45','stroke-width':.025,'stroke-dasharray':'.04 .025'});el('path',{d:'M15.74 6.80 L15.85 6.85 L15.74 6.90',fill:'none',stroke:'#946f45','stroke-width':.023});text(15.9,7.30,'床头整带浅收纳 → 转角统一收口 → 悬空窗桌',.071);}
 if(d.wallBed){rect(d.wallBed.r,'#d9d5c9');text(...mid(d.wallBed.r),'翻床柜170×40',.07);if(wallBedOpen){rect(d.wallBed.extension,'#d7cbb6');text(...mid(d.wallBed.extension),'床垫150×200',.11);text(14.70,6.07,'左侧上床',.07);}else{el('rect',{x:d.wallBed.extension[0],y:d.wallBed.extension[1],width:1.64,height:1.97,fill:'none',stroke:'#9d927f','stroke-width':.015,'stroke-dasharray':'.045 .035'});text(15.88,5.18,'虚线：开床后占用',.075);}}
 if(d.bayJoin&&d.bayJoin.seatStatus!=='candidate'){rect(d.bayJoin.r,'#bea987');d.bayJoin.shelfRects.forEach(r=>rect(r,'#e0dcd0'));el('rect',{x:d.bayJoin.intendedChair[0],y:d.bayJoin.intendedChair[1],width:.60,height:.58,fill:'#b44f3e',opacity:.36,stroke:'#9d382d','stroke-width':.025});text(16.46,5.56,'期望坐席',.065);text(16.46,5.70,'与床冲突',.065);text(17.80,5.63,'后排展示',.065);text(17.80,5.79,'非腿部空间',.06);}
 if(d.id==='footdesk'){
  rect(d.bayJoin.r,'#e4e5e2');d.bayJoin.shelfRects.forEach(q=>rect(q,'#c5c8c7'));
  text(15.97,6.96,'床头靠南侧实墙',.077);
  text(15.83,4.68,'床尾65cm → 椅后接近',.067);
  text(14.96,5.34,'63cm',.078);
  text(16.83,6.24,'4cm非通道',.060);
  text(17.17,5.56,'桌深65cm',.075);
  text(17.83,5.60,'原飘窗保留',.066);
  text(17.83,5.75,'后排仅展示',.062);
  text(16.57,5.02,'55cm紧凑椅',.061);
  el('path',{d:'M14.12 6.03 L14.94 5.85 L14.94 4.79 L15.93 4.79',fill:'none',stroke:'#66735b','stroke-width':.022,'stroke-dasharray':'.045 .025'});
  text(15.2,7.30,'椅位靠窗边缘；接近可达 ≠ 入座动作已验证',.073);
 }
 const c=chairRect(d,chairState);if(!wallBedOpen&&(!d.bayJoin||d.bayJoin.seatStatus==='candidate')){rect(c,'#a6b298');text(...mid(c),'椅',.09);}
 if(d.northCounter){
  rect(d.northCounter,'#c9b794');text(16.66,4.80,'连续台面：置物段164cm',.065);
  text(16.68,5.08,'8cm：不是通道',.061);text(16.72,6.88,'床头靠南墙（试排）',.075);
  rect(d.desk.pedestal,'#b4ac98');text(15.68,4.83,'抽屉',.06);
  for(const q of d.bedDrawers){const r=q.r;rect($('#bed-drawers').checked?[r[0]-q.travel,r[1],r[2]-q.travel,r[3]]:[r[0],r[1],r[0]+.05,r[3]],'#bca788');}
  if($('#desk-drawer').checked){const r=d.deskDrawer.r;rect([r[0],r[1]+d.deskDrawer.travel,r[2],r[3]+d.deskDrawer.travel],'#bca788');}
  el('rect',{x:14.66,y:4.48,width:2.84,height:.28,fill:'none',stroke:'#536b52','stroke-width':.02,'stroke-dasharray':'.04 .03'});
 }
 if(d.lowCabinet){rect(d.lowCabinet,'#bea987');text(...mid(d.lowCabinet),'窗下真收纳',.075);if($('#drawer').checked)rect(d.drawer,'#cfbc9b');}
 el('line',{x1:14.02,y1:5.67,x2:14.02,y2:6.57,stroke:'#fbfaf6','stroke-width':.12});el('path',{d:'M 13.96 5.67 A .9 .9 0 0 1 14.86 6.57',fill:'none',stroke:'#a78c68','stroke-width':.016,'stroke-dasharray':'.04 .025'});el('line',{x1:13.96,y1:6.57,x2:13.96+.9*Math.sin(doorAngle*Math.PI/180),y2:6.57-.9*Math.cos(doorAngle*Math.PI/180),stroke:'#9f7955','stroke-width':.036});
 text(15.9,7.43,d.demolish?'浅黄色区域仅在确认可拆后才假设可用':d.northCounter?'柜顶暂按270cm · 原窗台保留 · 窗前路径未解决':'原窗台保留，非可走地面',.10);
}
function choose(id){const next=options.find(o=>o.id===id);if(!next)return;d=next;wallBedOpen=false;$('#wallbed-open').checked=false;wallBedLabel.hidden=!d.wallBed;doorOpen=false;chairState=d.id==='baywardrobe'?-1:0;$('#door').checked=false;$('#chair').value=String(chairState);$('#drawer').checked=false;$('#drawer').disabled=!d.lowCabinet;
 doorAngle=0;$('#ward-open').checked=false;$('#ward-open').disabled=!['lwallstudy','southbedwall','baywardrobe','fixedwindow','footdesk'].includes(d.id);wardrobeLabel.lastChild.textContent=d.id==='baywardrobe'?' 打开两组衣柜移门':' 打开靠门端衣柜移门';stowOption.hidden=!d.stow;for(const id of ['bed-drawers','desk-drawer']){$('#'+id).checked=false;$('#'+id).disabled=!d.northCounter;}
 $('#chair').options[1].textContent='后拉'+Math.round(Math.hypot(...d.pull)*100)+'cm';
 joineryButton.textContent=d.desk.studyFirst?'长桌全景':'柜桌正面';connectionButton.textContent=d.desk.studyFirst?'桌面近看':'转角台面';$('[data-view="bed"]').textContent=d.wallBed?'翻床柜看':d.desk.studyFirst?'低柜看':'床柜看';
 wardrobeLabel.hidden=!!d.desk.studyFirst&&!d.wallBed;for(const id of ['drawer','bed-drawers','desk-drawer'])$('#'+id).parentElement.hidden=!!d.desk.studyFirst;
 $('aside:last-child .hint').textContent=d.desk.fixedWindow?'床头已换到北侧实墙，窗桌统一65cm深。床尾63cm；门全开挡住绕行路线，需进房关门。取消外露桌腿，预留隐藏支撑但未核承重与墙体锚固；浅柜防脱、起身净空及久坐舒适度待核。':d.wallBed?'翻床仅作家具布局示意；不得照此制作机构或锚固。须厂家核实墙体固定、承重、防夹和锁止。展开前移走椅子，收床前按厂家要求整理床品；儿童不得自行操作。':d.desk.studyFirst?'前期书房，不放固定床；原实心飘窗保留，窗台高度、窗扇、窗帘及电源需复尺。后期改儿童房需移动或缩短桌面并重新校核，不是原样加床。桌架与支架承重待厂家确认。':'新试排均须核对门窗、人体操作及固定方式。原实心飘窗默认保留；条件拆除方案未经结构确认，不可据此施工。';
 document.querySelectorAll('[data-choice]').forEach(b=>b.classList.toggle('active',b.dataset.choice===d.id));document.title=d.desk.fixedWindow?'北墙床头 · 连续悬空窗桌':d.wallBed?'书房＋翻床 · 柜体现在到位':d.id==='studyfirst'?'书房 · 窗边长桌':'儿童房 · 柜桌与床位试排';$('h1').textContent=d.desk.fixedWindow?'床头、浅收纳与悬空窗桌':d.wallBed?'书房＋翻床 · 两种使用状态':d.id==='studyfirst'?'书房 · 先满足现在的使用':'儿童房 · 柜桌与床位试排';$('#name').textContent=d.name;document.querySelector('header small').textContent=d.desk.fixedWindow?'北墙床头 · 床尾绕行 · 65cm悬空整板桌':d.wallBed?'柜子和床现在做好 · 收床办公／移椅展开睡眠':d.id==='studyfirst'?'前期电脑房／书房 · 窗边长桌 · 后期儿童房需重排':d.id==='baywardrobe'?'衣柜优先试排 · 90＋96cm双柜 · 保留窗台借位书桌':d.id==='southbedwall'?'视频适配版 · 284cm柜桌 · 120cm学习段 · 原门窗不改':'1.5米床不变 · 原门不改 · 同一个户型比较';$('#condition').textContent=d.demolish?'假设可拆 · 未确认结构及下方楼板，不能用于拆除施工':'保留飘窗 · 不做结构拆改';
 $('#bed-size').textContent=d.wallBed?'翻床：150×200cm床垫':!d.bed?'前期不放固定床':d.bed.slim?'150×200 / 150×204cm':'150×200 / 154×206cm';$('#bookcase').textContent=d.desk.fixedWindow?'床头整带284×18cm浅收纳；中间闭柜、两端开放格':d.wallBed?'衣柜上部整宽储物；不做满墙展示格':d.desk.studyFirst?'120×35×90cm低书柜＋一层书架':d.desk.bayBridge?'改为两组挂衣柜＋柜内整宽顶格，不在窗上加吊柜':d.desk.joineryStyle==='video-fit'?'6扇暖白上柜门＋34cm展示列＋横向书架':d.northCounter?'整排开放书架＋顶部吊柜284×28cm':d.desk.integrated?'桌上120×28cm，上段齐顶240cm':d.bookshelf?'105×30×240cm（宽×深×高）':'见书桌上柜/窗下条件研究';
 $('#wardrobe').textContent=d.desk.studyFirst&&!d.wallBed?'前期不做高衣柜':d.wardrobes.map(w=>Math.round((['west','east'].includes(w.front)?w.r[3]-w.r[1]:w.r[2]-w.r[0])*100)).join('＋')+'cm';const r=d.desk.r;$('#desk').textContent=(['west','east'].includes(d.desk.front)?[r[3]-r[1],r[2]-r[0]]:[r[2]-r[0],r[3]-r[1]]).map(n=>Math.round(n*100)).join('×')+'cm';if(d.northCounter)$('#desk').textContent='整排284×55cm；坐人段120cm';$('#plus').textContent='获得：'+d.advantage;$('#minus').textContent='代价：'+d.cost;
 roomStyleButton.hidden=d.theme!=='monochrome';bayButton.hidden=!d.bayJoin;if(d.bayJoin){document.title='黑白一体 · 床柜与飘窗桌';$('h1').textContent='黑白一体 · 床、柜与窗桌';document.querySelector('header small').textContent='白色连续面 · 哑黑细节 · 原飘窗保留 · 坐席冲突未解决';$('#desk').textContent='前段267×65cm；窗台处总深126cm';$('#bookcase').textContent='两端46×25×36cm低书架；中间留空103cm';$('aside:last-child .hint').textContent='窗台55cm、桌高75cm为模型假设。原台体上做找平支撑，窗台下不挖空，不固定到窗框。窗扇、清洁、支撑承载待核；最深126cm不能当普通65cm桌面使用。';}else if(['baydetail','roomstyle'].includes(view))view='whole';
 if(d.id==='footdesk'){
  document.title='尺寸试排 · 南床头与北端窗桌';$('h1').textContent='南床头 · 北端窗桌试排';
  document.querySelector('header small').textContent='1.5×2米床不变 · 原门窗保留 · 不是施工定稿';
  $('#bookcase').textContent='仅飘窗南端低书架46×25cm；北端不加柜';
  $('#condition').textContent='接近路径通过；入座转身、窗中视野未通过验收';
  $('aside:last-child .hint').textContent='主体3.50×2.71m为当前图纸模型，非现场复尺。55cm紧凑椅未选实物；座位在窗洞边缘。仅指定柜前站位可达，衣柜内部取物、入座转身、开窗与空调均待核。';
 }
 const u=new URL(location.href);u.searchParams.set('scheme',id);history.replaceState(null,'',u);applyJoineryPalette();build();setView(view);
}
function setView(v){view=v;canvas.hidden=v==='plan';svg.toggleAttribute('hidden',v!=='plan');document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
 for(const name of ['bed','wardrobe','continuous-headboard-feature','integrated-head-storage','unresolved-window-seat'])furniture.children.filter(o=>o.name===name).forEach(o=>o.visible=!(d.bayJoin&&v==='baydetail'));
 if(v==='joinery'){$('#note').textContent='柜桌正面观察视点：转角直接接出连续台面，整组柜体统一；不是行走视点。';}if(v==='connection'){$('#note').textContent='转角台面近看：直接沿北墙延伸，不加包框或独立桌腿。隐藏支撑与固定待深化。';}
 if(d.id==='baywardrobe'&&['joinery','connection'].includes(v))$('#note').textContent='双柜＋飘窗借位书桌试排｜门关、椅收时可到窗侧；桌下原窗台不拆，脚部深度有限。';
 if(v==='entry'){doorOpen=true;doorAngle=90;$('#door').checked=true;updateState();}
 const cams={connection:[[15.70,1.50,6.15],[14.90,1.25,4.77],55],joinery:[[15.77,1.40,7.65],[15.77,1.40,4.48],62],whole:[[12.8,6.3,10.1],[16,.65,5.8],43],entry:[[14.02,1.6,6.12],[17.1,.9,5.25],72],window:[[16.6,1.65,6.9],[17.8,1.05,5.6],66],bed:[[17.1,1.7,6.9],[15.8,1.1,4.85],70]};
 if(['wallbed','ward180'].includes(d.id)){
  cams.entry=[[14.02,1.6,6.12],[16.8,1.2,6.12],65];
  cams.bed=[[14.6,1.65,5.75],[16.6,.95,4.95],66];
  cams.window=[[15.65,1.65,6.8],[17.6,1.1,5.5],66];
 }
 if(d.id==='cabinetwall'){
  cams.entry=[[14.10,1.6,6.10],[16.3,1.0,5.50],65];
  cams.bed=[[16.50,1.65,4.70],[15.25,1.10,6.99],66];
  cams.window=[[15.8,1.65,6.30],[17.7,1.15,5.5],60];
 }
 if(d.id==='lwallstudy'){
  cams.entry=[[14.05,1.60,6.12],[15.60,1.12,4.78],62];
  cams.bed=[[15.64,1.60,6.20],[14.86,1.27,4.80],60];
  cams.window=[[15.65,1.65,6.83],[17.5,1.1,5.65],62];
 }
 if(d.id==='southbedwall'){
  cams.entry=[[14.05,1.6,6.12],[16.05,1.15,5.00],65];
  cams.bed=[[15.20,1.65,6.50],[16.12,1.35,4.60],62];
  cams.window=[[15.20,1.65,6.25],[17.6,1.05,5.80],62];
 }
 if(d.id==='baywardrobe'){
  cams.joinery=[[15.85,1.7,7.65],[15.95,1.25,4.80],65];
  cams.connection=[[16.0,1.65,6.87],[17.25,.95,5.65],64];
  cams.window=cams.connection;
  cams.bed=[[16.88,1.65,6.72],[15.6,1.15,4.72],65];
 }
 if(d.id==='studyfirst'){
  cams.joinery=[[14.48,1.65,6.85],[17.20,1.05,5.80],64];
  cams.connection=[[15.38,1.55,6.68],[17.12,.98,5.72],64];
  cams.entry=[[14.08,1.65,6.10],[17.05,1.0,5.75],66];
  cams.window=[[15.50,1.60,6.90],[17.28,1.02,5.72],66];
  cams.bed=[[15.55,1.70,6.66],[14.65,.95,4.68],60];
  $('#note').textContent='前期书房：267×70cm窗边长桌＋少量活动收纳；窗台不拆，后期改儿童房需重新排布。';
 }
 if(d.wallBed){
  cams.joinery=[[14.63,1.65,5.72],[16.43,1.15,6.30],68];cams.connection=[[14.70,1.65,5.60],[15.95,1.25,6.88],64];cams.bed=cams.connection;
  cams.window=[[15.0,1.65,6.3],[17.15,1.0,5.6],65];
  $('#note').textContent=wallBedOpen?'床已展开：办公椅已在模拟中移出；机构、锚固和锁止需厂家确认。':'柜子和床现在一起做；展开翻床前需移出办公椅。';
 }
 if(d.desk.fixedWindow){
  cams.joinery=[[14.85,1.70,6.75],[16.35,1.02,5.12],68];
  cams.connection=[[15.25,1.55,6.90],[17.12,.94,5.55],65];
  cams.window=cams.connection;cams.bed=[[15.30,1.65,6.95],[16.15,1.10,4.65],66];
  $('#note').textContent='北侧实墙床头与悬空窗桌：先关门，再从床尾63cm处绕行；桌深65cm，支撑待深化。';
 }
 if(d.bayJoin){cams.baydetail=[[15.88,1.72,6.10],[17.50,.84,5.60],58];$('#note').textContent=v==='baydetail'?'仅看桌窗节点：床柜暂时隐藏；原窗台实体保留。全房坐席与床冲突，尚不可用。':'红色框＝期望窗前坐席，与床冲突。点“桌窗节点”单独看台面衔接。';}
 if(d.theme==='monochrome'){cams.roomstyle=[[13.90,2.50,8.00],[16.15,1.02,5.58],60];if(v==='roomstyle')$('#note').textContent='黑白全房风格试样：床、衣柜和窗桌均显示。红框为窗前坐席冲突，布局尚不可用。';}
 if(d.id==='footdesk'){
  cams.whole=cams.roomstyle=[[13.90,4.80,8.40],[16.0,.70,5.8],48];
  cams.entry=[[14.06,1.60,6.12],[16.00,.95,5.35],68];
  cams.bed=[[15.0,1.65,5.40],[16.1,.95,6.90],65];
  cams.window=[[16.575,1.18,4.81],[18.05,1.18,5.15],60];
  cams.connection=[[15.60,1.70,5.30],[17.30,.95,4.95],60];cams.joinery=cams.bed;
  $('#note').textContent=v==='baydetail'?'桌窗节点单独观察，床柜已隐藏；不代表全房宽敞。':'尺寸试排：床尾65cm，紧凑椅55cm。座位偏窗洞北端；入座转身待核，不能同时从椅后通行。';
 }
 if(cams[v]){controls.enableDamping=false;controls.update();const[p,t,f]=cams[v];camera.position.fromArray(p);controls.target.fromArray(t);camera.fov=f;if(['whole','joinery','roomstyle'].includes(v)&&host.clientHeight>host.clientWidth)camera.position.sub(controls.target).multiplyScalar(Math.min(1.8,host.clientHeight/host.clientWidth)).add(controls.target);controls.update();controls.enableDamping=true;}
 resize();drawPlan();
}
function resize(){renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(host);
options.forEach(o=>{const b=document.createElement('button');b.className='choice';b.dataset.choice=o.id;b.append(document.createTextNode(o.name));const s=document.createElement('small');s.textContent=o.category;b.append(s);b.onclick=()=>choose(o.id);$('#choices').append(b);});
$('#wallbed-open').onchange=e=>{wallBedOpen=e.target.checked;updateState();setView(wallBedOpen?'whole':'joinery');};
$('#ward-open').onchange=updateState;$('#bed-drawers').onchange=updateState;$('#desk-drawer').onchange=updateState;
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));$('#door').onchange=e=>{doorOpen=e.target.checked;doorAngle=doorOpen?90:0;updateState();};$('#door-angle').oninput=e=>{doorAngle=+e.target.value;doorOpen=doorAngle===90;$('#door').checked=doorOpen;updateState();};$('#chair').onchange=e=>{chairState=+e.target.value;if(chairState)$('#drawer').checked=false;updateState();};$('#drawer').onchange=e=>{if(e.target.checked){chairState=0;$('#chair').value='0';}updateState();$('#note').textContent='看抽屉时自动收椅，避免椅子后拉与抽屉同时占位。';};$('#section').onchange=e=>upperShell.forEach(o=>o.visible=!e.target.checked);
try{model=(await new GLTFLoader().loadAsync('./offline-render/current-design-v2.glb')).scene;scene.add(model);model.updateMatrixWorld(true);
 for(const name of ['bed3-bed','bed3-wardrobe','bed3-desk','bed3-desk-everyday','bed3-chair','bed3-air-conditioner','door-bed3-single']){const o=model.getObjectByName(name);if(o)o.visible=false;}
 model.traverse(o=>{if(o.isLight)o.visible=false;if(!o.isMesh)return;const bb=new T.Box3().setFromObject(o);if(bb.min.y>2.2){upperShell.push(o);o.visible=false;}let p=o,wall=false;while(p){if(/^wall-\d/.test(p.name))wall=true;p=p.parent;}if(wall){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();for(const m of Array.isArray(o.material)?o.material:[o.material]){m.transparent=true;m.opacity=.30;m.roughness=.9;}}});
 renderer.clippingPlanes=[new T.Plane(new T.Vector3(1,0,0),-13.84),new T.Plane(new T.Vector3(-1,0,0),18.25),new T.Plane(new T.Vector3(0,0,1),-4.33),new T.Plane(new T.Vector3(0,0,-1),7.30)];
 choose(d.id);$('#busy').hidden=true;new RGBELoader().load('./assets/lake.hdr',t=>{t.mapping=T.EquirectangularReflectionMapping;scene.environment=t;scene.environmentIntensity=.35;});
}catch(e){$('#busy').textContent='载入失败：'+e.message;console.error(e);}
renderer.setAnimationLoop(()=>{controls.update();if(!canvas.hidden)renderer.render(scene,camera);});
