const { v4: uuidv4 } = require("uuid");
const FiveOhOne = require("../../models/Game/FiveOhOne");
const Player = require("../../models/Player");
const mongoose = require("mongoose");

const FiveOhOneService = {
  createPrivateMatch: async (creatorId) => {
    try {
      const newMatch = new FiveOhOne({
        matchId: uuidv4(),
        matchType: "private",
        status: "open", 
        player1Id: creatorId,
        player2Id: null,
        player3Id: null,
        player4Id: null,
        player1Stats: {},
        player2Stats: {},
        player3Stats: undefined,
        player4Stats: undefined,
      });

      await newMatch.save();
      return { success: true, match: newMatch };
    } catch (error) {
      console.error("Error creating private match:", error);
      return { success: false, message: "Failed to create private match." };
    }
  },

  joinPrivateMatch: async (matchId, playerId) => {
    try {
      const match = await FiveOhOne.findOne({ matchId, status: "open" });
      if (!match) {
        return { success: false, message: "Match not found or is not open." };
      }

      // Check how many players are already in the match
      const currentPlayers = [
        match.player1Id,
        match.player2Id,
        match.player3Id,
        match.player4Id,
      ].filter(Boolean);

      // Prevent joining if the match is full
      if (currentPlayers.length >= 4) {
        return {
          success: false,
          message: "The match is already full. No more players can join.",
        };
      }

      // Assign the player to the next available slot
      if (!match.player2Id) {
        match.player2Id = playerId;
      } else if (!match.player3Id) {
        match.player3Id = playerId;
      } else if (!match.player4Id) {
        match.player4Id = playerId;
      }

      await match.save();
      return { success: true, match };
    } catch (error) {
      console.error("Error joining private match:", error);
      return { success: false, message: "Failed to join private match." };
    }
  },

  startMatch: async (matchId) => {
    try {
      const match = await FiveOhOne.findOne({ matchId, status: "open" });
      if (!match) {
        return { success: false, message: "Match not found or is not open." };
      }

      match.status = "ongoing"; // Change the status to ongoing
      await match.save();
      return { success: true, match };
    } catch (error) {
      console.error("Error starting match:", error);
      return { success: false, message: "Failed to start match." };
    }
  },

  updateMatchStats: async (matchId, playerId, playerStats) => {
    try {
      const match = await FiveOhOne.findOne({ matchId });
      if (!match) {
        return { success: false, message: "Match not found." };
      }
  
      let playerStatsField;
      if (match.player1Id.equals(playerId)) {
        playerStatsField = "player1Stats";
      } else if (match.player2Id && match.player2Id.equals(playerId)) {
        playerStatsField = "player2Stats";
      } else if (match.player3Id && match.player3Id.equals(playerId)) {
        playerStatsField = "player3Stats";
      } else if (match.player4Id && match.player4Id.equals(playerId)) {
        playerStatsField = "player4Stats";
      } else {
        return { success: false, message: "Player not found in this match." };
      }
  
      // Ensure player stats are initialized
      if (!match[playerStatsField] || Array.isArray(match[playerStatsField])) {
        match[playerStatsField] = {
          bullseyes: 0,
          oneEighties: 0,
          scoreLeft: 0,
          dartsThrown: 0,
          dartsHit: 0,
        };
      }
  
      // Update the player's stats
      match[playerStatsField].scoreLeft = playerStats.scoreLeft; // Update scoreLeft
      match[playerStatsField].bullseyes += playerStats.bullseye; // Add bullseyes scored in this turn
      match[playerStatsField].oneEighties += playerStats.oneEighty ? 1 : 0; // Increment oneEighties if scored
      match[playerStatsField].dartsThrown += playerStats.dartsThrown; // Add darts thrown in this turn
      match[playerStatsField].dartsHit += playerStats.dartsHit; // Add darts hit in this turn
  
      // Update overall player stats
      const player = await Player.findById(playerId); // Assuming you have a Player model
      if (!player) {
        return { success: false, message: "Player not found." };
      }
  
      player.stats.totalDartsThrown += playerStats.dartsThrown; // Add to total darts thrown
      player.stats.totalDartsHit += playerStats.dartsHit; // Add to total darts hit
      player.stats.total180s += playerStats.oneEighty ? 1 : 0; // Increment total 180s if scored
      player.stats.totalBullseyes += playerStats.bullseye; // Add to total bullseyes
  
      await player.save(); // Save the updated player stats
      await match.save(); // Save the updated match stats
      return { success: true, match };
    } catch (error) {
      console.error("Error updating match stats:", error);
      return { success: false, message: "Failed to update match stats." };
    }
  },
  
  endMatch: async (matchId, winnerId) => {
    try {
      const match = await FiveOhOne.findOne({ matchId, status: "ongoing" });
      if (!match) {
        return { success: false, message: "Match not found or is not ongoing." };
      }

      // Update match status
      match.status = "closed"; // Set the match status to closed
      match.winner = winnerId; // Assign the winner

      // Update player statistics
      const playerIds = [match.player1Id, match.player2Id, match.player3Id, match.player4Id].filter(Boolean);

      for (const playerId of playerIds) {
        const player = await Player.findById(playerId);
        if (!player) {
          return { success: false, message: "Player not found." };
        }

        // Increment total matches played
        player.stats.totalMatchesPlayed += 1;
        player.stats.fiveOhOneStats.totalfive0OneGamesPlayed += 1;

        // If this player is the winner, increment win stats
        if (playerId.equals(winnerId)) {
          player.stats.fiveOhOneStats.totalfive0OneGamesWon += 1; // Increment total wins in 501
          player.stats.totalWins += 1; // Increment overall wins
        }

        await player.save(); // Save the updated player stats
      }

      await match.save(); // Save the updated match status
      return { success: true, match };
    } catch (error) {
      console.error("Error ending match:", error);
      return { success: false, message: "Failed to end match." };
    }
  },

  getMatch: async (matchId) => {
    try {
      const match = await FiveOhOne.findOne({ matchId });
      if (!match) {
        return { success: false, message: "Match not found." };
      }
      return { success: true, match };
    } catch (error) {
      console.error("Error retrieving match:", error);
      return { success: false, message: "Failed to retrieve match." };
    }
  },

  closeMatch: async (matchId) => {
    try {
      const match = await FiveOhOne.findOne({ matchId, status: "ongoing" });
      if (!match) {
        return { success: false, message: "Match not found or is not ongoing." };
      }

      match.status = "closed"; // Set the match status to closed
      await match.save();
      return { success: true, match };
    } catch (error) {
      console.error("Error closing match:", error);
      return { success: false, message: "Failed to close match." };
    }
  },
};

module.exports = FiveOhOneService;
