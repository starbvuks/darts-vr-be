const { v4: uuidv4 } = require("uuid");
const RedisService = require("../redisService");
const League = require("../../models/League"); // Assuming you have a League model
const Tournament = require("../../models/Tournament"); // Assuming you have a League model
const Player = require("../../models/Player"); // Assuming you have a League model
const gameSockets = require("../../sockets/gameSockets");
const moment = require("moment-timezone");

const cron = require("node-cron");

const TournamentService = {
  scheduledTournaments: {},

  createTournament: async (tournamentDetails) => {
    const { name, startDate, startTime, numPlayers, openDuration, sets, legs } =
      tournamentDetails;

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
    const closeTimeIST = startTimeIST.clone().add(openDuration, "hours");

    try {
      // Create tournament in MongoDB
      const tournament = new Tournament({
        tournamentId,
        name,
        startDate: startTimeIST.toDate(),
        openTime: openTimeIST.toDate(),
        closeTime: closeTimeIST.toDate(),
        openDuration,
        numPlayers,
        sets,
        legs,
      });
      await tournament.save();

      // Schedule queue creation
      const scheduleQueueCreation = async () => {
        console.log(`Creating queue for tournament ID: ${tournamentId}`);
        await RedisService.createQueue(queueName);
        await RedisService.setTourneyQueueOpenTime(
          queueName,
          openTimeIST.valueOf()
        );

        const expiryTimeInSeconds = openDuration * 3600; // Convert hours to seconds
        await RedisService.addToQueueWithExpiry(queueName, expiryTimeInSeconds);

        console.log(
          `Queue ${queueName} created and scheduled for expiration in ${expiryTimeInSeconds} seconds.`
        );

        // Update tournament status to 'open'
        await Tournament.findOneAndUpdate({ tournamentId }, { status: "open" });
      };

      // Schedule queue closing
      const scheduleQueueClosing = async () => {
        console.log(`Closing queue for tournament ID: ${tournamentId}`);
        await TournamentService.closeTournamentQueue(tournamentId);

        // Update tournament status to 'closed'
        await Tournament.findOneAndUpdate(
          { tournamentId },
          { status: "closed" }
        );
      };

      // Calculate delays
      const nowIST = moment().tz("Asia/Kolkata");
      const openDelay = Math.max(0, openTimeIST.valueOf() - nowIST.valueOf());
      const closeDelay = Math.max(0, closeTimeIST.valueOf() - nowIST.valueOf());

      // Schedule the queue creation and closing
      setTimeout(scheduleQueueCreation, openDelay);
      setTimeout(scheduleQueueClosing, closeDelay);

      console.log(
        `Tournament ${tournamentId} scheduled. Queue will open in ${openDelay}ms and close in ${closeDelay}ms.`
      );

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
      console.error("Error creating tournament:", error);
      return { success: false, message: "Failed to create tournament." };
    }
  },

  closeTournamentQueue: async (tournamentId) => {
    const queueName = `tournament-${tournamentId}`;
    await RedisService.closeTournamentQueue(tournamentId); // Note: changed to use tournamentId directly
    console.log(`Tournament queue closed for tournament ID: ${tournamentId}`);

    // Update tournament status in MongoDB
    await Tournament.findOneAndUpdate({ tournamentId }, { status: "closed" });
  },

  getTournamentById: async (tournamentId) => {
    return await Tournament.findOne({ tournamentId });
  },

  listActiveTournaments: async () => {
    return await Tournament.find({ status: { $in: ["scheduled", "open"] } });
  },
  joinTournamentQueue: async (tournamentId, playerId, wss) => {
    const queueName = `tournament-${tournamentId}`;

    try {
      // Check if the queue exists
      const exists = await RedisService.queueExists(queueName);
      if (!exists) {
        console.error(`Queue ${queueName} does not exist`);

        // Check if the tournament exists and if it's time to create the queue
        const tournament = await Tournament.findOne({ tournamentId });
        if (tournament) {
          const nowIST = moment().tz("Asia/Kolkata");
          const openTimeIST = moment(tournament.openTime).tz("Asia/Kolkata");

          if (nowIST.isAfter(openTimeIST)) {
            // It's time to create the queue
            console.log(`Creating queue for tournament ID: ${tournamentId}`);
            await RedisService.createQueue(queueName);
            await RedisService.setTourneyQueueOpenTime(
              queueName,
              openTimeIST.valueOf()
            );

            const expiryTimeInSeconds = tournament.openDuration * 3600;
            await RedisService.addToQueueWithExpiry(
              queueName,
              expiryTimeInSeconds
            );

            console.log(
              `Queue ${queueName} created and scheduled for expiration in ${expiryTimeInSeconds} seconds.`
            );
          } else {
            return {
              success: false,
              message: "Tournament queue is not open yet.",
              openTime: openTimeIST.toDate(),
              closeTime: moment(tournament.closeTime)
                .tz("Asia/Kolkata")
                .toDate(),
            };
          }
        } else {
          return { success: false, message: "Tournament not found." };
        }

        const { numPlayers, sets, legs } = tournament;

        // Add the player to the queue
        await RedisService.addToQueue(queueName, playerId);

        // Check if there are enough players in the queue to start a new match
        const queueLength = await RedisService.getQueueLength(queueName);

        if (queueLength >= numPlayers) {
          const allPlayersInQueue = await RedisService.getPlayersFromQueue(
            queueName,
            numPlayers
          );

          // Validate player IDs using the Player model
          const validPlayerIds = await Player.find({
            _id: { $in: allPlayersInQueue },
          })
            .select("_id")
            .limit(numPlayers);

          if (validPlayerIds.length < numPlayers) {
            console.error(
              `Not enough valid player IDs in queue. Found ${validPlayerIds.length}, need ${numPlayers}`
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
            numPlayers,
            sets,
            legs,
            leagueType: "tournament",
            status: "ongoing",
          });

          await newMatch.save();

          // Remove the players from the queue
          await RedisService.removePlayersFromQueue(queueName, numPlayers);

          // Publish a message to the corresponding Redis channel with the match details
          const message = JSON.stringify({
            matchType: "tournament",
            leagueId: newMatch.leagueId,
            players: validPlayerIds.map((player) => player._id),
            sets,
            legs,
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
