# Session Summary — 2026-01-25 — Isometric view, fit-to-screen camera, and 3D-ish cylinder entities landed.

Key progress
- Isometric render added via vertical compression; click mapping adjusted to match the new projection.
- Fit-to-screen camera added with configurable padding (`FIT_PADDING`) and canonical isometric scale (`ISO_SCALE_Y = 0.5`).
- Cylinder-style player/enemy rendering added with top-left lighting and drop shadows for 3D-ish depth.
- Enemy HP ring replaced with a horizontal HP bar above the cylinder.
- Enemy stacking keeps a single cylinder with a count label (still capped by count, not separate bodies).
- Roadmap and backend MVP spec documented for staged development and future multiplayer alignment.
- TODO updated with branching/recording workflow planning item.

Files touched (high level)
- `src/render/index.js`, `src/render/grid.js`, `src/render/entities.js`
- `src/input/movement.js`
- `src/config/constants.js`
- `src/main.js`
- `MVP_ROADMAP.md`, `tech/BACKEND_MVP_SPEC.md`, `TODO.md`

Known issues / fixes in progress
- None noted in this session.

Next job reminder
- Stage 1 (data definitions) and Stage 2 (core rules) per `MVP_ROADMAP.md`.
- Decide when to record and publish the snapshot tagged for Stage 1.
