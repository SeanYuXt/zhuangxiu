import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {finishWoodPanel} from './cabinet-finishes.js';
const white=new T.MeshStandardMaterial({color:'#dfe3dd',roughness:.36}),dark=new T.MeshStandardMaterial({color:'#444c48',roughness:.65}),metal=new T.MeshStandardMaterial({color:'#989f99',roughness:.3,metalness:.8});
const shelf=new T.MeshPhysicalMaterial({color:'#cfdfd9',roughness:.12,transmission:.80,thickness:.004,ior:1.5,attenuationDistance:1});
const group=(p,n,pos=[0,0,0])=>{const g=new T.Group();g.name=n;g.position.fromArray(pos);p.add(g);return g;};
function box(p,n,pos,size,mat=white){const o=new T.Mesh(new RoundedBoxGeometry(...size,2,Math.min(.002,...size.map(v=>v/4))),mat);o.name=n;o.position.fromArray(pos);o.castShadow=o.receiveShadow=true;p.add(o);return o;}
function bottle(p,n,x,y,z,color){const m=new T.MeshStandardMaterial({color,roughness:.35}),profile=[[0,0],[.029,0],[.033,.02],[.033,.14],[.024,.16],[.014,.173],[.014,.205],[0,.205]].map(v=>new T.Vector2(...v)),o=new T.Mesh(new T.LatheGeometry(profile,24),m);o.name=n;o.position.set(x,y,z);p.add(o);box(p,n+'-cap',[x,y+.211,z],[.030,.012,.030],white);return o;}
function bin(p,n,x,y,z,w,h,depth){const g=group(p,n,[x,y,z]);g.userData.closedZ=z;box(g,n+'-bottom',[0,.006,0],[w,.012,depth]);for(const s of [-1,1]){box(g,n+'-side',[s*(w/2-.006),h/2,0],[.012,h,depth]);box(g,n+'-end',[0,h/2,s*(depth/2-.006)],[w-.024,h,.012],s===1?shelf:white);}return g;}

export function refineFridge(model){
 const cabinet=model.getObjectByName('integrated-fridge');if(!cabinet)throw Error('Missing fridge cabinet');model.updateMatrixWorld(true);
 const solid=cabinet.getObjectByName('mesh_768');if(!solid)throw Error('Fridge baseline changed');solid.removeFromParent();
 const oldTop=cabinet.getObjectByName('mesh_766'),topFace=cabinet.getObjectByName('mesh_767');if(!oldTop||!topFace)throw Error('Missing fridge upper cabinet');
 oldTop.removeFromParent();
 const topStorage=group(cabinet,'fridge-upper-storage'),topWood=white.clone();
 for(const y of [2.109,2.435,2.761]){const board=box(topStorage,'fridge-upper-shelf',[0,y,-.032],[.932,.018,.596],topWood);finishWoodPanel(board,{interior:true});}
 const upperDoor=group(cabinet,'fridge-upper-door',[-.464,0,.299]);cabinet.updateMatrixWorld(true);upperDoor.attach(topFace);
 for(const y of [2.20,2.64]){const pin=new T.Mesh(new T.CylinderGeometry(.006,.006,.032,20),metal);pin.name='fridge-upper-hinge';pin.position.set(.010,y,-.005);upperDoor.add(pin);}
 for(const [i,y] of [2.238,2.564].entries())for(const [n,x] of [-.232,.232].entries()){
  const storage=group(topStorage,'fridge-seasonal-box-'+i+'-'+n);
  box(storage,'fridge-seasonal-box',[x,y,-.030],[.396,.24,.43],white);
  box(storage,'fridge-seasonal-lid',[x,y+.125,-.030],[.402,.010,.436],dark);
  box(storage,'fridge-seasonal-grip',[x,y+.006,.189],[.10,.018,.008],dark);
 }
 topStorage.userData={use:'低频轻物，配合稳固踏凳取放；不能踩岛台或椅子',clearHeightPerTier:.308,boxSize:[.396,.24,.43],hardwareSelected:false,notApplianceVent:true};
 const body=group(cabinet,'fridge-insulated-shell');
 // Recess the seal seat 9mm; retain rear plane, width and exterior door locations.
 for(const x of [-.4365,.4365])box(body,'fridge-insulated-side',[x,1.095,-.0225],[.045,2,.561]);
 for(const y of [.1225,2.0675])box(body,'fridge-insulated-horizontal',[0,y,-.0225],[.828,.055,.561]);
 box(body,'fridge-insulated-back',[0,1.095,-.2755],[.828,1.89,.055]);
 box(body,'fridge-temperature-separator',[0,.862,-.0225],[.828,.030,.561]);
 box(body,'fridge-lower-center-divider',[0,.498,-.0225],[.032,.698,.561]);
 // Clear cavities, not litre claims: actual ducts/evaporators depend on selected product.
 const cold=group(cabinet,'fridge-cold-interior');
 for(const y of [1.14,1.45,1.76]){box(cold,'fridge-glass-shelf',[0,y,-.065],[.811,.008,.345],shelf);box(cold,'fridge-shelf-front-trim',[0,y,.110],[.811,.013,.016],white);}
 for(const y of [1.22,1.53])for(const x of [-.406,.406])box(cold,'fridge-shelf-support',[x,y-.08,-.04],[.016,.016,.31],white);
 for(const [i,x] of [-.26,-.10,.08,.25].entries())bottle(cold,'fridge-drink-'+i,x,1.144,-.05,['#d3c9b4','#d8cfba','#aaa786','#bcc7b2'][i]);
 for(const x of [-.23,.23])for(const y of [1.478,1.788]){box(cold,'fridge-lidded-food-box',[x,y,-.065],[.30,.048,.30],white);box(cold,'fridge-food-box-lid',[x,y+.029,-.065],[.303,.010,.303],dark);}
 const bins=[];for(const x of [-.218,.218])for(const y of [.159,.515]){const b=bin(cold,'fridge-freezer-bin-'+bins.length,x,y,-.02,.370,.278,.418);box(b,'freezer-storage-container',[0,.070,-.01],[.27,.10,.30],white);bins.push(b);}
 const crisper=bin(cold,'fridge-crisper',0,.887,-.075,.794,.209,.33);bins.push(crisper);
 const doors=[];
 for(let i=0;i<4;i++){
  const panel=cabinet.getObjectByName('fridge-appliance-door'+(i?'_'+i:''));if(!panel)throw Error('Missing fridge door '+i);
  const sign=i%2?-1:1,x=i%2?.229:-.229,low=i<2?.12:.876,high=i<2?.855:2.031;
  const hinge=group(cabinet,'fridge-door-'+i,[x-sign*.226,0,.302]);cabinet.updateMatrixWorld(true);hinge.attach(panel);
  const localCenter=x-hinge.position.x;
  box(hinge,'fridge-door-insulated-liner',[localCenter,(low+high)/2,-.067],[.350,high-low-.070,.05]);
  for(const y of [low+.022,high-.022])box(hinge,'fridge-door-gasket',[localCenter,y,-.027],[.414,.016,.012],dark);
  for(const dx of [-.20,.20])box(hinge,'fridge-door-gasket',[localCenter+dx,(low+high)/2,-.027],[.016,high-low-.058,.012],dark);
  for(const y of [low+.055,high-.055]){const pin=new T.Mesh(new T.CylinderGeometry(.009,.009,.036,24),metal);pin.name='fridge-hinge-barrel';pin.position.set(0,y,0);pin.castShadow=pin.receiveShadow=true;hinge.add(pin);}
  if(i>=2){
   for(const y of [1.00,1.34,1.69]){
    const rack=bin(hinge,'fridge-door-bin-'+i+'-'+y,localCenter,y,-.129,.33,.077,.078);
    if(y===1.00)for(const dx of [-.08,.08])bottle(rack,'fridge-door-bottle',dx,.012,0,'#b8bd9f');
   }
   const grip=cabinet.getObjectByName(i===2?'mesh_774':'mesh_775');hinge.attach(grip);
  }
  hinge.userData={direction:sign,modelSelected:false,maxPreviewAngle:125};doors.push(hinge);
 }
 for(const name of ['fridge-temperature-display','mesh_777','mesh_778'])doors[3].attach(cabinet.getObjectByName(name));
 for(const o of [...cabinet.children])if(o.isMesh&&o.position.y<.11&&o.position.z>.27)o.removeFromParent();
 const vent=group(cabinet,'fridge-front-vent-reserve');
 for(const y of [.073,.114])box(vent,'fridge-vent-rail',[0,y,.29],[.886,.006,.018],dark);
 for(let i=0;i<23;i++)box(vent,'fridge-vent-slat',[-.429+i*.039,.0935,.29],[.004,.035,.018],dark);
 for(const x of [-.38,.38])for(const z of [-.25,.20])box(cabinet,'fridge-adjustable-foot',[x,.0505,z],[.043,.089,.045],dark);
 vent.userData={airflowVerified:false,freeAreaEstimateM2:(.886-23*.004)*.035,selection:'Front-venting/zero-clearance appliance required; no side/rear cooling assumed'};
 const state={doors:false,bin:-1,upper:false};
 function setUpper(fraction=1){const t=T.MathUtils.clamp(fraction,0,1);upperDoor.rotation.y=-Math.PI/2*t;state.upper=t>0;model.updateMatrixWorld(true);}
 function setDoors(fraction=1){const f=T.MathUtils.clamp(fraction,0,1);if(f<1)setBin(-1);doors.forEach(g=>g.rotation.y=-g.userData.direction*f*g.userData.maxPreviewAngle*Math.PI/180);state.doors=f===1;model.updateMatrixWorld(true);}
 function setBin(index,fraction=1){if(index>=0&&!state.doors)setDoors(1);bins.forEach((g,i)=>g.position.z=g.userData.closedZ+(i===index?.30*T.MathUtils.clamp(fraction,0,1):0));state.bin=index;model.updateMatrixWorld(true);}
 function reset(){setBin(-1);setDoors(0);setUpper(0);}
 cabinet.userData={...cabinet.userData,nominalBody:[.918,2,.570],installationStatus:'Unselected front-vented fit envelope; not a matched real product',capacityLitres:null,ventilationCertified:false};
 return {cabinet,body,cold,doors,bins,vent,topStorage,upperDoor,state,setDoors,setBin,setUpper,reset};
}
