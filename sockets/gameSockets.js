// websockets.js
const { WebSocket } = require("ws");

module.exports = {
  handleLobbyCreatedNotification: (playerIds, lobbyId, wss) => {
    const message = JSON.stringify({
      type: "lobby_created",
      lobbyId
    });

    playerIds.forEach(playerId => {
      wss.clients.forEach(client => {
        if (
          client.userId === playerId &&
          client.readyState === WebSocket.OPEN
        ) {
          console.log(`Sent lobby created message to player ${playerId}`);
          client.send(message);
        }
      });
    });
  },
  
  handleMatchCreatedNotification: (message, wss) => {  
    const { numPlayers, matchType, matchId, players } = JSON.parse(message);

    players.forEach((playerId) => {
      wss.clients.forEach((client) => {
        if (
          client.userId === playerId &&
          client.readyState === WebSocket.OPEN
        ) {
          console.log(`Sent match created message to player ${playerId}`);
          client.send(
            JSON.stringify({
              type: "match_created",
              gamemode: matchType,
              matchId,
              numPlayers,
            }),
          );
        }
      });
    });
  },

  handleMatchOverNotification: (players, message, wss) => {
    const formattedMessage = JSON.stringify(message); // Convert message to string

    players.forEach((playerId) => {
      wss.clients.forEach((client) => {
        if (
          client.userId === playerId &&
          client.readyState === WebSocket.OPEN
        ) {
          client.send(formattedMessage); // Send the serialized message
        }
      });
    });
  },

  handleMatchReadyNotification: (players, message, wss) => {
    const formattedMessage = JSON.stringify(message); // Convert message to string

    players.forEach((playerId) => {
      wss.clients.forEach((client) => {
        if (
          client.userId === playerId &&
          client.readyState === WebSocket.OPEN
        ) {
          client.send(formattedMessage); // Send the serialized message
        }
      });
    });
  },

  handleLeagueOverNotification: (players, message, wss) => {
    const formattedMessage = JSON.stringify(message);
    // console.log("Sending message:", formattedMessage);

    players.forEach((playerId) => {
      const playerIdString = playerId.toString(); // Ensure playerId is a string

      wss.clients.forEach((client) => {
        console.log(
          `Checking client: ${client.userId} against player: ${playerIdString}`,
        );
        if (
          client.userId === playerIdString && // Compare as strings
          client.readyState === WebSocket.OPEN
        ) {
          client.send(formattedMessage); // Send the serialized message
          console.log(`Sent match over message to player ${playerIdString}`);
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
          }),
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
          }),
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
          }),
        );
      }
    });
  },

  sendLeagueInvitation: (receiverId, senderId, leagueId, wss) => {
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
            matchId: leagueId,
          }),
        );
      }
    });
  },

  sendLeagueMatchCreatedNotification: (playerId, message, wss) => {
    wss.clients.forEach((client) => {
      console.log(playerId, client.userId);
      if (client.userId === playerId && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  },

  sendDartThrowNotification: (playerId, notificationMessage, wss) => {
    const message = JSON.stringify({
      type: "dart_throw",
      leagueId: notificationMessage.leagueId,
      matchId: notificationMessage.matchId,
      playerId: notificationMessage.playerId,
      playerUsername: notificationMessage.playerUsername,
      dartScore: notificationMessage.dartScore,
      scoreLeft: notificationMessage.scoreLeft,
      dartThrow: notificationMessage.dartThrow,
    });

    // console.log(`dart throw socket was sent to: ${playerId}`);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log(playerId, client.userId);
        if (client.userId === playerId) {
          client.send(message);
        }
      }
    });
  },

  // tournament
  handleQueueOpenNotification: (tournamentId, message, wss) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  },

  // sendTournamentStartingNotification: (playerId, message, wss) => {
  //   const message = JSON.stringify

  //   wss.client.forEach(client => {)
  //     if (client.userId === playerId && client.readyState === Websocket.OPEN) {
  //       client.send(message);
  //     }
  // }
  init: (wss) => {
    RedisService.subscribeToChannel(
      "501-2-match-created",
      (channel, message) => {
        this.handleMatchCreatedNotification(channel, message, wss);
      },
    );

    RedisService.subscribeToChannel(
      "501-3-match-created",
      (channel, message) => {
        this.handleMatchCreatedNotification(channel, message, wss);
      },
    );

    RedisService.subscribeToChannel(
      "501-4-match-created",
      (channel, message) => {
        this.handleMatchCreatedNotification(channel, message, wss);
      },
    );

    RedisService.subscribeToChannel(
      "killstreak-2-match-created",
      (channel, message) => {
        this.handleMatchCreatedNotification(channel, message, wss);
      },
    );

    RedisService.subscribeToChannel(
      "zombies-2-match-created",
      (channel, message) => {
        this.handleMatchCreatedNotification(channel, message, wss);
      },
    );

    // Add more subscriptions for other game types and player counts
  },
};
