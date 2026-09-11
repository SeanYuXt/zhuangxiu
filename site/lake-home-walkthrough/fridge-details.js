import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {finishWoodPanel} from './cabinet-finishes.js';
import {fridgeLayout as spec} from './design-spec.js?v=fridge-layout-2';
const white=new T.MeshStandardMaterial({color:'#e1e2da',roughness:.42});
const warm=new T.MeshStandardMaterial({color:'#d6d1c7',roughness:.52});
const dark=new T.MeshStandardMaterial({color:'#424b45',roughness:.6});
const metal=new T.MeshStandardMaterial({color:'#969b94',roughness:.36,metalness:.72});
const shelf=new T.MeshPhysicalMaterial({color:'#d1dfd7',roughness:.18,transmission:.6,thickness:.004,ior:1.5});
const group=(p,n,pos=[0,0,0])=>{const g=new T.Group();g.name=n;g.position.fromArray(pos);p.add(g);return g;};
function box(p,n,pos,size,mat=white){const o=new T.Mesh(new RoundedBoxGeometry(...size,2,Math.min(.003,...size.map(v=>v/4))),mat);o.name=n;o.position.fromArray(pos);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
function wood(p,n,pos,size){const o=box(p,n,pos,size,warm);finishWoodPanel(o,{interior:true});return o;}
function bin(p,n,x,y,z,w,h,depth){const g=group(p,n,[x,y,z]);g.userData.closedZ=z;box(g,n+'-bottom',[0,.006,0],[w,.012,depth]);for(const s of [-1,1]){box(g,n+'-side',[s*(w/2-.006),h/2,0],[.012,h,depth]);box(g,n+'-end',[0,h/2,s*(depth/2-.006)],[w-.024,h,.012],s===1?shelf:white);}return g;}

export function refineFridge(model){
 const original=model.getObjectByName('integrated-fridge');if(!original)throw Error('Missing fridge position');
 const cabinet=new T.Group();cabinet.name='integrated-fridge';cabinet.position.fromArray(spec.position);cabinet.rotation.y=spec.rotation;
 original.parent.add(cabinet);original.removeFromParent();
 const back=-spec.depth/2,front=spec.depth/2,half=spec.width/2,inside=spec.width-.09;
 // Rebuild at the requested size; do not scale an appliance or hide its rear in the wall.
 for(const x of [-1,1])box(cabinet,'fridge-surround-side',[x*(spec.cabinetWidth-spec.panel)/2,spec.top/2,-.005],[spec.panel,spec.top,spec.depth+.01],warm);
 const topStorage=group(cabinet,'fridge-upper-storage');
 const innerWidth=spec.cabinetWidth-2*spec.panel;
 for(const y of [2.039,2.305,2.571])wood(topStorage,'fridge-upper-shelf',[0,y,-.009],[innerWidth,.018,.602]);
 wood(topStorage,'fridge-upper-back',[0,2.305,-.301],[innerWidth,.53,.018]);
 const upperDoor=group(cabinet,'fridge-upper-door',[-innerWidth/2+.002,0,.300]);
 box(upperDoor,'fridge-upper-door-panel',[innerWidth/2-.002,2.305,-.01],[innerWidth-.004,.516,.02],warm);
 box(upperDoor,'fridge-upper-recessed-pull',[innerWidth/2-.002,2.059,-.014],[.18,.009,.005],dark);
 for(const y of [2.067,2.333])for(const x of [-.226,.226]){
  box(topStorage,'fridge-seasonal-box',[x,y+.096,-.035],[.39,.19,.40]);
  box(topStorage,'fridge-seasonal-box-lid',[x,y+.195,-.035],[.396,.009,.406],warm);
 }
 topStorage.userData={use:'两层低频轻物收纳，独立于冰箱散热',top:spec.top,hardwareSelected:false};
 const appliance=group(cabinet,'fridge-appliance-envelope');
 const body=group(appliance,'fridge-insulated-shell'),shellTop=spec.height;
 for(const x of [-1,1])box(body,'fridge-insulated-side',[x*(half-.0225),(shellTop+.07)/2,-.022],[.045,shellTop-.07,spec.depth-.044]);
 for(const y of [.096,shellTop-.0225])box(body,'fridge-insulated-horizontal',[0,y,-.022],[inside,.045,spec.depth-.044]);
 box(body,'fridge-insulated-back',[0,1.04,back+.0175],[inside,1.86,.035]);
 box(body,'fridge-temperature-separator',[0,.835,-.022],[inside,.026,spec.depth-.044]);
 box(body,'fridge-lower-center-divider',[0,.469,-.022],[.028,.706,spec.depth-.044]);
 const cold=group(appliance,'fridge-cold-interior');
 for(const y of [1.12,1.42,1.72]){box(cold,'fridge-glass-shelf',[0,y,-.052],[inside-.016,.008,.33],shelf);box(cold,'fridge-shelf-front-trim',[0,y,.116],[inside-.016,.012,.014]);}
 for(const x of [-.205,.205])for(const y of [1.15,1.45,1.75]){
  box(cold,'fridge-food-container',[x,y,-.05],[.285,.045,.27]);box(cold,'fridge-food-container-lid',[x,y+.026,-.05],[.288,.006,.273],warm);
 }
 const bins=[];
 for(const x of [-.208,.208])for(const y of [.135,.474])bins.push(bin(cold,'fridge-freezer-bin-'+bins.length,x,y,-.020,.357,.272,.426));
 bins.push(bin(cold,'fridge-crisper',0,.86,-.042,.700,.20,.330));
 const doors=[];
 for(let i=0;i<4;i++){
  const sign=i%2?-1:1,low=i<2?.084:.846,high=i<2?.824:1.983;
  const hinge=group(appliance,'fridge-door-'+i,[-sign*half,0,front]);
  const cx=sign*(half-.004)/2;
  box(hinge,'fridge-appliance-door'+(i?'_'+i:''),[cx,(low+high)/2,-.019],[half-.004,high-low,.038],metal);
  box(hinge,'fridge-door-insulated-liner',[cx,(low+high)/2,-.064],[.325,high-low-.07,.050]);
  for(const y of [low+.024,high-.024])box(hinge,'fridge-door-gasket',[cx,y,-.040],[.370,.014,.008],dark);
  for(const dx of [-.178,.178])box(hinge,'fridge-door-gasket',[cx+dx,(low+high)/2,-.040],[.014,high-low-.048,.008],dark);
  box(hinge,'fridge-recessed-grip',[cx,i<2?high-.018:low+.018,-.004],[.30,.009,.006],dark);
  if(i>=2)for(const y of [1.00,1.34,1.67])bin(hinge,'fridge-door-bin-'+i+'-'+y,cx,y,-.124,.30,.065,.065);
  hinge.userData={direction:sign,modelSelected:false,maxPreviewAngle:125};doors.push(hinge);
 }
 box(doors[3],'fridge-temperature-display',[-.223,1.62,-.002],[.045,.125,.004],dark);
 const vent=group(appliance,'fridge-front-vent-reserve');
 for(const y of [.036,.067])box(vent,'fridge-vent-rail',[0,y,.283],[.83,.004,.012],dark);
 for(let i=0;i<21;i++)box(vent,'fridge-vent-slat',[-.4+i*.04,.0515,.283],[.003,.027,.012],dark);
 for(const x of [-.36,.36])for(const z of [-.25,.23])box(appliance,'fridge-adjustable-foot',[x,.035,z],[.036,.07,.036],dark);
 vent.userData={airflowVerified:false,selection:'散热方式和净空按最终机型，格栅仅为方案示意'};
 const state={doors:false,bin:-1,upper:false};
 function setUpper(fraction=1){const f=T.MathUtils.clamp(fraction,0,1);upperDoor.rotation.y=-Math.PI/2*f;state.upper=f>0;model.updateMatrixWorld(true);}
 function setDoors(fraction=1){const f=T.MathUtils.clamp(fraction,0,1);if(f<1)setBin(-1);doors.forEach(g=>g.rotation.y=-g.userData.direction*f*g.userData.maxPreviewAngle*Math.PI/180);state.doors=f===1;model.updateMatrixWorld(true);}
 function setBin(index,fraction=1){if(index>=0&&!state.doors)setDoors(1);bins.forEach((g,i)=>g.position.z=g.userData.closedZ+(i===index?.30*T.MathUtils.clamp(fraction,0,1):0));state.bin=index;model.updateMatrixWorld(true);}
 function reset(){setBin(-1);setDoors(0);setUpper(0);}
 appliance.userData={dimensions:[spec.width,spec.height,spec.depth],source:'用户确认宽900、深600；高度2000为方案值',productSelected:false};
 cabinet.userData={revision:spec.id,nominalBody:[spec.width,spec.height,spec.depth],cabinetWidth:spec.cabinetWidth,sidePanels:spec.panel,sideGap:spec.sideGap,installationStatus:'厨房门右侧靠阳台；方案外形与示意内部，不是已选机型',capacityLitres:null,ventilationCertified:false};
 model.updateMatrixWorld(true);
 return {cabinet,appliance,body,cold,doors,bins,vent,topStorage,upperDoor,state,setDoors,setBin,setUpper,reset,spec};
}
