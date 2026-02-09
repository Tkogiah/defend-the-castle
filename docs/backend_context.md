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

**Reasons**
- Demonstrates professional engineering habits.
- Provides confidence as multiplayer complexity grows.

## Documentation Goals
- Explain why authoritative server and snapshots were chosen.
- Document action flow: client intent → server validate → state update → broadcast.
- Document turn readiness gate (all players end turn → enemy phase).
