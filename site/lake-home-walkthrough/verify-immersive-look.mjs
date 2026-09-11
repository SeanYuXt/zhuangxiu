import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from './vendor/three.module.js';
import {createImmersiveLook} from './immersive-look.js';

// Unit fixtures exercise pointer bookkeeping and convergence without a GPU.
function fixture(){
 globalThis.window=new EventTarget();globalThis.document=new EventTarget();
 document.querySelector=()=>null;document.hidden=false;document.pointerLockElement=null;
 globalThis.matchMedia=()=>({matches:false});globalThis.MutationObserver=class{observe(){}};
 const canvas=new EventTarget(),capture=new Set();canvas.style={};canvas.clientHeight=600;canvas.focus=()=>{};
 canvas.setPointerCapture=id=>capture.add(id);canvas.hasPointerCapture=id=>capture.has(id);canvas.releasePointerCapture=id=>capture.delete(id);
 const camera=new T.PerspectiveCamera(70,1,.03,150);camera.rotation.order='YXZ';
 let enabled=true,changes=0;
 const look=createImmersiveLook({canvas,camera,enabled:()=>enabled,changed:()=>changes++,activity:()=>{}});
 const emit=(type,props={})=>{const e=new Event(type,{cancelable:true});Object.assign(e,{pointerId:1,pointerType:'mouse',button:0,clientX:0,clientY:0,...props});canvas.dispatchEvent(e);};
 const settle=()=>{for(let i=0;i<180;i++)look.step(1/60);};
 return {look,camera,emit,settle,disable:()=>enabled=false,get changes(){return changes;}};
}
test('drag converges exactly and stops rendering after release',()=>{
 const f=fixture();f.emit('pointerdown');f.emit('pointermove',{clientX:100,clientY:50});
 assert.equal(f.camera.rotation.y,0,'event handler must not jump the camera');
 f.look.step(1/60);assert.ok(f.camera.rotation.y<0&&f.camera.rotation.y>-.24);
 f.emit('pointerup');f.settle();assert.ok(Math.abs(f.camera.rotation.y+.24)<1e-8);
 assert.equal(f.look.state.pointers,0);assert.equal(f.look.state.pending,false);
 const count=f.changes;f.look.step(1/60);assert.equal(f.changes,count);
});
test('pinch then single-finger continuation does not jump',()=>{
 const f=fixture();f.emit('pointerdown',{pointerType:'touch'});
 f.emit('pointerdown',{pointerType:'touch',pointerId:2,clientX:100});
 f.emit('pointermove',{pointerType:'touch',pointerId:2,clientX:200});f.settle();
 assert.equal(f.camera.fov,38);assert.equal(f.camera.rotation.y,0);
 f.emit('pointerup',{pointerId:2});f.emit('pointermove',{clientX:10});f.settle();
 assert.ok(Math.abs(f.camera.rotation.y+10*.0024*38/70)<1e-8);
 f.emit('pointercancel');assert.equal(f.look.state.pointers,0);
});
test('wheel line units match pixel units and FOV stays bounded',()=>{
 const a=fixture();a.emit('wheel',{deltaY:1,deltaMode:1});a.settle();
 const b=fixture();b.emit('wheel',{deltaY:16,deltaMode:0});b.settle();assert.equal(a.camera.fov,b.camera.fov);
 for(let i=0;i<30;i++)b.emit('wheel',{deltaY:10000,deltaMode:0});b.settle();assert.equal(b.camera.fov,88);
 for(let i=0;i<30;i++)b.emit('wheel',{deltaY:-10000,deltaMode:0});b.settle();assert.equal(b.camera.fov,38);
});
test('blur cancels drag, right click and disabled modes do not rotate',()=>{
 const f=fixture();f.emit('pointerdown',{button:2});assert.equal(f.look.state.pointers,0);
 f.emit('pointerdown');f.emit('pointermove',{clientX:100});window.dispatchEvent(new Event('blur'));
 assert.equal(f.look.state.pointers,0);assert.equal(f.look.state.pending,false);
 f.disable();f.emit('pointerdown');f.emit('pointermove',{clientX:500});f.settle();assert.equal(f.camera.rotation.y,0);
});
test('vertical look clamps and a new view starts from its own camera',()=>{
 const f=fixture();f.emit('pointerdown');f.emit('pointermove',{clientY:100000});f.emit('pointerup');f.settle();
 assert.equal(f.camera.rotation.x,-1.35);f.look.clear();f.camera.rotation.set(.2,1,0,'YXZ');
 f.emit('pointerdown');f.emit('pointermove',{clientX:10});f.emit('pointerup');f.settle();
 assert.ok(Math.abs(f.camera.rotation.y-.976)<1e-8);assert.equal(f.camera.rotation.x,.2);
});
