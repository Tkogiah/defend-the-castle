# input Context

## Purpose
Input handling for camera controls (pan/zoom) and movement intents (click-to-move, keyboard directions).

## Public API (index.js)
- `setupInputControls(canvas, view, options)` → returns cleanup function

### Options
| Option | Type | Description |
|--------|------|-------------|
| `hexSize` | number | Hex size in pixels (default from config) |
| `boardRadius` | number | Board radius for bounds filtering (default from config) |
| `onMoveToHex` | function | Callback for click-to-move: `({ q, r }) => void` |
| `onMoveDirection` | function | Callback for keyboard direction: `('N'|'NE'|'E'|'SE'|'S'|'SW'|'W'|'NW') => void` |

## Key Files
- `camera.js`: Pan (pointer drag), zoom (wheel + pinch). Tracks drag state for click detection.
- `movement.js`: Click-to-move and keyboard directional intents. Coordinate conversion helpers.
- `index.js`: Wires camera and movement together; exports public API.

## Invariants / Rules
- No game logic; emit intents only.
- Input must not mutate game state directly.
- Click-to-move only fires if pointer didn't drag (click threshold).
- Keyboard intents are edge-triggered (fire once on direction change).
- Off-board clicks are filtered out (input-layer bounds check).

## Inputs / Dependencies
- `../config/index.js`: HEX_SIZE, BOARD_RADIUS defaults.
- View state object: `{ panX, panY, zoom }`.

## Outputs / Side Effects
- Attaches DOM event listeners to canvas and window.
- Returns cleanup function to remove all listeners.
- Calls provided callbacks with movement intents.

## Notes
- Camera constants (MIN_ZOOM, MAX_ZOOM, etc.) are local to camera.js for now.
- Keyboard intents are directional; path validity is enforced elsewhere.
- Arrow keys are mapped to WASD internally.
