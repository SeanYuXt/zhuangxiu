from pathlib import Path
from collections import Counter
import ezdxf,json,logging
from ezdxf import bbox
logging.disable(logging.CRITICAL)
doc=ezdxf.readfile(Path(__file__).parent/'diagnostic-recovered.dxf')
for blockname in ['AX-6-COMP-KQX-BZC','Ax-TL-50','AX-120-COMP-WALL']:
    block=doc.blocks[blockname]
    print(blockname,dict(Counter(e.dxftype() for e in block)))
    for e in block:
        if e.dxftype()!='INSERT':continue
        layer=doc.layers.get(e.dxf.layer)
        if layer.is_off() or layer.is_frozen() or e.dxf.invisible:continue
        bounds=bbox.extents([e])
        if not bounds.has_data:continue
        a=bounds.extmin;b=bounds.extmax
        if blockname=='Ax-TL-50':ok=-8000<a.x<-6000 and -4500<a.y<-2500
        else:ok=27000<a.x<37000 and -2000<a.y<18000 and b.x-a.x<3000 and b.y-a.y<3000
        if ok:print(e.dxf.handle,e.dxf.name,e.dxf.layer,tuple(round(v,1) for v in a),tuple(round(v,1) for v in b))
