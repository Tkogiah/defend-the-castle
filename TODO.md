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

## Later
- Multiplayer architecture spike (WebSockets).
- Hybrid real-time within-hex movement (post-MVP).
- Add stealth mode to allow moving past enemies via gear (post-MVP).
- Enable player-to-player gear trading when sharing a hex (post-MVP).
- Add sweep attack (post-MVP): allow damage spread across enemies in one adjacent hex if weapon damage >= enemy count; remainder discarded.
