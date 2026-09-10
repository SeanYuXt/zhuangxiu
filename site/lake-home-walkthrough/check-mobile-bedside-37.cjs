const fs=require('node:fs');
let code=fs.readFileSync(__dirname+'/check-headwall-36.cjs','utf8').replaceAll('headwall-36','mobile-bedside-37');
code=code.replace("assert.equal(a.details.stowedRoute.ok,true);",`assert.equal(a.details.stowedRoute.ok,true);
 assert.equal(a.s.furniture.nightstand,undefined);
 assert.equal(a.s.furniture.rightTable.mounting,'freestanding');
 assert.deepEqual(a.s.furniture.rightTable.r,[4.74,.08,5.14,.48]);
 assert.deepEqual(await page.evaluate(()=>['reading-light-base','reading-light-head','bedside-task-light','head-painted-ground','head-painted-arc','nightstand','rightTable-wall-support'].filter(n=>masterPlumbing.scene.getObjectByName(n))),[]);
 assert.equal(await page.evaluate(()=>!!masterPlumbing.scene.getObjectByName('mobile-bedside-carcass')),true);`);
new Function('require',code)(require);
