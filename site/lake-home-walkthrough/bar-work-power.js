import * as T from './vendor/three.module.js';

// Design geometry only. No structural chase, confirmed supply point, or live circuit.
export function addBarWorkPower(model,column,spec){
 const mat=(color,roughness=.6)=>new T.MeshStandardMaterial({color,roughness});
 const warm=mat('#d5cbb9'),metal=mat('#504f48'),black=mat('#242c2b'),light=mat('#e5e3dc'),wood=mat('#b2a087');
 const group=(name,pos)=>{const g=new T.Group();g.name=name;g.position.fromArray(pos);model.add(g);return g;};
 const box=(g,name,x,y,z,w,h,d,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
 const cylinder=(g,x,y,z,r,h,m)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,40),m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o;};
 // Retain the structural mesh. Replace only its previous decorative strips.
 column.children.slice(1).forEach(o=>o.visible=false);
 const finish=spec.columnFinish,cx=column.position.x,cz=column.position.z;
 const halfWidth=spec.columnWidth/2+finish.side;
 const back=cz-spec.columnDepth/2-finish.back,front=cz+spec.columnDepth/2+finish.front;
 const service=group('bar-service-cover',[cx,0,cz]);
 const plaster=mat('#dfdbd2',.84),seam=mat('#9b978c',.80);
 service.userData={structuralChase:false,powered:false,finishOnly:true,finishedWidth:halfWidth*2,finishedDepth:front-back,route:'薄饰面背后独立检修槽，绕柱不凿柱；上游供电、尺寸与电气规格待现场核定'};
 for(const side of [-1,1])box(service,'column-side-finish',side*(halfWidth-.003),1.4,(front+back)/2-cz,.006,2.8,front-back,plaster);
 box(service,'column-lake-finish',0,1.4,back-cz+.003,halfWidth*2,2.8,.006,plaster);
 // A fine vertical access seam replaces the large surface-mounted electrical plaque.
 const join=-.095,gap=.003;
 box(service,'column-front-access',(-halfWidth+join-gap/2)/2,1.4,front-cz-.003,join-gap/2+halfWidth,2.8,.006,plaster);
 box(service,'column-front-main',(join+gap/2+halfWidth)/2,1.4,front-cz-.003,halfWidth-join-gap/2,2.8,.006,plaster);
 box(service,'column-fine-shadow-joint',join,1.4,front-cz-.004,.003,2.8,.002,seam);
 box(service,'concealed-front-riser',join,1.821,front-cz-.018,.012,1.922,.012,metal);
 box(service,'concealed-front-distributor',0,.861,front-cz-.018,spec.columnWidth+.02,.020,.012,metal);
 const controls=[];
 for(const side of ['left','right']){
  const direction=side==='left'?-1:1,bar=model.getObjectByName('lake-bar-'+side);
  const slotX=-direction*.46,slotZ=-.14,topY=.95;
  // Replace the existing top by the same footprint with a real socket-box opening.
  const shape=new T.Shape(),w=spec.wingLengths[side]/2,d=spec.barDepth/2,r=.035;
  shape.moveTo(-w+r,-d);shape.lineTo(w-r,-d);shape.quadraticCurveTo(w,-d,w,-d+r);shape.lineTo(w,d-r);shape.quadraticCurveTo(w,d,w-r,d);shape.lineTo(-w+r,d);shape.quadraticCurveTo(-w,d,-w,d-r);shape.lineTo(-w,-d+r);shape.quadraticCurveTo(-w,-d,-w+r,-d);
  const hole=new T.Path();hole.moveTo(slotX-.104,slotZ-.050);hole.lineTo(slotX-.104,slotZ+.050);hole.lineTo(slotX+.104,slotZ+.050);hole.lineTo(slotX+.104,slotZ-.050);hole.closePath();shape.holes.push(hole);
  const previous=bar.children[0],top=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:false}),mat('#e2ded4',.42));
  top.name='bar-cutout-top-'+side;top.rotation.x=Math.PI/2;top.position.y=topY;top.scale.x=1/bar.scale.x;top.castShadow=top.receiveShadow=true;bar.remove(previous);bar.add(top);bar.children.splice(bar.children.indexOf(top),1);bar.children.unshift(top);
  const panel=group('bar-power-'+side,[bar.position.x+slotX,0,bar.position.z+slotZ]);
  panel.userData={powered:false,productSelected:false,installation:'桌面带盖电源盒候选；无防水等级承诺，开孔、线径、接地、漏保与检修待机型核定',purpose:side==='left'?'办公独立电源与USB-C':'茶区烧水固定电源；不与办公串接'};
  box(panel,'power-box-bottom',0,.885,0,.204,.008,.096,metal);
  for(const x of [-.100,.100])box(panel,'power-box-side',x,.918,0,.005,.058,.096,metal);
  for(const z of [-.045,.045])box(panel,'power-box-end',0,.918,z,.196,.058,.005,metal);
  box(panel,'socket-recess-deck',0,.928,0,.193,.008,.082,metal);
  // One AC socket per box; left also has separate USB-C design ports.
  box(panel,'socket-earth-slot',-.025,.933,-.022,.005,.002,.014,black);
  for(const [x,a] of [[-.046,-.45],[-.006,.45]]){const slot=box(panel,'socket-angle-slot',x,.933,.012,.005,.002,.014,black);slot.rotation.y=a;}
  if(side==='left')for(const z of [-.014,.014])box(panel,'desk-usbc-slot',.06,.933,z,.020,.002,.005,black);
  const lid=new T.Group();lid.name='bar-power-lid-'+side;lid.position.set(0,.952,-.050);panel.add(lid);
  box(lid,'flush-lid-surface',0,0,.050,.206,.004,.098,mat('#c8c2b7',.48));
  box(lid,'lid-finger-line',0,.0025,.094,.060,.001,.002,metal);
  controls.push(lid);
  const cable=group('bar-cable-tray-'+side,[bar.position.x,.861,bar.position.z-.14]);
  box(cable,'tray-base',0,0,0,spec.wingLengths[side]-.08,.012,.055,metal);
  for(const z of [-.025,.025])box(cable,'tray-lip',0,.016,z,spec.wingLengths[side]-.08,.025,.006,metal);
  const runX=cx+direction*(spec.columnWidth/2+.010),runFront=front-.018;
  const branch=group('bar-cable-branch-'+side,[runX,.861,(runFront+panel.position.z)/2]);
  box(branch,'concealed-side-channel',0,0,0,.012,.020,runFront-panel.position.z+.02,metal);
  const trayEnd=bar.position.x-direction*(spec.wingLengths[side]-.08)/2;
  const bridge=group('bar-cable-bridge-'+side,[(trayEnd+runX)/2,.861,panel.position.z]);
  box(bridge,'concealed-tray-bridge',0,0,0,Math.abs(trayEnd-runX)+.006,.020,.012,metal);
  cable.userData={concealedRoute:'桌下检修槽，绕结构柱外侧，非已接线'};
 }
 let open=false;
 window.barPowerDebug={get open(){return open;},setOpen(value){open=value;for(const lid of controls)lid.rotation.x=open?-Math.PI*.56:0;model.updateMatrixWorld(true);}};
 const left=model.getObjectByName('lake-bar-left'),right=model.getObjectByName('lake-bar-right');
 const laptop=group('bar-laptop-workplace',[left.position.x-.325,.956,left.position.z]);
 box(laptop,'laptop-base',0,.007,0,.33,.014,.235,metal);
 box(laptop,'trackpad',0,.015,.056,.10,.001,.055,warm);
 for(let row=0;row<4;row++)for(let col=0;col<11;col++)box(laptop,'key',-.135+col*.027,.015,-.067+row*.024,.021,.002,.018,black);
 const lid=new T.Group();lid.name='laptop-lid';lid.position.set(0,.015,-.112);lid.rotation.x=-.12;laptop.add(lid);
 box(lid,'display-housing',0,.11,0,.33,.22,.01,metal);box(lid,'display',0,.11,.006,.31,.196,.001,mat('#768784'));
 laptop.userData={footprint:[.33,.235],usage:'临时笔记本办公；久坐需适配座椅、脚踏、屏幕高度和外接键鼠'};
 const tea=group('bar-tea-zone',[right.position.x+.22,.956,right.position.z-.035]);
 box(tea,'removable-drip-tray',0,.014,0,.56,.025,.30,wood);
 for(let i=0;i<9;i++)box(tea,'tray-groove',-.24+i*.06,.028,0,.009,.002,.265,metal);
 cylinder(tea,.14,.043,0,.085,.02,metal);cylinder(tea,.14,.145,0,.068,.185,light);cylinder(tea,.14,.242,0,.073,.012,metal);
 const handle=new T.Mesh(new T.TorusGeometry(.055,.009,8,28),metal);handle.position.set(.235,.15,0);handle.rotation.y=Math.PI/2;tea.add(handle);
 const spout=box(tea,'kettle-spout',.062,.184,0,.04,.035,.033,metal);spout.rotation.z=-.35;
 for(const x of [-.19,-.08]){cylinder(tea,x,.060,.04,.036,.058,light);cylinder(tea,x,.090,.04,.029,.002,mat('#856c48'));}
 tea.userData={waterConnection:false,removableTray:true,electricalNote:'取水用独立容器，不接上下水；茶盘、蒸汽和笔记本分区，桌面带盖电源盒与茶盘分开；开盖使用时避开溅水及蒸汽；不是防溅等级认证'};
}
