const { v4: uuidv4 } = require('uuid');
const Zombies = require('../../models/Game/Zombies');

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

      if (match.player1Id === playerId) {
        const error = new Error('You cannot join your own match');
        console.error('Error joining match:', error);
        return error;
      }

      if (match.player2Id) {
        const error = new Error('Match is full');
        console.error('Error joining match:', error);
        return error;
      }

      match.player2Id = playerId;
      match.status = 'closed';
      await match.save();
      return match;
    } catch (error) {
      console.error('Error joining match:', error);
      return error;
    }
  },

  updateMatchStats: async (matchId, player1Stats, player2Stats, duration, winner) => {
    try {
      const match = await Zombies.findOne({ matchId });
      if (!match) {
        const error = new Error('Match not found');
        console.error('Error updating match stats:', error);
        return error;
      }
      match.player1Stats = player1Stats;
      match.player2Stats = player2Stats;
      match.duration = duration;
      match.winner = winner;
      await match.save();
      return match;
    } catch (error) {
      console.error('Error updating match stats:', error);
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
};

module.exports = ZombiesService;