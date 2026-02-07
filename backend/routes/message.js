// backend/routes/message.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Send message (store in DB)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      text,
    });
    await message.save();
    res.json({ message: "Message sent ✅", data: message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages with a specific friend
router.get("/:friendId", authMiddleware, async (req, res) => {
  try {
    const { friendId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: friendId },
        { sender: friendId, recipient: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get unread message count
router.get("/unread", authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.id,
      read: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
