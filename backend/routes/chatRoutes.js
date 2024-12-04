const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');

// メッセージ送信API
router.post('/send', async (req, res) => {
  try {
    const { chatRoomId, sender, receiver, message } = req.body;

    const chatMessage = new ChatMessage({
      chatRoomId,
      sender,
      receiver,
      message,
    });

    await chatMessage.save();
    res.status(201).json({ success: true, message: 'Message sent!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// メッセージ履歴取得API
router.get('/:chatRoomId', async (req, res) => {
  try {
    // MongoDBから指定したchatRoomIdのメッセージを取得
    const messages = await ChatMessage.find({ chatRoomId: req.params.chatRoomId });
    res.json(messages); // メッセージをJSON形式で返す
  } catch (error) {
    // エラー時のレスポンス
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;