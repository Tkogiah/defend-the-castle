# TODO

Short, actionable items only. Keep high-level items at top; break down later.

## Now
- Fix fireball hover targeting (if still broken).
- Resolve click-to-move ghost/phantom frame at end of animation.
- Agree on module cleanup order after Claude's module-map review.

## Next
- Define a git branching plan for video capture/documentation workflow before integrating updates.
- Test touch drag-to-move on mobile and map drag direction to the 6 path directions.
- Add merchant card detail view (tap to read effect before buy), mobile-first.
- Review MODULE_ALIGNMENT_AUDIT.md after Claude's module map feedback.
- Use MODULE_CLEANUP_TASKS.md to schedule module-by-module cleanup.
- Fix boss defeat flow: next wave enemies should not all remain stacked on spawn hex.

## Later
- Redesign hand UI: replace drawer with clickable deck that opens a 5-card wheel (center card highest/primary, cards 2&4 lower/lighter, cards 1&5 lowest/most opaque); smooth open/close to avoid jarring transitions.
- Update attack targeting to respect player.range (needed for archer range 3 and future classes).
- Revisit enemy passing-player behavior during enemy movement (animation will show enemies traversing hexes even if they end elsewhere); decide if “pass-through” should also trigger loss or if only landing on player hex ends game.
- Consider formal turn-phase state machine to avoid re-entrancy during animations (post-MVP).
- Enforce index.js boundaries for data imports (core should import from src/data/index.js).
- Decide on dev/test defaults for player state (range/gold/starting hand) and gate or document them.
- Extract a reusable AI-agent context framework from this project (roles, read order, guardrails) so it can be reused like functions across other codebases; goal is to avoid re-writing context and treat agent setup as portable building blocks.
- Multiplayer architecture spike (WebSockets).
- Hybrid real-time within-hex movement (post-MVP).
- Add stealth mode to allow moving past enemies via gear (post-MVP).
- Enable player-to-player gear trading when sharing a hex (post-MVP).
- Add sweep attack (post-MVP): allow damage spread across enemies in one adjacent hex if weapon damage >= enemy count; remainder discarded.

## Done (TODID)
2026-01-27
- Defined module boundaries in MODULE_MAP.md.
- Audited module alignment in MODULE_ALIGNMENT_AUDIT.md.
- Created module cleanup plan in MODULE_CLEANUP_TASKS.md.
- Added UI module docs/entrypoint (src/ui/context.md, src/ui/index.js).
