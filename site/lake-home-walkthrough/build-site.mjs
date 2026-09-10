// Assemble only the viewer's runtime dependency closure and explicitly retained galleries.
// --check is a read-only preflight; a real build refuses a partial current HD batch.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
const root=path.dirname(fileURLToPath(import.meta.url)),check=process.argv.includes('--check');
const read=p=>fs.readFileSync(path.join(root,p)),json=p=>JSON.parse(read(p));
const files=new Map(),safe=p=>{
 const normalized=path.posix.normalize(p.replaceAll('\\','/').replace(/^\.\//,''));
 assert.ok(!path.isAbsolute(normalized)&&!normalized.startsWith('../')&&!normalized.includes(':'),'Unsafe asset path '+p);
 assert.ok(path.resolve(root,normalized).startsWith(root+path.sep));return normalized;
};
function add(p,contents){p=safe(p);files.set(p,contents??read(p));}
const compiled=await build({absWorkingDir:root,entryPoints:['column-view.js','children-layouts.js'],bundle:true,write:false,outdir:'unused-build-output',metafile:true,logLevel:'silent',platform:'browser',format:'esm'});
for(const p of Object.keys(compiled.metafile.inputs)){
 assert.ok(!p.startsWith('node_modules/'),'Runtime must use the existing self-contained vendor modules');add(p.split(/[?#]/)[0]);
}
for(const name of ['column-view.html','mobile-preview.html','column-check.html','children-layouts.html','source-window-check.svg'])add(name);
for(const name of ['column-view.css','mobile-view.css','continuous-walk.css','lighting-controls.css','children-layouts.css','curtain-controls.css','hvac-controls.css','tile-controls.css','viewer-focus-ui.css'])add(name);
for(const name of ['source-dimension-audit.json','source-opening-schedule.json','child-current-layout-audit.json'])add(name);
function directory(dir){for(const item of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){assert.ok(!item.isSymbolicLink(),'Asset symlinks are not followed');const p=dir+'/'+item.name;if(item.isDirectory())directory(p);else if(item.isFile()&&!p.endsWith('.exr')&&!p.endsWith('-raw.hdr'))add(p);}}
directory('assets');
add('offline-render/home-facilities-packed.glb');
const gallery=read('render-gallery.js').toString('utf8');
const manifestPaths=[...gallery.matchAll(/['"]\.\/(offline-render\/[a-z0-9-]+\.json)['"]/g)].map(m=>m[1]);
assert.equal(new Set(manifestPaths).size,5,'Expected all five existing gallery batches');
for(const p of manifestPaths){
 const m=json(p);assert.ok(Array.isArray(m.renders));
 const published={sourceSha256:m.sourceSha256,cameraSha256:m.cameraSha256,pipelineSha256:m.pipelineSha256,limits:m.limits,renders:m.renders.map(r=>({id:r.id,file:r.file,width:r.width,height:r.height,samples:r.samples,camera:r.camera}))};
 add(p,Buffer.from(JSON.stringify(published)));
 for(const r of m.renders){assert.match(r.file,/^[a-z0-9-]+\.png$/);add('offline-render/'+r.file);}
}
for(const m of gallery.matchAll(/file:'([a-z0-9-]+\.png)'/g))add('offline-render/'+m[1]);
const current=json('offline-render/whole-current-hd-v1-detail-renders.json');
const ids=['entry','living','dining','bar','kitchen','bed1','bed3','master','bath1','bath2','laundry','care'];
const digest=p=>crypto.createHash('sha256').update(read(p)).digest('hex');
assert.equal(current.sourceSha256,digest('offline-render/mobile-current.glb'));
assert.equal(current.cameraSha256,digest('offline-render/mobile-current-cameras.json'));
assert.equal(current.pipelineSha256,digest('render-mobile-detail.py'));
const complete=ids.every(id=>current.renders.filter(r=>r.id===id).length===1)&&current.renders.length===ids.length;
for(const r of current.renders){const bytes=files.get('offline-render/'+r.file);assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16),1920);assert.equal(bytes.readUInt32BE(20),r.height);}
// Public root enters the current responsive viewer; the original local index is untouched.
add('index.html',Buffer.from('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>湖畔 · 全屋三维预览</title><a href="column-view.html">进入全屋三维预览</a><script>location.replace("column-view.html"+location.search+location.hash)</script></html>'));
// Statically referenced local HTML/CSS resources must all be present in the assembly.
for(const [name,bytes] of files){
 if(!/\.(html|css|svg)$/.test(name))continue;
 const text=bytes.toString('utf8');
 for(const match of text.matchAll(/(?:src|href)=["']([^"']+)["']|url\(["']?([^)'"\s]+)["']?\)/g)){
  const ref=(match[1]||match[2]).split(/[?#]/)[0];if(!ref||/^(data:|https?:|blob:)/.test(ref))continue;
  const target=safe(path.posix.join(path.posix.dirname(name),ref));assert.ok(files.has(target),'Missing linked asset '+name+' -> '+target);
 }
}
const listing=[...files].map(([name,bytes])=>({name,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')}));
// Conservative static-asset budget; exact Sites archive acceptance is checked at hosting.
assert.ok(listing.every(f=>f.bytes<25*1024*1024),'A public asset exceeds the 25MiB preflight budget');
const report={currentImages:current.renders.length,complete,files:listing.length,bytes:listing.reduce((n,f)=>n+f.bytes,0),largest:listing.toSorted((a,b)=>b.bytes-a.bytes).slice(0,3),published:false};
export {files,report};
if(path.resolve(process.argv[1]||'')===fileURLToPath(import.meta.url)){
if(check){console.log(JSON.stringify(report));}else{
 assert.ok(complete,'Current HD batch is incomplete; refusing to create a release directory');
 const destination=path.join(root,'dist');assert.ok(!fs.existsSync(destination),'dist already exists; preserve/review the prior build before replacing it');
 fs.mkdirSync(destination);
 for(const [p,bytes] of files){const target=path.join(destination,p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);}
 fs.writeFileSync(path.join(root,'site-build-verification.json'),JSON.stringify({...report,listing},null,2));console.log(JSON.stringify(report));
}
}
