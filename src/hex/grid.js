/**
 * grid.js - Grid generation, neighbor utilities, and range helpers
 * Pure logic for hex grid operations.
 */

import { BOARD_RADIUS } from '../config/index.js';
import { hexKey, AXIAL_DIRECTIONS, axialDistance, ringIndex } from './coords.js';

// -----------------------------
// Grid Generation
// -----------------------------

export function generateHexGrid(radius = BOARD_RADIUS) {
  const grid = new Map();

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      const ring = ringIndex(q, r);
      grid.set(hexKey(q, r), { q, r, ring });
    }
  }

  return grid;
}

export function getAllHexes(hexGrid) {
  return Array.from(hexGrid.values());
}

export function getHexesByRing(hexGrid, ring) {
  return getAllHexes(hexGrid).filter((h) => h.ring === ring);
}

// -----------------------------
// Neighbors
// -----------------------------

export function getNeighborOffsets() {
  return AXIAL_DIRECTIONS;
}

export function getNeighbors(q, r) {
  return AXIAL_DIRECTIONS.map((d) => ({ q: q + d.q, r: r + d.r }));
}

export function getValidNeighbors(q, r, hexGrid) {
  return getNeighbors(q, r).filter((n) => hexGrid.has(hexKey(n.q, n.r)));
}

// -----------------------------
// Range and Movement Helpers
// -----------------------------

export function getHexesInRange(hexGrid, q, r, range) {
  // All hexes within `range` distance from (q, r)
  const results = [];
  for (const hex of hexGrid.values()) {
    if (axialDistance(q, r, hex.q, hex.r) <= range) {
      results.push(hex);
    }
  }
  return results;
}

export function findPathTowardCenter(hexGrid, startQ, startR) {
  // Returns the neighbor that moves closest to center (0,0)
  // Used for enemy movement toward center
  const neighbors = getValidNeighbors(startQ, startR, hexGrid);
  if (neighbors.length === 0) return null;

  let best = null;
  let bestDist = Infinity;

  for (const n of neighbors) {
    const dist = axialDistance(n.q, n.r, 0, 0);
    if (dist < bestDist) {
      bestDist = dist;
      best = n;
    }
  }

  return best;
}
