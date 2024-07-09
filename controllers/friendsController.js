const friendsService = require("../services/friendsService");
const authService = require("../services/auth/authService");
const webSocketHandler = require("../websockets");

exports.sendFriendRequest = async (req, res, wss) => {
  authService.validateJwt(req, res, async () => {
    const { senderId, receiverId } = req.body;
    // const senderId = req.userId;
    try {
      const result = await friendsService.sendFriendRequest(
        senderId,
        receiverId
      );
      if (result.error) {
        res.json({ error: result.error });
      } else {
        const { sender, receiver } = result;
        webSocketHandler.broadcastFriendRequestNotification(
          receiverId,
          {
            type: "friend_request_received",
            senderId,
            senderUsername: sender.username,
            timestamp: new Date().toISOString(),
          },
          wss
        );
        res.json({ success: true });
      }
    } catch (err) {
      console.error(`Error handling friend request: ${err}`);
      res.status(400).json({ message: err.message });
    }
  });
};

exports.unsendFriendRequest = async (req, res, wss) => {
  authService.validateJwt(req, res, async () => {
    const { receiverId } = req.body;
    const senderId = req.userId;
    try {
      const result = await friendsService.unsendFriendRequest(
        senderId,
        receiverId
      );
      if (result.error) {
        webSocketHandler.broadcastFriendRequestUnsentNotification(
          senderId,
          {
            type: "friend_request_unsent_error",
            error: result.error,
          },
          wss
        );
        res.json({ error: result.error });
      } else {
        const { sender, receiver } = result;
        webSocketHandler.broadcastFriendRequestUnsentNotification(
          senderId,
          {
            type: "friend_request_unsent",
            receiverId,
            receiverUsername: receiver.username,
          },
          wss
        );
        res.json({ success: true });
      }
    } catch (error) {
      console.error(`Error handling unsend friend request: ${error}`);
      res.status(400).json({ message: error.message });
    }
  });
};

exports.acceptFriendRequest = async (req, res, wss) => {
  authService.validateJwt(req, res, async () => {
    const { senderId, receiverId } = req.body;
    // const senderId = req.userId;
    try {
      const result = await friendsService.acceptFriendRequest(
        senderId,
        receiverId
      );
      if (result.error) {
        res.json({ error: result.error });
      } else {
        const { sender, receiver } = result;
        webSocketHandler.broadcastFriendRequestAcceptedNotification(
          receiverId,
          {
            senderId,
            receiverId,
            senderUsername: sender.username,
            receiverUsername: receiver.username,
          },
          req.wss
        );
        res.json({ success: true });
      }
    } catch (error) {
      console.error(`Error handling accept friend request: ${error}`);
      res.status(400).json({ message: "Failed to accept friend request" });
    }
  });
};

exports.declineFriendRequest = async (req, res, wss) => {
  authService.validateJwt(req, res, async () => {
    const { senderId, receiverId } = req.body;
    try {
      const result = await friendsService.declineFriendRequest(
        senderId,
        receiverId
      );
      if (result.error) {
        res.json({ error: result.error });
      } else {
        const { sender, receiver } = result;
        webSocketHandler.broadcastFriendRequestDeclinedNotification(
          receiverId,
          {
            senderId,
            receiverId,
            senderUsername: sender.username,
            receiverUsername: receiver.username,
          },
          req.wss
        );
        res.json({ success: true });
      }
    } catch (error) {
      console.error(`Error handling decline friend request: ${error}`);
      res.status(500).json({ message: "Failed to decline friend request" });
    }
  });
};

exports.removeFriend = async (req, res, wss) => {
  authService.validateJwt(req, res, async () => {
    const { friendId } = req.body;
    const playerId = req.userId;
    try {
      const result = await friendsService.removeFriend(playerId, friendId);
      if (result.error) {
        webSocketHandler.broadcastFriendRemovedNotification(
          playerId,
          {
            type: "friend_remove_error",
            error: result.error,
          },
          wss
        );
        res.json({ error: result.error });
      } else {
        const { player, friend } = result;
        webSocketHandler.broadcastFriendRemovedNotification(
          playerId,
          friendId,
          wss
        );
        res.json({ success: true });
      }
    } catch (error) {
      console.error(`Error handling remove friend request: ${error}`);
      res.status(400).json({ message: error.message });
    }
  });
};

exports.blockPlayer = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { blockedPlayerId } = req.body;
    const playerId = req.userId;
    try {
      const { player, blockedPlayer } = await friendsService.blockPlayer(
        playerId,
        blockedPlayerId
      );
      webSocketHandler.broadcastPlayerBlockedNotification(
        playerId,
        blockedPlayerId,
        req.wss
      );
      res.json({ player, blockedPlayer });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

exports.unblockPlayer = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { blockedPlayerId } = req.body;
    const playerId = req.userId;
    try {
      const { player, unblockedPlayer } = await friendsService.unblockPlayer(
        playerId,
        blockedPlayerId
      );
      webSocketHandler.broadcastPlayerUnblockedNotification(
        playerId,
        blockedPlayerId,
        req.wss
      );
      res.json({ player, unblockedPlayer });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};

exports.updatePlayerStatus = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { newStatus } = req.body;
    const playerId = req.userId;
    try {
      const player = await friendsService.updatePlayerStatus(
        playerId,
        newStatus,
        req.wss
      );
      webSocketHandler.broadcastPlayerStatusUpdateNotification(
        playerId,
        newStatus,
        req.wss
      );
      res.json(player);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
};
