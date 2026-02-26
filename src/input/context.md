# input Context

## Purpose
- Input handling for camera controls and movement intents.

## Public API (index.js)
- `setupInputControls(canvas, view, options)`

## Invariants / Rules
- No game logic; emit intents only.
- Must not mutate game state directly.

## Inputs / Dependencies
- `../config/index.js` defaults.
- View state object: `{ panX, panY, zoom }`.
