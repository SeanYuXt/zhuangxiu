import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const dir=new URL('./assets/',import.meta.url);await fs.mkdir(dir,{recursive:true});
const requested=new Set(process.argv.slice(2));
const jobs=[['fine_grained_wood','Diffuse','wood-color.jpg'],['fine_grained_wood','nor_gl','wood-normal.jpg'],['fine_grained_wood','Rough','wood-rough.jpg'],['marble_rock_01','Diffuse','stone-color.jpg'],['marble_rock_01','nor_gl','stone-normal.jpg'],['fabric_pattern_07','nor_gl','fabric-normal.jpg'],['lakeside','hdri','lake.hdr'],...['terlenka','cotton_jersey','white_oak_veneer'].flatMap(id=>[['Diffuse','color'],['nor_gl','normal'],['Rough','rough']].map(([kind,suffix])=>[id,kind,id+'-'+suffix+'.jpg']))].filter(job=>!requested.size||requested.has(job[0]));
if([...requested].some(id=>id!=='throw_pillows_01'&&!jobs.some(job=>job[0]===id)))throw Error('Unknown requested asset');
for(const [id,kind,name] of jobs){const response=await fetch('https://api.polyhaven.com/files/'+id);if(!response.ok)throw Error(response.status+' '+id);const data=await response.json(),file=data[kind][kind==='hdri'?'2k':'1k'][kind==='hdri'?'hdr':'jpg'];let buffer;try{buffer=await fs.readFile(new URL(name,dir));}catch{}if(!buffer||crypto.createHash('md5').update(buffer).digest('hex')!==file.md5){const r=await fetch(file.url);if(!r.ok)throw Error(r.status+' '+name);buffer=Buffer.from(await r.arrayBuffer());if(crypto.createHash('md5').update(buffer).digest('hex')!==file.md5)throw Error('Checksum '+name);await fs.writeFile(new URL(name,dir),buffer);}console.log(name,buffer.length);}
if(!requested.size||requested.has('throw_pillows_01')){
const pillowResponse=await fetch('https://api.polyhaven.com/files/throw_pillows_01');if(!pillowResponse.ok)throw Error(pillowResponse.status+' pillows');
const pillow=(await pillowResponse.json()).gltf['1k'].gltf;
for(const [name,file] of Object.entries({'throw_pillows_01.gltf':pillow,...pillow.include})){
 if(!/^(textures\/)?[a-zA-Z0-9_.-]+$/.test(name))throw Error('Unsafe asset path');const path=new URL('throw-pillows/'+name,dir);await fs.mkdir(new URL('./',path),{recursive:true});let buffer;try{buffer=await fs.readFile(path);}catch{}
 if(!buffer||crypto.createHash('md5').update(buffer).digest('hex')!==file.md5){const r=await fetch(file.url);if(!r.ok)throw Error(r.status+' '+name);buffer=Buffer.from(await r.arrayBuffer());if(crypto.createHash('md5').update(buffer).digest('hex')!==file.md5)throw Error('Checksum '+name);await fs.writeFile(path,buffer);}console.log('pillow/'+name,buffer.length);
}
}
