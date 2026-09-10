import assert from 'node:assert/strict';
import * as T from './vendor/three.module.js';
import {sampleProbeIrradiance} from './living-probe-pilot.js';
const coeff=Array.from({length:9},(_,i)=>[.2+i*.013,.3-i*.006,.15+i*.02]);
const data={axes:[[0,1],[0,1],[0,1]],probes:Array.from({length:8},()=>({coefficients:coeff}))};
const sh=new T.SphericalHarmonics3();coeff.forEach((v,i)=>sh.coefficients[i].fromArray(v));
for(const vector of [[1,0,0],[0,1,0],[0,0,1],[-1,0,0],[.3,-.4,.5]]){
 const n=new T.Vector3(...vector).normalize(),expected=sh.getIrradianceAt(n,new T.Vector3()).toArray().map(v=>Math.max(0,v));
 const actual=sampleProbeIrradiance(data,[.3,.7,.2],n.toArray());actual.forEach((v,i)=>assert.ok(Math.abs(v-expected[i])<1e-6));
}
const constant={axes:data.axes,probes:Array.from({length:8},()=>({coefficients:[[Math.sqrt(4*Math.PI),Math.sqrt(4*Math.PI),Math.sqrt(4*Math.PI)],...Array.from({length:8},()=>[0,0,0])]}))};
for(const v of sampleProbeIrradiance(constant,[.5,.5,.5],[0,1,0]))assert.ok(Math.abs(v-Math.PI)<1e-5,'Unit isotropic radiance must integrate to pi irradiance');
console.log('PASS: SH basis agrees with Three, isotropic integral = pi, constant field interpolation stable.');
