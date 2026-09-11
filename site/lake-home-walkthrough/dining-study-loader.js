import {installDiningStudy} from './dining-table-study.js';
async function start(){
 const deadline=Date.now()+60000;
 while(!window.columnCheck){if(Date.now()>deadline)throw Error('The retained model did not finish loading');await new Promise(resolve=>setTimeout(resolve,100));}
 const d=columnViewDebug,m=d.dryStudy.model;
 const changed=()=>{window.dispatchEvent(new Event('resize'));if(d.state.targets[d.state.station])d.visit(d.state.station);};
 window.diningStudy=installDiningStudy(m,changed);
 const style=document.createElement('style');style.textContent='header,main>aside,#viewport>:not(#view3d):not(#busy),dialog{display:none!important}html,body,main,#viewport{margin:0!important;padding:0!important;width:100%!important;height:100dvh!important;border:0!important;border-radius:0!important}main{display:block!important;grid-template-columns:1fr!important}';document.head.append(style);
 window.studyView=id=>{const views={ensemble:{position:[8.94,1.65,6.10],look:[6.18,1.08,3.56]},kitchen:{position:[8.70,1.6,3.88],look:[6.05,1.11,3.59]},coffee:{position:[9.17,1.52,5.40],look:[8.98,1.27,6.96]},table:{position:[6.48,1.65,3.35],look:[8.78,.92,6.05]},storage:{position:[8.60,1.50,5.82],look:[8.65,.55,6.92]},sideboard:{position:[8.8,1.6,4.0],look:[10.03,1.18,6.96]},fridge:{position:[6.60,1.6,5.91],look:[5.18,1.20,6.88]},rice:{position:[5.30,1.60,4.65],look:[4.03,1.08,4.30]}};d.state.targets.fridge={name:'厨房门侧取消柜体 · 原餐桌与现有餐边柜',...structuredClone(views[id]||views.ensemble)};d.visit('fridge');};
 window.studyView('ensemble');
 if(['17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'].includes(new URLSearchParams(location.search).get('wallStudy'))){
  const {installWholeWall}=await import('./entry-whole-wall.js');window.wholeWall=installWholeWall(m);
  window.wallView=id=>{d.state.targets.fridge={name:'入户整墙 · 餐区饮水与收纳试排',...structuredClone(window.wholeWall.spec.views[id]||window.wholeWall.spec.views.ensemble)};d.visit('fridge');};
  window.wallView('ensemble');window.parent.postMessage({type:'whole-wall-ready'},location.origin);
 }
 window.parent.postMessage({type:'dining-study-ready'},location.origin);
}
start().catch(error=>{console.error(error);window.parent.postMessage({type:'dining-study-error',message:error.message},location.origin);});
