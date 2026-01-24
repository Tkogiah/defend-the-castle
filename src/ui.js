/**
 * ui.js - UI overlay interactions
 * Handles drawer toggle, card selection, drag-to-play, and character sheet.
 * Wired to game state via state-changed events.
 */

import { renderHand, getCardData, subscribeToState } from './ui/hand.js';

// -----------------------------
// DOM Elements
// -----------------------------

const drawer = document.getElementById('hand-drawer');
const btnHand = document.getElementById('btn-hand');
const cardDetail = document.getElementById('card-detail');
const cardDetailName = document.getElementById('card-detail-name');
const cardDetailDesc = document.getElementById('card-detail-desc');
const uiBackdrop = document.getElementById('ui-backdrop');
const merchantBackdrop = document.getElementById('merchant-backdrop');
const characterSheet = document.getElementById('character-sheet');
const btnCharacter = document.getElementById('btn-character');
const btnCloseSheet = document.getElementById('btn-close-sheet');
const btnEndTurn = document.getElementById('btn-end-turn');
const handCards = document.getElementById('hand-cards');
const dropZones = document.querySelectorAll('.drop-zone');
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

// -----------------------------
// State
// -----------------------------

let selectedCard = null;
let draggedCard = null;
let draggedMerchantSlot = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let merchantOpen = false;
let currentPlayerRing = null;
let currentPlayerGold = 0;
let currentShopPiles = [];

// -----------------------------
// Drawer Toggle
// -----------------------------

function closeHandDrawer() {
  drawer.classList.add('collapsed');
}

function openHandDrawer() {
  drawer.classList.remove('collapsed');
}

function closeCharacterSheet() {
  if (!document.body.classList.contains('merchant-open')) {
    uiBackdrop?.classList.add('hidden');
  }
  characterSheet.classList.add('hidden');
  document.body.classList.remove('sheet-open');
}

function openCharacterSheet() {
  uiBackdrop?.classList.remove('hidden');
  characterSheet.classList.remove('hidden');
  document.body.classList.add('sheet-open');
}

btnHand?.addEventListener('click', () => {
  closeCharacterSheet();
  drawer.classList.toggle('collapsed');
});

// -----------------------------
// Card Selection
// -----------------------------

handCards.addEventListener('click', (e) => {
  const slot = e.target.closest('.card-slot');
  if (!slot) return;

  // Deselect previous
  if (selectedCard) {
    selectedCard.classList.remove('selected');
  }

  // Select new (or deselect if same)
  if (selectedCard === slot) {
    selectedCard = null;
    cardDetail.classList.add('hidden');
  } else {
    selectedCard = slot;
    slot.classList.add('selected');
    showCardDetail(slot);
  }
});

function showCardDetail(slot) {
  const cardData = getCardData(slot);
  if (cardData) {
    cardDetailName.textContent = cardData.name;
    cardDetailDesc.textContent = cardData.description || 'No description.';
  } else {
    cardDetailName.textContent = 'Card';
    cardDetailDesc.textContent = '';
  }
  cardDetail.classList.remove('hidden');
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

  e.preventDefault();
  draggedCard = slot;
  slot.classList.add('dragging');
  const cardData = getCardData(slot);
  if (!merchantOpen && cardData?.type === 'action') {
    cardDetail.classList.remove('hidden');
  } else {
    cardDetail.classList.add('hidden');
  }

  const touch = e.touches ? e.touches[0] : e;
  const rect = slot.getBoundingClientRect();
  dragOffsetX = touch.clientX - rect.left;
  dragOffsetY = touch.clientY - rect.top;

  // Create drag ghost
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

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
}

function onDrag(e) {
  if (!draggedCard) return;
  e.preventDefault();

  const ghost = document.getElementById('drag-ghost');
  if (!ghost) return;

  const touch = e.touches ? e.touches[0] : e;
  ghost.style.left = `${touch.clientX - dragOffsetX}px`;
  ghost.style.top = `${touch.clientY - dragOffsetY}px`;

  const cardData = getCardData(draggedCard);
  const allowActionDrop = !merchantOpen && cardData?.type === 'action';

  // Check drop zones (action cards) only when allowed
  if (allowActionDrop) {
    dropZones.forEach((zone) => {
      const rect = zone.getBoundingClientRect();
      const inZone =
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom;
      zone.classList.toggle('drag-over', inZone);
    });

    const overMove = dropZones[0]?.classList.contains('drag-over');
    const overAttack = dropZones[1]?.classList.contains('drag-over');
    cardDetail.classList.toggle('drag-movement', !!overMove);
    cardDetail.classList.toggle('drag-attack', !!overAttack);
  } else {
    dropZones.forEach((zone) => zone.classList.remove('drag-over'));
    cardDetail.classList.remove('drag-movement', 'drag-attack');
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
  if (!draggedCard) return;

  const ghost = document.getElementById('drag-ghost');
  const touch = e.changedTouches ? e.changedTouches[0] : e;
  const cardData = getCardData(draggedCard);
  const allowActionDrop = !merchantOpen && cardData?.type === 'action';

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

  // Check if dropped on action zone (if not sold to merchant and allowed)
  
  if (!soldToMerchant && allowActionDrop) {
    let droppedZone = null;
    dropZones.forEach((zone) => {
      const rect = zone.getBoundingClientRect();
      const inZone =
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom;
      if (inZone) {
        droppedZone = zone;
      }
      zone.classList.remove('drag-over');
    });
  

  if (droppedZone && cardData) {
      const action = droppedZone.dataset.action; // 'movement' or 'attack'

      // Play card animation
      draggedCard.classList.add('played');
      draggedCard.classList.remove('dragging');
      cardDetail.classList.add('hidden');

      // Emit card-played event for main.js to handle
      window.dispatchEvent(
        new CustomEvent('card-played', {
          detail: {
            cardId: cardData.id,
            action: action,
          },
        })
      );

      // Remove card element after animation
      const cardToRemove = draggedCard;
      setTimeout(() => {
        cardToRemove.remove();
      }, 500);

      draggedCard = null;
    } else if (draggedCard) {
      // Snap back
      draggedCard.classList.remove('dragging');
      draggedCard = null;
    }
  } else if (!soldToMerchant && draggedCard) {
    // Snap back if merchant open or non-action card
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

  cardDetail.classList.remove('drag-movement', 'drag-attack');
  cardDetail.classList.add('hidden');
  merchantDropZone?.classList.remove('drag-active');
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

// -----------------------------
// Merchant Panel
// -----------------------------

function openMerchant() {
  if (merchantOpen) return;
  merchantOpen = true;
  closeCharacterSheet();
  openHandDrawer();
  cardDetail.classList.add('hidden');
  cardDetail.classList.remove('drag-movement', 'drag-attack');
  btnMerchant?.classList.add('hidden');
  merchantBackdrop?.classList.remove('hidden');
  merchantPanel?.classList.remove('hidden');
  document.body.classList.add('merchant-open');
  btnEndTurn?.classList.add('disabled');
}

function closeMerchant() {
  if (!merchantOpen) return;
  merchantOpen = false;
  merchantPanel?.classList.add('hidden');
  merchantBackdrop?.classList.add('hidden');
  document.body.classList.remove('merchant-open');
  btnEndTurn?.classList.remove('disabled');
  closeHandDrawer();
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

window.addEventListener('state-changed', (e) => {
  const state = e.detail?.state;
  if (!state) return;
  if (statGold) statGold.textContent = state.player.gold;
  if (statDamage) statDamage.textContent = state.player.baseDamage;
  if (statRange) statRange.textContent = state.player.range;
  if (statMovement) statMovement.textContent = state.player.baseMovement;
  if (merchantGoldDisplay) merchantGoldDisplay.textContent = state.player.gold;

  // Sync shop piles and player gold for merchant drag validation
  currentPlayerGold = state.player.gold;
  if (state.shop?.piles) {
    currentShopPiles = state.shop.piles;
    renderMerchantSlots(currentShopPiles);
  }
});

window.addEventListener('player-moved', () => {
  closeAllPanels();
});

// -----------------------------
// Exports for main.js wiring
// -----------------------------

export {
  renderHand,
  subscribeToState,
  updateMerchantVisibility,
  closeMerchant,
};

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
