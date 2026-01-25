# Backend MVP Spec — Defend the Castle

Purpose: Minimal backend to support online play later, while enabling
save/load and win/loss tracking now. Keep it simple and learnable.

## MVP Goals
- Save and load a game state.
- Record wins/losses tied to a saved state.
- Store a lightweight snapshot (gear + hand) for the win/loss record.
- Keep the data model compatible with future multiplayer.

## Non-Goals (MVP)
- Real-time multiplayer.
- Matchmaking or lobbies.
- Authentication (can be added later).

## Minimal Data Model (Draft)

### SaveSlot
- id (string)
- updatedAt (timestamp)
- state (GameState JSON)

### ResultRecord
- id (string)
- saveId (string)
- outcome ("win" | "loss")
- timestamp (timestamp)
- snapshot
  - gear: Gear[]
  - hand: Card[]
  - gold: number
  - wave: number

## API (Draft, minimal)
- POST /api/save
  - body: { saveId?, state }
  - returns: { saveId, updatedAt }

- GET /api/save/:saveId
  - returns: { saveId, state, updatedAt }

- POST /api/result
  - body: { saveId, outcome, snapshot }
  - returns: { id, timestamp }

- GET /api/results?saveId=
  - returns: { results: ResultRecord[] }

## Implementation Options

### Option A — Local-first (no server yet)
- Use localStorage or IndexedDB.
- Mirror the API shape in a thin client wrapper.
- Later swap in the server with minimal UI changes.

### Option B — Minimal Node server
- Express server with in-memory or file-based JSON store.
- Keep endpoints identical to above.
- Still no auth; rely on saveId as the key.

## Future Multiplayer Notes
- SaveId becomes SessionId.
- ResultRecord becomes GameResult.
- State model already aligned with server authority later.

## Testing Checklist
- Save and load a state without corruption.
- Record win/loss with snapshot correctly.
- Results list returns all records for a saveId.
