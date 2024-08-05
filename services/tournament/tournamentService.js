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
        tournament,
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
      // Fetch the tournament details from the database
      const tournament = await Tournament.findOne({ tournamentId });

      if (!tournament) {
        return { success: false, message: "Tournament not found." };
      }

      const nowIST = moment().tz("Asia/Kolkata");
      const openTimeIST = moment(tournament.openTime).tz("Asia/Kolkata");
      const closeTimeIST = moment(tournament.closeTime).tz("Asia/Kolkata");

      // Check if the current time is before the open time
      if (nowIST.isBefore(openTimeIST)) {
        return {
          success: false,
          message: "Tournament queue is not open yet.",
          openTime: openTimeIST.toDate(),
          closeTime: closeTimeIST.toDate(),
        };
      }

      // Check if the current time is after the close time
      if (nowIST.isAfter(closeTimeIST)) {
        return {
          success: false,
          message: "Tournament queue has already closed.",
          openTime: openTimeIST.toDate(),
          closeTime: closeTimeIST.toDate(),
        };
      }

      const allPlayersInQueue = await RedisService.getPlayersFromQueue(
        queueName,
        tournament.numPlayers
      );
      if (allPlayersInQueue.includes(playerId)) {
        return {
          success: false,
          message: "You are already in the tournament queue.",
        };
      }

      await RedisService.addToQueue(queueName, playerId);

      // Check if there are enough players in the queue to start a new match
      const queueLength = await RedisService.getQueueLength(queueName);
      if (queueLength >= tournament.numPlayers) {
        const allPlayersInQueue = await RedisService.getPlayersFromQueue(
          queueName,
          tournament.numPlayers
        );

        // Log the players currently in the queue
        console.log(
          `Players in queue for tournament ${tournamentId}:`,
          allPlayersInQueue
        );

        // Ensure unique player IDs
        const uniquePlayerIds = [...new Set(allPlayersInQueue)];

        // Validate player IDs using the Player model
        const validPlayerIds = await Player.find({
          _id: { $in: uniquePlayerIds },
        })
          .select("_id")
          .limit(tournament.numPlayers);

        if (validPlayerIds.length < tournament.numPlayers) {
          console.error(
            `Not enough valid player IDs in queue. Found ${validPlayerIds.length}, need ${tournament.numPlayers}`
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
          numPlayers: tournament.numPlayers,
          sets: tournament.sets,
          legs: tournament.legs,
          leagueType: "tournament",
          status: "ongoing",
        });

        await newMatch.save();

        // Remove the players from the queue
        await RedisService.removePlayersFromQueue(
          queueName,
          tournament.numPlayers
        );

        // Publish a message to the corresponding Redis channel with the match details
        const message = JSON.stringify({
          matchType: "tournament",
          leagueId: newMatch.leagueId,
          players: validPlayerIds.map((player) => player._id),
          sets: tournament.sets,
          legs: tournament.legs,
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
    } catch (error) {
      console.error("Error joining tournament queue:", error);
      return { success: false, message: "Failed to join tournament queue." };
    }
  },
};

module.exports = TournamentService;
