const mongoose = require('mongoose'); // mongooseをインポート

// ChatMessageスキーマの定義
const ChatMessageSchema = new mongoose.Schema({
  chatRoomId: { type: String, required: true }, // チャットルームID
  sender: { type: String, required: true },    // メッセージの送信者
  receiver: { type: String, required: true },  // メッセージの受信者
  message: { type: String, required: true },   // メッセージ本文
  timestamp: { type: Date, default: Date.now } // メッセージの送信時刻
});

// モデルをエクスポート
module.exports = mongoose.model('ChatMessage', ChatMessageSchema);