"""Diagnostic reconstruction of selected TCH fields, not a construction export.

The source objects are retained. Derived geometry has separate audit layers.
Hard-coded offsets are accepted only when shape/range checks pass.
"""
from pathlib import Path
from collections import Counter
import json, math, struct
import ezdxf

ROOT=Path(__file__).parent
data=json.loads((ROOT/'building.json').read_text(encoding='utf8'))
objects={o['handle'][-1]:o for o in data['OBJECTS']}
doc=ezdxf.readfile(ROOT/'oda-output/building.dxf')
for name,color in [('RECOVERED-WALL',4),('RECOVERED-TEXT',3),('RECOVERED-OPENING',30)]:
    if name not in doc.layers:doc.layers.new(name,dxfattribs={'color':color})
doc.styles.new('RECOVERED-CJK',dxfattribs={'font':'simhei.ttf'})

def bits(raw):return ''.join(f'{v:08b}' for v in raw)
def rawbytes(s,p,n):return bytes(int(s[i:i+8],2) for i in range(p,p+n*8,8))
def rd(s,p):return struct.unpack('<d',rawbytes(s,p,8))[0]
def owner(e):return objects.get(e.get('ownerhandle',[0])[-1],{}).get('name','*Model_Space')

report={'walls':[],'texts':[],'openings':[],'skipped':[],'hidden':[]}
wall_entities={}
for e in objects.values():
    if e.get('entity')!='UNKNOWN_ENT':continue
    typ=e['type'];name=owner(e)
    if typ not in (508,505):continue
    if name not in doc.blocks:continue
    source_layer=objects.get(e.get('layer',[0])[-1],{}).get('name','0')
    original_layer=doc.layers.get(source_layer)
    if e.get('invisible') or original_layer.is_off() or original_layer.is_frozen():
        report['hidden'].append(e['handle'][-1]);continue
    b=doc.blocks[name];raw=bytes.fromhex(e['unknown_bits']);s=bits(raw)
    if typ==508:
        key=Counter(raw[15:90]).most_common(1)[0][0]
        s=bits(bytes(v^key for v in raw))
        v=[rd(s,p) for p in (118,182,246,310,374,438,598,662)]
        x1,y1,z1,x2,y2,z2,left,right=v
        valid=all(math.isfinite(x) and abs(x)<1e6 for x in v)
        valid=valid and abs(z1-z2)<.001 and 20<=left+right<=1000 and left>=0 and right>=0
        length=math.hypot(x2-x1,y2-y1)
        valid=valid and 10<=length<=50000
        if not valid:
            report['skipped'].append({'handle':e['handle'][-1],'type':typ,'reason':'wall range/shape check','values':v});continue
        dx=(x2-x1)/length;dy=(y2-y1)/length
        pts=[(x1-dy*left,y1+dx*left),(x2-dy*left,y2+dx*left),(x2+dy*right,y2-dx*right),(x1+dy*right,y1-dx*right)]
        wall_entities[e['handle'][-1]]=b.add_lwpolyline(pts,close=True,dxfattribs={'layer':'RECOVERED-WALL'})
        report['walls'].append({'handle':e['handle'][-1],'block':name,'key':key,'start':v[:3],'end':v[3:6],'left':left,'right':right})
    elif typ==505:
        # Common observed layout: uncompressed X/Y, constant Z; UTF-16 bitshort at 312.
        if len(s)<338 or s[94:96]!='00' or s[160:162]!='00':
            report['skipped'].append({'handle':e['handle'][-1],'type':typ,'reason':'text layout differs'});continue
        x=rd(s,96);y=rd(s,162);p=312;tag=s[p:p+2]
        if tag=='01':n=int(s[p+2:p+10],2);start=p+10
        elif tag=='00':n=int(s[p+2:p+10],2)+256*int(s[p+10:p+18],2);start=p+18
        else:continue
        if not 1<=n<=200 or start+16*n>len(s):continue
        try:t=rawbytes(s,start,n*2).decode('utf16')
        except UnicodeError:continue
        if not math.isfinite(x+y) or max(abs(x),abs(y))>1e7:continue
        if any(ord(c)<32 for c in t):continue
        b.add_text(t,dxfattribs={'insert':(x,y),'height':140,'style':'RECOVERED-CJK','layer':'RECOVERED-TEXT'})
        report['texts'].append({'handle':e['handle'][-1],'block':name,'text':t,'insert':[x,y]})

def bd(s,p):
    tag=s[p:p+2];p+=2
    if tag=='10':return 0.,p
    if tag=='01':return 1.,p
    if tag!='00':raise ValueError(tag)
    return rd(s,p),p+64

for e in objects.values():
    if e.get('entity')!='UNKNOWN_ENT' or e['type']!=509:continue
    name=owner(e)
    if name not in doc.blocks:continue
    s=bits(bytes.fromhex(e['unknown_bits']));candidates=[]
    for start in range(112,177):
        p=start;v=[]
        try:
            for i in range(7):a,p=bd(s,p);v.append(a)
        except (ValueError,struct.error):continue
        x,y,z,width,halfdepth,height,angle=v
        if not all(math.isfinite(a) and abs(a)<1e6 for a in v):continue
        # DWG ground-level coordinates may contain sub-micron roundoff below zero.
        if not (100<=width<=10000 and -.001<=z<=4000 and 400<=height<=4500 and 20<=halfdepth<=500):continue
        if abs(angle/(math.pi/2)-round(angle/(math.pi/2)))>1e-6:continue
        # Require a corresponding recovered wall with parallel direction and opening center.
        matches=[]
        for wall in report['walls']:
            if wall['block']!=name:continue
            ax,ay=wall['start'][:2];bx,by=wall['end'][:2]
            length=math.hypot(bx-ax,by-ay);ux=(bx-ax)/length;uy=(by-ay)/length
            middle=(wall['left']-wall['right'])/2
            cx=ax-uy*middle;cy=ay+ux*middle
            offset=(x-cx)*ux+(y-cy)*uy;distance=abs((x-cx)*uy-(y-cy)*ux)
            parallel=abs(ux*math.sin(angle)-uy*math.cos(angle))<1e-6
            if parallel and distance<2 and -1<=offset-width/2 and offset+width/2<=length+1:matches.append(wall['handle'])
        if matches:candidates.append((start,v,matches))
    if len(candidates)!=1:
        report['skipped'].append({'handle':e['handle'][-1],'type':509,'reason':'opening requires unique wall-matched decoding','candidates':len(candidates)});continue
    start,v,matches=candidates[0];x,y,z,width,halfdepth,height,angle=v
    ux=math.cos(angle);uy=math.sin(angle);b=doc.blocks[name]
    if z>10 or height<1800:
        for offset in (-halfdepth,halfdepth):
            b.add_line((x-ux*width/2-uy*offset,y-uy*width/2+ux*offset),(x+ux*width/2-uy*offset,y+uy*width/2+ux*offset),dxfattribs={'layer':'RECOVERED-OPENING'})
    report['openings'].append({'handle':e['handle'][-1],'block':name,'insert':v[:3],'width':width,'halfdepth':halfdepth,'height':height,'angle':angle,'start_bit':start,'matching_walls':matches})

for wall in report['walls']:
    openings=[o for o in report['openings'] if wall['handle'] in o['matching_walls']]
    if not openings:continue
    ax,ay=wall['start'][:2];bx,by=wall['end'][:2]
    length=math.hypot(bx-ax,by-ay);ux=(bx-ax)/length;uy=(by-ay)/length
    cuts=[]
    for o in openings:
        x,y=o['insert'][:2];c=(x-ax)*ux+(y-ay)*uy
        cuts.append((max(0,c-o['width']/2),min(length,c+o['width']/2)))
    block=doc.blocks[wall['block']]
    # Only delete the diagnostic rectangle created above, never a source entity.
    block.delete_entity(wall_entities[wall['handle']])
    intervals=[];start=0.
    for lo,hi in sorted(cuts):
        if lo>start+.001:intervals.append((start,lo))
        start=max(start,hi)
    if start<length-.001:intervals.append((start,length))
    for lo,hi in intervals:
        left=wall['left'];right=wall['right']
        points=[(ax+ux*lo-uy*left,ay+uy*lo+ux*left),(ax+ux*hi-uy*left,ay+uy*hi+ux*left),(ax+ux*hi+uy*right,ay+uy*hi-ux*right),(ax+ux*lo+uy*right,ay+uy*lo-ux*right)]
        block.add_lwpolyline(points,close=True,dxfattribs={'layer':'RECOVERED-WALL'})
doc.saveas(ROOT/'diagnostic-recovered.dxf')
(ROOT/'recovered-fields.json').write_text(json.dumps(report,ensure_ascii=False,indent=2,allow_nan=False),encoding='utf8')
print({k:len(v) for k,v in report.items()})
