const mongoose = require('mongoose');


const ProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ユーザーIDを関連付け
    nickname: { type: String, required: true },
    age: { type: Number, required: true, min: 0 },
    icon: { type: String, default: '' },
    tags: { type: [String], default: [] }, // タグは文字列の配列
    message: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Profile', ProfileSchema);