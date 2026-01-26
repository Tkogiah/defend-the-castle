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
} from './state.js';
import { getSpiralLabel, getSpiralAxial, axialDistance } from '../hex/index.js';
import { createCrystalCard, createMerchantCard } from '../data/cards.js';

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
  // Win: boss defeated
  if (state.wave.bossDefeated) {
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
    // Apply turn bonus to base movement
    const baseSpeed = Number.isFinite(newState.player.baseMovement)
      ? newState.player.baseMovement
      : 0;
    const bonusSpeed = newState.player.turnBonus?.baseMovement || 0;
    const totalSpeed = baseSpeed + bonusSpeed;
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
        const baseSpeed = Number.isFinite(newState.player.baseMovement)
          ? newState.player.baseMovement
          : 0;
        const bonusSpeed = newState.player.turnBonus?.baseMovement || 0;
        const totalSpeed = baseSpeed + bonusSpeed;
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
      // +2 movement points (flat, not multiplied)
      {
        const baseSpeed = Number.isFinite(newState.player.baseMovement)
          ? newState.player.baseMovement
          : 0;
        const bonusSpeed = newState.player.turnBonus?.baseMovement || 0;
        const totalSpeed = baseSpeed + bonusSpeed;
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

  // Apply turn bonus to base damage
  const baseDamage = state.player.baseDamage;
  const bonusDamage = state.player.turnBonus?.baseDamage || 0;
  const totalDamage = baseDamage + bonusDamage;

  let newState = damageEnemy(state, enemyId, totalDamage);

  // Handle Ice card freeze effect
  if (state.player.nextAttackFreezes) {
    newState = setEnemyFrozen(newState, enemyId, 1);
    newState = setNextAttackFreezes(newState, false);
  }

  // Award crystal card on attack based on player's ring distance from center
  const { q, r } = state.player.position;
  const ring = getHexRing(state, q, r);
  const crystalCard = createCrystalCard(ring);
  if (crystalCard) {
    newState = addCardToDiscard(newState, crystalCard);
  }

  // Check if enemy defeated
  const updatedEnemy = newState.enemies.find((e) => e.id === enemyId);
  if (updatedEnemy && updatedEnemy.hp <= 0) {
    newState = removeEnemy(newState, enemyId);
    newState = incrementEnemiesDefeated(newState);

    // Check if boss was defeated
    if (enemy.isBoss) {
      newState = updateWave(newState, { bossDefeated: true });
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
 * Spawn enemies at the outer edge (spiral label 90).
 * @param {Object} state - current game state
 * @param {number} count - number of enemies to spawn
 * @returns {Object} new state with spawned enemies
 */
export function spawnEnemies(state, count) {
  const spawnLabel = 90; // Outer edge of spiral
  const spawnPos = getSpiralAxial(spawnLabel);
  if (!spawnPos) return state;

  let newState = state;

  for (let i = 0; i < count; i++) {
    const enemy = {
      id: `enemy-${Date.now()}-${i}`,
      position: { q: spawnPos.q, r: spawnPos.r },
      hp: 10,
      maxHp: 10,
      isBoss: false,
      frozenTurns: 0, // Tracks freeze effect from Ice card
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
 * Move all enemies along the spiral path toward center.
 * Each enemy moves 1-10 random steps (counter-clockwise, decreasing label).
 * Frozen enemies skip movement and have their freeze counter decremented.
 * @param {Object} state - current game state
 * @returns {Object} new state with updated enemy positions
 */
export function moveEnemies(state) {
  let newState = state;

  for (const enemy of state.enemies) {
    // Handle frozen enemies
    if (enemy.frozenTurns > 0) {
      // Decrement freeze counter, skip movement
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

  // Spawn enemies on first enemy turn (once per game)
  if (newState.wave.enemiesSpawned === 0) {
    newState = spawnEnemies(newState, 10);
  }

  newState = moveEnemies(newState);
  newState = checkPlayerKnockout(newState);
  newState = endEnemyTurn(newState);
  if (newState.outcome) return newState;
  return advanceToPlayerTurn(newState);
}
