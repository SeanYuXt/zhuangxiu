// Shared by the live scene and the exported-model viewer.
export function setDoorLeafOpen(group,open){
 setDoorLeafFraction(group,open?1:0);
}
export function setDoorLeafFraction(group,fraction){
 const t=Math.min(1,Math.max(0,fraction));group.userData.open=t>.5;
 if(group.userData.motion==='bifold'){
  const first=group.getObjectByName(group.userData.foldFirst),second=group.getObjectByName(group.userData.foldSecond),angle=t*group.userData.foldAngle;
  if(!first||!second)throw Error('Missing bifold door leaves');
  group.rotation.set(0,0,0);first.rotation.y=-angle;second.rotation.y=angle*2;return;
 }
 // A GLB quaternion can decompose to X=PI/Z=PI; reset the whole Euler basis.
 group.rotation.set(0,group.userData.base+group.userData.turn*Math.PI/2*t,0);
}
