/**
 * coords.js - Coordinate helpers, direction constants, and distance functions
 * Pure logic for axial coordinate system.
 */

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
// Direction Constants (pointy-top axial)
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

export const AXIAL_DIRECTIONS = Object.freeze([
  Object.freeze({ q: +1, r: 0 }),  // E
  Object.freeze({ q: +1, r: -1 }), // NE
  Object.freeze({ q: 0, r: -1 }),  // NW
  Object.freeze({ q: -1, r: 0 }),  // W
  Object.freeze({ q: -1, r: +1 }), // SW
  Object.freeze({ q: 0, r: +1 }),  // SE
]);

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

export function inRadiusBoard(q, r, radius) {
  return axialDistance(q, r, 0, 0) <= radius;
}

// -----------------------------
// Neighbor Detection
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
