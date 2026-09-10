// Concept placement only. Supply, waste, sockets, stacking kit and appliance model await site/product checks.
export function buildLaundry({T,at,box,cylinder,mat,softBox,plaque,registerFurniture,white,walnut,cabinetFinish,dark,black,brass,ledMat,linen}){
 const g=at(1208,244,-Math.PI/2);g.name='balcony-laundry-cabinet';
 g.userData={width:.9,depth:.72,height:2.77,location:'east short solid wall before TV lining',applianceNominal:[.60,.84,.63],waterSupply:null,waste:null,power:null,installationStatus:'concept-only; verify dimensions, vibration, ventilation and drainage'};
 // 600 mm appliances + narrow cleaning cupboard; independent support above, not resting on dryer.
 for(const x of [-.438,.21,.438])box(g,x,.04,0,.024,2.73,.72,cabinetFinish);
 box(g,0,.02,0,.876,.04,.70,dark);box(g,0,2.746,0,.90,.024,.72,cabinetFinish);
 box(g,0,1.81,-.015,.876,.03,.69,walnut);
 for(const x of [-.219,.219])box(g,x,1.85,.348,.434,.889,.024,cabinetFinish);
 box(g,.33,.065,.348,.204,1.724,.024,cabinetFinish).name='laundry-cleaning-cabinet-door';
 box(g,-.11,1.797,.28,.61,.009,.014,ledMat).name='laundry-task-strip';
 const steel=mat('#969d9a',.24,{metalness:.82}),enamel=mat('#e0e0db',.27,{metalness:.14});
 const faceDisk=(parent,x,y,z,r,depth,material)=>{const m=new T.Mesh(new T.CylinderGeometry(r,r,depth,64),material);m.rotation.x=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 for(const [kind,y,text] of [['washer',.065,'WASH  40°'],['dryer',.935,'DRY  AUTO']]){
  const unit=new T.Group();unit.name='laundry-'+kind;unit.position.set(-.114,y,-.025);g.add(unit);
  softBox(unit,0,0,0,.60,.84,.63,.018,enamel);
  box(unit,0,.69,.321,.57,.126,.009,white);plaque(unit,.118,.751,.328,.225,.061,text);
  faceDisk(unit,-.105,.752,.336,.029,.014,steel);
  box(unit,-.215,.704,.326,.13,.06,.012,white);
  faceDisk(unit,0,.391,.328,.215,.012,black);
  faceDisk(unit,0,.391,.338,.175,.01,steel);
  for(let i=0;i<32;i++){const a=i*Math.PI*2/32;faceDisk(unit,Math.cos(a)*.14,.391+Math.sin(a)*.14,.345,.005,.002,black);}
  const rim=new T.Mesh(new T.TorusGeometry(.212,.019,16,64),kind==='washer'?steel:dark);rim.position.set(0,.391,.35);rim.name=kind+'-door-ring';unit.add(rim);
  const smoked=new T.MeshPhysicalMaterial({color:'#263a3d',metalness:.28,roughness:.11,transparent:true,opacity:.7});
  faceDisk(unit,0,.391,.357,.178,.009,smoked).name=kind+'-porthole';
  box(unit,.186,.343,.361,.025,.09,.016,dark);
  if(kind==='dryer')for(let i=0;i<10;i++)box(unit,-.205+i*.023,.053,.321,.013,.04,.005,dark);
  else box(unit,0,.038,.32,.52,.025,.008,enamel);
  unit.userData={type:kind,nominalWidthMm:600,nominalHeightMm:840,modelSelected:false};
 }
 box(g,-.114,.907,-.012,.61,.025,.66,dark).name='laundry-stacking-kit';
 // Upper storage doors and cleaning door are shown closed; no fake decorative door covering the machines.
 registerFurniture(g,'阳台洗烘柜');return g;
}
