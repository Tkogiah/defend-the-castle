# AGENTS — Defend the Castle

## Purpose
Fast on-ramp for new Codex/agent sessions. Read in order.

## Working Directory
/Users/tkogiah/ai-workspace/defend-the-castle

## Read Order (Required)
1) /Users/tkogiah/ai-workspace/defend-the-castle/CONTEXT.md
2) /Users/tkogiah/ai-workspace/defend-the-castle/MODULE_MAP.md
3) /Users/tkogiah/ai-workspace/defend-the-castle/SESSION_SUMMARY.md
4) /Users/tkogiah/ai-workspace/defend-the-castle/TODO.md
5) /Users/tkogiah/ai-workspace/defend-the-castle/specs/mvp.md
6) /Users/tkogiah/ai-workspace/defend-the-castle/NOTES.md
7) /Users/tkogiah/ai-workspace/defend-the-castle/README.md
8) Each module: read context.md, then index.js (wiring + public API)
   - /Users/tkogiah/ai-workspace/defend-the-castle/src/core/context.md
   - /Users/tkogiah/ai-workspace/defend-the-castle/src/hex/context.md
   - /Users/tkogiah/ai-workspace/defend-the-castle/src/config/context.md
   - /Users/tkogiah/ai-workspace/defend-the-castle/src/input/context.md
   - /Users/tkogiah/ai-workspace/defend-the-castle/src/render/context.md
   - /Users/tkogiah/ai-workspace/defend-the-castle/src/data/context.md
7) Briefing templates (when writing briefs or reviews):
   - /Users/tkogiah/ai-workspace/defend-the-castle/tech/BRIEFS.md
   - /Users/tkogiah/ai-workspace/defend-the-castle/tech/REVIEW_BRIEF_TEMPLATE.md
   - /Users/tkogiah/ai-workspace/defend-the-castle/tech/CHANGE_SUMMARY_TEMPLATE.md
   - /Users/tkogiah/ai-workspace/defend-the-castle/tech/agent-brief-state-rules.md
9) Backend context (read once per session):
   - /Users/tkogiah/ai-workspace/defend-the-castle/BACKEND_CONTEXT.md

## Roles
- You (project owner): holds full scope/vision and directs priorities.
- Codex (coordinator): brief writer/reviewer; manages main.js composition root;
  no code changes unless explicitly asked.
- Claude (implementation agent): manages module index.js wiring and implements
  scoped tasks from briefs; reports summary/files/open questions. Do not edit
  main.js unless explicitly approved in the brief.

## Guardrails
- MVP-first. No architecture changes unless approved.
- main.js is the only composition root.
- Each folder has context.md + index.js; read and respect them.
- Logic stays in core; rendering in render; input emits intents only.
- Code changes are committed and pushed after approval.

## Workflow Reminder
- After any project file updates, offer to commit changes to git.
- Brief workflow: send task brief with a proposed execution plan (3-6 bullet points), get approval, then request implementation. Do not send execution briefs.
