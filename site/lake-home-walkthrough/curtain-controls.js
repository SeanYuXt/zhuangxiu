import * as T from './vendor/three.module.js';
export function wireCurtainControls({design,host,state,focus,changed}){
 const css=document.createElement('link');css.rel='stylesheet';css.href='./curtain-controls.css';document.head.append(css);
 const names={living:'湖景窗',bed1:'老人房',master:'主卧',bed3:'儿童房'};
 const positions={living:[7.25,1.6,3.05],bed1:[2.60,1.6,3.10],master:[16.50,1.6,2.35],bed3:[16.45,1.6,6.15]};
 const button=document.createElement('button');button.id='curtainToggle';button.textContent='窗帘';document.querySelector('header nav').append(button);
 const panel=document.createElement('section');panel.id='curtainPanel';panel.hidden=true;panel.setAttribute('aria-label','窗帘开合');
 panel.innerHTML='<div><label>窗帘 <select id="curtainRoom"></select></label><button id="curtainClose">关闭</button></div><label for="curtainAmount">拉合程度 <output id="curtainValue">0%</output></label><input id="curtainAmount" type="range" min="0" max="100" value="0"><div><button data-curtain-pose="0">打开</button><button data-curtain-pose="50">半合</button><button data-curtain-pose="100">拉合</button></div><small>开合预览 · 电机与安装待选型</small>';
 host.append(panel);const select=panel.querySelector('select'),slider=panel.querySelector('input'),output=panel.querySelector('output');let active='living';
 for(const [id,label] of Object.entries(names)){const o=document.createElement('option');o.value=id;o.textContent=label;select.append(o);}
 function render(){const n=Math.round(design.rooms[active].fraction*100);select.value=active;slider.value=n;output.value=n+'%';panel.querySelectorAll('[data-curtain-pose]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.curtainPose)===n)));}
 function locate(){
  const portrait=innerWidth<800&&innerHeight>innerWidth;
  const closePositions={living:[7.45,1.5,1.02],bed1:[2.60,1.5,3.0],master:[16.5,1.5,2.9],bed3:[16.5,1.5,6.1]};
  const leaf=design.rooms[active].leaves[active==='living'?0:1].cloth;leaf.updateWorldMatrix(true,false);
  const look=portrait?new T.Box3().setFromObject(leaf).getCenter(new T.Vector3()).toArray():undefined;
  focus(active,{object:active+'-curtain',label:names[active]+' · 帘布',position:portrait?closePositions[active]:positions[active],look,fov:portrait?68:undefined,note:'连续布面、上部挂点、侧折边与加重下摆；开合改变褶皱而不横向拉伸织纹。竖屏靠近其中一侧查看，可拖动环顾。当前为选型预览，不是电机/电源施工确认。'});
 }
 function open(room){active=names[room]?room:'living';locate();panel.hidden=false;render();}
 button.onclick=()=>open(state().station);select.onchange=()=>open(select.value);
 slider.oninput=()=>{design.set(active,Number(slider.value)/100);render();changed();};
 panel.querySelectorAll('[data-curtain-pose]').forEach(b=>b.onclick=()=>{design.set(active,Number(b.dataset.curtainPose)/100);render();changed();});
 panel.querySelector('#curtainClose').onclick=()=>panel.hidden=true;
 return {open,sync(){if(!panel.hidden&&(state().station!==active||state().mode!=='look'))panel.hidden=true;}};
}
