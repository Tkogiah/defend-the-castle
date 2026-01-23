# hex Context

## Purpose
- Hex grid generation, coordinate helpers, distances, spiral labeling.

## Public API (index.js)
- Export grid creation, neighbor utilities, and spiral path helpers.

## Key Files
- grid.js: grid generation + ring queries.
- coords.js: axial/pixel conversions + distance helpers.
- spiral.js: spiral labeling + label <-> axial maps.

## Invariants / Rules
- Pointy-top axial coordinates.
- Board radius is 5 (91 hexes) for MVP.

## Inputs / Dependencies
- Uses config constants (HEX_SIZE, BOARD_RADIUS).

## Outputs / Side Effects
- Pure data helpers; no DOM.

## Notes
- Spiral path matches rainbow gradient fill in render.
