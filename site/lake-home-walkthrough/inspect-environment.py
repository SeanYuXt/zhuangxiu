import bpy,math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=1;s.render.resolution_x=640;s.render.resolution_y=360;s.render.resolution_percentage=100
s.view_settings.view_transform='AgX'
w=bpy.data.worlds.new('direction check');w.use_nodes=True;s.world=w;n=w.node_tree.nodes;l=w.node_tree.links
env=n.new('ShaderNodeTexEnvironment');env.image=bpy.data.images.load(str(root/'assets/lake.hdr'))
coord=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeMapping');l.new(coord.outputs['Generated'],mapping.inputs['Vector']);l.new(mapping.outputs['Vector'],env.inputs['Vector']);l.new(env.outputs['Color'],n.get('Background').inputs['Color'])
cdata=bpy.data.cameras.new('camera');cam=bpy.data.objects.new('camera',cdata);s.collection.objects.link(cam);s.camera=cam;cdata.lens=24
cam.rotation_euler=Vector((0,1,0)).to_track_quat('-Z','Y').to_euler()
for angle in [0,90,180,270]:
    mapping.inputs['Rotation'].default_value[2]=math.radians(angle)
    s.render.filepath=str(root/'offline-render'/('environment-'+str(angle)+'.png'));bpy.ops.render.render(write_still=True)
