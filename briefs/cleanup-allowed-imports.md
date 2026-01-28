# Brief — Enforce Allowed Import Graph

Working directory
/Users/tkogiah/ai-workspace/defend-the-castle

Allowed files
- /Users/tkogiah/ai-workspace/defend-the-castle/src/core/*.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/render/*.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/input/*.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/ui/*.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/hex/*.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/data/*.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/config/*.js

Scope
Module imports only. No behavior changes.

Goal
Align all imports with MODULE_MAP allowed-import rules:
- core → hex, data, config
- render → hex, config
- input → hex, config
- ui → data, config
- hex → config
- data → (none)
- config → (none)

Constraints
- No logic changes.
- If a violation exists, fix by rerouting through the correct module index.js or moving helper to its owning module.
- main.js changes are handled by Codex (do not edit main.js).

Expected output
- Summary of changes
- Files touched
- Open questions/risks

Execution rule
- Propose plan first; do not implement until explicitly approved.
