import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {entryCompositionSpec} from './entry-composition-spec.js';
import {createEntryComposition} from './entry-composition.js';
import {quartzMaterial} from './cabinet-finishes.js';
import {makeCup} from './tableware-details.js';

function coordinateBeverageZone(cabinet){
 const original=cabinet.getObjectByName('espresso-machine');original.visible=false;original.name='espresso-machine-before-front-study';
 const coffee=new T.Group();coffee.name='espresso-machine';coffee.position.set(.43,.907,-.088);cabinet.add(coffee);
 const cream=new T.MeshStandardMaterial({color:'#bbb7ad',roughness:.42}),dark=new T.MeshStandardMaterial({color:'#404640',roughness:.46}),steel=new T.MeshStandardMaterial({color:'#adb0aa',roughness:.28,metalness:.75});
 const box=(name,pos,size,mat=cream,r=.005)=>{const m=new T.Mesh(new RoundedBoxGeometry(...size,3,Math.min(r,...size.map(v=>v/4))),mat);m.name=name;m.position.fromArray(pos);m.castShadow=m.receiveShadow=true;coffee.add(m);return m;};
 box('compact-coffee-base',[0,.009,.020],[.18,.018,.32],dark,.012);
 for(const x of [-.075,.075])box('compact-coffee-side',[x,.159,.005],[.030,.28,.16],cream,.014);
 box('compact-coffee-head',[0,.264,.005],[.18,.09,.16],cream,.015);
 box('compact-coffee-rear',[0,.159,-.069],[.12,.24,.012],dark);
 box('compact-coffee-water-tank',[0,.154,-.106],[.13,.27,.064],new T.MeshPhysicalMaterial({color:'#64716b',transparent:true,opacity:.55,roughness:.15}),.012);
 box('compact-coffee-tank-lid',[0,.292,-.106],[.135,.008,.068],dark);
 box('compact-coffee-capsule-lever',[0,.315,.005],[.024,.008,.11],steel,.003);
 box('compact-coffee-spout',[0,.218,.091],[.025,.026,.030],steel);
 box('compact-coffee-drip-tray',[0,.031,.105],[.135,.008,.13],steel);
 for(let i=0;i<6;i++)box('compact-coffee-tray-slot',[-.05+i*.02,.0355,.11],[.003,.001,.095],dark,.0002);
 const button=new T.Mesh(new T.CylinderGeometry(.013,.013,.005,32),dark);button.rotation.x=Math.PI/2;button.position.set(.048,.267,.087);coffee.add(button);
 const cup=makeCup('compact-coffee-visible-cup',{radius:.030,height:.075});cup.position.set(0,.036,.11);coffee.add(cup);
 coffee.userData={nominalFootprint:[.18,.32],kind:'紧凑胶囊咖啡机外形示意',productSelected:false,source:'新机型尺寸方案，未缩放原357mm咖啡机',orientation:'正面朝向客餐厅'};
 cabinet.getObjectByName('mesh_715').material=quartzMaterial;
 return coffee;
}

// User-selected side: across the entrance, near kitchen/bed1.
// The original 3900mm sideboard is retained on the opposite side of the door.
export const diningWallSpec={start:3.80,end:6.13,wallZ:7.17,top:2.58,fridgeBay:1,
 fridge:{position:[5.63,0,6.85],rotation:Math.PI,width:.9,depth:.6},
 sideboard:{start:8.14,width:3.90,depth:.40,upperDepth:.35,counterTop:.905},
 shoe:{start:3.80,width:1.30,depth:.58,displayWidth:.20,bayWidth:.55},
 targets:{fridge:[5.63,6.02],sideboard:[8.65,6.22],bed1:[3.16,5.85]}};

function moveEverydayStorageNearTable(cabinet){
 // Local +x is the table end. Swap equal-sized compartments' contents only.
 const swap=(prefix,a,b)=>{
  const first=cabinet.getObjectByName(prefix+a),second=cabinet.getObjectByName(prefix+b);
  const pa=first.parent,pb=second.parent,delta=(b-a)*.65;
  pb.add(first);pa.add(second);first.position.x+=delta;second.position.x-=delta;
 };
 swap('sideboard-drawer-contents-',0,5);
 swap('sideboard-lower-contents-',0,5);
 swap('sideboard-lower-contents-',3,4);
 cabinet.userData.everydayStorage={cutleryDrawer:5,platesBay:5,cupsBay:4,revision:'kitchen-clear-15'};
}

export function installDiningWall(model){
 const s=diningWallSpec,cabinet=model.getObjectByName('flush-sideboard'),fridge=model.getObjectByName('integrated-fridge');
 fridge.position.fromArray(s.fridge.position);fridge.rotation.y=s.fridge.rotation;
 const finish=new T.MeshStandardMaterial({color:'#dedbd3',roughness:.6});
 for(const x of [-.49,.49]){const m=new T.Mesh(new RoundedBoxGeometry(.020,s.top,.610,2,.0015),finish);m.name='fridge-wall-run-end-strip';m.position.set(x,s.top/2,-.005);m.castShadow=m.receiveShadow=true;fridge.add(m);}
 fridge.userData={...fridge.userData,reviewTop:s.top,reviewPosition:s.fridge.position,installationStatus:'跨过入户门，厨房/次卧侧玄关柜靠门端；入口留200mm墙段，机型散热待核'};
 const previous=model.getObjectByName('entry-single-side-layout');previous.visible=false;previous.name='entry-layout-before-fridge';
 previous.traverse(o=>{if(o!==previous)o.name+='-before-fridge';});
 const layout=structuredClone(entryCompositionSpec);
 layout.name='厨房侧玄关 · 冰箱与封闭鞋柜';
 layout.tall={...layout.tall,width:s.shoe.width,depth:s.shoe.depth,shoesPerRow:4,
  bays:[{x:3.80,width:.55},{x:4.55,width:.55}],description:'550mm封闭鞋柜＋200mm展示格＋550mm镜门鞋柜；鞋柜比原版窄260mm'};
 layout.display={...layout.display,x:4.35,depth:s.shoe.depth};layout.mirror.width=.414;
 const entry=createEntryComposition(model,layout),entryRoot=model.getObjectByName('entry-single-side-layout');
 entryRoot.getObjectByName('entry-welcome-niche').removeFromParent();
 const shoes=entryRoot.getObjectByName('flush-entry-cabinet');
 const state={storageOpen:false,shoesOpen:false};
 function setStorage(value){state.storageOpen=!!value;const d=window.sideboardDetailsDebug;d.reset();if(value){d.setDrawer(5);d.setDoor('base',5);}model.updateMatrixWorld(true);}
 function setShoes(value){state.shoesOpen=!!value;entry.setOpen(value);model.updateMatrixWorld(true);}
 const coffee=coordinateBeverageZone(cabinet);
 moveEverydayStorageNearTable(cabinet);
 model.updateMatrixWorld(true);
 return {spec:s,cabinet,fridge,coffee,shoes,entry,doors:window.sideboardDetailsDebug.doors.base,drawers:window.sideboardDetailsDebug.drawers,state,setStorage,setShoes};
}
