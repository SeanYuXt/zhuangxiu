"""Non-destructive design study from the existing exported apartment geometry.
No dishwasher; four opposing island seats; oven in existing sideboard end bay.
Dimensions are planning envelopes, never manufacturer installation approval.
"""
import bpy, json, math, runpy, sys, hashlib
from pathlib import Path
from mathutils import Vector, Matrix
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'offline-render'
def bounds(o):
    p=[c.matrix_world@Vector(v) for c in [o]+list(o.children_recursive) if c.type=='MESH' for v in c.bound_box]
    return Vector(tuple(min(v[i] for v in p) for i in range(3))),Vector(tuple(max(v[i] for v in p) for i in range(3)))
def material(name,color,roughness=.6,metal=0):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    n=m.node_tree.nodes.get('Principled BSDF');n.inputs['Base Color'].default_value=(*color,1);n.inputs['Roughness'].default_value=roughness;n.inputs['Metallic'].default_value=metal
    return m
def box(name,lo,hi,mat,bevel=.003):
    lo,hi=Vector(lo),Vector(hi)
    bpy.ops.mesh.primitive_cube_add(size=1,location=(lo+hi)/2);o=bpy.context.object;o.name=name;o.dimensions=hi-lo
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
    if bevel:
        mod=o.modifiers.new('Soft manufactured edge','BEVEL');mod.width=bevel;mod.segments=3
        o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return o
def hide(o):
    for c in [o]+list(o.children_recursive):c.hide_render=True
def disc(name,x,y,z,r,mat):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=r,depth=.012,location=(x,y,z));o=bpy.context.object;o.name=name;o.data.materials.append(mat)
    mod=o.modifiers.new('Rim','BEVEL');mod.width=.004;mod.segments=3
def apply_revision(scene):
    bpy.context.view_layer.update()
    stone=material('revision-warm-stone',(.72,.69,.63),.38)
    front=material('revision-warm-greige',(.65,.61,.54),.6)
    dark=material('revision-graphite-glass',(.018,.023,.024),.18,.15)
    metal=material('revision-brushed-metal',(.24,.26,.25),.26,.8)
    ceramic=material('revision-ceramic',(.83,.79,.71),.28)
    # Retain the sideboard footprint; convert its last 650 mm into an oven tower.
    side=bpy.data.objects['flush-sideboard'];cut=10.73
    changed=[]
    for o in list(side.children_recursive):
        if o.type!='MESH':continue
        lo,hi=bounds(o)
        if hi.z<=.91 or hi.x<=cut+.001:continue
        if lo.x>=cut-.001:
            o.hide_render=True;changed.append(o.name)
        elif hi.x-lo.x>.7:
            # Clip only existing straight cabinet panels to the new module edge.
            o.data=o.data.copy();inv=o.matrix_world.inverted()
            for v in o.data.vertices:
                p=o.matrix_world@v.co
                if p.x>cut:p.x=cut;v.co=inv@p
            changed.append(o.name)
    for x in [10.73,11.362]:box('oven-tower-side',(x,-7.18,.905),(x+.018,-6.604,2.41),front)
    box('oven-bearing-shelf',(10.748,-7.18,.923),(11.362,-6.624,.947),front)
    box('oven-lower-vent',(10.755,-6.628,.947),(11.355,-6.602,.967),dark)
    box('steam-oven-body',(10.775,-7.147,.968),(11.335,-6.625,1.55),metal)
    box('steam-oven-flush-face',(10.7575,-6.625,.968),(11.3525,-6.603,1.563),dark)
    box('steam-oven-window',(10.808,-6.601,1.04),(11.302,-6.596,1.413),material('oven-window',(.035,.042,.044),.12,.25))
    box('steam-oven-handle',(10.804,-6.567,1.449),(11.306,-6.544,1.469),metal)
    box('oven-control-display',(10.99,-6.601,1.506),(11.13,-6.596,1.543),metal)
    box('oven-upper-vent',(10.75,-6.628,1.565),(11.36,-6.603,1.595),dark)
    box('oven-upper-storage-door',(10.752,-6.625,1.615),(11.358,-6.603,2.407),front)
    # Four seats on the two 1.8 m long edges. Remove the one-sided deep cabinet.
    island=bpy.data.objects['stone-island'];hide(island)
    cx,cy=7.47,-4.05
    box('four-seat-island-top',(cx-.45,cy-.9,.87),(cx+.45,cy+.9,.90),stone,.012)
    box('four-seat-central-spine',(cx-.10,cy-.55,.12),(cx+.10,cy+.55,.87),front,.01)
    for dy in [-.70,.70]:box('four-seat-end-support',(cx-.12,cy+dy-.035,.02),(cx+.12,cy+dy+.035,.87),front,.008)
    for side_index,x in enumerate([cx+.55,cx-.55]):
        for i,y in enumerate([cy+.43,cy-.43]):
            source=bpy.data.objects['dining-daily-seat-'+str(i)]
            if side_index==0:continue
            anchor=source.matrix_world.translation.copy()
            transform=Matrix.Translation(Vector((x,y,anchor.z)))@Matrix.Rotation(math.pi,4,'Z')@Matrix.Translation(-anchor)
            for old in [source]+list(source.children_recursive):
                if old.type!='MESH':continue
                new=old.copy();new.data=old.data;new.parent=None;scene.collection.objects.link(new)
                new.matrix_world=transform@old.matrix_world;new.name='opposing-seat-'+str(i)+'-'+old.name
    for x in [cx-.235,cx+.235]:
        for y in [cy-.43,cy+.43]:
            disc('four-seat-plate',x,y,.912,.115,ceramic)
            disc('four-seat-bowl',x,y,.929,.065,ceramic)
            box('four-seat-cutlery',(x-.015,y+.145,.909),(x+.015,y+.295,.915),metal,.002)
    # Small smart speaker on the dry part of the worktop. Existing gateway retained.
    box('smart-speaker',(9.75,-7.11,.906),(9.86,-7.00,1.035),front,.022)
    box('smart-control-panel',(11.55,-7.13,1.27),(11.75,-7.10,1.41),dark,.007)
    # Device opening occupancy is reported, not rendered as a misleading free aisle.
    report={'dishwasher':False,'shell':'unchanged current-design-v2.glb',
        'sideboard':{'width':3.9,'depth':.6,'ovenModuleWidth':.65,'retainedFourBandWidth':3.25,'ovenBodyDepth':.522,'rearGap':.033,'selectedModel':False},
        'island':{'length':1.8,'width':.9,'height':.9,'seats':4,'seatPitch':.86,'kneeDepthBothSides':.35,'deepDrawersRemoved':True},
        'clearances':{'kitchenWallToWestStoredChairBack':.79,'westChairAfterAssumed400mmPull':.39,'note':'chair pulled out temporarily restricts passage; not a continuous two-person aisle'},
        'changedSideboardMeshes':changed,
        'limits':['No appliance models selected; opening/ventilation/power are provisional','No construction or structural changes authorized','Existing kitchen and bedroom geometry unchanged','Original web viewer not overwritten; this is a separate render study']}
    (OUT/'appliance-revision-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    scene.camera.location=Vector((8.90,-3.5,1.60))
    scene.camera.rotation_euler=(Vector((9.43,-6.80,1.30))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
    scene.camera.data.lens=24;scene.camera.data.shift_y=0
    scene.render.filepath=str(OUT/'appliance-revision-sideboard.png')
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'appliance-revision.blend'))
    print('APPLIANCE_REVISION_READY',flush=True)

if __name__=='__main__':
    sys.argv=['blender','--','dining-sideboard','1600','24','appliance-revision','day-task','95','--appliance-revision']
    runpy.run_path(str(ROOT/'render-current-design-v2.py'),run_name='__main__')
    # Second view of the same revised geometry; camera remains inside the living room.
    scene=bpy.context.scene;scene.camera.location=Vector((7.15,-1.94,1.62))
    scene.camera.rotation_euler=(Vector((8.0,-4.65,.96))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
    scene.camera.data.lens=23;scene.camera.data.shift_y=0
    scene.render.filepath=str(OUT/'appliance-revision-island.png')
    bpy.ops.render.render(write_still=True)
    print('APPLIANCE_REVISION_COMPLETE',flush=True)
