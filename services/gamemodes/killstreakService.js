const { v4: uuidv4 } = require("uuid");
const Killstreak = require("../../models/Game/Killstreak");

const KillstreakService = {
  createMatch: async (matchType, playerId) => {
    try {
      const match = new Killstreak({
        player1Id: playerId,
        matchType,
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

  joinMatch: async (matchType, playerId) => {
    const queueName = `killstreak-${matchType}-2players`;

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
          throw new Error("Cannot match the same player twice");
        }

        const newMatch = new Killstreak({
          player1Id,
          player2Id,
          matchType,
          status: "open",
          matchId: uuidv4(),
        });
        await newMatch.save();

        // Remove the players from the queue
        await RedisService.removePlayersFromQueue(queueName, 2);

        // Publish a message to the corresponding Redis channel with the match details
        const message = JSON.stringify({
          type: "match_created",
          matchId: newMatch.matchId,
          players: [player1Id, player2Id],
        });
        await RedisService.publishMatchCreated(
          `killstreak-${matchType}-match-created`,
          message
        );

        return newMatch;
      } else {
        // Wait for more players to join the queue
        return null;
      }
    } catch (error) {
      console.error("Error in joinKillstreakMatch:", error);
      throw error;
    }
  },

  updateMatchStats: async (
    matchId,
    player1Stats,
    player2Stats,
    duration,
    winner
  ) => {
    const match = await Killstreak.findOne({ matchId });
    if (!match) {
      throw new Error("Match not found");
    }
    match.player1Stats = player1Stats;
    match.player2Stats = player2Stats;
    match.duration = duration;
    match.winner = winner;
    await match.save();
    return match;
  },

  closeMatch: async (matchId, winner) => {
    try {
      const match = await Killstreak.findOne({ matchId, status: "open" });
      if (!match) {
        throw new Error("Match not found or is already closed");
      }

      match.status = "closed";
      match.winner = winner;
      await match.save();
      return match;
    } catch (error) {
      console.error("Error closing match:", error);
      throw error;
    }
  },

  getMatch: async (matchId) => {
    const match = await Killstreak.findOne({ matchId });
    if (!match) {
      throw new Error("Match not found");
    }
    return match;
  },
};

module.exports = KillstreakService;
