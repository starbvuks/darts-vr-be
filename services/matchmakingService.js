const { v4: uuidv4 } = require("uuid");
const RedisService = require("./redisService");
const Zombies = require("../models/Game/Zombies");
const Killstreak = require("../models/Game/Killstreak");
const FiveOhOne = require("../models/Game/FiveOhOne");
const gameSockets = require("../sockets/gameSockets");

const MatchmakingService = {
  joinZombiesQueue: async (gameType, playerId, wss) => {
    const queueName = `${gameType}-2players`;

    try {
      // Add the player to the queue
      await RedisService.addToQueue(queueName, playerId);

      // Check if there are enough players in the queue to start a new match
      const queueLength = await RedisService.getQueueLength(queueName);
      if (queueLength >= 2) {
        const playerIdsToMatch = await RedisService.getPlayersFromQueue(
          queueName,
          2,
        );
        const [player1Id, player2Id] = playerIdsToMatch;

        // Check if the player1Id and player2Id are the same
        if (player1Id === player2Id) {
          // Remove the duplicate player from the queue
          await RedisService.removePlayersFromQueue(queueName, 1);
          console.error(
            "Error in joinZombiesQueue: same player canot be added twice",
          );
          return { error: "Cannot match the same player twice" };
        }

        const newMatch = new Zombies({
          player1Id,
          player2Id: player2Id || null,
          matchType: "multiplayer",
          status: "closed",
          numPlayers: 2,
          matchId: uuidv4(),
        });
        await newMatch.save();

        // Remove the players from the queue
        await RedisService.removePlayersFromQueue(queueName, 2);

        // Publish a message to the corresponding Redis channel with the match details
        const message = JSON.stringify({
          matchType: `zmb`,
          matchId: newMatch.matchId,
          players: playerIdsToMatch,
          numPlayers: 2,
        });
        await RedisService.publishMatchCreated(
          `${gameType}-2-match-created`,
          message,
        );

        gameSockets.handleMatchCreatedNotification(message, wss);

        return newMatch;
      } else {
        // Wait for more players to join the queue
        return null;
      }
    } catch (error) {
      console.error("Error in joinZombiesQueue:", error);
      return error;
    }
  },

  createSoloMatchZombies: async (playerId) => {
    try {
      const match = new Zombies({
        player1Id: playerId,
        matchType: "solo",
        status: "closed",
        numPlayers: 1,
        matchId: uuidv4(),
      });
      await match.save();
      return match;
    } catch (error) {
      console.error("Error creating solo Zombies match:", error);
      return error;
    }
  },

  joinKillstreakQueue: async (gameType, playerId, wss) => {
    const queueName = `${gameType}-2players`;

    try {
      // Add the player to the queue
      await RedisService.addToQueue(queueName, playerId);

      // Check if there are enough players in the queue to start a new match
      const queueLength = await RedisService.getQueueLength(queueName);
      if (queueLength >= 2) {
        const playerIdsToMatch = await RedisService.getPlayersFromQueue(
          queueName,
          2,
        );
        const [player1Id, player2Id] = playerIdsToMatch;

        // Check if the player1Id and player2Id are the same
        if (player1Id === player2Id) {
          // Remove the duplicate player from the queue
          await RedisService.removePlayersFromQueue(queueName, 1);
          console.error(
            "Error in joinZombiesQueue: same player canot be added twice",
          );
          return { error: "Cannot match the same player twice" };
        }

        const newMatch = new Killstreak({
          player1Id,
          player2Id: player2Id || null,
          matchType: "multiplayer",
          numPlayers: 2,
          status: "ongoing",
          matchId: uuidv4(),
        });
        await newMatch.save();

        // Remove the players from the queue
        await RedisService.removePlayersFromQueue(queueName, 2);

        // Publish a message to the corresponding Redis channel with the match details
        const message = JSON.stringify({
          matchType: `ks`,
          matchId: newMatch.matchId,
          players: playerIdsToMatch,
          numPlayers: 2,
        });
        await RedisService.publishMatchCreated(
          `${gameType}-2-match-created`,
          message,
        );

        gameSockets.handleMatchCreatedNotification(message, wss);

        return newMatch;
      } else {
        // Wait for more players to join the queue
        return null;
      }
    } catch (error) {
      console.error("Error in joinbKillstreakQueue:", error);
      return error;
    }
  },

  createSoloMatchKillstreak: async (playerId) => {
    try {
      const match = new Killstreak({
        player1Id: playerId,
        matchType: "solo",
        status: "ongoing",
        matchId: uuidv4(),
        numPlayers: 1,
      });
      await match.save();
      return match;
    } catch (error) {
      console.error("Error creating solo Killstreak match:", error);
      return error;
    }
  },

  // 501
  joinFiveOhOneQueue: async (gameType, playerId, numPlayers, wss) => {
    const queueName = `${gameType}-${numPlayers}players`;

    try {
      // Add the player to the queue
      await RedisService.addToQueue(queueName, playerId);

      // Check if there are enough players in the queue to start a new match
      const queueLength = await RedisService.getQueueLength(queueName);
      if (queueLength >= numPlayers) {
        const playerIdsToMatch = await RedisService.getPlayersFromQueue(
          queueName,
          numPlayers,
        );

        // Create a new match
        const newMatch = new FiveOhOne({
          matchId: uuidv4(),
          matchType: `multiplayer`,
          status: "ongoing",
          numPlayers: numPlayers,
          player1Id: playerIdsToMatch[0],
          player2Id: numPlayers > 1 ? playerIdsToMatch[1] : null,
          player3Id: numPlayers > 2 ? playerIdsToMatch[2] : null,
          player4Id: numPlayers > 3 ? playerIdsToMatch[3] : null,
          player1Stats: {
            bullseyes: 0,
            oneEighties: 0,
            scoreLeft: 0,
            dartsThrown: 0,
            dartsHit: 0,
          },
          player2Stats:
            numPlayers > 1
              ? {
                  bullseyes: 0,
                  oneEighties: 0,
                  scoreLeft: 0,
                  dartsThrown: 0,
                  dartsHit: 0,
                }
              : null,
          player3Stats:
            numPlayers > 2
              ? {
                  bullseyes: 0,
                  oneEighties: 0,
                  scoreLeft: 0,
                  dartsThrown: 0,
                  dartsHit: 0,
                }
              : null,
          player4Stats:
            numPlayers > 3
              ? {
                  bullseyes: 0,
                  oneEighties: 0,
                  scoreLeft: 0,
                  dartsThrown: 0,
                  dartsHit: 0,
                }
              : null,
        });

        await newMatch.save();

        // Remove the players from the queue
        await RedisService.removePlayersFromQueue(queueName, numPlayers);

        const message = JSON.stringify({
          matchType: `${gameType}`,
          matchId: newMatch.matchId,
          players: playerIdsToMatch,
          numPlayers: numPlayers,
        });
        await RedisService.publishMatchCreated(
          `${gameType}-${numPlayers}-match-created`,
          message,
        );

        gameSockets.handleMatchCreatedNotification(message, wss);

        return newMatch;
      } else {
        // Wait for more players to join the queue
        return null;
      }
    } catch (error) {
      console.error("Error in joinQueue:", error);
      return error;
    }
  },

  createSoloMatchFiveOhOne: async (playerId) => {
    try {
      const newMatch = new FiveOhOne({
        matchId: uuidv4(),
        matchType: "solo",
        status: "ongoing",
        player1Id: playerId,
        numPlayers: 1,
        player1Stats: [],
      });

      await newMatch.save();
      return newMatch;
    } catch (error) {
      console.error("Error creating solo match:", error);
      return error;
    }
  },

  // remove from queue
  removePlayerFromQueue: async (gameType, numPlayers, playerId) => {
    const queueName = `${gameType}-${numPlayers}players`; // Adjust the queue name as necessary
    try {
      // Get the current queue length
      const queueLength = await RedisService.getQueueLength(queueName);

      // Iterate through the queue and remove the player if found
      for (let i = 0; i < queueLength; i++) {
        const playerInQueue = await RedisService.getPlayerFromQueue(
          queueName,
          i,
        );
        if (playerInQueue === playerId) {
          // Remove the player from the queue
          await RedisService.removePlayersFromQueue(queueName, 1, i);
          return { success: true, message: "Player removed from queue." };
        }
      }

      return { success: false, message: "Player not found in queue." };
    } catch (error) {
      console.error("Error removing player from queue:", error);
      return error;
    }
  },
};

module.exports = MatchmakingService;
