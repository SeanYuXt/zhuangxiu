"""Bake a bounded, static-wall pilot from the same Cycles lighting setup."""
import bpy, json, time, hashlib

def bake_child_walls(root, source_hash, lighting):
    metadata=json.loads((root/'offline-render/daylight-bake-receivers.json').read_text(encoding='utf-8'))
    if metadata['sourceSha256']!=source_hash:
        raise RuntimeError('Baking source differs from prepared UVs')
    folder=root/'assets/lightmaps-child-v1'
    folder.mkdir(parents=True,exist_ok=True)
    rows=[]
    bpy.context.scene.render.bake.use_pass_direct=True
    bpy.context.scene.render.bake.use_pass_indirect=True
    bpy.context.scene.render.bake.use_pass_color=False
    bpy.context.scene.render.bake.margin=8
    for row in metadata['receivers']:
        candidates=[o for o in bpy.data.objects if o.type=='MESH' and o.get('daylightBakeReceiver')==row['name']]
        if len(candidates)!=1: raise RuntimeError('Ambiguous baked wall '+row['name'])
        obj=candidates[0]
        if len(obj.data.uv_layers)<2: raise RuntimeError('Secondary UV absent on '+obj.name)
        image=bpy.data.images.new('daylight-'+row['name'],width=1024,height=1024,float_buffer=True)
        image.colorspace_settings.name='Linear Rec.709'
        for slot,old in enumerate(list(obj.data.materials)):
            material=old.copy();obj.data.materials[slot]=material
            node=material.node_tree.nodes.new('ShaderNodeTexImage');node.image=image
            material.node_tree.nodes.active=node
        bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
        start=time.monotonic();print('WALL_BAKE_START',row['name'],flush=True)
        bpy.ops.object.bake(type='DIFFUSE',uv_layer=obj.data.uv_layers[1].name)
        image.file_format='HDR';image.filepath_raw=str(folder/(row['name']+'.hdr'));image.save()
        rows.append({**row,'file':row['name']+'.hdr','sha256':hashlib.sha256((folder/(row['name']+'.hdr')).read_bytes()).hexdigest(),'seconds':round(time.monotonic()-start,2),'size':[1024,1024]})
        print('WALL_BAKE_COMPLETE',row['name'],flush=True)
    manifest={'sourceSha256':source_hash,'receivers':rows,'lighting':lighting,'kind':'Static direct+indirect diffuse lighting, no albedo; linear HDR','limits':'Two plaster-wall pilot; invalidate when source furniture/curtains/doors change; not construction or whole-home photoreal acceptance.'}
    (folder/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
