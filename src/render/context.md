# render Context

## Purpose
- Canvas rendering for hex grid, entities, and overlays.

## Public API (index.js)
- `renderFrame(ctx, canvas, state, view, overlay = null)`
- Animation helpers (player/enemy movement)

## Invariants / Rules
- Pure rendering; no input handling or state mutation.
- View transforms applied in render; world coords elsewhere.

## Inputs / Dependencies
- `../hex/index.js` utilities.
- `../config/index.js` constants.
- Game state + view state passed in.
