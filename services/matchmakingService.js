const RedisService = require("./redisService");
const KillstreakService = require("./gamemodes/killstreakService");
const ZombiesService = require("./gamemodes/zombiesService");
// const FiveOhOneService = require("./gamemodes/fiveOhOneService");

const MatchmakingService = {
  joinMatch: async (gameType, playerCount, playerId) => {
    const queueName = `${gameType}-${playerCount}players`;

    // Add the player to the queue
    await RedisService.addToQueue(queueName, playerId);

    // Check if there are enough players in the queue to start a new match
    const queueLength = await RedisService.getQueueLength(queueName);
    if (queueLength >= playerCount) {
      // Remove the players from the queue
      const playerIds = await RedisService.getPlayersFromQueue(
        queueName,
        playerCount
      );
      await RedisService.removePlayersFromQueue(queueName, playerCount);

      // Create a new match based on the game type and player count
      let newMatch;
      switch (`${gameType}-${playerCount}`) {
        case "501-2":
        case "501-3":
        case "501-4":
        //   newMatch = await FiveOhOneService.createMatch(playerIds);
        //   break;
        case "killstreak-2":
          newMatch = await KillstreakService.createMatch(playerIds);
          break;
        case "zombies-2":
          newMatch = await ZombiesService.createMatch(playerIds);
          break;
        // Add more game types and player counts as needed
      }

      // Publish a message to the corresponding Redis channel with the match details
      const message = JSON.stringify({
        type: "match_created",
        matchId: newMatch.matchId,
        players: newMatch.playerIds,
      });
      await RedisService.publishMatchCreated(
        `${gameType}-${playerCount}-match-created`,
        message
      );

      return newMatch;
    } else {
      // Wait for more players to join the queue
      return null;
    }
  },
};

module.exports = MatchmakingService;