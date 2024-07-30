const { v4: uuidv4 } = require("uuid");
const RedisService = require("../redisService");
const League = require("../../models/League"); // Assuming you have a League model
const Player = require("../../models/Player"); // Assuming you have a League model
const gameSockets = require("../../sockets/gameSockets");
const cron = require("node-cron");
const moment = require("moment-timezone");

const TournamentService = {
  scheduledTournaments: {},

  createTournament: async (tournamentDetails) => {
    const { startDate, startTime, openDuration } = tournamentDetails;

    const [day, month, year] = startDate.split("/");
    const [hours, minutes] = startTime.split(":");

    const startTimeIST = moment.tz(
      `${year}-${month}-${day} ${hours}:${minutes}`,
      "YYYY-MM-DD HH:mm",
      "Asia/Kolkata"
    );
    const tournamentId = uuidv4();
    const queueName = `tournament-${tournamentId}`;

    const openTimeIST = startTimeIST.clone().subtract(5, "minutes");
    const closeTimeIST = startTimeIST.clone().add(openDuration, "minutes");

    console.log(`Tournament Start Time (IST): ${startTimeIST.format()}`);
    console.log(`Tournament Open Time (IST): ${openTimeIST.format()}`);
    console.log(`Tournament Close Time (IST): ${closeTimeIST.format()}`);

    const expiryTimeInSeconds =
      (closeTimeIST.valueOf() - openTimeIST.valueOf()) / 1000;

    try {
      // Immediately create the queue and set the open time
      await RedisService.createQueue(queueName);
      await RedisService.setTourneyQueueOpenTime(
        queueName,
        openTimeIST.valueOf()
      );
      await RedisService.addToQueueWithExpiry(queueName, expiryTimeInSeconds);

      console.log(`Queue ${queueName} created successfully.`);
      console.log(`Open time set for ${queueName}: ${openTimeIST.format()}`);

      const openTask = cron.schedule(
        openTimeIST.format("m H D M *"),
        async () => {
          console.log(
            `Tournament queue ${queueName} is now open at ${moment().format()}`
          );
        },
        {
          timezone: "Asia/Kolkata",
        }
      );

      const closeTask = cron.schedule(
        closeTimeIST.format("m H D M *"),
        async () => {
          await TournamentService.closeTournamentQueue(tournamentId);
          console.log(
            `Tournament queue closed for tournament ID: ${tournamentId}`
          );
          closeTask.stop();
        },
        {
          timezone: "Asia/Kolkata",
        }
      );

      TournamentService.scheduledTournaments[tournamentId] = {
        openTask,
        closeTask,
        queueName,
      };

      return {
        success: true,
        tournament: {
          tournamentId,
          queueName,
          startTime: startTimeIST.toDate(),
          openTime: openTimeIST.toDate(),
          closeTime: closeTimeIST.toDate(),
        },
      };
    } catch (error) {
      console.error("Error creating tournament queue:", error);
      return { success: false, message: "Failed to create tournament queue." };
    }
  },

  closeTournamentQueue: async (tournamentId) => {
    const queueName = `tournament-${tournamentId}`;
    await RedisService.closeTournamentQueue(queueName);
    console.log(`Tournament queue closed for tournament ID: ${tournamentId}`);

    if (TournamentService.scheduledTournaments[tournamentId]) {
      TournamentService.scheduledTournaments[tournamentId].openTask.stop();
      delete TournamentService.scheduledTournaments[tournamentId];
    }
  },

  // closeTournamentQueue: async (tournamentId) => {
  //   const queueName = `tournament-${tournamentId}`;
  //   await RedisService.deleteQueue(queueName); // Close the queue by deleting it
  //   console.log(`Tournament queue closed for tournament ID: ${tournamentId}`);
  // },

  // closeTournamentQueue: async (tournamentId) => {
  //   const queueName = `tournament-${tournamentId}`;
  //   const queueLength = await RedisService.getQueueLength(queueName);

  //   console.log(`Closing tournament queue for ${queueName}`);

  //   if (queueLength === 0) {
  //     await RedisService.deleteQueue(queueName);
  //     await RedisService.deleteKey(`${queueName}:open_time`);
  //     console.log(`Tournament queue closed and deleted for tournament ID: ${tournamentId}`);
  //   } else {
  //     await RedisService.setQueueStatus(queueName, "closed");
  //     console.log(`Tournament queue closed for tournament ID: ${tournamentId}`);

  //     const interval = setInterval(async () => {
  //       const currentQueueLength = await RedisService.getQueueLength(queueName);
  //       if (currentQueueLength === 0) {
  //         clearInterval(interval);
  //         await RedisService.deleteQueue(queueName);
  //         await RedisService.deleteKey(`${queueName}:open_time`);
  //         console.log(`Tournament queue deleted for tournament ID: ${tournamentId}`);
  //       }
  //     }, 10000);
  //   }
  // },

  joinTournamentQueue: async (
    tournamentId,
    playerId,
    requiredPlayers,
    sets,
    legs,
    wss
  ) => {
    const queueName = `tournament-${tournamentId}`;

    try {
      // Check if the queue exists
      const exists = await RedisService.queueExists(queueName);
      if (!exists) {
        console.error(`Queue ${queueName} does not exist`);
        return { success: false, message: "Tournament queue does not exist." };
      }

      // Check if the queue is open for this tournament
      const isQueueOpen = await RedisService.isTourneyQueueOpen(queueName);

      if (isQueueOpen) {
        // Check if the player is already in the queue
        const isPlayerInQueue = await RedisService.isPlayerInQueue(
          queueName,
          playerId
        );

        if (isPlayerInQueue) {
          console.error(
            `Player ${playerId} is already in the queue ${queueName}`
          );
          return {
            success: false,
            message: "You are already in the tournament queue.",
          };
        }

        // Add the player to the queue
        await RedisService.addToQueue(queueName, playerId);

        // Check if there are enough players in the queue to start a new match
        const queueLength = await RedisService.getQueueLength(queueName);

        if (queueLength >= requiredPlayers) {
          const allPlayersInQueue = await RedisService.getPlayersFromQueue(
            queueName,
            queueLength
          );

          // Validate player IDs using the Player model
          const validPlayerIds = await Player.find({
            _id: { $in: allPlayersInQueue },
          })
            .select("_id")
            .limit(requiredPlayers);

          if (validPlayerIds.length < requiredPlayers) {
            console.error(
              `Not enough valid player IDs in queue. Found ${validPlayerIds.length}, need ${requiredPlayers}`
            );
            return {
              success: false,
              message: "Not enough valid players in queue.",
            };
          }

          // Create a new match with the players
          const newMatch = new League({
            leagueId: uuidv4(),
            players: validPlayerIds.map((player) => player._id),
            matchups: [],
            numPlayers: requiredPlayers,
            sets: sets,
            legs: legs,
            leagueType: "tournament",
            status: "ongoing",
          });

          await newMatch.save();

          // Remove the players from the queue
          await RedisService.removePlayersFromQueue(queueName, requiredPlayers);

          // Publish a message to the corresponding Redis channel with the match details
          const message = JSON.stringify({
            matchType: "tournament",
            leagueId: newMatch.leagueId,
            players: validPlayerIds.map((player) => player._id),
            sets: sets,
            legs: legs,
          });

          await RedisService.publishMatchCreated(
            `tournament:${tournamentId}-match-created`,
            message
          );

          // Notify players about the match creation
          gameSockets.handleMatchCreatedNotification(message, wss);

          return { success: true, match: newMatch };
        } else {
          return {
            success: true,
            message: "Added to queue. Waiting for more players.",
          };
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
    } catch (error) {
      console.error("Error joining tournament queue:", error);
      return { success: false, message: "Failed to join tournament queue." };
    }
  },
};

module.exports = TournamentService;
