# render Context

## Purpose
Canvas rendering for hex grid, game entities, and UI elements.

## Public API (index.js)
- `renderFrame(ctx, canvas, state, view)` — renders a single frame

### Parameters
| Param | Type | Description |
|-------|------|-------------|
| `ctx` | CanvasRenderingContext2D | Canvas 2D context |
| `canvas` | HTMLCanvasElement | Canvas element (for dimensions) |
| `state` | Object | Game state with `hexGrid` and `player` |
| `view` | Object | View state: `{ panX, panY, zoom }` |

## Key Files
- `grid.js`: Hex grid drawing with spiral gradient fill. Contains color utilities.
- `entities.js`: Player (and future enemy) rendering.
- `util.js`: Shared coordinate conversion (`axialToPixel`).
- `index.js`: Frame orchestration; exports public API.

## Invariants / Rules
- Pure rendering; no input handling or state mutation.
- All drawing uses world coordinates; view transform applied in `renderFrame`.
- Hex (0,0) is centered at canvas center before pan/zoom.

## Inputs / Dependencies
- `../hex/index.js`: `ringIndex`, `generateRadialSpiralAxial`, `hexKey`
- `../config/index.js`: `HEX_SIZE`, `BOARD_RADIUS`
- Game state and view state passed to `renderFrame`.

## Outputs / Side Effects
- Draws to canvas context. No other side effects.

## Notes
- Pointy-top hex orientation; grid uses rainbow gradient based on spiral label.
- Color utilities are local to grid.js (not shared outside render module).

## Future Refactor
- Split into finer-grained modules as complexity grows; update index.js wiring accordingly.
