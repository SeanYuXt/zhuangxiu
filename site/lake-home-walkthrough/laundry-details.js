import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';

const finish=(color,roughness,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
const enamel=finish('#dedfd9',.3,.12),steel=finish('#9fa7a5',.27,.85),rubber=finish('#424947',.85),dark=finish('#303837',.5),white=finish('#e4e5de',.45);
function mesh(parent,name,geometry,material,position){const o=new T.Mesh(geometry,material);o.name=name;o.position.fromArray(position);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(p,n,pos,size,mat=enamel){return mesh(p,n,new RoundedBoxGeometry(...size,2,.0015),mat,pos);}
function profile(p,n,points,mat,pos){const o=mesh(p,n,new T.LatheGeometry(points.map(v=>new T.Vector2(...v)),64),mat,pos);o.rotation.x=Math.PI/2;return o;}
function disk(p,n,r,depth,mat,pos){const o=mesh(p,n,new T.CylinderGeometry(r,r,depth,64),mat,pos);o.rotation.x=Math.PI/2;return o;}
function drumFinish(){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const c=canvas.getContext('2d');c.fillStyle='#abb2af';c.fillRect(0,0,512,512);
 for(let row=0;row<16;row++)for(let col=0;col<16;col++){const x=col*32+(row%2?16:0),y=row*32;c.fillStyle='#626b68';c.beginPath();c.arc(x,y,3.2,0,Math.PI*2);c.fill();c.strokeStyle='#d3d8d5';c.lineWidth=1;c.beginPath();c.arc(x,y+1,4,0,Math.PI);c.stroke();}
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(4,1);return new T.MeshStandardMaterial({map,metalness:.8,roughness:.32,side:T.DoubleSide});
}
function refineUnit(unit,kind,drumMaterial){
 // Retain the imported display, knob and detergent face; replace the solid body/dummy disks.
 const controls=unit.children.filter(o=>o.position.y>=.69);if(controls.length!==4)throw Error('Unexpected laundry control layout: '+kind);
 for(const o of [...unit.children])if(!controls.includes(o))o.removeFromParent();
 const body=new T.Group();body.name=kind+'-panel-shell';unit.add(body);
 for(const x of [-.295,.295])box(body,kind+'-side-panel',[x,.42,0],[.010,.84,.63]);
 for(const y of [.005,.835])box(body,kind+'-horizontal-panel',[0,y,0],[.58,.010,.63]);
 box(body,kind+'-rear-panel',[0,.42,-.310],[.58,.82,.010]);
 // A real circular aperture: the central ray enters the drum instead of hitting a painted disk.
 const face=new T.Shape();face.moveTo(-.29,.015);face.lineTo(.29,.015);face.lineTo(.29,.826);face.lineTo(-.29,.826);face.closePath();
 const hole=new T.Path();hole.absarc(0,.391,.203,0,Math.PI*2,true);face.holes.push(hole);
 mesh(body,kind+'-aperture-front',new T.ExtrudeGeometry(face,{depth:.010,bevelEnabled:false,curveSegments:64}),enamel,[0,0,.305]);
 profile(unit,kind+'-door-gasket',[[.184,.265],[.187,.283],[.182,.302],[.192,.323],[.201,.324],[.201,.31],[.193,.293],[.198,.274]],rubber,[0,.391,0]);
 const drum=new T.Group();drum.name=kind+'-drum-interior';unit.add(drum);
 const barrel=mesh(drum,kind+'-drum-barrel',new T.CylinderGeometry(.184,.184,.37,64,1,true),drumMaterial,[0,.391,.072]);barrel.rotation.x=Math.PI/2;
 disk(drum,kind+'-drum-back',.183,.006,steel,[0,.391,-.116]);
 profile(drum,kind+'-drum-back-ring',[[.145,-.111],[.15,-.105],[.16,-.105],[.165,-.111]],steel,[0,.391,0]);
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3,lifter=box(drum,kind+'-drum-lifter',[Math.sin(a)*.174,.391+Math.cos(a)*.174,.066],[.035,.017,.31],white);lifter.rotation.z=-a;}
 if(kind==='washer'){
  disk(unit,'washer-pump-access',.036,.007,enamel,[.208,.077,.319]);
  box(unit,'washer-pump-finger-notch',[.208,.061,.324],[.022,.006,.003],dark);
 }else{
  box(unit,'dryer-lower-filter-cover',[0,.064,.319],[.52,.076,.009]);
  for(let i=0;i<12;i++)box(unit,'dryer-filter-intake-slot',[-.205+i*.025,.060,.325],[.014,.024,.002],dark);
  box(drum,'dryer-lint-screen',[0,.227,.21],[.18,.012,.075],rubber);
 }
 const hinge=new T.Group();hinge.name=kind+'-door-hinge';hinge.position.set(.231,.391,.35);unit.add(hinge);
 const door=new T.Group();door.name=kind+'-opening-door';door.position.x=-.231;hinge.add(door);
 profile(door,kind+'-door-ring',[[.176,-.012],[.216,-.012],[.225,-.002],[.225,.012],[.216,.021],[.179,.021],[.176,.014],[.176,-.012]],kind==='washer'?steel:dark,[0,0,0]);
 const glass=new T.MeshPhysicalMaterial({color:'#d4e0de',metalness:0,roughness:.09,transmission:.94,thickness:.004,ior:1.5,attenuationDistance:1,attenuationColor:'#ffffff',side:T.DoubleSide});glass.name='laundry-door-clear-glass';
 profile(door,kind+'-porthole',[[0,-.006],[.11,-.006],[.155,.001],[.176,.011],[.179,.011],[.158,-.003],[.112,-.010],[0,-.010]],glass,[0,0,0]);
 box(door,kind+'-door-grip',[-.199,-.007,.033],[.024,.092,.02],dark);
 for(const y of [-.045,.045])box(unit,kind+'-hinge-fixed',[.241,.391+y,.325],[.039,.024,.022],steel);
 box(hinge,kind+'-hinge-arm',[-.025,0,-.008],[.05,.10,.016],steel);
 unit.userData={...unit.userData,nominalDepthMm:630,hingeSide:'local-right / away from glass',maxPreviewAngle:110,modelSelected:false,installationStatus:'Selection envelope only; requires right-hinged product, not field-reversing an arbitrary washer'};
 return {unit,hinge,door,body,drum};
}

export function refineLaundry(model){
 const cabinet=model.getObjectByName('balcony-laundry-cabinet');if(!cabinet)throw Error('Missing laundry cabinet');
 const drumMaterial=drumFinish(),units={};for(const kind of ['washer','dryer'])units[kind]=refineUnit(cabinet.getObjectByName('laundry-'+kind),kind,drumMaterial);
 cabinet.getObjectByName('laundry-stacking-kit').removeFromParent();
 const kit=new T.Group();kit.name='laundry-stacking-kit';cabinet.add(kit);
 for(const x of [-.383,.155]){
  box(kit,'stacking-support-rail',[x,.9195,-.012],[.060,.025,.61],dark);
  box(kit,'stacking-elastomer-pad',[x,.906,0],[.060,.002,.55],rubber);
  for(const z of [-.255,.255])box(kit,'dryer-support-pad',[x,.9335,z],[.048,.003,.055],rubber);
 }
 for(const z of [-.302,.278])box(kit,'stacking-cross-member',[-.114,.9195,z],[.478,.025,.030],dark);
 for(const x of [-.36,.13])for(const z of [-.25,.24])box(cabinet,'washer-leveling-pad',[x,.0625,z],[.052,.005,.055],rubber);
 kit.userData={manufacturerKitSelected:false,loadRating:null,warning:'示意承接关系；不可按此自行制作叠放件'};
 const state={washer:0,dryer:0};
 function set(kind,degrees){if(!units[kind]||!Number.isFinite(degrees))throw Error('Invalid laundry action');const angle=T.MathUtils.clamp(degrees,0,110);state[kind]=angle;units[kind].hinge.rotation.y=angle*Math.PI/180;model.updateMatrixWorld(true);}
 function reset(){set('washer',0);set('dryer',0);}
 return {cabinet,units,kit,state,set,reset};
}
