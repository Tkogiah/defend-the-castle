# Decisions Log

Record high-level, durable decisions here. Keep entries short and dated (YYYY-MM-DD).

## Template
## YYYY-MM-DD — Decision Title
- Decision: <what we decided>
- Rationale: <why this decision was made>
- Alternatives: <what we considered but did not choose>
- Impact: <what this changes for scope/architecture>

## Entries
- 2026-01-21 — Initial project scope captured in `CONTEXT.md`.
## 2026-01-23 — Spiral path movement system
- Decision: Use a spiral path labeling hexes 0..90 as the authoritative movement path. Players move label +/-1; enemies start at label 90 and move counter-clockwise. Dragon Mount bypasses path constraints.
- Rationale: Matches boardgame movement intent and keeps movement rules deterministic.
- Alternatives: Free movement with costs; ring-only movement without a continuous path.
- Impact: Movement rules, enemy movement, and path mapping helpers depend on this labeling.
## 2026-01-21 — MVP decisions (turn model, pacing, camera)
- Decision: MVP uses strict turn-based flow, fixed enemy movement bounds per wave, and a center-locked camera with pan/zoom.
- Rationale: Keeps MVP pacing predictable and readable, while supporting mobile-scale clarity.
- Alternatives: Hybrid cadence, scaling movement bounds, fixed full-board camera.
- Impact: Drives initial turn loop design and render/input requirements (camera controls).
