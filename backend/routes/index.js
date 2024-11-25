const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const chatRoutes = require('./chatRoutes');
const groupRoutes = require('./groupRoutes');

// 各ルートを統合
router.use('/users', userRoutes);
router.use('/chats', chatRoutes);
router.use('/groups', groupRoutes);

module.exports = router;
