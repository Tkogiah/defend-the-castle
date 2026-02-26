# Project Intent — Defend the Castle

## What It Is
Defend the Castle is a co-op fantasy deck-building tower defense game played on a 91-hex spiral map. 1–3 players defend a central castle against 10 waves of enemies and bosses by playing cards, moving along a fixed spiral path, attacking enemies, and upgrading their decks.

## Who It Is For
- **Portfolio audience**: demonstrates clean JavaScript architecture, authoritative WebSocket multiplayer, module-boundary discipline, and professional CI/testing habits.
- **Players**: co-op sessions targeting ~60 minutes with strong spatial tension (distance from center = more crystals, more risk) and meaningful deck-building decisions.

## What MVP Success Looks Like
- One full game loop is playable end-to-end: start → 10 waves → boss kills → win/lose screen.
- Single-player works offline; multiplayer works with an authoritative Node.js WebSocket server.
- Core architecture is clean, testable, and documented enough for another engineer to navigate in under 10 minutes.
- No gameplay-blocking bugs. Polish (art, audio) can follow after the loop is solid.

## What This Project Is Not (MVP Scope)
- Not a real-time action game. Turn-based, discrete hex movement only.
- Not a solo side project demo. Architecture choices (module boundaries, shared core/, full-snapshot sync) are intentional and explainable.
- Post-MVP ideas (hybrid real-time movement, sweep attacks, stealth, gear trading) are tracked in `TODO.md` and `specs/post_mvp_ideas.md` but not in scope now.

## Where Decisions Live
- `CONTEXT.md` — canonical source of truth for all project decisions.
- `MODULE_MAP.md` — module boundaries and wiring rules.
- `specs/mvp.md` — MVP feature set.
- `BACKEND_CONTEXT.md` — backend architecture and multiplayer model.
