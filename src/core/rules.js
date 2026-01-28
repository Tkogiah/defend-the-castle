/**
 * rules.js - Turn flow and win/lose checks
 * Pure logic only - no rendering, DOM, or input handling.
 *
 * Turn loop: playerTurn -> enemyTurn -> win/lose checks -> repeat
 */

import {
  setPhase,
  incrementTurn,
  setDeck,
  setHand,
  setDiscard,
  addCardToDiscard,
  removeCardFromHand,
  setOutcome,
  setPlayerKnockedOut,
  getHexRing,
  setPlayerGold,
  addPlayerGold,
  damageEnemy,
  removeEnemy,
  incrementEnemiesDefeated,
  updateWave,
  setEnemyPosition,
  setPlayerPosition,
  setPlayerMovementPoints,
  setPlayerAttackPoints,
  decrementShopPile,
  setPlayerTurnBonus,
  resetPlayerTurnBonus,
  setNextAttackFreezes,
  setEnemyFrozen,
  addToInventory,
  setPlayerEquipped,
  removeFromInventory,
  setGearUsedThisTurn,
  resetGearUsedThisTurn,
  getOwnedGearIds,
} from './state.js';
import { getSpiralLabel, getSpiralAxial, axialDistance, getNeighbors } from '../hex/index.js';
import { createCrystalCard, createMerchantCard } from './cards.js';
import { createGearInstance, getRandomGearDrop } from './gear.js';

// -----------------------------
// Deck Operations
// -----------------------------

export function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCards(state, count = 5) {
  let deck = [...state.player.deck];
  let discard = [...state.player.discard];
  let hand = [...state.player.hand];

  for (let i = 0; i < count; i++) {
    if (deck.length === 0 && discard.length === 0) break;
    if (deck.length === 0) {
      deck = shuffleArray(discard);
      discard = [];
    }
    hand.push(deck.pop());
  }

  let newState = setDeck(state, deck);
  newState = setDiscard(newState, discard);
  newState = setHand(newState, hand);
  return newState;
}

export function discardHand(state) {
  const newDiscard = [...state.player.discard, ...state.player.hand];
  let newState = setDiscard(state, newDiscard);
  newState = setHand(newState, []);
  return newState;
}

// -----------------------------
// Turn Flow
// -----------------------------

export function startPlayerTurn(state) {
  let newState = incrementTurn(state);
  newState = setPhase(newState, 'playerTurn');
  newState = setPlayerAttackPoints(newState, 0);
  newState = setPlayerMovementPoints(newState, 0);
  newState = resetPlayerTurnBonus(newState); // Reset turn-scoped bonuses
  newState = resetGearUsedThisTurn(newState); // Reset gear abilities
  newState = drawCards(newState, 5);
  return newState;
}

export function endPlayerTurn(state) {
  let newState = discardHand(state);
  newState = setPhase(newState, 'enemyTurn');
  return newState;
}

export function startEnemyTurn(state) {
  return setPhase(state, 'enemyTurn');
}

export function endEnemyTurn(state) {
  let newState = checkLoseCondition(state);
  if (newState.outcome === 'lose') {
    return setPhase(newState, 'gameOver');
  }

  newState = checkWinCondition(newState);
  if (newState.outcome === 'win') {
    return setPhase(newState, 'gameOver');
  }

  return newState;
}

export function advanceToPlayerTurn(state) {
  return startPlayerTurn(state);
}

// -----------------------------
// Win/Lose Checks
// -----------------------------

export function checkWinCondition(state) {
  // Win: wave 10 boss defeated
  if (state.wave.current === 10 && state.wave.bossDefeated) {
    return setOutcome(state, 'win');
  }
  return state;
}

export function checkLoseCondition(state) {
  // Lose: player knocked out
  if (state.player.isKnockedOut) {
    return setOutcome(state, 'lose', 'playerKnockedOut');
  }

  // Lose: any enemy at center (ring 0)
  for (const enemy of state.enemies) {
    const ring = getHexRing(state, enemy.position.q, enemy.position.r);
    if (ring === 0) {
      return setOutcome(state, 'lose', 'enemyReachedCenter');
    }
  }

  return state;
}

// -----------------------------
// Player Actions (stubs)
// -----------------------------

export function playActionCard(state, cardId, choice) {
  // choice: 'attack' | 'movement'
  // Stub: removes card from hand, adds to discard
  const card = state.player.hand.find((c) => c.id === cardId);
  if (!card || card.type !== 'action') return state;
  if (choice !== 'attack' && choice !== 'movement') return state;

  let newState = removeCardFromHand(state, cardId);
  newState = addCardToDiscard(newState, card);

  const value = Number.isFinite(card.value) ? card.value : 1;
  if (choice === 'attack') {
    newState = setPlayerAttackPoints(
      newState,
      newState.player.attackPoints + value
    );
  } else {
    // Apply gear and turn bonus to movement
    const totalSpeed = getEffectiveSpeed(newState);
    newState = setPlayerMovementPoints(
      newState,
      newState.player.movementPoints + value * totalSpeed
    );
  }

  return newState;
}

/**
 * Play a merchant card from hand.
 * Applies the card's effect and moves it to discard.
 * @param {Object} state - current game state
 * @param {string} cardId - unique instance ID of the card to play
 * @returns {Object} new state with effect applied
 */
export function playMerchantCard(state, cardId) {
  const card = state.player.hand.find((c) => c.id === cardId);
  if (!card || card.type !== 'merchant') return state;

  let newState = removeCardFromHand(state, cardId);
  newState = addCardToDiscard(newState, card);

  // Get the base card type (strip instance suffix)
  const cardType = card.id.split('_').slice(0, -1).join('_');

  switch (cardType) {
    case 'multitask':
      // Gain 1 attack and 1 movement point
      newState = setPlayerAttackPoints(newState, newState.player.attackPoints + 1);
      {
        const totalSpeed = getEffectiveSpeed(newState);
        newState = setPlayerMovementPoints(
          newState,
          newState.player.movementPoints + totalSpeed
        );
      }
      break;

    case 'second_wind':
      // Draw 3 cards
      newState = drawCards(newState, 3);
      break;

    case 'reach':
      // +1 range for this turn
      newState = setPlayerTurnBonus(newState, {
        range: (newState.player.turnBonus?.range || 0) + 1,
      });
      break;

    case 'boots_of_speed':
      // +5 base movement for this turn
      newState = setPlayerTurnBonus(newState, {
        baseMovement: (newState.player.turnBonus?.baseMovement || 0) + 5,
      });
      break;

    case 'sharpen':
      // +5 base damage for this turn
      newState = setPlayerTurnBonus(newState, {
        baseDamage: (newState.player.turnBonus?.baseDamage || 0) + 5,
      });
      break;

    case 'ice':
      // +1 attack point and next attack freezes target
      newState = setPlayerAttackPoints(newState, newState.player.attackPoints + 1);
      newState = setNextAttackFreezes(newState, true);
      break;

    case 'move_twice':
      // +2 movement actions (speed * 2)
      {
        const totalSpeed = getEffectiveSpeed(newState);
        newState = setPlayerMovementPoints(
          newState,
          newState.player.movementPoints + totalSpeed * 2
        );
      }
      break;

    case 'triple_attack':
      // +3 attack points
      newState = setPlayerAttackPoints(newState, newState.player.attackPoints + 3);
      break;

    default:
      // Unknown merchant card type - no effect
      break;
  }

  return newState;
}

export function movePlayer(state, targetPosition) {
  if (!targetPosition) return state;

  const key = `${targetPosition.q},${targetPosition.r}`;
  if (!state.hexGrid.has(key)) return state;

  const start = state.player.position;
  const startLabel = getSpiralLabel(start.q, start.r);
  const targetLabel = getSpiralLabel(targetPosition.q, targetPosition.r);
  if (startLabel === null || targetLabel === null) return state;

  const steps = Math.abs(targetLabel - startLabel);
  const movementPoints = Number.isInteger(state.player.movementPoints)
    ? state.player.movementPoints
    : 0;
  if (steps > movementPoints) return state;

  // Block movement if any enemy occupies the path (including target).
  const direction = targetLabel > startLabel ? 1 : -1;
  const enemyLabels = new Set(
    state.enemies.map((e) => getSpiralLabel(e.position.q, e.position.r))
  );
  for (let label = startLabel + direction; label !== targetLabel + direction; label += direction) {
    if (enemyLabels.has(label)) {
      return state;
    }
  }

  for (const enemy of state.enemies) {
    if (enemy.position.q === targetPosition.q && enemy.position.r === targetPosition.r) {
      return state;
    }
  }

  let newState = setPlayerPosition(state, targetPosition);
  newState = setPlayerMovementPoints(newState, movementPoints - steps);
  return newState;
}

export function attackEnemy(state, enemyId) {
  const enemy = state.enemies.find((e) => e.id === enemyId);
  if (!enemy) return state;

  // Calculate effective damage (base + turn bonus + gear)
  const totalDamage = getEffectiveDamage(state);

  let newState = damageEnemy(state, enemyId, totalDamage);

  // Handle Ice card freeze effect
  if (state.player.nextAttackFreezes) {
    newState = setEnemyFrozen(newState, enemyId, 1);
    newState = setNextAttackFreezes(newState, false);
  }

  // Award crystal or gold based on King's Purse gear
  const { q, r } = state.player.position;
  const ring = getHexRing(state, q, r);
  if (hasEquippedGear(state, 'kings_purse')) {
    // King's Purse: gain gold immediately instead of crystal card
    if (ring > 0) {
      newState = addPlayerGold(newState, ring);
    }
  } else {
    // Normal: award crystal card
    const crystalCard = createCrystalCard(ring);
    if (crystalCard) {
      newState = addCardToDiscard(newState, crystalCard);
    }
  }

  // Check if enemy defeated
  const updatedEnemy = newState.enemies.find((e) => e.id === enemyId);
  if (updatedEnemy && updatedEnemy.hp <= 0) {
    newState = removeEnemy(newState, enemyId);
    newState = incrementEnemiesDefeated(newState);

    // Check if boss was defeated
    if (enemy.isBoss) {
      newState = onBossDefeated(newState);
    }
  }

  return newState;
}

/**
 * Attempt to attack an enemy at the target hex.
 * Requires: target is within player.range, player has attack points, enemy exists at target.
 * Consumes 1 attack point and damages the first enemy at the target.
 * @param {Object} state - current game state
 * @param {{ q: number, r: number }} targetPos - target hex position
 * @returns {Object} new state (unchanged if attack fails)
 */
export function tryAttackAtHex(state, targetPos) {
  const { q: pq, r: pr } = state.player.position;
  const { q: tq, r: tr } = targetPos;

  // Apply turn bonus to range
  const baseRange = state.player.range;
  const bonusRange = state.player.turnBonus?.range || 0;
  const effectiveRange = baseRange + bonusRange;

  // Must be within player's effective range
  const distance = axialDistance(pq, pr, tq, tr);
  if (distance > effectiveRange || distance === 0) {
    return state;
  }

  // Must have attack points
  if (state.player.attackPoints <= 0) {
    return state;
  }

  // Find first enemy at target hex
  const enemyAtTarget = state.enemies.find(
    (e) => e.position.q === tq && e.position.r === tr
  );
  if (!enemyAtTarget) {
    return state;
  }

  // Consume 1 attack point
  let newState = setPlayerAttackPoints(state, state.player.attackPoints - 1);

  // Attack the enemy
  newState = attackEnemy(newState, enemyAtTarget.id);

  return newState;
}

// -----------------------------
// Economy (stubs)
// -----------------------------

export function convertCrystalsToGold(state) {
  // Only at center hex (ring 0)
  const playerRing = getHexRing(
    state,
    state.player.position.q,
    state.player.position.r
  );
  if (playerRing !== 0) return state;

  // Sum crystal cards in hand and convert to gold
  let goldGained = 0;
  const nonCrystalCards = [];

  for (const card of state.player.hand) {
    if (card.type === 'crystal') {
      goldGained += card.value;
    } else {
      nonCrystalCards.push(card);
    }
  }

  let newState = addPlayerGold(state, goldGained);
  newState = setHand(newState, nonCrystalCards);
  // Crystal cards are removed from game when converted
  return newState;
}

/**
 * Buy a merchant card: subtract gold, add card to discard, decrement pile.
 * @param {Object} state - current game state
 * @param {string} cardType - merchant card type ID (e.g., 'swift_strike')
 * @returns {Object} new state (unchanged if purchase fails)
 */
export function buyMerchantCard(state, cardType) {
  const pile = state.shop.piles.find((p) => p.cardType === cardType);
  if (!pile || pile.remaining <= 0) return state;
  if (state.player.gold < pile.cost) return state;

  let newState = setPlayerGold(state, state.player.gold - pile.cost);
  const card = createMerchantCard(cardType);
  if (!card) return state;
  newState = addCardToDiscard(newState, card);
  newState = decrementShopPile(newState, cardType);
  return newState;
}

// -----------------------------
// Enemy Phase
// -----------------------------

/**
 * Get basic enemy HP for a given wave number.
 * @param {number} waveNumber - wave number (1-10)
 * @returns {number} HP value
 */
export function getBasicEnemyHP(waveNumber) {
  return waveNumber * 10; // 10, 20, 30... 100
}

/**
 * Get boss HP for a given wave number.
 * @param {number} waveNumber - wave number (1-10)
 * @returns {number} HP value
 */
export function getBossHP(waveNumber) {
  return waveNumber * 100; // 100, 200... 1000
}

/**
 * Spawn basic enemies for current wave at the outer edge (spiral label 90).
 * @param {Object} state - current game state
 * @returns {Object} new state with spawned enemies
 */
export function spawnWaveEnemies(state) {
  const spawnLabel = 90; // Outer edge of spiral
  const spawnPos = getSpiralAxial(spawnLabel);
  if (!spawnPos) return state;

  const count = state.wave.enemiesPerWave;
  const hp = getBasicEnemyHP(state.wave.current);
  let newState = state;

  for (let i = 0; i < count; i++) {
    const enemy = {
      id: `enemy-${Date.now()}-${i}`,
      position: { q: spawnPos.q, r: spawnPos.r },
      hp,
      maxHp: hp,
      isBoss: false,
      frozenTurns: 0,
    };
    newState = {
      ...newState,
      enemies: [...newState.enemies, enemy],
    };
  }

  // Update wave tracker
  newState = updateWave(newState, {
    enemiesSpawned: newState.wave.enemiesSpawned + count,
  });

  return newState;
}

/**
 * Spawn boss for current wave at the outer edge.
 * @param {Object} state - current game state
 * @returns {Object} new state with spawned boss
 */
export function spawnBoss(state) {
  if (state.wave.bossSpawned) return state;

  const spawnLabel = 90;
  const spawnPos = getSpiralAxial(spawnLabel);
  if (!spawnPos) return state;

  const hp = getBossHP(state.wave.current);
  const boss = {
    id: `boss-${state.wave.current}-${Date.now()}`,
    position: { q: spawnPos.q, r: spawnPos.r },
    hp,
    maxHp: hp,
    isBoss: true,
    frozenTurns: 0,
  };

  let newState = {
    ...state,
    enemies: [...state.enemies, boss],
  };
  newState = updateWave(newState, { bossSpawned: true });

  return newState;
}

// Legacy alias for compatibility
export function spawnEnemies(state, count) {
  return spawnWaveEnemies(state);
}

/**
 * Move all enemies along the spiral path toward center.
 * Basic enemies: 1-10 random steps.
 * Boss: 1-20 random steps, skips occupied hexes.
 * Frozen enemies skip movement and have their freeze counter decremented.
 * @param {Object} state - current game state
 * @returns {Object} new state with updated enemy positions
 */
export function moveEnemies(state) {
  let newState = state;

  // Move basic enemies first, then boss
  const basicEnemies = state.enemies.filter((e) => !e.isBoss);
  const bosses = state.enemies.filter((e) => e.isBoss);

  for (const enemy of basicEnemies) {
    // Handle frozen enemies
    if (enemy.frozenTurns > 0) {
      newState = setEnemyFrozen(newState, enemy.id, enemy.frozenTurns - 1);
      continue;
    }

    const currentLabel = getSpiralLabel(enemy.position.q, enemy.position.r);
    if (currentLabel === null) continue;

    // Random 1-10 steps toward center (decreasing label)
    const steps = Math.floor(Math.random() * 10) + 1;
    const newLabel = Math.max(0, currentLabel - steps);

    const newPos = getSpiralAxial(newLabel);
    if (newPos) {
      newState = setEnemyPosition(newState, enemy.id, newPos);
    }
  }

  // Move boss with collision handling
  for (const boss of bosses) {
    if (boss.frozenTurns > 0) {
      newState = setEnemyFrozen(newState, boss.id, boss.frozenTurns - 1);
      continue;
    }

    const currentLabel = getSpiralLabel(boss.position.q, boss.position.r);
    if (currentLabel === null) continue;

    // Boss moves 1-20 steps
    const steps = Math.floor(Math.random() * 20) + 1;
    let targetLabel = Math.max(0, currentLabel - steps);

    // Find empty hex (skip occupied hexes, keep moving forward)
    const occupiedLabels = new Set(
      newState.enemies
        .filter((e) => e.id !== boss.id)
        .map((e) => getSpiralLabel(e.position.q, e.position.r))
        .filter((l) => l !== null)
    );

    while (targetLabel > 0 && occupiedLabels.has(targetLabel)) {
      targetLabel--;
    }

    const newPos = getSpiralAxial(targetLabel);
    if (newPos) {
      newState = setEnemyPosition(newState, boss.id, newPos);
    }
  }

  return newState;
}

export function checkPlayerKnockout(state) {
  // Player knocked out if enemy occupies same hex
  const { q, r } = state.player.position;

  for (const enemy of state.enemies) {
    if (enemy.position.q === q && enemy.position.r === r) {
      return setPlayerKnockedOut(state, true);
    }
  }

  return state;
}

export function runEnemyPhase(state) {
  let newState = state;

  // Check if boss just died - grant extra player turn
  if (newState.wave.bossJustDied) {
    newState = updateWave(newState, { bossJustDied: false });
    return advanceToPlayerTurn(newState);
  }

  // Spawn basic enemies on first enemy turn of each wave
  if (newState.wave.enemiesSpawned === 0) {
    newState = spawnWaveEnemies(newState);
  }
  // Spawn boss the turn after basic enemies spawn (if not already spawned)
  else if (!newState.wave.bossSpawned) {
    newState = spawnBoss(newState);
  }

  newState = moveEnemies(newState);
  newState = checkPlayerKnockout(newState);
  newState = endEnemyTurn(newState);
  if (newState.outcome) return newState;
  return advanceToPlayerTurn(newState);
}

// -----------------------------
// Boss Death & Wave Progression
// -----------------------------

/**
 * Handle boss death effects:
 * 1. All enemies lose 50% HP
 * 2. Drop gear (waves 1-9 only)
 * 3. Mark for extra player turn
 * 4. Advance wave and spawn next (if not wave 10)
 * @param {Object} state - current game state
 * @returns {Object} new state with boss death effects applied
 */
export function onBossDefeated(state) {
  let newState = updateWave(state, { bossDefeated: true });

  // 1. All remaining enemies lose 50% HP
  for (const enemy of newState.enemies) {
    const damage = Math.floor(enemy.hp / 2);
    newState = damageEnemy(newState, enemy.id, damage);
  }

  // Remove enemies with 0 HP
  newState = {
    ...newState,
    enemies: newState.enemies.filter((e) => e.hp > 0),
  };

  // 2. Drop gear (waves 1-9 only, wave 10 boss grants victory with no gear)
  if (state.wave.current < 10) {
    newState = dropBossGear(newState);
  }

  // 3. Mark for extra player turn
  newState = updateWave(newState, { bossJustDied: true });

  // 4. Advance wave and spawn next (if not wave 10)
  if (state.wave.current < 10) {
    newState = advanceWave(newState);
    newState = spawnWaveEnemies(newState);
  }

  return newState;
}

/**
 * Advance to next wave, resetting wave-specific trackers.
 * @param {Object} state - current game state
 * @returns {Object} new state with wave advanced
 */
export function advanceWave(state) {
  return updateWave(state, {
    current: state.wave.current + 1,
    enemiesSpawned: 0,
    bossSpawned: false,
    bossDefeated: false,
  });
}

/**
 * Drop gear from boss with non-duplicate preference.
 * @param {Object} state - current game state
 * @returns {Object} new state with gear added to inventory
 */
export function dropBossGear(state) {
  const ownedIds = getOwnedGearIds(state);
  const dropId = getRandomGearDrop(ownedIds);
  const gear = createGearInstance(dropId);
  if (!gear) return state;
  return addToInventory(state, gear);
}

// -----------------------------
// Gear Helpers
// -----------------------------

/**
 * Check if player has a specific gear equipped.
 * @param {Object} state - current game state
 * @param {string} gearId - base gear ID (e.g., 'dragon')
 * @returns {boolean}
 */
export function hasEquippedGear(state, gearId) {
  for (const gear of Object.values(state.player.equipped)) {
    if (gear && gear.id === gearId) return true;
  }
  return false;
}

/**
 * Get effective damage (base + turn bonus + gear).
 * Power Glove doubles base damage.
 * @param {Object} state - current game state
 * @returns {number} total damage
 */
export function getEffectiveDamage(state) {
  let baseDamage = state.player.baseDamage;
  const bonusDamage = state.player.turnBonus?.baseDamage || 0;

  // Power Glove doubles base damage
  if (hasEquippedGear(state, 'power_glove')) {
    baseDamage *= 2;
  }

  return baseDamage + bonusDamage;
}

/**
 * Get effective speed (base + turn bonus + gear).
 * Boots of Speed doubles base speed.
 * @param {Object} state - current game state
 * @returns {number} total speed
 */
export function getEffectiveSpeed(state) {
  let baseSpeed = state.player.baseMovement;
  const bonusSpeed = state.player.turnBonus?.baseMovement || 0;

  // Boots of Speed doubles base speed
  if (hasEquippedGear(state, 'boots_of_speed')) {
    baseSpeed *= 2;
  }

  return baseSpeed + bonusSpeed;
}

// -----------------------------
// Gear Abilities
// -----------------------------

/**
 * Use Dragon gear ability: move to any adjacent hex (ignores spiral path).
 * Can be used once per turn, even with 0 movement points.
 * @param {Object} state - current game state
 * @param {{ q: number, r: number }} targetHex - target adjacent hex
 * @returns {Object} new state (unchanged if invalid)
 */
export function useAdjacentMove(state, targetHex) {
  // Must have Dragon equipped
  if (!hasEquippedGear(state, 'dragon')) return state;

  // Must not have used this turn
  if (state.player.gearUsedThisTurn.dragon) return state;

  // Target must be adjacent to current position
  const { q, r } = state.player.position;
  const neighbors = getNeighbors(q, r);
  const isAdjacent = neighbors.some(
    (n) => n.q === targetHex.q && n.r === targetHex.r
  );
  if (!isAdjacent) return state;

  // Target must be valid hex
  const key = `${targetHex.q},${targetHex.r}`;
  if (!state.hexGrid.has(key)) return state;

  // Target must not have enemy
  const enemyAtTarget = state.enemies.some(
    (e) => e.position.q === targetHex.q && e.position.r === targetHex.r
  );
  if (enemyAtTarget) return state;

  let newState = setPlayerPosition(state, targetHex);
  newState = setGearUsedThisTurn(newState, 'dragon', true);
  return newState;
}

/**
 * Use Fireball gear ability: 10 damage to all enemies within range 3 of target hex.
 * Can target any hex on the board, once per turn.
 * @param {Object} state - current game state
 * @param {{ q: number, r: number }} centerHex - center of AOE
 * @returns {Object} new state (unchanged if invalid)
 */
export function useFireball(state, centerHex) {
  // Must have Fireball equipped
  if (!hasEquippedGear(state, 'fireball')) return state;

  // Must not have used this turn
  if (state.player.gearUsedThisTurn.fireball) return state;

  // Target must be valid hex
  const key = `${centerHex.q},${centerHex.r}`;
  if (!state.hexGrid.has(key)) return state;

  let newState = state;
  const FIREBALL_DAMAGE = 10;
  const FIREBALL_RANGE = 3;

  // Damage all enemies within range 3 of center
  for (const enemy of state.enemies) {
    const distance = axialDistance(
      centerHex.q,
      centerHex.r,
      enemy.position.q,
      enemy.position.r
    );
    if (distance <= FIREBALL_RANGE) {
      newState = damageEnemy(newState, enemy.id, FIREBALL_DAMAGE);

      // Check if enemy defeated
      const updatedEnemy = newState.enemies.find((e) => e.id === enemy.id);
      if (updatedEnemy && updatedEnemy.hp <= 0) {
        newState = removeEnemy(newState, enemy.id);
        newState = incrementEnemiesDefeated(newState);

        // Check if boss was defeated
        if (enemy.isBoss) {
          newState = onBossDefeated(newState);
        }
      }
    }
  }

  newState = setGearUsedThisTurn(newState, 'fireball', true);
  return newState;
}

// -----------------------------
// Gear Equip/Unequip
// -----------------------------

/**
 * Equip gear from inventory to slot.
 * If slot is occupied, swaps with inventory.
 * @param {Object} state - current game state
 * @param {string} instanceId - gear instance ID to equip
 * @returns {Object} new state
 */
export function equipGear(state, instanceId) {
  const gear = state.player.inventory.find((g) => g.instanceId === instanceId);
  if (!gear) return state;

  const slot = gear.type;
  const currentlyEquipped = state.player.equipped[slot];

  // Remove from inventory
  let newState = removeFromInventory(state, instanceId);

  // If slot occupied, add old gear to inventory
  if (currentlyEquipped) {
    newState = addToInventory(newState, currentlyEquipped);
  }

  // Equip new gear
  newState = setPlayerEquipped(newState, slot, gear);
  return newState;
}

/**
 * Unequip gear from slot to inventory.
 * @param {Object} state - current game state
 * @param {string} slot - slot to unequip (head, body, hand, foot, mount)
 * @returns {Object} new state
 */
export function unequipGear(state, slot) {
  const gear = state.player.equipped[slot];
  if (!gear) return state;

  // Check inventory space (max 10)
  if (state.player.inventory.length >= 10) return state;

  let newState = setPlayerEquipped(state, slot, null);
  newState = addToInventory(newState, gear);
  return newState;
}
