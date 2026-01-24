# Briefs Log

## Purpose
Track agent briefs, dates, and outcomes so context can be restored quickly and decisions are auditable.

## Format (copy/paste)
## YYYY-MM-DD — Brief Title
- Goal:
- Files:
- Agent(s):
- Outcome:
- Follow-ups:

## 2026-01-21 — MVP State Shape + Rules Skeleton
- Goal: Define MVP game state model and a minimal rules skeleton for turn flow and win/lose checks.
- Files: src/state.js, src/rules.js
- Agent(s): Claude, Gemini
- Outcome: Claude's state model aligned with MVP; Gemini's was too generic. Claude's rules.js adopted and refined.
- Follow-ups: Ensure rules.js aligns with MVP (bossDefeated win, enemyReachedCenter lose).

## 2026-01-21 — Hex Grid Utilities (MVP)
- Goal: Create hex grid utilities for axial coords and 91-hex board generation.
- Files: src/hex.js
- Agent(s): Claude, Gemini
- Outcome: Claude's version adopted (Map keys, ring/distance, neighbors, grid generation).
- Follow-ups: Freeze direction constants; remove redundant alias.

## 2026-01-21 — Data Definitions (MVP)
- Goal: Create data-only files for cards, gear, enemies, and shop.
- Files: src/data/cards.js, src/data/gear.js, src/data/enemies.js, src/data/shop.js
- Agent(s): Claude, Gemini
- Outcome: Claude's data-only approach adopted; Gemini's versions included logic or mismatched types.
- Follow-ups: Keep merchant effects as placeholders until spec defines them.

## 2026-01-21 — Rendering Orientation + DPR Review
- Goal: Verify flat-top orientation, centering, and DPR clearing behavior.
- Files: src/render.js, tech/architecture.md
- Agent(s): Claude, Gemini
- Outcome: Claude flagged DPR clear/fill mismatch; fixed to use backing store for clearing while centering with CSS pixels. Gemini initially confused orientation; clarified flat-top standard.
- Follow-ups: Document flat-top + DPR notes in architecture.

## 2026-01-21 — Input Controls (Pan + Zoom, MVP)
- Goal: Add mouse/touch pan + zoom controls for the MVP camera.
- Files: src/input.js, src/main.js, styles.css
- Agent(s): Claude, Gemini
- Outcome: Claude's approach adopted (pinch + cursor-centered zoom + pan).
- Follow-ups: Keep pan in screen-space for MVP (no divide by zoom); revisit if camera becomes world-space post-MVP.

## 2026-01-24 — Attack Crystal Rewards + Draw Rules (Proposal)
- Goal: Propose attack-triggered crystal rewards based on enemy ring distance and robust draw rules (reshuffle discard mid-draw).
- Files: src/core/rules.js, src/data/cards.js, src/core/state.js
- Agent(s): Claude
- Outcome:
- Follow-ups:

## 2026-01-24 — Merchant UI (Proposal)
- Goal: Propose merchant UI for ring 0 (drag crystal cards to trade for gold; 10 placeholder slots; blocks input; end turn disabled while open).
- Files: index.html, styles.css, src/ui.js, src/ui/hand.js, src/core/state.js, src/core/rules.js, src/data/cards.js
- Agent(s): Claude
- Outcome:
- Follow-ups:

## 2026-01-24 — Merchant Buy Drag-to-Hand (Proposal)
- Goal: Propose drag merchant cards into hand drawer; on drop, spend gold, add card to discard, decrement stack.
- Files: index.html, styles.css, src/ui.js, src/ui/hand.js, src/core/state.js, src/data/cards.js, src/main.js
- Agent(s): Claude
- Outcome:
- Follow-ups:
