"""Check the saved design-study geometry, not real-world installation."""
import bpy,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(root/'offline-render/appliance-revision.blend'))
bpy.context.view_layer.update()
def bounds(objects):
    p=[o.matrix_world@Vector(v) for o in objects if o.type=='MESH' for v in o.bound_box]
    return [[min(v[i] for v in p) for i in range(3)],[max(v[i] for v in p) for i in range(3)]]
top=bounds([bpy.data.objects['four-seat-island-top']])
size=[top[1][i]-top[0][i] for i in range(3)]
assert abs(size[0]-.9)<.0001 and abs(size[1]-1.8)<.0001
old=bpy.data.objects['stone-island']
assert all(o.hide_render for o in [old]+list(old.children_recursive))
seats=[]
for i in range(2):
    original=bpy.data.objects['dining-daily-seat-'+str(i)]
    seats.append(bounds([original]+list(original.children_recursive)))
    copies=[o for o in bpy.data.objects if o.name.startswith('opposing-seat-'+str(i)+'-')]
    assert copies and not any(o.hide_render for o in copies)
    seats.append(bounds(copies))
for i,a in enumerate(seats):
    for b in seats[i+1:]:
        assert not all(min(a[1][axis],b[1][axis])-max(a[0][axis],b[0][axis])>.0001 for axis in [0,1])
oven=bounds([bpy.data.objects['steam-oven-body']])
assert oven[0][0]>=10.748 and oven[1][0]<=11.362
assert oven[0][1]>=-7.18 and oven[1][1]<=-6.624
assert not any('dishwasher' in o.name.lower() and not o.hide_render for o in bpy.data.objects)
panel=bounds([bpy.data.objects['smart-control-panel']])
assert panel[0][0]>11.38, 'Control panel must be on the wall beyond the sideboard, not the entry door'
result={'result':'PASS','islandSize':size,'fourSeatBounds':seats,'ovenBodyBounds':oven,
        'controlPanelBounds':panel,
        'scope':'Object envelopes and duplicate baseline suppression only; no equipment, MEP or site approval.'}
(root/'offline-render/appliance-revision-verification.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print('APPLIANCE_GEOMETRY_PASS')
