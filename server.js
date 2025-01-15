require('dotenv').config(); // 環境変数を読み込む
const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const ChatMessage = require('./backend/models/chatMessage'); 
const User = require('./backend/models/user'); 
const Profile = require('./backend/models/profile'); // プロフィールモデルをインポート
const bcrypt = require('bcryptjs');
const Group = require('./backend/models/group.js');
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

  if (!name || !birthDate || !email || !password) {
      return res.status(400).json({ success: false, message: "全てのフィールドを入力してください。" });
  }

  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(409).json({ success: false, message: "既に登録されているメールアドレスです。" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
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


      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ success: false, message: "認証エラー: パスワードが間違っています。" });
      }

      res.status(200).json({ success: true, message: "ログイン成功", userId: user._id });
  } catch (err) {
      console.error("Error during login:", err);
      res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
  }
});

app.post('/group/create', async (req, res) => {
  const { groupname, groupLabel, groupicon } = req.body;  // リクエストボディからデータを取得

  if (!groupname ||  !groupLabel) {
      return res.status(400).json({ error: '掲示板名と詳細は必須です' });
  }

  try {
      // 新しいグループを作成
      const newGroup = new Group({
        name: groupname,
        label: groupLabel,
        icon: groupicon  ||  '',// デフォルト値として空文字を設定
      });

      // MongoDBに保存
      await newGroup.save()
      // 成功レスポンス
      res.status(201).json({ message: '掲示板が作成されました', groupId: newGroup._id });
  } catch (err) {
      // エラーレスポンス
      res.status(500).json({ error: '掲示板の作成中にエラーが発生しました' });
  }
});

// プロフィール作成エンドポイント
app.post('/profile/create', async (req, res) => {
  const { userId, name, age, tags, message } = req.body;

   // 必須フィールドのチェック
   if (!userId || !name || age == null || !tags || !Array.isArray(tags)) {
      return res.status(400).json({ success: false, message: "全てのフィールドを入力してください。" });
  }

  // userId の形式を確認
  if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid userId format:", userId); // エラーログ
      return res.status(400).json({ success: false, message: "無効なユーザーIDです。" });
  }

  // 年齢が数値であるかチェック
  if (typeof age !== 'number' || age < 0) {
      return res.status(400).json({ success: false, message: "正しい年齢を入力してください。" });
  }

  try {
      // userId を ObjectId に変換
      const objectId = new mongoose.Types.ObjectId(userId);


      // プロフィールデータの作成
      const newProfile = new Profile({
          userId: objectId, // ObjectId型で保存
          name,
          age,
          tags: tags.slice(0, 10), // タグを最大10個までに制限
          message,
      });

      // MongoDBに保存
      await newProfile.save();

      res.status(201).json({ success: true, message: "プロフィールが作成されました", profile: newProfile });
  } catch (err) {
      console.error("Error creating profile:", err);
      res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
  }
});


// プロフィール取得エンドポイント
app.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
      const profile = await Profile.findOne({ userId });

      if (!profile) {
          return res.status(404).json({ success: false, message: "プロフィールが見つかりませんでした。" });
      }

      res.status(200).json({ success: true, profile });
  } catch (err) {
      console.error("Error fetching profile:", err);
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





// HTTPサーバーと統合したWebSocketサーバーのセットアップ
//const wss = new WebSocket.Server({ server }); // server は既存の HTTP サーバー

const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server running on ws://localhost:8080');

// WebSocket接続処理
wss.on('connection', (ws, req) => {
    console.log(`Client connected from: ${req.socket.remoteAddress}`);

    // クライアントからメッセージを受信
    ws.on('message', async (message) => {
        console.log(`Received message: ${message}`); // メッセージ内容をログ出力
        console.log('WebSocket server running on ws://localhost:8080');

        try {
            const parsedMessage = JSON.parse(message); // メッセージをJSONとしてパース

            // メッセージをMongoDBに保存
            const chatMessage = new ChatMessage({
                sender: parsedMessage.sender, // 送信者
                recipient: parsedMessage.recipient, // 受信者
                message: parsedMessage.message, // メッセージ内容
            });

            await chatMessage.save(); // 保存処理
            console.log('Message saved to MongoDB');
        } catch (err) {
            console.error('Error processing message:', err); // エラーログ
        }

        // 全クライアントにメッセージをブロードキャスト
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // クライアント切断時の処理
    ws.on('close', () => {
        console.log('Client disconnected');
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
