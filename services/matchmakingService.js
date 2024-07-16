const { v4: uuidv4 } = require("uuid");
const RedisService = require("./redisService");
const Zombies = require("../models/Game/Zombies");

const MatchmakingService = {
  joinQueue: async (gameType, playerId) => {
    const queueName = `${gameType}-2players`;

    // Add the player to the queue
    await RedisService.addToQueue(queueName, playerId);

    // Check if there are enough players in the queue to start a new match
    const queueLength = await RedisService.getQueueLength(queueName);
    if (queueLength >= 2) {
      // Remove the players from the queue
      const playerIdsToMatch = await RedisService.getPlayersFromQueue(
        queueName,
        2
      );

      // Create a new multiplayer match
      const newMatch = new Zombies({
        playerIds: playerIdsToMatch,
        matchType: "multiplayer",
        status: "closed",
        matchId: uuidv4(),
      });
      await newMatch.save();

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
  },

  createSoloMatch: async (playerId) => {
    const match = new Zombies({
      player1Id: playerId,
      matchType: "solo",
      status: "closed",
      matchId: uuidv4(),
    });
    await match.save();
    return match;
  },
};

module.exports = MatchmakingService;
