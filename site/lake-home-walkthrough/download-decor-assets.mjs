import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const ids=['potted_plant_02','ceramic_vase_02','ceramic_vase_03'];
const root=path.resolve('assets/decor-polyhaven');
const records=[];
for(const id of ids){
 const request=await fetch(`https://api.polyhaven.com/files/${id}`);if(!request.ok)throw Error(`${id}: ${request.status}`);
 const files=await request.json(),gltf=files.gltf['1k'].gltf;
 const infoResponse=await fetch(`https://api.polyhaven.com/info/${id}`);if(!infoResponse.ok)throw Error('asset info failed');
 const info=await infoResponse.json();
 const entries=[[`${id}.gltf`,gltf],...Object.entries(gltf.include)];
 const directory=path.join(root,id);await fs.mkdir(directory,{recursive:true});
 await Promise.all(entries.map(async([relative,file])=>{
  const destination=path.resolve(directory,relative);
  if(!destination.startsWith(directory+path.sep)||!file.url.startsWith('https://dl.polyhaven.org/file/ph-assets/'))throw Error('Invalid asset path');
  await fs.mkdir(path.dirname(destination),{recursive:true});
  let bytes;try{bytes=await fs.readFile(destination);}catch{}
  if(!bytes||createHash('md5').update(bytes).digest('hex')!==file.md5){
   const response=await fetch(file.url,{signal:AbortSignal.timeout(60000)});if(!response.ok)throw Error(file.url+': '+response.status);
   bytes=Buffer.from(await response.arrayBuffer());
   if(createHash('md5').update(bytes).digest('hex')!==file.md5)throw Error('Asset digest mismatch');
   await fs.writeFile(destination,bytes);
  }
 }));
 records.push({id,name:info.name,authors:info.authors,source:`https://polyhaven.com/a/${id}`,license:'CC0',licenseUrl:'https://polyhaven.com/license',textureResolution:'1k',files:entries.map(([file,record])=>({file,bytes:record.size,md5:record.md5,url:record.url}))});
 console.log(id+': '+entries.length+' files verified');
}
await fs.writeFile(path.join(root,'sources.json'),JSON.stringify(records,null,2)+'\n','utf8');
