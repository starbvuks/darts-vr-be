const { v4: uuidv4 } = require("uuid");
const Player = require("../models/Player");
const League = require("../models/League");
const gameWebSocketHandler = require("../sockets/gameSockets");

const LeagueService = {
  createLeague: async (playerId, numPlayers) => {
    try {
      let totalRounds;
      let matchesPerRound;

      switch (numPlayers) {
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
        players: [playerId],
        numPlayers,
        totalRounds,
        matchesPerRound,
        sets,
        legs,
        status: "open",
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

  // leave league

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

      // Check if matchups for the current round already exist
      const existingMatchups = league.matchups.filter(
        (matchup) => matchup.round === league.currentRound
      );
      const expectedMatches = league.matchesPerRound[league.currentRound - 1];

      if (existingMatchups.length >= expectedMatches) {
        console.log(
          "Matchups for this round already exist. Cannot initialize again."
        );
        return {
          success: false,
          message: "Matchups for this round already exist.",
        };
      }

      for (let i = 0; i < players.length; i += 2) {
        if (i + 1 < players.length) {
          const matchId = uuidv4();
          const matchup = {
            matchId: matchId,
            round: league.currentRound,
            player1Id: players[i],
            player2Id: players[i + 1],
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
            type: "league_match_created",
            leagueId: league.leagueId,
            matchId: matchId,
            players: [players[i], players[i + 1]],
          });

          gameWebSocketHandler.sendLeagueMatchCreatedNotification(
            String(players[i]),
            message,
            wss
          );
          gameWebSocketHandler.sendLeagueMatchCreatedNotification(
            String(players[i + 1]),
            message,
            wss
          );
        }
      }

      let round = 2;
      while (league.matchups.filter((m) => m.round === round - 1).length > 0) {
        const previousRoundMatchups = league.matchups.filter(
          (m) => m.round === round - 1
        );
        const nextRoundMatchups = [];

        for (let i = 0; i < previousRoundMatchups.length; i += 2) {
          if (i + 1 < previousRoundMatchups.length) {
            const matchId = uuidv4(); // Generate a unique match ID
            const prevMatchIds = [
              previousRoundMatchups[i].matchId,
              previousRoundMatchups[i + 1].matchId,
            ];

            nextRoundMatchups.push({
              matchId,
              round,
              player1Id: null,
              player2Id: null,
              winnerId: null,
              status: "ongoing",
              createdAt: new Date(),
              prevMatchIds,
            });

            // Send socket notification to players
            const message = JSON.stringify({
              type: "league_match_created",
              leagueId: league.leagueId,
              matchId,
              players: [null, null],
            });

            league.players.forEach(async (pId) => {
              gameWebSocketHandler.sendLeagueMatchCreatedNotification(
                String(pId),
                message,
                wss
              );
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
    dartScore,
    scoreLeft,
    wss
  ) => {
    try {
      const league = await League.findOne({ leagueId });
      if (!league) {
        return { success: false, message: "League not found." };
      }

      // Find the current matchup for the player
      const currentMatchup = league.matchups.find(
        (matchup) => matchup.matchId === matchId
      );
      if (!currentMatchup) {
        return { success: false, message: "Matchup not found for the player." };
      }

      const playerStats = currentMatchup.player1Id.equals(playerId)
        ? currentMatchup.player1Stats
        : currentMatchup.player2Stats;

      // Ensure that playerStats.throws is initialized
      if (!playerStats.throws) {
        playerStats.throws = []; // Initialize if it doesn't exist
      }

      let dartThrow = playerStats.throws[playerStats.throws.length - 1];

      // Check if there's an existing dart throw that is not yet complete
      if (
        !dartThrow ||
        (dartThrow.dart1 !== 0 &&
          dartThrow.dart2 !== 0 &&
          dartThrow.dart3 !== 0)
      ) {
        // Create a new dart throw object if the previous one is complete or does not exist
        dartThrow = {
          playerId: playerId,
          dart1: dartScore,
          dart2: 0,
          dart3: 0,
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
      if (dartScore > 0) {
        playerStats.dartsHit += 1;
      }

      if (dartScore === 50) {
        playerStats.bullseyes += 1;
      }

      // Check for a "one eighty" if all three darts are defined
      if (
        dartThrow.dart1 !== 0 &&
        dartThrow.dart2 !== 0 &&
        dartThrow.dart3 !== 0
      ) {
        if (
          dartThrow.dart1 === 60 &&
          dartThrow.dart2 === 60 &&
          dartThrow.dart3 === 60
        ) {
          playerStats.oneEighties += 1;
        }
      }

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
          wss
        );
      });

      return { success: true, matchup: currentMatchup }; // Return the current matchup
    } catch (error) {
      console.error("Error processing dart throw:", error);
      return { success: false, message: "Failed to process dart throw." };
    }
  },

  addCommentary: async (matchId, playerId, commentary) => {
    try {
      const matchup = await Matchup.findOne({ matchId });
      if (!matchup) {
        return { success: false, message: "Matchup not found." };
      }

      const playerStats = matchup.player1Id.equals(playerId)
        ? matchup.player1Stats
        : matchup.player2Stats;
      const lastThrow = playerStats.throws[playerStats.throws.length - 1];

      if (lastThrow && lastThrow.darts.length === 3) {
        lastThrow.darts[lastThrow.darts.length - 1].commentary = commentary;
        await matchup.save();
        return { success: true, matchup };
      } else {
        return { success: false, message: "Last throw not completed." };
      }
    } catch (error) {
      console.error("Error adding commentary:", error);
      return { success: false, message: "Failed to add commentary." };
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

      if (matchup.player1Id.equals(playerId)) {
        matchup.player1Stats.setsWon += 1; 
      } else if (matchup.player2Id.equals(playerId)) {
        matchup.player2Stats.setsWon += 1; 
      } else {
        return { success: false, message: "Player not part of this matchup." };
      }

      await league.save(); 
      return { success: true, matchup };
    } catch (error) {
      console.error("Error updating sets won:", error);
      return { success: false, message: "Failed to update sets won." };
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

      if (matchup.player1Id.equals(playerId)) {
        matchup.player1Stats.legsWon += 1; 
      } else if (matchup.player2Id.equals(playerId)) {
        matchup.player2Stats.legsWon += 1; 
      } else {
        return { success: false, message: "Player not part of this matchup." };
      }

      await league.save(); 
      return { success: true, matchup };
    } catch (error) {
      console.error("Error updating legs won:", error);
      return { success: false, message: "Failed to update legs won." };
    }
  },

  endMatch: async (leagueId, matchId, winnerId) => {
    try {
      const league = await League.findOne({ leagueId });
      if (!league) {
        return { success: false, message: "League not found." };
      }

      const matchup = league.matchups.find((m) => m.matchId === matchId);
      if (!matchup) {
        return { success: false, message: "Matchup not found." };
      }

      matchup.winnerId = winnerId;
      matchup.status = "completed";

      // Find the next round matchup based on the prevMatchIds
      const nextRoundMatchups = league.matchups.filter((m) =>
        m.prevMatchIds.includes(matchup.matchId)
      );

      nextRoundMatchups.forEach((nextMatchup) => {
        if (nextMatchup.player1Id === null) {
          nextMatchup.player1Id = winnerId;
        } else if (nextMatchup.player2Id === null) {
          nextMatchup.player2Id = winnerId;
        }
      });

      await matchup.save();
      await league.save();

      return { success: true, matchup };
    } catch (error) {
      console.error("Error ending match:", error);
      return { success: false, message: "Failed to end match." };
    }
  },

  handlePlayerDisconnect: async (matchId, playerId) => {
    const matchup = await Matchup.findOne({ matchId });
    if (!matchup) {
      throw new Error("Matchup not found.");
    }

    if (matchup.player1Id.equals(playerId)) {
      matchup.winnerId = matchup.player2Id;
    } else if (matchup.player2Id.equals(playerId)) {
      matchup.winnerId = matchup.player1Id;
    } else {
      throw new Error("Player not part of this matchup.");
    }

    matchup.status = "completed";
    await matchup.save();
  },

  endLeague: async (leagueId, leagueWinnerId) => {
    const league = await League.findOne({ leagueId });
    if (!league) {
      return { success: false, message: "League not found." };
    }

    league.status = "completed";
    league.winnerId = leagueWinnerId;
    await league.save();

    return { success: true };
  },
};

module.exports = LeagueService;
