const { v4: uuidv4 } = require('uuid');
const Zombies = require('../../models/Game/Zombies');

const ZombiesService = {
  joinOrCreateMatch: async (playerId, matchType) => {
      // Check if there is an open match for the given matchType
      let match = await Zombies.findOne({
        player2Id: null,
        matchType,
        status: "open",
      });

      if (match) {
        // Update the existing open match
        match.player2Id = playerId;
        match.status = "closed";
        await match.save();
        return match;
      } else {
        // Create a new match
        const newMatch = new Zombies({
          player1Id: playerId,
          matchType,
          status: "open",
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