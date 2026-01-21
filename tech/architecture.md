# Technical Architecture (MVP Draft)

## Goals
- Clear separation of game state, rules, and rendering.
- Deterministic turn resolution for debugging.
- Simple data-driven entities (player, enemies, cards, gear).
- Easy upgrade path to multiplayer and hybrid real-time movement.

## Runtime Model
- Single HTML page with Canvas 2D renderer.
- Single game loop (requestAnimationFrame) for rendering.
- Turn-based rules resolved in discrete steps; render can be continuous.

## Core Systems
1) State Store
- Single source of truth for all game data.
- Immutable-ish updates where practical (simple object copies).

2) Rules Engine
- Pure functions for turn resolution, card effects, movement, combat, rewards.

3) Renderer
- Draws hex grid, units, UI overlay, hand, and panels.
- Isometric projection helper for hex -> screen coords.

4) Input Controller
- Mouse interactions for selecting units, cards, target hexes.
- Keyboard shortcuts later (optional).

5) UI Layer
- Hand, End Turn button, character sheet panel.
- Minimal HUD: gold/crystals, wave count, enemy count.

## Turn Flow (MVP)
1. Start Turn
- Draw 5 cards
- Reset action counters (movement/attacks derived from Action cards as played)

2. Player Phase
- Play Action cards (choose attack or movement per card)
- Move (hex-to-hex) using movement points
- Attack enemies in range (range 1)
- Play other cards (money, merchant purchases)

3. End Turn (button)
- Discard remaining hand
- Convert crystals to gold only if at center

4. Enemy Phase
- Each enemy moves random 1–10 hexes toward center
- Check loss (enemy reaches center)

5. Wave Progress
- If 10 enemies defeated and boss defeated -> win

## Data Model (Draft)
- GameState
  - map: hexes[] (ring index, neighbors)
  - player: PlayerState
  - enemies: EnemyState[]
  - shop: ShopState
  - turn: TurnState
  - wave: WaveState

- PlayerState
  - positionHex
  - baseMovement (3)
  - baseDamage (10)
  - range (1)
  - gear[]
  - gold
  - deck: Card[]
  - discard: Card[]
  - hand: Card[]
  - crystalsStash[] (optional: for King’s Deck only)

- EnemyState
  - id
  - hp
  - positionHex
  - type (basic|boss)

- Card
  - id
  - type (action|money|merchant|crystal)
  - value (for money/crystal)
  - cost (for merchant)
  - effect (function ref or enum)

## File Structure (Proposed)
- /defend-the-castle/
  - index.html
  - styles.css
  - /src/
    - main.js (boot + game loop)
    - state.js (initial state + reducers)
    - rules.js (movement, combat, economy, turn progression)
    - render.js (canvas draw + UI draw)
    - input.js (mouse selection, card clicks)
    - hex.js (grid generation + axial/offset conversions)
    - data/
      - cards.js
      - gear.js
      - enemies.js
      - shop.js

## Upgrade Path (Post-MVP)
- Hybrid within-hex movement: add sub-hex coordinates and movement controller.
- Multiplayer: state replication + authoritative server (Node + WebSockets).
- Procedural merchant market: randomize 8 from pool at game start.
- Boss gear drops + trading.
