# Task 0.5 Plan — Module Boundary Audit

## Goal
- Audit all module imports against MODULE_MAP.md and report violations or concerns.

## Audit Findings
- Verdict: No hard import violations found.
- All modules respect the allowed import graph in MODULE_MAP.md.

## Design Concerns (Not Violations)

### Concern 1 — Logic duplication in ui/ (medium priority)
- Evidence:
  - `src/ui/index.js`: `getEffectiveDisplayDamage`, `getEffectiveDisplaySpeed`
  - `src/core/rules.js`: `getEffectiveDamage`, `getEffectiveSpeed`
- Risk: UI reimplements game-rule calculations; may diverge from core rules over time.
- Proposed follow-up: derive display values via core functions in main.js and pass to UI.

### Concern 2 — ISO_SCALE_Y usage in input/ (low priority)
- Evidence:
  - `src/input/movement.js` imports `ISO_SCALE_Y` from config.
- Risk: input/ depends on isometric rendering tuning. Not a violation, but a coupling signal.
- Proposed follow-up: consolidate screen-to-hex conversion in a shared utility if refactoring.

## Plan
1. Record audit findings in this plan.
2. Add Concern 1 (and optionally Concern 2) to TODO.md under “Later.”
3. No code changes.

## Files
- `docs/task_briefs/TASK_0_5_module_boundary_audit_PLAN.md`
- `TODO.md` (add follow-up items)

## Testing
- Not applicable (audit only).

## Notes
- Boundary cleanup held; no violations detected.
- Concern 1 is the most meaningful follow-up.
