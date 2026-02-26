# ADR-001 — Authoritative Server + Full State Snapshots

| Field  | Value |
|--------|-------|
| Status | Accepted |
| Date   | 2026-02-11 |

## Context
The game requires a multiplayer backend for co-op play. Two key decisions needed to be made: (1) who owns and validates game state, and (2) how state is synced to clients after each action. Both decisions affect complexity, debuggability, cheat-resistance, and portfolio clarity.

## Decision
Use an **authoritative server** that owns all game state and validates every action through the shared `core/` rules module. After each validated action, the server broadcasts a **full state snapshot** to all connected clients.

## Consequences
**Positive**
- Single source of truth eliminates client desync.
- Cheat-resistance: clients send intents only; server enforces all rules.
- Shared `core/` rules between client and server reduces bugs from mismatched logic.
- Full snapshots are simple to implement, debug, and reason about.
- Clear architecture story for a portfolio project.

**Negative / Trade-offs**
- Full snapshots use more bandwidth than diff-based sync; acceptable for MVP given small state size.
- Server becomes a single point of failure; acceptable for MVP scope.
- Requires clean separation of `core/` from render/UI (already enforced by `MODULE_MAP.md`).

## Alternatives Considered
- **Client-authoritative**: each client runs rules and peers sync. Rejected — prone to desync and cheating; poor portfolio narrative.
- **Diff-based sync**: server sends only changed fields. Rejected for MVP — adds patch/merge complexity; revisit if bandwidth becomes an issue post-MVP.

## References
- `BACKEND_CONTEXT.md` — full architecture rationale and action flow documentation.
- `MODULE_MAP.md` — module boundary rules that make shared `core/` possible.
