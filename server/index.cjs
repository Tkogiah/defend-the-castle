const WebSocket = require('ws');
const path = require('path');
const { pathToFileURL } = require('url');

function toFileUrl(relativePath) {
  return pathToFileURL(path.join(__dirname, relativePath)).href;
}

(async () => {
  const core = await import(toFileUrl('../src/core/index.js'));
  const hex = await import(toFileUrl('../src/hex/index.js'));

  const {
    createInitialState,
    startPlayerTurn,
    endPlayerTurn,
    movePlayer,
    tryAttackAtHex,
    playActionCard,
    playMerchantCard,
    trashCrystalCard,
    removeCardFromHand,
    addPlayerGold,
    buyMerchantCard,
    equipGear,
    unequipGear,
    updateWave,
    spawnWaveEnemies,
    spawnBoss,
    moveEnemies,
    checkPlayerKnockout,
    endEnemyTurn,
    buildEnemyMoves,
    useAdjacentMove,
    useFireball,
  } = core;
  const { generateHexGrid } = hex;

  // Create a WebSocket server on port 8080
  const wss = new WebSocket.Server({ port: 8080 });

  console.log('WebSocket server is running on ws://localhost:8080');

  let nextPlayerId = 1;
  const roomState = {
    players: [],
  };

  let gameState = startPlayerTurn(createInitialState(generateHexGrid()));

  function broadcast(type, payload) {
    const message = JSON.stringify({ type, ...payload });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  function sendState() {
    broadcast('state', { state: gameState, room: roomState });
  }

  function applyEndTurnWithSnapshots() {
    let nextState = endPlayerTurn(gameState);

    if (nextState.wave.bossJustDied) {
      nextState = updateWave(nextState, { bossJustDied: false });
      nextState = startPlayerTurn(nextState);
      return { finalState: nextState };
    }

    let spawned = false;
    if (nextState.wave.enemiesSpawned === 0) {
      nextState = spawnWaveEnemies(nextState);
      spawned = true;
    } else if (!nextState.wave.bossSpawned) {
      nextState = spawnBoss(nextState);
      spawned = true;
    }

    if (spawned) {
      gameState = nextState;
      sendState();
    }

    const movedState = moveEnemies(nextState);
    buildEnemyMoves(nextState, movedState);
    nextState = { ...nextState, enemies: movedState.enemies };
    nextState = checkPlayerKnockout(nextState);
    nextState = endEnemyTurn(nextState);
    nextState = startPlayerTurn(nextState);
    return { finalState: nextState };
  }

  // Connection event handler
  wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send a welcome message to the client
    ws.send(JSON.stringify({ type: 'hello' }));

    // Message event handler
    ws.on('message', (message) => {
      const text = message.toString();
      let payload;
      try {
        payload = JSON.parse(text);
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
        return;
      }
      console.log('Received:', payload);

      if (payload.type === 'join') {
        const name = typeof payload.name === 'string' ? payload.name.trim() : 'Player';
        const player = { id: nextPlayerId++, name: name || 'Player' };
        ws.playerId = player.id;
        roomState.players.push(player);
        sendState();
        return;
      }

      if (payload.type === 'action') {
        const { action, target, cardId, cardAction } = payload;
        if (action === 'move' && target) {
          gameState = movePlayer(gameState, target);
          sendState();
          return;
        }
        if (action === 'attack' && target) {
          gameState = tryAttackAtHex(gameState, target);
          sendState();
          return;
        }
        if (action === 'playCard' && cardId) {
          const card = gameState.player.hand.find((c) => c.id === cardId);
          if (card?.type === 'action' && cardAction) {
            gameState = playActionCard(gameState, cardId, cardAction);
            sendState();
            return;
          }
          if (card?.type === 'merchant') {
            if (cardAction === 'attack' || cardAction === 'movement') {
              gameState = playActionCard(gameState, cardId, cardAction);
            } else {
              gameState = playMerchantCard(gameState, cardId);
            }
            sendState();
            return;
          }
          if (card?.type === 'crystal' && cardAction === 'trash') {
            gameState = trashCrystalCard(gameState, cardId);
            sendState();
            return;
          }
        }
        if (action === 'dragonMove' && target) {
          gameState = useAdjacentMove(gameState, target);
          sendState();
          return;
        }
        if (action === 'fireball' && target) {
          gameState = useFireball(gameState, target);
          sendState();
          return;
        }
        if (action === 'sellCrystal' && cardId && Number.isFinite(payload.value)) {
          gameState = removeCardFromHand(gameState, cardId);
          gameState = addPlayerGold(gameState, payload.value);
          sendState();
          return;
        }
        if (action === 'buyMerchant' && payload.cardType) {
          gameState = buyMerchantCard(gameState, payload.cardType);
          sendState();
          return;
        }
        if (action === 'equipGear' && payload.instanceId) {
          gameState = equipGear(gameState, payload.instanceId);
          sendState();
          return;
        }
        if (action === 'unequipGear' && payload.slot) {
          gameState = unequipGear(gameState, payload.slot);
          sendState();
          return;
        }
      }

      if (payload.type === 'endTurn') {
        const result = applyEndTurnWithSnapshots();
        gameState = result.finalState;
        sendState();
        return;
      }

      ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    });

    // Close event handler
    ws.on('close', () => {
      console.log('Client disconnected');
      if (ws.playerId) {
        roomState.players = roomState.players.filter((p) => p.id !== ws.playerId);
        sendState();
      }
    });
  });
})();
