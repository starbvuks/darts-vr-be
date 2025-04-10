const friendsService = require("../services/friendsService");
const authService = require("../services/auth/authService");
const webSocketHandler = require("../sockets/websockets");
const gameSockets = require("../sockets/gameSockets");

exports.sendFriendRequest = async (req, res, wss) => {
  authService.validateJwt(req, res, async () => {
    const { senderId, receiverId } = req.body;
    // const senderId = req.userId;
    try {
      const result = await friendsService.sendFriendRequest(
        senderId,
        receiverId,
      );
      if (result.error) {
        res.status(400).json({ error: result.error });
      } else {
        const { sender, receiver } = result;
        webSocketHandler.broadcastFriendRequestNotification(
          receiverId,
          {
            type: "friend_request_received",
            receiverId,
            senderId,
            senderUsername: sender.username,
            timestamp: new Date().toISOString(),
          },
          wss,
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
    const { senderId, receiverId } = req.body;
    // const senderId = req.userId;
    try {
      const result = await friendsService.unsendFriendRequest(
        senderId,
        receiverId,
      );
      if (result.error) {
        webSocketHandler.broadcastFriendRequestUnsentNotification(
          senderId,
          {
            type: "friend_request_unsent_error",
            error: result.error,
          },
          wss,
        );
        res.status(400).json({ error: result.error });
      } else {
        const { sender, receiver } = result;
        webSocketHandler.broadcastFriendRequestUnsentNotification(
          senderId,
          {
            type: "friend_request_unsent",
            senderId,
            receiverId,
            receiverUsername: receiver.username,
          },
          wss,
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
        receiverId,
      );
      if (result.error) {
        res.status(400).json({ error: result.error });
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
          wss,
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
        receiverId,
      );
      if (result.error) {
        res.status(400).json({ error: result.error });
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
          wss,
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
    const { senderId, receiverId } = req.body;
    // const playerId = req.userId;
    try {
      const result = await friendsService.removeFriend(senderId, receiverId);
      if (result.error) {
        webSocketHandler.broadcastFriendRemovedNotification(
          senderId,
          {
            type: "friend_remove_error",
            error: result.error,
          },
          wss,
        );
        res.status(400).json({ error: result.error });
      } else {
        const { sender, receiver } = result;
        webSocketHandler.broadcastFriendRemovedNotification(
          senderId,
          {
            senderId,
            receiverId,
            senderUsername: sender.username,
            receiverUsername: receiver.username,
          },
          wss,
        );
        res.json({ success: true });
      }
    } catch (error) {
      console.error(`Error handling remove friend request: ${error}`);
      res.status(400).json({ message: error.message });
    }
  });
};

exports.blockPlayer = async (req, res, wss) => {
  authService.validateJwt(req, res, async () => {
    const { senderId, receiverId } = req.body;
    // const playerId = req.userId;
    try {
      const result = await friendsService.blockPlayer(senderId, receiverId);
      if (result.error) {
        webSocketHandler.broadcastFriendRequestNotificationError(
          senderId,
          {
            type: "player_block_error",
            error: result.error,
          },
          wss,
        );
        res.status(400).json({ error: result.error });
      } else {
        const { sender, receiver } = result;
        webSocketHandler.broadcastPlayerBlockedNotification(
          senderId,
          {
            senderId,
            receiverId,
            senderUsername: sender.username,
            receiverUsername: receiver.username,
          },
          wss,
        );
        res.json({ success: true });
      }
    } catch (error) {
      console.error(`Error handling block player request: ${error}`);
      res.status(400).json({ message: error.message });
    }
  });
};

exports.unblockPlayer = async (req, res, wss) => {
  authService.validateJwt(req, res, async () => {
    const { senderId, receiverId } = req.body;
    // const playerId = req.userId;
    try {
      const result = await friendsService.unblockPlayer(senderId, receiverId);
      if (result.error) {
        webSocketHandler.broadcastFriendRequestNotificationError(
          senderId,
          {
            type: "player_unblock_error",
            error: result.error,
          },
          wss,
        );
        res.status(400).json({ error: result.error });
      } else {
        const { sender, receiver } = result;
        webSocketHandler.broadcastPlayerUnblockedNotification(
          senderId,
          {
            senderId,
            receiverId,
            senderUsername: sender.username,
            receiverUsername: receiver.username,
          },
          wss,
        );
        res.json({ success: true });
      }
    } catch (error) {
      console.error(`Error handling unblock player request: ${error}`);
      res.status(400).json({ message: error.message });
    }
  });
};

exports.updatePlayerStatus = async (senderId, newStatus, wss) => {
  try {
    const player = await friendsService.updatePlayerStatus(senderId, newStatus);
    webSocketHandler.broadcastPlayerStatusUpdateNotification(
      senderId,
      {
        senderId,
        newStatus,
      },
      wss,
    );
    return { success: true, player };
  } catch (error) {
    console.error(`Error updating player status: ${error}`);
    return { success: false, message: error.message };
  }
};

exports.searchFriends = async (req, res) => {
  authService.validateJwt(req, res, async () => {
    const { searchParam } = req.body;

    try {
      const results = await friendsService.searchUsers(searchParam);
      return res.status(200).json({ success: true, users: results });
    } catch (error) {
      console.error("Error in searchFriends controller:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to search for friends." });
    }
  });
};

exports.notifyLobbyCreated = async (req, res, wss) => {
  authService.validateJwt(req, res, async () => {
    const { lobbyId, playerId } = req.body;
    
    try {
      // Validate player ID
      const playerExists = await friendsService.validatePlayerExists(playerId);
      if (!playerExists) {
        return res.status(400).json({ error: "Player not found" });
      }

      // Send socket notification
      gameSockets.handleLobbyCreatedNotification(playerId, lobbyId, wss);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error notifying lobby creation:", error);
      res.status(500).json({ message: "Failed to notify lobby creation" });
    }
  });
};
