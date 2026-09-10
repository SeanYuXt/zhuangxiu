import * as T from './vendor/three.module.js';
import {Reflector} from './vendor/render-libs.js';

// Metres, +x faces the room. Every fixed cabinet back meets the existing x=0 wall.
export function mountCenteredDressing({scene,s,box,roundedFace,cylinder,M,white,metal,putty,fabric,drawer}){
 const cfg=s.design.centeredDressing;
 const group=new T.Group();group.name='centered-dressing';scene.add(group);
 const doors=new T.Group();doors.name='centered-dressing-closed-fronts';group.add(doors);
 const interiors=new T.Group();interiors.name='centered-dressing-interiors';group.add(interiors);
 const wood=M('#dfc9a7'),lining=M('#e6dfd1'),dark=M('#b8ae9c'),front=M('#f4f0e7'),wall=M('#eee9df');

 const r=cfg.desk.r,[x0,z0,x1,z1]=r,H=cfg.height,deskTop=cfg.deskHeight;
 const b=(name,rr,y,h,mat=front,parent=group,radius=.003)=>box('centered-'+name,rr,y,h,mat,parent,radius);
 const cyl=(name,x,y,z,rad,h,mat=metal,parent=interiors)=>{const o=cylinder(x,y,z,rad,h,mat,parent);o.name='centered-'+name;return o;};
 function cabinet(name,rr){
  const [a,c,d,e]=rr;
  b(name+'-back',[a,c,a+.018,e],.06,H-.06,lining);
  for(const z of(name==='left-wardrobe'?[e-.018]:[c,e-.018]))b(name+'-side',[a+.018,z,d,z+.018],.06,H-.06);
  if(name==='left-wardrobe')b(name+'-cheek-back',[a+.018,c,.45,c+.018],.06,H-.06);
  for(const y of[.06,2.02,H-.018]){
   if(name!=='left-wardrobe'){b(name+'-shelf',[a+.018,c+.018,d-.022,e-.018],y,.018,lining);continue;}
   const q=new T.Shape();q.moveTo(a+.018,c+.018);q.lineTo(.45,c+.018);q.quadraticCurveTo(d-.022,c+.022,d-.022,c+.18);q.lineTo(d-.022,e-.018);q.lineTo(a+.018,e-.018);q.closePath();
   const geo=new T.ExtrudeGeometry(q,{depth:.018,bevelEnabled:false,curveSegments:32});geo.rotateX(Math.PI/2);geo.translate(0,y+.018,0);const mesh=new T.Mesh(geo,lining);mesh.name='centered-'+name+'-shelf';group.add(mesh);
  }
  b(name+'-plinth',[a+.04,c+.018,d-.05,e-.018],0,.06,dark);
  const start=name==='left-wardrobe'?c+.18:c,mid=(start+e)/2;
  for(const [k,za,zb]of [[0,start+.003,mid-.0015],[1,mid+.0015,e-.003]]){
   b(name+'-door-'+k,[d-.018,za,d,zb],.065,H-.07,front,doors,.003);
  }

 }
 cabinet('left-wardrobe',cfg.left.r);cabinet('right-wardrobe',cfg.right.r);
 // End desk is exactly 100cm, with no cabinet or leg in the knee space.
 // Real plan curves, not just bevels on a rectangular slab.
 function curvedSlab(name,rr,y,h,material,parent=group,rad=.12){
  const [a,c,d,e]=rr,q=new T.Shape();q.moveTo(a,c);q.lineTo(d-rad,c);q.quadraticCurveTo(d,c,d,c+rad);q.lineTo(d,e-rad);q.quadraticCurveTo(d,e,d-rad,e);q.lineTo(a,e);q.closePath();
  if(name==='curved-apron'){
   const hole=new T.Path();hole.moveTo(a+.016,c+.13);hole.lineTo(a+.016,e-.13);hole.lineTo(d-.016,e-.13);hole.lineTo(d-.016,c+.13);hole.closePath();q.holes.push(hole);
  }
  const geo=new T.ExtrudeGeometry(q,{depth:h,bevelEnabled:false,curveSegments:32});
  geo.rotateX(Math.PI/2);geo.translate(0,y+h,0);
  const mesh=new T.Mesh(geo,material);mesh.name='centered-'+name;mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 b('desk-back',[x0,z0,x0+.018,z1],.64,1.40,front);
 curvedSlab('curved-desktop',r,deskTop-.025,.025,wood);
 // Cream apron follows the same rounded ends; the two inset drawers sit behind it.
 curvedSlab('curved-apron',[x0+.018,z0+.01,x1-.008,z1-.01],.645,.078,front);
 // A soft curved vertical cheek joins the shallower desk to the wardrobe face.
 const cheek=new T.Shape();cheek.moveTo(.45,z1);cheek.quadraticCurveTo(.65,z1,.65,z1+.18);cheek.lineTo(.63,z1+.18);cheek.quadraticCurveTo(.63,z1+.02,.45,z1+.02);cheek.closePath();
 const cheekGeo=new T.ExtrudeGeometry(cheek,{depth:H-.065,bevelEnabled:false,curveSegments:32});cheekGeo.rotateX(Math.PI/2);cheekGeo.translate(0,H,0);
 const cheekMesh=new T.Mesh(cheekGeo,front);cheekMesh.name='centered-curved-cabinet-cheek';cheekMesh.castShadow=true;group.add(cheekMesh);

 const deskDrawers=[];
 for(const [i,a,c]of [[0,z0+.13,(z0+z1)/2-.012],[1,(z0+z1)/2+.012,z1-.13]]){
  const g=drawer('centered-makeup-drawer-'+i,[x0+.024,a,x1-.006,c],.651,.060,'x',group);
  deskDrawers.push(g);
 }
 // Open wall above the makeup position; no overhead bridge cabinet.
 const mw=.68,mh=1.08,base=.91,radius=.16;
 const frame=roundedFace('centered-mirror-frame',x0+.023,base-.009,z1-.151,mw+.018,mh+.018,.004,radius+.009,lining,group);frame.rotation.y=Math.PI/2;
 const shape=new T.Shape();shape.moveTo(radius,0);shape.lineTo(mw-radius,0);shape.quadraticCurveTo(mw,0,mw,radius);shape.lineTo(mw,mh-radius);shape.quadraticCurveTo(mw,mh,mw-radius,mh);shape.lineTo(radius,mh);shape.quadraticCurveTo(0,mh,0,mh-radius);shape.lineTo(0,radius);shape.quadraticCurveTo(0,0,radius,0);
 const mirror=new Reflector(new T.ShapeGeometry(shape,32),{color:0xcccccc,textureWidth:768,textureHeight:768,clipBias:.003,multisample:0});
 mirror.name='centered-makeup-mirror';mirror.position.set(x0+.031,base,z1-.16);mirror.rotation.y=Math.PI/2;group.add(mirror);
 const glow=new T.MeshStandardMaterial({color:'#fff7e8',emissive:'#ffe9c5',emissiveIntensity:.45});
 b('mirror-side-light',[x0+.035,z0+.085,x0+.053,z0+.10],1.06,.77,glow,group,.006);
 const light=new T.PointLight('#fff0db',.25,1.8,2);light.name='centered-makeup-task-light';light.position.set(.25,1.75,(z0+z1)/2);group.add(light);
 b('desk-tray',[x0+.065,z1-.255,x0+.23,z1-.065],deskTop,.014,lining,group,.01);
 cyl('makeup-bottle',x0+.12,deskTop+.014,z1-.13,.023,.12,white,group);
 cyl('makeup-bottle-cap',x0+.12,deskTop+.134,z1-.13,.016,.018,metal,group);
 cyl('makeup-jar',x0+.185,deskTop+.014,z1-.175,.029,.045,putty,group);
 const stool=new T.Group();stool.name='centered-dressing-stool';group.add(stool);
 const stoolX=x0+.25,stoolZ=(z0+z1)/2;
 cyl('stool-base',stoolX,.025,stoolZ,.13,.065,wood,stool);
 cyl('stool-seat',stoolX,.09,stoolZ,.18,.33,M('#ded7c9'),stool);
 // Left: hanging shirts, with folded items above. Right: shallow safe placeholder and shelves.
 const l=cfg.left.r,lc=(l[1]+l[3])/2,rr=cfg.right.r;
 for(const y of[.40,1.80])b('left-inner-shelf',[l[0]+.025,l[1]+.026,l[2]-.045,l[3]-.026],y,.018,lining,interiors);
 const rail=cyl('clothes-rail',.34,1.65,lc,.012,l[3]-l[1]-.08,metal,interiors);rail.rotation.x=Math.PI/2;rail.position.set(.34,1.72,lc);
 for(let i=0;i<6;i++)b('shirt-'+i,[.17,l[1]+.09+i*.10,.53,l[1]+.12+i*.10],.64,1.02,i%2?fabric:putty,interiors,.009);
 b('folded-clothes',[.12,l[1]+.09,.52,l[3]-.09],1.818,.15,fabric,interiors,.012);
 for(const y of[.64,1.16,1.60])b('right-inner-shelf',[rr[0]+.025,rr[1]+.025,rr[2]-.045,rr[3]-.025],y,.018,lining,interiors);
 b('safe-placeholder',[.08,rr[1]+.105,.53,rr[3]-.105],.079,.50,dark,interiors,.01);
 b('safe-front',[.531,rr[1]+.12,.54,rr[3]-.12],.095,.466,metal,interiors,.006);
 b('safe-keypad',[.541,rr[1]+.25,.547,rr[1]+.33],.34,.09,putty,interiors);
 for(const [i,y]of [1.178,1.618].entries())b('right-storage-box-'+i,[.07,rr[1]+.09,.51,rr[3]-.09],y,.25,i?white:fabric,interiors,.008);
 function update({inside=false,pull=false,chairPull=false,evening=false}={}){
  doors.visible=!inside;interiors.visible=inside;
  for(const d of deskDrawers)d.position.x=pull?.18:0;
  stool.position.x=typeof chairPull==='number'?Math.max(0,chairPull):chairPull?.38:0;
  light.intensity=evening?.55:.18;glow.emissiveIntensity=evening?.75:.35;
 }
 update();
 return {group,mirror,mirrors:[mirror],deskDrawers,stool,update,setMirrorEnvironment(){/* Planar reflector reads the current room, no borrowed environment. */}};
}
