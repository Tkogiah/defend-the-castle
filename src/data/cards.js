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
    description: 'Attack & move',
  },
  {
    id: 'second_wind',
    type: 'merchant',
    name: '2nd Wind',
    cost: 15,
    description: 'draw 3 cards from your deck.',
  },
  {
    id: 'reach',
    type: 'merchant',
    name: 'Reach',
    cost: 10,
    description: '+1 range for this round.',
  },
  {
    id: 'sonic_boots',
    type: 'merchant',
    name: 'Boots of Speed',
    cost: 10,
    description: '+5 speed for this round.',
  },
  {
    id: 'sharpen',
    type: 'merchant',
    name: 'Sharpen',
    cost: 10,
    description: '+5 damage this round.',
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
  {
    id: 'whirlwind',
    type: 'merchant',
    name: 'Whirlwind',
    cost: 15,
    description: 'Until end of turn, spending an attack point also hits all enemies within range 1 of your hex. Additional copies add +1 AoE damage.',
  },
];

// Starter deck composition: 5 Action cards
export const STARTER_DECK_COMPOSITION = [
  { cardId: ACTION_CARD.id, count: 5 },
];

// Shop pile configuration: 10 copies of each merchant card
export const SHOP_PILE_SIZE = 10;
