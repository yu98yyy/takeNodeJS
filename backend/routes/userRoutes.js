const express = require('express');
const router = express.Router();
const User = require('../models/User'); // ユーザーモデル

// ユーザー登録
router.post('/register', async (req, res) => {
  try {
    const { userName, mailAddress, password } = req.body;
    const user = new User({ userName, mailAddress, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ユーザーのプロフィール取得
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
