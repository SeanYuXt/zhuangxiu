"""Geometric screening only: circular proxies are not human/accessibility certification."""
import collections
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
STEP = 0.02
HINGE = (2.75, 2.9)
DOOR_WIDTH = 0.89
DOOR_HALF_THICKNESS = 0.02


def point_segment(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    t = max(0.0, min(1.0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
    return math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy)


def rect_distance(p, r):
    return math.hypot(max(r[0] - p[0], 0, p[0] - r[2]), max(r[1] - p[1], 0, p[1] - r[3]))


def overlap(a, b):
    return min(a[2], b[2]) > max(a[0], b[0]) + 1e-9 and min(a[3], b[3]) > max(a[1], b[1]) + 1e-9


def corners(r):
    return [(r[0], r[1]), (r[2], r[1]), (r[2], r[3]), (r[0], r[3])]


def segment_hits_rect(a, b, r):
    lo, hi = 0.0, 1.0
    for i in (0, 1):
        d = b[i] - a[i]
        if abs(d) < 1e-12:
            if not r[i] <= a[i] <= r[i + 2]:
                return False
        else:
            t0, t1 = sorted(((r[i] - a[i]) / d, (r[i + 2] - a[i]) / d))
            lo, hi = max(lo, t0), min(hi, t1)
            if lo > hi:
                return False
    return True


def segment_rect_distance(a, b, r):
    if segment_hits_rect(a, b, r):
        return 0.0
    return min(rect_distance(a, r), rect_distance(b, r), *(point_segment(p, a, b) for p in corners(r)))


def door_tip(angle):
    t = math.radians(angle)
    return HINGE[0] - DOOR_WIDTH * math.cos(t), HINGE[1] - DOOR_WIDTH * math.sin(t)


def path_search(main, obstacles, radius, floor_polygon=None):
    x0, y0, x1, y1 = main
    entry_left, entry_right = 1.86, 2.75
    walls = [((x0, y0), (x1, y0)), ((x0, y0), (x0, y1)),
             ((x1, y0), (x1, y1)), ((x0, y1), (entry_left, y1)),
             ((entry_right, y1), (x1, y1)),
             ((entry_left, y1), (entry_left, 3.2)),
             ((entry_right, y1), (entry_right, 3.2)),
             ((entry_left, 3.2), (entry_right, 3.2))]

    if floor_polygon:
        # Replace the main rectangle with the conditional polygon; retain the same entrance opening.
        walls = [(a, b) for a, b in zip(floor_polygon, floor_polygon[1:] + floor_polygon[:1])
                 if not (abs(a[1] - y1) < 1e-9 and abs(b[1] - y1) < 1e-9)] + walls[3:]

    def clear(p):
        inside = in_polygon(p, floor_polygon) if floor_polygon else x0 <= p[0] <= x1 and y0 <= p[1] <= y1
        inside = inside or entry_left <= p[0] <= entry_right and y1 <= p[1] <= 3.2
        return (inside and all(point_segment(p, a, b) >= radius - 1e-9 for a, b in walls)
                and all(rect_distance(p, r) >= radius - 1e-9 for r in obstacles)
                and point_segment(p, HINGE, door_tip(90)) >= radius + DOOR_HALF_THICKNESS - 1e-9)

    def xy(node):
        return round(node[0] * STEP, 8), round(node[1] * STEP, 8)

    start = (round(2.3 / STEP), round(2.6 / STEP))
    reachable = set()
    queue = collections.deque()
    if clear(xy(start)):
        reachable.add(start)
        queue.append(start)
    while queue:
        u = queue.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            v = u[0] + dx, u[1] + dy
            if v not in reachable and clear(xy(v)) and clear(((u[0] + v[0]) * STEP / 2, (u[1] + v[1]) * STEP / 2)):
                reachable.add(v)
                queue.append(v)

    def reaches(p):
        if not clear(p):
            return False
        i, j = round(p[0] / STEP), round(p[1] / STEP)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                node = i + dx, j + dy
                if node in reachable:
                    q = xy(node)
                    if all(clear((p[0] + (q[0] - p[0]) * t / 4, p[1] + (q[1] - p[1]) * t / 4)) for t in range(5)):
                        return True
        return False

    return reaches, bool(reachable), len(reachable)


def in_polygon(p, polygon):
    inside = False
    for a, b in zip(polygon, polygon[1:] + polygon[:1]):
        if point_segment(p, a, b) < 1e-8:
            return True
        if (a[1] > p[1]) != (b[1] > p[1]) and p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]:
            inside = not inside
    return inside


def audit_layout(layout, main, source_polygon):
    furniture = {name: layout[name] for name in ('bed', 'desk', 'wardrobe') if layout.get(name) is not None}
    result = {'id': layout['id'], 'conditionalFloor': layout.get('conditionalFloor', False), 'states': {}}
    bounds = []
    for name in ('bed', 'desk', 'wardrobe', 'chairTucked', 'chairOccupied'):
        r = layout.get(name)
        if r is None:
            continue
        in_main = r[0] >= main[0] and r[1] >= main[1] and r[2] <= main[2] and r[3] <= main[3]
        conditional = layout.get('conditionalFloor', False) and name in ('desk', 'chairTucked') and r[0] >= main[0] and r[2] <= main[2] and r[3] <= main[3]
        if layout['id'] == 'solid-head-row':
            conditional = layout.get('conditionalFloor', False) and name in ('desk', 'chairTucked', 'chairOccupied')
        polygon_pass = None
        if conditional and not in_main and source_polygon:
            cs = corners(r)
            polygon_pass = all(in_polygon((a[0] + (b[0] - a[0]) * t / 100, a[1] + (b[1] - a[1]) * t / 100), source_polygon)
                               for a, b in zip(cs, cs[1:] + cs[:1]) for t in range(101))
        bounds.append({'item': name, 'withinMain': in_main, 'conditionalWindowFloorRequired': not in_main and conditional,
                       'withinSourcePolygonEdgeSample': polygon_pass, 'boundsPass': in_main or conditional and polygon_pass is True})
    result['bounds'] = bounds
    result['conditionalBoundsLimitation'] = 'Conditional furniture edges checked against source polygon using 101 points per edge; drawing footprint does not establish actual floor or under-desk leg clearance.'
    for state, chair_key in (('tucked', 'chairTucked'), ('occupied', 'chairOccupied')):
        items = dict(furniture, chair=layout[chair_key])
        pairs = [(a, b) for i, a in enumerate(items) for b in list(items)[i + 1:] if overlap(items[a], items[b])
                 and not (state == 'tucked' and {a, b} == {'desk', 'chair'})]
        swing = []
        for name, r in items.items():
            angles = [a for a in range(91) if segment_rect_distance(HINGE, door_tip(a), r) <= DOOR_HALF_THICKNESS + 1e-9]
            if angles:
                swing.append({'item': name, 'anglesDegrees': angles})
        floor_results = {}
        floors = [('main', None)]
        if layout['id'] == 'solid-head-row' and source_polygon:
            floors.append(('conditionalWindowFloor', source_polygon))
        for floor_name, floor_polygon in floors:
            paths = {}
            for diameter in (0.5, 0.6):
                reaches, start_clear, count = path_search(main, list(items.values()), diameter / 2, floor_polygon)
                bed = layout['bed']
                targets = {}
                if layout.get('bedOrientation') == 'vertical':
                    lower = bed[1] + (bed[3] - bed[1]) / 3
                    upper = bed[3] - (bed[3] - bed[1]) / 3
                    ys = [(bed[1] + bed[3]) / 2] + [i * STEP for i in range(math.ceil(lower / STEP), math.floor(upper / STEP) + 1)]
                    for side, x in (('left', bed[0] - diameter / 2 - 0.01), ('right', bed[2] + diameter / 2 + 0.01)):
                        targets[side] = next(([round(x, 4), round(y, 4)] for y in ys if reaches((x, y))), None)
                else:
                    left = bed[0] + (bed[2] - bed[0]) / 3
                    right = bed[2] - (bed[2] - bed[0]) / 3
                    xs = [(bed[0] + bed[2]) / 2] + [i * STEP for i in range(math.ceil(left / STEP), math.floor(right / STEP) + 1)]
                    for side, y in (('top', bed[1] - diameter / 2 - 0.01), ('bottom', bed[3] + diameter / 2 + 0.01)):
                        targets[side] = next(([round(x, 4), round(y, 4)] for x in xs if reaches((x, y))), None)
                path = {'startClear': start_clear, 'reachableGridPoints': count, 'bedLongSideTargets': targets,
                        'bothBedLongSidesReachable': all(targets.values())}
                if layout['id'] == 'wardrobe-row':
                    cabinet = layout['wardrobe']
                    target = (cabinet[0] - diameter / 2 - 0.01, (cabinet[1] + cabinet[3]) / 2)
                    path['wardrobeFrontMiddleTarget'] = list(target)
                    path['wardrobeFrontMiddleReachable'] = reaches(target)
                if layout['id'] == 'solid-head-row':
                    cabinet = layout['wardrobe']
                    target = ((cabinet[0] + cabinet[2]) / 2, cabinet[1] - 0.3)
                    path['wardrobeFrontMiddleTarget'] = list(target)
                    path['wardrobeFrontMiddleReachable'] = reaches(target)
                paths[str(round(diameter * 1000))] = path
            floor_results[floor_name] = paths
        paths = floor_results['main']
        result['states'][state] = {'rectangularCollisions': pairs, 'doorSwingCollisions': swing, 'pathsByDiameterMm': paths,
                                  'underDeskChairAssumption': 'Desk/tucked-chair overlap allowed assuming 450 mm seat and at least 680 mm underside clearance; chair back remains unverified.' if state == 'tucked' else None}
        if layout['id'] == 'solid-head-row':
            result['states'][state]['conditionalPathsByDiameterMm'] = floor_results.get('conditionalWindowFloor')
        if layout['id'] in ('wardrobe-row', 'solid-head-row'):
            cabinet = layout['wardrobe']
            use_zone = [cabinet[0] - 0.6, cabinet[1], cabinet[0], cabinet[3]]
            if layout['id'] == 'solid-head-row':
                use_zone = [cabinet[0], cabinet[1] - 0.6, cabinet[2], cabinet[1]]
            result['states'][state]['wardrobeFrontUseZone'] = {
                'rectangle': use_zone, 'depthMm': 600, 'assumedDoorType': 'sliding',
                'withinMain': use_zone[0] >= main[0] and use_zone[1] >= main[1] and use_zone[2] <= main[2] and use_zone[3] <= main[3],
                'rectangularCollisions': [name for name, rect in items.items() if name != 'wardrobe' and overlap(use_zone, rect)],
                'doorSwingCollisionAnglesDegrees': [angle for angle in range(91) if segment_rect_distance(HINGE, door_tip(angle), use_zone) <= DOOR_HALF_THICKNESS + 1e-9],
                'limitation': 'Shared standing/circulation envelope, not dedicated simultaneous-use clearance; sliding-panel configuration and drawer extension unverified.'}
    reaches, start_clear, count = path_search(main, list(furniture.values()), 0.3)
    chair = layout['chairOccupied']
    center = ((chair[0] + chair[2]) / 2, (chair[1] + chair[3]) / 2)
    result['occupiedChairApproach'] = {'proxyRadiusMm': 300, 'chairExcludedAsObstacle': True, 'targetCenter': center,
                                        'startClear': start_clear, 'reachable': reaches(center), 'reachableGridPoints': count}
    if layout['id'] == 'solid-head-row':
        reaches, start_clear, count = path_search(main, list(furniture.values()), 0.3, source_polygon)
        result['conditionalOccupiedChairApproach'] = {'proxyRadiusMm': 300, 'chairExcludedAsObstacle': True,
            'targetCenter': center, 'startClear': start_clear, 'reachable': reaches(center), 'reachableGridPoints': count}
        bed = layout['bed']
        result['solidHeadWallCheck'] = {'head': layout.get('head'), 'headEdge': [[bed[2], bed[1]], [bed[2], bed[3]]],
            'rightWallGapMm': round((main[2] - bed[2]) * 1000),
            'entireHeadEdgeAlongMainRightWall': layout.get('head') == 'east' and 0 <= main[2] - bed[2] <= 0.03 and main[1] <= bed[1] < bed[3] <= main[3],
            'limitation': 'Uses supplied right main-wall segment; material, services, and headboard installation still require site confirmation.'}
        result['conditionalPathLimitation'] = 'Conditional paths assume the whole source polygon is continuous walkable floor. Window ledge structure and height are unconfirmed; main-only failures remain reported separately.'
    return result


def main():
    data = json.loads((HERE / 'design.json').read_text())
    result = {'method': {'units': 'metres', 'gridMm': 20, 'gridConnectivity': 4,
                         'pathEdgeCheck': 'Endpoints and midpoint; target connector sampled every quarter of one short grid connector.',
                         'doorSwing': '0 through 90 degrees inclusive at 1-degree steps; exact center-segment distance to rectangle, 40 mm capsule thickness. Angular gaps are not swept continuously.',
                         'walkingDoor': 'Door open at 90 degrees remains an obstacle.',
                         'start': [2.3, 2.6], 'bedTargets': 'Middle third of long edges (left/right for vertical beds, top/bottom otherwise), 10 mm extra offset beyond proxy radius.',
                         'limitations': 'Geometric circular-proxy screening, not human movement or accessibility certification. Cannot prove furniture usability or continuous sweep clearance.'},
              'layouts': [audit_layout(layout, data['main'], data.get('sourcePolygon')) for layout in data['layouts']]}
    (HERE / 'audit.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
