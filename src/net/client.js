// src/net/client.js
  import { MSG } from './protocol.js';

  export function createSocket({ onState, onError } = {}) {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      // send join here later
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === MSG.STATE) onState?.(msg.state);
      if (msg.type === MSG.ERROR) onError?.(msg.message);
    };

    ws.onerror = (err) => onError?.(String(err));

    return {
      send(obj) {
        ws.send(JSON.stringify(obj));
      },
    };
  }
