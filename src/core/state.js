/**
 * state.js - Game state model and pure update functions
 * Pure logic only - no rendering, DOM, or input handling.
 *
 * HEX GRID INTEGRATION:
 * The hexGrid field holds a Map keyed by "q,r" (axial coordinates).
 * hex.js generates this map; state.js consumes it via hexKey/getHex helpers.
 * Each hex entry: { q, r, ring } where ring 0 = center, ring 5 = outer edge.
 * Occupancy is tracked via player.position and enemies[].position, not stored in hex data.
 */

import { createStarterDeck } from '../data/cards.js';

// -----------------------------
// Initial State Shape (MVP)
// -----------------------------

export function createInitialState(hexGrid = new Map()) {
  return {
    // 'setup' | 'playerTurn' | 'enemyTurn' | 'gameOver'
    phase: 'setup',

    turnNumber: 0,

    // Wave: MVP = 1 wave, 10 basic enemies + 1 boss
    wave: {
      current: 1,
      enemiesSpawned: 0,
      enemiesDefeated: 0,
      totalEnemies: 10,
      bossSpawned: false,
      bossDefeated: false,
    },

    // Player (MVP: Warrior with Sword)
    player: {
      position: { q: 0, r: 0 }, // axial coords, starts at center
      baseMovement: 3,
      movementPoints: 0, 
      baseDamage: 10,
      range: 2,
      attackPoints: 0,
      gold: 0,
      gear: null, // single gear slot for MVP
      isKnockedOut: false,

      // Deck system (cards: { id, type, value })
      deck: createStarterDeck(),
      hand: [],
      discard: [],
    },

    // Enemies: { id, position: {q,r}, hp, maxHp, isBoss }
    enemies: [],

    // Hex grid (Map from "q,r" -> { q, r, ring })
    hexGrid,

    // Shop: MVP = 8 merchant cards, 10 copies each
    shop: {
      piles: [], // { cardType, remaining }
    },

    // Outcome
    outcome: null,    // null | 'win' | 'lose'
    loseReason: null, // null | 'enemyReachedCenter' | 'playerKnockedOut'
  };
}

// -----------------------------
// Hex Helpers
// -----------------------------

export function hexKey(q, r) {
  return `${q},${r}`;
}

export function getHex(state, q, r) {
  return state.hexGrid.get(hexKey(q, r)) || null;
}

export function getHexRing(state, q, r) {
  const hex = getHex(state, q, r);
  return hex ? hex.ring : null;
}

// -----------------------------
// Pure State Updaters
// -----------------------------

export function setPhase(state, phase) {
  return { ...state, phase };
}

export function incrementTurn(state) {
  return { ...state, turnNumber: state.turnNumber + 1 };
}

// Player

export function setPlayerPosition(state, position) {
  return {
    ...state,
    player: { ...state.player, position: { ...position } },
  };
}

export function setPlayerMovementPoints(state, movementPoints) {
  return { ...state, player: { ...state.player, movementPoints } };
}

export function setPlayerAttackPoints(state, attackPoints) {
  return { ...state, player: { ...state.player, attackPoints } };
}

export function setPlayerGold(state, gold) {
  return { ...state, player: { ...state.player, gold } };
}

export function addPlayerGold(state, amount) {
  return setPlayerGold(state, state.player.gold + amount);
}

export function setPlayerGear(state, gear) {
  return { ...state, player: { ...state.player, gear } };
}

export function setPlayerKnockedOut(state, isKnockedOut) {
  return { ...state, player: { ...state.player, isKnockedOut } };
}

// Deck

export function setDeck(state, deck) {
  return { ...state, player: { ...state.player, deck: [...deck] } };
}

export function setHand(state, hand) {
  return { ...state, player: { ...state.player, hand: [...hand] } };
}

export function setDiscard(state, discard) {
  return { ...state, player: { ...state.player, discard: [...discard] } };
}

export function addCardToHand(state, card) {
  return { ...state, player: { ...state.player, hand: [...state.player.hand, card] } };
}

export function removeCardFromHand(state, cardId) {
  return {
    ...state,
    player: { ...state.player, hand: state.player.hand.filter((c) => c.id !== cardId) },
  };
}

export function addCardToDiscard(state, card) {
  return {
    ...state,
    player: { ...state.player, discard: [...state.player.discard, card] },
  };
}

// Enemies

export function addEnemy(state, enemy) {
  return { ...state, enemies: [...state.enemies, enemy] };
}

export function removeEnemy(state, enemyId) {
  return { ...state, enemies: state.enemies.filter((e) => e.id !== enemyId) };
}

export function updateEnemy(state, enemyId, updates) {
  return {
    ...state,
    enemies: state.enemies.map((e) =>
      e.id === enemyId ? { ...e, ...updates } : e
    ),
  };
}

export function setEnemyPosition(state, enemyId, position) {
  return updateEnemy(state, enemyId, { position: { ...position } });
}

export function damageEnemy(state, enemyId, damage) {
  const enemy = state.enemies.find((e) => e.id === enemyId);
  if (!enemy) return state;
  return updateEnemy(state, enemyId, { hp: Math.max(0, enemy.hp - damage) });
}

// Wave

export function updateWave(state, updates) {
  return { ...state, wave: { ...state.wave, ...updates } };
}

export function incrementEnemiesDefeated(state) {
  return updateWave(state, { enemiesDefeated: state.wave.enemiesDefeated + 1 });
}

// Shop

export function setShopPiles(state, piles) {
  return { ...state, shop: { ...state.shop, piles: [...piles] } };
}

export function decrementShopPile(state, cardType) {
  return {
    ...state,
    shop: {
      ...state.shop,
      piles: state.shop.piles.map((p) =>
        p.cardType === cardType ? { ...p, remaining: p.remaining - 1 } : p
      ),
    },
  };
}

// Outcome

export function setOutcome(state, outcome, loseReason = null) {
  return { ...state, outcome, loseReason };
}
