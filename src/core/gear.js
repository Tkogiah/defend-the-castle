import { GEAR_ITEMS } from '../data/gear.js';

let gearInstanceCounter = 0;

/**
 * Create a gear instance from gear type ID.
 * @param {string} gearId - The gear ID (e.g., 'dragon')
 * @returns {Object|null} Gear item with unique instance ID, or null if not found
 */
export function createGearInstance(gearId) {
  const template = GEAR_ITEMS.find((g) => g.id === gearId);
  if (!template) return null;
  return {
    ...template,
    instanceId: `${template.id}_${gearInstanceCounter++}`,
  };
}

/**
 * Get a random gear ID, preferring non-owned gear until all 5 are owned.
 * @param {string[]} ownedGearIds - Array of gear IDs already owned
 * @returns {string} Random gear ID
 */
export function getRandomGearDrop(ownedGearIds = []) {
  const allGearIds = GEAR_ITEMS.map((g) => g.id);

  // Prefer non-duplicate until all 5 owned
  let candidates = allGearIds.filter((id) => !ownedGearIds.includes(id));
  if (candidates.length === 0) {
    candidates = allGearIds; // All owned, allow duplicates
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}
