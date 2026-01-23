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

/**
 * Draw enemies at their positions.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{ position: { q: number, r: number } }>} enemies
 */
export function drawEnemies(ctx, enemies) {
  if (!Array.isArray(enemies)) return;
  const buckets = new Map();
  for (const enemy of enemies) {
    if (!enemy || !enemy.position) continue;
    const key = `${enemy.position.q},${enemy.position.r}`;
    const entry = buckets.get(key);
    if (entry) {
      entry.count += 1;
    } else {
      buckets.set(key, { position: enemy.position, count: 1 });
    }
  }

  for (const { position, count } of buckets.values()) {
    const { x, y } = axialToPixel(position.q, position.r, HEX_SIZE);
    const radius = count > 1 ? HEX_SIZE * 0.36 : HEX_SIZE * 0.28;
    ctx.fillStyle = count > 1 ? '#d45163' : '#c24b5a';
    ctx.strokeStyle = '#2b0f14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (count > 1) {
      ctx.fillStyle = '#1a0c0e';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(count), x, y);
    }
  }
}
