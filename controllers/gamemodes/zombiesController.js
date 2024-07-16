const MatchmakingService = require("../../services/matchmakingService");
const ZombiesService = require("../../services/gamemodes/zombiesService");
const authService = require("../../services/auth/authService");
const gameWebSocketHandler = require("../../sockets/gameSockets");

// 6666d32dead7f3bab9218bf8
// 6673d54ca1af8512fb61c979

const ZombiesController = {  
  joinOrCreateMatch: async (req, res) => {
    try {
      const { matchType, playerId } = req.body;
      authService.validateJwt(req, res, async () => {
        if (matchType === 'solo') {
          const match = await MatchmakingService.createSoloMatch(playerId);
          res.status(200).json(match);
        } else {
          const match = await MatchmakingService.joinQueue('zombies', playerId);
          if (match) {
            res.status(200).json(match);
          } else {
            res.status(202).json({ message: 'Waiting for other players' });
          }
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  inviteFriend: async (req, res, wss) => {
    try {
      const { playerId, friendId, matchType } = req.body;
      authService.validateJwt(req, res, async () => {
        const match = await MatchmakingService.joinMatch(
          "zombies",
          2,
          playerId
        );
        gameWebSocketHandler.sendZombiesInvitation(
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
