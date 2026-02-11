 // Message type constants
  export const MSG = {
    JOIN: 'join',
    ACTION: 'action',
    END_TURN: 'endTurn',
    STATE: 'state',
    ERROR: 'error',
  };

  // Client → Server
  export function joinMessage(name) {
    return { type: MSG.JOIN, name };
  }

  export function actionMessage(action, payload = {}) {
    return { type: MSG.ACTION, action, ...payload };
  }

  export function endTurnMessage() {
    return { type: MSG.END_TURN };
  }

  // Server → Client
  export function stateMessage(state) {
    return { type: MSG.STATE, state };
  }

  export function errorMessage(message) {
    return { type: MSG.ERROR, message };
  }
