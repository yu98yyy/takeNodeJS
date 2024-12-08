const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId, // ユーザーIDの参照
      ref: "User", // ユーザーモデル（すでに存在する場合）
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