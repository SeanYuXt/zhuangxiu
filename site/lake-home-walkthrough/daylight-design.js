import * as T from './vendor/three.module.js';
import {P,rooms} from './plan.js';

// Window-shaped sky-entry study using shadowed proxy sources. This is direct
// preview fill, not baked global illumination or measured daylight/illuminance.
export function createDaylightDesign(model,scene,{onGeometryChange=()=>{}}={}){
 const entries=[],oldGlass=new Map(),snapshot=new WeakMap();let enabled=false,lastAssignment='',count=-1,revision=0,updates=0;
 model.updateMatrixWorld(true);
 model.traverseVisible(pane=>{
  const match=/^window-(bed1|bed3|master|living|kitchen|bath2)-\d+-glass$/.exec(pane.name),room=match?.[1]||(pane.name.startsWith('bath1-frosted-glass')?'bath1':null);
  if(!pane.isMesh||!room)return;
  const polygon=rooms.find(r=>r.id===room)?.poly;if(!polygon)throw Error('No daylight room polygon '+room);
  const mean=polygon.map(P).reduce((a,v)=>[a[0]+v[0]/polygon.length,a[1]+v[1]/polygon.length],[0,0]);
  const b=new T.Box3().setFromObject(pane),center=b.getCenter(new T.Vector3()),size=b.getSize(new T.Vector3()),axis=size.x<size.z?'x':'z',normal=new T.Vector3();normal[axis]=(axis==='x'?mean[0]:mean[1])>center[axis]?1:-1;
  const width=axis==='x'?size.z:size.x,height=size.y,distance=Math.max(1.25,Math.min(5.5,Math.max(width,height)*.85)),position=center.clone().addScaledVector(normal,-distance),target=center.clone().addScaledVector(normal,2);
  const angle=Math.min(1.25,Math.atan(Math.hypot(width,height)*.55/distance));
  entries.push({id:pane.name+'@'+entries.length,room,pane,center,normal,position,target,width,height,distance,angle});oldGlass.set(pane,pane.castShadow);
 });
 if(!entries.length)throw Error('No real window panes for daylight study');
 const pool=Array.from({length:3},(_,i)=>{
  const light=new T.SpotLight('#ecf2ff',0,20,Math.PI/3,.25,2);light.name='window-sky-proxy-'+i;light.castShadow=true;
  light.shadow.autoUpdate=false;light.shadow.mapSize.set(1024,1024);light.shadow.bias=-.00012;light.shadow.normalBias=.012;light.shadow.camera.near=.05;light.shadow.camera.far=20;light.shadow.radius=3;
  scene.add(light,light.target);return light;
 });
 function setEnabled(on){enabled=!!on;for(const [pane,was] of oldGlass)pane.castShadow=enabled?false:was;if(!enabled)for(const l of pool)l.intensity=0;lastAssignment='';count=-1;}
 function update(camera){
  if(!enabled)return;
  const nearest=entries.map(e=>({e,score:e.center.distanceToSquared(camera.position)})).sort((a,b)=>a.score-b.score).slice(0,pool.length).map(r=>r.e).sort((a,b)=>a.id.localeCompare(b.id));
  model.updateMatrixWorld(true);let current=0,changed=false;
  model.traverseVisible(o=>{if(!o.isMesh||!o.castShadow)return;current++;const old=snapshot.get(o),matrix=o.matrixWorld.elements;
   if(!old||old.geometry!==o.geometry||old.version!==o.geometry.attributes.position?.version||old.indices!==o.geometry.index?.version||matrix.some((v,i)=>v!==old.matrix[i])){snapshot.set(o,{geometry:o.geometry,version:o.geometry.attributes.position?.version,indices:o.geometry.index?.version,matrix:[...matrix]});changed=true;}
  });if(current!==count)changed=true;count=current;
  const assignment=nearest.map(e=>e.id).join('|');
  pool.forEach((light,i)=>{const e=nearest[i];if(!e){light.intensity=0;return;}light.position.copy(e.position);light.target.position.copy(e.target);light.target.updateMatrixWorld();light.angle=e.angle;light.intensity=16*(e.distance+1)**2*(e.room.startsWith('bath')?.6:1);light.userData.aperture=e.id;
   if(changed||assignment!==lastAssignment){light.shadow.needsUpdate=true;updates++;}
  });if(changed){revision++;onGeometryChange();}lastAssignment=assignment;
 }
 return {entries,pool,setEnabled,update,get state(){return {enabled,revision,shadowUpdates:updates,assignment:lastAssignment,limits:'3 nearest shadowed window proxy sources, artistic direct fill; not GI, lux or phone performance certification'};}};
}
