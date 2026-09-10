"""Diffuse SH pilot from the current model; no geometry changes or browser control."""
import ast, hashlib, json, math, sys, time
from pathlib import Path
import bpy
from mathutils import Vector

root=Path(__file__).resolve().parent
pipeline=root/'render-current-design-v2.py'
tree=ast.parse(pipeline.read_text(encoding='utf-8'),filename=str(pipeline))
# Reuse the renderer's exact scene preparation, excluding only its final image loop.
last=tree.body[-1]
if not isinstance(last,ast.For) or not isinstance(last.target,ast.Name) or last.target.id!='view':
    raise RuntimeError('Renderer preparation boundary changed')
tree.body=tree.body[:-1]
sys.argv=['blender','--','master-bed','32','8','living-probe-pilot','day','35']
ns={'__file__':str(pipeline),'__name__':'probe_scene_preparation'}
exec(compile(tree,str(pipeline),'exec'),ns)
scene=ns['scene'];camera=ns['camera'];camera_data=ns['camera_data']
scene.render.resolution_x=scene.render.resolution_y=24
scene.render.image_settings.file_format='OPEN_EXR';scene.render.image_settings.color_depth='32'
scene.render.image_settings.color_mode='RGB';scene.cycles.use_denoising=False
camera_data.type='PERSP';camera_data.lens=18;camera_data.sensor_width=36
camera_data.sensor_fit='HORIZONTAL';camera_data.shift_x=camera_data.shift_y=0
folder=root/'offline-render/living-probe-pilot';folder.mkdir(exist_ok=True)
output=folder/'irradiance.json'
if output.exists():raise RuntimeError('Preserve completed probe pilot; do not overwrite')
axes=[[7.25,10.7],[1.10,2.25],[.65,5.60]]
faces=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]
convert=ns['convert']
def sh(d):
    x,y,z=d
    return [.282095,.488603*y,.488603*z,.488603*x,1.092548*x*y,
        1.092548*y*z,.315392*(3*z*z-1),1.092548*x*z,.546274*(x*x-y*y)]
probes=[];started=time.monotonic();n=24
for z in axes[2]:
 for y in axes[1]:
  for x in axes[0]:
   position=[x,y,z];camera.location=convert(position);coeff=[[0.,0.,0.] for _ in range(9)];weight=0
   for face,forward in enumerate(faces):
    camera.rotation_euler=convert(forward).to_track_quat('-Z','Y').to_euler()
    bpy.context.view_layer.update();rotation=camera.matrix_world.to_3x3()
    filename=folder/f'probe-{len(probes)}-{face}.exr';scene.render.filepath=str(filename)
    bpy.ops.render.render(write_still=True)
    img=bpy.data.images.load(str(filename),check_existing=False);pixels=list(img.pixels)
    if len(pixels)!=n*n*4:raise RuntimeError('Unexpected cube face dimensions')
    for j in range(n):
     for i in range(n):
      a=2*(i+.5)/n-1;b=2*(j+.5)/n-1
      d=rotation@Vector((a,b,-1)).normalized();direction=(d.x,d.z,-d.y)
      solid=4/(n*n*(1+a*a+b*b)**1.5);weight+=solid;basis=sh(direction)
      for k in range(9):
       for c in range(3):coeff[k][c]+=pixels[(j*n+i)*4+c]*solid*basis[k]
    bpy.data.images.remove(img)
   normalise=4*math.pi/weight
   coeff=[[v*normalise for v in band] for band in coeff]
   if any(not math.isfinite(v) or abs(v)>1e5 for band in coeff for v in band):raise RuntimeError('Invalid SH capture')
   probes.append({'position':position,'coefficients':coeff,'solidAngle':weight})
   print('PROBE_COMPLETE',len(probes),position,'mean',coeff[0],flush=True)
result={'sourceSha256':ns['source_hash'],'rendererSha256':ns['pipeline_hash'],
 'bakerSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
 'axes':axes,'order':'x fastest, then y, then z','basis':'Three.js real SH radiance, y up',
 'faceSize':n,'samples':8,'daylightDensity':35,'probes':probes,'seconds':time.monotonic()-started,
 'limits':'Living-room diffuse pilot only; sparse static field, no visibility moments or dynamic GI. Not photographic or whole-home acceptance.'}
output.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print('PROBE_BATCH_COMPLETE',str(output),flush=True)
