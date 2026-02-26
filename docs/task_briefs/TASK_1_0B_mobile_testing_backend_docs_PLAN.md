# Task 1.0B Plan — Mobile Testing Backend (Docs)

## Goal
- Short, actionable docs covering mobile testing via local network, tunnel, and minimal deploy.

## Plan

Step 1 — Create `docs/MOBILE_TESTING.md`
- Local network: run server, find local IP, open `http://<local-ip>:8080` on phone.
- Tunnel: recommend Cloudflare Tunnel (cloudflared). Mention ngrok as alternative.
- Minimal deploy (Railway): connect repo, set start command `node server/index.cjs`, note HTTPS/WSS.

Step 2 — Update `README.md`
- Add a pointer in Local Development to `docs/MOBILE_TESTING.md`.

Step 3 — Update `BACKEND_CONTEXT.md`
- Add a short “Deployment” section referencing Railway as the minimal deploy target.
- Point to `docs/MOBILE_TESTING.md` for steps and limitations.

## Files
- `docs/MOBILE_TESTING.md`
- `README.md`
- `BACKEND_CONTEXT.md`

## Testing
- Not applicable (docs-only).

## Notes
- Keep MOBILE_TESTING.md short and scannable.
- Document tunnel limitations (latency, rate limits, not production).
- Railway is a minimal path, not a production recommendation.
