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
  { id: 'crystal_1', type: 'crystal', name: 'Crystal (1)', value: 1 },
  { id: 'crystal_2', type: 'crystal', name: 'Crystal (2)', value: 2 },
  { id: 'crystal_3', type: 'crystal', name: 'Crystal (3)', value: 3 },
  { id: 'crystal_4', type: 'crystal', name: 'Crystal (4)', value: 4 },
  { id: 'crystal_5', type: 'crystal', name: 'Crystal (5)', value: 5 },
];

// Merchant cards (8 types for MVP)
// Note: spec does not define merchant card effects; these are placeholders.
export const MERCHANT_CARDS = [
  {
    id: 'swift_strike',
    type: 'merchant',
    name: 'Swift Strike',
    cost: 3,
    description: 'Temporary +2 attack.',
  },
  {
    id: 'quick_step',
    type: 'merchant',
    name: 'Quick Step',
    cost: 2,
    description: 'Temporary +2 movement.',
  },
  {
    id: 'heavy_blow',
    type: 'merchant',
    name: 'Heavy Blow',
    cost: 4,
    description: 'Temporary +3 attack.',
  },
  {
    id: 'sprint',
    type: 'merchant',
    name: 'Sprint',
    cost: 3,
    description: 'Temporary +3 movement.',
  },
  {
    id: 'double_strike',
    type: 'merchant',
    name: 'Double Strike',
    cost: 5,
    description: 'Attack twice this turn.',
  },
  {
    id: 'retreat',
    type: 'merchant',
    name: 'Retreat',
    cost: 2,
    description: 'Move 2 hexes toward center.',
  },
  {
    id: 'battle_cry',
    type: 'merchant',
    name: 'Battle Cry',
    cost: 4,
    description: 'Temporary +1 attack and +1 movement.',
  },
  {
    id: 'focus',
    type: 'merchant',
    name: 'Focus',
    cost: 3,
    description: 'Draw 2 cards.',
  },
];

// Starter deck composition: 5 Action cards
export const STARTER_DECK_COMPOSITION = [
  { cardId: ACTION_CARD.id, count: 5 },
];

/**
 * Create a starter deck with unique instance IDs.
 * @returns {Array<{ id: string, type: string, name: string, description: string, value: number }>}
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
