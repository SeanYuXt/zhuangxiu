export function wireHVACControls({design,host,state,focus,changed,beforeOpen=()=>{}}){
 const css=document.createElement('link');css.rel='stylesheet';css.href='./hvac-controls.css?v=hvac-details';document.head.append(css);
 const names={living:'客厅风管机',bed1:'老人房挂机',master:'主卧挂机',bed3:'儿童房挂机'};
 const positions={living:[7.25,1.6,4.90],bed1:[2.70,1.6,4.92],master:[15.30,1.6,3.45],bed3:[14.60,1.6,5.72]};
 const button=document.createElement('button');button.id='hvacToggle';button.textContent='空调与检修';document.querySelector('header nav').append(button);
 const panel=document.createElement('section');panel.id='hvacActions';panel.hidden=true;panel.setAttribute('aria-label','空调细节操作');
 panel.innerHTML='<div class="hvac-heading"><label>查看空调 <select id="hvacRoom"></select></label><button id="hvacClose" aria-label="关闭空调操作">关闭</button></div><div class="hvac-buttons"></div><small id="hvacNote"></small>';
 host.append(panel);const select=panel.querySelector('select'),buttons=panel.querySelector('.hvac-buttons');let active='living',opened=false;
 for(const [id,label] of Object.entries(names)){const o=document.createElement('option');o.value=id;o.textContent=label;select.append(o);}
 function locate(object){if(object==='ducted-indoor-bulkhead')object='equipment-bay-bottom';focus(active,{object,label:names[active],position:positions[active],note:active==='living'?'设备区收向柜墙600mm、柜宽顶线底2.43m，上柜顶2.41m；取消原横跨浅边带，保留周圈双眼皮。上柜减少最高一层，非整厅层高提高。风量、梁高、外机及管线待核。':'停机开罩取滤网；容量、风向和外机管路仍待核。检修特写不是施工确认。'});}
 function render(){
  select.value=active;buttons.replaceChildren();const d=active==='living'?design.ducted:design.splits[active];
  const entries=active==='living'?[
   ['return',d.state.return?'关回风格栅':'开回风格栅',()=>d.setReturn(d.state.return?0:1),'return-grille',d.state.return],
   ['filter',d.state.filter?'收回滤网':'取下滤网',()=>d.setFilter(d.state.filter?0:1),'return-grille',d.state.filter],
   ['hatch',d.state.hatch?'关检修盖':'开检修盖',()=>d.setHatch(d.state.hatch?0:1),'service-hatch',d.state.hatch],
   ['cutaway',d.state.cutaway?'恢复吊顶':'看吊顶内部',()=>d.setCutaway(!d.state.cutaway),'concealed-indoor-unit',d.state.cutaway]
  ]:[
   ['cover',d.state.cover?'收好面罩':'打开面罩',()=>d.setCover(d.state.cover?0:1),active+'-air-conditioner',d.state.cover],
   ['filters',d.state.filters?'装回滤网':'取出滤网',()=>d.setFilters(d.state.filters?0:1),active+'-air-conditioner',d.state.filters],
   ['run',d.state.running?'停机':'运行示意',()=>d.setRun(!d.state.running),active+'-air-conditioner',d.state.running]
  ];
  entries.push(['air',d.state.airflow?'隐藏风向':'示意风向',()=>d.setAir(!d.state.airflow),active==='living'?'hvac-system-details':active+'-air-conditioner',d.state.airflow]);
  entries.push(['reset','全部收好',()=>d.reset(),active==='living'?'ducted-indoor-bulkhead':active+'-air-conditioner',false]);
  for(const [key,label,action,object,pressed] of entries){const b=document.createElement('button');b.dataset.hvacAction=key;b.textContent=label;b.setAttribute('aria-pressed',String(pressed));b.onclick=()=>{action();locate(key==='cutaway'&&!d.state.cutaway?'ducted-indoor-bulkhead':object);render();changed();};buttons.append(b);}
  panel.querySelector('#hvacNote').textContent=active==='living'?'柜墙顶线2.43m · 上柜两层储物（试排）；关好柜门、停机后检修。':'开罩自动停机；运行前收回滤网、面罩。箭头不代表实际气流模拟。';
 }
 function open(room){design.reset();active=names[room]?room:'living';beforeOpen(active);opened=true;panel.hidden=false;locate(active==='living'?'ducted-indoor-bulkhead':active+'-air-conditioner');render();changed();}
 button.onclick=()=>open(state().station);select.onchange=()=>open(select.value);
 panel.querySelector('#hvacClose').onclick=()=>{design.reset();opened=false;panel.hidden=true;changed();};
 return {open,sync(){const s=state();if(opened&&(s.mode!=='look'||(s.station!==active&&!(active==='living'&&s.station==='services')))){design.reset();opened=false;panel.hidden=true;changed();}}};
}
