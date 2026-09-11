import {P,walls} from './plan.js?v=balcony-right-utility-3';

const childWall=walls.find(w=>w.open?.some(o=>o.id==='bed3'));
const entranceWall=walls.find(w=>w.open?.some(o=>o.id==='front'));
const cornerX=P(childWall.a)[0]-(childWall.t||20)/200;
const cornerZ=P(entranceWall.a)[1]-(entranceWall.t||20)/200;
const tvWall=walls.find(w=>w.a[0]===1256&&w.b[0]===1256&&!w.glass);
export const entryTvFaceX=P(tvWall.a)[0]-tvWall.t/200;
const beamNearX=entryTvFaceX+.600+.100; // CAD DD far edge + user's 100mm gap.
const beamWidth=.28; // Visual assumption only; no measured beam width in the source.
const displayStartX=beamNearX+beamWidth;

// Furniture and service drawings share these design assumptions. They are NOT a survey.
export const familyDisplaySpec={
 id:'sideboard-depth-40-10',corner:[cornerX,cornerZ],tvFaceX:entryTvFaceX,longWing:cornerX-entryTvFaceX,returnWing:.48,depth:.05,
 displayStartX,top:2.40,displayWidth:cornerX-displayStartX,storage:false,
 palette:{warmWhite:'#e7e0d4',sand:'#d9cfbf',bronze:'#9d805d',ceramic:'#dbd3c3',oak:'#c9ad86',shadow:'#625c50'},
 composition:{name:'浅柜检修 · 石材背板 · 陶罐疏枝',purpose:'梁前250mm深检修柜，中段开放格放陶器与书；石材呼应餐边柜背板。梁后两幅影像与落地浅色陶罐疏枝，无柜体。',wallFinishThickness:.002,lightTemperature:3000,lightingCircuitConfirmed:false},
 floorDecor:{centre:[cornerX-.25,cornerZ-.25],vaseHeight:.50,maximumFootprint:.40,totalHeight:1.18,selectedProduct:false},
 service:{startX:entryTvFaceX+.020,width:.66,depth:.238,relief:.012,overallDepth:.250,carcass:true,boxCentreX:entryTvFaceX+.375,measured:false,identitiesConfirmed:false,
  panels:[{id:'lower',bottom:.10,top:.90,ventilated:true},{id:'upper',bottom:1.47,top:2.40,ventilated:false}],
  niche:{bottom:.912,top:1.458,removableBack:true,clearWidth:.572,shelfDepth:.204},
  boxes:[{id:'lower',label:'下箱 · 高度示意',width:.45,height:.36,bottom:.23},{id:'upper',label:'上箱 · 高度示意',width:.45,height:.32,bottom:1.62}],
  note:'CAD DD平面符号在电视原墙面后150–600mm；仅此一处符号可靠匹配，两箱暂按同轴示意。照片显示上下两箱；对应、离地、尺寸及铰接端未复尺。'},
 beam:{nearX:beamNearX,width:beamWidth,bottom:2.44,top:2.80,startZ:5.61,endZ:cornerZ,measured:false,positionBasis:'CAD box far edge + user 100mm',
  note:'梁近边按CAD箱远边再往儿童房100mm定位。宽280mm、梁底2440mm及跨距为模型占位；非现场测量。'},
 view:{name:'石材餐边柜 · 电箱浅柜与端景',position:[11.75,1.55,5.63],look:[13.12,1.34,7.035],projection:'direct-look',lensMm:19,sensorLongEdgeMm:36},
 approachView:{name:'入户看余墙与梁位示意',position:[10.30,1.60,6.10],look:[13.53,1.48,6.95],projection:'direct-look',lensMm:24,sensorLongEdgeMm:36},
 source:'PDF整墙6440=4580+1860mm；CAD末段1850mm，当前模型1865mm，保留来源差异。新照片reference/entry-beam-user-angle.jpg与用户说明用于梁近边定位。',
 installation:'梁后净墙=1160mm减实测梁宽（PDF链）。现模型885mm基于假设梁宽280mm；箱高与梁宽改变需回排。原箱门、散热、固定与电气条件未施工验证。'
};
