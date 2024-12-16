const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true }, // チャットルームの名前
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId, // ユーザーIDの参照
      ref: "User", // ユーザーモデル（すでに存在する場合）
    },
  ],
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId, // メッセージIDの参照
      ref: "ChatMessage", // チャットメッセージモデル
    },
  ],
  lastMessage: {
    type: String, // 最後のメッセージの内容
  },
  lastUpdated: {
    type: Date, // 最後の更新日時
    default: Date.now,
  },
});

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);