# Agent Task Brief — Defend the Castle

## Task Title
MVP State Shape + Rules Skeleton

## Goal (1–2 sentences)
Define the MVP game state model and a minimal rules skeleton that supports the turn loop (player phase -> enemy phase -> win/lose checks).

## Definition of Done
- Draft `state.js` with an explicit initial state shape and a small set of pure update functions (no rendering).
- Draft `rules.js` with named functions for turn flow and win/lose checks (stubs are OK).
- Provide a short note explaining how hex grid data plugs into state.

## Constraints
- No architecture changes.
- Stay within listed files/areas.
- Follow MVP decisions in README unless explicitly overridden.
- Pure logic only (no canvas, DOM, or input handling).

## Inputs / Context
- Backend context (read once per session): /Users/tkogiah/ai-workspace/defend-the-castle/BACKEND_CONTEXT.md
- Task-specific context (only if needed beyond global):
  - Project context: /Users/tkogiah/ai-workspace/defend-the-castle/CONTEXT.md
  - MVP spec: /Users/tkogiah/ai-workspace/defend-the-castle/specs/mvp.md
  - High-level framing: /Users/tkogiah/ai-workspace/defend-the-castle/README.md
  - Planned module layout: /Users/tkogiah/ai-workspace/defend-the-castle/src/README.md

## Files/Areas Allowed
- /Users/tkogiah/ai-workspace/defend-the-castle/src/state.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/rules.js

## Outputs Expected
- Summary of changes
- Files touched
- Open questions

## Decision Required (if any)
- 

## Risks / Caveats (if any)
- 

## Review Notes (for lead)
- Confirm no scope creep beyond MVP.
