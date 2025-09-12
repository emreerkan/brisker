const WebSocket = require('ws');

console.log('🚀 Testing WebSocket connection to ws://localhost:3000');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  console.log('✅ WebSocket connected successfully!');
});

ws.on('message', (data) => {
  console.log('📨 Received message:', data.toString());
  try {
    const parsed = JSON.parse(data.toString());
    console.log('📋 Parsed message:', parsed);
  } catch (e) {
    console.log('💬 Raw message:', data.toString());
  }
});

ws.on('close', () => {
  console.log('❌ WebSocket connection closed');
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('💥 WebSocket error:', error);
  process.exit(1);
});

// Keep the connection alive for 10 seconds
setTimeout(() => {
  console.log('⏰ Closing connection...');
  ws.close();
}, 10000);