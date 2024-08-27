// services/leaderboardService.js
const Player = require("../models/Player");

class LeaderboardService {
  async getTopPlayersOverall(limit = 10) {
    try {
      const players = await Player.find()
        .select("username stats")
        .lean()
        .exec();

      // Sorting players based on multiple criteria
      players.sort((a, b) => {
        // Primary: Total Wins
        if (b.stats.totalWins !== a.stats.totalWins) {
          return b.stats.totalWins - a.stats.totalWins;
        }

        // Secondary: Total Bullseyes
        if (b.stats.totalBullseyes !== a.stats.totalBullseyes) {
          return b.stats.totalBullseyes - a.stats.totalBullseyes;
        }

        // Tertiary: Total 180s
        if (b.stats.total180s !== a.stats.total180s) {
          return b.stats.total180s - a.stats.total180s;
        }

        // Quaternary: Accuracy
        if (b.stats.accuracy !== a.stats.accuracy) {
          return b.stats.accuracy - a.stats.accuracy;
        }

        // Quinary: Total Matches Played
        if (b.stats.totalMatchesPlayed !== a.stats.totalMatchesPlayed) {
          return b.stats.totalMatchesPlayed - a.stats.totalMatchesPlayed;
        }

        // Final Tiebreaker: Total Darts Hit
        return b.stats.totalDartsHit - a.stats.totalDartsHit;
      });

      // Return the top N players
      return players.slice(0, limit);
    } catch (error) {
      console.error("Error fetching top players overall:", error);
      throw new Error("Failed to fetch top players overall.");
    }
  }

  async getTopPlayersByGameMode(gameMode, limit = 10) {
    try {
      // Map game modes to the correct stats path
      const statsMap = {
        league: "leagueStats",
        atw: "atwStats",
        zombies: "zombiesStats",
        fiveOhOne: "fiveOhOneStats",
        killstreak: "killstreakStats",
      };

      const statsPath = `stats.${statsMap[gameMode]}`;

      if (!statsPath) {
        throw new Error("Invalid game mode.");
      }

      const players = await Player.find()
        .select(`username ${statsPath}`)
        .lean()
        .exec();

      // Sorting players based on the specific game mode's stats
      players.sort((a, b) => {
        const aStats = a.stats[statsMap[gameMode]];
        const bStats = b.stats[statsMap[gameMode]];

        // Primary: Wins
        if (bStats.totalWins !== aStats.totalWins) {
          return bStats.totalWins - aStats.totalWins;
        }

        // Secondary: Total Bullseyes
        if (bStats.totalBullseyes !== aStats.totalBullseyes) {
          return bStats.totalBullseyes - aStats.totalBullseyes;
        }

        // Tertiary: Total 180s
        if (bStats.total180s !== aStats.total180s) {
          return bStats.total180s - aStats.total180s;
        }

        // Quaternary: Accuracy
        if (bStats.accuracy !== aStats.accuracy) {
          return bStats.accuracy - aStats.accuracy;
        }

        // Quinary: Total Matches Played
        if (bStats.totalMatchesPlayed !== aStats.totalMatchesPlayed) {
          return bStats.totalMatchesPlayed - aStats.totalMatchesPlayed;
        }

        // Final Tiebreaker: Total Darts Hit
        return bStats.totalDartsHit - aStats.totalDartsHit;
      });

      // Return the top N players for the game mode
      return players.slice(0, limit);
    } catch (error) {
      console.error(`Error fetching top players for ${gameMode}:`, error);
      throw new Error(`Failed to fetch top players for ${gameMode}.`);
    }
  }
}

module.exports = new LeaderboardService();
