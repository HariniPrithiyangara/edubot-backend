const express = require("express");
const cors = require("cors");

// ✅ Import routes
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ✅ CORS setup for both local and deployed frontend (NO trailing slashes or spaces)
const allowedOrigins = [
  "http://localhost:5173", // Local dev
  "http://localhost:5174", // Local dev alternate port
  "https://edubot-assist.vercel.app",
  "https://edubot-815x.vercel.app", // Final deployed domain
  process.env.FRONTEND_URL // Allow URL from .env
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ✅ JSON Body Parser
app.use(express.json());

// ✅ Serve static files (for uploaded images etc.)
app.use("/uploads", express.static("uploads"));

// ✅ Register all API routes
app.use("/api/auth", authRoutes);   // Login, Register, etc.
app.use("/api/chat", chatRoutes);   // Chatbot conversations
app.use("/api/user", userRoutes);   // User profile and settings

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ EduBot backend is running!");
});

// ✅ Export app for server.js or main entry
module.exports = app;
