import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {quartzMaterial,finishWoodPanel} from './cabinet-finishes.js';
import {makeCup,makePlate} from './tableware-details.js';
import {wholeWallSpec as s} from './entry-whole-wall-spec.js';

const cream=new T.MeshStandardMaterial({color:'#d9d6ce',roughness:.68}),oak=new T.MeshStandardMaterial({color:'#cbb899',roughness:.75}),dark=new T.MeshStandardMaterial({color:'#555c51',roughness:.65}),bronze=new T.MeshStandardMaterial({color:'#898273',metalness:.48,roughness:.43});
const glow=new T.MeshStandardMaterial({color:'#fff2d8',emissive:'#ffe5b9',emissiveIntensity:.42});
const group=(parent,name)=>{const g=new T.Group();g.name=name;parent.add(g);return g;};
function box(parent,name,r,bottom,height,mat=cream){
 const w=r[2]-r[0],d=r[3]-r[1],o=new T.Mesh(new RoundedBoxGeometry(w,height,d,3,Math.min(.004,w/5,d/5,height/5)),mat);
 o.name=name;o.position.set((r[0]+r[2])/2,bottom+height/2,(r[1]+r[3])/2);o.castShadow=o.receiveShadow=true;parent.add(o);
 if(mat===oak)finishWoodPanel(o,{interior:true});return o;
}
const bounds=o=>{const b=new T.Box3().setFromObject(o);return {name:o.name,x1:b.min.x,x2:b.max.x,z1:b.min.z,z2:b.max.z,y1:b.min.y,y2:b.max.y};};
function bottle(parent,name,x,z,bottom,color='#536b4a',height=.31){
 const r=.038,profile=[[0,0],[r*.80,0],[r,.02],[r,height*.65],[r*.55,height*.77],[r*.38,height*.81],[r*.38,height],[0,height]].map(p=>new T.Vector2(...p));
 const o=new T.Mesh(new T.LatheGeometry(profile,32),new T.MeshStandardMaterial({color,roughness:.28}));o.name=name;o.position.set(x,bottom,z);o.castShadow=true;parent.add(o);
 box(parent,name+'-label',[x-r*.76,z-r-.001,x+r*.76,z-r+.001],bottom+height*.21,height*.22,cream);
}
function shelfCase(parent,name,x,width,front,bottom,top,depth){
 const g=group(parent,name),back=front+depth;
 box(g,name+'-back',[x,back-.016,x+width,back],bottom,top-bottom,oak);
 for(const xx of[x,x+width-.018])box(g,name+'-side',[xx,front,xx+.018,back],bottom,top-bottom);
 for(const y of[bottom,top-.018])box(g,name+'-shelf',[x+.018,front,x+width-.018,back-.016],y,.018,oak);return g;
}
function door(parent,name,x,width,front,bottom,top){
 const g=group(parent,name);g.position.set(x,0,front);
 box(g,name+'-front',[.003,0,width-.003,.020],bottom,top-bottom);
 box(g,name+'-grip',[width-.034,-.005,width-.027,0],top-bottom>1?1.03:bottom+.11,.17,bronze);return g;
}
const taupe=new T.MeshStandardMaterial({color:'#9b8c80',roughness:.78});
const drawerTone=new T.MeshStandardMaterial({color:'#877a70',roughness:.63});
function drawerUnit(parent,name,x,w,front,back,lo,hi,mat=cream){
 const g=group(parent,name);
 box(g,name+'-front',[x+.003,front,x+w-.003,front+.020],lo,hi-lo,mat);
 box(g,name+'-floor',[x+.026,front+.030,x+w-.026,back-.030],lo+.020,.015,oak);
 for(const xx of[x+.026,x+w-.041])box(g,name+'-side',[xx,front+.030,xx+.015,back-.030],lo+.035,hi-lo-.050,oak);
 box(g,name+'-back',[x+.041,back-.045,x+w-.041,back-.030],lo+.035,hi-lo-.050,oak);
 box(g,name+'-recessed-pull',[x+.045,front+.017,x+w-.045,front+.025],hi-.012,.008,dark);
 return g;
}
function shoePair(parent,name,x,z,y){
 const mat=new T.MeshStandardMaterial({color:'#b6ac9b',roughness:.9});
 for(const dx of[-.060,.060]){
  box(parent,name+'-sole',[x+dx-.048,z,x+dx+.048,z+.285],y,.018,cream);
  box(parent,name+'-upper',[x+dx-.045,z+.020,x+dx+.045,z+.250],y+.018,.072,mat);
 }
}
function entryDrop(parent){
 const a=s.drop,x=a.start,W=a.width,f=s.wallZ-a.depth,g=group(parent,'entry-daily-drop'),drawers=[],trays=[];
 box(g,'drop-full-height-taupe-back',[x,s.wallZ-.025,x+W,s.wallZ],.02,a.top-.02,taupe);
 // No general-purpose countertop: bag hook and a small key/card drawer only.
 const kx=x+W-a.keyWidth-.02,kf=s.wallZ-a.keyDepth;
 box(g,'drop-key-case-back',[kx,s.wallZ-.040,kx+a.keyWidth,s.wallZ-.025],a.drawerBottom,a.counterTop-a.drawerBottom,oak);
 for(const xx of[kx,kx+a.keyWidth-.018])box(g,'drop-key-short-side',[xx,kf+.020,xx+.018,s.wallZ-.025],a.drawerBottom,a.counterTop-a.drawerBottom,drawerTone);
 const top=box(g,'entry-prep-worktop',[kx,kf,kx+a.keyWidth,s.wallZ-.025],a.counterTop-.016,.016,drawerTone);
 const daily=drawerUnit(g,'drop-daily-drawer-0',kx,a.keyWidth,kf,s.wallZ-.025,a.drawerBottom+.020,a.counterTop-.020,drawerTone);daily.userData.travel=.10;drawers.push(daily);
 box(daily,'entry-wallet',[kx+.03,kf+.04,kx+.16,kf+.10],1.025,.023,dark);
 const ring=new T.Mesh(new T.TorusGeometry(.014,.002,8,20),bronze);ring.name='drop-key-ring';ring.rotation.x=Math.PI/2;ring.position.set(kx+.18,1.029,kf+.10);daily.add(ring);
 // Full-width trays use the low zone as two shoe levels instead of a tall void.
 for(const xx of[x,x+W-.018])box(g,'drop-shoe-rack-side',[xx,f,xx+.018,s.wallZ-.025],.03,.45,drawerTone);
 box(g,'drop-shoe-rack-top',[x,f,x+W,s.wallZ-.025],.464,.016,drawerTone);
 box(g,'drop-shoe-rack-plinth',[x+.018,f+.06,x+W-.018,s.wallZ-.025],.01,.035,dark);
 for(const [i,y]of a.trayLevels.entries()){
  const t=group(g,'drop-pullout-shoe-tray-'+i);t.userData.travel=a.trayTravel;trays.push(t);
  box(t,'drop-shoe-tray-bottom',[x+.028,f+.022,x+W-.028,s.wallZ-.044],y,.015,bronze);
  for(const xx of[x+.028,x+W-.040])box(t,'drop-shoe-tray-side',[xx,f+.022,xx+.012,s.wallZ-.044],y+.015,.035,bronze);
  box(t,'drop-shoe-tray-low-front',[x+.028,f+.018,x+W-.028,f+.030],y+.015,.025,drawerTone);
  box(t,'drop-shoe-tray-pull',[x+.23,f+.007,x+.37,f+.018],y+.023,.015,bronze);
  for(const dx of[.16,.44])shoePair(t,'entry-daily-shoes',x+dx,f+.055,y+.015);
  for(const xx of[x+.018,x+W-.026])box(g,'drop-shoe-tray-runner',[xx,f+.045,xx+.008,s.wallZ-.049],y+.005,.020,dark);
 }
 const bx=x+.165,bag=group(g,'entry-backpack'),fabric=new T.MeshStandardMaterial({color:'#b8a68f',roughness:.96}),bz=s.wallZ-.14;
 box(g,'entry-bag-hook-back',[bx-.014,s.wallZ-.056,bx+.014,s.wallZ-.026],1.50,.085,bronze);
 box(g,'entry-bag-hook-arm',[bx-.01,s.wallZ-.143,bx+.01,s.wallZ-.035],1.517,.014,bronze);
 const body=new T.Mesh(new RoundedBoxGeometry(.28,.38,.21,4,.025),fabric);body.name='backpack-body';body.position.set(bx,1.30,bz);body.castShadow=true;bag.add(body);
 box(bag,'backpack-front-pocket',[bx-.10,bz-.120,bx+.10,bz-.103],1.15,.15,fabric);
 const handle=new T.Mesh(new T.TorusGeometry(.037,.006,8,24,Math.PI),fabric);handle.name='backpack-carry-loop';handle.position.set(bx,1.49,bz);bag.add(handle);
 box(g,'drop-shoe-task-light',[x+.04,f+.045,x+W-.04,f+.055],.458,.006,glow);
 g.userData={alongWallMm:600,wallProjectionMm:400,sideOuterWidthMm:600,nicheClearWidthMm:240,nicheClearDepthMm:155,nicheClearHeightMm:130,slipperClearMm:200,opening:'towards-room-negative-z',seat:false,style:'bag-hook-key-drawer-two-shoe-trays',drawerCount:1,trayCount:2,trayTravelMm:250,keyDrawerTravelMm:100,illustratedDailyPairs:4,mountingVerified:false};
 return {g,drawers,trays,top};
}
function entryFront(parent){
 const a=s.shoes,x=a.start,f=s.wallZ-a.depth,g=group(parent,'flush-entry-cabinet'),doors=[],drawers=[],shoeDrawers=[];
 const ux=x,uw=a.utilityWidth,cx=ux+uw,cw=a.coatWidth,sx=cx+cw,sw=a.shoeWidth;
 // The clean-supplies cabinet is the only cabinet next to the public washstand.
 const utility=shelfCase(g,'entry-bath-supplies',ux,uw,f+.02,.10,a.top,a.depth-.02);
 box(utility,'utility-upper-separation',[ux+.020,f+.025,cx-.020,s.wallZ-.018],.925,.018,oak);
 for(const [i,lo,hi]of[[0,.120,.370],[1,.384,.634],[2,.648,.913]]){
  const d=drawerUnit(g,'entry-elder-drawer-'+i,ux,uw,f,s.wallZ,lo,hi);drawers.push(d);
  for(let k=0;k<3;k++)box(d,'elder-clean-towel',[ux+.05,f+.07,cx-.05,f+.40],lo+.037+k*.045,.042,cream);
 }
 for(const y of[1.25,1.63,2.08])box(utility,'bath-adjustable-shelf',[ux+.020,f+.025,cx-.020,s.wallZ-.018],y,.018,oak);
 for(const y of[.95,1.65,2.10])box(utility,'bath-clean-reserve',[ux+.065,f+.10,cx-.065,f+.40],y,.25,cream);
 doors.push(door(g,'entry-bath-daily-door',ux,uw,f,.950,2.073));
 doors.push(door(g,'entry-bath-upper-door',ux,uw,f,2.10,a.top-.004));
 const coat=shelfCase(g,'entry-coat-clean-compartment',cx,cw,f+.02,.10,a.top,a.depth-.02);
 for(const y of[.52,2.09])box(coat,'coat-solid-separation',[cx+.020,f+.022,cx+cw-.020,s.wallZ-.018],y,.018,oak);
 box(coat,'coat-hanging-rail',[cx+.025,f+.295,cx+cw-.025,f+.315],1.79,.020,bronze);
 for(const [i,col]of['#b8a58d','#637064'].entries()){
  const outline=new T.Shape();[[-.07,0],[-.21,-.08],[-.245,-.55],[-.17,-.57],[-.145,-.21],[-.145,-.99],[.145,-.99],[.145,-.21],[.17,-.57],[.245,-.55],[.21,-.08],[.07,0]].forEach(([u,v],j)=>j?outline.lineTo(u,v):outline.moveTo(u,v));outline.closePath();
  const jacket=new T.Mesh(new T.ExtrudeGeometry(outline,{depth:.032,bevelEnabled:false}),new T.MeshStandardMaterial({color:col,roughness:.95}));jacket.name='entry-hanging-jacket';jacket.rotation.y=Math.PI/2;jacket.position.set(cx+.105+i*.16,1.74,f+.305);coat.add(jacket);
  box(coat,'coat-hanger-neck',[cx+.10+i*.16,f+.298,cx+.12+i*.16,f+.312],1.735,.065,bronze);
 }
 doors.push(door(g,'entry-coat-door',cx,cw,f,.548,2.086));doors.push(door(g,'entry-clean-upper-door',cx,cw,f,2.11,a.top-.004));
 for(const [i,lo,hi]of[[0,.120,.310],[1,.324,.512]])drawers.push(drawerUnit(g,'entry-coat-accessory-drawer-'+i,cx,cw,f,s.wallZ,lo,hi));
 const shoe=shelfCase(g,'entry-shoe-compartment',sx,sw,f+.02,.10,a.top,a.depth-.02);
 box(shoe,'shoe-upper-separation',[sx+.020,f+.025,sx+sw-.020,s.wallZ-.018],.925,.018,oak);
 for(const [i,lo,hi]of[[0,.120,.370],[1,.384,.634],[2,.648,.913]]){
  const d=drawerUnit(g,'entry-closed-shoe-drawer-'+i,sx,sw,f,s.wallZ,lo,hi);d.userData.shoeDrawer=true;drawers.push(d);shoeDrawers.push(d);
  for(let j=0;j<3;j++)shoePair(d,'shoe-drawer-pair',sx+.14+j*.26,f+.070,lo+.035);
 }
 for(const y of[.950,1.220,1.490,1.760,2.030]){
  box(shoe,'shoe-adjustable-shelf',[sx+.020,f+.029,sx+sw-.020,s.wallZ-.018],y,.018,oak);
  for(let i=0;i<3;i++)shoePair(shoe,'stored-shoes',sx+.14+i*.26,f+.07,y+.018);
 }
 for(let i=0;i<2;i++)doors.push(door(g,'shoe-door-main-'+i,sx+i*sw/2,sw/2,f,.951,a.top-.004));
 box(g,'entry-recessed-plinth',[x+.035,f+.08,x+a.width-.035,s.wallZ-.03],.02,.08,dark);
 g.userData={widthMm:1730,overallDepthMm:600,shoeWidthMm:800,coatWidthMm:400,utilityWidthMm:530,prepWidthMm:240,illustratedPairs:24,capacityCertified:false,clothesSeparateFromShoes:true,bathSuppliesSeparate:true};
 return {g,doors,drawers,shoeDrawers};
}
function leftWelcome(parent){
 const a=s.welcome,x=a.start,f=s.wallZ-a.depth,g=group(parent,'entry-left-welcome');
 box(g,'welcome-taupe-back',[x,s.wallZ-.025,x+a.width,s.wallZ],.02,a.top-.02,taupe);
 for(const xx of[x,x+a.width-.018])box(g,'welcome-short-side',[xx,f+.02,xx+.018,s.wallZ-.025],a.bottom,a.counterTop-a.bottom,drawerTone);
 box(g,'welcome-case-floor',[x+.018,f+.02,x+a.width-.018,s.wallZ-.025],a.bottom,.018,oak);
 box(g,'welcome-top',[x,f,x+a.width,s.wallZ-.025],a.counterTop-.02,.02,drawerTone);
 const drawer=drawerUnit(g,'welcome-spare-drawer',x,a.width,f,s.wallZ-.025,a.bottom+.022,a.counterTop-.025,drawerTone);
 // A low bowl on a quiet panel keeps this side useful for post/grocery staging.
 const bowl=new T.Mesh(new T.LatheGeometry([[.045,0],[.075,.01],[.105,.055],[.10,.06],[.07,.02],[.045,.01]].map(p=>new T.Vector2(...p)),40),new T.MeshStandardMaterial({color:'#6c745f',roughness:.64}));
 bowl.name='welcome-ceramic-bowl';bowl.position.set(x+.32,a.counterTop,f+.15);bowl.castShadow=true;g.add(bowl);
 box(g,'welcome-underlight',[x+.04,f+.07,x+a.width-.04,f+.08],a.bottom-.006,.006,glow);
 g.userData={widthMm:600,depthMm:300,frontFacing:true,fullHeightEndPanel:false};
 return {g,drawer};
}
export function installWholeWall(model){
 if(Math.max(s.fridge.bayStart+s.fridge.bayWidth,s.drinks.start+s.drinks.width,s.shoes.start+s.shoes.width)>s.tvBoundaryX+.001)throw Error('柜体末端超过电视墙投影');
 const beforeFixed=Object.fromEntries(s.fixed.map(n=>[n,bounds(model.getObjectByName(n))]));
 model.getObjectByName('entry-single-side-layout')?.removeFromParent();
 model.getObjectByName('entry-intercom-control-zone')?.removeFromParent();
 const old=model.getObjectByName('flush-sideboard');old.removeFromParent();
 const root=group(model,'entry-whole-wall-proposal'),drawers=[],moving=[],sliding=[];
 const frontEntry=entryFront(root),shoes=frontEntry.g,shoeDoors=frontEntry.doors;
 const drop=entryDrop(root),welcome=leftWelcome(root);
 let shoesOpen=false;
 const entry={setOpen(value){shoesOpen=!!value;shoeDoors.forEach(g=>g.rotation.y=shoesOpen?Math.PI/2:0);frontEntry.drawers.forEach(d=>d.position.z=shoesOpen?-.30:0);drop.drawers.forEach(d=>d.position.z=shoesOpen?-.10:0);drop.trays.forEach(d=>d.position.z=shoesOpen?-.25:0);model.updateMatrixWorld(true);},get state(){return {opened:shoeDoors.some(d=>Math.abs(d.rotation.y)>.001)||[...frontEntry.drawers,...drop.drawers,...drop.trays].some(d=>Math.abs(d.position.z)>.001)};}};
 // Thin controls and key ledge are mounted on the actual wall.
 const controls=group(root,'whole-wall-controls'),c=s.controls,cx=c.start+c.width/2;

 for(const [name,y,w,h]of[['video-intercom',1.50,.22,.15],['smart-control',1.27,.17,.085]]){
  box(controls,name,[cx-w/2,7.098,cx+w/2,7.12],y,h);
  box(controls,name+'-screen',[cx-w*.40,7.094,cx+w*.40,7.098],y+.018,h-.036,dark);
 }
 controls.userData={wiringVerified:false,depthMm:46,keysMovedToDrop:true};
 // 900 x 600mm body-only layout. No invented 50mm rear gap. Actual product
 // installation space is unverified and can change the final cabinet front plane.
 const fridge=model.getObjectByName('integrated-fridge');fridge.position.fromArray(s.fridge.position);fridge.rotation.y=s.fridge.rotation;
 for(const n of['fridge-upper-storage','fridge-upper-door'])fridge.getObjectByName(n).clear();
 for(const o of [...fridge.children])if(['fridge-surround-side','fridge-wall-run-end-strip'].includes(o.name))o.removeFromParent();
 for(const x of[-.491,.491])box(fridge,'fridge-surround-side',[x-.009,-.30,x+.009,.30],0,s.fridge.top);
 const upper=fridge.getObjectByName('fridge-upper-storage'),upperDoor=fridge.getObjectByName('fridge-upper-door');
 for(const y of[2.03,2.382])box(upper,'fridge-new-top-shelf',[-.462,-.30,.462,.30],y,.018,oak);
 box(upper,'fridge-new-top-back',[-.462,-.30,.462,-.284],2.048,.334,oak);
 box(upperDoor,'fridge-new-top-door',[.002,-.02,.922,0],2.051,.315);
 // Finish study for a different, panel-ready product category. These are not
 // extra doors installed onto the former freestanding appliance. Its envelope
 // and opening animation remain provisional until a manufacturer is selected.
 fridge.traverse(o=>{
  if(o.isMesh&&/^fridge-appliance-door/.test(o.name))o.material=cream;
  if(o.name==='fridge-temperature-display')o.visible=false;
 });
 fridge.userData={...fridge.userData,reviewPosition:s.fridge.position,reviewTop:s.fridge.top,panelReadyIntent:true,productSelected:false,installationStatus:'90×60cm机身示意，未计产品安装净空；不是已验证的600mm成品安装柜'};
 const q=s.drinks,front=s.wallZ-q.depth,bar=group(root,'whole-wall-drinks');
 const body=shelfCase(bar,'drink-base-case',q.start,q.width,front+.02,.09,.881,q.depth-.02);
 box(body,'drink-recessed-plinth',[q.start+.04,front+.08,q.start+q.width-.04,s.wallZ-.03],.02,.07,dark);
 box(body,'drink-centre-partition',[q.start+.791,front+.02,q.start+.809,s.wallZ-.016],.108,.755,oak);
 const counter=box(bar,'whole-wall-drinks-worktop',[q.start,front-q.counterOverhang,q.start+q.width,s.wallZ],.881,.024,quartzMaterial);
 box(bar,'drink-stone-backsplash',[q.start,s.wallZ-.018,q.start+q.width,s.wallZ],q.counterTop,q.upperBottom-q.counterTop,quartzMaterial);
 box(bar,'drink-low-stone-upstand',[q.start,s.wallZ-.032,q.start+q.width,s.wallZ-.018],q.counterTop,.14,quartzMaterial);
 // Continuous 2m countertop: no vertical dividers or fixed appliance cubbies
 // above it. Structural partitions stay inside the lower/upper storage only.
 const upperFront=s.wallZ-q.upperDepth;
 shelfCase(bar,'drink-upper',q.start+.020,q.width-.040,upperFront+.02,q.upperBottom,q.top-.018,q.upperDepth-.02);
 const upperLeafWidth=(q.width-.040)/4;
 for(let i=0;i<4;i++)moving.push(door(bar,'drink-upper-door-'+i,q.start+.020+i*upperLeafWidth,upperLeafWidth,upperFront,q.upperBottom+.003,q.top-.022));
 // The 550mm top recesses 50mm behind the 600mm tall-cabinet front.
 // The lower cabinet follows it inward (530mm) so the stone covers its top.
 // Shallower upper cupboards leave the whole 2m work surface open.
 const frameFront=s.wallZ-q.frameDepth;
 box(bar,'drink-unified-top-return',[s.fridge.bayStart+s.fridge.bayWidth,s.wallZ-q.upperDepth,q.start+q.width,s.wallZ],q.top-.018,.018);
 const endPanel=box(bar,'drink-unified-end-return',[q.start+q.width,frameFront,q.start+q.width+q.frameEndPanel,s.wallZ],0,q.top);
 // The upper carcass is inset 20mm; close that joint behind the end panel.
 box(bar,'drink-upper-end-filler',[q.start+q.width-.020,upperFront,q.start+q.width,s.wallZ],q.upperBottom,q.top-.018-q.upperBottom);
 bar.userData={cabinetDepthMm:530,upperDepthMm:350,counterDepthMm:550,assemblyDepthMm:600,counterRecessMm:50,endPanelMm:18,fullHeightEndPanel:true};
 box(bar,'drink-task-light',[q.start+.05,upperFront+.08,q.start+q.width-.05,upperFront+.093],q.upperBottom-.009,.008,glow);
 // One shallow shelf divides the tall niche without crossing the dispenser bay.
 const sh=q.shelf,shelfX=q.start+sh.startOffset,shelfEnd=q.start+q.width-sh.endInset,shelfBack=s.wallZ-.019,shelfFront=shelfBack-sh.depth;
 const openShelf=box(bar,'drink-open-shelf',[shelfX,shelfFront,shelfEnd,shelfBack],sh.bottom,sh.thickness,oak);
 const shelfTop=sh.bottom+sh.thickness;
 box(bar,'drink-shelf-wall-rail',[shelfX+.03,shelfBack-.018,shelfEnd-.03,shelfBack],sh.bottom-.018,.018,bronze);
 for(const x of[shelfX+.12,(shelfX+shelfEnd)/2,shelfEnd-.12])box(bar,'drink-shelf-concealed-support',[x-.009,shelfBack-.16,x+.009,shelfBack],sh.bottom-.004,.010,bronze);
 box(bar,'drink-shelf-underlight',[shelfX+.04,shelfFront+.028,shelfEnd-.04,shelfFront+.039],sh.bottom-.006,.006,glow);
 for(const x of[shelfX+.15,shelfX+.34]){const cup=makeCup('drink-shelf-daily-cup',{radius:.04,height:.105});cup.position.set(x,shelfTop,shelfFront+.09);bar.add(cup);}
 for(const [x,h]of[[shelfX+.91,.14],[shelfX+1.09,.18]]){
  const jar=new T.Mesh(new T.CylinderGeometry(.057,.057,h,32),new T.MeshStandardMaterial({color:'#b4b5a2',roughness:.55}));jar.name='drink-shelf-tea-jar';jar.position.set(x,shelfTop+h/2,shelfFront+.12);jar.castShadow=true;bar.add(jar);
  const lid=new T.Mesh(new T.CylinderGeometry(.061,.061,.012,32),bronze);lid.name='drink-shelf-jar-lid';lid.position.set(x,shelfTop+h+.006,shelfFront+.12);bar.add(lid);
 }
 openShelf.userData={widthMm:Math.round((shelfEnd-shelfX)*1000),depthMm:220,clearBelowMm:Math.round((sh.bottom-q.counterTop)*1000),clearAboveMm:Math.round((q.upperBottom-shelfTop)*1000),mountingVerified:false};

 const bands=[[.112,.344],[.352,.596],[.604,.874]];
 for(let i=0;i<3;i++){
  const [bottom,top]=bands[i],g=group(bar,'drink-drawer-'+i);drawers.push(g);const x=q.start;
  box(g,'drink-drawer-floor',[x+.03,front+.035,x+.770,s.wallZ-.03],bottom,.016,oak);
  for(const xx of[x+.025,x+.755])box(g,'drink-drawer-side',[xx,front+.035,xx+.015,s.wallZ-.03],bottom+.016,top-bottom-.036,oak);
  box(g,'drink-drawer-front',[x+.003,front,x+.797,front+.02],bottom,top-bottom);
  box(g,'drink-drawer-grip',[x+.04,front-.002,x+.76,front+.002],top-.009,.006,dark);
  if(i===0)for(const xx of[x+.21,x+.57])for(let k=0;k<6;k++){const p=makePlate('dining-stored-plate',.125);p.position.set(xx,bottom+.021+k*.014,front+.20);g.add(p);}
  if(i===1)for(let k=0;k<4;k++){const cup=makeCup('dining-daily-cup',{radius:.04,height:.12});cup.position.set(x+.13+k*.17,bottom+.016,front+.20);g.add(cup);}
  if(i===2){for(let k=0;k<4;k++)box(g,'cutlery-divider',[x+.04+k*.15,front+.06,x+.05+k*.15,s.wallZ-.06],bottom+.016,.075,oak);for(let k=0;k<3;k++)for(let j=0;j<3;j++)box(g,'daily-cutlery',[x+.07+k*.15,front+.12+j*.07,x+.16+k*.15,front+.135+j*.07],bottom+.018,.006,bronze);box(g,'napkin-stack',[x+.53,front+.08,x+.74,s.wallZ-.05],bottom+.016,.09,cream);}
 }
 const wineLeafWidth=(q.width-.80)/2;
 for(let i=0;i<2;i++){const leaf=door(bar,'drink-wine-sliding-front-'+i,q.start+.80+i*wineLeafWidth,wineLeafWidth,front+(i===0?.024:0),.10,.874);leaf.userData={closedX:leaf.position.x,travel:wineLeafWidth-.025,moving:i===0};sliding.push(leaf);}
 box(bar,'drink-wine-shelf',[q.start+.818,front+.025,q.start+q.width-.018,s.wallZ-.018],.48,.018,oak);
 for(const [row,y]of[[0,.112],[1,.498]])for(let i=0;i<6;i++)bottle(bar,'dining-stock-bottle',q.start+.88+i*.095,front+.18,y,row?'#acb5a4':'#60705a',row?.25:.31);
 // New wall-mounted dispenser envelope, not the old model scaled down to fit.
 const near=s.applianceEnd==='near',applianceStart=near?q.start:q.start+q.width-s.applianceAllowance;
 const drinkMachine=group(bar,'whole-wall-dispenser'),dx=applianceStart+.19,dz=s.wallZ-.178;
 box(drinkMachine,'pipeline-machine-body',[dx,dz,dx+.30,dz+.14],1.28,.42);
 box(drinkMachine,'pipeline-machine-face',[dx+.008,dz-.007,dx+.292,dz],1.295,.391,dark);
 box(drinkMachine,'pipeline-machine-display',[dx+.08,dz-.010,dx+.22,dz-.007],1.52,.055,bronze);
 box(drinkMachine,'pipeline-machine-spout',[dx+.125,dz-.035,dx+.175,dz],1.29,.025,bronze);
 box(drinkMachine,'pipeline-machine-drip-tray',[dx+.025,dz-.09,dx+.275,dz+.08],1.07,.018,dark);
 drinkMachine.userData={proposedEnvelopeMm:[300,140,420],productSelected:false,waterRoute:null,powerRoute:null};
 const coffee=old.getObjectByName('espresso-machine');old.updateMatrixWorld(true);bar.attach(coffee);let bb=new T.Box3().setFromObject(coffee);
 coffee.position.x+=applianceStart+.01-bb.min.x;coffee.position.z+=front+.025-bb.min.z;coffee.position.y+=q.counterTop-bb.min.y;
 const cup=makeCup('drinks-ready-cup');cup.position.set(applianceStart+.36,q.counterTop,front+.075);bar.add(cup);
 // The 500mm appliance allowance is a planning allowance, with no divider or
 // built-in cubby. The existing compact coffee model is not a generic fit proof.
 const clearCounter={x1:near?q.start+s.applianceAllowance:q.start,x2:near?q.start+q.width:q.start+q.width-s.applianceAllowance,z1:front-q.counterOverhang,z2:s.wallZ-.032,y1:q.counterTop,y2:sh.bottom};
 // Remove the display carcass, preserve electrical boxes and the actual beam.
 const family=model.getObjectByName('family-display-wall');
 for(const n of['entry-corner-floor-ceramics','entry-service-shallow-carcass','entry-service-niche-removable-back','entry-service-niche-decor','entry-service-niche-light-source'])family.getObjectByName(n)?.removeFromParent();
 const servicePanels=[];
 for(const id of['lower','upper']){
  const cover=family.getObjectByName('entry-service-cover-hinge-'+id);cover.position.z=s.wallZ-.040;
  for(const rib of [...cover.children])if(rib.name.startsWith('entry-service-cover-rib'))rib.removeFromParent();
  cover.traverse(o=>{if(o.isMesh)o.material=cream;});servicePanels.push(cover);
 }
 const service=family.userData.service;
 box(family,'service-middle-flat-panel',[service.startX+.006,s.wallZ-.044,service.startX+service.width-.006,s.wallZ-.026],.906,.558,cream);
 family.userData={...family.userData,storage:'50mm薄检修饰面，无收纳柜和展示层板',serviceDepthMm:50};
 let open=false,serviceOpen=false;
 function setStorage(value){open=!!value;drawers.forEach(d=>d.position.z=open?-.30:0);for(const leaf of sliding)leaf.position.x=leaf.userData.closedX+(open&&leaf.userData.moving?leaf.userData.travel:0);model.updateMatrixWorld(true);}
 function setService(value){serviceOpen=!!value;servicePanels.forEach(p=>p.rotation.y=serviceOpen?-Math.PI/2:0);model.updateMatrixWorld(true);}
 function setGuests(value){const dining=window.diningStudy;dining.setGuests(value);const delta=value?-.15:0;dining.table.position.z=4.55+delta;for(const chair of dining.chairs)chair.position.z=chair.userData.origin[2]+delta;model.updateMatrixWorld(true);}
 function closedFridgeBounds(){const[w,h,d]=fridge.userData.nominalBody,b=new T.Box3(new T.Vector3(-w/2,0,-d/2),new T.Vector3(w/2,h,d/2)).applyMatrix4(fridge.matrixWorld);return {name:'fridge-closed-body-envelope',x1:b.min.x,x2:b.max.x,z1:b.min.z,z2:b.max.z,y1:b.min.y,y2:b.max.y};}
 function snapshot(){
  model.updateMatrixWorld(true);const dining=window.diningStudy;
  const names=['kitchen-cooking-cabinets','kitchen-sink-cabinets','integrated-fridge','linen-sofa','slim-coffee-table','tv-low-console','tv-display-lake','bath1-vanity'];
  const fixed=names.map(n=>model.getObjectByName(n)).filter(Boolean).map(bounds);for(const o of[shoes,drop.g,welcome.g,controls])fixed.push(bounds(o));
  // Separate the tall end panel from the working cabinets. The overhead return
  // is above the walking proxy and must not fill the open recess on the floor.
  const useBox=new T.Box3();bar.traverse(o=>{if(!o.isMesh||o.name==='drink-unified-end-return')return;const b=new T.Box3().setFromObject(o);if(b.min.y<1.8)useBox.union(b);});
  fixed.push({name:bar.name,x1:useBox.min.x,x2:useBox.max.x,z1:useBox.min.z,z2:useBox.max.z,y1:useBox.min.y,y2:useBox.max.y});
  fixed.push(bounds(bar.getObjectByName('drink-unified-end-return')));
  for(const side of['left','right']){const wing=model.getObjectByName('lake-bar-'+side);fixed.push(bounds(wing.getObjectByName('bar-cutout-top-'+side)||wing.children[0]));for(const chair of wing.children.filter(o=>o.visible&&o.name.startsWith('upholstered-counter-stool')))fixed.push(bounds(chair));}
  for(const p of servicePanels)fixed.push(bounds(p));
  const db=new T.Box3().setFromObject(dining.door);
  const elevation=[];for(const g of[shoes,drop.g,welcome.g,controls,bar,fridge,family,model.getObjectByName('entry-service-beam-study')])g.traverse(o=>{if(!o.isMesh)return;for(let p=o;p;p=p.parent)if(!p.visible)return;const m=Array.isArray(o.material)?o.material[0]:o.material;const b=bounds(o);elevation.push({...b,owner:g.name,color:'#'+(m.color?.getHexString()||'ddd5c4')});});
  return {spec:s,elevation,entryPrep:bounds(drop.top),entryZones:shoes.userData,dropDimensions:drop.g.userData,clearCounter,table:bounds(dining.table.getObjectByName('solid-wood-dining-top')),chairs:dining.chairs.filter(o=>o.visible).map(bounds),fixed,counter:bounds(counter),drinksOpenShelf:{...bounds(openShelf),...openShelf.userData},drinksEndPanel:bounds(endPanel),fridge:closedFridgeBounds(),dispenser:bounds(drinkMachine),coffee:bounds(coffee),leaves:dining.leaves.map(bounds),door:{x:5.82,z0:db.min.z,z1:db.max.z},fixedBefore:beforeFixed,fixedAfter:Object.fromEntries(s.fixed.map(n=>[n,bounds(model.getObjectByName(n))])),state:{guests:dining.state.guests,storage:open,shoes:entry.state.opened,service:serviceOpen,fridge:window.fridgeDetailsDebug.state.doors}};
 }
 model.updateMatrixWorld(true);return {root,spec:s,bar,entry,shoes,entryDrawers:frontEntry.drawers,drop:drop.g,dropDrawers:drop.drawers,shoeTrays:drop.trays,closedShoeDrawers:frontEntry.shoeDrawers,welcome:welcome.g,shoeDoors,controls,fridge,counter,openShelf,endPanel,drawers,moving,servicePanels,setStorage,setGuests,setService,snapshot};
}
