# Project Context — Defend the Castle

## Purpose
Single canonical entry point for agents and collaborators. Keep this file short, stable, and pointer-driven.

## Read Order (Canonical)
1) `/Users/tkogiah/ai-workspace/defend-the-castle/AGENTS.md` (roles, workflow, guardrails)
2) `/Users/tkogiah/ai-workspace/defend-the-castle/docs/PROJECT_INTENT.md` (what, why, success criteria)
3) `/Users/tkogiah/ai-workspace/defend-the-castle/MODULE_MAP.md` (module boundaries + wiring)
4) `/Users/tkogiah/ai-workspace/defend-the-castle/docs/ARCHITECTURE.md` (module map summary + data flow)
5) `/Users/tkogiah/ai-workspace/defend-the-castle/specs/mvp.md` (MVP rules + scope)
6) `/Users/tkogiah/ai-workspace/defend-the-castle/TESTING_CONTEXT.md` (process + CI/testing guardrails)
7) `/Users/tkogiah/ai-workspace/defend-the-castle/BACKEND_CONTEXT.md` (authoritative server plan)
8) `/Users/tkogiah/ai-workspace/defend-the-castle/README.md` (public framing)
9) `/Users/tkogiah/ai-workspace/defend-the-castle/MVP_ROADMAP.md` (staged plan)
10) `/Users/tkogiah/ai-workspace/defend-the-castle/docs/ROADMAP.md` (task roadmap)
11) `/Users/tkogiah/ai-workspace/defend-the-castle/SESSION_SUMMARY.md` (latest session state)
12) `/Users/tkogiah/ai-workspace/defend-the-castle/TODO.md` (legacy pointer only)

## Module Contexts (Read Only When Working in That Module)
- `/Users/tkogiah/ai-workspace/defend-the-castle/src/core/context.md`
- `/Users/tkogiah/ai-workspace/defend-the-castle/src/render/context.md`
- `/Users/tkogiah/ai-workspace/defend-the-castle/src/input/context.md`
- `/Users/tkogiah/ai-workspace/defend-the-castle/src/ui/context.md`
- `/Users/tkogiah/ai-workspace/defend-the-castle/src/hex/context.md`
- `/Users/tkogiah/ai-workspace/defend-the-castle/src/data/context.md`
- `/Users/tkogiah/ai-workspace/defend-the-castle/src/config/context.md`
- `/Users/tkogiah/ai-workspace/defend-the-castle/src/net/context.md`

## Task Briefs (Process API)
- Brief templates live in `/Users/tkogiah/ai-workspace/defend-the-castle/docs/task_briefs/`
- Use a “plan request → plan” format for non-trivial tasks.
- Name briefs as `TASK_<number>_<short_name>_PLAN_REQUEST.md` and `TASK_<number>_<short_name>_PLAN.md`.

## Decision Log (ADRs)
- Durable architecture decisions are recorded as ADRs in `/Users/tkogiah/ai-workspace/defend-the-castle/docs/adr/`.
- ADRs are reference material — do not add them to the session read order.
- Template: `docs/adr/ADR_TEMPLATE.md`
- ADR-001: Authoritative server + full state snapshots (`docs/adr/ADR_001_authoritative_server_full_snapshots.md`)

## Current Snapshot (Keep Short)
- Concept: co-op fantasy deck-building tower defense on a hex map.
- Stack: HTML/CSS/JS + Canvas 2D (mobile-first).
- Architecture: `main.js` is the only composition root; module boundaries enforced by `MODULE_MAP.md`.
- Core loop: play cards → move/attack → collect crystals → return center → buy cards → repeat.
- Movement: fixed spiral path; rules defined in `specs/mvp.md`.
- Backend: authoritative WebSocket server planned; full snapshots for MVP (see `BACKEND_CONTEXT.md`).
- Workflow: brief → branch → implement → test → PR → merge (see `TESTING_CONTEXT.md`).

## Update Rules
- Update this file only when architecture, workflow, or MVP scope changes.
- Do not duplicate rules already defined in `specs/mvp.md` or module contexts.
- Use `SESSION_SUMMARY.md` for session notes and `NOTES.md` for rough ideas.

## Recent Updates
- 2026-02-26: Reframed CONTEXT.md as a pointer-driven API and added task brief workflow entry.
- 2026-02-26: Added docs/PROJECT_INTENT.md and docs/ARCHITECTURE.md to read order (Task 0.2).
- 2026-02-26: Added Decision Log section + ADR template + ADR-001 (Task 0.4).
