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
  spawnWaveEnemies,
  spawnBoss,
  checkPlayerKnockout,
  endEnemyTurn,
  playMerchantCard,
  trashCrystalCard,
  updateWave,
  equipGear,
  unequipGear,
  useAdjacentMove,
  useFireball,
  buildEnemyMoves,
} from './core/index.js';
import {
  generateHexGrid,
  getSpiralLabel,
  getSpiralAxial,
  getDirectionFromDelta,
  buildSpiralPath,
  resolveStepForDirection,
} from './hex/index.js';
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
} from './ui/index.js';
import { registerDebugHotkeys, getDebugOverlay } from './debug/index.js';
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
let enemyPhaseInProgress = false;
let fireballAimActive = false;
let fireballHoverHex = null;
let dragonAimActive = false;
registerDebugHotkeys(window);
emitStateChanged();

function withErrorBoundary(label, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[Error] ${label}`, err);
  }
}

function emitStateChanged() {
  const { q, r } = state.player.position;
  const ring = getHexRing(state, q, r);
  const canShowMerchant = state.phase === 'playerTurn' ? ring : -1;
  updateMerchantVisibility(canShowMerchant);
  if (state.phase !== 'playerTurn') {
    closeMerchant();
  }
  // Cancel dragon aim if no longer available.
  if (dragonAimActive) {
    const equipped = Object.values(state.player.equipped || {}).some(
      (g) => g?.id === 'dragon'
    );
    const used = !!state.player.gearUsedThisTurn?.dragon;
    if (!equipped || used) {
      setDragonAim(false);
    }
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

function isAnyPanelOpen() {
  const drawer = document.getElementById('hand-drawer');
  const sheet = document.getElementById('character-sheet');
  const drawerOpen = drawer && !drawer.classList.contains('collapsed');
  const sheetOpen = sheet && !sheet.classList.contains('hidden');
  const merchantOpen = document.body.classList.contains('merchant-open');
  return !!(drawerOpen || sheetOpen || merchantOpen);
}

function loop() {
  withErrorBoundary('renderFrame', () => {
    if (dragonAimActive && isAnyPanelOpen()) {
      setDragonAim(false);
    }
    const debugOverlay = getDebugOverlay();
    renderFrame(ctx, canvas, state, view, {
      fireball: fireballAimActive && fireballHoverHex
        ? { centerHex: fireballHoverHex }
        : null,
      dragon: dragonAimActive ? { active: true } : null,
      debugPlayer: debugOverlay.debugPlayer,
    });
  });
  requestAnimationFrame(loop);
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


function beginEnemyPhaseWithAnimation() {
  if (state.phase !== 'playerTurn') return;
  if (isAnimatingEnemies()) return;
  if (isAnimatingPlayer()) return;
  if (enemyPhaseInProgress) return;
  enemyPhaseInProgress = true;

  let enemyBaseState = endPlayerTurn(state);

  if (enemyBaseState.wave.bossJustDied) {
    enemyBaseState = updateWave(enemyBaseState, { bossJustDied: false });
    state = startPlayerTurn(enemyBaseState);
    enemyPhaseInProgress = false;
    emitStateChanged();
    return;
  }

  if (enemyBaseState.wave.enemiesSpawned === 0) {
    enemyBaseState = spawnWaveEnemies(enemyBaseState);
  } else if (!enemyBaseState.wave.bossSpawned) {
    enemyBaseState = spawnBoss(enemyBaseState);
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

  const toHex = resolveStepForDirection(state.player.position, direction);
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
  if (dragonAimActive) {
    const nextState = useAdjacentMove(state, target);
    if (nextState !== state) {
      state = nextState;
      emitStateChanged();
      setDragonAim(false);
    }
    return;
  }
  if (fireballAimActive) {
    // In fireball aim mode: select target hex (don't cast yet)
    fireballHoverHex = target;
    return;
  }
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

function handleMoveDirection(direction) {
  if (direction && dragonAimActive) {
    setDragonAim(false);
  }
  setPlayerHeldDirection(direction);
  if (!direction && !isAnimatingPlayer()) {
    resetPlayerDrift();
  }
}

function setFireballAim(active) {
  fireballAimActive = active;
  fireballHoverHex = null;
  window.dispatchEvent(
    new CustomEvent('fireball-aim-changed', { detail: { active: fireballAimActive } })
  );
}

function setDragonAim(active) {
  dragonAimActive = active;
  window.dispatchEvent(
    new CustomEvent('dragon-aim-changed', { detail: { active: dragonAimActive } })
  );
}

/**
 * Handle fireball button/key action:
 * - If not in aim mode: enter aim mode
 * - If in aim mode with target selected: cast fireball
 * - If in aim mode without target: exit aim mode (cancel)
 */
function handleFireballAction() {
  const hasFireball = Object.values(state.player.equipped || {}).some(
    (g) => g?.id === 'fireball'
  );
  const fireballUsed = !!state.player.gearUsedThisTurn?.fireball;
  if (!hasFireball || fireballUsed) {
    return;
  }
  if (!fireballAimActive) {
    if (dragonAimActive) {
      setDragonAim(false);
    }
    // Enter fireball aim mode
    setFireballAim(true);
  } else if (fireballHoverHex) {
    // Cast fireball at selected target
    if (isAnimatingEnemies()) return;
    const nextState = useFireball(state, fireballHoverHex);
    if (nextState !== state) {
      state = nextState;
      emitStateChanged();
    }
    setFireballAim(false);
  } else {
    // No target selected, cancel aim mode
    setFireballAim(false);
  }
}

/**
 * Handle dragon button/key action:
 * - Toggle aim mode on/off
 */
function handleDragonAction() {
  if (!dragonAimActive) {
    if (fireballAimActive) {
      setFireballAim(false);
    }
    setDragonAim(true);
  } else {
    setDragonAim(false);
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
const cleanupInput = setupInputControls(canvas, view, {
  hexSize: HEX_SIZE,
  boardRadius: BOARD_RADIUS,
  onMoveToHex: handleMoveToHex,
  onMoveDirection: handleMoveDirection,
  onClickOutsideBoard: () => {
    // Cancel fireball aim mode when tapping outside the board
    if (fireballAimActive) {
      setFireballAim(false);
    }
    if (dragonAimActive) {
      setDragonAim(false);
    }
  },
});

function handleEndTurnKey(e) {
  withErrorBoundary('end-turn-key', () => {
    if (e.key !== 'Enter') return;
    if (document.body.classList.contains('merchant-open')) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
      return;
    }
    if (state.phase !== 'playerTurn') return;
    if (isAnimatingPlayer() || isAnimatingEnemies() || enemyPhaseInProgress) return;
    e.preventDefault();
    beginEnemyPhaseWithAnimation();
  });
}

window.addEventListener('keydown', handleEndTurnKey);
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() !== 'f') return;
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
    return;
  }
  e.preventDefault();
  withErrorBoundary('fireball-toggle-key', () => {
    handleFireballAction();
  });
});

window.addEventListener('card-played', (e) => {
  withErrorBoundary('card-played', () => {
    const { cardId, action } = e.detail || {};
    if (!cardId) return;

    const card = state.player.hand.find((c) => c.id === cardId);
    if (!card) return;

    if (card.type === 'action') {
      if (!action) return;
      state = playActionCard(state, cardId, action);
    } else if (card.type === 'merchant') {
      if (action === 'attack' || action === 'movement') {
        state = playActionCard(state, cardId, action);
      } else {
        state = playMerchantCard(state, cardId);
      }
    } else if (card.type === 'crystal') {
      if (action === 'trash') {
        state = trashCrystalCard(state, cardId);
      }
    } else {
      return;
    }
    emitStateChanged();
  });
});

window.addEventListener('end-turn', () => {
  withErrorBoundary('end-turn', () => {
    if (document.body.classList.contains('merchant-open')) return;
    if (state.phase !== 'playerTurn') return;
    if (isAnimatingPlayer() || isAnimatingEnemies() || enemyPhaseInProgress) return;
    beginEnemyPhaseWithAnimation();
  });
});

window.addEventListener('crystal-sold', (e) => {
  withErrorBoundary('crystal-sold', () => {
    const { cardId, value } = e.detail || {};
    if (!cardId || !Number.isFinite(value)) return;
    state = removeCardFromHand(state, cardId);
    state = addPlayerGold(state, value);
    emitStateChanged();
  });
});

window.addEventListener('merchant-buy', (e) => {
  withErrorBoundary('merchant-buy', () => {
    const { cardType } = e.detail || {};
    if (!cardType) return;
    state = buyMerchantCard(state, cardType);
    emitStateChanged();
  });
});

window.addEventListener('gear-equip', (e) => {
  withErrorBoundary('gear-equip', () => {
    const { instanceId } = e.detail || {};
    if (!instanceId) return;
    state = equipGear(state, instanceId);
    emitStateChanged();
  });
});

window.addEventListener('gear-unequip', (e) => {
  withErrorBoundary('gear-unequip', () => {
    const { slot } = e.detail || {};
    if (!slot) return;
    state = unequipGear(state, slot);
    emitStateChanged();
  });
});

window.addEventListener('dragon-move', (e) => {
  withErrorBoundary('dragon-move', () => {
    const { targetHex } = e.detail || {};
    if (!targetHex) return;
    if (isAnimatingPlayer() || isAnimatingEnemies()) return;
    const nextState = useAdjacentMove(state, targetHex);
    if (nextState !== state) {
      state = nextState;
      emitStateChanged();
    }
  });
});

window.addEventListener('fireball-cast', (e) => {
  withErrorBoundary('fireball-cast', () => {
    const { centerHex } = e.detail || {};
    if (!centerHex) return;
    if (isAnimatingEnemies()) return;
    const nextState = useFireball(state, centerHex);
    if (nextState !== state) {
      state = nextState;
      emitStateChanged();
    }
  });
});

window.addEventListener('fireball-toggle', () => {
  withErrorBoundary('fireball-toggle', () => {
    handleFireballAction();
  });
});

window.addEventListener('dragon-toggle', () => {
  withErrorBoundary('dragon-toggle', () => {
    handleDragonAction();
  });
});

window.addEventListener('beforeunload', () => {
  cleanupInput?.();
  window.removeEventListener('keydown', handleEndTurnKey);
});
loop();
