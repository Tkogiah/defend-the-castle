/**
 * grid.js - Hex grid rendering
 * Draws the hex grid with spiral gradient coloring.
 */

import { ringIndex, generateRadialSpiralAxial, hexKey, getDirectionFromDelta } from '../hex/index.js';
import { HEX_SIZE, BOARD_RADIUS } from '../config/index.js';
import { axialToPixel } from './util.js';

const HUE_RANGE = 360;
const SPIRAL = generateRadialSpiralAxial(BOARD_RADIUS);

const PATH_TILE_IMAGE = new Image();
PATH_TILE_IMAGE.src = './assets/tiles/path_tiles.png';
const PATH_TILE_SIZE = 56;
const PATH_TILE_COUNT = 12;
const PATH_TILE_INDEX = {
  'W-SW': 0,
  'W-NE': 1,
  'NW-E': 2,
  'NE-SE': 3,
  'E-SW': 4,
  'W-E': 5,
  'W-SE': 6,
  'NW-SW': 7,
  'NE-SW': 8,
  'NW-SE': 9,
  'E': 10,
  'W': 11,
};
const DIR_ORDER = ['W', 'NW', 'NE', 'E', 'SE', 'SW'];
const DIR_INDEX = DIR_ORDER.reduce((acc, dir, idx) => {
  acc[dir] = idx;
  return acc;
}, {});
const OPPOSITE_DIR = { E: 'W', W: 'E', NE: 'SW', SW: 'NE', NW: 'SE', SE: 'NW' };

// Cached sorted hex draw order (computed once, reused every frame)
let sortedHexCache = null;

/**
 * Build and cache the sorted hex draw order (back-to-front by screen Y, then X).
 */
function getSortedHexes(hexGrid) {
  if (sortedHexCache) return sortedHexCache;
  const entries = [];
  for (const hex of hexGrid.values()) {
    const { x, y } = axialToPixel(hex.q, hex.r, HEX_SIZE);
    const ring = ringIndex(hex.q, hex.r);
    entries.push({ hex, x, y, ring });
  }
  entries.sort((a, b) => a.y - b.y || a.x - b.x);
  sortedHexCache = entries;
  return entries;
}

function orderPair(a, b) {
  if (DIR_INDEX[a] <= DIR_INDEX[b]) return `${a}-${b}`;
  return `${b}-${a}`;
}

function getPathTileKey(label) {
  if (!Number.isInteger(label)) return null;
  if (label === 0) return 'E';
  if (label === SPIRAL.maxLabel) return 'W';

  const prev = SPIRAL.numToAxial.get(label - 1);
  const next = SPIRAL.numToAxial.get(label + 1);
  if (!prev || !next) return null;

  const cur = SPIRAL.numToAxial.get(label);
  if (!cur) return null;

  const prevDir = getDirectionFromDelta(cur.q - prev.q, cur.r - prev.r);
  const nextDir = getDirectionFromDelta(next.q - cur.q, next.r - cur.r);
  const inDir = prevDir ? OPPOSITE_DIR[prevDir] : null;
  const outDir = nextDir || null;
  if (!inDir || !outDir) return null;

  return orderPair(inDir, outDir);
}

/**
 * Draw the hex grid with spiral gradient fill (back-to-front).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Map} hexGrid - map of hex data
 */
export function drawGrid(ctx, hexGrid, options = {}) {
  const { showBorders = true } = options;
  const sorted = getSortedHexes(hexGrid);
  for (const { hex, x, y, ring } of sorted) {
    const stroke = ring === 0 ? '#d9b86c' : ring === BOARD_RADIUS ? '#3e6b5b' : '#2e4b42';
    const label = SPIRAL.axialToNum.get(hexKey(hex.q, hex.r));
    const color = typeof label === 'number'
      ? hslToHex((label / SPIRAL.maxLabel) * HUE_RANGE, 80, 55)
      : null;
    const fill = color ? withAlpha(shadeByRing(color, ring), 0.3) : null;
    drawHex(ctx, x, y, HEX_SIZE, stroke, fill, showBorders);

    if (PATH_TILE_IMAGE.complete && typeof label === 'number') {
      const key = getPathTileKey(label);
      const index = key ? PATH_TILE_INDEX[key] : null;
      if (Number.isInteger(index) && index >= 0 && index < PATH_TILE_COUNT) {
        const sx = index * PATH_TILE_SIZE;
        ctx.drawImage(
          PATH_TILE_IMAGE,
          sx,
          0,
          PATH_TILE_SIZE,
          PATH_TILE_SIZE,
          x - PATH_TILE_SIZE / 2,
          y - PATH_TILE_SIZE / 2,
          PATH_TILE_SIZE,
          PATH_TILE_SIZE
        );
      }
    }
  }
}

/**
 * Draw a single hex at the given pixel coordinates with isometric lighting.
 * Light source is top-left; creates gradient from light (top-left) to shadow (bottom-right).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - center x in pixels
 * @param {number} y - center y in pixels
 * @param {number} size - hex size
 * @param {string} strokeStyle - stroke color
 * @param {string|null} fillStyle - base fill color (optional)
 */
function drawHex(ctx, x, y, size, strokeStyle, fillStyle, showBorders) {
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
    // Create gradient from top-left to bottom-right for isometric lighting
    const gradient = ctx.createLinearGradient(
      x - size * 0.7, y - size * 0.7,  // Top-left (light)
      x + size * 0.7, y + size * 0.7   // Bottom-right (shadow)
    );
    // Parse base color and create light/shadow variants
    const { lightColor, shadowColor } = getLightingShadowColors(fillStyle);
    gradient.addColorStop(0, lightColor);
    gradient.addColorStop(0.5, fillStyle);
    gradient.addColorStop(1, shadowColor);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  if (showBorders) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/**
 * Generate light and shadow color variants for isometric lighting effect.
 * @param {string} baseColor - rgba or hex color string
 * @returns {{ lightColor: string, shadowColor: string }}
 */
function getLightingShadowColors(baseColor) {
  // Parse rgba format: rgba(r, g, b, a)
  const rgbaMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;

    // Light: brighten by 25%
    const lr = Math.min(255, Math.round(r + (255 - r) * 0.25));
    const lg = Math.min(255, Math.round(g + (255 - g) * 0.25));
    const lb = Math.min(255, Math.round(b + (255 - b) * 0.25));

    // Shadow: darken by 30%
    const sr = Math.round(r * 0.7);
    const sg = Math.round(g * 0.7);
    const sb = Math.round(b * 0.7);

    return {
      lightColor: `rgba(${lr}, ${lg}, ${lb}, ${a})`,
      shadowColor: `rgba(${sr}, ${sg}, ${sb}, ${a})`,
    };
  }

  // Fallback for hex colors (shouldn't happen with current code path)
  return { lightColor: baseColor, shadowColor: baseColor };
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
