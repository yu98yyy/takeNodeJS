const express = require('express');
const mongoose = require('mongoose');
const Profile = require('./profile');
const app = express();
app.use(express.json()); // JSONデータを扱えるようにする
const cors = require('cors');
app.use(cors());


// MongoDB接続
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydb';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
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


// 新しいプロファイルを作成するルート
app.post('/profiles', async (req, res) => {
  try {
    const { nickname, age, tags, messages, photos } = req.body;

    const newProfile = new Profile({
      nickname,
      age,
      tags,
      messages: [messages],
      photos,
    });

    await newProfile.save();
    res.status(201).json({ message: 'プロファイルが作成されました', profile: newProfile });
  } catch (err) {
    res.status(500).json({ error: 'エラーが発生しました', details: err.message });
  }
});

