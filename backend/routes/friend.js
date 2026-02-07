const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Friend = require("../models/Friend");
const User = require("../models/User");

// Send friend request
router.post("/request/:id", auth, async (req, res) => {
  try {
    const recipientId = req.params.id;

    const existing = await Friend.findOne({
      requester: req.user.id,
      recipient: recipientId,
    });
    if (existing) return res.status(400).json({ message: "Request already sent" });

    const friendRequest = new Friend({
      requester: req.user.id,
      recipient: recipientId,
      status: "pending",
    });
    await friendRequest.save();
    res.status(201).json(friendRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept friend request
router.post("/accept/:id", auth, async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await Friend.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "accepted";
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all friends
router.get("/", auth, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
      status: "accepted",
    }).populate("requester recipient", "username email");
    res.json(friends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get pending requests
router.get("/requests", auth, async (req, res) => {
  try {
    const requests = await Friend.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("requester", "username email");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
