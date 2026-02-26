# net Context

## Purpose
- Client-side networking for multiplayer: connect to WebSocket server, send intents, receive snapshots.

## Public API (index.js)
- Protocol helpers and socket client creation.

## Invariants / Rules
- Client sends intents only; server is authoritative.
- JSON message format.

## Inputs / Dependencies
- WebSocket server at `ws://localhost:8080` (MVP).
