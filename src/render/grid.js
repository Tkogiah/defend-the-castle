/**
 * grid.js - Hex grid rendering
 * Draws the hex grid with spiral gradient coloring.
 */

import { ringIndex, generateRadialSpiralAxial, hexKey } from '../hex/index.js';
import { HEX_SIZE, BOARD_RADIUS } from '../config/index.js';
import { axialToPixel } from './util.js';

const HUE_RANGE = 360;
const SPIRAL = generateRadialSpiralAxial(BOARD_RADIUS);

/**
 * Draw the hex grid with spiral gradient fill.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Map} hexGrid - map of hex data
 */
export function drawGrid(ctx, hexGrid) {
  for (const hex of hexGrid.values()) {
    const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
    const ring = ringIndex(hex.q, hex.r);
    const stroke = ring === 0 ? '#d9b86c' : ring === BOARD_RADIUS ? '#3e6b5b' : '#2e4b42';
    const label = SPIRAL.axialToNum.get(hexKey(hex.q, hex.r));
    const color = typeof label === 'number'
      ? hslToHex((label / SPIRAL.maxLabel) * HUE_RANGE, 80, 55)
      : null;
    const fill = color ? withAlpha(shadeByRing(color, ring), 0.3) : null;
    drawHex(ctx, x, y, HEX_SIZE, stroke, fill);
  }
}

/**
 * Draw a single hex at the given pixel coordinates.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - center x in pixels
 * @param {number} y - center y in pixels
 * @param {number} size - hex size
 * @param {string} strokeStyle - stroke color
 * @param {string|null} fillStyle - fill color (optional)
 */
function drawHex(ctx, x, y, size, strokeStyle, fillStyle) {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    // Pointy-top hexes start at 30 degrees
    const angle = (Math.PI / 180) * (60 * i + 30);
    corners.push({
      x: x + size * Math.cos(angle),
      y: y + size * Math.sin(angle),
    });
  }

  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < corners.length; i++) {
    ctx.lineTo(corners[i].x, corners[i].y);
  }
  ctx.closePath();

  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 1;
  ctx.stroke();
}

// --- Color utilities ---

function withAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shadeByRing(hex, ring) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const factor = Math.max(0.55, 1 - ring * 0.08);
  const nr = Math.round(r * factor);
  const ng = Math.round(g * factor);
  const nb = Math.round(b * factor);
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
}

function toHex(value) {
  return value.toString(16).padStart(2, '0');
}

function hslToHex(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const nr = Math.round((r + m) * 255);
  const ng = Math.round((g + m) * 255);
  const nb = Math.round((b + m) * 255);
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
}
