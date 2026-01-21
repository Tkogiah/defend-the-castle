/**
 * input.js - Camera controls (pan + zoom)
 * Input handling only - no game logic.
 */

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_SENSITIVITY = 0.001;
const PINCH_SENSITIVITY = 0.01;

export function setupInputControls(canvas, view) {
  let isDragging = false;
  let lastPointerX = 0;
  let lastPointerY = 0;

  // Track active touches for pinch-zoom
  const activeTouches = new Map();
  let lastPinchDist = 0;

  // --- Pointer events for pan (mouse + single touch) ---
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') {
      activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activeTouches.size === 1) {
        isDragging = true;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
      } else if (activeTouches.size === 2) {
        isDragging = false;
        lastPinchDist = getPinchDistance();
      }
    } else {
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    }
    canvas.setPointerCapture?.(e.pointerId);
  });

  canvas.addEventListener('pointermove', (e) => {
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
        view.panX += dx;
        view.panY += dy;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
      }
    } else if (isDragging) {
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      view.panX += dx;
      view.panY += dy;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    }
  });

  canvas.addEventListener('pointerup', (e) => {
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
      } else if (activeTouches.size === 0) {
        isDragging = false;
      }
    } else {
      isDragging = false;
    }
    canvas.releasePointerCapture?.(e.pointerId);
  });

  canvas.addEventListener('pointercancel', (e) => {
    activeTouches.delete(e.pointerId);
    isDragging = false;
    lastPinchDist = 0;
    canvas.releasePointerCapture?.(e.pointerId);
  });

  // --- Wheel zoom ---
  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      const rect = canvas.getBoundingClientRect();
      const center = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      applyZoom(delta, center);
    },
    { passive: false }
  );

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
}
