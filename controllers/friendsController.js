const friendRequestService = require("../services/friendsService");
const authService = require("../services/auth/authService");

exports.sendFriendRequest = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { receiverId } = req.body;
    const senderId = req.userId;
    console.log("Sender ID:", senderId);
    console.log("Receiver ID:", receiverId);
    try {
      const { sender, receiver } = await friendRequestService.sendFriendRequest(senderId, receiverId);
      res.json({ sender, receiver });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

exports.acceptFriendRequest = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { receiverId } = req.body;
    const senderId = req.userId;
    try {
      const { sender, receiver } = await friendRequestService.acceptFriendRequest(senderId, receiverId);
      res.json({ sender, receiver });
    } catch (error) {
      res.status(400).json({ message: "Failed to accept friend request" });
    }
  });
};

exports.declineFriendRequest = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { receiverId } = req.body;
    const senderId = req.userId;
    try {
      const receiver = await friendRequestService.declineFriendRequest(senderId, receiverId);
      res.json(receiver);
    } catch (error) {
      res.status(500).json({ message: "Failed to decline friend request" });
    }
  });
};

exports.removeFriend = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { friendId } = req.body;
    const playerId = req.userId;
    try {
      const player = await friendRequestService.removeFriend(playerId, friendId);
      res.json(player);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

exports.blockPlayer = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { blockedPlayerId } = req.body;
    const playerId = req.userId;
    try {
      const player = await friendRequestService.blockPlayer(playerId, blockedPlayerId);
      res.json(player);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
}