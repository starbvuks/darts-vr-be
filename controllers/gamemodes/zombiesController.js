const MatchmakingService = require("../../services/matchmakingService");
const ZombiesService = require("../../services/gamemodes/zombiesService");
const authService = require("../../services/auth/authService");
const gameWebSocketHandler = require("../../sockets/gameSockets");

// 6666d32dead7f3bab9218bf8
// 6673d54ca1af8512fb61c979

const ZombiesController = {
  joinOrCreateMatch: async (req, res, wss) => {
    try {
      const { matchType, playerId } = req.body;
      authService.validateJwt(req, res, async () => {
        if (matchType === "solo") {
          const match = await MatchmakingService.createSoloMatchZombies(
            playerId
          );
          if (match instanceof Error) {
            res.status(400).json({ message: match.message });
          } else {
            res.status(200).json(match);
          }
        } else {
          const match = await MatchmakingService.joinZombiesQueue(
            "zombies",
            playerId,
            wss
          );
          if (match instanceof Error) {
            res.status(400).json({ message: match.message });
          } else if (match) {
            res.status(200).json(match);
          } else {
            res.status(202).json({ message: "Waiting for other players" });
          }
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  createPrivateMatch: async (req, res) => {
    try {
      authService.validateJwt(req, res, async () => {
        const { playerId } = req.body;
        const newMatch = await ZombiesService.createMatch(playerId);
        if (newMatch instanceof Error) {
          res.status(500).json({ message: newMatch.message });
        } else {
          res.status(200).json(newMatch);
        }
      });
    } catch (error) {
      console.error("Error in createMatch controller:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  inviteFriend: async (req, res, wss) => {
    try {
      const { playerId, friendId, matchId } = req.body;
      authService.validateJwt(req, res, async () => {
        gameWebSocketHandler.sendZombiesInvitation(
          friendId,
          playerId,
          matchId,
          wss
        );
        res.status(200).json({ message: "Invitation sent" });
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
        if (match instanceof Error) {
          res.status(400).json({ message: match.message });
        } else {
          res.status(200).json(match);
        }
      });
    } catch (error) {
      console.error("Error in joinMatch controller:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateMatchStats: async (req, res) => {
    try {
      const { matchId, playerId, playerStats, duration, winner } = req.body;
      authService.validateJwt(req, res, async () => {
        const updatedMatch = await ZombiesService.updateMatchStats(
          matchId,
          playerId,
          playerStats,
          duration,
          winner
        );
        if (updatedMatch instanceof Error) {
          res.status(400).json({ message: updatedMatch.message });
        } else {
          res.status(200).json(updatedMatch);
        }
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
        if (match instanceof Error) {
          res.status(404).json({ message: match.message });
        } else {
          res.status(200).json(match);
        }
      });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  },

  closeMatch: async (req, res) => {
    try {
      authService.validateJwt(req, res, async () => {
        const { matchId } = req.params;
        const match = await ZombiesService.closeMatch(matchId);
        if (match instanceof Error) {
          res.status(400).json({ message: match.message });
        } else {
          res.status(200).json(match);
        }
      });
    } catch (error) {
      console.error("Error in closeMatch controller:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = ZombiesController;
