const express = require('express');
const router = express.Router();

// ルートの例
router.get('/', (req, res) => {
  res.send('Hello from routes!');
});

module.exports = router;

// const express = require('express');
// const mongoose = require('mongoose');
// const router = express.Router();

// // ルートの例
// router.get('/', (req, res) => {
//   res.send('Hello from routes!');
// });
// module.exports = router;

// require('dotenv').config();

// const routes = require('./backend/routes'); // ルートの読み込み

// const app = express();
// const PORT = process.env.PORT || 3000;
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/matchingApp';

// // ミドルウェア
// app.use(express.json());

// // ルートの設定
// app.use('/api', routes);

// // MongoDB接続
// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => {
//     console.log('Connected to MongoDB');

//     // サーバーの起動
//     app.listen(PORT, () => {
//       console.log(`Server is running on http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error('Failed to connect to MongoDB:', err.message);
//     process.exit(1);
//   });