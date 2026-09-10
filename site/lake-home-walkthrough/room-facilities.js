// Object names are exported from app.js/services.js; no independent room geometry.
const item=(label,object,note,position,sectionZ)=>({label,object,note,position,sectionZ});
import {windowProfiles} from './window-profiles.js';
const bedroom=(id,width,desk=false)=>[
 item('柔光顶灯 · 3000 K',id+'-main-light','薄型吸顶灯负责基础照明，床头灯负责阅读；调光与 Ra≥90 为选型目标，未实测。'),
 item('独立壁挂空调',id+'-air-conditioner','室内挂机示意，已补出风百叶。匹数、穿墙孔、冷凝水及室外机位待核实。'),
 item('床与床头灯',id+'-bed',width+' m 床垫方案。不是成品采购尺寸。'+(id==='bed1'?' 床头朝图左，两侧小床头柜，床下设前移上翻收纳；五金轨迹须匹配产品。':id==='bed3'?' 薄床架横向排布，独立床头板位于飘窗前，不把飘窗当家具地面；保留学习通道。':'')),
 item('衣柜与分区收纳',id+'-wardrobe','柜体有实际深度、分扇、层板及挂衣分区；新卧室衣柜采用移门。五金、净容量和防倾倒固定仍需核定。'),
 ...(desk?[item('书桌与座椅',id+'-desk','独立书写区，保留窗边采光。'),item('桌面台灯与书本',id+'-desk-everyday','台灯与书本置于已有桌面，不增加落地家具。灯光与产品参数为示意。')]:[item('② 入口衣帽收纳 · 非独立衣帽间','master-entry-wardrobe','主卧入门后左手单侧衣柜；当前为组合高柜与翻盖梳妆，柜内设层板及挂杆；不是独立衣帽间，净容量和五金待选型。',[13.6,1.5,4.9]),item('床头书与电子钟','master-bedside-everyday','床头日用品示意，未连接设备。'),item('① 主卫洗漱台 · 在主卫内','bath2-vanity','主卫进门左侧，镜背靠原左墙，柜面朝室内；670 × 490 mm 台面、双抽与镜侧灯。此次已修正朝向，不是卧室梳妆台；供排水、抽屉拉出和两人错身仍待深化。',[13.68,1.62,2.48])]),
 item('窗帘与轨道',id+'-curtain','已有帘布与电动轨道外形；真实电机、电源及窗边安装未选型。'),
 item('单眼皮吊顶',id+'单眼皮','卧室单眼皮吊顶为现有模型，标高为方案值。'),
 item('房门 · 原图铰接端',`door-${id}-single`,id==='bed3'?'图下端铰接、向儿童房内开。新床柜桌椅已重排，当前门扇0–90°采样未碰家具；实际安装及人体使用仍需核实。':'改为图右端铰接、向房内开。门洞沿用旧模型尺寸，门框五金和完整扫掠待复核。')
];
const bathroom=id=>[
 item(id==='bath1'?'蹲便器与冲水箱':'坐便器',id==='bath1'?'bath1-squat-pan':id+'-toilet',id==='bath1'?'次卫已取消马桶。560 × 720 mm 蹲便外形、陶瓷凹盆、防滑脚踏与独立冲水箱；朝入口方向使用。约 195 mm 盆体下沉仅为模型示意，沉箱、排污口、存水弯及完成面待核实，不能据此凿楼板。':'坐便器与双按键细节；坑距、插座与机型待核实。',id==='bath1'?[2.04,1.55,5.7]:undefined),
 item('玻璃淋浴区',id+'-shower',id==='bath1'?'左侧淋浴与右侧蹲便分开；淋浴门改朝入口侧并向内打开 90°，模型框间约 802 mm。花洒朝向已调到后墙；窗扇、五金及挡水防水未施工验证。':'顶喷、手持花洒、软管、混水器、玻璃五金和地漏示意。排水与门扇开启待核实。'),
 item(id==='bath1'?'④ 公卫外置洗手台 · 非儿童房设施':'① 主卫洗漱台与镜面',id+'-vanity',id==='bath1'?'公卫干区，位于老人房旁、玄关一侧；不是儿童房洗手台。当前650×400mm柜体、镜柜和防溅隐私侧屏已接入全屋；柜门横移不外伸，隔屏至移位后的换鞋凳50mm。洗漱/坐姿换鞋局部600mm代理可通，大幅前倾换鞋需礼让。供排水、防水、挂墙和五金待核。':'主卫进门左侧，镜背靠原左墙、柜面朝室内；台面 670 × 490 mm。已修正反向问题，镜面仍为反射近似。开抽屉、淋浴门、给排水及安装检修尚未验收。',id==='bath1'?[3.13,1.6,5.87]:[13.68,1.62,2.48]),
 item('集成浴霸 · 暖风/排风/灯',id+'-heater','300 × 600 mm 集成模块：暖风百叶、排风吸口、4000 K LED 与上部机身分别建模。排风去向、止回阀、功率、漏电保护、接地和湿区防护等级待选型。'),
 item('暖白铝扣板吊顶',id+'-aluminum-ceiling','300 × 600 mm 哑光暖白铝扣板、2 mm 拼缝、四周收边；浴霸处留模块空位，不叠压整块板。板底暂按 2.55 m；梁底、设备净空和可拆检修需复尺。'),
 item('卫浴门 · 向卫浴内开',`door-${id}-single`,'按原图修正铰接端与转向。门洞宽度、门框、门扇与淋浴/人站位仍须一起复核。',id==='bath1'?[1.65,1.5,6.65]:undefined)
];
export const roomFacilities={
 kitchen:{summary:'L 型操作台：窗下洗涤，左侧备餐与烹饪。厨电型号及烟道接口未定。',items:[
 item('线性顶灯 · 4000 K','kitchen-main-light','低厚度柔光顶灯，配水槽上方筒灯和烟机工作灯；照度、眩光及回路未计算。'),
 item('水槽与龙头','kitchen-sink','台面已留真实开口，包含下沉盆体、落水口、龙头与把手。给排水接口待核实。'),
 item('双灶位','kitchen-hob','黑色面板、双加热位和旋钮示意；燃气／电磁及开孔未选定。',[5.20,1.6,4.5]),
 item('抽油烟机','kitchen-hood','烟机壳体、集烟过滤面、照明与上部罩壳。罩壳不表示已确认排烟管路。',[5.20,1.6,4.5]),
 item('操作台与地柜','kitchen-cooking-cabinets','侧向操作台与地柜分扇，台面标高约 900 mm。'),
 item('水槽柜与收纳','kitchen-sink-cabinets','有柜门、拉手与踢脚；水槽下方管路空间待深化。'),
 item('厨房旁内嵌冰箱','integrated-fridge','位于厨房外侧相邻柜体，不在入户门旁；散热尺寸待选型。',[8.19,1.6,2.76])
 ]},
 bed1:{summary:'两位入住，1500×1800mm床垫，床头朝图左。1800×400mm推拉门薄衣柜（含门轨）、床箱收纳被褥、两侧小床头柜，实体飘窗保留。柜前约510mm仍紧凑；换季收纳可由主卧补充。',items:[...bedroom('bed1',1.5,true).filter(i=>!['bed1-desk','bed1-desk-everyday'].includes(i.object)),item('实体飘窗 · 湖景保留','bed1-raised-bay','用户确认不可拆；不再设窗下矮柜。台高550mm仅为示意。'),item('床箱 · 被褥收纳','bed1-bed-storage','换季被褥放床下，上翻轨迹与支撑五金未选定，不作为操作安全认证。'),item('两侧小床头柜','bed1-nightstand-0','32×30cm与30×30cm示意，使用净距待实测。')]},
 master:{summary:'1.8 m薄床架方案、约4.5m组合高柜、900×450mm翻盖梳妆台及镜侧灯已进入当前全屋；主卫保留套内连接。床尾约652mm偏紧，不是独立衣帽间。',items:[item('梳妆台 · 镜侧灯与翻盖收纳','master-makeup-desk','900×450mm台面，翻盖浅格收纳，凳子收进桌下；侧灯为选型示意。',[13.7,1.5,3.45]),...bedroom('master',1.8)]},
 bed3:{summary:'儿童房采用1200×2000mm床垫、2100×600mm移门衣柜及1300×600mm学习桌；学习椅收至桌下，可拉出450mm。已消除原床柜90mm重叠，保留独立挂机；不是带洗手台的套房。',items:[...bedroom('bed3',1.2,true),item('学习椅 · 可拉出','bed3-chair','500mm宽座椅，收起深入桌下；拉出450mm并按600×650mm使用占位检查，所测床侧/衣柜路径仍连通。',[14.38,1.6,6.00]),item('文具抽屉与线缆收纳','child-stationery-drawer','左侧抽屉拉出280mm，避开椅子；桌后有线槽和电源占位，接线未实施。',[14.45,1.3,5.90]),item('床箱分仓收纳','bed3-bed-storage','上翻床箱存放换季床品，需匹配前移五金及防夹/支撑锁止产品。',[16.1,1.65,6.16])]},
  bath1:{summary:'公卫：外置洗手台保留，室内左侧开放淋浴＋右侧蹲便，按用户确认取消全部淋浴玻璃隔断。洗澡时室内可能整体溅湿；防滑、防水、排水及备品防溅仍需深化。',items:bathroom('bath1')},
 bath2:{summary:'主卫内设坐便、淋浴、浴室柜及风暖浴霸。',items:bathroom('bath2')},
 living:{summary:'客厅用风管机，三间卧室用挂机；不是整套房共用一个出风口。',items:[
 item('茶几日用品 · 书/杯/遥控器','living-coffee-everyday','已有茶几上补书本、杯垫、杯子和遥控器，不另占通道。',[10.6,1.35,4.6]),
 item('地毯 · 220 × 320 cm','living-area-rug','浅米灰细织短绒，长边沿沙发，两端各超出约30cm；压住沙发前部、覆盖茶几，避开餐岛通道。防滑底和扫地机器人爬毯待选型。',[10.9,1.6,5.9]),
 item('沙发搭毯与靠垫','living-sofa-throw','灰绿搭毯呼应已有燕麦沙发、米白与灰绿靠垫。'),
 item('湖景窗帘与电动轨道','living-curtain','已有帘布与轨道外形；不是已配置真实电机系统。'),
 item('电视墙 · 一体横向展示带','recessed-tv-black-side-reveals','85寸电视与两侧展示格上下对齐，550mm宽、约198mm深，每侧两格；灰调木内衬、整片暖灰上下饰面。屏幕和中央饰面向前100mm齐平，不凿墙；3300×380mm低柜和沙发占地不变。支架、散热和固定待实测选型。',[8.1,1.5,3.66]),
 item('湖景侧 · 陶器展示','tv-display-lake','展示带标高840—2040mm，上格陶器、下格少量书籍；不再做通顶高柜，灯带藏在层板前沿。',[9.5,1.4,3.2]),
 item('餐厅侧 · 书与小雕塑','tv-display-dining','与电视和左侧展示区统一水平线，两格留白摆放小雕塑与书；观影时关闭展示灯或低亮。',[9.5,1.4,4.6]),
 item('悬空低柜 · 封闭储物','tv-low-console','3300 × 380 mm，离地 180 mm，台面高 478 mm；承重固定与设备收纳为待深化方案。',[8.1,1.5,3.66]),
 item('沙发 · 85寸观影布局','linen-sofa','2.6m沙发；坐姿眼位至屏幕平面约2.57m、水平视角约38°。沙发—岛台约1.05m，沙发—茶几约45cm。眼位是估算，最佳距离需结合片源和个人体验；用全部空间中的“沙发坐姿观影”查看。'),
 item('风管机侧送风口','supply-grille','设备吊顶设两段侧送风，朝客厅；室外机、冷媒管与排水未定。',[8.61,1.6,5.05]),
 item('风管机底回风口','return-grille','回风位于设备吊顶底面，不是室外排风。',[8.61,1.6,5.05]),
 item('设备检修口','service-hatch','450 mm 为暂定检修开口示意；需匹配最终机型。',[8.61,1.6,5.05]),
 item('双眼皮吊顶','客厅双眼皮外层','客厅双眼皮造型；实际梁位、层高及风管吊顶需现场确认。')
 ]},
 dining:{summary:'餐边柜自上而下：一排内收吊柜、600 mm 深操作台、独立抽屉、底柜。无外露拉环、无反弹器。',items:[item('双人餐具与桌垫','dining-table-settings','补餐盘、餐巾、杯子与餐具，保留中间操作区。',[8.1,1.6,3.6]),item('岛台与两席','stone-island','1800×900×900mm干式备餐岛台，40mm薄台面；厨房面六抽、490mm深柜身；两席在东侧长边朝厨房，膝部380mm、座位中心距860mm。厨房侧静态1100mm；沙发侧1050mm用于坐席，不是有人入座后的椅后通道。不含给排水。'),item('四段餐边柜整体','flush-sideboard','上柜不再拆成两排；操作台下新增六只独立抽屉。台面深 600 mm，上柜成品深 350 mm、内收 250 mm；右侧管线机保留嵌入柜体。',[9.43,1.45,4.8]),item('上柜门板下延手扣','sideboard-upper-storage','门板下延 25 mm，底板前沿退让手指空间；手从下方拉开，不用反弹器。内收不能保证开门时不碰头。',[9.0,1.4,5.35]),item('第三段 · 餐具抽屉','sideboard-drawer-bank','台面下独立一排六抽，含抽屉盒体；面板高约 200 mm，顶部 45°斜切手扣。滑轨、承重及拉出后使用净空未验收。',[9.43,1.2,5.45]),item('第四段 · 底柜手扣','sideboard-base-bevel-2','底柜与上方抽屉独立分段；22 mm 门板顶部 45°斜切，不装外挂把手或反弹器。板材、倒钝及五金待定。',[9.75,.85,5.85])]},
 entry:{summary:'进门放钥匙、关门后在次卫侧换鞋；鞋类与餐边收纳分开；对讲及控制面板露出。次卫侧宽1.6m的高鞋柜收鞋，退离门铰链约975mm；不加正对门隔断。',items:[item('玄关整体 · 进门先取放','entry-single-side-layout','门把手侧500mm日用矮柜＋次卫侧1600mm集中鞋柜。地面同标高，设备墙保留。位置与人体使用待现场核准。',[7.0,1.6,5.35]),item('集中鞋柜','flush-entry-cabinet','1600×约420mm，四扇约400mm柜门。底部开放格放常穿鞋和拖鞋，上部放备用鞋、换季鞋；层板按鞋长调整。',[5.4,1.5,5.5]),item('进门日用柜','entry-low-cabinet','宽500、高900、含把手最深约450mm；台面放钥匙手机、浅抽收小物，封闭收小物与包，不放鞋。非全家鞋柜容量，非座位。',[7.0,1.5,5.8]),item('随手台面','entry-key-tray','位置靠门把手侧；鞋类另在次卫侧。'),item('可视对讲与控制面板','entry-intercom-control-zone','设备墙下方为日用矮柜，面板保持露出；按原底盒位置核准。')]},
 bar:{summary:'双翼等长四席试排：左右各1.3m，每侧两席、中心距650mm，柱宽按400mm上限。洗烘侧静态桌端净距约800mm，不代表机门打开后能舒适取衣。',items:[item('承重柱与包饰','retained-balcony-column','不可拆；柱宽按400mm上限试排，进深450mm待复尺。护栏线至柱中心约1.5m，不是柱边净距。'),item('左翼 · 1.3m / 两席','lake-bar-left','与右翼同长、同高、同材质；每侧两张原尺寸吧椅，中心距650mm；外端支撑收至靠玻璃侧，支撑承重未验证。'),item('右翼 · 1.3m / 两席','lake-bar-right','按用户要求改为等长；到洗烘柜静态间距约800mm。机门开启、弯腰取衣和安装余量待验证，不能据静态宽度下单。')]},
 laundry:{summary:'洗烘柜沿右墙朝正面玻璃方向前移55cm；机门中心与桌后沿错开约75.4cm，正面玻璃线到柜侧约14cm。此为模型试排，给排水、开启角度及安装检修未定。',items:[item('洗衣机','laundry-washer','下层洗衣机，给排水、插座和减振待核实。'),item('烘干机','laundry-dryer','上层烘干机，须与原厂叠放套件匹配。'),item('整体洗烘柜','balcony-laundry-cabinet','含上柜、清洁柜及任务灯；散热检修待机型确认。')]}
};
export const facilityRoom=id=>({tvSeat:'living',lake:'bar',drying:'bar',balconyGap:'bar',columnFront:'bar',glassLeft:'bar',glassRight:'laundry',cabinet:'dining',fridge:'kitchen',services:'living'}[id]||id);

for(const [i,label] of ['餐具','茶工具','茶杯','桌布餐巾','茶叶盒','保鲜用品'].entries()){
 const x=9.43-[-1.625,-.975,-.325,.325,.975,1.625][i];
 roomFacilities.dining.items.push({...item('抽屉 · '+label,'sideboard-drawer-'+i,'面板与盒体共同拉出420mm，45°手扣保持；五金及实际承重待选。',[x,1.45,5.8]),action:'sideboard',band:'drawer',index:i});
 for(const [band,y,label2] of [['upper',1.8,'上柜'],['base',1.15,'底柜']])roomFacilities.dining.items.push({...item(label2+' · 第'+(i+1)+'格','sideboard-'+band+'-door-'+i,band==='upper'?'关闭深350mm、门板下延25mm，90°平开，无拉环/反弹器。上柜顶2.41m，取消最高一层、保留两层杯具储物；容量减少换柜墙一体顶线，不冒充原容量。铰链及安装承重待核。':'保留斜切手扣，分层杯碟/备用物收纳；铰链为尺寸示意。',[x,y,5.8]),action:'sideboard',band,index:i});
}
roomFacilities.dining.items.push({...item('管线机 · 隐藏水电检修','dispenser-service-pier','设备面板保持齐平不移动。左侧原120mm装饰边改窄检修柜，净宽96mm；下部截止阀、上部电源预留，隔板分开并预留漏水感应。柜内管线未接建筑水电，实际防护和拆机方式仍需设备核定。',[8.08,1.45,5.9]),action:'sideboard',band:'service'});
roomFacilities.kitchen.items.push({...item('冰箱 · 四门与内仓','fridge-cold-interior','保留厨房旁柜位，四门开启125°再抽篮；门封凹座与铰轴避让已建模。必须匹配实际零嵌机型、开门角和散热要求，未确认有效容积。',[8.8,1.6,2.65]),action:'fridge'});
roomFacilities.kitchen.items.push({...item('冰箱顶柜 · 换季轻物','fridge-upper-storage','两层、四只396×240×430mm收纳盒；柜门向厨房侧平开90°。高位只放低频轻物，配稳固踏凳取放，不踩餐椅或岛台；固定及五金承重待选。此柜不充当冰箱散热风道。',[8.6,1.6,2.80]),action:'fridge',upper:true});
for(let i=0;i<5;i++)roomFacilities.kitchen.items.push({...item(i===4?'冰箱 · 果蔬抽屉':'冰箱 · 冷冻抽篮 '+(i+1),i===4?'fridge-crisper':'fridge-freezer-bin-'+i,'先开门，再拉出300mm取物。内腔尺寸是设计包络，不等于厂家有效容量。',[7.4,1.20,2.4]),action:'fridge',bin:i});

roomFacilities.laundry.items.unshift(
 {...item('洗衣机 · 开门看内筒','washer-drum-interior','右铰链向远离玻璃/窗帘侧展开，110°为当前检查角；必须选右铰链成品，不能把普通洗衣机随意换向。',[10.55,1.12,.66]),action:'laundry-door',kind:'washer'},
 {...item('烘干机 · 开门与滤网','dryer-drum-interior','右铰链与下机同向；内筒、提升筋、门口滤网与下部滤网盖。清理须按实机说明，110°仅为已建检查范围。',[10.55,1.55,.66]),action:'laundry-door',kind:'dryer'},
 item('洗烘叠放 · 承接节点','laundry-stacking-kit','下机顶承接框与上机支点，非独立悬空隔板；必须采用匹配原厂套件，尚未选型/验算承重。',[10.85,1.08,.95])
);
roomFacilities.laundry.items.push({...item('取衣 · 从柜前站位看','laundry-washer','站位中心至机前约775mm，位于打开机门的另一侧；600mm圆形占位在关闭/单开/双开状态可连回主通道，弯腰/伸手仍需实物体验。',[10.55,1.60,.69]),action:'laundry-door',kind:'washer'});
roomFacilities.laundry.summary='保留向玻璃方向外移55cm的柜位。两机为右铰链候选，远离窗帘侧开至110°；模型门扫掠与600mm柜前站位已检查。需匹配实际机型、原厂叠放件、门限位与背部管线余量，不代表已具备施工条件。';

roomFacilities.bar.items.push({...item('旋转吧椅 · 转座与脚踏','upholstered-counter-stool-left-1','保留425mm坐面宽和约700mm座高，座面转90°、椅脚原位；脚踏圈与四腿相接，脚垫落在地砖完成面。横厅尺寸中查看保留椅子的600mm站位与路线；这不是坐到站动作或实机承重认证。',[8.45,1.05,2.95]),action:'bar-seat',seatIndex:1});
roomFacilities.living.items.find(i=>i.object==='supply-grille').note='柜墙设备位前侧1120×140mm开口，短接室内机朝客厅送风；组件向柜墙600mm，取消原横跨浅带。底2.43m，上柜顶2.41m（2.8m层高试排）。风量/覆盖/噪声、外机与管线仍待选型。';
roomFacilities.living.items.find(i=>i.object==='return-grille').note='真实底部回风开口、可下翻格栅和可取滤网；在“空调与检修”内操作。回风是室内循环，不是通向室外。';
roomFacilities.living.items.find(i=>i.object==='service-hatch').note='450×450mm局部检修口、可下翻面板；不足以更换整个室内机，整机更换须拆局部设备位底板。实际机型/梁高/吊装条件待核。';
roomFacilities.living.items.push(item('柜墙一体吊顶与送回风','ducted-indoor-bulkhead','设备顶线3.90×0.94m，底2.43m，向餐边柜墙收回600mm；取消原横跨浅带、保留周圈双眼皮。上柜降为两层储物，机身尺寸未缩小，非全厅层高提高。检修前关闭柜门，点击顶部“空调与检修”查看。',[9.1,1.6,4.95]));
for(const id of ['bed1','master','bed3']){const ac=roomFacilities[id].items.find(i=>i.object===id+'-air-conditioner');ac.note='实心外形已改可开罩、双滤网和出风叶片；顶部“空调与检修”可操作。'+(id==='bed1'?'移出墙内约90mm，并沿同墙向窗侧350mm。':id==='bed3'?'背板移出墙面，留10mm方案余量。':'主卫隔墙卧室侧位置暂保留。')+'匹数、风向/直吹、墙面安装、冷媒/排水及外机位置尚未核定。';}
roomFacilities.care={summary:'选阳台另一侧做1300×600mm一体低柜：650mm台盆/湿仓＋650mm扫地机仓，900mm台面，220mm浅吊柜。两仓分隔，洗衣盆收湿仓；另一侧供排水未确认，不是施工定案。',items:[
 item('整体 · 1.3m清洁柜','balcony-care-cabinet','与洗烘柜分设阳台两端。模型柜前到左翼桌端约960mm，距冰箱柜侧约310mm；水电接入、机型及检修待核。',[8.85,1.40,2.05]),
 item('洗手台 · 真开孔盆体','balcony-care-sink','460×340mm开口、150mm深浅盆，龙头与排水口；台面900mm。存水弯在独立湿仓，不占机器人仓。',[7.1,1.45,.65]),
 item('上下水基站 · 检修净高','balcony-robot-dock','取消基站上方浅抽屉，净仓623×839×560mm；550mm高概念基站上方289mm。上盖开启后可前抽无管线耗材盒，基站固定不拉水管；仍须按真实机型匹配。',[7.15,.70,1.37]),
 item('停机检修 · 耗材盒','dock-removable-service-cassette','分两步示意：盖板开80°后耗材盒前抽200mm。不是水箱、不是带水整站拖出；不等于真实机型安装验收。',[7.15,.72,1.50]),
 item('扫地机器人 · 出入示意','balcony-cleaning-robot','直径350mm示意机；本位置上方按钮可演示向前驶出820mm并归位。只检查模型直线净空，不是真机寻路或对接测试。',[7.1,.65,1.45]),
 item('湿仓 · 检修与防臭排水','balcony-care-services','点“查看柜内”打开湿仓：存水弯、角阀为分仓占位，不代表已接到实际管路；保留检修，湿区电源与漏水防护须专项确认。',[7.05,1.1,.58]),
 item('洗衣盆收纳','balcony-folding-basin','折叠盆收在台盆下湿仓底层，不挡机器人进出口；查看柜内后可见。',[7.02,.65,.57]),
 item('浅吊柜 · 镜门与灯带','balcony-care-upper','吊柜深220mm，台面上方留空，镜门加一扇暖灰收纳门；镜面为环境近似。任务灯仅外观示意，防护与照度未选型。',[7.2,1.65,1.35])
]};
roomFacilities.bar.items.push(roomFacilities.care.items[0]);
roomFacilities.bar.items.push(item('晾衣架 · 收起与挂衣','balcony-drying-rack','单杆1600mm，靠玻璃顶部，空杆收起高度2550mm、降至1800mm；三件转向衣架小件试排会遮部分湖景。长衣/床单、承重固定及晾衣机型号未核。',[7.1,1.6,2.75]));
roomFacilities.bar.summary='固定双翼各130×56cm、每边两席；包柱完成面进深50cm，桌面前后各超出3cm。左办公右泡茶，插座改桌面翻盖。正面玻璃、两侧实体封闭候选；柱位不动，洗烘柜沿右墙向玻璃方向前移55cm错开机门。';
roomFacilities.bar.items.push(
 item('左翼 · 笔记本办公','bar-laptop-workplace','330×235mm笔记本外形，桌面深560mm；临时办公方案。久坐需适配吧椅、脚踏、屏幕高度及外接键鼠。',[7.80,1.6,2.45]),
 item('右翼 · 泡茶与烧水','bar-tea-zone','560×300mm可取走茶盘与烧水器具示意；不接上下水，远离笔记本；热蒸汽、防倾倒及额定功率待机型核实。',[10.15,1.6,2.55]),
 item('包柱 · 浅暖灰与细竖缝','bar-service-cover','去掉外挂插座板、木色大贴板和黑色腰带。结构柱400×450mm未变，薄饰面候选完成面440×500mm；前方细缝为独立检修饰面，不凿柱。',[9.5,1.5,2.8]),
 item('左翼 · 翻盖电源与USB-C','bar-power-left','同色薄盖与台面近齐平，打开后使用，非防水认证。左办公、右烧水分开；型号、开孔、回路及漏保待核。',[8.40,1.55,2.30]),
 item('右翼 · 翻盖电源','bar-power-right','靠柱独立带盖电源盒，茶盘位置不换边。点上方按钮查看翻盖；不能把带盖等同于开盖防水，清洁或溅水时停止用电。',[9.55,1.55,2.3]),
 item('桌下线槽 · 左翼','bar-cable-tray-left','桌下低机位细节视图。空线槽从柱外包饰绕行，不跨地面；进线起点、线径、负载、接地与漏电保护须电工核定。',[8.13,.60,.50]),
 item('左侧实体墙 · 方案','balcony-solid-left','替换此前侧玻璃显示；120mm仅占位厚度，未选墙材，未核承载及外立面，不是砌墙施工许可。',[8.5,1.6,.60]),
 item('右侧实体墙 · 方案','balcony-solid-right','原侧玻璃段改实体封闭，多数位于前移后的洗烘柜背后；此为靠玻璃的节点观察机位，不是站人示意。未确认墙材及改管。',[10.7,1.6,.17])
);
roomFacilities.laundry.items.push(item('洗烘侧实体封闭','balcony-solid-right','侧面不再要求玻璃；洗烘柜沿右墙向玻璃方向前移55cm试排。具体设备的开门角度、取衣动作及给排水仍待核对。',[10.7,1.6,.17]));
roomFacilities.dining.items.splice(1,0,
 item('备餐岛台 · 六抽收纳','island-storage-carcass','厨房面两列三层抽屉，430mm深盒体；东侧长边留380mm膝部凹入。横厅尺寸可演示抽屉、六席就座及逐席起身；五金和台面悬挑承重待选型。',[6.45,1.5,4.25]),
 item('岛台台面电源 · 未接电','island-flush-power-module','嵌入式电源模块外形示意；地面供电、漏电保护、防溅及产品型号待确认。此方案不设置水槽，不推定阳台或厨房排水可迁移。',[6.45,1.5,4.25])
);
for(const p of windowProfiles){
 const position={bed1:[1.8,1.6,3.8],bath1:[2.2,1.5,6.0],kitchen:[5.2,1.6,3.8],living:[8.7,1.6,3.5],bath2:[13.6,1.5,2.5],master:[16.7,1.6,2.9],bed3:[16.0,1.6,5.65]}[p.room];
 roomFacilities[p.room].items.push(item((p.room==='living'?'阳台正面湖景大玻璃':p.label)+' · 窗高核对',`window-${p.room}-${p.room==='living'?9:p.walls[0]}`,p.userOverride?'仅阳台正面保留大玻璃，两侧改实体封闭候选；60 mm 底边、2620 mm 高仍为方案占位，不能作为封窗订货尺寸。':'原图 LD '+p.sourceSill*1000+' mm / CH '+p.sourceHeight*1000+' mm；已修正模型玻璃竖向位置。横向尺寸、飘窗台结构、窗扇和防坠仍待核对；不授权拆窗下墙。',position));
}
roomFacilities.entry.items.push(
 item('入户子母门 · 大扇','door-front-main','原图为大、小两扇向户外开；大小比例参考原矩形叶片。原图门洞 1100 mm，单扇规格和框缝未复尺；不是单扇 1100 mm。',[6.9,1.45,5.95]),
 item('入户子母门 · 小扇','door-front-secondary','小扇独立开合。五金、插销、开启净宽及门外公共空间仍待复核。',[6.9,1.45,5.95])
);
export const pendingDesign=['主卧梳妆：薄床架＋翻盖方案已接入全屋；模型三状态局部通行通过，成品/五金/实际使用仍待核','独立衣帽间：未完成；不能将衣柜或梳妆候选改名代替','公卫干区：650×400mm镜柜移门方案已接入；局部洗漱/坐姿换鞋可通，大幅前倾受限。管路、固定及防水待核','主卫洗漱台：朝向已修正，抽屉/淋浴门使用及管路安装仍未验收','阳台洗手台及盆收纳：已做另一侧1300mm分仓候选，现场排水及使用体验未验收','上下水扫地机：已建分仓与进出示意，品牌型号、顶部拆洗及另一侧水电接入未确认','电动晾衣架：未建模，需避开吧台、洗烘及玻璃','全屋踢脚线：已按墙线和门洞生成60mm高/8mm外凸方案，已补6处柜后扣减；门套和阴阳角仍需深化；设备型号、检修、强弱电及安装配套未选型，智能控制仅网页模拟'];
roomFacilities.bath1.items.push(item('台盆柜检修仓 · 管道示意','dry-service-access','打开右側移门的低机位检修特写，不是站姿；预留存水弯与阀门包络，未确认墙排/地排接点，不据此施工。',[3.40,.68,6.13]),item('镜柜内部 · 洗漱收纳','dry-mirror-storage','滑开镜门查看分层与洗漱用品；镜面为反射近似，镜前灯照度、供电和防潮待核。',[3.55,1.55,6.02]));
pendingDesign.push('儿童房：新床柜书桌已替换原全屋家具并消除已查明实体重叠，门扇扫掠和学习使用代理通过；防倾倒、防夹和真实产品仍待核。','横厅：四把吧椅改原位旋转座面，岛台两席仍拉出；保留本席椅子、其余五席占用时六处600mm站位和2D通路已检查，不是坐到站全过程或实物认证。人为把六椅全部后拖45cm仍有三席站位不通；洗烘已补真实门扫掠，右铰链候选在110°内避窗帘，柜前600mm站位可达，具体机器及实际取衣体验未确认。');
pendingDesign[pendingDesign.findIndex(s=>s.startsWith('电动晾衣架：'))]='电动晾衣架：已接入单杆升降和三件小件遮景示意，型号、承重、固定基层及长衣范围未验收';
pendingDesign[pendingDesign.findIndex(s=>s.startsWith('上下水扫地机：'))]='上下水扫地机：柜仓增加净高，补上盖/无管线耗材盒检修示意；真实产品及另一侧水电接入待核';
roomFacilities.care.items.find(i=>i.object==='balcony-care-upper').note='220mm浅吊柜，镜门与暖灰收纳门；当前网页镜面反射实际阳台模型。柜内及门扇功能仍待补，灯光防护与照度未选型。';
roomFacilities.bath1.items.find(i=>i.object==='dry-mirror-storage').note='滑开镜门查看分层与洗漱用品；镜面随门板移动并反射实际室内模型。镜前灯照度、供电和防潮待核。';
const masterBathNote='主卫内670×420mm浅浴室柜，沿原左墙向门侧移100mm；台面端至模型墙面约5mm。450×280mm真开孔台下盆、上抽U形避管、下抽毛巾，45°手扣；进入淋浴前收好抽屉。600mm局部代理通过但入口偏紧，非无障碍或安装验收。镜面为实际室内反射。';
for(const room of ['master','bed1','bed3'])roomFacilities[room].items.push({...item('床品近看 · 织纹与收褶',room==='master'?'master-bed-sewn-pillow-0':room+'-bed-sewn-pillow-0','近距离材质检查镜头，不是站姿。细织物实拍颜色/粗糙度/法线，按约266mm扫描块重复；床宽、床箱与通道不变，尚非面料产品选型。'),detailDistance:.85,fov:55});
roomFacilities.living.items.push({...item('靠包近看 · 褶皱与布套','sofa-sewn-scatter-0','近距离材质检查镜头，不是站姿。CC0独立褶皱网格改中性针织布套，等比尺寸约441×376mm、厚244mm；落座检查间隙1mm，不扩沙发占地。'),detailDistance:.80,fov:55});
for(const id of ['living','bed1','master','bed3']){
 const curtain=roomFacilities[id].items.find(i=>i.object===id+'-curtain');curtain.label='窗帘 · 布面与开合';curtain.action='curtains';curtain.note='连续织物、挂点、折边与加重下摆；可打开、半合、拉合，开合不横向拉伸布料。轨道按现有窗边和柜体避让，真实电机、固定及供电仍待选型。';
}
for(const [room,object,position,look] of [
 ['master','master-bed-floor-support',[16.25,.065,3.48],[15.92,.055,2.98]],
 ['bed1','bed1-bed-floor-support',[3.35,.048,3.98],[2.80,.044,3.98]],
 ['bed3','bed3-bed-floor-support',[16.25,.048,6.35],[16.43,.044,5.73]]
])roomFacilities[room].items.push({...item('床底近看 · 内收落地支撑',object,'贴地节点检查，不是站姿。床底增设内收框式支撑、内部横撑和薄弹性封底；保留原床面高度和占地，上翻时底座固定。承重与五金需按实物选型。',position),look,detailDistance:.75,fov:55});
for(const [room,object,position,look] of [
 ['bed3','child-chair-floor-glide-0',[14.35,.035,5.40],[14.84,.008,4.82]],
 ['master','makeup-stool-floor-glide-1',[13.30,.035,3.75],[12.65,.008,3.59]]
])roomFacilities[room].items.push({...item('椅脚近看 · 落地脚垫',object,'低机位节点检查，不是站姿。竖腿延伸至4mm薄脚垫，座面高度不变；脚垫随椅子移动，不留悬空缝。',position),look,detailDistance:.75,fov:55});
roomFacilities.bath2.items.find(i=>i.object==='bath2-vanity').note=masterBathNote;
roomFacilities.master.items.find(i=>i.object==='bath2-vanity').note=masterBathNote;
roomFacilities.bath2.items.find(i=>i.object==='bath2-shower').note='原1040×950mm淋浴占地不变，固定片在左、660mm门片右铰链向内开90°，避开左顶喷。91姿态局部扫掠通过；玻璃、安装净宽、挡水防水及排水仍待核。自由行走可在近处开关门；须先收好浴室柜抽屉。';
roomFacilities.bath2.items.push(item('圆角台盆 · 龙头与洗漱用品','bath2-basin','450×280mm圆角盆口、约147mm盆深、6mm盆壳与真实下水开口；台面866mm。龙头底座/起泡器、左侧洗手液和右侧双人牙刷杯；仍是待匹配成品的设计，不是已选设备。',[13.55,1.5,2.55]));
roomFacilities.bath2.items.push({...item('淋浴地面 · 找坡与条槽','bath2-sloped-tile-floor','800模数裁切、2mm细缝。门口同高，820mm坡长下降12mm至通长槽；后侧短坡回流，门底胶条及向内滴水边。地漏型号、楼板/找平层深度和防水节点待核，不作凿板依据。',[13.02,1.18,1.66]),look:[12.8,0,1.3],fov:68});
pendingDesign[pendingDesign.findIndex(s=>s.startsWith('主卫洗漱台：'))]='主卫洗漱：420mm浅柜移向门侧100mm，真盆/双抽/镜面已接入；淋浴门右铰向内避顶喷，收抽后600mm代理可入内但偏紧，安装管路未验收';
for(const [room,door,position] of [
 ['entry','front',[6.85,1.35,4.85]],['bed1','bed1',[3.16,1.30,3.65]],['bath1','bath1',[3.85,1.25,5.99]],
 ['master','master',[13.35,1.4,6.70]],['bath2','bath2',[13.60,1.25,4.10]],['bed3','bed3',[12.70,1.35,6.03]]
])roomFacilities[room].items.push(item('门套与墙面收口','door-casing-'+door,'45mm窄门套、12mm表贴外凸，保留原门洞/门框；浴室采用暖灰铝合金示意。踢脚线在门套外退2mm，外缘细密封边。当前七片房门91姿态所测不碰新门套；成品、基层与安装仍待复尺。',position));
roomFacilities.entry.items.push(item('踢脚线 · 防溅侧板端头','skirting-21--1-1.925','低机位查看公卫干区下方收口，不是站姿。60mm高、8mm外凸踢脚在落地防溅侧板处断开并加同色封口；柜后不重复铺设。',[3.2,.18,6.54]));
pendingDesign[pendingDesign.findIndex(s=>s.startsWith('全屋踢脚线：'))]='全屋踢脚线：按当前墙线生成，直角斜接、独立端头封口；柜后自动避让，随主卧方案重算。60mm主体下接2mm同色柔性收边，门套同步地面高度。现场基层、伸缩缝及安装待复尺。';
roomFacilities.kitchen.summary='L形橱柜：窗下洗涤/备餐，侧面灶具和锅碗抽屉。转角改封闭盲角，不让两套柜体相穿；台面/五金与厨电为待核选型方案。';
roomFacilities.kitchen.items.find(i=>i.object==='kitchen-cooking-cabinets').note='西侧三模块、七只真实抽屉：餐具、碗盘、锅具分层；400mm前抽，45°斜切手扣。900mm台面，灶下留隔板与设备区。柜内有实际底板/侧板，不是实心柜体贴门片。';
roomFacilities.kitchen.items.find(i=>i.object==='kitchen-sink-cabinets').note='北侧1900×595mm台面、原550×390mm盆口；左盲角固定收口、中央双门检修仓、右窄收纳。门板与固定条齐平，竖缝3mm；台面下连续金属内凹抓手，20mm净开口，不用外露拉手或反弹器。90°开门为设计包络，铰链、固定及实际手感待选型；柜内管路不代表已确认给排水。';
roomFacilities.kitchen.items.find(i=>i.object==='kitchen-hood').note='烟机设计下移250mm，罩壳保留原顶部高度；目前最低面至灶具最高点约699mm。该间距不是任意燃气/电磁或烟机通用安装值，须按所选产品说明复核；排烟接点未确认。';
for(const [name,label,position] of [
 ['kitchen-prep-drawer-2','餐具 · 分格浅抽',[5.24,1.35,3.00]],['kitchen-prep-drawer-1','碗盘 · 叠放抽屉',[5.24,1.2,3.00]],['kitchen-prep-drawer-0','餐布 · 下层抽屉',[5.24,.95,3.00]],
 ['kitchen-hob-drawer-0','灶下 · 锅具深抽',[5.28,1.1,3.68]],['kitchen-hob-drawer-1','灶下 · 碗盘抽屉',[5.28,1.30,3.68]],
 ['kitchen-pots-drawer-0','锅具 · 下层深抽',[5.25,1.10,4.52]],['kitchen-pots-drawer-1','锅具 · 上层深抽',[5.25,1.40,4.52]]
])roomFacilities.kitchen.items.push(item(label,name,'打开一只抽屉查看实际收纳，其他抽屉收回；400mm拉出为五金选型空间要求，承重/防夹与实际物品尺寸待核。低机位是节点检查，不是站姿。',position));
roomFacilities.kitchen.items.push(item('水槽下 · 阀门与防漏托盘','kitchen-sink-service-bay','打开盆柜查看存水弯、阀门、软管、清洁用品与防漏托盘。后背留检修口；传感器为未接通的预留外形，不代表水电已接通。',[5.12,.56,3.18]));
roomFacilities.kitchen.items.push(
 item('备餐台 · 切配与刀具','kitchen-prep-everyday','370×290mm可移砧板放在原备餐段，不占灶面；刀具展示使用状态，用后清洁归抽。下方仍可取餐具。',[5.10,1.6,3.47]),
 item('水槽旁 · 洗洁精与海绵','kitchen-wash-everyday','270×140mm可移托盘与沥水海绵架，放在水槽右侧台面；保留盆口和龙头操作区域，可整托拿起清洁。',[5.10,1.6,3.47])
);
roomFacilities.bath1.items.find(i=>i.object==='window-bath1-3').note='原600×1200mm洞口、900mm窗台保留；双轨磨砂移窗候选，移动269mm，不向淋浴内摆扇。气密、水密、防坠和可更换条件仍待现场/机型核定。';
roomFacilities.bath1.items.find(i=>i.object==='window-bath1-3').position=[1.82,1.55,5.91];
roomFacilities.bath1.items.find(i=>i.object==='bath1-shower').note='按用户确认取消门、侧玻璃和隔断立柱，保留花洒、原排水示意和蹲便，外置洗手台不移入。开放淋浴会溅湿室内；防滑及整室防水排水须继续核定，不据模型凿板。';
roomFacilities.bath1.items.push(
 item('淋浴对折门 · 可开关','bath1-shower-door','原入口保留，两片玻璃向内对折，最大折入约412mm；自由行走可近处开关。是需匹配成品导轨/五金的候选，不是已批准的制造图。',[2.07,1.55,5.91]),
 item('洗浴套件 · 顶喷与手持','bath1-shower-fittings','210mm圆形顶喷、手持花洒、软管与混水控制；给水/热水和承重固定未连接。',[1.25,1.55,5.94]),
 item('洗浴用品 · 薄置物架','bath1-shower-toiletries','后墙薄架放洗发/沐浴用品，不凿墙做壁龛；位于门扇扫掠外，固定和防水封孔待核。',[1.54,1.4,6.40]),
 item('备品浅柜 · 移门收纳','bath1-shallow-storage','北侧600mm宽、约180mm总深浅柜，底部1.88m；分层放备用纸品。移门不向头部摆开，不作为老人常用物低位收纳。',[1.43,1.55,6.32]),
 item('毛巾杆与衣物挂钩','bath1-towels-hooks','门口北侧干区薄杆、两条手巾与挂钩；不把衣物放入直接淋浴范围。挂钩不是安全扶手。',[1.47,1.5,6.13]),
 item('刷具和小垃圾桶','bath1-cleaning-corner','北侧角落悬挂小桶与刷具，不占蹲便脚踏；取放和清洗需检查，不与洗脸用品混放。',[1.60,.85,6.02]),
 item('带防溅盖厕纸架','bath1-covered-paper-holder','蹲便侧面有盖纸架；厕纸、手巾、清洁用品分别放置。',[1.98,1.1,6.07]),
 item('淋浴地砖 · 找坡与地漏','bath1-sloped-tile-floor','同系列800mm地砖沿网格裁切；饰面入口+6mm、排水边-6mm，主坡约1.6%，未改变结构楼板。基层厚度、防水/闭水及排水接点待核，不能据此施工。',[1.45,1.45,5.98]),
 item('铝扣板 · 可拆检修','bath1-removable-ceiling-panel','原内侧300×600mm模块向下取200mm再倾斜25°展示，现场需手扶取下，不是电动或铰接板。整机拆装、梁/管道/吊件及安装仍待核。',[2.12,1.40,5.97])
);
roomFacilities.bath1.items=roomFacilities.bath1.items.filter(i=>i.object!=='bath1-shower-door');

// Accepted suite: same fixtures and curved dressing module as the detailed viewer.
roomFacilities.master.summary='已确认：端部100×45cm弧形梳妆台、150cm连续衣柜，床尾355cm柜含弧形端头。';
Object.assign(roomFacilities.master.items[0],{label:'弧形梳妆台与双浅抽',note:'圆角台面、竖向圆角镜、细线侧灯，与相邻衣柜弧形收口统一。',position:[13.65,1.6,3.45]});
for(const i of roomFacilities.bath2.items){
 if(i.object==='bath2-shower')Object.assign(i,{label:'窗右开放淋浴',note:'无新增玻璃隔断；防水和排水需现场核实。',position:[13.15,1.6,2.35]});
 if(i.object==='bath2-vanity')Object.assign(i,{label:'原位面盆与镜柜',note:'90×40cm盆柜、左右开镜柜；保留原木门。',position:[13.65,1.6,2.35]});
 if(i.object==='bath2-toilet')Object.assign(i,{label:'左后马桶',note:'与原淋浴交换位置，移厕排水待现场核实。',position:[13.60,1.6,2.20]});
}
roomFacilities.bed3.summary='已确认原门方案：150×200cm床垫、120×50cm衣柜、窗边80×60cm学习位及飘窗转角台面。';
for(const i of roomFacilities.bed3.items){if(i.object==='bed3-bed')i.note='150×200cm床垫、154×206cm床框，不是储物床。';if(i.object==='bed3-wardrobe')i.note='120×50cm衣柜，柜门与原方案一致；收纳尺寸需现场复核。';if(i.object==='bed3-desk')i.note='80×60cm侧向采光学习位，转角台面延伸到飘窗；保留原门窗。';}

roomFacilities.bed3.items=roomFacilities.bed3.items.filter(i=>i.object!=='bed3-bed-storage');
