// A single furniture specification drives the refined candidate; original shell is read-only.
export function buildRefined({T,d,box,furniture,guide,doorOpen,onChair}){
 const tex=new T.TextureLoader();
 const surface=(color,prefix,repeat=1)=>{
  const m=new T.MeshStandardMaterial({color,roughness:.78});
  if(prefix){m.map=tex.load(`./assets/${prefix}-color.jpg`);m.map.colorSpace=T.SRGBColorSpace;
   m.normalMap=tex.load(`./assets/${prefix}-normal.jpg`);m.normalScale=new T.Vector2(.12,.12);
   for(const t of [m.map,m.normalMap]){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);}}
  return m;
 };
 const wood=surface('#d5c5ae','white_oak_veneer',1.5),ivory=surface('#e5dfd2'),linen=surface('#e0d8c8','cotton_jersey',3),olive=surface('#9d9e89','terlenka',2),dark=surface('#615e52'),paper=surface('#f1e9dc');
 const w=d.wardrobe,cab=new T.Group();cab.name='refined-wardrobe-180';furniture.add(cab);
 box(cab,'cabinet-plinth',[w[0]+.045,w[1]+.04,w[2]-.045,w[3]-.07],0,.08,dark);
 box(cab,'cabinet-back',[w[0],w[1],w[2],w[1]+.018],.08,2.32,wood);
 for(const x of [w[0],14.931,w[2]-.018])box(cab,'carcass-side',[x,w[1],x+.018,w[3]-.045],.08,2.32,ivory);
 for(const y of [.08,.43,1.96,2.382])box(cab,'carcass-shelf',[w[0]+.018,w[1]+.018,w[2]-.018,w[3]-.075],y,.018,wood);
 box(cab,'hanging-rail',[14.10,4.72,14.88,4.745],1.80,.025,dark);
 for(let i=0;i<5;i++)box(cab,'hanging-clothes',[14.17+i*.13,4.57,14.205+i*.13,4.98],1.12,.54,i%2?linen:olive,.008);
 for(const y of [.48,.72,.96,1.20,1.44,1.68])box(cab,'folded-clothing',[15.08,4.56,15.65,4.96],y,.12,y>.9?linen:olive,.01);
 for(const x of [14.15,15.06])box(cab,'seasonal-box',[x,4.54,x+.63,4.96],2.0,.27,linen,.012);
 const front=box(cab,'sliding-front-a',[14.055,5.057,14.985,5.08],.10,2.285,ivory,.003);
 box(cab,'sliding-front-b',[14.955,5.022,15.825,5.045],.10,2.285,ivory,.003);
 const frontPull=box(cab,'sliding-edge-a',[14.961,5.074,14.970,5.082],.85,.72,dark,.001);
 box(cab,'sliding-edge-b',[15.802,5.042,15.811,5.05],.85,.72,dark,.001);
 const b=d.bed,bed=new T.Group();bed.name='refined-bed-150';furniture.add(bed);
 box(bed,'bed-recessed-plinth',[b[0]+.09,b[1]+.09,b[2]-.09,b[3]-.04],.03,.16,dark,.015);
 box(bed,'bed-frame',b,.19,.15,wood,.016);
 box(bed,'mattress',d.mattress,.34,.22,linen,.045);
 box(bed,'bed-cover',[b[0]+.03,b[1]+.03,b[2]-.03,b[3]-.60],.56,.065,linen,.035);
 box(bed,'folded-throw',[b[0]+.05,b[1]+.12,b[2]-.05,b[1]+.52],.625,.025,olive,.012);
 for(const x of [b[0]+.085,b[0]+.81])box(bed,'pillow',[x,b[3]-.535,x+.60,b[3]-.14],.56,.12,linen,.048);
 // Continuous lower timber datum, with a soft headboard above; neither projects over the mattress.
 box(furniture,'continuous-timber-datum',[d.desk[0],7.126,b[2],7.152],.10,.65,wood,.006);
 box(bed,'soft-headboard',[b[0],7.105,b[2],7.155],.75,.37,linen,.022);
 const desk=new T.Group();desk.name='refined-desk-115';furniture.add(desk);const r=d.desk;
 box(desk,'desktop-115x50',r,.725,.025,wood,.012);
 box(desk,'desk-support',[r[2]-.024,r[1]+.02,r[2],r[3]-.02],.05,.675,wood,.005);
 box(desk,'desk-back-support',[r[0]+.03,r[3]-.035,r[2]-.03,r[3]-.015],.54,.18,wood);
 box(desk,'writing-book',[14.96,6.82,15.30,7.03],.752,.012,paper,.003);
 box(desk,'pencil-cup',[15.47,6.99,15.55,7.07],.75,.105,olive,.012);
 box(desk,'task-lamp-base',[15.66,6.94,15.82,7.10],.75,.014,dark,.02);
 box(desk,'task-lamp-stem',[15.72,7.0,15.735,7.015],.764,.36,dark,.003);
 box(desk,'task-lamp-shade',[15.47,6.98,15.75,7.04],1.124,.025,dark,.008);
 const u=d.upperBooks,s=u.rect,upper=new T.Group();upper.name='refined-upper-books';furniture.add(upper);
 box(upper,'bookcase-back',[s[0],s[3]-.018,s[2],s[3]],u.bottom,u.top-u.bottom,wood);
 for(const x of [s[0],s[2]-.018])box(upper,'bookcase-side',[x,s[1],x+.018,s[3]],u.bottom,u.top-u.bottom,ivory);
 for(const y of [1.5,1.93,2.382])box(upper,'bookcase-shelf',s,y,.018,wood);
 for(const x of [14.784,15.357])box(upper,'upper-closed-door',[x,s[1],x+.567,s[1]+.02],1.954,.422,ivory,.003);
 for(let i=0;i<6;i++)box(upper,'book',[14.84+i*.047,6.895,14.876+i*.047,7.12],1.518,.24+(i%3)*.018,i%2?paper:olive,.002);
 box(upper,'storage-box',[15.42,6.90,15.82,7.12],1.518,.245,linen,.012);
 const c=d.chair,chair=new T.Group();chair.name='refined-chair-450';furniture.add(chair);
 box(chair,'chair-seat',c,.43,.055,olive,.025);
 box(chair,'chair-back',[c[0],c[1],c[2],c[1]+.035],.485,.35,olive,.016);
 for(const x of [c[0]+.035,c[2]-.06])for(const z of [c[1]+.04,c[3]-.07])box(chair,'chair-leg',[x,z,x+.025,z+.025],0,.43,wood,.004);
 document.querySelector('#chair').onchange=e=>{const shift=-(+e.target.value);chair.position.z=shift;onChair(shift);};
 box(furniture,'retained-raised-bay',d.bay,0,d.bayHeight,ivory);
 const baySurface=box(furniture,'bay-cleanable-finish',d.bayTop,d.bayHeight,.015,wood,.006);
 box(furniture,'removable-bay-tray',d.bayTray,d.bayHeight+.015,.018,wood,.005);
 box(furniture,'bay-book',[17.59,4.90,17.84,5.12],d.bayHeight+.033,.025,paper);
 const gm=new T.MeshBasicMaterial({color:'#769486',transparent:true,opacity:.18,depthWrite:false});
 box(guide,'chair-back-zone',[14.80,5.13,15.45,5.79],.016,.006,gm);
 box(guide,'side-route',[15.35,5.10,15.96,6.57],.016,.006,gm);
 const doorPivot=new T.Group();doorPivot.position.set(13.96,0,6.57);furniture.add(doorPivot);
 box(doorPivot,'original-door-leaf',[-.018,-.9,.018,0],.02,2.1,ivory);doorPivot.rotation.y=doorOpen?-Math.PI/2:0;
 return{front,frontPull,baySurface,doorPivot};
}
