/**
 * input.js - Camera controls (pan + zoom) + movement input
 * Input handling only - no game logic.
 *
 * Movement input emits intents via callbacks:
 * - onMoveToHex({ q, r }): click-to-move to target hex
 * - onMoveDirection('N'|'NE'|'E'|'SE'|'S'|'SW'|'W'|'NW'): keyboard directional movement
 */

import { HEX_SIZE, BOARD_RADIUS } from './config.js';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_SENSITIVITY = 0.001;
const PINCH_SENSITIVITY = 0.01;

const SQRT_3 = Math.sqrt(3);

// Movement threshold to distinguish click from drag (in CSS pixels)
const CLICK_THRESHOLD = 5;

/**
 * Compute axial distance from a hex to center (0,0).
 * Used for input-layer bounds filtering.
 * @param {number} q
 * @param {number} r
 * @returns {number}
 */
function axialDistanceToCenter(q, r) {
  // distance = (|q| + |q + r| + |r|) / 2
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
  // Reverse of axialToPixel for pointy-top hexes:
  // x = size * (sqrt(3) * q + (sqrt(3)/2) * r)
  // y = size * (1.5 * r)

  // Solve for fractional axial coordinates
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

  // Convert back to axial (q=x, r=z)
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
  // Reverse the render.js transform:
  // ctx.translate(cssWidth/2 + view.panX, cssHeight/2 + view.panY)
  // ctx.scale(view.zoom, view.zoom)
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
 * Set up input controls for camera and movement.
 * Returns a cleanup function to remove all event listeners.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ panX: number, panY: number, zoom: number }} view - mutable view state
 * @param {Object} [options={}] - configuration and callbacks
 * @param {number} [options.hexSize=HEX_SIZE] - hex size in pixels (should match render.js)
 * @param {number} [options.boardRadius=BOARD_RADIUS] - board radius for bounds filtering
 * @param {function({ q: number, r: number }): void} [options.onMoveToHex] - click-to-move callback
 * @param {function('N'|'NE'|'E'|'SE'|'S'|'SW'|'W'|'NW'): void} [options.onMoveDirection] - keyboard direction callback
 * @returns {function(): void} cleanup function to remove listeners
 */
export function setupInputControls(canvas, view, options = {}) {
  const {
    hexSize = HEX_SIZE,
    boardRadius = BOARD_RADIUS,
    onMoveToHex,
    onMoveDirection,
  } = options;

  let isDragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;

  // Track pointer start position to detect clicks vs drags
  let pointerStartX = 0;
  let pointerStartY = 0;
  let hasMoved = false;

  // Track active touches for pinch-zoom
  const activeTouches = new Map();
  let lastPinchDist = 0;

  // Track pressed movement keys for directional input
  const pressedKeys = new Set();
  let lastDirection = null;

  // --- Pointer event handlers ---

  function onPointerDown(e) {
    if (e.pointerType === 'touch') {
      activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activeTouches.size === 1) {
        isDragging = true;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        pointerStartX = e.clientX;
        pointerStartY = e.clientY;
        hasMoved = false;
      } else if (activeTouches.size === 2) {
        isDragging = false;
        hasMoved = true; // Pinch is not a click
        lastPinchDist = getPinchDistance();
      }
    } else {
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      hasMoved = false;
    }
    canvas.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (e.pointerType === 'touch') {
      activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activeTouches.size === 2) {
        const newDist = getPinchDistance();
        if (lastPinchDist > 0) {
          const delta = newDist - lastPinchDist;
          applyZoom(delta * PINCH_SENSITIVITY, getPinchCenter());
        }
        lastPinchDist = newDist;
      } else if (activeTouches.size === 1 && isDragging) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;

        // Check if we've moved beyond click threshold
        const totalDx = e.clientX - pointerStartX;
        const totalDy = e.clientY - pointerStartY;
        if (Math.abs(totalDx) > CLICK_THRESHOLD || Math.abs(totalDy) > CLICK_THRESHOLD) {
          hasMoved = true;
        }

        view.panX += dx;
        view.panY += dy;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
      }
    } else if (isDragging) {
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;

      // Check if we've moved beyond click threshold
      const totalDx = e.clientX - pointerStartX;
      const totalDy = e.clientY - pointerStartY;
      if (Math.abs(totalDx) > CLICK_THRESHOLD || Math.abs(totalDy) > CLICK_THRESHOLD) {
        hasMoved = true;
      }

      view.panX += dx;
      view.panY += dy;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    }
  }

  function onPointerUp(e) {
    if (e.pointerType === 'touch') {
      activeTouches.delete(e.pointerId);
      if (activeTouches.size < 2) {
        lastPinchDist = 0;
      }
      if (activeTouches.size === 1) {
        const remaining = activeTouches.values().next().value;
        isDragging = true;
        lastPointerX = remaining.x;
        lastPointerY = remaining.y;
        hasMoved = true; // Switching fingers is not a click
      } else if (activeTouches.size === 0) {
        // Check for click-to-move (touch)
        if (!hasMoved && onMoveToHex) {
          handleClickToMove(e);
        }
        isDragging = false;
      }
    } else {
      // Check for click-to-move (mouse)
      if (!hasMoved && onMoveToHex) {
        handleClickToMove(e);
      }
      isDragging = false;
    }
    canvas.releasePointerCapture?.(e.pointerId);
  }

  function onPointerCancel(e) {
    activeTouches.delete(e.pointerId);
    isDragging = false;
    hasMoved = false;
    lastPinchDist = 0;
    canvas.releasePointerCapture?.(e.pointerId);
  }

  /**
   * Handle click-to-move: convert screen coords to axial and emit intent.
   * Only emits if the clicked hex is within board bounds.
   */
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

  // --- Wheel zoom handler ---

  function onWheel(e) {
    e.preventDefault();
    const delta = -e.deltaY * ZOOM_SENSITIVITY;
    const rect = canvas.getBoundingClientRect();
    const center = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    applyZoom(delta, center);
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

      // Update last direction (may become null or change)
      const direction = computeDirection(pressedKeys);
      lastDirection = direction;
    }
  }

  // --- Helper functions ---

  function getPinchDistance() {
    if (activeTouches.size < 2) return 0;
    const touches = Array.from(activeTouches.values());
    const dx = touches[0].x - touches[1].x;
    const dy = touches[0].y - touches[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getPinchCenter() {
    if (activeTouches.size < 2) return { x: 0, y: 0 };
    const touches = Array.from(activeTouches.values());
    const rect = canvas.getBoundingClientRect();
    return {
      x: (touches[0].x + touches[1].x) / 2 - rect.left,
      y: (touches[0].y + touches[1].y) / 2 - rect.top,
    };
  }

  function applyZoom(delta, center) {
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    const worldX = (center.x - cssWidth / 2 - view.panX) / view.zoom;
    const worldY = (center.y - cssHeight / 2 - view.panY) / view.zoom;

    view.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom + delta));

    view.panX = center.x - cssWidth / 2 - worldX * view.zoom;
    view.panY = center.y - cssHeight / 2 - worldY * view.zoom;
  }

  // --- Attach listeners ---

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  if (onMoveDirection) {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }

  // --- Cleanup function ---

  return function cleanup() {
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerCancel);
    canvas.removeEventListener('wheel', onWheel);
    if (onMoveDirection) {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
  };
}
