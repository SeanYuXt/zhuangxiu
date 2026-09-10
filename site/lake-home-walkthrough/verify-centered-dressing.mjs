import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {mountCenteredDressing} from './master-centered-dressing.js';
import {optionAudit} from './master-window-ac-option-audit.js';

// Run from any directory: node /path/to/verify-centered-dressing.mjs
// Geometry helpers reproduce the production primitives without needing a WebGL context.
const spec=JSON.parse(fs.readFileSync(new URL('./master-window-ac-option-spec.json',import.meta.url)));
const scene=new T.Scene(),M=color=>new T.MeshStandardMaterial({color}),white=M('#f0ede7'),metal=M('#656961'),putty=M('#beb4a6'),fabric=M('#c4b8aa');
function box(name,r,y,h,mat=white,parent=scene,radius=.005){
 const dx=r[2]-r[0],dz=r[3]-r[1],o=new T.Mesh(new RoundedBoxGeometry(dx,h,dz,3,Math.min(radius,dx/3,dz/3,h/3)),mat);
 o.name=name;o.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);parent.add(o);return o;
}
function roundedFace(name,x,y,z,w,h,d,r,mat,parent=scene){
 const sh=new T.Shape();sh.moveTo(r,0);sh.lineTo(w-r,0);sh.quadraticCurveTo(w,0,w,r);sh.lineTo(w,h-r);sh.quadraticCurveTo(w,h,w-r,h);sh.lineTo(r,h);sh.quadraticCurveTo(0,h,0,h-r);sh.lineTo(0,r);sh.quadraticCurveTo(0,0,r,0);
 const o=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false,curveSegments:24}),mat);o.name=name;o.position.set(x,y,z);parent.add(o);return o;
}
function cylinder(x,y,z,r,h,mat=metal,parent=scene){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,24),mat);o.position.set(x,y+h/2,z);parent.add(o);return o;}
function drawer(name,rr,base,height,axis,parent){
 const g=new T.Group();g.name=name;parent.add(g);const thick=.012;
 box(name+'-bottom',[rr[0]+thick,rr[1]+thick,rr[2]-thick,rr[3]-thick],base,.012,putty,g);
 for(const x of[rr[0],rr[2]-thick])box(name+'-side',[x,rr[1],x+thick,rr[3]],base,height-.01,white,g);
 for(const z of[rr[1],rr[3]-thick])box(name+'-side',[rr[0],z,rr[2],z+thick],base,height-.01,white,g);
 const fr=axis==='z'?[rr[0]-.024,rr[1]-.024,rr[2]+.024,rr[1]-.006]:[rr[2]+.001,rr[1],rr[2]+.019,rr[3]];
 box(name+'-front',fr,base,height-.006,white,g);box(name+'-pull',fr,base+height-.006,.006,putty,g);return g;
}
const checks=[],errors=[],epsilon=1e-6;
function check(name,passed,evidence){checks.push({name,passed,evidence});if(!passed)errors.push(name);}
const near=(a,b)=>Math.abs(a-b)<epsilon;
const cfg=spec.design.centeredDressing,{left,desk,right}=cfg;
check('Desk centered between equal flanking wardrobes',near(left.r[3],desk.r[1])&&near(desk.r[3],right.r[1])&&near(left.r[3]-left.r[1],.75)&&near(right.r[3]-right.r[1],.75)&&near(desk.r[3]-desk.r[1],1),cfg);
check('Authoritative footprints are flush with wall',[left,desk,right].every(q=>near(q.r[0],0)),[left.r,desk.r,right.r]);
check('Audit furniture agrees with central desk',JSON.stringify(spec.furniture.vanity.r)===JSON.stringify(desk.r),spec.furniture.vanity.r);
const model=mountCenteredDressing({scene,s:spec,box,roundedFace,cylinder,M,white,metal,putty,fabric,drawer});
scene.updateMatrixWorld(true);
const bounds=o=>new T.Box3().setFromObject(o),serial=b=>({min:b.min.toArray(),max:b.max.toArray()});
const total=bounds(model.group),expected=new T.Box3(new T.Vector3(0,0,left.r[1]),new T.Vector3(.65,cfg.height,right.r[3]));
check('Assembled unit fits fixed envelope',expected.clone().expandByScalar(epsilon).containsBox(total),serial(total));
const backNames=['centered-left-wardrobe-back','centered-right-wardrobe-back','centered-desk-back','centered-bridge-back'];
const backs=backNames.map(name=>({name,minX:bounds(scene.getObjectByName(name)).min.x}));
check('Rendered backs touch wall',backs.every(q=>near(q.minX,0)),backs);
const knee=new T.Box3(new T.Vector3(.03,.001,desk.r[1]+.018),new T.Vector3(.43,.639,desk.r[3]-.018));
const obstructions=[];
model.group.traverse(o=>{if(!o.isMesh)return;let p=o;while(p&&p!==model.stool)p=p.parent;if(p===model.stool)return;if(bounds(o).intersectsBox(knee))obstructions.push(o.name);});
check('No fixed knee-space obstructions',obstructions.length===0,{volume:serial(knee),obstructions});
const tucked=bounds(model.stool);
check('Stool tucks below desktop',tucked.min.x>=desk.r[0]&&tucked.max.x<=desk.r[2]&&tucked.min.z>desk.r[1]&&tucked.max.z<desk.r[3]&&tucked.max.y<.64,serial(tucked));
const mirror=bounds(model.mirror);
check('Mirror remains within central wall opening',mirror.min.z>desk.r[1]&&mirror.max.z<desk.r[3]&&mirror.min.y>=cfg.deskHeight&&mirror.max.y<2.05&&mirror.max.x<.05,serial(mirror));
const drawerClosed=model.deskDrawers.map(bounds),chairTravel=spec.design.windowOption.vanity.chairPull;
model.update({inside:true,pull:true,chairPull:chairTravel,evening:true});scene.updateMatrixWorld(true);
const drawerTravel=model.deskDrawers.map((d,i)=>bounds(d).min.x-drawerClosed[i].min.x),stoolTravel=bounds(model.stool).min.x-tucked.min.x;
check('Storage and movable parts respond to controls',scene.getObjectByName('centered-dressing-interiors').visible&&!scene.getObjectByName('centered-dressing-closed-fronts').visible&&model.mirror.visible&&drawerTravel.every(t=>t>.1&&t<.3)&&near(stoolTravel,chairTravel),{drawerTravel,stoolTravel,chairTravel});
const light=scene.getObjectByName('centered-makeup-task-light'),nightIntensity=light.intensity;
model.update({inside:false,pull:false,chairPull:0,evening:false});scene.updateMatrixWorld(true);
check('Controls restore tucked closed state',!scene.getObjectByName('centered-dressing-interiors').visible&&scene.getObjectByName('centered-dressing-closed-fronts').visible&&near(bounds(model.stool).min.x,tucked.min.x)&&model.deskDrawers.every((d,i)=>near(bounds(d).min.x,drawerClosed[i].min.x))&&light.intensity<nightIntensity,{dayIntensity:light.intensity,nightIntensity});
const texture=new T.CubeTexture();model.setMirrorEnvironment(texture);check('Mirror receives environment map',model.mirror.material.envMap===texture);
const audit=optionAudit(spec);check('Whole-room furniture, door and route audit',audit.ok,audit.errors);
const result={passed:errors.length===0,checks,errors,optionAudit:audit,limits:['Model geometry checks, not field measurements or construction certification.','Movable drawers/stool are tested for state and travel; simultaneous human comfort is not simulated.']};
const output=new URL('./centered-dressing-verification.json',import.meta.url);fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:result.passed,checks:checks.length,errors,output:fileURLToPath(output)}));
if(errors.length)process.exitCode=1;
