// Read-only translation study; does not move any viewer geometry or plumbing.
const fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/verify-living-revision.cjs','utf8');
const route=Function(source.slice(source.indexOf('function route('),source.indexOf('const rect='))+';return route;')();
const audit=JSON.parse(fs.readFileSync(__dirname+'/living-revision-audit.json','utf8'));
const rect=o=>({name:o.name,x1:o.min[0],x2:o.max[0],z1:o.min[2],z2:o.max[2]});
const seats=audit.seats.map(s=>{const x=(s.min[0]+s.max[0])/2,z=(s.min[2]+s.max[2])/2+(s.kind==='bar'||s.index===1?.45:-.45);return {name:s.name,x1:x-.30,x2:x+.30,z1:z-.325,z2:z+.325};});
for(const shift of [-.55,-.45,-.35,-.20,0,.25,.55]){
 const base=audit.objects.filter(x=>!x.name.startsWith('master')).map(rect);
 const laundry=base.find(o=>o.name==='balcony-laundry-cabinet');laundry.z1+=shift;laundry.z2+=shift;
 const overlaps=base.filter(b=>b!==laundry&&Math.min(b.x2,laundry.x2)-Math.max(b.x1,laundry.x1)>.001&&Math.min(b.z2,laundry.z2)-Math.max(b.z1,laundry.z1)>.001).map(b=>b.name);
 const points=[];for(let x=10.4;x<=10.85+1e-6;x+=.025)for(let z=.95+shift;z<=1.25+shift+1e-6;z+=.025)points.push([x,z]);
 const probes=[];for(const z of [.89,1.31])for(const diameter of [.6,.7])probes.push({hingeZ:z+shift,diameter,...route([...base,...seats,{x1:10.81,x2:11.34,z1:z+shift,z2:z+.05+shift}],diameter,points)});
 console.log(JSON.stringify({shift,overlaps,cabinet:laundry,probes}));
}
