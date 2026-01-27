/**
 * input/index.js - Public API for input module
 * Wires together camera and movement controls.
 */

import { setupCameraControls } from './camera.js';
import { setupMovementControls, screenToHex } from './movement.js';

// Re-export utility
export { screenToHex };

/**
 * Set up input controls for camera and movement.
 * Returns a cleanup function to remove all event listeners.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ panX: number, panY: number, zoom: number }} view - mutable view state
 * @param {Object} [options={}] - configuration and callbacks
 * @param {number} [options.hexSize] - hex size in pixels (should match render)
 * @param {number} [options.boardRadius] - board radius for bounds filtering
 * @param {function({ q: number, r: number }): void} [options.onMoveToHex] - click-to-move callback
 * @param {function('N'|'NE'|'E'|'SE'|'S'|'SW'|'W'|'NW'): void} [options.onMoveDirection] - keyboard direction callback
 * @param {function({ q: number, r: number } | null): void} [options.onHoverHex] - hover callback
 * @returns {function(): void} cleanup function to remove listeners
 */
export function setupInputControls(canvas, view, options = {}) {
  const { hexSize, boardRadius, onMoveToHex, onMoveDirection, onHoverHex } = options;

  // Set up camera controls (pan/zoom)
  const camera = setupCameraControls(canvas, view);

  // Set up movement controls (click-to-move, keyboard directions, hover)
  const movementCleanup = setupMovementControls(canvas, view, {
    hexSize,
    boardRadius,
    onMoveToHex,
    onMoveDirection,
    onHoverHex,
    hasMoved: camera.hasMoved,
  });

  // Return combined cleanup function
  return function cleanup() {
    camera.cleanup();
    movementCleanup();
  };
}
