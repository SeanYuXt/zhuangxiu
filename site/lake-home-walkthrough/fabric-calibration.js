import * as T from './vendor/three.module.js';

// Recolour photographed weave in linear light, without baking lighting into it.
// Canvas textures are ordinary glTF-exportable maps, not WebGL-only shader hacks.
export const fabricReflectance=.88;
const toLinear=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
const toSRGB=v=>v<=.0031308?v*12.92:1.055*v**(1/2.4)-.055;
export function calibrateFabricMaps(colorSource,roughSource){
 function pixels(source){
  if(!source.image?.width)throw Error('Fabric source is not loaded');
  const canvas=document.createElement('canvas');canvas.width=source.image.width;canvas.height=source.image.height;
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(source.image,0,0);
  return {canvas,context,image:context.getImageData(0,0,canvas.width,canvas.height)};
 }
 const color=pixels(colorSource),rough=pixels(roughSource),means=[0,0,0],count=color.image.data.length/4;
 const linearLUT=Array.from({length:256},(_,i)=>toLinear(i/255));
 for(let i=0;i<color.image.data.length;i+=4)for(let c=0;c<3;c++)means[c]+=linearLUT[color.image.data[i+c]]/count;
 if(means.some(v=>v<=0||!Number.isFinite(v)))throw Error('Invalid fabric scan average');
 let clipped=0;
 for(let i=0;i<color.image.data.length;i+=4)for(let c=0;c<3;c++){
  const value=linearLUT[color.image.data[i+c]]/means[c]*fabricReflectance;if(value>1)clipped++;
  color.image.data[i+c]=Math.round(toSRGB(Math.min(1,value))*255);
 }
 let minimum=1,maximum=0;
 for(let i=0;i<rough.image.data.length;i+=4){
  const value=.86+.14*rough.image.data[i+1]/255,byte=Math.round(value*255);
  minimum=Math.min(minimum,byte/255);maximum=Math.max(maximum,byte/255);
  for(let c=0;c<3;c++)rough.image.data[i+c]=byte;
 }
 function texture(result,source,colorSpace,suffix){
  result.context.putImageData(result.image,0,0);const t=new T.CanvasTexture(result.canvas);
  t.name=source.name+'-'+suffix;t.colorSpace=colorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;
 }
 return {color:texture(color,colorSource,T.SRGBColorSpace,'neutral-weave'),rough:texture(rough,roughSource,T.NoColorSpace,'matte'),
  audit:{sourceMeanLinear:means,neutralReflectance:fabricReflectance,clippedChannelFraction:clipped/(count*3),roughnessRange:[minimum,maximum],method:'linear RGB mean neutralisation; roughness 0.86 + 0.14 × original; normals and scale unchanged'}};
}
