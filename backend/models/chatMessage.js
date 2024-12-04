const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  chatRoomId: { type: String, required: true }, // チャットルームID
  sender: { type: String, required: true }, // 送信者のIDまたは名前
  receiver: { type: String, required: true }, // 受信者のIDまたは名前
  message: { type: String, required: true }, // メッセージ内容
  timestamp: { type: Date, default: Date.now }, // メッセージ送信時刻
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);