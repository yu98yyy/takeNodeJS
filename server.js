require('dotenv').config(); // 環境変数を読み込む
const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const ChatMessage = require('./backend/models/chatMessage'); 
const User = require('./backend/models/user'); 
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000; // サーバーポート
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/matchingApp'; // MongoDB URI


// JSONリクエストボディのパーサー
app.use(express.json());


// 新規登録エンドポイント
app.post('/account/create', async (req, res) => {
  const { name, birthDate , email, password } = req.body;

  console.log("Received registration request:", req.body); // ここでリクエストの内容をログ出力

  if (!name || !birthDate|| !email || !password) {
      return res.status(400).json({ success: false, message: "全てのフィールドを入力してください。" });
  }

  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(409).json({ success: false, message: "既に登録されているメールアドレスです。" });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword, birthDate });
      await newUser.save();

      res.status(201).json({ success: true, message: "登録に成功しました。" });
  } catch (err) {
      console.error("Error during registration:", err);
      res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
  }
});

// ログインエンドポイント
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ success: false, message: "メールアドレスまたはパスワードを入力してください。" });
  }

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(401).json({ success: false, message: "認証エラー: ユーザーが見つかりません。" });
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ success: false, message: "認証エラー: パスワードが間違っています。" });
      }

      res.status(200).json({ success: true, message: "ログイン成功", userId: user._id });
  } catch (err) {
      console.error("Error during login:", err);
      res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
  }
});





// チャット用ルートのインポート
const chatRoutes = require('./backend/routes/chatRoutes');
app.use('/api/chat', chatRoutes); // チャットAPIを登録

// MongoDB接続
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB'); // 接続成功時のログ
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message); // 接続失敗時のログ
    process.exit(1); // プロセスを終了
  });

// サーバーの起動
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// WebSocketサーバーのセットアップ
const wss = new WebSocket.Server({ server }); // HTTPサーバーにWebSocketを統合
// WebSocket接続処理
wss.on('connection', (ws) => {
  console.log('Client connected'); // クライアント接続時のログ

  // クライアントからメッセージを受け取ったときの処理
  ws.on('message', async (message) => {
    const parsedMessage = JSON.parse(message); // メッセージをJSON形式でパース

    // MongoDBにメッセージを保存
    const chatMessage = new ChatMessage({
      sender: parsedMessage.sender, // 送信者
      recipient: parsedMessage.recipient, // 受信者
      message: parsedMessage.message, // メッセージ内容
    });

    try {
      await chatMessage.save(); // メッセージを保存
      console.log('Message saved to MongoDB');
    } catch (err) {
      console.error('Error saving message:', err); // 保存失敗時のログ
    }

    // 接続している全クライアントにメッセージを送信
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) { // クライアントが接続中の場合
        client.send(JSON.stringify(chatMessage)); // メッセージを送信
      }
    });
  });

  // クライアントが切断したときの処理
  ws.on('close', () => {
    console.log('Client disconnected'); // 切断時のログ
  });
});




// ルートエンドポイントを定義
app.get('/', (req, res) => {
  res.send('Welcome to the Chat API!'); // シンプルなレスポンスを返す
});

// Content Security Policy ヘッダーの設定
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "connect-src 'self' ws://localhost:8080"
  );
  next();
});

// 特定のオリジンのみ許可する場合
const corsOptions = {
  origin: ['http://localhost:3000', 'http://192.168.x.x:3000'], // フロントエンドのドメインやIPアドレスを記載
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // クッキーや認証情報を含むリクエストを許可
};

app.use(cors(corsOptions));




// 全てのオリジンを許可する場合（開発時のみ推奨）
// app.use(cors()); 



// npm install cors websocket