# Module Alignment Audit

Date: 2026-01-27
Scope: Quick scan of current modules vs MODULE_MAP.md. Notes are about boundary drift, missing context files, or logic living in the wrong place.

## Summary
- The module split is mostly intact, but there are notable boundary leaks in main.js, data/, ui/, and input/camera config.
- Some module context docs are missing or out of date.
- A few helper functions likely belong in core/ or hex/ rather than main.js or data/.

## Findings by Module

### main.js (composition root)
Misalignment:
- Contains non-trivial game logic and pathing helpers:
  - buildSpiralPath, resolveStepForDirection
  - enemy phase logic (spawn/move decisions)
  - fireball hover handling and pointer math
- Composition root should only wire modules and pass state.

Suggested direction:
- Move pathing helpers to hex/ or core/ as pure functions.
- Move enemy phase sequencing into core rules (already partially there).
- If hover math is needed, prefer input module callbacks to avoid main.js logic.

### core/
Mostly aligned:
- State + rules are pure (no DOM/canvas).

Misalignment:
- Imports from ../data/cards.js directly instead of src/data/index.js (violates boundary rule).
- Uses Date.now / Math.random in rules for IDs and movement (acceptable but makes state nondeterministic).

Suggested direction:
- Standardize data imports via src/data/index.js.
- Consider centralizing random ID generation if you want test determinism later.

### render/
Mostly aligned:
- Pure canvas drawing, uses overlays/animations.

Misalignment:
- render/context.md does not mention the optional overlay parameter to renderFrame.
- Overlays include fireball targeting now; context should be updated.

Suggested direction:
- Update render/context.md to include overlay parameter and its shape.

### input/
Mostly aligned:
- Emits intents; no game rules.

Misalignment:
- input/camera.js defines constants (MIN_ZOOM, MAX_ZOOM, etc.) that likely belong in config/.
- movement.js exports screenToHex, which is a cross-module helper (OK, but consider if hex/ should own this).

Suggested direction:
- Move camera constants to config/ (or document as local constants).
- Decide whether screenToHex is input-owned (view-based) or hex-owned (math-based).

### ui/
Misalignment:
- No src/ui/context.md (required by module map + AGENTS). 
- UI is split across src/ui.js and src/ui/hand.js (folder + root file). This is a structure mismatch with the module map.

Suggested direction:
- Add src/ui/context.md and an index.js to formalize UI exports.
- Consider moving src/ui.js into src/ui/index.js for consistent module layout.

### data/
Misalignment:
- data/ contains helper logic (createGearInstance, getRandomGearDrop), which violates "data only" rule.

Suggested direction:
- If you want strict data-only, move helper functions to core/ or create data/helpers.js (documented exception).

### config/
Misalignment:
- Some runtime constants live in input/camera.js instead of config/.

Suggested direction:
- Consolidate all constants in config/ or explicitly document local exceptions.

### hex/
Aligned:
- Pure helpers, no side effects.

Notes:
- Ensure context is kept in sync with actual spiral generation source files and exports.

## Missing or Outdated Docs
- src/ui/context.md is missing.
- render/context.md should mention overlay param and fireball overlay usage.

## Suggested Next Steps (after Claude review)
- Decide whether to enforce strict "data only" or allow data helpers with documented exceptions.
- Normalize UI module structure (add context + index.js, move src/ui.js into folder).
- Move main.js helper logic into core/ or hex/.
- Update module context docs to match current behavior.
