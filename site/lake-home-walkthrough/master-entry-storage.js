import * as T from './vendor/three.module.js';
import {overlap,inside} from './master-suite-geometry.js?v=sleep-entry-09';

export function auditEntry(s){
 const e=s.design.entryStorage,r=s.furniture.wardrobe.r,errors=[],poly=s.spaces.find(p=>p.id==='master').polygons[0];
 for(const leaf of e.doors)for(const move of[0,leaf.move])if(leaf.z[0]+move<r[1]||leaf.z[1]+move>r[3]||leaf.x<r[2]-e.trackDepth||leaf.x+.018>r[2])errors.push('入口移门超出柜体或轨道预留');
 const hr=s.design.hanging.r,entry=s.openings.find(o=>o.id==='entry'),art=s.design.entryArt;
 if(hr[3]>entry.hinge[1]-entry.width-.02)errors.push('挂物未避开原门扫掠');
 if(art.r[2]>entry.offset-.08||art.r[1]<4.8||art.base<1.23)errors.push('门外端景与门洞/主控冲突');
 return {errors,wardrobeLength:r[3]-r[1],wardrobeDepth:r[2]-r[0],wardrobeInteriorDepth:r[2]-r[0]-e.trackDepth-e.backThickness,wardrobeClear:e.connection.r[0]-r[2],hangingClearance:hr[0]-r[2],bayWidths:e.bays.slice(1).map((z,i)=>z-e.bays[i]-.027)};
}

export function entryElevation(s){
 const e=s.design.entryStorage,Y=h=>520-h*180,X=z=>40+(4.62-z)*180;
 const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="#aaa397"/>`;
 const tx=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="Microsoft YaHei" font-size="12" fill="#45483f">${t}</text>`;
 let out=tx(265,27,'衣帽区：250cm整排通顶衣柜');
 for(let i=0;i<e.sections.length;i++){const x=X(e.bays[i+1]),w=(e.bays[i+1]-e.bays[i])*180,q=e.sections[i];
 out+=rect(x,Y(2.52),w,2.44*180,'#f1eee7')+rect(x+3,Y(2.5),w-6,.38*180,'#d2cabb');
 for(const h of q.rails){out+=rect(x+12,Y(h),w-24,3,'#73786d');for(let j=0;j<4;j++)out+=rect(x+18+j*25,Y(h-.08),20,(i===1?1.55:.78)*180,'#c9c6ba');}
 for(const h of q.shelves||[])out+=rect(x+3,Y(h),w-6,3,'#aaa397')+rect(x+15,Y(h+.30),w-30,.27*180,'#d2cabb');
 out+=tx(x+w/2,546,q.label+' 约83cm');}
 out+=tx(265,582,'门口侧 ← 同一柜墙250cm → 主卫侧')+tx(265,609,'梳妆移到卧室窗端；原门墙、台盆位置保留')+tx(265,634,'门轨与内部分格需柜厂复核，图示不是施工下单图');return out;
}

export function mountEntry({s,scene,box,cylinder,roundedFace,M,white,greige,metal,luminous}){
 const e=s.design.entryStorage,r=s.furniture.wardrobe.r,h=s.furniture.wardrobe.height,g=new T.Group();g.name='entry-composition';scene.add(g);
 const inner=r[2]-e.trackDepth,backs=r[0]+e.backThickness,leaves=[],stone=M('#beb6a9'),charcoal=M('#737970');
 box('entry-back',[r[0],r[1],backs,r[3]],.08,h-.08,greige,g);
 for(const z of e.bays)box('entry-divider',[backs,Math.max(r[1],z-.009),inner,Math.min(r[3],z+.009)],.08,h-.08,white,g);
 for(const y of[.08,2.10,2.50])box('entry-common-shelf',[backs,r[1],inner,r[3]],y,.018,white,g);
 for(let i=0;i<e.sections.length;i++){
  const z0=e.bays[i]+.03,z1=e.bays[i+1]-.03;
  for(const y of e.sections[i].rails){
   box('entry-hanging-rail',[.302,z0+.025,.322,z1-.025],y,.02,metal,g);
   for(let j=0;j<6;j++){
    const z=z0+.035+j*.10,len=i===1?1.55:.78;
    box('entry-clothing',[.085,z,.535,z+.035],y-.065-len,len,j%2?stone:greige,g,.012);
    box('entry-hanger',[.095,z+.008,.525,z+.018],y-.04,.012,metal,g);
   }
  }
  for(const y of e.sections[i].shelves||[]){box('entry-folding-shelf',[backs,z0,inner,z1],y,.018,white,g);box('entry-folding-linen',[.08,z0+.04,.54,z1-.04],y+.025,.25,greige,g,.018);}
  box('entry-top-soft-bag',[.07,z0+.03,.54,z1-.03],2.14,.27,stone,g,.04);
  box('entry-sensor-strip',[inner-.02,z0,inner-.01,z0+.014],.2,1.83,luminous,g);
 }
 for(const y of[.065,2.505])box('entry-three-track',[inner,r[1],r[2],r[3]],y,.015,metal,g);
 for(const[i,leaf]of e.doors.entries()){
  const lg=new T.Group();g.add(lg);leaves.push(lg);
  box('entry-sliding-door-'+i,[leaf.x,leaf.z[0],leaf.x+.018,leaf.z[1]],.083,2.412,white,lg);
  box('entry-inset-pull',[leaf.x+.018,leaf.z[0]+.025,leaf.x+.02,leaf.z[0]+.04],1.01,.25,metal,lg);
  if(i===1){const m=e.finish.mirror;box('entry-dressing-mirror',[leaf.x+.018,m.z[0],leaf.x+.023,m.z[1]],m.base,m.height,M('#b6c3c0'),lg,.005);}
 }
 box('entry-top-scribe',[r[0],r[1],r[2],r[3]],h,s.ceiling-h,white,g);
 box('entry-plinth',[r[0]+.025,r[1]+.018,inner-.025,r[3]-.018],.015,.055,charcoal,g);
 box('entry-return-finish',e.connection.r,.02,2.50,greige,g);

 const hr=s.design.hanging.r;
 for(const y of[1.25,1.56]){box('fold-hook-wall-plate',[1.718,3.63,1.731,3.67],y,.055,metal,g);box('fold-hook-arm',[1.665,3.641,1.72,3.657],y+.03,.012,metal,g);}
 box('small-bag',[hr[0]+.015,hr[1]+.025,hr[2]-.04,hr[3]-.025],.92,.30,stone,g,.03);
 const ar=s.design.entryArt,rr=ar.r;box('entry-art-frame',rr,ar.base,ar.height,metal,g,.008);
 box('entry-art-ground',[rr[0]+.018,rr[3]-.001,rr[2]-.018,rr[3]+.003],ar.base+.018,ar.height-.036,stone,g);
 for(let i=0;i<3;i++)box('entry-art-line',[rr[0]+.09+i*.10,rr[3]+.003,rr[0]+.095+i*.10,rr[3]+.007],ar.base+.12+i*.04,ar.height-.25-i*.06,white,g);
 cylinder(.40,2.545,4.98,.035,.035,luminous,g);
 const standing=box('entry-taking-clothes',e.standing,.013,.007,new T.MeshBasicMaterial({color:'#b5986d',transparent:true,opacity:.3}),g);
 // Basin is back inside the original bathroom; no exterior wash cabinet remains.
 const b=s.design.bath.fixtures.washstand.r,bowl=[1.27,.225,1.87,.515];
 box('bath-resistant-bottom',[b[0],b[1],b[2],b[3]],.25,.018,greige);
 for(const x of[b[0],b[2]-.018])box('bath-resistant-side',[x,b[1],x+.018,b[3]],.25,.56,greige);
 box('bath-resistant-back',[b[0],b[1],b[2],b[1]+.018],.25,.56,greige);
 box('bath-resistant-front',[b[0],b[3]-.018,b[2],b[3]],.27,.52,greige);
 for(const rr of[[b[0],b[1],b[2],bowl[1]],[b[0],bowl[1],bowl[0],b[3]],[bowl[2],bowl[1],b[2],b[3]],[bowl[0],bowl[3],bowl[2],b[3]]])box('bath-counter',rr,.81,.04,white);
 box('bath-bowl-bottom',bowl,.72,.015,white);
 for(const rr of[[bowl[0],bowl[1],bowl[2],bowl[1]+.012],[bowl[0],bowl[3]-.012,bowl[2],bowl[3]],[bowl[0],bowl[1],bowl[0]+.012,bowl[3]],[bowl[2]-.012,bowl[1],bowl[2],bowl[3]]])box('bath-bowl-side',rr,.735,.10,white);
 cylinder(1.57,.85,.17,.015,.18,metal);box('bath-tap',[1.558,.16,1.582,.33],1.01,.02,metal);
 box('bath-mirror-cabinet',[1.14,.11,2.0,.23],1.28,.85,greige);
 roundedFace('bath-mirror',1.16,1.30,.231,.54,.81,.007,.03,M('#becbc6'));
 for(const y of[1.28,1.55,1.82,2.11])box('bath-open-side-shelf',[1.73,.11,2.0,.245],y,.016,white);
 for(const x of[1.79,1.89]){cylinder(x,1.566,.185,.022,.14,white);cylinder(x,1.706,.185,.004,.07,metal);}
 box('bath-mirror-task-light',[1.16,.235,1.70,.245],2.10,.015,luminous);
 const tr=s.design.hanging.bathRail;box('bath-towel-rail',tr.r,tr.base,tr.height,metal);box('bath-face-towel',[2.018,.73,2.03,.97],.82,.33,greige);
 return {update(mode,use){standing.visible=use;leaves.forEach((lg,i)=>{lg.visible=mode!=='inside';lg.position.z=(mode===String(i)||(mode==='slide'&&i===0))?e.doors[i].move:0;});}};
}
