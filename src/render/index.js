/**
 * render/index.js - Public API for render module
 * Orchestrates frame rendering.
 */

import { drawGrid } from './grid.js';
import { drawPlayer, drawEnemies } from './entities.js';
import { getMovementRange, drawMovementRange, drawAttackRange } from './overlays.js';

/**
 * Render a single frame to the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {Object} state - game state containing hexGrid and player
 * @param {{ panX: number, panY: number, zoom: number }} view - view state
 */
export function renderFrame(ctx, canvas, state, view) {
  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width;
  const cssHeight = rect.height;

  // Clear and fill background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#121a17';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Center hex (0,0) at canvas center with pan/zoom transform
  ctx.save();
  ctx.translate(cssWidth / 2 + view.panX, cssHeight / 2 + view.panY);
  ctx.scale(view.zoom, view.zoom);

  // Draw game elements in order: grid → movement range → attack range → enemies → player
  drawGrid(ctx, state.hexGrid);

  // Movement range overlay (blue fills)
  const movementRange = getMovementRange(
    state.player.position,
    state.player.movementPoints,
    state.enemies
  );
  drawMovementRange(ctx, movementRange);

  // Attack range overlay (green outlines)
  drawAttackRange(ctx, state.player.position);

  // Entities
  drawEnemies(ctx, state.enemies);
  drawPlayer(ctx, state.player.position);

  ctx.restore();
}
