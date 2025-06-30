const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  chatWithMistral,
  getChatHistory,
  imageQuestionHandler,
  pdfQuestionHandler,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

// 💾 Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// ✅ Routes
router.post("/", protect, chatWithMistral);
router.get("/history", protect, getChatHistory);
router.post("/image", protect, upload.single("image"), imageQuestionHandler);
router.post("/pdf", protect, upload.single("pdf"), pdfQuestionHandler);

module.exports = router;
