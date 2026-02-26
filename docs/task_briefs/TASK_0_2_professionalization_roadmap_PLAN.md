# Task 0.2 Plan — Professionalization Roadmap

## Goal
- Define a phased roadmap that professionalizes the repo's docs, testing, CI, and workflow without touching MVP architecture or gameplay code.

## Plan

Phase 1 — Foundation (Immediate)
1. Create `docs/PROJECT_INTENT.md` (one‑pager: what the project is, what MVP success looks like, who the audience is).
2. Create `docs/ARCHITECTURE.md` (summary of module map, data flow, composition root rules; references `MODULE_MAP.md` rather than replacing it).
3. Add the task brief workflow note to `AGENTS.md` (PLAN_REQUEST → PLAN → review → implementation).
4. Add the new docs to the `CONTEXT.md` read order so they are canonical.

Phase 2 — Testing & CI Hardening (Near‑term)
5. Expand unit tests for core/ rules: movement validity, attack/crystal reward, wave/boss HP scaling, end‑turn flow.
6. Expand unit tests for hex/: spiral labels round‑trip, neighbor correctness, path length.
7. Create `docs/CI_CHECKLIST.md` (what must pass before merge to main; include smoke checklist from `NOTES.md`).

Phase 3 — Backend Readiness & Workflow Polish (Later)
8. Add WebSocket integration test (join room → send action → receive state snapshot). Start as a spike if needed.
9. Update `BACKEND_CONTEXT.md` with explicit action flow (client intent → server validate → state update → broadcast).
10. Module import boundary audit: verify no cross‑module violations per `MODULE_MAP.md`; schedule enforcement as a follow‑up brief.

## Files
- `docs/task_briefs/TASK_0_2_professionalization_roadmap_PLAN.md`
- `docs/PROJECT_INTENT.md` (Phase 1)
- `docs/ARCHITECTURE.md` (Phase 1)
- `AGENTS.md` (Phase 1 update)
- `CONTEXT.md` (Phase 1 update)
- `docs/CI_CHECKLIST.md` (Phase 2)
- `BACKEND_CONTEXT.md` (Phase 3 update)
- `test/core.test.mjs` (Phase 2 expansion)
- `test/hex.test.mjs` (Phase 2 expansion)

## Testing
- Docs‑only steps: no tests required.
- Phase 2 steps are testing work; CI should run after tests land.

## Notes
- Phase 1 is all docs; zero impact to gameplay or architecture.
- Phase 2 aligns with existing TODO “Next” items; no scope drift.
- Phase 3 integration test can start as a spike and be promoted to CI when stable.
- Risk: rigor vs speed. Mitigation: phases are independent and can be scheduled around gameplay work.
