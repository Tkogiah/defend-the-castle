# core Context

## Purpose
- Game state and rules logic (turn flow, actions, outcomes).

## Public API (index.js)
- Export state creators/reducers and rule functions.

## Invariants / Rules
- No rendering or input handling.
- Pure logic; no DOM access.

## Inputs / Dependencies
- Depends on hex utilities for grid/path checks.
