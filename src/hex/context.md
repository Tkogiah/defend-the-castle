# hex Context

## Purpose
Hex grid utilities for axial coordinate system: grid generation, coordinate helpers, distance calculations, and spiral labeling.

## Public API (index.js)

### Coordinate Helpers (coords.js)
| Export | Description |
|--------|-------------|
| `hexKey(q, r)` | Convert axial coords to string key |
| `parseHexKey(key)` | Parse string key to `{ q, r }` |
| `DIR` | Direction vectors (E, SE, SW, W, NW, NE) |
| `CLOCKWISE_AFTER_EAST` | Direction order for ring traversal |
| `AXIAL_DIRECTIONS` | Array of neighbor offset objects |
| `axialDistance(q1, r1, q2, r2)` | Distance between two hexes |
| `distanceBetween(a, b)` | Distance between two hex objects |
| `ringIndex(q, r)` | Ring number (distance from center) |
| `hexCountForRadius(radius)` | Total hex count for given radius |
| `inRadiusBoard(q, r, radius)` | Check if hex is within radius |
| `areAxialNeighbors(q1, r1, q2, r2)` | Check if two hexes are adjacent |

### Grid Utilities (grid.js)
| Export | Description |
|--------|-------------|
| `generateHexGrid(radius)` | Create hex grid Map |
| `getAllHexes(hexGrid)` | Get all hexes as array |
| `getHexesByRing(hexGrid, ring)` | Get hexes in specific ring |
| `getNeighborOffsets()` | Get neighbor direction offsets |
| `getNeighbors(q, r)` | Get all 6 neighbor coords |
| `getValidNeighbors(q, r, hexGrid)` | Get neighbors that exist in grid |
| `getHexesInRange(hexGrid, q, r, range)` | Get hexes within range |
| `findPathTowardCenter(hexGrid, q, r)` | Get neighbor closest to center |

### Spiral Labeling (spiral.js)
| Export | Description |
|--------|-------------|
| `generateRadialSpiralAxial(radius)` | Generate spiral data structure |
| `getSpiralData(radius)` | Get cached spiral data |
| `getSpiralLabel(q, r, radius)` | Get spiral label for hex |
| `getSpiralAxial(label, radius)` | Get axial coords for label |
| `neighborsOfLabel(label, spiral)` | Get labeled neighbors |

## Key Files
- `coords.js`: Coordinate helpers, direction constants, distance functions.
- `grid.js`: Grid generation, neighbor utilities, range helpers.
- `spiral.js`: Spiral labeling and label-to-axial mapping.
- `index.js`: Re-exports public API.

## Invariants / Rules
- Pointy-top axial coordinates (q, r) with implicit s = -q - r.
- Center hex is (0, 0), ring 0.
- Board radius is 5 (91 hexes) for MVP.
- Spiral path is clockwise from center, starting east.

## Inputs / Dependencies
- `../config/index.js`: `BOARD_RADIUS` default.

## Outputs / Side Effects
- Pure data helpers; no DOM or rendering.
- Spiral data is cached per radius.

## Notes
- Spiral path matches rainbow gradient fill in render module.
- Direction constants used by both grid traversal and spiral generation.
