const { v4: uuidv4 } = require('uuid');
const Killstreak = require('../../models/Game/Gamemodes');

const KillstreakService = {
    createMatch: async (player1Id, player2Id, matchType) => {
      try {
        const matchId = uuidv4();
        const newMatch = new Killstreak({
          matchId,
          matchType,
          player1Id,
          player2Id: player2Id || null,
          roundsPlayed: [],
          player1Stats: [],
          player2Stats: [],
          winner: null,
        });
        await newMatch.save();
        return newMatch;
      } catch (error) {
        throw error;
      }
    },
    updateMatch: async (matchId, playerId, playerStats) => {
      try {
        const match = await Killstreak.findOne({ matchId });
        if (!match) {
          throw new Error('Match not found');
        }
  
        if (match.player1Id.equals(playerId)) {
          match.player1Stats.push({
            currentStreak: playerStats.currentStreak,
            bestStreak: playerStats.bestStreak,
            totalPoints: playerStats.totalPoints,
            totalDarts: playerStats.totalDarts,
          });
        } else if (match.player2Id && match.player2Id.equals(playerId)) {
          match.player2Stats.push({
            currentStreak: playerStats.currentStreak,
            bestStreak: playerStats.bestStreak,
            totalPoints: playerStats.totalPoints,
            totalDarts: playerStats.totalDarts,
          });
        } else {
          throw new Error('Invalid player ID');
        }
  
        await match.save();
        return match;
      } catch (error) {
        throw error;
      }
    },
    addRoundWinner: async (matchId, roundNumber, winner) => {
      try {
        const match = await Killstreak.findOneAndUpdate(
          { matchId },
          {
            $push: {
              roundsPlayed: {
                roundNumber,
                winner,
              },
            },
          },
          { new: true, upsert: true }
        );
        return match;
      } catch (error) {
        throw error;
      }
    },
    determineMatchWinner: async (matchId) => {
      try {
        const match = await Killstreak.findById(matchId);
        if (!match) {
          throw new Error('Match not found');
        }
  
        // Determine the match winner based on the best streaks
        if (match.player1Stats.length > 0 && match.player2Stats.length > 0) {
          const player1BestStreak = Math.max(...match.player1Stats.map(stats => stats.bestStreak));
          const player2BestStreak = Math.max(...match.player2Stats.map(stats => stats.bestStreak));
  
          if (player1BestStreak > player2BestStreak) {
            return 'player1';
          } else if (player1BestStreak < player2BestStreak) {
            return 'player2';
          } else {
            return 'tie';
          }
        } else {
          return null;
        }
      } catch (error) {
        throw error;
      }
    },
    getMatch: async (matchId) => {
      try {
        const match = await Killstreak.findOne({ matchId });
        if (!match) {
          throw new Error('Match not found');
        }
        return match;
      } catch (error) {
        throw error;
      }
    },
  };
  
  module.exports = KillstreakService;