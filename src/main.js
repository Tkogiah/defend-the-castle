import { createInitialState } from './state.js';
import { generateHexGrid, getSpiralLabel, getSpiralAxial } from './hex.js';
import { renderFrame } from './render.js';
import { setupInputControls } from './input.js';
import { movePlayer } from './rules.js';
import { HEX_SIZE, BOARD_RADIUS } from './config.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const view = {
  zoom: 1,
  panX: 0,
  panY: 0,
};

let state = createInitialState(generateHexGrid());

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function loop() {
  renderFrame(ctx, canvas, state, view);
  requestAnimationFrame(loop);
}

function handleMoveToHex(target) {
  state = movePlayer(state, target);
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
    state = movePlayer(state, forwardPos);
  } else if (wantsBackward) {
    state = movePlayer(state, backwardPos);
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

window.addEventListener('beforeunload', () => {
  cleanupInput?.();
});
loop();
