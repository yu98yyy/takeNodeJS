const mongoose = require('mongoose');

// グループスキーマの定義
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },  // 掲示板名
    label: { type: String, required: true },  // 掲示板詳細
    icon: { type: String },  // アイコンURL
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// グループモデルの作成
const Group = mongoose.model('Group', groupSchema);

module.exports = Group;

