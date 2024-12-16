const express = require('express');
const router = express.Router();

// ルートの例
router.get('/', (req, res) => {
  res.send('Hello from routes!');
});

module.exports = router;

