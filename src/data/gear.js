/**
 * gear.js - Gear data definitions (MVP)
 * Data only - no logic.
 */

export const GEAR = [
  {
    id: 'dragon_mount',
    name: 'Dragon Mount',
    description: 'Once per turn, move 1 hex to any adjacent hex (ignores forward/back constraint).',
    usesPerTurn: 1,
  },
  {
    id: 'boots_of_speed',
    name: 'Boots of Speed',
    description: 'Base movement +3.',
    movementBonus: 3,
  },
  {
    id: 'fireball',
    name: 'Fireball',
    description: 'Choose a hex; that hex + its ring (7 hexes total) take 5 AoE damage.',
    aoeDamage: 5,
    aoeRadius: 1,
  },
  {
    id: 'power_glove',
    name: 'Power Glove',
    description: 'Base damage +3.',
    damageBonus: 3,
  },
  {
    id: 'kings_deck',
    name: "King's Deck",
    description: 'May stash discarded crystal cards (max 5).',
    stashLimit: 5,
  },
];
