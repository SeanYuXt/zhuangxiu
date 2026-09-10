# Failure modes and prevention

## Oversized corridor or wrong total area

Cause: drawing the visible bounding rectangle and adding a corridor without subtracting it from the published room total.

Prevention: model the room as multiple polygons. Solve the residual corridor area from the target total, then validate the sum.

## Door on the wrong wall

Cause: treating a swing arc as decoration or rebuilding 3D from a screenshot instead of the opening schedule.

Prevention: record each door's wall and connected spaces before modeling. Render a door leaf or swing arc so direction is visible in both top and perspective views.

## Door connects to living room instead of corridor

Cause: using wall orientation alone without an adjacency graph.

Prevention: validate the unordered `connects` pair and require `swing_into` to name one connected space.

## Gap between rooms that should share a wall

Cause: creating two independently positioned walls or moving one room without its neighbor.

Prevention: use one shared segment and identical coordinates. Add an `expected_adjacencies` rule so the validator checks polygon-boundary overlap.

## Duplicate wall or dark seam

Cause: both rooms generate their own copy of the same wall.

Prevention: store the wall once in `walls` and let both rooms reference it. Mesh generation must extrude each wall id once.

## Extra or missing window

Cause: generative completion or copying a generic room template.

Prevention: create a complete opening schedule from the source. Generate only scheduled openings. An interior window requires explicit evidence; ordinary windows connect to `exterior`.

## Fake built-in wardrobe

Cause: drawing only cabinet fronts in the wall plane because the room is too small.

Prevention: give every cabinet a full physical depth and test its footprint. Use a recessed cabinet only when a real niche is present in the wall geometry.

## Furniture does not fit

Cause: choosing furniture by appearance rather than footprint and circulation clearance.

Prevention: place furniture after geometry approval. Check footprints, door swings, balcony access, window clearance, and at least the user-required walking clearance.

## Bay window treated as ordinary floor

Cause: merging the projection into the bedroom polygon.

Prevention: model the bay window separately. Do not count or furnish it unless the published area convention and user instructions allow it.

## Top view is correct but perspective is wrong

Cause: redrawing each view separately or using a generative image for room perspectives.

Prevention: render all views from the same validated geometry. Change only the camera. Use a moderate wide angle and never stretch a room to fit more furniture.

## False construction-level precision

Cause: treating a marketing floor plan's rounded areas, symbolic wall thicknesses, and distorted pixels as survey data.

Prevention: report published-plan accuracy. Request CAD, wall centerlines, or field measurements before claiming construction 1:1.
