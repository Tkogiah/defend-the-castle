# Task 0.5 Plan Request — Module Boundary Audit

## Goal
- Verify module import boundaries match MODULE_MAP.md and identify any violations.

## Context
- Why now: new docs and ADRs formalize architecture; we need to ensure code matches boundaries.
- Related docs:
  - /Users/tkogiah/ai-workspace/defend-the-castle/MODULE_MAP.md
  - /Users/tkogiah/ai-workspace/defend-the-castle/docs/ARCHITECTURE.md

## Scope
- In scope:
  - Audit imports across modules.
  - List any violations and proposed fixes.
  - If fixes are small, propose a follow-up plan.
- Out of scope:
  - Large refactors or architecture changes.
  - New features.

## Constraints
- MVP-first
- main.js is composition root
- Module boundaries per MODULE_MAP.md

## Risks / Unknowns
- Hidden circular imports or boundary leaks.

## Testing
- Not applicable for audit only.

## Files (anticipated)
- /Users/tkogiah/ai-workspace/defend-the-castle/docs/task_briefs/TASK_0_5_module_boundary_audit_PLAN.md
- /Users/tkogiah/ai-workspace/defend-the-castle/MODULE_MAP.md (if a boundary update is required)

## Success Criteria
- Clear list of module boundary violations (or confirmation of none).
- Suggested fixes or follow-up briefs if violations exist.
