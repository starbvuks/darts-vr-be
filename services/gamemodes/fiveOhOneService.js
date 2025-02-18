const { v4: uuidv4 } = require("uuid");
const FiveOhOne = require("../../models/Game/FiveOhOne");
const Player = require("../../models/Player");
const gameSockets = require("../../sockets/gameSockets");
const mongoose = require("mongoose");

const FiveOhOneService = {
  createPrivateMatch: async (creatorId) => {
    try {
      const creator = await Player.findById(creatorId); // Get creator's username
      const creatorUsername = creator ? creator.username : "player1";

      const newMatch = new FiveOhOne({
        matchId: uuidv4(),
        matchType: "private",
        status: "open",
        player1Id: creatorId,
        player1Username: creatorUsername, // Set creator's username
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


  createRematch: async (creatorId, playerIds, numPlayers, wss) => {
    try {
      if (playerIds.length !== numPlayers) {
        return {
          success: false,
          message: "Number of player IDs does not match numPlayers.",
        };
      }

      const players = await Player.find({ _id: { $in: playerIds } });

      if (players.length !== numPlayers) {
        return { success: false, message: "Some players not found." };
      }

      const playerData = playerIds
        .map((id, index) => {
          const player = players.find((p) => p._id.equals(id));
          return {
            id: player ? player._id.toString() : null,
            username: player ? player.username : `player${index + 1}`,
          };
        })
        .filter((p) => p.id !== null);

      const newMatch = new FiveOhOne({
        matchId: uuidv4(),
        matchType: "private",
        status: "ongoing",
        numPlayers,
        player1Id: playerData[0].id,
        player2Id: numPlayers > 1 ? playerData[1].id : null,
        player3Id: numPlayers > 2 ? playerData[2].id : null,
        player4Id: numPlayers > 3 ? playerData[3].id : null,
        player1Username: playerData[0].username,
        player2Username: numPlayers > 1 ? playerData[1].username : null,
        player3Username: numPlayers > 2 ? playerData[2].username : null,
        player4Username: numPlayers > 3 ? playerData[3].username : null,
        player1Stats: {},
        player2Stats: numPlayers > 1 ? {} : null,
        player3Stats: numPlayers > 2 ? {} : null,
        player4Stats: numPlayers > 3 ? {} : null,
      });

      await newMatch.save();

      const message = JSON.stringify({
        matchType: "501",
        matchId: newMatch.matchId,
        players: playerData.map((p) => p.id),
        numPlayers,
      });

      gameSockets.handleMatchCreatedNotification(message, wss);

      return { success: true, match: newMatch };
    } catch (error) {
      console.error("Error creating rematch:", error);
      return { success: false, message: "Failed to create rematch." };
    }
  },


  joinPrivateMatch: async (matchId, playerId) => {
    try {
      const match = await FiveOhOne.findOne({ matchId, status: "open" });
      if (!match) {
        return { success: false, message: "Match not found or is not open." };
      }

      const player = await Player.findById(playerId); // Get player's username
      const playerUsername = player ? player.username : null;

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

      // Assign the player to the next available slot and set the username
      if (!match.player2Id) {
        match.player2Id = playerId;
        match.player2Username = playerUsername || "player2";
      } else if (!match.player3Id) {
        match.player3Id = playerId;
        match.player3Username = playerUsername || "player3";
      } else if (!match.player4Id) {
        match.player4Id = playerId;
        match.player4Username = playerUsername || "player4";
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

      // Determine which player's stats to update
      let playerStatsField;
      if (match.player1Id && match.player1Id.equals(playerId)) {
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

      // Initialize if needed
      if (!match[playerStatsField] || Array.isArray(match[playerStatsField])) {
        match[playerStatsField] = {
          bullseyes: 0,
          oneEighties: 0,
          scoreLeft: 0,
          dartsThrown: 0,
          dartsHit: 0,
          total180ShotsAttempt: 0,
          total141Checkout: 0,
          totalDoubleShots: 0,
          totalDoubleShotsAttempt: 0,
          total9DartFinish: 0,
        };
      }

      // =========== Update match-level stats ===========
      // Existing fields
      match[playerStatsField].scoreLeft =
        playerStats.scoreLeft ?? match[playerStatsField].scoreLeft;
      match[playerStatsField].bullseyes += playerStats.bullseye || 0;
      match[playerStatsField].dartsThrown += playerStats.dartsThrown || 0;
      match[playerStatsField].dartsHit += playerStats.dartsHit || 0;

      // CHANGED: oneEighty is now an integer count of 180s (e.g., 2 if the player hit two 180s in this turn)
      match[playerStatsField].oneEighties += playerStats.oneEighty || 0;

      // New fields
      match[playerStatsField].total180ShotsAttempt +=
        playerStats.total180ShotsAttempt || 0;
      match[playerStatsField].total141Checkout +=
        playerStats.total141Checkout || 0;
      match[playerStatsField].totalDoubleShots +=
        playerStats.totalDoubleShots || 0;
      match[playerStatsField].totalDoubleShotsAttempt +=
        playerStats.totalDoubleShotsAttempt || 0;
      match[playerStatsField].total9DartFinish +=
        playerStats.total9DartFinish || 0;

      // =========== Update player's aggregated stats ===========
      const player = await Player.findById(playerId);
      if (!player) {
        return { success: false, message: "Player not found." };
      }

      // Overall
      player.stats.totalDartsThrown += playerStats.dartsThrown || 0;
      player.stats.totalDartsHit += playerStats.dartsHit || 0;
      player.stats.totalBullseyes += playerStats.bullseye || 0;

      // Now add integer value of 180 hits
      player.stats.total180s += playerStats.oneEighty || 0;

      // 501 (assuming multiplayer sub-object)
      player.stats.fiveOhOneStats.multi.bullseyeHit +=
        playerStats.bullseye || 0;
      player.stats.fiveOhOneStats.multi.total180s += playerStats.oneEighty || 0;
      player.stats.fiveOhOneStats.multi.total180ShotsAttempt +=
        playerStats.total180ShotsAttempt || 0;
      player.stats.fiveOhOneStats.multi.total141Checkout +=
        playerStats.total141Checkout || 0;
      player.stats.fiveOhOneStats.multi.totalDoubleShots +=
        playerStats.totalDoubleShots || 0;
      player.stats.fiveOhOneStats.multi.totalDoubleShotsAttempt +=
        playerStats.totalDoubleShotsAttempt || 0;
      player.stats.fiveOhOneStats.multi.total9DartFinish +=
        playerStats.total9DartFinish || 0;

      await match.save();
      await player.save();

      return { success: true, match };
    } catch (error) {
      console.error("Error updating match stats:", error);
      return { success: false, message: "Failed to update match stats." };
    }
  },

  updateSingleplayerStats: async (playerId, playerStats) => {
    try {
      const player = await Player.findById(playerId);
      if (!player) {
        return { success: false, message: "Player not found." };
      }

      // ============== Update Player's Overall Stats ==============
      player.stats.totalDartsThrown += playerStats.dartsThrown || 0;
      player.stats.totalDartsHit += playerStats.dartsHit || 0;
      player.stats.totalBullseyes += playerStats.bullseye || 0;
      // oneEighty is now an integer (e.g., 2)
      player.stats.total180s += playerStats.oneEighty || 0;

      // ============== Update Single-Player 501 Stats ==============
      player.stats.fiveOhOneStats.single.bullseyeHit +=
        playerStats.bullseye || 0;
      player.stats.fiveOhOneStats.single.total180s +=
        playerStats.oneEighty || 0;
      player.stats.fiveOhOneStats.single.total180ShotsAttempt +=
        playerStats.total180ShotsAttempt || 0;
      player.stats.fiveOhOneStats.single.total141Checkout +=
        playerStats.total141Checkout || 0;
      player.stats.fiveOhOneStats.single.totalDoubleShots +=
        playerStats.totalDoubleShots || 0;
      player.stats.fiveOhOneStats.single.totalDoubleShotsAttempt +=
        playerStats.totalDoubleShotsAttempt || 0;
      player.stats.fiveOhOneStats.single.total9DartFinish +=
        playerStats.total9DartFinish || 0;

      player.stats.fiveOhOneStats.single.totalfive0OneGamesPlayed += 1;
      player.stats.fiveOhOneStats.single.totalfive0OneGamesWon += 1;

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

  endMatch: async (matchId, winnerId) => {
    try {
      const match = await FiveOhOne.findOne({ matchId, status: "ongoing" });
      if (!match) {
        return {
          success: false,
          message: "Match not found or is not ongoing.",
        };
      }

      // Update match status
      match.status = "closed"; // Set the match status to closed
      match.winner = winnerId; // Assign the winner

      // Update player statistics
      const playerIds = [
        match.player1Id,
        match.player2Id,
        match.player3Id,
        match.player4Id,
      ].filter(Boolean);

      for (const playerId of playerIds) {
        const player = await Player.findById(playerId);
        if (!player) {
          return { success: false, message: "Player not found." };
        }

        player.stats.totalMatchesPlayed += 1;
        player.stats.fiveOhOneStats.multi.totalfive0OneGamesPlayed += 1;
        console.log(`+1 game played for player - ${player.username}`)

        if (playerId.equals(winnerId)) {
          player.stats.fiveOhOneStats.multi.totalfive0OneGamesWon += 1; // Increment total wins in 501
          player.stats.totalWins += 1; 
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
        return {
          success: false,
          message: "Match not found or is not ongoing.",
        };
      }

      match.status = "closed"; // Set the match status to closed
      await match.save();
      return { success: true, match };
    } catch (error) {
      console.error("Error closing match:", error);
      return { success: false, message: "Failed to close match." };
    }
  },

  updateLastTurn: async (matchId, playerId, dart1, dart2, dart3) => {
    try {
      const match = await FiveOhOne.findOne({ matchId });

      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      // Update the lastTurn for the specific player
      if (match.player1Id.equals(playerId)) {
        match.player1Stats.lastTurn = { dart1, dart2, dart3 };
      } else if (match.player2Id.equals(playerId)) {
        match.player2Stats.lastTurn = { dart1, dart2, dart3 };
      } else if (match.player3Id.equals(playerId)) {
        match.player3Stats.lastTurn = { dart1, dart2, dart3 };
      } else if (match.player4Id.equals(playerId)) {
        match.player4Stats.lastTurn = { dart1, dart2, dart3 };
      } else {
        return res
          .status(404)
          .json({ message: "Player not found in this match" });
      }

      await match.save();
      res.status(200).json({ message: "Last turn updated successfully" });
    } catch (error) {
      console.error("Error updating last turn:", error);
      res.status(500).json({ message: "Error updating last turn", error });
    }
  },

  getLastTurn: async (matchId, playerId) => {
    try {
      const match = await FiveOhOne.findOne({ matchId });

      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      let lastTurn;

      if (match.player1Id.equals(playerId)) {
        lastTurn = match.player1Stats.lastTurn;
      } else if (match.player2Id.equals(playerId)) {
        lastTurn = match.player2Stats.lastTurn;
      } else if (match.player3Id.equals(playerId)) {
        lastTurn = match.player3Stats.lastTurn;
      } else if (match.player4Id.equals(playerId)) {
        lastTurn = match.player4Stats.lastTurn;
      } else {
        return res
          .status(404)
          .json({ message: "Player not found in this match" });
      }

      res.status(200).json({ lastTurn });
    } catch (error) {
      console.error("Error fetching last turn:", error);
      res.status(500).json({ message: "Error fetching last turn", error });
    }
  },

  getCommentaryStats: async (matchId) => {
    try {
      // Find the match by matchId
      const match = await FiveOhOne.findOne({ matchId });

      if (!match) {
        console.error("Match not found:", matchId);
        return { success: false, message: "Match not found." };
      }

      // Get player IDs and usernames from the match
      const playersInfo = [
        {
          playerId: match.player1Id,
          playerUsername: match.player1Username || "Player1",
        },
        {
          playerId: match.player2Id,
          playerUsername: match.player2Username || "Player2",
        },
        {
          playerId: match.player3Id,
          playerUsername: match.player3Username || "Player3",
        },
        {
          playerId: match.player4Id,
          playerUsername: match.player4Username || "Player4",
        },
      ].filter((player) => player.playerId); // Filter out null player IDs

      // Fetch player data from the Player collection
      const playerIds = playersInfo.map((p) => p.playerId);
      const playerData = await Player.find({ _id: { $in: playerIds } });

      // Prepare commentary stats for each player
      const players = playersInfo.map((playerInfo) => {
        const player = playerData.find((p) =>
          p._id.equals(playerInfo.playerId),
        );

        // If player is found in Player collection, calculate their rating
        if (player) {
          const totalMatches = player.stats.totalMatchesPlayed || 0;
          const totalWins = player.stats.totalWins || 0;
          const rating =
            totalMatches > 0 ? (totalWins / totalMatches).toFixed(2) : 0;

          // Find the player's throws in the match
          let playerThrows = [];
          if (match.player1Id.equals(player._id)) {
            playerThrows = match.player1Stats.throws || [];
          } else if (match.player2Id && match.player2Id.equals(player._id)) {
            playerThrows = match.player2Stats.throws || [];
          } else if (match.player3Id && match.player3Id.equals(player._id)) {
            playerThrows = match.player3Stats.throws || [];
          } else if (match.player4Id && match.player4Id.equals(player._id)) {
            playerThrows = match.player4Stats.throws || [];
          }

          return {
            playerId: player._id,
            playerUsername: player.username || playerInfo.playerUsername,
            rating: parseFloat(rating),
            throws: playerThrows,
          };
        }

        // If player not found in Player collection, return basic info
        return {
          playerId: playerInfo.playerId,
          playerUsername: playerInfo.playerUsername,
          rating: 0,
          throws: [],
        };
      });

      return { success: true, players }; // Return the 'players' array
    } catch (error) {
      console.error("Error fetching commentary stats:", error);
      return { success: false, message: "Failed to fetch commentary stats." };
    }
  },
};

module.exports = FiveOhOneService;
