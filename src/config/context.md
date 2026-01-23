# config Context

## Purpose
- Centralized runtime constants used across modules.

## Public API (index.js)
- Export constants and config values.

## Key Files
- constants.js: project-wide numeric constants.

## Invariants / Rules
- Keep constants stable across modules; avoid duplicating values elsewhere.

## Inputs / Dependencies
- None.

## Outputs / Side Effects
- None.

## Notes
- Update when a constant changes meaning or default value.

## Future Refactor
- Split into finer-grained modules as complexity grows; update index.js wiring accordingly.
