# input Context

## Purpose
- Input handling (camera pan/zoom + movement intents).

## Public API (index.js)
- setupInputControls(canvas, view, options)

## Key Files
- camera.js: pan/zoom logic.
- movement.js: click/keyboard intent emission.

## Invariants / Rules
- No game logic; emit intents only.
- Input must not mutate game state directly.

## Inputs / Dependencies
- Depends on config constants and view transform.

## Outputs / Side Effects
- Attaches DOM event listeners; returns cleanup function.

## Notes
- Keyboard intents are directional; path validity is enforced elsewhere.
