// Metres. These are design envelopes tied to the current model, not field measurements.
export const balconyLayout={
 id:'balcony-right-utility-3',
 shell:{left:5.82,right:12.14,glassZ:.10,glassInnerZ:.20,clearDepth:1.45,column:[8.98,0,1.875],columnSize:[.40,2.80,.45],source:'用户本轮指定1450mm试排；栏杆内侧到柱外侧。柱深仍暂定450mm'},
 beam:{bottom:2.40,top:2.80,depth:.40,centreZ:1.875,measured:false,removalAllowed:false},
 washer:{position:[11.66,0,1.11],rotation:-Math.PI/2,width:.66,depth:.72,top:2.77,body:[.60,.84,.63],modelSelected:false},
 wet:{position:[11.66,0,.505],rotation:-Math.PI/2,width:.55,depth:.72,top:.90,sinkBay:.55,bowl:[.46,.36,.21],hamperAngle:25,plumbingConfirmed:false},
 upper:{bottom:1.83,top:2.77,depth:.35,back:-.36},
 cleaningRack:{position:[11.66,0,1.53],bayWidth:.18,depth:.72,height:2.77,travel:.50,usableToolHeight:1.90,hardwareSelected:false},
 robot:{width:.42,height:.55,depth:.54,travel:.70,autoWater:true,frontServiceRequired:true,modelSelected:false},
 transition:{washEndZ:1.62,displayStartZ:1.76,displayWidth:.80,displayDepth:.39,displayTop:2.38,consoleTop:.478,consoleWidth:2.75},
 drying:{position:[9.20,0,.73],length:2.00,railSpacing:.44,bodyY:2.65,raisedY:2.48,loweredY:1.75,capacity:12,garmentWidth:.43,garmentDrop:1.10,garmentThickness:.08,selectedProduct:false},
 views:{
  laundry:{name:'洗烘 · 手洗 · 脏衣收纳',position:[9.5,1.5,.75],look:[11.72,1.4,1.04]},
  balconyDesign:{name:'阳台与电视柜整体',position:[9.35,1.55,1.10],look:[11.6,1.38,1.55]},
  drying:{name:'双杆晾衣 · 升降与遮景',position:[7.15,1.6,.72],look:[9.65,1.88,.73]},
  care:{name:'右侧生活区 · 长物与扫地机',position:[9.65,1.45,.85],look:[11.65,1.05,1.0]}
 },
 limitations:['柱边净深、梁底与梁宽待复尺','设备型号、散热、叠放件与管线待确认','原内侧落地玻璃拆除按用户意图表达；外围玻璃和护栏线保留','原图客厅宽6090mm与模型6110mm仍有差异，本次未改房屋边界']
};
