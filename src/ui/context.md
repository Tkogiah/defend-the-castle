# ui Context

## Purpose
- DOM UI for panels, buttons, cards, and drag/drop interactions.

## Public API (index.js)
- subscribeToState
- updateMerchantVisibility
- closeMerchant
- renderHand
- renderGearSlots
- renderInventory

## Invariants / Rules
- No game logic or state mutation.
- Emits DOM events for main.js to handle.
- Reads state only via subscription.

## Inputs / Dependencies
- DOM elements and CSS.
- `./hand.js` for card rendering helpers.
