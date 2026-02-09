# Backend Task Brief — Server Skeleton + Room + Snapshot Broadcast

## Task Title
Backend skeleton: authoritative WebSocket server with rooms and snapshot broadcast.

## Goal (1–2 sentences)
Stand up a minimal Node.js WebSocket server that hosts rooms (max 3 players), keeps authoritative game state per room, and broadcasts full state snapshots after each action.

## Definition of Done
- WebSocket server accepts connections and assigns players to rooms (max 3).
- Server owns canonical room state and applies player actions.
- After each valid action, server broadcasts full state snapshot to all clients in the room.
- Players can signal “end turn”; server advances to enemy phase once all players are ready.
- Clear README section describing architecture choices (authoritative + snapshots).

## Constraints
- Authoritative server only; client sends intents, server validates and applies.
- Full snapshots (no diffs) for MVP.
- Reuse shared core rules where feasible; no render/UI code on server.
- No main.js edits unless explicitly approved.

## Inputs / Context
- /Users/tkogiah/ai-workspace/defend-the-castle/docs/backend_context.md
- /Users/tkogiah/ai-workspace/defend-the-castle/CONTEXT.md
- /Users/tkogiah/ai-workspace/defend-the-castle/specs/mvp.md
- /Users/tkogiah/ai-workspace/defend-the-castle/README.md

## Files/Areas Allowed
- /Users/tkogiah/ai-workspace/defend-the-castle/server/
- /Users/tkogiah/ai-workspace/defend-the-castle/src/core/
- /Users/tkogiah/ai-workspace/defend-the-castle/package.json (if needed)

## Outputs Expected
- Summary of changes (required in final response)
- Files touched
- Open questions
- Risks / caveats (if any)

## Proposed Execution Plan
1) Create `server/` entrypoint with Node + WebSocket (e.g., `ws`).
2) Implement room manager (room ID, players, ready set, state).
3) Define message protocol (join, action, end-turn, snapshot).
4) Apply actions via shared core rules and broadcast full state.
5) Add README notes explaining authoritative server + snapshot choice.

## Open Questions
- Message schema: JSON shape for action intents and snapshots.
- Room creation: auto-assign or explicit room codes?
- Player identity: temporary session ID or persistent user ID?

