import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry,GLTFLoader} from './vendor/render-libs.js';
import {finishWoodPanel,cabinetFinishesReady,quartzMaterial} from './cabinet-finishes.js';
import {familyDisplaySpec} from './family-display-spec.js?v=sideboard-depth-40-10';
export {familyDisplaySpec};
export const familyDisplayAssetsReady=Promise.all([
 new T.TextureLoader().loadAsync('./assets/entry-travel-diptych-v8.png'),
 new GLTFLoader().loadAsync('./assets/decor-polyhaven/ceramic_vase_02/ceramic_vase_02.gltf'),
 new GLTFLoader().loadAsync('./assets/decor-polyhaven/ceramic_vase_03/ceramic_vase_03.gltf'),cabinetFinishesReady
]).then(([photo,vase02,vase03])=>{photo.colorSpace=T.SRGBColorSpace;photo.anisotropy=8;return {photo,vase02:vase02.scene,vase03:vase03.scene};});

export function setFamilyServiceOpen(group,id,open,original=false){
 const cover=group.getObjectByName('entry-service-cover-hinge-'+id);
 const door=group.getObjectByName('entry-original-box-hinge-'+id);
 if(!cover||!door)return;
 if(original){if(open)cover.rotation.y=-Math.PI/2;door.rotation.y=open?-Math.PI/2:0;}
 else {cover.rotation.y=open?-Math.PI/2:0;if(!open)door.rotation.y=0;}
 group.userData.serviceState[id]={cover:cover.rotation.y!==0,original:door.rotation.y!==0};
 group.updateMatrixWorld(true);
}

export function addFamilyDisplay(model,assets){
 const s=familyDisplaySpec,[cx,cz]=s.corner,x0=s.displayStartX,mainWidth=s.displayWidth;
 const g=new T.Group();g.name='family-display-wall';model.add(g);
 const matte=new T.MeshStandardMaterial({color:s.palette.warmWhite,roughness:.78});
 const bronze=new T.MeshStandardMaterial({color:s.palette.bronze,roughness:.48,metalness:.55});
 const dark=new T.MeshStandardMaterial({color:s.palette.shadow,roughness:.9});
 function box(name,x,y,z,w,h,d,mat=matte,parent=g){
  const mesh=new T.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(.003,w/5,h/5,d/5)),mat);
  mesh.name=name;mesh.position.set(x,y+h/2,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);
  return mesh;
 }
 // Existing wall faces remain unchanged. The finish is only 2 mm thick.
 const noise=new Uint8Array(128*128*4);let seed=17;
 for(let i=0;i<noise.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=180+(seed>>>26);noise[i]=noise[i+1]=noise[i+2]=v;noise[i+3]=255;}
 const grain=new T.DataTexture(noise,128,128);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(3,8);grain.needsUpdate=true;
 const mineral=new T.MeshStandardMaterial({color:s.palette.sand,roughness:.97,bumpMap:grain,bumpScale:.0007});
 const finish=new T.Group();finish.name='entry-corner-mineral-finish';g.add(finish);
 box('entry-corner-limewash-main',x0+mainWidth/2,0,cz-.001,mainWidth-.004,2.80,.002,mineral,finish);
 box('entry-corner-limewash-return',cx-.001,0,cz-s.returnWing/2,.002,2.80,s.returnWing-.004,mineral,finish);
 finish.userData={surfaceFinishOnly:true,constructionWallUnchanged:true,thicknessMm:2};
 const gallery=new T.Group();gallery.name='entry-corner-gallery';g.add(gallery);
 const mount=new T.MeshStandardMaterial({color:'#f2ebdf',roughness:.93});
 function photoFrame(name,pos,yaw,w,h,half){
  const frame=new T.Group();frame.name=name;frame.position.set(...pos);frame.rotation.y=yaw;gallery.add(frame);
  const edge=.012;
  for(const x of [-w/2+edge/2,w/2-edge/2])finishWoodPanel(box(name+'-frame',x,-h/2,-.003,edge,h,.026,matte,frame));
  for(const y of [-h/2,h/2-edge])finishWoodPanel(box(name+'-frame',0,y,-.003,w-2*edge,edge,.026,matte,frame));
  box(name+'-mat',0,-h/2+edge,.002,w-2*edge,h-2*edge,.006,mount,frame);
  const tex=assets.photo.clone();tex.repeat.set(.495,1);tex.offset.set(half===0?.0025:.5025,0);tex.needsUpdate=true;
  const pw=w-.075,ph=h-.09;
  const photo=new T.Mesh(new T.PlaneGeometry(pw,ph),new T.MeshStandardMaterial({map:tex,roughness:.95,metalness:0}));
  photo.name=name+'-sample-photo';photo.rotation.y=Math.PI;photo.position.set(0,.007,-.003);frame.add(photo);
  frame.userData={wallMounted:true,physicalFrame:true,photo:'AI-generated sample travel image, replaceable at selection stage',outerSizeMm:[w*1000,h*1000]};
 }
 photoFrame('entry-gallery-main-photo',[x0+.28,1.89,cz-.024],0,.38,.52,0);
 photoFrame('entry-gallery-return-photo',[cx-.024,1.86,cz-.25],Math.PI/2,.26,.35,1);
 function realVase(asset,parent,name,height,pos){
  const obj=asset.clone(true);obj.name=name;const original=new T.Box3().setFromObject(obj),size=original.getSize(new T.Vector3());
  obj.scale.setScalar(height/size.y);const b=new T.Box3().setFromObject(obj);obj.position.set(pos[0]-(b.min.x+b.max.x)/2,pos[1]-b.min.y,pos[2]-(b.min.z+b.max.z)/2);parent.add(obj);
  obj.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;o.material=o.material.clone();o.material.envMapIntensity=.4;}});
  obj.userData={source:'Poly Haven CC0 ceramic vase',uniformScale:true,selectedProduct:false};return obj;
 }
 const fd=s.floorDecor,art=new T.Group();art.name='entry-corner-floor-ceramics';g.add(art);
 const floorVase=realVase(assets.vase02,art,'entry-floor-ceramic-vase',fd.vaseHeight,[fd.centre[0],.006,fd.centre[1]]);
 // Sparse botanical stems inside the physical vase; not another wall appliqué.
 const stemMat=new T.MeshStandardMaterial({color:'#6f6046',roughness:.95}),leafMat=new T.MeshStandardMaterial({color:'#68745d',roughness:.9,side:T.DoubleSide});
 const sprig=new T.Group();sprig.name='entry-floor-vase-sprigs';sprig.position.set(fd.centre[0],0,fd.centre[1]);art.add(sprig);
 const stems=[[[0,.42,0],[-.022,.72,.006],[-.088,.97,.025],[-.108,1.15,.035]],[[.01,.42,0],[.032,.65,-.008],[.076,.86,-.028],[.10,1.02,-.012]],[[-.008,.44,.002],[-.021,.70,-.022],[.004,.85,-.061],[.045,.98,-.083]]];
 stems.forEach((points,index)=>{
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),stem=new T.Mesh(new T.TubeGeometry(curve,32,.0022,7,false),stemMat);stem.name='entry-olive-stem';sprig.add(stem);stem.castShadow=true;
  for(let n=0;n<6;n++){
   const t=.40+n*.105,p=curve.getPoint(t),side=n%2?1:-1;
   const leaf=new T.Mesh(new T.SphereGeometry(1,16,10),leafMat);leaf.name='entry-olive-leaf';leaf.scale.set(.014,.045,.0028);leaf.rotation.set(.25+index*.4,side*.35,side*.95);leaf.position.copy(p).add(new T.Vector3(side*.024,.015,side*.005));sprig.add(leaf);leaf.castShadow=true;
  }
 });
 art.userData={floorStanding:true,noStorage:true,asset:'ceramic_vase_02',source:'https://polyhaven.com/a/ceramic_vase_02',vaseHeight:.50,selectedProduct:false,description:'原比例浅色陶罐与疏枝示意，无石柱和红色雕塑'};
 gallery.userData={wallMounted:true,noStorage:true,photoCount:2,maximumProjectionMm:50};
 const light=new T.SpotLight('#ffe2bb',2.6,3.0,.48,.82,2);light.name='entry-corner-art-wallwash';light.position.set(x0+.44,2.70,cz-.30);light.target.position.set(fd.centre[0],1.10,fd.centre[1]);g.add(light,light.target);
 light.userData={designIntentOnly:true,lightTemperature:3000,wiringConfirmed:false};
 // A 250 mm deep open-backed service cabinet. Independent upper/lower doors
 // expose the original boxes; shelves occur only in the middle display zone.
 const serviceX=s.service.startX,serviceCentre=serviceX+s.service.width/2,boxCentre=s.service.boxCentreX;
 const metal=new T.MeshStandardMaterial({color:'#e0d5c4',roughness:.72}),boxMat=new T.MeshStandardMaterial({color:'#e8e8df',metalness:.12,roughness:.6});
 const niche=s.service.niche;
 const back=box('entry-service-niche-removable-back',serviceCentre,niche.bottom+.018,cz-.012,niche.clearWidth,niche.top-niche.bottom-.036,.012,quartzMaterial);
 back.userData={removable:true,onlyBetweenAssumedBoxes:true};
 const carcass=new T.Group();carcass.name='entry-service-shallow-carcass';g.add(carcass);
 const caseDepth=.204,caseZ=cz-.020-caseDepth/2;
 for(const x of [serviceX+.027,serviceX+s.service.width-.027])box('entry-service-carcass-side',x,.10,caseZ,.018,2.30,caseDepth,matte,carcass);
 for(const y of [.10,2.382])box('entry-service-carcass-cap',serviceCentre,y,caseZ,.588,.018,caseDepth,matte,carcass);
 for(const y of [niche.bottom,niche.top-.018])box('entry-service-niche-shelf',serviceCentre,y,caseZ,.588,.018,caseDepth,quartzMaterial,carcass);
 // Niche side cheeks are oak; no fixed back or shelf in either electrical access zone.
 for(const x of [serviceX+.040,serviceX+s.service.width-.040])finishWoodPanel(box('entry-service-niche-oak-cheek',x,niche.bottom+.018,caseZ,.008,niche.top-niche.bottom-.036,caseDepth,matte,carcass));
 const nicheDecor=new T.Group();nicheDecor.name='entry-service-niche-decor';g.add(nicheDecor);
 realVase(assets.vase03,nicheDecor,'entry-niche-ceramic-vase',.31,[serviceCentre-.14,niche.bottom+.018,cz-.118]);
 const bookMat=new T.MeshStandardMaterial({color:'#d8cfbe',roughness:.95});
 box('entry-niche-book-pages',serviceCentre+.14,niche.bottom+.021,cz-.123,.180,.027,.122,bookMat,nicheDecor);
 box('entry-niche-book-cover',serviceCentre+.14,niche.bottom+.049,cz-.123,.190,.004,.130,dark,nicheDecor);
 const pebble=new T.Mesh(new T.SphereGeometry(.042,32,20),bronze);pebble.name='entry-niche-bronze-pebble';pebble.scale.set(1,.50,.75);pebble.position.set(serviceCentre+.14,niche.bottom+.075,cz-.127);nicheDecor.add(pebble);pebble.castShadow=true;
 const ledMat=new T.MeshBasicMaterial({color:'#ffe1aa'});box('entry-service-niche-light',serviceCentre,niche.top-.023,cz-.190,.50,.003,.006,ledMat,carcass);
 const nicheLight=new T.PointLight('#ffe6c0',.10,.9,2);nicheLight.name='entry-service-niche-light-source';nicheLight.position.set(serviceCentre,niche.top-.043,cz-.15);g.add(nicheLight);
 carcass.userData={overallDepthMm:250,noBackInElectricalZones:true,noStorageInElectricalZones:true};
 for(const p of s.service.panels){
  const w=s.service.width-.012,h=p.top-p.bottom,hinge=new T.Group();
  hinge.name='entry-service-cover-hinge-'+p.id;hinge.position.set(serviceX+s.service.width-.006,0,cz-s.service.depth);
  hinge.userData={serviceCover:p.id};g.add(hinge);
  if(p.ventilated){
   // Actual gaps between louvers, instead of black lines painted on a solid door.
   const band=.024,rail=.012;
   box('entry-service-lower-centre',-w/2,p.bottom+band,0,w,h-2*band,.006,matte,hinge);
   for(const y of [p.bottom,p.top-band]){
    for(const x of [-w+rail/2,-rail/2])box('entry-service-vent-side',x,y,0,rail,band,.006,matte,hinge);
    for(let n=0;n<2;n++)box('entry-service-vent-louver',-w/2,y+n*.015,0,w-2*rail,.009,.006,matte,hinge);
   }
  }else box('entry-service-upper-cover',-w/2,p.bottom,0,w,h,.006,metal,hinge);
  // Rounded ribs are real geometry attached to each moving cover. Lower vents stay open.
  const ribBottom=p.bottom+(p.ventilated?.036:.008),ribTop=p.top-(p.ventilated?.036:.008);
  for(let n=0;n<26;n++){
   const rib=new T.Mesh(new T.CylinderGeometry(.009,.009,ribTop-ribBottom,12,1,false),metal);
   rib.name='entry-service-cover-rib-'+p.id;rib.position.set(-w+.014+n*(w-.028)/25,(ribBottom+ribTop)/2,-.003);rib.castShadow=false;rib.receiveShadow=true;hinge.add(rib);
  }
  box('entry-service-cover-grip-'+p.id,-w+.010,p.bottom+h/2-.045,-.005,.008,.090,.010,dark,hinge);
 }
 for(const p of s.service.boxes){
  const w=p.width,h=p.height,frame=.015;
  const root=new T.Group();root.name='entry-original-box-'+p.id;root.userData={...p,measured:false};g.add(root);
  for(const x of [boxCentre-w/2+frame/2,boxCentre+w/2-frame/2])box('entry-original-box-frame',x,p.bottom,cz-.010,frame,h,.020,boxMat,root);
  for(const y of [p.bottom,p.bottom+h-frame])box('entry-original-box-frame',boxCentre,y,cz-.010,w-2*frame,frame,.020,boxMat,root);
  const hinge=new T.Group();hinge.name='entry-original-box-hinge-'+p.id;hinge.position.set(boxCentre+w/2-frame,0,cz-.025);hinge.userData={originalBoxDoor:p.id};root.add(hinge);
  box('entry-original-box-door-'+p.id,-(w-2*frame)/2,p.bottom+frame,0,w-2*frame,h-2*frame,.006,boxMat,hinge);
  box('entry-original-box-latch',-w+2*frame+.015,p.bottom+h/2-.009,-.005,.025,.018,.009,dark,hinge);
 }
 // Near edge follows CAD + user's relative location. Width and underside remain assumptions.
 const beam=new T.Group();beam.name='entry-service-beam-study';beam.userData={...s.beam,structuralRetentionRequired:true,illustrativeOnly:true};model.add(beam);
 box('entry-beam-unmeasured-envelope',s.beam.nearX+s.beam.width/2,s.beam.bottom,(s.beam.startZ+s.beam.endZ)/2,s.beam.width,s.beam.top-s.beam.bottom,s.beam.endZ-s.beam.startZ,new T.MeshStandardMaterial({color:'#e5e1d8',roughness:.9}),beam);
 g.userData={...s,serviceState:{upper:{cover:false,original:false},lower:{cover:false,original:false}},storage:'梁前250mm深独立检修柜，中段展示；梁后无柜体、抽屉或层架',artwork:'两幅示意旅行影像、原比例浅色陶罐与疏枝；陶器来自Poly Haven CC0，非已选商品',assetSources:['assets/entry-travel-diptych-v8-source.json','assets/decor-polyhaven/sources.json'],noBedroomCabinets:true};
 model.updateMatrixWorld(true);return g;
}
