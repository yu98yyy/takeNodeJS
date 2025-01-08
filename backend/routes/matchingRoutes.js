const express = require('express');
const MatchRequest = require('./matching');
const app = express();
const mongoose = require('mongoose');

app.use(express.json());

// MongoDB接続
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydb';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// マッチングリクエストを送信するエンドポイント
app.post('/send-match-request', async (req, res) => {
  const { fromUserId, toUserId } = req.body;

  try {
    const matchRequest = new MatchRequest({
      fromUserId,
      toUserId,
      status: 'pending',
    });

    await matchRequest.save();
    res.status(201).json({ message: 'マッチングリクエストが送信されました' });
  } catch (err) {
    res.status(500).json({ error: 'エラーが発生しました', details: err.message });
  }
});

// マッチングリクエストのステータスを更新するエンドポイント
app.patch('/update-match-request/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const matchRequest = await MatchRequest.findById(id);

    if (!matchRequest) {
      return res.status(404).json({ error: 'マッチングリクエストが見つかりません' });
    }

    matchRequest.status = status;
    matchRequest.updatedAt = Date.now();
    await matchRequest.save();

    res.json({ message: `マッチングリクエストのステータスが '${status}' に更新されました` });
  } catch (err) {
    res.status(500).json({ error: 'エラーが発生しました', details: err.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
