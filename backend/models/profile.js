const mongoose = require('mongoose');

// プロファイルのスキーマ
const ProfileSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  age: { type: Number, required: true },
  tags: { type: [String], required: true },
  messages: { type: [String], required: true },
  photos: { type: [String], required: true } // Base64エンコードされた画像
});

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;
