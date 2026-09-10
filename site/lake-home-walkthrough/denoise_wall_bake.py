"""Denoise baked irradiance in scene-linear HDR; retain immutable raw atlases.

Cycles' render denoising setting does not post-process object.bake images.
This explicit compositor stage uses OpenImageDenoise, never a display-space
blur or a color/albedo replacement. Atlas gutters separate the six faces.
"""
import bpy
import hashlib
import json
import numpy as np
from pathlib import Path

root = Path(__file__).resolve().parent
source_dir = root / 'assets/lightmaps-child-v1'
output_dir = root / 'assets/lightmaps-child-v2'
output_dir.mkdir(parents=True, exist_ok=True)
manifest = json.loads((source_dir / 'manifest.json').read_text(encoding='utf-8'))
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 1
scene.render.resolution_x = scene.render.resolution_y = 1024
scene.render.resolution_percentage = 100
camera = bpy.data.objects.new('Compositor-only camera', bpy.data.cameras.new('Camera'))
scene.collection.objects.link(camera)
scene.camera = camera
scene.use_nodes = True
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
scene.view_settings.exposure = 0
scene.view_settings.gamma = 1
scene.render.image_settings.file_format = 'PNG'
tree = scene.node_tree
tree.nodes.clear()
source_node = tree.nodes.new('CompositorNodeImage')
denoise = tree.nodes.new('CompositorNodeDenoise')
denoise.prefilter = 'ACCURATE'
denoise.use_hdr = True
sink = tree.nodes.new('CompositorNodeOutputFile')
sink.base_path = str(output_dir)
sink.format.file_format = 'OPEN_EXR'
sink.format.color_depth = '32'
sink.format.color_mode = 'RGBA'
tree.links.new(source_node.outputs['Image'], denoise.inputs['Image'])
tree.links.new(denoise.outputs['Image'], sink.inputs[0])
report = []

def pixels(image):
    width, height = image.size
    values = np.empty(width * height * 4, dtype=np.float32)
    image.pixels.foreach_get(values)
    return values.reshape(height, width, 4)[:, :, :3]

def high_frequency(rgb):
    luminance = rgb @ np.array([.2126, .7152, .0722])
    values = []
    h, w = luminance.shape
    for face in range(6):
        x, y = face % 3, face // 3
        patch = luminance[int((y+.15)*h/2):int((y+.85)*h/2), int((x+.15)*w/3):int((x+.85)*w/3)]
        delta = patch[1:-1,1:-1] - (patch[:-2,1:-1]+patch[2:,1:-1]+patch[1:-1,:-2]+patch[1:-1,2:])/4
        values.append(float(np.sqrt(np.mean(delta**2))))
    return values

for row in manifest['receivers']:
    raw_path = source_dir / row['file']
    raw_hash = hashlib.sha256(raw_path.read_bytes()).hexdigest()
    if raw_hash != row['sha256']:
        raise RuntimeError('Raw lightmap hash mismatch: ' + row['name'])
    raw = bpy.data.images.load(str(raw_path), check_existing=False)
    raw.colorspace_settings.name = 'Linear Rec.709'
    source_node.image = raw
    sink.file_slots[0].path = row['name'] + '-linear-'
    print('WALL_DENOISE_START', row['name'], flush=True)
    bpy.ops.render.render()
    exr = output_dir / (row['name'] + '-linear-0001.exr')
    cleaned = bpy.data.images.load(str(exr), check_existing=False)
    cleaned.colorspace_settings.name = 'Linear Rec.709'
    before, after = pixels(raw), pixels(cleaned)
    if not np.isfinite(after).all() or np.max(after) <= 0:
        raise RuntimeError('Invalid denoised irradiance')
    lit = np.mean(before, axis=2) > .02
    relative_energy = float(after[lit].mean()/before[lit].mean())
    if not .85 < relative_energy < 1.15:
        raise RuntimeError('Denoising changed light energy unexpectedly')
    cleaned.file_format = 'HDR'
    cleaned.filepath_raw = str(output_dir / row['file'])
    cleaned.save()
    cleaned.save_render(str(root / ('wall-bake-denoised-'+row['name']+'.png')), scene=scene)
    row['rawSha256'] = raw_hash
    row['sha256'] = hashlib.sha256((output_dir / row['file']).read_bytes()).hexdigest()
    report.append({'name':row['name'], 'relativeLitEnergy':relative_energy,
                   'rawFaceHighFrequencyRms':high_frequency(before),
                   'denoisedFaceHighFrequencyRms':high_frequency(after),
                   'rawSha256':raw_hash, 'denoisedSha256':row['sha256']})
    print('WALL_DENOISE_COMPLETE', json.dumps(report[-1]), flush=True)
manifest['postprocess'] = {'algorithm':'Blender compositor OpenImageDenoise',
    'hdr':True,'guides':'none; diffuse irradiance only','rawFolder':source_dir.name,
    'note':'Render use_denoising does not denoise object.bake output. No geometry or albedo changes.'}
(output_dir / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
(output_dir / 'denoise-report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
