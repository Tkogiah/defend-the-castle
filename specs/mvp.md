# MVP Feature Set (Draft)

## Scope
- Single-player only
- One full wave: 10 basic enemies + 1 boss
- Full 91-hex map (center + 5 rings)
- Deck system with fixed starter deck and shop
- Currency (crystals) from enemies; spend at center
- Win/lose conditions implemented

## Movement (MVP)
- Discrete hex-to-hex movement (movement points)
- Enemies move a random number of hexes each turn (1–10)
- Hybrid real-time within-hex feel is first upgrade after MVP
- Player movement follows a fixed clockwise path (not free movement)
- Player may also move counter-clockwise to return toward center (same path, reverse direction)
- Flat labeling (pointy-top): A=upper-right (NE), B=right, C=down-right, D=down-left, E=left, F=up-left
- Input: click-to-move for mouse/touch; step-by-step movement for keyboard
- Path system: a single spiral path labels hexes 0..90; movement is along label ±1
- Enemy movement: starts at label 90 and moves counter-clockwise along the same path

## Cards (MVP)
- 1 basic "Action" card (choose attack or movement per card)
- 5 money cards (values 1–5)
- 8 merchant cards
- Starter deck: 5 Action cards
- No tutorial-buy flow yet (post-MVP)

## Deck Rules (MVP)
- Draw 5 cards at start of turn
- Play any number of cards in any order
- Discard all remaining cards at end of turn
- If deck is empty, shuffle discard to form new deck, then draw 5

## Turn Control (MVP)
- Player ends turn via explicit button (required if hand is all crystal cards)
- Enemies move after player ends turn

## Shop (MVP)
- Fixed 8 merchant cards (same every game)
- Each merchant card has a pile limit of 10 (80 total)
- Future: randomize available merchant cards at game start

## Economy (MVP)
- Crystal rewards are based on distance from center hex at time of attack
- Ring 0 (center): reward 0
- Ring 1: reward 1-value crystal card
- Ring 2: reward 2-value crystal card
- Ring 3: reward 3-value crystal card
- Ring 4: reward 4-value crystal card
- Ring 5: reward 5-value crystal card
- Crystal cards go to discard pile on attack
- Crystals are converted to gold only at the center on the player’s turn
- Design note: rewards simulate encumbrance

## Player (MVP)
- Character: Warrior
- Weapon: Sword
- Range: 1
- Base movement: 3
- Damage: 10 per attack
- Action cards grant: +1 attack or +1 movement per card
- Example: 3 Action cards = 3 attacks, or 9 movement, or split (e.g., 2 move + 1 attack)
- Attacks always hit if target is in range

## Gear (MVP)
- Boss does not drop gear
- Player starts with 1 gear at game start
- 5 possible gear items for MVP:
  - Dragon Mount: once per turn, move 1 hex to any adjacent hex (ignores forward/back constraint)
  - Boots of Speed: base movement +3
  - Fireball: choose a hex; that hex + its ring (7 hexes total) take 5 AoE damage
  - Power Glove: base damage +3
  - King’s Deck: may stash discarded crystal cards (max 5)

## Enemies (MVP)
- 1 basic enemy type
- 1 boss (end of wave)
- Basic enemy HP: 10
- Boss HP: 100

## UI (MVP)
- Board view + hand UI
- Character sheet with stats (speed, damage, range, gear)
- End Turn button
- Camera: center-locked on player with pan/zoom for readability (mobile-friendly)

## Polish (MVP)
- Pixel art placeholders for board, player, enemy, boss, cards
- Basic SFX (attacks, enemy death, card play)

## View
- 2D isometric
