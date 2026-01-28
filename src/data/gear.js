/**
 * gear.js - Gear item definitions
 * Data only - no logic.
 */

export const GEAR_ITEMS = [
  {
    id: 'dragon',
    type: 'mount',
    name: 'Dragon',
    description: 'A fearsome dragon mount that lets you soar over obstacles.',
    effect: 'adjacentMove', // Move to any adjacent hex once per turn (ignores spiral)
  },
  {
    id: 'boots_of_speed',
    type: 'foot',
    name: 'Boots of Speed',
    description: 'Magical boots that make you twice as fast.',
    effect: 'doubleSpeed', // Doubles player base speed
  },
  {
    id: 'fireball',
    type: 'head',
    name: 'Fireball',
    description: "A mage's only necessary spell.",
    effect: 'aoeAttack', // Once per turn, 10 damage to all enemies within range 3 of chosen hex
  },
  {
    id: 'power_glove',
    type: 'hand',
    name: 'Power Glove',
    description: 'A glove that amplifies your strength.',
    effect: 'doubleDamage', // Doubles player base damage
  },
  {
    id: 'kings_purse',
    type: 'body',
    name: "King's Purse",
    description: 'Kings are rich.',
    effect: 'goldOnAttack', // No crystal cards; gain gold equal to crystal value immediately
  },
];

export const GEAR_SLOTS = ['head', 'body', 'hand', 'foot', 'mount'];
