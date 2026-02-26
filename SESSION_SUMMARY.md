# Session Summary — 2026-02-11 — Backend sync, CI setup, tests, and context consolidation.

Key progress
- Consolidated context: moved backend context to `BACKEND_CONTEXT.md`, removed `tech/GLOBAL_CONTEXT_BRIEF.md`, added `AGENTS.md` and `TESTING_CONTEXT.md` to `CONTEXT.md` read order.
- Added CI: GitHub Actions workflow runs `npm ci` + `npm test`; switched to Node’s `--test` runner with smoke test.
- Added core/hex unit tests (ESM): `test/core.test.mjs`, `test/hex.test.mjs`; package now `"type": "module"`, server entry renamed to `server/index.cjs`.
- Implemented authoritative server snapshots and client sync on `backend-sync` branch: server applies actions, broadcasts full state; client sends intents with local fallback when offline.
- Restored movement animations from server snapshots: enemy moves animate without flicker; player movement follows spiral path, dragon snaps on adjacent moves; disabled within-hex drift in multiplayer mode.
- Added spawn snapshots to avoid first-turn enemy/boss teleporting before animation.

Files touched (high level)
- `server/index.cjs`
- `src/main.js`
- `src/net/client.js`
- `src/render/animation.js`
- `package.json`
- `test/core.test.mjs`
- `test/hex.test.mjs`
- `test/smoke.test.cjs`
- `.github/workflows/ci.yml`
- `README.md`
- `BACKEND_CONTEXT.md`
- `CONTEXT.md`
- `TESTING_CONTEXT.md`
- `AGENTS.md`
- `tech/agent-brief-state-rules.md`
- `briefs/backend/core_hex_tests_brief.md`

Branch / PR status
- Working branch: `backend-sync` (pushed to origin). PR created but not merged yet.

Known issues / fixes in progress
- Multiplayer still shares a single `state.player`; next milestone is per-player state and character selection.

Next job reminder
- Merge `backend-sync` after CI/approval.
- Create new branch for multi-player state (separate player hands/gear/turns).
- Add join/ready/character-select flow on top of authoritative server.

# Session Summary — 2026-01-30 — Merchant action-mode, crystal trash flow, Whirlwind, movement sync, and branch sync.

Key progress
- Reviewed and ranked merchant cards and gear proposals; confirmed specs for Whirlwind and Ambush; added Purge/Cleanse thinning cards to rankings.
- Added rule notes for merchant cards having action-mode and crystal trashing for 0 gold.
- Implemented Whirlwind stacks (AoE +1 per extra) and fixed turnBonus reset to avoid state shape drift.
- Unified player movement speeds (keyboard drift, snap, click-to-move) via distance-based snap duration; added logical hex sync in render loop.
- Implemented crystal trash flow: play-area drop trashes anywhere (0 gold); merchant panel drop converts to gold; restored hidden merchant drop zone covering panel.
- Synced testing branch to main and pushed.

Files touched (high level)
- `src/main.js`
- `src/ui/index.js`
- `src/ui/hand.js`
- `src/render/animation.js`
- `src/render/index.js`
- `src/core/rules.js`
- `src/core/state.js`
- `src/data/cards.js`
- `src/data/gear.js`
- `src/data/shop.js`
- `index.html`
- `styles.css`
- `CONTEXT.md`
- `AGENT_TASK_TEMPLATE.md`
- `specs/merchant_card_review.md`
- `specs/gear_review.md`
- `specs/post_mvp_ideas.md`
- `specs/whirlwind_integration_proposal.md`

Known issues / fixes in progress
- Validate crystal sell UX with invisible merchant drop zone (confirm drop target feels right).
- Mobile drag-to-move mapping still pending (devtools only so far).

Next job reminder
- Finish MVP asset list audio section (SFX + music).
- Test touch drag-to-move on a mobile device and map drag to 6 directions.
- Work on isometric tuning.
