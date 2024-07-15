const { v4: uuidv4 } = require('uuid');
const ATW = require('../../models/Game/ATW');

const ATWService = {
  createMatch: async (playerId) => {
    try {
      const matchId = uuidv4();
      const newMatch = new ATW({
        playerId,
        matchId,
        leastDartsUsed: 0,
        points: 0,
        highestNumReached: 0,
        victory: false,
        hits: [],
      });
      await newMatch.save();
      return newMatch;
    } catch (error) {
      throw error;
    }
  },
  updateMatch: async (matchId, stats) => {
    try {
      const match = await ATW.findOneAndUpdate(
        { matchId },
        {
          $set: {
            leastDartsUsed: stats.leastDartsUsed,
            points: stats.points,
            highestNumReached: stats.highestNumReached,
            victory: stats.victory,
            hits: stats.hits,
          },
        },
        { new: true, upsert: true }
      );
      return match;
    } catch (error) {
      throw error;
    }
  },
  getMatch: async (matchId) => {
    try {
      const match = await ATW.findOne({ matchId });
      if (!match) {
        throw new Error('Match not found');
      }
      return match;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = ATWService;
