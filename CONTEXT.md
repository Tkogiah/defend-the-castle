# Project Context — Defend the Castle

## Purpose
Single source of truth for this project. Keep concise and current.

## How To Update
- Update after decisions affecting gameplay, tech stack, or architecture.
- Keep entries short and dated (YYYY-MM-DD).

## Context Reload Template (for assistants)
Use this checklist on session start or after reload.
1) Read: /Users/tkogiah/ai-workspace/defend-the-castle/CONTEXT.md (this file).
2) Read: /Users/tkogiah/ai-workspace/defend-the-castle/specs/mvp.md.
3) Read: /Users/tkogiah/ai-workspace/defend-the-castle/NOTES.md (recent notes).
4) Read: /Users/tkogiah/ai-workspace/defend-the-castle/TODO.md (current tasks).
5) Read: /Users/tkogiah/ai-workspace/defend-the-castle/README.md (high-level framing).
6) If folders are split, read each folder’s index.js to understand wiring.
   - index.js files define module boundaries, wiring, and public APIs. Read these first in each folder.
   - Smaller module files contain focused logic only.

## Context Update Review Workflow
1) Propose the update in plain language (what changed + why).
2) I confirm or revise the wording.
3) Apply the approved update to this file with today’s date.
4) If it’s high-level architecture, reflect it in specs as needed.

## Briefing Checklist (for agent tasks)
- Working directory (absolute path).
- Files allowed (absolute paths).
- Scope type: data-only vs logic-only vs rendering-only vs input-only.
- MVP-only guardrail + any non-negotiables (e.g., flat-top hexes, DPR handling).
- Expected outputs (summary, files touched, open questions, risks).

## Current Snapshot
- Concept: Co-op fantasy deck-building tower defense on a hex map; defend central castle vs waves
- Stack: HTML, CSS, JavaScript, Canvas 2D
- Backend: Node.js planned later; multiplayer likely via WebSockets
- Core loop: play cards → move/attack → collect crystals → return center → buy cards → repeat
- Map: 91 hexes (center + 5 rings); players can traverse outward or inward
- Movement: fixed clockwise path; no free movement (except mounts like Dragon)
- Movement: counter-clockwise also allowed to return to center (same path, reverse direction)
- Path: single spiral labels hexes 0..90; players move along label ±1; enemies start at label 90 and move counter-clockwise
- Movement: path follows the rainbow gradient color fill across hexes (entire map path)
- Movement: spiral path source is `generateRadialSpiralAxial(5)` in `src/hex.js` and the rainbow gradient render in `src/render.js` uses the same label order
- Movement: points spent per hex; player may stop early and can move/attack in any order until actions are spent
- Movement: player may pass through enemy hexes but cannot end on enemy hex; if enemy reaches player hex, player dies
- Movement: players can share hexes with other players for gear trading; movement is never blocked
- Input: click-to-move up to available movement points along path; keyboard supports step-by-step movement
- Animation: movement is step-by-step animated in MVP
- Movement feel: player can move within a hex; crossing a hex edge requires a small intentional delay to avoid accidental transitions (after isometric visuals)
- Waves: 10 waves × 10 enemies, boss at end of each wave
- Economy: crystals dropped by enemies; spent at center on cards
- Economy: on attack, add crystal card to discard equal to the player's ring value (ring is distance from center)
- Gear: boss loot grants non-deck abilities; tradable on same hex
- Win/Lose: win by defeating final boss; lose if any enemy reaches center
- Knockout: player dies if an enemy enters their hex
- View: 2D isometric (possible future map rotation)
- Board orientation: pointy-top hexes; overall board silhouette should read as flat-top.
- State: deck/hand/discard are stored on player (state.player.*), not top-level.
- Workflow: assistant acts as coordinator/reviewer/brief-writer; do not implement code unless explicitly asked
- Workflow: other agents implement code; assistant reviews and connects changes
- Workflow: code changes are committed and pushed to GitHub after approval
- Workflow: main.js is Codex-owned; other agents do not edit main.js unless the brief explicitly allows it
- Architecture & wiring: main.js is the single composition root; it wires folder index.js public APIs
- Architecture & wiring: each folder contains context.md (intent + rules) and index.js (wiring + public exports)
- Architecture & wiring: refactor workflow = update folder context first, then code, then update wiring in main.js
- Cards: draw uses discard reshuffle whenever the deck is empty (including mid-draw from effects)

## Recent Updates
- 2026-01-21: Set initial stack and backend direction.
- 2026-01-21: Captured core gameplay loop and boardgame-derived structure.
- 2026-01-21: Clarified hex orientation (pointy-top tiles, flat-top board silhouette).
- 2026-01-23: Added detailed movement rules (path, input, animation, enemy interactions, actions).
- 2026-01-23: Clarified assistant role as coordinator/reviewer/brief-writer and codified commit/push workflow.
- 2026-01-23: Added explicit architecture/wiring conventions (main.js composition root, folder context + index.js).
