/**
 * animation.js - Movement animation system
 * Handles smooth interpolation for player and enemy movement.
 * Includes within-hex drift for player and snap animations.
 * Render-only state; does not modify game logic.
 */

import { HEX_SIZE } from '../config/index.js';
import { axialToPixel } from './util.js';

// Animation timing constants
const PLAYER_SNAP_DURATION = 143;     // ms for snap to new hex center (≈70% speed)
const ENEMY_MOVE_DURATION = 120;      // ms per hex
const ENEMY_STAGGER_DELAY = 80;       // ms between enemy animation starts

// Player drift constants
const PLAYER_DRIFT_SPEED = HEX_SIZE * 3;  // pixels per second
const HEX_BOUNDARY_THRESHOLD = HEX_SIZE * 1;  // distance from center to trigger boundary

// Direction vectors for hex movement (pointy-top)
const DIRECTION_VECTORS = {
  E:  { x: 1, y: 0 },
  W:  { x: -1, y: 0 },
  NE: { x: 0.5, y: -0.866 },   // cos(30°), -sin(60°)
  NW: { x: -0.5, y: -0.866 },
  SE: { x: 0.5, y: 0.866 },
  SW: { x: -0.5, y: 0.866 },
  N:  { x: 0, y: -1 },
  S:  { x: 0, y: 1 },
};

// Internal time tracking
let lastFrameTime = null;

// Player drift state (within-hex movement)
let playerDrift = { x: 0, y: 0 };      // Offset from hex center in pixels
let playerHeldDirection = null;         // Currently held direction from input
let playerSnapAnim = null;              // { fromOffset, toHex, progress, duration, onComplete, completed, completedAt }

// Enemy animation state
let enemyAnims = new Map();  // Map<enemyId, { from, to, progress, duration }>
let enemyQueue = [];         // [{ enemyId, path: [hex, hex, ...], pathIndex }]
let enemyStaggerTimer = 0;
let enemyAnimCallback = null;
let nextEnemyIndex = 0;
let enemyFrozenPositions = new Map();   // Map<enemyId, { q, r }>
let enemyFrozenClearAt = null;

// Callback for when player crosses hex boundary
let onPlayerBoundaryCross = null;

/**
 * Set callback for when player crosses a hex boundary.
 * @param {function(direction: string): { valid: boolean, toHex?: { q, r } }} callback
 *   Returns { valid: true, toHex } if move is allowed, { valid: false } otherwise.
 */
export function setPlayerBoundaryCallback(callback) {
  onPlayerBoundaryCross = callback;
}

/**
 * Set the currently held direction from input.
 * Called each frame by the render loop.
 * @param {string|null} direction - 'E', 'W', 'NE', 'NW', 'SE', 'SW', or null
 */
export function setPlayerHeldDirection(direction) {
  playerHeldDirection = direction;
}

/**
 * Start player snap animation to a new hex.
 * Used when boundary is crossed.
 * @param {{ q: number, r: number }} toHex - target hex
 * @param {function(): void} [onComplete] - callback when snap finishes
 */
function startPlayerSnapAnimation(toHex, onComplete = null) {
  playerSnapAnim = {
    fromOffset: { ...playerDrift },
    toHex: { ...toHex },
    progress: 0,
    duration: PLAYER_SNAP_DURATION,
    onComplete,
    completed: false,
    completedAt: null,
  };
  // Reset drift since we're snapping to new hex
  playerDrift = { x: 0, y: 0 };
}

/**
 * Check if player is currently in a snap animation.
 * @returns {boolean}
 */
export function isAnimatingPlayer() {
  return playerSnapAnim !== null;
}

/**
 * Start enemy movement animations with staggered timing.
 * Each enemy animates step-by-step along their path.
 * @param {Array<{ enemyId: number|string, path: Array<{ q: number, r: number }> }>} moves
 *   Array of enemy moves. Each path is [startHex, ...intermediateHexes, endHex].
 * @param {function(): void} [onComplete] - callback when ALL enemies finish
 */
export function startEnemyAnimations(moves, onComplete = null) {
  if (moves.length === 0) {
    if (onComplete) onComplete();
    return;
  }

  // Reset enemy animation state
  enemyAnims.clear();
  enemyQueue = moves.map(m => ({
    enemyId: m.enemyId,
    path: m.path,
    pathIndex: 0,
  }));
  enemyStaggerTimer = 0;
  enemyAnimCallback = onComplete;
  nextEnemyIndex = 0;

  // Start first enemy immediately
  startNextEnemyHop(enemyQueue[0]);
}

/**
 * Start the next hop for an enemy in the queue.
 * @param {Object} entry - queue entry { enemyId, path, pathIndex }
 */
function startNextEnemyHop(entry) {
  if (entry.pathIndex >= entry.path.length - 1) return;

  const from = entry.path[entry.pathIndex];
  const to = entry.path[entry.pathIndex + 1];

  enemyAnims.set(entry.enemyId, {
    from: { ...from },
    to: { ...to },
    progress: 0,
    duration: ENEMY_MOVE_DURATION,
  });
}

/**
 * Update all animations. Call once per frame.
 * Uses internal time tracking (no deltaTime parameter needed).
 */
export function updateAnimations() {
  const now = performance.now();
  if (lastFrameTime === null) {
    lastFrameTime = now;
    return;
  }
  const deltaTime = now - lastFrameTime;
  lastFrameTime = now;

  if (enemyFrozenClearAt && now - enemyFrozenClearAt > 16) {
    enemyFrozenPositions.clear();
    enemyFrozenClearAt = null;
  }

  // Update player snap animation
  if (playerSnapAnim) {
    playerSnapAnim.progress += deltaTime / playerSnapAnim.duration;
    if (playerSnapAnim.progress >= 1) {
      playerSnapAnim.progress = 1;
      if (!playerSnapAnim.completed) {
        const callback = playerSnapAnim.onComplete;
        playerSnapAnim.completed = true;
        playerSnapAnim.completedAt = now;
        if (callback) callback();
      } else if (playerSnapAnim.completedAt && now - playerSnapAnim.completedAt > 16) {
        playerSnapAnim = null;
      }
    }
  } else {
    // Update player drift based on held direction
    updatePlayerDrift(deltaTime);
  }

  // Update enemy stagger timer and start new enemies
  if (enemyQueue.length > 0 && nextEnemyIndex < enemyQueue.length) {
    enemyStaggerTimer += deltaTime;
    while (
      nextEnemyIndex < enemyQueue.length &&
      enemyStaggerTimer >= ENEMY_STAGGER_DELAY
    ) {
      enemyStaggerTimer -= ENEMY_STAGGER_DELAY;
      nextEnemyIndex++;
      if (nextEnemyIndex < enemyQueue.length) {
        startNextEnemyHop(enemyQueue[nextEnemyIndex]);
      }
    }
  }

  // Update active enemy animations
  let allDone = true;
  for (const entry of enemyQueue) {
    const anim = enemyAnims.get(entry.enemyId);
    if (anim) {
      anim.progress += deltaTime / anim.duration;
      if (anim.progress >= 1) {
        anim.progress = 1;
        entry.pathIndex++;

        if (entry.pathIndex < entry.path.length - 1) {
          startNextEnemyHop(entry);
          allDone = false;
        } else {
          enemyAnims.delete(entry.enemyId);
          enemyFrozenPositions.set(entry.enemyId, { ...anim.to });
        }
      } else {
        allDone = false;
      }
    } else if (entry.pathIndex < entry.path.length - 1) {
      allDone = false;
    }
  }

  // Check if all enemies finished
  if (enemyQueue.length > 0 && allDone) {
    const callback = enemyAnimCallback;
    enemyQueue = [];
    enemyAnimCallback = null;
    nextEnemyIndex = 0;
    enemyFrozenClearAt = now;
    if (callback) callback();
  }
}

/**
 * Update player drift based on held direction.
 * @param {number} deltaTime - ms since last frame
 */
function updatePlayerDrift(deltaTime) {
  if (!playerHeldDirection) return;

  const vec = DIRECTION_VECTORS[playerHeldDirection];
  if (!vec) return;

  // Move drift in held direction
  const speed = PLAYER_DRIFT_SPEED * (deltaTime / 1000);
  const newX = playerDrift.x + vec.x * speed;
  const newY = playerDrift.y + vec.y * speed;

  // Check if crossing boundary
  const distFromCenter = Math.sqrt(newX * newX + newY * newY);

  if (distFromCenter >= HEX_BOUNDARY_THRESHOLD) {
    // Attempting to cross boundary
    if (onPlayerBoundaryCross) {
      const result = onPlayerBoundaryCross(playerHeldDirection);
      if (result.valid && result.toHex) {
        // Valid move - start snap animation
        startPlayerSnapAnimation(result.toHex, result.onComplete);
        return;
      }
    }
    // Invalid direction or no callback - block at boundary
    // Clamp to boundary
    const scale = (HEX_BOUNDARY_THRESHOLD - 1) / distFromCenter;
    playerDrift.x = newX * scale;
    playerDrift.y = newY * scale;
  } else {
    // Within hex, allow drift
    playerDrift.x = newX;
    playerDrift.y = newY;
  }
}

/**
 * Get the visual pixel position for the player.
 * Includes drift offset and snap animation.
 * @param {{ q: number, r: number }} logicalPos - logical hex position
 * @returns {{ x: number, y: number }} pixel position
 */
export function getPlayerVisualPosition(logicalPos) {
  const basePixel = axialToPixel(logicalPos.q, logicalPos.r, HEX_SIZE);

  if (playerSnapAnim) {
    // Animating snap to new hex
    const toPixel = axialToPixel(playerSnapAnim.toHex.q, playerSnapAnim.toHex.r, HEX_SIZE);
    const t = easeInOutQuad(playerSnapAnim.progress);

    // Interpolate from (base + fromOffset) to toPixel
    const fromX = basePixel.x + playerSnapAnim.fromOffset.x;
    const fromY = basePixel.y + playerSnapAnim.fromOffset.y;

    return {
      x: fromX + (toPixel.x - fromX) * t,
      y: fromY + (toPixel.y - fromY) * t,
    };
  }

  // Normal drift within hex
  return {
    x: basePixel.x + playerDrift.x,
    y: basePixel.y + playerDrift.y,
  };
}

/**
 * Get the visual pixel position for an enemy.
 * Returns final position when animation complete to avoid snap artifacts.
 * @param {{ q: number, r: number }} logicalPos - logical hex position
 * @param {number|string} enemyId - enemy identifier
 * @returns {{ x: number, y: number, isAnimating: boolean }} pixel position and animation state
 */
export function getEnemyVisualPosition(logicalPos, enemyId) {
  const anim = enemyAnims.get(enemyId);

  if (anim) {
    const fromPixel = axialToPixel(anim.from.q, anim.from.r, HEX_SIZE);
    const toPixel = axialToPixel(anim.to.q, anim.to.r, HEX_SIZE);
    const t = easeInOutQuad(Math.min(1, anim.progress));

    return {
      x: fromPixel.x + (toPixel.x - fromPixel.x) * t,
      y: fromPixel.y + (toPixel.y - fromPixel.y) * t,
      isAnimating: true,
    };
  }

  if (enemyFrozenPositions.has(enemyId)) {
    const frozen = enemyFrozenPositions.get(enemyId);
    const pixel = axialToPixel(frozen.q, frozen.r, HEX_SIZE);
    return { ...pixel, isAnimating: true };
  }

  // Not animating - use logical position
  const pixel = axialToPixel(logicalPos.q, logicalPos.r, HEX_SIZE);
  return { ...pixel, isAnimating: false };
}

/**
 * Check if any enemies are currently animating.
 * @returns {boolean}
 */
export function isAnimatingEnemies() {
  return enemyQueue.length > 0;
}

/**
 * Reset player drift to center (e.g., after teleport or state reset).
 */
export function resetPlayerDrift() {
  playerDrift = { x: 0, y: 0 };
}

/**
 * Easing function for smooth animation.
 * @param {number} t - progress 0 to 1
 * @returns {number} eased value
 */
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Legacy exports for compatibility (deprecated)
export function startPlayerAnimation(from, to, onComplete = null) {
  startPlayerSnapAnimation(to, onComplete);
}

export function getAnimatedPosition(logicalPos, entityType, entityId = null) {
  if (entityType === 'player') {
    return getPlayerVisualPosition(logicalPos);
  } else if (entityType === 'enemy' && entityId !== null) {
    const result = getEnemyVisualPosition(logicalPos, entityId);
    return { x: result.x, y: result.y };
  }
  return axialToPixel(logicalPos.q, logicalPos.r, HEX_SIZE);
}
