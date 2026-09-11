// Creative specification, not a product, lux calculation or construction schedule.
export const barSeating={left:[.395],right:[-.005,.595],storedZ:.32,pullOut:.45};
// Current revision applied to the retained baseline mesh. Sizes are design candidates.
export const livingRevision={
 id:'kitchen-fridge-island-20260910',columnWidth:.40,columnDepth:.45,columnWidthStatus:'用户给出结构柱宽不超过400mm；进深450mm仍待复尺，饰面另计',
 wingLengths:{left:1.30,right:1.30},barSeatLocalX:{left:[-.325,.325],right:[-.325,.325]},
 columnFinish:{side:.020,back:.015,front:.035},
 barDepth:.56,barOffsetZ:.01,barSeatStoredZ:.375,
 laundryOffsetZ:-.55,
 sofa:{length:2.60,position:[9.425,0,4.30]},
 island:{width:.90,length:1.80,height:.90,position:[7.47,0,4.35],drawerTravel:.40,carcassDepth:.49,kneeRecess:.38,seatPitch:.86},
 diningSeats:[[8.02,0,3.92],[8.02,0,4.78]],diningSeatRotation:Math.PI/2,seatPull:.45,seatWorkingPull:.05,
 coffee:{position:[10.55,0,4.30]},
 rug:{width:2.20,length:3.20,position:[10.25,0,4.30]},
 viewing:{eye:[9.275,1.08,4.30],note:'坐姿眼位为估算；85寸4K按约39°水平视角试排，个人舒适度与坐垫深度待体验'},
 masterAC:{position:[14.41,0,2.23],rotation:Math.PI/2,status:'改在主卧/主卫隔墙卧室侧，侧向送风；穿墙孔、冷凝水、型号和检修未确认'}
};
// User's appliance envelope; height, cabinet details and rear allowance remain design assumptions.
export const fridgeLayout={id:'fridge-900-600-kitchen',width:.90,depth:.60,height:2.0,
 position:[6.24,0,2.33],rotation:Math.PI/2,cabinetWidth:.96,panel:.018,top:2.58,
 wallFaceX:5.92,rearReserve:.02,sideGap:.012,islandShiftZ:.30};
// Current balcony utility and drying dimensions live in balcony-layout-spec.js.
// Design infill only: retain the source window schedule and the apartment outline.
export const balconySideInfill=[
 {id:'balcony-solid-left',window:'window-living-8',wallIndex:8,a:[624,130],b:[624,300],thickness:.12},
 {id:'balcony-solid-right',window:'window-living-10',wallIndex:10,a:[1256,130],b:[1256,194],thickness:.12}
];
export const palette={wall:'#eeeae2',ceiling:'#f4f1eb',floor:'#d0cdc5',grout:'#c2bfb7',cabinet:'#d6d1c7',wood:'#b5a088',sofa:'#c7c0b4',linen:'#e8e3d8',accent:'#7a8172',metal:'#414540',stone:'#e2ded4'};
export const finishScheme={name:'湖畔 · 暖调现代简约',floor:'800 × 800 浅暖灰哑光砖，同色细缝',walls:'暖白乳胶漆（干区）；淋浴湿区防水饰面另核',joinery:'暖灰柜门＋自然木色，避免全屋深色大柜',textiles:'燕麦、米灰、少量灰绿；深灰仅用于五金与电视黑边',lighting:'公共区 3000–3500 K，厨卫任务照明 4000 K；显色指数 Ra≥90 为选型目标，未实测'};
export const ceilingFixtures=[
 {id:'bed1-main-light',room:'bed1',point:[245,534],type:'disc',diameter:.55,bottom:2.715,kelvin:3000,watts:'24–36 W 待照度计算',lumens:2300},
 {id:'master-main-light',room:'master',point:[1648,415],type:'disc',diameter:.65,bottom:2.715,kelvin:3000,watts:'30–45 W 待照度计算',lumens:3000},
 {id:'bed3-main-light',room:'bed3',point:[1638,709],type:'disc',diameter:.55,bottom:2.715,kelvin:3000,watts:'24–36 W 待照度计算',lumens:2300},
 {id:'kitchen-main-light',room:'kitchen',point:[531,426],type:'linear',length:1.18,width:.17,bottom:2.725,kelvin:4000,watts:'20–30 W 待照度计算',lumens:2100}
];
