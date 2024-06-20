const express = require("express");
const router = express.Router();
const friendRequestService = require("../services/friendsService");

router.post("/send-request", async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const updatedSender = await friendRequestService.sendFriendRequest(senderId, receiverId);
    res.json(updatedSender);
  } catch (error) {
    res.status(500).json({ message: "Failed to send friend request" });
  }
});

router.post("/accept-request", async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const { sender, receiver } = await friendRequestService.acceptFriendRequest(senderId, receiverId);
    res.json({ sender, receiver });
  } catch (error) {
    res.status(500).json({ message: "Failed to accept friend request" });
  }
});

router.post("/decline-request", async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const receiver = await friendRequestService.declineFriendRequest(senderId, receiverId);
    res.json(receiver);
  } catch (error) {
    res.status(500).json({ message: "Failed to decline friend request" });
  }
});

module.exports = router;
