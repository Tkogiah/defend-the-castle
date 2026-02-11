# net Context

## Purpose
- Client-side networking for multiplayer: connect to WebSocket server, send intents, receive snapshots.

## Public API (index.js)
- Export protocol helpers and socket client creation.

## Key Files
- `protocol.js`: message type constants + helper builders.
- `client.js`: WebSocket client wrapper (connect, send, receive, callbacks).
- `index.js`: public exports.

## Invariants / Rules
- Client sends **intents only** (no direct state mutation).
- Server is authoritative; client renders snapshots.
- JSON is the message format.

## Inputs / Dependencies
- WebSocket server at `ws://localhost:8080` (MVP).

## Outputs / Side Effects
- Network traffic over WebSockets.
- Calls provided callbacks (`onState`, `onError`) with server messages.

## Notes
- Snapshots are full state for MVP; diffs can be added later.
- Keep message schema documented and stable.
