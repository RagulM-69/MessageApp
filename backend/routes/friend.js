// backend/routes/friend.js
const express = require("express");
const router = express.Router();
const Friend = require("../models/Friend");
const authMiddleware = require("../middleware/auth"); // your JWT middleware
const User = require("../models/User");

// GET accepted friends for logged-in user
router.get("/accepted", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    // Find all friendships where status is "accepted"
    const friends = await Friend.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: "accepted",
    }).populate([
      { path: "requester", select: "username _id email" },
      { path: "recipient", select: "username _id email" },
    ]);

    // Map to only include the friend (not self)
    const acceptedFriends = friends.map((f) => {
      if (f.requester._id.toString() === userId) return f.recipient;
      return f.requester;
    });

    res.json(acceptedFriends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
