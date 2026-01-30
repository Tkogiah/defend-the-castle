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
