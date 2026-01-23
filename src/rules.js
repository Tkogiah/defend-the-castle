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
  addPlayerGold,
  damageEnemy,
  removeEnemy,
  incrementEnemiesDefeated,
  updateWave,
  setEnemyPosition,
  setPlayerPosition,
  setPlayerMovementPoints,
} from './state.js';
import { getSpiralLabel } from './hex.js';

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
  let deck = [...state.deck];
  let discard = [...state.discard];
  let hand = [...state.hand];

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
  const newDiscard = [...state.discard, ...state.hand];
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
  newState = drawCards(newState, 5);
  return newState;
}

export function endPlayerTurn(state) {
  let newState = discardHand(state);
  newState = setPlayerMovementPoints(newState, 0);
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
  const card = state.hand.find((c) => c.id === cardId);
  if (!card || card.type !== 'action') return state;

  let newState = removeCardFromHand(state, cardId);
  newState = addCardToDiscard(newState, card);
  // Actual attack/movement logic to be implemented
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

  const damage = state.player.baseDamage;
  let newState = damageEnemy(state, enemyId, damage);

  // Check if enemy defeated
  const updatedEnemy = newState.enemies.find((e) => e.id === enemyId);
  if (updatedEnemy && updatedEnemy.hp <= 0) {
    newState = removeEnemy(newState, enemyId);
    newState = incrementEnemiesDefeated(newState);

    // Award crystal card based on ring distance
    const ring = getHexRing(state, enemy.position.q, enemy.position.r);
    if (ring > 0) {
      // Crystal card reward would be added to discard
      // Card creation deferred to data module
    }

    // Check if boss was defeated
    if (enemy.isBoss) {
      newState = updateWave(newState, { bossDefeated: true });
    }
  }

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

  for (const card of state.hand) {
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

// -----------------------------
// Enemy Phase (stubs)
// -----------------------------

export function moveEnemies(state) {
  // Each enemy moves 1-10 hexes toward center
  // Stub: actual pathfinding to be implemented
  let newState = state;

  for (const enemy of state.enemies) {
    // Placeholder: movement logic will use hex.js for pathfinding
    const steps = Math.floor(Math.random() * 10) + 1;
    void steps;
    // setEnemyPosition would be called after computing new position
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
  let newState = moveEnemies(state);
  newState = checkPlayerKnockout(newState);
  newState = endEnemyTurn(newState);
  if (newState.outcome) return newState;
  return advanceToPlayerTurn(newState);
}
