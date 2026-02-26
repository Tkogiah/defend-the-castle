# Architecture — Defend the Castle

## Composition Root
`src/main.js` is the **only** composition root. It wires all modules together and translates DOM events into core actions. No other file may wire modules. Do not edit `main.js` without an explicit task brief approving it.

## Module Map

```
main.js
  ├── core/     — game rules, state transitions (pure logic only)
  ├── render/   — canvas drawing (reads state, never mutates it)
  ├── input/    — pointer/keyboard → intent callbacks (no game logic)
  ├── ui/       — DOM panels, hand, drag/drop (emits events, receives state)
  ├── net/      — WebSocket client + protocol (intents + snapshots)
  ├── hex/      — grid math, axial coords, spiral path (pure utilities)
  ├── data/     — static card/gear/enemy definitions (no logic)
  └── config/   — tuning constants (no logic)
```

## Allowed Imports
| Module  | May import from         |
|---------|------------------------|
| core    | hex, data, config      |
| render  | hex, config            |
| input   | hex, config            |
| ui      | data, config           |
| net     | (none)                 |
| hex     | config                 |
| data    | (none)                 |
| config  | (none)                 |
| main.js | all modules            |

Violations of this table are not allowed without a MODULE_MAP.md update.

## Data Flow

```
User action (click / key)
  → input/ emits intent callback
    → main.js calls core/ action function
      → core/ returns new state (pure)
        → main.js passes state to render/ and ui/
          → render/ draws frame to canvas
          → ui/ updates DOM panels
```

## Multiplayer Data Flow (Backend)

```
Client input
  → src/net/client.js sends intent to server (WebSocket)
    → server/index.cjs validates action via core/ rules
      → server applies state update
        → server broadcasts full state snapshot to all clients
          → client receives snapshot → main.js applies it → render/ui update
```

See `BACKEND_CONTEXT.md` for full action flow documentation.

## State Ownership
- **Game state** is owned by `core/`. Shape is defined in `src/core/state.js`.
- **View state** (`panX`, `panY`, `zoom`) is presentation-layer state; mutated directly by `input/`.
- **Animation state** is internal to `render/`; never exposed to `core/`.
- Player deck, hand, and discard live under `state.player.*` (multiplayer-ready structure).

## Key Invariants
- `core/` never touches DOM, canvas, or input.
- `render/` never mutates game state.
- `input/` emits intents only — no game logic.
- `data/` has no logic; IDs must stay stable across releases.
- Each folder has a `context.md` (intent + rules) and `index.js` (public API). Read both before touching a module.

## Initialization Order (in main.js)
1. `config/`, `data/`, `hex/` — available via static imports
2. `core/` — `createInitialState()` called
3. `render/` — acquire canvas context
4. `input/` — attach event listeners
5. `ui/` — bind DOM, subscribe to state
6. Start render loop

## Full Boundary Reference
See `MODULE_MAP.md` for the authoritative module boundary specification.
