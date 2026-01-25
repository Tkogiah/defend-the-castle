import {
  createInitialState,
  startPlayerTurn,
  endPlayerTurn,
  runEnemyPhase,
  movePlayer,
  tryAttackAtHex,
  playActionCard,
  removeCardFromHand,
  addPlayerGold,
  getHexRing,
  buyMerchantCard,
} from './core/index.js';
import { generateHexGrid, getSpiralLabel, getSpiralAxial } from './hex/index.js';
import { renderFrame } from './render/index.js';
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

function handleMoveToHex(target) {
  const { q: pq, r: pr } = state.player.position;
  const { q: tq, r: tr } = target;

  const hasEnemy = state.enemies.some(
    (e) => e.position.q === tq && e.position.r === tr
  );
  if (hasEnemy) {
    state = tryAttackAtHex(state, target);
    emitStateChanged();
    return;
  }

  // Otherwise, move
  const before = state.player.position;
  state = movePlayer(state, target);
  emitStateChanged();
  if (state.player.position.q !== before.q || state.player.position.r !== before.r) {
    window.dispatchEvent(new CustomEvent('player-moved'));
  }
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
  const { q, r } = state.player.position;
  const currentLabel = getSpiralLabel(q, r);
  if (currentLabel === null) return;

  const forwardPos = getSpiralAxial(currentLabel + 1);
  const backwardPos = getSpiralAxial(currentLabel - 1);

  const forwardDir = forwardPos
    ? getDirectionFromDelta(forwardPos.q - q, forwardPos.r - r)
    : null;
  const backwardDir = backwardPos
    ? getDirectionFromDelta(backwardPos.q - q, backwardPos.r - r)
    : null;

  const wantsForward =
    direction === forwardDir ||
    (direction === 'N' && (forwardDir === 'NE' || forwardDir === 'NW')) ||
    (direction === 'S' && (forwardDir === 'SE' || forwardDir === 'SW'));
  const wantsBackward =
    direction === backwardDir ||
    (direction === 'N' && (backwardDir === 'NE' || backwardDir === 'NW')) ||
    (direction === 'S' && (backwardDir === 'SE' || backwardDir === 'SW'));

  if (wantsForward) {
    const before = state.player.position;
    state = movePlayer(state, forwardPos);
    emitStateChanged();
    if (state.player.position.q !== before.q || state.player.position.r !== before.r) {
      window.dispatchEvent(new CustomEvent('player-moved'));
    }
  } else if (wantsBackward) {
    const before = state.player.position;
    state = movePlayer(state, backwardPos);
    emitStateChanged();
    if (state.player.position.q !== before.q || state.player.position.r !== before.r) {
      window.dispatchEvent(new CustomEvent('player-moved'));
    }
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
  e.preventDefault();
  state = endPlayerTurn(state);
  state = runEnemyPhase(state);
  emitStateChanged();
}

window.addEventListener('keydown', handleEndTurnKey);

window.addEventListener('card-played', (e) => {
  const { cardId, action } = e.detail || {};
  if (!cardId || !action) return;
  state = playActionCard(state, cardId, action);
  emitStateChanged();
});

window.addEventListener('end-turn', () => {
  if (document.body.classList.contains('merchant-open')) return;
  if (state.phase !== 'playerTurn') return;
  state = endPlayerTurn(state);
  state = runEnemyPhase(state);
  emitStateChanged();
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
