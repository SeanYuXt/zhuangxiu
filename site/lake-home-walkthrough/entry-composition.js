import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {finishWoodPanel} from './cabinet-finishes.js';
import {entryCompositionSpec as spec} from './entry-composition-spec.js?v=entry-wall-only-3';

export function createEntryComposition(model,layoutSpec=spec){
 const spec=layoutSpec;
 const root=new T.Group();root.name='entry-single-side-layout';root.userData={...spec,installationVerified:false};model.add(root);
 const white=new T.MeshStandardMaterial({color:'#dedbd3',roughness:.6});
 const wood=new T.MeshStandardMaterial({color:'#ddcfb9',roughness:.7});
 const bronze=new T.MeshStandardMaterial({color:'#827869',metalness:.55,roughness:.4});
 const shadow=new T.MeshStandardMaterial({color:'#4d5249',roughness:.9});
 const plaster=new T.MeshStandardMaterial({color:'#e6e2d9',roughness:1});
 const led=new T.MeshStandardMaterial({color:'#fff0d8',emissive:'#ffddb0',emissiveIntensity:.35});
 const leaves=[],drawers=[],roots=[];
 const group=(name,parent=root)=>{const g=new T.Group();g.name=name;parent.add(g);return g;};
 const box=(parent,name,x,y,z,w,h,d,material=white,r=.004)=>{
  const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/4,h/4,d/4)),material);o.name=name;o.position.set(x,y+h/2,z);
  o.castShadow=material!==led;o.receiveShadow=true;parent.add(o);if(material===wood)finishWoodPanel(o,{interior:true});return o;
 };
 // Single row of shoes: useful shelf depth is 378mm rather than a deep double row.
 const a=spec.tall,cabinet=group('flush-entry-cabinet'),front=spec.wallFaceZ-a.depth,z=(front+spec.wallFaceZ)/2;
 box(cabinet,'entry-shoe-recessed-plinth',a.x+a.width/2,.04,spec.wallFaceZ-.16,a.width-.10,.158,.28,shadow);
 for(const bay of a.bays){
  for(const x of [bay.x+.009,bay.x+bay.width-.009])box(cabinet,'entry-shoe-vertical-panel',x,a.bottom,z,.018,a.top-a.bottom,a.depth);
  box(cabinet,'entry-shoe-cabinet-back',bay.x+bay.width/2,a.bottom,spec.wallFaceZ-.008,bay.width-.036,a.top-a.bottom,.016,wood);
  for(const y of [a.bottom,2.086,a.top-.018])box(cabinet,'entry-shoe-horizontal-panel',bay.x+bay.width/2,y,z,bay.width-.036,.018,a.depth-.025,wood);
 }
 const shoes=group('entry-stored-shoes',cabinet),shoeMat=new T.MeshStandardMaterial({color:'#b0a895',roughness:.9}),sole=new T.MeshStandardMaterial({color:'#d4d1c5',roughness:1});
 function shoe(parent,name,x,y,sz,color=shoeMat,boot=false){
  const g=group(name,parent);g.userData={purpose:'鞋型及占位示意，非已购产品'};
  box(g,name+'-sole',x,y,sz,.102,.020,.292,sole,.024);
  box(g,name+'-upper',x,y+.016,sz-.035,.098,.073,.21,color,.025);
  box(g,name+'-heel',x,y+.028,sz+.078,.091,boot?.30:.071,.09,color,.018);
  return g;
 }
 for(let i=0;i<a.columns;i++){
  const bay=a.bays[i],cw=bay.width,x=bay.x+cw/2,levels=a.shelfLevels[i];
  levels.forEach((y,row)=>{
   box(cabinet,'entry-adjustable-shoe-shelf-'+i+'-'+row,x,y,z-.004,cw-.036,.018,.378,wood);
   // Six 102mm-wide shoe envelopes fit the 644mm shelf; capacity depends on actual footwear.
   const count=a.shoesPerRow??6;
   for(let k=0;k<count;k++)shoe(shoes,'entry-stored-shoe-'+i+'-'+row+'-'+k,x+(k-(count-1)/2)*.106,y+.018,z-.013,shoeMat,i===1&&row===0);
  });
  // Discrete peg rows communicate adjustability without adding fictitious hardware.
  for(const dx of [-1,1])for(let y=.29;y<2.04;y+=.16)box(cabinet,'entry-shelf-pin',x+dx*(cw/2-.023),y,z+.12,.009,.007,.01,bronze);
  for(const band of ['lower','upper']){
   const lower=band==='lower',bottom=lower?a.bottom+.018:2.116,top=lower?a.lowerTop:a.top-.008;
   const hinge=group('entry-new-door-hinge-'+band+'-'+i,cabinet);hinge.position.set(bay.x+.004,0,front-.011);
   box(hinge,'entry-new-door-leaf-'+band+'-'+i,cw/2-.004,bottom,0,cw-.008,top-bottom,.020);
   // Fine recessed-line appearance: a 2mm shadow line with a light lower lip, inside the existing front envelope.
   if(lower&&i!==spec.mirror.column){
    box(hinge,'entry-panel-horizontal-shadow',cw/2-.004,1.10,-.0107,cw-.076,.002,.0008,shadow,.0002);
    box(hinge,'entry-panel-vertical-shadow',.23,bottom+.065,-.0107,.002,top-bottom-.13,.0008,shadow,.0002);
    box(hinge,'entry-panel-line-light-lip',cw/2-.004,1.0985,-.0108,cw-.076,.001,.0004,wood,.0001);
   }
   // Recessed finger channel; no projecting bar handles in the narrow passage.
   box(hinge,'entry-recessed-door-pull-'+band+'-'+i,cw-.028,lower?1.02:bottom+.025,-.011,.010,lower?.30:.18,.004,shadow);
   hinge.userData={band,index:i,direction:1};leaves.push(hinge);roots.push(hinge);
   if(lower&&i===spec.mirror.column){
    const m=spec.mirror,mirror=group('entry-dressing-mirror',hinge);
    box(mirror,'entry-mirror-frame',cw/2-.004,m.bottom,-.016,m.width+.014,m.top-m.bottom+.012,.009,bronze,.007);
    const glass=box(mirror,'entry-mirror-glass',cw/2-.004,m.bottom+.006,-.023,m.width,m.top-m.bottom,.008,new T.MeshStandardMaterial({color:'#c7cdc6',metalness:1,roughness:.04}),.005);
    glass.rotation.y=Math.PI;
   }
  }
  for(const y of [2.12,2.33])box(cabinet,'entry-seasonal-shoe-box',x,y,z,cw-.075,.17,.31,white,.009);
 }
 const d=spec.display,display=group('entry-vertical-display-niche',cabinet),dcx=d.x+d.width/2,dz=spec.wallFaceZ-d.depth/2;
 box(display,'entry-display-oak-back',dcx,d.bottom,spec.wallFaceZ-.008,d.width,d.top-d.bottom,.016,wood);
 for(const y of d.shelves)box(display,'entry-display-shelf',dcx,y,dz,d.width-.002,.018,d.depth,wood,.002);
 for(const y of [1.10,2.086]){const strip=box(display,'entry-niche-concealed-light',dcx,y-.007,spec.wallFaceZ-.05,d.width-.036,.005,.008,led,.001);strip.userData.lightingDirectionLocal=[0,-1,0];}
 const ceramic=new T.MeshStandardMaterial({color:'#ede1cb',roughness:.38}),teal=new T.MeshStandardMaterial({color:'#57796f',roughness:.3});
 for(const [name,base,height,radius,material] of [['ivory',.738,.27,.060,ceramic],['teal',1.668,.22,.058,teal]]){
  const vase=group('entry-niche-vase-'+name,display);vase.position.set(dcx,base,spec.wallFaceZ-d.depth+.065);
  const profile=[[radius*.7,0],[radius,.035],[radius*.93,height*.53],[radius*.42,height*.88],[radius*.44,height],[radius*.34,height],[radius*.32,height-.015],[radius*.32,height*.86]];
  const body=new T.Mesh(new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),48),material);body.name='entry-niche-vase-body-'+name;body.castShadow=body.receiveShadow=true;vase.add(body);
 }
 for(let i=0;i<2;i++)box(display,'entry-niche-small-album',dcx,.198+i*.035,dz,.145,.028,.18,i?wood:white,.002);
 display.userData={...d,clearWidth:.20,vaseMaxDiameter:.12,scheme:'200mm净宽竖格，420mm层板退到柜体线，留出柜门转动间隙；花器靠前摆放'};
 cabinet.userData={size:[a.width,a.top,a.depth+.038],columns:a.columns,clearShelfWidth:a.bays[0].width-.036,shelfDepth:.378,shoePairsIllustrated:a.shelfLevels.reduce((sum,s)=>sum+s.length*(a.shoesPerRow??6)/2,0),displayClearWidth:.20,description:a.description||'680mm封闭鞋柜＋200mm净宽花器竖格＋680mm镜门鞋柜；右侧底部高鞋位，面板细分缝。',capacityCertified:false};
 // A small open seat close to the entrance. Everyday shoes need no drawer opening.
 const n=spec.niche,niche=group('entry-welcome-niche'),bench=group('entry-shoe-bench',niche);
 box(niche,'entry-seat-plaster-back',n.x+n.width/2,.10,spec.wallFaceZ-.008,n.width,n.top-.10,.016,plaster,.014);
 box(bench,'entry-bench-open-shoe-shelf',n.x+n.width/2,.13,spec.wallFaceZ-n.depth/2,n.width-.026,.026,n.depth-.04,wood,.012);
 for(const x of [n.x+.024,n.x+n.width-.024])box(bench,'entry-bench-supported-end',x,.06,spec.wallFaceZ-n.depth/2,.048,.37,n.depth-.035,white,.014);
 box(bench,'entry-bench-seat-board',n.x+n.width/2,n.seatTop-.030,spec.wallFaceZ-n.depth/2,n.width,.030,n.depth,wood,.012);
 const daily=group('entry-daily-slippers',bench);
 for(let k=0;k<4;k++)shoe(daily,'entry-daily-shoe-'+k,n.x+n.width/2+(k-1.5)*.138,.156,spec.wallFaceZ-.22,white);
 bench.userData={size:[n.width,n.seatTop,n.depth],seatHeight:n.seatTop,dailyPairs:2,support:'两端落地承托；坐凳固定与承重待五金选型'};
 // Two compact hooks at the door end; no coat rail across the seated person's back.
 box(niche,'entry-bag-hook-rail',n.x+n.width-.19,1.535,spec.wallFaceZ-.034,.25,.044,.04,wood,.009);
 for(const x of [n.x+n.width-.265,n.x+n.width-.115]){
  box(niche,'entry-niche-coat-hook',x,1.53,spec.wallFaceZ-.074,.018,.028,.07,bronze,.005);
  box(niche,'entry-hook-tip',x,1.54,spec.wallFaceZ-.104,.021,.046,.016,bronze,.005);
 }
 const warm=box(niche,'entry-seat-indirect-light',n.x+.012,.65,spec.wallFaceZ-.026,.009,.82,.009,led);
 warm.userData.lightingDirectionLocal=[1,0,0];
 // Slim landing drawer below the existing intercom. Keep this side free of shoes.
 const c=spec.console,low=group('entry-low-cabinet'),cx=c.x+c.width/2;
 box(low,'entry-console-floating-top',cx,c.top-.03,spec.wallFaceZ-c.depth/2,c.width,.03,c.depth,white,.014);
 box(low,'entry-console-wall-fixing-reserve',cx,c.top-.18,spec.wallFaceZ-.02,c.width-.05,.15,.028,bronze);
 const drawer=group('entry-everyday-drawer',low);drawer.userData.travel=c.drawerTravel;
 box(drawer,'entry-everyday-drawer-front',cx,c.top-.172,spec.wallFaceZ-c.depth+.012,c.width-.018,.137,.020,wood);
 box(drawer,'entry-everyday-drawer-base',cx,c.top-.165,spec.wallFaceZ-c.depth/2,c.width-.043,.014,c.depth-.04,wood);
 for(const sign of [-1,1])box(drawer,'entry-console-drawer-side',cx+sign*(c.width/2-.028),c.top-.15,spec.wallFaceZ-c.depth/2,.014,.102,c.depth-.045,wood);
 box(drawer,'entry-console-drawer-back',cx,c.top-.15,spec.wallFaceZ-.029,c.width-.04,.102,.014,wood);drawers.push(drawer);
 box(low,'entry-key-tray',cx,c.top,spec.wallFaceZ-.135,.22,.016,.14,bronze,.014);
 low.userData={size:[c.width,c.top,c.depth],use:'280mm浅随手台和小物抽屉；对讲及控制面板原位保留'};
 let opened=false,fraction=0;
 const setFraction=t=>{fraction=T.MathUtils.clamp(t,0,1);for(const pivot of leaves)pivot.rotation.y=Math.PI/2*fraction;for(const d of drawers)d.position.z=-d.userData.travel*fraction;model.updateMatrixWorld(true);};
 const setOpen=value=>{opened=!!value;setFraction(opened?1:0);};
 model.updateMatrixWorld(true);return {setBenchShift(){},setOpen,setFraction,roots,leaves,drawers,spec,get state(){return {opened,fraction,benchShift:0,benchBackShift:0};}};
}
