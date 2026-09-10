# Plan specification

Use JSON so geometry and validation remain deterministic. Coordinates are metres in a north-up `(x, z)` plane.

## Minimal structure

```json
{
  "name": "Apartment plan",
  "units": "m",
  "tolerances": { "area": 0.05, "coordinate": 0.01 },
  "spaces": [
    {
      "id": "living",
      "label": "客厅",
      "target_area": 21.0,
      "polygons": [
        [[0, 0], [3.207, 0], [3.207, -5.715], [0, -5.715]],
        [[3.207, -2.0], [5.692, -2.0], [5.692, -3.075], [3.207, -3.075]]
      ],
      "subareas": [{ "label": "公用过道", "area": 2.67, "included_in_total": true }]
    }
  ],
  "walls": [
    {
      "id": "wall-bedb-bedc",
      "a": [5.032, -3.269],
      "b": [6.983, -3.269],
      "thickness": 0.12,
      "separates": ["bedB", "bedC"]
    }
  ],
  "openings": [
    {
      "id": "door-bedb",
      "kind": "door",
      "wall_id": "wall-bedb-corridor",
      "offset": 0.15,
      "width": 0.8,
      "connects": ["bedB", "corridor"],
      "swing_into": "bedB"
    },
    {
      "id": "window-bedb-north",
      "kind": "window",
      "wall_id": "wall-bedb-north",
      "offset": 0.48,
      "width": 0.99,
      "connects": ["bedB", "exterior"]
    }
  ],
  "expected_adjacencies": [
    {
      "a": "bedB",
      "b": "bedC",
      "kind": "shared_wall",
      "wall_id": "wall-bedb-bedc",
      "min_shared_length": 1.8
    }
  ]
}
```

## Rules

- List polygon vertices in boundary order. Do not repeat the first vertex.
- Use multiple polygons only for disconnected or intentionally partitioned pieces of one published area total.
- Keep wall endpoints identical at junctions. Avoid visually equivalent but numerically different coordinates.
- Use `exterior` for the outside and an explicit space id for corridors and balconies.
- Set `swing_into` for every hinged door.
- Put every user-confirmed shared wall in `expected_adjacencies`.
- `offset + width` must not exceed the referenced wall length.
- If a corridor is included in another room's printed area, keep its polygon under that room and use `subareas` only for annotation.

## Suggested derivation record

Keep a separate working table while extracting the source:

| Constraint | Value | Confidence | Source |
| --- | ---: | --- | --- |
| Bedroom B area | 5.0㎡ | hard | printed label |
| Bedroom B depth | 2.565m | hard | dimension chain |
| Bedroom B west door | yes | hard | user correction |
| Bedroom B/C shared wall | continuous | hard | user correction |
| Bay-window depth | 0.50m | inferred | pixel ratio |

Do not promote an inferred value above a printed dimension or user correction.
