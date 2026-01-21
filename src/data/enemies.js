/**
 * enemies.js - Enemy data definitions (MVP)
 * Data only - no logic.
 */

export const ENEMIES = {
  basic: {
    id: 'basic',
    name: 'Basic Enemy',
    hp: 10,
    isBoss: false,
  },
  boss: {
    id: 'boss',
    name: 'Boss',
    hp: 100,
    isBoss: true,
  },
};
