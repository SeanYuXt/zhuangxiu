// Integrated suite details. Every plan footprint comes from the shared spec.
export function integratedSuite(T,s,ctx){
 const {room,box,polygon,cylinder,glow,line,M,white,grey,dark,metal,glass,mirror,wallMaterials}=ctx;
 const cfg=s.design.suite,b=cfg.bath,f=b.fixtures,stone=M('#dbd5c9'),tile=M('#ded8cb'),ceramic=M('#f5f2e9');
 const w=s.walls.find(w=>w.id==='bath-outer'),o=s.openings.find(o=>o.id==='bath-window');
 // Existing window: topology from PDF; offset/width remain marked provisional.
 const wm=M('#eee8dc');wm.transparent=true;wm.opacity=.7;wm.userData.wallId=w.id;wallMaterials.push(wm);
 for(const r of [[0,-.10,o.offset,0],[o.offset+o.width,-.10,2.15,0]])box('bath-outer-wall',r,0,s.ceiling,wm);
 box('bath-window-sill',[o.offset,-.10,o.offset+o.width,0],0,o.sill,wm);
 box('bath-window-head',[o.offset,-.10,o.offset+o.width,0],o.top,s.ceiling-o.top,wm);
 box('bath-existing-frosted-window',[o.offset,-.018,o.offset+o.width,-.008],o.sill,o.top-o.sill,glass);
 for(const x of[o.offset,o.offset+o.width-.025])box('bath-window-frame',[x,-.025,x+.025,.01],o.sill,o.top-o.sill,dark);
 for(const y of[o.sill,o.top-.025])box('bath-window-frame',[o.offset,-.025,o.offset+o.width,.01],y,.025,dark);
 box('bath-tile-floor',b.usable,-.015,.015,tile);
 for(let x=.10;x<2.05;x+=.30)line([x,.003,.10],[x,.003,1.95],'#bbb5ab');
 for(let z=.10;z<1.95;z+=.30)line([.10,.003,z],[2.05,.003,z],'#bbb5ab');
 // Proposed shower: fixed side + three sliding leaves. Product net opening pending.
 const sh=f.shower.r;box('shower-floor',sh,.002,.008,stone);
 box('shower-side-screen',[sh[2]-.008,sh[1],sh[2],sh[3]],.04,2.01,glass);
 for(let i=0;i<3;i++){const x=sh[0]+i*(sh[2]-sh[0])/3;box('shower-sliding-leaf',[x,sh[3]+i*.012,x+(sh[2]-sh[0])/3+.015,sh[3]+.008+i*.012],.04,2.01,glass);box('shower-screen-upright',[x,sh[3]+i*.012,x+.013,sh[3]+.016+i*.012],.04,2.01,metal);}
 for(const y of[.035,2.04])box('shower-screen-track',[sh[0],sh[3]-.008,sh[2]+.015,sh[3]+.048],y,.02,metal);
 box('shower-mixer',[.13,.38,.18,.58],1.02,.035,metal);
 cylinder('shower-riser',.17,1.05,.48,.012,.99,metal);
 box('shower-head-arm',[.16,.46,.43,.48],2.04,.018,metal);
 cylinder('shower-rain-head',.43,2.025,.47,.10,.014,metal);
 for(const y of[1.12,1.43])box('shower-surface-shelf',[.13,.65,.29,.87],y,.018,white);
 for(let i=0;i<3;i++)cylinder('shampoo',.20,1.14,.69+i*.06,.018,.12,grey);
 box('shower-drain-proposed',[.32,.24,.42,.34],.012,.004,metal);
 const r=s.furniture.washstand.r;box('bath-vanity-carcass',[r[0],r[1]+.02,r[2]-.022,r[3]-.02],.24,.57,grey);
 for(const y of[.26,.53]){box('bath-vanity-drawer',[r[2]-.02,r[1]+.024,r[2]-.002,r[3]-.024],y,.25,white);box('bath-drawer-recess',[r[2]-.005,r[1]+.04,r[2],r[3]-.04],y+.23,.01,dark);}
 // Basin cutout represented with four rim strips and lowered bowl, no solid top blocking it.
 const sink=[r[0]+.07,r[1]+.12,r[2]-.055,r[3]-.12];
 for(const rr of [[r[0],r[1],sink[0],r[3]],[sink[2],r[1],r[2],r[3]],[sink[0],r[1],sink[2],sink[1]],[sink[0],sink[3],sink[2],r[3]]])box('bath-counter-rim',rr,.825,.025,ceramic);
 box('basin-bottom',sink,.72,.018,ceramic,room,.025);
 for(const rr of[[sink[0],sink[1],sink[0]+.018,sink[3]],[sink[2]-.018,sink[1],sink[2],sink[3]],[sink[0],sink[1],sink[2],sink[1]+.018],[sink[0],sink[3]-.018,sink[2],sink[3]]])box('basin-bowl-wall',rr,.73,.10,ceramic);
 cylinder('basin-drain',(sink[0]+sink[2])/2,.74,(sink[1]+sink[3])/2,.018,.003,metal);
 cylinder('bath-tap',r[0]+.035,.85,(r[1]+r[3])/2,.018,.19,metal);box('bath-tap-spout',[r[0]+.03,(r[1]+r[3])/2-.01,r[0]+.19,(r[1]+r[3])/2+.01],1.025,.018,metal);
 box('bath-mirror-cabinet',[r[0],r[1]+.02,r[0]+.14,r[3]-.02],1.06,.90,grey);
 box('bath-mirror-front',[r[0]+.142,r[1]+.035,r[0]+.153,r[3]-.035],1.08,.86,mirror);
 for(const z of[r[1]+.01,r[3]-.02])glow('bath-face-light',[r[0]+.155,z,r[0]+.162,z+.01],1.10,.81);
 glow('bath-vanity-footlight',[r[2]-.05,r[1]+.04,r[2]-.04,r[3]-.04],.24,.006);
 box('wash-moisture-separator',[r[0],r[3]-.02,.67,r[3]],.06,2.46,grey);
 box('wash-waterproof-backsplash',[r[0],r[1]+.02,r[0]+.018,r[3]-.02],.85,.21,stone);
 box('wash-upper-alignment',[r[0],r[1],.30,r[3]],2.02,.50,white);
 box('wash-end-splash',[r[0],r[1],r[2],r[1]+.02],.85,.21,stone);
 cylinder('wash-soap',r[0]+.28,.85,r[1]+.07,.025,.12,grey);
 const use=cfg.wash.standing;const mat=new T.MeshBasicMaterial({color:'#7fa58f',transparent:true,opacity:.24,depthWrite:false});box('wash-standing-zone',use,.012,.007,mat,ctx.technical);
 for(const [a,bb] of [[[1.53,.05,1.93],[1.53,.05,2.62]],[[1.53,.05,2.62],[2.42,.05,2.62]]])line(a,bb,'#568876',ctx.technical);
 const tr=f.toilet.r,cx=(tr[0]+tr[2])/2;
 box('toilet-tank',[tr[0]+.02,tr[1],tr[2]-.02,tr[1]+.18],.18,.58,ceramic,room,.045);
 const bowl=new T.Mesh(new T.SphereGeometry(1,36,20),ceramic);bowl.name='toilet-bowl';bowl.scale.set(.195,.20,.29);bowl.position.set(cx,.25,tr[3]-.29);room.add(bowl);
 box('toilet-seat',[tr[0],tr[1]+.17,tr[2],tr[3]],.43,.035,white,room,.12);
 cylinder('toilet-flush-button',cx,.763,tr[1]+.09,.018,.004,metal);
 box('existing-protrusion-unmeasured',f.shaftReserve.r,0,2.40,stone);
 box('pipe-access-panel-provisional',[1.84,.14,1.857,.36],.9,.35,grey);
 box('towel-rail',[1.64,.10,1.81,.13],1.24,.018,metal);
 box('hand-towel',[1.66,.095,1.79,.12],.96,.27,M('#c4b9a6'));
 const bathCeiling=new T.Group();bathCeiling.name='bath-ceiling';room.add(bathCeiling);
 for(let x=.10;x<2.05;x+=.30)for(let z=.10;z<1.95;z+=.30)box('removable-aluminium-panel',[x+.002,z+.002,Math.min(x+.298,2.05),Math.min(z+.298,1.95)],b.ceilingHeight,.025,white,bathCeiling);
 glow('bath-ceiling-light',[.72,1.20,1.01,1.49],b.ceilingHeight-.01,.009,bathCeiling);
 box('bath-exhaust-service',[1.31,.64,1.60,.93],b.ceilingHeight-.012,.012,grey,bathCeiling);
 for(let i=0;i<8;i++)box('exhaust-grille',[1.33,.66+i*.032,1.58,.67+i*.032],b.ceilingHeight-.014,.002,dark,bathCeiling);
 // Curved wall/ceiling coves, not a barrel vault. Small sections preserve the center height.
 const c=cfg.ceiling;
 function cove(name,span,z,sign){const points=[],n=24;for(let i=0;i<=n;i++){const t=Math.PI/2*i/n;points.push([z+sign*c.radius*(1-Math.cos(t)),c.flatHeight-c.radius+c.radius*Math.sin(t)]);}points.push([z+sign*c.radius,c.flatHeight+.02],[z,c.flatHeight+.02]);const shape=new T.Shape();points.forEach(([zz,y],i)=>i?shape.lineTo(zz,y):shape.moveTo(zz,y));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:span[1]-span[0],bevelEnabled:false});const mesh=new T.Mesh(geo,white);mesh.rotation.y=-Math.PI/2;mesh.position.x=span[1];mesh.name=name;mesh.receiveShadow=true;room.add(mesh);}
 cove('head-curved-cove',c.headSpan,0,1);cove('foot-curved-cove',c.footSpan,3.40,-1);
 const ceiling=box('sleep-flat-ceiling',[2.15,0,5.35,3.4],c.flatHeight,.02,white);ceiling.userData.sectionRoof=true;
 // Framed original doorway and subtle footlight, no new partition footprint.
 for(const x of[.745,1.71])box('entry-fine-casing',[x,4.675,x+.035,4.70],0,2.155,grey);
 box('entry-casing-head',[.745,4.675,1.745,4.70],2.12,.035,grey);
 glow('entry-low-guide',[.682,3.57,.689,3.81],.14,.025);
 cylinder('entry-downlight',1.12,2.52,3.88,.048,.012,white);
 const spot=new T.PointLight('#ffe2bd',3,3,2);spot.position.set(1.13,2.35,3.90);spot.userData.indoor=true;room.add(spot);
 const lc=s.furniture.linenCabinet,lr=lc.r,ls=cfg.linen,th=.018,mid=(lr[0]+lr[2])/2,front=lr[1]+ls.trackDepth,back=lr[3]-ls.backThickness;
 box('linen-recessed-plinth',[lr[0]+.045,lr[1]+.06,lr[2]-.045,lr[3]-.02],0,.08,dark);
 box('linen-back',[lr[0],back,lr[2],lr[3]],.08,lc.height-.08,grey);
 for(const x of[lr[0],mid-th/2,lr[2]-th])box('linen-vertical',[x,lr[1],x+th,lr[3]],.08,lc.height-.08,x===lr[2]-th?M(cfg.elevation.palette.panel):grey);
 for(const y of ls.shelfLevels)box('linen-adjustable-shelf',[lr[0]+th,front,lr[2]-th,back],y,th,white);
 for(const [x0,x1]of[[lr[0]+th,mid-th/2],[mid+th/2,lr[2]-th]])for(const [i,y]of ls.shelfLevels.slice(0,-1).entries()){
   const h=i<3?.27:.17;box('folded-bedding',[x0+.035,front+.025,x1-.035,back-.025],y+th,h,i%2?M('#c9bfaf'):M('#e4ddd0'),room,.035);
   if(i<3)for(let k=0;k<3;k++)line([x0+.045,y+th+.06+k*.06,front+.024],[x1-.045,y+th+.06+k*.06,front+.024],'#b9b0a2');
 }
 const inner=lr[2]-lr[0]-2*th,leaf=inner/2+.017,travel=inner-leaf;
 for(const [role,x,z]of[['left',lr[0]+th,lr[1]+.005],['right',lr[2]-th-leaf,lr[1]+.035]]){
   const g=new T.Group();g.name='linen-slide-'+role;room.add(g);box('linen-warm-sliding-front',[x,z,x+leaf,z+.018],.10,lc.height-.115,M(cfg.elevation.palette.front),g,.004);
   const hx=role==='left'?x+leaf-.045:x+.035;box('linen-recessed-pull',[hx,z-.003,hx+.010,z],.96,.20,M(cfg.elevation.palette.line),g,.001);box('linen-datum-joint',[x,z-.001,x+leaf,z],cfg.elevation.revealY,.003,M(cfg.elevation.palette.line),g,.001);
   ctx.linenDoors.push({g,role,travel});
 }
 for(const y of[.08,lc.height-.02])box('linen-double-track',[lr[0]+th,lr[1],lr[2]-th,front],y,.018,dark);
 box('linen-ceiling-scribe',[lr[0],lr[1],lr[2],lr[1]+.025],lc.height,ls.topFinish-lc.height,M(cfg.elevation.palette.front));
 const el=cfg.elevation,skin=M(el.palette.panel),joint=M(el.palette.line);
 for(const key of ['wallPanel','cornerReturn']){const p=el[key];box('unified-'+key,p.r,p.bottom,p.height,skin);}
 // Replace the exposed cabinet end with the same finish that continues along the wall.
 // Cabinet end already receives this finish in its carcass; do not duplicate the side mesh.
 box('continuous-upper-reveal',[3.60,3.373,5.35,3.378],el.revealY,.004,joint);
 box('corner-upper-reveal',[5.323,2.40,5.328,3.378],el.revealY,.004,joint);
 const ar=el.art;box('single-lightweight-frame',ar.r,ar.bottom,ar.height,joint);
 box('art-mat',[ar.r[0]+.013,ar.r[1]-.002,ar.r[2]-.013,ar.r[1]],ar.bottom+.013,ar.height-.026,M('#eee9df'));
 // Abstract artwork, deterministic decorative geometry; no extra storage footprint.
 box('art-composition-one',[4.02,ar.r[1]-.004,4.13,ar.r[1]-.002],1.23,.42,M('#b4a38a'));
 box('art-composition-two',[4.15,ar.r[1]-.005,4.39,ar.r[1]-.003],1.30,.24,M('#7f8276'));
 box('entry-continuous-top',[.02,2.12,.67,4.62],2.52,.06,white);
 const thd=cfg.threshold,pr=thd.slab,j=thd.jamb,top=thd.clearTop;
 for(const rj of[[pr[0],pr[1],pr[2],pr[1]+j],[pr[0],pr[3]-j,pr[2],pr[3]]])box('sleep-opening-jamb',rj,0,top,white);
 box('sleep-opening-header',pr,top,s.ceiling-top,white);
 function pocket(left){const z=left?pr[1]+j:pr[3]-j,rr=thd.radius,sign=left?1:-1,c=z+sign*rr;const sh=new T.Shape();sh.moveTo(z,top-rr);sh.lineTo(z,top);sh.lineTo(c,top);for(let i=0;i<=20;i++){const angle=Math.PI/2+i*Math.PI/40;sh.lineTo(c+sign*rr*Math.cos(angle),top-rr+rr*Math.sin(angle));}sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:pr[2]-pr[0],bevelEnabled:false});const mesh=new T.Mesh(g,white);mesh.name='sleep-opening-rounded-corner';mesh.rotation.y=-Math.PI/2;mesh.position.x=pr[2];mesh.receiveShadow=true;room.add(mesh);}
 pocket(true);pocket(false);
 const er=s.furniture.entryReturn.r;box('entry-shallow-return',er,.08,2.44,M(el.palette.front));
 box('shallow-top-scribe',[er[0],er[1],er[2],er[1]+.025],2.52,.06,M(el.palette.front));
 box('shallow-datum',[er[0],er[1]-.001,er[2],er[1]],el.revealY,.003,joint);
 const route=thd.passage;box('sleep-route-70cm',route,.018,.003,new T.MeshBasicMaterial({color:'#93ab98',transparent:true,opacity:.20,depthWrite:false}),ctx.technical);
 return {bathCeiling,ceiling};
}
