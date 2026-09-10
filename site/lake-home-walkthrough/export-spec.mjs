import fs from 'node:fs';
import {P,rooms,walls,notes,doorLeaves} from './plan.js';
import {windowProfiles,windowAtWall} from './window-profiles.js';
const north=p=>{const [x,z]=P(p);return [x,-z];};
const spaces=rooms.filter(r=>!r.viewOnly&&!['entry','dining','bar'].includes(r.id)).map(r=>({id:r.id,label:r.name,polygons:[r.poly.map(north)]}));
spaces.find(s=>s.id==='living').polygons=[[[634,140],[1245,140],[1245,681],[1432,681],[1432,837],[303,837],[303,671],[634,671]].map(north)];
const connections={front:['living','exterior'],bed1:['living','bed1'],bath1:['living','bath1'],master:['living','master'],bath2:['master','bath2'],bed3:['living','bed3'],kitchen:['living','kitchen']};
const windowRooms={0:'bed1',1:'bed1',3:'bath1',7:'kitchen',8:'living',9:'living',10:'living',11:'bath2',13:'master',14:'master',18:'bed3'};
const openings=[];const exported=walls.map((w,i)=>{const id='wall-'+i;for(const [j,o] of (w.open||[]).entries()){const connects=o.kind==='window'?[windowRooms[i],'exterior']:connections[o.id];openings.push({id:o.id||`window-${i}-${j}`,wall_id:id,offset:o.at/100,width:o.w/100,kind:o.kind==='window'?'window':'door',connects,...(o.kind!=='window'?{swing_into:connects[1],leaf:o.kind!=='passage'}:{})});}if(w.glass)openings.push({id:'glass-'+i,wall_id:id,offset:0,width:Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1])/100,kind:'window',connects:[windowRooms[i],'exterior']});return {id,a:north(w.a),b:north(w.b),thickness:(w.t||20)/100};});
const spec={name:'湖畔全屋漫游 — 原图墙线与开口',units:'m',spaces,walls:exported,openings,door_leaf_schedule:doorLeaves,assumptions:notes,validation_scope:'几何基础、开口长度及空间引用；缺印刷面积目标与完整邻接约束，不证明尺寸或施工精度。门叶铰接/转向另由 verify-door-swings.cjs 核对；完整通行未验收。'};
for(const opening of openings.filter(o=>o.kind==='window')){const p=windowAtWall(Number(opening.wall_id.replace('wall-','')));if(!p)throw Error('Missing window evidence '+opening.id);Object.assign(opening,{sill:p.sill,height:p.height,source_sill:p.sourceSill,source_height:p.sourceHeight,source_window_id:p.id,user_override:!!p.userOverride});}
spec.window_profiles=windowProfiles;
fs.writeFileSync(new URL('plan-spec.json',import.meta.url),JSON.stringify(spec,null,2));
console.log('Exported',spaces.length,'spaces,',walls.length,'walls,',openings.length,'openings.');
