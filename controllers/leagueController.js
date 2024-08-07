const LeagueService = require("../services/leagueService");
const authService = require("../services/auth/authService");
const gameWebSocketHandler = require("../sockets/gameSockets");

const LeagueController = {
  createLeague: async (req, res) => {
    try {
      const { playerId, numPlayers, sets, legs } = req.body; // Expecting playerId and numPlayers
      authService.validateJwt(req, res, async () => {
        const league = await LeagueService.createLeague(playerId, numPlayers, sets, legs);
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

  invitePlayer: async (req, res, wss) => {
    try {
      const { leagueId, playerId, friendId } = req.body;
      authService.validateJwt(req, res, async () => {
        gameWebSocketHandler.sendLeagueInvitation(friendId, playerId, leagueId, wss);
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

  startLeague: async (req, res, wss) => {
    try {
      const { leagueId } = req.body;
      authService.validateJwt(req, res, async () => {
        const result = await LeagueService.startLeague(leagueId, wss);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        
        return res.status(200).json({ league: result.league });
      });
    } catch (error) {
      console.error("Error starting league:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  dartThrow: async (req, res, wss) => {
    try {
      const { leagueId, matchId, playerId, dartNumber, dartScore, scoreLeft } = req.body; 
      authService.validateJwt(req, res, async () => {
        if (typeof dartScore !== 'number' || typeof scoreLeft !== 'number') {
          return res.status(400).json({ message: "Invalid dart score or score left." });
        }

        const result = await LeagueService.processDartThrow(leagueId, matchId, playerId, dartNumber, dartScore, scoreLeft, wss);
        if (!result.success) {
          console.log(result.message);
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
      const { leagueId, matchId, playerId, commentary } = req.body;
      authService.validateJwt(req, res, async () => {
        const result = await LeagueService.addCommentary(leagueId, matchId, playerId, commentary);
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

  playerWonSet: async (req, res) => {
    try {
      const { leagueId, matchId, playerId } = req.body;
      authService.validateJwt(req, res, async () => {
        const result = await LeagueService.playerWonSet(leagueId, matchId, playerId);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.matchup);
      });
    } catch (error) {
      console.error("Error recording set win:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  playerWonLeg: async (req, res) => {
    try {
      const { leagueId, matchId, playerId } = req.body;
      authService.validateJwt(req, res, async () => {
        const result = await LeagueService.playerWonLeg(leagueId, matchId, playerId);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.matchup);
      });
    } catch (error) {
      console.error("Error recording leg win:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  endMatch: async (req, res, wss) => {
    try {
      const { leagueId, matchId, winnerId } = req.body;
      authService.validateJwt(req, res, async () => {
        const result = await LeagueService.endMatch(leagueId, matchId, winnerId, wss);
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

  endLeague: async (req, res, wss) => {
    try {
      const { leagueId, leagueWinnerId } = req.body; // Expecting leagueId in the request body
      authService.validateJwt(req, res, async () => {
        const result = await LeagueService.endRound(leagueId, leagueWinnerId, wss);
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

  getLeague: async (req, res) => {
    try {
      authService.validateJwt(req, res, async () => {
        const {leagueId} = req.query;
        const result = await LeagueService.getLeague(leagueId)
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.league);
      })
    } catch (error) {
      console.error("Error getting League", error);
      res.status(500).json({ message: "Error getting League" });
    }
  },

  getMatchup: async (req, res) => {
    try {
      authService.validateJwt(req, res, async () => {
        const {leagueId, matchId} = req.query;
        const result = await LeagueService.getMatchup(leagueId, matchId)
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.match);
      })
    } catch (error) {
      console.error("Error getting Matchup in League", error);
      res.status(500).json({ message: "Error getting Matchup" });
    }
  }
};

module.exports = LeagueController;
