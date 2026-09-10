import * as T from './vendor/three.module.js';
import {livingRevision as spec} from './design-spec.js';
import {makeDryIsland} from './dry-island.js';
import {addBarWorkPower} from './bar-work-power.js';
import {applyBalconySideInfill} from './balcony-side-infill.js';
import {addBalconyCare} from './balcony-care.js';
import {refineSofa} from './textile-details.js?v=matte-fabric-2';
import {refineBarSeats} from './bar-swivel-seats.js?v=matte-fabric-2';

// Apply once to a freshly loaded model; never mutate walls or room polygons.
export function applyLivingRevision(model){
 if(model.userData.livingRevision===spec.id)return;
 const get=name=>{const o=model.getObjectByName(name);if(!o)throw Error('缺少调整对象：'+name);return o;};
 const column=get('retained-balcony-column'),columnX=column.position.x;
 column.scale.x=spec.columnWidth/.45;
 column.userData={...column.userData,width:spec.columnWidth,depth:spec.columnDepth,dimensionStatus:spec.columnWidthStatus};
 for(const [side,direction] of [['left',-1],['right',1]]){
  const bar=get('lake-bar-'+side),length=spec.wingLengths[side],factor=length/1.8;
  bar.position.x=columnX+direction*(spec.columnWidth/2+spec.columnFinish.side+length/2);
  bar.position.z=column.position.z+spec.barOffsetZ;
  // Imported rounded top is rotated: local Y is world depth; local Z is thickness.
  bar.children[0].scale.y=spec.barDepth/.45;
  // Compress only long elements. Stools, legs, cups and books keep their widths.
  for(const child of bar.children){const width=new T.Box3().setFromObject(child).getSize(new T.Vector3()).x;if(width<1)child.scale.x/=factor;}
  bar.scale.x=factor;
  const stools=bar.children.filter(o=>o.name.startsWith('upholstered-counter-stool'));
  while(stools.length<2){const copy=stools[0].clone(true);copy.name='upholstered-counter-stool-'+side+'-second';bar.add(copy);stools.push(copy);}
  stools.forEach((stool,i)=>{if(i>1){stool.removeFromParent();return;}stool.visible=true;stool.name='upholstered-counter-stool-'+side+'-'+i;stool.position.set(spec.barSeatLocalX[side][i]/factor,stool.position.y,spec.barSeatStoredZ);});
  // Keep the end support by the glazing, clear of the two knee positions.
  const support=bar.children.find(o=>o.isMesh&&new T.Box3().setFromObject(o).getSize(new T.Vector3()).y>.8);
  if(support){support.scale.z*=.06/.39;support.position.z=-spec.barDepth/2+.06;support.name='bar-end-support-'+side;}
  for(const child of [...bar.children]){const b=new T.Box3().setFromObject(child);if(b.min.y>.951)child.removeFromParent();}
  bar.userData={...bar.userData,length,seats:2,seatPitch:.65};
 }
 window.barSeatsDebug=refineBarSeats(model);
 const sofa=get('linen-sofa');sofa.scale.x=spec.sofa.length/3.05;sofa.position.fromArray(spec.sofa.position);
 refineSofa(sofa);
 const originalIsland=get('stone-island'),islandParent=originalIsland.parent;
 const settings=originalIsland.getObjectByName('dining-table-settings');settings?.removeFromParent();originalIsland.removeFromParent();
 const island=makeDryIsland(spec.island,settings);islandParent.add(island);
 // Move the existing pendant and its suspension with the island, not the ceiling.
 model.updateMatrixWorld(true);const pendantParts=[];
 model.traverse(o=>{if(!o.isMesh||o.parent!==island.parent)return;const b=new T.Box3().setFromObject(o),c=b.getCenter(new T.Vector3());if(b.min.y>=2.18&&b.max.y<2.82&&Math.abs(c.x-7.305)<.055&&c.z>=3.049&&c.z<=4.151&&b.getSize(new T.Vector3()).x<.1)pendantParts.push(o);});
 for(const o of pendantParts){o.position.x+=spec.island.position[0]-7.305;o.position.z+=spec.island.position[2]-3.6;}
 spec.diningSeats.forEach((position,i)=>{const seat=get('dining-daily-seat-'+i);seat.position.fromArray(position);seat.rotation.y=spec.diningSeatRotation;seat.userData={...seat.userData,pullDirection:[1,0,0],pullTravel:spec.seatPull};});
 get('slim-coffee-table').position.fromArray(spec.coffee.position);
 const rug=get('living-area-rug');rug.scale.set(spec.rug.width/2.38,1,spec.rug.length/3.45);rug.position.fromArray(spec.rug.position);
 // Deterministic low-contrast weave, with no external texture or changed floor size.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#c9c3b8';ctx.fillRect(0,0,128,128);
 for(let i=0;i<128;i+=4){ctx.fillStyle=i%8?'#c6c0b5':'#cdc7bc';ctx.fillRect(i,0,1,128);ctx.fillRect(0,i,128,1);}
 const weave=new T.CanvasTexture(canvas);weave.colorSpace=T.SRGBColorSpace;weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(18,26);
 rug.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.color.set('#ffffff');o.material.map=weave;o.material.roughness=1;}});
 rug.userData={...rug.userData,dimensions:[spec.rug.width,spec.rug.length],pile:'8mm方案；防滑底与清洁维护待选型'};
 const ac=get('master-air-conditioner');ac.position.fromArray(spec.masterAC.position);ac.rotation.y=spec.masterAC.rotation;ac.userData={...ac.userData,status:spec.masterAC.status};
 addBarWorkPower(model,column,spec);
 applyBalconySideInfill(model);
 const laundry=get('balcony-laundry-cabinet');laundry.position.z+=spec.laundryOffsetZ;
 laundry.userData={...laundry.userData,designMoveTowardGlass:-spec.laundryOffsetZ,waterSupply:null,waste:null,power:null,installationStatus:'设计试排：向正面玻璃方向前移550mm；管路与安装未确认'};
 window.balconyCareDebug=addBalconyCare(model);
 model.userData.livingRevision=spec.id;model.updateMatrixWorld(true);
}
