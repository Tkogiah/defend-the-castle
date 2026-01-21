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
- Follow-ups: Review pointer/touch edge cases and clamp behavior.
