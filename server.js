require('dotenv').config(); // 環境変数を読み込む
const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const ChatMessage = require('./backend/models/chatMessage'); 
const User = require('./backend/models/user'); 
const Profile = require('./backend/models/profile');  // プロフィールモデル
const MatchingRequest = require('./backend/models/matching');  // マッチングモデル
const ChatRoom = require('./backend/models/chatRoom');  // チャットルームモデル
const bcrypt = require('bcryptjs');
const Group = require('./backend/models/group.js');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
// const Profile = require('./backend/models/profile'); // プロフィールモデルをインポート
// const Profile = require('./backend/models/matching'); 
// const Profile = require('./backend/models/chatRoom'); 



const app = express();
//const PORT = process.env.PORT || 3000; // サーバーポート
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/matchingApp'; // MongoDB URI

const PORT = process.env.PORT || 3000;
    console.log(`Server running on http://localhost:${PORT}`);
;

// 画像の保存先を設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // 一意のファイル名にする
    }
});
const upload = multer({ storage: storage });


// JSONリクエストボディのパーサー
app.use(express.json());


app.post('/account/create', async (req, res) => {
    const { name, birthDate, email, password } = req.body;
  
    console.log("Received registration request:", req.body); // リクエスト内容をログ出力
  
    if (!name || !birthDate || !email || !password) {
        return res.status(400).json({ success: false, message: "全てのフィールドを入力してください。" });
    }
  
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "既に登録されているメールアドレスです。" });
        }
  
        // パスワードのハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 新しいユーザーの作成
        const newUser = new User({ name, email, password: hashedPassword, birthDate });
        await newUser.save();
  
        // 登録成功時にuserIdを返す
        res.status(201).json({ 
            success: true, 
            message: "登録に成功しました。",
            userId: newUser._id  // userIdをクライアントに返す
        });
  
    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
    }
  });

// プロファイル一覧を取得するエンドポイント
app.get('/profiles', async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: 'エラーが発生しました' });
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
    
  
  const { userId, nickname, age, tags, message } = req.body;
  
    if (!userId || !nickname || age == null || !tags || !Array.isArray(tags)) {
      return res.status(400).json({ success: false, message: "全てのフィールドを入力してください。" });
    }
  
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "無効なユーザーIDです。" });
    }
  
    if (typeof age !== 'number' || age < 0) {
      return res.status(400).json({ success: false, message: "正しい年齢を入力してください。" });
    }
  
    try {
      const existingProfile = await Profile.findOne({ userId });
      if (existingProfile) {
        return res.status(409).json({ success: false, message: "既にプロフィールが存在します。" });
      }
  
      const newProfile = new Profile({
        userId: new mongoose.Types.ObjectId(userId),
        nickname,
        age,
        tags: tags.slice(0, 10),  // 最大10個のタグ制限
        message,
      });
  
      await newProfile.save();
  
      res.status(201).json({ success: true, message: "プロフィールが作成されました", profile: newProfile });
    } catch (err) {
      console.error("Error creating profile:", err);
      res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
    }
  });
  
  // プロフィール更新エンドポイント
  app.put('/profile/update', async (req, res) => {
    const { userId, nickname, age, tags, message } = req.body;
  
    if (!userId || !nickname || age == null || !tags || !Array.isArray(tags)) {
      return res.status(400).json({ success: false, message: "全てのフィールドを入力してください。" });
    }
  
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "無効なユーザーIDです。" });
    }
  
    if (typeof age !== 'number' || age < 0) {
      return res.status(400).json({ success: false, message: "正しい年齢を入力してください。" });
    }
  
    try {
      const updatedProfile = await Profile.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { nickname, age, tags: tags.slice(0, 10), message },
        { new: true, runValidators: true }
      );
  
      if (!updatedProfile) {
        return res.status(404).json({ success: false, message: "プロフィールが見つかりませんでした。" });
      }
  
      res.status(200).json({ success: true, message: "プロフィールを更新しました", profile: updatedProfile });
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
    }
  });

// グループ作成API
app.post('/group/create', upload.single('groupicon'), async (req, res) => {
    try {
        const { groupname, groupLabel } = req.body;
        const groupIcon = req.file ? `/uploads/${req.file.filename}` : '';  // 画像パス

        if (!groupname || !groupLabel) {
            return res.status(400).json({ error: '掲示板名と詳細は必須です' });
        }

        const newGroup = new Group({
            name: groupname,
            label: groupLabel,
            icon: groupIcon
        });

        await newGroup.save();
        res.status(201).json({ message: 'グループが作成されました', groupId: newGroup._id });
    } catch (error) {
        res.status(500).json({ error: '掲示板の作成中にエラーが発生しました' });
    }
});



//検索画面API
app.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: "無効なユーザーIDです。" });
  }

  try {
      const profile = await Profile.findOne({ userId: new mongoose.Types.ObjectId(userId) });

      if (!profile) {
          return res.status(404).json({ success: false, message: "プロフィールが見つかりませんでした。" });
      }

      res.status(200).json({ success: true, profile });
  } catch (err) {
      console.error("Error fetching profile:", err);
      res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
  }
});

// 承認リクエストを送るAPI
app.post('/send-approval', async (req, res) => {
  try {
      const { fromUserId, toUserId } = req.body;

      if (!fromUserId || !toUserId) {
          return res.status(400).json({ message: '送信者IDと受信者IDを指定してください。' });
      }

      if (!isValidObjectId(fromUserId) || !isValidObjectId(toUserId)) {
          return res.status(400).json({ message: '無効なユーザーIDです。' });
      }

      if (String(fromUserId) === String(toUserId)) {
          return res.status(400).json({ message: '自分自身にはリクエストを送信できません。' });
      }

      const existingRequest = await MatchingRequest.findOne({ fromUserId, toUserId });
      if (existingRequest) {
          return res.status(400).json({ message: '既に承認リクエストを送信済みです。' });
      }

      const toUserProfile = await Profile.findOne({ userId: toUserId });
      if (!toUserProfile) {
          return res.status(404).json({ message: 'リクエスト対象のユーザーが見つかりません。' });
      }

      const newRequest = new MatchingRequest({ fromUserId, toUserId });
      await newRequest.save();

      res.status(200).json({ message: '承認リクエストを送信しました。', request: newRequest });
  } catch (error) {
      console.error('Error in /send-approval:', error);
      res.status(500).json({ message: 'エラーが発生しました。' });
  }
});

// ユーザーIDでプロフィールを取得するAPI
app.get("/get-userID/:userId", async (req, res) => {
  try {
      const { userId } = req.params;
      console.log("Received userId:", userId); // 🔍 確認

      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ message: "無効なユーザーIDです。" });
      }

      const userProfile = await Profile.findOne({ userId: userId });

      if (userProfile) {
          return res.status(200).json({
              userId: userProfile.userId.toString(),  // ObjectIdを文字列に変換
              nickname: userProfile.nickname,
              age: userProfile.age,
              message: userProfile.message,
              icon: userProfile.icon
          });
      } else {
          return res.status(404).json({ message: "プロフィールが見つかりません。" });
      }
     
  } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


// 承認リクエストの一覧取得API
app.get('/approval-requests', async (req, res) => {
  try {
      const requests = await MatchingRequest.find()
          .populate({ path: 'fromUserId', model: 'User', select: 'name' }) 
          .populate({ path: 'toUserId', model: 'User', select: 'name' });

      res.status(200).json({ requests });
  } catch (error) {
      console.error('Error in /approval-requests:', error);
      res.status(500).json({ message: 'エラーが発生しました。' });
  }
});

// 承認リクエストを承認してチャットルーム作成
app.post('/approve-request', async (req, res) => {
  try {
      const { fromUserId, toUserId } = req.body;

      if (!fromUserId || !toUserId) {
          return res.status(400).json({ message: '送信者IDと受信者IDを指定してください。' });
      }

      if (!isValidObjectId(fromUserId) || !isValidObjectId(toUserId)) {
          return res.status(400).json({ message: '無効なユーザーIDです。' });
      }

      const existingRequest = await MatchingRequest.findOne({ fromUserId, toUserId });
      if (!existingRequest) {
          return res.status(404).json({ message: '承認リクエストが見つかりません。' });
      }

      const existingChatRoom = await ChatRoom.findOne({
          participants: { $all: [fromUserId, toUserId] },
      });
      if (existingChatRoom) {
          return res.status(400).json({ message: '既にチャットルームが作成されています。' });
      }

      await MatchingRequest.deleteOne({ fromUserId, toUserId });

      const newChatRoom = new ChatRoom({ participants: [fromUserId, toUserId] });
      await newChatRoom.save();

      res.status(200).json({ message: 'チャットルームを作成しました。', chatRoom: newChatRoom });
  } catch (error) {
      console.error('Error in /approve-request:', error);
      res.status(500).json({ message: 'エラーが発生しました。' });
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

// ObjectId のバリデーション関数
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// アカウント一覧を表示するエンドポイント
app.get('/accounts', async (req, res) => {
  try {
    const users = await User.find(); // ユーザーを全件取得
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "ユーザーが見つかりません。" });
    }
    res.status(200).json({
      success: true,
      users: users
    });
  } catch (err) {
    console.error("Error fetching accounts:", err);
    res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
  }
});

// ルートエンドポイントを定義z
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



