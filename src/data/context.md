# data Context

## Purpose
- Static data for cards, gear, enemies, shop.

## Public API (index.js)
- Export data collections and helper accessors.

## Key Files
- cards.js: card definitions.
- gear.js: gear definitions.
- enemies.js: enemy definitions.
- shop.js: shop setup.

## Invariants / Rules
- Keep IDs stable; avoid logic in data modules.

## Inputs / Dependencies
- None (data only).

## Outputs / Side Effects
- None.

## Notes
- MVP-only data first; expand later.

## Future Refactor
- Split into finer-grained modules as complexity grows; update index.js wiring accordingly.
