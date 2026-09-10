import * as T from './vendor/three.module.js';
// Single fixture model shared by the suite and bathroom viewer. Coordinates in metres.
export function mountSimpleBath({scene:parent}){
const scene=new T.Group();scene.name='simple-pdf-bath';parent.add(scene);
const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.65});
const stone=mat('#dfdbce'),white=mat('#faf8ed'),wood=mat('#c6b99e'),metal=mat('#606e65');
function box(r,y,h,m=stone){const o=new T.Mesh(new T.BoxGeometry(r[2]-r[0],h,r[3]-r[1]),m);o.position.set((r[0]+r[2])/2,y+h/2,(r[1]+r[3])/2);scene.add(o);return o;}
function cyl(x,z,y,r,h,m=white){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,48),m);o.position.set(x,y+h/2,z);scene.add(o);return o;}
// User-directed 10cm projection, replacing the previous 45cm assumption.
for(const r of [[0,1.35,.10,1.95],[0,1.1,.10,1.35]]){const o=box(r,.006,.015,mat('#c8b99b'));const edges=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(r[2]-r[0],.03,r[3]-r[1])),new T.LineDashedMaterial({color:'#967b52',dashSize:.04,gapSize:.03}));edges.position.copy(o.position);edges.computeLineDistances();scene.add(edges);}
// Toilet in former shower corner, back to left wall and facing the open centre.
box([.11,.32,.28,.68],.08,.65,white);box([.26,.36,.71,.64],.07,.32,white);
const seat=cyl(.51,.50,.39,.18,.055);seat.scale.x=1.25;
const hole=cyl(.52,.50,.447,.115,.004,mat('#aeb7aa'));hole.scale.x=1.34;
box([.15,.46,.20,.54],.735,.008,metal);
const basinStart=scene.children.length;
// 90x40cm entry-left vanity after assembly transform; double drawer fronts.
box([1.65,.575,2.05,1.475],.30,.47,wood);
for(const y of [.32,.55]){box([1.641,.585,1.65,1.465],y,.20,white);box([1.638,.66,1.645,1.39],y+.188,.009,metal);}
const bowl=[1.70,.77,1.96,1.28];
box([1.65,.575,2.05,.77],.78,.04,white);box([1.65,1.28,2.05,1.475],.78,.04,white);
box([1.65,.77,1.70,1.28],.78,.04,white);box([1.96,.77,2.05,1.28],.78,.04,white);
box(bowl,.70,.02,white);for(const z of [.77,1.27])box([1.70,z,1.96,z+.01],.72,.10,white);
for(const x of [1.70,1.95])box([x,.77,x+.01,1.28],.72,.1,white);
cyl(1.83,1.025,.722,.018,.003,metal);cyl(2.00,1.025,.82,.012,.17,metal);box([1.85,1.012,2.01,1.038],.97,.02,metal);
// Shallow mirrored storage, within the basin depth; cutaway button reveals shelves.
const mirrorCabinetParts=[];
function mc(r,y,h,m=white){const o=box(r,y,h,m);mirrorCabinetParts.push(o);return o;}
mc([2.035,.575,2.05,1.475],1.04,.92,wood);
for(const z of [.575,1.46])mc([1.925,z,2.05,z+.015],1.04,.92);
for(const y of [1.04,1.34,1.64,1.945])mc([1.925,.59,2.035,1.46],y,.015);
const mirror=new T.Group();scene.add(mirror);
const mirrorMat=new T.MeshStandardMaterial({color:'#b8c6bd',metalness:.8,roughness:.12});
const mirrorDoors=[];
for(const [z,sign] of [[.59,1],[1.46,-1]]){
 const hinge=new T.Group();hinge.position.set(1.916,0,z);mirror.add(hinge);
 const leaf=new T.Mesh(new T.BoxGeometry(.012,.89,.432),mirrorMat);leaf.position.set(0,1.50,sign*.216);hinge.add(leaf);
 const pull=new T.Mesh(new T.BoxGeometry(.023,.12,.012),metal);pull.position.set(-.014,1.35,sign*.397);hinge.add(pull);
 mirrorDoors.push({hinge,sign});
}
let mirrorInside=false,mirrorAngle=0;

function updateMirror(){mirrorAngle+=((mirrorInside?Math.PI/2:0)-mirrorAngle)*.12;for(const d of mirrorDoors)d.hinge.rotation.y=-d.sign*mirrorAngle;}
const glow=new T.MeshStandardMaterial({color:'#fff4da',emissive:'#fff0d0',emissiveIntensity:1.5});
for(const z of [.58,1.455])mc([1.905,z,1.925,z+.012],1.055,.89,glow);
function storedBottle(z,y,h,m){const o=cyl(1.98,z,y,.023,h,m);mirrorCabinetParts.push(o);const cap=cyl(1.98,z,y+h,.014,.017,metal);mirrorCabinetParts.push(cap);}
storedBottle(.70,1.055,.13,wood);storedBottle(.88,1.055,.17,white);storedBottle(1.1,1.355,.18,wood);storedBottle(1.30,1.355,.13,white);
for(let i=0;i<3;i++)mc([1.94,.64,2.025,.92],1.655+i*.032,.027,wood);
// Daily wash items sit at the rear, next to the wall, leaving front edge free.
box([1.93,.60,2.035,.735],.82,.012,wood);cyl(1.98,.665,.832,.026,.13,mat('#899b86'));cyl(1.99,1.385,.82,.025,.10,white);
for(const z of [1.375,1.397])cyl(1.99,z,.895,.003,.13,metal);
const basinAssembly=new T.Group();
for(const o of scene.children.slice(basinStart))basinAssembly.add(o);
scene.add(basinAssembly);basinAssembly.rotation.y=Math.PI;basinAssembly.position.set(2.15,0,2.525);
// Local shower zone; entry remains circulation, with splash control during use.
box([1.15,.1,2.05,1],.004,.008,mat('#bfcdc4'));
// Shower mounted on the solid wall to the right of the window.
cyl(1.65,.14,.95,.013,1.1,metal);box([1.64,.14,1.66,.50],2.02,.02,metal);cyl(1.65,.49,1.99,.10,.015,metal);
box([1.52,.11,1.78,.17],1.0,.045,metal);
box([1.45,.11,1.85,.14],.015,.01,metal);
// Shallow shelves alongside the mixer, reachable within the shower.
for(const y of [1.12,1.46]){box([1.83,.11,2.02,.24],y,.018,metal);box([1.83,.232,2.02,.242],y+.018,.025,metal);}
cyl(1.88,.17,1.138,.025,.17,mat('#899b86'));cyl(1.97,.17,1.138,.025,.20,white);
box([1.85,.13,1.93,.21],1.48,.015,white);cyl(1.97,.17,1.478,.027,.07,wood);

return {group:scene,annotations:[],setMirrorEnvironment(){},update({mirrorInside:open=false,view='bath'}={}){mirrorInside=open;const top=['top','bathTop','plan'].includes(view);mirror.visible=!top;mirrorCabinetParts.forEach(o=>o.visible=!top);},tick:updateMirror};
}
