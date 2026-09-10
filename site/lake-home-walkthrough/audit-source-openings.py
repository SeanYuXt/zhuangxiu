"""Extract source door arcs, leaf rectangles and jambs without changing 3D.

This is an evidence drawing, NOT an authoritative, complete floor-plan spec.
Rectangle/curve indices and connected rooms were checked against the PDF page.
"""
import hashlib
import html
import json
import math
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parent
PDF = Path(r"C:\Users\vv-dev-work\Desktop\1号房.pdf")
dimensions = json.loads((ROOT/"source-dimension-audit.json").read_text(encoding="utf-8"))
pdf_hash = hashlib.sha256(PDF.read_bytes()).hexdigest().upper()
assert pdf_hash == dimensions["sources"][0]["sha256"], "PDF changed; recheck source indices first"
sx = next(c for c in dimensions["chains"] if c["id"] == "top")["inferred_pdf_pt_per_m"]
sy = next(c for c in dimensions["chains"] if c["id"] == "left")["inferred_pdf_pt_per_m"]

# PDF-native (x, top); a/b ordered left-to-right or top-to-bottom in displayed plan.
definitions = [
 ("D01","front","入户子母门",[1753,1754],[50,49],[1755,1756],[[168,322.16],[168,361.88]],
  ["exterior","public_circulation"],"exterior",["b","a"],["right","right"],1100),
 ("D02","bed1","老人房门",[726],[33],[727,728],[[233.4,190.16],[233.4,222.32]],
  ["public_circulation","bed1"],"bed1",["b"],["left"],None),
 ("D03","bath1","公卫门",[461],[31],[462,463],[[229.08,186.56],[200.16,186.56]],
  ["public_circulation","bath1"],"bath1",["a"],["bottom"],None),
 ("D04","master","主卧门",[2055],[63],[2056,2057],[[229.8,560.6],[229.8,593.12]],
  ["public_circulation","master"],"master",["b"],["left"],None),
 ("D05","bath2","主卫门",[2033],[56],[2034,2035],[[327,573.44],[327,602.36]],
  ["master","bath2"],"bath2",["b"],["left"],None),
 ("D06","bed3","儿童房门",[1900],[53],[1901,1902],[[225.6,596.78],[193.08,596.78]],
  ["public_circulation","bed3"],"bed3",["b"],["top"],None),
 ("P01","kitchen","厨房通口",[],[],[],[[326.64,303.68],[267.72,303.68]],
  ["public_circulation","kitchen"],None,[],[],None),
]


def pt(point):
    # Paper orientation, not a claim of geographic north or a room redesign.
    x, top = point
    return [top-94.4+35, 429.36-x+75]


def pair(value):
    return ",".join(f"{n:.3f}" for n in value)


def trace_path(commands):
    output = []
    for command in commands:
        if command[0] == "h":
            output.append("Z")
        else:
            output.append(command[0].upper()+" "+" ".join(pair(pt(p)) for p in command[1:]))
    return " ".join(output)


def leaf_points(rect, edge):
    x, y = (rect["x0"]+rect["x1"])/2, (rect["top"]+rect["bottom"])/2
    pairs = {"left":([rect["x0"],y],[rect["x1"],y]),
             "right":([rect["x1"],y],[rect["x0"],y]),
             "top":([x,rect["top"]],[x,rect["bottom"]]),
             "bottom":([x,rect["bottom"]],[x,rect["top"]])}
    return pairs[edge]


with pdfplumber.open(PDF) as document:
    page = document.pages[0]
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 740 435" role="img" aria-labelledby="title desc">',
           '<title id="title">1号房原始门洞与门扇核对</title>',
           '<desc id="desc">原始PDF建筑线、六樘门的七片门扇、厨房通口；不是已完成的装修平面图。</desc>',
           '<rect width="740" height="435" fill="#fbfaf6"/>',
           '<g font-family="Microsoft YaHei,sans-serif" fill="#373731">',
           '<text x="25" y="27" font-size="16">1 号房 · 原始门洞核对</text>',
           '<text x="25" y="46" font-size="9">直接复制 PDF 矢量 · 图上方不代表北向 · 门扇为原图开启状态 · 非施工图</text>',
           '<text x="25" y="61" font-size="8">灰：已有提取线　橙：原图门弧与门扇　绿：本轮补出的主卧入口墙线</text></g>',
           '<g fill="none" stroke="#a4a299" stroke-width=".7">']
    for line in page.lines[:97]:
        a,b=pt([line["x0"],line["top"]]),pt([line["x1"],line["bottom"]])
        svg.append(f'<path d="M {pair(a)} L {pair(b)}"/>')
    for curve in page.curves[:18]:
        svg.append(f'<path d="{trace_path(curve["path"])}"/>')
    svg.append('</g><g fill="none" stroke="#55715b" stroke-width="1.5">')
    supplements=[]
    for index in [1926,1927,2617,2618]:
        line=page.lines[index]
        a,b=[line["x0"],line["top"]],[line["x1"],line["bottom"]]
        supplements.append({"line_index":index,"a_pdf":a,"b_pdf":b})
        svg.append(f'<path d="M {pair(pt(a))} L {pair(pt(b))}"/>')
    # Curve 2054 completes the other short return next to the master jamb.
    svg.append(f'<path d="{trace_path(page.curves[2054]["path"])}"/>')
    svg.append('</g>')
    openings=[]
    for code,key,label,arcs,rects,frames,jambs,connects,swing,ends,edges,printed in definitions:
        width=math.hypot((jambs[1][1]-jambs[0][1])/sx,(jambs[1][0]-jambs[0][0])/sy)*1000
        leaves=[]
        svg.append('<g fill="none" stroke="#ae6c3d" stroke-width="1">')
        for arc,rect_index,hinge_end,edge in zip(arcs,rects,ends,edges):
            curve=page.curves[arc]
            rect=page.rects[rect_index]
            hinge,tip=leaf_points(rect,edge)
            assert max(rect["width"],rect["height"])>10 and min(rect["width"],rect["height"])<1.1
            leaves.append({"source_arc_index":arc,"source_rect_index":rect_index,
                           "hinge_end":hinge_end,"hinge_pdf":hinge,"open_tip_pdf":tip,
                           "hinge_precision":"门扇矩形端面中点，非五金轴线实测",
                           "arc_commands_pdf":curve["path"],
                           "leaf_rect_pdf":[rect["x0"],rect["top"],rect["x1"],rect["bottom"]]})
            svg.append(f'<path d="{trace_path(curve["path"])}"/>')
            corners=[[rect["x0"],rect["top"]],[rect["x1"],rect["top"]],
                     [rect["x1"],rect["bottom"]],[rect["x0"],rect["bottom"]]]
            svg.append(f'<polygon points="{" ".join(pair(pt(p)) for p in corners)}" fill="#c99772"/>')
            h=pt(hinge)
            svg.append(f'<circle cx="{h[0]}" cy="{h[1]}" r="1.6" fill="#ae6c3d"/>')
        for frame in frames:
            svg.append(f'<path d="{trace_path(page.curves[frame]["path"])}"/>')
        svg.append('</g>')
        midpoint=pt([(jambs[0][i]+jambs[1][i])/2 for i in range(2)])
        x,y=midpoint
        # Move door identifiers away from the arcs; do not move source geometry.
        dx,dy={"D01":(0,27),"D02":(0,-43),"D03":(20,0),"D04":(-30,13),
               "D05":(0,13),"D06":(22,0),"P01":(14,0)}[code]
        svg.append(f'<g font-family="Microsoft YaHei,sans-serif" font-size="8" text-anchor="middle"><rect x="{x+dx-13}" y="{y+dy-7}" width="26" height="13" rx="3" fill="#f4e6d9"/><text x="{x+dx}" y="{y+dy+2.5}" fill="#805030">{code}</text></g>')
        openings.append({"id":key,"code":code,"label":label,"connects":connects,
                         "swing_into":swing,"jambs_pdf":jambs,"printed_width_mm":printed,
                         "vector_inferred_width_mm":round(width,2),"leaves":leaves,
                         "frame_curve_indices":frames,
                         "precision":"原图纸面关系；未实测门洞/门框/安装净宽"})
    svg.append('<g font-family="Microsoft YaHei,sans-serif" text-anchor="middle" fill="#5c6255" font-size="10">')
    for name,p in [("老人房",[288,158]),("厨房",[310,267]),("公卫",[187,151]),
                   ("客餐厅 / 公共过道",[285,425]),("主卧",[355,665]),
                   ("主卫",[376,575]),("儿童房",[230,690]),("外置干区",[184,207])]:
        x,y=pt(p)
        svg.append(f'<text x="{x}" y="{y}">{html.escape(name)}</text>')
    svg.extend(['</g><g font-family="Microsoft YaHei,sans-serif" fill="#77766c" font-size="8">',
                '<text x="25" y="402">D01 入户双扇　D02 老人房　D03 公卫内开　D04 主卧　D05 主卫　D06 儿童房　P01 厨房通口</text>',
                '<text x="25" y="417">图中只核对门洞关系；窗、飘窗、墙厚、阳台柱与所有房间边界尚未全部校准。没有绘制新增家具。</text></g></svg>'])

result={"status":"source_opening_evidence_not_complete_plan","source_pdf":str(PDF),
        "sha256":pdf_hash,"coordinate_system":"PDF native x/top in points; north unconfirmed",
        "door_count":6,"leaf_count":sum(len(o["leaves"]) for o in openings),
        "opening_evidence":openings,"additional_architecture_lines":supplements,
        "additional_architecture_curves":[2054],
        "limitations":["推导门洞宽度不是印刷标注或安装净宽；仅入户1100有直接印刷尺寸。",
                       "源图原家具不固定装修摆位；既有模型未在本轮修正。",
                       "早期0..96线和0..17曲线并非完整建筑线集合，不能再把其闭合视为已证明。"]}
assert result["leaf_count"]==7 and len(openings)==7
(ROOT/"source-opening-schedule.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
(ROOT/"source-door-check.svg").write_text("\n".join(svg),encoding="utf-8")
print(json.dumps([{"code":o["code"],"label":o["label"],"inferred_mm":o["vector_inferred_width_mm"],
                   "printed_mm":o["printed_width_mm"],"leaves":len(o["leaves"]),
                   "hinge_ends":[l["hinge_end"] for l in o["leaves"]],"swing_into":o["swing_into"]}
                  for o in openings],ensure_ascii=False,indent=2))
