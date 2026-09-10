import * as T from './vendor/three.module.js';
import {P} from './plan.js';
import {designWalls as walls} from './balcony-side-infill.js';
import {livingRevision as spec} from './design-spec.js';
import {wireSeatUse} from './living-seat-use.js';

// All dimensions below are read from the displayed mesh, not a second floor plan.
export function wireLivingLayout(model,onChange=()=>{}){
 const box=name=>new T.Box3().setFromObject(model.getObjectByName(name));
 const sofa=box('linen-sofa'),island=box('stone-island'),rug=box('living-area-rug'),screen=box('85-inch-screen');
 const left=box('lake-bar-left').clone(),right=box('lake-bar-right').clone();
 // Stools/decor extend outside the tabletop, so measure the surface only.
 left.setFromObject(model.getObjectByName('lake-bar-left').children[0]);right.setFromObject(model.getObjectByName('lake-bar-right').children[0]);
 const laundry=box('balcony-laundry-cabinet'),coffee=box('slim-coffee-table'),care=box('balcony-care-cabinet');
 const kitchenWall=walls.find(w=>(w.open||[]).some(o=>o.id==='kitchen'));
 const door=kitchenWall.open.find(o=>o.id==='kitchen'),wallX=P(kitchenWall.a)[0]+(kitchenWall.t||20)/200;
 const eye=new T.Vector3(...spec.viewing.eye),center=screen.getCenter(new T.Vector3()),normalDistance=screen.min.x-eye.x;
 const horizontalAngle=(Math.atan((screen.max.z-eye.z)/normalDistance)-Math.atan((screen.min.z-eye.z)/normalDistance))*180/Math.PI;
 const metrics={revision:spec.id,wingLengths:[left.max.x-left.min.x,right.max.x-right.min.x],islandToSofa:sofa.min.x-island.max.x,islandToKitchenWall:island.min.x-wallX,kitchenOpening:door.w/100,rightWingToLaundry:laundry.min.x-right.max.x,sofaToCoffee:coffee.min.x-sofa.max.x,rugSize:[rug.max.x-rug.min.x,rug.max.z-rug.min.z],screenNormalDistance:normalDistance,eyeToScreenCenter:eye.distanceTo(center),horizontalAngle,eye:eye.toArray()};
 const seats=model.getObjectByName('lake-bar-right').children.filter(o=>o.name.startsWith('upholstered-counter-stool'));
 const seatCenter=new T.Box3().setFromObject(seats[0]).getCenter(new T.Vector3());
 Object.assign(metrics,{careToLeftWing:left.min.x-care.max.x,careToFridge:box('integrated-fridge').min.z-care.max.z,barDepth:right.max.z-right.min.z,glassToTable:left.min.z-.1,occupiedSeatToSofa:sofa.min.z-(seatCenter.z+.45+.325)});
 const washer=box('laundry-washer'),washerCenterZ=(washer.min.z+washer.max.z)/2;
 Object.assign(metrics,{laundryOffsetZ:spec.laundryOffsetZ,laundryToFrontGlass:laundry.min.z-.1,washerCenterZ,washerCenterToTableBack:right.min.z-washerCenterZ});
 const dialog=document.createElement('dialog');dialog.id='livingLayout';dialog.style.cssText='width:min(920px,94vw);max-height:90dvh;overflow:auto;border:1px solid #ccc8bb;border-radius:16px;background:#faf8f2;color:#3c4037;padding:16px';
 dialog.innerHTML='<form method="dialog" style="display:flex;justify-content:space-between;gap:12px"><strong>横厅布局 · 当前模型尺寸</strong><button>关闭 ×</button></form><svg viewBox="5.6 0 6.8 7.5" style="width:100%;max-height:58dvh" role="img" aria-label="双翼、沙发、岛台、厨房开口及地毯尺寸"></svg><div class="layout-metrics"></div>';
 document.body.append(dialog);const svg=dialog.querySelector('svg'),ns='http://www.w3.org/2000/svg';
 const el=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;svg.append(e);return e;};
 const label=(x,z,text,color='#3c4037',size=.145)=>el('text',{x,y:z,'text-anchor':'middle','font-size':size,fill:color},text);
 const rect=(b,fill,name)=>{el('rect',{x:b.min.x,y:b.min.z,width:b.max.x-b.min.x,height:b.max.z-b.min.z,fill,stroke:'#8c9184','stroke-width':.013,rx:.025});if(name)label((b.min.x+b.max.x)/2,(b.min.z+b.max.z)/2,name);};
 rect(rug,'#ded4c4');label(10.35,5.68,'地毯 2.2 × 3.2 m');
 for(const w of walls){const a=P(w.a),b=P(w.b);if(Math.min(a[0],b[0])<5.6||Math.max(a[0],b[0])>12.4)continue;const len=Math.hypot(b[0]-a[0],b[1]-a[1]);let start=0;const line=(s,e)=>{if(e>s)el('line',{x1:a[0]+(b[0]-a[0])*s/len,y1:a[1]+(b[1]-a[1])*s/len,x2:a[0]+(b[0]-a[0])*e/len,y2:a[1]+(b[1]-a[1])*e/len,stroke:w.glass?'#8ab1b1':'#777c70','stroke-width':w.glass?.03:(w.t||20)/100});};for(const o of [...(w.open||[])].sort((a,b)=>a.at-b.at)){line(start,o.at/100);start=(o.at+o.w)/100;}line(start,len);}
 for(const [b,c,n] of [[left,'#e5dece',''],[right,'#e5dece',''],[box('bar-service-cover'),'#b3a38b','柱'],[sofa,'#c6c0b2','沙发 '+spec.sofa.length+' m'],[island,'#eee8dc','岛台 1.8 × 0.9'],[coffee,'#dedbd0','茶几'],[laundry,'#cccfc6','洗烘'],[box('integrated-fridge'),'#cccfc6','冰箱'],[box('flush-sideboard'),'#d6ccbb','餐边柜'],[box('tv-low-console'),'#d6ccbb','']])rect(b,c,n);
 rect(care,'#d9d3c5');label(6.20,.74,'台盆',undefined,.12);label(6.20,1.18,'扫地机',undefined,.12);
 rect(box('bar-laptop-workplace'),'#83938d','办公');rect(box('bar-tea-zone'),'#b4a28a','茶席');
 label((left.min.x+left.max.x)/2,left.min.z-.12,'左翼 1.3 m');label((right.min.x+right.max.x)/2,right.min.z-.12,'右翼 1.3 m');
 el('rect',{x:laundry.min.x,y:laundry.min.z-spec.laundryOffsetZ,width:laundry.max.x-laundry.min.x,height:laundry.max.z-laundry.min.z,fill:'none',stroke:'#9e9181','stroke-width':.015,'stroke-dasharray':'.06 .04'});
 label(11.69,2.05,'虚线：原洗烘位置','#8d704c',.115);
 el('line',{x1:laundry.min.x,y1:washerCenterZ,x2:laundry.min.x-.46,y2:washerCenterZ,stroke:'#916c44','stroke-width':.025});
 label(10.80,.34,'机门中心线','#8d704c',.115);
 label(8.98,2.15,'同色包柱','#587365',.13);
 const dimension=(x1,x2,z,text)=>{el('line',{x1,x2,y1:z,y2:z,stroke:'#587365','stroke-width':.015});for(const x of [x1,x2])el('line',{x1:x,x2:x,y1:z-.06,y2:z+.06,stroke:'#587365','stroke-width':.015});label((x1+x2)/2,z-.08,text,'#425e4e');};
 dimension(island.max.x,sofa.min.x,3.80,(metrics.islandToSofa*100).toFixed(0)+' cm');
 dimension(wallX,island.min.x,3.80,(metrics.islandToKitchenWall*100).toFixed(0)+' cm');
 dimension(right.max.x,laundry.min.x,1.52,(metrics.rightWingToLaundry*100).toFixed(0)+' cm');
 el('line',{x1:eye.x,y1:eye.z,x2:center.x,y2:center.z,stroke:'#8d704c','stroke-width':.018,'stroke-dasharray':'.06 .035'});el('circle',{cx:eye.x,cy:eye.z,r:.055,fill:'#8d704c'});label(10.6,4.75,'坐姿观影约 '+normalDistance.toFixed(2)+' m');label(9,.44,'湖景玻璃 · 原护栏线');label(6.15,4.65,'厨房开口');
 dialog.querySelector('.layout-metrics').innerHTML=`<p>双翼各 ${Math.round(spec.wingLengths.left*100)} cm、每侧两席（座位中心距65cm）；沙发—岛台净宽 ${Math.round(metrics.islandToSofa*100)} cm；岛台—厨房开口所在墙完成面约 ${Math.round(metrics.islandToKitchenWall*100)} cm（不是门洞宽，当前模型门洞 ${Math.round(metrics.kitchenOpening*100)} cm）。</p><p>坐姿眼位至屏幕平面约 ${normalDistance.toFixed(2)} m，水平视角约 ${horizontalAngle.toFixed(0)}°。眼高暂按 1.08 m，偏沉浸的 85 寸 4K 观看方案；不是唯一最佳距离。沙发—茶几约 ${Math.round(metrics.sofaToCoffee*100)} cm。</p><p>浅米灰细织短绒地毯 220 × 320 cm，长边沿沙发；压住沙发前部，覆盖茶几，避开餐岛主通道。防滑底、扫地机爬毯与成品尺寸待选型。</p><p>洗烘柜与右翼桌端横向约 ${Math.round(metrics.rightWingToLaundry*100)} cm，但前移后的机门区与桌深错位，不能只看这一个横向数值。开门侧邻近站位的简化代理找到通路，不等于弯腰取衣、完整开门扫掠和检修已验收。原房门、柱位保留；给排水走向未设计。</p>`;
 const button=document.createElement('button');button.id='livingLayoutToggle';button.textContent='横厅尺寸';button.onclick=()=>dialog.showModal();document.querySelector('header nav').append(button);
 const action=document.createElement('button');action.id='islandDrawerDemo';action.textContent='打开一只岛台抽屉（示意）';action.setAttribute('aria-pressed','false');
 const drawer=model.getObjectByName('island-drawer-0');let drawerOpen=false;
 const setDrawer=open=>{drawerOpen=open;drawer.position.x=open?-spec.island.drawerTravel:0;drawer.updateMatrixWorld(true);action.textContent=open?'收回抽屉':'打开一只岛台抽屉（示意）';action.setAttribute('aria-pressed',String(open));onChange();};
 action.onclick=()=>{setDrawer(!drawerOpen);dialog.close();onChange({focusDrawer:true});};dialog.append(action);
 const drawerNote=document.createElement('p');drawerNote.textContent=`厨房侧静态${Math.round(metrics.islandToKitchenWall*100)}cm；抽屉伸出${spec.island.drawerTravel*100}cm后，局部余宽约${Math.round((metrics.islandToKitchenWall-spec.island.drawerTravel)*100)}cm，未扣除使用者，不能作为双人通道。打开后关闭面板查看，重新进入本面板可收回。`;dialog.append(drawerNote);
 const seatNote=document.createElement('p');seatNote.textContent=`双翼固定各130cm、桌深${Math.round(metrics.barDepth*100)}cm，包柱深50cm，前后各超出3cm；玻璃至桌后沿约${Math.round(metrics.glassToTable*100)}cm。四把吧椅试用低靠背旋转座面，座高约70cm、坐面约42cm，起身转90°、椅脚留原位；不是缩小坐面。岛台两席面朝厨房，膝部38cm，厨房面六抽。逐席起身会显示椅子保留后的600mm站位和路线；原全部后拖45cm压力状态仍保留，不能把这时内侧约${Math.round(metrics.occupiedSeatToSofa*100)}cm当通道。旋转回位、防夹、稳定和承重需选定成品核实。`;dialog.append(seatNote);
 const powerNote=document.createElement('p');powerNote.textContent='左办公、右泡茶；浅暖灰包柱，去掉明装板；桌面同色翻盖电源盒经饰面背后和桌下检修槽预留，不凿承重柱、不跨地面走线。USB-C PD 65–100W是选型目标；烧水器具不串接办公排插。供电起点、同时负载、回路/线径、接地、漏电保护及防溅由电气设计和机型核定，图中未接电。';dialog.append(powerNote);
 const sideNote=document.createElement('p');sideNote.textContent=`正面湖景玻璃保留；左右侧按120mm实体墙占位，原图窗洞证据保留。按用户提出的方向，洗烘柜沿右墙朝玻璃前移${Math.round(-spec.laundryOffsetZ*100)}cm：柜侧至正面玻璃线约${Math.round(metrics.laundryToFrontGlass*100)}cm，机门中心比桌后沿更靠玻璃约${Math.round(metrics.washerCenterToTableBack*100)}cm，不再只用横向82cm判断使用。虚线是原柜位；墙材、承载、给排水、机门及检修仍待现场与机型核实。`;dialog.append(sideNote);
 const careNote=document.createElement('p');careNote.textContent=`另一侧低柜130×60cm，台面高90cm：65cm台盆/湿仓＋65cm独立扫地机仓，浅吊柜22cm。柜前到左翼桌端模型净距${Math.round(metrics.careToLeftWing*100)}cm，柜端到冰箱约${Math.round(metrics.careToFridge*100)}cm；台盆存水弯与机器分仓。机器人为通用占位，实际检修开盖、供排水、插座与防水待机型和现场核定，不能据此下单。`;dialog.append(careNote);
 const seatsUse=wireSeatUse(model,dialog,svg,onChange);
 window.livingLayoutDebug={metrics,seatsUse,open:()=>dialog.showModal(),setDrawer,get drawerOpen(){return drawerOpen;}};
}
