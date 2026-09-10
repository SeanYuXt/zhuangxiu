// Equipment and support placeholders: not a structural / electrical shop drawing.
export function addComputerZone({T,scene,box,d,white,face,dark,fabric,glow,sun}){
 const c=d.computer,helpers=new T.Group();scene.add(helpers);
 const steel=dark.clone(),caseMat=face.clone();
 const frame=[];
 // Concealed rear/wall brackets are schematic; anchorage requires wall verification.
 for(const x of [2.72,3.43]){
  frame.push(box('concealed-support',[x,.025,x+.025,.52],.705,.02,steel));
  frame.push(box('wall-support-plate',[x,.012,x+.04,.032],.55,.17,steel));
 }
 // Loads go to floor frame / retained sill support, not through display shelves.
 box('pc-sill-isolation-pad',c.tower,.75,.015,dark);
 box('computer-case',c.tower,c.towerBase,c.towerHeight,caseMat);
 const r=c.tower;
 for(let i=0;i<10;i++)box('pc-front-air-slot',[r[0]-.002,r[1]+.025,r[0]+.001,r[3]-.025],c.towerBase+.045+i*.033,.006,dark);
 box('pc-start-button',[r[0]-.003,r[1]+.025,r[0],r[1]+.045],c.towerBase+c.towerHeight-.04,.013,glow);
 for(let i=0;i<8;i++)box('pc-rear-air-slot',[r[2],r[1]+.025,r[2]+.003,r[3]-.025],c.towerBase+.055+i*.035,.006,dark);
 box('pc-rear-connection',[r[2],r[1]+.035,r[2]+.018,r[1]+.09],c.towerBase+.04,.045,dark);
 // Four mains outlets and a separate data faceplate; symbols are planning markers.
 const p=c.power;
 for(let i=0;i<5;i++){
  const x=p[0]+i*.10;
  box(i===4?'network-faceplate':'safety-shutter-socket',[x,p[1],x+.086,p[3]],c.powerHeight,.086,white);
  if(i<4){
   for(const dx of [.027,.057])box('socket-slot',[x+dx,p[3],x+dx+.004,p[3]+.002],c.powerHeight+.035,.016,dark);
   box('socket-earth',[x+.042,p[3],x+.046,p[3]+.002],c.powerHeight+.058,.011,dark);
  }else for(const dx of [.015,.049])box('rj45-or-usbc-symbol',[x+dx,p[3],x+dx+.024,p[3]+.002],c.powerHeight+.032,.018,dark);
 }
 box('covered-desk-cable-port',[3.18,.078,3.235,.13],.75,.004,dark);
 box('removable-cable-tray',c.cableTray,c.cableTrayHeight,.035,dark);
 function cable(name,points,color,parent=scene){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');
  const m=new T.Mesh(new T.TubeGeometry(curve,32,.0025,6,false),new T.MeshStandardMaterial({color}));m.name=name;parent.add(m);return m;
 }
 cable('monitor-hidden-lead',[[2.99,.92,.13],[3.15,.80,.12],[3.20,.76,.10]],'#42494c');
 cable('tower-removable-surface-lead',[[3.978,.83,.86],[4.015,.77,.74],[3.8,.757,.70],[3.52,.757,.70],[3.52,.69,.70]],'#42494c');
 // Coloured routes are inspection overlays only, not finished exposed wiring.
 cable('power-route-overlay',[[2.76,.85,.03],[2.76,.66,.05],[3.39,.66,.05],[3.465,.68,.40],[3.52,.69,.70]],'#d88742',helpers);
 cable('data-route-overlay',[[3.16,.85,.03],[3.16,.68,.05],[3.42,.68,.06],[3.48,.70,.40],[3.54,.71,.70]],'#428eab',helpers);
 const kneeMat=new T.MeshBasicMaterial({color:'#79b5ae',transparent:true,opacity:.15,depthWrite:false});
 box('illustrative-clear-knee-zone',c.knee,0,c.kneeHeight,kneeMat,helpers);
 // Clamp lamp: no separate base consuming keyboard / exercise-book space.
 box('desk-lamp-clamp',[2.71,.52,2.76,.58],.705,.065,dark);
 box('desk-lamp-upright',[2.724,.535,2.744,.555],.77,.42,dark);
 box('desk-lamp-arm',[2.724,.32,2.744,.55],1.17,.02,dark);
 box('desk-lamp-head',[2.724,.30,3.20,.34],1.17,.025,white);
 box('desk-lamp-diffuser',[2.744,.303,3.18,.337],1.165,.005,glow);
 const task=new T.SpotLight('#fff4e6',12,2.5,Math.PI*.31,.6,2);task.position.set(2.96,1.16,.32);task.target.position.set(3.02,.75,.43);scene.add(task,task.target);
 const general=new T.PointLight('#fff3e6',18,5,2);general.position.set(1.75,2.42,1.35);scene.add(general);
 // Hobby display stays beside the desk; no lower furniture behind the chair.
 const near=d.joinery.windowShelf;
 box('hobby-shelf-front-lip',[near[0],near[1],near[0]+.014,near[3]],1.138,.025,white);
 box('model-car-base',[3.31,.055,3.43,.31],1.145,.025,face);
 box('model-car-body',[3.33,.085,3.41,.295],1.17,.06,dark);
 box('model-car-cabin',[3.34,.145,3.40,.235],1.23,.045,face);
 // Book zone: these shelves are shallow; oversized albums need a different location.
 box('book-stop',[3.29,.23,3.455,.245],.79,.15,dark);
 const displayLight=new T.PointLight('#ffe4b8',1,1.2,2);displayLight.position.set(3.25,1.8,.15);scene.add(displayLight);
 function update(inspect,mode){
  helpers.visible=inspect;steel.color.set(inspect?'#d88742':'#434c53');
  const evening=mode!=='day';sun.intensity=evening?.12:2.6;
  scene.children.filter(o=>o.isHemisphereLight).forEach(o=>o.intensity=evening?.3:2);
  general.intensity=mode==='rest'?3:18;task.intensity=mode==='rest'?0:12;displayLight.intensity=mode==='study'?0:1;
 }
 update(false,'day');
 return {update};
}
