const { v4: uuidv4 } = require("uuid");
const Killstreak = require("../../models/Game/Killstreak");

const KillstreakService = {
  createMatch: async (playerId) => {
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
      return error;
    }
  },

  joinMatch: async (matchId, playerId) => {
    try {
      const match = await Killstreak.findOne({ matchId, status: "open" });
      if (!match) {
        const error = new Error("Match not found or is not open");
        console.error("Error joining match:", error);
        return error;
      }

      if (match.player1Id === playerId) {
        const error = new Error("You cannot join your own match");
        console.error("Error joining match:", error);
        return error;
      }

      if (match.player2Id) {
        const error = new Error("Match is full");
        console.error("Error joining match:", error);
        return error;
      }

      match.player2Id = playerId;
      match.status = "closed";
      await match.save();
      return match;
    } catch (error) {
      console.error("Error joining match:", error);
      return error;
    }
  },

  updateMatchStats: async (matchId, player1Stats, player2Stats, duration, winner) => {
    try {
      const match = await Killstreak.findOne({ matchId });
      if (!match) {
        const error = new Error("Match not found");
        console.error("Error updating match stats:", error);
        return error;
      }
      match.player1Stats = player1Stats;
      match.player2Stats = player2Stats;
      match.duration = duration;
      match.winner = winner;
      await match.save();
      return match;
    } catch (error) {
      console.error("Error updating match stats:", error);
      return error;
    }
  },

  getMatch: async (matchId) => {
    try {
      const match = await Killstreak.findOne({ matchId });
      if (!match) {
        const error = new Error("Match not found");
        console.error("Error getting match:", error);
        return error;
      }
      return match;
    } catch (error) {
      console.error("Error getting match:", error);
      return error;
    }
  },

  closeMatch: async (matchId) => {
    try {
      const match = await Killstreak.findOne({ matchId, status: "open" });
      if (!match) {
        const error = new Error("Match not found or is already closed");
        console.error("Error closing match:", error);
        return error;
      }

      match.status = "closed";
      await match.save();
      return match;
    } catch (error) {
      console.error("Error closing match:", error);
      return error;
    }
  },
};

module.exports = KillstreakService;