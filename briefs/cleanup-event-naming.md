# Brief — Enforce UI Event Naming Convention

Working directory
/Users/tkogiah/ai-workspace/defend-the-castle

Allowed files
- /Users/tkogiah/ai-workspace/defend-the-castle/src/ui/*.js
- /Users/tkogiah/ai-workspace/defend-the-castle/src/main.js (Codex wiring only)

Scope
UI events only. No behavior changes.

Goal
Ensure all CustomEvent names follow MODULE_MAP convention:
- kebab-case
- noun-verb or noun-noun (e.g., card-played, gear-equip, merchant-buy)
- all events include detail object with relevant IDs/data

Constraints
- No new features.
- Do not edit main.js (Codex will wire if needed).

Expected output
- Summary of changes
- Files touched
- Open questions/risks

Execution rule
- Propose plan first; do not implement until explicitly approved.
