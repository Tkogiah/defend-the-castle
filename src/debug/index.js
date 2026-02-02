/**
 * debug/index.js - Debug overlay toggles and state
 * Isolated from core/render logic; main.js opts-in explicitly.
 */

let debugPlayerOverlay = false;
let hideGridBorders = false;

/**
 * Register debug hotkeys.
 * @param {Window} win
 */
export function registerDebugHotkeys(win) {
  if (!win || !win.addEventListener) return;
  win.addEventListener('keydown', (e) => {
    if (e.key !== '`') return;
    debugPlayerOverlay = !debugPlayerOverlay;
    hideGridBorders = !hideGridBorders;
  });
}

/**
 * Get current debug overlay state for render.
 * @returns {{ debugPlayer: boolean, hideGridBorders: boolean }}
 */
export function getDebugOverlay() {
  return { debugPlayer: debugPlayerOverlay, hideGridBorders };
}
