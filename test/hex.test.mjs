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
  neighborsOfLabel,
  getHexesByRing,
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

// -----------------------------
// Path / Neighbor Label Tests
// -----------------------------

test('hex: neighborsOfLabel for center (label 0) includes label 1', () => {
  // neighborsOfLabel returns { dir, n, q, r } objects; check via .n property
  const spiral = generateRadialSpiralAxial(5);
  const neighbors = neighborsOfLabel(0, spiral);
  assert.ok(neighbors.some((nb) => nb.n === 1), 'center neighbors should include label 1');
});

test('hex: neighborsOfLabel returns only valid board labels', () => {
  const spiral = generateRadialSpiralAxial(5);
  const neighbors = neighborsOfLabel(45, spiral);
  for (const nb of neighbors) {
    assert.ok(nb.n >= 0 && nb.n <= 90, `neighbor label ${nb.n} should be in range 0..90`);
  }
});

test('hex: ring 5 contains 30 hexes', () => {
  const hexGrid = generateHexGrid(5);
  const ring5 = getHexesByRing(hexGrid, 5);
  assert.equal(ring5.length, 30, 'ring 5 should contain 30 hexes');
});

test('hex: ring 1 contains 6 hexes', () => {
  const hexGrid = generateHexGrid(5);
  const ring1 = getHexesByRing(hexGrid, 1);
  assert.equal(ring1.length, 6, 'ring 1 should contain 6 hexes');
});

test('hex: outer ring hex has fewer than 6 valid neighbors', () => {
  const hexGrid = generateHexGrid(5);
  // label 90 is on the outer ring
  const pos = getSpiralAxial(90, 5);
  const neighbors = getValidNeighbors(pos.q, pos.r, hexGrid);
  assert.ok(neighbors.length < 6, 'outer ring hex should have fewer than 6 valid neighbors');
});

test('hex: all hexes on ring 5 have fewer than 6 valid neighbors', () => {
  const hexGrid = generateHexGrid(5);
  const ring5 = getHexesByRing(hexGrid, 5);
  for (const hex of ring5) {
    const neighbors = getValidNeighbors(hex.q, hex.r, hexGrid);
    assert.ok(
      neighbors.length < 6,
      `ring 5 hex (${hex.q},${hex.r}) should have fewer than 6 valid neighbors`
    );
  }
});
