# Session Summary — 2026-01-25-b — Movement animation tuning + TODOs for mobile + click ghost.

Key progress
- Tweaked movement feel: faster within-hex drift and smoother snap timing.
- Began addressing click-to-move ghost frame (still present; tracked as TODO).
- Added TODOs for mobile drag-to-move testing and click-to-move ghost fix.

Files touched (high level)
- `src/render/animation.js`
- `src/input/movement.js`
- `src/main.js`
- `TODO.md`

Known issues / fixes in progress
- Click-to-move ghost/phantom frame still occurs at end of animation.

Next job reminder
- Investigate click-to-move ghost (likely in click path vs drift pipeline).
- Test touch drag-to-move on a mobile device and map drag to 6 directions.
