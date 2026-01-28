/**
 * ui/index.js - UI overlay interactions
 * Handles drawer toggle, card selection, drag-to-play, and character sheet.
 * Wired to game state via state-changed events.
 */

import { renderHand, getCardData, subscribeToState } from './hand.js';

// -----------------------------
// DOM Elements
// -----------------------------

const drawer = document.getElementById('hand-drawer');
const btnHand = document.getElementById('btn-hand');
const cardDetail = document.getElementById('card-detail');
const uiBackdrop = document.getElementById('ui-backdrop');
const merchantBackdrop = document.getElementById('merchant-backdrop');
const characterSheet = document.getElementById('character-sheet');
const btnCharacter = document.getElementById('btn-character');
const btnCloseSheet = document.getElementById('btn-close-sheet');
const btnEndTurn = document.getElementById('btn-end-turn');
const btnFireball = document.getElementById('btn-fireball');
const btnDragon = document.getElementById('btn-dragon');
const handCards = document.getElementById('hand-cards');
const dropZone = document.getElementById('play-card-zone');
const dropZoneTitle = dropZone?.querySelector('.drop-zone-title');
const dropZoneDesc = dropZone?.querySelector('.drop-zone-desc');
const gameCanvas = document.getElementById('game-canvas');
const statGold = document.getElementById('stat-gold');
const statDamage = document.getElementById('stat-damage');
const statRange = document.getElementById('stat-range');
const statMovement = document.getElementById('stat-movement');

// Merchant elements
const merchantPanel = document.getElementById('merchant-panel');
const merchantDropZone = document.getElementById('merchant-drop');
const merchantGoldDisplay = document.getElementById('merchant-gold-value');
const merchantGrid = document.getElementById('merchant-grid');
const btnMerchant = document.getElementById('btn-merchant');
const btnCloseMerchant = document.getElementById('btn-close-merchant');

// Gear elements
const gearSlotsContainer = document.getElementById('gear-slots');
const inventoryList = document.getElementById('inventory-list');

// -----------------------------
// State
// -----------------------------

let selectedCard = null;
let draggedCard = null;
let pendingDragCard = null;
let draggedMerchantSlot = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragStartX = 0;
let dragStartY = 0;
const DRAG_THRESHOLD_PX = 6;
const actionModeByCardId = new Map();
let merchantOpen = false;
let currentPlayerRing = null;
let currentPlayerGold = 0;
let currentShopPiles = [];
let dragonEquipped = false;
let dragonUsedThisTurn = false;
let fireballEquipped = false;
let fireballUsedThisTurn = false;

// -----------------------------
// Stat Display Helpers
// -----------------------------

/**
 * Check if player has a specific gear equipped.
 * @param {Object} equipped - player.equipped object
 * @param {string} gearId - gear ID to check
 * @returns {boolean}
 */
function hasEquipped(equipped, gearId) {
  if (!equipped) return false;
  return Object.values(equipped).some(g => g?.id === gearId);
}

/**
 * Get effective damage for display (base * gear modifiers).
 * @param {Object} state - game state
 * @returns {number}
 */
function getEffectiveDisplayDamage(state) {
  let damage = state.player.baseDamage;
  if (hasEquipped(state.player.equipped, 'power_glove')) {
    damage *= 2;
  }
  return damage;
}

/**
 * Get effective speed for display (base * gear modifiers).
 * @param {Object} state - game state
 * @returns {number}
 */
function getEffectiveDisplaySpeed(state) {
  let speed = state.player.baseMovement;
  if (hasEquipped(state.player.equipped, 'boots_of_speed')) {
    speed *= 2;
  }
  return speed;
}

// -----------------------------
// Drawer Toggle
// -----------------------------

function closeHandDrawer() {
  drawer.classList.add('collapsed');
  cardDetail.classList.add('hidden');
  if (dropZoneTitle) dropZoneTitle.textContent = '';
  if (dropZoneDesc) dropZoneDesc.textContent = '';
  updateAbilityButtonsVisibility();
}

function openHandDrawer() {
  drawer.classList.remove('collapsed');
  updateAbilityButtonsVisibility();
}

function closeCharacterSheet() {
  if (!document.body.classList.contains('merchant-open')) {
    uiBackdrop?.classList.add('hidden');
  }
  characterSheet.classList.add('hidden');
  document.body.classList.remove('sheet-open');
  updateAbilityButtonsVisibility();
}

function openCharacterSheet() {
  uiBackdrop?.classList.remove('hidden');
  characterSheet.classList.remove('hidden');
  document.body.classList.add('sheet-open');
  updateAbilityButtonsVisibility();
}

btnHand?.addEventListener('click', () => {
  closeCharacterSheet();
  if (drawer.classList.contains('collapsed')) {
    openHandDrawer();
  } else {
    closeHandDrawer();
  }
});

// -----------------------------
// Card Selection
// -----------------------------

handCards.addEventListener('click', (e) => {
  const slot = e.target.closest('.card-slot');
  if (!slot) return;

  // Deselect previous
  if (selectedCard && selectedCard !== slot) {
    selectedCard.classList.remove('selected');
  }

  // Select (or keep selected) then toggle action mode if applicable
  selectedCard = slot;
  slot.classList.add('selected');
  toggleActionMode(slot);
  showCardDetail(slot);
});

function showCardDetail(slot) {
  const cardData = getCardData(slot);
  if (cardData && dropZoneTitle && dropZoneDesc) {
    if (cardData.type === 'action') {
      const modeLabel = cardData.actionMode === 'attack' ? 'Attack' : 'Move';
      dropZoneTitle.textContent = modeLabel;
      dropZoneDesc.textContent =
        modeLabel === 'Attack'
          ? 'Grants +1 attack.'
          : 'Grants +1 movement.';
    } else {
      dropZoneTitle.textContent = cardData.name;
      dropZoneDesc.textContent = cardData.description || '';
    }
  } else if (dropZoneTitle && dropZoneDesc) {
    dropZoneTitle.textContent = '';
    dropZoneDesc.textContent = '';
  }
  cardDetail.classList.remove('hidden');
}

function toggleActionMode(slot) {
  const cardData = getCardData(slot);
  if (!cardData || cardData.type !== 'action') return;
  const nextMode = cardData.actionMode === 'attack' ? 'movement' : 'attack';
  slot.dataset.actionMode = nextMode;
  actionModeByCardId.set(cardData.id, nextMode);
  const modeEl = slot.querySelector('.card-mode');
  if (modeEl) {
    modeEl.textContent = nextMode === 'attack' ? 'Attack' : 'Move';
  }
}

function syncActionModes() {
  if (!handCards) return;
  const actionSlots = handCards.querySelectorAll('.card-slot[data-card-type="action"]');
  actionSlots.forEach((slot) => {
    const cardData = getCardData(slot);
    if (!cardData) return;
    const mode = actionModeByCardId.get(cardData.id) || 'movement';
    slot.dataset.actionMode = mode;
    const modeEl = slot.querySelector('.card-mode');
    if (modeEl) {
      modeEl.textContent = mode === 'attack' ? 'Attack' : 'Move';
    }
  });
}

// Close card detail when clicking outside
cardDetail.addEventListener('click', (e) => {
  if (e.target === cardDetail) {
    cardDetail.classList.add('hidden');
    if (selectedCard) {
      selectedCard.classList.remove('selected');
      selectedCard = null;
    }
  }
});

// -----------------------------
// Drag-to-Play
// -----------------------------

handCards.addEventListener('mousedown', startDrag);
handCards.addEventListener('touchstart', startDrag, { passive: false });

function startDrag(e) {
  const slot = e.target.closest('.card-slot');
  if (!slot || !slot.classList.contains('has-card')) return;

  pendingDragCard = slot;
  const cardData = getCardData(slot);
  if (!merchantOpen && cardData) {
    cardDetail.classList.remove('hidden');
  } else {
    cardDetail.classList.add('hidden');
  }

  const touch = e.touches ? e.touches[0] : e;
  dragStartX = touch.clientX;
  dragStartY = touch.clientY;
  const rect = slot.getBoundingClientRect();
  dragOffsetX = touch.clientX - rect.left;
  dragOffsetY = touch.clientY - rect.top;

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
}

function onDrag(e) {
  if (!pendingDragCard && !draggedCard) return;
  e.preventDefault();

  const touch = e.touches ? e.touches[0] : e;

  // Start drag only after threshold
  if (!draggedCard && pendingDragCard) {
    const dx = touch.clientX - dragStartX;
    const dy = touch.clientY - dragStartY;
    if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
      return;
    }
    draggedCard = pendingDragCard;
    pendingDragCard = null;
    draggedCard.classList.add('dragging');

    // Update drop zone with card info
    const dragCardData = getCardData(draggedCard);
    if (dragCardData && dropZoneTitle && dropZoneDesc) {
      if (dragCardData.type === 'action') {
        const modeLabel = dragCardData.actionMode === 'attack' ? 'Attack' : 'Move';
        dropZoneTitle.textContent = modeLabel;
        dropZoneDesc.textContent = modeLabel === 'Attack' ? 'Grants +1 attack.' : 'Grants +1 movement.';
      } else {
        dropZoneTitle.textContent = dragCardData.name;
        dropZoneDesc.textContent = dragCardData.description || '';
      }
    }

    const rect = draggedCard.getBoundingClientRect();
    // Create drag ghost
    const ghost = draggedCard.cloneNode(true);
    ghost.id = 'drag-ghost';
    ghost.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      pointer-events: none;
      z-index: 300;
      opacity: 0.9;
    `;
    document.body.appendChild(ghost);
  }

  const ghost = document.getElementById('drag-ghost');
  if (!ghost) return;
  ghost.style.left = `${touch.clientX - dragOffsetX}px`;
  ghost.style.top = `${touch.clientY - dragOffsetY}px`;

  const cardData = getCardData(draggedCard);
  // Check play card drop zone (any card type when merchant not open)
  if (!merchantOpen && dropZone) {
    const rect = dropZone.getBoundingClientRect();
    const inZone =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;
    dropZone.classList.toggle('drag-over', inZone);
  } else if (dropZone) {
    dropZone.classList.remove('drag-over');
  }

  // Check merchant drop zone (crystal cards only)
  if (merchantOpen && merchantDropZone) {
    const isCrystal = cardData?.type === 'crystal';
    const rect = merchantDropZone.getBoundingClientRect();
    const inZone =
      isCrystal &&
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;
    merchantDropZone.classList.toggle('drag-over', inZone);
    merchantDropZone.classList.toggle('drag-active', isCrystal);
  }
}

function endDrag(e) {
  if (!draggedCard) {
    // No drag started; cleanup pending state
    pendingDragCard = null;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
    return;
  }

  const ghost = document.getElementById('drag-ghost');
  const touch = e.changedTouches ? e.changedTouches[0] : e;
  const cardData = getCardData(draggedCard);

  // Check if dropped on merchant (crystal cards only)
  let soldToMerchant = false;
  if (merchantOpen && merchantDropZone && cardData?.type === 'crystal') {
    const rect = merchantDropZone.getBoundingClientRect();
    const inZone =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;
    if (inZone) {
      soldToMerchant = true;
      // Play card animation
      draggedCard.classList.add('played');
      draggedCard.classList.remove('dragging');

      // Emit crystal-sold event for main.js to handle
      window.dispatchEvent(
        new CustomEvent('crystal-sold', {
          detail: {
            cardId: cardData.id,
            value: Number.isFinite(cardData.value)
              ? cardData.value
              : parseInt(cardData.name.match(/\d/)?.[0]) || 1,
          },
        })
      );

      // Remove card element after animation
      const cardToRemove = draggedCard;
      setTimeout(() => {
        cardToRemove.remove();
      }, 500);

      draggedCard = null;
    }
    merchantDropZone.classList.remove('drag-over', 'drag-active');
  }

  // Fallback: drop crystal on play mat at center hex (ring 0)
  if (!soldToMerchant && cardData?.type === 'crystal' && currentPlayerRing === 0 && gameCanvas) {
    const rect = gameCanvas.getBoundingClientRect();
    const inCanvas =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;
    if (inCanvas) {
      soldToMerchant = true;
      draggedCard.classList.add('played');
      draggedCard.classList.remove('dragging');
      window.dispatchEvent(
        new CustomEvent('crystal-sold', {
          detail: {
            cardId: cardData.id,
            value: Number.isFinite(cardData.value)
              ? cardData.value
              : parseInt(cardData.name.match(/\\d/)?.[0]) || 1,
          },
        })
      );
      const cardToRemove = draggedCard;
      setTimeout(() => {
        cardToRemove.remove();
      }, 500);
      draggedCard = null;
    }
  }

  // Check if dropped on play card zone (any card type when merchant not open)
  let droppedOnPlayZone = false;
  if (!soldToMerchant && !merchantOpen && dropZone) {
    const rect = dropZone.getBoundingClientRect();
    droppedOnPlayZone =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;
    dropZone.classList.remove('drag-over');
  }

  if (droppedOnPlayZone && cardData) {
    // Play card animation
    draggedCard.classList.add('played');
    draggedCard.classList.remove('dragging');
    cardDetail.classList.add('hidden');

    // Emit card-played event for main.js to handle
    window.dispatchEvent(
      new CustomEvent('card-played', {
        detail: {
          cardId: cardData.id,
          action: cardData.type === 'action' ? cardData.actionMode : undefined,
        },
      })
    );

    // Remove card element after animation
    const cardToRemove = draggedCard;
    setTimeout(() => {
      cardToRemove.remove();
    }, 500);

    draggedCard = null;
  } else if (!soldToMerchant && draggedCard) {
    // Snap back
    draggedCard.classList.remove('dragging');
    draggedCard = null;
  }

  // Remove ghost
  if (ghost) {
    ghost.remove();
  }

  // Cleanup listeners
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchend', endDrag);

  if (selectedCard) {
    selectedCard.classList.remove('selected');
    selectedCard = null;
  }

  cardDetail.classList.add('hidden');
  merchantDropZone?.classList.remove('drag-active');

  // Clear drop zone text
  if (dropZoneTitle) dropZoneTitle.textContent = '';
  if (dropZoneDesc) dropZoneDesc.textContent = '';
}

// -----------------------------
// Character Sheet
// -----------------------------

btnCharacter.addEventListener('click', () => {
  closeHandDrawer();
  closeMerchant();
  openCharacterSheet();
});

btnCloseSheet.addEventListener('click', () => {
  closeCharacterSheet();
});

// Close sheet when clicking backdrop
characterSheet.addEventListener('click', (e) => {
  if (e.target === characterSheet) {
    closeCharacterSheet();
  }
});

uiBackdrop?.addEventListener('click', () => {
  closeCharacterSheet();
});

btnFireball?.addEventListener('click', () => {
  if (!fireballEquipped || fireballUsedThisTurn) return;
  window.dispatchEvent(new CustomEvent('fireball-toggle'));
});

btnDragon?.addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('dragon-toggle'));
});

// -----------------------------
// Merchant Panel
// -----------------------------

function openMerchant() {
  if (merchantOpen) return;
  merchantOpen = true;
  closeCharacterSheet();
  openHandDrawer();
  cardDetail.classList.add('hidden');
  btnMerchant?.classList.add('hidden');
  merchantBackdrop?.classList.remove('hidden');
  merchantPanel?.classList.remove('hidden');
  document.body.classList.add('merchant-open');
  btnEndTurn?.classList.add('disabled');
  updateAbilityButtonsVisibility();
}

function closeMerchant() {
  if (!merchantOpen) return;
  merchantOpen = false;
  merchantPanel?.classList.add('hidden');
  merchantBackdrop?.classList.add('hidden');
  document.body.classList.remove('merchant-open');
  btnEndTurn?.classList.remove('disabled');
  closeHandDrawer();
  updateAbilityButtonsVisibility();
  if (currentPlayerRing === 0) {
    btnMerchant?.classList.remove('hidden');
  }
}

function closeAllPanels() {
  closeMerchant();
  closeCharacterSheet();
  closeHandDrawer();
  cardDetail.classList.add('hidden');
  if (selectedCard) {
    selectedCard.classList.remove('selected');
    selectedCard = null;
  }
}

function updateAbilityButtonsVisibility() {
  const drawerOpen = !drawer.classList.contains('collapsed');
  const sheetOpen = !characterSheet.classList.contains('hidden');
  const hidePanels = drawerOpen || sheetOpen || merchantOpen;

  if (btnFireball) {
    const hideFireball = hidePanels || !fireballEquipped || fireballUsedThisTurn;
    btnFireball.classList.toggle('hidden', hideFireball);
  }

  if (btnDragon) {
    // Dragon button: hide if panels open, or if not equipped, or if used this turn
    const hideDragon = hidePanels || !dragonEquipped || dragonUsedThisTurn;
    btnDragon.classList.toggle('hidden', hideDragon);
  }
}

function updateMerchantVisibility(playerRing) {
  currentPlayerRing = playerRing;
  if (playerRing === 0) {
    btnMerchant?.classList.remove('hidden');
  } else {
    btnMerchant?.classList.add('hidden');
    // Auto-close if player leaves center
    if (merchantOpen) {
      closeMerchant();
    }
  }
}


btnMerchant?.addEventListener('click', () => {
  openMerchant();
});

btnCloseMerchant?.addEventListener('click', () => {
  closeMerchant();
});

merchantBackdrop?.addEventListener('click', () => {
  closeMerchant();
});

// -----------------------------
// Merchant Card Drag-to-Buy
// -----------------------------

merchantGrid?.addEventListener('mousedown', startMerchantDrag);
merchantGrid?.addEventListener('touchstart', startMerchantDrag, { passive: false });

function startMerchantDrag(e) {
  const slot = e.target.closest('.merchant-slot');
  if (!slot || slot.classList.contains('sold-out')) return;

  const cardType = slot.dataset.cardType;
  const cost = parseInt(slot.dataset.cost, 10);
  if (!cardType || currentPlayerGold < cost) return;

  e.preventDefault();
  draggedMerchantSlot = slot;
  slot.classList.add('dragging');

  const touch = e.touches ? e.touches[0] : e;
  const rect = slot.getBoundingClientRect();
  dragOffsetX = touch.clientX - rect.left;
  dragOffsetY = touch.clientY - rect.top;

  // Create drag ghost with same dimensions
  const ghost = slot.cloneNode(true);
  ghost.id = 'drag-ghost';
  ghost.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    pointer-events: none;
    z-index: 300;
    opacity: 0.9;
  `;
  document.body.appendChild(ghost);

  document.addEventListener('mousemove', onMerchantDrag);
  document.addEventListener('touchmove', onMerchantDrag, { passive: false });
  document.addEventListener('mouseup', endMerchantDrag);
  document.addEventListener('touchend', endMerchantDrag);
}

function onMerchantDrag(e) {
  if (!draggedMerchantSlot) return;
  e.preventDefault();

  const ghost = document.getElementById('drag-ghost');
  if (!ghost) return;

  const touch = e.touches ? e.touches[0] : e;
  ghost.style.left = `${touch.clientX - dragOffsetX}px`;
  ghost.style.top = `${touch.clientY - dragOffsetY}px`;

  // Highlight hand drawer as drop zone
  if (drawer) {
    const rect = drawer.getBoundingClientRect();
    const inZone =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;
    drawer.classList.toggle('drop-target', inZone);
  }
}

function endMerchantDrag(e) {
  if (!draggedMerchantSlot) return;

  const ghost = document.getElementById('drag-ghost');
  const touch = e.changedTouches ? e.changedTouches[0] : e;
  const cardType = draggedMerchantSlot.dataset.cardType;
  const cost = parseInt(draggedMerchantSlot.dataset.cost, 10);

  let purchased = false;

  // Check if dropped on hand drawer
  if (drawer) {
    const rect = drawer.getBoundingClientRect();
    const inZone =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;

    if (inZone && currentPlayerGold >= cost) {
      purchased = true;
      // Emit merchant-buy event for main.js to handle
      window.dispatchEvent(
        new CustomEvent('merchant-buy', {
          detail: { cardType, cost },
        })
      );
    }
    drawer.classList.remove('drop-target');
  }

  // Snap back (always remove dragging class)
  draggedMerchantSlot.classList.remove('dragging');
  draggedMerchantSlot = null;

  // Remove ghost
  if (ghost) {
    ghost.remove();
  }

  // Cleanup listeners
  document.removeEventListener('mousemove', onMerchantDrag);
  document.removeEventListener('touchmove', onMerchantDrag);
  document.removeEventListener('mouseup', endMerchantDrag);
  document.removeEventListener('touchend', endMerchantDrag);
}

// -----------------------------
// End Turn Button
// -----------------------------

btnEndTurn.addEventListener('click', () => {
  // Emit end-turn event for main.js to handle
  window.dispatchEvent(new CustomEvent('end-turn'));

  // Visual feedback
  btnEndTurn.textContent = 'Ending...';
  setTimeout(() => {
    btnEndTurn.textContent = 'End Turn';
  }, 300);
});

// -----------------------------
// Keyboard handling
// -----------------------------

// Block Enter key end-turn shortcut when merchant is open
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && merchantOpen) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true); // Use capture to intercept before main.js

// 'g' hotkey for dragon mount ability
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() !== 'g') return;
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
    return;
  }
  if (!dragonEquipped || dragonUsedThisTurn) return;
  e.preventDefault();
  window.dispatchEvent(new CustomEvent('dragon-toggle'));
});

window.addEventListener('state-changed', (e) => {
  const state = e.detail?.state;
  if (!state) return;

  // Update stats with effective values (considering gear)
  if (statGold) statGold.textContent = state.player.gold;
  if (statDamage) statDamage.textContent = getEffectiveDisplayDamage(state);
  if (statRange) statRange.textContent = state.player.range;
  if (statMovement) statMovement.textContent = getEffectiveDisplaySpeed(state);
  if (merchantGoldDisplay) merchantGoldDisplay.textContent = state.player.gold;

  // Sync shop piles and player gold for merchant drag validation
  currentPlayerGold = state.player.gold;
  if (state.shop?.piles) {
    currentShopPiles = state.shop.piles;
    renderMerchantSlots(currentShopPiles);
  }

  // Render gear slots and inventory
  if (state.player.equipped) {
    renderGearSlots(state.player.equipped);
  }
  if (state.player.inventory) {
    renderInventory(state.player.inventory);
  }

  // Track dragon gear state for button visibility
  dragonEquipped = hasEquipped(state.player.equipped, 'dragon');
  dragonUsedThisTurn = state.player.gearUsedThisTurn?.dragon || false;
  fireballEquipped = hasEquipped(state.player.equipped, 'fireball');
  fireballUsedThisTurn = state.player.gearUsedThisTurn?.fireball || false;
  updateAbilityButtonsVisibility();
});

window.addEventListener('fireball-aim-changed', (e) => {
  if (!btnFireball) return;
  const active = !!e.detail?.active;
  btnFireball.classList.toggle('active', active);
  btnFireball.textContent = active ? 'Fireball: Aiming' : 'F';
});

window.addEventListener('dragon-aim-changed', (e) => {
  if (!btnDragon) return;
  const active = !!e.detail?.active;
  btnDragon.classList.toggle('active', active);
  btnDragon.textContent = active ? 'Dragon: Select' : 'G';
});

window.addEventListener('hand-rendered', () => {
  syncActionModes();
});

window.addEventListener('player-moved', () => {
  closeAllPanels();
});

// -----------------------------
// Merchant Slot Rendering
// -----------------------------

function renderMerchantSlots(piles) {
  if (!merchantGrid) return;
  merchantGrid.innerHTML = '';
  for (const pile of piles) {
    const slot = document.createElement('div');
    slot.className = 'merchant-slot';
    slot.dataset.cardType = pile.cardType;
    slot.dataset.cost = pile.cost;
    if (pile.remaining <= 0) {
      slot.classList.add('sold-out');
    }
    const title = document.createElement('div');
    title.className = 'merchant-slot-title';
    title.textContent = pile.name;
    const cost = document.createElement('div');
    cost.className = 'merchant-slot-cost';
    cost.textContent = `${pile.cost} gold`;
    const count = document.createElement('div');
    count.className = 'merchant-slot-count';
    count.textContent = `×${pile.remaining}`;
    slot.appendChild(title);
    slot.appendChild(cost);
    slot.appendChild(count);
    merchantGrid.appendChild(slot);
  }
}

// -----------------------------
// Gear Rendering
// -----------------------------

function renderGearSlots(equipped) {
  if (!gearSlotsContainer) return;

  const slots = gearSlotsContainer.querySelectorAll('.gear-slot');
  slots.forEach((slotEl) => {
    const slotName = slotEl.dataset.slot;
    const gear = equipped[slotName];
    const valueEl = slotEl.querySelector('.slot-value');

    if (gear) {
      slotEl.classList.add('has-gear');
      slotEl.dataset.instanceId = gear.instanceId;
      valueEl.textContent = gear.name;
      valueEl.classList.remove('slot-empty');
    } else {
      slotEl.classList.remove('has-gear');
      delete slotEl.dataset.instanceId;
      valueEl.textContent = 'Empty';
      valueEl.classList.add('slot-empty');
    }
  });
}

function renderInventory(inventory) {
  if (!inventoryList) return;
  inventoryList.innerHTML = '';

  if (inventory.length === 0) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'inventory-empty';
    emptyEl.textContent = 'No items';
    inventoryList.appendChild(emptyEl);
    return;
  }

  for (const gear of inventory) {
    const item = document.createElement('div');
    item.className = 'inventory-item';
    item.dataset.instanceId = gear.instanceId;
    item.dataset.gearType = gear.type;

    const name = document.createElement('span');
    name.className = 'inventory-item-name';
    name.textContent = gear.name;

    const type = document.createElement('span');
    type.className = 'inventory-item-type';
    type.textContent = gear.type;

    item.appendChild(name);
    item.appendChild(type);
    inventoryList.appendChild(item);
  }
}

// Gear slot click - unequip to inventory
gearSlotsContainer?.addEventListener('click', (e) => {
  const slot = e.target.closest('.gear-slot');
  if (!slot || !slot.classList.contains('has-gear')) return;

  const slotName = slot.dataset.slot;
  window.dispatchEvent(
    new CustomEvent('gear-unequip', {
      detail: { slot: slotName },
    })
  );
});

// Inventory item click - equip to slot
inventoryList?.addEventListener('click', (e) => {
  const item = e.target.closest('.inventory-item');
  if (!item) return;

  const instanceId = item.dataset.instanceId;
  window.dispatchEvent(
    new CustomEvent('gear-equip', {
      detail: { instanceId },
    })
  );
});

// -----------------------------
// Exports for main.js wiring
// -----------------------------

export {
  renderHand,
  subscribeToState,
  updateMerchantVisibility,
  closeMerchant,
  renderGearSlots,
  renderInventory,
};
