"""Version 2: current viewer geometry and calibrated fabric, preserved in Cycles."""
import bpy, json, math, sys, hashlib, re, time
from pathlib import Path
from mathutils import Vector

root=Path(__file__).resolve().parent
pipeline_hash=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
views=(args[0] if args else 'balconyGap,bar').split(',')
width=int(args[1]) if len(args)>1 else 1920
samples=int(args[2]) if len(args)>2 else 32
output_key=args[3] if len(args)>3 else 'mobile'
lighting_preset=args[4] if len(args)>4 else 'day'
daylight_density=float(args[5]) if len(args)>5 else 95.0
if not math.isfinite(daylight_density) or not 1<=daylight_density<=300: raise ValueError('Daylight study density must be 1..300')
lighting_levels={'day':{},'day-task':{'basic':.65,'task':1},'evening':{'basic':.8,'task':.65,'reading':.2,'accent':.3},'movie':{'accent':.18,'night':.35},'study':{'basic':.75,'task':1,'reading':1,'accent':.1},'night':{'night':1},'off':{}}
if lighting_preset not in lighting_levels: raise ValueError('Unknown lighting preset')
is_daylight=lighting_preset in ('day','day-task')
if not re.fullmatch(r'[a-z0-9-]+',output_key): raise ValueError('Invalid output key')
bake_walls='--bake-child-walls' in args
source=root/('offline-render/daylight-bake-source.glb' if bake_walls else 'offline-render/current-design-v2.glb')
meta=json.loads((root/'offline-render/current-design-v2-cameras.json').read_text(encoding='utf-8'))
view_catalog={**meta['targets'],**{v['id']:v for v in meta.get('viewpoints',[])}}
for view in views:
    if view not in view_catalog: raise ValueError('Unknown view: '+view)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(source))
scene=bpy.context.scene
for obj in list(scene.objects):
    if obj.type=='LIGHT': bpy.data.objects.remove(obj,do_unlink=True)
scene.render.engine='CYCLES';scene.cycles.device='CPU'
scene.cycles.samples=samples;scene.cycles.use_denoising=True;scene.cycles.adaptive_threshold=.015
scene.cycles.max_bounces=8;scene.cycles.transmission_bounces=8
scene.cycles.transparent_max_bounces=12
scene.render.threads_mode='FIXED';scene.render.threads=8
scene.render.resolution_x=width;scene.render.resolution_y=round(width*9/16)
scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGB'
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=.3 if is_daylight else 1.5
for material in bpy.data.materials:
    if not material.use_nodes: continue
    nt=material.node_tree;bsdf=next((n for n in nt.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if not bsdf: continue
    if material.name.startswith('clear-architectural-glass'):
        bsdf.inputs['Alpha'].default_value=1;bsdf.inputs['Base Color'].default_value=(.99,.995,1,1)
        bsdf.inputs['Transmission Weight'].default_value=1;bsdf.inputs['IOR'].default_value=1.45
        bsdf.inputs['Roughness'].default_value=.008
        output=next(n for n in nt.nodes if n.type=='OUTPUT_MATERIAL')
        lightpath=nt.nodes.new('ShaderNodeLightPath');transparent=nt.nodes.new('ShaderNodeBsdfTransparent');mix=nt.nodes.new('ShaderNodeMixShader')
        nt.links.new(lightpath.outputs['Is Shadow Ray'],mix.inputs[0]);nt.links.new(bsdf.outputs['BSDF'],mix.inputs[1]);nt.links.new(transparent.outputs[0],mix.inputs[2]);nt.links.new(mix.outputs[0],output.inputs['Surface'])
    elif bsdf.inputs['Alpha'].default_value>.99 and bsdf.inputs['Metallic'].default_value<.5 and not bsdf.inputs['Normal'].is_linked and not material.name.startswith('continuous-plaster-finish'):
        # Shading-only edge softening: never change the room or furniture footprint.
        bevel=nt.nodes.new('ShaderNodeBevel');bevel.inputs['Radius'].default_value=.0012;bevel.samples=2
        nt.links.new(bevel.outputs['Normal'],bsdf.inputs['Normal'])

def material_signature(material):
    if not material or not material.use_nodes: return None
    node=next((n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if not node: return None
    return (node.inputs['Metallic'].default_value,node.inputs['Roughness'].default_value,tuple(node.inputs['Base Color'].default_value))

# Preserve every non-mirror metallic finish, including shared imported materials.
metal_before={obj.name:[material_signature(m) for m in obj.data.materials] for obj in bpy.data.objects if obj.type=='MESH' and obj.get('surfaceRole')!='interior-mirror' and any((material_signature(m) or (0,))[0]>=.7 for m in obj.data.materials)}
material_audit=[]
for obj in bpy.data.objects:
    if obj.type!='MESH': continue
    path=obj.name;parent=obj.parent
    while parent: path=parent.name+'/'+path;parent=parent.parent
    is_mirror=obj.get('surfaceRole')=='interior-mirror'
    if is_mirror: obj.data=obj.data.copy()
    for slot,material in enumerate(list(obj.data.materials)):
        if not material or not material.use_nodes: continue
        if is_mirror:
            material=material.copy();obj.data.materials[slot]=material
        bsdf=next((n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
        if not bsdf: continue
        if is_mirror:
            bsdf.inputs['Metallic'].default_value=1;bsdf.inputs['Roughness'].default_value=.025
            bsdf.inputs['Base Color'].default_value=(.82,.82,.80,1)
            material_audit.append({'object':obj.name,'adjustment':'neutral physical mirror'})
        if obj.get('detailRole')=='sewn-textile' or material.name.startswith('textile-woven-'):
            # Honor imported KHR sheen/specular/IOR; do not restore old shiny cloth.
            material_audit.append({'object':obj.name,'adjustment':'preserved exported cloth BRDF',
                'sheenWeight':bsdf.inputs['Sheen Weight'].default_value,
                'sheenRoughness':bsdf.inputs['Sheen Roughness'].default_value,
                'roughness':bsdf.inputs['Roughness'].default_value,
                'roughnessTexture':bsdf.inputs['Roughness'].is_linked})

metal_changes=[name for name,signature in metal_before.items() if signature!=[material_signature(m) for m in bpy.data.objects[name].data.materials]]
if metal_changes: raise RuntimeError('Non-mirror metal changed: '+','.join(metal_changes))
if sum(m['adjustment']=='neutral physical mirror' for m in material_audit)!=6: raise RuntimeError('Expected six explicit interior mirror surfaces in current export')

world=bpy.data.worlds.new('Lake environment reference, not actual floor 13 view');world.use_nodes=True;scene.world=world
nodes=world.node_tree.nodes;links=world.node_tree.links
env=nodes.new('ShaderNodeTexEnvironment');env.image=bpy.data.images.load(str(root/'assets/lake.hdr'))
coord=nodes.new('ShaderNodeTexCoord');mapping=nodes.new('ShaderNodeMapping');mapping.inputs['Rotation'].default_value[2]=math.pi
links.new(coord.outputs['Generated'],mapping.inputs['Vector']);links.new(mapping.outputs['Vector'],env.inputs['Vector'])
links.new(env.outputs['Color'],nodes.get('Background').inputs['Color']);nodes.get('Background').inputs['Strength'].default_value=.8 if is_daylight else .025
def convert(p): return Vector((p[0],-p[2],p[1]))
lighting=[]
def area(name,position,target,power,width,height,color):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='RECTANGLE';data.size=width;data.size_y=height;data.color=color
    obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=convert(position)
    obj.rotation_euler=(convert(target)-obj.location).to_track_quat('-Z','Y').to_euler()
    if 'daylight' in name:
        data.specular_factor=0;obj.visible_camera=False;obj.visible_glossy=False;obj.visible_transmission=False
    lighting.append({'name':name,'position':position,'powerRadiantW':power,'size':[width,height],'basis':'render lighting assumption, not electrical watts or measured illuminance'})
def descendants(obj): return [obj]+list(obj.children_recursive)
def object_bounds(obj):
    points=[child.matrix_world@Vector(v) for child in descendants(obj) if child.type=='MESH' for v in child.bound_box]
    return Vector(tuple(min(p[i] for p in points) for i in range(3))),Vector(tuple(max(p[i] for p in points) for i in range(3)))

# Fill follows actual exported windows, never the camera or invented openings.
# Energy density is an overcast-sky rendering assumption, not surveyed daylight.
daylight_apertures=[]
plan=json.loads((root/'plan-spec.json').read_text(encoding='utf-8'))
room_centres={s['id']:Vector((sum(p[0] for poly in s['polygons'] for p in poly)/sum(len(poly) for poly in s['polygons']),
    sum(p[1] for poly in s['polygons'] for p in poly)/sum(len(poly) for poly in s['polygons']),1.4)) for s in plan['spaces']}
bpy.context.view_layer.update()
for pane in list(bpy.data.objects):
    match=re.fullmatch(r'window-(bed1|bed3|master|living|kitchen|bath2)-\d+-glass(?:\.\d+)?',pane.name)
    room=match.group(1) if match else 'bath1' if pane.name.startswith('bath1-frosted-glass') else None
    if pane.type!='MESH' or not room: continue
    lo,hi=object_bounds(pane);centre=(lo+hi)/2;size=hi-lo
    normal_axis=0 if size.x<size.y else 1
    inward=Vector((0,0,0));inward[normal_axis]=1 if room_centres[room][normal_axis]>centre[normal_axis] else -1
    position=centre-inward*(size[normal_axis]/2+.085)
    target=centre+inward*2
    w=max(.05,(size.y if normal_axis==0 else size.x)-.05);h=max(.05,size.z-.05)
    to_view=lambda p:[p.x,p.z,-p.y]
    daylight_apertures.append({'object':pane.name,'room':room,'position':to_view(position),'target':to_view(target),'size':[w,h],'normal':to_view(inward)})
    if room.startswith('bath'):
        # Frosted panes retain appearance, with attenuated transmission of sky fill.
        pane.data=pane.data.copy()
        for slot,old in enumerate(list(pane.data.materials)):
            m=old.copy();pane.data.materials[slot]=m;nt=m.node_tree
            output=next(n for n in nt.nodes if n.type=='OUTPUT_MATERIAL')
            original=output.inputs['Surface'].links[0].from_socket
            lp=nt.nodes.new('ShaderNodeLightPath');trans=nt.nodes.new('ShaderNodeBsdfTransparent');trans.inputs['Color'].default_value=(.62,.65,.62,1)
            mix=nt.nodes.new('ShaderNodeMixShader');nt.links.new(lp.outputs['Is Shadow Ray'],mix.inputs[0]);nt.links.new(original,mix.inputs[1]);nt.links.new(trans.outputs[0],mix.inputs[2]);nt.links.new(mix.outputs[0],output.inputs['Surface'])
    if is_daylight:
        area('daylight-'+pane.name,to_view(position),to_view(target),daylight_density*w*h,w,h,(.92,.96,1))
        lighting[-1].update({'aperture':pane.name,'room':room,'target':to_view(target),'densityRadiantWPerM2':daylight_density})
if set(a['room'] for a in daylight_apertures)!=set(room_centres):
    raise RuntimeError('Daylight glazing coverage differs from the seven current rooms')
emitters=[obj for obj in bpy.data.objects if obj.get('lightingRole')=='emitter']
if len(emitters)<36: raise RuntimeError('Current full lighting metadata missing; re-export the current viewer')
for source_lamp in emitters:
    kind=source_lamp['lightingKind'];level=lighting_levels[lighting_preset].get(kind,0)
    pos=list(source_lamp['lightingPosition']);target=list(source_lamp['lightingTarget']);size=list(source_lamp['lightingSize'])
    kelvin=source_lamp['lightingKelvin'];lumens=source_lamp['lightingLumens'];name=source_lamp['lightingId']
    color=(1,.97,.91) if kelvin==4000 else (1,.91,.79) if kelvin==3500 else (1,.83,.63)
    # Isolate lamp emission from shared metals and switch it with the same scene preset.
    for slot,material in enumerate(list(source_lamp.data.materials)):
        if not material or not material.use_nodes: continue
        material=material.copy();source_lamp.data.materials[slot]=material
        bsdf=next((n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
        if bsdf: bsdf.inputs['Emission Strength'].default_value=level*.85
    if not level: continue
    direction=Vector(target)-Vector(pos)
    if source_lamp['lightingShape']=='spot':
        data=bpy.data.lights.new(name,'SPOT');data.energy=lumens/250*level;data.color=color
        data.spot_size=math.radians(source_lamp['lightingBeamDeg']);data.spot_blend=.55;data.shadow_soft_size=.025
        lamp=bpy.data.objects.new(name,data);scene.collection.objects.link(lamp);lamp.location=convert(pos)
        lamp.rotation_euler=(convert(target)-lamp.location).to_track_quat('-Z','Y').to_euler()
        lighting.append({'name':name,'position':pos,'target':target,'lumensTarget':lumens,'level':level,'type':'SPOT','powerRadiantW':data.energy,'basis':'current GLB lamp metadata; not measured photometry'})
    else:
        if abs(direction.y)>.7: w,h=size[0],size[2]
        elif abs(direction.x)>.7: w,h=size[2],size[1]
        else: w,h=size[0],size[1]
        area(name,pos,target,lumens/250*level,max(.012,w),max(.012,h),color)
        lighting[-1].update({'target':target,'lumensTarget':lumens,'level':level,'source':'current GLB lamp metadata'})
        if source_lamp['lightingShape']=='disc': bpy.data.lights[name].shape='DISK'

camera_data=bpy.data.cameras.new('Detail camera');camera=bpy.data.objects.new('Detail camera',camera_data);scene.collection.objects.link(camera);scene.camera=camera
camera_data.lens=24;camera_data.sensor_width=36;camera_data.clip_start=.03
source_hash=hashlib.sha256(source.read_bytes()).hexdigest()
manifest_path=root/'offline-render'/(output_key+'-detail-renders.json')
previous=json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
camera_hash=hashlib.sha256((root/'offline-render/current-design-v2-cameras.json').read_bytes()).hexdigest()
same_version=previous.get('sourceSha256')==source_hash and previous.get('pipelineSha256')==pipeline_hash and previous.get('cameraSha256')==camera_hash and previous.get('lightingPreset')==lighting_preset and previous.get('daylightDensity',95)==daylight_density
manifest={'sourceSha256':source_hash,'pipelineSha256':pipeline_hash,'cameraSha256':camera_hash,'column':meta['column'],'renders':previous.get('renders',[]) if same_version else [],'lightingPreset':lighting_preset,'fixtureMetadataCount':len(emitters),'lighting':lighting,'materials':material_audit,'metalPreservation':{'checkedObjects':len(metal_before),'changedObjects':metal_changes},'limits':'Same current geometry and lamp data; Cycles lighting study. Light powers are assumptions, not site measurements or installed products. Not a photograph or completed construction design.'}
manifest['daylightApertures']=daylight_apertures
manifest['daylightDensity']=daylight_density
if bake_walls:
    sys.path.insert(0,str(root))
    from bake_lightmaps import bake_child_walls
    bake_child_walls(root, source_hash, lighting)
    # Cycles render denoising does not process object.bake textures. Keep raw
    # evidence, then explicitly produce the linear HDR maps used by the viewer.
    import runpy
    runpy.run_path(str(root/'denoise_wall_bake.py'), run_name='__main__')
    print('WALL_BAKE_BATCH_COMPLETE',flush=True)
    sys.exit(0)
if '--appliance-revision' in args:
    import runpy
    runpy.run_path(str(root/'appliance-revision-20260907.py'),run_name='appliance_study')['apply_revision'](scene)
    view_catalog['dining-sideboard']={**view_catalog['dining-sideboard'],'position':[8.9,1.6,3.5],'look':[9.43,1.3,6.8]}
    manifest['limits']='Independent appliance layout study. Original room shell retained; no dishwasher. Appliance dimensions, product choice, clearances and installation remain provisional. Not the unchanged original viewer.'
for view in views:
    target=view_catalog[view]
    frame_aspect=float(target.get('renderAspect',16/9))
    if not math.isfinite(frame_aspect) or not .5<=frame_aspect<=2: raise ValueError('Unsupported photographic frame ratio')
    scene.render.resolution_y=round(width/frame_aspect)
    camera.location=convert(target['position'])
    eye=target['position'];look=target['look'];horizontal=math.hypot(look[0]-eye[0],look[2]-eye[2])
    camera_data.lens=target.get('lensMm',24);camera_data.sensor_width=target.get('sensorLongEdgeMm',36)
    camera_data.sensor_height=target.get('sensorLongEdgeMm',36)
    camera_data.sensor_fit='HORIZONTAL' if frame_aspect>=1 else 'VERTICAL';camera_data.shift_y=0
    direct=target.get('projection')=='direct-look'
    if direct:
        # Same perspective and aim as the web room view at the same aspect.
        camera.rotation_euler=(convert(look)-camera.location).to_track_quat('-Z','Y').to_euler()
    else:
        # Preserve legacy architectural-shift studies, clearly separate from new views.
        level_target=[look[0],eye[1],look[2]]
        camera.rotation_euler=(convert(level_target)-camera.location).to_track_quat('-Z','Y').to_euler()
        camera_data.shift_y=max(-.28,min(.28,(look[1]-eye[1])/max(.01,horizontal)*camera_data.lens/camera_data.sensor_width))
    filename=f'{output_key}-{view}-hd.png';scene.render.filepath=str(root/'offline-render'/filename)
    started=time.monotonic()
    print('DETAIL_RENDER_START',view,flush=True);bpy.ops.render.render(write_still=True)
    manifest['renders']=[r for r in manifest['renders'] if r['id']!=view]
    manifest['renders'].append({'id':view,'file':filename,'width':width,'height':scene.render.resolution_y,'samples':samples,'seconds':round(time.monotonic()-started,2),'camera':target,'projection':{'lensMm':camera_data.lens,'sensorWidthMm':camera_data.sensor_width,'levelVerticals':not direct,'shiftY':camera_data.shift_y,'mode':'direct-look' if direct else 'legacy-shift'},'exposureEV':scene.view_settings.exposure})
    manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print('DETAIL_RENDER_COMPLETE',view,flush=True)
