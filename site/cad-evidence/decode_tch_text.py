from pathlib import Path
import json,re
root=Path(__file__).parent
d=json.loads((root/'building.json').read_text(encoding='utf8'))
objects={e['handle'][-1]:e for e in d['OBJECTS']}
out=[]
for e in d['OBJECTS']:
    if e.get('entity')!='UNKNOWN_ENT' or e['type']!=505: continue
    bits=''.join(f'{b:08b}' for b in bytes.fromhex(e.get('unknown_bits','')))
    candidates=[]
    for p in range(len(bits)-26):
        tag=bits[p:p+2]
        if tag=='01': n=int(bits[p+2:p+10],2); start=p+10
        elif tag=='00':
            n=int(bits[p+2:p+10],2)+256*int(bits[p+10:p+18],2);start=p+18
        else: continue
        if not 1<=n<=200 or start+16*n>len(bits):continue
        raw=bytes(int(bits[k:k+8],2) for k in range(start,start+16*n,8))
        try: s=raw.decode('utf-16le')
        except UnicodeDecodeError:continue
        if not re.fullmatch(r'[\x20-\x7e\u3000-\u303f\u4e00-\u9fff\uff00-\uffef℃°㎡φΦ×±²³]+',s):continue
        candidates.append((len(s),s,p))
    if not candidates:continue
    n,s,p=max(candidates,key=lambda c:(c[0],c[2]))
    parent=objects.get(e.get('ownerhandle',[0])[-1],{}).get('name','MODEL')
    row=dict(handle=e['handle'][-1],block=parent,text=s,bit_offset=p)
    out.append(row)
(root/'tch-text.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
for r in out:
    if r['block'] in ['AX-6-BZC1','AX-6-BZC','AX-6-BZC3','AX-6-BZC1-1','AX-6-BZC-1','AX-6-BZC3-1']:
        print(json.dumps(r,ensure_ascii=False))
print('decoded',len(out))
