# Mobile Testing — Defend the Castle

Requires Task 1.0A changes (dynamic WebSocket URL + static file serving in `server/index.cjs`).

---

## Option 1 — Local Network (Fastest)

Phone and dev machine must be on the same WiFi.

```bash
# 1. Start the server
node server/index.cjs

# 2. Find your machine's local IP (macOS)
ipconfig getifaddr en0   # try en1 if this returns nothing

# 3. Open on phone
http://<local-ip>:8080
```

The game loads and WebSocket connects automatically. No code changes needed.

---

## Option 2 — Cloudflare Tunnel (Different Network or Sharing)

Use when phone is not on the same WiFi, or to share with others for testing.

```bash
# Install once
brew install cloudflared       # macOS
# or: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

# Run (no account required for short sessions)
node server/index.cjs          # in one terminal
cloudflared tunnel --url http://localhost:8080   # in another
```

Cloudflared prints a public HTTPS URL (e.g. `https://xyz.trycloudflare.com`). Open that on any device — WebSocket uses `wss://` automatically via the dynamic URL in `client.js`.

**Alternative: ngrok**
```bash
ngrok http 8080
```
ngrok works but free-tier sessions may drop idle WebSocket connections after ~30 seconds. Prefer cloudflared for sustained testing.

**Known limitations (both tools)**
- Added latency vs local network.
- Free-tier rate limits apply — not for production use.
- URLs are temporary and change each session.

---

## Option 3 — Minimal Deploy (Railway)

For stable testing without needing a local machine running.

1. Push repo to GitHub.
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo.
3. Set start command: `node server/index.cjs`
4. No build step needed — static files are served by the same process.
5. Railway auto-provisions HTTPS. The dynamic WebSocket URL in `client.js` handles `wss://` automatically.

See `BACKEND_CONTEXT.md` for more on the deployment target choice.

---

## Checklist After Any Setup

- [ ] Game loads without console errors.
- [ ] Cards can be played and turn can be ended (WebSocket is live).
- [ ] Touch drag-to-play works on mobile.
