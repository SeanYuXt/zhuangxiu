import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {finishWoodPanel,quartzMaterial} from './cabinet-finishes.js';
import {makePlate,makeCup} from './tableware-details.js';
import {P,walls} from './plan.js';
import {installDiningWall} from './dining-sideboard-study.js';
import {livingRevision} from './design-spec.js';

// Review variant on the retained live model. Dimensions are design candidates, in metres.
export const diningStudySpec={table:{position:[7.58,0,4.55],width:.85,length:1.60,height:.75},chair:{width:.48,depth:.54,seatHeight:.46,sideOffset:.695,pitch:.80,endOffset:1.075},door:{frame:.030,overlap:.035,trackPitch:.037,trackDepth:.11}};
const oak=new T.MeshStandardMaterial({color:'#bdac91',roughness:.7}),metal=new T.MeshStandardMaterial({color:'#575b54',roughness:.4});
const tableStone=quartzMaterial.clone();tableStone.name='dining-warm-greige-matte-stone';tableStone.color.set('#e1dcd2');tableStone.roughness=.68;
const warmFrame=new T.MeshStandardMaterial({color:'#9a9287',roughness:.58,metalness:.22});
const weave=new T.TextureLoader().load('./assets/fabric-normal.jpg');weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(2,2);
const chairFabric=new T.MeshStandardMaterial({color:'#c9c4ba',roughness:.97,normalMap:weave,normalScale:new T.Vector2(.075,.075)});
const box=(root,name,pos,size,mat=oak,r=.004)=>{const m=new T.Mesh(new RoundedBoxGeometry(...size,2,Math.min(r,...size.map(v=>v/4))),mat);m.name=name;m.position.fromArray(pos);m.castShadow=m.receiveShadow=true;root.add(m);if(mat===oak)finishWoodPanel(m);return m;};
const group=(root,name,pos=[0,0,0])=>{const g=new T.Group();g.name=name;g.position.fromArray(pos);root.add(g);return g;};
const bounds=o=>{const b=new T.Box3().setFromObject(o);return {name:o.name,x1:b.min.x,x2:b.max.x,z1:b.min.z,z2:b.max.z,y1:b.min.y,y2:b.max.y};};
function leg(root,name,a,b,r=.019,mat=warmFrame){const p=new T.Vector3(...a),q=new T.Vector3(...b),v=q.clone().sub(p),m=new T.Mesh(new T.CylinderGeometry(r*.8,r,v.length(),28),mat);m.name=name;m.position.copy(p.add(q).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());m.castShadow=m.receiveShadow=true;root.add(m);}

export function installDiningStudy(model,changed){
 const spec=diningStudySpec,s=spec.table,c=spec.chair;
 model.getObjectByName('stone-island').visible=false;
 for(let i=0;i<2;i++)model.getObjectByName('dining-daily-seat-'+i).visible=false;
 // Move the full-size fridge across the entrance into the kitchen-side shoe wall.
 const diningWall=installDiningWall(model);
 // Kitchen walls are retained. The cancelled wine banks and their furniture shifts are not installed.
 const root=group(model,'ordinary-dining-study'),table=group(root,'ordinary-dining-table',s.position);
 // Full plan-radius tabletop; rounded corners are not constrained by its thickness.
 const contour=new T.Shape(),hw=s.width/2,hl=s.length/2,cr=.16;
 contour.moveTo(-hw+cr,-hl);contour.lineTo(hw-cr,-hl);contour.quadraticCurveTo(hw,-hl,hw,-hl+cr);contour.lineTo(hw,hl-cr);contour.quadraticCurveTo(hw,hl,hw-cr,hl);contour.lineTo(-hw+cr,hl);contour.quadraticCurveTo(-hw,hl,-hw,hl-cr);contour.lineTo(-hw,-hl+cr);contour.quadraticCurveTo(-hw,-hl,-hw+cr,-hl);
 const topGeo=new T.ExtrudeGeometry(contour,{depth:.024,bevelEnabled:false,curveSegments:32});topGeo.rotateX(-Math.PI/2);
 const top=new T.Mesh(topGeo,tableStone);top.name='solid-wood-dining-top';top.userData.finish='暖米灰哑光岩板外观意向；普通成品桌，型号与材质待选';top.position.y=s.height-.024;top.castShadow=top.receiveShadow=true;table.add(top);
 for(const x of [-.325,.325])for(const z of [-.66,.66])leg(table,'dining-tapered-leg',[x*1.08,.015,z*1.04],[x,.72,z],.025);
 for(const x of [-.325,.325])box(table,'dining-side-apron',[x,.701,0],[.024,.034,1.30],warmFrame);
 const chairs=[];
 function chair(index,x,z,rotation){
  const g=group(root,'ordinary-dining-chair-'+index,[x,0,z]);g.rotation.y=rotation;
  box(g,'upholstered-chair-seat',[0,.427,0],[c.width,.066,.45],chairFabric,.025);
  const crescent=new T.Shape();crescent.moveTo(-.219,-.159);crescent.quadraticCurveTo(-.14,-.263,0,-.263);crescent.quadraticCurveTo(.14,-.263,.219,-.159);crescent.lineTo(.204,-.136);crescent.quadraticCurveTo(.13,-.229,0,-.229);crescent.quadraticCurveTo(-.13,-.229,-.204,-.136);crescent.closePath();
  const backGeo=new T.ExtrudeGeometry(crescent,{depth:.234,bevelEnabled:true,bevelSize:.010,bevelThickness:.010,bevelSegments:4,curveSegments:28});backGeo.rotateX(Math.PI/2);
  const back=new T.Mesh(backGeo,chairFabric);back.name='curved-upholstered-chair-back';back.position.y=.81;back.castShadow=back.receiveShadow=true;g.add(back);
  for(const xx of [-.182,.182])for(const zz of [-.178,.178])leg(g,'chair-leg',[xx*1.15,.015,zz*1.30],[xx,.415,zz],.014);
  for(const xx of [-.182,.182])leg(g,'chair-back-stile',[xx,.41,-.178],[xx,.73,-.21],.012);
  g.userData={index,origin:[x,0,z],rotation};chairs.push(g);
 }
 for(const sign of [-1,1])for(const z of [-c.pitch/2,c.pitch/2])chair(chairs.length,s.position[0]+sign*c.sideOffset,s.position[2]+z,sign<0?Math.PI/2:-Math.PI/2);
 chair(4,s.position[0],s.position[2]-c.endOffset,0);chair(5,s.position[0],s.position[2]+c.endOffset,Math.PI);
 const settings=group(table,'ordinary-table-settings',[0,s.height,0]),endSettings=[];
 function setting(x,z,end=false){const g=group(settings,'dining-place-setting',[x,.002,z]);g.add(makePlate('dining-ceramic-plate',.12));const cup=makeCup('dining-water-cup',{radius:.030,height:.078});cup.position.set(x<0?-.13:.13,0,z<0?-.085:.085);g.add(cup);if(end)endSettings.push(g);}
 for(const x of [-.20,.20])for(const z of [-.40,.40])setting(x,z);
 setting(0,-.64,true);setting(0,.64,true);
 const wall=walls.find(w=>w.open?.some(o=>o.id==='kitchen')),opening=wall.open.find(o=>o.id==='kitchen'),a=P(wall.a);
 const z0=a[1]+opening.at/100,z1=z0+opening.w/100,x=a[0],header=model.getObjectByName('mesh_42');
 const openingHeight=new T.Box3().setFromObject(header).min.y,ds=spec.door,inner0=z0+ds.frame,inner1=z1-ds.frame,leafWidth=(inner1-inner0+2*ds.overlap)/3;
 const door=group(root,'three-track-kitchen-door'),leaves=[];
 const glass=new T.MeshPhysicalMaterial({color:'#cfdbd4',roughness:.1,transparent:true,opacity:.20,depthWrite:false,side:T.DoubleSide});
 for(const z of [z0+ds.frame/2,z1-ds.frame/2])box(door,'sliding-door-jamb',[x,openingHeight/2,z],[ds.trackDepth,openingHeight,ds.frame],metal,.001);
 box(door,'sliding-door-head',[x,openingHeight-.025,(z0+z1)/2],[ds.trackDepth,.05,z1-z0],metal,.001);
 for(let i=0;i<3;i++){
  const xx=x+(i-1)*ds.trackPitch,zz=inner0+leafWidth/2+i*(leafWidth-ds.overlap),g=group(door,'kitchen-sliding-leaf-'+i,[xx,0,zz]);
  box(door,'kitchen-floor-track-'+i,[xx,.008,(z0+z1)/2],[.008,.016,z1-z0],metal,.001);
  const low=.02,high=openingHeight-.06;
  for(const dz of [-leafWidth/2+.012,leafWidth/2-.012])box(g,'sliding-leaf-stile',[0,(low+high)/2,dz],[.025,high-low,.024],metal,.001);
  for(const y of [low+.017,high-.017])box(g,'sliding-leaf-rail',[0,y,0],[.025,.034,leafWidth],metal,.001);
  box(g,'safety-glass-intent',[0,(low+high)/2,0],[.006,high-low-.068,leafWidth-.048],glass,.0005);
  box(g,'recessed-door-pull',[.014,1.03,leafWidth/2-.012],[.003,.16,.014],metal,.001);
  g.userData={closedZ:zz,stackZ:inner0+leafWidth/2};leaves.push(g);
 }
 // Unselected 340 x 380mm rice-cooker envelope, on the existing exit-end worktop.
 const cooker=group(root,'rice-cooker-design-envelope',[4.055,.90,4.57]);cooker.rotation.y=Math.PI/2;
 const applianceFinish=new T.MeshStandardMaterial({color:'#e4e0d5',roughness:.38});
 box(cooker,'rice-cooker-base',[0,.01,0],[.34,.02,.38],metal,.025);
 const shell=new T.Shape(),w=.17,z=.19,corner=.045;
 shell.moveTo(-w+corner,-z);shell.lineTo(w-corner,-z);shell.quadraticCurveTo(w,-z,w,-z+corner);shell.lineTo(w,z-corner);shell.quadraticCurveTo(w,z,w-corner,z);shell.lineTo(-w+corner,z);shell.quadraticCurveTo(-w,z,-w,z-corner);shell.lineTo(-w,-z+corner);shell.quadraticCurveTo(-w,-z,-w+corner,-z);
 const hole=new T.Path();hole.absarc(0,0,.136,0,Math.PI*2,true);shell.holes.push(hole);
 const geo=new T.ExtrudeGeometry(shell,{depth:.25,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:2,curveSegments:32});geo.rotateX(-Math.PI/2);
 const body=new T.Mesh(geo,applianceFinish);body.name='rice-cooker-hollow-shell';body.position.y=.023;body.castShadow=body.receiveShadow=true;cooker.add(body);
 const profile=[[0,.024],[.10,.024],[.125,.045],[.13,.257],[.137,.264],[.137,.274],[.129,.274],[.123,.263],[.118,.049],[.095,.034],[0,.034]].map(p=>new T.Vector2(...p));
 const pot=new T.Mesh(new T.LatheGeometry(profile,64),metal);pot.name='rice-cooker-removable-inner-pot';pot.castShadow=pot.receiveShadow=true;cooker.add(pot);
 box(cooker,'rice-cooker-control',[0,.205,.1875],[.14,.043,.005],metal,.004);
 const lid=group(cooker,'rice-cooker-opening-lid',[0,.278,-.17]);
 box(lid,'rice-cooker-lid',[0,.010,.17],[.33,.020,.36],applianceFinish,.012);
 const innerLid=new T.Mesh(new T.CylinderGeometry(.132,.132,.008,48),metal);innerLid.name='rice-cooker-inner-lid';innerLid.position.set(0,-.004,.17);lid.add(innerLid);
 box(lid,'rice-cooker-grip',[0,.029,.17],[.10,.018,.028],metal,.009);
 const state={guests:false,doorOpen:true,pulled:-1,cookerOpen:false};
 const setCooker=value=>{state.cookerOpen=!!value;lid.rotation.x=state.cookerOpen?-Math.PI*100/180:0;model.updateMatrixWorld(true);changed();};
 const setGuests=value=>{state.guests=!!value;chairs.slice(4).forEach(o=>o.visible=state.guests);endSettings.forEach(o=>o.visible=state.guests);changed();};
 const setDoor=value=>{state.doorOpen=!!value;for(const g of leaves)g.position.z=state.doorOpen?g.userData.stackZ:g.userData.closedZ;model.updateMatrixWorld(true);changed();};
 const setPulled=(index=-1)=>{state.pulled=index;chairs.forEach((o,i)=>{o.position.fromArray(o.userData.origin);if(i===index)o.position.add(new T.Vector3(0,0,-.30).applyAxisAngle(new T.Vector3(0,1,0),o.rotation.y));});model.updateMatrixWorld(true);changed();};
 function snapshot(){
  model.updateMatrixWorld(true);
  const names=['kitchen-cooking-cabinets','kitchen-sink-cabinets','integrated-fridge','linen-sofa','flush-sideboard','flush-entry-cabinet','entry-low-cabinet','bar-service-cover','slim-coffee-table'];
  const fixed=names.map(n=>bounds(model.getObjectByName(n)));
  for(const side of ['left','right']){const bar=model.getObjectByName('lake-bar-'+side),surface=bar.getObjectByName('bar-cutout-top-'+side)||bar.children[0];fixed.push({...bounds(surface),name:'lake-bar-'+side});bar.children.filter(o=>o.name.startsWith('upholstered-counter-stool')).forEach(o=>fixed.push(bounds(o)));}
  const screen=bounds(model.getObjectByName('85-inch-screen')),eye=structuredClone(livingRevision.viewing.eye);
  const serviceItems=['sideboard-drawer-contents-0','sideboard-lower-contents-0','dispenser-flush-face'].map(n=>bounds(model.getObjectByName(n)));
  return {spec,wall:diningWall.spec,serviceItems,sideboardCounter:bounds(diningWall.cabinet.getObjectByName('sideboard-400mm-worktop')),viewing:{eye,screen,distance:Math.abs(screen.x1-eye[0])},state:{...state},table:bounds(table.getObjectByName('solid-wood-dining-top')),chairs:chairs.filter(o=>o.visible).map(bounds),fixed,leaves:leaves.map(bounds),cooker:bounds(cooker),worktop:bounds(model.getObjectByName('kitchen-west-worktop')),hob:bounds(model.getObjectByName('kitchen-hob')),door:{x,z0,z1,height:openingHeight,inner0,inner1,leafWidth,clearOpen:inner1-inner0-leafWidth}};
 }
 setGuests(false);setDoor(true);setPulled(-1);
 return {root,table,chairs,door,leaves,cooker,diningWall,state,setGuests,setDoor,setPulled,setCooker,snapshot};
}
