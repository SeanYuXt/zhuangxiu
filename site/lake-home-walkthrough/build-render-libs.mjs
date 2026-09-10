import {build} from 'esbuild';
await build({entryPoints:['render-libs-entry.js'],outfile:'vendor/render-libs.js',bundle:true,format:'esm',minify:false,plugins:[{name:'shared-three',setup(b){b.onResolve({filter:/^three$/},()=>({path:'./three.module.js',external:true}));}}]});
