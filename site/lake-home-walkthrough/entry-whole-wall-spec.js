// One proposal in the existing metre-based model. Cabinet dimensions are design
// dimensions; only the public washstand location is fixed by the user this turn.
import {entryTvFaceX} from './family-display-spec.js';
export const wholeWallSpec={
 id:'entry-whole-wall-31',wallZ:7.17,tvBoundaryX:entryTvFaceX,
 fixed:['bath1-vanity','door-front-main','door-front-secondary'],
 shoes:{start:3.80,width:1.73,depth:.60,top:2.40,shoeWidth:.80,coatWidth:.40,utilityWidth:.53,prepWidth:.24,drawerWidth:.53,counterTop:.92,upperBottom:2.08},
 drop:{start:5.53,width:.60,depth:.40,counterTop:1.10,drawerBottom:.97,top:2.40,panel:.018,opening:'room-front',keyWidth:.24,keyDepth:.18,trayLevels:[.07,.27],trayTravel:.25},
 welcome:{start:7.63,width:.60,depth:.30,counterTop:.88,bottom:.62,top:2.40},
 controls:{start:5.88,width:.22,depth:.04},
 fridge:{position:[8.75,0,6.87],rotation:Math.PI,bayStart:8.25,bayWidth:1,bodyWidth:.90,bodyDepth:.60,top:2.40,panelReadyIntent:true,productSelected:false,installationDepthConfirmed:false,addedRearAllowance:null},
 drinks:{start:9.27,width:2.00,depth:.53,counterOverhang:.02,counterTop:.905,upperBottom:1.95,upperDepth:.35,top:2.40,frameDepth:.60,frameEndPanel:.018,shelf:{startOffset:.56,endInset:.02,depth:.22,bottom:1.52,thickness:.024}},
 continuousCounter:true,riceCookerReserved:false,applianceAllowance:.50,applianceEnd:'near',
 proposal:'屋内面对入户门：右边从门边向次卫排60cm挂包及双层抽拉鞋盘、80cm鞋柜、40cm外套柜、53cm独立洗漱用品柜；左边60cm浅悬浮台、100cm冰箱意向位、200cm餐边柜。门右侧取消大随手台，仅留24×18cm钥匙浅抽和挂包位，底部40cm深双层抽拉鞋盘；鞋柜下三层鞋抽，上柜可调鞋架。整组最深60cm；操作台深55cm、内退5cm，下面地柜深53cm随台面退进。餐边柜末端加18mm同色通高封板，深600mm、高2400mm，不占用2000mm台面。餐区内凹上方增设约142cm长、22cm深浅木搁板，下方净高61.5cm；靠冰箱50cm电器区留高，不设竖隔板。冰箱机身按90×60cm，不再擅加5cm；600mm展示占位未包含机型要求的安装净空，不能据此下单。',
 pending:['内嵌冰箱机型、安装净空与定制门板重量；600mm仅外形占位','门边控制面板底盒和线路；浮柜支架、承重及五金','现场墙长、门套与吊顶净高','挂衣高度与老人身高、实际鞋码和收纳数量','餐区浅搁板的隐藏支架和墙面固定节点'],
 views:{
  ensemble:{position:[7.22,1.62,3.62],look:[7.56,1.18,6.98]},
  drinks:{position:[9.13,1.60,4.96],look:[10.27,1.23,6.95]},
  endcap:{position:[11.80,1.55,5.70],look:[10.90,1.30,6.95]},
  fridge:{position:[7.53,1.58,5.0],look:[8.88,1.23,6.98]},
  shoes:{position:[5.03,1.60,5.68],look:[4.68,1.16,6.96]},
  bath:{position:[4.36,1.40,5.72],look:[4.08,1.18,6.96]},
  prep:{position:[6.07,1.53,5.21],look:[5.28,1.12,6.94]},
  drop:{position:[6.89,1.56,5.68],look:[5.81,1.08,6.96]},
  fullwall:{position:[8.1,1.70,3.65],look:[8.16,1.22,7.02]},
  service:{position:[11.75,1.57,5.60],look:[13.03,1.28,7.02]}
 }
};
