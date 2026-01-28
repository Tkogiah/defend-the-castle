# Notes

Loose working notes that do not rise to a decision or spec change.
Use this for sketches, questions, and quick captures.

## Template
## YYYY-MM-DD
- Note:
## 2026-01-23
- Note: Dragon Mount (free adjacency move) should use click-to-move only for MVP; keyboard directional input is path-bound and should not control Dragon movement.
## 2026-01-24
- Note: Player deck/hand/discard moved under state.player.* for multiplayer-ready structure; core rules now read/write from player.

## 2026-01-27
- Note: Smoke test checklist after refactors
  1) Load `index.html` and verify no console errors.
  2) Open Character sheet → confirm 1 random starting gear appears in inventory.
  3) Complete a basic turn (play a card, end turn) → no crashes.
  4) Defeat a boss (if reachable) → confirm gear drop appears in inventory.
  5) Verify any gear effect still applies (Boots/Power Glove/King’s Purse if equipped).
