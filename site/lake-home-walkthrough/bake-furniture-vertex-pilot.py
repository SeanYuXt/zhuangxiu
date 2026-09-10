"""Small same-geometry furniture irradiance pilot, not a final lighting batch."""
import bpy, json, hashlib, sys, math
from pathlib import Path

root=Path(__file__).resolve().parent
output=root/'offline-render'/'furniture-vertex-pilot.json'
if output.exists(): raise RuntimeError('Preserve existing pilot evidence')
renderer=root/'render-mobile-detail.py'
original=renderer.read_text(encoding='utf-8')
marker="\ncamera_data=bpy.data.cameras.new('Detail camera')"
if original.count(marker)!=1: raise RuntimeError('Frozen setup boundary changed')
sys.argv=[str(renderer),'--','bed3','512','96','furniture-vertex-pilot','day','45']
exec(compile(original.split(marker)[0],str(renderer),'exec'),{'__file__':str(renderer),'__name__':'furniture_vertex_setup'})
scene=bpy.context.scene
scene.render.bake.use_pass_direct=True
scene.render.bake.use_pass_indirect=True
scene.render.bake.use_pass_color=False
names=['child-desk-top','child-chair-cushion','child-chair-back','bed3-bed-draped-duvet','bed3-bed-mattress']
records=[]
for name in names:
    obj=bpy.data.objects.get(name)
    if not obj or obj.type!='MESH': raise RuntimeError('Missing unique furniture '+name)
    obj.data=obj.data.copy()
    layer=obj.data.color_attributes.new(name='pilot_irradiance',type='FLOAT_COLOR',domain='CORNER')
    obj.data.color_attributes.active_color=layer
    obj.data.color_attributes.render_color_index=list(obj.data.color_attributes).index(layer)
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
    print('VERTEX_PILOT_START',name,len(obj.data.loops),flush=True)
    bpy.ops.object.bake(type='DIFFUSE',target='VERTEX_COLORS')
    normal_matrix=obj.matrix_world.to_3x3().inverted().transposed()
    samples=[]
    for i,loop in enumerate(obj.data.loops):
        position=obj.matrix_world@obj.data.vertices[loop.vertex_index].co
        normal=(normal_matrix@obj.data.corner_normals[i].vector).normalized()
        color=list(layer.data[i].color[:3])
        if not all(math.isfinite(v) and v>=0 for v in color): raise RuntimeError('Invalid irradiance')
        samples.append({'p':[position.x,position.z,-position.y],'n':[normal.x,normal.z,-normal.y],'rgb':color})
    if max(max(s['rgb']) for s in samples)<=0: raise RuntimeError('Empty irradiance bake')
    records.append({'name':name,'samples':samples})
    print('VERTEX_PILOT_COMPLETE',name,len(samples),flush=True)
result={'sourceSha256':hashlib.sha256((root/'offline-render/mobile-current.glb').read_bytes()).hexdigest(),
    'pipelineSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    'lightingSetupSha256':hashlib.sha256(renderer.read_bytes()).hexdigest(),
    'samples':96,'records':records,'complete':True,
    'limits':'Five furniture meshes only, corner-sampled fixed diffuse lighting without albedo. No geometry movement, dynamic GI or whole-home quality acceptance.'}
output.write_text(json.dumps(result),encoding='utf-8')
print('VERTEX_PILOT_BATCH_COMPLETE',flush=True)
