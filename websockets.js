// websockets.js
const { WebSocket } = require("ws");

module.exports = {
  broadcastFriendRequestNotification: (receiverId, notification, wss) => {
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

  // Gamemodes
  handleMatchCreatedNotification: (channel, message, wss) => {
    const { matchId, players } = JSON.parse(message);
    players.forEach((playerId) => {
      wss.clients.forEach((client) => {
        if (client.userId === playerId && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "match_created",
              matchId,
            })
          );
        }
      });
    });
  },

  sendZombiesInvitation: (receiverId, senderId, matchId, wss) => {
    wss.clients.forEach((client) => {
      if (
        client.userId === receiverId &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(
          JSON.stringify({
            type: "zombies_invitation",
            senderId,
            matchId,
          })
        );
      }
    });
  },

  sendKillstreakInvitation: (receiverId, senderId, matchId, wss) => {
    wss.clients.forEach((client) => {
      if (
        client.userId === receiverId &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(
          JSON.stringify({
            type: "killstreak_invitation",
            senderId,
            matchId,
          })
        );
      }
    });
  },

  send501Invitation: (receiverId, senderId, matchId, wss) => {
    wss.clients.forEach((client) => {
      if (
        client.userId === receiverId &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(
          JSON.stringify({
            type: "501_invitation",
            senderId,
            matchId,
          })
        );
      }
    });
  },

  init: (wss) => {
    RedisService.subscribeToChannel('501-2-match-created', (channel, message) => {
      this.handleMatchCreatedNotification(channel, message, wss);
    });

    RedisService.subscribeToChannel('501-3-match-created', (channel, message) => {
      this.handleMatchCreatedNotification(channel, message, wss);
    });

    RedisService.subscribeToChannel('501-4-match-created', (channel, message) => {
      this.handleMatchCreatedNotification(channel, message, wss);
    });

    RedisService.subscribeToChannel('killstreak-2-match-created', (channel, message) => {
      this.handleMatchCreatedNotification(channel, message, wss);
    });

    RedisService.subscribeToChannel('zombies-2-match-created', (channel, message) => {
      this.handleMatchCreatedNotification(channel, message, wss);
    });

    // Add more subscriptions for other game types and player counts
  },

  handleMatchCreatedNotification: (channel, message, wss) => {
    const { matchId, players } = JSON.parse(message);
    players.forEach((playerId) => {
      wss.clients.forEach((client) => {
        if (client.userId === playerId && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "match_created",
              matchId,
            })
          );
        }
      });
    });
  },
};
