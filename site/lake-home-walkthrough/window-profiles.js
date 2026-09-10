// Height evidence: original 1号房.pdf margin labels (vector outlines, not text).
// Horizontal wall coordinates remain the old model and are not survey-verified.
export const windowProfiles=[
 {id:'W01',room:'bed1',label:'老人房转角窗',walls:[0,1],sourceSill:.55,sourceHeight:1.70,sill:.55,height:1.70,sourceLines:[[10,11,12,13],[16,17,18,19]],basis:'原图标注 LD:550MM / CH:1700MM'},
 {id:'W02',room:'bath1',label:'公卫窗',walls:[3],sourceSill:.90,sourceHeight:1.20,sill:.90,height:1.20,sourceLines:[[82,83,84,85]],basis:'原图标注 LD:900MM / CH:1200MM'},
 {id:'W03',room:'kitchen',label:'厨房窗',walls:[7],sourceSill:.90,sourceHeight:1.20,sill:.90,height:1.20,sourceLines:[[86,87,88,89]],basis:'原图标注 LD:900MM / CH:1200MM'},
 {id:'W04',room:'living',label:'阳台三面玻璃边界',walls:[8,9,10],sourceSill:.20,sourceHeight:2.20,sill:.06,height:2.62,sourceLines:[[26,27,28,29],[30,31,32,33],[34,35,36,37]],basis:'原图 LD:200MM / CH:2200MM；现设计保留用户大玻璃要求',userOverride:true,status:'60 mm 底边、2620 mm 高沿用方案占位，非复尺。分格、开启扇、护栏、防坠及抗风设计未确认'},
 {id:'W05',room:'bath2',label:'主卫窗',walls:[11],sourceSill:.90,sourceHeight:1.20,sill:.90,height:1.20,sourceLines:[[90,91,92,93]],basis:'原图标注 LD:900MM / CH:1200MM'},
 {id:'W06',room:'master',label:'主卧转角窗',walls:[13,14],sourceSill:.55,sourceHeight:1.70,sill:.55,height:1.70,sourceLines:[[59,60,61,62],[53,54,55,56]],basis:'原图标注 LD:550MM / CH:1700MM'},
 {id:'W07',room:'bed3',label:'儿童房窗',walls:[18],sourceSill:.55,sourceHeight:1.70,sill:.55,height:1.70,sourceLines:[[77,78,79,80]],basis:'原图标注 LD:550MM / CH:1700MM'}
];
export const windowAtWall=index=>windowProfiles.find(p=>p.walls.includes(index));
