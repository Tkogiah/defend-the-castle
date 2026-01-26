import {
  createInitialState,
  startPlayerTurn,
  endPlayerTurn,
  movePlayer,
  tryAttackAtHex,
  playActionCard,
  removeCardFromHand,
  addPlayerGold,
  getHexRing,
  buyMerchantCard,
  moveEnemies,
  spawnEnemies,
  checkPlayerKnockout,
  endEnemyTurn,
  playMerchantCard,
} from './core/index.js';
import { generateHexGrid, getSpiralLabel, getSpiralAxial } from './hex/index.js';
import {
  renderFrame,
  startPlayerAnimation,
  startEnemyAnimations,
  isAnimatingPlayer,
  isAnimatingEnemies,
  setPlayerHeldDirection,
  setPlayerBoundaryCallback,
  resetPlayerDrift,
} from './render/index.js';
import { setupInputControls } from './input/index.js';
import {
  subscribeToState,
  updateMerchantVisibility,
  closeMerchant,
} from './ui.js';
import { HEX_SIZE, BOARD_RADIUS, ISO_SCALE_Y, FIT_PADDING } from './config/index.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const view = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

let state = createInitialState(generateHexGrid());
state = startPlayerTurn(state);
subscribeToState(() => state);
emitStateChanged();
let enemyPhaseInProgress = false;

function emitStateChanged() {
  const { q, r } = state.player.position;
  const ring = getHexRing(state, q, r);
  const canShowMerchant = state.phase === 'playerTurn' ? ring : -1;
  updateMerchantVisibility(canShowMerchant);
  if (state.phase !== 'playerTurn') {
    closeMerchant();
  }
  window.dispatchEvent(new CustomEvent('state-changed', { detail: { state } }));
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  updateViewToFit(rect.width, rect.height);
}

function updateViewToFit(cssWidth, cssHeight) {
  // Fit the full board in view without cropping.
  const boardWidth = Math.sqrt(3) * HEX_SIZE * (2 * BOARD_RADIUS + 1);
  const boardHeight = HEX_SIZE * (3 * BOARD_RADIUS + 2);
  const zoomX = cssWidth / boardWidth;
  const zoomY = cssHeight / (boardHeight * ISO_SCALE_Y);
  view.zoom = Math.min(zoomX, zoomY) * FIT_PADDING;
  view.panX = 0;
  view.panY = 0;
}

function loop() {
  renderFrame(ctx, canvas, state, view);
  requestAnimationFrame(loop);
}

function buildSpiralPath(from, to) {
  const startLabel = getSpiralLabel(from.q, from.r);
  const endLabel = getSpiralLabel(to.q, to.r);
  if (startLabel === null || endLabel === null) return [from];

  const step = endLabel >= startLabel ? 1 : -1;
  const path = [];
  for (let label = startLabel; label !== endLabel + step; label += step) {
    const pos = getSpiralAxial(label);
    if (pos) path.push(pos);
  }
  return path;
}

function startPlayerMoveSequence(path) {
  if (!Array.isArray(path) || path.length < 2) return;
  if (isAnimatingPlayer()) return;

  let stepIndex = 0;
  const moveNext = () => {
    if (stepIndex >= path.length - 1) return;
    const from = path[stepIndex];
    const to = path[stepIndex + 1];
    const nextState = movePlayer(state, to);
    const moved =
      nextState.player.position.q !== state.player.position.q ||
      nextState.player.position.r !== state.player.position.r;
    if (!moved) return;

    startPlayerAnimation(from, to, () => {
      state = nextState;
      emitStateChanged();
      window.dispatchEvent(new CustomEvent('player-moved'));
      stepIndex += 1;
      if (stepIndex < path.length - 1) {
        moveNext();
      }
    });
  };

  moveNext();
}

function resolveStepForDirection(direction) {
  const { q, r } = state.player.position;
  const currentLabel = getSpiralLabel(q, r);
  if (currentLabel === null) return null;

  const forwardPos = getSpiralAxial(currentLabel + 1);
  const backwardPos = getSpiralAxial(currentLabel - 1);

  const forwardDir = forwardPos
    ? getDirectionFromDelta(forwardPos.q - q, forwardPos.r - r)
    : null;
  const backwardDir = backwardPos
    ? getDirectionFromDelta(backwardPos.q - q, backwardPos.r - r)
    : null;

  if (direction === forwardDir && forwardPos) {
    return forwardPos;
  }
  if (direction === backwardDir && backwardPos) {
    return backwardPos;
  }
  return null;
}

function buildEnemyMoves(beforeState, afterState) {
  const beforeById = new Map(beforeState.enemies.map((e) => [e.id, e]));
  const moves = [];
  for (const enemy of afterState.enemies) {
    const before = beforeById.get(enemy.id);
    if (!before) continue;
    const path = buildSpiralPath(before.position, enemy.position);
    if (path.length >= 2) {
      moves.push({ enemyId: enemy.id, path });
    }
  }
  return moves;
}

function beginEnemyPhaseWithAnimation() {
  if (state.phase !== 'playerTurn') return;
  if (isAnimatingEnemies()) return;
  if (isAnimatingPlayer()) return;
  if (enemyPhaseInProgress) return;
  enemyPhaseInProgress = true;

  let enemyBaseState = endPlayerTurn(state);
  if (enemyBaseState.wave.enemiesSpawned === 0) {
    enemyBaseState = spawnEnemies(enemyBaseState, 10);
  }

  // Start new player turn immediately (player can act while enemies move).
  state = startPlayerTurn(enemyBaseState);
  emitStateChanged();

  const movedState = moveEnemies(enemyBaseState);
  const moves = buildEnemyMoves(enemyBaseState, movedState);

  startEnemyAnimations(moves, () => {
    state = { ...state, enemies: movedState.enemies };
    state = checkPlayerKnockout(state);
    state = endEnemyTurn(state);
    enemyPhaseInProgress = false;
    emitStateChanged();
  });
}

setPlayerBoundaryCallback((direction) => {
  if (!direction) return { valid: false };
  if (isAnimatingPlayer()) return { valid: false };
  if (direction === 'N' || direction === 'S') return { valid: false };

  const toHex = resolveStepForDirection(direction);
  if (!toHex) return { valid: false };

  const nextState = movePlayer(state, toHex);
  const moved =
    nextState.player.position.q !== state.player.position.q ||
    nextState.player.position.r !== state.player.position.r;
  if (!moved) return { valid: false };

  return {
    valid: true,
    toHex,
    onComplete: () => {
      state = nextState;
      emitStateChanged();
      window.dispatchEvent(new CustomEvent('player-moved'));
    },
  };
});

function handleMoveToHex(target) {
  if (isAnimatingPlayer()) return;
  const { q: tq, r: tr } = target;

  const hasEnemy = state.enemies.some(
    (e) => e.position.q === tq && e.position.r === tr
  );
  if (hasEnemy) {
    if (isAnimatingEnemies()) return;
    state = tryAttackAtHex(state, target);
    emitStateChanged();
    return;
  }

  // Clear drift/held input to avoid visual overlap during click-to-move sequences.
  setPlayerHeldDirection(null);
  resetPlayerDrift();

  const path = buildSpiralPath(state.player.position, target);
  startPlayerMoveSequence(path);
}

function getDirectionFromDelta(dq, dr) {
  if (dq === 1 && dr === -1) return 'NE';
  if (dq === 1 && dr === 0) return 'E';
  if (dq === 0 && dr === 1) return 'SE';
  if (dq === -1 && dr === 1) return 'SW';
  if (dq === -1 && dr === 0) return 'W';
  if (dq === 0 && dr === -1) return 'NW';
  return null;
}

function handleMoveDirection(direction) {
  setPlayerHeldDirection(direction);
  if (!direction && !isAnimatingPlayer()) {
    resetPlayerDrift();
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
const cleanupInput = setupInputControls(canvas, view, {
  hexSize: HEX_SIZE,
  boardRadius: BOARD_RADIUS,
  onMoveToHex: handleMoveToHex,
  onMoveDirection: handleMoveDirection,
});

function handleEndTurnKey(e) {
  if (e.key !== 'Enter') return;
  if (document.body.classList.contains('merchant-open')) return;
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
    return;
  }
  if (state.phase !== 'playerTurn') return;
  if (isAnimatingPlayer() || isAnimatingEnemies() || enemyPhaseInProgress) return;
  e.preventDefault();
  beginEnemyPhaseWithAnimation();
}

window.addEventListener('keydown', handleEndTurnKey);

window.addEventListener('card-played', (e) => {
  const { cardId, action } = e.detail || {};
  if (!cardId) return;

  const card = state.player.hand.find((c) => c.id === cardId);
  if (!card) return;

  if (card.type === 'action') {
    if (!action) return;
    state = playActionCard(state, cardId, action);
  } else if (card.type === 'merchant') {
    state = playMerchantCard(state, cardId);
  } else {
    return;
  }
  emitStateChanged();
});

window.addEventListener('end-turn', () => {
  if (document.body.classList.contains('merchant-open')) return;
  if (state.phase !== 'playerTurn') return;
  if (isAnimatingPlayer() || isAnimatingEnemies() || enemyPhaseInProgress) return;
  beginEnemyPhaseWithAnimation();
});

window.addEventListener('crystal-sold', (e) => {
  const { cardId, value } = e.detail || {};
  if (!cardId || !Number.isFinite(value)) return;
  state = removeCardFromHand(state, cardId);
  state = addPlayerGold(state, value);
  emitStateChanged();
});

window.addEventListener('merchant-buy', (e) => {
  const { cardType } = e.detail || {};
  if (!cardType) return;
  state = buyMerchantCard(state, cardType);
  emitStateChanged();
});

window.addEventListener('beforeunload', () => {
  cleanupInput?.();
  window.removeEventListener('keydown', handleEndTurnKey);
});
loop();
