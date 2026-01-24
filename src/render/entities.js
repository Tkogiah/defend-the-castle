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
 * Draw enemies at their positions with HP rings.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{ position: { q: number, r: number }, hp: number, maxHp: number }>} enemies
 */
export function drawEnemies(ctx, enemies) {
  if (!Array.isArray(enemies)) return;

  // Group enemies by hex, tracking first enemy for HP display
  const buckets = new Map();
  for (const enemy of enemies) {
    if (!enemy || !enemy.position) continue;
    const key = `${enemy.position.q},${enemy.position.r}`;
    const entry = buckets.get(key);
    if (entry) {
      entry.count += 1;
      entry.totalHp += enemy.hp;
      entry.totalMaxHp += enemy.maxHp;
    } else {
      buckets.set(key, {
        position: enemy.position,
        count: 1,
        totalHp: enemy.hp,
        totalMaxHp: enemy.maxHp,
      });
    }
  }

  for (const { position, count, totalHp, totalMaxHp } of buckets.values()) {
    const { x, y } = axialToPixel(position.q, position.r, HEX_SIZE);
    const radius = count > 1 ? HEX_SIZE * 0.36 : HEX_SIZE * 0.28;

    // Draw enemy body
    ctx.fillStyle = count > 1 ? '#d45163' : '#c24b5a';
    ctx.strokeStyle = '#2b0f14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw HP ring
    const hpRatio = totalMaxHp > 0 ? totalHp / totalMaxHp : 0;
    const ringRadius = radius + 4;
    const ringWidth = 3;

    // Background ring (dark)
    ctx.strokeStyle = '#3a1a1e';
    ctx.lineWidth = ringWidth;
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // HP ring (green to red gradient based on HP)
    if (hpRatio > 0) {
      const hue = hpRatio * 120; // 120 = green, 0 = red
      ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.lineWidth = ringWidth;
      ctx.beginPath();
      // Start from top (-PI/2), draw clockwise
      ctx.arc(x, y, ringRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
      ctx.stroke();
    }

    // Enemy count label
    if (count > 1) {
      ctx.fillStyle = '#1a0c0e';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(count), x, y);
    }
  }
}
