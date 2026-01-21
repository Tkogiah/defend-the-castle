import { createInitialState } from './state.js';
import { generateHexGrid } from './hex.js';
import { renderFrame } from './render.js';
import { setupInputControls } from './input.js';

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

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
setupInputControls(canvas, view);
loop();
