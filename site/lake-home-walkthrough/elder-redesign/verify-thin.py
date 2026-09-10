"""Conservative floor-path screening for a shallow cabinet and cantilever desk."""
import json, math
from pathlib import Path
import audit as geo

p=Path(__file__).resolve().parent
d=json.loads((p/'thin-row.json').read_text())
results={}
for state,key in [('tucked','chairTucked'),('occupied','chairOccupied')]:
    items={k:d[k] for k in ['bed','wardrobe','desk']};items['chair']=d[key]
    clashes=[(a,b) for i,a in enumerate(items) for b in list(items)[i+1:] if geo.overlap(items[a],items[b]) and not(state=='tucked' and {a,b}=={'desk','chair'})]
    door=[k for k,r in items.items() if any(geo.segment_rect_distance(geo.HINGE,geo.door_tip(a),r)<=geo.DOOR_HALF_THICKNESS+1e-9 for a in range(91))]
    paths={}
    for diameter in [.5,.55,.6]:
        reaches,start,count=geo.path_search(d['main'],list(items.values()),diameter/2)
        bed=d['bed'];xs=[1.035]+[x*.02 for x in range(32,63)]
        targets={side:next(([x,y] for x in xs if reaches((x,y))),None) for side,y in [('top',bed[1]-diameter/2-.01),('bottom',bed[3]+diameter/2+.01)]}
        paths[str(round(diameter*1000))]=dict(targets=targets,both=all(targets.values()),start=start)
    results[state]=dict(hardCollisions=clashes,doorHits=door,paths=paths)
assert d['bed'][1]>=.70514
assert all(not r['hardCollisions'] and not r['doorHits'] for r in results.values())
out=dict(results=results,nominalFootClearanceMm=600,wardrobeGrossVolumeRatioTo600Deep=350/600,
         limitations=['600mm is zero-margin nominal clearance; 20mm grid may miss its exact centerline. Do not claim comfortable or accessible clearance.',
                      'Only desktop projects over unverified sill zone; chair and human floor envelope remain in the main rectangle.',
                      'Desk support, seated knees and feet, chair back, wardrobe hanging capacity and access hardware remain unverified.',
                      'Wardrobe depth reduction is a new proposed tradeoff, not user-approved full-depth storage.'])
(p/'thin-audit.json').write_text(json.dumps(out,indent=2))
print(json.dumps(out,indent=2))
