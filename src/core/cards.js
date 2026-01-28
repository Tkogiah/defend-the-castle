/**
 * cards.js - Card instance creation logic
 * Pure logic - imports data from data/index.js
 */

import {
  ACTION_CARD,
  CRYSTAL_CARDS,
  MERCHANT_CARDS,
  STARTER_DECK_COMPOSITION,
} from '../data/index.js';

let crystalInstanceCounter = 0;
let merchantInstanceCounter = 0;

/**
 * Create a crystal card instance based on ring distance.
 * @param {number} ring - Ring number (1-5); ring 0 returns null
 * @returns {Object|null} Crystal card with unique ID, or null if ring <= 0
 */
export function createCrystalCard(ring) {
  if (ring <= 0 || ring > 5) return null;
  const template = CRYSTAL_CARDS[ring - 1];
  return {
    ...template,
    id: `${template.id}_${crystalInstanceCounter++}`,
  };
}

/**
 * Create a merchant card instance from card type ID.
 * @param {string} cardType - The merchant card ID (e.g., 'multitask')
 * @returns {Object|null} Merchant card with unique ID, or null if not found
 */
export function createMerchantCard(cardType) {
  const template = MERCHANT_CARDS.find((c) => c.id === cardType);
  if (!template) return null;
  return {
    ...template,
    id: `${template.id}_${merchantInstanceCounter++}`,
  };
}

/**
 * Create a starter deck with unique instance IDs.
 * @returns {Array<Object>} Array of card instances
 */
export function createStarterDeck() {
  const deck = [];
  let instanceCounter = 0;

  for (const entry of STARTER_DECK_COMPOSITION) {
    const template =
      entry.cardId === ACTION_CARD.id
        ? ACTION_CARD
        : CRYSTAL_CARDS.find((c) => c.id === entry.cardId) ||
          MERCHANT_CARDS.find((c) => c.id === entry.cardId);

    if (!template) continue;

    for (let i = 0; i < entry.count; i++) {
      deck.push({
        ...template,
        id: `${template.id}_${instanceCounter++}`,
      });
    }
  }

  return deck;
}
