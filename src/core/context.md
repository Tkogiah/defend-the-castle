# core Context

## Purpose
- Game state and rules logic (turn flow, actions, outcomes).

## Public API (index.js)
- Export state creators/reducers and rule functions.

## Key Files
- state.js: state shape + pure state updaters.
- rules.js: turn flow, win/lose checks, action rules.

## Invariants / Rules
- No rendering or input handling.
- Pure logic; avoid DOM access.

## Inputs / Dependencies
- Depends on hex utilities for grid/path checks.

## Outputs / Side Effects
- Returns new state (pure updates).

## Notes
- Keep MVP constraints in sync with specs.
