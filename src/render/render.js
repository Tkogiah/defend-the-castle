/**
 * render.js - Canvas rendering for hex grid and game entities
 * Pure rendering only - no DOM events or input handling.
 *
 * CHANGE LOG:
 * -----------
 * 2026-01-21: Center the Grid at Hex (0,0)
 *
 * Summary of changes:
 * - Simplified renderFrame centering logic. Since axialToPixel(0, 0) returns
 *   pixel (0, 0), translating to canvas center directly centers hex (0,0).
 * - Removed getGridBounds function (no longer needed).
 *
 * Files touched:
 * - /Users/tkogiah/ai-workspace/defend-the-castle/src/render.js
 *
 * Open questions:
 * - None.
 *
 * Risks / caveats:
 * - If pan/zoom behavior was relying on bounds-based centering for other
 *   purposes, that would need separate handling. Current implementation
 *   assumes pan starts at 0,0 and zoom centers on hex (0,0).
 *
 * Code removed:
 * -------------
 * function getGridBounds(hexGrid) {
 *   let minX = Infinity;
 *   let minY = Infinity;
 *   let maxX = -Infinity;
 *   let maxY = -Infinity;
 *
 *   for (const hex of hexGrid.values()) {
 *     const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
 *     minX = Math.min(minX, x - HEX_SIZE);
 *     minY = Math.min(minY, y - HEX_SIZE);
 *     maxX = Math.max(maxX, x + HEX_SIZE);
 *     maxY = Math.max(maxY, y + HEX_SIZE);
 *   }
 *
 *   return { minX, minY, maxX, maxY };
 * }
 *
 * Code before (renderFrame):
 * --------------------------
 * const gridBounds = getGridBounds(state.hexGrid);
 * const gridCenter = {
 *   x: (gridBounds.minX + gridBounds.maxX) / 2,
 *   y: (gridBounds.minY + gridBounds.maxY) / 2,
 * };
 * ctx.save();
 * ctx.translate(width / 2 + view.panX, height / 2 + view.panY);
 * ctx.scale(view.zoom, view.zoom);
 * ctx.translate(-gridCenter.x, -gridCenter.y);
 *
 * Code after (renderFrame):
 * -------------------------
 * ctx.save();
 * ctx.translate(width / 2 + view.panX, height / 2 + view.panY);
 * ctx.scale(view.zoom, view.zoom);
 */

import { ringIndex, generateRadialSpiralAxial, hexKey } from '../hex/index.js';
import { HEX_SIZE, BOARD_RADIUS } from '../config/index.js';

const SQRT_3 = Math.sqrt(3);
const HUE_RANGE = 360;
const SPIRAL = generateRadialSpiralAxial(BOARD_RADIUS);

export function renderFrame(ctx, canvas, state, view) {
  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width;
  const cssHeight = rect.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#121a17';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Center hex (0,0) at canvas center.
  // axialToPixel(0,0) returns (0,0), so translating to canvas center aligns it.
  ctx.save();
  ctx.translate(cssWidth / 2 + view.panX, cssHeight / 2 + view.panY);
  ctx.scale(view.zoom, view.zoom);

  drawGrid(ctx, state.hexGrid);
  drawPlayer(ctx, state.player.position);

  ctx.restore();
}

function drawGrid(ctx, hexGrid) {
  for (const hex of hexGrid.values()) {
    const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
    const ring = ringIndex(hex.q, hex.r);
    const stroke = ring === 0 ? '#d9b86c' : ring === 5 ? '#3e6b5b' : '#2e4b42';
    const label = SPIRAL.axialToNum.get(hexKey(hex.q, hex.r));
    const color = typeof label === 'number'
      ? hslToHex((label / SPIRAL.maxLabel) * HUE_RANGE, 80, 55)
      : null;
    const fill = color ? withAlpha(shadeByRing(color, ring), 0.3) : null;
    drawHex(ctx, x, y, HEX_SIZE, stroke, fill);
  }
}

function drawPlayer(ctx, position) {
  const { x, y } = axialToPixel(position.q, position.r, HEX_SIZE);
  ctx.fillStyle = '#d98a5f';
  ctx.beginPath();
  ctx.arc(x, y, HEX_SIZE * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b1a12';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function axialToPixel(q, r, size) {
  // Pointy-top axial to pixel (taller hexes)
  const x = size * (SQRT_3 * q + (SQRT_3 / 2) * r);
  const y = size * (1.5 * r);
  return { x, y };
}

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
