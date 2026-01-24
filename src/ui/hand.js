/**
 * hand.js - Hand rendering and card element factory
 * Reads from player.hand/deck/discard to render cards dynamically.
 */

// -----------------------------
// DOM References
// -----------------------------

const handCards = document.getElementById('hand-cards');
const deckCountEl = document.querySelector('#deck-count .pile-number');
const discardCountEl = document.querySelector('#discard-count .pile-number');

// -----------------------------
// Card Element Factory
// -----------------------------

/**
 * Create a card DOM element from card data.
 * @param {Object} card - Card data { id, type, name, description, value }
 * @returns {HTMLElement} Card element
 */
export function createCardElement(card) {
  const el = document.createElement('div');
  el.className = 'card-slot has-card';
  el.dataset.cardId = card.id;
  el.dataset.cardType = card.type;
  el.dataset.cardName = card.name;
  el.dataset.cardDesc = card.description || '';

  // Card label
  const label = document.createElement('span');
  label.className = 'card-label';
  label.textContent = card.name;
  el.appendChild(label);

  return el;
}

// -----------------------------
// Hand Rendering
// -----------------------------

/**
 * Render the player's hand, deck count, and discard count.
 * Clears existing cards and rebuilds from player state.
 * @param {Object} player - Player state { hand, deck, discard, ... }
 */
export function renderHand(player) {
  if (!handCards) return;

  // Clear existing cards
  handCards.innerHTML = '';

  // Render hand cards
  for (const card of player.hand) {
    const cardEl = createCardElement(card);
    handCards.appendChild(cardEl);
  }

  // Update pile counts
  if (deckCountEl) {
    deckCountEl.textContent = player.deck.length;
  }
  if (discardCountEl) {
    discardCountEl.textContent = player.discard.length;
  }
}

// -----------------------------
// State Change Listener
// -----------------------------

let currentGetState = null;

/**
 * Subscribe to state changes. Call this once from ui.js.
 * @param {Function} getState - Function that returns current game state
 */
export function subscribeToState(getState) {
  currentGetState = getState;

  // Listen for state-changed events from main.js
  window.addEventListener('state-changed', () => {
    if (currentGetState) {
      const state = currentGetState();
      renderHand(state.player);
    }
  });
}

/**
 * Get card data from a card element.
 * @param {HTMLElement} el - Card element
 * @returns {Object|null} Card info { id, type, name, description }
 */
export function getCardData(el) {
  if (!el || !el.dataset.cardId) return null;
  return {
    id: el.dataset.cardId,
    type: el.dataset.cardType,
    name: el.dataset.cardName,
    description: el.dataset.cardDesc,
  };
}
