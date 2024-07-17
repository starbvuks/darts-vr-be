// websockets.js
const { WebSocket } = require("ws");

module.exports = {
  broadcastFriendRequestNotification: (receiverId, notification, wss) => {
    if (!wss || !wss.clients) {
      console.error("WebSocket server instance is not available");
      return;
    }

    wss.clients.forEach((client) => {
      console.log(client.userId, receiverId, notification.senderId);
      if (
        client.readyState === WebSocket.OPEN &&
        (client.userId === receiverId || client.userId === notification.senderId)
      ) {
        client.send(
          JSON.stringify({
            ...notification,
            receiverId,
          })
        );
      }
    });
  },

  broadcastFriendRequestUnsentNotification: (senderId, notification, wss) => {
    if (!wss || !wss.clients) {
      console.error("WebSocket server instance is not available");
      return;
    }

    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        (client.userId === senderId ||
          client.userId === notification.receiverId)
      ) {
        client.send(
          JSON.stringify({
            ...notification,
            senderId,
          })
        );
      }
    });
  },

  broadcastFriendRequestAcceptedNotification: (
    receiverId,
    notification,
    wss
  ) => {
    if (!wss || !wss.clients) {
      console.error("WebSocket server instance is not available");
      return;
    }

    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        (client.userId === notification.senderId ||
          client.userId === notification.receiverId)
      ) {
        client.send(
          JSON.stringify({
            type: "friend_request_accepted",
            ...notification,
          })
        );
      }
    });
  },

  broadcastFriendRequestDeclinedNotification: (
    receiverId,
    notification,
    wss
  ) => {
    if (!wss || !wss.clients) {
      console.error("WebSocket server instance is not available");
      return;
    }

    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        (client.userId === notification.senderId ||
          client.userId === notification.receiverId)
      ) {
        client.send(
          JSON.stringify({
            type: "friend_request_declined",
            ...notification,
          })
        );
      }
    });
  },

  broadcastFriendRemovedNotification: (playerId, friendId, wss) => {
    if (!wss || !wss.clients) {
      console.error("WebSocket server instance is not available");
      return;
    }

    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        (client.userId === playerId || client.userId === friendId)
      ) {
        client.send(
          JSON.stringify({
            type: "friend_removed",
            playerId,
            friendId,
          })
        );
      }
    });
  },

  broadcastPlayerBlockedNotification: (playerId, blockedPlayerId, wss) => {
    if (!wss || !wss.clients) {
      console.error("WebSocket server instance is not available");
      return;
    }

    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        (client.userId === playerId || client.userId === blockedPlayerId)
      ) {
        client.send(
          JSON.stringify({
            type: "player_blocked",
            playerId,
            blockedPlayerId,
          })
        );
      }
    });
  },

  broadcastPlayerUnblockedNotification: (playerId, unblockedPlayerId, wss) => {
    if (!wss || !wss.clients) {
      console.error("WebSocket server instance is not available");
      return;
    }

    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        (client.userId === playerId || client.userId === unblockedPlayerId)
      ) {
        client.send(
          JSON.stringify({
            type: "player_unblocked",
            playerId,
            unblockedPlayerId,
          })
        );
      }
    });
  },

  broadcastPlayerStatusUpdateNotification: (playerId, newStatus, wss) => {
    if (!wss || !wss.clients) {
      console.error("WebSocket server instance is not available");
      return;
    }

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.userId === playerId) {
        client.send(
          JSON.stringify({
            type: "player_status_updated",
            playerId,
            newStatus,
          })
        );
      }
    });
  },
};
