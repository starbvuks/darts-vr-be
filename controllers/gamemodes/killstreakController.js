const KillstreakService = require("../../services/gamemodes/killstreakService");
const MatchmakingService = require("../../services/matchmakingService");
const authService = require("../../services/auth/authService");
const webSocketHandler = require("../../websockets");

const KillstreakController = {
  joinOrCreateMatch: async (req, res) => {
    try {
      const { playerId } = req.body;
      authService.validateJwt(req, res, async () => {
        const match = await MatchmakingService.joinMatch(
          "killstreak",
          2,
          playerId
        );
        res.status(200).json(match);
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  inviteFriend: async (req, res, wss) => {
    try {
      const { playerId, friendId, matchType } = req.body;
      authService.validateJwt(req, res, async () => {
        const match = await KillstreakService.createMatch(playerId, matchType);
        webSocketHandler.sendKillstreakInvitation(
          friendId,
          playerId,
          match.matchId,
          wss
        );
        res.status(200).json(match);
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  joinInvitedMatch: async (req, res) => {
    try {
      const { matchId, playerId } = req.body;
      authService.validateJwt(req, res, async () => {
        const match = await KillstreakService.joinMatch(matchId, playerId);
        res.status(200).json(match);
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateMatchStats: async (req, res) => {
    try {
      const { matchId, player1Stats, player2Stats, roundNumber } = req.body;
      authService.validateJwt(req, res, async () => {
        const updatedMatch = await KillstreakService.updateMatchStats(
          matchId,
          player1Stats,
          player2Stats,
          roundNumber
        );
        res.status(200).json(updatedMatch);
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getMatch: async (req, res) => {
    try {
      const { matchId } = req.params;
      authService.validateJwt(req, res, async () => {
        const match = await KillstreakService.getMatch(matchId);
        res.status(200).json(match);
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },
};

module.exports = KillstreakController;
