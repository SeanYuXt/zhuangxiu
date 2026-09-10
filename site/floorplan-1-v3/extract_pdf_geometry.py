"""Extract the architectural vector block from the source PDF.

The CAD-exported PDF draws architectural strokes first.  Lines 0..96 are the
wall/window/fixed-boundary block; line 97 begins the dimension block.  The
selected curves are the architectural continuation paths and visible door arcs.
Coordinates are converted to metres without redrawing or rectangularizing.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import pdfplumber


PDF = Path(r"C:\Users\vv-dev-work\Desktop\1号房.pdf")
OUTPUT = Path(__file__).with_name("plan.json")
ORIGIN_TOP = 94.4
ORIGIN_X = 164.4
SCALE = 36.0
ARCHITECTURE_LINE_COUNT = 97
ARCHITECTURE_CURVES = list(range(18))
DOOR_ARCS = [461, 726, 1753, 1900, 2033, 2055]


def line_point(top: float, x: float) -> list[float]:
    return [round((top - ORIGIN_TOP) / SCALE, 4), round((x - ORIGIN_X) / SCALE, 4)]


def path_point(point: tuple[float, float]) -> list[float]:
    x, top = point
    return line_point(top, x)


with pdfplumber.open(PDF) as document:
    page = document.pages[0]

    lines = []
    for index, source in enumerate(page.lines[:ARCHITECTURE_LINE_COUNT]):
        a = line_point(source["top"], source["x0"])
        b = line_point(source["bottom"], source["x1"])
        if math.dist(a, b) <= 0.005:
            continue
        lines.append(
            {
                "id": f"pdf-line-{index:03d}",
                "a": a,
                "b": b,
                "thickness": 0.025 if source.get("linewidth", 0.12) <= 0.12 else 0.04,
                "pdf_linewidth": source.get("linewidth", 0.12),
                "separates": [],
                "source_role": "architectural_vector_stroke",
            }
        )

    paths = []
    for index in ARCHITECTURE_CURVES + DOOR_ARCS:
        source = page.curves[index]
        commands = []
        for item in source.get("path", []):
            command = item[0]
            points = [path_point(point) for point in item[1:] if isinstance(point, tuple)]
            commands.append([command, *points])
        paths.append(
            {
                "id": f"pdf-curve-{index:04d}",
                "kind": "door_arc" if index in DOOR_ARCS else "architectural_path",
                "commands": commands,
                "pdf_linewidth": source.get("linewidth", 0.12),
            }
        )

data = {
    "name": "1号房 - PDF原始矢量结构检查点",
    "units": "m",
    "status": "2d_geometry_approved_by_user",
    "user_corrections": [
        "用户确认第三版原始矢量结构线方向和轮廓正确。",
        "前两版把卧室与卫生间的空间归属搞反；最终模型不得沿用旧房间标签。",
    ],
    "orientation": {
        "source_north_confirmed": False,
        "note": "图纸没有北向箭头；+z 只表示旋转后图纸上方。",
    },
    "precision": {
        "level": "source-vector-trace",
        "note": "二维线段直接来自PDF建筑矢量块，没有按家具猜房间，也没有矩形化。三维仅为同一组原始线段的拉升预览。",
    },
    "extraction": {
        "scale_pdf_points_per_metre": SCALE,
        "line_range": [0, ARCHITECTURE_LINE_COUNT - 1],
        "architecture_curve_indices": ARCHITECTURE_CURVES,
        "door_arc_indices": DOOR_ARCS,
        "source_pdf": str(PDF),
    },
    "tolerances": {"area": 0.05, "coordinate": 0.01},
    "spaces": [
        {
            "id": "source_extent",
            "label": "原图结构范围（未分区）",
            "polygons": [[[0, 0], [18.327, 0], [18.327, 7.36], [0, 7.36]]],
        }
    ],
    "walls": lines,
    "openings": [],
    "expected_adjacencies": [],
    "source_paths": paths,
}

OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Extracted {len(lines)} source lines and {len(paths)} source paths to {OUTPUT}")
