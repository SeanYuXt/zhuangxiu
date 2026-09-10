import * as T from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/render-libs.js';

export const familyDisplaySpec={x0:11.97,x1:13.77,front:6.93,back:7.17,top:.89,source:'保留原墙；模型定位，饰面与悬浮台固定待复尺'};
export function addFamilyDisplay(model){
 const s=familyDisplaySpec,g=new T.Group();g.name='family-display-wall';model.add(g);
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.86});
 const wood=mat('#af9376'),back=mat('#ccc5ba'),paper=mat('#eee8dc'),frame=mat('#837664');
 const box=(name,x,y,z,w,h,d,m)=>{const a=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.003,w/5,h/5,d/5)),m);a.name=name;a.position.set(x,y+h/2,z);a.castShadow=true;a.receiveShadow=true;g.add(a);return a;};
 const cx=(s.x0+s.x1)/2;
 // Continuous wall finish, no cabinet doors, plinth, or enclosing timber border.
 box('family-display-backdrop',cx,.02,7.163,1.80,2.57,.012,back);
 box('family-floating-display-ledge',cx,.858,7.05,1.36,.032,.24,wood);
 box('family-ledge-shadow-gap',cx,.854,7.153,1.22,.012,.014,frame);
 const ax=12.77,ay=1.14,aw=.86,ah=1.08;
 box('family-main-art-frame',ax,ay,7.133,aw,ah,.032,frame);
 box('family-main-art-mount',ax,ay+.012,7.113,aw-.024,ah-.024,.008,paper);
 // Muted landscape composition stands in for a future family photograph.
 box('family-art-placeholder-sky',ax,ay+.14,7.107,.62,.80,.004,mat('#d0d1c5'));
 const disc=(name,x,y,r,c)=>{const o=new T.Mesh(new T.CircleGeometry(r,48),mat(c));o.name=name;o.position.set(x,y,7.101);o.rotation.y=Math.PI;g.add(o);};
 disc('family-art-placeholder-sun',ax-.13,ay+.75,.072,'#c3a978');
 const hill=(name,points,color,z)=>{const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const mesh=new T.Mesh(new T.ShapeGeometry(shape),new T.MeshStandardMaterial({color,roughness:1,side:T.DoubleSide}));mesh.name=name;mesh.position.z=z;g.add(mesh);};
 hill('family-art-placeholder-hill',[[ax-.31,ay+.14],[ax+.31,ay+.14],[ax+.31,ay+.40],[ax+.16,ay+.52],[ax-.03,ay+.39],[ax-.19,ay+.57],[ax-.31,ay+.48]],'#8e9b91',7.100);
 hill('family-art-placeholder-foreground',[[ax-.31,ay+.14],[ax+.31,ay+.14],[ax+.31,ay+.30],[ax+.07,ay+.38],[ax-.13,ay+.27],[ax-.31,ay+.33]],'#b3ad96',7.097);
 box('child-changeable-art-sheet',13.42,1.31,7.133,.22,.30,.006,paper);
 box('child-art-clip',13.42,1.60,7.125,.038,.014,.014,frame);
 for(const [x,y,c] of [[13.36,1.37,'#b39575'],[13.44,1.42,'#92a296']])box('child-art-colour',x,y,7.126,.054,.062,.003,mat(c));
 for(let i=0;i<2;i++)box('family-album',12.38+i*.045,.89,7.057,.035,.21+i*.03,.15,mat(['#a59c89','#858f85'][i]));
 const craft=new T.Mesh(new T.SphereGeometry(.037,24,16),wood);craft.name='small-craft-placeholder';craft.position.set(13.31,.927,7.02);g.add(craft);
 box('display-concealed-light-baffle',cx,2.52,7.11,1.40,.03,.10,back);
 const glow=new T.MeshStandardMaterial({color:'#fff0da',emissive:'#ffe1b0',emissiveIntensity:.45});
 box('display-concealed-light',cx,2.519,7.115,1.28,.003,.014,glow);
 g.userData={...s,seat:false,storage:false,artwork:'风景与小画为占位示意，非家庭照片；可替换真实作品',lighting:'隐藏灯带示意；无外露点光源',installation:'悬浮台承重和基层待核；不作为座位'};
 model.updateMatrixWorld(true);return g;
}
