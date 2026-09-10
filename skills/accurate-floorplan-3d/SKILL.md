---
name: accurate-floorplan-3d
description: Convert a residential floor-plan image, scan, PDF, or CAD export into an area-calibrated 2D plan and rotatable 3D structure model with verified room polygons, shared walls, corridors, door connections and swings, windows, balconies, bay windows, centered area labels, and a consistent warm-light three-column browser interface. Use when Codex must reconstruct or correct a 户型图, apartment layout, room model, interior-planning shell, or interactive floor-plan viewer, especially when accuracy problems such as wrong areas, oversized corridors, doors opening into the wrong space, extra windows, duplicated walls, wall gaps, or impossible furniture must be prevented.
---

# Accurate floor-plan 3D

Build geometry from one authoritative plan specification. Never independently redraw the 2D plan, 3D model, room views, and furniture layout.

## Required resources

- Read [references/plan-spec.md](references/plan-spec.md) before creating the plan specification.
- Read [references/failure-modes.md](references/failure-modes.md) before geometry QA or adding furniture.
- Read [references/ui-style.md](references/ui-style.md) before building any interactive browser interface.
- Run `scripts/validate_floorplan.py` on the plan specification before rendering and again after every geometry change.

## Accuracy contract

Treat constraints in this order:

1. User corrections and explicit clarifications.
2. Printed dimensions and printed area labels.
3. Door, window, wall, balcony, and bay-window topology visible in the plan.
4. Pixel measurements from the image.
5. Existing furniture symbols and decorative textures.

Do not call a raster image construction-level 1:1 unless all wall centerlines or clear dimensions are available. State that a model matches the published plan precision when only a marketing floor plan is available.

Do not use image generation to infer or render precise geometry. Use deterministic SVG, Canvas, WebGL, CSS, CAD, or mesh code. Use generative imagery only for style studies after geometry is locked.

## Workflow

### 1. Extract evidence before modeling

Inspect the source at original resolution. Record:

- orientation and north arrow;
- overall dimension chains and internal dimensions;
- printed area of every room, corridor grouping, balcony, and bay window;
- every wall junction and step in the exterior outline;
- every door's wall, connected spaces, hinge, leaf, and swing;
- every window's wall and approximate span;
- inclusions such as “corridor included in living area”;
- user clarifications that override ambiguous graphics;
- unknown dimensions that require inference.

Create a compact evidence table. Do not start 3D rendering while any door connection or shared-wall relationship is unresolved.

### 2. Establish one coordinate system

Use metres and a consistent north-up `(x, z)` plane. Give every wall junction one coordinate. Reuse the same coordinate for all touching rooms.

Prefer printed dimensions. Use image pixels only to estimate missing ratios. If the image is stretched, estimate horizontal and vertical scales separately; never force one pixel scale when the printed chains contradict it.

Represent irregular spaces with multiple polygons or one non-self-intersecting polygon. Do not replace an L-shaped room with a larger rectangle.

### 3. Calibrate areas mathematically

For every space, compute polygon area with the shoelace formula. Never trust a visual impression of area.

For a rectangle with one known side:

`missing_side = target_area / known_side`

For a compound room such as a living room that includes a corridor:

`corridor_area = target_area - sum(known_main_polygons)`

`corridor_depth = corridor_area / corridor_width`

Keep corridor subareas inside the owning room's polygon list so they are not double-counted. A separate corridor annotation may show its subarea but must say which room total includes it.

When printed dimensions and rounded areas differ slightly, preserve topology and dimension chains, then use a small floor-surface inset under the wall thickness to match the published usable area. Never move a shared wall by a large amount just to force a rounded label.

### 4. Lock topology before appearance

Create one adjacency graph and one opening schedule:

- A shared wall is one geometric segment referenced by both spaces, not two nearby parallel walls.
- A door records its wall, both connected spaces, hinge point, width, and `swing_into` space.
- An exterior window connects one room to `exterior` and cannot appear on an interior shared wall.
- A balcony door connects the correct room and balcony.
- A bathroom window and balcony door are distinct openings when the plan shows both.

Encode every important shared wall in `expected_adjacencies`. Encode every door and window in `openings`. Do not add openings that are absent from the schedule.

### 5. Validate the specification

Run:

```bash
python3 scripts/validate_floorplan.py plan.json
```

Treat any error as a block on rendering. Fix the specification, not the validator. The validator checks:

- actual versus target areas;
- malformed or zero-area polygons;
- openings that do not fit their walls;
- doors that connect or swing into the wrong spaces;
- windows that are not exterior-facing;
- expected shared walls that have a gap or insufficient overlap;
- missing wall and space references.

### 6. Produce a 2D structural checkpoint

Render a north-up 2D plan from the validated specification before 3D work. Show:

- wall thicknesses and all openings;
- door leaves or swing arcs, not just anonymous wall gaps;
- each room name and computed area centered on its floor surface;
- corridor subarea with an inclusion note when applicable;
- a target/model area audit table;
- no furniture unless the user requests it.

Compare the 2D checkpoint against the source room by room. Correct the specification once; regenerate every view from it.

### 7. Build the rotatable 3D shell

Extrude floors and walls from the same coordinates. Cut openings from the scheduled walls. Render door leaves in an open state or show swing arcs so the door direction remains visible in perspective.

Provide at least:

- full-plan perspective;
- north-up top view;
- one elevation or wide-angle room view for each requested room;
- rotation, zoom, and wall-opacity controls when interactive output is requested.

Use a moderate wide angle. Keep verticals readable and include the room entrance in room views. Do not change room proportions to make a view look larger.

Apply the default interface from `references/ui-style.md`: warm-light palette, space locator in the left sidebar, the model in the center, area verification in the right sidebar, and perspective/top/2D controls in the upper-right header. Treat this layout as required unless the user explicitly requests another style.

Create a self-contained local HTML/SVG/Canvas/WebGL artifact and launch it in a local browser by default. Use Sites only when the user explicitly requests hosting, publishing, or a shareable URL. Do not require an external API.

### 8. Add furniture only after geometry approval

Place furniture using real footprints and clearance zones. Confirm the full object lies inside the usable floor polygon and does not overlap door swings, windows, radiators, balcony doors, or bay windows.

Model wardrobes and cabinets with full depth. A cabinet cannot consist of doors embedded into a wall unless the plan explicitly contains a niche with sufficient depth. Treat a bay window as non-furniture floor unless the user confirms it is usable.

### 9. Final QA

Perform a room-by-room audit:

- target area equals computed area within tolerance;
- every room has the correct aspect ratio and boundary shape;
- every door connects the intended spaces and shows the correct swing;
- every window matches the source count and wall;
- every required shared wall is continuous with zero unintended gap;
- no duplicate wall creates a dark seam or false thickness;
- balconies and bay windows are not counted twice;
- top-view labels show actual computed areas;
- perspective views derive from the same model, not a recreated scene.
- the interface follows `references/ui-style.md`, with space positioning on the left and view controls in the upper right;
- local browser controls work and the browser console has no errors.

Deliver the model with a short precision note distinguishing published-plan accuracy from construction-survey accuracy.

## Stop conditions

Ask for one known dimension, the CAD file, or a clearer plan when no reliable scale exists. Ask for clarification when a door could connect two materially different spaces. Do not silently guess load-bearing walls, structural columns, plumbing relocation, or construction feasibility.
