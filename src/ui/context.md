# ui Context

## Purpose
DOM UI for panels, buttons, cards, and drag/drop interactions.

## Public API (index.js)
- subscribeToState
- updateMerchantVisibility
- closeMerchant
- renderHand
- renderGearSlots
- renderInventory

## Key Files
- index.js: UI entry point + event wiring.
- hand.js: Hand rendering helpers.

## Invariants / Rules
- No game logic or state mutation.
- Emits DOM events for main.js to handle.
- Reads state only via `state-changed` event.

## Inputs / Dependencies
- DOM elements and CSS.
- `./hand.js` for card rendering helpers.

## Outputs / Side Effects
- DOM updates.
- Emits CustomEvents (card-played, merchant-buy, etc.).

## Notes
- Keep UI-only responsibilities in this module.
