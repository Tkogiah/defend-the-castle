/**
 * render/index.js - Public API for render module
 * Orchestrates frame rendering and animation.
 */

import { drawGrid } from './grid.js';
import { drawPlayer, drawEnemies } from './entities.js';
import { getMovementRange, drawMovementRange, drawAttackRange } from './overlays.js';
import { ISO_SCALE_Y } from '../config/index.js';
import {
  updateAnimations,
  getPlayerVisualPosition,
  getEnemyVisualPosition,
  startPlayerAnimation,
  startEnemyAnimations,
  isAnimatingPlayer,
  isAnimatingEnemies,
  setPlayerHeldDirection,
  setPlayerBoundaryCallback,
  resetPlayerDrift,
} from './animation.js';

// Re-export animation API for main.js
export {
  startPlayerAnimation,
  startEnemyAnimations,
  isAnimatingPlayer,
  isAnimatingEnemies,
  setPlayerHeldDirection,
  setPlayerBoundaryCallback,
  resetPlayerDrift,
};

/**
 * Render a single frame to the canvas.
 * Updates animations and draws all game elements with interpolated positions.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {Object} state - game state containing hexGrid and player
 * @param {{ panX: number, panY: number, zoom: number }} view - view state
 */
export function renderFrame(ctx, canvas, state, view) {
  // Update animations (uses internal time tracking)
  updateAnimations();

  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width;
  const cssHeight = rect.height;

  // Clear and fill background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#121a17';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Center hex (0,0) at canvas center with pan/zoom and isometric transform
  ctx.save();
  ctx.translate(cssWidth / 2 + view.panX, cssHeight / 2 + view.panY);
  ctx.scale(view.zoom, view.zoom * ISO_SCALE_Y); // Apply isometric Y compression

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
  if (state.player.attackPoints > 0) {
    drawAttackRange(ctx, state.hexGrid, state.player.position, state.player.range);
  }

  // Entities with animated positions
  const enemiesWithVisualPos = (state.enemies || []).map((enemy, index) => {
    const visual = getEnemyVisualPosition(enemy.position, enemy.id ?? index);
    return {
      ...enemy,
      visualPosition: { x: visual.x, y: visual.y },
      isAnimating: visual.isAnimating,
    };
  });
  drawEnemies(ctx, enemiesWithVisualPos);

  const playerVisualPos = getPlayerVisualPosition(state.player.position);
  drawPlayer(ctx, playerVisualPos);

  ctx.restore();
}
