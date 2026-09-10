import bpy
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parent/'offline-render'
bpy.ops.wm.open_mainfile(filepath=str(root/'appliance-revision.blend'))
scene=bpy.context.scene
panel=bpy.data.objects['smart-control-panel'];panel.location.x+=4.37
scene.cycles.samples=24
bpy.ops.wm.save_as_mainfile(filepath=str(root/'appliance-revision.blend'))
for file,eye,look,lens in [
    ('appliance-revision-dining-sideboard-hd.png',(8.9,-3.5,1.6),(9.43,-6.8,1.30),24),
    ('appliance-revision-island.png',(7.15,-1.94,1.62),(8,-4.65,.96),23)]:
    scene.camera.location=Vector(eye)
    scene.camera.rotation_euler=(Vector(look)-scene.camera.location).to_track_quat('-Z','Y').to_euler()
    scene.camera.data.lens=lens;scene.camera.data.shift_y=0
    scene.render.filepath=str(root/file)
    bpy.ops.render.render(write_still=True)
    print('REFINED_IMAGE',file,flush=True)
