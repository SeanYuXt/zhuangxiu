"""Inspect the actual linear irradiance atlas, independent of browser UVs."""
import bpy
import numpy as np
import json
from pathlib import Path

root = Path(__file__).resolve().parent
scene = bpy.context.scene
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
scene.view_settings.exposure = 0
scene.view_settings.gamma = 1
scene.render.image_settings.file_format = 'PNG'
report = []
for name in ('mesh_55', 'mesh_56'):
    source = root / 'assets/lightmaps-child-v1' / (name + '.hdr')
    image = bpy.data.images.load(str(source), check_existing=False)
    w, h = image.size
    pixels = np.empty(w*h*4, dtype=np.float32)
    image.pixels.foreach_get(pixels)
    rgb = pixels.reshape(h, w, 4)[:, :, :3]
    faces = []
    for face in range(6):
        x, y = face % 3, face // 3
        crop = rgb[int((y+.15)*h/2):int((y+.85)*h/2), int((x+.15)*w/3):int((x+.85)*w/3)]
        lum = crop @ np.array([.2126, .7152, .0722])
        residual = lum[1:-1,1:-1] - (lum[:-2,1:-1]+lum[2:,1:-1]+lum[1:-1,:-2]+lum[1:-1,2:])/4
        faces.append({'face':face,'p01_p50_p99':np.percentile(lum,[1,50,99]).tolist(),'highFrequencyRms':float(np.sqrt(np.mean(residual**2)))})
    image.save_render(str(root / ('wall-bake-raw-'+name+'.png')), scene=scene)
    report.append({'name':name, 'finite':bool(np.isfinite(rgb).all()),'faces':faces})
print('WALL_ATLAS_DIAGNOSTIC', json.dumps(report), flush=True)
