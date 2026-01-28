# Brief — Error Boundary + State Schema Coordination

Working directory
/Users/tkogiah/ai-workspace/defend-the-castle

Allowed files
- /Users/tkogiah/ai-workspace/defend-the-castle/src/main.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/core/*.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/ui/*.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/render/*.js

Scope
Error handling + state schema coordination only. No new gameplay.

Goal
Implement/confirm main.js as error boundary and document state schema coordination:
- core/ may throw on invalid actions
- render/input ignore invalid events (no throws)
- ui may throw; main.js catches/logs

Constraints
- Keep changes minimal; do not add UI error panel yet (just document hooks if needed).

Expected output
- Summary of changes
- Files touched
- Open questions/risks

Execution rule
- Propose plan first; do not implement until explicitly approved.
