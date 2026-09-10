"""Read-only source PDF inspection; diagnostic evidence, no model replacement."""
import hashlib
import json
import subprocess
import html
from pathlib import Path
import pdfplumber

ROOT = Path(__file__).resolve().parent
PDF = Path(r"C:\Users\vv-dev-work\Desktop\1号房.pdf")
profiles = json.loads(subprocess.check_output([r"D:\Tools\NodeJS\node.exe", "--input-type=module", "-e", "import {windowProfiles} from './window-profiles.js';console.log(JSON.stringify(windowProfiles));"], cwd=ROOT, encoding="utf-8"))
dimensions = json.loads((ROOT / "source-dimension-audit.json").read_text(encoding="utf-8"))
assert hashlib.sha256(PDF.read_bytes()).hexdigest().upper() == dimensions['sources'][0]['sha256']
sx = next(c for c in dimensions['chains'] if c['id']=='top')['inferred_pdf_pt_per_m']
sy = next(c for c in dimensions['chains'] if c['id']=='right')['inferred_pdf_pt_per_m']
def xy(point):
    x, top = point
    return (top-94.4+35, 429.36-x+75)
def pair(point):
    return ','.join(f'{v:.3f}' for v in xy(point))
with pdfplumber.open(PDF) as document:
    page = document.pages[0]
    # Full page is retained so the rotated height annotations at the margins
    # cannot be lost by the old tightly cropped marketing-plan preview.
    raster = page.to_image(resolution=180).original
    raster.rotate(90, expand=True).save(ROOT / "source-window-full-page.png")
    for name, bbox in {"master": (340, 752, 405, 784), "child": (200, 752, 245, 784)}.items():
        page.crop(bbox).to_image(resolution=420).original.rotate(270, expand=True).save(ROOT / f"source-window-label-{name}.png")
    svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 650"><rect width="740" height="650" fill="#fbfaf6"/>',
         '<g font-family="Microsoft YaHei,sans-serif" fill="#373731"><text x="25" y="28" font-size="17">1 号房 · 原图窗高与窗区核对</text><text x="25" y="48" font-size="9">7 组窗区 / 11 段窗面，不等于 11 扇开启窗 · 直接复制原始矢量 · 图上方不代表北</text></g>',
         '<g fill="none" stroke="#b8b6ab" stroke-width=".65">']
    for line in list(page.lines[:97])+[page.lines[i] for i in [1926,1927,2617,2618]]:
        svg.append(f'<path d="M {pair((line["x0"],line["top"]))} L {pair((line["x1"],line["bottom"]))}"/>')
    for index in list(range(16))+[17,2054]:
        path=[]
        for command in page.curves[index]['path']:
            path.append('Z' if command[0]=='h' else command[0].upper()+' '+' '.join(pair(p) for p in command[1:]))
        svg.append(f'<path d="{" ".join(path)}"/>')
    svg.append('</g>')
    rows=[]
    for p in profiles:
        segments=[]
        for indices in p['sourceLines']:
            records=[]
            for index in indices:
                line=page.lines[index]
                a,b=[line['x0'],line['top']],[line['x1'],line['bottom']]
                span=((b[1]-a[1])**2/sx**2+(b[0]-a[0])**2/sy**2)**.5*1000
                records.append({'line_index':index,'a_pdf':a,'b_pdf':b,'vector_span_mm':round(span,2)})
                svg.append(f'<path d="M {pair(a)} L {pair(b)}" fill="none" stroke="#638d8b" stroke-width=".8"/>')
            segments.append({'source_strokes':records,'stroke_span_range_mm':[min(r['vector_span_mm'] for r in records),max(r['vector_span_mm'] for r in records)]})
        middle=segments[0]['source_strokes'][0]
        x,y=xy([(middle['a_pdf'][i]+middle['b_pdf'][i])/2 for i in range(2)])
        dx,dy={'W01':(0,12),'W02':(18,0),'W03':(0,13),'W04':(16,0),'W05':(0,13),'W06':(0,14),'W07':(-18,0)}[p['id']]
        svg.append(f'<g font-family="Microsoft YaHei,sans-serif" font-size="9" text-anchor="middle"><rect x="{x+dx-13}" y="{y+dy-8}" width="26" height="14" rx="3" fill="#dfeae5"/><text x="{x+dx}" y="{y+dy+2}" fill="#3f6b61">{p["id"]}</text></g>')
        rows.append({**p,'sourceHeightReading':'原PDF页边轮廓字人工视觉读取，并非PDF可检索文字','segments':segments,'horizontalPrecision':'四条平行窗线的跨度范围，不是窗洞净宽或订货宽；端部/窗框未深化'})
    svg.append('<g font-family="Microsoft YaHei,sans-serif" fill="#373731" font-size="10">')
    svg.append('<text x="25" y="377">编号 / 窗区</text><text x="275" y="377">原图 LD / CH（mm）</text><text x="475" y="377">当前设计处理</text>')
    for i,p in enumerate(profiles):
        y=402+i*23
        svg.append(f'<text x="25" y="{y}">{p["id"]}　{html.escape(p["label"])}</text><text x="275" y="{y}">{round(p["sourceSill"]*1000)} / {round(p["sourceHeight"]*1000)}</text><text x="475" y="{y}">{"保留用户大玻璃方案；高度待复尺" if p.get("userOverride") else "按原图竖向标注修正；横向尚未全校准"}</text>')
    svg.extend(['<text x="25" y="580">LD 按离地高度、CH 按窗高解读；不是承重、窗台板厚或可拆除依据。</text>',
                '<text x="25" y="600">原图三卧 550 / 1700；厨房与两卫 900 / 1200。阳台改造须核验护栏、防坠、抗风和物业条件。</text>',
                '<text x="25" y="622">本图只核对窗区及高度，不是全屋几何、面积、开启扇、玻璃规格或施工验收。</text></g></svg>'])
    (ROOT/'source-window-check.svg').write_text('\n'.join(svg),encoding='utf-8')
    (ROOT/'source-window-schedule.json').write_text(json.dumps({'source_sha256':hashlib.sha256(PDF.read_bytes()).hexdigest().upper(),'window_zone_count':len(rows),'window_face_count':sum(len(p['sourceLines']) for p in profiles),'windows':rows,'installationVerified':False},ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({"source_sha256": hashlib.sha256(PDF.read_bytes()).hexdigest().upper(),
                      "page_pt": [page.width, page.height],
                      "output": "source-window-full-page.png"}, ensure_ascii=False))
