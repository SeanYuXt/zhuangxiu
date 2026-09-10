from pathlib import Path
import json,struct
d=json.loads((Path(__file__).parent/'building.json').read_text(encoding='utf8'))
def bd(s,p):
    tag=s[p:p+2];p+=2
    if tag=='10':return 0.,p
    if tag=='01':return 1.,p
    if tag!='00':raise ValueError(tag)
    b=bytes(int(s[k:k+8],2) for k in range(p,p+64,8))
    return struct.unpack('<d',b)[0],p+64
for e in [e for e in d['OBJECTS'] if e['handle'][-1] in [245900,246089,246107,246109,246117,246129]]:
    s=''.join(f'{v:08b}' for v in bytes.fromhex(e['unknown_bits']));p=140 if e['handle'][-1] in [246089,246107,246117] else 128;out=[]
    try:
        for n in range(9):
            v,p=bd(s,p);out.append(round(v,5))
    except ValueError:pass
    print(e['handle'][-1],out)
