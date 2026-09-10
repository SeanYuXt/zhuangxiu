// One-shot localhost artifact receiver. Not a website/deployment dependency.
// Only the existing local viewer origin can send these two fixed artifacts.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {packGlb}=require('./pack-glb-images.cjs');
const origin='http://127.0.0.1:8768',done=new Set(),pending=new Set();
const files={'/scene':'current-design-v2.glb','/cameras':'current-design-v2-cameras.json'};
for(const [route,file] of Object.entries(files))if(fs.existsSync(path.join(__dirname,'offline-render',file))){
 if(route!=='/cameras')throw Error('Refusing to replace existing render source: '+file);
 const meta=JSON.parse(fs.readFileSync(path.join(__dirname,'offline-render',file),'utf8'));
 if(!meta.targets||!Array.isArray(meta.viewpoints)||!meta.column)throw Error('Invalid previous camera receipt');
 done.add(route);
}
const server=http.createServer(async(req,res)=>{
 if(req.headers.host!=='127.0.0.1:8770'||req.headers.origin!==origin){res.writeHead(403);return res.end();}
 res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');
 if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','POST');res.setHeader('Access-Control-Allow-Headers','Content-Type,X-Render-Export');res.writeHead(204);return res.end();}
 if(req.method!=='POST'||!files[req.url]||req.headers['x-render-export']!=='current-design-v2'){res.writeHead(404);return res.end();}
 if(done.has(req.url)||pending.has(req.url)){res.writeHead(409);return res.end();}
 pending.add(req.url);
 try{
  const chunks=[];let length=0;const limit=req.url==='/scene'?1024*1024*1024:2*1024*1024;
  for await(const chunk of req){length+=chunk.length;if(length>limit)throw Error('Artifact exceeds limit');chunks.push(chunk);}
  let bytes=Buffer.concat(chunks),report;
  if(req.url==='/scene'){const packed=packGlb(bytes);bytes=packed.bytes;report=packed.report;}
  else{const meta=JSON.parse(bytes.toString('utf8'));if(!meta.targets||!Array.isArray(meta.viewpoints)||!meta.column)throw Error('Missing camera metadata');report={viewpoints:meta.viewpoints.length};}
  const file=files[req.url];fs.writeFileSync(path.join(__dirname,'offline-render',file),bytes,{flag:'wx'});done.add(req.url);
  res.setHeader('Content-Type','application/json');res.end(JSON.stringify({file,bytes:bytes.length,...report}));console.log(JSON.stringify({saved:file,bytes:bytes.length,...report}));
  if(done.size===2)server.close();
 }catch(e){res.writeHead(400);res.end(JSON.stringify({error:e.message}));console.error(e.message);}
 finally{pending.delete(req.url);}
});
server.listen(8770,'127.0.0.1',()=>console.log('Render receiver listening on localhost:8770; exits after both artifacts.'));
