/**
 * debug/index.js - Debug overlay toggles and state
 * Isolated from core/render logic; main.js opts-in explicitly.
 */

let debugPlayerOverlay = false;

/**
 * Register debug hotkeys.
 * @param {Window} win
 */
export function registerDebugHotkeys(win) {
  if (!win || !win.addEventListener) return;
  win.addEventListener('keydown', (e) => {
    if (e.key !== '`') return;
    debugPlayerOverlay = !debugPlayerOverlay;
  });
}

/**
 * Get current debug overlay state for render.
 * @returns {{ debugPlayer: boolean }}
 */
export function getDebugOverlay() {
  return { debugPlayer: debugPlayerOverlay };
}
