# render Context

## Purpose
Canvas rendering for hex grid, game entities, and UI elements.

## Public API (index.js)

### renderFrame
`renderFrame(ctx, canvas, state, view, overlay = null)` — renders a single frame

#### Parameters
| Param | Type | Description |
|-------|------|-------------|
| `ctx` | CanvasRenderingContext2D | Canvas 2D context |
| `canvas` | HTMLCanvasElement | Canvas element (for dimensions) |
| `state` | Object | Game state with `hexGrid`, `player`, `enemies` |
| `view` | Object | View state: `{ panX, panY, zoom }` |
| `overlay` | Object \| null | Optional overlay hints (see below) |

#### Overlay Parameter
The `overlay` object enables optional visual overlays during rendering:

```js
{
  fireball: {
    centerHex: { q: number, r: number }  // Target hex for fireball AOE
  }
}
```

**Fireball overlay**: When `overlay.fireball.centerHex` is provided, draws:
- Red outlined hexes within range 3 of the center hex (AOE preview)
- Red dot at the center hex (targeting indicator)

### Animation Exports
- `startPlayerAnimation(from, to, onComplete)` — animate player movement
- `startEnemyAnimations(moves, onComplete)` — animate enemy movements
- `isAnimatingPlayer()` — returns true if player animation in progress
- `isAnimatingEnemies()` — returns true if enemy animations in progress
- `setPlayerHeldDirection(direction)` — set held movement direction for drift
- `setPlayerBoundaryCallback(callback)` — set boundary check for drift movement
- `resetPlayerDrift()` — reset player drift state

## Key Files
- `grid.js`: Hex grid drawing with spiral gradient fill. Contains color utilities.
- `entities.js`: Player (and future enemy) rendering.
- `overlays.js`: Movement/attack range overlays.
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
