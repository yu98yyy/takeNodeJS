const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const ChatMessage = require('./backend/models/ChatMessage');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/matchingApp';

// MongoDB接続
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

// WebSocketサーバーのセットアップ
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

// WebSocket接続処理
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    const parsedMessage = JSON.parse(message);

    // MongoDBにメッセージを保存
    const chatMessage = new ChatMessage({
      sender: parsedMessage.sender,
      recipient: parsedMessage.recipient,
      message: parsedMessage.message,
    });

    try {
      await chatMessage.save();
      console.log('Message saved to MongoDB');
    } catch (err) {
      console.error('Error saving message:', err);
    }

    // 全クライアントに送信
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(chatMessage));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});





// npm install ws