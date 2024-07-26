const { v4: uuidv4 } = require("uuid");
const RedisService = require("../redisService");
const League = require("../models/League"); // Assuming you have a League model
const gameSockets = require("../../sockets/gameSockets");

const TournamentService = {
  createTournament: async (tournamentDetails) => {
    const { startTime, openDuration } = tournamentDetails;
    const tournamentId = uuidv4();
    const queueName = `tournament-${tournamentId}`;
    
    // Calculate the open time (5 minutes before the start time)
    const openTime = new Date(startTime.getTime() - (5 * 60 * 1000)); // Open 5 minutes before start time
    const closeTime = new Date(startTime.getTime() + (openDuration * 60 * 60 * 1000)); // Duration in hours

    await tournament.save();

    // Set the queue open time in Redis
    await RedisService.setTourneyQueueOpenTime(queueName, openTime.getTime());
    await RedisService.setTourneyQueueCloseTime(queueName, closeTime.getTime());

    // Schedule the queue opening
    setTimeout(() => {
      TournamentService.openTournamentQueue(tournamentId);
    }, openTime.getTime() - Date.now());

    // Schedule the queue closing
    setTimeout(() => {
      TournamentService.closeTournamentQueue(tournamentId);
    }, closeTime.getTime() - Date.now());

    return tournament;
  },

  openTournamentQueue: async (tournamentId) => {
    const queueName = `tournament-${tournamentId}`;
    await RedisService.openQueue(queueName); // Open the queue for players to join
    console.log(`Tournament queue opened for tournament ID: ${tournamentId}`);
  },

  closeTournamentQueue: async (tournamentId) => {
    const queueName = `tournament-${tournamentId}`;
    await RedisService.deleteQueue(queueName); // Close the queue for players
    console.log(`Tournament queue closed for tournament ID: ${tournamentId}`);
  },

  joinTournamentQueue: async (tournamentId, playerId, requiredPlayers, sets, legs, wss) => {
    const queueName = `tournament-${tournamentId}`;

    // Check if the queue is open for this tournament
    const isQueueOpen = await RedisService.isTourneyQueueOpen(queueName);

    if (isQueueOpen) {
      // Add the player to the queue
      await RedisService.addToQueue(queueName, playerId);

      // Check if there are enough players in the queue to start a new match
      const queueLength = await RedisService.getQueueLength(queueName);

      if (queueLength >= requiredPlayers) {
        const playerIdsToMatch = await RedisService.getPlayersFromQueue(queueName, requiredPlayers);

        // Create a new match with the players
        const newMatch = new League({
          leagueId: uuidv4(),
          players: playerIdsToMatch,
          matchups: [], // Initialize matchups
          numPlayers: requiredPlayers,
          sets: sets,
          legs: legs,
          status: "ongoing",
        });

        await newMatch.save();

        // Remove the players from the queue
        await RedisService.removePlayersFromQueue(queueName, requiredPlayers);

        // Publish a message to the corresponding Redis channel with the match details
        const message = JSON.stringify({
          matchType: "tournament",
          leagueId: newMatch.leagueId,
          players: playerIdsToMatch,
          sets: sets,
          legs: legs,
        });

        await RedisService.publishMatchCreated(`tournament:${tournamentId}-match-created`, message);

        // Notify players about the match creation
        gameSockets.handleMatchCreatedNotification(message, wss);

        return newMatch;
      } else {
        // Wait for more players to join the queue
        return null;
      }
    } else {
      // Return an error or a response indicating that the queue is not open yet
      return { success: false, message: "Tournament queue is not open yet." };
    }
  },
};

module.exports = TournamentService;
