# Task 1.0A Plan — Mobile Testing Backend (Code)

## Goal
- Two minimal code changes that unblock mobile testing across local, tunnel, and deploy workflows.

## Plan

Step 1 — Dynamic WebSocket URL (`src/net/client.js`)
- Replace hardcoded `ws://localhost:8080` with a URL derived from `window.location`.
- Use a fallback for `file://` access:
  - `const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';`
  - `const host = window.location.host || 'localhost:8080';`
  - `const ws = new WebSocket(`${protocol}//${host}`);`

Step 2 — Static file serving with allowlist (`server/index.cjs`)
- Wrap the existing WebSocket server with a Node `http` server.
- Serve static files from the project root using an extension allowlist:
  - `.html, .css, .js, .png, .jpg, .svg, .ico, .woff, .woff2, .json`
- Block path traversal and any request that resolves outside the project root.
- Default `/` to `/index.html` for convenience.
- WebSocket upgrades continue to route to the existing ws server.

## Files
- `src/net/client.js`
- `server/index.cjs`

## Testing
- Manual: `node server/index.cjs`, open `http://localhost:8080` — confirm game loads.
- Manual: open `http://<local-ip>:8080` on phone (same WiFi) — confirm game loads + WS connects.
- Verify: request for `server/index.cjs` returns 403.

## Notes
- Keep allowlist narrow; add extensions only when needed (e.g., audio later).
- No architecture changes; server/index.cjs is outside module boundary rules.
