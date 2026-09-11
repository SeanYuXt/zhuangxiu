// Source drawing coordinates in pixels; 100 px = 1 metre in the supplied PDF render.
// The positive z axis points toward the entry, not geographic north.
// Latest user correction supersedes the earlier near-glass column placeholder.
// Kept separate until furniture clearances around the revised column have been resolved.
export const columnCorrection={point:[940,307.5],railingY:130,approxDistance:1.775,clearDepth:1.45,railingInnerY:140,reference:'用户本轮按1450mm试排：栏杆内侧至柱外侧；柱深450mm暂定，推导柱中心，不是现场复尺',source:'用户2026-09-10：按照1450mm算阳台宽度',pendingFurniture:false};
export const P=([x,y])=>[(x-42)/100,(y-120)/100];
// Hinge ends refer to walls[].open's a -> b direction, not geographic bearings.
// Source: source-opening-schedule.json. Keep widths on the existing wall schedule.
export const doorLeaves={
 front:[{key:'main',hinge:'a',turn:-1,share:24.72/35.88,sourceRect:50,swing_into:'exterior'},{key:'secondary',hinge:'b',turn:1,share:11.16/35.88,sourceRect:49,swing_into:'exterior'}],
 bed1:[{key:'single',hinge:'b',turn:-1,share:1,sourceRect:33}],
 bath1:[{key:'single',hinge:'a',turn:-1,share:1,sourceRect:31}],
 master:[{key:'single',hinge:'b',turn:-1,share:1,sourceRect:63}],
 bath2:[{key:'single',hinge:'b',turn:-1,share:1,sourceRect:56}],
 bed3:[{key:'single',hinge:'b',turn:-1,share:1,sourceRect:53}]
};
export const outline=[[52,297],[337,297],[337,357],[413,357],[413,300],[624,300],[624,130],[1256,130],[1256,194],[1745,194],[1745,134],[1865,134],[1865,449],[1805,449],[1805,591],[1865,591],[1865,771],[1805,771],[1805,847],[112,847],[112,448],[52,448]];
export const rooms=[
 {id:'entry',name:'玄关 · 入户门与鞋柜',point:[735,713],look:[668,838],description:'独立入户门 · 到顶鞋柜 · 换鞋凳与钥匙台',poly:[[303,676],[633,676],[633,310],[624,310],[624,140],[1245,140],[1245,681],[1432,681],[1432,837],[303,837]]},
 {id:'living',name:'客厅 · 湖景',point:[1094,626],look:[1214,478],description:'暖白乳胶漆电视墙 · 85 寸屏幕齐平 · 少量悬浮柜',poly:[[634,140],[1245,140],[1245,680],[634,680]]},
 {id:'dining',name:'餐厅 · 岛台',point:[862,692],look:[790,464],description:'950 mm 圆角岛台 · 暖灰齐顶柜门 · 管线机面板齐柜面',poly:[[634,681],[1245,681],[1245,837],[634,837]]},
 {id:'cabinet',viewOnly:true,name:'餐边柜 · 一体收纳',point:[865,583],look:[985,810],description:'管线机嵌进侧高柜 · 面板齐柜面 · 下方内凹接水位',poly:[[634,681],[1245,681],[1245,837],[634,837]]},
 {id:'fridge',viewOnly:true,name:'冰箱 · 厨房旁嵌入',point:[861,396],look:[661,354],lookPitch:-.10,description:'四门金属电器面板 · 嵌入柜体 · 顶部独立收纳',poly:[[634,140],[1245,140],[1245,680],[634,680]]},
 {id:'services',viewOnly:true,name:'吊顶 · 送回风与智能',point:[861,625],look:[940,710],lookPitch:.6,description:'室内送风 / 下回风 / 检修口分开 · 外机与管线待确认',poly:[[634,681],[1245,681],[1245,837],[634,837]]},
 {id:'bar',name:'湖景吧台 · 承重柱',point:[861,396],look:[940,159],description:'柱子左右各延伸长桌 · 平行阳台玻璃 · 四席面湖',poly:[[634,140],[1245,140],[1245,375],[634,375]]},
 {id:'laundry',viewOnly:true,name:'阳台 · 洗烘与清洁柜',point:[915,312],look:[1208,244],description:'上下叠放洗衣机与烘干机 · 上部储物柜 · 侧边清洁柜；上下水与电源待核实',poly:[[634,140],[1245,140],[1245,375],[634,375]]},
 {id:'kitchen',name:'厨房',point:[526,491],look:[517,329],description:'L 型操作台 · 洗切炒连续动线',poly:[[422,310],[614,310],[614,650],[412,650],[412,370],[422,370]]},
 {id:'bed1',name:'老人房',point:[348,598],look:[193,477],description:'150×180床垫 · 床箱 · 180×40推拉门薄柜 · 湖景飘窗',poly:[[62,307],[327,307],[327,367],[403,367],[403,659],[122,659],[122,438],[62,438]]},
 {id:'bath1',name:'公卫（次卫） · 蹲便',point:[246,709],look:[177,804],description:'老人房旁的公共卫生间 · 外置干区洗手台 · 铝扣板集成浴霸',poly:[[122,671],[293,671],[293,837],[122,837]]},
 {id:'master',name:'主卧套间',point:[1503,458],look:[1650,284],description:'双人床 · 双侧收纳 · 挂机 · 原图550mm窗下高度，不是落地玻璃',poly:[[1268,411],[1473,411],[1473,204],[1754,204],[1754,144],[1855,144],[1855,438],[1794,438],[1794,544],[1432,544],[1432,669],[1268,669]]},
 {id:'bath2',name:'主卫',point:[1424,367],look:[1327,244],description:'套内卫浴 · 玻璃淋浴间',poly:[[1268,204],[1463,204],[1463,400],[1268,400]]},
 {id:'bed3',name:'儿童房',point:[1503,718],look:[1716,637],description:'床 + 学习书桌 + 整墙衣柜 · 独立挂机',poly:[[1444,566],[1794,566],[1794,600],[1855,600],[1855,761],[1794,761],[1794,837],[1444,837]]}
];
// A continuous wall is split only by its opening schedule. Offsets and widths below are drawing pixels.
export const walls=[
 {a:[52,297],b:[337,297],glass:true},{a:[52,297],b:[52,448],glass:true},
 {a:[52,448],b:[112,448]},{a:[112,448],b:[112,847],open:[{at:268,w:60,kind:'window',sill:.95,height:1.2}]},
 {a:[337,297],b:[337,357]},{a:[337,357],b:[413,357]},{a:[413,357],b:[413,300]},
 {a:[413,300],b:[624,300],open:[{at:40,w:120,kind:'window',sill:.95,height:1.35}]},
 {a:[624,130],b:[624,300],glass:true},{a:[624,130],b:[1256,130],glass:true},
 {a:[1256,130],b:[1256,194],glass:true},
 {a:[1256,194],b:[1745,194],open:[{at:37,w:60,kind:'window',sill:1.1,height:1.2}]},
 {a:[1745,134],b:[1745,194]},{a:[1745,134],b:[1865,134],glass:true},
 {a:[1865,134],b:[1865,449],glass:true},{a:[1805,449],b:[1865,449]},
 {a:[1805,449],b:[1805,591]},{a:[1805,591],b:[1865,591]},
 {a:[1865,591],b:[1865,771],glass:true},{a:[1805,771],b:[1865,771]},
 {a:[1805,771],b:[1805,847]},{a:[112,847],b:[1805,847],open:[{at:563,w:110,kind:'door',id:'front'}]},
 {a:[337,367],b:[408,367],t:10},{a:[408,367],b:[408,665],t:10},
 {a:[112,665],b:[408,665],t:12,open:[{at:196,w:90,kind:'door',id:'bed1'}]},
 {a:[408,660],b:[624,660]},{a:[624,300],b:[624,660],open:[{at:106,w:164,kind:'passage',id:'kitchen'}]},
 {a:[298,671],b:[298,837],t:10,open:[{at:10,w:76,kind:'door',id:'bath1'}]},
 {a:[1256,194],b:[1256,675],t:20},
 {a:[1468,204],b:[1468,405],t:10},
 {a:[1256,405],b:[1468,405],t:10,open:[{at:117,w:80,kind:'door',id:'bath2'}]},
 {a:[1256,675],b:[1438,675],t:12,open:[{at:81,w:91,kind:'door',id:'master'}]},
 {a:[1438,555],b:[1805,555],t:20},
 {a:[1438,555],b:[1438,847],t:11,open:[{at:132,w:90,kind:'door',id:'bed3'}]}
];
export const notes={height:2.8,tv:{inch:85,width:1.882,height:1.059},sideboard:{width:3.9,depth:.65},column:{point:[940,159],width:.45,depth:.45,barLength:1.8,height:.95,status:'按用户确认保留不可拆柱；450×450仅占位，位置与离玻璃距离待复尺。CAD恢复短墙不能视为该柱。'},finishes:{tile:.8,grout:.002,wall:'暖白乳胶漆；淋浴直接受水墙面须做防水饰面专项确认',livingCeiling:'双眼皮',bedroomCeiling:'单眼皮',bathCeiling:'300×600铝扣板＋风暖浴霸（模块尺寸暂定）'},hvac:{indoor:[975,716],supply:'朝客厅/湖景方向侧送风',return:'设备吊顶底部回风',outdoor:null,pipeRoute:null,status:'已核对13层标准层图二；隐藏外机符号不作为定位依据，预留孔与冷凝水点未可靠对应本户，外机和穿墙管线未定'},precision:'墙体与开口沿用原 PDF 重建；已核对13层标准层图二，未按诊断恢复值擅自挪墙。层高2.8m及吊顶标高为方案值。不可拆柱保留，450mm截面仅占位，位置待复尺。大玻璃、外机与管线、排风和电气均未施工验证；全屋智能只作网页模拟，湖景为氛围示意。'};
