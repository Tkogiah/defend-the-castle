# Brief — Enforce Data-Only Boundary

Working directory
/Users/tkogiah/ai-workspace/defend-the-castle

Allowed files
- /Users/tkogiah/ai-workspace/defend-the-castle/src/data/*.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/core/*.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/data/index.js

Scope
Data + core only. No render/input/ui changes.

Goal
Enforce data-only boundary by moving gear helpers (instance creation + random drop) out of data/ into core/. Ensure core imports via src/data/index.js only.

Constraints
- data/ must remain static definitions only (no logic).
- Follow allowed import graph (core → data, config; data → none).
- No main.js changes.

Expected output
- Summary of changes
- Files touched
- Open questions/risks

Execution rule
- Propose plan first; do not implement until explicitly approved.
