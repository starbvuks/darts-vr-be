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

      // Update the player's killstreakStats
      const player = await Player.findById(playerIdObj);
      if (!player) {
        const error = new Error("Player not found");
        console.error("Error updating player stats:", error);
        return error;
      }

      if (!player.stats.killstreakStats) {
        player.stats.killstreakStats = {
          totalKillstreakGamesPlayed: 0,
          totalKillstreakGamesWon: 0,
          highestStreak: 0,
        };
      } else {
        player.stats.killstreakStats.totalKillstreakGamesPlayed += 1;
        player.stats.killstreakStats.highestStreak = Math.max(player.stats.killstreakStats.highestStreak, playerStats.currentStreak);
      }

      player.stats.totalDartsThrown += playerStats.totalDarts;
      player.stats.totalDartsHit += playerStats.totalDarts;
      player.stats.totalMatchesPlayed += 1;

      await player.save();

      return match;
    } catch (error) {
      console.error("Error updating match stats:", error);
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
  
      // Update the player's stats
      const player1 = await Player.findById(match.player1Id);
      if (!player1) {
        const error = new Error("Player not found");
        console.error("Error updating player stats:", error);
        return error;
      }
  
      // Increment total matches played and total killstreak games played
      player1.stats.totalMatchesPlayed += 1;
      player1.stats.killstreakStats.totalKillstreakGamesPlayed += 1;
  
      // If player1 is the winner, increment total wins and total killstreak games won
      if (player1._id.toString() === winner) {
        player1.stats.totalWins += 1;
        player1.stats.killstreakStats.totalKillstreakGamesWon += 1;
      }
  
      await player1.save();
  
      const player2 = await Player.findById(match.player2Id);
      if (!player2) {
        const error = new Error("Player not found");
        console.error("Error updating player stats:", error);
        return error;
      }
  
      // Increment total matches played and total killstreak games played
      player2.stats.totalMatchesPlayed += 1;
      player2.stats.killstreakStats.totalKillstreakGamesPlayed += 1;
  
      // If player2 is the winner, increment total wins and total killstreak games won
      if (player2._id.toString() === winner) {
        player2.stats.totalWins += 1;
        player2.stats.killstreakStats.totalKillstreakGamesWon += 1;
      }
  
      await player2.save();
  
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
