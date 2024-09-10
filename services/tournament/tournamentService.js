const { v4: uuidv4 } = require("uuid");
const RedisService = require("../redisService");
const LeagueService = require("../leagueService");
const Tournament = require("../../models/Tournament");
const Player = require("../../models/Player");
const gameSockets = require("../../sockets/gameSockets");
const moment = require("moment-timezone");

const TournamentService = {
  scheduledTournaments: {},

  createTournament: async (tournamentDetails, wss) => {
    const { name, startDate, startTime, numPlayers, sets, legs } =
      tournamentDetails;

    // Parse start date and time
    const [day, month, year] = startDate.split("/");
    const [hours, minutes] = startTime.split(":");

    // Convert to IST (Indian Standard Time)
    const startTimeIST = moment.tz(
      `${year}-${month}-${day} ${hours}:${minutes}`,
      "YYYY-MM-DD HH:mm",
      "Asia/Kolkata",
    );
    const queueOpenTimeIST = startTimeIST.clone().subtract(1, "minutes"); // Queue opens 5 minutes before start

    const tournamentId = uuidv4();
    const queueName = `tournament-${tournamentId}`;

    try {
      // Create the tournament in MongoDB
      const tournament = new Tournament({
        tournamentId,
        name,
        startDate: startTimeIST.toDate(),
        openTime: queueOpenTimeIST.toDate(),
        closeTime: startTimeIST.toDate(),
        numPlayers,
        sets,
        legs,
        status: "scheduled",
      });
      await tournament.save();

      // Schedule queue opening
      const scheduleQueueOpening = async () => {
        console.log(`Opening queue for tournament ID: ${tournamentId}`);
        await RedisService.createQueue(queueName);
        await RedisService.setTourneyQueueOpenTime(
          queueName,
          queueOpenTimeIST.valueOf(),
        );

        // Notify players via WebSocket that the queue is open
        const message = JSON.stringify({
          type: "queue_open",
          gamemode: "tournament",
          tournamentId,
          name,
          startTime: startTimeIST.toDate(),
        });
        gameSockets.handleQueueOpenNotification(tournamentId, message, wss);

        // Update tournament status to 'open'
        await Tournament.findOneAndUpdate({ tournamentId }, { status: "open" });
      };

      // Schedule queue closing and match creation
      const scheduleQueueClosing = async () => {
        console.log(
          `Closing queue and creating matches for tournament ID: ${tournamentId}`,
        );
        // Create the league/tournament matches
        const result = await TournamentService.createMatchesForTournament(
          tournamentId,
          queueName,
          numPlayers,
          sets,
          legs,
          wss,
        );

        await TournamentService.closeTournamentQueue(tournamentId);

        if (!result.success) {
          console.error("Failed to create matches for the tournament.");
        }

        // Update tournament status to 'closed'
        await Tournament.findOneAndUpdate(
          { tournamentId },
          { status: "closed" },
        );
      };

      // Calculate delays
      const nowIST = moment().tz("Asia/Kolkata");
      const openDelay = Math.max(
        0,
        queueOpenTimeIST.valueOf() - nowIST.valueOf(),
      );
      const closeDelay = Math.max(0, startTimeIST.valueOf() - nowIST.valueOf());

      // Schedule the queue opening and closing
      setTimeout(scheduleQueueOpening, openDelay);
      setTimeout(scheduleQueueClosing, closeDelay);

      console.log(
        `Tournament ${tournamentId} scheduled. Queue will open in ${openDelay}ms and close in ${closeDelay}ms.`,
      );

      return { tournament };
    } catch (error) {
      console.error("Error creating tournament:", error);
      return { success: false, message: "Failed to create tournament." };
    }
  },

  closeTournamentQueue: async (tournamentId) => {
    const queueName = `tournament-${tournamentId}`;
    await RedisService.closeTournamentQueue(tournamentId);
    console.log(`Tournament queue closed for tournament ID: ${tournamentId}`);

    // Update tournament status in MongoDB
    await Tournament.findOneAndUpdate({ tournamentId }, { status: "closed" });
  },

  getTournamentById: async (tournamentId) => {
    return await Tournament.findOne({ tournamentId });
  },

  listActiveTournaments: async () => {
    return await Tournament.find({
      status: { $in: ["scheduled", "open"] },
    }).sort({ startDate: -1 }); // Sort by startDate in descending order
  },

  deleteTournament: async (tournamentId) => {
    try {
      // Find the tournament by ID
      const tournament = await Tournament.findOne({ tournamentId });

      if (!tournament) {
        return { success: false, message: "Tournament not found." };
      }

      // Delete the tournament
      await Tournament.deleteOne({ tournamentId });

      // Optionally, clear related Redis queue (if relevant)
      const queueName = `tournament-${tournamentId}`;
      await RedisService.closeTournamentQueue(queueName);

      return { success: true, message: "Tournament deleted successfully." };
    } catch (error) {
      console.error("Error deleting tournament:", error);
      return { success: false, message: "Failed to delete tournament." };
    }
  },

  joinTournamentQueue: async (tournamentId, playerId) => {
    const queueName = `tournament-${tournamentId}`;

    try {
      const tournament = await Tournament.findOne({ tournamentId });

      if (!tournament) {
        return { success: false, message: "Tournament not found." };
      }

      const nowIST = moment().tz("Asia/Kolkata");
      const openTimeIST = moment(tournament.openTime).tz("Asia/Kolkata");
      const closeTimeIST = moment(tournament.closeTime).tz("Asia/Kolkata");

      if (nowIST.isBefore(openTimeIST)) {
        return { success: false, message: "Tournament queue is not open yet." };
      }

      if (nowIST.isAfter(closeTimeIST)) {
        return {
          success: false,
          message: "Tournament queue has already closed.",
        };
      }

      const numPlayers = parseInt(tournament.numPlayers, 10);
      if (isNaN(numPlayers) || numPlayers <= 0) {
        return {
          success: false,
          message: "numPlayers is not a valid positive integer.",
        };
      }

      const allPlayersInQueue = await RedisService.getPlayersFromQueue(
        queueName,
        numPlayers,
      );
      if (allPlayersInQueue.includes(playerId)) {
        return {
          success: false,
          message: "You are already in the tournament queue.",
        };
      }

      await RedisService.addToQueue(queueName, playerId);

      return {
        success: true,
        message: "Added to queue. Waiting for the tournament to start.",
      };
    } catch (error) {
      console.error("Error joining tournament queue:", error);
      return { success: false, message: "Failed to join tournament queue." };
    }
  },

  createMatchesForTournament: async (
    tournamentId,
    queueName,
    numPlayers,
    sets,
    legs,
    wss,
  ) => {
    try {
      // Get all players from the queue
      const allPlayersInQueue = await RedisService.getPlayersFromQueue(
        queueName,
        numPlayers,
      );

      // Validate that we have enough players to start the tournament
      if (allPlayersInQueue.length < numPlayers) {
        console.error(
          `Not enough players in queue for tournament ${tournamentId}.`,
        );
        return {
          success: false,
          message: "Not enough players in the queue to start the tournament.",
        };
      }

      const leagueResponse = await LeagueService.createLeague(
        allPlayersInQueue,
        numPlayers,
        sets,
        legs,
        "tournament",
        tournamentId,
      );

      if (!leagueResponse.success) {
        console.error("Error creating league:", leagueResponse.message);
        return { success: false, message: "Failed to create league." };
      }

      const league = leagueResponse.league;

      // Start the league to initialize matchups and send notifications
      const startResponse = await LeagueService.startLeague(
        league.leagueId,
        wss,
      );

      if (!startResponse.success) {
        console.error("Error starting the league:", startResponse.message);
        return { success: false, message: "Failed to start the league." };
      }

      console.log(
        `Tournament ${tournamentId} matches created and started successfully.`,
      );
      return { success: true, league };
    } catch (error) {
      console.error("Error creating matches for tournament:", error);
      return {
        success: false,
        message: "Failed to create matches for the tournament.",
      };
    }
  },
};

module.exports = TournamentService;
