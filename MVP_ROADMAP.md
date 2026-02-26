# MVP Roadmap — Defend the Castle

This roadmap is designed for a record-first workflow:
- Work in a feature branch
- Document the change
- Merge into `main`
- After filming/notes, fast-forward `recording` to that commit
- Create a `session-summary-YYYY-MM-DD` tag at each recording snapshot

## Stage 1 — Data Definitions (MVP-only)
Scope: cards, gear, enemies, shop inventory.

Definition of Done
- Data files exist for cards/gear/enemies/shop; no logic in data modules.
- Starter deck, crystal cards, and merchant cards match MVP spec.
- Shop list is fixed (8 merchant cards), pile limit 10 each.
- Gear list is the 5 MVP items.

## Stage 2 — Core State + Rules
Scope: turn flow, draw/shuffle, action points, attack, crystals, win/lose.

Definition of Done
- Start/end turn logic works; enemy phase runs after end turn.
- Action cards modify movement/attack points as specified.
- Attack rewards crystal based on ring distance.
- Win/lose enforced (enemy reaches center OR boss defeated).
- Draw reshuffles discard mid-draw when deck is empty.

## Stage 3 — Hex/Path + Movement
Scope: spiral path correctness + movement rules.

Definition of Done
- Player movement constrained to spiral label ±1.
- Enemy movement uses spiral label (counter-clockwise).
- Player can pass through enemies but cannot end on them.
- Keyboard movement works reliably (click-to-move optional, must match rules).

## Stage 4 — Render MVP Pass
Scope: visuals + overlays.

Definition of Done
- Board renders in isometric look with lighting/shading.
- Player/enemy/boss visible and readable.
- Movement and attack overlays render correctly.
- Camera fit-to-screen stable across resize.

## Stage 5 — Input + UI Loop
Scope: hand, end-turn, merchant.

Definition of Done
- End-turn button works reliably.
- Hand UI shows drawn cards; card play updates state.
- Merchant panel opens at ring 0; buy/sell works.

## Stage 6 — MVP Playable Slice
Scope: one wave playable end-to-end.

Definition of Done
- Full loop from start → wave clear → boss → win/loss.
- Gold/crystal economy works with center conversion.
- No blocking UI or state bugs.

## Stage 7 — Art / Sound / Animation (MVP)
Scope: MVP assets only.

Definition of Done
- Pixel art tiles + units + UI frames replace placeholders.
- Basic move/attack/death animations exist.
- SFX for card play/move/attack/hit/death; 1 music loop.

## Stage 8 — Multiplayer Expansion (Post-MVP)
Scope: multiplayer foundations and multiple characters.

Definition of Done
- Authoritative server supports multiple players with separate state (hands/gear/turns).
- Join/ready/character-select flow exists.
- Basic lobby state is broadcast to all clients.
- Multiplayer round-trip action sync is stable (join → action → snapshot).
