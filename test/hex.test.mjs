/**
 * hex.test.mjs - Unit tests for hex module
 * Tests spiral labeling, neighbor functions, and path utilities.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRadialSpiralAxial,
  getSpiralLabel,
  getSpiralAxial,
  getValidNeighbors,
  generateHexGrid,
  hexCountForRadius,
  ringIndex,
} from '../src/hex/index.js';

// -----------------------------
// Spiral Labeling Tests
// -----------------------------

test('hex: spiral generates correct count for radius 5', () => {
  const spiral = generateRadialSpiralAxial(5);
  assert.equal(spiral.count, 91, 'radius 5 should have 91 hexes');
  assert.equal(spiral.maxLabel, 90, 'max label should be 90');
});

test('hex: spiral labels are contiguous 0 to 90', () => {
  const spiral = generateRadialSpiralAxial(5);
  const labels = [...spiral.numToAxial.keys()].sort((a, b) => a - b);

  assert.equal(labels.length, 91);
  for (let i = 0; i <= 90; i++) {
    assert.equal(labels[i], i, `label ${i} should exist`);
  }
});

test('hex: spiral label 0 is center (0, 0)', () => {
  const pos = getSpiralAxial(0, 5);
  assert.deepEqual(pos, { q: 0, r: 0 });
});

test('hex: spiral label 90 is on outer ring', () => {
  const pos = getSpiralAxial(90, 5);
  assert.ok(pos, 'label 90 should exist');
  const ring = ringIndex(pos.q, pos.r);
  assert.equal(ring, 5, 'label 90 should be on ring 5');
});

test('hex: getSpiralLabel and getSpiralAxial are inverses', () => {
  for (let label = 0; label <= 90; label++) {
    const pos = getSpiralAxial(label, 5);
    assert.ok(pos, `label ${label} should have position`);
    const recoveredLabel = getSpiralLabel(pos.q, pos.r, 5);
    assert.equal(recoveredLabel, label, `round-trip failed for label ${label}`);
  }
});

test('hex: all hexes are within radius', () => {
  const spiral = generateRadialSpiralAxial(5);
  for (const [label, pos] of spiral.numToAxial) {
    const ring = ringIndex(pos.q, pos.r);
    assert.ok(ring <= 5, `label ${label} at ring ${ring} exceeds radius 5`);
  }
});

// -----------------------------
// Neighbor Tests (board-bounded)
// -----------------------------

test('hex: center has 6 valid neighbors on radius 5 board', () => {
  const hexGrid = generateHexGrid(5);
  const neighbors = getValidNeighbors(0, 0, hexGrid);
  assert.equal(neighbors.length, 6, 'center should have 6 valid neighbors');
});

test('hex: all valid neighbors are distinct', () => {
  const hexGrid = generateHexGrid(5);
  const neighbors = getValidNeighbors(0, 0, hexGrid);
  const keys = neighbors.map((n) => `${n.q},${n.r}`);
  const unique = new Set(keys);
  assert.equal(unique.size, 6, 'all 6 neighbors should be distinct');
});

// -----------------------------
// Hex Count Formula Test
// -----------------------------

test('hex: hexCountForRadius formula is correct', () => {
  // Formula: 1 + 3*r*(r+1) = 1, 7, 19, 37, 61, 91 for r = 0..5
  const expected = [1, 7, 19, 37, 61, 91];
  for (let r = 0; r <= 5; r++) {
    assert.equal(hexCountForRadius(r), expected[r], `hexCountForRadius(${r})`);
  }
});
