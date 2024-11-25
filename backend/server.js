const app = require('./app'); // app.js をインポート
const mongoose = require('mongoose');
require('dotenv').config(); // .env ファイルの読み込み

// 環境変数またはデフォルト値を設定
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/matchingApp';

// MongoDB接続
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    
    // サーバーを起動
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1); // エラーが発生した場合、プロセスを終了
  });
