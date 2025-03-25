const { v4: uuidv4 } = require('uuid');
const Zombies = require('../../models/Game/Zombies');
const Player = require('../../models/Player');
const mongoose = require("mongoose");

const ZombiesService = {
  createMatch: async (player1Id) => {
    try {
      const newMatch = new Zombies({
        player1Id,
        matchType: 'private-2p',
        status: 'open',
        matchId: uuidv4(),
      });
      await newMatch.save();
      return newMatch;
    } catch (error) {
      console.error('Error creating match:', error);
      return error;
    }
  },

  joinMatch: async (matchId, playerId) => {
    try {
      const match = await Zombies.findOne({ matchId, status: 'open' });
      if (!match) {
        const error = new Error('Match not found or is not open');
        console.error('Error joining match:', error);
        return error;
      }

      const playerIdObj = new mongoose.Types.ObjectId(playerId);

      if (match.player1Id.equals(playerIdObj)) {
        const error = new Error('You cannot join your own match');
        console.error('Error joining match:', error);
        return error;
      }

      if (match.player2Id) {
        const error = new Error('Match is full');
        console.error('Error joining match:', error);
        return error;
      }

      match.player2Id = playerIdObj;
      match.status = 'closed';
      await match.save();
      return match;
    } catch (error) {
      console.error('Error joining match:', error);
      return error;
    }
  },

  updateMatchStats: async (matchId, playerId, playerStats, duration) => {
    try {
      const match = await Zombies.findOne({ matchId });
      if (!match) {
        const error = new Error("Match not found");
        console.error("Error updating match stats:", error);
        return error;
      }

      const playerIdObj = new mongoose.Types.ObjectId(playerId);

      if (match.player1Id.equals(playerIdObj)) {
        match.player1Stats = playerStats;
      } else if (match.player2Id.equals(playerIdObj)) {
        match.player2Stats = playerStats;
      } else {
        const error = new Error("Player is not part of this match");
        console.error("Error updating match stats:", error);
        return error;
      }

      match.duration = duration;
      await match.save();

      // Update the player's zombiesStats
      const player = await Player.findById(playerIdObj);
      if (!player) {
        const error = new Error("Player not found");
        console.error("Error updating player stats:", error);
        return error;
      }

      if (!player.stats.zombiesStats) {
        player.stats.zombiesStats = {
          totalZombiesGamesPlayed: 1,
          highestWave: playerStats.waveReached,
          zombiesKilled: playerStats.kills,
          highestPoints: playerStats.score,
          headshots: playerStats.headshots,
          bodyshots: playerStats.bodyshots,
          legShots: playerStats.legshots,
        };
      } else {
        player.stats.zombiesStats.totalZombiesGamesPlayed++;
        player.stats.zombiesStats.zombiesKilled += playerStats.kills;
        player.stats.zombiesStats.headshots += playerStats.headshots;
        player.stats.zombiesStats.bodyshots += playerStats.bodyshots;
        player.stats.zombiesStats.legShots += playerStats.legshots;
  
        if (playerStats.waveReached > player.stats.zombiesStats.highestWave) {
          player.stats.zombiesStats.highestWave = playerStats.waveReached;
        }
  
        if (playerStats.score > player.stats.zombiesStats.highestPoints) {
          player.stats.zombiesStats.highestPoints = playerStats.score;
        }
      }

      if(!player.stats.totalDartsThrown) {
        player.stats.totalDartsThrown = playerStats.totalDartsThrown;
      } else {
        player.stats.totalDartsThrown += playerStats.totalDartsThrown;
      }

      if(!player.stats.totalMatchesPlayed) {
        player.stats.totalMatchesPlayed = 1;
      } else {
        player.stats.totalMatchesPlayed++;
      }

      await player.save();

      return match;
    } catch (error) {
      console.error("Error updating match stats:", error);
      return error;
    }
  },

  getMatch: async (matchId) => {
    try {
      const match = await Zombies.findOne({ matchId });
      if (!match) {
        const error = new Error('Match not found');
        console.error('Error getting match:', error);
        return error;
      }
      return match;
    } catch (error) {
      console.error('Error getting match:', error);
      return error;
    }
  },

  closeMatch: async (matchId) => {
    try {
      const match = await Zombies.findOne({ matchId, status: 'open' });
      if (!match) {
        const error = new Error('Match not found or is already closed');
        console.error('Error closing match:', error);
        return error;
      }

      match.status = 'closed';
      await match.save();
      return match;
    } catch (error) {
      console.error('Error closing match:', error);
      return error;
    }
  },

  getMatchHistory: async (playerId) => {
    try {
      // Find all matches where the player participated
      const matches = await Zombies.find({
        $or: [
          { player1Id: playerId },
          { player2Id: playerId },
          { player3Id: playerId },
          { player4Id: playerId }
        ],
        status: "closed" // Only include completed matches
      })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .limit(20) // Limit to last 20 matches
      .populate('player1Id', 'username')
      .populate('player2Id', 'username')
      .populate('player3Id', 'username')
      .populate('player4Id', 'username');

      // Process matches to include relevant stats
      const processedMatches = matches.map(match => {
        let playerStats;
        if (match.player1Id && match.player1Id._id.equals(playerId)) {
          playerStats = match.player1Stats;
        } else if (match.player2Id && match.player2Id._id.equals(playerId)) {
          playerStats = match.player2Stats;
        } else if (match.player3Id && match.player3Id._id.equals(playerId)) {
          playerStats = match.player3Stats;
        } else if (match.player4Id && match.player4Id._id.equals(playerId)) {
          playerStats = match.player4Stats;
        }

        return {
          matchId: match.matchId,
          createdAt: match.createdAt,
          players: [
            match.player1Id,
            match.player2Id,
            match.player3Id,
            match.player4Id
          ].filter(Boolean).map(player => ({
            playerId: player._id,
            username: player.username
          })),
          wave: match.wave,
          playerStats: {
            zombiesKilled: playerStats?.zombiesKilled || 0,
            headshots: playerStats?.headshots || 0,
            bodyshots: playerStats?.bodyshots || 0,
            legshots: playerStats?.legshots || 0,
            dartsThrown: playerStats?.dartsThrown || 0,
            dartsHit: playerStats?.dartsHit || 0,
            points: playerStats?.points || 0
          }
        };
      });

      return {
        success: true,
        matches: processedMatches
      };
    } catch (error) {
      console.error("Error fetching zombies match history:", error);
      return { success: false, message: "Failed to fetch match history." };
    }
  },
};

module.exports = ZombiesService;