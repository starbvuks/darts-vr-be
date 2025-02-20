const { v4: uuidv4 } = require("uuid");
const ATW = require("../../models/Game/ATW");

const ATWService = {
  createMatch: async (playerId) => {
    try {
      const matchId = uuidv4();
      const newMatch = new ATW({
        playerId,
        status: "open",
        matchId,
        leastDartsUsed: 0,
        points: 0,
        highestNumReached: 0,
        dartsThrown: 0,
        victory: false,
      });
      await newMatch.save();
      return newMatch;
    } catch (error) {
      throw error;
    }
  },
  
  updateMatch: async (matchId, stats) => {
    try {
      const match = await ATW.findOne({ matchId });
      if (!match) {
        const error = new Error("Match not found");
        console.error("Error updating match stats:", error);
        return error;
      }

      match.leastDartsUsed = stats.leastDartsUsed,
      match.points = stats.points,
      match.highestNumReached = stats.highestNumReached,
      match.victory = stats.victory,
      match.dartsThrown = stats.dartsThrown,
      match.highestStreak = stats.highestStreak,
      match.status = "closed"

      const playerId = match.playerId;
      const player = await Player.findById(playerId);

      if (!player) {
        const error = new Error("Player not found");
        console.error("Error updating player stats:", error);
        return error;
      } else {
        player.dartsThrown += stats.dartsThrown;
        player.stats.atwStats.highestPoints += Math.max(player.stats.atwStats.highestPoints, stats.points);
        player.stats.atwStats.highestNumReached = Math.max(player.stats.atwStats.highestNumReached, stats.highestNumReached);
        player.stats.atwStats.leastDartsUsed = Math.min(player.stats.atwStats.leastDartsUsed, stats.leastDartsUsed);
        player.stats.atwStats.totalAtwGamesPlayed += 1;
        player.stats.atwStats.totalAtwGamesWon += stats.victory ? 1 : 0;

        await player.save();
      }

      return match;
    } catch (error) {
      throw error;
    }
  },
  getMatch: async (matchId) => {
    try {
      const match = await ATW.findOne({ matchId });
      if (!match) {
        throw new Error("Match not found");
      }
      return match;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = ATWService;
