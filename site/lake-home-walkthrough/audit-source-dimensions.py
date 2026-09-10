"""Read PDF dimension witnesses; emit an audit, never a replacement floor plan.

Line indices and label-to-chain mapping were checked against the rotated full
page. Use extension-line coordinates, not the shortened dimension strokes.
"""
import hashlib
import json
import subprocess
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parent
PDF = Path(r"C:\Users\vv-dev-work\Desktop\1号房.pdf")
DWG = Path(r"C:\Users\vv-dev-work\Desktop\AC-6-P-平面图.dwg")
RECOVERED_CAD = ROOT.parent / "cad-evidence" / "recovered-fields.json"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def bounds(space):
    points = [p for poly in space["polygons"] for p in poly]
    return [max(p[i] for p in points) - min(p[i] for p in points) for i in (0, 1)]


def area(space):
    return sum(abs(sum(p[0] * poly[(i + 1) % len(poly)][1]
                       - poly[(i + 1) % len(poly)][0] * p[1]
                       for i, p in enumerate(poly))) / 2
               for poly in space["polygons"])


with pdfplumber.open(PDF) as document:
    page = document.pages[0]
    words = page.extract_words()
    lines = page.lines
    definitions = [
        ("top", "上侧横向尺寸链", "top", [161,160,155,150,143,138,131,126,119,114,107,102,97],
         [600,2040,750,190,1910,200,6090,220,1950,100,2800,1000], 17850, [165,166]),
        ("bottom", "入户侧横向尺寸链", "top", [266,265,258,253,246,241,236,231,224,219,214],
         [1700,100,1000,100,2600,1100,6440,110,3500,600], 17250, [270,271]),
        ("left", "左侧纵向尺寸链（图上至图下）", "x0", [275,276,287,288,293,298,305],
         [1490,200,570,2900,120,1650], 6930, [309,310]),
        ("right", "右侧纵向尺寸链（图上至图下）", "x0", [170,171,176,181,186,193,200,205],
         [600,2340,1050,210,350,1600,750], 6900, [209,210]),
    ]
    chains = []
    for key, label, axis, indices, values, total, total_indices in definitions:
        coords = [lines[i][axis] for i in indices]
        assert len(coords) == len(values) + 1
        assert sum(values) == total
        assert str(total) in [w["text"] for w in words]
        span = abs(lines[total_indices[1]][axis] - lines[total_indices[0]][axis])
        assert abs(abs(coords[-1] - coords[0]) - span) < 1e-6
        scale = span / (total / 1000)
        segments = []
        for n, printed in enumerate(values):
            vector = abs(coords[n+1] - coords[n])
            segments.append({"printed_mm": printed, "witness_line_indices": indices[n:n+2],
                             "witness_coords_pt": [round(coords[n],2),round(coords[n+1],2)],
                             "vector_span_pt": round(vector,4),
                             "inferred_mm_at_chain_scale": round(vector/scale*1000,3),
                             "residual_mm": round(vector/scale*1000-printed,3)})
        chains.append({"id": key, "label": label, "axis_in_unrotated_pdf": axis,
                       "printed_total_mm": total, "total_witness_lines": total_indices,
                       "vector_total_pt": round(span,4), "inferred_pdf_pt_per_m": scale,
                       "old_36pt_conversion_mm": round(span/36*1000,3), "segments": segments})

spec = json.loads((ROOT / "plan-spec.json").read_text(encoding="utf-8"))
live_rooms = json.loads(subprocess.check_output(
    [r"D:\Tools\NodeJS\node.exe", "--input-type=module", "-e",
     "import {rooms,P} from " + json.dumps((ROOT/"plan.js").as_uri()) +
     "; console.log(JSON.stringify(rooms.map(r=>({id:r.id,polygons:[r.poly.map(P)]}))));"],
    encoding="utf-8"))
live = {s["id"]:s for s in live_rooms}
comparisons = []
for key, name, model, printed, reference in [
    ("living-width", "客厅主矩形横向", bounds(live["living"])[0]*1000, 6090, "top[6]；plan.js living.poly 横向"),
    ("kitchen-width", "厨房窗侧净宽", (live["kitchen"]["polygons"][0][1][0]-live["kitchen"]["polygons"][0][0][0])*1000, 1910, "top[4]；plan.js kitchen.poly 前两点"),
    ("bath1-width", "公卫横向净宽", bounds(live["bath1"])[0]*1000, 1700, "bottom[0]；plan.js bath1.poly"),
    ("bath1-depth", "公卫纵向净深", bounds(live["bath1"])[1]*1000, 1650, "left[5]；plan.js bath1.poly"),
    ("bath2-width", "主卫横向净宽", bounds(live["bath2"])[0]*1000, 1950, "top[8]；plan.js bath2.poly"),
    ("bed3-width", "儿童房下侧主段净宽", (live["bed3"]["polygons"][0][1][0]-live["bed3"]["polygons"][0][0][0])*1000, 3500, "bottom[8]；plan.js bed3.poly 前两点"),
]:
    comparisons.append({"id":key,"label":name,"printed_mm":printed,"model_mm":round(model,3),
                        "difference_mm":round(model-printed,3),"reference":reference,
                        "scope":"对应局部墙面/多边形跨度；不是整房实测或施工验收"})

cad = json.loads(RECOVERED_CAD.read_text(encoding="utf-8"))
cad_walls = {w["handle"]:w for w in cad["walls"] if w["block"] == "AX-120-COMP-WALL"}
upper, lower = cad_walls[246088], cad_walls[252126]
assert abs(upper["start"][1]-upper["end"][1]) < .001
assert abs(lower["start"][1]-lower["end"][1]) < .001
assert upper["end"][0] > upper["start"][0] and lower["end"][0] < lower["start"][0]
cad_clear = upper["start"][1]-upper["right"]-lower["start"][1]-lower["right"]
output = {
    "status":"source_audit_not_geometry_approval", "date":"2026-09-05",
    "sources":[{"path":str(p),"sha256":digest(p)} for p in [PDF,DWG,RECOVERED_CAD,ROOT/"plan.js",ROOT/"plan-spec.json"]],
    "pdf":{"pages":1,"size_pt":[page.width,page.height],"line_count":len(lines),
           "dimension_units":"mm","geographic_north_confirmed":False,
           "printed_room_areas_found":False},
    "chains":chains,"model_comparisons":comparisons,
    "areas":[{"id":s["id"],"model_m2":round(area(s),4),"source_printed_target":s.get("target_area")}
             for s in spec["spaces"]],
    "validation_gaps":{"target_area_count":sum("target_area" in s for s in spec["spaces"]),
                       "expected_adjacencies_count":len(spec.get("expected_adjacencies",[])),
                       "note":"缺目标面积与预期邻接约束，原 validator PASS 不证明尺寸准确或完整拓扑正确。"},
    "cad_crosscheck":{"living_clear_span_diagnostic_mm":round(cad_clear,3),"pdf_printed_mm":6090,
                      "difference_mm":round(cad_clear-6090,3),"wall_handles":[246088,252126],
                      "source":"../cad-evidence/recovered-fields.json；诊断恢复不是完整官方T3"},
    "limits":["原图未找到房间面积标签，不反推伪造 target_area。",
              "约36.155pt/m是由总尺寸线推导的校准比例，现场净尺寸仍未知。",
              "小段矢量坐标有舍入；保留印刷尺寸优先，不把全屋直接等比缩放。",
              "本报告不证明净空、门扇扫掠、层高、柱截面、设备机位或工程可行。",
              "现有模型和早期矢量抽取均未被本脚本覆盖。"]
}
(ROOT / "source-dimension-audit.json").write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({"chains":[{k:c[k] for k in ["id","printed_total_mm","inferred_pdf_pt_per_m","old_36pt_conversion_mm"]}
                            for c in chains],"model_comparisons":comparisons,
                  "validation_gaps":output["validation_gaps"]},ensure_ascii=False,indent=2))
