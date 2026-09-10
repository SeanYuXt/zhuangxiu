from pathlib import Path
import json, re
root=Path(__file__).parent
data=json.loads((root/'building.json').read_text(encoding='utf8'))
out=[]
for e in data['OBJECTS']:
    if e.get('entity')!='UNKNOWN_ENT': continue
    raw=bytes.fromhex(e.get('unknown_bits',''))
    bits=''.join(f'{b:08b}' for b in raw)
    for shift in range(8):
        bs=bytes(int(bits[i:i+8],2) for i in range(shift,len(bits)-7,8))
        for offset in range(2):
            s=bs[offset:len(bs)-(len(bs)-offset)%2].decode('utf-16le',errors='replace')
            if any(w in s for w in ['标准','平面','空调','阳台','卧室','客厅','十三','层']):
                row=dict(handle=e['handle'][-1],type=e['type'],shift=shift,offset=offset,text=s)
                out.append(row)
                print(json.dumps(row,ensure_ascii=False))
(root/'raw-text-candidates.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
