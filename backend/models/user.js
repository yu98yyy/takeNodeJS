const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // 暗号化が必要
});

module.exports = mongoose.model('User', UserSchema);