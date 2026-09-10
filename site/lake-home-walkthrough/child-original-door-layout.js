// CAD-aligned diagnostic room. No opening relocation or structural demolition.
export const layout={room:[0,0,3.50,2.70],bay:[3.50,.34,4.11,1.95],sillHeight:.55,
 door:{hinge:[-.05,2.25],width:.90,thickness:.04},bed:[1.12,.02,2.66,2.08],
 wardrobe:[.0,.02,.50,1.22],desk:[2.68,.02,3.48,.62],returnTop:[3.50,.62,4.09,1.93],
 chair:[2.80,.66,3.36,1.24],chairBaseDiameter:.65,pull:.30,
 computer:{tower:[3.56,.80,3.96,1.02],towerBase:.765,towerHeight:.45,
  knee:[2.73,.08,3.43,.60],kneeHeight:.695,
  frameLeft:[2.69,.04,2.71,.58],frameRight:[3.45,.04,3.47,.58],
  power:[2.72,.012,3.22,.028],powerHeight:.82,
  cableTray:[2.73,.025,3.43,.07],cableTrayHeight:.64,
  structuralApproved:false,windowOperationApproved:false,lightingMeasured:false},
 joinery:{headUpper:[.50,.02,2.68,.28],headUpperBottom:1.95,upperTop:2.48,
  gapDisplay:[.50,.02,1.12,.24],gapBottom:.76,
  endDisplay:[.035,1.02,.465,1.202],endBottom:1.18,endTop:1.94,
  windowShelf:[3.28,.03,3.48,.32],windowBottom:.77,windowTop:1.94,
  farWindowShelf:[3.28,2.16,3.48,2.66],farWindowBottom:1.95,
  continuousTop:[[2.68,.02],[3.48,.02],[3.48,.36],[4.09,.36],[4.09,1.93],[3.50,1.93],[3.50,.62],[2.68,.62]],
  doorBackPanel:[.002,2.32,.010,2.64],doorBackBottom:.92,doorBackTop:1.72},
 assumptions:['主体350×270cm、门洞135～225cm按本轮CAD对齐诊断，不是现场完成面尺寸',
 '原门位置与开向保留；115°开门仅为五金/门套待核的操作条件，原图只证明开向',
 '飘窗模型55cm；用户估计约60cm，均不视为实测',
 '80×60cm侧向采光学习位，非原先整面窗墙正坐长桌；衣柜缩为120×50cm',
 '原床垫150×200cm、床框154×206cm；不改为储物床']};
const overlap=(a,b)=>Math.min(a[2],b[2])-Math.max(a[0],b[0])>1e-6&&Math.min(a[3],b[3])-Math.max(a[1],b[1])>1e-6;
const rectDistance=(x,z,r)=>Math.hypot(Math.max(r[0]-x,0,x-r[2]),Math.max(r[1]-z,0,z-r[3]));
export function doorTip(degrees){const d=layout.door,a=degrees*Math.PI/180;return[d.hinge[0]+d.width*Math.sin(a),d.hinge[1]-d.width*Math.cos(a)];}
function segmentDistance(x,z,a,b){const vx=b[0]-a[0],vz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/(vx*vx+vz*vz)));return Math.hypot(x-a[0]-t*vx,z-a[1]-t*vz);}
export function audit(degrees=115,pulled=false){
 const d=layout,c=d.chair.map((v,i)=>v+(pulled&&i%2?d.pull:0));
 const obs=[d.bed,d.wardrobe,d.desk,d.returnTop,c,d.joinery.doorBackPanel,d.joinery.gapDisplay],tip=doorTip(degrees),collisions=[];
 obs.forEach((a,i)=>obs.slice(i+1).forEach((b,j)=>{if(overlap(a,b))collisions.push([i,i+j+1]);}));
 const radius=.30,valid=(x,z)=>x>=radius&&x<=3.5-radius&&z>=radius&&z<=2.7-radius&&obs.every(r=>rectDistance(x,z,r)>=radius-1e-6)&&segmentDistance(x,z,d.door.hinge,tip)>=radius+d.door.thickness/2-1e-6;
 const start=[.38,1.78],q=[[38,178]],seen=new Set(['38,178']);
 if(!valid(...start))return{invalidStart:true};
 for(let i=0;i<q.length;i++)for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const x=q[i][0]+dx,z=q[i][1]+dz,k=x+','+z;if(!seen.has(k)&&valid(x/100,z/100)){seen.add(k);q.push([x,z]);}}
 const targets={wardrobe:[.81,.85],bedFoot:[1.85,2.39],chairBack:[3.05,1.94]},reach=Object.fromEntries(Object.entries(targets).map(([k,t])=>[k,q.some(([x,z])=>Math.hypot(x/100-t[0],z/100-t[1])<.025)]));
 let doorFurnitureMin=Infinity;for(let angle=0;angle<=degrees;angle+=.5){const t=doorTip(angle);for(let s=0;s<=1;s+=.005){const x=d.door.hinge[0]+s*(t[0]-d.door.hinge[0]),z=d.door.hinge[1]+s*(t[1]-d.door.hinge[1]);for(const r of obs)doorFurnitureMin=Math.min(doorFurnitureMin,rectDistance(x,z,r)-.02);}}
 return{collisions,doorDegrees:degrees,doorFurnitureMinCM:Math.round(doorFurnitureMin*100),route600:reach,bedFootCM:62,bedWardrobeCM:62,deskWidthCM:80,deskDepthCM:60,wholeLayoutApproved:false};
}
