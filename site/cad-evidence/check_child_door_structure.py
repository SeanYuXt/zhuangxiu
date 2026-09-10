"""Read-only CAD inspection; output is evidence, not permission to alter structure."""
from pathlib import Path
from collections import Counter
import json
import logging
import ezdxf
from ezdxf import bbox

logging.disable(logging.CRITICAL)
ROOT = Path(__file__).parent
doc = ezdxf.readfile(ROOT / 'oda-output/building.dxf')
for name in ['SX-06-WALL-BZC', 'AX-6-COMP-BG-BZC', 'AX-06-COMP-BZC']:
    block = doc.blocks[name]
    print('BLOCK', name, len(block), dict(Counter(e.dxftype() for e in block)))
    for e in block:
        if e.dxftype() == 'INSERT':
            print('INSERT', e.dxf.handle, e.dxf.name, list(e.dxf.insert), e.dxf.xscale, e.dxf.yscale, e.dxf.rotation, e.dxf.layer)

region = (28000, 3100, 31700, 4200)
nearby = []
def visit(entities, path, depth=0):
    if depth > 12:
        raise RuntimeError('unexpected nesting')
    for e in entities:
        layer = doc.layers.get(e.dxf.layer)
        if e.dxf.invisible or layer.is_off() or layer.is_frozen():
            continue
        if e.dxftype() == 'INSERT':
            visit(e.virtual_entities(), path + [e.dxf.name], depth + 1)
            continue
        bounds = bbox.extents([e])
        if not bounds.has_data:
            continue
        a, b = bounds.extmin, bounds.extmax
        if a.x > region[2] or b.x < region[0] or a.y > region[3] or b.y < region[1]:
            continue
        source = getattr(e, 'source_of_copy', None) or e
        row = {'path': path, 'type': e.dxftype(), 'handle': source.dxf.handle,
               'layer': e.dxf.layer, 'bounds': [list(a), list(b)]}
        if e.dxftype() == 'LWPOLYLINE':
            row['closed'] = e.closed
            row['points'] = [list(p) for p in e.get_points('xyb')]
        elif e.dxftype() == 'LINE':
            row['points'] = [list(e.dxf.start), list(e.dxf.end)]
        elif e.dxftype() == 'HATCH':
            row['pattern'] = e.dxf.pattern_name
        nearby.append(row)

visit(doc.blocks['SX-06-WALL-BZC'], ['SX-06-WALL-BZC'])
print('STRUCTURE_NEAR_DOOR', json.dumps(nearby, ensure_ascii=False))
raw = json.loads((ROOT / 'building.json').read_text(encoding='utf8'))
objects = {o['handle'][-1]: o for o in raw['OBJECTS']}
for handle in [246130, 246131, 246129]:
    obj = objects[handle]
    layer = objects[obj['layer'][-1]]
    desc = [x.get('value') for x in layer.get('eed', []) if isinstance(x.get('value'), str) and '建筑' in x['value']]
    print('SOURCE_OBJECT', handle, hex(handle), layer['name'], desc)

# Verify the exact nested insertion chain, including the easily missed100mm offset.
def insertion(block, handle, name, x):
    e = doc.entitydb[handle]
    assert e in list(doc.blocks[block]) and e.dxf.name == name
    assert abs(e.dxf.insert.x-x)<.001 and abs(e.dxf.insert.y)<.001
    assert e.dxf.xscale == e.dxf.yscale == 1 and e.dxf.rotation == 0
    return {'parent':block,'handle':handle,'child':name,'translation':list(e.dxf.insert)}
chain = [insertion('AX-6-BZC','5DC5D','AX-06-COMP-BZC',0),
         insertion('AX-06-COMP-BZC','5B2C7','AX-06-COMP-WALL-BZC',0),
         insertion('AX-06-COMP-WALL-BZC','5DB5C','AX-120-COMP-WALL',100)]
struct_chain = insertion('AX-6-BZC','5DC3A','SX-06-WALL-BZC',0)
fields = json.loads((ROOT/'recovered-fields.json').read_text(encoding='utf8'))
opening = next(o for o in fields['openings'] if o['handle']==246129)
wall = next(w for w in fields['walls'] if w['handle']==246130)
assert opening['matching_walls'] == [246130] and opening['width']==900
assert wall['left']+wall['right']==100
center = opening['insert'][0]+100
original = [center-opening['width']/2,center+opening['width']/2]
concrete_face = 28600.00017074135
scenarios = [{'shift_mm':shift,'door_x':[original[0]-shift,original[1]-shift],
              'jamb_to_concrete_mm':round(original[0]-shift-concrete_face,3)}
             for shift in [0,450,300]]
report = {'status':'CAD evidence only; not demolition approval',
          'source_dwg_sha256':'35EF04BE9159FAD7063FDC33384F8DDB38B707CA2437630C9DD5FBEC5BBC89F8',
          'floor_block':'AX-6-BZC (7,10,13,16,19,22F)', 'architecture_chain':chain,
          'structure_chain':struct_chain,'wall_handle':'3C172','wall_layer_description':'建筑－墙体（砌体墙）',
          'wall_thickness_mm_diagnostic':100,'door_handle':'3C171',
          'door_width_mm_diagnostic':900,'door_original_global_x':original,
          'structural_boundary_handle':'5DDA1','structural_hatch_handle':'5DDA0',
          'structural_hatch_pattern':'钢筋混凝土','concrete_face_global_x':concrete_face,
          'scenarios':scenarios,
          'caveats':['天正门墙数值来自诊断解析，并非官方T3导出',
                     '结构轮廓为建筑DWG内可见引用，并非完整结构施工图与现场验收',
                     '新门洞过梁、门垛、锚固、管线和物业/结构审核未确认',
                     '网页门洞底边距墙与CAD约有150mm差异，不可继续作为施工尺寸']}
(ROOT/'child-door-structure-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('ALIGNED_SCENARIOS',json.dumps(scenarios,ensure_ascii=False))

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle
from matplotlib.font_manager import FontProperties
font=FontProperties(fname='C:/Windows/Fonts/msyh.ttc')
fig,axes=plt.subplots(1,3,figsize=(15,6.5),facecolor='white')
def point(x,y):
    return ((3600-y)/1000,(31300-x)/1000)
concrete=[row for row in nearby if row['type']=='LWPOLYLINE' and row['layer'].endswith('S-WALL')]
for ax,scenario,title in zip(axes,scenarios,['原门洞','南移45cm：门垛归零','南移30cm：仅几何试算']):
    ax.add_patch(Rectangle((0,0),3.5,2.7,fc='#f5f5f2',ec='#999',lw=1))
    for row in concrete:
        ax.add_patch(Polygon([point(*p[:2]) for p in row['points']],closed=True,facecolor='#c2c6ca',edgecolor='#5b6269',hatch='///',lw=1))
    lo,hi=scenario['door_x']
    # Actual recovered masonry wall is global x28600..31400, y3600..3700.
    for a,b in [(28600,lo),(hi,31300)]:
        if b>a+.01:
            top=(31300-b)/1000
            ax.add_patch(Rectangle((-.1,top),.1,(b-a)/1000,fc='#decfab',ec='#8c7857'))
    z0,z1=(31300-hi)/1000,(31300-lo)/1000
    ax.plot([0,0],[z0,z1],color='#286d91' if scenario['shift_mm']==0 else '#b44b3b',lw=5)
    ax.text(.12,(z0+z1)/2,'门洞90cm',fontproperties=font,fontsize=11,va='center')
    jamb=max(0,scenario['jamb_to_concrete_mm'])/1000
    ax.annotate('',xy=(-.30,z1),xytext=(-.30,2.7),arrowprops={'arrowstyle':'|-|','color':'#b44b3b'})
    ax.text(-.34,(z1+2.7)/2,f'{jamb*100:.0f}cm',fontproperties=font,fontsize=12,ha='right',va='center',color='#b44b3b')
    ax.text(1.8,1.25,'儿童房\n窗户在右侧',fontproperties=font,fontsize=14,ha='center',color='#5b6269')
    ax.text(1.7,2.96,'斜线区：原CAD钢筋混凝土轮廓',fontproperties=font,fontsize=9,ha='center')
    ax.set_title(title,fontproperties=font,fontsize=15,pad=15)
    ax.set_xlim(-.95,3.8);ax.set_ylim(3.10,-.25);ax.set_aspect('equal');ax.axis('off')
fig.suptitle('儿童房移门核对｜13层标准层图二',fontproperties=font,fontsize=21,y=.97)
fig.text(.04,.14,'黄：建筑砌体墙　灰色斜线：结构轮廓　蓝/红：门洞位置；图示方向与当前网页对应，非地理南北。',fontproperties=font,fontsize=11)
fig.text(.04,.095,'已计入户型图块100mm插入偏移。原门边约45cm余墙；移45cm不留门垛。移30cm尚不能视为施工许可。',fontproperties=font,fontsize=11)
fig.text(.04,.05,'来源：AX-6-BZC → 建筑门墙3C171/3C172；结构轮廓5DDA1、钢筋混凝土填充5DDA0。未修改原CAD或效果图。',fontproperties=font,fontsize=10,color='#666')
fig.subplots_adjust(top=.85,bottom=.21,left=.025,right=.99,wspace=.08)
fig.savefig(ROOT/'child-door-structure-check.png',dpi=150,facecolor='white')
