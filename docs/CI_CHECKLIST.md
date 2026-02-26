# CI Checklist — Defend the Castle

## Before Merging to Main
All of the following must pass before any PR is merged into `main`.

### Automated (CI — GitHub Actions)
- [ ] `npm ci` completes without errors
- [ ] `npm test` passes (all tests green, zero failures)
  - `test/smoke.test.cjs` — module load smoke test
  - `test/core.test.mjs` — core rules unit tests
  - `test/hex.test.mjs` — hex grid unit tests

### Manual Smoke Checklist (run locally before PR)
Based on NOTES.md smoke test checklist:
1. Load `index.html` in browser — confirm no console errors.
2. Open Character sheet — confirm 1 random starting gear appears in inventory.
3. Complete a basic turn (play a card, end turn) — confirm no crashes.
4. Defeat a boss (if reachable) — confirm gear drop appears in inventory.
5. Verify any equipped gear effect still applies (Boots/Power Glove/King's Purse).

### Code Review
- [ ] No cross-module import violations (per `MODULE_MAP.md`).
- [ ] `main.js` was not edited unless the task brief explicitly approved it.
- [ ] New logic lives in `core/`; new rendering in `render/`; new input in `input/`.
- [ ] No game logic added to `render/`, `input/`, or `data/`.

## When Deviations Are Acceptable
- Spike branches (labeled as spikes) may skip tests but must not land in `main` without cleanup.
- Docs-only changes may skip the manual smoke checklist but must still pass CI.

## CI Configuration
- Workflow file: `.github/workflows/ci.yml`
- Trigger: push and PR to `main`
- Runner: Node.js LTS (`--test` runner, ESM-compatible)
