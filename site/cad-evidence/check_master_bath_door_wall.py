"""Bounded read-only CAD evidence extraction. No structural permission implied."""
import json, logging
from pathlib import Path
import ezdxf
from ezdxf import bbox
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle
from matplotlib.font_manager import FontProperties
logging.disable(logging.CRITICAL)
root=Path(__file__).parent
fields=json.loads((root/'recovered-fields.json').read_text(encoding='utf8'))
doc=ezdxf.readfile(root/'oda-output/building.dxf')
def pt(x,y): return ((5450-y)/1000,(34900-x)/1000)
def mapped(p): return pt(p[0]+100,p[1])
handles=[246413,252125,252123,252124,252691,252692]
walls=[w for w in fields['walls'] if w['handle'] in handles]
opening=next(o for o in fields['openings'] if o['handle']==246117)
report={'status':'diagnostic CAD evidence, not a construction measurement', 'door':opening,
        'walls':[dict(w,model_start=mapped(w['start']),model_end=mapped(w['end'])) for w in walls],
        'door_jamb_x':[1.10,1.95],'projection_face_x':.45,'remaining_nominal_wall_m':.65,
        'notes':['90cm basin in old simplified model crosses recovered wall at x0.45m',
                 '650mm excludes casing, finishes and field tolerances',
                 'CAD sanitary fixtures are schematic; no drainage point proven']}
region=(32600,3150,35100,5650)
structure=[]
def visit(entities,depth=0):
    if depth>12: raise RuntimeError('unexpected nesting')
    for e in entities:
        layer=doc.layers.get(e.dxf.layer)
        if e.dxf.invisible or layer.is_off() or layer.is_frozen(): continue
        if e.dxftype()=='INSERT': visit(e.virtual_entities(),depth+1);continue
        bb=bbox.extents([e])
        if not bb.has_data: continue
        a,b=bb.extmin,bb.extmax
        if a.x>region[2] or b.x<region[0] or a.y>region[3] or b.y<region[1]:continue
        if e.dxftype()=='LWPOLYLINE':
            source=getattr(e,'source_of_copy',None) or e
            structure.append({'handle':source.dxf.handle,'layer':e.dxf.layer,'points':[list(p) for p in e.get_points('xy')]})
visit(doc.blocks['SX-06-WALL-BZC'])
report['structural_polylines']=structure
font=FontProperties(fname='C:/Windows/Fonts/msyh.ttc')
fig,ax=plt.subplots(figsize=(8,8),facecolor='#fbfaf6')
ax.add_patch(Rectangle((0,-.1),2.15,2.15,fc='#f0eee6',ec='#bbb'))
# Draw exact recovered wall footprints including asymmetric thicknesses.
for w in walls:
    a,b=w['start'],w['end'];dx=b[0]-a[0];dy=b[1]-a[1];length=(dx*dx+dy*dy)**.5
    nx,ny=-dy/length,dx/length
    corners=[(a[0]+nx*w['left'],a[1]+ny*w['left']),(b[0]+nx*w['left'],b[1]+ny*w['left']),
             (b[0]-nx*w['right'],b[1]-ny*w['right']),(a[0]-nx*w['right'],a[1]-ny*w['right'])]
    ax.add_patch(Polygon([mapped(p) for p in corners],fc='#998e7c',ec='#655e54',lw=1))
for row in structure:
    ax.add_patch(Polygon([pt(*p) for p in row['points']],closed=True,fc='#aaafa955',ec='#6b756d',hatch='///',lw=.7))
ax.add_patch(Rectangle((1.10,1.94),.85,.12,fc='#fbfaf6',ec='none',zorder=10))
ax.plot([1.10,1.95],[2.0,2.0],color='#527985',lw=3,zorder=11)
ax.add_patch(Rectangle((.10,1.50),.90,.45,fc='#c8835733',ec='#b66642',ls='--',lw=2,zorder=12))
def text(x,y,t,sz=12,color='#464c43',ha='center'):ax.text(x,y,t,fontproperties=font,fontsize=sz,color=color,ha=ha,va='center',zorder=20)
text(.15,1.72,'凸出\n围合区',11)
text(1.56,2.17,'原门洞85cm',12)
text(1.55,.54,'主卫\n右侧为卧室',16)
text(.79,1.20,'旧试排90cm台盆\n跨过CAD墙线',12,'#a65334')
ax.annotate('',xy=(.45,2.32),xytext=(1.10,2.32),arrowprops={'arrowstyle':'|-|','color':'#a65334'})
text(.775,2.43,'剩余约65cm，未扣门套',12,'#a65334')
text(.90,-.34,'主卫门旁墙：CAD复核发现旧模型漏项',16)
text(.95,2.69,'棕色：恢复墙体；斜线：DWG内结构引用。\n围合墙/管道用途与可拆性未确认，不据此拆改。',10)
ax.set_xlim(-.25,2.5);ax.set_ylim(2.87,-.52);ax.set_aspect('equal');ax.axis('off')
fig.savefig(root/'master-bath-door-wall-check.png',dpi=150,facecolor=fig.get_facecolor())
(root/'master-bath-door-wall-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'wall_handles':handles,'opening_handle':opening['handle'],'door_width_mm':opening['width'],'projection_face_x':.45,'remaining_nominal_mm':650,'structure_count':len(structure),'output':str(root/'master-bath-door-wall-check.png')},ensure_ascii=False))
