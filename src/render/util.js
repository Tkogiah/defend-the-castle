/**
 * util.js - Rendering utility functions
 * Shared helpers for coordinate conversion.
 */

const SQRT_3 = Math.sqrt(3);

/**
 * Convert axial hex coordinates to pixel coordinates.
 * Pointy-top orientation.
 * @param {number} q - axial q coordinate
 * @param {number} r - axial r coordinate
 * @param {number} size - hex size in pixels
 * @returns {{ x: number, y: number }} pixel coordinates
 */
export function axialToPixel(q, r, size) {
  const x = size * (SQRT_3 * q + (SQRT_3 / 2) * r);
  const y = size * (1.5 * r);
  return { x, y };
}
