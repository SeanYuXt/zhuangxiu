import * as T from './vendor/three.module.js';

// A distinct 58 candidate. The 57 shared-wet-zone layout remains available.
export function mountSeparateShower({scene,s,group,box,cylinder,M,white,metal,putty,fabric,stone,warm,light,mirror,mirrorMat,mirrors,annotations,label}){
 const b=s.design.bath,h=b.hotelCandidate,p=h.partition,r=b.fixtures.toilet.r,cx=(r[0]+r[2])/2;
 group.name='separate-shower-bath-58';
 box('separate-toilet-cistern',[r[0]+.015,r[1],r[2]-.015,r[1]+.17],.06,.70,white,group,.028);
 box('separate-toilet-pedestal',[r[0]+.055,r[1]+.17,r[2]-.055,r[3]-.03],.06,.32,white,group,.055);
 const seat=cylinder(cx,.39,r[1]+.41,.17,.055,white,group);seat.name='separate-toilet-seat';seat.scale.z=1.28;
 const hole=cylinder(cx,.447,r[1]+.42,.112,.003,M('#d1d4cf'),group);hole.scale.z=1.37;
 // One side screen, not the previous full-width cross-room wall.
 const partition=new T.Group();partition.name='independent-shower-screen';group.add(partition);
 box('shower-waterproof-side-screen',p.fixed,0,p.height,stone,partition,.003);
 box('shower-right-jamb',p.jamb,0,p.height,stone,partition,.003);
 box('shower-fold-track',[1.195,1.005,2.045,1.065],2.14,.06,white,partition,.004);
 const foldA=new T.Group(),foldB=new T.Group();foldA.name='shower-fold-panel-a';foldB.name='shower-fold-panel-b';partition.add(foldA,foldB);
 for(const [i,g]of [foldA,foldB].entries())box('opaque-folding-leaf-'+i,[0,0,p.panelWidth-.006,.020],.04,2.095,warm,g,.003);
 box('folding-door-finger-recess',[p.panelWidth-.06,.021,p.panelWidth-.035,.025],.94,.13,metal,foldB,.003);
 for(const y of [.22,1.10,1.96])cylinder(p.door[0],y,p.door[1],.008,.035,metal,partition);
 const cutPlan=new T.Group();cutPlan.name='shower-cut-footprint';group.add(cutPlan);
 box('shower-cut-side',p.fixed,.014,.055,warm,cutPlan);
 box('shower-cut-jamb',p.jamb,.014,.055,warm,cutPlan);
 const ca=new T.Group(),cb=new T.Group();cutPlan.add(ca,cb);
 for(const g of [ca,cb])box('shower-cut-fold',[0,0,p.panelWidth-.006,.02],.014,.055,metal,g,.001);
 const shower=b.fixtures.shower.r;
 box('separate-shower-floor',shower,.002,.004,M('#c9cec8'),group);
 cylinder(2.025,.90,.49,.015,1.08,metal,group);
 box('separate-shower-arm',[1.76,.478,2.025,.50],1.965,.02,metal,group);
 cylinder(1.78,1.945,.49,.105,.018,metal,group);
 box('separate-shower-mixer',[1.99,.42,2.045,.60],1.00,.07,metal,group);
 box('separate-shower-shelf',[1.88,.71,2.045,.94],1.15,.018,metal,group);
 for(const z of [.77,.87])cylinder(1.96,1.17,z,.026,.17,white,group);
 // Leave the narrow side clearance unobstructed; accessories stay to the left of the toilet.
 box('dry-towel-bar',[.115,.32,.14,.67],1.25,.018,metal,group);
 box('dry-hand-towel',[.14,.36,.16,.62],.88,.36,fabric,group);
 box('toilet-paper-covered-holder',[.22,.105,.43,.19],.65,.15,putty,group,.018);
 const task=cylinder(1.60,2.325,.53,.10,.014,light,group);task.name='shower-ceiling-light';
 const clearance=new T.Group();clearance.name='bath-clearance-58';group.add(clearance);
 box('toilet-independent-standing',h.toiletUse,.014,.005,new T.MeshBasicMaterial({color:'#809987',transparent:true,opacity:.25,depthWrite:false}),clearance);
 box('wash-independent-standing',h.standing,.015,.005,new T.MeshBasicMaterial({color:'#b69d74',transparent:true,opacity:.22,depthWrite:false}),clearance);
 label(['bath'],'入口洗漱 · 58 × 40cm侧向盆','不强做L；保留原门洞和围合区',[.88,.85,1.65]);
 label(['bath','bathTop'],'马桶背窗 · 前方独立60 × 60','中心至侧屏约40cm；紧凑尺寸需复尺',[.77,.45,.94]);
 label(['bath'],'只隔淋浴 · 85 × 90cm','不透明门向内折叠；净通行目标约70cm',[1.64,1.72,1.05]);
 label(['bathTop'],'使用包络不再借用淋浴','绿色：马桶；暖色：洗漱；可勾选使用空间',[.94,.08,1.16]);
 label(['bathTop'],'马桶移位仍待下水核实','前方至盆柜最近约61cm，不按宽敞卫浴承诺',[.77,.76,.38]);
 function setFold(a,g1,g2){const c=Math.cos(a),v=Math.sin(a);g1.position.set(p.door[0],0,p.door[1]);g1.rotation.y=a;g2.position.set(p.door[0]+p.panelWidth*c,0,p.door[1]-p.panelWidth*v);g2.rotation.y=-a;}
 return {group,partition,mirrors,annotations,foldA,foldB,update({closed,mirrorInside,view,routes}){
  const a=closed?0:p.openAngle*Math.PI/180;setFold(a,foldA,foldB);setFold(a,ca,cb);
  mirror.visible=!mirrorInside;partition.visible=!['bathTop','top'].includes(view);cutPlan.visible=!partition.visible;clearance.visible=routes;
  task.visible=!['bathTop','top'].includes(view);
 },setMirrorEnvironment(map){mirrorMat.envMap=map;mirrorMat.envMapIntensity=.6;mirrorMat.needsUpdate=true;}};
}
