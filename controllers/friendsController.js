const friendRequestService = require("../services/friendsService");
const authService = require("../services/auth/authService");

exports.sendFriendRequest = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    console.log(req.body)
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

exports.unsendFriendRequest = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { receiverId } = req.body;
    const senderId = req.userId;
    try {
      await friendRequestService.unsendFriendRequest(senderId, receiverId);
      res.json({ message: "Friend request unsent" });
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


exports.removeFriend = async (playerId, friendId) => {
  try {
    console.log(`Removing friend: playerId=${playerId}, friendId=${friendId}`);
    const { player, friend } = await friendsService.removeFriend(playerId, friendId);
    return { player, friend };
  } catch (error) {
    console.error(`Error handling remove friend: ${error}`);
    throw error;
  }
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

exports.searchUsers = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    try {
      const { username, page = 1, limit = 7 } = req.query;
      const { users, totalPages } = await friendRequestService.searchUsers(username, page, limit);
      res.json({ users, totalPages });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};
