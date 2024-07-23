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

  sendLeagueMatchCreatedNotification: (playerId, message, wss) => {
    wss.clients.forEach((client) => {
      console.log(playerId, client.userId)
      if (client.userId === playerId && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  },

  sendDartThrowNotification: (playerId, notificationMessage, wss) => {
    const message = JSON.stringify({
      type: "dart_throw",
      leagueId: notificationMessage.leagueId,
      playerId,
      playerUsername: notificationMessage.playerUsername,
      dartScore: notificationMessage.dartScore,
      scoreLeft: notificationMessage.scoreLeft,
      dartThrow: notificationMessage.dartThrow,
    });

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        console.log(playerId, client.userId)
        if (client.userId === playerId) {
          client.send(message);
        }
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