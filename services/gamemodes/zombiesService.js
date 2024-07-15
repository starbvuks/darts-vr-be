const { Zombies } = require('../../models/Game/Gamemodes');
const { v4: uuidv4 } = require('uuid');

const ZombiesService = {
  createMatch: async (player1Id, player2Id, matchType) => {
    try {
      const matchId = uuidv4();
      const match = new Zombies({
        matchId,
        player1Id,
        player2Id,
        matchType,
      });
      await match.save();
      return match;
    } catch (error) {
      throw error;
    }
  },
  updateMatch: async (matchId, playerId, playerStats) => {
    try {
      const match = await Zombies.findOne({ matchId });
      if (!match) {
        throw new Error('Match not found');
      }

      if (match.player1Id.equals(playerId)) {
        match.player1Stats = playerStats;
      } else if (match.player2Id && match.player2Id.equals(playerId)) {
        match.player2Stats = playerStats;
      } else {
        throw new Error('Invalid player ID');
      }

      await match.save();
      return match;
    } catch (error) {
      throw error;
    }
  },
  getMatch: async (matchId) => {
    try {
      const match = await Zombies.findOne({ matchId });
      if (!match) {
        throw new Error('Match not found');
      }
      return match;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = ZombiesService;
