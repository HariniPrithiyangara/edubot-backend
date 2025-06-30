const express = require("express");
const cors = require("cors");

// ✅ Import routes
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ✅ CORS setup for frontend
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ✅ JSON parser
app.use(express.json());

// ✅ Static uploads (e.g., avatar images)
app.use("/uploads", express.static("uploads"));

// ✅ All API routes
app.use("/api/auth", authRoutes); // /signup, /login, /forgot-password
app.use("/api/chat", chatRoutes); // Your chatbot/chat APIs
app.use("/api/user", userRoutes); // Profile, settings, etc.

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ EduBot backend is running");
});

module.exports = app;
