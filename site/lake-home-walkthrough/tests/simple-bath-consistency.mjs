import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {mountSimpleBath} from '../master-simple-bath.js';
const scene=new T.Scene(),bath=mountSimpleBath({scene});
function positions(){scene.updateMatrixWorld(true);const result=[];bath.group.traverse(o=>{if(o.isMesh)result.push([...o.matrixWorld.elements]);});return result;}
const baseline=positions();
for(const view of ['bath','bathTop','whole','top','wash','shower','toilet','entry','vanity']){
 bath.update({view});bath.tick();assert.deepEqual(positions(),baseline,view+' changes fixture coordinates');
}
assert.equal(scene.children.length,1);
assert.equal(bath.group.name,'simple-pdf-bath');
const source=await import('node:fs/promises');
const main=await source.readFile(new URL('../master-window-ac-option.js',import.meta.url),'utf8');
assert.ok(!main.includes('mountHotelBath'));
assert.ok(!main.includes("location.assign('bath-full"));
console.log('PASS: 9 views preserve all fixture transforms; suite mounts only shared current bathroom.');
