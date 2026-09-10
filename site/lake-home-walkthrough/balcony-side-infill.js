import * as T from './vendor/three.module.js';
import {P,walls as sourceWalls} from './plan.js';
import {balconySideInfill,palette} from './design-spec.js';

// Shared display overlay: does not rewrite source openings as confirmed masonry.
export const designWalls=sourceWalls.map((wall,index)=>{
 const infill=balconySideInfill.find(s=>s.wallIndex===index);
 return infill?{...wall,glass:false,t:infill.thickness*100,designInfill:true}:wall;
});
export function applyBalconySideInfill(model){
 const evidence=[];
 for(const s of balconySideInfill){
  const window=model.getObjectByName(s.window);
  if(!window)throw Error('侧窗定位缺失：'+s.window);
  window.visible=false;window.userData.designReplacement=s.id;
  const a=P(s.a),b=P(s.b),length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const wall=new T.Mesh(new T.BoxGeometry(s.thickness,2.8,length),new T.MeshStandardMaterial({color:palette.wall,roughness:.9}));
  wall.name=s.id;wall.position.set((a[0]+b[0])/2,1.4,(a[1]+b[1])/2);
  wall.castShadow=true;wall.receiveShadow=true;
  wall.userData={designOnly:true,sourceOpeningRetained:true,thicknessStatus:'120mm设计占位，含饰面；不是结构或砌体规格',constructionApproval:false,note:'用户允许侧面实体封闭；墙材、重量、原窗洞和外立面条件待核'};
  model.add(wall);evidence.push({id:s.id,replaces:s.window,thickness:s.thickness});
 }
 model.userData.balconySideInfill=evidence;
}
