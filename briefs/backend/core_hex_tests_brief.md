# Task Brief — Core + Hex Unit Tests (MVP)

## Role + Rehydration
You are Claude (implementation agent). Before coding:
1) Read `/Users/tkogiah/ai-workspace/defend-the-castle/CONTEXT.md` and follow its read order (includes `AGENTS.md`, module boundaries, and testing context).
2) Read module docs:
   - `/Users/tkogiah/ai-workspace/defend-the-castle/src/core/context.md`
   - `/Users/tkogiah/ai-workspace/defend-the-castle/src/hex/context.md`
   - `/Users/tkogiah/ai-workspace/defend-the-castle/src/config/context.md`

## Goal
Propose a small, high‑value unit test suite for core rules and hex pathing using Node’s built‑in test runner (`node --test`). Keep it minimal but meaningful for regression coverage.

## Scope
Allowed files:
- `/Users/tkogiah/ai-workspace/defend-the-castle/test/*.test.js`
- `/Users/tkogiah/ai-workspace/defend-the-castle/src/core/**`
- `/Users/tkogiah/ai-workspace/defend-the-castle/src/hex/**`
- `/Users/tkogiah/ai-workspace/defend-the-castle/src/config/**`

Do not edit:
- `main.js` (you may suggest wiring needs; Codex will implement any main.js changes)
- render/input/ui

## Requirements
Write unit tests that cover:
1) **Hex pathing:** spiral labels are contiguous and within radius; neighbors are 6; path length equals 91 for radius 5.
2) **Core movement rules:** moving along spiral label ±1 only; cannot end on enemy hex.
3) **Combat rewards:** attack grants crystal based on ring distance even if enemy survives.
4) **Wave scaling:** basic HP = wave × 10; boss HP = wave × 100 (final boss 1000 at wave 10).

Tests should be deterministic, no randomness. Use minimal fixtures.

## Expected Output
- A proposal with a short execution plan (3–6 bullets).
- A list of specific tests to add and which modules/functions they target.
- File list that would be touched if approved.
- Open questions or any ambiguous behavior you encounter.

Do not implement code until the proposal is approved.

## Notes
- Use existing helpers from `src/core/` and `src/hex/` only.
- Don’t refactor production code; keep changes test‑only.
