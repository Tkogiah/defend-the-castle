/**
 * overlays.js - Range overlay rendering
 * Draws movement range and attack range indicators.
 */

import { HEX_SIZE } from '../config/index.js';
import { getSpiralLabel, getSpiralAxial, getHexesInRange, getNeighbors } from '../hex/index.js';
import { axialToPixel } from './util.js';

/**
 * Compute valid movement positions along the spiral path.
 * Includes both forward (increasing label) and backward (decreasing label).
 * Stops at enemy-occupied hexes (does not include or go beyond them).
 * Excludes the player's current position.
 *
 * @param {{ q: number, r: number }} playerPos - player's current position
 * @param {number} movementPoints - available movement points
 * @param {Array<{ position: { q: number, r: number } }>} enemies - enemy list
 * @returns {Array<{ q: number, r: number }>} reachable positions
 */
export function getMovementRange(playerPos, movementPoints, enemies) {
  const positions = [];
  const currentLabel = getSpiralLabel(playerPos.q, playerPos.r);
  if (currentLabel === null || movementPoints <= 0) return positions;

  // Build set of enemy-occupied hex keys for fast lookup
  const enemyHexes = new Set();
  for (const enemy of enemies) {
    if (enemy && enemy.position) {
      enemyHexes.add(`${enemy.position.q},${enemy.position.r}`);
    }
  }

  // Forward direction (increasing label, toward outer edge)
  for (let i = 1; i <= movementPoints; i++) {
    const label = currentLabel + i;
    if (label > 90) break; // Max spiral label
    const pos = getSpiralAxial(label);
    if (!pos) break;
    const key = `${pos.q},${pos.r}`;
    if (enemyHexes.has(key)) break; // Stop at enemy
    positions.push(pos);
  }

  // Backward direction (decreasing label, toward center)
  for (let i = 1; i <= movementPoints; i++) {
    const label = currentLabel - i;
    if (label < 0) break; // Min spiral label
    const pos = getSpiralAxial(label);
    if (!pos) break;
    const key = `${pos.q},${pos.r}`;
    if (enemyHexes.has(key)) break; // Stop at enemy
    positions.push(pos);
  }

  return positions;
}

/**
 * Draw movement range overlay (blue semi-transparent hex fills).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{ q: number, r: number }>} positions - reachable positions
 */
export function drawMovementRange(ctx, positions) {
  ctx.fillStyle = 'rgba(100, 149, 237, 0.35)'; // Cornflower blue, semi-transparent

  for (const pos of positions) {
    const { x, y } = axialToPixel(pos.q, pos.r, HEX_SIZE);
    drawHexFill(ctx, x, y, HEX_SIZE);
  }
}

/**
 * Draw attack range overlay (green outline on hexes within player's range).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Map} hexGrid - the hex grid
 * @param {{ q: number, r: number }} playerPos - player's current position
 * @param {number} range - player's attack range
 */
export function drawAttackRange(ctx, hexGrid, playerPos, range) {
  const hexesInRange = getHexesInRange(hexGrid, playerPos.q, playerPos.r, range);

  ctx.strokeStyle = 'rgba(50, 205, 50, 0.7)'; // Lime green
  ctx.lineWidth = 2;

  for (const hex of hexesInRange) {
    // Skip the player's own hex
    if (hex.q === playerPos.q && hex.r === playerPos.r) continue;
    const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
    drawHexOutline(ctx, x, y, HEX_SIZE);
  }
}

/**
 * Draw fireball targeting overlay (red outline on hexes within range).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Map} hexGrid - the hex grid
 * @param {{ q: number, r: number }} centerPos - center hex
 * @param {number} range - fireball range
 */
export function drawFireballRange(ctx, hexGrid, centerPos, range) {
  const hexesInRange = getHexesInRange(hexGrid, centerPos.q, centerPos.r, range);

  ctx.strokeStyle = 'rgba(220, 60, 60, 0.7)'; // Fireball red
  ctx.lineWidth = 2;

  for (const hex of hexesInRange) {
    const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
    drawHexOutline(ctx, x, y, HEX_SIZE);
  }
}

/**
 * Draw dragon mount targeting overlay (purple mesh for adjacent hexes).
 * Only shows valid hexes (on board, not occupied by enemies).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Map} hexGrid - the hex grid
 * @param {{ q: number, r: number }} playerPos - player's current position
 * @param {Array<{ position: { q: number, r: number } }>} enemies - enemy list
 */
export function drawDragonRange(ctx, hexGrid, playerPos, enemies) {
  const neighbors = getNeighbors(playerPos.q, playerPos.r);

  // Build set of enemy-occupied hex keys
  const enemyHexes = new Set();
  for (const enemy of enemies) {
    if (enemy && enemy.position) {
      enemyHexes.add(`${enemy.position.q},${enemy.position.r}`);
    }
  }

  ctx.fillStyle = 'rgba(160, 80, 200, 0.35)'; // Purple, semi-transparent
  ctx.strokeStyle = 'rgba(180, 100, 220, 0.8)'; // Purple outline
  ctx.lineWidth = 2;

  for (const hex of neighbors) {
    const key = `${hex.q},${hex.r}`;
    // Skip if not on board or occupied by enemy
    if (!hexGrid.has(key)) continue;
    if (enemyHexes.has(key)) continue;

    const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
    drawHexFill(ctx, x, y, HEX_SIZE);
    drawHexOutline(ctx, x, y, HEX_SIZE);
  }
}

/**
 * Draw a filled hex at the given pixel coordinates.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - center x
 * @param {number} y - center y
 * @param {number} size - hex size
 */
function drawHexFill(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i + 30);
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw a hex outline at the given pixel coordinates.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - center x
 * @param {number} y - center y
 * @param {number} size - hex size
 */
function drawHexOutline(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i + 30);
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.stroke();
}
