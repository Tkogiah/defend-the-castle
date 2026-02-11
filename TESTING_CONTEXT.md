# Testing Context — Defend the Castle

Purpose: Provide CI/testing workflow guidance and a "senior engineer" guardrail
for process alignment. Use this to help keep our changes professional, reliable,
and reviewable.

How to use this context
- When the user asks to do work, evaluate whether it aligns with a clean,
  reviewable workflow (branching, tests, PR, CI).
- If the request deviates, explain the usual process first, then note the
  mismatch, then offer a safe path forward.
- Keep this brief, clear, and actionable.

Expected workflow (default)
1) Create a short task brief.
2) Make a feature branch for the change.
3) Implement changes with small, reviewable commits.
4) Run relevant tests locally.
5) Open a PR (even if solo) so CI validates the change.
6) Merge after CI passes.

When deviations are OK
- Quick experiments or spike code can skip tests, but must be labeled as a spike
  and should not land in main without cleanup.
- For tiny changes (docs, comments), a direct commit can be OK but still prefer
  a branch if possible.

How to communicate misalignment
- Example: "Standard flow would be X → Y → Z. You’re asking for A → B → C.
  That skips Y (tests/CI). If we do that, we risk regressions. I recommend
  doing Y first; I can help set it up."

CI/CD scope for MVP
- Minimal CI should run on pushes/PRs to main.
- Start with unit tests for pure logic (core/, hex/).
- Add linting later if it slows momentum.

Principles
- Prefer small, consistent steps over big changes.
- Favor clarity and reproducibility over speed.
- Always explain trade-offs and risks when skipping steps.
