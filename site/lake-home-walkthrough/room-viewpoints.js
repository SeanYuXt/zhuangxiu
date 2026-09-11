import {balconyLayout} from './balcony-layout-spec.js?v=balcony-right-utility-3';
import {familyDisplaySpec} from './family-display.js?v=sideboard-depth-40-10';
// Real-position room views. Camera-only data: never changes or clips the model.
// 24 mm on a 36 mm long-edge sensor; portrait crops the sides, not room geometry.
const shot=(id,room,name,position,look,subjects)=>({id,room,name,position,look,subjects,lensMm:24,sensorLongEdgeMm:36,projection:'direct-look'});
export const roomViewpoints=[
 shot('entry-passage-art','entry','石材餐边柜 · 检修浅柜与端景',familyDisplaySpec.view.position,familyDisplaySpec.view.look,['family-display-wall']),
 shot('entry-corner-approach','entry','入户方向看过渡墙',familyDisplaySpec.approachView.position,familyDisplaySpec.approachView.look,['family-display-wall']),
 shot('living-tv','living','电视与阳台展示柜',[8.65,1.6,3.66],[11.85,1.36,3.66],['85-inch-screen','tv-display-columns']),
 shot('master-bed','master','床与窗',[14.02,1.6,3.32],[16.1,1.18,1.90],['master-bed','master-curtain']),
 shot('master-bedding','master','床沿与被褥',[14.64,1.6,2.70],[15.28,.53,2.35],['master-bed-draped-duvet']),
 {...shot('master-storage','master','床尾衣柜',[14.65,1.6,1.10],[15.95,1.25,3.95],['master-wardrobe']),renderAspect:1},
 shot('master-dressing','master','床尾回看梳妆',[13.65,1.6,3.45],[12.40,1.18,3.42],['master-makeup-desk']),
 shot('master-entry-storage','master','入口衣柜',[13.75,1.6,4.35],[12.50,1.20,4.30],['master-entry-wardrobe']),
 shot('elder-bed','bed1','双人床与窗边',[3.20,1.6,5.04],[1.74,1.10,3.55],['bed1-bed']),
 shot('elder-storage','bed1','衣柜与床侧',[3.17,1.6,4.96],[1.05,1.23,5.02],['bed1-wardrobe']),
 shot('elder-window','bed1','实体飘窗与湖景',[3.15,1.6,3.10],[1.90,1.02,2.20],['bed1-raised-bay']),
 shot('child-bed','bed3','床与床头',[14.65,1.6,6.55],[16.3,1.05,5.3],['bed3-bed']),
 shot('child-study','bed3','学习桌与书籍',[17.05,1.6,6.8],[17.15,1.18,4.85],['bed3-desk','bed3-desk-everyday']),
 shot('child-storage','bed3','整墙衣柜',[15.0,1.6,6.4],[14.28,1.3,5.05],['bed3-wardrobe']),
 shot('public-shower','bath1','开放淋浴与花洒',[2.11,1.6,5.92],[1.27,1.16,6.72],['bath1-shower']),
 shot('public-squat','bath1','蹲便与冲水',[1.54,1.6,5.88],[2.16,.64,6.77],['bath1-squat-pan']),
 shot('public-ceiling','bath1','浴霸与铝扣板',[2.11,1.6,6.12],[1.85,2.55,5.81],['bath1-heater','bath1-aluminum-ceiling']),
 {...shot('ensuite-basin','bath2','洗漱台与镜柜',[13.65,1.6,2.35],[12.46,1.19,2.25],['bath2-vanity']),renderAspect:1},
 shot('ensuite-shower','bath2','淋浴与地面',[13.15,1.6,2.35],[13.81,1.05,1.12],['bath2-shower']),
 shot('ensuite-toilet','bath2','坐便与窗',[13.60,1.6,2.20],[12.67,.80,1.24],['bath2-toilet']),
 shot('ensuite-ceiling','bath2','浴霸与吊顶',[13.15,1.6,2.20],[13.61,2.55,2.34],['bath2-heater','bath2-aluminum-ceiling']),
 shot('kitchen-work','kitchen','洗切炒台面',[5.24,1.6,4.91],[4.36,1.11,2.85],['kitchen-hob','kitchen-sink']),
 shot('kitchen-cook','kitchen','灶台与烟机',[5.30,1.6,4.52],[4.01,1.43,3.60],['kitchen-hob','kitchen-hood']),
 shot('kitchen-wash','kitchen','水槽与窗',[5.10,1.6,3.47],[4.85,1.03,2.14],['kitchen-sink']),
 shot('dining-sideboard','dining','四层餐边柜',[8.35,1.6,3.0],[9.43,1.36,6.90],['flush-sideboard']),
 shot('balcony-care','care','右侧长物与扫地机',balconyLayout.views.care.position,balconyLayout.views.care.look,['balcony-care-cabinet','balcony-robot-dock']),
 shot('balcony-laundry','laundry','洗烘与手洗收纳',balconyLayout.views.laundry.position,balconyLayout.views.laundry.look,['laundry-washer','laundry-dryer']),
];
export const roomViewsFor=room=>roomViewpoints.filter(v=>v.room===room);
export function roomViewFov(view,aspect){return 2*Math.atan(view.sensorLongEdgeMm/(2*view.lensMm*Math.max(1,aspect)))*180/Math.PI;}
