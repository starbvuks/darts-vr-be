const { v4: uuidv4 } = require('uuid');
const Killstreak = require('../../models/Game/Killstreak');

const KillstreakService = {
  joinMatch: async (matchId, playerId) => {
    const match = await Killstreak.findOne({ matchId });
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

  createMatch: async (playerIds) => {
    const newMatch = new Killstreak({
      playerIds,
      matchType: 'multiplayer',
      status: 'open',
      matchId: uuidv4(),
    });
    await newMatch.save();
    return newMatch;
  },

  updateMatchStats: async (matchId, player1Stats, player2Stats, duration, winner) => {
    const match = await Killstreak.findOne({ matchId });
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
    const match = await Killstreak.findOne({ matchId });
    if (!match) {
      throw new Error('Match not found');
    }
    return match;
  },
};

module.exports = KillstreakService;