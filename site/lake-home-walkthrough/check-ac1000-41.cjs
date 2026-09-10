const fs=require('node:fs');
let code=fs.readFileSync(__dirname+'/check-vanity115-40.cjs','utf8').replaceAll('vanity115-40','ac1000-41');
code=code.replace("assert.deepEqual(a.s.design.equipment.ac,baseline.ac);",`assert.deepEqual(a.s.design.equipment.ac.r,[4.275,3.13,5.275,3.38]);
 assert.equal(a.s.design.equipment.ac.service.status,'unverified-expanded');
 assert.equal(a.equipment.installationVerified,false);
 assert.equal(a.equipment.serviceWarnings.length,2);
 assert.ok((await page.locator('#audit').textContent()).includes('空调拆洗候选范围碰到footCabinet'));
 assert.ok((await page.locator('#metrics').textContent()).includes('各7.5cm'));`);
new Function('require',code)(require);
