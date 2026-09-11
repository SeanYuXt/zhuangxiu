// Furniture proposals in the live model's x/z coordinates; room walls stay in plan.js.
export const entryCompositionSpec={
 name:'玄关收纳墙 · 竖向花器格',revision:'entry-wall-only-3',maxDepth:.60,wallFaceZ:7.17,
 tall:{x:3.80,width:1.56,depth:.42,bottom:.18,top:2.58,lowerTop:2.08,columns:2,
  bays:[{x:3.80,width:.68},{x:4.68,width:.68}],
  shelfLevels:[[.198,.438,.678,.918,1.158,1.398,1.638,1.878],[.198,.678,.918,1.158,1.398,1.638,1.878]]},
 display:{x:4.48,width:.20,depth:.42,bottom:.18,top:2.58,shelves:[.18,.72,1.10,1.65,2.086,2.562]},
 niche:{x:5.39,width:.74,depth:.42,seatTop:.46,top:1.80},
 mirror:{column:1,bottom:.245,top:2.035,width:.474},
 console:{x:7.48,width:.48,depth:.28,top:.90,drawerTravel:.20},
 upper:{keepModules:[0,1,2,3,4,5],removedModules:[],width:3.90},
 standingCamera:{position:[7.25,1.50,5.65],look:[4.95,1.25,7.00]},
 limits:['1560mm总宽内为680mm封闭柜＋200mm净宽展示格＋680mm封闭柜；右侧底部高鞋格，鞋型与门板五金需核实','镜面柜门防坠、坐凳承重及固定五金仍需选型；原墙、设备位置和入户外开方向保留']
};
