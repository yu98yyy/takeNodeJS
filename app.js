// const mongoose = require('mongoose');
// const express = require('express');

// const app = express();

// // MongoDB接続
// const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';
// mongoose.connect(mongoURI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected!'))
// .catch((err) => console.log(err));

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// app.listen(3000, () => {
//   console.log('Server running on port 3000');
// });


const mongoose = require('mongoose');

// MongoDB接続URI
const uri = 'mongodb://localhost:28017/mydatabase';

// MongoDBへ接続
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

// 簡単なサーバー作成（Expressの場合）
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('MongoDB Connection Successful!');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
