/**
 * entities.js - Entity rendering
 * Draws player, enemies, and other game entities.
 */

import { HEX_SIZE } from '../config/index.js';
import { axialToPixel } from './util.js';

/**
 * Draw the player at the given position.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ q: number, r: number }} position - axial coordinates
 */
export function drawPlayer(ctx, position) {
  const { x, y } = axialToPixel(position.q, position.r, HEX_SIZE);
  ctx.fillStyle = '#d98a5f';
  ctx.beginPath();
  ctx.arc(x, y, HEX_SIZE * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b1a12';
  ctx.lineWidth = 2;
  ctx.stroke();
}
