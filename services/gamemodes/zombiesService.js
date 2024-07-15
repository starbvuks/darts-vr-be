const { v4: uuidv4 } = require('uuid');
const Zombies = require('../../models/Game/Zombies');

const ZombiesService = {
  joinOrCreateMatch: async (playerId, matchType) => {
    const openMatch = await Zombies.findOneAndUpdate(
      { player2Id: null, matchType, status: 'open' },
      { $set: { player2Id: playerId, status: 'closed' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (openMatch.player2Id === playerId) {
      return openMatch;
    } else {
      const newMatch = new Zombies({
        player1Id: playerId,
        matchType,
        status: 'open',
        matchId: uuidv4(),
      });
      await newMatch.save();
      return newMatch;
    }
  },

  joinMatch: async (matchId, playerId) => {
    const match = await Zombies.findOne({ matchId });
    if (!match) {
      throw new Error('Match not found');
    }
    match.player2Id = playerId;
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