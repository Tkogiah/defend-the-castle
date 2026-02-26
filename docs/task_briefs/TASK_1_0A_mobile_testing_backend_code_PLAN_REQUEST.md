# Task 1.0A Plan Request — Mobile Testing Backend (Code)

## Goal
- Make minimal code changes needed for mobile testing via local network, tunnel, or deploy.

## Context
- Current blockers: client WebSocket URL is hardcoded; server doesn’t serve static files.
- Related docs:
  - /Users/tkogiah/ai-workspace/defend-the-castle/BACKEND_CONTEXT.md
  - /Users/tkogiah/ai-workspace/defend-the-castle/docs/ARCHITECTURE.md

## Scope
- In scope:
  - Dynamic WebSocket URL in `src/net/client.js`.
  - Static file serving in `server/index.cjs` with a safe allowlist.
- Out of scope:
  - Full deployment or hosting changes.
  - New features.

## Constraints
- MVP-first
- No architecture changes beyond enabling access

## Risks / Unknowns
- Serving project root can expose files; use an allowlist.
- `file://` usage needs a fallback to localhost.

## Testing
- Manual: load on phone via local IP and verify WebSocket connects.

## Files (anticipated)
- /Users/tkogiah/ai-workspace/defend-the-castle/src/net/client.js
- /Users/tkogiah/ai-workspace/defend-the-castle/server/index.cjs

## Success Criteria
- Phone can load the game and connect to WebSocket from local network.
- No unintended file exposure.
