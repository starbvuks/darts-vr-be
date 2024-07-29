const { v4: uuidv4 } = require("uuid");
const RedisService = require("../redisService");
const League = require("../../models/League"); // Assuming you have a League model
const gameSockets = require("../../sockets/gameSockets");
const cron = require("node-cron");

const TournamentService = {
  scheduledTournaments: {}, // Ensure this is initialized

  createTournament: async (tournamentDetails) => {
    const { startDate, startTime, openDuration } = tournamentDetails;

    const [day, month, year] = startDate.split("/");
    const [hours, minutes] = startTime.split(":");

    // Create the start time in UTC
    const startTimeISO = new Date(
      Date.UTC(year, month - 1, day, hours, minutes)
    );
    const tournamentId = uuidv4();
    const queueName = `tournament-${tournamentId}`;

    // Calculate the open time (5 minutes before the start time)
    const openTime = new Date(startTimeISO.getTime() - 5 * 60 * 1000); // Open 5 minutes before start time
    const closeTime = new Date(openTime.getTime() + openDuration * 60 * 1000); // Close after openDuration

    // Log the start, open, and close times
    console.log(`Tournament Start Time: ${startTimeISO}`);
    console.log(`Tournament Open Time: ${openTime}`);
    console.log(`Tournament Close Time: ${closeTime}`);

    const expiryTimeInSeconds = openDuration * 60; // Convert minutes to seconds

    try {
      // Schedule the creation of the queue using cron
      const cronTime = `${minutes} ${hours} ${day} ${month} *`; // Cron format for scheduling
      const task = cron.schedule(cronTime, async () => {
        console.log(
          `Creating tournament queue for ${queueName} at ${new Date()}`
        );
        try {
          // Initialize the queue and set the expiry time
          await RedisService.addToQueueWithExpiry(
            queueName,
            expiryTimeInSeconds
          );
          console.log(`Queue ${queueName} created successfully.`);

          // Store the open time in Redis
          await RedisService.setTourneyQueueOpenTime(
            queueName,
            openTime.getTime()
          );
          console.log(`Open time set for ${queueName}: ${openTime}`);

          // Schedule the closing of the tournament queue using a separate cron job
          const closeCronTime = `${closeTime.getMinutes()} ${closeTime.getHours()} ${closeTime.getDate()} ${
            closeTime.getMonth() + 1
          } *`;
          const closeTask = cron.schedule(closeCronTime, async () => {
            await TournamentService.closeTournamentQueue(tournamentId);
            console.log(
              `Tournament queue closed for tournament ID: ${tournamentId}`
            );
            closeTask.stop(); // Stop the close task after execution
          });

          // Stop the creation cron job after execution
          task.stop();
        } catch (cronError) {
          console.error("Error executing scheduled task:", cronError);
        }
      });

      // Store the scheduled tournament to manage it later if needed
      TournamentService.scheduledTournaments[tournamentId] = {
        task,
        queueName,
      };

      return {
        success: true,
        tournament: { tournamentId, queueName, startTime: startTimeISO },
      };
    } catch (error) {
      console.error("Error creating tournament queue:", error);
      return { success: false, message: "Failed to create tournament queue." };
    }
  },

  closeTournamentQueue: async (tournamentId) => {
    const queueName = `tournament-${tournamentId}`;
    await RedisService.deleteQueue(queueName); // Close the queue by deleting it
    console.log(`Tournament queue closed for tournament ID: ${tournamentId}`);
  },

  joinTournamentQueue: async (
    tournamentId,
    playerId,
    requiredPlayers,
    sets,
    legs,
    wss
  ) => {
    const queueName = `tournament-${tournamentId}`;

    // Check if the queue is open for this tournament
    const isQueueOpen = await RedisService.isTourneyQueueOpen(queueName);

    if (isQueueOpen) {
      // Add the player to the queue
      await RedisService.addToQueue(queueName, playerId);

      // Check if there are enough players in the queue to start a new match
      const queueLength = await RedisService.getQueueLength(queueName);

      if (queueLength >= requiredPlayers) {
        const playerIdsToMatch = await RedisService.getPlayersFromQueue(
          queueName,
          requiredPlayers
        );

        // Create a new match with the players
        const newMatch = new League({
          leagueId: uuidv4(),
          players: playerIdsToMatch,
          matchups: [],
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

        await RedisService.publishMatchCreated(
          `tournament:${tournamentId}-match-created`,
          message
        );

        // Notify players about the match creation
        gameSockets.handleMatchCreatedNotification(message, wss);

        return newMatch;
      } else {
        return null;
      }
    } else {
      // Retrieve the open time and expiry time
      const openTime = await RedisService.getTourneyQueueOpenTime(queueName);
      const expiryTimeInSeconds = await RedisService.getTourneyQueueExpiry(
        queueName
      );

      // Log the retrieved values
      console.log(
        `Open Time: ${openTime}, Expiry Time: ${expiryTimeInSeconds}`
      );

      const closeTime = openTime
        ? new Date(parseInt(openTime) + expiryTimeInSeconds * 1000)
        : null;

      return {
        success: false,
        message: "Tournament queue is not open yet.",
        openTime: openTime ? new Date(parseInt(openTime)) : null,
        closeTime: closeTime,
      };
    }
  },
};

module.exports = TournamentService;
