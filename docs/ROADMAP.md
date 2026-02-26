# Roadmap — Defend the Castle

This roadmap replaces TODO.md as the primary planning document.
Use task briefs for implementation details and sequencing.

## Phase 0 — Process & Architecture (0.x)
- 0.1 Task brief templates + README polish
- 0.2 Professionalization roadmap (docs, tests, CI)
- 0.4 ADR template + ADR-001
- 0.5 Module boundary audit + follow-ups

## Phase 1 — Core Gameplay Stability (1.x)
- 1.1 Fix path traversal animation (movement should follow spiral path)
- 1.2 Verify boss defeat flow (ensure next wave spawn logic is correct)
- 1.3 Input focus gating (disable board interaction while character sheet is open)
- 1.4 Enforce attack targeting respects player.range (future classes)
- 1.5 Revisit enemy pass-through behavior (decide if pass-through triggers loss)
- 1.6 Consider formal turn-phase state machine (post-MVP)

## Phase 2 — Mobile UX & Layout (2.x)
- 2.1 Mobile full-screen + viewport rules (PWA meta + iOS constraints)
- 2.2 Hand button overflow + fit-to-screen layout
- 2.3 Character sheet scroll vs board interaction
- 2.4 Touch drag-to-move direction mapping
- 2.5 Merchant card detail view (tap to read effect before buy)
- 2.6 Redesign hand UI (5-card wheel)

## Phase 3 — Testing & Diagnostics (3.x)
- 3.1 Core rules unit test expansion (movement, attack/crystal reward, wave/boss HP, end-turn flow)
- 3.2 Hex pathing unit tests (spiral labels, neighbors, path length)
- 3.3 Define richer debug mode checklist (overlays, hitboxes, inspectors)
- 3.4 Decide dev/test defaults for player state (range/gold/starting hand) and document/gate

## Phase 4 — Multiplayer Readiness (4.x)
- 4.1 Multiplayer architecture spike (WebSockets)
- 4.2 Per-player state separation (hands/gear/turns)
- 4.3 Join/ready/character-select flow
- 4.4 Integration test: join room → action → snapshot

## Phase 5 — Content & Polish (5.x)
- 5.1 Fill out MVP_ASSET_LIST.md (Stage 7 assets)
- 5.2 Audio/SFX allowlist expansion for static server (as assets land)
- 5.3 Hybrid real-time within-hex movement (post-MVP)
- 5.4 Stealth mode (post-MVP)
- 5.5 Player-to-player gear trading (post-MVP)
- 5.6 Sweep attack (post-MVP)

## Architecture Follow-ups (Ongoing)
- Refactor UI display stats to use core/ rules (remove UI duplication)
- Audit ISO_SCALE_Y usage in input/movement.js (render-domain constant in input)
- Enforce index.js boundary imports for data (core should import from src/data/index.js)
- Extract reusable AI-agent context framework (roles, read order, guardrails)
