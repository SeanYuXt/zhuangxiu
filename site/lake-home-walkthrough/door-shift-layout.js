import {room} from './child-bay-options-data.js';
// Conditional design only. Coordinates are translated from the authoritative room, not a replacement shell.
const origin=[room.main[0],room.main[1]],local=r=>r.map((v,i)=>v-origin[i%2]);
export const layout={room:[0,0,room.main[2]-origin[0],room.main[3]-origin[1]],bay:local(room.bay),sillHeight:room.bayHeight,
 originalDoor:{x:room.door.hinge[0]-origin[0],z:room.door.hinge[1]-origin[1],width:room.door.width},
 door:{x:room.door.hinge[0]-origin[0],z:room.door.hinge[1]-origin[1]+.45,width:room.door.width},
 bed:[.02,.02,2.08,1.56],mattress:[.05,.04,2.05,1.54],wardrobe:[1.08,2.19,2.88,2.69],desk:[3.03,.02,3.48,2.69],
 chair:[2.43,.855,3.03,1.435],pull:.30,deskHeight:.75,wardrobeHeight:2.50,
 entryEnd:{bounds:[1.08,2.19,1.30,2.69],radius:.08,shelves:[.75,1.34,1.96,2.482]},
 joinery:{counter:[2.88,2.19,3.03,2.69],cornerRadius:.06,cornerReserve:[2.97,2.13,3.03,2.19],southUpper:[2.88,2.44,3.48,2.69],eastBooks:[3.23,2.00,3.48,2.44],northBooks:[3.23,.02,3.48,.32],windowHeader:[3.23,.32,3.48,2.00],headerBottom:2.30,shelfBottom:1.18,upperBottom:1.96,top:2.50},
 equipment:{ceilingHeight:2.60,trimDrop:.10,trimWidth:.10,ac:[2.13,.015,2.98,.225],acBottom:2.02,acHeight:.30,mainLight:[1.50,1.10,2.00,1.60],mainLightBottom:2.55},
 assumptions:['门洞向南移45cm，仅为条件方案；墙体可改性未确认','原飘窗保留；用户估计约60cm，模型暂保留图纸55cm，不是实测确认；需复尺','主体3.50×2.71m；床框154×206cm、床垫150×200cm','柜组180×50cm含22cm圆角端景段、158cm移门储衣柜，前后抽拉挂衣杆；左下取消一层短衣挂杆，留行李箱空位；柜内净深及五金需厂家核对','桌高75cm；窗台上延续台面只作展示，不计腿部空间','层高260cm、单眼皮下吊10cm为模型假设；1.5匹挂机位置暂定，排水、穿孔及维修净距待核实']};
export const overlap=(a,b)=>Math.min(a[2],b[2])-Math.max(a[0],b[0])>1e-6&&Math.min(a[3],b[3])-Math.max(a[1],b[1])>1e-6;
const distance=(x,z,r)=>Math.hypot(Math.max(r[0]-x,0,x-r[2]),Math.max(r[1]-z,0,z-r[3]));
export function chairAt(pulled=false){return layout.chair.map((v,i)=>v-(i%2===0&&pulled?layout.pull:0));}
function route(radius,pulled=false){
 const d=layout,obs=[d.bed,d.wardrobe,d.desk,d.joinery.counter,d.joinery.cornerReserve,chairAt(pulled),[d.door.x-.018,d.door.z-.018,d.door.x+d.door.width+.018,d.door.z+.018]];
 const valid=(x,z)=>x>=radius&&z>=radius&&x<=d.room[2]-radius&&z<=d.room[3]-radius&&obs.every(r=>distance(x,z,r)>=radius-1e-6);
 const aisleZ=(d.bed[3]+d.wardrobe[1])/2;
 const start=[.35,1.92],targets={chairSide:[2.50,aisleZ],wardrobe:[1.70,aisleZ],wardrobeRight:[2.65,aisleZ],bedSide:[.65,1.92]},q=[[35,192]],seen=new Set(['35,192']);
 if(!valid(...start))return{invalidStart:true};
 for(let i=0;i<q.length;i++)for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=q[i][0]+dx,z=q[i][1]+dz,k=x+','+z;if(seen.has(k)||!valid(x/100,z/100))continue;seen.add(k);q.push([x,z]);}
 return Object.fromEntries(Object.entries(targets).map(([name,t])=>[name,q.some(([x,z])=>Math.hypot(x/100-t[0],z/100-t[1])<.016)]));
}
export function auditLayout(){
 const d=layout,objects=[d.bed,d.wardrobe,d.desk,d.joinery.counter,d.joinery.cornerReserve],collisions=[];
 objects.forEach((r,i)=>{if(r[0]<0||r[1]<0||r[2]>d.room[2]+1e-6||r[3]>d.room[3]+1e-6)collisions.push('outside '+i);objects.slice(i+1).forEach((s,j)=>{if(overlap(r,s))collisions.push('furniture '+i+','+(j+i+1));});});
 for(const pulled of [false,true])objects.forEach((r,i)=>{if(overlap(chairAt(pulled),r))collisions.push('chair '+pulled+'/'+i);});
 let doorMin=Infinity;
 for(let deg=0;deg<=90;deg+=.25)for(let r=0;r<=d.door.width+.00001;r+=.005){const a=deg*Math.PI/180,x=d.door.x+r*Math.sin(a),z=d.door.z-r*Math.cos(a);for(const o of objects)doorMin=Math.min(doorMin,distance(x,z,o));}
 return{fixedFurnitureCollisions:collisions,doorMinimumFurnitureGapCM:Math.round(doorMin*100),doorShiftCM:45,
  headWallCM:Math.round((d.door.z-d.door.width)*100),bedDeskCM:Math.round((d.desk[0]-d.bed[2])*100),bedWardrobeCM:Math.round((d.wardrobe[1]-d.bed[3])*100),
  controlledPullCM:Math.round(d.pull*100),controlledPullCollision:objects.some(r=>overlap(chairAt(true),r)),chairPull30cmBedCollision:overlap(d.chair.map((v,i)=>v-(i%2===0?.30:0)),d.bed),
  deskRoomDepthCM:Math.round((d.desk[2]-d.desk[0])*100),floorDepthToSolidSillCM:Math.round((d.bay[0]-d.desk[0])*100),
  route600:route(.30),route600Pulled:route(.30,true),sensitivityOnly500:route(.25),
  planDoorConnection:'new door span remains opposite existing living/corridor polygon; construction permission unconfirmed',
  wholeLayoutApproved:false,unverified:['墙体结构与新门洞施工','63cm柜前通道的实际体感、取衣与搬物；抽拉衣杆展开占通道','入座、转身及起身动作','门框收口、空调排水穿孔与检修、插座和窗扇操作','悬空桌支撑与承重；灯具与吊顶固定']};
}
