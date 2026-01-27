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
Move data helpers (gear instance creation + random drop) out of data/ or document exception. Ensure core imports via src/data/index.js only.

Expected output
- Summary of changes
- Files touched
- Open questions/risks
