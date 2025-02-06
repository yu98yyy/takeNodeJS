const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Profile = require("../profile"); // プロフィールモデルをインポート

const router = express.Router();

// `uploads/` フォルダがなければ作成
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// `multer` の設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // 画像を `uploads/` に保存
    },
    filename: (req, file, cb) => {
        cb(null, "profile-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// プロファイル一覧を取得するエンドポイント
router.get("/", async (req, res) => {
    try {
        const profiles = await Profile.find();
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ error: "エラーが発生しました" });
    }
});

// **✅ 画像付きプロフィール作成**
router.post("/profile/create", upload.single("image"), async (req, res) => {
  try {
      console.log("Received profile creation request");

      if (!req.file) {
          console.error("❌ No image received");
      } else {
          console.log("✅ Image received:", req.file.filename);
      }

      console.log("Request body:", req.body);

      const { userId, nickname, age, tags, message } = JSON.parse(req.body.json);

      if (!userId || !nickname || age == null || !tags || !Array.isArray(tags)) {
          return res.status(400).json({ success: false, message: "全てのフィールドを入力してください。" });
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ success: false, message: "無効なユーザーIDです。" });
      }

      if (typeof age !== "number" || age < 0) {
          return res.status(400).json({ success: false, message: "正しい年齢を入力してください。" });
      }

      const imageUrl = req.file ? "/uploads/" + req.file.filename : "/uploads/default_profile.jpg";

      const newProfile = new Profile({
          userId: new mongoose.Types.ObjectId(userId),
          nickname,
          age,
          tags: tags.slice(0, 10),
          message,
          icon: imageUrl
      });

      await newProfile.save();

      res.status(201).json({ success: true, message: "プロフィールが作成されました", profile: newProfile });
  } catch (err) {
      console.error("Error creating profile:", err);
      res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
  }
});

// **✅ 画像付きプロフィール更新**
router.put("/profile/update", upload.single("image"), async (req, res) => {
    try {
        const { userId, nickname, age, tags, message } = JSON.parse(req.body.json);

        if (!userId || !nickname || age == null || !tags || !message) {
            return res.status(400).json({ success: false, message: "全てのフィールドを入力してください。" });
        }

        const profile = await Profile.findOne({ userId });

        if (!profile) {
            return res.status(404).json({ success: false, message: "プロフィールが見つかりません。" });
        }

        // 画像のパスを更新
        const imageUrl = req.file ? "/uploads/" + req.file.filename : profile.icon;

        profile.nickname = nickname;
        profile.age = age;
        profile.tags = tags;
        profile.message = message;
        profile.icon = imageUrl;

        await profile.save();

        res.status(200).json({ success: true, message: "プロフィールが更新されました。", profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "サーバーエラーが発生しました。" });
    }
});

// **✅ `uploads/` フォルダを公開**
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;