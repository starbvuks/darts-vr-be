// websockets.js
const { WebSocket } = require("ws");

// in the flow of creating the match, when both players are added how do we get this broadcast to be sent to both the clients who've found a match? The Unity client needs the matchId and confromation that both players have joined the same match. We have the notification 

module.exports = {
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
}