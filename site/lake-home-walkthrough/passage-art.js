import * as T from './vendor/three.module.js';
import {P,walls} from './plan.js?v=balcony-right-utility-3';

// Art is mounted on the corridor-facing solid segment beside the master door.
const wall=walls.find(w=>w.open?.some(o=>o.id==='master')),door=wall.open.find(o=>o.id==='master');
const [wallX,wallZ]=P(wall.a);
export const passageArtSpec={
 id:'passage-botanical-v1',width:.60,height:1.0,depth:.034,centre:[wallX+door.at/200,1.55,wallZ+(wall.t||20)/200+.017],
 solidWallWidth:door.at/100,doorStartX:wallX+door.at/100,wallFaceZ:wallZ+(wall.t||20)/200,
 image:'./assets/passage-botanical-v1.png',mountingVerified:false,
 view:{name:'卧室门旁 · 绚彩挂画',position:[12.25,1.60,6.65],look:[wallX+door.at/200,1.55,wallZ+.06],projection:'direct-look',lensMm:24,sensorLongEdgeMm:36}
};
export const passageArtReady=new T.TextureLoader().loadAsync(passageArtSpec.image).then(texture=>{texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture;});
export function addPassageArt(model,texture){
 const s=passageArtSpec,g=new T.Group();g.name='passage-colour-art';g.position.fromArray(s.centre);model.add(g);
 const bronze=new T.MeshStandardMaterial({color:'#867357',roughness:.42,metalness:.5});
 const back=new T.MeshStandardMaterial({color:'#38352f',roughness:.9});
 const box=(name,x,y,z,w,h,d,mat)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);return mesh;};
 box('passage-art-backing',0,0,-.006,s.width-.01,s.height-.01,.020,back);
 for(const x of [-s.width/2+.005,s.width/2-.005])box('passage-art-frame-side',x,0,0,.010,s.height,.034,bronze);
 for(const y of [-s.height/2+.005,s.height/2-.005])box('passage-art-frame-end',0,y,0,s.width-.02,.010,.034,bronze);
 const painting=new T.Mesh(new T.PlaneGeometry(.576,.96),new T.MeshStandardMaterial({map:texture,roughness:.88,metalness:0,envMapIntensity:.3}));
 painting.name='passage-botanical-canvas';painting.position.z=.011;painting.receiveShadow=true;g.add(painting);
 g.userData={...s,canvasSize:[.576,.96],artwork:'原创绚彩抽象花卉，珊瑚红、洋红与蓝绿；AI生成艺术贴图，不是室内替代渲染',support:'挂于原实体墙表面，无开洞或暗埋画框'};
 model.updateMatrixWorld(true);return g;
}
