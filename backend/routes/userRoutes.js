 
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = express();

// 環境変数
const PORT = process.env.PORT || 3000;
const User = mongoose.model('User', userSchema);

// ミドルウェア
app.use(bodyParser.json());

// アカウント作成エンドポイント
app.post('/account/create', async (req, res) => {
    const { name, birthDate, email, password } = req.body;

    if (!name || !birthDate || !email || !password) {
        return res.status(400).send({ success: false, message: "全てのフィールドを入力してください。" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).send({ success: false, message: "既に登録されているメールアドレスです。" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, birthDate, email, password: hashedPassword });
        await newUser.save();

        res.status(201).send({ success: true, message: "アカウント作成成功" });
    } catch (error) {
        console.error("Error during account creation:", error);
        res.status(500).send({ success: false, message: "サーバーエラー" });
    }
});

// ログインエンドポイント
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ success: false, message: "メールアドレスまたはパスワードを入力してください。" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ success: false, message: "認証エラー: ユーザーが見つかりません。" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            res.status(200).send({ success: true, message: "ログイン成功" });
        } else {
            res.status(401).send({ success: false, message: "認証エラー: パスワードが間違っています。" });
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send({ success: false, message: "サーバーエラー" });
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


// MongoDB接続
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDBに接続されました。"))
.catch((error) => console.error("MongoDB接続エラー:", error));