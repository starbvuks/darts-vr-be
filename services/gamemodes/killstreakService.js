const { v4: uuidv4 } = require('uuid');
const Killstreak = require('../../models/Game/Killstreak');

const KillstreakService = {
  joinOrCreateMatch: async (playerId, matchType) => {
    const openMatch = await Killstreak.findOneAndUpdate(
      { player2Id: null, matchType, status: 'open' },
      { $set: { player2Id: playerId, status: 'closed' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (openMatch.player2Id === playerId) {
      return openMatch;
    } else {
      const newMatch = new Killstreak({
        player1Id: playerId,
        matchType,
        status: 'open',
        matchId: uuidv4(),
      });
      await newMatch.save();
      return newMatch;
    }
  },

  createMatch: async (playerId, matchType) => {
    const newMatch = new Killstreak({
      player1Id: playerId,
      matchType,
      status: 'open',
      matchId: uuidv4(),
    });
    await newMatch.save();
    return newMatch;
  },

  joinMatch: async (matchId, playerId) => {
    const match = await Killstreak.findOne({ matchId });
    if (!match) {
      throw new Error('Match not found');
    }
    match.player2Id = playerId;
    match.status = 'closed';
    await match.save();
    return match;
  },

  updateMatchStats: async (matchId, player1Stats, player2Stats, roundNumber) => {
    const match = await Killstreak.findOne({ matchId });
    if (!match) {
      throw new Error('Match not found');
    }
    match.roundsPlayed.push({
      roundNumber,
      winner: 'pending',
    });
    match.player1Stats.push(player1Stats);
    match.player2Stats.push(player2Stats);
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