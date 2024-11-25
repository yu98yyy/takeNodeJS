const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat'); // チャットモデル

// メッセージ送信
router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverId, messageText } = req.body;
    const message = new Chat({
      senderId,
      receiverId,
      messageText,
      timestamp: new Date(),
    });
    await message.save();
    res.status(201).json({ message: 'Message sent', message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// チャット履歴の取得
router.get('/:chatRoomId', async (req, res) => {
  try {
    const messages = await Chat.find({ chatRoomId: req.params.chatRoomId });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
