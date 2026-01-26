/**
 * cards.js - Card data definitions (MVP)
 * Data only - no logic.
 */

// Card types: 'action' | 'crystal' | 'merchant'

export const ACTION_CARD = {
  id: 'action_basic',
  type: 'action',
  name: 'Action',
  description: 'Grants +1 attack or +1 movement.',
  value: 1,
};

export const CRYSTAL_CARDS = [
  { id: 'crystal_1', type: 'crystal', name: 'Crystal (1)', value: 1, description: 'trade this for 1 gold' },
  { id: 'crystal_2', type: 'crystal', name: 'Crystal (2)', value: 2, description: 'trade this for 2 gold' },
  { id: 'crystal_3', type: 'crystal', name: 'Crystal (3)', value: 3, description: 'trade this for 3 gold' },
  { id: 'crystal_4', type: 'crystal', name: 'Crystal (4)', value: 4, description: 'trade this for 4 gold' },
  { id: 'crystal_5', type: 'crystal', name: 'Crystal (5)', value: 5, description: 'trade this for 5 gold' },
];

// Merchant cards (8 types for MVP)
export const MERCHANT_CARDS = [
  {
    id: 'multitask',
    type: 'merchant',
    name: 'MultiTask',
    cost: 15,
    description: 'Gain 1 attack and 1 movement.',
  },
  {
    id: 'second_wind',
    type: 'merchant',
    name: '2nd Wind',
    cost: 15,
    description: 'Draw 3 cards from your deck.',
  },
  {
    id: 'reach',
    type: 'merchant',
    name: 'Reach',
    cost: 10,
    description: 'Increase attack range by 1 for the rest of this round.',
  },
  {
    id: 'boots_of_speed',
    type: 'merchant',
    name: 'Boots of Speed',
    cost: 10,
    description: 'Movement goes further this round.',
  },
  {
    id: 'sharpen',
    type: 'merchant',
    name: 'Sharpen',
    cost: 10,
    description: 'Attacks do more damage this round.',
  },
  {
    id: 'ice',
    type: 'merchant',
    name: 'Ice',
    cost: 15,
    description: 'Attack and freeze the enemy, preventing movement for one round.',
  },
  {
    id: 'move_twice',
    type: 'merchant',
    name: 'Move Twice',
    cost: 15,
    description: 'Move twice.',
  },
  {
    id: 'triple_attack',
    type: 'merchant',
    name: 'Triple Attack',
    cost: 15,
    description: 'Attack three times.',
  },
];

// Starter deck composition: 5 Action cards
export const STARTER_DECK_COMPOSITION = [
  { cardId: ACTION_CARD.id, count: 5 },
];

// Shop pile configuration: 10 copies of each merchant card
export const SHOP_PILE_SIZE = 10;

/**
 * Create a starter deck with unique instance IDs.
 * @returns {Array<{ id: string, type: string, name: string, description: string, value: number }>}
 */
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
 * @param {string} cardType - The merchant card ID (e.g., 'swift_strike')
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
