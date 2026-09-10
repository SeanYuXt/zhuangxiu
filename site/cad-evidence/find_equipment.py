from pathlib import Path
import json,logging
import ezdxf
from ezdxf import bbox
logging.disable(logging.CRITICAL)
root=Path(__file__).parent
doc=ezdxf.readfile(root/'diagnostic-recovered.dxf')
out=[]
def visit(entities,path=(),depth=0):
    if depth>18:return
    for e in entities:
        if e.dxftype()!='INSERT':continue
        name=e.dxf.name
        layer=doc.layers.get(e.dxf.layer)
        if e.dxf.invisible or layer.is_off() or layer.is_frozen():continue
        if '空调外机' in name:
            bounds=bbox.extents([e])
            if bounds.has_data:
                out.append(dict(name=name,path=list(path),bounds=[list(bounds.extmin),list(bounds.extmax)],layer=e.dxf.layer))
        try:visit(e.virtual_entities(),(*path,name),depth+1)
        except Exception as ex:print(type(ex).__name__,name)
visit(doc.blocks['AX-6-BZC'])
(root/'equipment.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print('all',len(out))
for row in out:
    a,b=row['bounds']
    if 27000<a[0]<37000 and -2000<a[1]<18000:print(json.dumps(row,ensure_ascii=False))
