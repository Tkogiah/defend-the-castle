# Brief — Move Camera Constants to config/

Working directory
/Users/tkogiah/ai-workspace/defend-the-castle

Allowed files
- /Users/tkogiah/ai-workspace/defend-the-castle/src/input/camera.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/config/constants.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/config/index.js

Scope
Input + config only.

Goal
Centralize camera constants (MIN_ZOOM, MAX_ZOOM, etc.) in config/ or document explicit exceptions.

Constraints
- Follow allowed import graph (input → config, hex only).
- No main.js changes.

Expected output
- Summary of changes
- Files touched
- Open questions/risks
