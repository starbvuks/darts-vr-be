const { v4: uuidv4 } = require("uuid");
const Player = require("../models/Player");
const League = require("../models/League");
const Matchup = require("../models/League");
// const DartThrowSchema = require("../models/DartThrowSchema");

const LeagueService = {
  createLeague: async (playerId, numPlayers) => {
    try {
      let totalRounds;
      let matchesPerRound;

      switch (numPlayers) {
        case 4:
          totalRounds = 3;
          matchesPerRound = [4, 2, 1];
          break;
        case 8:
          totalRounds = 4;
          matchesPerRound = [8, 4, 2, 1];
          break;
        case 16:
          totalRounds = 4;
          matchesPerRound = [16, 8, 4, 2, 1];
          break;
        default:
          return { success: false, message: "Invalid number of players." };
      }

      const league = new League({
        leagueId: uuidv4(),
        players: [playerId],
        numPlayers,
        totalRounds,
        matchesPerRound,
        status: "open",
      });

      await league.save();
      return { success: true, league };
    } catch (error) {
      console.error("Error creating league:", error);
      return { success: false, message: "Failed to create league." };
    }
  },

  joinLeague: async (leagueId, playerId) => {
    try {
      // Find the league by its ID
      const league = await League.findOne({ leagueId });
      if (!league) {
        return { success: false, message: "League not found." };
      }

      // Check if the player is already in the league
      if (league.players.includes(playerId)) {
        return { success: false, message: "Player is already in the league." };
      }

      // Check if the league has reached its maximum number of players
      if (league.players.length >= league.numPlayers) {
        return { success: false, message: "League is full. Cannot join." };
      }

      // Add the player to the league's players array
      league.players.push(playerId);

      // Update the player's total matches played
      const player = await Player.findById(playerId);
      if (player) {
        player.stats.totalMatchesPlayed += 1; // Increment total matches played
        await player.save(); // Save the updated player stats
      }

      // Save the updated league
      await league.save();

      return { success: true, league };
    } catch (error) {
      console.error("Error joining league:", error);
      return { success: false, message: "Failed to join league." };
    }
  },

  // leave league

  initializeMatchups: async (league) => {
    // Logic to create initial matchups based on players
    const players = league.players;
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        await Matchup.create({
          matchId: uuidv4(),
          round: league.round,
          player1Id: players[i],
          player2Id: players[i + 1],
        });
      }
    }
  },

  startLeague: async (leagueId) => {
    try {
      const league = await League.findOne({ leagueId });
      if (!league) {
        return { success: false, message: "League not found." };
      }
      if (league.players.length !== league.numPlayers) {
        return {
          success: false,
          message: "Cannot start league with incomplete players.",
        };
      }
      // Initialize matchups for the first round
      await LeagueService.initializeMatchups(league);
      league.status = "ongoing";
      await league.save();
      return { success: true, league };
    } catch (error) {
      console.error("Error starting league:", error);
      return { success: false, message: "Failed to start league." };
    }
  },

  processDartThrow: async (matchId, playerId, dartScore, dartNumber, wss) => {
    try {
      const matchup = await Matchup.findOne({ matchId });
      if (!matchup) {
        return { success: false, message: "Matchup not found." };
      }

      const playerStats = matchup.player1Id.equals(playerId)
        ? matchup.player1Stats
        : matchup.player2Stats;

      let dartThrow = playerStats.throws[playerStats.throws.length - 1];
      if (!dartThrow || dartThrow.darts.length === 3) {
        dartThrow = {
          playerId: playerId,
          darts: [],
        };
        playerStats.throws.push(dartThrow);
      }

      dartThrow.darts.push({
        dart1: dartNumber === 1 ? dartScore : 0,
        dart2: dartNumber === 2 ? dartScore : 0,
        dart3: dartNumber === 3 ? dartScore : 0,
        score: playerStats.scoreLeft,
      });

      playerStats.dartsThrown += 1;
      if (dartScore > 0) {
        playerStats.dartsHit += 1;
      }

      if (dartScore === 50) {
        playerStats.bullseyes += 1;
      }

      if (dartThrow.darts.length === 3) {
        const scores = dartThrow.darts.map(
          (d) => d.dart1 || d.dart2 || d.dart3
        );
        if (scores.every((score) => score === 60)) {
          playerStats.oneEighties += 1;
        }
      }

      await matchup.save();

      // Retrieve the player's username
      const player = await Player.findById(playerId);
      const playerUsername = player ? player.username : "Unknown Player"; // Adjust based on your Player model

      // Send dart throw notification to all clients in the league
      gameSockets.sendDartThrowNotification(
        matchId,
        playerId,
        playerUsername,
        dartScore,
        wss
      );

      return { success: true, matchup };
    } catch (error) {
      console.error("Error processing dart throw:", error);
      return { success: false, message: "Failed to process dart throw." };
    }
  },

  addCommentary: async (matchId, playerId, commentary) => {
    try {
      const matchup = await Matchup.findOne({ matchId });
      if (!matchup) {
        return { success: false, message: "Matchup not found." };
      }

      const playerStats = matchup.player1Id.equals(playerId)
        ? matchup.player1Stats
        : matchup.player2Stats;
      const lastThrow = playerStats.throws[playerStats.throws.length - 1];

      if (lastThrow && lastThrow.darts.length === 3) {
        lastThrow.darts[lastThrow.darts.length - 1].commentary = commentary;
        await matchup.save();
        return { success: true, matchup };
      } else {
        return { success: false, message: "Last throw not completed." };
      }
    } catch (error) {
      console.error("Error adding commentary:", error);
      return { success: false, message: "Failed to add commentary." };
    }
  },

  endMatch: async (matchId, winnerId) => {
    try {
      const matchup = await Matchup.findOne({ matchId });
      if (!matchup) {
        return { success: false, message: "Matchup not found." };
      }

      matchup.winnerId = winnerId;
      matchup.status = "completed";
      await matchup.save();

      return { success: true, matchup };
    } catch (error) {
      console.error("Error ending match:", error);
      return { success: false, message: "Failed to end match." };
    }
  },

  advanceRound: async (leagueId) => {
    const league = await League.findOne({ leagueId });
    if (!league) {
      return { success: false, message: "League not found." };
    }

    const completedMatches = league.matchups.filter(
      (matchup) => matchup.status === "completed"
    ).length;

    if (completedMatches < league.matchesPerRound[league.currentRound - 1]) {
      return {
        success: false,
        message: "Cannot advance to the next round yet.",
      };
    }

    await LeagueService.createNextRoundMatchups(league);
    league.currentRound += 1;
    await league.save();

    return { success: true, league };
  },

  createNextRoundMatchups: async (league) => {
    const winners = league.matchups
      .filter((matchup) => matchup.status === "completed")
      .map((matchup) => matchup.winnerId);

    const numMatches = Math.floor(winners.length / 2);
    const matchups = [];

    for (let i = 0; i < numMatches; i++) {
      matchups.push({
        matchId: uuidv4(),
        round: league.currentRound + 1,
        player1Id: winners[i * 2],
        player2Id: winners[i * 2 + 1],
      });
    }

    league.matchups = league.matchups.concat(matchups);
  },

  handlePlayerDisconnect: async (matchId, playerId) => {
    const matchup = await Matchup.findOne({ matchId });
    if (!matchup) {
      throw new Error("Matchup not found.");
    }

    if (matchup.player1Id.equals(playerId)) {
      matchup.winnerId = matchup.player2Id;
    } else if (matchup.player2Id.equals(playerId)) {
      matchup.winnerId = matchup.player1Id;
    } else {
      throw new Error("Player not part of this matchup.");
    }

    matchup.status = "completed";
    await matchup.save();
  },

  endLeague: async (leagueId, leagueWinnerId) => {
    const league = await League.findOne({ leagueId });
    if (!league) {
      return { success: false, message: "League not found." };
    }

    league.status = "completed";
    league.winnerId = leagueWinnerId;
    await league.save();

    return { success: true };
  },
};

module.exports = LeagueService;
