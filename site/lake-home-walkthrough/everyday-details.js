// Decorative / portable objects only. No independent floorplan or service routes.
export function buildEverydayDetails({T,house,shoes,bench,coffee,dining,b1desk,desk,sofa,mat,box,cylinder,softBox,ellipsoid,walnut,linen,brass,black}){
 const ceramic=mat('#e8e3d8',.43),sage=mat('#7a8172',.75),paper=mat('#ddd8c9',.85);
 const group=(parent,name)=>{const g=new T.Group();g.name=name;parent.add(g);return g;};
 const shoesInside=group(shoes,'entry-shoes-on-shelves');
 const pair=(parent,x,y,z,color)=>{for(const dx of [-.085,.085]){
  softBox(parent,x+dx,y,z,.112,.022,.265,.035,linen);
  ellipsoid(parent,x+dx,y+.052,z-.018,.11,.075,.215,color);
  ellipsoid(parent,x+dx,y+.083,z-.084,.064,.012,.066,black);
 }};
 for(const [i,y] of [.398,.608,.818,1.028,1.268].entries())pair(shoesInside,-.4,y,-.015,i%2?ceramic:sage);
 const slippers=group(shoes,'entry-daily-slippers');pair(slippers,-.35,.012,.035,sage);pair(slippers,.32,.012,.035,ceramic);
 const baskets=group(bench,'entry-bench-baskets');
 for(const x of [-.22,.22]){
  box(baskets,x,.067,0,.37,.27,.31,walnut);
  for(let i=0;i<7;i++)box(baskets,x,.081+i*.033,.158,.37,.008,.007,paper);
  box(baskets,x,.253,.164,.09,.026,.005,black);
 }
 const landing=group(shoes,'entry-key-tray');
 softBox(landing,.25,.930,.02,.32,.014,.19,.025,walnut);
 const ring=new T.Mesh(new T.TorusGeometry(.018,.003,8,32),brass);ring.rotation.x=Math.PI/2;ring.position.set(.19,.948,.04);landing.add(ring);
 box(landing,.215,.946,.04,.043,.003,.013,brass);
 softBox(landing,.305,.946,-.015,.075,.009,.11,.007,black);
 box(landing,.305,.955,-.015,.062,.001,.082,mat('#536268',.2));
 const vase=group(shoes,'entry-vase-arrangement');cylinder(vase,.64,.930,-.03,.06,.16,ceramic);
 for(const [i,x] of [.60,.64,.68].entries()){
  const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(.64,1.08,-.03),new T.Vector3(x,1.29+i*.022,-.04)]),new T.LineBasicMaterial({color:'#6d725a'}));vase.add(line);
  const leaf=ellipsoid(vase,x,1.24+i*.025,-.03,.07,.035,.015,sage);leaf.rotation.z=i*.5;
 }
 const books=(parent,x,y,z,w=.18,d=.24)=>{for(let i=0;i<2;i++){box(parent,x,y+i*.019,z,w,.017,d,i?sage:paper);box(parent,x,y+.004+i*.019,z+d/2+.001,w-.012,.009,.002,linen);}};
 const tea=group(coffee,'living-coffee-everyday');books(tea,0,.335,-.15,.19,.24);
 cylinder(tea,-.05,.335,.19,.059,.006,walnut);cylinder(tea,-.05,.341,.19,.037,.073,ceramic);cylinder(tea,-.05,.415,.19,.030,.002,mat('#665444'));
 softBox(tea,.115,.336,.08,.043,.014,.135,.008,black);for(let i=0;i<3;i++)cylinder(tea,.115,.351,.05+i*.019,.005,.001,ceramic);
 const settings=group(dining,'dining-table-settings');
 for(const sign of [-1,1]){
  const z=sign*.68;softBox(settings,0,.946,z,.63,.004,.39,.028,mat('#b3b0a0'));
  cylinder(settings,0,.951,z,.135,.012,ceramic);cylinder(settings,0,.964,z,.103,.006,linen);
  box(settings,-.215,.951,z,.085,.012,.20,linen);
  for(const x of [-.19,.19])box(settings,x,.966,z,.012,.006,.17,brass);
  cylinder(settings,.24,.951,z-sign*.03,.031,.085,ceramic);
 }
 for(const [id,parent,top,lampX,bookX] of [['bed1',b1desk,.775,-.45,.38],['bed3',desk,.795,-.58,.54]]){
  const objects=group(parent,id+'-desk-everyday');books(objects,bookX,top,-.02,.17,.22);
  cylinder(objects,lampX,top,-.10,.064,.015,brass);cylinder(objects,lampX,top+.015,-.10,.008,.25,brass);
  const shade=new T.Mesh(new T.CylinderGeometry(.045,.083,.10,40),sage);shade.position.set(lampX,top+.275,-.10);objects.add(shade);
  cylinder(objects,lampX,top+.222,-.10,.065,.005,mat('#fff1d7',.4,{emissive:'#ffe5bb',emissiveIntensity:.35}));
 }
 const masterBed=house.getObjectByName('master-bed'),nightObjects=group(masterBed,'master-bedside-everyday');
 books(nightObjects,1.21,.47,-.583,.16,.10);
 softBox(nightObjects,-1.21,.47,-.57,.15,.072,.06,.014,black);
 box(nightObjects,-1.21,.487,-.536,.12,.025,.003,sage);
 const throwGroup=group(sofa,'living-sofa-throw');
 softBox(throwGroup,1.03,.502,.10,.46,.016,.38,.03,sage);
 for(let i=0;i<8;i++)box(throwGroup,.845+i*.052,.491,.29,.008,.025,.018,paper);
}
