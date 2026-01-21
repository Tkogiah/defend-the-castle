# Project Context — Defend the Castle

## Purpose
Single source of truth for this project. Keep concise and current.

## How To Update
- Update after decisions affecting gameplay, tech stack, or architecture.
- Keep entries short and dated (YYYY-MM-DD).

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
- Waves: 10 waves × 10 enemies, boss at end of each wave
- Economy: crystals dropped by enemies; spent at center on cards
- Gear: boss loot grants non-deck abilities; tradable on same hex
- Win/Lose: win by defeating final boss; lose if any enemy reaches center
- Knockout: player dies if an enemy enters their hex
- View: 2D isometric (possible future map rotation)

## Recent Updates
- 2026-01-21: Set initial stack and backend direction.
- 2026-01-21: Captured core gameplay loop and boardgame-derived structure.
