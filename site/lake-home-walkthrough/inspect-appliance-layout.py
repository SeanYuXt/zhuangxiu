import bpy, json
from mathutils import Vector
from pathlib import Path
root=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root/'offline-render/current-design-v2.glb'))
bpy.context.view_layer.update()
def bounds(o):
    points=[c.matrix_world@Vector(v) for c in [o]+list(o.children_recursive) if c.type=='MESH' for v in c.bound_box]
    if not points:return None
    return [[round(min(p[i] for p in points),4) for i in range(3)],[round(max(p[i] for p in points),4) for i in range(3)]]
report={}
for name in ['flush-sideboard','stone-island','dining-daily-seat-0','dining-daily-seat-1','kitchen-sink','kitchen-cooking-cabinets','integrated-fridge','entry-door']:
    o=bpy.data.objects.get(name)
    report[name]=None if o is None else {'bounds':bounds(o),'children':[{'name':c.name,'bounds':bounds(c)} for c in o.children]}
report['matches']=[{'name':o.name,'bounds':bounds(o)} for o in bpy.data.objects if any(k in o.name for k in ['fridge','entry-door','dispenser'])]
(root/'offline-render/appliance-layout-inspection.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('LAYOUT_INSPECTION_SAVED',flush=True)
