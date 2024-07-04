const jwt = require("jsonwebtoken");
const Player = require("./models/Player");
const friendsService = require("./services/friendsService");
const url = require("url");
const { WebSocket } = require("ws");

module.exports = (wss) => {
  wss.on("connection", (ws, req) => {
    const urlParams = new url.URL(req.url, "http://localhost:3000");
    const token = urlParams.searchParams.get("token");

    if (!token) {
      console.error("No token provided");
      ws.close(4401, "Unauthorized");
      return;
    }

    console.log(token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const playerId = decoded.userID;
      console.log(playerId);

      ws.on("message", (message) => {
        try {
          const { type, senderId, receiverId, newStatus } = JSON.parse(message);

          switch (type) {
            case "send_friend_request":
              handleSendFriendRequest(senderId, receiverId, ws, wss);
              break;
            case "unsend_friend_request":
              handleUnsendFriendRequest(senderId, receiverId, ws, wss);
              break;
            case "accept_friend_request":
              handleAcceptFriendRequest(senderId, receiverId, ws, wss);
              break;
            case "decline_friend_request":
              handleDeclineFriendRequest(senderId, receiverId, ws, wss);
              break;
            case "remove_friend":
              handleRemoveFriendRequest(senderId, receiverId, ws, wss);
              break;
            case "block_player":
              handleBlockPlayer(senderId, receiverId, ws, wss);
              break;
            case "unblock_player":
              handleUnblockPlayer(senderId, receiverId, ws, wss);
              break;
            case "update_player_status":
              handleUpdatePlayerStatus(senderId, newStatus, ws, wss);
              break;
            default:
              console.log("Invalid message");
              break;
          }
        } catch (err) {
          console.error(`Error handling WebSocket message: ${err}`);
          ws.send(JSON.stringify({ error: "Error handling request" }));
        }
      });

      ws.on("close", () => {
        console.log(`user has disconnected`);
      });
    } catch (err) {
      console.error("Error verifying token:", err);
      ws.close();
    }
  });

  async function handleSendFriendRequest(senderId, receiverId, ws, wss) {
    try {
      const result = await friendsService.sendFriendRequest(
        senderId,
        receiverId
      );
      if (result.error) {
        console.error(result.error);
        ws.send(JSON.stringify({ error: result.error }));
      } else {
        const { sender, receiver } = result;
        broadcastFriendRequestNotification(
          receiverId,
          {
            type: "friend_request_received",
            senderId,
            senderUsername: sender.username,
            timestamp: new Date().toISOString(),
          },
          wss
        );
        ws.send(JSON.stringify({ success: true }));
      }
    } catch (err) {
      console.error(`Error handling friend request: ${err}`);
      ws.send(JSON.stringify({ error: err.message }));
    }
  }
};

async function handleUnsendFriendRequest(senderId, receiverId, ws, wss) {
  try {
    const result = await friendsService.unsendFriendRequest(senderId, receiverId);
    if (result.error) {
      console.error(result.error);
      ws.send(JSON.stringify({ error: result.error }));
    } else {
      const { sender, receiver } = result;
      broadcastFriendRequestNotification(
        senderId,
        {
          type: "friend_request_unsent",
          receiverId,
          receiverUsername: receiver.username,
          timestamp: new Date().toISOString(),
        },
        wss
      );
      ws.send(JSON.stringify({ success: true }));
    }
  } catch (err) {
    console.error(`Error unsending friend request: ${err}`);
    ws.send(JSON.stringify({ error: err.message }));
  }
}

// HANDLERS

async function handleAcceptFriendRequest(senderId, receiverId, ws, wss) {
  try {
    const result = await friendsService.acceptFriendRequest(
      senderId,
      receiverId
    );
    if (result.error) {
      console.error(result.error);
      ws.send(JSON.stringify({ error: result.error }));
    } else {
      const { sender, receiver } = result;

      broadcastFriendRequestNotification(
        sender._id,
        {
          type: "friend_request_accepted",
          senderId: receiver._id,
          senderUsername: receiver.username,
        },
        wss
      );
      broadcastFriendRequestNotification(
        receiver._id,
        {
          type: "friend_request_accepted",
          senderId: sender._id,
          senderUsername: sender.username,
        },
        wss
      );
      ws.send(JSON.stringify({ success: true }));
    }
  } catch (err) {
    console.error(`Error handling accept friend request: ${err}`);
    ws.send(JSON.stringify({ error: err.message }));
  }
}

async function handleDeclineFriendRequest(senderId, receiverId, ws, wss) {
  try {
    const result = await friendsService.declineFriendRequest(
      senderId,
      receiverId
    );
    if (result.error) {
      console.error(result.error);
      ws.send(JSON.stringify({ error: result.error }));
    } else {
      const { sender, receiver } = result;

      broadcastFriendRequestNotification(
        sender._id,
        {
          type: "friend_request_declined",
          senderId: receiver._id,
          senderUsername: receiver.username,
        },
        wss
      );
      broadcastFriendRequestNotification(
        receiver._id,
        {
          type: "friend_request_declined",
          senderId: sender._id,
          senderUsername: sender.username,
        },
        wss
      );
      ws.send(JSON.stringify({ success: true }));
    }
  } catch (err) {
    console.error(`Error handling decline friend request: ${err}`);
    ws.send(JSON.stringify({ error: err.message }));
  }
}

async function handleRemoveFriendRequest(senderId, recieverId, ws, wss) {
  try {
    const result = await friendsService.removeFriend(senderId, recieverId);

    if (result.error) {
      console.error(result.error);
      ws.send(JSON.stringify({ error: result.error }));
    } else {
      const { sender, receiver } = result;

      broadcastFriendRequestNotification(
        sender._id,
        {
          type: "friend_removed",
          receieverId: receiver._id,
          receieverUsername: receiver.username,
        },
        wss
      );
    }
  } catch (err) {
    console.error(`Error handling remove friend request: ${err}`);
    ws.send(JSON.stringify({ error: err.message }));
  }
}

async function handleBlockPlayer(senderId, recieverId, ws, wss) {
  try {
    const result = await friendsService.blockPlayer(senderId, recieverId);

    if (result.error) {
      console.error(result.error);
      ws.send(JSON.stringify({ error: result.error }));
    } else {
      const { sender, receiver } = result;

      broadcastFriendRequestNotification(
        sender._id,
        {
          type: "player_blocked",
          receieverId: receiver._id,
          receieverUsername: receiver.username,
        },
        wss
      );
    }
  } catch (err) {
    console.error(`Error handling player block: ${err}`);
    ws.send(JSON.stringify({ error: err.message }));
  }
}

async function handleUnblockPlayer(senderId, recieverId, ws, wss) {
  try {
    const result = await friendsService.unblockPlayer(senderId, recieverId);

    if (result.error) {
      console.error(result.error);
      ws.send(JSON.stringify({ error: result.error }));
    } else {
      const { sender, receiver } = result;

      broadcastFriendRequestNotification(
        sender._id,
        {
          type: "player_unblocked",
          receieverId: receiver._id,
          receieverUsername: receiver.username,
        },
        wss
      );
    }
  } catch (err) {
    console.error(`Error handling player block: ${err}`);
    ws.send(JSON.stringify({ error: err.message }));
  }
}

async function handleUpdatePlayerStatus(senderId, newStatus, ws, wss) {
  try {
    const result = await friendsService.updatePlayerStatus(senderId, newStatus);

    if (result.error) {
      console.error(result.error);
      ws.send(JSON.stringify({ error: result.error }));
    } else {
      const { player } = result;

      broadcastFriendRequestNotification(
        player._id,
        {
          type: "player_status_updated",
          playerId: player._id,
          playerUsername: player.username,
        },
        wss
      );
    }
  } catch (err) {
    console.error(`Error handling player status update: ${err}`);
    ws.send(JSON.stringify({ error: err.message }));
  }
}

// BROADCASTS
function broadcastFriendRequestNotification(receiverId, notification, wss) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          ...notification,
          receiverId,
        })
      );
    }
  });
}

