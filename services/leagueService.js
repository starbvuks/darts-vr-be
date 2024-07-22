const { v4: uuidv4 } = require("uuid");
const League = require("../../models/League");

const LeagueService = {
  createLeague: async (playerId, numPlayers) => {
    try {
      let totalRounds;
      switch (numPlayers) {
        case 4:
          totalRounds = 3; // 4 players, 3 rounds
          break;
        case 8:
          totalRounds = 7; // 8 players, 7 rounds
          break;
        case 16:
          totalRounds = 15; // 16 players, 15 rounds
          break;
        default:
          return { success: false, message: "Invalid number of players." };
      }

      const league = new League({
        leagueId: uuidv4(),
        players: [playerId], 
        status: "open",
        totalRounds,
      });
      await league.save();
      return { success: true, league };
    } catch (error) {
      console.error("Error creating league:", error);
      return { success: false, message: "Failed to create league." };
    }
  },

  startLeague: async (leagueId) => {
    try {
      const league = await League.findById(leagueId);
      if (!league) {
        return { success: false, message: "League not found." };
      }
      if (league.players.length !== league.totalRounds) {
        return { success: false, message: "Cannot start league with incomplete players." };
      }
      // Initialize matchups for the first round
      await this.initializeMatchups(league);
      league.status = "ongoing";
      await league.save();
      return { success: true, league };
    } catch (error) {
      console.error("Error starting league:", error);
      return { success: false, message: "Failed to start league." };
    }
  },

  initializeMatchups: async (league) => {
    // Logic to create initial matchups based on players
    const players = league.players;
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        await Matchup.create({
          matchId: uuidv4(),
          player1Id: players[i],
          player2Id: players[i + 1],
        });
      }
    }
  },

  processDartThrow: async (matchId, playerId, dartScore, scoreLeft) => {
    try {
      const matchup = await Matchup.findById(matchId);
      if (!matchup) {
        return { success: false, message: "Matchup not found." };
      }

      const playerStats = matchup.player1Id.equals(playerId) ? matchup.player1Stats : matchup.player2Stats;

      // Create a new dart throw entry if it doesn't exist
      let dartThrow = playerStats.throws[playerStats.throws.length - 1];
      if (!dartThrow || dartThrow.darts.length === 3) {
        // Create a new entry for the current turn if there's no last throw or if it has 3 darts
        dartThrow = {
          playerId: playerId,
          darts: [],
        };
        playerStats.throws.push(dartThrow);
      }

      // Add the dart score to the current throw
      dartThrow.darts.push({
        dart1: dartThrow.darts.length === 0 ? dartScore : 0,
        dart2: dartThrow.darts.length === 1 ? dartScore : 0,
        dart3: dartThrow.darts.length === 2 ? dartScore : 0,
        score: scoreLeft, // Store the score left after this throw
      });

      // Update stats
      playerStats.dartsThrown += 1; // Increment total darts thrown
      if (dartScore > 0) {
        playerStats.dartsHit += 1; // Increment darts hit (assuming any score > 0 is a hit)
      }

      // Check for bullseyes and one eighties
      if (dartScore === 50) {
        playerStats.bullseyes += 1; // Increment bullseyes
      }

      // Check if all three darts are thrown
      if (dartThrow.darts.length === 3) {
        const scores = dartThrow.darts.map(d => d.dart1 || d.dart2 || d.dart3);
        if (scores.every(score => score === 60)) {
          playerStats.oneEighties += 1; // Increment one eighties if all darts are 60
        }
      }

      // Save the updated matchup
      await matchup.save();

      return { success: true, matchup };
    } catch (error) {
      console.error("Error processing dart throw:", error);
      return { success: false, message: "Failed to process dart throw." };
    }
  },

  advanceRound: async (leagueId) => {
    const league = await League.findById(leagueId);
    if (!league) {
      throw new Error("League not found.");
    }

    // Collect winners from the current matchups
    const winners = [];
    for (const matchup of league.matchups) {
      if (matchup.winnerId) {
        winners.push(matchup.winnerId);
      }
    }

    // Create new matchups for the next round
    const newMatchups = createNextRoundMatchups(winners);
    league.matchups = newMatchups; // Update the league with new matchups
    league.currentRound += 1; // Increment the current round

    // Save the updated league
    await league.save();

    return league;
  },

  createNextRoundMatchups: async (winners) => {
    const matchups = [];
  
    for (let i = 0; i < winners.length; i += 2) {
      if (i + 1 < winners.length) {
        matchups.push({
          matchId: uuidv4(), // Generate a unique match ID
          player1Id: winners[i],
          player2Id: winners[i + 1],
          status: "ongoing", // Set initial status
        });
      }
    }
  
    return matchups;
  }
  
};

module.exports = LeagueService;
