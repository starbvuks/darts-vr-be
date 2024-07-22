const LeagueService = require("../services/leagueService");
const authService = require("../services/auth/authService");
const gameWebSocketHandler = require("../sockets/gameSockets");

const LeagueController = {
  createLeague: async (req, res) => {
    try {
      const { playerId, numPlayers } = req.body; // Expecting playerId and numPlayers
      authService.validateJwt(req, res, async () => {
        const league = await LeagueService.createLeague(playerId, numPlayers);
        if (!league.success) {
          return res.status(400).json({ message: league.message });
        }
        return res.status(201).json(league.league);
      });
    } catch (error) {
      console.error("Error creating league:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  invitePlayer: async (req, res) => {
    try {
      const { leagueId, playerId, friendId } = req.body;
      authService.validateJwt(req, res, async () => {
        gameWebSocketHandler.sendLeagueInvitation(friendId, playerId, leagueId);
        res.status(200).json({ message: "Invitation sent" });
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  joinLeague: async (req, res) => {
    try {
      const { leagueId, playerId } = req.body;
      authService.validateJwt(req, res, async () => {
        const result = await LeagueService.joinLeague(leagueId, playerId);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.league);
      });
    } catch (error) {
      console.error("Error joining league:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  startLeague: async (req, res) => {
    try {
      const { leagueId } = req.body;
      authService.validateJwt(req, res, async () => {
        const result = await LeagueService.startLeague(leagueId);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        
        // Create initial matchups after starting the league
        const matchups = await LeagueService.createInitialMatchups(result.league.players);
        return res.status(200).json({ league: result.league, matchups });
      });
    } catch (error) {
      console.error("Error starting league:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  dartThrow: async (req, res) => {
    try {
      const { matchId, playerId, dartScore, scoreLeft } = req.body; 
      authService.validateJwt(req, res, async () => {
        if (typeof dartScore !== 'number' || typeof scoreLeft !== 'number') {
          return res.status(400).json({ message: "Invalid dart score or score left." });
        }

        const result = await LeagueService.processDartThrow(matchId, playerId, dartScore, scoreLeft);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.matchup);
      });
    } catch (error) {
      console.error("Error processing dart throw:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  addCommentary: async (req, res) => {
    try {
      const { matchId, playerId, commentary } = req.body;
      authService.validateJwt(req, res, async () => {
        const result = await LeagueService.addCommentary(matchId, playerId, commentary);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.matchup);
      });
    } catch (error) {
      console.error("Error adding commentary:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  endMatch: async (req, res) => {
    try {
      const { matchId, winnerId } = req.body;
      authService.validateJwt(req, res, async () => {
        const result = await LeagueService.endMatch(matchId, winnerId);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.matchup);
      });
    } catch (error) {
      console.error("Error ending match:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  advanceRound: async (req, res) => {
    try {
      const { leagueId } = req.body; // Expecting leagueId in the request body
      authService.validateJwt(req, res, async () => {
        const result = await LeagueService.advanceRound(leagueId);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result);
      });
    } catch (error) {
      console.error("Error advancing round:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  endLeague: async (req, res) => {
    try {
      const { leagueId, leagueWinnerId } = req.body; // Expecting leagueId in the request body
      authService.validateJwt(req, res, async () => {
        const result = await LeagueService.endRound(leagueId);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result);
      });
    } catch (error) {
      console.error("Error ending round:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  handlePlayerDisconnect: async (req, res) => {
    try {
      const { matchId, playerId } = req.body;
      authService.validateJwt(req, res, async () => {
        await LeagueService.handlePlayerDisconnect(matchId, playerId);
        return res.status(200).json({ message: "Player has been marked as disconnected and the winner has been determined." });
      });
    } catch (error) {
      console.error("Error handling player disconnect:", error);
      if (error.message === "Matchup not found.") {
        return res.status(404).json({ message: error.message });
      } else if (error.message === "Player not part of this matchup.") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error." });
    }
  },
};

module.exports = LeagueController;
