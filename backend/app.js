// 必要なライブラリをインポート
const mongoose = require('mongoose'); // MongoDB操作用ライブラリ

// MongoDB接続URI（ホスト、ポート、データベース名を指定）
const uri = 'mongodb://localhost:28017/mydatabase';

// MongoDBへ接続
mongoose.connect(uri, {
  useNewUrlParser: true, // 新しいURLパーサーを使用する設定
  useUnifiedTopology: true, // 新しいサーバー発見と監視エンジンを使用する設定
})
  .then(() => {
    // 接続成功時の処理
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    // 接続失敗時のエラーハンドリング
    console.error('Failed to connect to MongoDB', err);
  });

// Expressを使用して簡単なHTTPサーバーを作成
const express = require('express'); // Webサーバーを構築するためのフレームワーク
const app = express(); // Expressアプリケーションのインスタンスを作成

// HTTP GETリクエスト時のルートハンドラー
app.get('/', (req, res) => {
  // ルートアクセス時のレスポンスを送信
  res.send('MongoDB Connection Successful!');
});

// サーバーを起動するポート番号
const PORT = 3000;

// サーバーをリッスン開始
app.listen(PORT, () => {
  // サーバーが正常に起動したことをログに出力
  console.log(`Server is running on http://localhost:${PORT}`);
});

