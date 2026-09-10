import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {palette} from './design-spec.js';
import {finishWoodPanel} from './cabinet-finishes.js';

// A single horizontal display band: no freestanding tall towers.
// The screen/lining move 100mm forward, within the unchanged low-console envelope.
export function reviseTVDisplay(model){
 const tv=model.getObjectByName('recessed-tv-black-side-reveals');
 if(!tv||tv.getObjectByName('tv-display-columns'))throw Error('电视墙缺失或重复深化');
 const root=new T.Group();root.name='tv-display-columns';tv.add(root);
 const warm=new T.MeshStandardMaterial({color:palette.cabinet,roughness:.65}),oak=new T.MeshStandardMaterial({color:palette.wood,roughness:.7});
 const led=new T.MeshStandardMaterial({color:'#fff2da',emissive:'#ffe3bf',emissiveIntensity:0});
 const box=(parent,name,x,y,z,w,h,d,material=warm)=>{const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,.0015),material);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(material===oak)finishWoodPanel(o,{interior:true});return o;};
 const replaced=[],shifted=[];
 for(const o of tv.children){
  if(!o.isMesh)continue;o.geometry.computeBoundingBox();const s=o.geometry.boundingBox.getSize(new T.Vector3());
  const side=Math.abs(Math.abs(o.position.x)-1.5)<.002&&Math.abs(s.x-.8)<.002&&s.y>2.7;
  const centre=Math.abs(s.x-2.2)<.002&&(Math.abs(s.y-.815)<.002||Math.abs(s.y-.735)<.002);
  if(side||centre){o.visible=false;replaced.push(o);}
  else if(s.x<3.7){o.position.z+=.1;shifted.push(o);}
 }
 if(replaced.length!==4)throw Error('电视墙原饰面数量不符，停止猜测');
 // All new joinery stays ahead of the original backing at z=-.2175.
 // Full-width upper/lower panels visually join the screen and display bays.
 box(root,'tv-display-upper-infill',0,2.4075,-.08,3.8,.735,.12);
 box(root,'tv-display-lower-infill',0,.4325,-.08,3.8,.815,.12);
 const shelves=[.858,1.449,2.04];
 for(const side of [-1,1]){
  const x=side*1.375,g=new T.Group();g.name=side<0?'tv-display-lake':'tv-display-dining';root.add(g);
  box(root,'tv-display-outer-pilaster',side*1.775,1.44,-.08,.25,1.2,.12);
  const woodBox=(name,bx,y,z,w,h,d)=>{const o=box(g,name,bx,y,z,w,h,d,oak);o.material.color.set('#b5b0a6');return o;};
  woodBox('tv-display-oak-back',x,1.44,-.2085,.514,1.2,.018);
  for(const edge of [-1,1])woodBox('tv-display-side',x+edge*.266,1.44,-.1175,.018,1.2,.195);
  for(const y of shelves)woodBox('tv-display-shelf',x,y-.009,-.1085,.514,.018,.177);
  for(let i=1;i<shelves.length;i++){
   const y=shelves[i]-.025;
   box(g,'tv-display-light-channel',x,y,-.047,.476,.012,.022,oak);
   const strip=box(g,`tv-display-light-${side<0?'left':'right'}-${i}`,x,y-.006,-.047,.456,.002,.014,led.clone());
   strip.userData.lightingDirectionLocal=[0,-1,-.25];
  }
  // Move the existing small compositions onto shelves, without resizing them.
  const decor=tv.getObjectByName(side<0?'tv-decor-lake-side':'tv-decor-dining-side');
  decor.position.set(side<0?-.07:.045,shelves[1]-.478,-.15);
  // The shallow band takes smaller albums; neither objects nor vase penetrate its back.
  if(side<0)decor.children[0].position.z+=.015;
  else for(const o of decor.children.slice(0,2))o.scale.z*=.84;
  const books=new T.Group();books.name='tv-display-books-'+side;g.add(books);
  for(let j=0;j<3;j++)box(books,'tv-display-book',x-.09+j*.072,shelves[0]+(.26-j*.022)/2,-.11,.060,.26-j*.022,.15,new T.MeshStandardMaterial({color:['#b8b09f','#d8d1c3','#7e887c'][j],roughness:.83}));
  g.userData={width:.55,depth:.1975,clearShelfWidth:.514,shelves:2,bottom:.84,top:2.04,selectedHardware:false};
 }
 root.userData={scheme:'电视齐平横向展示带 · 两侧各两格 · 整片上下饰面',width:3.3,liningWidth:3.8,depth:.1975,screenMoved:true,screenForwardMetres:.1,wallCut:false,fixingVerified:false,driver:'低柜内独立可检修低压驱动与走线预留；未接现场回路'};
 tv.userData={...tv.userData,scheme:'horizontal-display-band',liningDepth:.22,displayDepth:.1975,structuralCut:false};
 // Fail visibly at startup rather than silently accepting an enlarged footprint.
 const screen=tv.getObjectByName('85-inch-screen');screen.geometry.computeBoundingBox();
 const screenSize=screen.geometry.boundingBox.getSize(new T.Vector3());
 if(Math.abs(screenSize.x-1.882)>.002||Math.abs(screenSize.y-1.059)>.002||Math.abs(screen.position.z+.02)>.001)throw Error('85寸电视尺寸或齐平位置不符');
 root.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().translate(o.position);if(b.max.z>.2401||b.min.z<-.2176||b.min.x< -1.901||b.max.x>1.901)throw Error('电视展示带超出原占地或结构背板：'+o.name);});
 model.updateMatrixWorld(true);
 const shelfMeshes=[],books=[],ray=new T.Raycaster();
 root.traverse(o=>{if(o.name==='tv-display-shelf')shelfMeshes.push(o);if(o.name==='tv-display-book')books.push(o);});
 for(const name of ['tv-decor-lake-side','tv-decor-dining-side'])books.push(tv.getObjectByName(name));
 const inverse=tv.matrixWorld.clone().invert();
 for(const item of books){
  const bounds=new T.Box3().setFromObject(item),p=bounds.getCenter(new T.Vector3());p.y=bounds.min.y+.002;
  ray.set(p,new T.Vector3(0,-1,0));ray.far=.004;
  if(!ray.intersectObjects(shelfMeshes,false).length)throw Error('电视摆件未落在层板上：'+item.name);
  item.traverse(o=>{if(!o.isMesh)return;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));if(b.min.z<-.1996||b.max.z>-.0199||b.min.x< -1.6321||b.max.x>1.6321)throw Error('电视摆件超出展示格：'+item.name);});
 }
 root.userData.geometryCheck={screenSize:screenSize.toArray(),supportedCompositions:books.length,displayEmitters:4,consoleFootprintChanged:false};
 return {root,tv,replaced,shifted};
}
