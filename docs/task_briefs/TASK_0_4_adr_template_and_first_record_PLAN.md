# Task 0.4 Plan — ADR Template + First Record

## Goal
- Create a lightweight ADR template and write ADR-001 capturing the authoritative server + full snapshot decision.

## Plan
1. Create `docs/adr/` with `ADR_TEMPLATE.md` using a short format: Title, Status, Date, Context, Decision, Consequences, Alternatives (optional). Keep it brief.
2. Write `docs/adr/ADR_001_authoritative_server_full_snapshots.md` using the template. Summarize the decision and rationale; point to `BACKEND_CONTEXT.md` for full detail.
3. Add a small “Decision Log” section to `CONTEXT.md` pointing to `docs/adr/` (do not add ADRs to the read order).

## Files
- `docs/adr/ADR_TEMPLATE.md` (new)
- `docs/adr/ADR_001_authoritative_server_full_snapshots.md` (new)
- `CONTEXT.md` (small pointer addition only)

## Testing
- Not applicable (docs-only).

## Notes
- Keep ADRs decision-focused; avoid duplicating architecture docs.
- ADRs should remain short and readable at a glance.
