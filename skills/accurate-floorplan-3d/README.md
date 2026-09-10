# Accurate Floorplan 3D

**English** | [简体中文](README.zh-CN.md)

A Codex Skill that converts residential floor-plan images, scans, PDFs, or CAD exports into area-calibrated 2D plans and rotatable 3D structural models.

## Key capabilities

- Calibrates room layouts against labeled dimensions, areas, and topology
- Verifies shared walls, corridors, doors, windows, balconies, and bay windows
- Generates consistent 2D and 3D views from one authoritative plan specification
- Runs locally in a browser with a light three-column interface by default

## Installation

Clone this repository into your Codex Skills directory:

```bash
git clone https://github.com/jackie-csu/accurate-floorplan-3d-skill.git ~/.codex/skills/accurate-floorplan-3d
```

Restart Codex, then invoke the skill with `$accurate-floorplan-3d`.

## Example

Upload a floor-plan image and enter:

> Use `$accurate-floorplan-3d` to accurately reconstruct the labeled layout, room areas, doors, and windows, then generate a locally rotatable 3D model.

See [SKILL.md](SKILL.md) for the complete workflow and accuracy requirements.
