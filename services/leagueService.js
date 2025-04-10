const { v4: uuidv4 } = require("uuid");
const cron = require("node-cron");
const mongoose = require("mongoose");

const Player = require("../models/Player");
const League = require("../models/League");
const gameWebSocketHandler = require("../sockets/gameSockets");

const LeagueService = {
  // to fix match id unique error, also added to League model
  updateIndexes: async () => {
    try {
      await League.collection.dropIndex("matchups.matchId_1");
    } catch (error) {
      if (error.code !== 27) {
      } else {
      }
    }

    try {
      await League.collection.createIndex(
        { "matchups.matchId": 1 },
        { unique: false, sparse: true },
      );
    } catch (error) {}
  },

  createLeague: async (
    playerIds,
    numPlayers,
    sets,
    legs,
    leagueType = "private",
    tournamentId = null,
  ) => {
    try {
      let totalRounds;
      let matchesPerRound;

      LeagueService.updateIndexes();

      switch (numPlayers) {
        case 2:
          totalRounds = 1;
          matchesPerRound = [1];
          break;
        case 4:
          totalRounds = 2;
          matchesPerRound = [2, 1];
          break;
        case 8:
          totalRounds = 3;
          matchesPerRound = [4, 2, 1];
          break;
        case 16:
          totalRounds = 4;
          matchesPerRound = [8, 4, 2, 1];
          break;
        default:
          return { success: false, message: "Invalid number of players." };
      }

      const league = new League({
        leagueId: uuidv4(),
        players: playerIds, // Add all players directly to the players array
        numPlayers,
        totalRounds,
        matchesPerRound,
        sets,
        legs,
        status: "open",
        matchups: [],
        leagueType, // Include leagueType (e.g., "tournament" or "private")
        tournamentId, // Include tournamentId if it's a tournament
      });

      await league.save();

      return { success: true, league };
    } catch (error) {
      console.error("Error creating league:", error);
      return { success: false, message: "Failed to create league." };
    }
  },

  joinLeague: async (leagueId, playerId) => {
    try {
      // Find the league by its ID
      const league = await League.findOne({ leagueId });
      if (!league) {
        return { success: false, message: "League not found." };
      }

      // Check if the player is already in the league
      if (league.players.includes(playerId)) {
        return { success: false, message: "Player is already in the league." };
      }

      // Check if the league has reached its maximum number of players
      if (league.players.length >= league.numPlayers) {
        return { success: false, message: "League is full. Cannot join." };
      }

      // Add the player to the league's players array
      league.players.push(playerId);

      // Update the player's total matches played
      const player = await Player.findById(playerId);
      if (player) {
        player.stats.totalMatchesPlayed += 1; // Increment total matches played
        await player.save(); // Save the updated player stats
      }

      // Save the updated league
      await league.save();

      return { success: true, league };
    } catch (error) {
      console.error("Error joining league:", error);
      return { success: false, message: "Failed to join league." };
    }
  },

  startLeague: async (leagueId, wss) => {
    try {
      const league = await League.findOne({ leagueId });
      if (!league) {
        return { success: false, message: "League not found." };
      }

      if (league.players.length !== league.numPlayers) {
        return {
          success: false,
          message: "Cannot start league with incomplete players.",
        };
      }

      await LeagueService.initializeMatchups(league, wss);
      league.status = "ongoing";

      await league.save();
      return { success: true, league };
    } catch (error) {
      console.error("Error starting league:", error);
      return { success: false, message: "Failed to start league." };
    }
  },

  initializeMatchups: async (league, wss) => {
    try {
      const players = league.players;
      const matchups = [];

      const existingMatchups = league.matchups.filter(
        (matchup) => matchup.round === league.currentRound,
      );
      const expectedMatches = league.matchesPerRound[league.currentRound - 1];

      if (existingMatchups.length >= expectedMatches) {
        console.log(
          "Matchups for this round already exist. Cannot initialize again.",
        );
        return {
          success: false,
          message: "Matchups for this round already exist.",
        };
      }

      for (let i = 0; i < players.length; i += 2) {
        if (i + 1 < players.length) {
          const matchId = uuidv4();

          const player1 = await Player.findById(players[i]);
          const player2 = await Player.findById(players[i + 1]);

          const matchup = {
            matchId: matchId,
            round: league.currentRound,
            player1Id: players[i],
            player1Username: player1 ? player1.username : "Player 1",
            player2Id: players[i + 1],
            player2Username: player2 ? player2.username : "Player 2",
            player1Stats: {
              dartsThrown: 0,
              dartsHit: 0,
              bullseyes: 0,
              oneEighties: 0,
              score: 501,
              throws: [],
            },
            player2Stats: {
              dartsThrown: 0,
              dartsHit: 0,
              bullseyes: 0,
              oneEighties: 0,
              score: 501,
              throws: [],
            },
            winnerId: null,
            status: "ongoing",
            createdAt: new Date(),
          };

          league.matchups.push(matchup);

          const message = JSON.stringify({
            type: "match_created",
            gamemode: "league",
            leagueId: league.leagueId,
            matchId: matchId,
            players: [players[i], players[i + 1]],
          });

          gameWebSocketHandler.sendLeagueMatchCreatedNotification(
            String(players[i]),
            message,
            wss,
          );
          gameWebSocketHandler.sendLeagueMatchCreatedNotification(
            String(players[i + 1]),
            message,
            wss,
          );
        }
      }

      let round = 2;
      while (league.matchups.filter((m) => m.round === round - 1).length > 0) {
        const previousRoundMatchups = league.matchups.filter(
          (m) => m.round === round - 1,
        );
        const nextRoundMatchups = [];

        for (let i = 0; i < previousRoundMatchups.length; i += 2) {
          if (i + 1 < previousRoundMatchups.length) {
            const matchId = uuidv4();
            const prevMatchIds = [
              previousRoundMatchups[i].matchId,
              previousRoundMatchups[i + 1].matchId,
            ];

            nextRoundMatchups.push({
              matchId,
              round,
              player1Id: null,
              player1Username: null,
              player2Id: null,
              player2Username: null,
              winnerId: null,
              status: "ongoing",
              createdAt: new Date(),
              prevMatchIds,
              lastActivity: {
                player1LastActivity: null,
                player2LastActivity: null,
              },
            });
          }
        }

        league.matchups.push(...nextRoundMatchups);
        round++;
      }
      await league.save();
      return { success: true, matchups };
    } catch (error) {
      console.error("Error initializing matchups:", error);
      return { success: false, message: "Failed to initialize matchups." };
    }
  },

  processDartThrow: async (
    leagueId,
    matchId,
    playerId,
    dartNumber,
    dartScore, // dartScore is now a string like "SINGLE20", "DOUBLE20", "TRIPLE20", "BULLSEYE", or "MISS"
    scoreLeft,
    wss,
  ) => {
    try {
      const league = await League.findOne({ leagueId });
      if (!league) {
        return { success: false, message: "League not found." };
      }

      console.log(
        `leagueId: ${leagueId},
      matchId: ${matchId},
      playerId: ${playerId},
      dartNumber: ${dartNumber},
      dartScore: ${dartScore},
      scoreLeft: ${scoreLeft}`,
      );

      // Find the current matchup for the player
      const currentMatchup = league.matchups.find(
        (matchup) => matchup.matchId === matchId,
      );
      if (!currentMatchup) {
        return { success: false, message: "Matchup not found for the player." };
      }

      const playerStats = currentMatchup.player1Id.equals(playerId)
        ? currentMatchup.player1Stats
        : currentMatchup.player2Stats;

      if (currentMatchup.player1Id.equals(playerId)) {
        currentMatchup.lastActivity.player1LastActivity = new Date();
      } else if (currentMatchup.player2Id.equals(playerId)) {
        currentMatchup.lastActivity.player2LastActivity = new Date();
      }

      // Ensure that playerStats.throws is initialized
      if (!playerStats.throws) {
        playerStats.throws = []; // Initialize if it doesn't exist
      }

      let dartThrow = playerStats.throws[playerStats.throws.length - 1];

      // Check if there's an existing dart throw that is not yet complete
      if (
        !dartThrow ||
        (dartThrow.dart1 !== "MISS" &&
          dartThrow.dart2 !== "MISS" &&
          dartThrow.dart3 !== "MISS")
      ) {
        // Create a new dart throw object if the previous one is complete or does not exist
        dartThrow = {
          playerId: playerId,
          dart1: dartScore,
          dart2: "MISS", // Defaulting to MISS
          dart3: "MISS", // Defaulting to MISS
        };
        playerStats.throws.push(dartThrow);
      }

      // Update the existing dart throw based on the dart number
      if (dartNumber === 1) {
        dartThrow.dart1 = dartScore;
      } else if (dartNumber === 2) {
        dartThrow.dart2 = dartScore;
      } else if (dartNumber === 3) {
        dartThrow.dart3 = dartScore;
      }

      // Update player stats
      playerStats.dartsThrown += 1;

      // Handle the different dartScore scenarios
      if (dartScore !== "MISS") {
        playerStats.dartsHit += 1;

        // Check for bullseye
        if (dartScore === "BULLSEYE") {
          playerStats.bullseyes += 1;
        }

        // Check for a "one eighty" (all three darts hitting TRIPLE20)
        if (
          dartThrow.dart1 === "TRIPLE20" &&
          dartThrow.dart2 === "TRIPLE20" &&
          dartThrow.dart3 === "TRIPLE20"
        ) {
          playerStats.oneEighties += 1;
        }
      }

      // Update the player's remaining score
      playerStats.score = scoreLeft;

      await league.save();

      // Retrieve the player's username
      const player = await Player.findById(playerId);
      const playerUsername = player ? player.username : "Unknown Player";

      // Prepare the notification message
      const notificationMessage = {
        leagueId,
        matchId,
        playerId,
        playerUsername,
        dartScore,
        scoreLeft,
        dartThrow,
      };

      // Send dart throw notification to all players in the league lobby
      league.players.forEach(async (pId) => {
        gameWebSocketHandler.sendDartThrowNotification(
          String(pId),
          notificationMessage,
          wss,
        );
      });

      return { success: true, matchup: currentMatchup }; // Return the current matchup
    } catch (error) {
      console.error("Error processing dart throw:", error);
      return { success: false, message: "Failed to process dart throw." };
    }
  },

  addCommentary: async (leagueId, matchId, playerId, commentary) => {
    try {
      const league = await League.findOne({ leagueId });
      if (!league) {
        return { success: false, message: "League not found." };
      }

      const matchup = league.matchups.find((m) => m.matchId === matchId);
      if (!matchup) {
        return { success: false, message: "Matchup not found." };
      }

      let playerStats;
      if (matchup.player1Id.equals(playerId)) {
        playerStats = matchup.player1Stats;
      } else if (matchup.player2Id.equals(playerId)) {
        playerStats = matchup.player2Stats;
      } else {
        return { success: false, message: "Player not part of this matchup." };
      }

      const lastThrow = playerStats.throws[playerStats.throws.length - 1];
      console.log(lastThrow);

      if (lastThrow) {
        lastThrow.commentary = commentary;
        await league.save();
        return { success: true, matchup };
      } else {
        return { success: false, message: "Last throw not completed." };
      }
    } catch (error) {
      console.error("Error adding commentary:", error);
      return { success: false, message: "Failed to add commentary." };
    }
  },

  playerWonLeg: async (leagueId, matchId, playerId) => {
    try {
      const league = await League.findOne({ leagueId });
      if (!league) {
        return { success: false, message: "League not found." };
      }

      const matchup = league.matchups.find((m) => m.matchId === matchId);
      if (!matchup) {
        return { success: false, message: "Matchup not found." };
      }

      let winningPlayerStats, losingPlayerStats;
      let isPlayer1Winner = false;

      if (matchup.player1Id.equals(playerId)) {
        winningPlayerStats = matchup.player1Stats;
        losingPlayerStats = matchup.player2Stats;
        isPlayer1Winner = true;
      } else if (matchup.player2Id.equals(playerId)) {
        winningPlayerStats = matchup.player2Stats;
        losingPlayerStats = matchup.player1Stats;
      } else {
        return { success: false, message: "Player not part of this matchup." };
      }

      // Ensure that legs won do not exceed the maximum allowed
      if (winningPlayerStats.legsWon >= league.legs) {
        return {
          success: false,
          message:
            "Player has already won the maximum number of legs for this set.",
        };
      }

      winningPlayerStats.legsWon += 1;

      await league.save();

      // Construct response based on player1/player2 roles
      const response = {
        success: true,
        leagueLegs: league.legs,
        leagueSets: league.sets,
        player1Id: matchup.player1Id,
        player1Username: matchup.player1Username,
        player2Id: matchup.player2Id,
        player2Username: matchup.player2Username,
        player1LegsWon: isPlayer1Winner ? winningPlayerStats.legsWon : losingPlayerStats.legsWon,
        player2LegsWon: isPlayer1Winner ? losingPlayerStats.legsWon : winningPlayerStats.legsWon,
        player1SetsWon: isPlayer1Winner ? winningPlayerStats.setsWon : losingPlayerStats.setsWon,
        player2SetsWon: isPlayer1Winner ? losingPlayerStats.setsWon : winningPlayerStats.setsWon,
      };

      return response;
    } catch (error) {
      console.error("Error updating legs won:", error);
      return { success: false, message: "Failed to update legs won." };
    }
  },

  playerWonSet: async (leagueId, matchId, playerId) => {
    try {
      const league = await League.findOne({ leagueId });
      if (!league) {
        return { success: false, message: "League not found." };
      }

      const matchup = league.matchups.find((m) => m.matchId === matchId);
      if (!matchup) {
        return { success: false, message: "Matchup not found." };
      }

      let winningPlayerStats, losingPlayerStats;
      let isPlayer1Winner = false;

      if (matchup.player1Id.equals(playerId)) {
        winningPlayerStats = matchup.player1Stats;
        losingPlayerStats = matchup.player2Stats;
        isPlayer1Winner = true;
      } else if (matchup.player2Id.equals(playerId)) {
        winningPlayerStats = matchup.player2Stats;
        losingPlayerStats = matchup.player1Stats;
      } else {
        return { success: false, message: "Player not part of this matchup." };
      }

      // Ensure that sets won do not exceed the maximum allowed
      if (winningPlayerStats.setsWon >= league.sets) {
        return {
          success: false,
          message:
            "Player has already won the maximum number of sets for this league.",
        };
      }

      // Increment the set count for the winning player
      winningPlayerStats.setsWon += 1;

      // Reset legs for both players
      winningPlayerStats.legsWon = 0;
      losingPlayerStats.legsWon = 0;

      await league.save();

      // Construct response based on player1/player2 roles
      const response = {
        success: true,
        leagueLegs: league.legs,
        leagueSets: league.sets,
        player1Id: matchup.player1Id,
        player1Username: matchup.player1Username,
        player2Id: matchup.player2Id,
        player2Username: matchup.player2Username,
        player1LegsWon: isPlayer1Winner ? winningPlayerStats.legsWon : losingPlayerStats.legsWon,
        player2LegsWon: isPlayer1Winner ? losingPlayerStats.legsWon : winningPlayerStats.legsWon,
        player1SetsWon: isPlayer1Winner ? winningPlayerStats.setsWon : losingPlayerStats.setsWon,
        player2SetsWon: isPlayer1Winner ? losingPlayerStats.setsWon : winningPlayerStats.setsWon,
      };

      return response;
    } catch (error) {
      console.error("Error updating sets won:", error);
      return { success: false, message: "Failed to update sets won." };
    }
  },

  endMatch: async (leagueId, matchId, winnerId, wss) => {
    try {
      const league = await League.findOne({ leagueId });
      if (!league) {
        console.log(`League not found: ${leagueId}`);
        return { success: false, message: "League not found." };
      }

      const matchup = league.matchups.find((m) => m.matchId === matchId);
      if (!matchup) {
        console.log(`Matchup not found: ${matchId}`);
        return { success: false, message: "Matchup not found." };
      }

      if (
        !matchup.player1Id.equals(winnerId) &&
        !matchup.player2Id.equals(winnerId)
      ) {
        console.log(`Invalid winner ID: ${winnerId}`);
        return {
          success: false,
          message: "Winner must be one of the players in the matchup.",
        };
      }

      matchup.winnerId = winnerId;
      matchup.status = "completed";

      const players = [
        matchup.player1Id.toString(),
        matchup.player2Id.toString(),
      ];

      const matchOverMessage = {
        type: "match_over",
        gamemode: "league",
        matchRound: matchup.round,
        totalRounds: league.totalRounds,
        leagueId: league.leagueId,
        matchId: matchId,
        players: players,
        winnerId: winnerId.toString(),
      };

      gameWebSocketHandler.handleMatchOverNotification(
        players,
        matchOverMessage,
        wss,
      );

      const nextRoundMatchups = league.matchups.filter((m) =>
        m.prevMatchIds.includes(matchup.matchId),
      );

      for (const nextMatchup of nextRoundMatchups) {
        if (!nextMatchup.player1Id) {
          const player = await Player.findById(winnerId);
          nextMatchup.player1Id = winnerId;
          nextMatchup.player1Username = player ? player.username : "Player 1";
          nextMatchup.lastActivity.player1LastActivity = new Date();
        } else if (!nextMatchup.player2Id) {
          const player = await Player.findById(winnerId);
          nextMatchup.player2Id = winnerId;
          nextMatchup.player2Username = player ? player.username : "Player 2";
          nextMatchup.lastActivity.player2LastActivity = new Date();
        }

        if (nextMatchup.player1Id && nextMatchup.player2Id) {
          nextMatchup.status = "ongoing";
          const nextPlayers = [
            nextMatchup.player1Id.toString(),
            nextMatchup.player2Id.toString(),
          ];

          const matchReadyMessage = {
            type: "match_ready",
            gamemode: "league",
            leagueId: league.leagueId,
            matchId: nextMatchup.matchId,
            players: nextPlayers,
            winnerId: winnerId.toString(),
          };

          gameWebSocketHandler.handleMatchReadyNotification(
            nextPlayers,
            matchReadyMessage,
            wss,
          );
        }
      }

      await league.save();
      return {
        success: true,
        league,
      };
    } catch (error) {
      console.error("Error ending match:", error);
      return { success: false, message: "Failed to end match." };
    }
  },

  monitorInactivePlayers: async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago

    try {
      const leagues = await League.find({
        createdAt: { $gte: oneHourAgo },
        status: "ongoing",
      });
      console.log(leagues);

      for (const league of leagues) {
        for (const matchup of league.matchups) {
          if (
            matchup.status === "ongoing" &&
            matchup.player1Id &&
            matchup.player2Id
          ) {
            if (
              matchup.lastActivity.player1LastActivity &&
              matchup.lastActivity.player1LastActivity < twoMinutesAgo
            ) {
              await LeagueService.endMatch(
                league.leagueId,
                matchup.matchId,
                matchup.player2Id,
              );
            } else if (
              matchup.lastActivity.player2LastActivity &&
              matchup.lastActivity.player2LastActivity < twoMinutesAgo
            ) {
              await LeagueService.endMatch(
                league.leagueId,
                matchup.matchId,
                matchup.player1Id,
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error monitoring inactive players:", error);
    }
  },

  endLeague: async (leagueId, leagueWinnerId, wss) => {
    try {
      const league = await League.findOne({ leagueId });
      if (!league) {
        console.log("League not found");
        return { success: false, message: "League not found." };
      }

      league.status = "completed";
      league.winnerId = leagueWinnerId;

      const players = league.players.map((playerId) => playerId.toString());
      console.log("Players to notify:", players);

      const message = {
        type: "league_over",
        gamemode: "league",
        leagueId: league.leagueId,
        winner: leagueWinnerId,
        players,
      };

      console.log("Sending match over notification with message:", message);
      gameWebSocketHandler.handleLeagueOverNotification(players, message, wss);

      await league.save();
      console.log("League updated and saved successfully.");

      return { success: true, league }; // Return league data
    } catch (error) {
      console.error("Error ending league:", error);
      return { success: false, message: "Failed to end league." };
    }
  },

  getLeague: async (leagueId) => {
    try {
      const league = await League.findOne({ leagueId });
      if (!league) {
        const error = new Error({
          success: false,
          message: "League not found.",
        });
        console.error("Error getting league:", error);
        return error;
      }

      return { success: true, league };
    } catch (error) {
      return { success: false, message: "Failed to retrieve match.", error };
    }
  },

  getMatchup: async (leagueId, matchId) => {
    try {
      const league = await League.findOne({ leagueId });
      if (!league) {
        const error = new Error({
          success: false,
          message: "League not found.",
        });
        console.error("Error getting league:", error);
        return error;
      }

      const matchup = league.matchups.find((m) => m.matchId === matchId);
      if (!matchup) {
        const error = new Error({
          success: false,
          message: "Matchup in League not found.",
        });
        console.error("Error getting matchup:", error);
        return error;
      }

      return { success: true, matchup };
    } catch (error) {
      return { success: false, message: "Failed to retrieve match.", error };
    }
  },

  getCommentaryStatsForLeagueMatchup: async (leagueId, matchId) => {
    try {
      const league = await League.findOne({ leagueId });

      if (!league) {
        throw new Error("League not found");
      }

      const matchup = league.matchups.find((m) => m.matchId === matchId);

      if (!matchup) {
        throw new Error("Matchup not found");
      }

      // Convert player1Id and player2Id to ObjectId if they are not already
      const player1Id =
        typeof matchup.player1Id === "string"
          ? new mongoose.Types.ObjectId(matchup.player1Id)
          : matchup.player1Id;
      const player2Id =
        typeof matchup.player2Id === "string"
          ? new mongoose.Types.ObjectId(matchup.player2Id)
          : matchup.player2Id;

      const playerIds = [player1Id, player2Id].filter(Boolean); // Filter out any null/undefined player IDs

      // Fetch player data for player1 and player2
      const playerData = await Player.find({ _id: { $in: playerIds } });

      // Map through players and construct commentary stats
      const players = playerData.map((player) => {
        // Calculate win ratio
        const totalMatches = player.stats.totalMatchesPlayed || 0;
        const totalWins = player.stats.totalWins || 0;
        const rating =
          totalMatches > 0 ? (totalWins / totalMatches).toFixed(2) : 0;

        // Find the last throw for this player in the match
        let lastThrow = [];
        if (player1Id.equals(player._id)) {
          lastThrow =
            matchup.player1Stats.throws.length > 0
              ? [
                  matchup.player1Stats.throws[
                    matchup.player1Stats.throws.length - 1
                  ],
                ]
              : [];
        } else if (player2Id && player2Id.equals(player._id)) {
          lastThrow =
            matchup.player2Stats.throws.length > 0
              ? [
                  matchup.player2Stats.throws[
                    matchup.player2Stats.throws.length - 1
                  ],
                ]
              : [];
        }

        return {
          playerId: player._id,
          playerUsername: player.username || "Player",
          rating: parseFloat(rating), // Win ratio as rating
          throws: lastThrow, // Only the last throw
        };
      });

      return { success: true, players }; // Return the array under 'players'
    } catch (error) {
      console.error(
        "Error fetching commentary stats for league matchup:",
        error,
      );
      return { success: false, message: "Failed to fetch commentary stats." };
    }
  },
};

module.exports = LeagueService;
