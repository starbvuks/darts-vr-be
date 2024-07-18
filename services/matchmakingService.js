const { v4: uuidv4 } = require("uuid");
const RedisService = require("./redisService");
const Zombies = require("../models/Game/Zombies");
const Killstreak = require("../models/Game/Killstreak");

const MatchmakingService = {
  joinZombiesQueue: async (gameType, playerId) => {
    const queueName = `${gameType}-2players`;

    try {
      // Add the player to the queue
      await RedisService.addToQueue(queueName, playerId);

      // Check if there are enough players in the queue to start a new match
      const queueLength = await RedisService.getQueueLength(queueName);
      if (queueLength >= 2) {
        const playerIdsToMatch = await RedisService.getPlayersFromQueue(
          queueName,
          2
        );
        const [player1Id, player2Id] = playerIdsToMatch;

        // Check if the player1Id and player2Id are the same
        if (player1Id === player2Id) {
          // Remove the duplicate player from the queue
          await RedisService.removePlayersFromQueue(queueName, 1);
          const error = new Error("Cannot match the same player twice");
          console.error("Error in joinZombiesQueue:", error);
          return error;
        }

        const newMatch = new Zombies({
          player1Id,
          player2Id,
          matchType: "multiplayer",
          status: "closed", // Update the status to 'closed' since the match is now complete
          matchId: uuidv4(),
        });
        await newMatch.save();

        // Remove the players from the queue
        await RedisService.removePlayersFromQueue(queueName, 2);

        // Publish a message to the corresponding Redis channel with the match details
        const message = JSON.stringify({
          type: "match_created",
          matchId: newMatch.matchId,
          players: newMatch.playerIds,
        });
        await RedisService.publishMatchCreated(
          `${gameType}-2-match-created`,
          message
        );

        return newMatch;
      } else {
        // Wait for more players to join the queue
        return null;
      }
    } catch (error) {
      console.error("Error in joinZombiesQueue:", error);
      throw error;
    }
  },

  createSoloMatchZombies: async (playerId) => {
    try {
      const match = new Zombies({
        player1Id: playerId,
        matchType: "solo",
        status: "closed",
        matchId: uuidv4(),
      });
      await match.save();
      return match;
    } catch (error) {
      console.error("Error creating solo Zombies match:", error);
      throw error;
    }
  },

  joinKillstreakQueue: async (gameType, playerId) => {
    const queueName = `${gameType}-2players`;

    try {
      // Add the player to the queue
      await RedisService.addToQueue(queueName, playerId);

      // Check if there are enough players in the queue to start a new match
      const queueLength = await RedisService.getQueueLength(queueName);
      if (queueLength >= 2) {
        const playerIdsToMatch = await RedisService.getPlayersFromQueue(
          queueName,
          2
        );
        const [player1Id, player2Id] = playerIdsToMatch;

        // Check if the player1Id and player2Id are the same
        if (player1Id === player2Id) {
          // Remove the duplicate player from the queue
          await RedisService.removePlayersFromQueue(queueName, 1);
          const error = new Error("Cannot match the same player twice");
          console.error("Error in joinKillstreakQueue:", error);
          return error;
        }

        const newMatch = new Killstreak({
          player1Id,
          player2Id,
          matchType: "multiplayer",
          status: "ongoing",
          matchId: uuidv4(),
        });
        await newMatch.save();

        // Remove the players from the queue
        await RedisService.removePlayersFromQueue(queueName, 2);

        // Publish a message to the corresponding Redis channel with the match details
        const message = JSON.stringify({
          type: "match_created",
          matchId: newMatch.matchId,
          players: newMatch.playerIds,
        });
        await RedisService.publishMatchCreated(
          `${gameType}-2-match-created`,
          message
        );

        return newMatch;
      } else {
        // Wait for more players to join the queue
        return null;
      }
    } catch (error) {
      console.error("Error in joinbKillstreakQueue:", error);
      throw error;
    }
  },

  createSoloMatchKillstreak: async (playerId) => {
    try {
      const match = new Killstreak({
        player1Id: playerId,
        matchType: "solo",
        status: "open",
        matchId: uuidv4(),
      });
      await match.save();
      return match;
    } catch (error) {
      console.error("Error creating solo Killstreak match:", error);
      throw error;
    }
  },
};

module.exports = MatchmakingService;
