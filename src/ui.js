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
const characterSheet = document.getElementById('character-sheet');
const btnCharacter = document.getElementById('btn-character');
const btnCloseSheet = document.getElementById('btn-close-sheet');
const btnEndTurn = document.getElementById('btn-end-turn');
const handCards = document.getElementById('hand-cards');
const dropZones = document.querySelectorAll('.drop-zone');

// -----------------------------
// State
// -----------------------------

let selectedCard = null;
let draggedCard = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

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
  uiBackdrop?.classList.add('hidden');
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
  cardDetail.classList.remove('hidden');

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

  // Check drop zones
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
}

function endDrag(e) {
  if (!draggedCard) return;

  const ghost = document.getElementById('drag-ghost');
  const touch = e.changedTouches ? e.changedTouches[0] : e;
  const cardData = getCardData(draggedCard);

  // Check if dropped on a zone
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
  } else {
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

  cardDetail.classList.remove('drag-movement', 'drag-attack');
  cardDetail.classList.add('hidden');
}

// -----------------------------
// Character Sheet
// -----------------------------

btnCharacter.addEventListener('click', () => {
  closeHandDrawer();
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
// Exports for main.js wiring
// -----------------------------

export { renderHand, subscribeToState };
