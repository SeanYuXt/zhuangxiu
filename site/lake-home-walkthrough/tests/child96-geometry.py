import json,math
from collections import deque
from pathlib import Path
d=json.loads(Path('site/lake-home-walkthrough/child-study-96.json').read_text())
obs=[d[k] for k in ['bed','desk','wardrobe']]
def dist(x,z,r):return math.hypot(max(r[0]-x,0,x-r[2]),max(r[1]-z,0,z-r[3]))
for i,a in enumerate(obs):
 assert a[0]>=0 and a[1]>=0 and a[2]<=3.5 and a[3]<=2.7
 for b in obs[i+1:]:assert min(a[2],b[2])<=max(a[0],b[0]) or min(a[3],b[3])<=max(a[1],b[1])
for pose in ['parked','seated']:
 x,z=d['chair'][pose];assert all(dist(x,z,r)>=.325 for r in [d['bed'],d['wardrobe']])
minimum=9
for deg in range(91):
 a=math.radians(deg)
 for i in range(101):
  x=-.05+.9*math.sin(a)*i/100;z=2.25-.9*math.cos(a)*i/100
  minimum=min(minimum,*(dist(x,z,r)-.02 for r in obs))
assert minimum>0
# 60 cm circular envelope with chair parked; desk conservatively solid to floor.
c=d['chair']['parked']
def valid(x,z):return .3<=x<=3.2 and .3<=z<=2.4 and all(dist(x,z,r)>=.3-1e-8 for r in obs) and math.hypot(x-c[0],z-c[1])>=.625-1e-8 and dist(x,z,[-.05,2.23,.85,2.27])>=.3-1e-8
q=deque([(30,175)]);seen=set(q);assert valid(.3,1.75)
while q:
 x,z=q.popleft()
 for a,b in [(x+1,z),(x-1,z),(x,z+1),(x,z-1)]:
  if (a,b) not in seen and valid(a/100,b/100):seen.add((a,b));q.append((a,b))
for t in [(220,83),(315,83)]:assert t in seen,t
out={'furnitureOverlap':False,'doorSweepMinimumCm':round(minimum*100,1),'wardrobeBedAisleCm':62,'deskCm':[120,70],'kneeCm':[106,61,70],'route60CmChairParked':['wardrobe','bay approach'],'limitations':['Existing dimensions not site measured','Chair tucked for full-width circulation','Low freestanding headboard; bay approach only on wardrobe side','Cantilever support and window sash unverified']}
Path('.omx/state/child-study-96/geometry-check.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps(out))
