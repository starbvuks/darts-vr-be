const { v4: uuidv4 } = require('uuid');
const Zombies = require('../../models/Game/Zombies');

const ZombiesService = {
  joinMatch: async (matchId, playerId) => {
    const match = await Zombies.findOne({ matchId });
    if (!match) {
      throw new Error('Match not found');
    }
    if (match.status === 'closed') {
      throw new Error('Match is already closed');
    }
    match.playerIds.push(playerId);
    match.status = 'closed';
    await match.save();
    return match;
  },

  updateMatchStats: async (matchId, player1Stats, player2Stats, duration, winner) => {
    const match = await Zombies.findOne({ matchId });
    if (!match) {
      throw new Error('Match not found');
    }
    match.player1Stats = player1Stats;
    match.player2Stats = player2Stats;
    match.duration = duration;
    match.winner = winner;
    await match.save();
    return match;
  },

  getMatch: async (matchId) => {
    const match = await Zombies.findOne({ matchId });
    if (!match) {
      throw new Error('Match not found');
    }
    return match;
  },
};

module.exports = ZombiesService;