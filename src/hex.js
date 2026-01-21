/**
 * hex.js - Hex grid utilities for axial coordinate system
 * Pure logic only - no rendering, DOM, or input handling.
 *
 * Axial coordinates (q, r) with implicit s = -q - r.
 * Center hex is (0, 0), ring 0.
 * Board radius is 5, yielding 91 hexes (1 + 6*15).
 */

export const BOARD_RADIUS = 5;

// -----------------------------
// Key / Coordinate Helpers
// -----------------------------

export function hexKey(q, r) {
  return `${q},${r}`;
}

export function parseHexKey(key) {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

// -----------------------------
// Distance and Ring
// -----------------------------

export function axialDistance(q1, r1, q2, r2) {
  return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}

export function distanceBetween(a, b) {
  return axialDistance(a.q, a.r, b.q, b.r);
}

export function ringIndex(q, r) {
  // Ring = distance from center (0,0)
  return axialDistance(q, r, 0, 0);
}

// -----------------------------
// Neighbors
// -----------------------------

const AXIAL_DIRECTIONS = Object.freeze([
  Object.freeze({ q: +1, r: 0 }),  // E
  Object.freeze({ q: +1, r: -1 }), // NE
  Object.freeze({ q: 0, r: -1 }),  // NW
  Object.freeze({ q: -1, r: 0 }),  // W
  Object.freeze({ q: -1, r: +1 }), // SW
  Object.freeze({ q: 0, r: +1 }),  // SE
]);

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
