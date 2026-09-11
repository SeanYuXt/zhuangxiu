"""Read current CAD primitives in the entrance/bedroom corridor; do not modify CAD."""
from pathlib import Path
import json, logging
import ezdxf
from ezdxf import bbox

logging.disable(logging.CRITICAL)
ROOT=Path(__file__).parent
CAD=Path('D:/tep-chat/output/cad-evidence/oda-output/building.dxf')
doc=ezdxf.readfile(CAD)
region=(28000,3400,30600,6500)
rows=[]
symbols=[]

def visible(e):
    layer=doc.layers.get(e.dxf.layer)
    return not (e.dxf.invisible or layer.is_off() or layer.is_frozen())

def visit(entities,path,depth=0):
    if depth>14:raise RuntimeError('Unexpected recursion')
    for e in entities:
        if not visible(e):continue
        source=getattr(e,'source_of_copy',None) or e
        handle=source.dxf.get('handle')
        if e.dxftype()=='INSERT':
            if e.dxf.name.rsplit('$',1)[-1] in ['PD','DD']:
                symbols.append({'path':path,'handle':handle,'name':e.dxf.name,'insert':list(e.dxf.insert),'scale':[e.dxf.xscale,e.dxf.yscale],'rotation':e.dxf.rotation})
            visit(e.virtual_entities(),path+[e.dxf.name],depth+1)
            continue
        if e.dxftype() not in ['LINE','LWPOLYLINE','POLYLINE','HATCH','SOLID','TEXT','MTEXT','CIRCLE']:continue
        bounds=bbox.extents([e])
        if not bounds.has_data:continue
        a,b=bounds.extmin,bounds.extmax
        if a.x>region[2] or b.x<region[0] or a.y>region[3] or b.y<region[1]:continue
        row={'path':path,'handle':handle,'type':e.dxftype(),'layer':e.dxf.layer,'bounds':[list(a),list(b)]}
        if e.dxftype()=='LINE':row['points']=[list(e.dxf.start),list(e.dxf.end)]
        elif e.dxftype()=='LWPOLYLINE':row['points']=[list(p) for p in e.get_points('xyb')];row['closed']=e.closed
        elif e.dxftype()=='HATCH':row['pattern']=e.dxf.pattern_name
        elif e.dxftype() in ['TEXT','MTEXT']:row['text']=e.plain_text() if hasattr(e,'plain_text') else e.dxf.text
        rows.append(row)

visit(doc.blocks['AX-6-BZC'],['AX-6-BZC'])
local_symbols=[s for s in symbols if region[0]<=s['insert'][0]<=region[2] and region[1]<=s['insert'][1]<=region[3]]
beams=[r for r in rows if 'BEAM' in r['layer'].upper()]
holes=[r for r in rows if 'WALL-HOLE' in r['layer'].upper()]
report={'cad':str(CAD),'region':region,'beams':beams,'boxSymbols':local_symbols,'wallHoles':holes,'regionalEntities':rows,'limits':'Visible native CAD primitives only; no site measurement or construction certification.'}
(ROOT/'entry-wall-source-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'regionalCount':len(rows),'beams':beams,'boxSymbols':local_symbols,'wallHoles':holes},ensure_ascii=False))
