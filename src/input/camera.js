/**
 * camera.js - Camera controls (pan + zoom)
 * Handles pointer drag panning, wheel zoom, and pinch-zoom.
 * No game logic; only modifies view state.
 */

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_SENSITIVITY = 0.001;
const PINCH_SENSITIVITY = 0.01;

/**
 * Set up camera controls for pan and zoom.
 * Returns a cleanup function to remove all event listeners.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ panX: number, panY: number, zoom: number }} view - mutable view state
 * @returns {{ cleanup: function(): void, hasMoved: function(): boolean }}
 */
export function setupCameraControls(canvas, view) {
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
        handleDrag(e.clientX, e.clientY);
      }
    } else if (isDragging) {
      handleDrag(e.clientX, e.clientY);
    }
  }

  function handleDrag(clientX, clientY) {
    const dx = clientX - lastPointerX;
    const dy = clientY - lastPointerY;

    // Check if we've moved beyond click threshold
    const totalDx = clientX - pointerStartX;
    const totalDy = clientY - pointerStartY;
    if (Math.abs(totalDx) > CLICK_THRESHOLD || Math.abs(totalDy) > CLICK_THRESHOLD) {
      hasMoved = true;
    }

    view.panX += dx;
    view.panY += dy;
    lastPointerX = clientX;
    lastPointerY = clientY;
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
        isDragging = false;
      }
    } else {
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

  // --- Return control object ---

  return {
    cleanup() {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('wheel', onWheel);
    },
    hasMoved() {
      return hasMoved;
    },
  };
}

// Movement threshold to distinguish click from drag (in CSS pixels)
const CLICK_THRESHOLD = 5;
