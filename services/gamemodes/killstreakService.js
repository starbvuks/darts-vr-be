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

  updateMatchStats: async (matchId, playerId, playerStats) => {
    try {
      const match = await Killstreak.findOne({ matchId, status: "ongoing" });
      if (!match) {
        const error = new Error("Match not found or is not ongoing");
        console.error("Error updating match stats:", error);
        return error;
      }

      if (match.player1Id.equals(playerId)) {
        match.player1Stats.push(playerStats);
      } else if (match.player2Id.equals(playerId)) {
        match.player2Stats.push(playerStats);
      } else {
        const error = new Error("Player ID does not match any player in the match");
        console.error("Error updating match stats:", error);
        return error;
      }

      await match.save();
      return match;
    } catch (error) {
      console.error("Error updating match stats:", error);
      return error;
    }
  },

  endRound: async (matchId, roundWinner) => {
    try {
      const match = await Killstreak.findOne({ matchId, status: "ongoing" });
      if (!match) {
        const error = new Error("Match not found or is not ongoing");
        console.error("Error ending round:", error);
        return error;
      }

      match.roundsPlayed.push({ winner: roundWinner });

      // Check if a player has won 2 consecutive rounds
      let player1Wins = 0;
      let player2Wins = 0;
      for (let i = 0; i < match.roundsPlayed.length; i++) {
        if (match.roundsPlayed[i].winner === "player1") {
          player1Wins++;
        } else {
          player2Wins++;
        }

        if (player1Wins === 2 || player2Wins === 2) {
          match.winner = player1Wins === 2 ? match.player1Id : match.player2Id;
          match.status = "closed";
          break;
        }
      }

      await match.save();
      return match;
    } catch (error) {
      console.error("Error ending round:", error);
      return error;
    }
  },

  endMatch: async (matchId) => {
    try {
      const match = await Killstreak.findOne({ matchId, status: "ongoing" });
      if (!match) {
        const error = new Error("Match not found or is not ongoing");
        console.error("Error ending match:", error);
        return error;
      }

      // If the match is tied, set the winner to null
      if (match.roundsPlayed.filter((round) => round.winner === "player1").length === 
          match.roundsPlayed.filter((round) => round.winner === "player2").length) {
        match.winner = null;
      }

      match.status = "closed";
      await match.save();
      return match;
    } catch (error) {
      console.error("Error ending match:", error);
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