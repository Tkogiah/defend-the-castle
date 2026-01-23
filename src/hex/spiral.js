/**
 * spiral.js - Spiral labeling and label <-> axial coordinate mapping
 * Generates clockwise spiral path from center outward.
 */

import { BOARD_RADIUS } from '../config/index.js';
import { hexKey, DIR, CLOCKWISE_AFTER_EAST, hexCountForRadius } from './coords.js';

const SPIRAL_CACHE = new Map();
const ADJACENT_PREFERENCE = Object.freeze(['E', 'SE', 'SW', 'W', 'NW', 'NE']);

// -----------------------------
// Spiral Generation
// -----------------------------

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

export function getSpiralData(radius = BOARD_RADIUS) {
  if (SPIRAL_CACHE.has(radius)) return SPIRAL_CACHE.get(radius);
  const data = generateRadialSpiralAxial(radius);
  SPIRAL_CACHE.set(radius, data);
  return data;
}

export function getSpiralLabel(q, r, radius = BOARD_RADIUS) {
  const { axialToNum } = getSpiralData(radius);
  const label = axialToNum.get(hexKey(q, r));
  return Number.isInteger(label) ? label : null;
}

export function getSpiralAxial(label, radius = BOARD_RADIUS) {
  const { numToAxial, maxLabel } = getSpiralData(radius);
  if (!Number.isInteger(label) || label < 0 || label > maxLabel) return null;
  const pos = numToAxial.get(label);
  return pos ? { ...pos } : null;
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

// -----------------------------
// Private Helpers
// -----------------------------

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
