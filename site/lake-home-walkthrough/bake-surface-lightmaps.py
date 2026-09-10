"""Bake the current fixed shell, reusing the frozen renderer's lighting setup.

Does not modify render-mobile-detail.py, its camera file, the live model, or
the in-flight photographic batch. The independent source includes secondary UVs.
"""
import bpy, json, hashlib, sys, time, argparse, re
from pathlib import Path
import numpy as np

root=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--pilot-atlas',type=int,choices=range(5))
parser.add_argument('--samples',type=int,default=24)
parser.add_argument('--output',default='surface-lighting-v2')
options=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
if not re.fullmatch(r'[a-z0-9-]+',options.output) or not 1<=options.samples<=512: raise ValueError('Invalid batch name or sample count')
key=options.output
source_key='surface-lighting-v2'
source_path=root/'offline-render'/f'{source_key}.glb'
metadata=json.loads((root/'offline-render'/f'{source_key}-receivers.json').read_text(encoding='utf-8'))
source_hash=hashlib.sha256(source_path.read_bytes()).hexdigest()
if metadata['sourceSha256']!=source_hash: raise RuntimeError('Surface source and receiver metadata differ')
output=root/('offline-render' if options.pilot_atlas is not None else 'assets')/key
if output.exists(): raise RuntimeError('Preserve existing lightmap output; explicit new batch required')
renderer=root/'render-mobile-detail.py'
original=renderer.read_text(encoding='utf-8')
marker="\ncamera_data=bpy.data.cameras.new('Detail camera')"
if original.count(marker)!=1: raise RuntimeError('Frozen lighting setup boundary changed')
setup=original.split(marker)[0]
source_line="source=root/('offline-render/daylight-bake-source.glb' if bake_walls else 'offline-render/mobile-current.glb')"
if setup.count(source_line)!=1: raise RuntimeError('Frozen source assignment changed')
setup=setup.replace(source_line,"source=root/'offline-render/surface-lighting-v2.glb'")
sys.argv=[str(renderer),'--','entry','2048',str(options.samples),key,'day','45']
context={'__file__':str(renderer),'__name__':'surface_lighting_setup'}
exec(compile(setup,str(renderer),'exec'),context)
scene=bpy.context.scene
scene.render.bake.use_pass_direct=True
scene.render.bake.use_pass_indirect=True
scene.render.bake.use_pass_color=False
scene.render.bake.margin=2
scene.render.bake.use_clear=False
objects={o.get('surfaceBakeReceiver'):o for o in bpy.data.objects if o.type=='MESH' and o.get('surfaceBakeReceiver')}
if set(objects)!=set(r['id'] for r in metadata['receivers']): raise RuntimeError('Receiver export identity differs')
for row in metadata['receivers']:
    if len(objects[row['id']].data.uv_layers)!=2: raise RuntimeError('Receiver secondary UV missing')
output.mkdir(parents=True)

# Separate empty scene: denoising does not re-render the furnished apartment.
clean=bpy.data.scenes.new('Surface irradiance denoise')
clean.render.engine='CYCLES';clean.cycles.samples=1
camera=bpy.data.objects.new('Denoise-only camera',bpy.data.cameras.new('Denoise camera'))
clean.collection.objects.link(camera);clean.camera=camera
clean.use_nodes=True;clean.node_tree.nodes.clear()
image_node=clean.node_tree.nodes.new('CompositorNodeImage')
denoise=clean.node_tree.nodes.new('CompositorNodeDenoise');denoise.use_hdr=True;denoise.prefilter='ACCURATE'
sink=clean.node_tree.nodes.new('CompositorNodeOutputFile');sink.base_path=str(output)
sink.format.file_format='OPEN_EXR';sink.format.color_depth='32';sink.format.color_mode='RGBA'
clean.node_tree.links.new(image_node.outputs['Image'],denoise.inputs['Image'])
clean.node_tree.links.new(denoise.outputs['Image'],sink.inputs[0])
clean.view_settings.view_transform='Standard';clean.view_settings.look='None'
atlases=[]
selected=[options.pilot_atlas] if options.pilot_atlas is not None else sorted(set(r['atlas'] for r in metadata['receivers']))
for atlas in selected:
    rows=[r for r in metadata['receivers'] if r['atlas']==atlas]
    resolution=2048
    image=bpy.data.images.new(f'{key}-{atlas}',width=resolution,height=resolution,float_buffer=True)
    image.colorspace_settings.name='Linear Rec.709'
    bpy.ops.object.select_all(action='DESELECT')
    for row in rows:
        obj=objects[row['id']];obj.data=obj.data.copy()
        for slot,old in enumerate(list(obj.data.materials)):
            material=old.copy();obj.data.materials[slot]=material
            node=material.node_tree.nodes.new('ShaderNodeTexImage');node.image=image
            material.node_tree.nodes.active=node
        obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[rows[0]['id']]
    uv_name=objects[rows[0]['id']].data.uv_layers[1].name
    if any(objects[r['id']].data.uv_layers[1].name!=uv_name for r in rows): raise RuntimeError('Mixed UV layer names')
    started=time.monotonic();print('SURFACE_BAKE_START',atlas,len(rows),flush=True)
    bpy.ops.object.bake(type='DIFFUSE',uv_layer=uv_name)
    raw=output/f'atlas-{atlas}-raw.hdr';image.file_format='HDR';image.filepath_raw=str(raw);image.save()
    image_node.image=image;sink.file_slots[0].path=f'atlas-{atlas}-linear-'
    clean.render.resolution_x=clean.render.resolution_y=resolution;clean.render.resolution_percentage=100
    bpy.ops.render.render(scene=clean.name)
    cleaned=bpy.data.images.load(str(output/f'atlas-{atlas}-linear-0001.exr'),check_existing=False)
    values=np.empty(resolution*resolution*4,dtype=np.float32);cleaned.pixels.foreach_get(values)
    if not np.isfinite(values).all() or values.max()<=0: raise RuntimeError('Invalid baked HDR atlas')
    filename=f'atlas-{atlas}.hdr';cleaned.file_format='HDR';cleaned.filepath_raw=str(output/filename);cleaned.save()
    row={'index':atlas,'file':filename,'sha256':hashlib.sha256((output/filename).read_bytes()).hexdigest(),'width':resolution,'height':resolution,'receivers':len(rows),'seconds':round(time.monotonic()-started,2)}
    atlases.append(row);print('SURFACE_BAKE_COMPLETE',json.dumps(row),flush=True)
    # Incremental output is evidence only. Runtime must require every atlas.
    manifest={**metadata,'atlases':atlases,'complete':len(atlases)==len(set(r['atlas'] for r in metadata['receivers'])),
        'pipelineSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'lightingSetupSha256':hashlib.sha256(renderer.read_bytes()).hexdigest(),
        'lightingPreset':'day','daylightDensity':45,'samples':options.samples,
        'postprocess':'OpenImageDenoise in linear HDR',
        'kind':'Full fixed diffuse irradiance, no albedo; direct and indirect',
        'limits':'Fixed shell lighting only. Moving doors/furniture or changing finishes invalidates it; not dynamic GI, construction or whole-home visual acceptance.'}
    (output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('SURFACE_BAKE_BATCH_COMPLETE',flush=True)
