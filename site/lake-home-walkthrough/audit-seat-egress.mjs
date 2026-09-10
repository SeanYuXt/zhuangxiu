import fs from 'node:fs';
import {auditSeatEgress} from './seat-egress.js';
const source=JSON.parse(fs.readFileSync(new URL('./living-revision-audit.json',import.meta.url),'utf8'));
const rect=o=>({name:o.name,x1:o.min[0],x2:o.max[0],z1:o.min[2],z2:o.max[2]});
const obstacles=source.objects.filter(o=>!o.name.startsWith('master')&&o.name!=='laundry-washer').map(rect);
const results=[];
for(const mode of ['stand','pulled'])for(let active=0;active<6;active++){
 const seats=source.seats.map((s,i)=>{const r=rect(s),axis=s.kind==='bar'?'z':'x',travel=mode==='pulled'||i===active?.45:.05;r[axis+'1']+=travel;r[axis+'2']+=travel;return {...r,axis};});
 const result=auditSeatEgress({obstacles,seats,active,bounds:{x1:5.92,x2:12.03,z1:.2,z2:7.17},entry:[8.32,5.85]});results.push({mode,...result});
}
fs.writeFileSync(new URL('./seat-egress-audit.json',import.meta.url),JSON.stringify({source:'fresh living-revision-audit.json, actual mesh AABBs',results},null,2));
console.log(JSON.stringify(results.map(({mode,seat,reached,standing,visited})=>({mode,seat,reached,standing,visited}))));
