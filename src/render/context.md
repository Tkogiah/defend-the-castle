# render Context

## Purpose
- Canvas rendering for grid, entities, and UI.

## Public API (index.js)
- renderFrame(ctx, canvas, state, view)

## Key Files
- grid.js: draw hex grid + gradient fill.
- entities.js: draw player/enemies.
- frame.js: render orchestration.

## Invariants / Rules
- Pure rendering; no input handling.

## Inputs / Dependencies
- Depends on state + hex utilities + config constants.

## Outputs / Side Effects
- Draws to canvas context.

## Notes
- Keep visuals in sync with movement/path rules.
