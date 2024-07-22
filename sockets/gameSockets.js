// websockets.js
const { WebSocket } = require("ws");

module.exports = {
  handleMatchCreatedNotification: (message, wss) => {
    const { matchType, matchId, players } = JSON.parse(message);

    players.forEach((playerId) => {
      wss.clients.forEach((client) => {
        if (client.userId === playerId && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "match_created",
              gamemode: matchType,
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
            type: "invitation",
            gamemode: "zombies",
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
            type: "invitation",
            gamemode: "killstreak",
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
            type: "invitation",
            gamemode: "501",
            senderId,
            matchId,
          })
        );
      }
    });
  },

  sendLeagueInvitation: (receiverId, senderId, matchId, wss) => {
    wss.clients.forEach((client) => {
      if (
        client.userId === receiverId &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(
          JSON.stringify({
            type: "invitation",
            gamemode: "league",
            senderId,
            matchId,
          })
        );
      }
    });
  },

  sendDartThrowNotification: (matchId, playerId, playerUsername, dartScore, wss) => {
    const notification = {
      type: "dart_throw",
      matchId,
      playerId,
      playerUsername,
      dartScore,
    };

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
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
}