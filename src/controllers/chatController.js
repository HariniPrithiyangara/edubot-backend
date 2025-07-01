const axios = require("axios");
const Chat = require("../models/chatModel");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

// ✅ Text-based Chat with Mistral
const chatWithMistral = async (req, res) => {
  const { text, subject = "general" } = req.body;

  try {
    await Chat.create({ user: req.user.id, sender: "user", message: `[${subject}] ${text}` });

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: `You are EduBot, a helpful AI tutor for subject: ${subject}`,
          },
          { role: "user", content: text },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botReply = response.data.choices?.[0]?.message?.content || "No response from AI.";

    await Chat.create({ user: req.user.id, sender: "bot", message: botReply });

    res.json({ botReply });
  } catch (error) {
    console.error("❌ chatWithMistral error:", error.response?.data || error.message);
    res.status(500).json({ botReply: "⚠️ AI failed to respond." });
  }
};

// ✅ Chat History
const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id }).sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    console.error("❌ getChatHistory error:", error.message);
    res.status(500).json({ message: "Failed to load chat history." });
  }
};

// ✅ Image Upload → OCR → AI (with subject)
const imageQuestionHandler = async (req, res) => {
  try {
    const imagePath = req.file.path;
    const subject = req.body.subject || "general";

    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath));
    form.append("OCREngine", "2");
    form.append("language", "eng");

    const ocrResponse = await axios.post("https://api.ocr.space/parse/image", form, {
      headers: {
        apikey: process.env.OCR_API_KEY,
        ...form.getHeaders(),
      },
    });

    const parsedText = ocrResponse.data?.ParsedResults?.[0]?.ParsedText?.trim();

    if (!parsedText) {
      return res.status(400).json({ message: "❌ No readable text in image." });
    }

    await Chat.create({
      user: req.user.id,
      sender: "user",
      message: `[Image - ${subject}]: ${parsedText}`,
    });

    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: `You are EduBot, a helpful AI tutor for subject: ${subject}`,
          },
          { role: "user", content: parsedText },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botReply = aiResponse.data.choices?.[0]?.message?.content || "No AI reply.";

    await Chat.create({ user: req.user.id, sender: "bot", message: botReply });

    fs.unlink(imagePath, () => {});
    res.json({ botReply });
  } catch (error) {
    console.error("❌ imageQuestionHandler error:", error.response?.data || error.message);
    res.status(500).json({ message: "Image Q&A failed." });
  }
};

// ✅ PDF Upload → Extract Text → AI (with subject)
const pdfQuestionHandler = async (req, res) => {
  try {
    const pdfPath = req.file.path;
    const subject = req.body.subject || "general";

    const fileData = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(fileData);
    const parsedText = pdfData.text.trim();

    if (!parsedText) {
      return res.status(400).json({ message: "❌ No text found in PDF." });
    }

    await Chat.create({
      user: req.user.id,
      sender: "user",
      message: `[PDF - ${subject}]: ${parsedText.slice(0, 1000)}...`,
    });

    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: `You are EduBot, a helpful AI tutor for subject: ${subject}`,
          },
          { role: "user", content: parsedText.slice(0, 4000) },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botReply = aiResponse.data.choices?.[0]?.message?.content || "No AI reply.";

    await Chat.create({ user: req.user.id, sender: "bot", message: botReply });

    fs.unlink(pdfPath, () => {});
    res.json({ botReply });
  } catch (error) {
    console.error("❌ pdfQuestionHandler error:", error.message);
    res.status(500).json({ message: "PDF Q&A failed." });
  }
};

module.exports = {
  chatWithMistral,
  getChatHistory,
  imageQuestionHandler,
  pdfQuestionHandler,
};