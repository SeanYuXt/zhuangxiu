import {balconyLayout as s} from './balcony-layout-spec.js?v=balcony-right-utility-3';
import {livingRevision as living} from './design-spec.js?v=fridge-layout-2';
const svg=document.querySelector('#design'),ns='http://www.w3.org/2000/svg';let view='elevation',loaded=false;
const mm=v=>Math.round(v*1000);
function add(tag,a,text){const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(a))e.setAttribute(k,v);if(text)e.textContent=text;svg.append(e);return e;}
const rect=(x,y,w,h,fill,stroke='#8d9685',dash='')=>add('rect',{x,y,width:w,height:h,fill,stroke,'stroke-width':.008,'stroke-dasharray':dash});
const line=(x1,y1,x2,y2,color='#8b9583',dash='')=>add('line',{x1,y1,x2,y2,stroke:color,'stroke-width':.012,'stroke-dasharray':dash});
const text=(x,y,t,size=.10,color='#394b3c')=>add('text',{x,y,'font-size':size,fill:color,'text-anchor':'middle'},t);
function elevation(){
 svg.setAttribute('viewBox','-.15 -.30 3.80 3.62');const origin=s.shell.glassInnerZ,y=h=>2.8-h,wx=s.washer.position[2]-s.washer.width/2-origin,sx=s.wet.position[2]-s.wet.width/2-origin,tx=s.cleaningRack.position[2]-s.cleaningRack.bayWidth/2-origin,dx=s.transition.displayStartZ-origin;
 line(0,2.8,3.5,2.8);line(0,0,3.5,0);text(1.7,-.15,'阳台原顶面保留 · 横梁仅在原窗上方',.105);
 for(const [x,w] of [[sx,s.wet.width],[wx,s.washer.width]]){rect(x,y(s.upper.top),w,s.upper.top-s.upper.bottom,'#d8ddd0');line(x+w/2,y(s.upper.top),x+w/2,y(s.upper.bottom));text(x+w/2,.49,'上柜',.092);}
 rect(wx,y(s.upper.bottom),s.washer.width,s.upper.bottom,'#dcded2');
 for(const by of [.065,.935]){rect(wx+(s.washer.width-s.washer.body[0])/2,y(by+s.washer.body[1]),s.washer.body[0],s.washer.body[1],'#f4f4ef');add('circle',{cx:wx+s.washer.width/2,cy:y(by+.391),r:.21,fill:'#526366',stroke:'#a6ada7','stroke-width':.025});}
 rect(sx,y(s.wet.top),s.wet.width,s.wet.top,'#e1e3d7');rect(sx+.018,y(.26),s.wet.width-.036,.26,'#56635b');
 rect(sx+(s.wet.width-s.robot.width)/2,y(s.robot.height),s.robot.width,s.robot.height,'none','#718875','.025 .018');text(sx+s.wet.width/2,y(.13),'扫地机口',.070,'#fff');text(sx+s.wet.width/2,y(.46),'基站在盆下',.068);
 line(sx+s.wet.width/2,y(.90),sx+s.wet.width/2,y(1.16));line(sx+s.wet.width/2,y(1.16),sx+s.wet.width/2+.1,y(1.16));text(sx+s.wet.width/2,y(1.40),'洗衣盆',.085);
 rect(tx,y(s.cleaningRack.height),s.cleaningRack.bayWidth,s.cleaningRack.height,'#b4bea9');line(tx+.035,y(.35),tx+.035,y(2.15));line(tx+.10,y(.35),tx+.10,y(1.95));
 rect(dx,y(.478),s.transition.displayWidth,.458,'#ddd9cd');rect(dx,y(s.transition.displayTop),s.transition.displayWidth,s.transition.displayTop-.483,'#bbaa90');for(const h of [.501,1.12,1.74,2.37])line(dx,y(h),dx+.8,y(h),'#eee8d9');line(dx+.4,y(.50),dx+.4,y(2.36),'#958a73');text(dx+.4,y(1.4),'独立展示柜',.088,'#fffdf7');
 rect(dx+.804,y(.478),1.0,.302,'#ddd9cd');rect(dx+.96,y(1.97),1.03,1.059,'#394e45');text(dx+1.35,y(1.4),'电视',.1,'#f7f2e6');
 rect(s.beam.centreZ-s.beam.depth/2-origin,0,s.beam.depth,s.beam.top-s.beam.bottom,'#b5b7ac');text(s.beam.centreZ-origin,.18,'原窗梁',.076);
 for(const [x,w,label] of [[sx,s.wet.width,'盆柜'],[wx,s.washer.width,'洗烘'],[tx,s.cleaningRack.bayWidth,'长物'],[dx,.8,'展示']]){line(x,2.95,x+w,2.95);text(x+w/2,3.08,String(mm(w)),.087);text(x+w/2,3.20,label,.078);}
 document.querySelector('#caption').textContent='右侧沿墙从窗边起：550mm盆柜（下放上下水基站）＋660mm洗烘＋180mm长物挂架，共1390mm，两端各预留30mm。独立展示柜在客厅侧；电视低柜到展示侧板结束。';
}
function plan(){
 svg.setAttribute('viewBox','5.35 -.38 7.15 3.60');const [cx,,cz]=s.shell.column;
 rect(s.shell.left,.1,s.shell.right-s.shell.left,2.8,'#f0eee4','#cbcdbf');rect(5.76,.1,.12,1.7,'#aeb5a4');rect(12.04,.74,.2,2.2,'#aeb5a4');line(s.shell.left,.2,s.shell.right,.2,'#7bafb0');text(8.92,-.12,'湖景玻璃 / 护栏保留',.14);
 rect(cx-.2,cz-.225,.4,.45,'#78846d');rect(s.shell.left,cz-.2,s.shell.right-s.shell.left,.4,'none','#7c8670','.06 .04');text(cx,cz+.045,'柱',.14,'#fff');
 for(const sign of [-1,1]){const length=living.wingLengths[sign<0?'left':'right'],x=cx+sign*(.22+length/2);rect(x-length/2,cz+living.barOffsetZ-living.barDepth/2,length,living.barDepth,'#ddcfb7');text(x,cz+.06,sign<0?'休闲娱乐':'洗护叠衣',.12);for(const seat of [-.325,.325])add('circle',{cx:x+seat,cy:cz+.385,r:.21,fill:'#bbc4b6',stroke:'#87947f','stroke-width':.008});}
 for(const [spec,label,color] of [[s.wet,'盆＋基站','#d9dfcd'],[s.washer,'洗烘','#c0cdb9']]){rect(spec.position[0]-spec.depth/2,spec.position[2]-spec.width/2,spec.depth,spec.width,color);text(spec.position[0],spec.position[2]+.04,label,.11);}
 const rack=s.cleaningRack;rect(rack.position[0]-rack.depth/2,rack.position[2]-rack.bayWidth/2,rack.depth,rack.bayWidth,'#b4bea9');text(10.98,rack.position[2]+.04,'抽拉长物',.105);
 rect(11.48,s.transition.displayStartZ,.39,.8,'#c8b591');text(11.12,2.27,'展示',.11);rect(11.48,2.56,.39,.38,'#c8b591');
 text(6.70,.65,'左侧清空',.14);text(6.70,.91,'休闲 / 娱乐',.13);
 for(const dz of [-s.drying.railSpacing/2,s.drying.railSpacing/2])line(s.drying.position[0]-1,s.drying.position[2]+dz,s.drying.position[0]+1,s.drying.position[2]+dz,'#849e9c');text(s.drying.position[0],.78,'2m双杆',.12);
 if(loaded)for(let row=0;row<2;row++)for(let i=0;i<6;i++)rect(s.drying.position[0]-.79+i*.30,.73+(row-.5)*.44-.215,.08,.43,'#b6c6ba88','#829d87');
 line(7.12,.20,7.12,cz-.225);line(7.06,.20,7.18,.20);line(7.06,cz-.225,7.18,cz-.225);text(7.32,1.15,String(mm(s.shell.clearDepth)),.13);text(7.32,1.34,'净进深',.10);text(8.96,2.94,'客厅侧 · 柱、梁保留，原内侧玻璃拆除',.14);
 document.querySelector('#caption').textContent='1450mm是栏杆内侧到柱外侧。左侧无卫生柜；洗衣、清洁工具与上下水基站全部集中右侧。晾衣时会遮挡右半边部分湖景；虚线是局部横梁投影。';
}
function render(){svg.replaceChildren();view==='plan'?plan():elevation();document.querySelector('#loaded').hidden=view!=='plan';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;render();});document.querySelector('#loaded').onclick=e=>{loaded=!loaded;e.target.setAttribute('aria-pressed',String(loaded));e.target.textContent=loaded?'收起晾衣范围':'显示晾衣范围';render();};render();
