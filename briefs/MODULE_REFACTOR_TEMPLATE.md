# Module Refactor Brief — Defend the Castle

## Task Title
Refactor the <MODULE_NAME> module into a clean subfolder structure

## Goal (1–2 sentences)
Take ownership of one full module and break it into small, focused files with a clear index.js wiring layer and a folder-level context.md that explains intent and boundaries.

## Definition of Done
- A short plan is proposed first (3–6 bullets) and approved before code changes.
- The module is organized into sensible subfiles (no single file should be a god file).
- index.js exports the public API for the module.
- context.md documents purpose, API, invariants, inputs, outputs, and notes.
- All imports from outside the folder go through the module’s index.js.
- No behavior changes unless explicitly approved.

## Constraints
- Work inside one module folder only.
- Keep API surface stable (unless changes are explicitly approved).
- Follow project context and MVP constraints.

## Inputs / Context
- /Users/tkogiah/ai-workspace/defend-the-castle/CONTEXT.md
- /Users/tkogiah/ai-workspace/defend-the-castle/specs/mvp.md
- /Users/tkogiah/ai-workspace/defend-the-castle/README.md
- /Users/tkogiah/ai-workspace/defend-the-castle/src/<module>/context.md

## Files/Areas Allowed
- /Users/tkogiah/ai-workspace/defend-the-castle/src/<module>/ (including index.js + context.md)

## Outputs Expected
- Plan (before changes)
- Summary of changes
- Files touched
- Open questions

## Decision Required
- Approval of the plan before implementation.

## Review Notes (for lead)
- Confirm no scope creep beyond MVP.
