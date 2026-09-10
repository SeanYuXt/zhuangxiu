const {chromium}=require('C:/Users/vv-dev-work/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1440,height:950}});
 await p.goto('http://127.0.0.1:8768/lake-home-walkthrough/column-view.html?space=cabinet');
 await p.waitForFunction(()=>window.columnViewDebug?.state.ready&&window.sideboardDetailsDebug);
 await p.evaluate(()=>roomViewsDebug.select('dining-sideboard'));
 await p.screenshot({path:__dirname+'/cabinet-header-desktop.png'});
 await p.setViewportSize({width:390,height:844});
 await p.screenshot({path:__dirname+'/cabinet-header-phone.png'});
 console.log(JSON.stringify(await p.evaluate(async()=>{
  const T=await import('./vendor/three.module.js'),m=masterDressingDebug.model,rows=[];m.updateMatrixWorld(true);
  for(const name of ['flush-sideboard','sideboard-upper-storage','sideboard-drawer-bank','equipment-bay-bottom','concealed-indoor-unit','客厅双眼皮外层']){
   const o=m.getObjectByName(name),b=new T.Box3().setFromObject(o);rows.push({name,min:b.min.toArray(),max:b.max.toArray(),position:o.position.toArray(),scale:o.scale.toArray(),parent:o.parent.name});
   if(name==='flush-sideboard')for(const child of o.children){if(child.isMesh){const a=new T.Box3().setFromObject(child);if(a.max.y>2.4)rows.push({direct:child.name,min:a.min.toArray(),max:a.max.toArray(),position:child.position.toArray()});}}
   if(name==='客厅双眼皮外层'){rows.push({geometryType:o.geometry.type,parameters:o.geometry.parameters,userdata:o.userData});const a=o.geometry.attributes.position;rows.push({x:[...new Set([...Array(a.count)].map((_,i)=>Math.round(a.getX(i)*1000)/1000))].sort((a,b)=>a-b),y:[...new Set([...Array(a.count)].map((_,i)=>Math.round(a.getY(i)*1000)/1000))].sort((a,b)=>a-b),z:[...new Set([...Array(a.count)].map((_,i)=>Math.round(a.getZ(i)*1000)/1000))].sort((a,b)=>a-b)});}
  }
  rows.push({lightsInsideEquipmentEnvelope:lightingDesignDebug.report().filter(s=>s.position[0]>7.48&&s.position[0]<11.38&&s.position[2]>6.02&&s.position[2]<6.96&&s.position[1]>2.43&&s.position[1]<2.8)});
  return rows;
 }),null,2));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
