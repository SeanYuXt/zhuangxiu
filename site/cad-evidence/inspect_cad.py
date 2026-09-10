from pathlib import Path
from collections import Counter
import json
import ezdxf

ROOT = Path(__file__).parent
doc = ezdxf.readfile(ROOT / 'building.dxf')
print('version', doc.dxfversion, 'units', doc.header.get('$INSUNITS'))
print('layouts', [(l.name, len(l)) for l in doc.layouts])
print('types', Counter(e.dxftype() for e in doc.modelspace()))
print('layer count', len(doc.layers))
texts = []
for block in doc.blocks:
    for e in block:
        if e.dxftype() in ('TEXT', 'MTEXT', 'ATTRIB', 'ATTDEF'):
            t = e.plain_text() if hasattr(e, 'plain_text') else e.dxf.text
            texts.append(dict(block=block.name, handle=e.dxf.handle, layer=e.dxf.layer, text=t, insert=list(e.dxf.insert)))
        if e.dxftype() == 'INSERT':
            for a in e.attribs:
                texts.append(dict(block=block.name, handle=a.dxf.handle, layer=a.dxf.layer, text=a.dxf.text, insert=list(a.dxf.insert)))
(ROOT / 'texts.json').write_text(json.dumps(texts, ensure_ascii=False, indent=2), encoding='utf-8')
for t in texts:
    if any(w in t['text'] for w in ['标准', '层平面', '空调', '机位', '01', '13', '冷凝', '阳台']):
        print(json.dumps(t, ensure_ascii=False))
