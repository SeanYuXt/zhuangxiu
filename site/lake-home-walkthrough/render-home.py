"""Offline lighting study from the exported live scene; no independent wall layout."""
import bpy, json, math, os, sys, contextlib, hashlib
from pathlib import Path
from mathutils import Vector

root=Path(__file__).resolve().parent
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
view=args[0] if args else 'cabinet'
width=int(args[1]) if len(args)>1 else 1280
samples=int(args[2]) if len(args)>2 else 32
panorama='--panorama' in args
bpy.ops.wm.read_factory_settings(use_empty=True)
with open(os.devnull,'w') as silent, contextlib.redirect_stdout(silent):
    bpy.ops.import_scene.gltf(filepath=str(root/'offline-render/home-scene.glb'))
scene=bpy.context.scene
for obj in list(scene.objects):
    if obj.type=='LIGHT': bpy.data.objects.remove(obj,do_unlink=True)
scene.render.engine='CYCLES'
scene.cycles.device='CPU'
scene.cycles.samples=samples
scene.cycles.use_denoising=True
scene.cycles.max_bounces=8
scene.cycles.diffuse_bounces=4
scene.cycles.glossy_bounces=4
scene.cycles.transmission_bounces=8
scene.cycles.transparent_max_bounces=12
scene.render.threads_mode='FIXED'
scene.render.threads=8
scene.render.resolution_x=width
scene.render.resolution_y=width//2 if panorama else round(width*.625)
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGB'
scene.view_settings.view_transform='AgX'
scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=.15
# glTF alpha-blend is a raster approximation, not optical glazing. Restore the
# named clear-glass material for Cycles without moving or replacing any mesh.
for material in bpy.data.materials:
    if not material.use_nodes: continue
    nt=material.node_tree
    bsdf=next((n for n in nt.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if not bsdf: continue
    if material.name.startswith('clear-architectural-glass'):
        bsdf.inputs['Alpha'].default_value=1
        bsdf.inputs['Base Color'].default_value=(.985,.995,1,1)
        bsdf.inputs['Transmission Weight'].default_value=1
        bsdf.inputs['IOR'].default_value=1.45
        bsdf.inputs['Roughness'].default_value=.006
        # Transparent shadow rays avoid dark glass shadows with non-caustic CPU rendering.
        output=next(n for n in nt.nodes if n.type=='OUTPUT_MATERIAL')
        lightpath=nt.nodes.new('ShaderNodeLightPath');transparent=nt.nodes.new('ShaderNodeBsdfTransparent');mix=nt.nodes.new('ShaderNodeMixShader')
        nt.links.new(lightpath.outputs['Is Shadow Ray'],mix.inputs[0]);nt.links.new(bsdf.outputs['BSDF'],mix.inputs[1]);nt.links.new(transparent.outputs[0],mix.inputs[2]);nt.links.new(mix.outputs[0],output.inputs['Surface'])
world=bpy.data.worlds.new('CC0 lake environment - not actual floor 13 view')
world.use_nodes=True;scene.world=world
nodes=world.node_tree.nodes;links=world.node_tree.links
env=nodes.new('ShaderNodeTexEnvironment');env.image=bpy.data.images.load(str(root/'assets/lake.hdr'))
coord=nodes.new('ShaderNodeTexCoord');mapping=nodes.new('ShaderNodeMapping');mapping.inputs['Rotation'].default_value[2]=math.pi
links.new(coord.outputs['Generated'],mapping.inputs['Vector']);links.new(mapping.outputs['Vector'],env.inputs['Vector'])
links.new(env.outputs['Color'],nodes.get('Background').inputs['Color'])
nodes.get('Background').inputs['Strength'].default_value=1.0

def area(name,location,target,energy,size,size_y,color):
    data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.shape='RECTANGLE';data.size=size;data.size_y=size_y;data.color=color
    if 'daylight' in name: data.specular_factor=0
    obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=location
    if 'daylight' in name:
        obj.visible_camera=False;obj.visible_glossy=False;obj.visible_transmission=False
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
    return obj

# Window illumination proxy, not a user-specified luminaire or construction power schedule.
area('Lake window daylight',(9,-.12,1.75),(9,-5,1.1),180,5.8,2.2,(.88,.94,1))
area('Kitchen window daylight',(4.8,-1.91,1.6),(4.8,-4,1),80,1.1,1.1,(.88,.94,1))
area('Master window daylight',(18.18,-1.9,1.6),(15.5,-1.9,1),140,2,2,(.88,.94,1))
area('Bedroom window daylight',(1.55,-1.87,1.6),(1.55,-4,1),90,2,1.6,(.88,.94,1))
area('Secondary window daylight',(18.18,-5.6,1.6),(15.8,-5.6,1),80,1.5,1.6,(.88,.94,1))
area('Sideboard concealed strip',(9.43,-6.68,1.715),(9.43,-6.66,.91),15,2.45,.035,(1,.79,.52))
for name,x,z,w in [('living',10.1,3.7,2),('dining',7.4,3.6,1),('entry',6.8,6.6,1),('left bedroom',2.1,4.0,1),('master',16.0,2.0,1.2),('bedroom3',16,6,1),('kitchen',4.8,4,1),('bath1',1.8,6.2,.4),('bath2',13.2,1.6,.4)]:
    area(name+' ambient luminaire',(x,-z,2.72),(x,-z,0),35,w,.22,(1,.88,.7))

meta=json.loads((root/'offline-render/cameras.json').read_text(encoding='utf-8'))
def convert(p): return Vector((p[0],-p[2],p[1]))
cam_data=bpy.data.cameras.new('Render camera');camera=bpy.data.objects.new('Render camera',cam_data);scene.collection.objects.link(camera);scene.camera=camera
cam_data.lens=24;cam_data.sensor_width=36;cam_data.clip_start=.03;cam_data.clip_end=200
if panorama: cam_data.type='PANO';cam_data.panorama_type='EQUIRECTANGULAR'
out=root/'offline-render';out.mkdir(exist_ok=True)
source_hash=hashlib.sha256((out/'home-scene.glb').read_bytes()).hexdigest()
(out/'current-scene.json').write_text(json.dumps({'sourceSha256':source_hash,'revision':'含洗烘柜修订'},ensure_ascii=False),encoding='utf-8')
scene.render.film_transparent=False
for view_id in view.split(','):
    item=next(r for r in meta['rooms'] if r['id']==view_id)
    cam_data.lens=19 if view_id=='cabinet' else 21 if view_id in ('bar','laundry') else 24
    camera.location=convert(item['position']);camera.rotation_euler=(convert(item['look'])-camera.location).to_track_quat('-Z','Y').to_euler()
    if panorama:
        # Keep the horizon level for head rotation in the web panorama viewer.
        level=convert(item['look']);level.z=camera.location.z
        camera.rotation_euler=(level-camera.location).to_track_quat('-Z','Y').to_euler()
    suffix=('-360' if panorama else '-hd')+('-sample' if width<2000 else '')
    scene.render.filepath=str(out/(view_id+suffix+'.png'))
    print('RENDER_START',view_id,width,samples,flush=True)
    bpy.ops.render.render(write_still=True)
    print('RENDER_FINISHED',scene.render.filepath,flush=True)
    if width<2000: continue
    manifest_file=out/('renders.json' if panorama else 'renders-still.json')
    manifest=json.loads(manifest_file.read_text(encoding='utf-8')) if manifest_file.exists() else {'renders':[]}
    kind='panorama' if panorama else 'still'
    manifest['renders']=[r for r in manifest['renders'] if (r['id'],r['kind'])!=(view_id,kind)]
    manifest['renders'].append({'id':view_id,'name':item['name'],'kind':kind,'file':Path(scene.render.filepath).name,'width':scene.render.resolution_x,'height':scene.render.resolution_y,'samples':samples,'sourceSha256':source_hash,'environmentRotationDegrees':180})
    manifest['precision']='Same room and furniture geometry as the web scene. Design study, not a real photograph or construction verification.'
    manifest_file.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
bpy.ops.wm.save_as_mainfile(filepath=str(out/('home-panorama.blend' if panorama else 'home-still.blend')))
