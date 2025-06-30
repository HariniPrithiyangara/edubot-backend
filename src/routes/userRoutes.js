const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const { protect } = require("../middleware/authMiddleware");
const {
  updateProfile,
  changePassword,
  deleteAccount,
  uploadAvatar
} = require("../controllers/userController");

// Setup Multer for avatar upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 🔁 Update name, email, avatar (URL string)
router.put("/update-profile", protect, updateProfile);

// 🔐 Change password
router.post("/change-password", protect, changePassword);

// 🗑 Delete account
router.delete("/delete-account", protect, deleteAccount);

// 🖼 Upload avatar (file)
router.post("/upload-avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;
