# Backend Context — Defend the Castle

## Goal
Build a professional, portfolio‑grade multiplayer backend with clear, explainable architecture and testability.

## Multiplayer Model (MVP)
- **Co‑op, synchronous turn‑based**: players act during player phase, then enemy phase runs after all players confirm "End Turn."
- **Room size**: 3 players for MVP (targeting 5 later).
- **Real‑time sync**: all players see actions immediately while in player phase.

## Architecture Choice: Authoritative Server
We will use an **authoritative server** that owns game state and validates actions.

**Reasons**
- Prevents desyncs and cheating.
- Single source of truth for game rules.
- Easier debugging and clearer architecture story for a portfolio.

## State Sync Strategy: Full Snapshots (MVP)
The server will send **full state snapshots** after each action.

**Reasons**
- Simplest to implement and debug.
- Small state size in MVP makes bandwidth acceptable.
- Avoids patch/missed‑diff issues early on.

We can switch to diffs later if needed.

## Rules Placement: Shared Core (Recommended)
The existing `core/` rules should be reused on the server to enforce consistency.

**Pros**
- Single source of truth across client and server.
- Fewer bugs and mismatched behaviors.
- Strong architectural narrative (separation of concerns + shared rules).

**Cons**
- Requires clean separation from render/UI (already in place).

## Testing & CI (MVP)
- **Unit tests** for core rules (pure functions).
- **Integration test** for WebSocket flow (join room → action → snapshot).
- **GitHub Actions** to run tests on push/PR.
- **Node config**: root `package.json` uses `"type": "module"`; server entry is `server/index.cjs`.

**Reasons**
- Demonstrates professional engineering habits.
- Provides confidence as multiplayer complexity grows.

## Action Flow

Each player action follows this exact path:

```
1. Client captures input (click / key / card play)
2. input/ emits intent callback → main.js
3. main.js sends intent to server via src/net/client.js (WebSocket message)
   e.g. { type: 'action', action: 'move', target: { q, r } }
4. server/index.cjs receives message, validates action type and payload
5. Server applies action through shared core/ rule function
   e.g. gameState = movePlayer(gameState, target)
6. Server broadcasts full state snapshot to all connected clients
   e.g. { type: 'state', state: gameState, room: roomState }
7. Each client receives snapshot → main.js applies it as authoritative state
8. render/ and ui/ update from new state
```

**Offline fallback**: if the WebSocket is not open, `client.js` returns `false` on `send()`. `main.js` falls back to applying the action locally so single-player still works without a server.

## Turn Readiness Gate (Multiplayer)
- During player phase, each player's actions are applied immediately and broadcast.
- Enemy phase runs only after **all** connected players have sent `{ type: 'endTurn' }`.
- The server tracks `roomState.players`; the turn gate will check that all players have confirmed before calling `applyEndTurnWithSnapshots()`.
- *(Note: full per-player turn gate is pending the multi-player state milestone.)*

## Documentation Goals
- ~~Document action flow~~ — done above.
- ~~Document turn readiness gate~~ — documented above (implementation pending).
- Explain why authoritative server and snapshots were chosen — see "Architecture Choice" and "State Sync Strategy" sections above.
