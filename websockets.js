const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Player = require('./models/Player');
const friendsService = require('./services/friendsService');

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const token = req.headers.authorization;
    if (!token) {
      console.error('No token provided');
      ws.close(4401, 'Unauthorized');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const playerId = decoded.userID;

      console.log(playerId)
      console.log(ws)

      Player.findByIdAndUpdate(
        playerId,
        { $addToSet: { 'profile.socketIds': ws.id } },
        { new: true, upsert: true }
      )
        .then((player) => {
          console.log(`Player ${player.username} connected with socket ID ${ws.id}`);
        })
        .catch((err) => {
          console.error(`Error storing socket ID for player ${playerId}: ${err}`);
        });

      // Listen for friend-related messages
      ws.on('message', (message) => {
        try {
          const { type, senderId, receiverId } = JSON.parse(message);

          switch (type) {
            case 'friend_request':
              handleFriendRequest(senderId, receiverId, ws, playerId);
              break;
            case 'accept_friend_request':
              handleAcceptFriendRequest(senderId, receiverId, ws, playerId);
              break;
            case 'decline_friend_request':
              handleDeclineFriendRequest(senderId, receiverId, ws, playerId);
              break;
            case 'remove_friend':
              handleRemoveFriend(playerId, receiverId, ws);
              break;
            case 'block_player':
              handleBlockPlayer(playerId, receiverId, ws);
              break;
            default:
              console.error(`Unknown message type: ${type}`);
          }
        } catch (err) {
          console.error(`Error handling WebSocket message: ${err}`);
          ws.send(JSON.stringify({ error: 'Error handling request' }));
        }
      });

      // Clean up when the connection is closed
      ws.on('close', () => {
        Player.findByIdAndUpdate(
          playerId,
          { $pull: { 'profile.socketIds': ws.id } },
          { new: true }
        )
          .then((player) => {
            console.log(`Player ${player.username} disconnected with socket ID ${ws.id}`);
          })
          .catch((err) => {
            console.error(`Error removing socket ID for player ${playerId}: ${err}`);
          });
      });
    } catch (err) {
      console.error('Error verifying token:', err);
      ws.close();
    }
  });

  async function handleFriendRequest(senderId, receiverId, ws, playerId) {
    try {
      const { sender, receiver } = await friendsService.sendFriendRequest(senderId, receiverId);
      broadcastFriendRequestNotification(receiverId, {
        type: 'friend_request_received',
        senderId,
        senderUsername: sender.username,
        timestamp: new Date().toISOString(),
      });
      ws.send(JSON.stringify({ success: true }));
    } catch (err) {
      console.error(`Error handling friend request: ${err}`);
      ws.send(JSON.stringify({ error: err.message }));
    }
  }

  async function handleAcceptFriendRequest(senderId, receiverId, ws, playerId) {
    try {
      const { sender, receiver } = await friendsService.acceptFriendRequest(senderId, receiverId);
      broadcastFriendRequestNotification(sender._id, {
        type: 'friend_request_accepted',
        senderId: receiver._id,
        senderUsername: receiver.username,
      });
      broadcastFriendRequestNotification(receiver._id, {
        type: 'friend_request_accepted',
        senderId: sender._id,
        senderUsername: sender.username,
      });
      ws.send(JSON.stringify({ success: true }));
    } catch (err) {
      console.error(`Error handling accept friend request: ${err}`);
      ws.send(JSON.stringify({ error: err.message }));
    }
  }

  async function handleDeclineFriendRequest(senderId, receiverId, ws) {
    try {
      const receiver = await friendsService.declineFriendRequest(senderId, receiverId);
      broadcastFriendRequestNotification(senderId, {
        type: 'friend_request_declined',
        senderId: receiverId,
        senderUsername: receiver.username,
      });
      ws.send(JSON.stringify({ success: true }));
    } catch (err) {
      console.error(`Error handling decline friend request: ${err}`);
      ws.send(JSON.stringify({ error: err.message }));
    }
  }

  async function handleRemoveFriend(playerId, friendId, ws) {
    try {
      const player = await friendsService.removeFriend(playerId, friendId);
      broadcastFriendRequestNotification(playerId, {
        type: 'friend_removed',
        playerId: friendId,
      });
      ws.send(JSON.stringify({ success: true }));
    } catch (err) {
      console.error(`Error handling remove friend: ${err}`);
      ws.send(JSON.stringify({ error: err.message }));
    }
  }

  async function handleBlockPlayer(playerId, blockedPlayerId, ws) {
    try {
      const player = await friendsService.blockPlayer(playerId, blockedPlayerId);
      broadcastFriendRequestNotification(playerId, {
        type: 'player_blocked',
        playerId: blockedPlayerId,
      });
      ws.send(JSON.stringify({ success: true }));
    } catch (err) {
      console.error(`Error handling block player: ${err}`);
      ws.send(JSON.stringify({ error: err.message }));
    }
  }

  function broadcastFriendRequestNotification(playerId, notification) {
    Player.findById(playerId)
      .then((player) => {
        player.socketIds.forEach((socketId) => {
          wss.clients.forEach((client) => {
            if (client.id === socketId) {
              client.send(JSON.stringify(notification));
            }
          });
        });
      })
      .catch((err) => {
        console.error(`Error broadcasting notification to player ${playerId}: ${err}`);
      });
  }
};