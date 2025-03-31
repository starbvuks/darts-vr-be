const { v4: uuidv4 } = require("uuid");
const Killstreak = require("../../models/Game/Killstreak");
const Player = require("../../models/Player");
const mongoose = require("mongoose");
const rematchHelper = require("../../utils/rematchHelper");

const KillstreakService = {
  createMatch: async (playerId, matchType = "solo") => {
    try {
      const match = new Killstreak({
        player1Id: playerId,
        matchType: matchType, // "solo" or "private-2p"
        status: matchType === "solo" ? "ongoing" : "open",
        numPlayers: matchType === "solo" ? 1 : 2,
        matchId: uuidv4(),
        player1Stats: {
          rounds: [],
          totalDartsThrown: 0,
          highestStreak: 0
        },
        player2Stats: {
          rounds: [],
          totalDartsThrown: 0,
          highestStreak: 0
        }
      });
      await match.save();
      return match;
    } catch (error) {
      console.error("Error creating Killstreak match:", error);
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
      match.numPlayers = 2;
      match.status = "ongoing";
      await match.save();
      return match;
    } catch (error) {
      console.error("Error joining match:", error);
      return error;
    }
  },

  updateMatchStats: async (matchId, playerId, roundStats) => {
    try {
      const match = await Killstreak.findOne({ matchId });
      if (!match) {
        const error = new Error("Match not found");
        console.error("Error updating match stats:", error);
        return error;
      }

      const playerIdObj = new mongoose.Types.ObjectId(playerId);
      let playerStats;
      let isPlayer1 = false;

      if (match.player1Id.equals(playerIdObj)) {
        playerStats = match.player1Stats;
        isPlayer1 = true;
      } else if (match.player2Id.equals(playerIdObj)) {
        playerStats = match.player2Stats;
      } else {
        const error = new Error("Player is not part of this match");
        console.error("Error updating match stats:", error);
        return error;
      }

      // Add the round data with score
      playerStats.rounds.push({
        round: roundStats.round,
        streak: roundStats.streak,
        chosenNumber: roundStats.chosenNumber,
        score: roundStats.score
      });

      // Update total darts thrown (streak = number of darts thrown in the round)
      playerStats.totalDartsThrown += roundStats.streak;

      // Update highest streak if current streak is higher
      playerStats.highestStreak = Math.max(playerStats.highestStreak, roundStats.streak);

      // Save the updated match stats
      if (isPlayer1) {
        match.player1Stats = playerStats;
      } else {
        match.player2Stats = playerStats;
      }
      await match.save();

      // Update the player's killstreakStats
      const player = await Player.findById(playerIdObj);
      if (!player) {
        const error = new Error("Player not found");
        console.error("Error updating player stats:", error);
        return error;
      }

      // Determine if it's single or multiplayer
      const statsKey = match.numPlayers === 1 ? 'single' : 'multi';

      // Initialize if needed
      if (!player.stats.killstreakStats[statsKey]) {
        player.stats.killstreakStats[statsKey] = {
          totalKillstreakGamesPlayed: 0,
          totalKillstreakGamesWon: 0,
          highestStreak: 0,
          totalDartsThrown: 0
        };
      }

      // Update the stats
      player.stats.killstreakStats[statsKey].totalDartsThrown += roundStats.streak;
      player.stats.killstreakStats[statsKey].highestStreak = Math.max(
        player.stats.killstreakStats[statsKey].highestStreak,
        roundStats.streak
      );

      // Update overall stats
      player.stats.totalDartsThrown += roundStats.streak;
      player.stats.totalDartsHit += roundStats.streak; // In Killstreak, all throws are hits

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
  
      const statsKey = match.numPlayers === 1 ? 'single' : 'multi';
  
      // Update the players' stats
      const player1 = await Player.findById(match.player1Id);
      if (!player1) {
        const error = new Error("Player not found");
        console.error("Error updating player stats:", error);
        return error;
      }
  
      // Initialize if needed
      if (!player1.stats.killstreakStats[statsKey]) {
        player1.stats.killstreakStats[statsKey] = {
          totalKillstreakGamesPlayed: 0,
          totalKillstreakGamesWon: 0,
          highestStreak: 0,
          totalDartsThrown: 0
        };
      }
  
      // Increment games played
      player1.stats.totalMatchesPlayed += 1;
      player1.stats.killstreakStats[statsKey].totalKillstreakGamesPlayed += 1;
  
      // If player1 is the winner
      if (player1._id.toString() === winner) {
        player1.stats.totalWins += 1;
        player1.stats.killstreakStats[statsKey].totalKillstreakGamesWon += 1;
      }
  
      await player1.save();
  
      // If it's a multiplayer game, update player2's stats
      if (match.player2Id) {
        const player2 = await Player.findById(match.player2Id);
        if (!player2) {
          const error = new Error("Player not found");
          console.error("Error updating player stats:", error);
          return error;
        }
  
        // Initialize if needed
        if (!player2.stats.killstreakStats[statsKey]) {
          player2.stats.killstreakStats[statsKey] = {
            totalKillstreakGamesPlayed: 0,
            totalKillstreakGamesWon: 0,
            highestStreak: 0,
            totalDartsThrown: 0
          };
        }
  
        // Increment games played
        player2.stats.totalMatchesPlayed += 1;
        player2.stats.killstreakStats[statsKey].totalKillstreakGamesPlayed += 1;
  
        // If player2 is the winner
        if (player2._id.toString() === winner) {
          player2.stats.totalWins += 1;
          player2.stats.killstreakStats[statsKey].totalKillstreakGamesWon += 1;
        }
  
        await player2.save();
      }
  
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

  createRematch: async (creatorId, playerIds, numPlayers, wss) => {
    try {
      const validation = await rematchHelper.validatePlayers(playerIds, numPlayers);
      if (!validation.success) {
        return validation;
      }

      const { playerData } = validation;

      const newMatch = new Killstreak({
        matchId: uuidv4(),
        matchType: "private-2p",
        status: "ongoing",
        player1Id: playerData[0].id,
        player2Id: numPlayers > 1 ? playerData[1].id : null,
        player1Stats: {
          rounds: [],
          totalDartsThrown: 0,
          highestStreak: 0
        },
        player2Stats: numPlayers > 1 ? {
          rounds: [],
          totalDartsThrown: 0,
          highestStreak: 0
        } : null,
        numPlayers,
      });

      await newMatch.save();

      rematchHelper.notifyPlayers("ks", newMatch.matchId, playerData, numPlayers, wss);

      return { success: true, match: newMatch };
    } catch (error) {
      console.error("Error creating killstreak rematch:", error);
      return { success: false, message: "Failed to create rematch." };
    }
  },

  updateSingleplayerStats: async (playerId, playerStats) => {
    try {
      const player = await Player.findById(playerId);
      if (!player) {
        return { success: false, message: "Player not found." };
      }

      // Update overall stats
      player.stats.totalDartsThrown += playerStats.dartsThrown || 0;
      player.stats.totalDartsHit += playerStats.dartsThrown || 0; // In Killstreak, all throws are hits

      // Update Killstreak-specific stats for singleplayer
      player.stats.killstreakStats.single.totalKillstreakGamesPlayed += 1;
      player.stats.killstreakStats.single.totalKillstreakGamesWon += 1;
      player.stats.killstreakStats.single.highestStreak = Math.max(
        player.stats.killstreakStats.single.highestStreak,
        playerStats.streak || 0
      );
      player.stats.killstreakStats.single.totalDartsThrown += playerStats.dartsThrown || 0;

      await player.save();
      return { success: true, player };
    } catch (error) {
      console.error("Error in updateSingleplayerStats service:", error);
      return {
        success: false,
        message: "Failed to update singleplayer stats.",
      };
    }
  },
};

module.exports = KillstreakService;
