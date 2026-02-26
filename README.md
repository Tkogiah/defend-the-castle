# Defend the Castle

Co-op fantasy deck-building tower defense on a 91-hex map. Defend the central castle against waves while upgrading your deck and gear.

## Why This Exists
This is a portfolio-grade game project built to demonstrate clear architecture, testable game rules, and multiplayer-ready backend design while keeping the gameplay fun and readable.

## Current Status
- MVP implementation in progress (core loop, isometric render, UI, cards, gear, waves).
- Stack: HTML, CSS, JavaScript, Canvas 2D (mobile-first).
- Backend: Node.js + WebSockets planned; authoritative server model is the target.

## Core Loop
- Play cards
- Move/attack on the spiral path
- Collect crystals and return to center
- Buy cards and gear
- Survive waves and defeat bosses

## MVP Feature Set (Snapshot)
- 10 waves, boss at end of each wave
- Fixed spiral path movement (clockwise/counter-clockwise)
- Deck/hand/discard system with merchant shop
- Gear items with non-deck effects
- Win/lose conditions enforced in core rules

## Architecture Highlights
- `main.js` is the only composition root.
- Modules are bounded (`core/`, `render/`, `input/`, `ui/`, `hex/`, `data/`, `config/`, `net/`).
- Core rules are pure functions; render and input are side-effect-only.
- Multiplayer design uses authoritative server snapshots (see `BACKEND_CONTEXT.md`).

## Project Map
- `CONTEXT.md`: canonical entry point
- `MODULE_MAP.md`: module boundaries and wiring rules
- `specs/mvp.md`: MVP rules and scope
- `TESTING_CONTEXT.md`: workflow and CI/testing guardrails
- `MVP_ROADMAP.md`: staged plan
- `docs/ROADMAP.md`: task roadmap (replaces TODO.md)

## Local Development
- Open `index.html` in a browser, or use a static server.
- Experimental backend: `node server/index.cjs` (also serves static files at `http://localhost:8080`)
- Mobile / remote testing: see `docs/MOBILE_TESTING.md`

## Testing / CI
- Tests run via `npm test` (Node test runner).
- CI runs on push/PR to `main`.

## Decisions
MVP decisions and future options are tracked in:
- `CONTEXT.md`
- `DECISIONS.md`

## Roadmap
See `MVP_ROADMAP.md` for staged MVP delivery.
