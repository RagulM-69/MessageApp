// backend/routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware } = require("./auth");

// GET user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
