/**
 * core.test.mjs - Unit tests for core rules module
 * Tests movement, combat rewards, and wave scaling.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  movePlayer,
  attackEnemy,
  getBasicEnemyHP,
  getBossHP,
  setPlayerPosition,
  setPlayerMovementPoints,
  setPlayerAttackPoints,
} from '../src/core/index.js';
import { generateHexGrid, getSpiralAxial } from '../src/hex/index.js';

// -----------------------------
// Test Fixtures
// -----------------------------

function createTestState() {
  const hexGrid = generateHexGrid(5);
  return createInitialState(hexGrid);
}

function addEnemy(state, position, hp = 100) {
  const enemy = {
    id: `test-enemy-${Date.now()}-${Math.random()}`,
    position,
    hp,
    maxHp: hp,
    isBoss: false,
    frozenTurns: 0,
  };
  return {
    ...state,
    enemies: [...state.enemies, enemy],
  };
}

// -----------------------------
// Movement Tests (movePlayer only)
// -----------------------------

test('core: movePlayer allows movement along spiral path', () => {
  let state = createTestState();
  // Player starts at label 0 (center), give them movement points
  state = setPlayerMovementPoints(state, 5);

  // Move to label 3 (3 steps away)
  const target = getSpiralAxial(3, 5);
  const newState = movePlayer(state, target);

  assert.deepEqual(newState.player.position, target, 'player should be at label 3');
  assert.equal(newState.player.movementPoints, 2, 'should have 2 movement points left');
});

test('core: movePlayer deducts correct movement points', () => {
  let state = createTestState();
  state = setPlayerMovementPoints(state, 10);

  // Move from 0 to 7 (7 steps)
  const target = getSpiralAxial(7, 5);
  const newState = movePlayer(state, target);

  assert.equal(newState.player.movementPoints, 3, 'should deduct 7 points');
});

test('core: movePlayer blocks landing on enemy-occupied hex', () => {
  let state = createTestState();
  state = setPlayerMovementPoints(state, 10);

  // Place enemy at label 5
  const enemyPos = getSpiralAxial(5, 5);
  state = addEnemy(state, enemyPos);

  // Try to move to label 5 where enemy is
  const newState = movePlayer(state, enemyPos);

  // Should not move - position unchanged
  assert.deepEqual(newState.player.position, { q: 0, r: 0 }, 'player should not land on enemy');
  assert.equal(newState.player.movementPoints, 10, 'movement points unchanged');
});

test('core: movePlayer blocks if not enough movement points', () => {
  let state = createTestState();
  state = setPlayerMovementPoints(state, 2);

  // Try to move 5 steps with only 2 points
  const target = getSpiralAxial(5, 5);
  const newState = movePlayer(state, target);

  assert.deepEqual(newState.player.position, { q: 0, r: 0 }, 'player should not move');
});

test('core: movePlayer allows backward movement (decreasing label)', () => {
  let state = createTestState();
  // Put player at label 10
  const startPos = getSpiralAxial(10, 5);
  state = setPlayerPosition(state, startPos);
  state = setPlayerMovementPoints(state, 5);

  // Move backward to label 7
  const target = getSpiralAxial(7, 5);
  const newState = movePlayer(state, target);

  assert.deepEqual(newState.player.position, target, 'player should move backward');
  assert.equal(newState.player.movementPoints, 2, 'should deduct 3 points');
});

// -----------------------------
// Combat Reward Tests
// -----------------------------

test('core: attackEnemy at ring 0 awards no crystal', () => {
  let state = createTestState();
  // Player at center (ring 0)
  state = setPlayerPosition(state, { q: 0, r: 0 });

  // Place enemy at ring 1 (doesn't matter for reward, player ring matters)
  const enemyPos = getSpiralAxial(1, 5);
  state = addEnemy(state, enemyPos, 1000);

  const discardBefore = state.player.discard.length;
  const newState = attackEnemy(state, state.enemies[0].id);

  // No crystal should be added at ring 0
  const crystalCards = newState.player.discard.filter((c) => c.type === 'crystal');
  assert.equal(crystalCards.length, 0, 'no crystal at ring 0');
});

test('core: attackEnemy at ring > 0 awards crystal with value = ring', () => {
  let state = createTestState();
  // Player at ring 3 (label 19 is on ring 3)
  const playerPos = getSpiralAxial(19, 5);
  state = setPlayerPosition(state, playerPos);

  // Place enemy nearby
  const enemyPos = getSpiralAxial(20, 5);
  state = addEnemy(state, enemyPos, 1000);

  const newState = attackEnemy(state, state.enemies[0].id);

  const crystalCards = newState.player.discard.filter((c) => c.type === 'crystal');
  assert.equal(crystalCards.length, 1, 'should award 1 crystal');
  assert.equal(crystalCards[0].value, 3, 'crystal value should equal ring (3)');
});

test('core: attackEnemy awards crystal even if enemy survives', () => {
  let state = createTestState();
  // Player at ring 2
  const playerPos = getSpiralAxial(15, 5);
  state = setPlayerPosition(state, playerPos);

  // Place enemy with high HP so it survives
  const enemyPos = getSpiralAxial(16, 5);
  state = addEnemy(state, enemyPos, 1000);

  const newState = attackEnemy(state, state.enemies[0].id);

  // Enemy should still exist
  assert.equal(newState.enemies.length, 1, 'enemy should survive');

  // Crystal should still be awarded
  const crystalCards = newState.player.discard.filter((c) => c.type === 'crystal');
  assert.equal(crystalCards.length, 1, 'crystal awarded even when enemy survives');
});

// -----------------------------
// Wave Scaling Tests
// -----------------------------

test('core: getBasicEnemyHP returns wave * 10', () => {
  for (let wave = 1; wave <= 10; wave++) {
    const hp = getBasicEnemyHP(wave);
    assert.equal(hp, wave * 10, `wave ${wave} basic enemy HP`);
  }
});

test('core: getBossHP returns wave * 100', () => {
  for (let wave = 1; wave <= 10; wave++) {
    const hp = getBossHP(wave);
    assert.equal(hp, wave * 100, `wave ${wave} boss HP`);
  }
});

test('core: final boss (wave 10) has 1000 HP', () => {
  const hp = getBossHP(10);
  assert.equal(hp, 1000, 'wave 10 boss should have 1000 HP');
});
