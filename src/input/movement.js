/**
 * movement.js - Movement input handling
 * Handles click-to-move and keyboard directional intents.
 * No game logic; only emits movement intents via callbacks.
 */

import { HEX_SIZE, BOARD_RADIUS } from '../config/index.js';

const SQRT_3 = Math.sqrt(3);

/**
 * Compute axial distance from a hex to center (0,0).
 * Used for input-layer bounds filtering.
 * @param {number} q
 * @param {number} r
 * @returns {number}
 */
function axialDistanceToCenter(q, r) {
  return (Math.abs(q) + Math.abs(q + r) + Math.abs(r)) / 2;
}

/**
 * Convert pixel coordinates (in world space) to axial hex coordinates.
 * Uses cube coordinate rounding for accurate hex detection.
 * @param {number} px - x coordinate in world space
 * @param {number} py - y coordinate in world space
 * @param {number} hexSize - hex size in pixels
 * @returns {{ q: number, r: number }} axial coordinates
 */
function pixelToAxial(px, py, hexSize) {
  // Reverse of axialToPixel for pointy-top hexes
  const fracR = py / (hexSize * 1.5);
  const fracQ = px / (hexSize * SQRT_3) - fracR / 2;

  // Convert to cube coordinates for rounding (x=q, z=r, y=-q-r)
  const x = fracQ;
  const z = fracR;
  const y = -x - z;

  // Round cube coordinates
  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);

  // Fix rounding errors: adjust the coordinate with largest diff
  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return { q: rx, r: rz };
}

/**
 * Convert screen coordinates to world coordinates.
 * @param {number} screenX - x in CSS pixels relative to canvas
 * @param {number} screenY - y in CSS pixels relative to canvas
 * @param {number} canvasWidth - canvas CSS width
 * @param {number} canvasHeight - canvas CSS height
 * @param {{ panX: number, panY: number, zoom: number }} view - current view state
 * @returns {{ x: number, y: number }} world coordinates
 */
function screenToWorld(screenX, screenY, canvasWidth, canvasHeight, view) {
  const worldX = (screenX - canvasWidth / 2 - view.panX) / view.zoom;
  const worldY = (screenY - canvasHeight / 2 - view.panY) / view.zoom;
  return { x: worldX, y: worldY };
}

/**
 * Compute hex direction from currently pressed WASD keys.
 * Returns null if no valid direction is active.
 *
 * Mapping (pointy-top hex grid):
 *   E:  d only
 *   W:  a only
 *   NE: w + d
 *   NW: w + a
 *   SE: s + d
 *   SW: s + a
 *
 * @param {Set<string>} keys - currently pressed keys (lowercase)
 * @returns {'N'|'NE'|'E'|'SE'|'S'|'SW'|'W'|'NW'|null}
 */
function computeDirection(keys) {
  const w = keys.has('w');
  const a = keys.has('a');
  const s = keys.has('s');
  const d = keys.has('d');

  // Diagonals take priority when two keys are held
  if (w && d) return 'NE';
  if (w && a) return 'NW';
  if (s && d) return 'SE';
  if (s && a) return 'SW';

  // Single-key cardinals (N/S are "either diagonal" intents)
  if (w) return 'N';
  if (s) return 'S';
  if (d) return 'E';
  if (a) return 'W';

  return null;
}

/**
 * Set up movement input controls.
 * Returns a cleanup function to remove all event listeners.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ panX: number, panY: number, zoom: number }} view - view state for coordinate conversion
 * @param {Object} options - configuration and callbacks
 * @param {number} [options.hexSize=HEX_SIZE] - hex size in pixels
 * @param {number} [options.boardRadius=BOARD_RADIUS] - board radius for bounds filtering
 * @param {function({ q: number, r: number }): void} [options.onMoveToHex] - click-to-move callback
 * @param {function('N'|'NE'|'E'|'SE'|'S'|'SW'|'W'|'NW'): void} [options.onMoveDirection] - keyboard direction callback
 * @param {function(): boolean} options.hasMoved - function to check if camera has moved (for click detection)
 * @returns {function(): void} cleanup function to remove listeners
 */
export function setupMovementControls(canvas, view, options) {
  const {
    hexSize = HEX_SIZE,
    boardRadius = BOARD_RADIUS,
    onMoveToHex,
    onMoveDirection,
    hasMoved,
  } = options;

  // Track pressed movement keys for directional input
  const pressedKeys = new Set();
  let lastDirection = null;

  // --- Click-to-move handler ---

  function onPointerUp(e) {
    // Only handle click-to-move if camera didn't move (not a drag)
    if (!hasMoved() && onMoveToHex) {
      // Ignore touch if multiple fingers were involved
      if (e.pointerType === 'touch') {
        // Let camera.js handle touch complexity; we just check hasMoved
      }
      handleClickToMove(e);
    }
  }

  function handleClickToMove(e) {
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    const world = screenToWorld(screenX, screenY, cssWidth, cssHeight, view);
    const axial = pixelToAxial(world.x, world.y, hexSize);

    // Input-layer bounds filtering: ignore clicks outside the board
    if (axialDistanceToCenter(axial.q, axial.r) <= boardRadius) {
      onMoveToHex(axial);
    }
  }

  // --- Keyboard handlers for directional movement ---

  function onKeyDown(e) {
    // Ignore if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = e.key.toLowerCase();
    const mappedKey =
      key === 'arrowup' ? 'w'
      : key === 'arrowdown' ? 's'
      : key === 'arrowleft' ? 'a'
      : key === 'arrowright' ? 'd'
      : key;

    // Only track WASD (or arrow-mapped) keys
    if (mappedKey === 'w' || mappedKey === 'a' || mappedKey === 's' || mappedKey === 'd') {
      e.preventDefault();
      pressedKeys.add(mappedKey);

      // Edge-triggered: emit only when direction changes
      const direction = computeDirection(pressedKeys);
      if (direction && direction !== lastDirection && onMoveDirection) {
        lastDirection = direction;
        onMoveDirection(direction);
      }
    }
  }

  function onKeyUp(e) {
    const key = e.key.toLowerCase();
    const mappedKey =
      key === 'arrowup' ? 'w'
      : key === 'arrowdown' ? 's'
      : key === 'arrowleft' ? 'a'
      : key === 'arrowright' ? 'd'
      : key;

    if (mappedKey === 'w' || mappedKey === 'a' || mappedKey === 's' || mappedKey === 'd') {
      pressedKeys.delete(mappedKey);
      const direction = computeDirection(pressedKeys);
      lastDirection = direction;
    }
  }

  // --- Attach listeners ---

  if (onMoveToHex) {
    canvas.addEventListener('pointerup', onPointerUp);
  }

  if (onMoveDirection) {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }

  // --- Cleanup function ---

  return function cleanup() {
    if (onMoveToHex) {
      canvas.removeEventListener('pointerup', onPointerUp);
    }
    if (onMoveDirection) {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
  };
}
