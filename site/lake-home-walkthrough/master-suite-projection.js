import * as T from './vendor/three.module.js';
export function projectionAudit(s){
 const p=s.design.projection,c=s.furniture.footCabinet.r,err=[];
 const bottom=p.top-p.blackDrop-p.imageHeight-p.bottomBorder;
 if(p.housing.base+p.housing.height>s.ceiling)err.push('幕盒超顶');
 if(p.housing.r[3]>=c[1])err.push('幕盒与柜体重叠');
 if(p.planeZ+.015>=c[1])err.push('幕布触碰柜门');
 if(p.wash.r[3]>=p.housing.r[1])err.push('灯槽与幕盒重叠');
 if(p.centerX-p.sheetWidth/2<c[0]||p.centerX+p.sheetWidth/2>c[2])err.push('幕面超出闭柜范围');
 return{ok:!err.length,errors:err,screenBottom:bottom,imageBottom:bottom+p.bottomBorder,
 cabinetSetback:c[1]-p.planeZ,upperBodyGap:p.planeZ-.015-s.furniture.bed.r[3],
 imageDiagonal:Math.hypot(p.imageWidth,p.imageHeight)/.0254,throwRatio:p.lensDistance.map(d=>d/p.imageWidth)};
}
export function projectionOverlay(s,down){
 const p=s.design.projection,r=p.housing.r;
 return `<g><rect x="${r[0]*100}" y="${r[1]*100}" width="${(r[2]-r[0])*100}" height="${(r[3]-r[1])*100}" fill="none" stroke="#8a7c69" stroke-dasharray="3 3"/>${down?`<line x1="${(p.centerX-p.sheetWidth/2)*100}" y1="${p.planeZ*100}" x2="${(p.centerX+p.sheetWidth/2)*100}" y2="${p.planeZ*100}" stroke="#4e5b60" stroke-width="3"/>`:''}</g>`;
}
export function mountProjection({s,scene,box,M,white,metal}){
 const p=s.design.projection,g=new T.Group();g.name='projection-system';scene.add(g);
 const housing=box('motor-screen-housing',p.housing.r,p.housing.base,p.housing.height,M('#eeeae0'),g,.004);
 box('screen-housing-slot',[p.centerX-.94,2.588,p.centerX+.94,2.614],2.458,.004,M('#565650'),g);
 const sheet=new T.Mesh(new T.PlaneGeometry(p.sheetWidth,1),new T.MeshBasicMaterial({color:'#282b2c',side:T.DoubleSide}));sheet.name='descending-screen-fabric';sheet.rotation.y=Math.PI;g.add(sheet);
 const imgCanvas=document.createElement('canvas');imgCanvas.width=1280;imgCanvas.height=720;
 const ctx=imgCanvas.getContext('2d'),sky=ctx.createLinearGradient(0,0,0,720);sky.addColorStop(0,'#9fb8c1');sky.addColorStop(.65,'#e7d3b3');sky.addColorStop(1,'#849f9b');ctx.fillStyle=sky;ctx.fillRect(0,0,1280,720);
 ctx.fillStyle='#eee1be';ctx.beginPath();ctx.arc(900,230,60,0,Math.PI*2);ctx.fill();
 for(const [y,col,amp]of[[405,'#879a99',75],[480,'#657d7a',58],[570,'#415f60',35]]){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,720);for(let x=0;x<=1280;x+=8)ctx.lineTo(x,y+Math.sin(x/170)*amp+Math.sin(x/65)*amp*.18);ctx.lineTo(1280,720);ctx.closePath();ctx.fill();}
 ctx.fillStyle='#f4f1e7';ctx.font='24px Microsoft YaHei';ctx.fillText('幕面画面示意 · 非实际投影效果',34,674);
 const tex=new T.CanvasTexture(imgCanvas);tex.colorSpace=T.SRGBColorSpace;
 const picture=new T.Mesh(new T.PlaneGeometry(p.imageWidth,p.imageHeight),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));picture.name='screen-image-preview';picture.rotation.y=Math.PI;picture.position.set(p.centerX,p.top-p.blackDrop-p.imageHeight/2,p.planeZ-.001);g.add(picture);
 const bar=box('screen-bottom-bar',[p.centerX-p.sheetWidth/2-.015,p.planeZ-.015,p.centerX+p.sheetWidth/2+.015,p.planeZ+.015],0,.025,white,g,.01);
 const wash=new T.Group();wash.name='cabinet-wash-light';g.add(wash);
 box('cabinet-light-profile',p.wash.r,p.wash.base,p.wash.height,white,wash,.006);
 box('cabinet-light-diffuser',[p.wash.r[0]+.015,p.wash.r[1]+.004,p.wash.r[2]-.015,p.wash.r[3]-.004],p.wash.base-.004,.005,new T.MeshBasicMaterial({color:'#fff0cd'}),wash);
 for(let i=0;i<7;i++){const x=p.wash.r[0]+.12+i*(p.wash.r[2]-p.wash.r[0]-.24)/6,light=new T.SpotLight('#fff0d9',.34,3,.55,1,1.7);light.position.set(x,2.53,2.45);const aim=new T.Object3D();aim.position.set(x,1.3,2.72);wash.add(aim);light.target=aim;wash.add(light);}
 let progress=0,target=0,last=performance.now(),wantLight=true;
 const total=p.blackDrop+p.imageHeight+p.bottomBorder;
 function tick(now){const dt=Math.min((now-last)/1000,.08);last=now;progress+=Math.sign(target-progress)*Math.min(Math.abs(target-progress),dt/1.2);
 const h=Math.max(.001,progress*total);sheet.scale.y=h;sheet.position.set(p.centerX,p.top-h/2,p.planeZ);sheet.visible=progress>.001;
 // Reveal only the unrolled portion of the image without stretching the source picture.
 const revealed=Math.max(0,Math.min(p.imageHeight,h-p.blackDrop));picture.visible=revealed>.001;
 if(picture.visible){picture.scale.y=revealed/p.imageHeight;picture.position.y=p.top-p.blackDrop-revealed/2;tex.repeat.y=revealed/p.imageHeight;tex.offset.y=1-tex.repeat.y;}
 bar.position.y=p.top-h;bar.visible=progress>.001;wash.visible=wantLight&&progress<.001;g.userData.progress=progress;
 }
 tick(last);
 return{audit:projectionAudit(s),update({lower,light}){target=lower?1:0;wantLight=light;},tick,get lowered(){return progress>.001;},get progress(){return progress;}};
}
