# Module Cleanup Tasks (Derived from MODULE_ALIGNMENT_AUDIT)

Date: 2026-01-27
Purpose: Small, module-scoped cleanup tasks aligned with MODULE_MAP.md (v2).

## Priority Order (recommended)
1) Task 2 — Data-only boundary
2) Task 1 — UI module structure
3) Task 3 — main.js wiring only
4) Task 7 — Allowed import graph enforcement
5) Task 4 — render context update (docs only)
6) Task 6 — add missing UI context doc (docs only)
7) Task 8 — Event naming convention
8) Task 5 — input config constants
9) Task 9 — Error boundary + state schema coordination

## Reasoning (why this order)
- Boundary clarity first: data-only + UI structure reduce cross-module drift early.
- Composition root discipline next: main.js must stay wiring-only or complexity grows.
- Guardrails after structure: enforce allowed imports once structure is clean.
- Documentation after behavior: update docs once the architecture is stable.
- Conventions later: event naming + constants are important but not blockers.
- Policy last: error boundaries and state schema coordination are long-term safeguards.

## How to use this list
- Work top to bottom unless a task blocks current work.
- Keep tasks small (1–2 modules).
- main.js wiring is always its own task.

## Task 1 — UI module structure
Scope: ui/
Goal: Normalize UI module layout.
Notes:
- Add `src/ui/context.md`.
- Add `src/ui/index.js` as UI module entry.
- Move `src/ui.js` → `src/ui/index.js` (or re-export from new index).
- Update imports in `src/main.js` to point to UI module entry.

## Task 2 — Data-only boundary
Scope: data/ and core/
Goal: Enforce "data is static" boundary (or document exception).
Notes:
- Move gear helper logic (`createGearInstance`, `getRandomGearDrop`) out of `data/` to core/ or a dedicated helper module.
- Update imports to go through `src/data/index.js` only (no direct `../data/*.js` from core).

## Task 3 — main.js wiring only
Scope: main.js + core/ + hex/
Goal: Move non-wiring helpers out of main.js.
Notes:
- Relocate `buildSpiralPath`, `resolveStepForDirection` to core/ or hex/ (pure functions).
- Reduce enemy phase decisions in main.js; favor core rules if possible.

## Task 4 — render context update
Scope: render/
Goal: Keep context doc aligned with current API.
Notes:
- Update `src/render/context.md` to document overlay parameter in `renderFrame`.

## Task 5 — input config constants
Scope: input/ + config/
Goal: Centralize runtime constants.
Notes:
- Move camera constants (MIN_ZOOM, MAX_ZOOM, etc.) to config/ or document them as local exceptions.

## Task 6 — add missing UI context doc
Scope: ui/
Goal: Add UI context doc required by AGENTS + MODULE_MAP.
Notes:
- Describe responsibilities, public API, and invariants.

## Task 7 — Allowed import graph enforcement
Scope: core/, render/, input/, ui/, data/, config/
Goal: Align imports with MODULE_MAP allowed-import rules.
Notes:
- Audit and remove any cross-module imports that violate the allowed graph.
- Update import paths to module index.js exports where required.

## Task 8 — Event naming convention
Scope: ui/
Goal: Enforce kebab-case event names and consistent detail payloads.
Notes:
- Audit CustomEvent names in ui/ and main.js wiring.
- Rename events to noun-verb format where inconsistent.

## Task 9 — Error boundary + state schema coordination
Scope: main.js + core/ + ui/ + render/
Goal: Make error handling and state schema coordination explicit in code and docs.
Notes:
- Add minimal error boundary handling in main.js (if missing).
- Treat state schema changes as coordinated tasks (core + render + ui).
