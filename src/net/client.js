// src/net/client.js
  import { MSG, joinMessage } from './protocol.js';

  export function createSocket({ name, onState, onError } = {}) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || 'localhost:8080'; // fallback for file:// access
    const ws = new WebSocket(`${protocol}//${host}`);
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
