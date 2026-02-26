# hex Context

## Purpose
- Hex grid utilities for axial coordinates, spiral labeling, and path helpers.

## Public API (index.js)
- Coordinate helpers, grid utilities, spiral labeling functions.

## Invariants / Rules
- Pointy-top axial coordinates (q, r) with implicit s = -q - r.
- Board radius is 5 (91 hexes) for MVP.
- Spiral path is clockwise from center, starting east.

## Inputs / Dependencies
- `../config/index.js` for `BOARD_RADIUS` default.
