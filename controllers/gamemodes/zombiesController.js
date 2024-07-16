const ZombiesService = require("../../services/gamemodes/zombiesService");
const authService = require("../../services/auth/authService");
const webSocketHandler = require("../../websockets");

const ZombiesController = {
  joinOrCreateMatch: async (req, res) => {
    try {
      const { playerId, matchType } = req.body;
      authService.validateJwt(req, res, async () => {
        const match = await ZombiesService.joinOrCreateMatch(playerId, matchType);
        res.status(200).json(match);
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  inviteFriend: async (req, res, wss) => {
    try {
      const { playerId, friendId, matchId } = req.body;
      authService.validateJwt(req, res, async () => {
        const match = await ZombiesService.getMatch(matchId);
        webSocketHandler.sendZombiesInvitation(
          friendId,
          playerId,
          matchId,
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
        const match = await ZombiesService.joinMatch(matchId, playerId);
        res.status(200).json(match);
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  updateMatchStats: async (req, res) => {
    try {
      const { matchId, player1Stats, player2Stats, duration, winner } =
        req.body;
      authService.validateJwt(req, res, async () => {
        const updatedMatch = await ZombiesService.updateMatchStats(
          matchId,
          player1Stats,
          player2Stats,
          duration,
          winner
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
        const match = await ZombiesService.getMatch(matchId);
        res.status(200).json(match);
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },
};

module.exports = ZombiesController;
