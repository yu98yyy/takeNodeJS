const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const ChatMessage = require('./backend/models/ChatMessage'); // チャットメッセージモデルのインポート
require('dotenv').config(); // 環境変数を読み込む

const app = express();
const PORT = process.env.PORT || 3000; // サーバーポート
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/matchingApp'; // MongoDB URI

// チャット用ルートのインポート
const chatRoutes = require('./backend/routes/chatRoutes');
app.use('/api/chat', chatRoutes); // チャットAPIを登録

// MongoDB接続
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB'); // 接続成功時のログ
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message); // 接続失敗時のログ
    process.exit(1); // プロセスを終了
  });

// サーバーの起動
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// WebSocketサーバーのセットアップ
const wss = new WebSocket.Server({ server }); // HTTPサーバーにWebSocketを統合

// WebSocket接続処理
wss.on('connection', (ws) => {
  console.log('Client connected'); // クライアント接続時のログ

  // クライアントからメッセージを受け取ったときの処理
  ws.on('message', async (message) => {
    const parsedMessage = JSON.parse(message); // メッセージをJSON形式でパース

    // MongoDBにメッセージを保存
    const chatMessage = new ChatMessage({
      sender: parsedMessage.sender, // 送信者
      recipient: parsedMessage.recipient, // 受信者
      message: parsedMessage.message, // メッセージ内容
    });

    try {
      await chatMessage.save(); // メッセージを保存
      console.log('Message saved to MongoDB');
    } catch (err) {
      console.error('Error saving message:', err); // 保存失敗時のログ
    }

    // 接続している全クライアントにメッセージを送信
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) { // クライアントが接続中の場合
        client.send(JSON.stringify(chatMessage)); // メッセージを送信
      }
    });
  });

  // クライアントが切断したときの処理
  ws.on('close', () => {
    console.log('Client disconnected'); // 切断時のログ
  });
});