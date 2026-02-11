const WebSocket = require('ws');

// Create a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server is running on ws://localhost:8080');

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
    // Echo the parsed message back to the client
    ws.send(JSON.stringify({ type: 'echo', payload }));
  });

  // Close event handler
  ws.on('close', () => {
    console.log('Client disconnected');
  });
}); 
