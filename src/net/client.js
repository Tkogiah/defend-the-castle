// src/net/client.js
  import { MSG, joinMessage } from './protocol.js';

  export function createSocket({ name, onState, onError } = {}) {
    const ws = new WebSocket('ws://localhost:8080');
    let isOpen = false;

    ws.onopen = () => {
      isOpen = true;
      if (name) {
        ws.send(JSON.stringify(joinMessage(name)));
      }
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === MSG.STATE) onState?.(msg);
      if (msg.type === MSG.ERROR) onError?.(msg.message);
    };

    ws.onerror = (err) => onError?.(String(err));
    ws.onclose = () => {
      isOpen = false;
    };

    return {
      send(obj) {
        if (!isOpen) return false;
        ws.send(JSON.stringify(obj));
        return true;
      },
    };
  }
