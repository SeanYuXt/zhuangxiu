// Lossless GLB packing. Deduplicate byte payloads and identical embedded images;
// preserve geometry/accessors/materials, image bytes, colour spaces and samplers.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function readGlb(bytes){
 assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);
 const n=bytes.readUInt32LE(12);assert.equal(bytes.readUInt32LE(16),0x4e4f534a);assert.equal(bytes.readUInt32LE(24+n),0x004e4942);
 return {json:JSON.parse(bytes.subarray(20,20+n).toString('utf8')),bin:bytes.subarray(28+n,28+n+bytes.readUInt32LE(20+n))};
}
function packGlb(bytes){
 const original=readGlb(bytes),j=structuredClone(original.json);
 assert.equal(j.buffers.length,1,'Only embedded single-buffer GLBs supported');assert.ok(!j.buffers[0].uri);
 const payload=v=>original.bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength);
 const imageKeys=new Map(),imageMap=[],images=[];
 for(const i of j.images||[]){
  assert.ok(Number.isInteger(i.bufferView)&&!i.uri,'Expected embedded image');
  // Name and extensions are retained: do not merge non-identical image metadata.
  const metadata={...i};delete metadata.bufferView;
  const key=JSON.stringify(metadata)+'|'+hash(payload(j.bufferViews[i.bufferView]));
  if(!imageKeys.has(key)){imageKeys.set(key,images.length);images.push(i);}
  imageMap.push(imageKeys.get(key));
 }
 for(const t of j.textures||[]){
  if(Number.isInteger(t.source))t.source=imageMap[t.source];
  for(const [name,e] of Object.entries(t.extensions||{})){
   assert.ok(['KHR_texture_basisu','EXT_texture_webp','EXT_texture_avif'].includes(name),'Unknown texture extension: '+name);
   if(Number.isInteger(e.source))e.source=imageMap[e.source];
  }
 }
 j.images=images;
 const chunks=[],payloads=new Map();let length=0;
 for(const v of j.bufferViews){
  assert.equal(v.buffer??0,0);assert.ok(!v.extensions,'Cannot relocate extension-specific buffer offsets');
  const raw=payload(v),key=hash(raw);
  assert.equal(raw.length,v.byteLength,'Invalid original buffer view');
  if(!payloads.has(key)){payloads.set(key,length);chunks.push(raw);length+=raw.length;const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}}
  v.byteOffset=payloads.get(key);
 }
 j.buffers[0].byteLength=length;
 const json=Buffer.from(JSON.stringify(j)),jsonPad=Buffer.alloc((4-json.length%4)%4,0x20),bin=Buffer.concat(chunks),header=Buffer.alloc(20),binHeader=Buffer.alloc(8);
 header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+jsonPad.length+bin.length,8);header.writeUInt32LE(json.length+jsonPad.length,12);header.writeUInt32LE(0x4e4f534a,16);binHeader.writeUInt32LE(bin.length,0);binHeader.writeUInt32LE(0x004e4942,4);
 const output=Buffer.concat([header,json,jsonPad,binHeader,bin]),check=readGlb(output);
 // Exact round-trip check for every original geometry/image/animation payload.
 for(let i=0;i<j.bufferViews.length;i++){const v=check.json.bufferViews[i];assert.ok(payload(original.json.bufferViews[i]).equals(check.bin.subarray(v.byteOffset,v.byteOffset+v.byteLength)),'Changed buffer view '+i);}
 for(const key of Object.keys(original.json).filter(k=>!['buffers','bufferViews','images','textures'].includes(k)))assert.deepEqual(check.json[key],original.json[key],key+' changed');
 for(let n=0;n<(original.json.textures||[]).length;n++){
  const expected=structuredClone(original.json.textures[n]);if(Number.isInteger(expected.source))expected.source=imageMap[expected.source];for(const e of Object.values(expected.extensions||{}))if(Number.isInteger(e.source))e.source=imageMap[e.source];assert.deepEqual(check.json.textures[n],expected);
 }
 return {bytes:output,report:{originalBytes:bytes.length,packedBytes:output.length,originalImages:original.json.images?.length||0,packedImages:images.length,verifiedBufferViews:j.bufferViews.length,geometryAndMaterialDefinitionsUnchanged:true,sha256:hash(output)}};
}
module.exports={packGlb,readGlb};
if(require.main===module){const [input,output]=process.argv.slice(2);assert.ok(input&&output,'Usage: node pack-glb-images.cjs input.glb output.glb');const result=packGlb(fs.readFileSync(input));fs.writeFileSync(output,result.bytes);console.log(JSON.stringify(result.report));}
