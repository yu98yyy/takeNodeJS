const mongoose = require('mongoose');

// マッチングリクエストのスキーマ
const matchRequestSchema = new mongoose.Schema({
    fromUserId: { type: String, required: true }, // String に変更
    toUserId: { type: String, required: true },  // String に変更
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  

// マッチングリクエストのモデルを作成
const MatchRequest = mongoose.model('MatchRequest', matchRequestSchema);

module.exports = MatchRequest;
