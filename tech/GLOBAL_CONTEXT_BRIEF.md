# Global Context — Defend the Castle

This is the stable, shared context for all agents. Read once per session. Task briefs will include only task-specific context and deltas.

## Project Snapshot
- Co-op fantasy deck-building tower defense on a 91-hex map (center + 5 rings).
- Stack: HTML, CSS, JavaScript, Canvas 2D.
- Board: pointy-top hexes; board silhouette reads flat-top.
- Movement: spiral path labels 0..90; player moves along label ±1. Enemies start at label 90 and move counter-clockwise.
- Win/Lose: win by defeating boss; lose if enemy reaches center or enters player hex.
- View: 2D isometric feel via rendering style (not true isometric projection).

## Architecture / Workflow
- main.js is the single composition root and Codex-owned.
- Each folder has context.md + index.js defining public API and wiring.
- Logic in core; rendering in render; input emits intents only.
- Agents do not edit main.js unless explicitly approved in the brief.
- Code changes are committed and pushed after approval.

## State Model (Current)
- Player deck/hand/discard are under state.player.*.
- Start-of-turn sets attackPoints and movementPoints to 0; action cards add points.
- Starter deck: 5 Action cards; hand draws 5 at start of turn.

## Economy / Cards
- Crystal reward is granted on attack (even if enemy survives).
- Crystal value is based on player’s ring distance from center at time of attack.
- Crystal cards go to discard; conversion to gold only at center on player turn.
- Draw: if deck empty, reshuffle discard and continue draw (mid-draw supported).

## UI Principles (Mobile-First)
- Canvas runs continuously behind HTML/CSS UI overlay.
- Hand drawer opens via button; card play uses drag/drop zones.
- Character sheet is parchment-style, two columns, non-scrolling.
- Merchant panel opens at ring 0; hand drawer can remain open for trading.

## Art Notes
- Current HEX_SIZE=28 → native hex bounds approx 49x56 px.
- Use 2x or 3x working sizes (98x112 or 147x168).
- Hold final asset work until board/HEX_SIZE decision is locked.

