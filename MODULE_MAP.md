# Module Map — Defend the Castle

Purpose: define clear module boundaries, inputs/outputs, and wiring rules so the
project scales cleanly and tasks stay small.

Guiding rules
- main.js is the only composition root.
- core never imports render/input/ui.
- render never mutates game state.
- input emits intents only (no game logic).
- ui is DOM-only; it emits events and receives state via subscription.
- data is static content; no logic.
- "Game rules" means: valid move checks, damage/effect calculations, win/lose/turn logic, resource costs. Only core/ may implement these.

Allowed imports (→ means "may import from")
- core → hex, data, config
- render → hex, config
- input → hex, config
- ui → data, config
- net → (none)
- hex → config
- data → (none)
- config → (none)
- main.js → all modules

## core/
Responsibility
- Game rules, state transitions, win/lose conditions.
Inputs
- Current state + action parameters.
Outputs
- New state (pure).
Exports
- createInitialState, start/end turn, movement/attack, wave/boss logic, gear logic.
State schema
- State shape is owned by core/. Changes require updating render/ and ui/.
Forbidden
- DOM, canvas, input, rendering.
Read when working on this module
- /Users/tkogiah/ai-workspace/defend-the-castle/src/core/context.md
- /Users/tkogiah/ai-workspace/defend-the-castle/src/core/index.js

## render/
Responsibility
- Canvas drawing, animations, overlays.
Inputs
- State + view + optional overlay hints.
Outputs
- Pixels only (no game state mutation; internal animation state is allowed).
Exports
- renderFrame, animation controls, overlay helpers.
Forbidden
- DOM manipulation (except canvas 2D context), game state mutation, game rules.
Read when working on this module
- /Users/tkogiah/ai-workspace/defend-the-castle/src/render/context.md
- /Users/tkogiah/ai-workspace/defend-the-castle/src/render/index.js

## input/
Responsibility
- Map pointer/keyboard/touch to intent callbacks.
Inputs
- Canvas + view + callbacks.
Outputs
- Intent callbacks (move, hover, direction, etc.).
Exports
- setupInputControls (and per-module helpers).
Exception
- View state (pan/zoom) is presentation-layer state, mutated directly by input/. Not game state.
Forbidden
- Game rules, canvas rendering.
Read when working on this module
- /Users/tkogiah/ai-workspace/defend-the-castle/src/input/context.md
- /Users/tkogiah/ai-workspace/defend-the-castle/src/input/index.js

## ui/
Responsibility
- DOM panels, buttons, cards, drag/drop.
Inputs
- State (read-only).
Outputs
- Custom DOM events (card-played, gear-equip, end-turn, etc.).
Exports
- subscribeToState, UI helpers used by main.js.
Event naming
- Kebab-case, noun-verb or noun-noun format (card-played, gear-equip, merchant-buy).
- All events carry a detail object with relevant IDs/data.
Forbidden
- Game rules, canvas rendering.
Read when working on this module
- /Users/tkogiah/ai-workspace/defend-the-castle/src/ui/context.md
- /Users/tkogiah/ai-workspace/defend-the-castle/src/ui/index.js

## net/
Responsibility
- Client-side networking for multiplayer: connect to WebSocket server, send intents, receive snapshots.
Inputs
- Connection params + callbacks.
Outputs
- Outbound intents, inbound full snapshots.
Exports
- createSocket, protocol helpers.
Forbidden
- Game rules, rendering, DOM.
Read when working on this module
- /Users/tkogiah/ai-workspace/defend-the-castle/src/net/context.md
- /Users/tkogiah/ai-workspace/defend-the-castle/src/net/index.js

## hex/
Responsibility
- Grid math, axial conversions, pathing helpers.
Inputs
- Coordinates.
Outputs
- Coordinates, labels, neighbors, ranges.
Exports
- getSpiralLabel, getSpiralAxial, getNeighbors, getHexesInRange, etc.
Forbidden
- Game rules, canvas rendering, DOM.
Read when working on this module
- /Users/tkogiah/ai-workspace/defend-the-castle/src/hex/context.md
- /Users/tkogiah/ai-workspace/defend-the-castle/src/hex/index.js

## data/
Responsibility
- Static game content definitions (cards, gear, shops, enemy types).
Inputs
- None (pure data).
Outputs
- Data structures for core/ui.
Exports
- Card lists, gear lists, constants.
Forbidden
- Any logic, DOM, canvas, imports from other modules.
Read when working on this module
- /Users/tkogiah/ai-workspace/defend-the-castle/src/data/context.md
- /Users/tkogiah/ai-workspace/defend-the-castle/src/data/index.js

## config/
Responsibility
- Tuning constants (sizes, scales, etc.).
Inputs
- None.
Outputs
- Constants consumed elsewhere.
Exports
- HEX_SIZE, BOARD_RADIUS, ISO_SCALE_Y, etc.
Forbidden
- None (constants only).
Read when working on this module
- /Users/tkogiah/ai-workspace/defend-the-castle/src/config/context.md
- /Users/tkogiah/ai-workspace/defend-the-castle/src/config/index.js

## main.js (composition root)
Responsibility
- Wire modules together.
- Translate DOM events into core actions.
- Pass state into render/ui.
Error boundary
- Catch and log errors from all modules; optionally show user feedback.
Forbidden
- Business logic beyond wiring.
Read when working on this module
- /Users/tkogiah/ai-workspace/defend-the-castle/MODULE_MAP.md
- /Users/tkogiah/ai-workspace/defend-the-castle/src/main.js

## Initialization order (in main.js)
1) config/, data/, hex/ — available via static imports
2) core/ — createInitialState() called
3) render/ — acquire canvas context
4) input/ — attach event listeners
5) ui/ — bind DOM, subscribe to state
6) Start render loop

## Task sizing rules
- One task touches 1–2 modules max.
- No cross-module refactors in a single task.
- main.js wiring is its own task.
- State schema changes span core/, render/, ui/ — treat as coordinated task.

## Error handling
- core/ — throws on invalid actions (caller catches).
- render/ — never throws (graceful degradation).
- input/ — never throws (ignores invalid input).
- ui/ — may throw; caught by main.js.
- main.js — logs errors, user-facing errors displayed via ui/ error panel (when implemented).

## Testing strategy
- core/, hex/ — unit tests (pure functions).
- data/ — schema validation.
- render/ — visual regression (optional).
- input/, ui/ — integration tests.
- main.js — end-to-end tests.

## Future modules (not yet implemented)
- audio/ — sound effects, music (event-driven).
- persistence/ — save/load game state (serialization only).

## debug/ (internal tool)
Responsibility
- Debug-only toggles and overlays.
Inputs
- Window/event hooks (e.g., hotkeys).
Outputs
- Debug overlay flags for render.
Forbidden
- Game rules, state mutation.
Read when working on this module
- /Users/tkogiah/ai-workspace/defend-the-castle/src/debug/index.js
