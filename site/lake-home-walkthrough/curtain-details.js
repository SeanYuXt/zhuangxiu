import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';
import {wovenFabricMaterial} from './textile-details.js?v=matte-fabric-2';
import {tileLayout} from './tile-surfaces.js';

// One physical fabric length through every pose. Gathering changes the wave,
// not a parent X scale or the weave pitch. This is not a cloth/motor simulation.
function section(span,length,folds,steps,closing,v=1){
 const flat=.030*closing**5,blend=.040*closing**5;
 // All hanger positions are zero crossings at the top. Lower down the folds
 // relax and twist; solve each horizontal section again rather than stretching
 // the fabric to create a tapered silhouette.
 const phase=t=>.60*(1-v)*Math.sin(t*Math.PI*6)+.80*Math.sin(v*Math.PI)*Math.sin(t*Math.PI*2);
 const shape=(t,a)=>a*Math.sin(t*Math.PI*2*folds+phase(t))*(1+.10*Math.sin(t*Math.PI*5+.4)*Math.sin(v*Math.PI))*(blend?T.MathUtils.clamp(((1-t)*span-flat)/blend,0,1):1);
 const measure=a=>{let total=0,last=shape(0,a);for(let i=1;i<=steps;i++){const z=shape(i/steps,a);total+=Math.hypot(span/steps,z-last);last=z;}return total;};
 let lo=0,hi=.12;for(let i=0;i<32;i++){const mid=(lo+hi)/2;if(measure(mid)<length)lo=mid;else hi=mid;}
 const amplitude=(lo+hi)/2,points=[],arcs=[0];let sum=0;
 for(let i=0;i<=steps;i++){const t=i/steps,z=shape(t,amplitude);points.push({t,z});if(i){sum+=Math.hypot(span/steps,z-points[i-1].z);arcs.push(sum);}}
 return {amplitude,points,arcs,length:sum,wave:t=>shape(t,amplitude)};
}
function grid(nx,ny){
 const g=new T.BufferGeometry(),index=[];g.setAttribute('position',new T.Float32BufferAttribute(new Float32Array((nx+1)*(ny+1)*3),3));g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array((nx+1)*(ny+1)*2),2));
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;index.push(a,b,c,b,d,c);}g.setIndex(index);return g;
}
function box(parent,name,x,y,z,w,h,d,material){
 // Six-millimetre concealed gliders do not need the rounded-box tessellation
 // used for the visible rail/motor. Keep the cloth fold resolution unchanged.
 const geometry=name.includes('-glider-')?new T.BoxGeometry(w,h,d):new RoundedBoxGeometry(w,h,d,2,Math.min(.002,w/5,h/5,d/5));
 const o=new T.Mesh(geometry,material);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
}
function leaf(root,spec,sign){
 // Pleat pitch is measured along the hung curtain, not the un-gathered cloth.
 // Keep the 1.85 fullness and stack width: fewer pleats necessarily use more
 // fore/aft space. The clearance verifier must accept that actual envelope.
 const closedSpan=spec.width/2+.025,length=closedSpan*1.85,folds=spec.id==='bed1'?Math.ceil(length/.19):Math.ceil(closedSpan/.20),nx=folds*20,ny=32;
 const g=new T.Group();g.name=spec.id+'-curtain-'+(sign<0?'left':'right');g.position.z=sign*.0025;root.add(g);
 const height=spec.top-spec.bottom,material=wovenFabricMaterial('#cbc7bd',length,height).clone();material.side=T.DoubleSide;material.sheen=1;material.sheenColor.set('#cbc7bd').multiplyScalar(.18);material.sheenRoughness=1;material.userData.sheenStrength=.18;material.name=spec.id+'-curtain-woven';
 const cloth=new T.Mesh(grid(nx,ny),material);cloth.name=g.name+'-cloth';cloth.castShadow=true;cloth.receiveShadow=true;cloth.userData={detailRole:'continuous-curtain-cloth',clothLength:length,height,folds,fullness:1.85};g.add(cloth);
 const bands=[];
 for(const [name,v0,v1,thickness] of [['header',.963,1,.0012],['weighted-hem',0,.038,.0018]])for(const face of [-1,1]){const offset=face*thickness,band=new T.Mesh(grid(nx,2),material);band.name=g.name+'-'+name+'-'+face;band.castShadow=true;band.receiveShadow=true;g.add(band);bands.push({band,v0,v1,offset});}
 const edgeMat=material.clone();edgeMat.color.multiplyScalar(.97);const sideHems=[];
 for(const [end,t0,t1] of [['outer',0,.006],['leading',.994,1]]){const edge=new T.Mesh(grid(1,ny),edgeMat);edge.name=g.name+'-'+end+'-folded-edge';g.add(edge);sideHems.push({edge,t0,t1});}
 const hooks=[],hookMat=new T.MeshStandardMaterial({color:'#c4c1b8',roughness:.56,metalness:.15});
 for(let i=0;i<=folds;i++){const hook=box(g,g.name+'-glider-'+i,0,spec.top+.019,0,.006,.038,.006,hookMat);hooks.push(hook);}
 let current=0;
 function pose(fraction){
  current=T.MathUtils.clamp(fraction,0,1);const span=T.MathUtils.lerp(spec.stack,closedSpan,current),sections=new Map();
  function atHeight(v){if(!sections.has(v)){const width=span+.080*(1-current)*(1-v)**1.5;sections.set(v,{...section(width,length,folds,nx,current,v),span:width});}return sections.get(v);}
  const s=atHeight(1);
  const profile=(t,v,offset=0)=>{
   const lower=1-v,row=atHeight(v);
   const x=sign*(spec.width/2-t*row.span),y=spec.bottom+v*height+.005*Math.sin(Math.PI*t)*Math.sin(t*Math.PI*folds*.5)**2*lower;
   const z=row.wave(t)+offset;
   return [x,y,z];
  };
  function fill(mesh,xSteps,ySteps,t0=0,t1=1,v0=0,v1=1,offset=0){const p=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;
   for(let j=0;j<=ySteps;j++)for(let i=0;i<=xSteps;i++){const t=T.MathUtils.lerp(t0,t1,i/xSteps),v=T.MathUtils.lerp(v0,v1,j/ySteps),k=j*(xSteps+1)+i,row=atHeight(v);const a=t*nx,n=Math.min(nx-1,Math.floor(a)),arc=T.MathUtils.lerp(row.arcs[n],row.arcs[n+1],a-n);p.setXYZ(k,...profile(t,v,offset));uv.setXY(k,arc/length,v);}
   p.needsUpdate=true;uv.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
  }
  fill(cloth,nx,ny);for(const b of bands)fill(b.band,nx,2,0,1,b.v0,b.v1,b.offset);for(const h of sideHems)fill(h.edge,1,ny,h.t0,h.t1,0,1,.0015);
  hooks.forEach((o,i)=>{o.position.x=sign*(spec.width/2-i/folds*span);});
  g.userData={detailRole:'pleated-curtain-leaf',fraction:current,span,hemSpan:atHeight(0).span,clothLength:length,sectionLength:s.length,amplitude:s.amplitude,folds,stack:spec.stack,scaleInvariant:true,simulation:'constant-length sections with relaxed hem; not cloth dynamics'};
  g.updateMatrixWorld(true);
 }
 pose(0);return {group:g,cloth,pose,get fraction(){return current;}};
}

export function refineCurtains(model){
 if(model.getObjectByName('living-curtain')?.userData.continuousCloth)throw Error('Curtain refinement must be applied once');
 model.updateMatrixWorld(true);
 const bound=n=>new T.Box3().setFromObject(model.getObjectByName(n)),care=bound('balcony-care-cabinet'),laundry=bound('balcony-laundry-cabinet');
 const livingEnds=[care.max.x+.025,laundry.min.x-.025],controllers={};
 for(const id of ['living','bed1','master','bed3']){
  const old=model.getObjectByName(id+'-curtain');if(!old||old.children.filter(c=>c.children.length===14).length!==2)throw Error('Unreviewed curtain baseline '+id);
  const root=new T.Group();root.name=id+'-curtain';root.position.copy(old.position);root.quaternion.copy(old.quaternion);root.scale.copy(old.scale);old.parent.add(root);old.name+='-baseline';old.visible=false;
  const spec={id,width:id==='living'?livingEnds[1]-livingEnds[0]:id==='bed1'?2.5:id==='master'?2.8:1.58,stack:id==='living'?.32:.28,bottom:tileLayout.surfaceY+.015,top:id==='living'?2.575:2.60};
  if(id==='living'){root.position.x=(livingEnds[0]+livingEnds[1])/2;root.position.z-=.06;}
  // The elder's cabinet starts 10mm behind the old curtain line: move only the
  // rail/cloth 50mm towards the window, within the measured model's 120mm gap.
  if(id==='bed1')root.position.z-=.05;
  // Wide pleats need room behind the cloth as well as in front. These two
  // east-facing tracks move 30mm roomward, leaving the window/sill unchanged.
  if(id==='master'||id==='bed3')root.position.x-=.03;
  const railMat=new T.MeshStandardMaterial({color:'#cac8bf',roughness:.46,metalness:.25});
  for(const z of [-.008,.008])box(root,id+'-curtain-track',0,spec.top+.031,z,spec.width+.004,.016,.005,railMat);
  for(const x of [-spec.width/2,spec.width/2])box(root,id+'-curtain-track-end',x,spec.top+.031,0,.005,.018,.023,railMat);
  const leaves=[leaf(root,spec,-1),leaf(root,spec,1)];
  const motorZ=id==='bed1'?.055:id==='living'?.095:-.075;
  box(root,id+'-curtain-motor',-spec.width/2+.065,spec.top-.065,motorZ,.032,.19,.029,railMat);
  box(root,id+'-curtain-drive-link',-spec.width/2+.065,spec.top+.033,motorZ/2,.028,.012,Math.abs(motorZ)+.012,railMat);
  root.userData={continuousCloth:true,detailRole:'curtain-system',width:spec.width,bottom:spec.bottom,top:spec.top,room:id,selectedProduct:false,electricalConnected:false,installationVerified:false,designNote:id==='living'?'Wide pleats; track 60mm glassward to clear washer door sweep':id==='bed1'?'Compact pleats in 120mm sill/cabinet gap; rail 50mm windowward':'Wide pleats; track 30mm roomward from baseline, sill unchanged'};
  const set=f=>{leaves.forEach(l=>l.pose(f));root.updateMatrixWorld(true);};controllers[id]={root,spec,leaves,set,get fraction(){return leaves[0].fraction;}};
 }
 model.updateMatrixWorld(true);return {rooms:controllers,set:(room,f)=>controllers[room].set(f),reset:()=>Object.values(controllers).forEach(c=>c.set(0))};
}
