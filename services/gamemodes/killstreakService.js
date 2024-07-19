const { v4: uuidv4 } = require("uuid");
const Killstreak = require("../../models/Game/Killstreak");
const Player = require("../../models/Player");
const mongoose = require("mongoose");

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
      const match = await Killstreak.findOne({ matchId });
      if (!match) {
        const error = new Error("Match not found");
        console.error("Error updating match stats:", error);
        return error;
      }
  
      const playerIdObj = new mongoose.Types.ObjectId(playerId);
  
      if (match.player1Id.equals(playerIdObj)) {
        match.player1Stats.push(playerStats);
      } else if (match.player2Id.equals(playerIdObj)) {
        match.player2Stats.push(playerStats);
      } else {
        const error = new Error("Player is not part of this match");
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
  
      const roundWinnerObj = new mongoose.Types.ObjectId(roundWinner);
  
      let winner;
      if (match.player1Id.equals(roundWinnerObj)) {
        winner = "player1";
      } else if (match.player2Id.equals(roundWinnerObj)) {
        winner = "player2";
      } else {
        const error = new Error("Round winner is not part of this match");
        console.error("Error ending round:", error);
        return error;
      }
  
      match.roundsPlayed.push({ winner });
  
      await match.save();
      return match;
    } catch (error) {
      console.error("Error ending round:", error);
      return error;
    }
  },

  endMatch: async (matchId, winner) => {
    try {
      const match = await Killstreak.findOne({ matchId, status: "ongoing" });
      if (!match) {
        const error = new Error("Match not found or is not ongoing");
        console.error("Error ending match:", error);
        return error;
      }

      match.winner = winner;
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
