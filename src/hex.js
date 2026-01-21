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
// Direction Helpers (pointy-top axial)
// -----------------------------

export const DIR = Object.freeze({
  E: Object.freeze([1, 0]),
  SE: Object.freeze([0, 1]),
  SW: Object.freeze([-1, 1]),
  W: Object.freeze([-1, 0]),
  NW: Object.freeze([0, -1]),
  NE: Object.freeze([1, -1]),
});

// After placing the east corner of a ring, walk clockwise in this order.
export const CLOCKWISE_AFTER_EAST = Object.freeze([
  'SW',
  'W',
  'NW',
  'NE',
  'E',
  'SE',
]);
const ADJACENT_PREFERENCE = Object.freeze(['E', 'SE', 'SW', 'W', 'NW', 'NE']);

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

export function hexCountForRadius(radius) {
  if (!Number.isInteger(radius) || radius < 0) {
    throw new Error('radius must be an integer >= 0');
  }
  return 1 + 3 * radius * (radius + 1);
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

// -----------------------------
// Spiral Labeling (clockwise from east)
// -----------------------------

export function areAxialNeighbors(q1, r1, q2, r2) {
  const dq = q2 - q1;
  const dr = r2 - r1;
  return (
    (dq === 1 && dr === 0) || // E
    (dq === 0 && dr === 1) || // SE
    (dq === -1 && dr === 1) || // SW
    (dq === -1 && dr === 0) || // W
    (dq === 0 && dr === -1) || // NW
    (dq === 1 && dr === -1)    // NE
  );
}

export function generateRadialSpiralAxial(radius = BOARD_RADIUS) {
  const count = hexCountForRadius(radius);
  const maxLabel = count - 1;

  const ordered = [];
  const numToAxial = new Map();
  const axialToNum = new Map();

  ordered.push({ n: 0, q: 0, r: 0 });
  numToAxial.set(0, { q: 0, r: 0 });
  axialToNum.set(hexKey(0, 0), 0);

  let n = 1;
  let prev = ordered[0];

  for (let k = 1; k <= radius; k++) {
    const ring = getRingHexesClockwise(k);
    const rotated = rotateRingToAdjacent(ring, prev);

    for (const p of rotated) {
      if (n > maxLabel) break;
      ordered.push({ n, q: p.q, r: p.r });
      numToAxial.set(n, { q: p.q, r: p.r });
      axialToNum.set(hexKey(p.q, p.r), n);
      prev = p;
      n++;
    }
  }

  if (ordered.length !== count) {
    throw new Error(
      `expected ${count} hexes, generated ${ordered.length}`
    );
  }

  return { radius, count, maxLabel, numToAxial, axialToNum, ordered };
}

function getRingHexesClockwise(k) {
  if (k === 0) return [{ q: 0, r: 0 }];
  let q = k;
  let r = 0;
  const list = [];

  for (const dirName of CLOCKWISE_AFTER_EAST) {
    const [dq, dr] = DIR[dirName];
    for (let step = 0; step < k; step++) {
      list.push({ q, r });
      q += dq;
      r += dr;
    }
  }
  return list;
}

function directionBetween(from, to) {
  const dq = to.q - from.q;
  const dr = to.r - from.r;
  for (const [name, [dirQ, dirR]] of Object.entries(DIR)) {
    if (dq === dirQ && dr === dirR) return name;
  }
  return null;
}

function rotateRingToAdjacent(ring, prev) {
  const candidates = [];
  for (let i = 0; i < ring.length; i++) {
    const dir = directionBetween(prev, ring[i]);
    if (dir) candidates.push({ index: i, dir });
  }

  if (candidates.length === 0) return ring;

  let chosen = candidates[0];
  for (const preferred of ADJACENT_PREFERENCE) {
    const match = candidates.find((c) => c.dir === preferred);
    if (match) {
      chosen = match;
      break;
    }
  }

  return ring.slice(chosen.index).concat(ring.slice(0, chosen.index));
}

export function neighborsOfLabel(label, spiral) {
  const { numToAxial, axialToNum } = spiral;
  const p = numToAxial.get(label);
  if (!p) return [];

  const out = [];
  for (const [dirName, [dq, dr]] of Object.entries(DIR)) {
    const q = p.q + dq;
    const r = p.r + dr;
    const n = axialToNum.get(hexKey(q, r));
    if (typeof n === 'number') out.push({ dir: dirName, n, q, r });
  }
  return out;
}

export function inRadiusBoard(q, r, radius) {
  return axialDistance(q, r, 0, 0) <= radius;
}
