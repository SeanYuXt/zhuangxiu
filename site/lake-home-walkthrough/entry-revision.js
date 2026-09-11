import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {doorLeaves} from './plan.js?v=entry-outward-niche';
import {createEntryComposition} from './entry-composition.js?v=entry-wall-only-3';
import {entryTvFaceX,familyDisplaySpec} from './family-display-spec.js?v=sideboard-depth-40-10';

export function applyEntryRevision(model){
 applyEntrySetbacks(model);
 for(const name of ['flush-entry-cabinet','entry-shoe-bench','entry-dressing-mirror','entry-key-tray','entry-vase-arrangement','entry-daily-slippers']){
  const old=model.getObjectByName(name);if(old){old.visible=false;old.name=name+'-previous-layout';}
 }
 // The sideboard is kept as the original continuous bank; this revision owns the entry only.
 return createEntryComposition(model);
}

// User correction: keep an exposed control wall beside the entrance.
export function applyEntrySetbacks(model){
 if(model.userData.entrySetbacksApplied)return;
 model.userData.entrySetbacksApplied=true;
 const side=model.getObjectByName('flush-sideboard'),shoes=model.getObjectByName('flush-entry-cabinet');
 if(side){
  model.updateMatrixWorld(true);
  const end=new T.Box3().setFromObject(side).max.x;
  side.position.x+=entryTvFaceX-end;
  // Rear of the revised cabinet meets the existing finished wall face.
  side.position.z+=familyDisplaySpec.corner[1]-new T.Box3().setFromObject(side).max.z;
  side.userData.wallAlignment='End at original TV living-side wall face';
 }
 if(shoes)shoes.position.x-=.40;
 const main=model.getObjectByName('door-front-main'),secondary=model.getObjectByName('door-front-secondary');
 if(main&&secondary){
  const left=Math.min(main.position.x,secondary.position.x),right=Math.max(main.position.x,secondary.position.x);
  for(const [door,x,base,turn,hinge] of [[main,left,0,doorLeaves.front[0].turn,'a'],[secondary,right,Math.PI,doorLeaves.front[1].turn,'b']]){
   door.position.x=x;door.userData={...door.userData,base,turn,hinge,swing_into:'exterior',source:'用户本次明确改为向外开；保留当前铰链侧，双扇比例沿用模型待复尺'};
   door.rotation.set(0,base+(door.userData.open?turn*Math.PI/2:0),0);
  }
 }
 const g=new T.Group();g.name='entry-intercom-control-zone';model.add(g);
 const panel=(name,x,y,w,h,color)=>{
  const m=new T.Mesh(new RoundedBoxGeometry(w,h,.025,2,.002),new T.MeshStandardMaterial({color,roughness:.6}));
  m.name=name;m.position.set(x,y,7.15);g.add(m);return m;
 };
 panel('entry-video-intercom',7.73,1.45,.22,.15,'#d9d6cf');
 panel('entry-video-screen',7.73,1.45,.17,.105,'#343b3c').position.z-=.014;
 panel('entry-control-panel',7.73,1.16,.17,.085,'#d9d6cf');
 g.userData={wallStrip:.60,status:'用户确认有可视对讲与控制面板；尺寸与高度仅定位示意，按原有底盒复尺，不据此迁线'};
 model.updateMatrixWorld(true);
}
