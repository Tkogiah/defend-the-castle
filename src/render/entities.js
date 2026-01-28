/**
 * entities.js - Entity rendering
 * Draws player, enemies, and other game entities as 3D-ish cylinders.
 */

import { HEX_SIZE } from '../config/index.js';
import { axialToPixel } from './util.js';

// Cylinder height for 3D effect
const ENTITY_HEIGHT = HEX_SIZE * 0.65;

// Shadow parameters
const SHADOW_OFFSET_X = 3;
const SHADOW_OFFSET_Y = 5;
const SHADOW_ALPHA = 0.35;

/**
 * Draw the player at the given pixel position as a cylinder.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }} pixelPos - pixel coordinates
 */
export function drawPlayer(ctx, pixelPos) {
  const { x, y } = pixelPos;
  const radius = HEX_SIZE * 0.35;
  const baseColor = '#d98a5f';
  const strokeColor = '#2b1a12';

  drawCylinder(ctx, x, y, radius, ENTITY_HEIGHT, baseColor, strokeColor);
}

/**
 * Draw enemies at their positions with HP bars.
 * Supports animated positions via visualPosition property.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{ position: { q: number, r: number }, visualPosition?: { x: number, y: number }, hp: number, maxHp: number }>} enemies
 */
export function drawEnemies(ctx, enemies) {
  if (!Array.isArray(enemies)) return;

  const animatingEnemies = [];
  const staticEnemies = [];

  for (const enemy of enemies) {
    if (enemy && enemy.isAnimating) {
      animatingEnemies.push(enemy);
    } else {
      staticEnemies.push(enemy);
    }
  }

  // Draw animating enemies individually (no bucketing to avoid ghost artifacts)
  for (const enemy of animatingEnemies) {
    if (!enemy || !enemy.position) continue;
    const { x, y } = enemy.visualPosition
      ? enemy.visualPosition
      : axialToPixel(enemy.position.q, enemy.position.r, HEX_SIZE);
    const radius = enemy.isBoss ? HEX_SIZE * 0.5 : HEX_SIZE * 0.28;
    const baseColor = enemy.isBoss ? '#3a7bd5' : '#c24b5a';
    const strokeColor = enemy.isBoss ? '#0c1a33' : '#2b0f14';
    drawCylinder(ctx, x, y, radius, ENTITY_HEIGHT, baseColor, strokeColor);
  }

  // Group enemies by visual position for stacking display
  // Use rounded pixel coords as key to handle floating point during animation
  const buckets = new Map();
  for (const enemy of staticEnemies) {
    if (!enemy || !enemy.position) continue;

    // Use visualPosition if provided, otherwise compute from logical position
    const { x, y } = enemy.visualPosition
      ? enemy.visualPosition
      : axialToPixel(enemy.position.q, enemy.position.r, HEX_SIZE);

    // Round to nearest pixel for bucketing (avoids float key issues)
    const key = `${Math.round(x)},${Math.round(y)}`;
    const entry = buckets.get(key);
    if (entry) {
      entry.count += 1;
      entry.totalHp += enemy.hp;
      entry.totalMaxHp += enemy.maxHp;
      entry.isBoss = entry.isBoss || !!enemy.isBoss;
    } else {
      buckets.set(key, {
        x,
        y,
        count: 1,
        totalHp: enemy.hp,
        totalMaxHp: enemy.maxHp,
        isBoss: !!enemy.isBoss,
      });
    }
  }

  for (const { x, y, count, totalHp, totalMaxHp, isBoss } of buckets.values()) {
    const radius = isBoss ? HEX_SIZE * 0.5 : count > 1 ? HEX_SIZE * 0.36 : HEX_SIZE * 0.28;
    const baseColor = isBoss ? '#3a7bd5' : count > 1 ? '#d45163' : '#c24b5a';
    const strokeColor = isBoss ? '#0c1a33' : '#2b0f14';

    // Draw enemy cylinder
    drawCylinder(ctx, x, y, radius, ENTITY_HEIGHT, baseColor, strokeColor);

    // Draw HP bar above the top of the cylinder
    const topY = y - ENTITY_HEIGHT;
    const hpRatio = totalMaxHp > 0 ? totalHp / totalMaxHp : 0;
    const barWidth = radius * 2;
    const barHeight = 4;
    const barX = x - barWidth / 2;
    const barY = topY - radius * 0.95;

    // Background bar (dark)
    ctx.fillStyle = '#3a1a1e';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // HP bar (green to red gradient based on HP)
    if (hpRatio > 0) {
      const hue = hpRatio * 120; // 120 = green, 0 = red
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(barX, barY, barWidth * Math.max(0, Math.min(1, hpRatio)), barHeight);
    }

    // Enemy count label on side (centered on body)
    if (count > 1 && !isBoss) {
      ctx.fillStyle = '#1a0c0e';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelX = x;
      const labelY = topY + ENTITY_HEIGHT * 0.7;
      ctx.fillText(String(count), labelX, labelY);
    }
  }
}

/**
 * Draw a cylinder with top-left lighting and drop shadow.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - center x position
 * @param {number} y - base y position (bottom of cylinder)
 * @param {number} radius - cylinder radius
 * @param {number} height - cylinder height
 * @param {string} baseColor - base fill color (hex format)
 * @param {string} strokeColor - stroke color
 */
function drawCylinder(ctx, x, y, radius, height, baseColor, strokeColor) {
  const topY = y - height;
  const { light, dark } = getEntityLightDark(baseColor);

  // --- Drop shadow ---
  ctx.fillStyle = `rgba(0, 0, 0, ${SHADOW_ALPHA})`;
  ctx.beginPath();
  ctx.ellipse(
    x + SHADOW_OFFSET_X,
    y + SHADOW_OFFSET_Y,
    radius * 1.1,
    radius * 0.4,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // --- Cylinder body (rect with left-right gradient) ---
  const bodyGradient = ctx.createLinearGradient(x - radius, 0, x + radius, 0);
  bodyGradient.addColorStop(0, light);       // Left edge (lit)
  bodyGradient.addColorStop(0.4, baseColor); // Center-left
  bodyGradient.addColorStop(1, dark);        // Right edge (shadow)

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.rect(x - radius, topY, radius * 2, height);
  ctx.fill();

  // Body side strokes (left and right edges only)
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - radius, topY);
  ctx.lineTo(x - radius, y);
  ctx.moveTo(x + radius, topY);
  ctx.lineTo(x + radius, y);
  ctx.stroke();

  // --- Bottom ellipse (visible portion behind body) ---
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 0.35, 0, 0, Math.PI); // Bottom half only
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y, radius, radius * 0.35, 0, 0, Math.PI);
  ctx.stroke();

  // --- Top ellipse (cap) ---
  // Slightly lighter for top-left lighting effect
  const topGradient = ctx.createLinearGradient(x - radius, topY - radius * 0.35, x + radius, topY + radius * 0.35);
  topGradient.addColorStop(0, light);
  topGradient.addColorStop(0.6, baseColor);
  topGradient.addColorStop(1, dark);

  ctx.fillStyle = topGradient;
  ctx.beginPath();
  ctx.ellipse(x, topY, radius, radius * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Generate light and dark color variants for entity lighting.
 * @param {string} hex - hex color string (#RRGGBB)
 * @returns {{ light: string, dark: string }}
 */
function getEntityLightDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Light: brighten by 30%
  const lr = Math.min(255, Math.round(r + (255 - r) * 0.3));
  const lg = Math.min(255, Math.round(g + (255 - g) * 0.3));
  const lb = Math.min(255, Math.round(b + (255 - b) * 0.3));

  // Dark: darken by 35%
  const dr = Math.round(r * 0.65);
  const dg = Math.round(g * 0.65);
  const db = Math.round(b * 0.65);

  const toHex = (v) => v.toString(16).padStart(2, '0');

  return {
    light: `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`,
    dark: `#${toHex(dr)}${toHex(dg)}${toHex(db)}`,
  };
}
