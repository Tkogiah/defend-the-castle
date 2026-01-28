# Brief — UI Module Structure Cleanup

Working directory
/Users/tkogiah/ai-workspace/defend-the-castle

Allowed files
- /Users/tkogiah/ai-workspace/defend-the-castle/src/ui/context.md
- /Users/tkogiah/ai-workspace/defend-the-castle/src/ui/index.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/ui.js (if moving/renaming is approved)
- /Users/tkogiah/ai-workspace/defend-the-castle/src/main.js (Codex wiring only)

Scope
UI module only. No core/render/input changes.

Goal
Normalize UI module layout (context.md + index.js). Ensure main.js imports UI from module entry.

Constraints
- UI is DOM-only; no game rules or canvas rendering.
- Keep changes inside ui/ module (main.js wiring handled by Codex).
- Follow allowed import graph (ui → data, config only).

Expected output
- Summary of changes
- Files touched
- Open questions/risks
