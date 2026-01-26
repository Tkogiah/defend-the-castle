# TODO

Short, actionable items only. Keep high-level items at top; break down later.

## Now
- Define MVP architecture and module responsibilities.
- Create core data definitions (cards, gear, enemies, shop).
- Draft render and input flow for the MVP loop.
- Remove temporary Enter key end-turn shortcut after UI button exists.
- Remove temporary auto-reset of movementPoints to 10 (testing only).

## Next
- Build hex grid generation and coordinate conversions.
- Implement basic turn progression (player -> enemies -> check win/lose).
- Define a git branching plan for video capture/documentation workflow before integrating updates.
- Test touch drag-to-move on mobile and map drag direction to the 6 path directions.
- Fix click-to-move ghost/phantom frame at end of animation.

## Later
- Redesign hand UI: replace drawer with clickable deck that opens a 5-card wheel (center card highest/primary, cards 2&4 lower/lighter, cards 1&5 lowest/most opaque); smooth open/close to avoid jarring transitions.
- Update attack targeting to respect player.range (needed for archer range 3 and future classes).
- Revisit enemy passing-player behavior during enemy movement (animation will show enemies traversing hexes even if they end elsewhere); decide if “pass-through” should also trigger loss or if only landing on player hex ends game.
- Consider formal turn-phase state machine to avoid re-entrancy during animations (post-MVP).
- Extract a reusable AI-agent context framework from this project (roles, read order, guardrails) so it can be reused like functions across other codebases; goal is to avoid re-writing context and treat agent setup as portable building blocks.
- Multiplayer architecture spike (WebSockets).
- Hybrid real-time within-hex movement (post-MVP).
- Add stealth mode to allow moving past enemies via gear (post-MVP).
- Enable player-to-player gear trading when sharing a hex (post-MVP).
- Add sweep attack (post-MVP): allow damage spread across enemies in one adjacent hex if weapon damage >= enemy count; remainder discarded.
