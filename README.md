# Defend the Castle

Co-op fantasy deck-building tower defense on a 91-hex map. Defend the central castle against waves while upgrading your deck and gear.

## Current Status
- MVP implementation in progress (core loop, isometric render, UI, cards, gear, waves).
- Stack: HTML, CSS, JavaScript, Canvas 2D.
- Backend planned later (likely Node.js + WebSockets for multiplayer).

## High-Level Goals
- Design-first: keep architecture and scope decisions at the highest useful level.
- Session target: ~60 minutes, low math overhead, strong pacing across waves.
- Core loop clarity: play cards -> move/attack -> collect crystals -> return to center -> buy cards.
- Spatial tension: distance from center should feel rewarding and risky.
- Co-op emphasis: choices should encourage teamwork and trade-offs.

## How to Run (Local)
- Open `index.html` in a browser, or use a simple static server.

## Architecture at a Glance
- `main.js` is the only composition root.
- Modules: `core/`, `render/`, `input/`, `ui/`, `hex/`, `data/`, `config/`.
- Full boundaries: see `MODULE_MAP.md`.

## Where Decisions Live
- `CONTEXT.md`: source of truth for project decisions.
- `DECISIONS.md`: log of durable decisions.
- `MVP_ROADMAP.md`: staged MVP plan.

## Priority Decisions (MVP)
1) Turn model:
   - Selected: Strict turn-based (player phase -> enemy phase).
2) Pacing targets:
   - Selected: Fixed enemy movement bounds per wave (tight control).
3) Visual framing:
   - Selected: Center-locked camera with pan/zoom for readability.

## Priority Decisions (Post-MVP)
1) Turn model:
   - Option B: Hybrid cadence (turn-based with limited within-hex real-time feel).
2) Pacing targets:
   - Option B: Scaling bounds by ring or wave (dynamic difficulty).
3) Visual framing:
   - Option B: Fixed camera with full board visible.
4) Co-op layer:
   - Option A: Mostly shared goals, minimal combo actions.
   - Option B: Explicit co-op mechanics (trades, buffs, or linked abilities).
