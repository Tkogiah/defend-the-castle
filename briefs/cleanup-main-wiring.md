# Brief — Move Non-Wiring Helpers out of main.js

Working directory
/Users/tkogiah/ai-workspace/defend-the-castle

Allowed files
- /Users/tkogiah/ai-workspace/defend-the-castle/src/main.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/core/*.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/hex/*.js

Scope
Core + hex only (Codex wires main.js). No render/input/ui changes.

Goal
Relocate pathing helpers (buildSpiralPath, resolveStepForDirection) and enemy-phase decisions out of main.js into core/ or hex/ as pure functions.

Constraints
- main.js changes are handled by Codex only.
- Move logic into core/ or hex/ as pure helpers.
- Follow allowed import graph (core → hex, data, config).

Expected output
- Summary of changes
- Files touched
- Open questions/risks
