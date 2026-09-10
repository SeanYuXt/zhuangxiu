import * as T from './vendor/three.module.js';
import {RGBELoader,EffectComposer,RenderPass,SSAOPass,OutputPass,RectAreaLightUniformsLib} from './vendor/render-libs.js';
import {palette} from './design-spec.js';

// All photographic assets are local CC0 material/environment references, not floorplan images.
export async function applyRealisticFinishes({renderer,scene,outside,walnut,oak,stone,linen,fabric,floorMaterial,tileMap,glass,hemi,sun,side}){
 const loader=new T.TextureLoader();
 const load=async(name,color=false,repeat=1)=>{const t=await loader.loadAsync('./assets/'+name);t.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;};
 const [wood,woodNormal,woodRough,stoneColor,stoneNormal,fabricNormal,env]=await Promise.all([load('wood-color.jpg',true),load('wood-normal.jpg'),load('wood-rough.jpg'),load('stone-color.jpg',true),load('stone-normal.jpg'),load('fabric-normal.jpg',false,6),new RGBELoader().loadAsync('./assets/lake.hdr')]);
 // Tone the existing material into one restrained natural-wood finish for the 3D scene.
 const woodCanvas=document.createElement('canvas');woodCanvas.width=woodCanvas.height=1024;const wc=woodCanvas.getContext('2d');wc.fillStyle=palette.wood;wc.fillRect(0,0,1024,1024);wc.globalAlpha=.19;wc.drawImage(wood.image,0,0,1024,1024);const warmWood=new T.CanvasTexture(woodCanvas);warmWood.colorSpace=T.SRGBColorSpace;warmWood.wrapS=warmWood.wrapT=T.RepeatWrapping;
 for(const m of [walnut,oak]){m.color.set('#ffffff');m.map=warmWood;m.normalMap=woodNormal;m.normalScale.set(.08,.08);m.roughnessMap=woodRough;m.roughness=.76;m.needsUpdate=true;}
 const quartzCanvas=document.createElement('canvas');quartzCanvas.width=quartzCanvas.height=1024;const quartz=quartzCanvas.getContext('2d');quartz.fillStyle='#dedbd3';quartz.fillRect(0,0,1024,1024);quartz.globalAlpha=.09;quartz.drawImage(stoneColor.image,0,0,1024,1024);const quartzMap=new T.CanvasTexture(quartzCanvas);quartzMap.colorSpace=T.SRGBColorSpace;
 stone.color.set('#ffffff');stone.map=quartzMap;stone.normalMap=stoneNormal;stone.normalScale.set(.008,.008);stone.roughness=.53;stone.needsUpdate=true;
 for(const m of [linen,fabric]){m.normalMap=fabricNormal;m.normalScale.set(.28,.28);m.roughness=.92;m.needsUpdate=true;}
 // Keep the original 800 mm world-aligned grout pitch while adding subdued stone detail.
 const ctx=tileMap.image.getContext('2d');ctx.globalAlpha=1;ctx.fillStyle=palette.floor;ctx.fillRect(0,0,1024,1024);let seed=31;for(let i=0;i<12000;i++){seed=seed*16807%2147483647;const x=seed%1024;seed=seed*16807%2147483647;const y=seed%1024;ctx.fillStyle=i%2?'rgba(255,255,250,.045)':'rgba(95,90,82,.028)';ctx.fillRect(x,y,1,1);}ctx.fillStyle=palette.grout;ctx.fillRect(0,0,3,1024);ctx.fillRect(0,0,1024,3);tileMap.needsUpdate=true;floorMaterial.roughness=.78;floorMaterial.userData={finish:'浅暖灰哑光，低纹理，800 mm 模数',slipRating:'待选样，非防滑认证'};
 // Half-turn the HDR so the lake, rather than the photographed bank, faces the balcony.
 const pixels=env.image.data,shifted=new pixels.constructor(pixels.length),row=env.image.width*4,half=row/2;
 for(let y=0;y<env.image.height;y++){const offset=y*row;shifted.set(pixels.subarray(offset+half,offset+row),offset);shifted.set(pixels.subarray(offset,offset+half),offset+half);}env.image.data=shifted;env.needsUpdate=true;
 env.mapping=T.EquirectangularReflectionMapping;scene.environment=env;scene.background=env;scene.userData.dayEnvironment=env;scene.fog=null;outside.visible=false;
 // r160 has no scene rotation fields; the optional tracer reads the later Three.js API.
 scene.backgroundRotation??=new T.Euler();scene.environmentRotation??=new T.Euler();scene.environmentIntensity=.65;
 scene.traverse(o=>{if(o.isMesh){for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.isMeshStandardMaterial)m.envMapIntensity=.55;}}});
 glass.color.set('#ffffff');glass.metalness=0;glass.roughness=.035;glass.opacity=.07;glass.needsUpdate=true;
 hemi.intensity=.45;sun.intensity=1.0;renderer.toneMappingExposure=.93;
 RectAreaLightUniformsLib.init();
 const niche=new T.RectAreaLight('#ffe3b7',4,2.45,.06);niche.position.set(0,1.69,.03);niche.lookAt(0,.89,-.1);side.add(niche);
 const fill=new T.RectAreaLight('#eff5ff',2.2,5.5,2.2);fill.position.set(9,1.8,.3);fill.lookAt(9,1.4,6);scene.add(fill);
 scene.userData.realisticReady=true;
 return {environment:env,assets:7};
}

export function createFineRenderer({renderer,scene,camera,isWalking,isMoving,ready}){
 let composer=null,ao=null,active=true,frames=0,problem=null,lastSize='';
 const button=document.querySelector('#fineRender'),status=document.querySelector('#renderStatus');
 function sync(){button.setAttribute('aria-pressed',String(active));button.textContent=active?'增强光影：开':'增强光影：关';status.textContent=active?'实时漫游 · 实拍材质与接触阴影':'实时漫游 · 实拍材质';}
 function stop(){active=false;sync();}function start(){active=!active;sync();}button.onclick=start;sync();
 function render(){if(!active||!ready())return false;try{if(!composer){composer=new EffectComposer(renderer);composer.setPixelRatio(1);composer.addPass(new RenderPass(scene,camera));ao=new SSAOPass(scene,camera,1,1);ao.kernelRadius=.14;ao.minDistance=.002;ao.maxDistance=.14;composer.addPass(ao);composer.addPass(new OutputPass());}
  const size=renderer.getSize(new T.Vector2()),key=size.toArray().join(',');if(key!==lastSize){composer.setSize(size.x,size.y);lastSize=key;}composer.render();frames++;return true;
 }catch(e){problem=e.message;stop();status.textContent='增强光影未能启用，保留基础漫游';console.warn(e);return false;}}
 return {render,start,stop,get state(){return {active,frames,problem,method:'screen-space-occlusion',photorealValidated:false};}};
}
