const base={
 id:'child-150-l-books-bay',room:'bed3',usable:[14.02,4.46,17.52,7.17],bay:[17.52,4.8,18.13,6.41],bayHeight:.55,
 bed:[15.96,4.475,17.50,6.535],mattress:[15.98,4.505,17.48,6.505],wardrobe:[14.04,4.48,14.64,5.58],desk:[14.64,4.48,15.94,5.03],chair:[15.04,5.10,15.56,5.62],
 upperBooks:{rect:[14.64,4.48,15.94,4.76],bottom:1.50,top:2.40},bayTop:[17.54,4.82,18.07,6.38],bayTray:[17.56,4.87,17.88,5.15],
 bayUse:'保留原窗台，浅木饰面与书桌统一，床头端放可移走书托和充电小灯；中段留空，不设坐垫、假抽屉或落地柜',
 limits:['床长边靠窗侧，床头靠完整实墙','衣柜在与窗户平行的对面墙，110cm宽、60cm深；受原门洞限制','书桌沿垂直墙连接衣柜与床；A/C宽130cm、B宽95cm，上方为浅书柜','桌高75cm暂定，按孩子身高调整椅高与脚踏','窗台不计入可走地面','床靠窗后必须从可踏面复核有效防护高度及限位，原护栏不得擅拆','床尾63.5cm偏紧，不代表舒适或无障碍通行','原图窗台55cm、房间尺寸与成品家具仍待现场复核']
};
export const variants={
 refined:{...base,id:'child-refined-180',key:'refined',title:'D · 180衣柜＋书桌床头整合',bed:[15.96,5.095,17.50,7.155],mattress:[15.98,5.125,17.48,7.125],bedReversed:true,wardrobe:[14.04,4.48,15.84,5.08],wardrobeFront:'z',desk:[14.78,6.65,15.93,7.15],chair:[14.90,6.09,15.35,6.57],chairDirection:-1,upperBooks:{rect:[14.78,6.87,15.93,7.15],bottom:1.50,top:2.40},extraCabinet:null,tradeoff:'原门不动；180×60cm衣柜，115×50cm书桌与床头统一木饰面。按45cm无扶手椅校核主要使用点；飘窗及床尾窄角仍非独立可走区域。'},
 balanced:{...base,key:'balanced',title:'A · 床侧贴窗',extraCabinet:null,tradeoff:'保留130cm书桌和110cm衣柜；飘窗仅作床边置物，不能从地面直接走到窗前。'},
 storage:{...base,id:'child-reversed-bed',key:'storage',title:'B · 床头转180°（不推荐）',bed:[15.96,5.095,17.50,7.155],mattress:[15.98,5.125,17.48,7.125],bedReversed:true,extraCabinet:null,tradeoff:'床头换到对面实墙。保留柜桌会封住床尾窄角的地面入口，不能改善飘窗使用；作为排除方案展示，不推荐照此施工。'},
 study:{...base,id:'child-bay-access',key:'study',title:'C · 床内移，留窗边位',bed:[14.98,4.475,16.52,6.535],mattress:[15.00,4.505,16.50,6.505],wardrobe:[14.04,4.48,14.94,5.08],wardrobeFront:'z',desk:[16.54,4.48,17.50,5.03],chair:[16.75,5.10,17.27,5.62],upperBooks:{rect:[16.54,4.48,17.50,4.76],bottom:1.50,top:2.40},extraCabinet:null,tradeoff:'床向室内移98cm，窗台前留约100cm地面；衣柜缩至90cm、书桌96cm。房门全开会挡床尾转弯，需入房后关门再到窗边。窗台阅读坐位须通过防坠与承载复核。'}
};
export const design=variants[typeof location==='undefined'?'balanced':new URLSearchParams(location.search).get('scheme')]||variants.balanced;
