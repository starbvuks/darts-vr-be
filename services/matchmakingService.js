const { v4: uuidv4 } = require('uuid');
const RedisService = require('./redisService');
const Zombies = require('../models/Game/Zombies');
const Killstreak = require('../models/Game/Killstreak');
// const FiveOhOne = require('../models/Game/FiveOhOne');

const MatchmakingService = {
  joinMatch: async (gameType, playerCount, playerIds) => {
    const queueName = `${gameType}-${playerCount}players`;

    // Add the players to the queue
    await Promise.all(playerIds.map((playerId) => RedisService.addToQueue(queueName, playerId)));

    // Check if there are enough players in the queue to start a new match
    const queueLength = await RedisService.getQueueLength(queueName);
    if (queueLength >= playerCount) {
      // Remove the players from the queue
      const playerIdsToMatch = await RedisService.getPlayersFromQueue(queueName, playerCount);
      await RedisService.removePlayersFromQueue(queueName, playerCount);

      // Create a new match based on the game type and player count
      let newMatch;
      switch (`${gameType}-${playerCount}`) {
        case 'zombies-2':
          newMatch = await this.createZombiesMatch(playerIdsToMatch);
          break;
        case 'killstreak-2':
          newMatch = await this.createKillstreakMatch(playerIdsToMatch);
          break;
        case '501-2':
        case '501-3':
        // case '501-4':
        //   newMatch = await this.create501Match(playerIdsToMatch);
        //   break;
        // Add more game types and player counts as needed
      }

      // Publish a message to the corresponding Redis channel with the match details
      const message = JSON.stringify({
        type: "match_created",
        matchId: newMatch.matchId,
        players: newMatch.playerIds,
      });
      await RedisService.publishMatchCreated(`${gameType}-${playerCount}-match-created`, message);

      return newMatch;
    } else {
      // Wait for more players to join the queue
      return null;
    }
  },

  createZombiesMatch: async (playerIds) => {
    const newMatch = new Zombies({
      playerIds,
      matchType: 'multiplayer',
      status: 'open',
      matchId: uuidv4(),
    });
    await newMatch.save();
    return newMatch;
  },

  createKillstreakMatch: async (playerIds) => {
    const newMatch = new Killstreak({
      playerIds,
      matchType: 'multiplayer',
      status: 'open',
      matchId: uuidv4(),
    });
    await newMatch.save();
    return newMatch;
  },

//   create501Match: async (playerIds) => {
//     const newMatch = new FiveOhOne({
//       playerIds,
//       matchType: 'multiplayer',
//       status: 'open',
//       matchId: uuidv4(),
//     });
//     await newMatch.save();
//     return newMatch;
//   },
};

module.exports = MatchmakingService;