#!/usr/bin/env python3
"""Validate deterministic floor-plan geometry without third-party packages."""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Any, Iterable


Point = tuple[float, float]
Segment = tuple[Point, Point]


def polygon_area(points: list[Point]) -> float:
    return abs(sum(
        points[i][0] * points[(i + 1) % len(points)][1]
        - points[(i + 1) % len(points)][0] * points[i][1]
        for i in range(len(points))
    )) / 2


def edges(points: list[Point]) -> Iterable[Segment]:
    for index, point in enumerate(points):
        yield point, points[(index + 1) % len(points)]


def segment_length(segment: Segment) -> float:
    (ax, az), (bx, bz) = segment
    return math.hypot(bx - ax, bz - az)


def point_line_distance(point: Point, line: Segment) -> float:
    (px, pz), ((ax, az), (bx, bz)) = point, line
    length = math.hypot(bx - ax, bz - az)
    if length == 0:
        return math.hypot(px - ax, pz - az)
    return abs((bx - ax) * (az - pz) - (ax - px) * (bz - az)) / length


def shared_collinear_length(first: Segment, second: Segment, tolerance: float) -> float:
    if segment_length(first) <= tolerance or segment_length(second) <= tolerance:
        return 0.0
    if point_line_distance(second[0], first) > tolerance or point_line_distance(second[1], first) > tolerance:
        return 0.0

    (ax, az), (bx, bz) = first
    dx, dz = bx - ax, bz - az
    length = math.hypot(dx, dz)
    ux, uz = dx / length, dz / length

    def projection(point: Point) -> float:
        return (point[0] - ax) * ux + (point[1] - az) * uz

    first_min, first_max = 0.0, length
    second_values = sorted((projection(second[0]), projection(second[1])))
    return max(0.0, min(first_max, second_values[1]) - max(first_min, second_values[0]))


def all_edges(space: dict[str, Any]) -> list[Segment]:
    output: list[Segment] = []
    for polygon in space.get("polygons", []):
        points = [(float(point[0]), float(point[1])) for point in polygon]
        output.extend(edges(points))
    return output


def validate(data: dict[str, Any]) -> tuple[list[str], list[str], dict[str, float]]:
    errors: list[str] = []
    warnings: list[str] = []
    computed: dict[str, float] = {}
    tolerances = data.get("tolerances", {})
    area_tolerance = float(tolerances.get("area", 0.05))
    coordinate_tolerance = float(tolerances.get("coordinate", 0.01))

    spaces_list = data.get("spaces", [])
    walls_list = data.get("walls", [])
    openings = data.get("openings", [])
    spaces = {space.get("id"): space for space in spaces_list if space.get("id")}
    walls = {wall.get("id"): wall for wall in walls_list if wall.get("id")}

    if len(spaces) != len(spaces_list):
        errors.append("Space ids must be present and unique.")
    if len(walls) != len(walls_list):
        errors.append("Wall ids must be present and unique.")

    for space_id, space in spaces.items():
        polygons = space.get("polygons", [])
        if not polygons:
            errors.append(f"Space {space_id!r} has no polygons.")
            continue
        total = 0.0
        for polygon_index, polygon in enumerate(polygons):
            if len(polygon) < 3:
                errors.append(f"Space {space_id!r} polygon {polygon_index} has fewer than 3 vertices.")
                continue
            points = [(float(point[0]), float(point[1])) for point in polygon]
            area = polygon_area(points)
            if area <= coordinate_tolerance * coordinate_tolerance:
                errors.append(f"Space {space_id!r} polygon {polygon_index} has zero or negligible area.")
            total += area
        computed[space_id] = total
        if "target_area" in space:
            target = float(space["target_area"])
            delta = total - target
            if abs(delta) > area_tolerance:
                errors.append(
                    f"Space {space_id!r} area is {total:.3f} m²; target is {target:.3f} m² "
                    f"(delta {delta:+.3f} m²)."
                )

    for wall_id, wall in walls.items():
        try:
            segment = (tuple(map(float, wall["a"])), tuple(map(float, wall["b"])))
        except (KeyError, TypeError, ValueError):
            errors.append(f"Wall {wall_id!r} must have numeric a and b endpoints.")
            continue
        if segment_length(segment) <= coordinate_tolerance:
            errors.append(f"Wall {wall_id!r} has zero or negligible length.")
        for space_id in wall.get("separates", []):
            if space_id not in spaces and space_id != "exterior":
                errors.append(f"Wall {wall_id!r} references missing space {space_id!r}.")

    opening_ids: set[str] = set()
    for opening in openings:
        opening_id = opening.get("id")
        if not opening_id or opening_id in opening_ids:
            errors.append("Opening ids must be present and unique.")
            continue
        opening_ids.add(opening_id)
        wall_id = opening.get("wall_id")
        wall = walls.get(wall_id)
        if wall is None:
            errors.append(f"Opening {opening_id!r} references missing wall {wall_id!r}.")
            continue
        wall_segment = (tuple(map(float, wall["a"])), tuple(map(float, wall["b"])))
        offset = float(opening.get("offset", 0))
        width = float(opening.get("width", 0))
        if offset < -coordinate_tolerance or width <= coordinate_tolerance:
            errors.append(f"Opening {opening_id!r} has an invalid offset or width.")
        if offset + width > segment_length(wall_segment) + coordinate_tolerance:
            errors.append(f"Opening {opening_id!r} does not fit wall {wall_id!r}.")

        connects = opening.get("connects", [])
        if len(connects) != 2:
            errors.append(f"Opening {opening_id!r} must connect exactly two spaces.")
        for space_id in connects:
            if space_id not in spaces and space_id != "exterior":
                errors.append(f"Opening {opening_id!r} references missing space {space_id!r}.")

        kind = opening.get("kind")
        if kind == "door":
            swing_into = opening.get("swing_into")
            if swing_into not in connects:
                errors.append(f"Door {opening_id!r} swing_into must be one of its connected spaces.")
        elif kind == "window":
            if "exterior" not in connects and not opening.get("interior_window", False):
                errors.append(f"Window {opening_id!r} must connect to exterior unless interior_window is true.")
        else:
            errors.append(f"Opening {opening_id!r} has unsupported kind {kind!r}.")

        separates = set(wall.get("separates", []))
        if separates and set(connects) != separates:
            errors.append(
                f"Opening {opening_id!r} connects {sorted(connects)!r}, but wall {wall_id!r} "
                f"separates {sorted(separates)!r}."
            )

    for adjacency in data.get("expected_adjacencies", []):
        if adjacency.get("kind") != "shared_wall":
            warnings.append(f"Skipping unsupported adjacency kind {adjacency.get('kind')!r}.")
            continue
        a_id, b_id = adjacency.get("a"), adjacency.get("b")
        if a_id not in spaces or b_id not in spaces:
            errors.append(f"Adjacency references missing spaces {a_id!r}, {b_id!r}.")
            continue
        wall_id = adjacency.get("wall_id")
        if wall_id not in walls:
            errors.append(f"Adjacency {a_id!r}/{b_id!r} references missing wall {wall_id!r}.")
            continue
        expected_pair = {a_id, b_id}
        actual_pair = set(walls[wall_id].get("separates", []))
        if expected_pair != actual_pair:
            errors.append(f"Shared wall {wall_id!r} does not separate exactly {sorted(expected_pair)!r}.")

        maximum = 0.0
        for first in all_edges(spaces[a_id]):
            for second in all_edges(spaces[b_id]):
                maximum = max(maximum, shared_collinear_length(first, second, coordinate_tolerance))
        minimum = float(adjacency.get("min_shared_length", coordinate_tolerance))
        if maximum + coordinate_tolerance < minimum:
            errors.append(
                f"Spaces {a_id!r} and {b_id!r} share only {maximum:.3f} m of boundary; "
                f"expected at least {minimum:.3f} m. Check for a gap or offset wall."
            )

    return errors, warnings, computed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("spec", type=Path, help="Path to the floor-plan JSON specification")
    parser.add_argument("--json", action="store_true", help="Emit a machine-readable result")
    args = parser.parse_args()

    try:
        data = json.loads(args.spec.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: cannot read specification: {exc}", file=sys.stderr)
        return 2

    errors, warnings, computed = validate(data)
    if args.json:
        print(json.dumps({"ok": not errors, "errors": errors, "warnings": warnings, "areas": computed}, ensure_ascii=False, indent=2))
    else:
        for space_id, area in computed.items():
            print(f"AREA {space_id}: {area:.3f} m²")
        for warning in warnings:
            print(f"WARNING: {warning}")
        for error in errors:
            print(f"ERROR: {error}")
        print("PASS" if not errors else f"FAIL ({len(errors)} error(s))")
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
